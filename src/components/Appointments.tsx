/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Star, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  ChevronLeft, 
  Stethoscope, 
  Heart, 
  Brain, 
  Baby,
  Activity
} from 'lucide-react';
import { Appointment, User } from '../types';

interface AppointmentsProps {
  user: User;
  onBack: () => void;
}

const SPECIALTIES = [
  { id: 'peds', name: 'Pediatria', icon: Baby, color: 'bg-blue-100 text-blue-600' },
  { id: 'gyn', name: 'Ginecologia/Obstetrícia', icon: Stethoscope, color: 'bg-pink-100 text-pink-600' },
  { id: 'psy', name: 'Psicologia Pós-Parto', icon: Brain, color: 'bg-purple-100 text-purple-600' },
  { id: 'lact', name: 'Consultoria de Amamentação', icon: Heart, color: 'bg-red-100 text-red-600' },
  { id: 'physio', name: 'Fisioterapia Pélvica', icon: Activity, color: 'bg-green-100 text-green-600' },
];

const DOCTORS = [
  { id: 'd1', name: 'Dra. Maria Fontes', specialty: 'peds', rating: 4.9, bio: 'Especialista em recém-nascidos.' },
  { id: 'd2', name: 'Dr. João Silva', specialty: 'peds', rating: 4.8, bio: '20 anos de experiência em pediatria.' },
  { id: 'd3', name: 'Dra. Ana Costa', specialty: 'gyn', rating: 5.0, bio: 'Especialista em recuperação pós-parto.' },
  { id: 'd4', name: 'Dra. Sofia Torres', specialty: 'psy', rating: 4.9, bio: 'Focada em depressão pós-parto.' },
  { id: 'd5', name: 'Enf. Júlia Marés', specialty: 'lact', rating: 4.7, bio: 'Consultora certificada de amamentação.' },
];

