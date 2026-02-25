import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Heart, 
  BarChart3, 
  LogOut, 
  Moon, 
  Languages,
  ChevronDown,
  ChevronUp,
  Plus,
  Trophy,
  Star,
  Zap,
  Smile
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { REWARD_CONFIG } from './lib/constants';
import { cn, formatNumber } from './lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Components ---

const Card = ({ children, className, title }: { children: React.ReactNode; className?: string; title?: string; key?: React.Key }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl", className)}
  >
    {title && <h3 className="text-xl font-semibold mb-4 text-gold-400">{title}</h3>}
    {children}
  </motion.div>
);

const Checkbox = ({ label, checked, onChange, points }: { label: string; checked: boolean; onChange: (val: boolean) => void; points?: number; key?: React.Key }) => (
  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
        checked ? "bg-emerald-500 border-emerald-500" : "border-white/30 group-hover:border-emerald-400"
      )}>
        {checked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckSquare className="w-4 h-4 text-white" /></motion.div>}
      </div>
      <span className={cn("text-white/80 group-hover:text-white transition-colors", checked && "text-white")}>{label}</span>
    </div>
    {points !== undefined && <span className="text-xs font-mono text-gold-400/80">+{points}</span>}
    <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </label>
);

// --- Pages ---

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const progress = (user?.totalReward || 0) / REWARD_CONFIG.TARGET_REWARD;
  const percentage = Math.min(Math.round(progress * 100), 100);

  const getMilestone = () => {
    if (percentage < 25) return t('milestone_0');
    if (percentage < 50) return t('milestone_25');
    if (percentage < 75) return t('milestone_50');
    return t('milestone_75');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Assalamu Alaikum, <span className="text-emerald-400">{user?.name}</span>
        </h1>
        <p className="text-white/60">{t('dashboard')}</p>
      </header>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy size={120} className="text-gold-400" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-sm uppercase tracking-widest mb-1">{t('total_reward')}</p>
              <h2 className="text-5xl font-bold text-gold-400 font-mono">{formatNumber(user?.totalReward || 0)}</h2>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm uppercase tracking-widest mb-1">{t('target')}</p>
              <p className="text-2xl font-semibold text-white/80 font-mono">{formatNumber(REWARD_CONFIG.TARGET_REWARD)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80 font-medium">{getMilestone()}</span>
              <span className="text-emerald-400 font-bold">{percentage}%</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title={t('salah')} className="hover:border-emerald-500/30 transition-colors cursor-pointer">
          <p className="text-white/60 text-sm">Track your daily prayers and earn rewards for Jamaat and Khushu.</p>
        </Card>
        <Card title={t('tilawat')} className="hover:border-emerald-500/30 transition-colors cursor-pointer">
          <p className="text-white/60 text-sm">Log your Quran reading progress with understanding and tajweed.</p>
        </Card>
        <Card title={t('good_deeds')} className="hover:border-emerald-500/30 transition-colors cursor-pointer">
          <p className="text-white/60 text-sm">Record your daily acts of kindness and community service.</p>
        </Card>
      </div>
    </div>
  );
};

