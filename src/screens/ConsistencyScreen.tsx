import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, AppSettings } from '../types';
import { getTodayISO, getMonthName } from '../utils/dateHelpers';
import { calculateStreak } from '../utils/streakCalculations';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { t } from '../utils/translations';

interface ConsistencyScreenProps {
  goals: Goal[];
  settings: AppSettings;
}

export const ConsistencyScreen = ({ goals, settings }: ConsistencyScreenProps) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedGoalId, setSelectedGoalId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  useModalBackHandler(!!selectedDate, () => setSelectedDate(null), 'day-details');
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const activeGoals = useMemo(() => goals.filter(g => !g.isSuspended), [goals]);
  const displayGoals = useMemo(() => selectedGoalId === 'all' ? activeGoals : activeGoals.filter(g => g.id === selectedGoalId), [activeGoals, selectedGoalId]);

  const monthData = useMemo(() => {
    const data: Record<string, { completed: number, total: number, failed: boolean }> = {};
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const iso = date.toISOString().split('T')[0];
      
      let completedCount = 0;
      let hasFailure = false;
      
      displayGoals.forEach(g => {
        const todayCompletions = g.completions.filter(c => c === iso).length;
        if (todayCompletions >= g.targetValue) completedCount++;
        
        if (g.type === 'binary' && g.failures?.includes(iso)) {
          hasFailure = true;
        }
      });
      
      data[iso] = { 
        completed: completedCount, 
        total: displayGoals.length,
        failed: hasFailure
      };
    }
    return data;
  }, [displayGoals, currentMonth, currentYear, daysInMonth]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const dayDetails = useMemo(() => {
    if (!selectedDate) return null;
    
    const completed: Goal[] = [];
    const failed: Goal[] = [];
    const notDone: Goal[] = [];
    
    displayGoals.forEach(g => {
      const completions = g.completions.filter(c => c === selectedDate).length;
      if (completions >= g.targetValue) {
        completed.push(g);
      } else if (g.type === 'binary' && g.failures?.includes(selectedDate)) {
        failed.push(g);
      } else {
        notDone.push(g);
      }
    });
    
    return { completed, failed, notDone };
  }, [selectedDate, displayGoals]);

  const lang = settings.language || 'en';

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] text-[var(--text-main)]">
      <header className="pt-12 px-6 pb-6 border-b border-[var(--border-main)]">
        <h1 className="text-2xl font-bold font-heading">{t('consistency', lang)}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t('trackOverall', lang)}</p>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto pb-6">
        <div className="mb-6 relative z-10">
          <select 
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl p-3 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: lang === 'he' ? 'left 12px center' : 'right 12px center', backgroundSize: '16px' }}
          >
            <option value="all">{t('allGoalsOverview', lang)}</option>
            {activeGoals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-4 mb-6 relative z-10">
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
              const dayData = monthData[iso];
              const isToday = iso === getTodayISO();
              
              const rate = dayData?.total > 0 ? dayData.completed / dayData.total : 0;
              const isSpecificGoal = selectedGoalId !== 'all';
              
              const isCompleted = isSpecificGoal && rate === 1;
              const isFailed = isSpecificGoal && dayData?.failed;
              
              return (
                <div key={d} className="aspect-square flex flex-col items-center justify-center relative">
                  <button 
                    onClick={() => setSelectedDate(iso)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all relative cursor-pointer ${
                      isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--bg-main)]' : ''
                    } ${
                      isSpecificGoal ? (
                        isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                        isFailed ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                        'bg-[var(--bg-main)] text-[#475569] hover:bg-[var(--bg-card-hover)]'
                      ) : (
                        rate === 1 ? 'bg-emerald-500 text-white' : 
                        rate > 0.5 ? 'bg-emerald-500/40 text-emerald-100' :
                        rate > 0 ? 'bg-emerald-500/10 text-emerald-200' :
                        'bg-[var(--bg-main)] text-[#475569] hover:bg-[var(--bg-card-hover)]'
                      )
                    }`}
                  >
                    {d}
                    {isCompleted && <Check size={10} className="absolute top-1 right-1" strokeWidth={3} />}
                    {isFailed && <X size={10} className="absolute top-1 right-1" strokeWidth={3} />}
                  </button>
                  {!isSpecificGoal && dayData?.failed && (
                    <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('goalStreaks', lang)}</h3>
          {displayGoals.map(goal => {
            const stats = calculateStreak(goal, settings);
            return (
              <div key={goal.id} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 flex justify-between items-center">
                <div className="flex-1 truncate me-4">
                  <p className="text-[var(--text-main)] font-medium truncate">{goal.title}</p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{goal.frequency === 'Daily' ? t('daily', lang) : t('weekly', lang)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-500 dark:text-blue-400 leading-none">{stats.current}</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold mt-1">{t('streak', lang)}</p>
                  </div>
                  <div className="w-px h-8 bg-[var(--bg-card-hover)] mx-2" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400 leading-none">{stats.best}</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold mt-1">{t('best', lang)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {selectedDate && dayDetails && (
          <div className="fixed inset-0 z-[80] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-[var(--bg-main)] rounded-t-3xl border-t border-[var(--border-main)] flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-[var(--bg-card-hover)] rounded-full" />
              </div>
              
              <div className="px-6 pb-4 flex justify-between items-center border-b border-[var(--bg-card)]">
                <div>
                  <h2 className="text-xl font-bold font-heading">
                    {new Date(selectedDate).toLocaleDateString(lang === 'he' ? 'he-IL' : undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  <p className="text-[var(--text-muted)] text-sm">
                    {selectedGoalId === 'all' ? t('allGoalsOverview', lang) : displayGoals[0]?.title}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="p-2 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {dayDetails.completed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Check size={16} /> {t('completed', lang)}
                    </h3>
                    <div className="space-y-2">
                      {dayDetails.completed.map(g => (
                        <div key={g.id} className="bg-[var(--bg-card)] p-3 rounded-xl border border-emerald-500/20">
                          <p className="font-medium">{g.title}</p>
                          {g.type === 'numeric' && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">{t('target', lang)}: {g.targetValue}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dayDetails.failed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <X size={16} /> {t('failed', lang)}
                    </h3>
                    <div className="space-y-2">
                      {dayDetails.failed.map(g => (
                        <div key={g.id} className="bg-[var(--bg-card)] p-3 rounded-xl border border-red-500/20">
                          <p className="font-medium">{g.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dayDetails.notDone.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#475569]" /> {t('notDone', lang)}
                    </h3>
                    <div className="space-y-2">
                      {dayDetails.notDone.map(g => {
                        const completions = g.completions.filter(c => c === selectedDate).length;
                        return (
                          <div key={g.id} className="bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-main)]">
                            <p className="font-medium text-[var(--text-muted)]">{g.title}</p>
                            {g.type === 'numeric' && completions > 0 && (
                              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">{t('progress', lang)}: {completions} / {g.targetValue}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {dayDetails.completed.length === 0 && dayDetails.failed.length === 0 && dayDetails.notDone.length === 0 && (
                  <p className="text-center text-[var(--text-muted)] py-4">{t('noGoals', lang)}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
