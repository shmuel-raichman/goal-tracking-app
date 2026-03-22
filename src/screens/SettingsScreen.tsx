import React from 'react';
import { ShieldCheck, LogOut, Trash2, User, Settings as SettingsIcon, Bell, Moon, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AppSettings, UserProfile } from '../types';
import { t } from '../utils/translations';

interface SettingsScreenProps {
  settings: AppSettings;
  user: UserProfile | null;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onManageGoals: () => void;
}

export const SettingsScreen = ({ settings, user, onUpdateSettings, onLogout, onDeleteAccount, onManageGoals }: SettingsScreenProps) => {
  const lang = settings.language || 'en';

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] text-[var(--text-main)]">
      <header className="pt-12 px-6 pb-6 border-b border-[var(--border-main)]">
        <h1 className="text-2xl font-bold font-heading">{t('settings', lang)}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t('manageAccount', lang)}</p>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto pb-32">
        {user && (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-4 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User size={24} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-[var(--text-main)] font-bold truncate">{user.name || 'User'}</p>
              <p className="text-[var(--text-muted)] text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-4">{t('goalManagement', lang)}</h3>
            <button 
              onClick={onManageGoals}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 flex justify-between items-center hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <SettingsIcon size={18} className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <span className="font-medium">{t('manageGoals', lang)}</span>
              </div>
              <ChevronRight size={18} className={`text-[#475569] ${lang === 'he' ? 'rotate-180' : ''}`} />
            </button>
          </section>

          <section>
            <h3 className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-4">{t('preferences', lang)}</h3>
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl overflow-hidden divide-y divide-[var(--border-main)]">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Bell size={18} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">{t('notifications', lang)}</span>
                </div>
                <div 
                  onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
                  className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors ${settings.notifications ? 'bg-blue-500' : 'bg-[var(--bg-card-hover)]'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications ? (lang === 'he' ? -24 : 24) : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Moon size={18} className="text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium">{t('darkMode', lang)}</span>
                </div>
                <div 
                  onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
                  className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors ${settings.darkMode ? 'bg-blue-500' : 'bg-[var(--bg-card-hover)]'}`}
                >
                  <motion.div 
                    animate={{ x: settings.darkMode ? (lang === 'he' ? -24 : 24) : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Globe size={18} className="text-amber-500 dark:text-amber-400" />
                  </div>
                  <span className="font-medium">{t('language', lang)}</span>
                </div>
                <select 
                  value={settings.language || 'en'}
                  onChange={(e) => onUpdateSettings({ language: e.target.value as 'en' | 'he' })}
                  className="bg-transparent text-xs text-[var(--text-muted)] font-bold outline-none cursor-pointer text-right appearance-none"
                >
                  <option value="en">English</option>
                  <option value="he">עברית</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-4">{t('account', lang)}</h3>
            <div className="space-y-2">
              <button 
                onClick={onLogout}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 flex items-center gap-3 text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <LogOut size={18} className="text-[var(--text-muted)]" />
                <span className="font-medium">{t('logOut', lang)}</span>
              </button>
              <button 
                onClick={onDeleteAccount}
                className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={18} />
                <span className="font-medium">{t('deleteAccount', lang)}</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
