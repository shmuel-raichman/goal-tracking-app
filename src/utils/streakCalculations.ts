import { Goal, AppSettings } from '../types';
import { formatLocalISO, parseLocalDate } from './dateHelpers';

export const calculateStreak = (goal: Goal, settings: AppSettings) => {
  if (!goal || goal.targetValue <= 0 || goal.completions.length === 0) return { current: 0, best: 0, total: 0 };

  const completionsByDate = goal.completions.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const shouldCountDate = (date: Date) => {
    if (goal.frequency === 'Daily') return true;
    if (goal.frequency === 'Weekdays') {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    }
    return true;
  };

  let currentStreak = 0;
  let bestStreak = 0;
  let totalCompletions = 0;
  
  if (goal.frequency === 'Weekly') {
    // Weekly streak logic
    let checkWeekStart = new Date(today);
    const dayOfWeek = checkWeekStart.getDay();
    let diff = 0;
    if (settings.startOfWeek === 'Monday') {
      diff = checkWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    } else {
      diff = checkWeekStart.getDate() - dayOfWeek;
    }
    checkWeekStart.setDate(diff);
    checkWeekStart.setHours(0, 0, 0, 0);
    
    // Count total weeks completed
    // To find best streak, we need to iterate from the earliest completion week to today
    const sortedCompletions = [...goal.completions].sort();
    const earliestCompletion = sortedCompletions[0];
    let iterWeekStart = new Date(parseLocalDate(earliestCompletion));
    const iterDayOfWeek = iterWeekStart.getDay();
    let iterDiff = 0;
    if (settings.startOfWeek === 'Monday') {
      iterDiff = iterWeekStart.getDate() - iterDayOfWeek + (iterDayOfWeek === 0 ? -6 : 1);
    } else {
      iterDiff = iterWeekStart.getDate() - iterDayOfWeek;
    }
    iterWeekStart.setDate(iterDiff);
    iterWeekStart.setHours(0, 0, 0, 0);
    
    let tempStreak = 0;
    
    while (iterWeekStart <= checkWeekStart) {
      let weekCompletions = 0;
      let weekFailures = 0;
      for (let i = 0; i < 7; i++) {
        let d = new Date(iterWeekStart);
        d.setDate(d.getDate() + i);
        const checkISO = formatLocalISO(d);
        weekCompletions += (completionsByDate[checkISO] || 0);
        if (goal.failures?.includes(checkISO)) weekFailures++;
      }
      
      if (weekCompletions >= goal.targetValue && (goal.type !== 'binary' || weekFailures === 0)) {
        tempStreak++;
        totalCompletions++;
        bestStreak = Math.max(bestStreak, tempStreak);
        if (iterWeekStart.getTime() === checkWeekStart.getTime()) {
          currentStreak = tempStreak;
        }
      } else {
        if (iterWeekStart.getTime() === checkWeekStart.getTime()) {
          currentStreak = tempStreak;
        }
        tempStreak = 0;
      }
      iterWeekStart.setDate(iterWeekStart.getDate() + 7);
    }
  } else {
    // Daily/Weekdays streak logic
    const sortedCompletions = [...goal.completions].sort();
    const earliestCompletion = sortedCompletions[0];
    let iterDate = new Date(parseLocalDate(earliestCompletion));
    iterDate.setHours(0, 0, 0, 0);
    
    let tempStreak = 0;
    
    while (iterDate <= today) {
      if (!shouldCountDate(iterDate)) {
        if (iterDate.getTime() === today.getTime()) {
          currentStreak = tempStreak;
        }
        iterDate.setDate(iterDate.getDate() + 1);
        continue;
      }
      
      const checkISO = formatLocalISO(iterDate);
      const isFailed = goal.failures?.includes(checkISO);
      
      if ((completionsByDate[checkISO] || 0) >= goal.targetValue && !isFailed) {
        tempStreak++;
        totalCompletions++;
        bestStreak = Math.max(bestStreak, tempStreak);
        if (iterDate.getTime() === today.getTime()) {
          currentStreak = tempStreak;
        }
      } else {
        if (iterDate.getTime() === today.getTime()) {
          currentStreak = tempStreak;
        }
        tempStreak = 0;
      }
      iterDate.setDate(iterDate.getDate() + 1);
    }
  }

  return { current: currentStreak, best: bestStreak, total: totalCompletions };
};

export const getGoalDurationProgress = (goal: Goal, successfulDays: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [year, month, day] = goal.createdAt.split('-').map(Number);
  let createdDate = new Date(year, month - 1, day);
  createdDate.setHours(0, 0, 0, 0);

  if (goal.completions.length > 0) {
    const sortedCompletions = [...goal.completions].sort();
    const earliestCompletion = sortedCompletions[0];
    const [eYear, eMonth, eDay] = earliestCompletion.split('-').map(Number);
    const earliestDate = new Date(eYear, eMonth - 1, eDay);
    earliestDate.setHours(0, 0, 0, 0);
    if (earliestDate < createdDate) createdDate = earliestDate;
  }
  
  const diffTime = today.getTime() - createdDate.getTime();
  const daysSinceCreation = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  const daysActive = goal.extendDurationIfMissed ? successfulDays : daysSinceCreation;

  let totalDurationDays = 0;
  if (goal.durationUnit && goal.durationUnit !== 'indefinite' && goal.durationValue) {
    if (goal.durationUnit === 'days') totalDurationDays = goal.durationValue;
    else if (goal.durationUnit === 'weeks') totalDurationDays = goal.durationValue * 7;
    else if (goal.durationUnit === 'months') totalDurationDays = goal.durationValue * 30;
  }
  
  return { daysActive, totalDurationDays };
};
