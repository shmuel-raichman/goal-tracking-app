import { useState, useMemo } from 'react';
import { 
  Plus, 
  Home, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Pause, 
  Trash2, 
  X, 
  Check,
  CheckCircle2,
  ChevronDown,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Frequency, Unit, UserProfile, AppSettings } from './types';

// --- Constants & Dummy Data ---

const DUMMY_USER: UserProfile = {
  name: "Alex Mitchell",
  email: "alex@example.com",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCirzdsBOMLRRmRSlIFZwWfZhREI4tQhpzegW4WoYBXYUJyNfKwjR8RPLRNYM6kfZvS_NFWWaban2gBvUpUL73uMSKJzkknDVcRjxWJ4CSI-YNskNu719nfyxeUHXrAVt-pMWCugH6heYPpbnVrD2NPSsbgLUE6bxqirXzTx0xgnkGlQ2WrYGVpuZIkVaVeQ694J-AS-rXVkNyFytM9XOkXsp0Puc-Td_Z6hmE_6VgyzLsD1-Sa5bHPhYulMc5BlOlgopR7AT4IBdc"
};

const INITIAL_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Read 30 pages',
    frequency: 'Daily',
    targetValue: 30,
    targetUnit: 'pages',
    smartReminders: true,
    createdAt: '2024-01-01',
    completions: [
      '2026-03-15', '2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21'
    ],
    isSuspended: false
  },
  {
    id: '2',
    title: 'Morning workout',
    frequency: 'Daily',
    targetValue: 1,
    targetUnit: 'times',
    smartReminders: false,
    createdAt: '2024-01-01',
    completions: [
      '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15',
      '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21'
    ],
    isSuspended: false
  },
  {
    id: '3',
    title: 'Drink 2L water',
    frequency: 'Daily',
    targetValue: 2,
    targetUnit: 'liters',
    smartReminders: true,
    createdAt: '2024-01-01',
    completions: ['2026-03-19', '2026-03-20', '2026-03-21'],
    isSuspended: false
  }
];

// --- Helpers ---

const getTodayISO = () => new Date().toISOString().split('T')[0];

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

// --- Components ---

