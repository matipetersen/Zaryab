// Audio procedural: música generativa por ambiente y efectos, todo sintetizado con WebAudio (sin archivos ni licencias).
// Escala principal: re frigio dominante (D Eb F# G A Bb C), el «sabor» árabe/desértico. Se activa con el primer gesto del usuario.
export type Mood = 'off' | 'menu' | 'desert' | 'city' | 'tense' | 'battle' | 'boss' | 'sacred';
export type Sfx = 'click' | 'hit' | 'crit' | 'miss' | 'death' | 'heal' | 'arrow' | 'slash' | 'spell' | 'boom' | 'step' | 'turn' | 'levelup' | 'coin' | 'choice' | 'door';

const SCALE = [0, 1, 4, 5, 7, 8, 10]; // frigio dominante sobre la tónica
const ROOT = 146.83; // D3
const hz = (deg: number, oct = 0) => { const n = SCALE[((deg % 7) + 7) % 7] + 12 * (Math.floor(deg / 7) + oct); return ROOT * Math.pow(2, n / 12); };

class AudioEngine {
  ctx?: AudioContext; master?: GainNode; music?: GainNode; fx?: GainNode; verb?: ConvolverNode; analyser?: AnalyserNode;
  mood: Mood = 'off'; muted = false; started = false; private timer = 0; private step = 0; private noiseBuf?: AudioBuffer; private drones: { o: OscillatorNode; g: GainNode }[] = []; private windG?: GainNode; private pending: Mood = 'off';
  constructor() { try { this.muted = localStorage.getItem('zaryab.muted') === '1'; } catch { /* */ } }

