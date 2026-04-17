import { motion } from 'motion/react';
import { X, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { QuizEngine } from '../logic/QuizEngine';
import { elements } from '../data/elements';
import { playSound } from '../logic/InteractionManager';

export default function Stats({ soundEnabled }: { key?: string; soundEnabled: boolean }) {
  const stats = QuizEngine.getStats();
  const seenIds = stats.seen || [];
  const wrongIds = stats.wrong || [];

  const masteredIds = seenIds.filter((id: number) => !wrongIds.includes(id));
  const totalElements = elements.length;

  const weakElements = elements.filter(e => wrongIds.includes(e.id));
  const masteredElements = elements.filter(e => masteredIds.includes(e.id));

  const masteryPercentage = Math.round((masteredIds.length / totalElements) * 100) || 0;

  return (
    <div className="w-full h-full p-4 md:p-0 flex flex-col items-center">
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[32px] p-6 shadow-xl flex flex-col"
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold">Your Progress</h2>
        </div>

        <div className="overflow-y-auto pr-2 pb-4 space-y-6">
          {/* Mastery Overview */}
          <div className="bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-end mb-2">
              <span className="font-semibold text-white/90">Overall Mastery</span>
              <span className="text-3xl font-black">{masteryPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${masteryPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-white/20 rounded-xl p-2">
                <div className="font-black">{masteredIds.length}</div>
                <div className="text-white/80 text-xs uppercase">Mastered</div>
              </div>
              <div className="bg-white/20 rounded-xl p-2">
                <div className="font-black">{wrongIds.length}</div>
                <div className="text-white/80 text-xs uppercase">Learning</div>
              </div>
              <div className="bg-white/20 rounded-xl p-2">
                <div className="font-black">{totalElements - seenIds.length}</div>
                <div className="text-white/80 text-xs uppercase">Unseen</div>
              </div>
            </div>
          </div>

          {/* Weaknesses */}
          {weakElements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center text-gray-700 dark:text-gray-300">
                <AlertCircle size={20} className="text-red-500 mr-2" />
                Needs Practice
              </h3>
              <div className="flex flex-wrap gap-2">
                {weakElements.map(el => (
                  <div key={el.id} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-3 py-2 rounded-xl flex items-center space-x-2">
                    <span className="font-black text-lg">{el.symbol}</span>
                    <span className="text-sm font-medium">{el.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {masteredElements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center text-gray-700 dark:text-gray-300">
                <CheckCircle size={20} className="text-green-500 mr-2" />
                Strong Elements
              </h3>
              <div className="flex flex-wrap gap-2">
                {masteredElements.map(el => (
                  <div key={el.id} className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 px-3 py-2 rounded-xl flex items-center space-x-2">
                    <span className="font-black text-lg">{el.symbol}</span>
                    <span className="text-sm font-medium">{el.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {seenIds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target size={48} className="mx-auto mb-4 opacity-20" />
              <p>Play some quizzes to see your stats!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
