export type BgmStateListener = (isPlaying: boolean) => void;

export class SoundManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private muted = false;
  private currentBgmUrl = '';
  private audioCtx: AudioContext | null = null;
  private bgmListeners: Set<BgmStateListener> = new Set();

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      return this.audioCtx;
    } catch {
      return null;
    }
  }

  subscribe(listener: BgmStateListener): () => void {
    this.bgmListeners.add(listener);
    return () => {
      this.bgmListeners.delete(listener);
    };
  }

  private notifyBgmState(): void {
    const playing = this.isPlayingBgm();
    this.bgmListeners.forEach((listener) => {
      try {
        listener(playing);
      } catch {
        // Audio listener failed silently
      }
    });
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.bgmAudio) {
      this.bgmAudio.muted = muted;
    }
  }

  async playBgm(url?: string): Promise<void> {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      if (typeof this.bgmAudio.addEventListener === 'function') {
        this.bgmAudio.addEventListener('play', () => this.notifyBgmState());
        this.bgmAudio.addEventListener('pause', () => this.notifyBgmState());
        this.bgmAudio.addEventListener('ended', () => this.notifyBgmState());
      }
    }

    this.bgmAudio.muted = this.muted;

    if (url && url !== this.currentBgmUrl) {
      this.currentBgmUrl = url;
      this.bgmAudio.src = url;
    }

    if (!this.bgmAudio.src) return;

    try {
      await this.bgmAudio.play();
    } catch {
      // Gracefully ignore autoplay restrictions or playback errors
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }
    } finally {
      this.notifyBgmState();
    }
  }

  pauseBgm(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.notifyBgmState();
  }

  async toggleBgm(url?: string): Promise<void> {
    if (this.isPlayingBgm()) {
      this.pauseBgm();
    } else {
      await this.playBgm(url || this.currentBgmUrl);
    }
  }

  isPlayingBgm(): boolean {
    return Boolean(this.bgmAudio && !this.bgmAudio.paused);
  }

  playPop(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio playback failed silently
    }
  }

  playSuccess(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High sweet chime arpeggio: C6, E6, G6, C7
      const notes = [1046.5, 1318.51, 1567.98, 2093.0];
      const noteDelay = 0.06;
      const noteDuration = 0.35;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * noteDelay;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch {
      // Audio playback failed silently
    }
  }

  playOpenGift(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Sparkly celebratory chime: rising celebratory harmonic sequence
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      const noteDelay = 0.05;
      const noteDuration = 0.5;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * noteDelay;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Resets internal audio state (useful for cleanup and testing)
   */
  reset(): void {
    this.pauseBgm();
    this.bgmAudio = null;
    this.audioCtx = null;
    this.muted = false;
    this.currentBgmUrl = '';
    this.bgmListeners.clear();
  }
}

export const soundManager = new SoundManager();
