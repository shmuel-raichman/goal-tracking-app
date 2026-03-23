import React from 'react';
import { ChevronLeft, Trash2, Edit2, Play, Pause, Plus, History } from 'lucide-react';
import { motion } from 'motion/react';
import { Goal, AppSettings } from '../types';
import { t } from '../utils/translations';

interface ManageGoalsScreenProps {
  goals: Goal[];
  onBack: () => void;
  onEditGoal: (goal: Goal) => void;
  onEditHistory: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onToggleSuspend: (id: string) => void;
  onAddGoal: () => void;
  settings: AppSettings;
}

export const ManageGoalsScreen = ({ goals, onBack, onEditGoal, onEditHistory, onDeleteGoal, onToggleSuspend, onAddGoal, settings }: ManageGoalsScreenProps) => {
  const lang = settings.language;
  const isRTL = lang === 'he';

  return (
    <motion.div 
      initial={{ x: isRTL ? '-100%' : '100%' }}
      animate={{ x: 0 }}
      exit={{ x: isRTL ? '-100%' : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-[var(--bg-main)] z-[60] flex flex-col"
    >
      <header className="pt-12 px-6 pb-6 border-b border-[var(--border-main)] flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
          <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-xl font-bold font-heading">{t('manageGoals', lang)}</h1>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto pb-safe">
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-muted)] mb-6">{t('noGoalsCreated', lang)}</p>
              <button 
                onClick={onAddGoal}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                {t('createFirstGoal', lang)}
              </button>
            </div>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className={`bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 flex flex-col gap-4 ${goal.isSuspended ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 truncate me-4">
                    <p className="text-[var(--text-main)] font-bold truncate text-lg">{goal.title}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                      {goal.frequency === 'Daily' ? t('daily', lang) : t('weekly', lang)} • {goal.type === 'binary' ? t('binary', lang) : `${t('target', lang)}: ${goal.targetValue}`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button 
                      onClick={() => onToggleSuspend(goal.id)}
                      className={`p-2 rounded-lg transition-colors ${goal.isSuspended ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-500 dark:text-amber-400'}`}
                    >
                      {goal.isSuspended ? <Play size={18} /> : <Pause size={18} />}
                    </button>
                    <button 
                      onClick={() => onEditHistory(goal)}
                      className="p-2 bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-lg transition-colors"
                    >
                      <History size={18} />
                    </button>
                    <button 
                      onClick={() => onEditGoal(goal)}
                      className="p-2 bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {goal.isSuspended && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                    <p className="text-amber-200 text-[10px] font-bold uppercase tracking-widest">{t('suspended', lang)}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </motion.div>
  );
};
