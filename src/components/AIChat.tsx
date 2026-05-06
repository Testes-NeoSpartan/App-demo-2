/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User as UserIcon, Calendar, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, User } from '../types';
import { askAI } from '../services/gemini';

interface AIChatProps {
  user: User;
  onNavigateToAppointments: () => void;
  onBack: () => void;
}

export default function AIChat({ user, onNavigateToAppointments, onBack }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Olá ${user.name.split(' ')[0]}, sou a tua assistente. Como te estás a sentir hoje na tua ${user.postpartumWeek}ª semana pós-parto?`,
      sender: 'ai',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const context = `Postpartum week: ${user.postpartumWeek}. User name: ${user.name}. Language: European Portuguese (PT-PT).`;
    const aiResponse = await askAI(input, context);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse || "Sinto muito, não consegui processar sua mensagem.",
      sender: 'ai',
      timestamp: Date.now()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
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
        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-200">
          <Bot size={22} />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-sm">Assistente IA</h2>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online & Conectada</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              m.sender === 'user' 
                ? 'bg-pink-500 text-white rounded-tr-none' 
                : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-white/50 rounded-tl-none'
            }`}>
              <div className="markdown-body">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
              
              {m.sender === 'ai' && (m.text.toLowerCase().includes('appointment') || m.text.toLowerCase().includes('consulta') || m.text.toLowerCase().includes('médico')) && (
                <button 
                  onClick={onNavigateToAppointments}
                  className="mt-3 w-full py-2 bg-pink-100/50 text-pink-600 text-xs font-bold rounded-xl border border-pink-200/50 flex items-center justify-center gap-2 hover:bg-pink-100 transition-all"
                >
                  <Calendar size={14} />
                  Agendar Consulta Agora
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/50 shadow-sm">
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex gap-1"
              >
                <div className="w-2 h-2 bg-pink-400 rounded-full" />
                <div className="w-2 h-2 bg-pink-400 rounded-full" />
                <div className="w-2 h-2 bg-pink-400 rounded-full" />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Diga algo..."
            className="flex-1 bg-white/60 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all border border-white/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
