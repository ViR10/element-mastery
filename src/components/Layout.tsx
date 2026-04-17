import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Home, BarChart2, Settings as SettingsIcon, Volume2, VolumeX, Moon, Sun, TestTube2 } from 'lucide-react';
import { AppSettings } from '../logic/SettingsManager';
import { vibrate, playSound } from '../logic/InteractionManager';

interface LayoutProps {
  key?: string;
  children: ReactNode;
  activeTab: 'home' | 'stats' | 'settings';
  onTabChange: (tab: 'home' | 'stats' | 'settings') => void;
  settings: AppSettings;
  onToggleSetting: (key: keyof AppSettings) => void;
}

export default function Layout({ children, activeTab, onTabChange, settings, onToggleSetting }: LayoutProps) {
  const TABS = [
    { id: 'home', label: 'Play', icon: Home },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  const handleTabClick = (id: 'home' | 'stats' | 'settings') => {
    vibrate(20);
    if (settings.soundEnabled) playSound('click');
    onTabChange(id);
  };

  return (
    <div className="flex h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 shadow-xl">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <TestTube2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#4FACFE] to-[#00F2FE] tracking-tight">Element</h1>
            <h1 className="text-xl font-bold dark:text-white -mt-1 tracking-tight text-gray-800">Mastery</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-[#4FACFE] shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon size={22} className={isActive ? 'animate-pulse' : ''} />
                <span className="text-lg">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Controls in Sidebar Bottom */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-center space-x-4">
          <button 
            onClick={() => { vibrate(30); if(settings.soundEnabled) playSound('click'); onToggleSetting('soundEnabled'); }}
            className={`p-3 rounded-full transition-all ${settings.soundEnabled ? 'bg-blue-50 text-[#4FACFE]' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
          >
            {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={() => { vibrate(30); if(settings.soundEnabled) playSound('click'); onToggleSetting('darkMode'); }}
            className={`p-3 rounded-full transition-all ${settings.darkMode ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
          >
            {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto w-full md:pb-0 pb-[88px] selection:bg-[#4FACFE]/30">
        
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-30 px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 shadow-sm">
           <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#4FACFE] to-[#00F2FE]">
             Element Mastery
           </h1>
           <div className="flex space-x-2">
            <button 
              onClick={() => { vibrate(30); if(settings.soundEnabled) playSound('click'); onToggleSetting('soundEnabled'); }}
              className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button 
              onClick={() => { vibrate(30); if(settings.soundEnabled) playSound('click'); onToggleSetting('darkMode'); }}
              className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 w-full max-w-5xl mx-auto md:p-8 relative">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50 px-6 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-[88px] flex items-center">
        <ul className="flex justify-between w-full relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="relative z-10 flex-1 flex justify-center">
                <button
                  onClick={() => handleTabClick(tab.id)}
                  className="flex flex-col items-center justify-center p-2 group w-full"
                >
                  <motion.div 
                    animate={isActive ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`p-3 rounded-2xl transition-colors duration-300 ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-500/20 text-[#4FACFE]' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}
                  >
                    <tab.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  <span className={`text-[11px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-[#4FACFE]' : 'text-gray-400 dark:text-gray-500'}`}>
                    {tab.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
}
