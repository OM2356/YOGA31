export type SoundscapeType =
  | 'tanpura-drone'
  | 'raga-yaman'
  | 'raga-bhairav'
  | 'santoor-calm'
  | 'om-drone'
  | 'singing-bowl'
  | 'rain'
  | 'forest'
  | 'silence';

const SA_BASE = 136.1; // Traditional C# / Om Sadja frequency

const SWARA_RATIOS = {
  Sa: 1,
  re: 16 / 15,
  Re: 9 / 8,
  Ga: 5 / 4,
  Ma: 4 / 3,
  MaT: 45 / 32,
  Pa: 3 / 2,
  dha: 8 / 5,
  Dha: 5 / 3,
  Ni: 15 / 8,
} as const;

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private timerIds: number[] = [];
  private currentType: SoundscapeType = 'silence';

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.25;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, vol)),
        this.ctx.currentTime,
        0.08
      );
    }
  }

  public playChime(freq = 432, duration = 2.6) {
    try {
      this.ensureContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.28, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
    } catch {
      // Audio playback blocked or unsupported
    }
  }

  private playTanpuraPluck(freq: number, peakGain = 0.14) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const oscMain = this.ctx.createOscillator();
    const oscOver = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    oscMain.type = 'triangle';
    oscMain.frequency.setValueAtTime(freq, now);

    oscOver.type = 'sawtooth';
    oscOver.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 4.5, now + 0.55);
    filter.frequency.exponentialRampToValueAtTime(240, now + 3.9);
    filter.Q.value = 1.6;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.42);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 4.1);

    const overGain = this.ctx.createGain();
    overGain.gain.value = 0.18;

    oscMain.connect(filter);
    oscOver.connect(overGain);
    overGain.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    oscMain.start(now);
    oscOver.start(now);
    oscMain.stop(now + 4.2);
    oscOver.stop(now + 4.2);
  }

  private startTanpuraBed(level = 0.13) {
    if (!this.ctx || !this.masterGain) return;
    // Soft continuous root drone underneath plucked tanpura strings
    const rootOsc = this.ctx.createOscillator();
    const fifthOsc = this.ctx.createOscillator();
    const bedGain = this.ctx.createGain();
    rootOsc.type = 'sine';
    rootOsc.frequency.value = SA_BASE;
    fifthOsc.type = 'sine';
    fifthOsc.frequency.value = SA_BASE * SWARA_RATIOS.Pa;
    bedGain.gain.value = level * 0.7;
    rootOsc.connect(bedGain);
    fifthOsc.connect(bedGain);
    bedGain.connect(this.masterGain);
    rootOsc.start();
    fifthOsc.start();
    this.activeNodes.push(rootOsc, fifthOsc, bedGain);

    // Classic 4-string tanpura pluck pattern: Pa -> Sa' -> Sa' -> Sa
    const strings = [
      SA_BASE * SWARA_RATIOS.Pa,
      SA_BASE * 2,
      SA_BASE * 2,
      SA_BASE,
    ];
    let step = 0;
    this.playTanpuraPluck(strings[0], level);
    const id = window.setInterval(() => {
      step = (step + 1) % strings.length;
      this.playTanpuraPluck(strings[step], level);
    }, 1250);
    this.timerIds.push(id);
  }

  private playBansuriNote(freq: number, prevFreq: number | null, duration = 2.4) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const noteGain = this.ctx.createGain();
    const harmGain = this.ctx.createGain();

    osc.type = 'sine';
    oscHarmonic.type = 'sine';

    if (prevFreq && prevFreq !== freq) {
      osc.frequency.setValueAtTime(prevFreq, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.18);
      oscHarmonic.frequency.setValueAtTime(prevFreq * 2, now);
      oscHarmonic.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.18);
    } else {
      osc.frequency.setValueAtTime(freq, now);
      oscHarmonic.frequency.setValueAtTime(freq * 2, now);
    }

    vibrato.type = 'sine';
    vibrato.frequency.value = 4.2;
    vibratoGain.gain.setValueAtTime(0, now);
    vibratoGain.gain.linearRampToValueAtTime(freq * 0.006, now + duration * 0.55);

    harmGain.gain.value = 0.08;

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(0.18, now + 0.38);
    noteGain.gain.setValueAtTime(0.16, now + Math.max(0.45, duration - 0.55));
    noteGain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.connect(noteGain);
    oscHarmonic.connect(harmGain);
    harmGain.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    oscHarmonic.start(now);
    vibrato.start(now);
    osc.stop(now + duration + 0.08);
    oscHarmonic.stop(now + duration + 0.08);
    vibrato.stop(now + duration + 0.08);
  }

  private playSantoorPluck(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    oscA.type = 'triangle';
    oscB.type = 'sine';
    oscA.frequency.setValueAtTime(freq, now);
    oscB.frequency.setValueAtTime(freq * 1.0022, now); // Shimmering double-string unison

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(420, now + 2.8);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.19, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0004, now + 3.4);

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 3.5);
    oscB.stop(now + 3.5);
  }

  private startRagaFlute(scaleNotes: number[]) {
    let prevFreq: number | null = null;
    let phraseStep = 0;

    const triggerNote = () => {
      // Leave peaceful meditative rests on every 5th slot
      if (phraseStep % 5 === 4) {
        phraseStep++;
        return;
      }
      const noteFreq = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
      this.playBansuriNote(noteFreq, prevFreq, 2.35);
      prevFreq = noteFreq;
      phraseStep++;
    };

    const t0 = window.setTimeout(() => triggerNote(), 700);
    this.timerIds.push(t0);
    const id = window.setInterval(() => triggerNote(), 2150);
    this.timerIds.push(id);
  }

  public startSoundscape(type: SoundscapeType, volume = 0.35) {
    this.stop();
    this.currentType = type;
    if (type === 'silence') return;

    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    this.setVolume(volume);

    if (type === 'tanpura-drone') {
      this.startTanpuraBed(0.16);
    } else if (type === 'raga-yaman') {
      this.startTanpuraBed(0.11);
      // Raga Yaman: Ni_low, Sa, Re, Ga, Ma#, Pa, Dha, Ni, Sa'
      const yamanNotes = [
        SA_BASE * 2 * (SWARA_RATIOS.Ni / 2),
        SA_BASE * 2,
        SA_BASE * 2 * SWARA_RATIOS.Re,
        SA_BASE * 2 * SWARA_RATIOS.Ga,
        SA_BASE * 2 * SWARA_RATIOS.MaT,
        SA_BASE * 2 * SWARA_RATIOS.Pa,
        SA_BASE * 2 * SWARA_RATIOS.Dha,
        SA_BASE * 2 * SWARA_RATIOS.Ni,
        SA_BASE * 4,
      ];
      this.startRagaFlute(yamanNotes);
    } else if (type === 'raga-bhairav') {
      this.startTanpuraBed(0.11);
      // Raga Bhairav: Sa, komal re, Ga, Ma, Pa, komal dha, Ni, Sa'
      const bhairavNotes = [
        SA_BASE * 2,
        SA_BASE * 2 * SWARA_RATIOS.re,
        SA_BASE * 2 * SWARA_RATIOS.Ga,
        SA_BASE * 2 * SWARA_RATIOS.Ma,
        SA_BASE * 2 * SWARA_RATIOS.Pa,
        SA_BASE * 2 * SWARA_RATIOS.dha,
        SA_BASE * 2 * SWARA_RATIOS.Ni,
        SA_BASE * 4,
      ];
      this.startRagaFlute(bhairavNotes);
    } else if (type === 'santoor-calm') {
      this.startTanpuraBed(0.09);
      // Raga Bhopali pentatonic: Sa, Re, Ga, Pa, Dha, Sa'
      const bhopali = [
        SA_BASE * 2,
        SA_BASE * 2 * SWARA_RATIOS.Re,
        SA_BASE * 2 * SWARA_RATIOS.Ga,
        SA_BASE * 2 * SWARA_RATIOS.Pa,
        SA_BASE * 2 * SWARA_RATIOS.Dha,
        SA_BASE * 4,
      ];
      let idx = 0;
      const pluckCycle = () => {
        if (idx % 6 !== 5) {
          const note = bhopali[Math.floor(Math.random() * bhopali.length)];
          this.playSantoorPluck(note);
        }
        idx++;
      };
      const t0 = window.setTimeout(pluckCycle, 450);
      const id = window.setInterval(pluckCycle, 1650);
      this.timerIds.push(t0, id);
    } else if (type === 'om-drone') {
      const freqs = [136.1, 204.15, 272.2];
      freqs.forEach((f, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f;
        g.gain.value = idx === 0 ? 0.25 : 0.08;
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        this.activeNodes.push(osc, g);
      });
    } else if (type === 'singing-bowl') {
      this.playChime(396, 4.2);
      const id = window.setInterval(() => {
        this.playChime(396, 4.2);
      }, 6500);
      this.timerIds.push(id);
    } else if (type === 'rain' || type === 'forest') {
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 950 : 480;
      filter.Q.value = type === 'rain' ? 0.7 : 1.1;

      const gain = this.ctx.createGain();
      gain.gain.value = type === 'rain' ? 0.65 : 0.75;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
      this.activeNodes.push(source, filter, gain);
    }
  }

  public stop() {
    this.timerIds.forEach((id) => {
      clearInterval(id);
      clearTimeout(id);
    });
    this.timerIds = [];

    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore already stopped
      }
    });
    this.activeNodes = [];
    this.currentType = 'silence';
  }

  public getCurrentType() {
    return this.currentType;
  }
}

export const ambientAudio = new AmbientAudioEngine();
