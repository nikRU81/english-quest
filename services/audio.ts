
class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOscillator(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.initCtx();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start();
    osc.stop(this.ctx!.currentTime + duration);
  }

  playClick() {
    this.createOscillator(600, 'sine', 0.1, 0.1);
  }

  playCorrect() {
    this.initCtx();
    const now = this.ctx!.currentTime;
    const freqs = [440, 554.37, 659.25, 880]; // A major arpeggio
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }

  playIncorrect() {
    this.createOscillator(150, 'square', 0.3, 0.05);
    // Add a second slightly detuned oscillator for a "buzz" effect
    setTimeout(() => this.createOscillator(145, 'square', 0.3, 0.05), 10);
  }

  playLevelComplete() {
    this.initCtx();
    const now = this.ctx!.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
    freqs.forEach((f, i) => {
      this.createOscillator(f, 'sine', 1, 0.05);
    });
  }
}

export const sounds = new SoundService();
