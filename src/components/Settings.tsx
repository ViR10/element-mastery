import { motion } from 'motion/react';
import { Volume2, Mic, Clock, Moon, Trash2, ShieldCheck, HelpCircle, ChevronRight, Bell } from 'lucide-react';
import { AppSettings } from '../logic/SettingsManager';
import { playSound, vibrate } from '../logic/InteractionManager';
import { QuizEngine } from '../logic/QuizEngine';

interface SettingsProps {
  key?: string;
  settings: AppSettings;
  onToggle: (key: keyof AppSettings) => void;
}

export default function Settings({ settings, onToggle }: SettingsProps) {
  const profile = QuizEngine.getProfile();

  const handleReset = () => {
    if (confirm("This will permanently delete all your XP, Streaks, and Mastered elements. Are you sure?")) {
      localStorage.clear();
      vibrate(100);
      window.location.reload();
    }
  };

  const SettingToggle = ({ icon: Icon, label, desc, value, toggleKey, color }: any) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-3">
      <div className="flex items-center space-x-4 min-w-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${value ? color : 'bg-gray-50 text-gray-400'}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-sm text-gray-800 dark:text-white leading-tight">{label}</h4>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate">{desc}</p>
        </div>
      </div>
      
      <button 
        onClick={() => {
          vibrate(30);
          if (settings.soundEnabled || toggleKey === 'soundEnabled') playSound('click');
          onToggle(toggleKey);
        }}
        className={`w-12 h-7 rounded-full p-1 transition-all duration-300 relative ${value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <motion.div 
          className="w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ x: value ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      
      {/* Profile Summary Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[32px] shadow-lg text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl">
            {profile.classCode.charAt(0)}
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Current XP</div>
            <div className="text-3xl font-black">{profile.xp}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-black leading-none">{profile.classCode}</div>
            <div className="text-[10px] font-bold opacity-70 mt-1 uppercase">Active Class Group</div>
          </div>
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase">
            {profile.dailyStreak} Day Streak
          </div>
        </div>
      </div>

      {/* Main Settings Section */}
      <div>
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Preferences</h3>
        <div className="space-y-1">
          <SettingToggle 
            icon={Volume2} 
            label="Interactive Audio" 
            desc="Feedback sounds & clicks"
            value={settings.soundEnabled} 
            toggleKey="soundEnabled"
            color="bg-blue-50 text-blue-600"
          />
          <SettingToggle 
            icon={Mic} 
            label="Voice Readout" 
            desc="Listen to element data (OFF by default)"
            value={settings.voiceEnabled} 
            toggleKey="voiceEnabled"
            color="bg-purple-50 text-purple-600"
          />
          <SettingToggle 
            icon={Moon} 
            label="Dark Mode" 
            desc="Battery saving interface"
            value={settings.darkMode} 
            toggleKey="darkMode"
            color="bg-slate-800 text-white"
          />
        </div>
      </div>

      {/* Account / Support Section */}
      <div>
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Help & Safety</h3>
        <div className="bg-white dark:bg-gray-800 rounded-[28px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <ShieldCheck className="text-emerald-500" size={20} />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center space-x-4">
              <HelpCircle className="text-blue-500" size={20} />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Support Center</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4">
        <button 
          onClick={handleReset}
          className="w-full flex items-center justify-center space-x-2 text-rose-500 bg-rose-50 dark:bg-rose-950/20 font-black p-5 rounded-3xl border-2 border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 transition-all active:scale-95"
        >
          <Trash2 size={20} />
          <span className="text-sm uppercase tracking-wider">Wipe All Progress</span>
        </button>
        <p className="text-center text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">
          Element Mastery v2.0 • Build 2026.05
        </p>
      </div>

    </div>
  );
}