export default function Appointments({ user, onBack }: AppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(`app_appointments_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState<'list' | 'specialty' | 'doctor' | 'datetime'>('list');

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    const days = [];

    // Empty slots before first day
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14"></div>);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(a => a.date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={d} className={`h-14 border border-pink-50/30 flex flex-col items-center justify-center relative rounded-xl ${isToday ? 'bg-pink-50/50' : ''}`}>
          <span className={`text-xs font-bold ${isToday ? 'text-pink-600' : 'text-gray-600'}`}>{d}</span>
          {dayAppointments.length > 0 && (
            <div className="flex gap-0.5 mt-1">
              {dayAppointments.map(a => (
                <div key={a.id} className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 capitalize">{monthName}</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-pink-50 rounded-full text-pink-500 transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-pink-50 rounded-full text-pink-500 transition-colors"
                title="Próximo mês"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
              <div key={day} className="text-[10px] font-bold text-gray-400 text-center py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-pink-500 uppercase tracking-widest pl-2">Consultas do Mês</h4>
          {appointments.filter(a => {
            const d = new Date(a.date);
            return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
          }).map(app => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 p-4 rounded-2xl flex items-center gap-3 border border-pink-50/50"
            >
              <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500 shrink-0">
                <CalendarIcon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{app.type}</p>
                <p className="text-[10px] text-gray-500">{app.doctorName} • {formatDate(app.date)} às {app.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      if (!day) return dateStr;
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    localStorage.setItem(`app_appointments_${user.id}`, JSON.stringify(appointments));
  }, [appointments, user.id]);

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) return;

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      time: selectedTime,
      type: SPECIALTIES.find(s => s.id === selectedSpecialty)?.name || 'Consulta',
      specialty: selectedSpecialty || undefined,
      doctorName: selectedDoctor.name,
      status: 'upcoming'
    };

    setAppointments(prev => [...prev, newAppointment].sort((a, b) => a.date.localeCompare(b.date)));
    resetBooking();
  };

  const resetBooking = () => {
    setBookingStep('list');
    setSelectedSpecialty(null);
    setSelectedDoctor(null);
    setSelectedTime('');
  };

  const filteredDoctors = DOCTORS.filter(d => d.specialty === selectedSpecialty);

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const renderContent = () => {
    switch (bookingStep) {
      case 'list':
        return (
          <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
              <div className="bg-white/60 p-1 rounded-2xl flex gap-1 border border-white/50">
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all ${
                    viewMode === 'calendar' ? 'bg-pink-500 text-white shadow-md' : 'text-gray-500'
                  }`}
                >
                  Agenda
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all ${
                    viewMode === 'list' ? 'bg-pink-500 text-white shadow-md' : 'text-gray-500'
                  }`}
                >
                  Lista
                </button>
              </div>
              <button 
                onClick={() => setBookingStep('specialty')}
                className="flex items-center gap-2 text-pink-600 font-bold text-xs bg-white px-5 py-2.5 rounded-full border border-pink-100 shadow-sm active:scale-95 transition-transform"
              >
                <Plus size={16} /> Nova
              </button>
            </div>

            {viewMode === 'calendar' ? renderCalendar() : (
              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 text-lg">Próximas Consultas</h3>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map(app => (
                      <motion.div 
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 backdrop-blur-sm p-5 rounded-[2rem] border border-white/50 flex items-center gap-4 shadow-sm"
                      >
                        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
                          <CalendarIcon size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-sm">{app.type}</h4>
                          <p className="text-[11px] text-gray-500 font-medium">{app.doctorName}</p>
                          <div className="flex items-center gap-4 text-[10px] text-pink-500 mt-2 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><CalendarIcon size={10}/>{formatDate(app.date)}</span>
                            <span className="flex items-center gap-1"><Clock size={10}/>{app.time}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))}
                          className="text-gray-300 hover:text-red-400 transition-colors p-2"
                        >
                          <Plus size={18} className="rotate-45" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/40 rounded-[3rem] border border-dashed border-pink-200">
                    <CalendarIcon size={40} className="mx-auto text-pink-200 mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Não tens consultas agendadas.</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gradient-to-br from-pink-500 to-rose-400 p-6 rounded-[2.5rem] text-white shadow-xl shadow-pink-100">
              <h4 className="font-bold mb-2">Acompanhamento Especializado</h4>
              <p className="text-xs text-white/90 leading-relaxed">
                Recomendamos uma consulta de revisão na 6ª semana pós-parto para garantir que a tua recuperação está no caminho certo.
              </p>
            </div>
          </div>
        );

      case 'specialty':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setBookingStep('list')} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-bold text-gray-800">Escolhe a Especialidade</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SPECIALTIES.map(spec => (
                <button 
                  key={spec.id}
                  onClick={() => {
                    setSelectedSpecialty(spec.id);
                    setBookingStep('doctor');
                  }}
                  className="w-full flex items-center gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-white/50 hover:bg-white transition-all text-left group shadow-sm active:scale-[0.98]"
                >
                  <div className={`w-12 h-12 rounded-2xl ${spec.color} flex items-center justify-center`}>
                    <spec.icon size={24} />
                  </div>
                  <span className="flex-1 font-bold text-gray-800 text-sm">{spec.name}</span>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-pink-500" />
                </button>
              ))}
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setBookingStep('specialty')} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-bold text-gray-800">Escolhe o Profissional</h3>
            </div>
            <div className="space-y-3">
              {filteredDoctors.map(doc => (
                <button 
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setBookingStep('datetime');
                  }}
                  className="w-full p-5 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-white/50 hover:bg-white transition-all text-left flex items-center gap-4 group shadow-sm active:scale-[0.98]"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-pink-100 shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-800">{doc.name}</h4>
                    <p className="text-[10px] text-gray-500 font-medium mb-1">{doc.bio}</p>
                    <div className="flex items-center gap-2">
                       <Star size={10} className="text-yellow-500 fill-yellow-500" />
                       <span className="text-[10px] font-bold text-gray-700">{doc.rating}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-pink-500" />
                </button>
              ))}
            </div>
          </div>
        );

      case 'datetime':
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const days = Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return d;
        });

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setBookingStep('doctor')} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-bold text-gray-800">Data e Hora</h3>
            </div>

            <div className="bg-white/80 p-6 rounded-[2.5rem] shadow-sm border border-white/50 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-pink-500 uppercase tracking-widest block mb-4">Escolher Dia</label>
                <div className="grid grid-cols-4 gap-2">
                  {days.map(d => {
                    const dateStr = d.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button 
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-2 rounded-2xl flex flex-col items-center transition-all border ${
                          isSelected ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-pink-50/30 text-gray-700 border-pink-100'
                        }`}
                      >
                        <span className="text-[8px] font-bold uppercase opacity-60">
                          {d.toLocaleDateString('pt-PT', { weekday: 'short' })}
                        </span>
                        <span className="text-xs font-bold">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-pink-500 uppercase tracking-widest block mb-4">Horários</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                        selectedTime === time 
                          ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-100' 
                          : 'bg-white border-pink-50 text-gray-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedDoctor && selectedSpecialty && (
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-200">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.name}`} alt="doc" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Resumo da Reserva</p>
                  <p className="text-xs font-bold text-gray-800">{selectedDoctor.name} • {selectedTime || '--:--'}</p>
                </div>
              </div>
            )}

            <button 
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-pink-500 text-white font-bold p-5 rounded-[2rem] shadow-xl shadow-pink-200 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100"
            >
              Confirmar Agendamento
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdf2f7]">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="p-2 bg-white shadow-sm rounded-full text-pink-600 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Consultas</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-2 pb-20">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bookingStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