const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-[#334155] px-6 pb-8 pt-3 flex justify-between items-center z-50">
    <button onClick={() => onTabChange('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-500' : 'text-[#94A3B8]'}`}>
      <Home size={24} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
    </button>
    <button onClick={() => onTabChange('calendar')} className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-blue-500' : 'text-[#94A3B8]'}`}>
      <CalendarIcon size={24} fill={activeTab === 'calendar' ? 'currentColor' : 'none'} />
    </button>
    <button onClick={() => onTabChange('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-500' : 'text-[#94A3B8]'}`}>
      <ShieldCheck size={24} fill={activeTab === 'settings' ? 'currentColor' : 'none'} />
    </button>
  </nav>
);

const Dashboard = ({ goals, onToggleGoal, onAddGoal, onSelectGoal }: { 
  goals: Goal[], 
  onToggleGoal: (id: string) => void, 
  onAddGoal: () => void,
  onSelectGoal: (goal: Goal) => void 
}) => {
  const today = useMemo(() => formatDate(new Date()), []);
  const todayISO = getTodayISO();
  
  const completionRate = useMemo(() => {
    if (goals.length === 0) return 0;
    const completedCount = goals.filter(g => g.completions.includes(todayISO)).length;
    return (completedCount / goals.length) * 100;
  }, [goals, todayISO]);

  return (
    <div className="flex flex-col h-full">
      <header className="pt-12 px-6 pb-4">
        <h1 className="text-[32px] font-bold tracking-tight text-white leading-tight font-heading">{today}</h1>
      </header>
      
      <div className="w-full bg-[#334155] h-1 mb-6">
        <motion.div 
          className="bg-blue-500 h-full" 
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <main className="flex-1 px-4 space-y-2 overflow-y-auto pb-32">
        {goals.map(goal => (
          <div 
            key={goal.id} 
            className="flex items-center h-[72px] px-4 bg-[#1E293B] rounded-lg border border-[#334155] cursor-pointer transition-colors active:bg-slate-800"
            onClick={() => onSelectGoal(goal)}
          >
            <div 
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                goal.completions.includes(todayISO) 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-[#334155]'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleGoal(goal.id);
              }}
            >
              {goal.completions.includes(todayISO) && <Check size={14} color="white" strokeWidth={3} />}
            </div>
            <span className={`ml-4 text-base font-medium flex-1 truncate transition-all ${
              goal.completions.includes(todayISO) ? 'text-[#94A3B8] line-through' : 'text-white'
            }`}>
              {goal.title}
            </span>
          </div>
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

const Consistency = ({ goals }: { goals: Goal[] }) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id || null);
  
  const selectedGoal = useMemo(() => 
    goals.find(g => g.id === selectedGoalId) || goals[0], 
  [goals, selectedGoalId]);

  // Streak calculation logic
  const stats = useMemo(() => {
    if (!selectedGoal) return { current: 0, best: 0, total: 0 };
    
    const completions = [...selectedGoal.completions].sort();
    if (completions.length === 0) return { current: 0, best: 0, total: 0 };

    let bestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < completions.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prev = new Date(completions[i-1]);
            const curr = new Date(completions[i]);
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
            
            if (diff === 1) {
                tempStreak++;
            } else if (diff > 1) {
                tempStreak = 1;
            }
        }
        bestStreak = Math.max(bestStreak, tempStreak);
    }
    
    const lastCompletion = new Date(completions[completions.length - 1]);
    const diffToToday = (today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24);
    
    let currentStreak = 0;
    if (diffToToday <= 1) {
        currentStreak = tempStreak;
    }

    return {
      current: currentStreak,
      best: bestStreak,
      total: completions.length
    };
  }, [selectedGoal]);

  // Calendar logic for current month
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, []);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  if (goals.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center text-[#94A3B8] mb-4">
                <CalendarIcon size={32} />
              </div>
              <p className="text-white font-bold text-lg mb-2">No goals to track</p>
              <p className="text-[#94A3B8] text-sm">Add a goal to see your consistency heatmap here.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-6 pt-12 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Consistency</h1>
      </header>

      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                selectedGoalId === goal.id 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155]'
              }`}
            >
              {goal.title}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-6 pb-32 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] flex flex-col items-center text-center shadow-lg">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Total</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] flex flex-col items-center text-center shadow-lg">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Current</p>
            <p className="text-xl font-bold text-white">{stats.current}</p>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] flex flex-col items-center text-center shadow-lg">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Best</p>
            <p className="text-xl font-bold text-white">{stats.best}</p>
          </div>
        </div>

        <div className="bg-[#1E293B] p-6 rounded-lg border border-[#334155] shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white font-heading">{monthName}</h2>
            <div className="flex gap-2">
              <button className="p-1 text-[#94A3B8] hover:text-white transition-colors"><ChevronLeft size={20} /></button>
              <button className="p-1 text-[#94A3B8] hover:text-white transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-[11px] font-bold text-[#94A3B8] uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-2 justify-items-center">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="w-8 h-8" />;
              
              const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isCompleted = selectedGoal?.completions.includes(dateStr);
              
              return (
                <div 
                  key={day} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all ${
                    isCompleted 
                      ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]' 
                      : 'text-[#94A3B8] hover:bg-white/5'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Zap size={20} />
            </div>
            <div>
                <p className="text-white font-bold text-[15px]">Keep it up!</p>
                <p className="text-[#94A3B8] text-[13px]">You're on a {stats.current} day streak. Don't break the chain.</p>
            </div>
        </div>
      </main>
    </div>
  );
};

const SettingsScreen = ({ user, settings, onUpdateSettings, onManageGoals }: { 
  user: UserProfile, 
  settings: AppSettings,
  onUpdateSettings: (s: Partial<AppSettings>) => void,
  onManageGoals: () => void
}) => (
  <div className="flex flex-col h-full">
    <header className="p-6 pt-12 pb-6">
      <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Settings</h1>
    </header>

    <main className="flex-1 px-6 pb-32 overflow-y-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-lg bg-[#1E293B] border border-[#334155] overflow-hidden flex-shrink-0">
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <p className="font-bold text-[20px] leading-tight text-white font-heading">{user.name}</p>
          <p className="text-[13px] font-medium text-[#94A3B8] mt-0.5">{user.email}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-1">Goals</h2>
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden shadow-lg">
          <button 
            onClick={onManageGoals}
            className="w-full flex items-center justify-between h-14 px-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Plus size={18} />
              </div>
              <span className="text-[16px] text-white">Manage My Goals</span>
            </div>
            <ChevronRight size={20} className="text-[#94A3B8]" />
          </button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-1">Preferences</h2>
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden shadow-lg">
          <div className="flex items-center justify-between h-14 px-4 border-b border-[#334155]">
            <span className="text-[16px] text-white">Dark Mode</span>
            <button 
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className={`relative w-10 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-500' : 'bg-[#334155]'}`}
            >
              <motion.div 
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: settings.darkMode ? 16 : 0 }}
              />
            </button>
          </div>
          <div className="flex items-center justify-between h-14 px-4 border-b border-[#334155]">
            <span className="text-[16px] text-white">Notifications</span>
            <button 
              onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
              className={`relative w-10 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-blue-500' : 'bg-[#334155]'}`}
            >
              <motion.div 
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: settings.notifications ? 16 : 0 }}
              />
            </button>
          </div>
          <button className="w-full flex items-center justify-between h-14 px-4 hover:bg-white/5 transition-colors">
            <span className="text-[16px] text-white">Start of Week</span>
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <span className="text-[15px]">{settings.startOfWeek}</span>
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-1">Data</h2>
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden shadow-lg">
          <button className="w-full flex items-center justify-between h-14 px-4 border-b border-[#334155] hover:bg-white/5 transition-colors">
            <span className="text-[16px] text-white">Export Data</span>
            <ChevronRight size={20} className="text-[#94A3B8]" />
          </button>
          <button className="w-full flex items-center justify-between h-14 px-4 hover:bg-red-500/5 transition-colors group">
            <span className="text-[16px] text-red-500 group-hover:text-red-400">Delete Account</span>
          </button>
        </div>
      </section>
    </main>
  </div>
);

