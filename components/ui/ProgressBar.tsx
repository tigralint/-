import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  colorClass: string;
  unit: string;
  warningThreshold?: boolean; // If true, exceeding max is bad (turns red)
  minimumThreshold?: boolean; // If true, being under max is bad (yellow)
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  max, 
  label, 
  colorClass, 
  unit,
  warningThreshold = false,
  minimumThreshold = false
}) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  let barColor = colorClass;
  let statusTextClass = "text-slate-400";

  // Logic for PSMF: 
  // Fat/Carbs: Exceeding is bad (Red)
  // Protein: Being under is bad (Yellow), hitting goal is good (Blue/Green)
  
  if (warningThreshold && current > max) {
    barColor = "bg-neon-red shadow-neon-red";
    statusTextClass = "text-neon-red font-bold";
  } else if (minimumThreshold && current < max * 0.9) {
    // Under 90% of protein goal
    barColor = "bg-yellow-500 shadow-none"; 
  }

  return (
    <div className="mb-4 group">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
          {label}
        </span>
        <span className={`text-xs font-mono ${statusTextClass}`}>
          {Math.round(current)} / {max}{unit}
        </span>
      </div>
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${barColor}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};