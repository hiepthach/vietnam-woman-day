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

  // Mobile / stealth long-press trigger (requires holding for 3 seconds)
  const handleStartPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      setIsAdminOpen(true);
      longPressTimerRef.current = null;
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

      {/* Discreet Secret Admin Trigger (bottom-left fixed: stealthy, requires 3s hold to avoid spoiling surprise) */}
      <button
        type="button"
        data-testid="admin-trigger-button"
        aria-label="Cài đặt bí mật"
        title="Cài đặt bí mật (Giữ 3 giây hoặc Ctrl+Shift+E)"
        onClick={(e) => e.preventDefault()}
        onTouchStart={handleStartPress}
        onTouchEnd={handleCancelPress}
        onTouchCancel={handleCancelPress}
        onMouseDown={handleStartPress}
        onMouseUp={handleCancelPress}
        onMouseLeave={handleCancelPress}
        className="fixed bottom-3 left-3 z-40 opacity-20 hover:opacity-70 transition-opacity p-2 rounded-full bg-white/40 hover:bg-white/80 backdrop-blur-sm border border-rose-200/40 text-rose-300 hover:text-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-300 cursor-pointer select-none"
      >
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {/* Secret Admin Modal for Configuration Customization */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Main Orchestration Stages with gentle fade-in transitions */}
      <main data-testid="stage-container" className="relative z-10 w-full min-h-screen">
        <div key={currentStage} className="animate-fade-in w-full min-h-screen">
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
        </div>
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