const ManageGoalsScreen = ({ goals, onClose, onEditGoal }: { 
  goals: Goal[], 
  onClose: () => void,
  onEditGoal: (goal: Goal) => void
}) => (
  <motion.div 
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    className="fixed inset-0 bg-[#0F172A] z-[60] flex flex-col"
  >
    <header className="flex items-center p-4 justify-between border-b border-[#334155]">
      <button onClick={onClose} className="p-2 text-white hover:bg-[#1E293B] rounded-full">
        <ChevronLeft size={24} />
      </button>
      <h2 className="text-white text-[18px] font-bold tracking-tight font-heading">Manage Goals</h2>
      <div className="w-10" />
    </header>

    <main className="flex-1 px-4 py-6 overflow-y-auto">
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center text-[#94A3B8] mb-4">
            <Plus size={32} />
          </div>
          <p className="text-white font-bold text-lg mb-2">No goals yet</p>
          <p className="text-[#94A3B8] text-sm">Create your first goal to start tracking your progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => (
            <div 
              key={goal.id}
              onClick={() => onEditGoal(goal)}
              className="flex items-center justify-between p-4 bg-[#1E293B] rounded-lg border border-[#334155] cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-white font-bold">{goal.title}</span>
                <span className="text-[12px] text-[#94A3B8]">{goal.frequency} • {goal.targetValue} {goal.targetUnit}</span>
              </div>
              <ChevronRight size={20} className="text-[#94A3B8]" />
            </div>
          ))}
        </div>
      )}
    </main>
  </motion.div>
);

