import React from 'react';
import { Crown, Heart, Sparkles } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';

export interface WelcomeScreenProps {
  onStart: () => void;
  className?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, className = '' }) => {
  const { config } = useConfig();

  const handleStart = () => {
    try {
      soundManager.playSuccess();
      soundManager.playBgm(config.bgmUrl).catch((error) => {
        console.error('Failed to start background music:', error);
      });
    } catch (error) {
      console.error('Failed to trigger audio unlock:', error);
    } finally {
      onStart();
    }
  };

  return (
    <section
      data-testid="welcome-screen"
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 relative select-none ${className}`.trim()}
      aria-label="Màn hình chào mừng Ngày Phụ Nữ Việt Nam"
    >
      {/* Decorative ambient glowing backdrops for enhanced glassmorphism */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-pink-300/30 to-rose-300/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div
        data-testid="welcome-card"
        className="relative z-10 w-full max-w-lg mx-auto backdrop-blur-md bg-white/80 border border-rose-200/60 shadow-2xl rounded-3xl p-6 sm:p-10 text-center transition-all duration-300 hover:shadow-rose-100"
      >
        {/* Celebration Header Badge */}
        <div className="flex justify-center mb-5">
          <span
            data-testid="celebration-badge"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs sm:text-sm font-semibold border border-rose-200 shadow-sm"
          >
            <Crown className="w-4 h-4 text-amber-500 fill-amber-400" aria-hidden="true" />
            <span>Ngày Phụ Nữ Việt Nam 20/10</span>
            <Sparkles className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
          </span>
        </div>

        {/* Personalized Recipient Salutation */}
        <div className="mb-2">
          <span className="text-xs sm:text-sm font-medium text-rose-500 tracking-wider uppercase">
            Gửi tặng
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-0.5 mb-3 flex items-center justify-center gap-2">
            <span>{config.recipientName}</span>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 inline-block animate-bounce" aria-hidden="true" />
          </h2>
        </div>

        {/* Romantic Greeting Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 tracking-tight mb-4">
          {config.greetingTitle}
        </h1>

        {/* Romantic Greeting Subtitle */}
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
          {config.greetingSubtitle}
        </p>

        {/* Interactive Pulsating Start Button */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            type="button"
            data-testid="start-button"
            onClick={handleStart}
            aria-label="Chạm để bắt đầu khám phá món quà 💌"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base sm:text-lg shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-400/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 min-h-[48px] animate-pulse cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-300"
          >
            <Sparkles className="w-5 h-5 text-amber-200" aria-hidden="true" />
            <span>Chạm để bắt đầu khám phá món quà 💌</span>
          </button>

          <span className="text-xs text-rose-400 font-medium">
            Bật loa hoặc đeo tai nghe để có trải nghiệm ngọt ngào nhất 🎵
          </span>
        </div>
      </div>
    </section>
  );
};
