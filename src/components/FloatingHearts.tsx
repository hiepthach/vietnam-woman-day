import React, { useMemo } from 'react';

interface Particle {
  id: number;
  symbol: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  opacity: number;
}

const DEFAULT_PARTICLES: Particle[] = [
  { id: 1, symbol: '💖', left: '4%', size: '1.4rem', duration: '9s', delay: '0s', opacity: 0.65 },
  { id: 2, symbol: '🌸', left: '10%', size: '1.6rem', duration: '12s', delay: '2.5s', opacity: 0.7 },
  { id: 3, symbol: '✨', left: '16%', size: '1.2rem', duration: '8s', delay: '5s', opacity: 0.8 },
  { id: 4, symbol: '🌹', left: '22%', size: '1.8rem', duration: '14s', delay: '1s', opacity: 0.6 },
  { id: 5, symbol: '💕', left: '29%', size: '1.3rem', duration: '10s', delay: '3.5s', opacity: 0.75 },
  { id: 6, symbol: '❤️', left: '35%', size: '1.5rem', duration: '11s', delay: '6s', opacity: 0.6 },
  { id: 7, symbol: '🌸', left: '42%', size: '1.7rem', duration: '13s', delay: '0.8s', opacity: 0.7 },
  { id: 8, symbol: '✨', left: '49%', size: '1.2rem', duration: '7.5s', delay: '4s', opacity: 0.85 },
  { id: 9, symbol: '💖', left: '55%', size: '1.6rem', duration: '10.5s', delay: '1.8s', opacity: 0.65 },
  { id: 10, symbol: '🌹', left: '62%', size: '1.9rem', duration: '15s', delay: '5.5s', opacity: 0.6 },
  { id: 11, symbol: '💕', left: '68%', size: '1.4rem', duration: '9.5s', delay: '2s', opacity: 0.75 },
  { id: 12, symbol: '🌸', left: '75%', size: '1.5rem', duration: '12.5s', delay: '7s', opacity: 0.7 },
  { id: 13, symbol: '✨', left: '81%', size: '1.3rem', duration: '8.5s', delay: '3s', opacity: 0.8 },
  { id: 14, symbol: '💖', left: '88%', size: '1.6rem', duration: '11.5s', delay: '6.5s', opacity: 0.65 },
  { id: 15, symbol: '❤️', left: '94%', size: '1.5rem', duration: '10s', delay: '1.2s', opacity: 0.6 },
  { id: 16, symbol: '🌸', left: '26%', size: '1.4rem', duration: '13.5s', delay: '4.5s', opacity: 0.7 },
  { id: 17, symbol: '💕', left: '58%', size: '1.3rem', duration: '9s', delay: '7.5s', opacity: 0.75 },
  { id: 18, symbol: '✨', left: '85%', size: '1.2rem', duration: '8s', delay: '0.5s', opacity: 0.8 },
];

export interface FloatingHeartsProps {
  className?: string;
  count?: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  className = '',
  count,
}) => {
  const particles = useMemo(() => {
    if (typeof count === 'number' && count > 0) {
      return DEFAULT_PARTICLES.slice(0, count);
    }
    return DEFAULT_PARTICLES;
  }, [count]);

  return (
    <div
      data-testid="floating-hearts"
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden select-none z-0 ${className}`.trim()}
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          data-testid="floating-particle"
          className="absolute will-change-transform animate-float-up inline-block select-none"
          style={{
            left: particle.left,
            bottom: '-40px',
            fontSize: particle.size,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            opacity: particle.opacity,
          }}
        >
          {particle.symbol}
        </span>
      ))}
    </div>
  );
};
