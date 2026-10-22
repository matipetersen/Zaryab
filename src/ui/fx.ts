// Clima, luz y ambiente de los combates: partículas de pantalla, oscuridad con focos de luz y viñeta.
export type WeatherKind = 'sand' | 'rain' | 'mist' | 'embers' | 'petals' | 'dust' | 'motes' | 'wind' | 'ash';
export interface Ambience { weather: WeatherKind; amb: string; amount: number; tint?: string; lantern?: boolean }

/** Atmósfera de cada mapa: clima + oscuridad ambiental (color y cuánto oscurece) + si los personajes llevan luz propia. */
export const AMBIENCE: Record<string, Ambience> = {
  dunas: { weather: 'sand', amb: '#070d2a', amount: 0.48, tint: '#9fb4ff', lantern: true },
  acueducto: { weather: 'mist', amb: '#04161c', amount: 0.32, tint: '#7fd6e0', lantern: true },
  cubo: { weather: 'motes', amb: '#0c0c26', amount: 0.24, tint: '#b8c0ff' },
  plaza: { weather: 'embers', amb: '#2a0a0a', amount: 0.32, tint: '#ff7a5a' },
  pozo: { weather: 'mist', amb: '#030c18', amount: 0.4, tint: '#7ab8ff', lantern: true },
  medinat: { weather: 'sand', amb: '#2a1606', amount: 0.18, tint: '#ffb060' },
  arena: { weather: 'dust', amb: '#2a1a08', amount: 0.12, tint: '#ffd48a' },
  iglesia: { weather: 'embers', amb: '#12041a', amount: 0.44, tint: '#c88aff', lantern: true },
  cripta: { weather: 'mist', amb: '#03040c', amount: 0.52, tint: '#9fffd0', lantern: true },
  mina: { weather: 'dust', amb: '#080808', amount: 0.48, tint: '#d8c8a8', lantern: true },
  ciudadela: { weather: 'motes', amb: '#150c20', amount: 0.26, tint: '#e0c0ff' },
  eclipse: { weather: 'ash', amb: '#240303', amount: 0.48, tint: '#ff4a3a', lantern: true },
  nido: { weather: 'wind', amb: '#071226', amount: 0.22, tint: '#a8d0ff' },
  cementerio: { weather: 'mist', amb: '#04100a', amount: 0.44, tint: '#a0ffc0', lantern: true },
  jardin: { weather: 'petals', amb: '#180a22', amount: 0.28, tint: '#ffb0e8' },
  zoco: { weather: 'dust', amb: '#240c28', amount: 0.24, tint: '#ffb86a' },
  templo: { weather: 'embers', amb: '#140803', amount: 0.4, tint: '#ff9050', lantern: true },
  callejon: { weather: 'rain', amb: '#0e081a', amount: 0.34, tint: '#9a8cff', lantern: true },
  santuario: { weather: 'motes', amb: '#12061a', amount: 0.3, tint: '#d49aff', lantern: true },
};
/** Atmósfera por defecto (violeta de crepúsculo) para mapas sin ficha propia. */
const DEFAULT_AMB: Ambience = { weather: 'motes', amb: '#120a22', amount: 0.28, tint: '#d4a0ff', lantern: true };
/** Siempre hay luz y sombra en juego: ningún mapa baja de un mínimo de oscuridad y la compañía lleva farol. */
export const ambienceFor = (mapId: string): Ambience => { const a = AMBIENCE[mapId] ?? DEFAULT_AMB; return { ...a, amount: Math.max(a.amount, 0.26), lantern: true }; };

interface P { x: number; y: number; vx: number; vy: number; s: number; a: number; ph: number; life: number }
const R = Math.random;

