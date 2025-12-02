import React, { useState, useEffect } from 'react';
import { Pill, Droplets, Footprints, Dumbbell, Check, Plus, Moon, Clock, X, ListPlus } from 'lucide-react';
import { HabitState, CustomHabit } from '../types';
import { OMEGA_3_TARGET, WATER_GOAL_ML } from '../constants';

interface HabitStackProps {
  habits: HabitState;
  onUpdate: (newHabits: HabitState) => void;
}

export const HabitStack: React.FC<HabitStackProps> = ({ habits, onUpdate }) => {
  const [newHabitName, setNewHabitName] = useState('');
  
  // Calculate sleep duration
  const getSleepDuration = () => {
    if (!habits.sleepStart || !habits.sleepEnd) return 0;
    
    // Create dummy dates
    const start = new Date(`2000-01-01T${habits.sleepStart}`);
    let end = new Date(`2000-01-01T${habits.sleepEnd}`);
    
    // Handle overnight
    if (end < start) {
      end = new Date(`2000-01-02T${habits.sleepEnd}`);
    }
    
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const sleepDuration = getSleepDuration();
  const sleepQuality = sleepDuration >= 7 && sleepDuration <= 9 ? 'optimal' : 'suboptimal';

  const toggleOmega = (index: number) => {
    const newValue = index + 1 === habits.omega3 ? index : index + 1;
    onUpdate({ ...habits, omega3: newValue });
  };

  const addWater = () => {
    onUpdate({ ...habits, waterIntakeMl: Math.min(habits.waterIntakeMl + 250, 5000) });
  };

  const handleAddCustomHabit = () => {
    if(!newHabitName.trim()) return;
    const newHabit: CustomHabit = {
        id: crypto.randomUUID(),
        name: newHabitName.trim(),
        completed: false
    };
    onUpdate({ 
        ...habits, 
        customHabits: [...(habits.customHabits || []), newHabit] 
    });
    setNewHabitName('');
  };

  const toggleCustomHabit = (id: string) => {
      const updated = (habits.customHabits || []).map(h => 
          h.id === id ? { ...h, completed: !h.completed } : h
      );
      onUpdate({ ...habits, customHabits: updated });
  };

  const removeCustomHabit = (id: string) => {
      const updated = (habits.customHabits || []).filter(h => h.id !== id);
      onUpdate({ ...habits, customHabits: updated });
  };

  return (
    <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
        Ежедневный протокол
      </h3>

      {/* Sleep Tracker */}
      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 mb-2">
         <div className="flex items-center gap-2 mb-3">
             <div className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
                <Moon size={16} />
             </div>
             <span className="text-sm font-medium text-slate-200">Режим сна</span>
             {sleepDuration > 0 && (
                 <span className={`ml-auto text-xs font-mono font-bold ${sleepQuality === 'optimal' ? 'text-neon-green' : 'text-yellow-500'}`}>
                     {sleepDuration.toFixed(1)}ч
                 </span>
             )}
         </div>
         <div className="flex items-center gap-2">
            <div className="flex-1 relative">
                <span className="absolute top-1 left-2 text-[8px] text-slate-500 uppercase font-mono">Отбой</span>
                <input 
                    type="time" 
                    value={habits.sleepStart || ''}
                    onChange={(e) => onUpdate({...habits, sleepStart: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pt-3 pb-1 px-2 text-white text-sm outline-none focus:border-indigo-500"
                />
            </div>
            <span className="text-slate-600">-</span>
            <div className="flex-1 relative">
                <span className="absolute top-1 left-2 text-[8px] text-slate-500 uppercase font-mono">Подъем</span>
                <input 
                    type="time" 
                    value={habits.sleepEnd || ''}
                    onChange={(e) => onUpdate({...habits, sleepEnd: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pt-3 pb-1 px-2 text-white text-sm outline-none focus:border-indigo-500"
                />
            </div>
         </div>
         <p className="text-[9px] text-slate-500 mt-2 text-center">
            Цель: 7.0 - 9.0 часов. Сейчас: {sleepQuality === 'optimal' ? 'Норма' : 'Отклонение'}
         </p>
      </div>

      <div className="h-px bg-slate-800/50 my-2"></div>

      {/* Omega 3 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-yellow-400">
            <Pill size={18} />
          </div>
          <span className="text-sm font-medium text-slate-200">Омега-3</span>
        </div>
        <div className="flex gap-1">
          {[...Array(OMEGA_3_TARGET)].map((_, i) => (
            <button
              key={i}
              onClick={() => toggleOmega(i)}
              className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all ${
                i < habits.omega3
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                  : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}
            >
              <Pill size={12} className={i < habits.omega3 ? "fill-current" : ""} />
            </button>
          ))}
        </div>
      </div>

      {/* Multivitamin */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-green-400">
            <Pill size={18} />
          </div>
          <span className="text-sm font-medium text-slate-200">Мультивитамины</span>
        </div>
        <button
          onClick={() => onUpdate({ ...habits, multivitamin: !habits.multivitamin })}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            habits.multivitamin
              ? 'bg-neon-green/10 border-neon-green text-neon-green'
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}
        >
          {habits.multivitamin ? 'ПРИНЯТО' : 'НЕТ'}
        </button>
      </div>

      {/* Water */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
            <Droplets size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">Вода</span>
            <span className="text-xs text-slate-500">{habits.waterIntakeMl} / {WATER_GOAL_ML}мл</span>
          </div>
        </div>
        <button
          onClick={addWater}
          className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 active:scale-95 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (habits.waterIntakeMl / WATER_GOAL_ML) * 100)}%` }}></div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-orange-400">
            <Footprints size={18} />
          </div>
          <span className="text-sm font-medium text-slate-200">Шаги</span>
        </div>
        <input
          type="number"
          value={habits.steps || ''}
          placeholder="0"
          onChange={(e) => onUpdate({ ...habits, steps: parseInt(e.target.value) || 0 })}
          className="w-20 bg-slate-950 border border-slate-700 rounded-md py-1 px-2 text-right text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Gym */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-neon-purple">
            <Dumbbell size={18} />
          </div>
          <span className="text-sm font-medium text-slate-200">Тренировка</span>
        </div>
        <button
          onClick={() => onUpdate({ ...habits, gymWorkout: !habits.gymWorkout })}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            habits.gymWorkout
              ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.3)]'
              : 'bg-slate-800 border-slate-700 text-slate-600'
          }`}
        >
          <Check size={20} />
        </button>
      </div>

      <div className="h-px bg-slate-800/50 my-2"></div>
      
      {/* Custom Habits */}
      <div>
         <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <ListPlus size={12} /> Доп. Привычки
            </h4>
         </div>
         
         <div className="space-y-2 mb-3">
            {habits.customHabits && habits.customHabits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors group">
                    <div className="flex items-center gap-3">
                         <button
                            onClick={() => toggleCustomHabit(habit.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                habit.completed
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500'
                                : 'bg-slate-800 border-slate-700 text-slate-600'
                            }`}
                         >
                             {habit.completed && <Check size={12} />}
                         </button>
                         <span className={`text-sm ${habit.completed ? 'text-slate-400 line-through' : 'text-slate-300'}`}>
                             {habit.name}
                         </span>
                    </div>
                    <button 
                        onClick={() => removeCustomHabit(habit.id)}
                        className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
         </div>

         <div className="flex gap-2">
             <input 
                type="text" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Новая привычка..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomHabit()}
             />
             <button 
                onClick={handleAddCustomHabit}
                disabled={!newHabitName.trim()}
                className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
             >
                 <Plus size={14} />
             </button>
         </div>
      </div>

    </div>
  );
};