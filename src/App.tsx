/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Bell, ChevronRight, Activity, Calendar, Users, Bot } from 'lucide-react';
import { User, View } from './types';
import { notificationService } from './services/notificationService';
import Auth from './components/Auth';
import AIChat from './components/AIChat';
import Appointments from './components/Appointments';
import Community from './components/Community';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
import PrivateChat from './components/PrivateChat';
import UserProfileView from './components/UserProfileView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [history, setHistory] = useState<View[]>(['home']);
  const [chatUser, setChatUser] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user_v1');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const navigateTo = (view: View) => {
    if (view === currentView) return;
    setHistory(prev => [...prev, view]);
    setCurrentView(view);
  };

  const switchTab = (view: View) => {
    setCurrentView(view);
    setHistory([view]);
  };

  const goBack = () => {
    if (history.length <= 1) {
      switchTab('home');
      return;
    }
    const newHistory = [...history];
    newHistory.pop();
    const prevView = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setCurrentView(prevView);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('app_user_v1', JSON.stringify(userData));
    switchTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_user_v1');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('app_user_v1', JSON.stringify(updatedUser));
  };

  if (loading) return null;

  if (!user) {
    return <div className="mobile-container pt-4"><Auth onLogin={handleLogin} /></div>;
  }

  const renderView = () => {
    const onMessageUser = (otherUser: any) => {
      setChatUser(otherUser);
      navigateTo('private_chat');
    };

    const onViewProfile = (profileUser: any) => {
      setSelectedProfile({
        ...profileUser,
        avatar: profileUser.id === user.id ? (user.avatarSeed || user.name) : (profileUser.avatarSeed || profileUser.avatar || profileUser.name),
        // Ensure we pass age and city if it's the current user, so they are seen in the preview
        age: profileUser.id === user.id ? user.age : profileUser.age,
        city: profileUser.id === user.id ? user.city : profileUser.city,
      });
      navigateTo('profile_view');
    };

    switch (currentView) {
      case 'home':
        return <HomeView user={user} onNavigate={navigateTo} onViewProfile={onViewProfile} onSwitchTab={switchTab} />;
      case 'ai':
        return <AIChat user={user} onNavigateToAppointments={() => navigateTo('appointments')} onBack={goBack} />;
      case 'appointments':
        return <Appointments user={user} onBack={goBack} />;
      case 'community':
        return <Community user={user} onBack={goBack} onSelectUser={onViewProfile} />;
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onBack={goBack} onSelectChat={onMessageUser} onViewProfile={() => onViewProfile({ name: user.name, avatar: user.avatarSeed || user.name, week: user.postpartumWeek, id: user.id })} />;
      case 'private_chat':
        return <PrivateChat 
          user={user} 
          otherUser={chatUser} 
          onBack={goBack} 
          onViewProfile={onViewProfile}
        />;
      case 'profile_view':
        return <UserProfileView 
          currentUser={user}
          selectedUser={selectedProfile} 
          onBack={goBack} 
          onMessage={() => onMessageUser(selectedProfile)} 
        />;
      default:
        return <HomeView user={user} onNavigate={navigateTo} onViewProfile={onViewProfile} onSwitchTab={switchTab} />;
    }
  };

  return (
    <div className="mobile-container relative pt-4">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentView === 'profile_view' ? `profile-${selectedProfile?.name}` : currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <Navigation currentView={currentView} onViewChange={switchTab} />
    </div>
  );
}

