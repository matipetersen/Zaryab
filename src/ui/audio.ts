// Audio procedural: música generativa por ambiente y efectos, todo sintetizado con WebAudio (sin archivos ni licencias).
// Escala principal: re frigio dominante (D Eb F# G A Bb C), el «sabor» árabe/desértico. Se activa con el primer gesto del usuario.
export type Mood = 'off' | 'menu' | 'desert' | 'city' | 'tense' | 'battle' | 'boss' | 'sacred';
export type Sfx = 'click' | 'hit' | 'crit' | 'miss' | 'death' | 'heal' | 'arrow' | 'slash' | 'spell' | 'boom' | 'step' | 'turn' | 'levelup' | 'coin' | 'choice' | 'door';

const SCALE = [0, 1, 4, 5, 7, 8, 10]; // frigio dominante sobre la tónica
const ROOT = 146.83; // D3
const hz = (deg: number, oct = 0) => { const n = SCALE[((deg % 7) + 7) % 7] + 12 * (Math.floor(deg / 7) + oct); return ROOT * Math.pow(2, n / 12); };

// ───── temas (leitmotivs): melodías escritas que vuelven en los momentos clave ─────
// Cada nota es [semitonos desde re4, pulsos]; null = silencio. `bass` es una nota grave por compás.
type Note = [number | null, number];
interface Theme { bpm: number; beats: number; inst: 'box' | 'warm' | 'saw' | 'bright'; mel: Note[]; bass: number[]; vol: number }
const NANA: Note[] = [[7, 1], [3, 1], [5, 1], [7, 2], [8, 1], [7, 1], [5, 1], [3, 1], [5, 3], [3, 1], [5, 1], [7, 1], [10, 2], [8, 1], [7, 1], [5, 1], [2, 1], [0, 3]];
const ZAHIR: Note[] = [[0, 1], [4, 1], [7, 1], [9, 1], [7, 2], [4, 1], [5, 1], [7, 1], [9, 1], [12, 2], [11, 1], [9, 1], [7, 2], [9, 1], [7, 1], [4, 1], [5, 1], [4, 2], [1, 1], [0, 1], [4, 1], [7, 1], [5, 1], [4, 1], [0, 4]];
const RAZUL: Note[] = [[12, 2], [10, 2], [8, 3], [7, 1], [5, 2], [3, 1], [5, 1], [7, 4], [8, 2], [7, 2], [5, 2], [3, 2], [2, 2], [1, 1], [2, 1], [0, 4]];
const map = (ns: Note[], m: Record<number, number>, shift = 0): Note[] => ns.map(([n, d]) => [n == null ? null : (m[((n % 12) + 12) % 12] != null ? n - (n % 12) + m[n % 12] : n) + shift, d]);
const THEMES: Record<string, Theme> = {
  // la nana de Farid: re menor, caja de música, en 3/4
  nana: { bpm: 76, beats: 3, inst: 'box', mel: NANA, bass: [-12, -16, -14, -17, -9, -16, -17, -12], vol: .1 },
  // la nana resuelta en mayor: el final luminoso
  final_luz: { bpm: 80, beats: 3, inst: 'bright', mel: map(NANA, { 3: 4, 8: 9, 10: 11 }), bass: [-12, -15, -13, -17, -8, -15, -17, -12], vol: .1 },
  // la nana como canto del Lich: más rápida y en sierra, sobre los tambores del jefe
  nana_lich: { bpm: 104, beats: 3, inst: 'saw', mel: map(NANA, {}, -12), bass: [-24, -28, -26, -29, -21, -28, -29, -24], vol: .07 },
  // Zahir: cálido, casi mayor; sólo al final se le escapa el mi bemol del frigio
  zahir: { bpm: 88, beats: 4, inst: 'warm', mel: ZAHIR, bass: [-12, -19, -15, -17, -15, -11, -17, -12], vol: .09 },
  // el mismo tema, roto: todo baja al frigio y se arrastra
  zahir_roto: { bpm: 62, beats: 4, inst: 'saw', mel: map(ZAHIR, { 2: 1, 9: 8, 11: 10 }), bass: [-12, -12, -11, -12, -11, -12, -11, -12], vol: .08 },
  final_sombra: { bpm: 70, beats: 4, inst: 'saw', mel: map(ZAHIR, { 2: 1, 9: 8, 11: 10 }, -12), bass: [-24, -24, -23, -24, -23, -24, -23, -24], vol: .08 },
  // Razul: un lamento grave que baja como el agua de un pozo
  razul: { bpm: 54, beats: 4, inst: 'saw', mel: map(RAZUL, {}, -12), bass: [-24, -28, -31, -27, -28, -31, -26, -24], vol: .08 },
};
/** Tema de cada jefe en combate (los demás usan sólo el clima de jefe). */
export const BOSS_THEME: Record<string, string> = { al_mazhar: 'nana_lich', simurg_eclipse: 'zahir_roto', razul_final: 'razul' };

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
      this.started = true; void c.resume(); this.setMood(this.pending); if (this.pendingTheme) this.theme(this.pendingTheme);
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
    const pluck = (f: number, v = .12, len = 1.1, type: OscillatorType = 'triangle') => { if (!this.th) this.tone(f, t, len, v, type, 1800); };
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
  // ───── temas ─────
  th?: { name: string; timer: number }; private pendingTheme: string | null = null;
  /** Hace sonar un tema en bucle sobre el clima actual (que deja de improvisar melodía mientras tanto). null lo apaga. */
  theme(name: string | null) {
    this.pendingTheme = name; if (this.th?.name === name) return;
    if (this.th) { clearTimeout(this.th.timer); this.th = undefined; }
    if (!name || !THEMES[name] || !this.started || !this.ctx) return;
    const T = THEMES[name]; const beat = 60 / T.bpm; const loopBeats = T.mel.reduce((a, [, d]) => a + d, 0);
    const D4 = 293.66, f = (n: number) => D4 * Math.pow(2, n / 12);
    const play = () => {
      const c = this.ctx; if (!c || !this.th || this.th.name !== name) return; let t = c.currentTime + .08, b = 0;
      if (!this.muted && !document.hidden) {
        for (const [n, d] of T.mel) {
          if (n != null) {
            const len = d * beat;
            if (T.inst === 'box') { this.tone(f(n), t, Math.max(.9, len * 1.3), T.vol, 'sine', 4200); this.tone(f(n + 12), t, .6, T.vol * .35, 'sine', 6000); }
            else if (T.inst === 'bright') { this.tone(f(n), t, Math.max(.8, len * 1.2), T.vol, 'triangle', 5000); this.tone(f(n + 12), t, .5, T.vol * .3, 'sine', 6000); }
            else if (T.inst === 'warm') this.tone(f(n), t, len * 1.25, T.vol, 'triangle', 2600);
            else this.tone(f(n), t, len * .98, T.vol, 'sawtooth', 900);
          }
          t += d * beat; b += d;
        }
        const bar = T.beats * beat; T.bass.forEach((bn, i) => this.tone(f(bn), c.currentTime + .08 + i * bar, bar * .95, T.vol * .7, 'sine', 500));
      }
      this.th = { name, timer: window.setTimeout(play, Math.max(200, loopBeats * beat * 1000 - 60)) };
    };
    this.th = { name, timer: 0 }; play();
  }
  /** Nivel de señal (0–1) para verificar que suena algo. */
  level() { if (!this.analyser) return 0; const d = new Uint8Array(this.analyser.fftSize); this.analyser.getByteTimeDomainData(d); let s = 0; for (const v of d) s += ((v - 128) / 128) ** 2; return Math.sqrt(s / d.length); }
}
export const audio = new AudioEngine();
if (typeof window !== 'undefined') { const un = () => audio.unlock(); window.addEventListener('pointerdown', un); window.addEventListener('keydown', un); }
