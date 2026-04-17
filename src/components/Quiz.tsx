import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X, Flame, Heart, HelpCircle } from 'lucide-react';
import { Question, QuizEngine, QuizMode } from '../logic/QuizEngine';
import { AppSettings } from '../logic/SettingsManager';
import { vibrate, speak, playSound } from '../logic/InteractionManager';
import { elements } from '../data/elements';

interface QuizProps {
  key?: string;
  questions: Question[];
  mode: QuizMode;
  settings: AppSettings;
  onComplete: (correct: number, total: number) => void;
  onExit: () => void;
}

export default function Quiz({ questions, mode, settings, onComplete, onExit }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Hint system states
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showHintDropdown, setShowHintDropdown] = useState(false);
  const [activeHintMessage, setActiveHintMessage] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (settings.voiceEnabled && currentQuestion) {
      speak(currentQuestion.text);
    }
    // Reset hint states per question
    setHiddenOptions([]);
    setShowHintDropdown(false);
    setActiveHintMessage(null);
    startTimeRef.current = Date.now();
  }, [currentIndex, settings.voiceEnabled, currentQuestion]);

  // Time Attack end condition
  useEffect(() => {
    if (mode === 'timeattack' && globalTimeLeft === 0) {
      onComplete(score, currentIndex + 1);
    }
  }, [globalTimeLeft, mode, score, currentIndex, onComplete]);

  // Global Time Attack Timer
  useEffect(() => {
    if (mode !== 'timeattack' || isAnimating || globalTimeLeft === 0) return;
    const globalTimer = setInterval(() => {
      setGlobalTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(globalTimer);
  }, [mode, isAnimating, globalTimeLeft]);

  // Per-Question Timer (for regular modes)
  useEffect(() => {
    if (mode === 'timeattack') return; // Time attack uses global timer
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
  }, [currentIndex, selectedAnswer, isAnimating, settings.timerEnabled, mode]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || isAnimating || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    setIsAnimating(true);
    setShowHintDropdown(false);

    const isCorrect = answer === currentQuestion.correctAnswer;
    const responseTimeMs = Date.now() - startTimeRef.current;
    
    QuizEngine.recordAnswer(currentQuestion.elementId, isCorrect, responseTimeMs);

    let newLives = lives;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      setStreak(s => s + 1);
      vibrate([30, 50, 30]);
      if (settings.soundEnabled) playSound('correct');
    } else {
      setStreak(0);
      newLives = lives - 1;
      setLives(newLives);
      vibrate(200);
      if (settings.soundEnabled) playSound('wrong');
    }

    setTimeout(() => {
      // In Survival mode, hitting 0 lives is game over
      if (mode === 'survival' && newLives <= 0) {
        onComplete(newScore, currentIndex + 1);
        return;
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
        setIsAnimating(false);
      } else {
        onComplete(newScore + (isCorrect && mode !== 'survival' ? 0 : 0), questions.length);
      }
    }, 1200);
  };

  const handleVoice = () => {
    if (settings.voiceEnabled && currentQuestion) {
      speak(currentQuestion.text);
    }
  };

  const applyHint = (type: '5050' | 'group' | 'table') => {
    if (!currentQuestion) return;
    
    if (type === '5050') {
      const wrongOptions = currentQuestion.options.filter(o => o !== currentQuestion.correctAnswer);
      const toHide = QuizEngine.generateQuestions('mixed', 1) ? wrongOptions.slice(0, 2) : []; // just taking 2 safely
      setHiddenOptions(toHide);
      setActiveHintMessage("Removed 2 incorrect options!");
    } else if (type === 'group') {
       // A mock info for group number since it's not strictly in elements.ts.
       // We can extract row info dynamically but as a shim we return positive/negative
       const el = elements.find(e => e.id === currentQuestion.elementId);
       if (el) {
         setActiveHintMessage(`Hint: This element typically has a ${el.type} nature.`);
       }
    } else if (type === 'table') {
       setActiveHintMessage("Periodic Table Hint: Check where similar valency elements reside (e.g. Halogens vs Alkali)");
    }
    setShowHintDropdown(false);
  };

  if (!currentQuestion) return null;

  const progress = mode === 'timeattack' 
      ? ((60 - globalTimeLeft) / 60) * 100 
      : ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6">
        <button onClick={onExit} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm">
          <X size={24} />
        </button>
        
        <div className="flex items-center space-x-4">
          {mode === 'survival' && (
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
          )}

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
            {mode === 'timeattack' || mode === 'survival' ? `Score: ${score}` : `${currentIndex + 1} / ${questions.length}`}
          </div>
        </div>

        {mode === 'timeattack' ? (
           <div className="font-bold text-2xl text-orange-500 flex flex-col items-center">
              <span>{globalTimeLeft}s</span>
           </div>
        ) : settings.timerEnabled ? (
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
                title="Read aloud"
              >
                <Volume2 size={24} />
              </button>

              <div className="absolute top-4 left-4 relative">
                <button 
                  onClick={() => setShowHintDropdown(!showHintDropdown)}
                  className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 rounded-full hover:bg-indigo-100 transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <HelpCircle size={20} />
                  <span className="text-sm font-bold hidden sm:inline">Need help?</span>
                </button>
                
                {showHintDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-10">
                    <button onClick={() => applyHint('5050')} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold">50/50: Remove 2 wrong</button>
                    <button onClick={() => applyHint('group')} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold">Show Group Hint</button>
                    <button onClick={() => applyHint('table')} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold">Periodic Table Info</button>
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-bold text-center mt-12 sm:mt-8 mb-4 leading-tight whitespace-pre-wrap">
                {currentQuestion.text}
              </h2>
              
              {activeHintMessage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl mb-4 font-medium text-sm">
                  {activeHintMessage}
                </motion.div>
              )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.options.map((option, index) => {
                if (hiddenOptions.includes(option)) {
                  return <div key={index} className="p-4 sm:p-6 rounded-[24px] border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-30" />;
                }

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

                // Render as raw text if simple, or innerHTML if formula builder (but we mapped them to plain text, so raw text is fine)
                return (
                  <motion.button
                    key={index}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.96 } : {}}
                    animate={showWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 sm:p-6 rounded-[24px] text-lg sm:text-xl font-bold transition-all duration-300 ${btnClass} flex items-center justify-center`}
                  >
                    <span>{option}</span>
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
