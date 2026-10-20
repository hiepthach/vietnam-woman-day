import React, { useState, useEffect } from 'react';
import { Disc, Volume2, VolumeX } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';

export interface MusicPlayerProps {
  className?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ className = '' }) => {
  const { config } = useConfig();
  const [isPlaying, setIsPlaying] = useState<boolean>(() => soundManager.isPlayingBgm());

  useEffect(() => {
    setIsPlaying(soundManager.isPlayingBgm());
  }, []);

  const handleToggle = async () => {
    try {
      await soundManager.toggleBgm(config.bgmUrl);
    } catch (error) {
      console.error('Failed to toggle background music:', error);
    } finally {
      setIsPlaying(soundManager.isPlayingBgm());
    }
  };

  return (
    <aside
      data-testid="music-player"
      className={`fixed top-4 right-4 z-50 select-none ${className}`.trim()}
      aria-label="Trình phát nhạc nền"
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-rose-200/80 hover:bg-white hover:border-rose-300 hover:shadow-lg active:scale-95 transition-all text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 cursor-pointer"
      >
        {/* Spinning Vinyl Disc Icon */}
        <div
          data-testid="music-disc"
          className={`flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 text-white shadow-inner transition-transform ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '3s' }}
        >
          <Disc className="w-4 h-4" />
        </div>

        {/* Animated Audio Equalizer Bars */}
        <div
          data-testid="music-equalizer"
          data-playing={isPlaying ? 'true' : 'false'}
          className="flex items-end gap-1 h-3.5 w-3.5 justify-center"
          aria-hidden="true"
        >
          <span
            className={`w-0.5 rounded-full bg-rose-500 transition-all duration-300 ${
              isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-rose-500 transition-all duration-300 ${
              isPlaying ? 'h-3.5 animate-pulse [animation-delay:150ms]' : 'h-1.5 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-rose-500 transition-all duration-300 ${
              isPlaying ? 'h-2 animate-pulse [animation-delay:300ms]' : 'h-1 opacity-40'
            }`}
          />
        </div>

        {/* Volume status icon */}
        <div className="flex items-center justify-center" aria-hidden="true">
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-rose-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-400 opacity-60" />
          )}
        </div>
      </button>
    </aside>
  );
};