function HomeView({ user, onNavigate, onViewProfile, onSwitchTab }: { user: User; onNavigate: (v: View) => void; onViewProfile: (u: any) => void; onSwitchTab: (v: View) => void }) {
  const dailyTips = [
    { title: "Dormir em Segurança", content: "O bebé deve dormir sempre de barriga para cima para reduzir o risco de SMSL." },
    { title: "Hidratação é Chave", content: "Beba muita água! A amamentação e a recuperação exigem uma hidratação extra." },
    { title: "Tummy Time", content: "Coloque o bebé de barriga para baixo alguns minutos por dia (acordado) para fortalecer o pescoço." },
    { title: "Peça Ajuda", content: "Não tente fazer tudo sozinha. Aceite ajuda com as tarefas domésticas e foque-se no seu descanso." },
    { title: "Pele com Pele", content: "O contacto pele com pele ajuda a regular a temperatura do bebé e fortalece o vosso vínculo." },
    { title: "Vitaminas", content: "Continue a tomar as vitaminas recomendadas pelo seu médico para repor energias." },
    { title: "O Choro", content: "O choro é a comunicação do bebé. Verifique fralda, fome ou necessidade de colo." },
    { title: "Banho do Bebé", content: "Opcional todos os dias: limpe bem as pregas e a zona da fralda." }
  ];

  // Simple date-based index to change tip daily
  const tipIndex = (new Date().getFullYear() * 365 + new Date().getMonth() * 30 + new Date().getDate()) % dailyTips.length;
  const tip = dailyTips[tipIndex];

  useEffect(() => {
    // Show notification for the daily tip if user has notifications enabled
    if (user.settings?.notifications?.enabled && user.settings?.notifications?.iaTips) {
      const tipShownKey = `tip_shown_${new Date().toDateString()}`;
      if (!localStorage.getItem(tipShownKey)) {
        notificationService.showNotification('Dica Diária Moments', {
          body: `${tip.title}: ${tip.content}`,
          icon: '/manifest-icon-192.png'
        });
        localStorage.setItem(tipShownKey, 'true');
      }
    }
  }, [user.settings, tipIndex]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bem-vinda</h1>
        </div>
        <button 
          onClick={() => onSwitchTab('profile')}
          className="w-10 h-10 rounded-full border-2 border-pink-400 overflow-hidden shadow-sm active:scale-95 transition-transform"
        >
          <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${user.avatarSeed || user.name}&mood=neutral,serious`} alt="Profile" className="w-full h-full object-cover bg-white" />
        </button>
      </div>

      {/* Daily Tip Card */}
      <div className="px-5 mb-4">
        <div className="bg-gradient-to-br from-pink-50 to-white p-5 rounded-[2rem] border border-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-pink-100 p-1.5 rounded-lg">
              <Heart size={14} className="text-pink-600" fill="currentColor" />
            </div>
            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Dica do Dia</span>
          </div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">{tip.title}</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed italic">"{tip.content}"</p>
        </div>
      </div>

      {/* AI Assistant Promo Card (Frosted) */}
      <div className="px-5 mb-4">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-white/50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200">
              <Bot size={18} />
            </div>
            <span className="text-sm font-bold text-gray-700">Assistente IA</span>
          </div>
          <div className="bg-pink-50/80 p-4 rounded-2xl mb-4 border border-pink-100/50">
            <p className="text-xs text-pink-800 leading-relaxed italic">
              "A tua recuperação é a minha prioridade. Como te sentes na semana {user.postpartumWeek}?"
            </p>
          </div>
          <button 
            onClick={() => onNavigate('ai')}
            className="w-full py-3 bg-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all active:scale-95"
          >
            Falar com a Assistente
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-5 grid grid-cols-2 gap-4 mb-6">
        <MenuCard 
          icon={Calendar} 
          title="Consultas" 
          desc="3 Por validar" 
          onClick={() => onNavigate('appointments')}
        />
        <MenuCard 
          icon={Users} 
          title="Comunidade" 
          desc="12 Mensagens" 
          onClick={() => onNavigate('community')}
        />
      </div>
    </div>
  );
}

function MenuCard({ icon: Icon, title, desc, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="bg-white/60 backdrop-blur-sm p-5 rounded-[2rem] border border-white/50 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:scale-105 active:scale-95 shadow-sm"
    >
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner text-pink-500">
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-700">{title}</span>
        <span className="text-[10px] text-gray-500 uppercase font-medium">{desc}</span>
      </div>
    </button>
  );
}
