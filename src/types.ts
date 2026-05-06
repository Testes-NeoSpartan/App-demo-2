/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  city: string;
  postpartumWeek: number;
  avatarSeed?: string;
  settings?: {
    notifications: {
      enabled: boolean;
      community: boolean;
      iaTips: boolean;
      appointments: boolean;
    };
    privacy: {
      isPrivate: boolean;
      showCity: boolean;
      showWeek: boolean;
      allowStrangerMessages: boolean;
    };
  };
}

export interface Appointment {
  id: string;
  date: string; // ISO string for better sorting
  time: string;
  type: string;
  specialty?: string;
  doctorName?: string;
  status: 'upcoming' | 'completed';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'community_member';
  senderName?: string;
  timestamp: number;
}

export interface PrivateMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  timestamp: number;
}

export type View = 'home' | 'ai' | 'appointments' | 'community' | 'profile' | 'private_chat' | 'profile_view';
