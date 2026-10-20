import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { soundManager } from './sound';
import { triggerConfetti } from './confetti';
import { compressImage } from './imageCompression';
import confetti from 'canvas-confetti';

vi.mock('canvas-confetti', () => {
  const mockConfetti = vi.fn();
  return {
    default: mockConfetti,
  };
});

describe('soundManager', () => {
  let mockAudioInstance: {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    src: string;
    loop: boolean;
    muted: boolean;
    paused: boolean;
  };

  let mockOscillator: {
    type: string;
    frequency: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  let mockGain: {
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
  };

  let mockAudioContext: {
    state: string;
    currentTime: number;
    destination: object;
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();

    mockAudioInstance = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn().mockImplementation(function (this: typeof mockAudioInstance) {
        this.paused = true;
      }),
      src: '',
      loop: false,
      muted: false,
      paused: true,
    };

    mockAudioInstance.play.mockImplementation(function (this: typeof mockAudioInstance) {
      this.paused = false;
      return Promise.resolve();
    });

    vi.stubGlobal('Audio', vi.fn().mockImplementation(() => mockAudioInstance));

    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal('AudioContext', vi.fn().mockImplementation(() => mockAudioContext));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('BGM controls', () => {
    it('initial state is paused and unmuted', () => {
      expect(soundManager.isMuted()).toBe(false);
      expect(soundManager.isPlayingBgm()).toBe(false);
    });

    it('plays BGM with provided url and sets loop', async () => {
      await soundManager.playBgm('https://example.com/music.mp3');
      expect(soundManager.isPlayingBgm()).toBe(true);
      expect(mockAudioInstance.src).toBe('https://example.com/music.mp3');
      expect(mockAudioInstance.loop).toBe(true);
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it('pauses BGM', async () => {
      await soundManager.playBgm('https://example.com/music.mp3');
      expect(soundManager.isPlayingBgm()).toBe(true);

      soundManager.pauseBgm();
      expect(soundManager.isPlayingBgm()).toBe(false);
      expect(mockAudioInstance.pause).toHaveBeenCalled();
    });

    it('toggles BGM between play and pause', async () => {
      await soundManager.toggleBgm('https://example.com/music.mp3');
      expect(soundManager.isPlayingBgm()).toBe(true);

      await soundManager.toggleBgm('https://example.com/music.mp3');
      expect(soundManager.isPlayingBgm()).toBe(false);
    });

    it('handles autoplay error gracefully without throwing', async () => {
      mockAudioInstance.play.mockRejectedValueOnce(new Error('Autoplay blocked'));
      await expect(soundManager.playBgm('https://example.com/blocked.mp3')).resolves.not.toThrow();
      expect(soundManager.isPlayingBgm()).toBe(false);
    });

    it('mutes and unmutes BGM', async () => {
      await soundManager.playBgm('https://example.com/music.mp3');
      expect(soundManager.isMuted()).toBe(false);

      soundManager.setMuted(true);
      expect(soundManager.isMuted()).toBe(true);
      expect(mockAudioInstance.muted).toBe(true);

      soundManager.setMuted(false);
      expect(soundManager.isMuted()).toBe(false);
      expect(mockAudioInstance.muted).toBe(false);
    });

    it('does nothing if playBgm is called without any URL and none is set', async () => {
      await soundManager.playBgm();
      expect(soundManager.isPlayingBgm()).toBe(false);
      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('resumes playing with existing URL if playBgm is called without parameters', async () => {
      await soundManager.playBgm('https://example.com/existing.mp3');
      expect(soundManager.isPlayingBgm()).toBe(true);

      soundManager.pauseBgm();
      expect(soundManager.isPlayingBgm()).toBe(false);

      await soundManager.playBgm();
      expect(soundManager.isPlayingBgm()).toBe(true);
      expect(mockAudioInstance.src).toBe('https://example.com/existing.mp3');
    });
  });

  describe('Synthetic Sound Effects', () => {
    it('plays pop sound effect using Web Audio API', () => {
      soundManager.playPop();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it('plays success sound effect using multiple notes', () => {
      soundManager.playSuccess();
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4);
      expect(mockOscillator.start).toHaveBeenCalledTimes(4);
    });

    it('plays open gift celebratory chime', () => {
      soundManager.playOpenGift();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('does not play sounds when muted', () => {
      soundManager.setMuted(true);
      soundManager.playPop();
      soundManager.playSuccess();
      soundManager.playOpenGift();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('resumes AudioContext if suspended', () => {
      mockAudioContext.state = 'suspended';
      soundManager.playPop();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('falls back to webkitAudioContext if AudioContext is missing', () => {
      vi.stubGlobal('AudioContext', undefined);
      vi.stubGlobal('webkitAudioContext', vi.fn().mockImplementation(() => mockAudioContext));

      soundManager.playPop();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('does not crash when AudioContext is unsupported', () => {
      vi.stubGlobal('AudioContext', undefined);
      vi.stubGlobal('webkitAudioContext', undefined);

      expect(() => {
        soundManager.playPop();
        soundManager.playSuccess();
        soundManager.playOpenGift();
      }).not.toThrow();
    });
  });
});

describe('triggerConfetti', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers soft flower petals with appropriate colors', () => {
    triggerConfetti.fireFlowerPetals();
    expect(confetti).toHaveBeenCalled();
    const calls = vi.mocked(confetti).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const firstCallArgs = calls[0][0];
    expect(firstCallArgs).toBeDefined();
    expect(firstCallArgs?.colors).toBeDefined();
    expect(Array.isArray(firstCallArgs?.colors)).toBe(true);
  });

  it('triggers mini burst with joyful colors', () => {
    triggerConfetti.fireMiniBurst();
    expect(confetti).toHaveBeenCalled();
    const callArgs = vi.mocked(confetti).mock.calls[0][0];
    expect(callArgs?.particleCount).toBeDefined();
    expect(callArgs?.spread).toBeDefined();
  });

  it('triggers gift explosion full screen fireworks over duration', () => {
    triggerConfetti.fireGiftExplosion();
    expect(confetti).toHaveBeenCalled();
    const initialCallCount = vi.mocked(confetti).mock.calls.length;

    // Advance timers by 1 second to verify repeated bursts
    vi.advanceTimersByTime(1000);
    expect(vi.mocked(confetti).mock.calls.length).toBeGreaterThan(initialCallCount);

    // Advance beyond 4 seconds to verify it stops
    vi.advanceTimersByTime(4000);
    const stoppedCount = vi.mocked(confetti).mock.calls.length;
    vi.advanceTimersByTime(2000);
    expect(vi.mocked(confetti).mock.calls.length).toBe(stoppedCount);
  });
});

describe('compressImage', () => {
  let mockDrawImage: ReturnType<typeof vi.fn>;
  let mockToDataURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDrawImage = vi.fn();
    mockToDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mockCompressedData');

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
      this: HTMLCanvasElement,
      contextId: string
    ) {
      if (contextId === '2d') {
        return {
          drawImage: mockDrawImage,
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    });

    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(mockToDataURL);

    // Mock Image
    vi.stubGlobal(
      'Image',
      class {
        width = 1600;
        height = 1200;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src = '';

        set src(value: string) {
          this._src = value;
          setTimeout(() => {
            if (this._src.includes('error')) {
              this.onerror?.();
            } else {
              this.onload?.();
            }
          }, 0);
        }

        get src() {
          return this._src;
        }
      }
    );

    // Mock FileReader
    vi.stubGlobal(
      'FileReader',
      class {
        result: string | null = null;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        readAsDataURL(file: Blob) {
          setTimeout(() => {
            if ((file as File).name === 'error.jpg') {
              this.onerror?.();
            } else {
              this.result = 'data:image/jpeg;base64,originalRawImageData';
              this.onload?.();
            }
          }, 0);
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resizes image proportionally when width > maxWidth (e.g. 1600x1200 -> 800x600)', async () => {
    const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await compressImage(file, 800, 0.75);

    expect(result).toBe('data:image/jpeg;base64,mockCompressedData');
    expect(mockDrawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, 800, 600);
    expect(mockToDataURL).toHaveBeenCalledWith('image/jpeg', 0.75);
  });

  it('preserves dimensions when width <= maxWidth', async () => {
    vi.stubGlobal(
      'Image',
      class {
        width = 400;
        height = 300;
        onload: (() => void) | null = null;
        set src(_v: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      }
    );

    const file = new File(['dummy content'], 'small.jpg', { type: 'image/jpeg' });
    const result = await compressImage(file, 800, 0.8);

    expect(result).toBe('data:image/jpeg;base64,mockCompressedData');
    expect(mockDrawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, 400, 300);
    expect(mockToDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
  });

  it('rejects when FileReader fails', async () => {
    const errorFile = new File(['bad'], 'error.jpg', { type: 'image/jpeg' });
    await expect(compressImage(errorFile)).rejects.toThrow('Failed to read image file');
  });

  it('rejects when Image fails to load', async () => {
    vi.stubGlobal(
      'FileReader',
      class {
        result: string | null = null;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        readAsDataURL() {
          setTimeout(() => {
            this.result = 'data:image/jpeg;base64,image_with_error_trigger';
            this.onload?.();
          }, 0);
        }
      }
    );

    const file = new File(['dummy'], 'img.jpg', { type: 'image/jpeg' });
    await expect(compressImage(file)).rejects.toThrow('Failed to load image');
  });

  it('falls back to reader result if canvas context 2d is not supported', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await compressImage(file, 800, 0.75);

    expect(result).toBe('data:image/jpeg;base64,originalRawImageData');
  });
});
