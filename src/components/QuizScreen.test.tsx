import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuizScreen } from './QuizScreen';
import { ConfigProvider } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { DEFAULT_CONFIG } from '../data/defaultConfig';
import { AppConfig } from '../types';

describe('QuizScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderQuizScreen = (onComplete = vi.fn()) => {
    return {
      onComplete,
      ...render(
        <ConfigProvider>
          <QuizScreen onComplete={onComplete} />
        </ConfigProvider>
      ),
    };
  };

  it('renders without crashing with quiz card and background elements', () => {
    renderQuizScreen();
    expect(screen.getByTestId('quiz-screen')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-card')).toBeInTheDocument();
  });

  it('displays the challenge badge "Thử thách 1: Người hiểu anh nhất 💡"', () => {
    renderQuizScreen();
    const badge = screen.getByTestId('challenge-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Thử thách 1:\s*Người hiểu anh nhất/i);
    expect(badge).toHaveTextContent(/💡/);
  });

  it('renders progress bar and question progress indicator (e.g. Câu hỏi 1 / 3)', () => {
    renderQuizScreen();
    const progressBar = screen.getByTestId('quiz-progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');

    const progressText = screen.getByTestId('quiz-progress-text');
    expect(progressText).toHaveTextContent(/Câu hỏi\s*1\s*\/\s*3/i);
    expect(screen.getByText(/33%\s*Hoàn thành/i)).toBeInTheDocument();
  });

  it('displays the first question and its options from config', () => {
    renderQuizScreen();
    const firstQ = DEFAULT_CONFIG.quizQuestions[0];
    expect(screen.getByTestId('quiz-question-title')).toHaveTextContent(firstQ.question);

    firstQ.options.forEach((optionText, idx) => {
      const optionBtn = screen.getByTestId(`quiz-option-${idx}`);
      expect(optionBtn).toBeInTheDocument();
      expect(optionBtn).toHaveTextContent(optionText);
    });
  });

  it('provides large touch targets (min-h-[48px]) and rounded-2xl buttons for all options', () => {
    renderQuizScreen();
    const options = screen.getAllByRole('button');
    expect(options.length).toBeGreaterThan(0);
    options.forEach((btn) => {
      expect(btn).toHaveClass('min-h-[48px]');
      expect(btn).toHaveClass('rounded-2xl');
    });
  });

  it('handles wrong answer: plays soundPop, highlights option, shakes, and shows humorous wrongMessage banner', () => {
    const playPopSpy = vi.spyOn(soundManager, 'playPop').mockImplementation(() => {});
    const playSuccessSpy = vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});

    renderQuizScreen();
    const firstQ = DEFAULT_CONFIG.quizQuestions[0];
    // correctAnswerIndex is 1, so index 0 is wrong
    const wrongOptionBtn = screen.getByTestId('quiz-option-0');

    fireEvent.click(wrongOptionBtn);

    expect(playPopSpy).toHaveBeenCalledTimes(1);
    expect(playSuccessSpy).not.toHaveBeenCalled();

    // Option should have shake animation & soft amber/red tint
    expect(wrongOptionBtn.className).toMatch(/animate-shake/);

    // Displays the wrongMessage tooltip/banner
    const wrongMessageBanner = screen.getByTestId('wrong-message');
    expect(wrongMessageBanner).toBeInTheDocument();
    expect(wrongMessageBanner).toHaveTextContent(firstQ.wrongMessage);
  });

  it('allows user to try again immediately after selecting wrong answer with no penalty', () => {
    renderQuizScreen();
    const wrongOptionBtn0 = screen.getByTestId('quiz-option-0');
    fireEvent.click(wrongOptionBtn0);
    expect(screen.getByTestId('wrong-message')).toBeInTheDocument();

    // User clicks another wrong answer (index 2)
    const wrongOptionBtn2 = screen.getByTestId('quiz-option-2');
    expect(wrongOptionBtn2).toBeEnabled();
    fireEvent.click(wrongOptionBtn2);
    expect(wrongOptionBtn2.className).toMatch(/animate-shake/);
    expect(screen.getByTestId('wrong-message')).toBeInTheDocument();

    // User can now click the correct answer (index 1)
    const correctOptionBtn = screen.getByTestId('quiz-option-1');
    expect(correctOptionBtn).toBeEnabled();
  });

  it('handles correct answer: plays soundSuccess, fires mini confetti, turns green/emerald, and advances after 800ms', () => {
    const playSuccessSpy = vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});
    const confettiSpy = vi.spyOn(triggerConfetti, 'fireMiniBurst').mockImplementation(() => {});

    renderQuizScreen();
    const firstQ = DEFAULT_CONFIG.quizQuestions[0];
    const correctOptionBtn = screen.getByTestId(`quiz-option-${firstQ.correctAnswerIndex}`);

    fireEvent.click(correctOptionBtn);

    expect(playSuccessSpy).toHaveBeenCalledTimes(1);
    expect(confettiSpy).toHaveBeenCalledTimes(1);
    expect(correctOptionBtn.className).toMatch(/emerald|green/);

    // Before 800ms, still on question 1
    expect(screen.getByTestId('quiz-question-title')).toHaveTextContent(firstQ.question);

    // Advance 800ms
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Now on question 2
    const secondQ = DEFAULT_CONFIG.quizQuestions[1];
    expect(screen.getByTestId('quiz-question-title')).toHaveTextContent(secondQ.question);
    expect(screen.getByTestId('quiz-progress-text')).toHaveTextContent(/Câu hỏi\s*2\s*\/\s*3/i);
    expect(screen.queryByTestId('wrong-message')).not.toBeInTheDocument();
  });

  it('completes all questions and calls onComplete after celebration banner', () => {
    const onComplete = vi.fn();
    renderQuizScreen(onComplete);

    // Question 1: correct answer is index 1
    fireEvent.click(screen.getByTestId('quiz-option-1'));
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Question 2: correct answer is index 2
    fireEvent.click(screen.getByTestId('quiz-option-2'));
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Question 3: correct answer is index 3
    fireEvent.click(screen.getByTestId('quiz-option-3'));

    // Celebration banner should appear
    const celebrationBanner = screen.getByTestId('celebration-banner');
    expect(celebrationBanner).toBeInTheDocument();
    expect(celebrationBanner).toHaveTextContent(/Xuất sắc! Em đã vượt qua Chặng 1!/i);

    // onComplete is called after brief delay (e.g. 1000ms)
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders custom questions provided by ConfigProvider', () => {
    const customConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      quizQuestions: [
        {
          id: 'custom-q1',
          question: 'Em thích trà sữa hương vị gì nhất?',
          options: ['Hồng trà', 'Ô long', 'Matcha', 'Socola'],
          correctAnswerIndex: 1,
          wrongMessage: 'Nhầm rồi nha bé yêu!',
        },
      ],
    };
    localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

    const onComplete = vi.fn();
    renderQuizScreen(onComplete);

    expect(screen.getByTestId('quiz-question-title')).toHaveTextContent('Em thích trà sữa hương vị gì nhất?');
    expect(screen.getByTestId('quiz-progress-text')).toHaveTextContent(/Câu hỏi\s*1\s*\/\s*1/i);

    // Answer custom question
    fireEvent.click(screen.getByTestId('quiz-option-1'));
    expect(screen.getByTestId('celebration-banner')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('handles empty questions list gracefully by triggering onComplete', () => {
    const customConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      quizQuestions: [],
    };
    localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

    const onComplete = vi.fn();
    renderQuizScreen(onComplete);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
