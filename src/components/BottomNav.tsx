import React from 'react';
import { Home, BarChart2, Settings } from 'lucide-react';
import { t } from '../utils/translations';
import { AppSettings } from '../types';

export const BottomNav = ({ activeTab, onTabChange, settings }: { activeTab: string, onTabChange: (tab: string) => void, settings: AppSettings }) => {
  const lang = settings.language || 'en';
  return (
    <nav className="bg-[var(--bg-main)] border-t border-[var(--border-main)] px-6 pb-safe pt-3 flex justify-between items-center z-50">
      <button onClick={() => onTabChange('home')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-blue-500' : 'text-[var(--text-muted)]'}`}>
        <Home size={24} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-medium">{t('home', lang)}</span>
      </button>
      <button onClick={() => onTabChange('consistency')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'consistency' ? 'text-blue-500' : 'text-[var(--text-muted)]'}`}>
        <BarChart2 size={24} fill={activeTab === 'consistency' ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-medium">{t('consistency', lang)}</span>
      </button>
      <button onClick={() => onTabChange('settings')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'settings' ? 'text-blue-500' : 'text-[var(--text-muted)]'}`}>
        <Settings size={24} fill={activeTab === 'settings' ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-medium">{t('settings', lang)}</span>
      </button>
    </nav>
  );
};
