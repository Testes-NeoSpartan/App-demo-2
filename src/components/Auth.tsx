/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Mail, Lock, User as UserIcon, MapPin, Calendar as CalendarIcon, ArrowRight, ChevronLeft } from 'lucide-react';
import { User } from '../types';

import { profileService } from '../services/profileService';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'initial' | 'onboarding';

export default function Auth({ onLogin }: AuthProps) {
  const [step, setStep] = useState<AuthStep>('initial');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Onboarding info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState('Sophia');

  const avatarOptions = ['Sophia', 'Isabella', 'Emma', 'Olivia', 'Amelia', 'Mia', 'Elena', 'Clara', 'Naomi'];

  const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&mood=neutral,serious`;

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const foundUser = await profileService.getProfile(email);
        
        if (foundUser) {
          if (foundUser.password === password) {
            onLogin(foundUser);
          } else {
            setError('Palavra-passe incorreta. Por favor, tente novamente.');
          }
        } else {
          setError('Conta não encontrada. Por favor, crie uma conta primeiro.');
        }
      } else {
        // Check if email already exists in Supabase
        const existingUser = await profileService.getProfile(email);
        if (existingUser) {
          setError('Este email já está registado. Por favor, faça login.');
          setIsLogin(true);
          return;
        }
        // Transition to details for new account
        setStep('onboarding');
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      const errorMessage = err?.message || err?.error_description || String(err);
      if (errorMessage.includes('relation "profiles" does not exist')) {
        setError('A tabela "profiles" não existe no Supabase. Cria-a no SQL Editor.');
      } else if (errorMessage.includes('Failed to fetch')) {
        setError('Erro de rede: Não foi possível contactar o Supabase. Verifica os teus URLs.');
      } else {
        setError(`Erro de ligação: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !lastName || !age || !city) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsLoading(true);
    console.log('Iniciando registo para:', email);

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password,
      age: parseInt(age),
      city,
      postpartumWeek: 1,
      avatarSeed: selectedAvatarSeed
    };

    try {
      const result = await profileService.updateProfile(newUser);
      
      if (result.success) {
        onLogin(newUser);
      } else {
        const pgError = result.error as any;
        console.error('Supabase Error details:', pgError);
        
        let customMessage = 'Erro ao criar conta.';
        if (pgError?.code === 'PGRST116') customMessage = 'A tabela "profiles" não foi encontrada no Supabase.';
        if (pgError?.message?.includes('relation "profiles" does not exist')) customMessage = 'Tabela "profiles" não existe. Precisas de a criar no SQL Editor do Supabase.';
        if (pgError?.message?.includes('column')) customMessage = `Erro de colunas: ${pgError.message}. Verifica se a tabela tem todas as colunas necessárias.`;
        
        setError(`${customMessage} (${pgError?.message || 'Tenta novamente.'})`);
      }
    } catch (err: any) {
      console.error('Registration error details:', err);
      const errorMessage = err?.message || err?.error_description || String(err);
      setError(`Erro de servidor: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser: User = { 
      id: 'guest', 
      firstName: 'Convidada', 
      lastName: '', 
      name: 'Convidada', 
      email: 'guest@app.pt', 
      age: 30, 
      city: 'Lisboa', 
      postpartumWeek: 2 
    };
    onLogin(guestUser);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden h-full">
      <div className="absolute inset-0 pink-gradient opacity-80"></div>
      
      <AnimatePresence mode="wait">
        {step === 'initial' ? (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xs relative z-10 bg-white/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/60 shadow-2xl"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/80 p-4 rounded-[2rem] shadow-lg border border-white">
                <Heart className="w-10 h-10 text-pink-500" fill="currentColor" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Cuidado Materno</h1>
            <p className="text-pink-600 text-[10px] font-bold text-center mb-8 uppercase tracking-widest">A tua jornada pós-parto</p>

            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 border border-red-100 text-red-500 text-[10px] p-3 rounded-xl font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-pink-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  placeholder="Seu melhor email"
                  className="w-full bg-white/60 border border-white/40 rounded-2xl py-3 pl-11 pr-4 placeholder-pink-300 text-sm focus:outline-none focus:bg-white/80 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-pink-400" />
                <input
                  id="auth-password-input"
                  type="password"
                  placeholder="Palavra-passe"
                  className="w-full bg-white/60 border border-white/40 rounded-2xl py-3 pl-11 pr-4 placeholder-pink-300 text-sm focus:outline-none focus:bg-white/80 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                id="auth-submit-button"
                type="submit"
                disabled={isLoading}
                className={`w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all transform active:scale-95 text-sm flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'A carregar...' : (isLogin ? 'Entrar' : 'Continuar')} <ArrowRight size={16} />
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-pink-200/50"></div>
                <span className="px-3 text-[10px] text-pink-300 font-bold uppercase">Ou</span>
                <div className="flex-1 h-px bg-pink-200/50"></div>
              </div>

              <button
                id="auth-guest-button"
                type="button"
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="w-full bg-white/60 text-pink-600 font-bold py-3 rounded-2xl border border-white/60 shadow-sm hover:bg-white/80 transition-all transform active:scale-95 text-xs disabled:opacity-50"
              >
                Entrar como Convidada
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-pink-600 underline ml-1"
              >
                {isLogin ? 'Cadastre-se' : 'Entrar'}
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xs relative z-10 bg-white/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/60 shadow-2xl"
          >
            <button 
              onClick={() => setStep('initial')}
              className="absolute top-6 left-6 text-pink-500 hover:bg-pink-50 p-1 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="mt-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 text-center">Fala-nos sobre ti</h2>
              <p className="text-center text-xs text-gray-500 mt-2 font-medium italic">Queremos conhecer-te melhor</p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 border border-red-100 text-red-500 text-[10px] p-3 rounded-xl font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
              <div className="flex flex-col items-center mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Escolhe o teu Avatar</p>
                <div className="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto p-1">
                  {avatarOptions.map(seed => (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setSelectedAvatarSeed(seed)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedAvatarSeed === seed ? 'border-pink-500 scale-110 shadow-md' : 'border-white/40'}`}
                    >
                      <img src={getAvatarUrl(seed)} alt="Avatar Option" className="w-full h-full rounded-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-pink-400" />
                  <input
                    type="text"
                    placeholder="Nome"
                    className="w-full bg-white/60 border border-white/40 rounded-2xl py-3 pl-10 pr-3 placeholder-pink-300 text-sm focus:outline-none focus:bg-white/80 transition-all font-medium"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Apelido"
                    className="w-full bg-white/60 border border-white/40 rounded-2xl py-3 px-4 placeholder-pink-300 text-sm focus:outline-none focus:bg-white/80 transition-all font-medium"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-pink-400" />
                <input
                  type="number"
                  placeholder="Idade"
                  className="w-full bg-white/60 border border-white/40 rounded-2xl py-3 pl-11 pr-4 placeholder-pink-300 text-sm focus:outline-none focus:bg-white/80 transition-all font-medium"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-pink-400" />
                <input
                  type="text"
                  placeholder="Cidade"
                  className="w-full bg-white/60 border border-white/40 rounded-2xl py-3 pl-11 pr-4 placeholder-pink-300 text-sm focus:outline-none focus:bg-white/80 transition-all font-medium"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-4 bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all transform active:scale-95 text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'A criar conta...' : 'Concluir Registo'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
