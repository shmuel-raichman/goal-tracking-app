import React, { useMemo } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Edit2, TrendingUp, Award, Clock, History, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Goal, AppSettings } from '../types';
import { getTodayISO, getMonthName } from '../utils/dateHelpers';
import { calculateStreak, getGoalDurationProgress } from '../utils/streakCalculations';
import { getEncouragement } from '../utils/encouragement';
import { t } from '../utils/translations';

interface GoalDetailProps {
  goal: Goal;
  settings: AppSettings;
  onBack: () => void;
  onEditHistory: () => void;
  onToggleGoal: (id: string) => void;
  onToggleFailure: (id: string) => void;
  onToggleBookSide?: (goalId: string, sideId: string) => void;
}

export const GoalDetail = ({ goal, settings, onBack, onEditHistory, onToggleGoal, onToggleFailure, onToggleBookSide }: GoalDetailProps) => {
  const todayISO = getTodayISO();
  const todayCompletions = goal.completions.filter(c => c === todayISO).length;
  const todayFailures = goal.failures?.filter(c => c === todayISO).length || 0;
  const isCompleted = todayCompletions >= goal.targetValue;
  const isFailed = todayFailures > 0;
  
  const stats = calculateStreak(goal, settings);
  const { daysActive, totalDurationDays } = getGoalDurationProgress(goal, stats.total);
  const encouragement = useMemo(() => getEncouragement(), []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const lang = settings.language || 'en';

  return (
    <motion.div 
      initial={{ x: lang === 'he' ? '-100%' : '100%' }}
      animate={{ x: 0 }}
      exit={{ x: lang === 'he' ? '-100%' : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-[var(--bg-main)] z-[60] flex flex-col"
    >
      <header className="pt-12 px-6 pb-6 border-b border-[var(--border-main)] flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
          <ChevronLeft size={24} className={lang === 'he' ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-xl font-bold font-heading truncate flex-1">{goal.title}</h1>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto pb-safe">
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl p-6 mb-8 text-center">
          <p className="text-blue-200 text-sm font-medium mb-2 italic">"{encouragement}"</p>
          <div className="flex justify-center items-baseline gap-2">
            <span className="text-5xl font-bold text-[var(--text-main)]">{stats.current}</span>
            <span className="text-blue-300 font-bold uppercase tracking-widest text-xs">{t('streak', lang)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-500 dark:text-blue-400" />
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('best', lang)}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-main)]">{stats.best}d</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('completed', lang)}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-main)]">{stats.total}</p>
          </div>
        </div>

        {totalDurationDays > 0 && goal.type !== 'book' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500 dark:text-indigo-400" />
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('duration', lang)}</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-main)]">{Math.min(daysActive, totalDurationDays)} / {totalDurationDays} {t('days', lang)}</span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((daysActive / totalDurationDays) * 100, 100)}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
            <p className="text-[10px] text-[var(--text-subtle)] mt-2 text-center uppercase font-bold tracking-widest">
              {totalDurationDays - daysActive > 0 ? `${totalDurationDays - daysActive} ${t('days', lang)}` : t('durationCompleted', lang)}
            </p>
          </div>
        )}

        {goal.type === 'book' && goal.endPage && (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{t('bookProgress', lang)}</h2>
              <span className="text-xs font-bold bg-[var(--bg-card-hover)] px-2 py-1 rounded-md">
                {goal.completedSides?.length || 0} / {(goal.endPage - (goal.pageStartAt || 1) + 1) * 2}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
               <div className="flex-1 h-2 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${((goal.completedSides?.length || 0) / ((goal.endPage - (goal.pageStartAt || 1) + 1) * 2)) * 100}%` }} />
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>{t('completed', lang)}</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>{t('inProgress', lang)}</div>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-96 overflow-y-auto p-1 no-scrollbar">
              {Array.from({ length: goal.endPage - (goal.pageStartAt || 1) + 1 }).map((_, i) => {
                const pageNum = (goal.pageStartAt || 1) + i;
                const sideA = `${pageNum}a`;
                const sideB = `${pageNum}b`;
                const isACompleted = goal.completedSides?.includes(sideA);
                const isBCompleted = goal.completedSides?.includes(sideB);
                const isAInProgress = goal.inProgressSides?.includes(sideA);
                const isBInProgress = goal.inProgressSides?.includes(sideB);
                
                return (
                  <div key={pageNum} className="flex flex-col border border-[var(--border-main)] rounded-lg overflow-hidden bg-[var(--bg-main)]">
                    <div className="text-center text-[10px] font-bold py-1 bg-[var(--bg-card-hover)] text-[var(--text-muted)] border-b border-[var(--border-main)]">
                      {goal.bookType === 'talmud' ? `${t('daf', lang)} ${pageNum}` : `${t('page', lang)} ${pageNum}`}
                    </div>
                    <div className="flex flex-1 h-8">
                      <button 
                        onClick={() => onToggleBookSide?.(goal.id, sideA)}
                        className={`flex-1 flex items-center justify-center text-[10px] font-bold transition-colors ${isACompleted ? 'bg-emerald-500 text-white' : isAInProgress ? 'bg-amber-500 text-white' : 'text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'}`}
                      >
                        {goal.bookType === 'talmud' ? 'א' : 'A'}
                      </button>
                      <div className="w-px bg-[var(--border-main)]" />
                      <button 
                        onClick={() => onToggleBookSide?.(goal.id, sideB)}
                        className={`flex-1 flex items-center justify-center text-[10px] font-bold transition-colors ${isBCompleted ? 'bg-emerald-500 text-white' : isBInProgress ? 'bg-amber-500 text-white' : 'text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'}`}
                      >
                        {goal.bookType === 'talmud' ? 'ב' : 'B'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-4 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">{t('monthNames', lang)[currentMonth]} {currentYear}</h2>
            <button 
              onClick={onEditHistory}
              className="p-2 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-lg flex items-center gap-2 text-xs font-bold uppercase transition-colors hover:bg-blue-500/20"
            >
              <History size={14} />
              {t('editHistory', lang)}
            </button>
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
              const isCompleted = goal.completions.includes(iso);
              const isFailed = goal.failures?.includes(iso);
              
              return (
                <div key={d} className="aspect-square flex flex-col items-center justify-center relative">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                      isToday ? 'border-2 border-blue-500' : ''
                    } ${
                      isCompleted ? 'bg-emerald-500 text-white' : 
                      isFailed ? 'bg-red-500 text-white' :
                      'bg-[var(--bg-main)] text-[#475569]'
                    }`}
                  >
                    {d}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-widest">{t('todaysAction', lang)}</h3>
          {goal.type === 'binary' ? (
            <div className="flex gap-4">
              <button 
                onClick={() => onToggleGoal(goal.id)}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] hover:border-emerald-500/50'
                }`}
              >
                <TrendingUp size={20} />
                {t('success', lang)}
              </button>
              <button 
                onClick={() => onToggleFailure(goal.id)}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isFailed ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] hover:border-red-500/50'
                }`}
              >
                <AlertCircle size={20} />
                {t('failure', lang)}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onToggleGoal(goal.id)}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isCompleted ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] hover:border-blue-500/50'
              }`}
            >
              <TrendingUp size={20} />
              {isCompleted ? t('completedToday', lang) : `${t('logProgress', lang)} (${todayCompletions}/${goal.targetValue})`}
            </button>
          )}
        </div>
      </main>
    </motion.div>
  );
};
