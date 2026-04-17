import { motion } from 'motion/react';
import { X, Volume2, Mic, Clock, Moon, Trash2 } from 'lucide-react';
import { AppSettings } from '../logic/SettingsManager';
import { playSound } from '../logic/InteractionManager';

interface SettingsProps {
  key?: string;
  settings: AppSettings;
  onToggle: (key: keyof AppSettings) => void;
}

export default function Settings({ settings, onToggle }: SettingsProps) {
  
  const ToggleRow = ({ icon: Icon, label, value, toggleKey }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl mb-3">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <Icon size={20} className="text-[#4FACFE]" />
        </div>
        <span className="font-semibold text-lg">{label}</span>
      </div>
      <button 
        onClick={() => {
          if (settings.soundEnabled || toggleKey === 'soundEnabled') playSound('click');
          onToggle(toggleKey);
        }}
        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <motion.div 
          className="w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ x: value ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );

  return (
    <div className="w-full h-full p-4 md:p-0 flex flex-col items-center">
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[32px] p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>

        <div className="space-y-2">
          <ToggleRow icon={Volume2} label="Sound Effects" value={settings.soundEnabled} toggleKey="soundEnabled" />
          <ToggleRow icon={Mic} label="Voice Readout" value={settings.voiceEnabled} toggleKey="voiceEnabled" />
          <ToggleRow icon={Clock} label="Quiz Timer" value={settings.timerEnabled} toggleKey="timerEnabled" />
          <ToggleRow icon={Moon} label="Dark Mode" value={settings.darkMode} toggleKey="darkMode" />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => {
              localStorage.removeItem('elementStats');
              alert('Progress reset successfully!');
            }}
            className="w-full flex items-center justify-center space-x-2 text-red-500 font-bold p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={20} />
            <span>Reset Progress</span>
          </button>
        </div>

      </div>
    </div>
  );
}
