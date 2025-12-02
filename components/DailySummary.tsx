import React from 'react';
import { Macros } from '../types';
import { DAILY_GOALS } from '../constants';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface DailySummaryProps {
  currentMacros: Macros;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ currentMacros }) => {
  const caloriesLeft = DAILY_GOALS.calories - currentMacros.calories;
  const proteinLeft = DAILY_GOALS.protein - currentMacros.protein;
  const fatLeft = DAILY_GOALS.fat - currentMacros.fat;

  let message = "";
  let type: 'success' | 'warning' | 'danger' = 'success';

  if (currentMacros.fat > DAILY_GOALS.fat + 5) {
    message = "КРИТИЧЕСКИ: Лимит жиров превышен. Немедленно прекратите потребление жиров.";
    type = 'danger';
  } else if (caloriesLeft < 0) {
    message = "Профицит калорий обнаружен. Увеличьте активность.";
    type = 'danger';
  } else if (proteinLeft > 50 && caloriesLeft < 300) {
    message = "Дефицит белка слишком велик для оставшихся калорий. Ешьте яичные белки или изолят.";
    type = 'warning';
  } else if (proteinLeft > 0) {
    message = `У вас осталось ${Math.round(caloriesLeft)} ккал. Сосредоточьтесь на источниках постного белка.`;
    type = 'success';
  } else {
    message = "Отличное соблюдение режима. Макросы сбалансированы.";
    type = 'success';
  }

  const borderClass = type === 'danger' ? 'border-neon-red/50 bg-neon-red/5' : type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-neon-blue/50 bg-neon-blue/5';
  const textClass = type === 'danger' ? 'text-neon-red' : type === 'warning' ? 'text-yellow-500' : 'text-neon-blue';

  return (
    <div className={`p-4 rounded-xl border ${borderClass} mt-6 flex gap-3 items-start`}>
      <div className={`mt-0.5 ${textClass}`}>
        {type === 'danger' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
      </div>
      <div>
        <h4 className={`text-sm font-bold uppercase ${textClass} mb-1`}>Совет тренера</h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};