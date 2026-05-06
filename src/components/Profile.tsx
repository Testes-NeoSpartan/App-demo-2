/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Bell, Shield, LogOut, ChevronRight, User as UserIcon, Calendar, ChevronLeft, MessageSquare, MapPin, Send } from 'lucide-react';
import { User } from '../types';
import { notificationService } from '../services/notificationService';
import { testSupabaseConnection } from '../lib/supabase';
import { profileService } from '../services/profileService';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onSelectChat: (otherUser: any) => void;
  onViewProfile: () => void;
}

export default function Profile({ user, onLogout, onUpdateUser, onBack, onSelectChat, onViewProfile }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{success: boolean, message: string} | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'main' | 'notifications' | 'privacy'>('main');
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [week, setWeek] = useState(user.postpartumWeek || 1);
  const [age, setAge] = useState((user.age || '').toString());
  const [city, setCity] = useState(user.city || '');
  const [recentChats, setRecentChats] = useState<any[]>([]);

  const avatarOptions = ['Sophia', 'Isabella', 'Emma', 'Olivia', 'Amelia', 'Mia', 'Elena', 'Clara', 'Naomi'];

  const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&mood=neutral,serious`;

  const handleAvatarSelect = (seed: string) => {
    onUpdateUser({
      ...user,
      avatarSeed: seed
    });
    setShowAvatarPicker(false);
  };

  useEffect(() => {
    testSupabaseConnection().then(setSupabaseStatus);

    // Find all keys in localStorage that look like messages_
    const chats = [];
    for (let i = 0; i < localStorage.length; i++) {
       const key = localStorage.key(i);
       if (key && key.startsWith('messages_')) {
         const otherUserName = key.replace('messages_', '');
         const messages = JSON.parse(localStorage.getItem(key) || '[]');
         if (messages.length > 0) {
            chats.push({
              name: otherUserName,
              lastMessage: messages[messages.length - 1].text,
              time: new Date(messages[messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
         }
       }
    }
    setRecentChats(chats);
  }, []);

  const handleSave = async () => {
    const updatedUser = {
      ...user,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      postpartumWeek: week,
      age: parseInt(age),
      city
    };

    onUpdateUser(updatedUser);
    
    // Sync with Supabase if connection is good
    if (supabaseStatus?.success) {
      setSupabaseStatus({ success: true, message: 'A guardar...' });
      const result = await profileService.updateProfile(updatedUser);
      if (result.success) {
        setSupabaseStatus({ success: true, message: 'Dados Guardados no Supabase!' });
      } else {
        setSupabaseStatus({ success: false, message: 'Erro ao sincronizar' });
      }
    }
    
    setIsEditing(false);
  };

  const updateSettings = async (path: string, value: any) => {
    const [section, field] = path.split('.');
    
    // Handle notification permission request
    if (path === 'notifications.enabled' && value === true) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        // If permission denied, don't enable the toggle (optional, but better UX)
        // Or show an alert
        alert('Para receber notificações, precisa de dar permissão no seu browser/telemóvel.');
        return;
      }
    }

    const currentSettings = user.settings || {
      notifications: { enabled: true, community: true, iaTips: true, appointments: true },
      privacy: { isPrivate: false, showCity: true, showWeek: true, allowStrangerMessages: true }
    };

    onUpdateUser({
      ...user,
      settings: {
        ...currentSettings,
        [section]: {
          ...currentSettings[section as keyof typeof currentSettings],
          [field]: value
        }
      }
    });
  };

  const Toggle = ({ enabled, onChange, label, description }: { enabled: boolean, onChange: (val: boolean) => void, label: string, description?: string }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-sm font-bold text-gray-700">{label}</p>
        {description && <p className="text-[10px] text-gray-400 font-medium">{description}</p>}
      </div>
      <button 
        onClick={() => onChange(!enabled)}
        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${enabled ? 'bg-pink-500' : 'bg-gray-200'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const menuItems = [
    { icon: Bell, label: 'Notificações', color: 'text-blue-500', bg: 'bg-blue-50', onClick: () => setActiveSubView('notifications') },
    { icon: Shield, label: 'Privacidade e Segurança', color: 'text-green-500', bg: 'bg-green-50', onClick: () => setActiveSubView('privacy') },
  ];

  const settings = user.settings || {
    notifications: { enabled: true, community: true, iaTips: true, appointments: true },
    privacy: { isPrivate: false, showCity: true, showWeek: true, allowStrangerMessages: true }
  };

  if (activeSubView === 'notifications') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#FFF5F7] overflow-y-auto">
        <div className="pt-16 px-6 mb-6 flex items-center gap-4">
          <button 
            onClick={() => setActiveSubView('main')}
            className="p-2 bg-white rounded-full text-pink-600 shadow-sm border border-pink-100"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Notificações</h2>
        </div>

        <div className="px-6 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white">
            <Toggle 
              enabled={settings.notifications.enabled} 
              onChange={(val) => updateSettings('notifications.enabled', val)}
              label="Notificações Push"
              description="Receba alertas importantes no seu telemóvel"
            />
            <div className={`space-y-2 mt-4 pt-4 border-t border-gray-50 transition-opacity ${!settings.notifications.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <Toggle 
                enabled={settings.notifications.community} 
                onChange={(val) => updateSettings('notifications.community', val)}
                label="Comunidade"
                description="Gostos e comentários nos seus posts"
              />
              <Toggle 
                enabled={settings.notifications.iaTips} 
                onChange={(val) => updateSettings('notifications.iaTips', val)}
                label="Dicas diárias de IA"
                description="Conselhos personalizados da sua assistente"
              />
              <Toggle 
                enabled={settings.notifications.appointments} 
                onChange={(val) => updateSettings('notifications.appointments', val)}
                label="Lembretes de Agenda"
                description="Alertas para consultas e compromissos"
              />
            </div>
          </div>

          {settings.notifications.enabled && (
            <button
              onClick={() => notificationService.showNotification('Moments!', { 
                body: 'Esta é uma notificação de teste da sua assistente pós-parto.',
                icon: getAvatarUrl('Sophia') 
              })}
              className="w-full flex items-center justify-center gap-2 p-4 bg-pink-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-xs"
            >
              <Send size={14} />
              Enviar Notificação de Teste
            </button>
          )}
        </div>
      </div>
    );
  }

  if (activeSubView === 'privacy') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#FFF5F7] overflow-y-auto">
        <div className="pt-16 px-6 mb-6 flex items-center gap-4">
          <button 
            onClick={() => setActiveSubView('main')}
            className="p-2 bg-white rounded-full text-pink-600 shadow-sm border border-pink-100"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Privacidade</h2>
        </div>

        <div className="px-6 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white">
            <Toggle 
              enabled={settings.privacy.isPrivate} 
              onChange={(val) => updateSettings('privacy.isPrivate', val)}
              label="Perfil Privado"
              description="Apenas conexões podem ver o seu perfil completo"
            />
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
              <Toggle 
                enabled={settings.privacy.showCity} 
                onChange={(val) => updateSettings('privacy.showCity', val)}
                label="Mostrar Cidade"
                description="Visível para outras mães na comunidade"
              />
              <Toggle 
                enabled={settings.privacy.showWeek} 
                onChange={(val) => updateSettings('privacy.showWeek', val)}
                label="Mostrar Semana Pós-Parto"
                description="Ajuda a encontrar mães no mesmo estágio"
              />
              <Toggle 
                enabled={settings.privacy.allowStrangerMessages} 
                onChange={(val) => updateSettings('privacy.allowStrangerMessages', val)}
                label="Mensagens de Estranhos"
                description="Permitir que qualquer membro lhe envie mensagens"
              />
            </div>
          </div>
          
          <div className="bg-pink-100/50 p-4 rounded-3xl border border-pink-200">
            <p className="text-[10px] text-pink-700 font-medium leading-relaxed italic text-center">
              A sua segurança é a nossa prioridade. Todos os seus dados de saúde são encriptados e nunca partilhados com terceiros.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <div className="pink-gradient pt-16 pb-20 px-6 rounded-b-[4rem] relative shadow-lg shadow-pink-100/20">
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="absolute top-12 left-6 p-2 bg-white/30 backdrop-blur-md rounded-full text-pink-600 border border-white/40"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl mb-4 active:scale-95 transition-transform group relative"
          >
            <img src={getAvatarUrl(user.avatarSeed || user.name)} alt="profile" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <p className="text-[8px] font-bold text-white uppercase tracking-widest">Mudar</p>
            </div>
          </button>
          
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl mb-4 border border-white/60 overflow-hidden"
              >
                <div className="flex flex-wrap justify-center gap-2 max-w-[240px]">
                  {avatarOptions.map(seed => (
                    <button
                      key={seed}
                      onClick={() => handleAvatarSelect(seed)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${user.avatarSeed === seed ? 'border-pink-500 scale-110' : 'border-white/40'}`}
                    >
                      <img src={getAvatarUrl(seed)} alt="option" className="rounded-full" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={onViewProfile}
            className="hover:opacity-80 transition-opacity"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
          </button>
          {user.id !== 'guest' && (
            <p className="text-pink-600 font-bold text-xs uppercase tracking-widest">Semana {user.postpartumWeek} Pós-Parto</p>
          )}
        </div>
      </div>

      <div className="px-6 -mt-10 space-y-6 pb-24">
        {/* User Info Card */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-sm">Sua Jornada</h3>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="text-[10px] font-bold text-pink-500 uppercase tracking-widest"
            >
              {isEditing ? 'Salvar' : 'Editar'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                <UserIcon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Nome Próprio</p>
                {isEditing ? (
                  <input 
                    className="w-full border-b border-pink-100 py-1 focus:outline-none bg-transparent text-sm font-semibold"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{user.firstName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                <UserIcon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Apelido</p>
                {isEditing ? (
                  <input 
                    className="w-full border-b border-pink-100 py-1 focus:outline-none bg-transparent text-sm font-semibold"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{user.lastName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Idade</p>
                {isEditing ? (
                  <input 
                    type="number"
                    className="w-full border-b border-pink-100 py-1 focus:outline-none bg-transparent text-sm font-semibold"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{user.age} Anos</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Cidade</p>
                {isEditing ? (
                  <input 
                    className="w-full border-b border-pink-100 py-1 focus:outline-none bg-transparent text-sm font-semibold"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{user.city}</p>
                )}
              </div>
            </div>

            {user.id !== 'guest' && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Estágio Pós-Parto</p>
                  {isEditing ? (
                    <select 
                      className="w-full border-b border-pink-100 py-1 focus:outline-none bg-transparent text-sm font-semibold"
                      value={week}
                      onChange={e => setWeek(parseInt(e.target.value))}
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i+1} value={i+1}>Semana {i+1}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-gray-700">Semana {user.postpartumWeek}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Chats Section */}
        {recentChats.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white/50">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-pink-500" />
              Conversas Recentes
            </h3>
            <div className="space-y-4">
              {recentChats.map((chat) => (
                <button 
                  key={chat.name}
                  onClick={() => onSelectChat({ name: chat.name })}
                  className="w-full flex items-center gap-3 p-2 hover:bg-pink-50/50 rounded-2xl transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full border border-pink-100 overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} alt={chat.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{chat.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold">{chat.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white/50 overflow-hidden">
          {menuItems.map((item, i) => (
            <button 
              key={item.label}
              onClick={() => item.onClick ? item.onClick() : null}
              className={`w-full flex items-center gap-4 p-5 hover:bg-white/40 transition-colors ${i !== menuItems.length - 1 ? 'border-b border-white/40' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="flex-1 text-left font-bold text-gray-700 text-sm">{item.label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-5 bg-red-50/50 backdrop-blur-sm text-red-500 font-bold rounded-[2.5rem] border border-red-100/50 active:scale-95 transition-all text-sm mb-10"
        >
          <LogOut size={20} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