  /** Hay que llamarlo desde un gesto del usuario (clic/tecla) por la política de autoplay. */
  unlock() {
    if (this.started) { if (this.ctx?.state === 'suspended') void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as any).webkitAudioContext; if (!AC) return;
    try {
      const c = this.ctx = new AC(); this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : .8;
      this.analyser = c.createAnalyser(); this.analyser.fftSize = 512; this.master.connect(this.analyser); this.analyser.connect(c.destination);
      this.music = c.createGain(); this.music.gain.value = .5; this.fx = c.createGain(); this.fx.gain.value = .7;
      this.verb = c.createConvolver(); this.verb.buffer = this.impulse(2.4); const vg = c.createGain(); vg.gain.value = .35; this.verb.connect(vg); vg.connect(this.master);
      this.music.connect(this.master); this.music.connect(this.verb); this.fx.connect(this.master);
      const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.noiseBuf = b;
      this.started = true; void c.resume(); this.setMood(this.pending);
    } catch { /* sin audio */ }
  }
  private impulse(sec: number) { const c = this.ctx!, n = c.sampleRate * sec, b = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); } return b; }
  toggleMute() { this.muted = !this.muted; try { localStorage.setItem('zaryab.muted', this.muted ? '1' : '0'); } catch { /* */ } if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : .8, this.ctx.currentTime, .05); return this.muted; }

  // ───── música ─────
  setMood(m: Mood) {
    this.pending = m; if (!this.started || !this.ctx) return; if (m === this.mood) return; this.mood = m;
    clearInterval(this.timer); this.step = 0; this.stopDrones(); if (m === 'off') return;
    const c = this.ctx; const DR: Partial<Record<Mood, [number[], number]>> = { menu: [[0, 4], .05], desert: [[0, 4], .06], city: [[0], .04], tense: [[0, 1], .07], battle: [[0, 4], .06], boss: [[0, 1, 4], .08], sacred: [[0, 4, 7], .05] };
    const [degs, vol] = DR[m] ?? [[0], .04];
    for (const d of degs) { const o = c.createOscillator(), g = c.createGain(); o.type = m === 'boss' ? 'sawtooth' : 'sine'; o.frequency.value = hz(d, -1); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = m === 'boss' ? 380 : 240; g.gain.value = 0; g.gain.setTargetAtTime(vol, c.currentTime, 1.5); o.connect(f); f.connect(g); g.connect(this.music!); o.start(); this.drones.push({ o, g }); }
    // viento
    if (m !== 'battle' && m !== 'boss') { const s = c.createBufferSource(); s.buffer = this.noiseBuf!; s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = .6; const g = c.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(m === 'menu' || m === 'desert' ? .05 : .022, c.currentTime, 2); const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = .07; lg.gain.value = 260; l.connect(lg); lg.connect(f.frequency); l.start(); s.connect(f); f.connect(g); g.connect(this.music!); s.start(); this.windG = g; this.drones.push({ o: s as any, g }); this.drones.push({ o: l, g: lg }); }
    const bpm = { menu: 60, desert: 58, city: 84, tense: 50, battle: 118, boss: 136, sacred: 52 }[m] ?? 60; const beat = 60 / bpm;
    this.timer = window.setInterval(() => this.tick(beat), beat * 1000 / 2); // corcheas
  }
  private stopDrones() { const c = this.ctx!; for (const { o, g } of this.drones) { try { g.gain.setTargetAtTime(0, c.currentTime, .4); (o as any).stop?.(c.currentTime + 1.5); } catch { /* */ } } this.drones = []; }
  private tick(beat: number) {
    const c = this.ctx; if (!c || document.hidden || this.muted) { this.step++; return; } const t = c.currentTime + .03, s = this.step++, m = this.mood, r = Math.random;
    const pluck = (f: number, v = .12, len = 1.1, type: OscillatorType = 'triangle') => this.tone(f, t, len, v, type, 1800);
    if (m === 'menu' || m === 'desert' || m === 'sacred') { if (s % 8 === 0 && r() < .8) pluck(hz(Math.floor(r() * 5), 1), .09, 3.2, 'sine'); if (s % 16 === 6 && r() < .6) pluck(hz(2 + Math.floor(r() * 4), 2), .06, 2.6, 'sine'); if (m === 'menu' && r() < .5) this.crackle(t); }
    else if (m === 'city') { const pat = [0, 2, 4, 3, 2, 1, 0, 4]; if (s % 2 === 0) pluck(hz(pat[(s / 2) % 8], 1), .1, .55); if (s % 8 === 0) this.drum(t, 'low'); if (s % 8 === 4) this.drum(t, 'hi'); if (s % 4 === 2) this.drum(t, 'tick'); }
    else if (m === 'tense') { if (s % 16 === 0) pluck(hz(1, 0), .1, 3.5, 'sine'); if (s % 16 === 8 && r() < .7) pluck(hz(0 + (r() < .5 ? 1 : 0), 1), .06, 3, 'sine'); if (s % 4 === 0) this.drum(t, 'heart'); }
    else { const fast = m === 'boss'; const bass = [0, 0, 1, 0, 4, 0, 1, 3]; if (s % 2 === 0) this.tone(hz(bass[(s / 2) % 8], -1), t, beat * .9, fast ? .16 : .13, 'sawtooth', 420); if (s % 4 === 0) this.drum(t, 'low'); if (s % 4 === 2) this.drum(t, fast ? 'snare' : 'hi'); if (fast && s % 2 === 1) this.drum(t, 'tick'); if (s % 8 === 0 && r() < .7) pluck(hz(Math.floor(r() * 7), 1), .07, .6); }
  }
  private tone(f: number, t: number, len: number, vol: number, type: OscillatorType, cutoff: number, dest?: AudioNode) {
    const c = this.ctx!; const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter(); o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cutoff;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + len); o.connect(fl); fl.connect(g); g.connect(dest ?? this.music!); o.start(t); o.stop(t + len + .05);
  }
  private noise(t: number, len: number, vol: number, type: BiquadFilterType, freq: number, q = 1, dest?: AudioNode, sweepTo?: number) {
    const c = this.ctx!; const s = c.createBufferSource(); s.buffer = this.noiseBuf!; const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + len); f.Q.value = q; const g = c.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + len); s.connect(f); f.connect(g); g.connect(dest ?? this.music!); s.start(t, Math.random()); s.stop(t + len + .05);
  }
  private drum(t: number, k: 'low' | 'hi' | 'tick' | 'snare' | 'heart') {
    if (k === 'low' || k === 'heart') { const c = this.ctx!, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(k === 'heart' ? 70 : 110, t); o.frequency.exponentialRampToValueAtTime(40, t + .22); g.gain.setValueAtTime(k === 'heart' ? .22 : .28, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(g); g.connect(this.music!); o.start(t); o.stop(t + .35); }
    else if (k === 'hi') this.noise(t, .12, .07, 'bandpass', 1800, 2); else if (k === 'tick') this.noise(t, .04, .035, 'highpass', 5200); else this.noise(t, .16, .1, 'bandpass', 2400, 1.2);
  }
  private crackle(t: number) { for (let i = 0; i < 3; i++) this.noise(t + Math.random() * .4, .02 + Math.random() * .03, .03 + Math.random() * .03, 'highpass', 2500 + Math.random() * 3000); }

  // ───── efectos ─────
  sfx(k: Sfx) {
    const c = this.ctx; if (!c || this.muted || !this.fx) return; const t = c.currentTime + .005, F = this.fx;
    switch (k) {
      case 'click': this.tone(660, t, .06, .05, 'triangle', 3000, F); break;
      case 'choice': this.tone(hz(0, 2), t, .22, .06, 'sine', 3000, F); this.tone(hz(4, 2), t + .06, .3, .05, 'sine', 3000, F); break;
      case 'hit': this.noise(t, .16, .35, 'lowpass', 1600, .8, F, 220); this.tone(90, t, .2, .3, 'sine', 400, F); break;
      case 'crit': this.noise(t, .3, .45, 'lowpass', 2800, .8, F, 180); this.tone(70, t, .35, .4, 'sine', 400, F); this.tone(hz(4, 2), t + .02, .5, .08, 'triangle', 4000, F); break;
      case 'miss': this.noise(t, .22, .18, 'bandpass', 600, 1.5, F, 2600); break;
      case 'slash': this.noise(t, .18, .22, 'highpass', 1200, .7, F, 4200); break;
      case 'arrow': this.noise(t, .24, .16, 'bandpass', 3200, 2, F, 900); break;
      case 'spell': for (let i = 0; i < 4; i++) this.tone(hz(i * 2 + 2, 2), t + i * .05, .5, .05, 'sine', 5000, F); break;
      case 'boom': this.noise(t, .8, .6, 'lowpass', 900, .8, F, 70); this.tone(55, t, .7, .5, 'sine', 300, F); break;
      case 'heal': for (let i = 0; i < 3; i++) this.tone(hz([0, 2, 4][i], 2), t + i * .09, .55, .07, 'sine', 5000, F); break;
      case 'death': this.tone(130, t, .8, .25, 'sawtooth', 500, F); this.noise(t, .5, .2, 'lowpass', 700, .8, F, 90); break;
      case 'door': this.noise(t, .5, .22, 'lowpass', 700, 1.4, F, 160); this.tone(70, t + .02, .35, .18, 'sawtooth', 300, F); break;
      case 'step': this.noise(t, .05, .08, 'lowpass', 500, 1, F); break;
      case 'turn': this.tone(hz(4, 1), t, .5, .06, 'sine', 3000, F); break;
      case 'coin': this.tone(1320, t, .12, .07, 'square', 3500, F); this.tone(1760, t + .07, .25, .07, 'square', 3500, F); break;
      case 'levelup': for (let i = 0; i < 5; i++) this.tone(hz(i, 2), t + i * .1, .6, .08, 'triangle', 4500, F); break;
    }
  }
  /** Nivel de señal (0–1) para verificar que suena algo. */
  level() { if (!this.analyser) return 0; const d = new Uint8Array(this.analyser.fftSize); this.analyser.getByteTimeDomainData(d); let s = 0; for (const v of d) s += ((v - 128) / 128) ** 2; return Math.sqrt(s / d.length); }
}
export const audio = new AudioEngine();
if (typeof window !== 'undefined') { const un = () => audio.unlock(); window.addEventListener('pointerdown', un); window.addEventListener('keydown', un); }
