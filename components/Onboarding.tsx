import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Activity, ArrowRight, Target, Calendar, Ruler, Scale, User, Users } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultTarget = new Date();
  defaultTarget.setDate(defaultTarget.getDate() + 60); // Default 60 days
  const targetStr = defaultTarget.toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    startDate: today,
    targetDate: targetStr,
    heightCm: '' as any, 
    startWeight: '' as any,
    currentWeight: '' as any,
    targetWeight: '' as any,
    age: '' as any,
    gender: 'male'
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    let finalValue = value;
    if (field === 'startWeight') {
       // Sync start and current weight initially
       setFormData(prev => ({ ...prev, startWeight: value, currentWeight: value }));
       return;
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.heightCm || !formData.startWeight || !formData.targetWeight || !formData.age) return;
    
    onComplete({
        startDate: formData.startDate!,
        targetDate: formData.targetDate!,
        heightCm: Number(formData.heightCm),
        startWeight: Number(formData.startWeight),
        currentWeight: Number(formData.startWeight),
        targetWeight: Number(formData.targetWeight),
        age: Number(formData.age),
        gender: formData.gender as 'male' | 'female'
    });
  };

  const isFormValid = formData.heightCm && formData.startWeight && formData.targetWeight && formData.age;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red"></div>

        <div className="p-8 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4 shadow-neon-blue border border-slate-700">
              <Activity className="text-neon-blue w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter mb-2">
              PSMF<span className="text-neon-blue">PRO</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Инициализация протокола
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Calendar size={10} /> Старт
                </label>
                <input 
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 text-sm focus:border-neon-blue outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Target size={10} /> Финал
                </label>
                <input 
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => handleChange('targetDate', e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 text-sm focus:border-neon-blue outline-none transition-colors"
                />
              </div>
            </div>

            {/* Personal Stats */}
            <div className="grid grid-cols-3 gap-3">
               <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                    <User size={10} /> Возраст
                  </label>
                  <input 
                    type="number"
                    required
                    min="16"
                    max="99"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 text-sm focus:border-neon-blue outline-none transition-colors"
                  />
               </div>
               <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                    <Users size={10} /> Пол
                  </label>
                  <div className="flex bg-slate-950 rounded-lg border border-slate-700 p-1">
                     <button
                        type="button"
                        onClick={() => handleChange('gender', 'male')}
                        className={`flex-1 text-xs py-1.5 rounded transition-colors ${formData.gender === 'male' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500'}`}
                     >
                        М
                     </button>
                     <button
                        type="button"
                        onClick={() => handleChange('gender', 'female')}
                        className={`flex-1 text-xs py-1.5 rounded transition-colors ${formData.gender === 'female' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500'}`}
                     >
                        Ж
                     </button>
                  </div>
               </div>
            </div>

            {/* Height */}
            <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Ruler size={10} /> Рост (см)
                </label>
                <input 
                  type="number"
                  placeholder="180"
                  required
                  min="100"
                  max="250"
                  value={formData.heightCm}
                  onChange={(e) => handleChange('heightCm', e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 text-sm focus:border-neon-blue outline-none transition-colors placeholder:text-slate-700"
                />
            </div>

            {/* Weights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Scale size={10} /> Текущий Вес
                </label>
                <input 
                  type="number"
                  placeholder="90.5"
                  required
                  step="0.1"
                  value={formData.startWeight}
                  onChange={(e) => handleChange('startWeight', e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 text-sm focus:border-neon-blue outline-none transition-colors placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neon-green uppercase flex items-center gap-1">
                  <Target size={10} /> Цель Вес
                </label>
                <input 
                  type="number"
                  placeholder="80.0"
                  required
                  step="0.1"
                  value={formData.targetWeight}
                  onChange={(e) => handleChange('targetWeight', e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 text-sm focus:border-neon-green outline-none transition-colors placeholder:text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={!isFormValid}
              className={`w-full mt-4 group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                isFormValid 
                  ? 'bg-neon-blue hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)]' 
                  : 'bg-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2 font-black text-slate-950 uppercase tracking-widest">
                <span>Запустить Систему</span>
                <ArrowRight size={18} className={`transition-transform duration-300 ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};