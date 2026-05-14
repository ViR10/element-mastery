import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Target, Flame, Trophy, TestTube2, Sparkles, FileText, Layers, Clock, Ghost, Bomb } from 'lucide-react';
import { QuizMode, QuizEngine } from '../logic/QuizEngine';
import { AppSettings } from '../logic/SettingsManager';
import { vibrate, playSound } from '../logic/InteractionManager';

interface HomeProps {
  key?: string;
  onStartQuiz: (mode: QuizMode, range?: [number, number]) => void;
  settings: AppSettings;
}

const MODES = [
  { id: 'mcq' as QuizMode, label: 'Multiple Choice', icon: Sparkles, color: 'border-purple-400', iconColor: 'text-purple-500', desc: 'Standard 4-option testing' },
  { id: 'fillblank' as QuizMode, label: 'Fill-in-the-Blank', icon: FileText, color: 'border-amber-400', iconColor: 'text-amber-500', desc: 'Type exact characters' },
  { id: 'builder' as QuizMode, label: 'Compound Builder', icon: Layers, color: 'border-emerald-400', iconColor: 'text-emerald-500', desc: 'Valency criss-cross method' },
  { id: 'survival' as QuizMode, label: 'Survival Mode', icon: Bomb, color: 'border-rose-500', iconColor: 'text-rose-600', desc: 'Timer Bomb: Fast & Accurate' },
  { id: 'daily' as QuizMode, label: 'Daily Challenge', icon: Target, color: 'border-indigo-400', iconColor: 'text-indigo-500', desc: 'Global Seeded 5 Questions' },
  { id: 'ghost' as QuizMode, label: 'Ghost Mode', icon: Ghost, color: 'border-slate-800', iconColor: 'text-slate-900', desc: '20 questions mix - Ultimate test' },
];

export default function Home({ onStartQuiz, settings }: HomeProps) {
  const [selectedMode, setSelectedMode] = useState<QuizMode>('mcq');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const profile = QuizEngine.getProfile();
  const activeMode = MODES.find(m => m.id === selectedMode) || MODES[0];

  const handleStartInitial = () => {
    vibrate(50);
    if (settings.soundEnabled) playSound('click');
    
    // Default range for all elements
    const defaultRange: [number, number] = [1, 150];
    onStartQuiz(selectedMode, defaultRange);
  };

  const ActiveIcon = activeMode.icon;

  return (
    <div className="flex flex-col h-full items-center justify-between sm:justify-center relative pb-6 max-w-md mx-auto w-full px-2">

      {/* Top Gamified Profile Header Strip */}
      <div className="w-full pt-2 pb-1 flex justify-between items-center">
        <div className="flex items-center space-x-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
          <Trophy size={15} className="text-amber-500" />
          <span className="text-xs font-black text-gray-700 dark:text-gray-200">{profile.xp} XP</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-900/40">
            <Flame size={15} className="text-orange-500 fill-orange-500" />
            <span className="text-xs font-black text-orange-600 dark:text-orange-400">{profile.dailyStreak}d</span>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-full text-[10px] font-black tracking-wider border border-indigo-100 dark:border-indigo-900/40">
            {profile.classCode}
          </div>
        </div>
      </div>

      {/* Center Content Card custom optimized for pure responsive mobile app UI */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-2">
        <div className="w-full bg-white dark:bg-gray-800 rounded-[32px] shadow-xl p-6 sm:p-8 flex flex-col items-center border border-gray-100 dark:border-gray-700/60">
          
          {/* Real SVG Icon Container */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 shrink-0">
            <TestTube2 size={40} className="text-white" strokeWidth={2.5} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black mb-6 text-center text-gray-800 dark:text-white tracking-tight">
            Ready to Learn?
          </h2>

          {/* Fully Responsive Mobile Dropdown Selector with Pure SVGs */}
          <div className="relative w-full mb-8">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
              Select Training Mode
            </div>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 ${activeMode.color} bg-gray-50 dark:bg-gray-900/50 transition-all text-left shadow-sm`}
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm shrink-0 ${activeMode.iconColor}`}>
                  <ActiveIcon size={22} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm sm:text-base leading-tight text-gray-800 dark:text-white truncate">
                    {activeMode.label}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-medium">
                    {activeMode.desc}
                  </div>
                </div>
              </div>
              <ChevronDown size={20} className={`text-gray-400 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options Container */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 max-h-64 overflow-y-auto"
                >
                  {MODES.map((mode) => {
                    const ModeIcon = mode.icon;
                    const isSelected = selectedMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setSelectedMode(mode.id);
                          setIsDropdownOpen(false);
                          vibrate(20);
                          if (settings.soundEnabled) playSound('click');
                        }}
                        className={`w-full flex items-center space-x-3.5 p-3.5 transition-colors text-left border-b border-gray-50 dark:border-gray-700/40 last:border-none ${isSelected ? 'bg-indigo-50/60 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? mode.iconColor : 'text-gray-400'}`}>
                          <ModeIcon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-gray-700 dark:text-gray-200'}`}>
                            {mode.label}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {mode.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Premium Mobile Push-Down Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartInitial}
            className="w-full bg-[#FF9800] text-white font-black text-base sm:text-lg py-4 rounded-[18px] shadow-[0_6px_0_0_#F57C00] active:shadow-[0_0px_0_0_#F57C00] active:translate-y-[6px] transition-all tracking-wide"
          >
            START QUIZ
          </motion.button>
        </div>
      </div>

    </div>
  );
}
