class SoundService {
  private ctx: AudioContext | null = null;
  private _enabled: boolean = true;

  get enabled(): boolean {
    return this._enabled;
  }

  setEnabled(value: boolean) {
    this._enabled = value;
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOscillator(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (!this._enabled) return;

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
    if (!this._enabled) return;
    this.createOscillator(600, 'sine', 0.1, 0.1);
  }

  playCorrect() {
    if (!this._enabled) return;
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
    if (!this._enabled) return;
    this.createOscillator(150, 'square', 0.3, 0.05);
    // Add a second slightly detuned oscillator for a "buzz" effect
    setTimeout(() => this.createOscillator(145, 'square', 0.3, 0.05), 10);
  }

  playLevelComplete() {
    if (!this._enabled) return;
    this.initCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
    freqs.forEach((f) => {
      this.createOscillator(f, 'sine', 1, 0.05);
    });
  }

  // Text-to-Speech for word pronunciation
  speak(text: string, lang: 'en-US' | 'ru-RU' = 'en-US') {
    if (!this._enabled) return;
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      window.speechSynthesis.speak(utterance);
    }
  }
}

export const sounds = new SoundService();
