import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X, Flame, Heart, HelpCircle, Sparkles, Lightbulb, AlertCircle, CheckCircle2, Bomb, Zap, Beaker } from 'lucide-react';
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
  
  // Custom interactive states
  const [isFlipped, setIsFlipped] = useState(false);
  const [blankInput, setBlankInput] = useState('');
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);
  const [wrongAttemptsCount, setWrongAttemptsCount] = useState(0);

  // Hint states
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showHintDropdown, setShowHintDropdown] = useState(false);
  const [activeHintMessage, setActiveHintMessage] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion = questions[currentIndex];
  const qMode = currentQuestion?.modeType || 'mcq';

  useEffect(() => {
    if (settings.voiceEnabled && currentQuestion) {
      speak(currentQuestion.text);
    }
    // Reset internal question state
    setHiddenOptions([]);
    setShowHintDropdown(false);
    setActiveHintMessage(null);
    setIsFlipped(false);
    setBlankInput('');
    setSpeedBonusAwarded(false);
    setSelectedAnswer(null);
    setIsAnimating(false);
    setTimeLeft(mode === 'boss' ? 60 : 15);
    startTimeRef.current = Date.now();
  }, [currentIndex, settings.voiceEnabled, currentQuestion, mode]);

  // Survival Mode end condition
  useEffect(() => {
    if (mode === 'survival' && timeLeft === 0) {
      onComplete(score, currentIndex + 1);
    }
  }, [timeLeft, mode, score, currentIndex, onComplete]);

  // Survival Mode Bomb Timer
  useEffect(() => {
    if (mode !== 'survival' || isAnimating || timeLeft === 0) return;
    const survivalTimer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(survivalTimer);
  }, [mode, isAnimating, timeLeft]);

  // Per-Question Timer
  useEffect(() => {
    if (mode === 'survival') return; // Handled by separate logic if needed, or just let it run
    // Survival has its own logic? Actually, let's keep it simple.
    if (selectedAnswer || isAnimating) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswerSubmitted('', false); 
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, selectedAnswer, isAnimating, mode]);

  const normalizeAnswer = (val: string) => {
    // Robust normalization for chemical symbols and names
    return val.trim().toLowerCase()
      .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => (m.charCodeAt(0) - 8320).toString()) // subscripts to digits (₀ -> 0)
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (m) => {
        // Handle superscripts properly (⁰ is 8304, but others are scattered)
        const charCode = m.charCodeAt(0);
        if (charCode === 185) return "1";
        if (charCode === 178) return "2";
        if (charCode === 179) return "3";
        if (charCode >= 8304 && charCode <= 8313) return (charCode - 8304).toString();
        return "";
      })
      .replace(/[⁺⁻\+\-\(\)\[\]\s]/g, ''); // remove charges, brackets, and extra spaces
  };

  const handleAnswerSubmitted = (userGuess: string, overrideCorrect?: boolean) => {
    if (selectedAnswer !== null || isAnimating || !currentQuestion) return;

    let isCorrect = false;
    if (overrideCorrect !== undefined) {
      isCorrect = overrideCorrect;
    } else {
      const normalizedUser = normalizeAnswer(userGuess);
      const normalizedCorrect = normalizeAnswer(currentQuestion.correctAnswer);
      isCorrect = normalizedUser === normalizedCorrect;
    }

    setSelectedAnswer(userGuess || '[No Answer]');
    setIsAnimating(true);
    setShowHintDropdown(false);

    const responseTimeMs = Date.now() - startTimeRef.current;
    const rec = QuizEngine.recordAnswer(
      currentQuestion.elementId, 
      isCorrect, 
      responseTimeMs,
      currentQuestion.text,
      userGuess || '[No Answer]',
      currentQuestion.correctAnswer
    );

    let newLives = lives;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      setStreak(s => s + 1);
      if (responseTimeMs < 4000) setSpeedBonusAwarded(true);
      
      // Survival Mode Bomb logic
      if (mode === 'survival') {
        setTimeLeft(prev => Math.min(30, prev + 5)); // Add 5s
      }

      vibrate([30, 50, 30]);
      if (settings.soundEnabled) playSound('correct');
    } else {
      setStreak(0);
      setWrongAttemptsCount(w => w + 1);
      newLives = lives - 1;
      setLives(newLives);
      
      // Survival Mode Bomb penalty
      if (mode === 'survival') {
        setTimeLeft(prev => Math.max(0, prev - 8)); // Subtract 8s
      }

      vibrate(200);
      if (settings.soundEnabled) playSound('wrong');
    }

    // Extended delay if answered wrong so user reads the mnemonic hint/note
    const delayMs = isCorrect ? 1200 : 2800;

    setTimeout(() => {
      if (mode === 'survival' && newLives <= 0) {
        onComplete(newScore, currentIndex + 1);
        return;
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        onComplete(newScore, questions.length);
      }
    }, delayMs);
  };

  const handleVoice = () => {
    if (settings.voiceEnabled && currentQuestion) {
      speak(currentQuestion.text);
    }
  };

  const applyHint = (type: '5050' | 'mnemonic') => {
    if (!currentQuestion) return;
    if (type === '5050') {
      const wrongOpts = currentQuestion.options.filter(o => o !== currentQuestion.correctAnswer);
      setHiddenOptions(wrongOpts.slice(0, 2));
      setActiveHintMessage("Removed 2 incorrect choices!");
    } else if (type === 'mnemonic') {
      setActiveHintMessage(`Memory Trick: ${currentQuestion.mnemonic || currentQuestion.elementObj?.note}`);
    }
    setShowHintDropdown(false);
  };

  if (!currentQuestion) return null;

  const progressPercentage = mode === 'survival'
    ? ((30 - timeLeft) / 30) * 100
    : (currentIndex / questions.length) * 100;

  const showMnemonicNotice = selectedAnswer !== null && selectedAnswer !== currentQuestion.correctAnswer;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 selection:bg-[#4FACFE]/30 pb-12">
      {/* Top Status Navigation */}
      <div className="flex justify-between items-center p-6 max-w-4xl w-full mx-auto">
        <button onClick={onExit} className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 transition-colors">
          <X size={22} className="text-gray-500" />
        </button>

        <div className="flex items-center space-x-4">
          {mode === 'survival' && (
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  size={22} 
                  className={i < lives ? "fill-red-500 text-red-500 scale-110 transition-transform" : "text-gray-300 dark:text-gray-700"} 
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {streak >= 2 && (
              <motion.div
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full font-black text-xs shadow-md"
              >
                <Flame size={16} fill="white" />
                <span>{streak}x STREAK</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {speedBonusAwarded && (
              <motion.div
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-1 bg-indigo-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-md animate-bounce"
              >
                <Sparkles size={14} />
                <span>+5 SPEED XP</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="font-black text-sm tracking-wider text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            {mode === 'survival' ? `SCORE: ${score}` : `${currentIndex + 1} / ${questions.length}`}
          </div>
        </div>

        {mode === 'survival' ? (
          <div className="w-11 h-11" />
        ) : (
          <div className="relative w-11 h-11 flex items-center justify-center font-black text-sm">
            <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
              <path className="text-gray-200 dark:text-gray-800" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${timeLeft <= 5 ? 'text-red-500' : 'text-indigo-500'} transition-all duration-1000`} strokeDasharray={`${(timeLeft / 15) * 100}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className={timeLeft <= 5 ? 'text-red-500 animate-scale' : ''}>{timeLeft}</span>
          </div>
        )}
      </div>

      {/* Thin Header Progress */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 max-w-4xl mx-auto rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-2xl mx-auto relative">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
            
            {/* Context Card Header */}
            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-xl p-6 sm:p-8 mb-6 relative border border-gray-100 dark:border-gray-700/60">
              
              {/* Internal top pill controls */}
              <div className="flex justify-between items-center mb-4">
                <div className="relative">
                  <button onClick={() => setShowHintDropdown(!showHintDropdown)} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 hover:bg-indigo-100 transition-colors">
                    <HelpCircle size={15} />
                    <span>HINTS</span>
                  </button>

                  {showHintDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-1.5 z-30">
                      {qMode === 'mcq' && <button onClick={() => applyHint('5050')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-xs font-bold">⚡ 50/50 Eliminator</button>}
                      <button onClick={() => applyHint('mnemonic')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-xs font-bold">💡 Show Memory Hint</button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-md font-mono uppercase font-bold">{qMode} MODE</span>
                  <button onClick={handleVoice} className="text-gray-400 hover:text-indigo-500 transition-colors p-1"><Volume2 size={18} /></button>
                </div>
              </div>

              {/* Simplified Compound Builder UI */}
            {qMode === 'builder' && currentQuestion.builderData && (
              <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-xl border border-indigo-100 dark:border-indigo-900/30 mb-6">
                <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex flex-col items-center bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 min-w-[80px]">
                    <span className="text-[10px] font-black text-indigo-400 uppercase mb-1">Cation</span>
                    <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{currentQuestion.builderData.posSymbol}</span>
                    <span className="text-xs font-bold text-indigo-500 mt-1">{currentQuestion.builderData.posValency}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-indigo-400 font-black text-xl animate-pulse">➕</div>
                    <div className="text-[8px] font-black text-gray-300 uppercase tracking-tighter mt-1">Reaction</div>
                  </div>

                  <div className="flex flex-col items-center bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-800 min-w-[80px]">
                    <span className="text-[10px] font-black text-rose-400 uppercase mb-1">Anion</span>
                    <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{currentQuestion.builderData.negSymbol}</span>
                    <span className="text-xs font-bold text-rose-500 mt-1">{currentQuestion.builderData.negValency}</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Zap size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Formula Rule: Criss-cross the charges!</span>
                  </div>
                </div>
              </div>
            )}

              {/* Main Question Text */}
              <h2 className="text-xl sm:text-2xl font-black text-center text-gray-800 dark:text-white leading-snug whitespace-pre-line mb-3">
                {currentQuestion.text}
              </h2>

              {currentQuestion.subtext && (
                <div className="text-center text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 w-fit mx-auto px-3 py-1 rounded-full">
                  {currentQuestion.subtext}
                </div>
              )}

              {activeHintMessage && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 flex items-start space-x-2">
                  <Lightbulb size={16} className="shrink-0 mt-0.5 text-amber-500" />
                  <span>{activeHintMessage}</span>
                </motion.div>
              )}

              {/* Automatic Mnemonic Retention display triggered on getting answer wrong */}
              <AnimatePresence>
                {showMnemonicNotice && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-50 dark:from-red-950/40 to-orange-50 dark:to-orange-950/40 p-3.5 rounded-2xl border border-red-500/30">
                      <div className="flex items-center space-x-1.5 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider mb-1">
                        <AlertCircle size={14} />
                        <span>Retention Memory Hint</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentQuestion.mnemonic || currentQuestion.elementObj?.note || "Review valency notes."}
                      </p>
                      <div className="mt-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                        <CheckCircle2 size={12} />
                        <span>Correct answer was: <strong className="underline">{currentQuestion.correctAnswer}</strong></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Survival Mode Bomb Visualizer */}
            {mode === 'survival' && (
              <div className="w-full bg-rose-50 dark:bg-rose-950/20 p-4 rounded-3xl border-2 border-rose-100 dark:border-rose-900/30 mb-6 flex items-center justify-between overflow-hidden relative">
                <div className="flex items-center space-x-3 z-10">
                  <div className={`p-2 rounded-xl ${timeLeft <= 5 ? 'bg-rose-500 text-white animate-bounce' : 'bg-rose-100 text-rose-500'}`}>
                    <Bomb size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Fuse Burning</div>
                    <div className={`text-xl font-black font-mono ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-gray-700'}`}>{timeLeft}s</div>
                  </div>
                </div>
                <div className="flex-1 ml-6 relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-rose-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 30) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  {timeLeft > 5 && <div className="absolute top-0 right-0 h-full w-4 bg-orange-400 animate-pulse" />}
                </div>
              </div>
            )}

            {/* Layout 2: Fill-in-the-blank Interface Layout */}
            {qMode === 'fillblank' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase text-center">Type the correct character string below</div>
                
                <input 
                  type="text"
                  placeholder="Type your answer here..."
                  value={blankInput}
                  onChange={e => setBlankInput(e.target.value)}
                  disabled={selectedAnswer !== null}
                  className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center font-black text-xl text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500 transition-colors"
                  onKeyDown={e => { if (e.key === 'Enter') handleAnswerSubmitted(blankInput); }}
                  autoFocus
                />

                <button 
                  onClick={() => handleAnswerSubmitted(blankInput)}
                  disabled={selectedAnswer !== null || !blankInput.trim()}
                  className="w-full bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-black py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition-all text-xs uppercase tracking-wider"
                >
                  Submit Guess
                </button>
              </div>
            )}

            {/* Layout 3 & 4: Builder Options Grid & standard MCQ Grid */}
            {(qMode === 'mcq' || qMode === 'builder') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {currentQuestion.options.map((option, index) => {
                  if (hiddenOptions.includes(option)) {
                    return <div key={index} className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 opacity-20" />;
                  }

                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showCorrect = selectedAnswer !== null && isCorrect;
                  const showWrong = isSelected && !isCorrect;

                  let baseStyle = "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-100 dark:border-gray-700/80 shadow-md hover:border-indigo-400";
                  if (showCorrect) baseStyle = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30";
                  else if (showWrong) baseStyle = "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30";
                  else if (selectedAnswer !== null) baseStyle = "bg-gray-100 dark:bg-gray-800/40 text-gray-400 opacity-40 border-transparent";

                  return (
                    <motion.button
                      key={index}
                      whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                      whileTap={selectedAnswer === null ? { scale: 0.97 } : {}}
                      onClick={() => handleAnswerSubmitted(option)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 sm:p-5 rounded-2xl border-2 font-black text-base sm:text-lg transition-all duration-300 flex items-center justify-center text-center ${baseStyle}`}
                    >
                      <span className="font-mono">{option}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
