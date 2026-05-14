import { motion } from 'motion/react';
import { RotateCcw, Home, Trophy, Target, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ResultProps {
  key?: string;
  correct: number;
  total: number;
  onRetry: () => void;
  onHome: () => void;
}

export default function Result({ correct, total, onRetry, onHome }: ResultProps) {
  const percentage = Math.round((correct / total) * 100);
  
  useEffect(() => {
    if (percentage >= 70) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [percentage]);
  
  const getRank = () => {
    if (percentage >= 95) return { label: 'Legendary!', color: 'text-amber-500', icon: Trophy, bg: 'bg-amber-50' };
    if (percentage >= 80) return { label: 'Expert!', color: 'text-indigo-600', icon: Award, bg: 'bg-indigo-50' };
    if (percentage >= 60) return { label: 'Good Progress!', color: 'text-emerald-600', icon: Target, bg: 'bg-emerald-50' };
    return { label: 'Keep Practicing!', color: 'text-rose-500', icon: ArrowRight, bg: 'bg-rose-50' };
  };

  const rank = getRank();
  const RankIcon = rank.icon;

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Rank Badge */}
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`w-24 h-24 rounded-[32px] ${rank.bg} ${rank.color} flex items-center justify-center mb-6 shadow-xl shadow-gray-200 dark:shadow-none border border-white dark:border-gray-800`}
        >
          <RankIcon size={48} strokeWidth={2.5} />
        </motion.div>
        
        <h2 className={`text-4xl font-black mb-2 text-center tracking-tight ${rank.color}`}>{rank.label}</h2>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-10">Challenge Completed</p>

        {/* Premium Score Visualization */}
        <div className="relative w-56 h-56 mb-10 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
            <path
              className="text-gray-50 dark:text-gray-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className={rank.color}
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${percentage}, 100` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-6xl font-black tracking-tighter"
            >
              {percentage}%
            </motion.span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Accuracy</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-10">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Correct</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{correct}</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex flex-col items-center">
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Mistakes</span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{total - correct}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4 px-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onRetry}
            className="w-full py-5 bg-indigo-600 text-white font-black text-base rounded-[20px] shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center space-x-3"
          >
            <RotateCcw size={20} />
            <span className="uppercase tracking-widest">Retry Challenge</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onHome}
            className="w-full py-5 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-black text-base rounded-[20px] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center space-x-3"
          >
            <Home size={20} />
            <span className="uppercase tracking-widest">Back to Home</span>
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
}
