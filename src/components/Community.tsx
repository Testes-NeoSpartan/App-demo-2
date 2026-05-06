/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Heart, Share2, MoreHorizontal, Send, Users, ChevronLeft } from 'lucide-react';
import { User } from '../types';
import { MOCK_POSTS } from '../constants';

interface CommunityProps {
  user: User;
  onBack: () => void;
  onSelectUser: (otherUser: any) => void;
}

export default function Community({ user, onBack, onSelectUser }: CommunityProps) {
  const [posts, setPosts] = useState(MOCK_POSTS);

  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now().toString(),
      author: user.name,
      avatar: user.avatarSeed || user.name,
      week: user.postpartumWeek,
      content: newPost,
      likes: 0,
      comments: [],
      time: 'Agora mesmo'
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 -ml-1 hover:bg-pink-100 rounded-full transition-colors text-pink-500"
          >
            <ChevronLeft size={24} />
          </button>
          <Users className="text-pink-500" size={24} />
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Comunidade</h2>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map(n => (
            <button 
              key={n} 
              onClick={() => onSelectUser({ name: `Mãe ${n}`, avatar: `mom${n}`, week: Math.floor(Math.random() * 12) + 1 })}
              className="w-8 h-8 rounded-full border-2 border-white bg-pink-100 overflow-hidden box-content active:scale-90 transition-transform"
            >
              <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=mom${n}&mood=neutral,serious`} alt="mom" />
            </button>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-pink-500 flex items-center justify-center text-[10px] text-white font-bold box-content">
            +99
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {user.id === 'guest' ? (
          <div className="bg-pink-50/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-pink-100 flex flex-col items-center text-center gap-3">
            <Users size={24} className="text-pink-400" />
            <div>
              <p className="text-xs font-bold text-gray-800">Queres partilhar a tua jornada?</p>
              <p className="text-[10px] text-gray-500 mt-1">Cria uma conta para publicares na comunidade e interagires com outras mães.</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-bold text-pink-600 hover:underline"
            >
              Ir para Criar Conta
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] shadow-sm border border-white/50">
            <div className="flex gap-3">
               <div className="w-10 h-10 rounded-full border border-pink-100 overflow-hidden shrink-0">
                 <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${user.avatarSeed || user.name}&mood=neutral,serious`} alt="me" />
               </div>
               <textarea 
                 placeholder="Compartilhe algo ou faça uma pergunta..."
                 className="flex-1 bg-pink-50/50 rounded-2xl p-4 text-sm focus:outline-none resize-none min-h-[100px] border border-pink-100/50"
                 value={newPost}
                 onChange={(e) => setNewPost(e.target.value)}
               />
            </div>
            <div className="flex justify-end mt-3">
              <button 
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="bg-pink-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-pink-200 active:scale-95 transition-all text-xs disabled:opacity-50"
              >
                Publicar
              </button>
            </div>
          </div>
        )}

        {posts.map((post) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-sm border border-white/50"
          >
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => onSelectUser({ name: post.author, avatar: post.avatar, week: post.week })}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-11 h-11 rounded-full border-2 border-pink-100 overflow-hidden">
                   <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${post.avatar}&mood=neutral,serious`} alt={post.author} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 text-xs">{post.author}</h4>
                  <p className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">Semana {post.week} • {post.time}</p>
                </div>
              </button>
              <button className="text-gray-300">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-6 font-medium">
              {post.content}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/40">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-pink-500 transition-colors">
                  <Heart size={18} />
                  <span className="text-xs font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-pink-500 transition-colors">
                  <MessageCircle size={18} />
                  <span className="text-xs font-bold">{post.comments.length}</span>
                </button>
                {post.author !== user.name && (
                  <button 
                    onClick={() => onSelectUser({ name: post.author, avatar: post.avatar, week: post.week })}
                    className="flex items-center gap-1.5 text-pink-500/60 hover:text-pink-500 transition-colors"
                  >
                    <Send size={16} />
                    <span className="text-xs font-bold">Mensagem</span>
                  </button>
                )}
              </div>
              <button className="text-gray-400 hover:text-pink-500 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
            
            {post.comments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/40 bg-pink-50/30 rounded-2xl p-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full border border-pink-100 overflow-hidden">
                    <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${post.comments[0].author}&mood=neutral,serious`} alt="commenter" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-800">{post.comments[0].author}</p>
                    <p className="text-[10px] text-gray-600 font-medium italic">{post.comments[0].text}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
