import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Splash from './components/Splash';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Settings from './components/Settings';
import Stats from './components/Stats';
import Layout from './components/Layout';
import { QuizEngine, QuizMode, Question } from './logic/QuizEngine';
import { loadSettings, saveSettings, AppSettings } from './logic/SettingsManager';

type AppView = 'splash' | 'main' | 'quiz' | 'result';
type AppTab = 'home' | 'stats' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('splash');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentMode, setCurrentMode] = useState<QuizMode>('mixed');
  const [quizResult, setQuizResult] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    saveSettings(settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const handleStartQuiz = (mode: QuizMode, range?: [number, number]) => {
    const questions = QuizEngine.generateQuestions(mode, 10, range);
    setCurrentMode(mode);
    setCurrentQuestions(questions);
    setActiveView('quiz');
  };

  const handleQuizComplete = (correct: number, total: number) => {
    setQuizResult({ correct, total });
    setActiveView('result');
  };

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans selection:bg-[#4FACFE]/30">
      <AnimatePresence mode="wait">
        {activeView === 'splash' && (
          <Splash key="splash" onComplete={() => setActiveView('main')} />
        )}
        
        {activeView === 'main' && (
          <Layout 
            key="layout"
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            settings={settings}
            onToggleSetting={toggleSetting}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <Home 
                  key="home" 
                  onStartQuiz={handleStartQuiz} 
                  settings={settings}
                />
              )}
              {activeTab === 'stats' && (
                <Stats 
                  key="stats"
                  soundEnabled={settings.soundEnabled}
                />
              )}
              {activeTab === 'settings' && (
                <Settings 
                  key="settings"
                  settings={settings} 
                  onToggle={toggleSetting} 
                />
              )}
            </AnimatePresence>
          </Layout>
        )}

        {activeView === 'quiz' && (
          <Quiz 
            key="quiz" 
            questions={currentQuestions} 
            mode={currentMode}
            settings={settings}
            onComplete={handleQuizComplete}
            onExit={() => setActiveView('main')}
          />
        )}

        {activeView === 'result' && (
          <Result 
            key="result" 
            correct={quizResult.correct} 
            total={quizResult.total}
            onRetry={() => {
              setActiveView('main');
            }} 
            onHome={() => setActiveView('main')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