export class Weather {
  ps: P[] = []; kind: WeatherKind = 'dust'; W = 0; H = 0; bolt = 0;
  set(kind: WeatherKind, W: number, H: number) {
    this.kind = kind; this.W = W; this.H = H; const n = { sand: 90, rain: 130, mist: 14, embers: 46, petals: 28, dust: 40, motes: 34, wind: 36, ash: 60 }[kind];
    this.ps = Array.from({ length: n }, () => this.spawn(true));
  }
  spawn(init = false): P {
    const { W, H, kind } = this; const p: P = { x: R() * W, y: R() * H, vx: 0, vy: 0, s: 1, a: .6, ph: R() * 6.28, life: 0 };
    switch (kind) {
      case 'sand': p.x = init ? R() * W : -20; p.vx = 380 + R() * 260; p.vy = 40 + R() * 40; p.s = 1 + R() * 1.6; p.a = .25 + R() * .35; break;
      case 'rain': p.y = init ? R() * H : -20; p.vx = -90; p.vy = 760 + R() * 260; p.s = 10 + R() * 12; p.a = .25 + R() * .25; break;
      case 'mist': p.x = init ? R() * W : -300; p.y = H * (.2 + R() * .7); p.vx = 14 + R() * 18; p.s = 160 + R() * 220; p.a = .06 + R() * .07; break;
      case 'embers': p.y = init ? R() * H : H + 10; p.vy = -(25 + R() * 55); p.vx = (R() - .5) * 40; p.s = 1 + R() * 2.2; p.a = .6 + R() * .4; break;
      case 'petals': p.y = init ? R() * H : -10; p.vy = 30 + R() * 30; p.vx = 20 + R() * 30; p.s = 3 + R() * 3; p.a = .8; break;
      case 'dust': p.y = init ? R() * H : -10; p.vy = 14 + R() * 20; p.vx = (R() - .5) * 14; p.s = .8 + R() * 1.4; p.a = .25 + R() * .3; break;
      case 'motes': p.vy = -(6 + R() * 12); p.vx = (R() - .5) * 10; p.s = 1.2 + R() * 2; p.a = .35 + R() * .4; break;
      case 'wind': p.x = init ? R() * W : -60; p.vx = 300 + R() * 220; p.vy = (R() - .5) * 30; p.s = 30 + R() * 50; p.a = .08 + R() * .1; break;
      case 'ash': p.y = init ? R() * H : -10; p.vy = 26 + R() * 40; p.vx = (R() - .5) * 30; p.s = 1.4 + R() * 2.4; p.a = .35 + R() * .45; break;
    }
    return p;
  }
  update(dt: number) {
    for (let i = 0; i < this.ps.length; i++) {
      const p = this.ps[i]; p.life += dt; p.ph += dt * 2; p.x += p.vx * dt + (this.kind === 'petals' || this.kind === 'ash' || this.kind === 'embers' ? Math.sin(p.ph) * 18 * dt : 0); p.y += p.vy * dt;
      if (p.x > this.W + 340 || p.x < -340 || p.y > this.H + 30 || p.y < -40) this.ps[i] = this.spawn(false);
    }
    this.bolt = Math.max(0, this.bolt - dt * 3); if (this.kind === 'rain' && R() < dt * .08) this.bolt = 1;
  }
  draw(c: CanvasRenderingContext2D, tint: string) {
    c.save();
    for (const p of this.ps) {
      c.globalAlpha = p.a;
      switch (this.kind) {
        case 'sand': c.strokeStyle = '#e8d2a0'; c.lineWidth = p.s * .7; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * .04, p.y - p.vy * .04); c.stroke(); break;
        case 'rain': c.strokeStyle = '#bcd0ff'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + p.vx * .02, p.y - p.s); c.stroke(); break;
        case 'mist': { const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s); g.addColorStop(0, tint); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.globalAlpha = p.a; c.beginPath(); c.ellipse(p.x, p.y, p.s, p.s * .35, 0, 0, 6.28); c.fill(); break; }
        case 'embers': c.fillStyle = Math.sin(p.ph * 3) > 0 ? '#ffb347' : '#ff6a2b'; c.shadowColor = '#ff8a3d'; c.shadowBlur = 6; c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.28); c.fill(); c.shadowBlur = 0; break;
        case 'petals': c.fillStyle = '#ffb0d8'; c.beginPath(); c.ellipse(p.x, p.y, p.s, p.s * .5, p.ph, 0, 6.28); c.fill(); break;
        case 'dust': c.fillStyle = '#e8d8b8'; c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.28); c.fill(); break;
        case 'motes': c.fillStyle = tint; c.globalAlpha = p.a * (.5 + .5 * Math.sin(p.ph * 2)); c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.28); c.fill(); break;
        case 'wind': c.strokeStyle = '#d8e8ff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.s, p.y - p.vy * .02); c.stroke(); break;
        case 'ash': c.fillStyle = Math.sin(p.ph) > .6 ? '#ff6a4a' : '#c8b8b0'; c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.28); c.fill(); break;
      }
    }
    c.restore();
    if (this.bolt > 0) { c.fillStyle = `rgba(210,220,255,${this.bolt * .22})`; c.fillRect(0, 0, this.W, this.H); }
  }
}

