import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Target } from 'lucide-react';
import { QuizMode } from '../logic/QuizEngine';
import { AppSettings } from '../logic/SettingsManager';
import { vibrate, playSound } from '../logic/InteractionManager';

interface HomeProps {
  key?: string;
  onStartQuiz: (mode: QuizMode, range?: [number, number]) => void;
  settings: AppSettings;
}

const MODES: { id: QuizMode; label: string; icon: string; color: string }[] = [
  { id: 'mixed', label: 'Mixed Mode', icon: '🎲', color: 'border-purple-400' },
  { id: 'positive', label: 'Positive Valency', icon: '🟢', color: 'border-green-400' },
  { id: 'negative', label: 'Negative Valency', icon: '🔴', color: 'border-red-400' },
  { id: 'reverse', label: 'Reverse Mode', icon: '🔁', color: 'border-blue-400' },
  { id: 'symbol', label: 'Symbol Mode', icon: '🔤', color: 'border-yellow-400' },
  { id: 'smart', label: 'Smart Mode', icon: '🧠', color: 'border-indigo-400' },
  { id: 'builder', label: 'Formula Builder', icon: '🏗️', color: 'border-cyan-400' },
  { id: 'survival', label: 'Survival Mode', icon: '❤️‍🔥', color: 'border-red-500' },
  { id: 'timeattack', label: 'Time Attack', icon: '⏱️', color: 'border-orange-500' },
];

const RANGES = [
  { label: 'Elements 1 - 20 (Beginner)', range: [1, 20] as [number, number] },
  { label: 'Elements 21 - 40', range: [21, 40] as [number, number] },
  { label: 'Elements 41 - 60', range: [41, 60] as [number, number] },
  { label: 'All Elements (1 - 118)', range: [1, 118] as [number, number] },
];

export default function Home({ onStartQuiz, settings }: HomeProps) {
  const [selectedMode, setSelectedMode] = useState<QuizMode>('mixed');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRangePopup, setShowRangePopup] = useState(false);

  const activeMode = MODES.find(m => m.id === selectedMode)!;

  const handleStartInitial = () => {
    vibrate(50);
    if (settings.soundEnabled) playSound('click');
    setShowRangePopup(true);
  };

  const handleStartQuizWithRange = (range: [number, number]) => {
    vibrate(50);
    if (settings.soundEnabled) playSound('click');
    setShowRangePopup(false);
    onStartQuiz(selectedMode, range);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center relative">

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 w-full">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[32px] shadow-xl p-8 flex flex-col items-center">
          
          <div className="w-24 h-24 bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] rounded-full flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
            <span className="text-4xl">🧪</span>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center">Ready to Learn?</h2>

          <div className="relative w-full mb-8">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 ${activeMode.color} bg-gray-50 dark:bg-gray-700 transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activeMode.icon}</span>
                <span className="font-semibold">{activeMode.label}</span>
              </div>
              <ChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-10 max-h-60 overflow-y-auto"
                >
                  {MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setSelectedMode(mode.id);
                        setIsDropdownOpen(false);
                        vibrate(20);
                        if (settings.soundEnabled) playSound('click');
                      }}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-2xl">{mode.icon}</span>
                      <span className="font-medium">{mode.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartInitial}
            className="w-full bg-[#FF9800] text-white font-bold text-lg py-4 rounded-[18px] shadow-[0_6px_0_0_#F57C00] active:shadow-[0_0px_0_0_#F57C00] active:translate-y-[6px] transition-all"
          >
            START QUIZ
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showRangePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <Target className="mr-2 text-indigo-500" /> Choose Range
                </h3>
                <button onClick={() => setShowRangePopup(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 font-bold">X</button>
              </div>

              <div className="space-y-3">
                {RANGES.map((rangeObj, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartQuizWithRange(rangeObj.range)}
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-indigo-400 transition-all font-semibold text-left"
                  >
                    {rangeObj.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
