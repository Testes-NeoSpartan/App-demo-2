import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronLeft, User as UserIcon } from 'lucide-react';
import { User, PrivateMessage } from '../types';

interface PrivateChatProps {
  user: User;
  otherUser: { name: string; avatar?: string; id?: string; week?: number };
  onBack: () => void;
  onViewProfile: (otherUser: any) => void;
}

export default function PrivateChat({ user, otherUser, onBack, onViewProfile }: PrivateChatProps) {
  const [messages, setMessages] = useState<PrivateMessage[]>(() => {
    const saved = localStorage.getItem(`messages_${otherUser.name}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    localStorage.setItem(`messages_${otherUser.name}`, JSON.stringify(messages));
  }, [messages, otherUser.name]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: PrivateMessage = {
      id: Date.now().toString(),
      text: input,
      senderId: user.name, // using name as id for simplicity in this mock
      receiverId: otherUser.name,
      senderName: user.name,
      timestamp: Date.now(),
    };

    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="p-1 hover:bg-pink-100 rounded-full transition-colors text-pink-500"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => onViewProfile(otherUser)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
        >
          <div className="w-10 h-10 rounded-full border border-pink-100 overflow-hidden shrink-0">
            <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${otherUser.avatar || otherUser.name}&mood=neutral,serious`} alt={otherUser.name} />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-800">{otherUser.name}</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online agora</p>
          </div>
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.senderId === user.name ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                  msg.senderId === user.name 
                    ? 'bg-pink-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 rounded-tl-none border border-pink-50'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[9px] mt-1 opacity-60 text-right ${msg.senderId === user.name ? 'text-white' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white/60 backdrop-blur-md border-t border-white/50">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Escreve uma mensagem..."
            className="flex-1 bg-pink-50/50 rounded-2xl px-4 py-3 text-sm focus:outline-none border border-pink-100/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-200 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
