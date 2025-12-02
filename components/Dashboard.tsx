import React, { useMemo } from 'react';
import { Target, Scale } from 'lucide-react';
import { UserProfile, DayLog } from '../types';

interface DashboardProps {
  complianceScore: number;
  userProfile: UserProfile;
  history: DayLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ complianceScore, userProfile, history }) => {
  const { startDate, targetDate, currentWeight, startWeight, heightCm } = userProfile;

  const dateCalculations = useMemo(() => {
    const start = new Date(startDate);
    const target = new Date(targetDate);
    const today = new Date();
    
    // Normalize times
    start.setHours(0,0,0,0);
    target.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const totalDuration = Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDuration) * 100));

    return { totalDuration, daysPassed, daysLeft, progress };
  }, [startDate, targetDate]);

  const weightChange = startWeight - currentWeight;
  const bmi = (currentWeight / ((heightCm / 100) ** 2)).toFixed(1);

  // Generate sparkline path data
  const sparklinePath = useMemo(() => {
    if (history.length < 2) return '';
    
    // Get last 7 entries or all if less
    const sortedHistory = [...history].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dataPoints = sortedHistory.map(h => h.weight);
    // Add current weight as last point
    dataPoints.push(currentWeight);
    
    const maxVal = Math.max(...dataPoints);
    const minVal = Math.min(...dataPoints);
    const range = maxVal - minVal || 1; // avoid divide by zero
    
    const width = 100;
    const height = 30;
    const step = width / (dataPoints.length - 1);

    return dataPoints.map((val, i) => {
        const x = i * step;
        const normalizedVal = (val - minVal) / range;
        const y = height - (normalizedVal * height); // invert Y for SVG
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');
  }, [history, currentWeight]);

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      
      {/* Days Left / Progress */}
      <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
         <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest">День {Math.max(1, dateCalculations.daysPassed)} из {dateCalculations.totalDuration}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white font-mono">{Math.max(0, dateCalculations.daysLeft)}</span>
                <span className="text-xs text-slate-500 font-bold uppercase">дней осталось</span>
              </div>
            </div>
            <div className="text-right">
               <div className="text-xs text-neon-blue font-mono">{Math.round(dateCalculations.progress)}% ЗАВЕРШЕНО</div>
            </div>
         </div>
         <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-neon-blue to-neon-purple h-full transition-all duration-1000" 
              style={{width: `${dateCalculations.progress}%`}} 
            />
         </div>
      </div>

      {/* Compliance Score */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1.5 opacity-10">
          <Target size={40} className="text-neon-green" />
        </div>
        <h3 className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-1">Режим</h3>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black font-mono ${complianceScore > 80 ? 'text-neon-green' : 'text-yellow-500'}`}>
            {complianceScore}%
          </span>
        </div>
      </div>

      {/* Weight / Stats */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1.5 opacity-10">
          <Scale size={40} className="text-neon-red" />
        </div>
        <h3 className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-1">Вес ({currentWeight}кг)</h3>
        <div className="flex items-center gap-2 relative z-10">
          <span className="text-xl font-bold text-white font-mono">{weightChange > 0 ? '-' : '+'}{Math.abs(weightChange).toFixed(1)}</span>
           <span className="text-[10px] text-slate-500 bg-slate-800 px-1 rounded">BMI: {bmi}</span>
        </div>
        
        {/* Tiny Graph */}
        {sparklinePath && (
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d={sparklinePath} fill="none" stroke="#ff003c" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
            </div>
        )}
      </div>
    </div>
  );
};