const SalahPage = ({ data, onSave }: { data: any; onSave: (newData: any) => void }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>('FAJR');

  const prayers = [
    { id: 'FAJR', name: t('fajr'), base: REWARD_CONFIG.FARD.FAJR.base },
    { id: 'ZOHR', name: t('zohr'), base: REWARD_CONFIG.FARD.ZOHR.base },
    { id: 'ASR', name: t('asr'), base: REWARD_CONFIG.FARD.ASR.base },
    { id: 'MAGHRIB', name: t('maghrib'), base: REWARD_CONFIG.FARD.MAGHRIB.base },
    { id: 'ISHA', name: t('isha'), base: REWARD_CONFIG.FARD.ISHA.base },
  ];

  const handleToggle = (prayerId: string, field: string, val: boolean) => {
    const newData = { ...data };
    if (!newData[prayerId]) newData[prayerId] = {};
    newData[prayerId][field] = val;
    onSave(newData);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">{t('salah')}</h1>
        <p className="text-white/60">Daily Fard Prayers Tracking</p>
      </header>

      <div className="space-y-4">
        {prayers.map((prayer) => (
          <Card key={prayer.id} className="p-0 overflow-hidden">
            <button 
              onClick={() => setExpanded(expanded === prayer.id ? null : prayer.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border",
                  data[prayer.id]?.completed ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"
                )}>
                  <Moon size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">{prayer.name}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Base: {prayer.base} Points</p>
                </div>
              </div>
              {expanded === prayer.id ? <ChevronUp /> : <ChevronDown />}
            </button>

            <AnimatePresence>
              {expanded === prayer.id && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/10 bg-black/20"
                >
                  <div className="p-4 space-y-1">
                    <Checkbox label="Fard Completed" checked={!!data[prayer.id]?.completed} onChange={(v) => handleToggle(prayer.id, 'completed', v)} points={prayer.base} />
                    <Checkbox label="With Jamaat" checked={!!data[prayer.id]?.jamaat} onChange={(v) => handleToggle(prayer.id, 'jamaat', v)} points={500} />
                    <Checkbox label="In Masjid" checked={!!data[prayer.id]?.masjid} onChange={(v) => handleToggle(prayer.id, 'masjid', v)} points={300} />
                    <Checkbox label="On Time" checked={!!data[prayer.id]?.onTime} onChange={(v) => handleToggle(prayer.id, 'onTime', v)} points={200} />
                    <Checkbox label="With Khushu" checked={!!data[prayer.id]?.khushu} onChange={(v) => handleToggle(prayer.id, 'khushu', v)} points={300} />
                    <Checkbox label="Sunnah Before" checked={!!data[prayer.id]?.sunnahBefore} onChange={(v) => handleToggle(prayer.id, 'sunnahBefore', v)} points={200} />
                    <Checkbox label="Sunnah After" checked={!!data[prayer.id]?.sunnahAfter} onChange={(v) => handleToggle(prayer.id, 'sunnahAfter', v)} points={200} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </div>
  );
};

const NaflPage = ({ data, onSave }: { data: any; onSave: (newData: any) => void }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>('TAHAJJUD');

  const nafls = [
    { id: 'TAHAJJUD', name: t('tahajjud'), base: REWARD_CONFIG.NAFL.TAHAJJUD.base },
    { id: 'ISHRAQ', name: t('ishraq'), base: REWARD_CONFIG.NAFL.ISHRAQ.base },
    { id: 'CHASHT', name: t('chasht'), base: REWARD_CONFIG.NAFL.CHASHT.base },
    { id: 'AWWABEEN', name: t('awwabeen'), base: REWARD_CONFIG.NAFL.AWWABEEN.base },
  ];

  const handleToggle = (naflId: string, field: string, val: boolean) => {
    const newData = { ...data };
    if (!newData[naflId]) newData[naflId] = {};
    newData[naflId][field] = val;
    onSave(newData);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">{t('nafl')}</h1>
        <p className="text-white/60">Optional Prayers Tracking</p>
      </header>

      <div className="space-y-4">
        {nafls.map((nafl) => (
          <Card key={nafl.id} className="p-0 overflow-hidden">
            <button 
              onClick={() => setExpanded(expanded === nafl.id ? null : nafl.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border",
                  data[nafl.id]?.completed ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"
                )}>
                  <Star size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">{nafl.name}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Base: {nafl.base} Points</p>
                </div>
              </div>
              {expanded === nafl.id ? <ChevronUp /> : <ChevronDown />}
            </button>

            <AnimatePresence>
              {expanded === nafl.id && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/10 bg-black/20"
                >
                  <div className="p-4 space-y-1">
                    <Checkbox label="Completed" checked={!!data[nafl.id]?.completed} onChange={(v) => handleToggle(nafl.id, 'completed', v)} points={nafl.base} />
                    <Checkbox label="2 Rakats" checked={!!data[nafl.id]?.rakats2} onChange={(v) => handleToggle(nafl.id, 'rakats2', v)} points={50} />
                    <Checkbox label="4 Rakats" checked={!!data[nafl.id]?.rakats4} onChange={(v) => handleToggle(nafl.id, 'rakats4', v)} points={100} />
                    <Checkbox label="With Dua" checked={!!data[nafl.id]?.withDua} onChange={(v) => handleToggle(nafl.id, 'withDua', v)} points={50} />
                    <Checkbox label="Streak Bonus" checked={!!data[nafl.id]?.streak} onChange={(v) => handleToggle(nafl.id, 'streak', v)} points={50} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TilawatPage = ({ data, onSave }: { data: any; onSave: (newData: any) => void }) => {
  const { t } = useLanguage();
  const handleToggle = (field: string, val: boolean) => {
    onSave({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">{t('tilawat')}</h1>
        <p className="text-white/60">Quran Reading Progress</p>
      </header>

      <Card title="Reading Amount">
        <div className="space-y-1">
          <Checkbox label="1 Page" checked={!!data.page1} onChange={(v) => handleToggle('page1', v)} points={20} />
          <Checkbox label="2 Pages" checked={!!data.page2} onChange={(v) => handleToggle('page2', v)} points={40} />
          <Checkbox label="5 Pages" checked={!!data.page5} onChange={(v) => handleToggle('page5', v)} points={100} />
          <Checkbox label="10 Pages" checked={!!data.page10} onChange={(v) => handleToggle('page10', v)} points={200} />
          <Checkbox label="1 Juz" checked={!!data.juz1} onChange={(v) => handleToggle('juz1', v)} points={300} />
        </div>
      </Card>

      <Card title="Quality & Effort">
        <div className="space-y-1">
          <Checkbox label="With Tajweed" checked={!!data.tajweed} onChange={(v) => handleToggle('tajweed', v)} points={50} />
          <Checkbox label="With Understanding" checked={!!data.understanding} onChange={(v) => handleToggle('understanding', v)} points={100} />
          <Checkbox label="Memorization" checked={!!data.memorization} onChange={(v) => handleToggle('memorization', v)} points={200} />
          <Checkbox label="Revision" checked={!!data.revision} onChange={(v) => handleToggle('revision', v)} points={100} />
        </div>
      </Card>
    </div>
  );
};

const MamulatPage = ({ data, onSave }: { data: any; onSave: (newData: any) => void }) => {
  const { t } = useLanguage();
  const handleToggle = (section: string, field: string, val: boolean) => {
    const newData = { ...data };
    if (!newData[section]) newData[section] = {};
    newData[section][field] = val;
    onSave(newData);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">{t('mamulat')}</h1>
        <p className="text-white/60">Daily Dua & Zikr</p>
      </header>

      <Card title="Section A: Dua">
        <div className="space-y-1">
          <Checkbox label="Morning Dua" checked={!!data.DUA?.morning} onChange={(v) => handleToggle('DUA', 'morning', v)} points={20} />
          <Checkbox label="Evening Dua" checked={!!data.DUA?.evening} onChange={(v) => handleToggle('DUA', 'evening', v)} points={20} />
          <Checkbox label="After Salah Dua" checked={!!data.DUA?.afterSalah} onChange={(v) => handleToggle('DUA', 'afterSalah', v)} points={10} />
          <Checkbox label="Personal Dua" checked={!!data.DUA?.personal} onChange={(v) => handleToggle('DUA', 'personal', v)} points={30} />
        </div>
      </Card>

      <Card title="Section B: Zikr">
        <div className="space-y-1">
          <Checkbox label="100x SubhanAllah" checked={!!data.ZIKR?.subhanallah100} onChange={(v) => handleToggle('ZIKR', 'subhanallah100', v)} points={20} />
          <Checkbox label="100x Alhamdulillah" checked={!!data.ZIKR?.alhamdulillah100} onChange={(v) => handleToggle('ZIKR', 'alhamdulillah100', v)} points={20} />
          <Checkbox label="100x Allahu Akbar" checked={!!data.ZIKR?.allahuakbar100} onChange={(v) => handleToggle('ZIKR', 'allahuakbar100', v)} points={20} />
          <Checkbox label="100x Astaghfirullah" checked={!!data.ZIKR?.astaghfirullah100} onChange={(v) => handleToggle('ZIKR', 'astaghfirullah100', v)} points={30} />
          <Checkbox label="100x Durood" checked={!!data.ZIKR?.durood100} onChange={(v) => handleToggle('ZIKR', 'durood100', v)} points={40} />
          <Checkbox label="Ayatul Kursi" checked={!!data.ZIKR?.ayatulKursi} onChange={(v) => handleToggle('ZIKR', 'ayatulKursi', v)} points={20} />
          <Checkbox label="Surah Ikhlas x3" checked={!!data.ZIKR?.surahIkhlas3} onChange={(v) => handleToggle('ZIKR', 'surahIkhlas3', v)} points={30} />
        </div>
      </Card>
    </div>
  );
};

const GoodDeedsPage = ({ data, onSave }: { data: any; onSave: (newData: any) => void }) => {
  const { t } = useLanguage();
  const handleToggle = (field: string, val: boolean) => {
    onSave({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">{t('good_deeds')}</h1>
        <p className="text-white/60">Acts of Kindness</p>
      </header>

      <Card title="Daily Deeds">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(REWARD_CONFIG.GOOD_DEEDS).map(([key, points]) => (
            <Checkbox 
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              checked={!!data[key]}
              onChange={(v) => handleToggle(key, v)}
              points={points}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

const StatsPage = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setStats(data));
  }, [token]);

  if (!stats) return <div className="text-white">Loading stats...</div>;

  const chartData = {
    labels: stats.records.map((r: any) => r.date),
    datasets: [
      {
        label: 'Daily Reward',
        data: stats.records.map((r: any) => r.dailyTotal),
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10b981',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } },
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
    },
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">{t('stats')}</h1>
        <p className="text-white/60">Your spiritual growth over time</p>
      </header>

      <Card title="Reward History">
        <div className="h-[300px]">
          <Line data={chartData} options={options} />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-white/40 text-xs uppercase mb-1">Total Points</p>
          <p className="text-2xl font-bold text-gold-400 font-mono">{formatNumber(stats.totalReward)}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-white/40 text-xs uppercase mb-1">Days Tracked</p>
          <p className="text-2xl font-bold text-white font-mono">{stats.records.length}</p>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const { user, token, login, logout, updateReward } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (token) {
      fetch('/api/records/today', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setTodayRecord({
          ...data,
          fardPrayers: JSON.parse(data.fardPrayers || '{}'),
          naflPrayers: JSON.parse(data.naflPrayers || '{}'),
          tilawat: JSON.parse(data.tilawat || '{}'),
          mamulat: JSON.parse(data.mamulat || '{}'),
          goodDeeds: JSON.parse(data.goodDeeds || '{}'),
        });
      });
    }
  }, [token]);

  const calculateDailyTotal = (record: any) => {
    let total = 0;
    
    // Fard
    Object.entries(record.fardPrayers).forEach(([id, vals]: [string, any]) => {
      const config = REWARD_CONFIG.FARD[id as keyof typeof REWARD_CONFIG.FARD];
      if (vals.completed) total += config.base;
      if (vals.jamaat) total += 500;
      if (vals.masjid) total += 300;
      if (vals.onTime) total += 200;
      if (vals.khushu) total += 300;
      if (vals.sunnahBefore) total += 200;
      if (vals.sunnahAfter) total += 200;
    });

    // Nafl
    Object.entries(record.naflPrayers).forEach(([id, vals]: [string, any]) => {
      const config = REWARD_CONFIG.NAFL[id as keyof typeof REWARD_CONFIG.NAFL];
      if (vals.completed) total += config.base;
      if (vals.rakats2) total += 50;
      if (vals.rakats4) total += 100;
      if (vals.withDua) total += 50;
      if (vals.streak) total += 50;
    });

    // Tilawat
    Object.entries(record.tilawat).forEach(([key, val]) => {
      if (val) total += (REWARD_CONFIG.TILAWAT as any)[key] || 0;
    });

    // Mamulat
    Object.entries(record.mamulat).forEach(([section, fields]: [string, any]) => {
      Object.entries(fields).forEach(([field, val]) => {
        if (val) total += (REWARD_CONFIG.MAMULAT as any)[section][field] || 0;
      });
    });

    // Good Deeds
    Object.entries(record.goodDeeds).forEach(([key, val]) => {
      if (val) total += (REWARD_CONFIG.GOOD_DEEDS as any)[key] || 0;
    });

    return total;
  };

  const handleSaveRecord = async (section: string, newData: any) => {
    const updatedRecord = { ...todayRecord, [section]: newData };
    const newTotal = calculateDailyTotal(updatedRecord);
    updatedRecord.dailyTotal = newTotal;
    
    setTodayRecord(updatedRecord);

    const res = await fetch('/api/records/save', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...updatedRecord,
        date: new Date().toISOString().split('T')[0]
      })
    });

    if (res.ok) {
      const statsRes = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      updateReward(statsData.totalReward);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isAuthMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });
    const data = await res.json();
    if (data.token) {
      login(data.token, data.user);
    } else {
      alert(data.error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#062c1b] flex items-center justify-center p-6 font-sans">
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <Moon className="text-emerald-400 w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">IbadahMate</h1>
            <p className="text-white/40">Your spiritual companion</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isAuthMode === 'register' && (
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-all"
                value={authForm.name}
                onChange={e => setAuthForm({...authForm, name: e.target.value})}
                required
              />
            )}
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-all"
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-all"
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
              required
            />
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20">
              {isAuthMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsAuthMode(isAuthMode === 'login' ? 'register' : 'login')}
              className="text-white/40 hover:text-emerald-400 text-sm transition-colors"
            >
              {isAuthMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#062c1b] text-white font-sans pb-24 md:pb-0 md:pl-64">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-black/20 border-r border-white/10 p-6 z-50">
        <div className="flex items-center gap-3 mb-12">
          <Moon className="text-emerald-400" />
          <h1 className="text-xl font-bold tracking-tight">IbadahMate</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
            { id: 'salah', icon: Moon, label: t('salah') },
            { id: 'nafl', icon: Star, label: t('nafl') },
            { id: 'tilawat', icon: BookOpen, label: t('tilawat') },
            { id: 'mamulat', icon: Zap, label: t('mamulat') },
            { id: 'good_deeds', icon: Heart, label: t('good_deeds') },
            { id: 'stats', icon: BarChart3, label: t('stats') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === item.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10 space-y-4">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center gap-3 p-3 text-white/40 hover:text-white transition-colors"
          >
            <Languages size={20} />
            <span>{language === 'en' ? 'Arabic' : 'English'}</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 text-white/40 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#062c1b]/80 backdrop-blur-xl border-t border-white/10 flex justify-around p-4 z-50">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'salah', icon: Moon },
          { id: 'nafl', icon: Star },
          { id: 'tilawat', icon: BookOpen },
          { id: 'mamulat', icon: Zap },
          { id: 'good_deeds', icon: Heart },
          { id: 'stats', icon: BarChart3 },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "p-2 rounded-xl transition-all",
              activeTab === item.id ? "text-emerald-400" : "text-white/40"
            )}
          >
            <item.icon size={24} />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'salah' && todayRecord && (
              <SalahPage data={todayRecord.fardPrayers} onSave={(d) => handleSaveRecord('fardPrayers', d)} />
            )}
            {activeTab === 'nafl' && todayRecord && (
              <NaflPage data={todayRecord.naflPrayers} onSave={(d) => handleSaveRecord('naflPrayers', d)} />
            )}
            {activeTab === 'tilawat' && todayRecord && (
              <TilawatPage data={todayRecord.tilawat} onSave={(d) => handleSaveRecord('tilawat', d)} />
            )}
            {activeTab === 'mamulat' && todayRecord && (
              <MamulatPage data={todayRecord.mamulat} onSave={(d) => handleSaveRecord('mamulat', d)} />
            )}
            {activeTab === 'good_deeds' && todayRecord && (
              <GoodDeedsPage data={todayRecord.goodDeeds} onSave={(d) => handleSaveRecord('goodDeeds', d)} />
            )}
            {activeTab === 'stats' && <StatsPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
