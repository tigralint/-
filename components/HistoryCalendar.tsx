import React, { useState } from 'react';
import { DayLog } from '../types';
import { X, Check, FileText, Moon, Droplets, Dumbbell } from 'lucide-react';
import { OMEGA_3_TARGET, WATER_GOAL_ML } from '../constants';

interface HistoryCalendarProps {
  startDate: string;
  targetDate: string;
  history: DayLog[];
  onClose: () => void;
}

export const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ startDate, targetDate, history, onClose }) => {
  const [selectedDayLog, setSelectedDayLog] = useState<DayLog | null>(null);

  const getDaysArray = (start: string, end: string) => {
    const arr = [];
    const dt = new Date(start);
    const endDate = new Date(end);
    while (dt <= endDate) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };

  const days = getDaysArray(startDate, targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const log = history.find(h => h.date === dateStr);
    
    if (date > today) return 'future';
    if (date.getTime() === today.getTime()) return 'today';
    return log ? log.status : 'missed';
  };

  const handleDayClick = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const log = history.find(h => h.date === dateStr);
      if(log) setSelectedDayLog(log);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-neon-purple rounded-full"></span>
              Календарь Прогресса
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              ОТЧЕТНОСТЬ_И_КОНТРОЛЬ
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
            {/* Calendar Grid */}
            <div className={`h-full overflow-y-auto p-6 custom-scrollbar transition-opacity duration-300 ${selectedDayLog ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <div className="grid grid-cols-5 gap-3 mb-4">
                    {days.map((date, index) => {
                    const status = getDayStatus(date);
                    const dayNumber = index + 1;
                    const isToday = status === 'today';
                    const dateStr = date.toISOString().split('T')[0];
                    const hasLog = history.find(h => h.date === dateStr);

                    let bgClass = 'bg-slate-800/50 border-slate-800 text-slate-600';
                    let icon = null;

                    switch (status) {
                        case 'perfect':
                        bgClass = 'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_10px_rgba(10,255,0,0.2)] hover:bg-neon-green/30 cursor-pointer';
                        icon = <Check size={12} />;
                        break;
                        case 'good':
                        bgClass = 'bg-neon-blue/20 border-neon-blue text-neon-blue hover:bg-neon-blue/30 cursor-pointer';
                        icon = <div className="w-2 h-2 rounded-full bg-neon-blue" />;
                        break;
                        case 'bad':
                        bgClass = 'bg-neon-red/20 border-neon-red text-neon-red hover:bg-neon-red/30 cursor-pointer';
                        icon = <X size={12} />;
                        break;
                        case 'missed':
                        bgClass = 'bg-slate-800 border-slate-700 text-slate-500';
                        icon = <span className="text-[10px]">-</span>;
                        break;
                        case 'today':
                        bgClass = 'bg-slate-700 border-white text-white animate-pulse ring-2 ring-white/20';
                        break;
                        case 'future':
                        bgClass = 'bg-slate-900/30 border-slate-800/50 text-slate-700';
                        break;
                    }

                    return (
                        <div 
                        key={index}
                        onClick={() => hasLog && handleDayClick(date)}
                        className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative overflow-hidden transition-all ${bgClass}`}
                        >
                        <span className="text-xs font-bold font-mono z-10">{dayNumber}</span>
                        <div className="absolute bottom-1 right-1 opacity-80">
                            {icon}
                        </div>
                        </div>
                    );
                    })}
                </div>
            </div>

            {/* Detailed View Slide-over */}
            {selectedDayLog && (
                <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-neon-blue" />
                            <h3 className="font-bold text-white">Отчет за {selectedDayLog.date}</h3>
                        </div>
                        <button 
                            onClick={() => setSelectedDayLog(null)}
                            className="text-slate-400 hover:text-white bg-slate-800 rounded-md p-1"
                        >
                            Назад
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        {/* Score & Weight */}
                        <div className="flex gap-4">
                             <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700">
                                 <span className="text-[10px] text-slate-400 uppercase">Оценка</span>
                                 <div className={`text-2xl font-black ${selectedDayLog.score > 80 ? 'text-neon-green' : selectedDayLog.score > 50 ? 'text-neon-blue' : 'text-neon-red'}`}>
                                     {selectedDayLog.score}%
                                 </div>
                             </div>
                             <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700">
                                 <span className="text-[10px] text-slate-400 uppercase">Вес</span>
                                 <div className="text-2xl font-black text-white">
                                     {selectedDayLog.weight}кг
                                 </div>
                             </div>
                        </div>

                        {/* Macros */}
                        {selectedDayLog.detailedStats && (
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h4 className="text-xs font-mono text-slate-400 uppercase mb-3 border-b border-slate-700 pb-1">Макронутриенты</h4>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="bg-slate-900 p-2 rounded">
                                        <div className="text-[10px] text-slate-500">Ккал</div>
                                        <div className="text-white font-bold">{Math.round(selectedDayLog.detailedStats.macros.calories)}</div>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded">
                                        <div className="text-[10px] text-slate-500">Белок</div>
                                        <div className="text-neon-blue font-bold">{Math.round(selectedDayLog.detailedStats.macros.protein)}</div>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded">
                                        <div className="text-[10px] text-slate-500">Жир</div>
                                        <div className="text-neon-red font-bold">{Math.round(selectedDayLog.detailedStats.macros.fat)}</div>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded">
                                        <div className="text-[10px] text-slate-500">Угли</div>
                                        <div className="text-neon-green font-bold">{Math.round(selectedDayLog.detailedStats.macros.carbs)}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Habits Checklist */}
                        {selectedDayLog.detailedStats && (
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h4 className="text-xs font-mono text-slate-400 uppercase mb-3 border-b border-slate-700 pb-1">Протокол</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between">
                                        <span className="flex items-center gap-2"><Droplets size={14} className="text-blue-400"/> Вода</span>
                                        <span className={selectedDayLog.detailedStats.habits.waterIntakeMl >= WATER_GOAL_ML ? "text-neon-green" : "text-slate-500"}>
                                            {selectedDayLog.detailedStats.habits.waterIntakeMl}мл
                                        </span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="flex items-center gap-2"><Moon size={14} className="text-indigo-400"/> Сон</span>
                                        <span className="text-slate-300">
                                            {selectedDayLog.detailedStats.habits.sleepStart || '--'} - {selectedDayLog.detailedStats.habits.sleepEnd || '--'}
                                        </span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="flex items-center gap-2"><Dumbbell size={14} className="text-purple-400"/> Тренировка</span>
                                        <span className={selectedDayLog.detailedStats.habits.gymWorkout ? "text-neon-green" : "text-slate-500"}>
                                            {selectedDayLog.detailedStats.habits.gymWorkout ? "Да" : "Нет"}
                                        </span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Омега-3</span>
                                        <span>{selectedDayLog.detailedStats.habits.omega3}/{OMEGA_3_TARGET}</span>
                                    </li>
                                </ul>

                                {/* Custom Habits History */}
                                {selectedDayLog.detailedStats.habits.customHabits && selectedDayLog.detailedStats.habits.customHabits.length > 0 && (
                                    <div className="mt-4 pt-2 border-t border-slate-700">
                                        <h5 className="text-[10px] text-slate-500 uppercase mb-2">Доп. цели</h5>
                                        {selectedDayLog.detailedStats.habits.customHabits.map((h, i) => (
                                            <div key={i} className="flex justify-between text-xs py-1">
                                                <span>{h.name}</span>
                                                {h.completed ? <Check size={14} className="text-neon-green"/> : <X size={14} className="text-slate-600"/>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};