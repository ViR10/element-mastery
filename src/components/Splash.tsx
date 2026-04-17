import { motion } from 'motion/react';
import { Beaker } from 'lucide-react';

export default function Splash({ onComplete }: { onComplete: () => void, key?: string }) {
  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] text-white z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 2000);
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-sm mb-6 shadow-xl">
          <Beaker size={80} className="text-white drop-shadow-md" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 drop-shadow-md">Element Mastery</h1>
        <p className="text-white/80 font-medium tracking-wide uppercase text-sm">Structured Learning</p>
        
        <div className="mt-12 flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
