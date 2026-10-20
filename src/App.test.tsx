import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';
import { soundManager } from './utils/sound';
import { triggerConfetti } from './utils/confetti';
import { DEFAULT_CONFIG } from './data/defaultConfig';

describe('App End-to-End Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();
    localStorage.clear();
    vi.useFakeTimers();

    // Mock audio playback and confetti to prevent uncaught errors in tests
    vi.spyOn(soundManager, 'playBgm').mockResolvedValue();
    vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});
    vi.spyOn(soundManager, 'playPop').mockImplementation(() => {});
    vi.spyOn(soundManager, 'playOpenGift').mockImplementation(() => {});
    vi.spyOn(triggerConfetti, 'fireFlowerPetals').mockImplementation(() => {});
    vi.spyOn(triggerConfetti, 'fireGiftExplosion').mockImplementation(() => {});
    vi.spyOn(triggerConfetti, 'fireMiniBurst').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing and displays the WelcomeScreen initially with ambient elements', () => {
    render(<App />);

    expect(screen.getByTestId('app-container')).toBeInTheDocument();
    expect(screen.getByTestId('stage-container')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    expect(screen.getByTestId('music-player')).toBeInTheDocument();
    expect(screen.getByTestId('floating-hearts')).toBeInTheDocument();
    expect(screen.getByTestId('admin-trigger-button')).toBeInTheDocument();
  });

  it('navigates the complete circular user journey: Welcome -> Quiz -> Catch Flowers -> Gift Letter -> Welcome', () => {
    render(<App />);

    // 1. Initially on Welcome Screen
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-screen')).not.toBeInTheDocument();

    // Click start button
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);

    // 2. Advanced to Quiz Screen
    expect(screen.getByTestId('quiz-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();

    // Answer Question 1 (default correct is option 1)
    const q1Correct = DEFAULT_CONFIG.quizQuestions[0].correctAnswerIndex;
    fireEvent.click(screen.getByTestId(`quiz-option-${q1Correct}`));
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Answer Question 2 (default correct is option 2)
    const q2Correct = DEFAULT_CONFIG.quizQuestions[1].correctAnswerIndex;
    fireEvent.click(screen.getByTestId(`quiz-option-${q2Correct}`));
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Answer Question 3 (default correct is option 3)
    const q3Correct = DEFAULT_CONFIG.quizQuestions[2].correctAnswerIndex;
    fireEvent.click(screen.getByTestId(`quiz-option-${q3Correct}`));

    // Celebration banner shows and completes quiz after 1200ms
    expect(screen.getByTestId('celebration-banner')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // 3. Advanced to Catch Flowers Screen
    expect(screen.getByTestId('catch-flowers-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-screen')).not.toBeInTheDocument();

    // User chooses to skip via "Nhờ anh hái hộ nha 💖"
    const skipButton = screen.getByTestId('skip-button');
    fireEvent.click(skipButton);

    // 4. Advanced to Gift Letter Screen
    expect(screen.getByTestId('gift-letter-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('catch-flowers-screen')).not.toBeInTheDocument();

    // Open Gift Box to reveal content
    const giftBox = screen.getByTestId('unopened-gift-box');
    fireEvent.click(giftBox);

    expect(screen.getByTestId('grand-reveal')).toBeInTheDocument();

    // Restart journey via "Xem lại hành trình từ đầu 🔄"
    const restartButton = screen.getByTestId('restart-button');
    fireEvent.click(restartButton);

    // 5. Back to Welcome Screen
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('gift-letter-screen')).not.toBeInTheDocument();
  });

  it('completes Catch Flowers stage by catching required flowers instead of skipping', () => {
    // Set custom target of 1 for quick completion test
    const customConfig = {
      ...DEFAULT_CONFIG,
      catchFlowersTarget: 1,
    };
    localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

    render(<App />);

    // Advance to Quiz
    fireEvent.click(screen.getByTestId('start-button'));

    // Answer Quiz questions
    fireEvent.click(screen.getByTestId(`quiz-option-${DEFAULT_CONFIG.quizQuestions[0].correctAnswerIndex}`));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    fireEvent.click(screen.getByTestId(`quiz-option-${DEFAULT_CONFIG.quizQuestions[1].correctAnswerIndex}`));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    fireEvent.click(screen.getByTestId(`quiz-option-${DEFAULT_CONFIG.quizQuestions[2].correctAnswerIndex}`));
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // On Catch Flowers Screen
    expect(screen.getByTestId('catch-flowers-screen')).toBeInTheDocument();

    // Click on spawned flower to reach target of 1
    const items = screen.getAllByTestId('falling-item');
    expect(items.length).toBeGreaterThan(0);
    fireEvent.click(items[0]);

    // Win banner appears
    expect(screen.getByTestId('celebration-banner')).toBeInTheDocument();

    // Advance 1200ms win celebration delay
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Advanced to Gift Letter Screen
    expect(screen.getByTestId('gift-letter-screen')).toBeInTheDocument();
  });

  describe('Secret Admin Modal Triggers', () => {
    it('opens Admin Modal with Ctrl + Shift + E and closes it', () => {
      render(<App />);

      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();

      // Trigger Ctrl + Shift + E
      fireEvent.keyDown(window, {
        key: 'e',
        ctrlKey: true,
        shiftKey: true,
      });

      expect(screen.getByTestId('admin-modal')).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Đóng/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();
    });

    it('opens Admin Modal with Cmd + Shift + E (Mac / MetaKey)', () => {
      render(<App />);

      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();

      // Trigger Cmd + Shift + E
      fireEvent.keyDown(window, {
        key: 'E',
        metaKey: true,
        shiftKey: true,
      });

      expect(screen.getByTestId('admin-modal')).toBeInTheDocument();
    });

    it('opens Admin Modal when clicking the discreet mobile button', () => {
      render(<App />);

      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();

      const adminBtn = screen.getByTestId('admin-trigger-button');
      fireEvent.click(adminBtn);

      expect(screen.getByTestId('admin-modal')).toBeInTheDocument();
    });

    it('opens Admin Modal after holding mobile button for 3 seconds (long-press)', () => {
      render(<App />);

      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();

      const adminBtn = screen.getByTestId('admin-trigger-button');

      // Start touch
      fireEvent.touchStart(adminBtn);

      // Before 3000ms: still closed
      act(() => {
        vi.advanceTimersByTime(2900);
      });
      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();

      // At 3000ms: opens
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByTestId('admin-modal')).toBeInTheDocument();

      // End touch
      fireEvent.touchEnd(adminBtn);
    });

    it('cancels long-press trigger if user releases touch before 3 seconds', () => {
      render(<App />);

      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();

      const adminBtn = screen.getByTestId('admin-trigger-button');

      // Touch start and release after 1 second
      fireEvent.touchStart(adminBtn);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      fireEvent.touchEnd(adminBtn);

      // Advance past 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();
    });
  });
});
