// Web Audio API synthesizer for game sounds
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmOscillators = [];
    this.bgmGain = null;
    this.bgmPlaying = false;
    this.enabled = true;
    this.initAudio();
  }

  async initAudio() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.masterGain);
      this.bgmGain.gain.value = 0.15;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  // Ensure audio context is running (requires user interaction)
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopBGM();
  }

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Play a simple tone
  playTone(frequency, duration, type = 'sine', volume = 0.3, delay = 0) {
    if (!this.enabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(this.masterGain);

    const startTime = this.ctx.currentTime + delay;
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Play chord
  playChord(frequencies, duration, type = 'sine', volume = 0.2) {
    frequencies.forEach((freq, i) => {
      this.playTone(freq, duration, type, volume, i * 0.02);
    });
  }

  // ============ Sound Effects ============

  playChop(perfect = false) {
    if (!this.enabled) return;
    if (perfect) {
      // Perfect chop - bright, crisp
      this.playTone(800, 0.05, 'square', 0.4);
      this.playTone(1200, 0.08, 'sine', 0.2, 0.01);
      this.playTone(1600, 0.06, 'triangle', 0.15, 0.02);
    } else {
      // Normal chop - duller
      this.playTone(400, 0.08, 'sawtooth', 0.3);
      this.playTone(300, 0.1, 'triangle', 0.2, 0.02);
    }
  }

  playSizzle() {
    if (!this.enabled) return;
    // White noise burst for sizzle
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  playDing() {
    if (!this.enabled) return;
    // Success ding - major chord
    this.playChord([523.25, 659.25, 783.99], 0.5, 'sine', 0.25);
  }

  playBurnt() {
    if (!this.enabled) return;
    // Burnt sound - descending dissonant
    this.playTone(300, 0.3, 'sawtooth', 0.3);
    this.playTone(250, 0.4, 'sawtooth', 0.2, 0.05);
    this.playTone(200, 0.5, 'sawtooth', 0.15, 0.1);
  }

  playPickup() {
    if (!this.enabled) return;
    this.playTone(600, 0.05, 'sine', 0.2);
    this.playTone(800, 0.05, 'sine', 0.15, 0.02);
  }

  playPlace() {
    if (!this.enabled) return;
    this.playTone(500, 0.06, 'sine', 0.2);
    this.playTone(400, 0.06, 'sine', 0.15, 0.02);
  }

  playServe(success = true) {
    if (!this.enabled) return;
    if (success) {
      // Happy major arpeggio
      this.playChord([523.25, 659.25, 783.99, 1046.5], 0.4, 'sine', 0.2);
      setTimeout(() => this.playChord([783.99, 1046.5, 1318.51], 0.3, 'triangle', 0.15), 150);
    } else {
      // Sad descending
      this.playTone(400, 0.2, 'sawtooth', 0.2);
      this.playTone(350, 0.2, 'sawtooth', 0.15, 0.05);
      this.playTone(300, 0.3, 'sawtooth', 0.15, 0.1);
    }
  }

  playCombo(combo) {
    if (!this.enabled) return;
    // Rising tone based on combo
    const base = 400 + combo * 50;
    this.playTone(base, 0.1, 'square', 0.2);
    this.playTone(base * 1.5, 0.1, 'sine', 0.15, 0.03);
    this.playTone(base * 2, 0.15, 'triangle', 0.1, 0.06);
  }

  playDayEnd() {
    if (!this.enabled) return;
    // Victory fanfare
    const notes = [
      [523.25, 0.2], [659.25, 0.2], [783.99, 0.2], [1046.5, 0.4],
      [783.99, 0.2], [1046.5, 0.2], [1318.51, 0.5],
    ];
    notes.forEach(([freq, dur], i) => {
      this.playTone(freq, dur, 'triangle', 0.2, i * 0.25);
    });
  }

  // ============ Background Music ============

  startBGM() {
    if (!this.enabled || this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.playBGMLoop();
  }

  stopBGM() {
    this.bgmPlaying = false;
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.bgmOscillators = [];
  }

  playBGMLoop() {
    if (!this.bgmPlaying || !this.ctx) return;

    // Simple Indonesian gamelan-inspired loop
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 493.88, 523.25]; // C major pentatonic-ish
    const pattern = [0, 2, 4, 2, 0, 4, 2, 0]; // Note indices
    const noteDuration = 0.6;
    const loopDuration = pattern.length * noteDuration;

    pattern.forEach((noteIndex, i) => {
      const freq = scale[noteIndex % scale.length];
      const delay = i * noteDuration;

      // Main melody
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.08;

      // Envelope
      const start = this.ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + noteDuration - 0.05);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(start);
      osc.stop(start + noteDuration);
      this.bgmOscillators.push(osc);

      // Harmony (lower octave, every other note)
      if (i % 2 === 0) {
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = freq / 2;
        gain2.gain.value = 0.04;

        gain2.gain.setValueAtTime(0, start);
        gain2.gain.linearRampToValueAtTime(0.04, start + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.005, start + noteDuration - 0.1);

        osc2.connect(gain2);
        gain2.connect(this.bgmGain);
        osc2.start(start);
        osc2.stop(start + noteDuration);
        this.bgmOscillators.push(osc2);
      }
    });

    // Schedule next loop
    setTimeout(() => {
      if (this.bgmPlaying) {
        this.playBGMLoop();
      }
    }, loopDuration * 1000);
  }

  // Rush hour music - faster, more intense
  startRushBGM() {
    this.stopBGM();
    this.bgmPlaying = true;
    this.playRushBGMLoop();
  }

  playRushBGMLoop() {
    if (!this.bgmPlaying || !this.ctx) return;

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 493.88, 523.25];
    const pattern = [0, 1, 2, 3, 4, 3, 2, 1]; // Faster pattern
    const noteDuration = 0.3;
    const loopDuration = pattern.length * noteDuration;

    pattern.forEach((noteIndex, i) => {
      const freq = scale[noteIndex % scale.length];
      const delay = i * noteDuration;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.06;

      const start = this.ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, start + noteDuration - 0.02);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(start);
      osc.stop(start + noteDuration);
      this.bgmOscillators.push(osc);
    });

    setTimeout(() => {
      if (this.bgmPlaying) {
        this.playRushBGMLoop();
      }
    }, loopDuration * 1000);
  }
}

// Singleton instance
export const audio = new AudioManager();