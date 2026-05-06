/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MessageCircle, Heart, Share2, Send, Users, Calendar } from 'lucide-react';
import { MOCK_POSTS } from '../constants';
import { User } from '../types';

interface UserProfileViewProps {
  currentUser: User;
  selectedUser: { 
    name: string; 
    avatar?: string; 
    week?: number; 
    id?: string; 
    age?: number; 
    city?: string;
  };
  onBack: () => void;
  onMessage: () => void;
}

export default function UserProfileView({ currentUser, selectedUser, onBack, onMessage }: UserProfileViewProps) {
  // Simple filtering for mock posts. In a real app this would come from a database.
  const userPosts = MOCK_POSTS.filter(p => p.author === selectedUser.name);
  
  // If we don't have the week, assume a default or get it from context if possible
  const week = selectedUser.week || (userPosts.length > 0 ? userPosts[0].week : 2);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Header Profile */}
      <div className="pink-gradient pt-16 pb-12 px-6 rounded-b-[4rem] relative shadow-lg shadow-pink-100/20">
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="absolute top-12 left-6 p-2 bg-white/30 backdrop-blur-md rounded-full text-pink-600 border border-white/40"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl mb-4">
            <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${selectedUser.avatar || selectedUser.name}&mood=neutral,serious`} alt="profile" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedUser.name}</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {selectedUser.id !== 'guest' && (
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40">
                <Calendar size={12} className="text-pink-500" />
                <p className="text-pink-600 font-bold text-[10px] uppercase tracking-widest">Semana {week}</p>
              </div>
            )}
            {selectedUser.age && (
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40">
                <p className="text-pink-600 font-bold text-[10px] uppercase tracking-widest">{selectedUser.age} Anos</p>
              </div>
            )}
            {selectedUser.city && (
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40">
                <p className="text-pink-600 font-bold text-[10px] uppercase tracking-widest">{selectedUser.city}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 mt-4 space-y-6 pb-24">
        {/* Actions */}
        {selectedUser.name === currentUser.name ? (
          <div className="bg-pink-50/50 p-6 rounded-[2.5rem] border border-pink-100 text-center">
            <p className="text-xs text-pink-600 font-bold uppercase tracking-widest">Este é o teu perfil público</p>
          </div>
        ) : currentUser.id === 'guest' ? (
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white/50 flex flex-col items-center text-center gap-3">
            <Send size={24} className="text-pink-300" />
            <div>
              <h4 className="text-xs font-bold text-gray-800">Mensagens Privadas</h4>
              <p className="text-[10px] text-gray-500 mt-1">Precisas de uma conta para conversar com a {selectedUser.name}.</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-pink-500 text-white px-6 py-2 rounded-full text-[10px] font-bold shadow-lg shadow-pink-100"
            >
              Criar Conta Grátis
            </button>
          </div>
        ) : (
          <button 
            onClick={onMessage}
            className="w-full flex items-center justify-center gap-2 p-5 bg-pink-500 text-white font-bold rounded-[2.5rem] shadow-xl shadow-pink-200 active:scale-95 transition-all text-sm"
          >
            <Send size={20} />
            Enviar Mensagem Privada
          </button>
        )}

        {/* Community Posts Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
            <MessageCircle size={14} className="text-pink-500" />
            Publicações na Comunidade
          </h3>
          
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-sm border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-pink-100 overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatar}`} alt={post.author} />
                    </div>
                    <div>
                      <p className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">{post.time}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-6 font-medium">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/40">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Heart size={18} />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <MessageCircle size={18} />
                      <span className="text-xs font-bold">{post.comments.length}</span>
                    </div>
                  </div>
                  <Share2 size={18} className="text-gray-400" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/50 text-center">
               <p className="text-xs text-gray-500 italic">Ainda não existem publicações públicas desta utilizadora.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