const GoalDetail = ({ goal, onClose, onSuspend, onDelete, onEdit }: { 
  goal: Goal, 
  onClose: () => void,
  onSuspend: (id: string) => void,
  onDelete: (id: string) => void,
  onEdit: (goal: Goal) => void
}) => {
  const [showManage, setShowManage] = useState(false);

  const completionRate = useMemo(() => {
    // Mocked completion rate for demo
    return 85;
  }, []);

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-[#0F172A] z-[60] flex flex-col"
    >
      <header className="flex items-center p-4 justify-between">
        <button onClick={onClose} className="p-2 text-white hover:bg-[#1E293B] rounded-full">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => setShowManage(true)} className="p-2 text-white hover:bg-[#1E293B] rounded-full">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main className="flex-1 px-4 overflow-y-auto pb-12">
        <div className="pt-6 pb-3">
          <h1 className="text-white text-[32px] font-bold leading-tight font-heading">{goal.title}</h1>
        </div>
        <p className="text-[#94A3B8] text-[13px] font-medium pb-6">Created {new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 bg-[#1E293B] p-4 rounded-lg border border-[#334155]">
            <p className="text-[11px] text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">Current Streak</p>
            <p className="text-2xl font-bold text-white">12 <span className="text-sm font-medium text-[#94A3B8]">days</span></p>
          </div>
          <div className="flex-1 bg-[#1E293B] p-4 rounded-lg border border-[#334155]">
            <p className="text-[11px] text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">Completion</p>
            <p className="text-2xl font-bold text-white">{completionRate}%</p>
          </div>
        </div>

        <div className="bg-[#1E293B] p-6 rounded-lg border border-[#334155]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white font-heading">October</h2>
            <div className="flex gap-2">
              <button className="p-1 text-[#94A3B8] hover:text-white"><ChevronLeft size={20} /></button>
              <button className="p-1 text-[#94A3B8] hover:text-white"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-[11px] font-bold text-[#94A3B8] uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-2 justify-items-center">
            {/* Mocked binary calendar grid */}
            {Array.from({ length: 31 }).map((_, i) => {
              const completed = Math.random() > 0.3;
              return (
                <div key={i} className="w-8 h-8 flex items-center justify-center">
                  {completed && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-center text-[11px] text-[#94A3B8] mt-6">Completed days are marked with a primary dot.</p>
      </main>

      <AnimatePresence>
        {showManage && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManage(false)}
              className="fixed inset-0 bg-black/40 z-[70]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 bg-[#1E293B] rounded-t-2xl shadow-2xl z-[80] border-t border-[#334155] pb-12"
            >
              <div className="w-full flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#334155] rounded-full" />
              </div>
              <div className="px-2 pt-2 flex flex-col">
                <button 
                  onClick={() => { onEdit(goal); setShowManage(false); }}
                  className="flex items-center gap-4 px-4 py-4 w-full text-left active:bg-black/20 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white">
                    <Plus size={20} />
                  </div>
                  <div>
                    <span className="text-[15px] font-bold text-white block">Edit Goal</span>
                    <span className="text-[13px] text-[#94A3B8]">Change title, frequency, or target</span>
                  </div>
                </button>
                <button 
                  onClick={() => { onSuspend(goal.id); setShowManage(false); }}
                  className="flex items-center gap-4 px-4 py-4 w-full text-left active:bg-black/20 rounded-xl transition-colors mt-1"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white">
                    <Pause size={20} />
                  </div>
                  <div>
                    <span className="text-[15px] font-bold text-white block">Suspend Goal</span>
                    <span className="text-[13px] text-[#94A3B8]">Pause tracking without losing history</span>
                  </div>
                </button>
                <button 
                  onClick={() => { onDelete(goal.id); setShowManage(false); onClose(); }}
                  className="flex items-center gap-4 px-4 py-4 w-full text-left active:bg-red-500/10 rounded-xl transition-colors mt-1"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <span className="text-[15px] font-bold text-red-500 block">Delete Goal</span>
                    <span className="text-[13px] text-[#94A3B8]">Permanently remove this goal and data</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NewGoalScreen = ({ onSave, onCancel, initialGoal }: { 
  onSave: (goal: Partial<Goal>) => void, 
  onCancel: () => void,
  initialGoal?: Goal | null
}) => {
  const [title, setTitle] = useState(initialGoal?.title || '');
  const [frequency, setFrequency] = useState<Frequency>(initialGoal?.frequency || 'Daily');
  const [targetValue, setTargetValue] = useState<number>(initialGoal?.targetValue || 0);
  const [targetUnit, setTargetUnit] = useState<Unit>(initialGoal?.targetUnit || 'times');
  const [reminders, setReminders] = useState(initialGoal?.smartReminders || false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    if (!title) return;
    onSave({
      id: initialGoal?.id,
      title,
      frequency,
      targetValue,
      targetUnit,
      smartReminders: reminders,
      createdAt: initialGoal?.createdAt || new Date().toISOString().split('T')[0],
      completions: initialGoal?.completions || [],
      isSuspended: initialGoal?.isSuspended || false
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onCancel();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-[#0F172A] z-[70] flex flex-col"
    >
      <header className="flex items-center px-4 py-4 justify-between border-b border-[#334155]">
        <button onClick={onCancel} className="p-2 text-white hover:bg-[#1E293B] rounded-full">
          <X size={24} />
        </button>
        <h2 className="text-white text-[18px] font-bold tracking-tight font-heading">{initialGoal ? 'Edit Goal' : 'New Goal'}</h2>
        <button 
          onClick={handleSave}
          disabled={!title}
          className={`px-4 py-1.5 rounded-full font-bold text-[15px] transition-all ${
            title ? 'bg-blue-500/10 text-blue-500 opacity-100' : 'bg-[#334155] text-[#94A3B8] opacity-50'
          }`}
        >
          Save
        </button>
      </header>

      <main className="flex-1 flex flex-col px-6 py-8 gap-10 overflow-y-auto">
        <div className="flex flex-col">
          <input 
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-[#334155] text-[24px] font-bold text-white placeholder:text-[#94A3B8] focus:ring-0 focus:border-blue-500 transition-colors py-3 px-0 font-heading"
            placeholder="What do you want to achieve?"
          />
        </div>

        <section className="flex flex-col gap-4">
          <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider">Frequency</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {(['Daily', 'Weekdays', 'Weekly'] as Frequency[]).map(f => (
              <button 
                key={f}
                onClick={() => setFrequency(f)}
                className={`shrink-0 h-8 px-4 rounded-full font-bold text-[15px] transition-all ${
                  frequency === f ? 'bg-blue-500 text-white' : 'bg-[#1E293B] text-white border border-[#334155]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider">Target</h3>
          <div className="flex items-center gap-4 bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <input 
              type="number"
              value={targetValue || ''}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className="flex-1 bg-[#0F172A] border-0 rounded-md text-xl font-bold text-white placeholder:text-[#94A3B8] focus:ring-1 focus:ring-blue-500 py-3 px-4 font-heading"
              placeholder="0"
            />
            <div className="w-[120px] relative">
              <select 
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value as Unit)}
                className="w-full appearance-none bg-[#0F172A] border-0 rounded-md text-[15px] font-bold text-white focus:ring-1 focus:ring-blue-500 py-3 pl-4 pr-10"
              >
                <option value="times">times</option>
                <option value="mins">mins</option>
                <option value="pages">pages</option>
                <option value="liters">liters</option>
              </select>
              <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-white">Smart Reminders</span>
              <span className="text-[13px] text-[#94A3B8]">Notify me if I forget</span>
            </div>
            <button 
              onClick={() => setReminders(!reminders)}
              className={`relative w-10 h-6 rounded-full transition-colors ${reminders ? 'bg-blue-500' : 'bg-[#334155]'}`}
            >
              <motion.div 
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: reminders ? 16 : 0 }}
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
            <CheckCircle2 size={20} className="text-blue-500" />
            <span className="text-[14px] font-bold">Goal saved successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isManagingGoals, setIsManagingGoals] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    notifications: true,
    startOfWeek: 'Monday'
  });

  const handleToggleGoal = (id: string) => {
    const today = getTodayISO();
    setGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const alreadyCompleted = goal.completions.includes(today);
        return {
          ...goal,
          completions: alreadyCompleted 
            ? goal.completions.filter(c => c !== today)
            : [...goal.completions, today]
        };
      }
      return goal;
    }));
  };

  const handleSaveGoal = (goalData: Partial<Goal>) => {
    if (goalData.id) {
      // Update existing
      setGoals(prev => prev.map(g => g.id === goalData.id ? { ...g, ...goalData } as Goal : g));
    } else {
      // Create new
      const goal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        title: goalData.title!,
        frequency: goalData.frequency!,
        targetValue: goalData.targetValue!,
        targetUnit: goalData.targetUnit!,
        smartReminders: goalData.smartReminders!,
        createdAt: new Date().toISOString().split('T')[0],
        completions: [],
        isSuspended: false
      };
      setGoals(prev => [...prev, goal]);
    }
    setEditingGoal(null);
  };

  const handleSuspendGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, isSuspended: !g.isSuspended } : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className={`min-h-screen bg-[#0F172A] text-white font-sans selection:bg-blue-500/30`}>
      <div className="max-w-md mx-auto h-screen relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden"
            >
              <Dashboard 
                goals={goals} 
                onToggleGoal={handleToggleGoal} 
                onAddGoal={() => setIsAddingGoal(true)}
                onSelectGoal={setSelectedGoal}
              />
            </motion.div>
          )}
          {activeTab === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden"
            >
              <Consistency goals={goals} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden"
            >
              <SettingsScreen 
                user={DUMMY_USER} 
                settings={settings} 
                onUpdateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))} 
                onManageGoals={() => setIsManagingGoals(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence>
          {selectedGoal && (
            <GoalDetail 
              goal={selectedGoal} 
              onClose={() => setSelectedGoal(null)}
              onSuspend={handleSuspendGoal}
              onDelete={handleDeleteGoal}
              onEdit={(g) => { setEditingGoal(g); setSelectedGoal(null); }}
            />
          )}
          {isManagingGoals && (
            <ManageGoalsScreen 
              goals={goals} 
              onClose={() => setIsManagingGoals(false)}
              onEditGoal={(g) => setEditingGoal(g)}
            />
          )}
          {(isAddingGoal || editingGoal) && (
            <NewGoalScreen 
              initialGoal={editingGoal}
              onSave={handleSaveGoal}
              onCancel={() => { setIsAddingGoal(false); setEditingGoal(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
