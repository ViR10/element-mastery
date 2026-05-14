import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, AlertCircle, Award, Trophy, Trash2, Info, ChevronRight, Zap, Star, ShieldCheck, TrendingUp } from 'lucide-react';
import { QuizEngine, MistakeLogItem } from '../logic/QuizEngine';
import { elements, Element } from '../data/elements';
import { playSound, vibrate } from '../logic/InteractionManager';

export default function Stats({ soundEnabled }: { key?: string; soundEnabled: boolean }) {
  const [activeTab, setActiveTab] = useState<'grid' | 'mistakes' | 'badges' | 'leaderboard'>('grid');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [mistakes, setMistakes] = useState<MistakeLogItem[]>(QuizEngine.getMistakeLog());
  
  const stats = QuizEngine.getCleanStats();
  const profile = QuizEngine.getProfile();
  const seenIds = stats.seen || [];
  const wrongIds = stats.wrong || [];
  const streaks = stats.streaks || {};

  const getStatus = (id: number): 'mastered' | 'weak' | 'learning' | 'unseen' => {
    if ((streaks[id] || 0) >= 3) return 'mastered';
    if (wrongIds.includes(id)) return 'weak';
    if (seenIds.includes(id)) return 'learning';
    return 'unseen';
  };

  const statusCounts = elements.reduce((acc, el) => {
    acc[getStatus(el.id)]++;
    return acc;
  }, { mastered: 0, weak: 0, learning: 0, unseen: 0 });

  const handleClearMistakes = () => {
    if (confirm("Clear all mistake logs?")) {
      QuizEngine.clearMistakes();
      setMistakes([]);
      vibrate(50);
    }
  };

  const handleDeleteSingleMistake = (id: string) => {
    const updated = mistakes.filter(m => m.id !== id);
    localStorage.setItem('mistakeLog', JSON.stringify(updated));
    setMistakes(updated);
    vibrate(20);
  };

  const BADGES = [
    { id: 'halogen', title: 'Halogen Master', desc: 'Seen reactive halogens', icon: Zap, unlocked: profile.xp >= 40, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { id: 'noble', title: 'Noble Gas Expert', desc: 'Seen zero-valency gases', icon: ShieldCheck, unlocked: profile.xp >= 80, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'streak', title: 'Streak Scholar', desc: '2+ day daily streak', icon: Star, unlocked: profile.dailyStreak >= 2, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'architect', title: 'Formula Architect', desc: '5+ items mastered', icon: TrendingUp, unlocked: statusCounts.mastered >= 5, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const classmates = [
    { name: 'Elena Rostova', xp: Math.max(120, profile.xp + 85), rank: 1, isUser: false },
    { name: 'You', xp: profile.xp, rank: 2, isUser: true },
    { name: 'Sarah T.', xp: Math.max(0, profile.xp - 40), rank: 3, isUser: false },
    { name: 'Marcus Chen', xp: Math.max(0, profile.xp - 95), rank: 4, isUser: false },
    { name: 'Aisha V.', xp: Math.max(0, profile.xp - 130), rank: 5, isUser: false },
  ].sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      
      {/* Header Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
            <Trophy size={20} />
          </div>
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Mastered</span>
          <span className="text-xl font-black text-gray-800 dark:text-white mt-1">{statusCounts.mastered}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2">
            <AlertCircle size={20} />
          </div>
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Weak Points</span>
          <span className="text-xl font-black text-gray-800 dark:text-white mt-1">{statusCounts.weak}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl gap-1">
        {[
          { id: 'grid', label: 'Matrix', icon: Target },
          { id: 'mistakes', label: 'Mistakes', icon: AlertCircle },
          { id: 'badges', label: 'Badges', icon: Award },
          { id: 'leaderboard', label: 'Class', icon: Trophy },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { vibrate(15); if(soundEnabled) playSound('click'); setActiveTab(tab.id as any); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isActive ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-xl border border-gray-100 dark:border-gray-700 flex-1 min-h-[400px]">
        
        {/* TAB: Grid */}
        {activeTab === 'grid' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-gray-800 dark:text-white">Mastery Matrix</h3>
              <div className="flex space-x-2">
                {['mastered', 'weak', 'learning'].map(s => (
                  <div key={s} className={`w-2.5 h-2.5 rounded-full ${s === 'mastered' ? 'bg-emerald-500' : s === 'weak' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
              {elements.map((el) => {
                const st = getStatus(el.id);
                const colors: Record<string, string> = {
                  mastered: 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200',
                  weak: 'bg-rose-500 text-white border-rose-500 animate-pulse',
                  learning: 'bg-amber-400 text-white border-amber-400 shadow-sm shadow-amber-200',
                  unseen: 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-900 dark:border-gray-700'
                };

                return (
                  <motion.button
                    key={el.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { vibrate(15); setSelectedElement(el); }}
                    className={`aspect-square rounded-xl border flex items-center justify-center text-[10px] font-black font-mono transition-all ${colors[st]}`}
                  >
                    {el.symbol}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedElement && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center font-mono font-black text-lg text-indigo-600 shadow-sm border border-indigo-100">
                      {selectedElement.symbol}
                    </div>
                    <div>
                      <div className="font-black text-sm text-gray-800 dark:text-white leading-none">{selectedElement.name}</div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">
                        Valency: <span className="text-indigo-600">{selectedElement.valency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{getStatus(selectedElement.id)}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">Streak: {streaks[selectedElement.id] || 0}/3</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB: Mistakes */}
        {activeTab === 'mistakes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-gray-800 dark:text-white">Mistake Log</h3>
              {mistakes.length > 0 && (
                <button onClick={handleClearMistakes} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {mistakes.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <Zap size={24} fill="currentColor" />
                </div>
                <p className="text-sm font-bold text-gray-400">Zero mistakes! You're a pro.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {mistakes.map((m) => (
                  <div key={m.id} className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700 relative group">
                    <button onClick={() => handleDeleteSingleMistake(m.id)} className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <p className="text-xs font-black text-gray-800 dark:text-white pr-8 leading-tight">{m.questionText}</p>
                    <div className="flex items-center space-x-6 mt-3">
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase">Input</span>
                        <div className="text-xs font-black text-rose-500 line-through">{m.userAnswer}</div>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase">Correct</span>
                        <div className="text-xs font-black text-emerald-500 font-mono">{m.correctAnswer}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Badges */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            <h3 className="font-black text-gray-800 dark:text-white">Achievements</h3>
            <div className="grid grid-cols-1 gap-3">
              {BADGES.map((b) => (
                <div key={b.id} className={`p-4 rounded-[24px] border-2 flex items-center space-x-4 transition-all ${b.unlocked ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 opacity-40 grayscale'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${b.bg} ${b.color} shadow-sm shrink-0`}>
                    <b.icon size={24} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm text-gray-800 truncate">{b.title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold truncate mt-1">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-gray-800 dark:text-white">Global Ranking</h3>
              <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-widest">{profile.classCode}</span>
            </div>
            <div className="space-y-2">
              {classmates.map((p) => (
                <div key={p.rank} className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${p.isUser ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-50 bg-white'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${p.rank === 1 ? 'bg-amber-400 text-white' : p.rank === 2 ? 'bg-slate-300 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {p.rank}
                    </div>
                    <span className={`text-sm font-bold ${p.isUser ? 'text-indigo-600 font-black' : 'text-gray-700'}`}>{p.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black font-mono">{p.xp} XP</span>
                    {p.isUser && <ChevronRight size={14} className="text-indigo-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