export interface Light { x: number; y: number; r: number; color: string; a: number }
/** Oscuridad ambiental con «agujeros» de luz (fogatas, linternas, hechizos) y un viñeteado de bordes. */
export class Lighting {
  off = document.createElement('canvas'); oc = this.off.getContext('2d')!;
  private st = document.createElement('canvas'); private stKey = '';
  private statics(cw: number, ch: number, amount: number) {
    const w = Math.max(2, Math.round(cw / 2)), h = Math.max(2, Math.round(ch / 2)), key = `${w}|${h}|${amount}`;
    if (key !== this.stKey) {
      this.st.width = w; this.st.height = h; const m = this.st.getContext('2d')!;
      const warm = m.createLinearGradient(0, 0, w * .7, h * .8); warm.addColorStop(0, 'rgba(255,196,128,.13)'); warm.addColorStop(.55, 'rgba(255,196,128,0)'); m.fillStyle = warm; m.fillRect(0, 0, w, h);
      const dark = m.createLinearGradient(w * .35, h * .3, w, h); dark.addColorStop(0, 'rgba(10,4,24,0)'); dark.addColorStop(1, 'rgba(10,4,24,.30)'); m.fillStyle = dark; m.fillRect(0, 0, w, h);
      const v = m.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${.35 + amount * .4})`); m.fillStyle = v; m.fillRect(0, 0, w, h);
      this.stKey = key;
    }
    return this.st;
  }
  draw(main: CanvasRenderingContext2D, W: number, H: number, amb: Ambience, lights: Light[], time: number) {
    if (amb.amount <= 0) return;
    const w = Math.max(2, Math.round(W / 2)), h = Math.max(2, Math.round(H / 2)); if (this.off.width !== w || this.off.height !== h) { this.off.width = w; this.off.height = h; }
    const o = this.oc; o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, w, h);
    o.globalAlpha = amb.amount; o.fillStyle = amb.amb; o.fillRect(0, 0, w, h); o.globalAlpha = 1;
    o.globalCompositeOperation = 'destination-out';
    for (const l of lights) { const x = l.x / 2, y = l.y / 2, r = l.r / 2 * (1 + .04 * Math.sin(time * 9 + l.x)); const g = o.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${l.a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); o.fillStyle = g; o.beginPath(); o.arc(x, y, r, 0, 6.28); o.fill(); }
    // luz direccional y viñeteado (no cambian entre cuadros, vienen ya pintados) se funden en la misma capa: un solo pase sobre la pantalla
    o.globalCompositeOperation = 'source-over'; o.drawImage(this.statics(main.canvas.width, main.canvas.height, amb.amount), 0, 0, w, h);
    main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.drawImage(this.off, 0, 0, W * (main.canvas.width / W), H * (main.canvas.height / H));
    const k = main.canvas.width / W, kh = main.canvas.height / H;
    main.globalCompositeOperation = 'lighter';
    for (const l of lights) { // el resplandor de cada luz solo cubre su propio recuadro, no toda la pantalla
      const x = l.x * k, y = l.y * kh, r = l.r * .8 * k; const g = main.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, l.color.replace('A', String(l.a * .22))); g.addColorStop(1, 'rgba(0,0,0,0)'); main.fillStyle = g; main.fillRect(x - r, y - r, r * 2, r * 2);
    }
    main.globalCompositeOperation = 'source-over';
    main.restore();
  }
}
