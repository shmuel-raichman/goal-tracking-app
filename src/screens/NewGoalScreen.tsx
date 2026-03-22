import React, { useState } from 'react';
import { ChevronLeft, Plus, Target, Calendar as CalendarIcon, Clock, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, GoalType, Frequency, Unit, DurationUnit, AppSettings } from '../types';
import { t } from '../utils/translations';

interface NewGoalScreenProps {
  onBack: () => void;
  onSave: (goal: Partial<Goal>) => void;
  editingGoal?: Goal | null;
  settings: AppSettings;
}

export const NewGoalScreen = ({ onBack, onSave, editingGoal, settings }: NewGoalScreenProps) => {
  const [title, setTitle] = useState(editingGoal?.title || '');
  const [type, setType] = useState<GoalType>(editingGoal?.type || 'counter');
  const [frequency, setFrequency] = useState<Frequency>(editingGoal?.frequency || 'Daily');
  const [targetValue, setTargetValue] = useState<number>(editingGoal?.targetValue || 1);
  const [targetUnit, setTargetUnit] = useState<Unit>(editingGoal?.targetUnit || 'times');
  const [durationValue, setDurationValue] = useState<number>(editingGoal?.durationValue || 0);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(editingGoal?.durationUnit || 'indefinite');
  const [reminders, setReminders] = useState(editingGoal?.smartReminders || false);
  const [extendDuration, setExtendDuration] = useState(editingGoal?.extendDurationIfMissed || false);
  const [showToast, setShowToast] = useState(false);

  const lang = settings.language || 'en';

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: editingGoal?.id,
      title,
      type,
      frequency,
      targetValue: type === 'binary' ? 1 : (isNaN(targetValue) ? 1 : targetValue),
      targetUnit: type === 'binary' ? 'times' : targetUnit,
      durationValue: isNaN(durationValue) ? 0 : durationValue,
      durationUnit,
      smartReminders: reminders,
      extendDurationIfMissed: extendDuration,
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-[var(--bg-main)] z-[70] flex flex-col"
    >
      <header className="flex items-center px-4 py-4 justify-between border-b border-[var(--border-main)]">
        <button onClick={onBack} className="p-2 text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-full">
          <ChevronLeft size={24} className={lang === 'he' ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-[var(--text-main)] text-[18px] font-bold tracking-tight font-heading">{editingGoal ? t('editGoal', lang) : t('newGoal', lang)}</h2>
        <button 
          onClick={handleSave}
          disabled={!title.trim()}
          className={`px-4 py-1.5 rounded-full font-bold text-[15px] transition-all ${
            title.trim() ? 'bg-blue-500/10 text-blue-500 opacity-100' : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] opacity-50'
          }`}
        >
          {t('saveGoal', lang)}
        </button>
      </header>
      
      <main className="flex-1 flex flex-col px-6 py-8 gap-10 overflow-y-auto">
        <div className="flex flex-col">
          <input 
            autoFocus
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-[var(--border-main)] text-[24px] font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-0 focus:border-blue-500 transition-colors py-3 px-0 font-heading"
            placeholder={t('title', lang)}
          />
        </div>

        <section className="flex flex-col gap-4">
          <h3 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('goalType', lang)}</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => setType('counter')}
              className={`flex-1 h-12 rounded-xl font-bold text-[15px] transition-all flex flex-col items-center justify-center gap-0.5 ${
                type === 'counter' ? 'bg-blue-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'
              }`}
            >
              <span>{t('counter', lang)}</span>
            </button>
            <button 
              onClick={() => setType('binary')}
              className={`flex-1 h-12 rounded-xl font-bold text-[15px] transition-all flex flex-col items-center justify-center gap-0.5 ${
                type === 'binary' ? 'bg-blue-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'
              }`}
            >
              <span>{t('binary', lang)}</span>
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('frequency', lang)}</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {(['Daily', 'Weekdays', 'Weekly'] as Frequency[]).map(f => (
              <button 
                key={f}
                onClick={() => setFrequency(f)}
                className={`shrink-0 h-8 px-4 rounded-full font-bold text-[15px] transition-all ${
                  frequency === f ? 'bg-blue-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]'
                }`}
              >
                {f === 'Daily' ? t('daily', lang) : f === 'Weekdays' ? t('weekdays', lang) : t('weekly', lang)}
              </button>
            ))}
          </div>
        </section>

        {type === 'counter' && (
          <section className="flex flex-col gap-4">
            <h3 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('targetValue', lang)}</h3>
            <div className="flex items-center gap-4 bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
              <input 
                type="number"
                value={targetValue || ''}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="flex-1 bg-[var(--bg-main)] border-0 rounded-md text-xl font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-blue-500 py-3 px-4 font-heading"
                placeholder="0"
              />
              <div className="w-[120px] relative">
                <select 
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value as Unit)}
                  className="w-full appearance-none bg-[var(--bg-main)] border-0 rounded-md text-[15px] font-bold text-[var(--text-main)] focus:ring-1 focus:ring-blue-500 py-3 pl-4 pr-10"
                >
                  <option value="times">times</option>
                  <option value="mins">mins</option>
                  <option value="pages">pages</option>
                  <option value="liters">liters</option>
                </select>
                <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h3 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('duration', lang)}</h3>
          <div className="flex items-center gap-4 bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
            <input 
              type="number"
              value={durationValue || ''}
              onChange={(e) => setDurationValue(Number(e.target.value))}
              disabled={durationUnit === 'indefinite'}
              className="flex-1 bg-[var(--bg-main)] border-0 rounded-md text-xl font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-blue-500 py-3 px-4 font-heading disabled:opacity-50"
              placeholder={durationUnit === 'indefinite' ? "∞" : "0"}
            />
            <div className="w-[120px] relative">
              <select 
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                className="w-full appearance-none bg-[var(--bg-main)] border-0 rounded-md text-[15px] font-bold text-[var(--text-main)] focus:ring-1 focus:ring-blue-500 py-3 pl-4 pr-10"
              >
                <option value="indefinite">{t('indefinite', lang)}</option>
                <option value="days">{t('days', lang)}</option>
                <option value="weeks">{t('weeks', lang)}</option>
                <option value="months">{t('months', lang)}</option>
              </select>
              <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-[var(--text-main)]">{t('smartReminders', lang)}</span>
              <span className="text-[13px] text-[var(--text-muted)]">{t('notifyForget', lang)}</span>
            </div>
            <button 
              onClick={() => setReminders(!reminders)}
              className={`relative w-10 h-6 rounded-full transition-colors ${reminders ? 'bg-blue-500' : 'bg-[var(--bg-card-hover)]'}`}
            >
              <motion.div 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${lang === 'he' ? 'right-1' : 'left-1'}`}
                animate={{ x: reminders ? (lang === 'he' ? -16 : 16) : 0 }}
              />
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-[var(--text-main)]">{t('extendDuration', lang)}</span>
              <span className="text-[13px] text-[var(--text-muted)]">{t('countSuccessful', lang)}</span>
            </div>
            <button 
              onClick={() => setExtendDuration(!extendDuration)}
              className={`relative w-10 h-6 rounded-full transition-colors ${extendDuration ? 'bg-blue-500' : 'bg-[var(--bg-card-hover)]'}`}
            >
              <motion.div 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${lang === 'he' ? 'right-1' : 'left-1'}`}
                animate={{ x: extendDuration ? (lang === 'he' ? -16 : 16) : 0 }}
              />
            </button>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 w-[90%] max-w-sm bg-white text-[#0F172A] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[100]"
          >
            <Check size={20} className="text-blue-500" />
            <span className="text-[14px] font-bold">{t('goalSaved', lang)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

