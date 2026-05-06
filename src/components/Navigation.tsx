/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Bot, Calendar, Users, User } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const items = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'ai', icon: Bot, label: 'IA' },
    { id: 'appointments', icon: Calendar, label: 'Agenda' },
    { id: 'community', icon: Users, label: 'Comunidade' },
    { id: 'profile', icon: User, label: 'Eu' },
  ];

  return (
    <div className="h-20 bg-white/80 backdrop-blur-xl border-t border-white/50 flex justify-around items-center px-4 shrink-0 rounded-t-[2.5rem]">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`flex flex-col items-center space-y-1 transition-all ${
              isActive ? 'text-pink-600 scale-110' : 'text-gray-400 opacity-60'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <item.icon size={22} fill={isActive ? 'currentColor' : 'none'} fillOpacity={0.1} />
            </div>
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
