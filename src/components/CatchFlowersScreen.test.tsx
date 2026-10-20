import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CatchFlowersScreen } from './CatchFlowersScreen';
import { ConfigProvider } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { DEFAULT_CONFIG } from '../data/defaultConfig';
import { AppConfig } from '../types';

describe('CatchFlowersScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderCatchFlowersScreen = (onComplete = vi.fn()) => {
    return {
      onComplete,
      ...render(
        <ConfigProvider>
          <CatchFlowersScreen onComplete={onComplete} />
        </ConfigProvider>
      ),
    };
  };

  it('renders without crashing with game area, basket, and progress header', () => {
    renderCatchFlowersScreen();
    expect(screen.getByTestId('catch-flowers-screen')).toBeInTheDocument();
    expect(screen.getByTestId('game-area')).toBeInTheDocument();
    expect(screen.getByTestId('basket')).toBeInTheDocument();
  });

  it('displays the challenge badge "Thử thách 2: Hái hoa tặng em 🌸"', () => {
    renderCatchFlowersScreen();
    const badge = screen.getByTestId('challenge-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Thử thách 2:\s*Hái hoa tặng em/i);
    expect(badge).toHaveTextContent(/🌸/);
  });

  it('renders progress bar and initial score progress ("Đã hái: 0 / 10 bông hoa 🌸")', () => {
    renderCatchFlowersScreen();
    const progressBar = screen.getByTestId('score-progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');

    const progressText = screen.getByTestId('score-progress-text');
    expect(progressText).toHaveTextContent(/Đã hái:\s*0\s*\/\s*10\s*bông hoa/i);
  });

  it('provides a skip button with min-h-[44px] accessible touch target', () => {
    renderCatchFlowersScreen();
    const skipButton = screen.getByTestId('skip-button');
    expect(skipButton).toBeInTheDocument();
    expect(skipButton).toHaveClass('min-h-[44px]');
    expect(skipButton).toHaveTextContent(/Nhờ anh hái hộ nha/i);
  });

  it('clicking the skip button directly calls onComplete()', () => {
    const onComplete = vi.fn();
    renderCatchFlowersScreen(onComplete);

    const skipButton = screen.getByTestId('skip-button');
    fireEvent.click(skipButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('tracks basket position when user moves pointer/mouse or touch across game area', () => {
    renderCatchFlowersScreen();
    const gameArea = screen.getByTestId('game-area');
    const basket = screen.getByTestId('basket');

    // Initial basket position is centered (50%)
    expect(basket.style.left).toBe('50%');

    // Mock bounding rect with 400px width
    vi.spyOn(gameArea, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 400,
      bottom: 600,
      width: 400,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Simulate mouse move to 30% (120px / 400px = 30%)
    fireEvent.mouseMove(gameArea, { clientX: 120 });
    expect(basket.style.left).toBe('30%');

    // Simulate mouse move near right edge (clamped to 90%)
    fireEvent.mouseMove(gameArea, { clientX: 380 });
    expect(basket.style.left).toBe('90%');

    // Simulate mouse move near left edge (clamped to 10%)
    fireEvent.mouseMove(gameArea, { clientX: 20 });
    expect(basket.style.left).toBe('10%');

    // Simulate touch move across mobile viewport
    fireEvent.touchMove(gameArea, {
      touches: [{ clientX: 200 } as unknown as Touch],
    });
    expect(basket.style.left).toBe('50%');
  });

  it('catches falling flowers on direct tap: plays pop sound, increments score, and shows floating +1', () => {
    const playPopSpy = vi.spyOn(soundManager, 'playPop').mockImplementation(() => {});

    renderCatchFlowersScreen();

    // Spawned flower is rendered
    const items = screen.getAllByTestId('falling-item');
    expect(items.length).toBeGreaterThan(0);

    // Click first item
    fireEvent.click(items[0]);

    expect(playPopSpy).toHaveBeenCalledTimes(1);

    // Score increments to 1
    const progressText = screen.getByTestId('score-progress-text');
    expect(progressText).toHaveTextContent(/Đã hái:\s*1\s*\/\s*10\s*bông hoa/i);

    // Floating +1 indicator is displayed
    const floatingPoints = screen.getAllByTestId('floating-point');
    expect(floatingPoints.length).toBeGreaterThan(0);
    expect(floatingPoints[0]).toHaveTextContent(/\+1/);
  });

  it('detects collision between falling flower and basket during animation loop', () => {
    const playPopSpy = vi.spyOn(soundManager, 'playPop').mockImplementation(() => {});

    renderCatchFlowersScreen();

    // Basket is initially at 50%
    // Advance timers so RAF updates falling flowers down towards basket Y (around 78%-92%)
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    // At least one flower should have collided with basket
    expect(playPopSpy).toHaveBeenCalled();
    const progressBar = screen.getByTestId('score-progress-bar');
    const valuenow = Number(progressBar.getAttribute('aria-valuenow'));
    expect(valuenow).toBeGreaterThan(0);
  });

  it('completes game when score reaches target: plays success sound, triggers flower petals, shows celebration banner, and calls onComplete after delay', () => {
    const playSuccessSpy = vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});
    const confettiSpy = vi.spyOn(triggerConfetti, 'fireFlowerPetals').mockImplementation(() => {});
    const onComplete = vi.fn();

    // Configure target of 1 for fast verification
    const customConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      catchFlowersTarget: 1,
    };
    localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

    renderCatchFlowersScreen(onComplete);

    // Catch the first flower
    const items = screen.getAllByTestId('falling-item');
    fireEvent.click(items[0]);

    expect(playSuccessSpy).toHaveBeenCalledTimes(1);
    expect(confettiSpy).toHaveBeenCalledTimes(1);

    // Celebratory banner appears
    const celebrationBanner = screen.getByTestId('celebration-banner');
    expect(celebrationBanner).toBeInTheDocument();
    expect(celebrationBanner).toHaveTextContent(/Tuyệt vời! Bó hoa 20\/10 đã hoàn thành 💐/i);

    // onComplete is not called immediately
    expect(onComplete).not.toHaveBeenCalled();

    // Advance 1200ms
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('handles custom catchFlowersTarget from ConfigProvider', () => {
    const customConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      catchFlowersTarget: 5,
    };
    localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

    renderCatchFlowersScreen();

    const progressText = screen.getByTestId('score-progress-text');
    expect(progressText).toHaveTextContent(/Đã hái:\s*0\s*\/\s*5\s*bông hoa/i);

    const progressBar = screen.getByTestId('score-progress-bar');
    expect(progressBar).toHaveAttribute('aria-valuemax', '5');
  });

  it('handles target <= 0 by calling onComplete immediately', () => {
    const onComplete = vi.fn();
    const customConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      catchFlowersTarget: 0,
    };
    localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

    renderCatchFlowersScreen(onComplete);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cleans up requestAnimationFrame, spawn intervals, and timeouts on unmount', () => {
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderCatchFlowersScreen();

    unmount();

    expect(cancelRafSpy).toHaveBeenCalled();
  });
});
