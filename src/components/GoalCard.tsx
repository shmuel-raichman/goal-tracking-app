import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Goal, AppSettings } from '../types';
import { getTodayISO } from '../utils/dateHelpers';
import { calculateStreak, getGoalDurationProgress } from '../utils/streakCalculations';

interface GoalCardProps {
  goal: Goal;
  settings: AppSettings;
  onToggleGoal: (id: string) => void;
  onToggleFailure: (id: string) => void;
  onSelectGoal: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, settings, onToggleGoal, onToggleFailure, onSelectGoal }) => {
  const todayISO = getTodayISO();
  const todayCompletions = goal.completions.filter(c => c === todayISO).length;
  const todayFailures = goal.failures?.filter(c => c === todayISO).length || 0;
  const isCompleted = todayCompletions >= goal.targetValue;
  const isFailed = todayFailures > 0;
  
  const progress = Math.min((todayCompletions / goal.targetValue) * 100, 100);
  const stats = calculateStreak(goal, settings);
  const { daysActive, totalDurationDays } = getGoalDurationProgress(goal, stats.total);
  
  return (
    <div 
      className="flex items-center h-[72px] px-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] cursor-pointer transition-colors active:bg-slate-800 relative overflow-hidden"
      onClick={() => onSelectGoal(goal)}
    >
      {goal.type === 'counter' && goal.targetValue > 1 && !isCompleted && (
        <div 
          className="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      )}
      
      <div className="w-auto flex-shrink-0 flex items-center justify-start relative z-10 me-4">
        {goal.type === 'binary' ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleGoal(goal.id);
              }}
              className={`w-10 h-10 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-[var(--border-main)] text-[var(--text-muted)] hover:border-emerald-500/50'
              }`}
            >
              <Check size={20} strokeWidth={3} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFailure(goal.id);
              }}
              className={`w-10 h-10 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                isFailed 
                  ? 'bg-red-500 border-red-500 text-white' 
                  : 'border-[var(--border-main)] text-[var(--text-muted)] hover:border-red-500/50'
              }`}
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button 
            className={`w-10 h-10 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-[var(--border-main)]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleGoal(goal.id);
            }}
          >
            {isCompleted && <Check size={20} color="white" strokeWidth={3} />}
            {!isCompleted && goal.targetValue > 1 && todayCompletions > 0 && (
              <span className="text-xs text-blue-500 font-bold">{todayCompletions}</span>
            )}
          </button>
        )}
      </div>

      <div dir="auto" className="flex-1 min-w-0 relative z-10 flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <span 
            className={`text-base font-medium truncate transition-all ${
              isCompleted ? 'text-emerald-500 dark:text-emerald-400' : isFailed ? 'text-red-500 dark:text-red-400' : 'text-[var(--text-main)]'
            }`}
          >
            {goal.title}
          </span>
          {goal.type === 'counter' && goal.targetValue > 1 && !isCompleted && (
            <span className="text-xs text-[var(--text-muted)] font-medium ms-2">
              {todayCompletions} / {goal.targetValue}
            </span>
          )}
        </div>
        {totalDurationDays > 0 && (
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500/50 rounded-full" 
                style={{ width: `${Math.min((daysActive / totalDurationDays) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-medium whitespace-nowrap">
              {Math.min(daysActive, totalDurationDays)}/{totalDurationDays}d
            </span>
          </div>
        )}
        {goal.type === 'book' && goal.endPage && (
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500/50 rounded-full" 
                style={{ width: `${((goal.completedSides?.length || 0) / ((goal.endPage - (goal.pageStartAt || 1) + 1) * 2)) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-medium whitespace-nowrap">
              {goal.completedSides?.length || 0}/{(goal.endPage - (goal.pageStartAt || 1) + 1) * 2}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
