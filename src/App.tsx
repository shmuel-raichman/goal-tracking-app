import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

import { auth, db } from './firebase';
import { Goal, UserProfile, AppSettings, OperationType } from './types';
import { getTodayISO, formatLocalISO } from './utils/dateHelpers';
import { getEncouragement } from './utils/encouragement';
import { handleFirestoreError, setGlobalErrorHandler } from './utils/firestore';
import { t } from './utils/translations';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';

// Screens
import { Dashboard } from './screens/Dashboard';
import { ConsistencyScreen } from './screens/ConsistencyScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GoalDetail } from './screens/GoalDetail';
import { NewGoalScreen } from './screens/NewGoalScreen';
import { EditGoalHistoryScreen } from './screens/EditGoalHistoryScreen';
import { ManageGoalsScreen } from './screens/ManageGoalsScreen';

// Hooks
import { useModalBackHandler } from './hooks/useModalBackHandler';

function AppContent() {
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [activeTab, setActiveTab] = useState('home');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingHistoryGoal, setEditingHistoryGoal] = useState<Goal | null>(null);
  const [isManagingGoals, setIsManagingGoals] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    notifications: true,
    encouragement: true,
    startOfWeek: 'Sunday'
  });

  // Modal Back Handlers
  useModalBackHandler(!!selectedGoal, () => setSelectedGoal(null), 'detail');
  useModalBackHandler(isAddingGoal, () => setIsAddingGoal(false), 'add');
  useModalBackHandler(!!editingGoal, () => setEditingGoal(null), 'edit');
  useModalBackHandler(!!editingHistoryGoal, () => setEditingHistoryGoal(null), 'history');
  useModalBackHandler(isManagingGoals, () => setIsManagingGoals(false), 'manage');

  // Handle main navigation back button
  useEffect(() => {
    if (isAddingGoal || !!selectedGoal || !!editingGoal || !!editingHistoryGoal || isManagingGoals) return;

    const handlePopState = (e: PopStateEvent) => {
      if ((window as any).__ignoreNextPopState) {
        (window as any).__ignoreNextPopState = false;
        return;
      }
      
      if (activeTab !== 'home') {
        if (!e.state?.tab || e.state.tab === 'home') {
          setActiveTab('home');
        }
      } else {
        setShowExitConfirm(true);
        window.history.pushState({ tab: 'home' }, '');
      }
    };

    if (activeTab !== 'home') {
      if (window.history.state?.tab !== activeTab && !(window as any).__ignoreNextPopState) {
        window.history.pushState({ tab: activeTab }, '');
      }
    } else {
      if (window.history.state?.tab !== 'home' && !(window as any).__ignoreNextPopState) {
        window.history.replaceState({ tab: 'home' }, '');
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, isAddingGoal, selectedGoal, editingGoal, editingHistoryGoal, isManagingGoals]);

  useEffect(() => {
    setGlobalErrorHandler(setError);
  }, []);

  if (error) throw error;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubSettings = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        setDoc(userRef, {
          name: user.displayName || 'User',
          email: user.email || '',
          avatarUrl: user.photoURL || '',
          settings: {
            darkMode: true,
            notifications: true,
            encouragement: true,
            startOfWeek: 'Sunday'
          }
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const unsubGoals = onSnapshot(goalsRef, (snapshot) => {
      const loadedGoals: Goal[] = [];
      snapshot.forEach(doc => {
        loadedGoals.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(loadedGoals);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/goals`));

    return () => {
      unsubSettings();
      unsubGoals();
    };
  }, [user, isAuthReady]);

  // Notification Logic
  useEffect(() => {
    if (!settings.notifications || !isAuthReady || !user || goals.length === 0) return;

    // Check if we have permission
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      // Only remind in the evening (e.g., after 18:00 / 6 PM)
      if (now.getHours() < 18) return;

      const today = getTodayISO();
      const lastNotified = localStorage.getItem('lastNotificationDate');
      
      // Already notified today
      if (lastNotified === today) return;

      // Check if there are incomplete active goals
      const hasIncompleteGoals = goals.some(goal => {
        if (goal.isSuspended) return false;
        const todayCompletions = goal.completions.filter(c => c === today).length;
        const todayFailures = goal.failures?.filter(c => c === today).length || 0;
        
        if (goal.type === 'binary') {
          return todayCompletions === 0 && todayFailures === 0;
        } else {
          return todayCompletions < goal.targetValue;
        }
      });

      if (hasIncompleteGoals) {
        const lang = settings.language || 'en';
        new Notification(t('reminderTitle', lang), {
          body: t('reminderDesc', lang),
          icon: '/vite.svg'
        });
        localStorage.setItem('lastNotificationDate', today);
      }
    };

    // Check immediately on mount/auth
    checkReminders();

    // Then check every 15 minutes
    const interval = setInterval(checkReminders, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.notifications, isAuthReady, user, goals, settings.language]);

  const handleToggleGoal = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    const today = getTodayISO();
    const todayCompletions = goal.completions.filter(c => c === today).length;
    
    let newCompletions;
    let newFailures = goal.failures || [];
    let justCompleted = false;
    
    if (goal.type === 'binary') {
      if (todayCompletions > 0) {
        newCompletions = goal.completions.filter(c => c !== today);
      } else {
        newCompletions = [...goal.completions, today];
        newFailures = newFailures.filter(c => c !== today);
        justCompleted = true;
      }
    } else {
      if (todayCompletions >= goal.targetValue) {
        newCompletions = goal.completions.filter(c => c !== today);
      } else {
        newCompletions = [...goal.completions, today];
        if (todayCompletions + 1 === goal.targetValue) {
          justCompleted = true;
        }
      }
    }
      
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', id), {
        completions: newCompletions,
        failures: newFailures
      });
      
      if (justCompleted && settings.encouragement) {
        setEncouragementMessage(getEncouragement());
        setTimeout(() => setEncouragementMessage(null), 4000);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/goals/${id}`);
    }
  };

  const handleToggleFailure = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (!goal || goal.type !== 'binary') return;
    
    const today = getTodayISO();
    const todayFailures = (goal.failures || []).filter(c => c === today).length;
    
    let newFailures;
    let newCompletions = goal.completions;
    
    if (todayFailures > 0) {
      newFailures = (goal.failures || []).filter(c => c !== today);
    } else {
      newFailures = [...(goal.failures || []), today];
      newCompletions = newCompletions.filter(c => c !== today);
    }
      
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', id), {
        completions: newCompletions,
        failures: newFailures
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/goals/${id}`);
    }
  };

  const handleToggleDay = async (goalId: string, dateISO: string, isFailure = false) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    let newCompletions = [...goal.completions];
    let newFailures = [...(goal.failures || [])];

    if (isFailure) {
      if (newFailures.includes(dateISO)) {
        newFailures = newFailures.filter(f => f !== dateISO);
      } else {
        newFailures.push(dateISO);
        newCompletions = newCompletions.filter(c => c !== dateISO);
      }
    } else {
      const todayCompletions = newCompletions.filter(c => c === dateISO).length;
      const isCompleted = todayCompletions >= goal.targetValue;

      if (isCompleted || todayCompletions > 0) {
        // If it has any completions, clicking it should clear them all
        newCompletions = newCompletions.filter(c => c !== dateISO);
      } else {
        // If it has 0 completions, clicking it should mark it fully completed
        for (let i = 0; i < goal.targetValue; i++) {
          newCompletions.push(dateISO);
        }
        newFailures = newFailures.filter(f => f !== dateISO);
      }
    }

    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
        completions: newCompletions,
        failures: newFailures
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/goals/${goalId}`);
    }
  };

  const handleToggleBookSide = async (goalId: string, sideId: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.type !== 'book') return;

    const completedSides = goal.completedSides || [];
    const inProgressSides = goal.inProgressSides || [];
    
    let newCompletedSides = [...completedSides];
    let newInProgressSides = [...inProgressSides];
    let newCompletions = [...goal.completions];
    let justCompleted = false;

    if (completedSides.includes(sideId)) {
      // Completed -> None
      newCompletedSides = completedSides.filter(s => s !== sideId);
    } else if (inProgressSides.includes(sideId)) {
      // In Progress -> Completed
      newInProgressSides = inProgressSides.filter(s => s !== sideId);
      newCompletedSides.push(sideId);
      
      const today = getTodayISO();
      if (!newCompletions.includes(today)) {
        newCompletions.push(today);
        justCompleted = true;
      }
    } else {
      // None -> In Progress
      newInProgressSides.push(sideId);
      
      const today = getTodayISO();
      if (!newCompletions.includes(today)) {
        newCompletions.push(today);
        justCompleted = true;
      }
    }

    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
        completedSides: newCompletedSides,
        inProgressSides: newInProgressSides,
        completions: newCompletions
      });
      
      if (justCompleted && settings.encouragement) {
        setEncouragementMessage(getEncouragement());
        setTimeout(() => setEncouragementMessage(null), 4000);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/goals/${goalId}`);
    }
  };

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    if (!user) return;
    try {
      if (goalData.id) {
        const { id, ...data } = goalData;
        await updateDoc(doc(db, 'users', user.uid, 'goals', id), data);
      } else {
        const { id, ...data } = goalData;
        const newGoal = {
          ...data,
          createdAt: formatLocalISO(new Date()),
          completions: [],
          failures: [],
          isSuspended: false
        };
        await addDoc(collection(db, 'users', user.uid, 'goals'), newGoal);
      }
      setEditingGoal(null);
      setIsAddingGoal(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/goals`);
    }
  };

  const handleSuspendGoal = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', id), {
        isSuspended: !goal.isSuspended
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/goals/${id}`);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
      if (selectedGoal?.id === id) setSelectedGoal(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/goals/${id}`);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        settings: { ...settings, ...newSettings }
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  if (!isAuthReady) {
    return <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.5)]">
          <CheckCircle2 size={40} className="text-[var(--text-main)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-4 font-heading">Habit Tracker</h1>
        <p className="text-[var(--text-muted)] mb-12 max-w-xs">Build consistency and track your daily habits seamlessly.</p>
        <button 
          onClick={handleLogin}
          className="w-full max-w-xs bg-white text-[#0F172A] font-bold py-4 rounded-full text-lg hover:bg-gray-100 transition-colors"
        >
          Continue with Google
        </button>
      </div>
    );
  }

  const userProfile: UserProfile = {
    name: user.displayName || 'User',
    email: user.email || '',
    avatarUrl: user.photoURL || ''
  };

  return (
    <div 
      className="h-[100dvh] w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans"
      dir={settings.language === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'home' && (
          <Dashboard 
            goals={goals} 
            settings={settings}
            onToggleGoal={handleToggleGoal}
            onToggleFailure={handleToggleFailure}
            onAddGoal={() => setIsAddingGoal(true)}
            onSelectGoal={setSelectedGoal}
          />
        )}
        {activeTab === 'consistency' && <ConsistencyScreen goals={goals} settings={settings} />}
        {activeTab === 'settings' && (
          <SettingsScreen 
            settings={settings}
            user={userProfile}
            onUpdateSettings={handleUpdateSettings}
            onLogout={handleLogout}
            onDeleteAccount={() => {}}
            onManageGoals={() => setIsManagingGoals(true)}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} settings={settings} />

      <AnimatePresence>
        {selectedGoal && (
          <GoalDetail 
            goal={goals.find(g => g.id === selectedGoal.id) || selectedGoal}
            settings={settings}
            onBack={() => setSelectedGoal(null)}
            onEditHistory={() => setEditingHistoryGoal(goals.find(g => g.id === selectedGoal.id) || selectedGoal)}
            onToggleGoal={handleToggleGoal}
            onToggleFailure={handleToggleFailure}
            onToggleBookSide={handleToggleBookSide}
          />
        )}

        {isAddingGoal && (
          <NewGoalScreen 
            settings={settings}
            onBack={() => setIsAddingGoal(false)}
            onSave={handleSaveGoal}
          />
        )}

        {editingGoal && (
          <NewGoalScreen 
            editingGoal={goals.find(g => g.id === editingGoal.id) || editingGoal}
            settings={settings}
            onBack={() => setEditingGoal(null)}
            onSave={handleSaveGoal}
          />
        )}

        {editingHistoryGoal && (
          <EditGoalHistoryScreen 
            goal={goals.find(g => g.id === editingHistoryGoal.id) || editingHistoryGoal}
            settings={settings}
            onBack={() => setEditingHistoryGoal(null)}
            onToggleDay={handleToggleDay}
          />
        )}

        {isManagingGoals && (
          <ManageGoalsScreen 
            goals={goals}
            settings={settings}
            onBack={() => setIsManagingGoals(false)}
            onEditGoal={setEditingGoal}
            onEditHistory={setEditingHistoryGoal}
            onDeleteGoal={handleDeleteGoal}
            onToggleSuspend={handleSuspendGoal}
            onAddGoal={() => {
              setIsManagingGoals(false);
              setIsAddingGoal(true);
            }}
          />
        )}

        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold mb-2">{t('exitApp', settings.language)}</h3>
              <p className="text-[var(--text-muted)] mb-6">{t('exitConfirm', settings.language)}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-card-hover)] text-[var(--text-main)]"
                >{t('cancel', settings.language)}</button>
                <button 
                  onClick={() => window.close()}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white"
                >{t('exit', settings.language)}</button>
              </div>
            </motion.div>
          </div>
        )}

        {encouragementMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 right-6 bg-blue-500 text-white p-4 rounded-xl shadow-lg z-[90] flex items-center gap-3"
          >
            <CheckCircle2 size={24} />
            <p className="font-bold">{encouragementMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
