import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WelcomeScreen } from './WelcomeScreen';
import { ConfigProvider } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';
import { DEFAULT_CONFIG } from '../data/defaultConfig';

describe('WelcomeScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();
    localStorage.clear();
  });

  const renderWelcomeScreen = (onStart = vi.fn()) => {
    return {
      onStart,
      ...render(
        <ConfigProvider>
          <WelcomeScreen onStart={onStart} />
        </ConfigProvider>
      ),
    };
  };

  it('renders without crashing with welcome card container', () => {
    renderWelcomeScreen();
    const screenEl = screen.getByTestId('welcome-screen');
    const cardEl = screen.getByTestId('welcome-card');

    expect(screenEl).toBeInTheDocument();
    expect(cardEl).toBeInTheDocument();
  });

  it('displays the special 20/10 celebration badge', () => {
    renderWelcomeScreen();
    const badge = screen.getByTestId('celebration-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/20\/10/);
    expect(badge).toHaveTextContent(/Ngày Phụ Nữ Việt Nam/i);
  });

  it('displays personalized greeting with recipient name from useConfig', () => {
    renderWelcomeScreen();
    expect(screen.getByText(new RegExp(DEFAULT_CONFIG.recipientName, 'i'))).toBeInTheDocument();
  });

  it('displays greeting title and greeting subtitle from useConfig', () => {
    renderWelcomeScreen();
    expect(screen.getByText(DEFAULT_CONFIG.greetingTitle)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_CONFIG.greetingSubtitle)).toBeInTheDocument();
  });

  it('renders start button with touch ergonomics (>= 48px touch target) and pulsating animation', () => {
    renderWelcomeScreen();
    const button = screen.getByRole('button', { name: /khám phá|món quà/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('min-h-[48px]');
    expect(button.className).toContain('animate-pulse');
  });

  it('calls soundManager.playBgm with config bgmUrl and calls soundManager.playSuccess on button click', async () => {
    const playBgmSpy = vi.spyOn(soundManager, 'playBgm').mockResolvedValue(undefined);
    const playSuccessSpy = vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});
    const onStart = vi.fn();

    renderWelcomeScreen(onStart);
    const button = screen.getByRole('button', { name: /khám phá|món quà/i });
    fireEvent.click(button);

    expect(playSuccessSpy).toHaveBeenCalledTimes(1);
    expect(playBgmSpy).toHaveBeenCalledTimes(1);
    expect(playBgmSpy).toHaveBeenCalledWith(DEFAULT_CONFIG.bgmUrl);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onStart even if soundManager.playBgm encounters an error', async () => {
    vi.spyOn(soundManager, 'playBgm').mockRejectedValue(new Error('Audio playback autoplay blocked'));
    vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});
    const onStart = vi.fn();

    renderWelcomeScreen(onStart);
    const button = screen.getByRole('button', { name: /khám phá|món quà/i });
    fireEvent.click(button);

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('displays custom recipientName and titles when updated in storage', () => {
    const customConfig = {
      ...DEFAULT_CONFIG,
      recipientName: 'Công Chúa Nhỏ',
      greetingTitle: 'Chúc Em 20/10 Siêu Vui Vẻ',
      greetingSubtitle: 'Nụ cười của em là điều tuyệt vời nhất!',
    };
    localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

    renderWelcomeScreen();
    expect(screen.getByText(/Công Chúa Nhỏ/i)).toBeInTheDocument();
    expect(screen.getByText('Chúc Em 20/10 Siêu Vui Vẻ')).toBeInTheDocument();
    expect(screen.getByText('Nụ cười của em là điều tuyệt vời nhất!')).toBeInTheDocument();
  });

  it('has glassmorphism styling and romantic theme classes on the welcome card', () => {
    renderWelcomeScreen();
    const cardEl = screen.getByTestId('welcome-card');
    expect(cardEl.className).toContain('backdrop-blur');
    expect(cardEl.className).toContain('rounded-3xl');
    expect(cardEl.className).toContain('shadow-2xl');
  });
});
