import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ConfigProvider } from './context/ConfigContext';
import { FloatingHearts } from './components/FloatingHearts';
import { MusicPlayer } from './components/MusicPlayer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { CatchFlowersScreen } from './components/CatchFlowersScreen';
import { GiftLetterScreen } from './components/GiftLetterScreen';
import { AdminModal } from './components/AdminModal';

export type Stage = 'welcome' | 'quiz' | 'catch_flowers' | 'gift_letter';

export function AppContent() {
  const [currentStage, setCurrentStage] = useState<Stage>('welcome');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: Ctrl + Shift + E (or Cmd + Shift + E on Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Cleanup long-press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Mobile long-press trigger (3 seconds hold)
  const handleStartPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      setIsAdminOpen(true);
    }, 3000);
  };

  const handleCancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      data-testid="app-container"
      className="min-h-screen bg-rose-50 text-rose-900 font-sans relative overflow-x-hidden selection:bg-rose-200 selection:text-rose-900"
    >
      {/* Ambient background particles */}
      <FloatingHearts />

      {/* Persistent Background Music Controller (top-right fixed) */}
      <MusicPlayer />

      {/* Discreet Secret Admin Trigger (bottom-left fixed) */}
      <button
        type="button"
        data-testid="admin-trigger-button"
        aria-label="Cài đặt bí mật"
        title="Cài đặt bí mật (Ctrl+Shift+E)"
        onClick={() => setIsAdminOpen(true)}
        onTouchStart={handleStartPress}
        onTouchEnd={handleCancelPress}
        onTouchCancel={handleCancelPress}
        onMouseDown={handleStartPress}
        onMouseUp={handleCancelPress}
        onMouseLeave={handleCancelPress}
        className="fixed bottom-3 left-3 z-40 opacity-40 hover:opacity-100 transition-opacity p-2.5 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-sm shadow-sm hover:shadow border border-rose-200/60 text-rose-400 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer select-none"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Secret Admin Modal for Configuration Customization */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Main Orchestration Stages */}
      <main data-testid="stage-container" className="relative z-10 w-full min-h-screen">
        {currentStage === 'welcome' && (
          <WelcomeScreen onStart={() => setCurrentStage('quiz')} />
        )}
        {currentStage === 'quiz' && (
          <QuizScreen onComplete={() => setCurrentStage('catch_flowers')} />
        )}
        {currentStage === 'catch_flowers' && (
          <CatchFlowersScreen onComplete={() => setCurrentStage('gift_letter')} />
        )}
        {currentStage === 'gift_letter' && (
          <GiftLetterScreen onRestart={() => setCurrentStage('welcome')} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}
