import React, { useMemo } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Goal, AppSettings } from '../types';
import { getTodayISO, formatDate } from '../utils/dateHelpers';
import { GoalCard } from '../components/GoalCard';
import { t } from '../utils/translations';

interface DashboardProps {
  goals: Goal[];
  settings: AppSettings;
  onToggleGoal: (id: string) => void;
  onToggleFailure: (id: string) => void;
  onAddGoal: () => void;
  onSelectGoal: (goal: Goal) => void;
}

export const Dashboard = ({ goals, settings, onToggleGoal, onToggleFailure, onAddGoal, onSelectGoal }: DashboardProps) => {
  const today = useMemo(() => formatDate(new Date()), []);
  const todayISO = getTodayISO();
  
  const activeGoals = useMemo(() => goals.filter(g => !g.isSuspended), [goals]);
  
  const completionRate = useMemo(() => {
    if (activeGoals.length === 0) return 0;
    
    let totalTarget = 0;
    let totalCompleted = 0;
    
    activeGoals.forEach(g => {
      totalTarget += g.targetValue;
      const todayCompletions = g.completions.filter(c => c === todayISO).length;
      totalCompleted += Math.min(todayCompletions, g.targetValue);
    });
    
    return (totalCompleted / totalTarget) * 100;
  }, [activeGoals, todayISO]);

  const lang = settings.language || 'en';

  return (
    <div className="flex flex-col h-full">
      <header className="pt-12 px-6 pb-4">
        <h1 className="text-[32px] font-bold tracking-tight text-[var(--text-main)] leading-tight font-heading">{today}</h1>
      </header>
      
      <div className="w-full bg-[var(--bg-card-hover)] h-1 mb-6">
        <motion.div 
          className="bg-blue-500 h-full" 
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <main className="flex-1 px-4 space-y-2 overflow-y-auto pb-32">
        {activeGoals.length > 0 && completionRate === 100 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[var(--text-main)] font-bold text-sm">{t('perfectDay', lang)}</p>
              <p className="text-emerald-200 text-xs mt-0.5">{t('perfectDayDesc', lang)}</p>
            </div>
          </motion.div>
        )}
        
        {activeGoals.map((goal: Goal) => (
          <GoalCard 
            key={goal.id}
            goal={goal}
            settings={settings}
            onToggleGoal={onToggleGoal}
            onToggleFailure={onToggleFailure}
            onSelectGoal={onSelectGoal}
          />
        ))}
      </main>

      <button 
        onClick={onAddGoal}
        className="fixed bottom-[104px] right-6 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-20"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};
