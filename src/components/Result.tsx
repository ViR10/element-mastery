import { motion } from 'motion/react';
import { RotateCcw, Home, Trophy } from 'lucide-react';
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
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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
  
  let label = "Keep Practicing!";
  let color = "text-[#FF9800]";
  if (percentage >= 90) {
    label = "Master!";
    color = "text-[#4CAF50]";
  } else if (percentage >= 70) {
    label = "Good Job!";
    color = "text-[#4FACFE]";
  }

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[32px] shadow-xl p-8 flex flex-col items-center">
        
        <div className="mb-4">
          <Trophy size={48} className={color} />
        </div>
        
        <h2 className={`text-3xl font-bold mb-8 ${color}`}>{label}</h2>

        {/* Score Circle */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
            <path
              className="text-gray-100 dark:text-gray-700"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className="text-[#4FACFE]"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${percentage}, 100` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black">{percentage}%</span>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Accuracy</span>
          </div>
        </div>

        <div className="flex w-full justify-around mb-10 bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 font-bold uppercase">Correct</span>
            <span className="text-2xl font-black text-[#4CAF50]">{correct}</span>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 font-bold uppercase">Wrong</span>
            <span className="text-2xl font-black text-[#F44336]">{total - correct}</span>
          </div>
        </div>

        <div className="w-full space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onRetry}
            className="w-full flex items-center justify-center space-x-2 bg-[#FF9800] text-white font-bold text-lg py-4 rounded-[18px] shadow-[0_6px_0_0_#F57C00] active:shadow-[0_0px_0_0_#F57C00] active:translate-y-[6px] transition-all"
          >
            <RotateCcw size={24} />
            <span>RETRY QUIZ</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onHome}
            className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-bold text-lg py-4 rounded-[18px] border-2 border-gray-200 dark:border-gray-600 transition-all"
          >
            <Home size={24} />
            <span>HOME</span>
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
}
