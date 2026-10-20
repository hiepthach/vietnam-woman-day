import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FloatingHearts } from './FloatingHearts';
import { MusicPlayer } from './MusicPlayer';
import { ConfigProvider } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';

describe('FloatingHearts Component', () => {
  it('renders without crashing', () => {
    render(<FloatingHearts />);
    const container = screen.getByTestId('floating-hearts');
    expect(container).toBeInTheDocument();
  });

  it('has pointer-events-none and proper layout classes to never block clicks', () => {
    render(<FloatingHearts />);
    const container = screen.getByTestId('floating-hearts');
    expect(container).toHaveClass('pointer-events-none');
    expect(container).toHaveClass('fixed');
    expect(container).toHaveClass('inset-0');
    expect(container).toHaveClass('overflow-hidden');
    expect(container).toHaveClass('select-none');
    expect(container).toHaveClass('z-0');
  });

  it('has aria-hidden for accessibility as decorative background', () => {
    render(<FloatingHearts />);
    const container = screen.getByTestId('floating-hearts');
    expect(container).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders between 15 and 20 floating particles with romantic symbols', () => {
    render(<FloatingHearts />);
    const particles = screen.getAllByTestId('floating-particle');
    expect(particles.length).toBeGreaterThanOrEqual(15);
    expect(particles.length).toBeLessThanOrEqual(20);

    const validSymbols = ['💖', '🌸', '✨', '🌹', '💕', '❤️'];
    particles.forEach((particle) => {
      const text = particle.textContent?.trim() || '';
      expect(validSymbols.some((symbol) => text.includes(symbol))).toBe(true);
    });
  });

  it('applies animation and positioning styles to particles', () => {
    render(<FloatingHearts />);
    const particles = screen.getAllByTestId('floating-particle');
    const first = particles[0];
    expect(first.style.animationDuration).toBeTruthy();
    expect(first.style.animationDelay).toBeTruthy();
    expect(first.style.left).toBeTruthy();
  });
});

describe('MusicPlayer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();
  });

  const renderWithConfig = (ui: React.ReactElement) => {
    return render(<ConfigProvider>{ui}</ConfigProvider>);
  };

  it('renders fixed at top-right corner with z-50', () => {
    renderWithConfig(<MusicPlayer />);
    const player = screen.getByTestId('music-player');
    expect(player).toHaveClass('fixed');
    expect(player).toHaveClass('top-4');
    expect(player).toHaveClass('right-4');
    expect(player).toHaveClass('z-50');
  });

  it('renders a clickable button with accessible label', () => {
    renderWithConfig(<MusicPlayer />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label');
  });

  it('calls soundManager.toggleBgm with config bgmUrl when clicked', async () => {
    const toggleSpy = vi.spyOn(soundManager, 'toggleBgm').mockImplementation(async () => {});
    vi.spyOn(soundManager, 'isPlayingBgm').mockReturnValue(false);

    renderWithConfig(<MusicPlayer />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy).toHaveBeenCalledWith(expect.any(String));
  });

  it('updates animation and visual state when playing and paused', async () => {
    let playing = false;
    vi.spyOn(soundManager, 'isPlayingBgm').mockImplementation(() => playing);
    vi.spyOn(soundManager, 'toggleBgm').mockImplementation(async () => {
      playing = !playing;
    });

    renderWithConfig(<MusicPlayer />);
    const button = screen.getByRole('button');
    const disc = screen.getByTestId('music-disc');
    const equalizer = screen.getByTestId('music-equalizer');

    // Initially paused
    expect(disc).not.toHaveClass('animate-spin');
    expect(equalizer).toHaveAttribute('data-playing', 'false');

    // Click to play
    fireEvent.click(button);

    await waitFor(() => {
      expect(disc).toHaveClass('animate-spin');
      expect(equalizer).toHaveAttribute('data-playing', 'true');
    });

    // Click to pause
    fireEvent.click(button);

    await waitFor(() => {
      expect(disc).not.toHaveClass('animate-spin');
      expect(equalizer).toHaveAttribute('data-playing', 'false');
    });
  });

  it('handles toggle errors gracefully without throwing', async () => {
    vi.spyOn(soundManager, 'toggleBgm').mockRejectedValue(new Error('Audio playback blocked'));

    renderWithConfig(<MusicPlayer />);
    const button = screen.getByRole('button');

    expect(() => fireEvent.click(button)).not.toThrow();
  });
});
