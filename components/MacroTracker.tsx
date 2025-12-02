import React, { useState, useRef } from 'react';
import { Macros, FoodEntry } from '../types';
import { DAILY_GOALS } from '../constants';
import { ProgressBar } from './ui/ProgressBar';
import { analyzeFoodInput, analyzeFoodWithImage } from '../services/geminiService';
import { Loader2, Plus, Trash2, Camera, X, ScanEye, Sparkles, BrainCircuit } from 'lucide-react';

interface MacroTrackerProps {
  currentMacros: Macros;
  entries: FoodEntry[];
  onAddEntry: (entry: FoodEntry) => void;
  onRemoveEntry: (id: string) => void;
}

export const MacroTracker: React.FC<MacroTrackerProps> = ({ 
  currentMacros, 
  entries, 
  onAddEntry,
  onRemoveEntry
}) => {
  const [input, setInput] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null); // 'Uploading', 'Analyzing', 'Finalizing'
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogFood = async () => {
    if (!input.trim() && !selectedImage) return;

    let result;
    
    try {
      if (selectedImage) {
        setAnalysisStatus("Скнирование нейросетью...");
        // Artificial delay for UX perception of "scanning"
        await new Promise(r => setTimeout(r, 600)); 
        setAnalysisStatus("Определение состава...");
        result = await analyzeFoodWithImage(selectedImage, input);
      } else {
        setAnalysisStatus("Анализ текста...");
        result = await analyzeFoodInput(input);
      }
      
      setAnalysisStatus("Финализация...");
      
      if (result) {
        onAddEntry({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          name: result.name,
          macros: {
              calories: result.calories,
              protein: result.protein,
              fat: result.fat,
              carbs: result.carbs
          },
          micronutrients: result.micronutrients,
          notes: result.notes
        });
        setInput('');
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error logging food", error);
      alert("Ошибка анализа. Попробуйте снова.");
    } finally {
      setAnalysisStatus(null);
    }
  };

  return (
    <div className="mb-6">
      {/* Bars */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 shadow-xl relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neon-blue via-transparent to-transparent"></div>
        
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
          <span className="w-2 h-6 bg-neon-blue rounded-full"></span>
          Макронутриенты
        </h2>
        
        <ProgressBar 
          current={currentMacros.protein} 
          max={DAILY_GOALS.protein} 
          label="Белок (Важно)" 
          colorClass="bg-neon-blue shadow-neon-blue" 
          unit="г"
          minimumThreshold={true} // Warning if too low
        />
        <ProgressBar 
          current={currentMacros.fat} 
          max={DAILY_GOALS.fat} 
          label="Жиры (Лимит)" 
          colorClass="bg-neon-red shadow-neon-red" 
          unit="г"
          warningThreshold={true} // Warning if too high
        />
        <ProgressBar 
          current={currentMacros.carbs} 
          max={DAILY_GOALS.carbs} 
          label="Углеводы" 
          colorClass="bg-neon-green shadow-neon-green" 
          unit="г"
          warningThreshold={true}
        />
        <ProgressBar 
          current={currentMacros.calories} 
          max={DAILY_GOALS.calories} 
          label="Калории" 
          colorClass="bg-white" 
          unit="ккал"
          warningThreshold={true}
        />
      </div>

      {/* Input */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 relative">
        <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wide flex justify-between">
          <span>Умный дневник питания</span>
          <span className="text-neon-blue flex items-center gap-1"><Sparkles size={10} /> AI Powered</span>
        </label>
        
        {selectedImage && (
          <div className="mb-3 relative inline-block group">
            <img src={selectedImage} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-slate-700 shadow-lg" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 shadow-md transition-transform hover:scale-110"
            >
              <X size={12} />
            </button>
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-neon-blue/50 pointer-events-none"></div>
          </div>
        )}

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!!analysisStatus}
            placeholder={selectedImage ? "Добавьте комментарий для точности..." : "Например: 200г грудки индейки и огурец..."}
            className={`w-full bg-slate-950 text-white p-3 pr-24 rounded-lg border focus:ring-1 outline-none resize-none text-sm min-h-[80px] transition-all ${
              analysisStatus 
                ? 'border-neon-blue/50 opacity-50' 
                : 'border-slate-700 focus:border-neon-blue focus:ring-neon-blue'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleLogFood();
              }
            }}
          />
          
          {/* Analysis Overlay */}
          {analysisStatus && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-[2px] rounded-lg">
                <div className="flex items-center gap-2 text-neon-blue mb-1">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-mono text-sm font-bold uppercase tracking-wider">{analysisStatus}</span>
                </div>
                <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue animate-progress-indeterminate"></div>
                </div>
            </div>
          )}
          
          <div className="absolute bottom-3 right-3 flex gap-2">
             <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!!analysisStatus}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
              title="Добавить фото"
            >
              <Camera size={20} />
            </button>

            <button
              onClick={handleLogFood}
              disabled={!!analysisStatus || (!input.trim() && !selectedImage)}
              className={`p-2 rounded-lg transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                input.trim() || selectedImage 
                  ? 'bg-neon-blue/10 border-neon-blue text-neon-blue hover:bg-neon-blue/20 shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {selectedImage ? <ScanEye size={20} /> : <Plus size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 pl-1 flex items-center gap-2">
            История <span className="w-full h-px bg-slate-800 block"></span>
          </h3>
          {entries.slice().reverse().map(entry => (
            <div key={entry.id} className="bg-slate-900/50 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors group relative overflow-hidden">
              <div className="p-3 flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-200">{entry.name}</p>
                    {entry.micronutrients && entry.micronutrients.length > 0 && (
                        <div className="flex gap-1">
                            {entry.micronutrients.slice(0, 2).map((micro, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                    {micro}
                                </span>
                            ))}
                        </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-400">
                     <span className="text-white font-bold">{Math.round(entry.macros.calories)} ккал</span>
                     <span>|</span>
                     <span className="text-neon-blue">{Math.round(entry.macros.protein)}б</span>
                     <span className="text-neon-red">{Math.round(entry.macros.fat)}ж</span>
                     <span className="text-neon-green">{Math.round(entry.macros.carbs)}у</span>
                  </div>

                  {entry.notes && (
                      <p className="mt-2 text-[10px] text-slate-500 italic border-l-2 border-slate-700 pl-2">
                          "{entry.notes}"
                      </p>
                  )}
                </div>
                <button 
                  onClick={() => onRemoveEntry(entry.id)}
                  className="text-slate-600 hover:text-neon-red transition-colors p-2 -mr-2 -mt-2 opacity-50 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {/* Background accent for AI entries */}
              {(entry.micronutrients || entry.notes) && (
                  <div className="absolute top-0 right-0 p-1 opacity-10 text-neon-blue">
                      <BrainCircuit size={40} />
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};