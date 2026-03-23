import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Check, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Goal, AppSettings } from '../types';
import { getMonthName, getTodayISO } from '../utils/dateHelpers';
import { t } from '../utils/translations';

interface EditGoalHistoryScreenProps {
  goal: Goal;
  settings: AppSettings;
  onBack: () => void;
  onToggleDay: (goalId: string, dateISO: string, isFailure?: boolean) => void;
}

export const EditGoalHistoryScreen = ({ goal, settings, onBack, onToggleDay }: EditGoalHistoryScreenProps) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const lang = settings.language || 'en';

  return (
    <motion.div 
      initial={{ x: lang === 'he' ? '-100%' : '100%' }}
      animate={{ x: 0 }}
      exit={{ x: lang === 'he' ? '-100%' : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-[var(--bg-main)] z-[70] flex flex-col"
    >
      <header className="pt-12 px-6 pb-6 border-b border-[var(--border-main)] flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
          <ChevronLeft size={24} className={lang === 'he' ? 'rotate-180' : ''} />
        </button>
        <div>
          <h1 className="text-xl font-bold font-heading">{t('editHistory', lang)}</h1>
          <p className="text-[var(--text-muted)] text-xs truncate max-w-[200px]">{goal.title}</p>
        </div>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto pb-safe">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-4 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">{t('monthNames', lang)[currentMonth]} {currentYear}</h2>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                <ChevronLeft size={20} className={lang === 'he' ? 'rotate-180' : ''} />
              </button>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                <ChevronRight size={20} className={lang === 'he' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(t('dow', lang) as string[]).map((d, index) => (
              <div key={`dow-${index}`} className="text-center text-[10px] font-bold text-[var(--text-subtle)] py-2">{d}</div>
            ))}
            {padding.map(i => <div key={`p-${i}`} />)}
            {days.map(d => {
              const date = new Date(currentYear, currentMonth, d);
              const iso = date.toISOString().split('T')[0];
              const isToday = iso === getTodayISO();
              const todayCompletions = goal.completions.filter(c => c === iso).length;
              const isCompleted = todayCompletions >= goal.targetValue;
              const isFailed = goal.failures?.includes(iso);
              
              return (
                <div key={d} className="aspect-square flex flex-col items-center justify-center relative">
                  <button 
                    onClick={() => onToggleDay(goal.id, iso)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all relative ${
                      isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--bg-main)]' : ''
                    } ${
                      isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                      isFailed ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                      'bg-[var(--bg-main)] text-[#475569] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {d}
                    {isCompleted && <Check size={10} className="absolute top-1 right-1" strokeWidth={3} />}
                    {isFailed && <X size={10} className="absolute top-1 right-1" strokeWidth={3} />}
                  </button>
                  {goal.type === 'binary' && !isCompleted && !isFailed && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDay(goal.id, iso, true);
                      }}
                      className="absolute -bottom-1 text-[8px] text-red-500/50 hover:text-red-500 font-bold uppercase"
                    >
                      {t('failed', lang)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-200 text-xs leading-relaxed">
            <span className="font-bold">{t('tip', lang)}</span> {t('tipDesc', lang)}
          </p>
        </div>
      </main>
    </motion.div>
  );
};
