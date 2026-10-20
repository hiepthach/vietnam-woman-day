import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flower2, Sparkles, HeartHandshake } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

export interface CatchFlowersScreenProps {
  onComplete: () => void;
  className?: string;
}

interface FallingItem {
  id: number;
  x: number; // Percentage 10% - 90%
  y: number; // Percentage 0% - 105%
  speed: number; // Percentage per second (25 - 40)
  emoji: string;
}

interface FloatingPoint {
  id: number;
  x: number;
  y: number;
  text: string;
}

const FLOWER_EMOJIS = ['🌹', '🌸', '🌷', '💖', '🌺', '🌼'];

export const CatchFlowersScreen: React.FC<CatchFlowersScreenProps> = ({
  onComplete,
  className = '',
}) => {
  const { config } = useConfig();
  const target = Math.max(0, config.catchFlowersTarget ?? 10);

  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50); // percentage 10% - 90%
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Refs for animation loop state to avoid closure staleness and StrictMode duplication
  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const scoreRef = useRef(0);
  const basketXRef = useRef(50);
  const isCompletedRef = useRef(false);
  const targetRef = useRef(target);
  const nextIdRef = useRef(1);
  const lastTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Synchronize target ref
  useEffect(() => {
    targetRef.current = target;
    if (target <= 0) {
      onComplete();
    }
  }, [target, onComplete]);

  // Keep basketXRef in sync with state
  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  // Helper to safely schedule timeouts with automatic cleanup tracking
  const scheduleTimeout = useCallback((fn: () => void, delayMs: number) => {
    const id = setTimeout(() => {
      timeoutIdsRef.current.delete(id);
      fn();
    }, delayMs);
    timeoutIdsRef.current.add(id);
    return id;
  }, []);

  const addFloatingPoint = useCallback(
    (x: number, y: number, text = '+1 🌸') => {
      const ptId = Date.now() + Math.random();
      const newPt: FloatingPoint = { id: ptId, x, y, text };
      setFloatingPoints((prev) => [...prev, newPt]);

      scheduleTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== ptId));
      }, 700);
    },
    [scheduleTimeout]
  );

  const triggerWin = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsCompleted(true);

    soundManager.playSuccess();
    triggerConfetti.fireFlowerPetals();

    celebrationTimeoutRef.current = setTimeout(() => {
      onComplete();
    }, 1200);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsCompleted(true);
    onComplete();
  }, [onComplete]);

  // Handle catching an item (either via collision detection or direct click)
  const catchItem = useCallback(
    (item: FallingItem) => {
      if (isCompletedRef.current) return;

      // Remove from ref and state
      itemsRef.current = itemsRef.current.filter((it) => it.id !== item.id);
      setFallingItems([...itemsRef.current]);

      // Sound & floating feedback
      soundManager.playPop();
      addFloatingPoint(item.x, Math.max(10, item.y));

      // Increment score
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);

      // Check win condition
      if (nextScore >= targetRef.current) {
        triggerWin();
      }
    },
    [addFloatingPoint, triggerWin]
  );

  // Spawn flower helper
  const spawnFlower = useCallback((preferredX?: number) => {
    if (isCompletedRef.current) return;
    const id = nextIdRef.current++;
    const emoji = FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)];
    const x =
      preferredX !== undefined
        ? preferredX
        : Math.floor(Math.random() * 76) + 12; // 12% to 88%
    const speed = 26 + Math.random() * 12; // 26% to 38% per second

    const newItem: FallingItem = {
      id,
      x,
      y: 0,
      speed,
      emoji,
    };

    itemsRef.current = [...itemsRef.current, newItem];
    setFallingItems([...itemsRef.current]);
  }, []);

  // Update basket X from mouse or touch clientX
  const updateBasketPosition = useCallback((clientX: number) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const width =
      rect.width > 0
        ? rect.width
        : (typeof window !== 'undefined' ? window.innerWidth : 400) || 400;
    const left = rect.width > 0 ? rect.left : 0;
    const percent = ((clientX - left) / width) * 100;
    const clamped = Math.max(10, Math.min(90, percent));
    basketXRef.current = clamped;
    setBasketX(clamped);
  }, []);

  // Pointer & Touch & Mouse event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    updateBasketPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updateBasketPosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      updateBasketPosition(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateBasketPosition(e.clientX);
  };

  // Main animation and collision loop
  useEffect(() => {
    if (target <= 0) return;

    // Initial spawn: 1 flower aligned with basket (50%) and 1 flower slightly to the side
    spawnFlower(50);
    spawnFlower(30);

    const spawnInterval = setInterval(() => {
      if (!isCompletedRef.current && itemsRef.current.length < 6) {
        spawnFlower();
      }
    }, 850);

    const loop = () => {
      const currentTime = Date.now();
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }
      const elapsed = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      const delta = Math.min(Math.max(elapsed, 0.016), 0.1);

      if (!isCompletedRef.current && itemsRef.current.length > 0) {
        const curBasketX = basketXRef.current;
        const basketYMin = 78;
        const basketYMax = 92;
        const catchToleranceX = 14;

        const caughtList: FallingItem[] = [];
        const nextItems: FallingItem[] = [];

        for (const item of itemsRef.current) {
          const nextY = item.y + item.speed * delta;

          // AABB collision detection with basket
          if (
            nextY >= basketYMin &&
            nextY <= basketYMax &&
            Math.abs(item.x - curBasketX) <= catchToleranceX
          ) {
            caughtList.push(item);
          } else if (nextY < 105) {
            // Still in play
            nextItems.push({
              ...item,
              y: nextY,
            });
          }
          // If nextY >= 105, item fell off-screen
        }

        itemsRef.current = nextItems;
        setFallingItems(nextItems);

        // Process caught items
        if (caughtList.length > 0) {
          caughtList.forEach((it) => {
            catchItem(it);
          });
        }
      }

      if (!isCompletedRef.current) {
        rafIdRef.current = requestAnimationFrame(loop);
      }
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      clearInterval(spawnInterval);
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current.clear();
    };
  }, [target, spawnFlower, catchItem]);

  if (target <= 0) {
    return null;
  }

  const progressPercent = Math.min(100, Math.round((score / target) * 100));

  return (
    <section
      data-testid="catch-flowers-screen"
      className={`relative w-full min-h-screen overflow-hidden select-none touch-none bg-gradient-to-b from-rose-50 via-pink-50/70 to-rose-100 flex flex-col justify-between ${className}`.trim()}
      aria-label="Thử thách 2: Hái hoa 20/10"
    >
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -36px) scale(1.3);
          }
        }
        .animate-float-up {
          animation: floatUp 0.7s ease-out forwards;
        }
      `}</style>

      {/* Ambient decorative glowing backdrops */}
      <div
        className="absolute top-1/6 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-tr from-pink-300/20 to-rose-300/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-4 w-64 h-64 bg-rose-200/20 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header / Progress HUD */}
      <header className="relative z-20 w-full max-w-lg mx-auto p-4 sm:p-6 pb-2">
        <div className="backdrop-blur-md bg-white/85 border border-rose-200/70 rounded-3xl p-4 sm:p-5 shadow-lg shadow-rose-100/50">
          {/* Top row: Stage badge & Skip button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              data-testid="challenge-badge"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold border border-amber-200/80 shadow-sm"
            >
              <Flower2 className="w-4 h-4 text-rose-500 fill-rose-200" aria-hidden="true" />
              <span>Thử thách 2: Hái hoa tặng em 🌸</span>
            </span>

            <button
              type="button"
              data-testid="skip-button"
              onClick={handleSkip}
              className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-full border border-rose-200/90 bg-white/95 text-rose-600 shadow-sm hover:bg-rose-50 hover:border-rose-300 hover:shadow transition-all text-xs sm:text-sm font-semibold active:scale-95 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer shrink-0"
              aria-label="Bỏ qua thử thách, nhờ anh hái hộ"
            >
              <HeartHandshake className="w-4 h-4 text-rose-500" aria-hidden="true" />
              <span>Nhờ anh hái hộ nha 💖</span>
            </button>
          </div>

          {/* Progress Header & Counter */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-rose-700 mb-2">
            <span data-testid="score-progress-text">
              Đã hái: {score} / {target} bông hoa 🌸
            </span>
            <span>{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div
            data-testid="score-progress-bar"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={target}
            className="w-full bg-rose-100/90 rounded-full h-3 overflow-hidden shadow-inner"
          >
            <div
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Interactive Game Field */}
      <div
        ref={gameAreaRef}
        data-testid="game-area"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMove}
        className="relative flex-1 w-full max-w-2xl mx-auto overflow-hidden touch-none cursor-grab active:cursor-grabbing select-none"
      >
        {/* Falling Flowers & Hearts */}
        {fallingItems.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid="falling-item"
            data-flower-id={item.id}
            onClick={(e) => {
              e.stopPropagation();
              catchItem(item);
            }}
            className="absolute select-none cursor-pointer text-3xl sm:text-4xl transition-transform active:scale-125 hover:scale-110 drop-shadow-sm focus:outline-none focus:ring-0 bg-transparent border-0 p-0"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-label={`Bông hoa ${item.emoji}`}
          >
            {item.emoji}
          </button>
        ))}

        {/* Floating "+1" point popups */}
        {floatingPoints.map((pt) => (
          <div
            key={pt.id}
            data-testid="floating-point"
            className="absolute pointer-events-none animate-float-up text-base sm:text-lg font-black text-rose-600 drop-shadow-sm select-none z-20"
            style={{
              left: `${pt.x}%`,
              top: `${pt.y}%`,
            }}
          >
            {pt.text}
          </div>
        ))}

        {/* Basket (🧺) tracking user touch / pointer */}
        <div
          data-testid="basket"
          className="absolute bottom-6 select-none pointer-events-none transition-all duration-75 flex flex-col items-center z-10"
          style={{
            left: `${basketX}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-5xl sm:text-6xl filter drop-shadow-md select-none">
            🧺
          </div>
          <span className="text-[11px] font-bold text-rose-700 bg-white/90 border border-rose-200/80 px-2.5 py-0.5 rounded-full shadow-sm mt-1 whitespace-nowrap">
            Kéo giỏ hứng hoa 🌸
          </span>
        </div>

        {/* Celebratory Banner when Target is Reached */}
        {isCompleted && (
          <div
            data-testid="celebration-banner"
            role="status"
            className="absolute inset-x-4 top-1/4 max-w-sm mx-auto p-6 rounded-3xl bg-white/95 border-2 border-rose-300 shadow-2xl text-center z-30 animate-pulse backdrop-blur-md"
          >
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" aria-hidden="true" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 leading-snug">
              Tuyệt vời! Bó hoa 20/10 đã hoàn thành 💐
            </h3>
            <p className="text-xs sm:text-sm text-rose-600 font-medium mt-2">
              Đang chuẩn bị mở bức thư và quà tặng đặc biệt... 💌
            </p>
          </div>
        )}
      </div>

      {/* Helpful Hint Footer */}
      <footer className="relative z-10 text-center py-2 px-4 text-xs font-medium text-rose-500/80 select-none">
        Chạm hoặc kéo giỏ qua lại để hứng những bông hoa xinh xắn nhé! ✨
      </footer>
    </section>
  );
};
