// Simple sound effects using Web Audio API
// This avoids external audio files and keeps the app fully offline

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('sound-enabled') !== 'false';
    }
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound-enabled', enabled.toString());
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Simple beep sound
  playBeep(frequency: number = 800, duration: number = 0.1) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Click sound for button interactions
  playClick() {
    this.playBeep(1200, 0.05);
  }

  // Dial rotation sound
  playDialClick() {
    this.playBeep(600, 0.03);
  }

  // Start sound
  playStart() {
    if (!this.enabled) return;
    
    try {
      const ctx = this.initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing start sound:', error);
    }
  }

  // Pause sound
  playPause() {
    this.playBeep(500, 0.1);
  }

  // Completion sound
  playComplete() {
    if (!this.enabled) return;
    
    try {
      const ctx = this.initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Play a pleasant chime
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.value = freq;
          oscillator.type = 'sine';

          const startTime = ctx.currentTime;
          const duration = 0.3;

          gainNode.gain.setValueAtTime(0.1, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        }, index * 150);
      });
    } catch (error) {
      console.error('Error playing complete sound:', error);
    }
  }

  // Cancel sound
  playCancel() {
    if (!this.enabled) return;
    
    try {
      const ctx = this.initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing cancel sound:', error);
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Haptic feedback utility
export const hapticFeedback = {
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  },
  heavy: () => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  },
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  },
  warning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  },
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  },
  pattern: (pattern: number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  },
};