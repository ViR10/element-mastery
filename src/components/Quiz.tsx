import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X, Flame, Heart } from 'lucide-react';
import { Question, QuizEngine } from '../logic/QuizEngine';
import { AppSettings } from '../logic/SettingsManager';
import { vibrate, speak, playSound } from '../logic/InteractionManager';

interface QuizProps {
  key?: string;
  questions: Question[];
  settings: AppSettings;
  onComplete: (correct: number, total: number) => void;
  onExit: () => void;
}

export default function Quiz({ questions, settings, onComplete, onExit }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (settings.voiceEnabled) {
      speak(currentQuestion.text);
    }
  }, [currentIndex, settings.voiceEnabled, currentQuestion.text]);

  useEffect(() => {
    if (!settings.timerEnabled || selectedAnswer || isAnimating) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(''); // Timeout counts as wrong
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, selectedAnswer, isAnimating, settings.timerEnabled]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || isAnimating) return;
    
    setSelectedAnswer(answer);
    setIsAnimating(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    QuizEngine.recordAnswer(currentQuestion.elementId, isCorrect);

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      vibrate([30, 50, 30]);
      if (settings.soundEnabled) playSound('correct');
    } else {
      setStreak(0);
      setLives(l => l - 1);
      vibrate(200);
      if (settings.soundEnabled) playSound('wrong');
    }

    setTimeout(() => {
      if (isCorrect || lives > 1) {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(c => c + 1);
          setSelectedAnswer(null);
          setTimeLeft(15);
          setIsAnimating(false);
        } else {
          onComplete(score + (isCorrect ? 1 : 0), questions.length);
        }
      } else {
        // Game Over - Ran out of lives
        onComplete(score, questions.length);
      }
    }, 1200);
  };

  const handleVoice = () => {
    if (settings.voiceEnabled) {
      speak(currentQuestion.text);
    }
  };

  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6">
        <button onClick={onExit} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm">
          <X size={24} />
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 1 }}
                animate={i >= lives ? { scale: 0, opacity: 0 } : { scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                <Heart size={24} className={i < lives ? "fill-red-500 text-red-500" : "text-gray-300"} />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {streak >= 2 && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 text-orange-500 px-3 py-1 rounded-full font-bold shadow-sm"
              >
                <Flame size={18} className={streak >= 3 ? "animate-pulse text-red-500" : ""} />
                <span className="hidden sm:inline">{streak}x Combo</span>
                <span className="sm:hidden">{streak}x</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="font-bold text-lg text-gray-500">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {settings.timerEnabled ? (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${timeLeft <= 5 ? 'text-red-500' : 'text-[#4FACFE]'} transition-all duration-1000`}
                strokeDasharray={`${(timeLeft / 15) * 100}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : ''}`}>
              {timeLeft}
            </span>
          </div>
        ) : (
          <div className="w-12 h-12" /> // Spacer
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#4FACFE] to-[#00F2FE]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full"
          >
            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-xl p-8 mb-8 relative">
              <button 
                onClick={handleVoice}
                className="absolute top-4 right-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-[#4FACFE] transition-colors"
              >
                <Volume2 size={24} />
              </button>
              <h2 className="text-3xl font-bold text-center mt-4 mb-8 leading-tight">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showCorrect = selectedAnswer !== null && isCorrect;
                const showWrong = isSelected && !isCorrect;

                let btnClass = "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-2 border-transparent shadow-md";
                if (showCorrect) {
                  btnClass = "bg-[#4CAF50] text-white border-[#4CAF50] shadow-[0_0_15px_rgba(76,175,80,0.5)]";
                } else if (showWrong) {
                  btnClass = "bg-[#F44336] text-white border-[#F44336]";
                } else if (selectedAnswer !== null) {
                  btnClass = "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 opacity-50";
                }

                return (
                  <motion.button
                    key={index}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.96 } : {}}
                    animate={showWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 sm:p-6 rounded-[24px] text-lg sm:text-xl font-bold transition-all duration-300 ${btnClass}`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
