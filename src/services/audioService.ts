import { SoundType, SoundOption } from '../types';

export const AVAILABLE_SOUNDS: SoundOption[] = [
  { id: 'beep', name: 'Digital Beep', description: 'Classic digital timer beeps' },
  { id: 'chime', name: 'Soothing Chime', description: 'Harmonic melodic chime' },
  { id: 'bell', name: 'Classic Bell', description: 'Resonant clock bell chime' },
  { id: 'pulse', name: 'Urgent Pulse', description: 'High-energy alarm siren' },
];

class AudioService {
  private ctx: AudioContext | null = null;
  private ringInterval: number | null = null;
  private muted: boolean = false;

  constructor() {
    const savedMute = localStorage.getItem('cron_muted');
    if (savedMute !== null) {
      this.muted = savedMute === 'true';
    }
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    localStorage.setItem('cron_muted', String(mute));
    if (mute) {
      this.stopRinging();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Quick UI click beep
  public playClick(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio not permitted yet
    }
  }

  // Play a single pattern cycle for a specific sound
  public playSoundPattern(type: SoundType): void {
    if (this.muted) return;
    const ctx = this.getContext();

    switch (type) {
      case 'beep':
        this.playDigitalBeeps(ctx);
        break;
      case 'chime':
        this.playChime(ctx);
        break;
      case 'bell':
        this.playBell(ctx);
        break;
      case 'pulse':
        this.playPulse(ctx);
        break;
    }
  }

  private playDigitalBeeps(ctx: AudioContext): void {
    // 3 pairs of quick high beeps: beep-beep, beep-beep, beep-beep
    const now = ctx.currentTime;
    const freqs = [1046.5, 1046.5, 1046.5, 1046.5, 1046.5, 1046.5];
    const offsets = [0, 0.1, 0.25, 0.35, 0.5, 0.6];

    offsets.forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freqs[idx], now + offset);

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  }

  private playChime(ctx: AudioContext): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.85);
    });
  }

  private playBell(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const baseFreq = 587.33; // D5
    const harmonics = [1, 2.01, 3.02, 4.2];

    harmonics.forEach((harmonic, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * harmonic, now);

      const initialGain = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(initialGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.7);
    });
  }

  private playPulse(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    osc.frequency.setValueAtTime(800, now + 0.35);
    osc.frequency.linearRampToValueAtTime(600, now + 0.65);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.setValueAtTime(0.18, now + 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  // Loop sound until user dismisses or snoozes
  public startRinging(type: SoundType): void {
    this.stopRinging();
    this.playSoundPattern(type);

    const intervalMs = type === 'chime' ? 1400 : type === 'bell' ? 2000 : 1000;
    this.ringInterval = window.setInterval(() => {
      this.playSoundPattern(type);
    }, intervalMs);
  }

  public stopRinging(): void {
    if (this.ringInterval !== null) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  public previewSound(type: SoundType): void {
    this.playSoundPattern(type);
  }
}

export const audioService = new AudioService();

