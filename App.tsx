import React, { useState, useMemo, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { MacroTracker } from './components/MacroTracker';
import { HabitStack } from './components/HabitStack';
import { DailySummary } from './components/DailySummary';
import { HistoryCalendar } from './components/HistoryCalendar';
import { Onboarding } from './components/Onboarding';
import { FoodEntry, HabitState, Macros, UserProfile, DayLog } from './types';
import { DAILY_GOALS, STEPS_GOAL, WATER_GOAL_ML, OMEGA_3_TARGET } from './constants';
import { Activity, Settings, CalendarDays, X, Save, Trash2, LogOut } from 'lucide-react';

const STORAGE_KEY = 'psmf_app_data_v3'; // Bump version

const App: React.FC = () => {
  // --- Initial State Loaders ---
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load data", e);
    }
    return null;
  };

  const savedData = loadState();

  // --- User Profile State ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(savedData?.userProfile || null);

  // --- UI State ---
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDayFinishConfirm, setShowDayFinishConfirm] = useState(false);

  // --- Data State ---
  const [entries, setEntries] = useState<FoodEntry[]>(savedData?.entries || []);
  const [habits, setHabits] = useState<HabitState>(savedData?.habits || {
    omega3: 0,
    multivitamin: false,
    waterIntakeMl: 0,
    steps: 0,
    gymWorkout: false,
    sleepStart: '',
    sleepEnd: '',
    customHabits: []
  });
  
  const [history, setHistory] = useState<DayLog[]>(savedData?.history || []);

  // --- Persistence Effect ---
  useEffect(() => {
    if (userProfile) {
      const dataToSave = {
        userProfile,
        entries,
        habits,
        history
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [userProfile, entries, habits, history]);


  // --- Derived State ---
  const currentMacros = useMemo(() => {
    return entries.reduce((acc, entry) => ({
      calories: acc.calories + entry.macros.calories,
      protein: acc.protein + entry.macros.protein,
      fat: acc.fat + entry.macros.fat,
      carbs: acc.carbs + entry.macros.carbs,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 } as Macros);
  }, [entries]);

  // Calculate Compliance Score
  const complianceScore = useMemo(() => {
    let score = 0;
    // Total points expanded for finer granularity
    const totalPoints = 8; 

    // 1. Protein (Must be within 90% of goal)
    if (currentMacros.protein >= DAILY_GOALS.protein * 0.9) score++;
    
    // 2. Fat (Strict limit)
    if (currentMacros.fat <= DAILY_GOALS.fat * 1.1) score++;

    // 3. Calories
    if (currentMacros.calories <= DAILY_GOALS.calories * 1.05) score++;

    // 4. Carbs (Bonus for strictness)
    if (currentMacros.carbs <= DAILY_GOALS.carbs * 1.2) score++;

    // 5. Water
    if (habits.waterIntakeMl >= WATER_GOAL_ML) score++;

    // 6. Steps or Gym (Activity)
    if (habits.steps >= STEPS_GOAL || habits.gymWorkout) score++;

    // 7. Supplements
    if (habits.multivitamin && habits.omega3 >= OMEGA_3_TARGET) score++;

    // 8. Sleep (7-9 hours)
    if (habits.sleepStart && habits.sleepEnd) {
         // rough calculation again for score
         const start = new Date(`2000-01-01T${habits.sleepStart}`);
         let end = new Date(`2000-01-01T${habits.sleepEnd}`);
         if (end < start) end = new Date(`2000-01-02T${habits.sleepEnd}`);
         const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
         if (hours >= 7 && hours <= 9) score++;
    }

    // Optional: Custom Habits bonus? No, let's keep it to core protocol for the score.

    return Math.round((score / totalPoints) * 100);
  }, [currentMacros, habits]);

  // --- Handlers ---
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setEntries([]);
    setHabits({ 
        omega3: 0, 
        multivitamin: false, 
        waterIntakeMl: 0, 
        steps: 0, 
        gymWorkout: false,
        sleepStart: '',
        sleepEnd: '',
        customHabits: []
    });
    setHistory([]);
  };

  const addEntry = (entry: FoodEntry) => {
    setEntries(prev => [...prev, entry]);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
      setUserProfile(prev => prev ? ({...prev, [field]: value}) : null);
  };
  
  const resetData = () => {
      if(confirm('Вы уверены? Это удалит все данные приложения и вернет экран настройки.')) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
      }
  };

  const handleFinishDay = () => {
    if (!userProfile) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newHistory = history.filter(h => h.date !== todayStr);
    
    let status: 'perfect' | 'good' | 'bad' = 'bad';
    if (complianceScore >= 90) status = 'perfect';
    else if (complianceScore >= 60) status = 'good';

    const dayLog: DayLog = {
      date: todayStr,
      score: complianceScore,
      weight: userProfile.currentWeight,
      status: status,
      detailedStats: {
        macros: currentMacros,
        habits: habits
      }
    };

    setHistory([...newHistory, dayLog]);
    
    // Prepare habits for next day (keep custom habit definitions, reset completion)
    const nextDayHabits: HabitState = {
        omega3: 0,
        multivitamin: false,
        waterIntakeMl: 0,
        steps: 0,
        gymWorkout: false,
        sleepStart: '',
        sleepEnd: '',
        customHabits: (habits.customHabits || []).map(h => ({...h, completed: false}))
    };

    setEntries([]);
    setHabits(nextDayHabits);
    
    setShowDayFinishConfirm(false);
    alert(`День завершен! Оценка: ${complianceScore}%`);
  };

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-neon-blue" />
            <span className="font-mono font-bold text-white tracking-tighter text-lg">
              PSMF<span className="text-neon-blue">PRO</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowHistory(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"
                title="Календарь"
            >
                <CalendarDays size={20} />
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"
                title="Настройки"
            >
                <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        
        <Dashboard 
            complianceScore={complianceScore} 
            userProfile={userProfile} 
            history={history}
        />

        {/* Score explainer hint */}
        {complianceScore < 50 && (
             <p className="text-[10px] text-center text-slate-500 -mt-2">
                Выполняйте цели (белок, вода, шаги, сон), чтобы повысить режим.
             </p>
        )}

        <MacroTracker 
          currentMacros={currentMacros}
          entries={entries}
          onAddEntry={addEntry}
          onRemoveEntry={removeEntry}
        />

        <HabitStack 
          habits={habits}
          onUpdate={setHabits}
        />

        <DailySummary currentMacros={currentMacros} />
        
        <div className="pt-4 pb-8">
          <button 
            onClick={() => setShowDayFinishConfirm(true)}
            className="w-full py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-neon-blue hover:bg-slate-800 transition-all font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
          >
            <LogOut size={18} className="group-hover:text-neon-blue transition-colors" />
            Завершить День
          </button>
        </div>
      </main>

      {/* History Calendar Modal */}
      {showHistory && (
        <HistoryCalendar 
            startDate={userProfile.startDate}
            targetDate={userProfile.targetDate}
            history={history}
            onClose={() => setShowHistory(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl flex flex-col max-h-[90vh] shadow-2xl relative">
            
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Параметры</h2>
                <button 
                    onClick={() => setShowSettings(false)}
                    className="text-slate-500 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              
              {/* User Bio Readonly for now (or editable if needed) */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-500 bg-slate-800/30 p-2 rounded border border-slate-800">
                  <div>Возраст: <span className="text-white">{userProfile.age}</span></div>
                  <div>Пол: <span className="text-white">{userProfile.gender === 'male' ? 'М' : 'Ж'}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase">Дата начала</label>
                    <input 
                    type="date" 
                    value={userProfile.startDate}
                    onChange={(e) => updateProfile('startDate', e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 focus:border-neon-blue outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase">Дата финала</label>
                    <input 
                    type="date" 
                    value={userProfile.targetDate}
                    onChange={(e) => updateProfile('targetDate', e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 focus:border-neon-blue outline-none text-sm"
                    />
                  </div>
              </div>

              <div className="h-px bg-slate-800 my-2"></div>

              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase">Рост (см)</label>
                <input 
                  type="number" 
                  value={userProfile.heightCm}
                  onChange={(e) => updateProfile('heightCm', parseInt(e.target.value))}
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-3 focus:border-neon-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase">Старт Вес</label>
                    <input 
                    type="number" 
                    value={userProfile.startWeight}
                    onChange={(e) => updateProfile('startWeight', parseFloat(e.target.value))}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-3 focus:border-neon-blue outline-none"
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-mono text-neon-green mb-1.5 uppercase">Цель Вес</label>
                    <input 
                    type="number" 
                    value={userProfile.targetWeight}
                    onChange={(e) => updateProfile('targetWeight', parseFloat(e.target.value))}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-3 focus:border-neon-green outline-none"
                    />
                  </div>
              </div>

               <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    <label className="block text-xs font-mono text-neon-blue mb-1.5 uppercase font-bold">Текущий Вес (обновлять тут)</label>
                    <input 
                    type="number" 
                    value={userProfile.currentWeight}
                    onChange={(e) => updateProfile('currentWeight', parseFloat(e.target.value))}
                    className="w-full bg-slate-950 text-white border border-neon-blue rounded-lg p-3 focus:ring-1 focus:ring-neon-blue outline-none font-bold text-lg"
                    />
               </div>
              
              <div className="pt-4">
                  <button onClick={resetData} className="text-xs text-red-500 flex items-center gap-1 hover:text-red-400">
                      <Trash2 size={12} />
                      Сброс всех данных (Рестарт)
                  </button>
              </div>

            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-900 rounded-b-xl">
                <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-neon-blue hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                <Save size={18} />
                Сохранить
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation for Finish Day */}
      {showDayFinishConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl p-6 text-center shadow-2xl">
                <h3 className="text-white text-lg font-bold mb-2">Завершить день?</h3>
                <p className="text-slate-400 text-sm mb-6">Прогресс сохранится. Привычки и счетчики еды сбросятся.</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowDayFinishConfirm(false)}
                        className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={handleFinishDay}
                        className="flex-1 py-2 bg-neon-blue text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                    >
                        Подтвердить
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;