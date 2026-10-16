import type { Battle } from '../engine/battle';
import type { Unit, BEvent, MapDef } from '../engine/types';
import type { P } from '../engine/grid';

const TW = 64, TH = 32, ELEV = 14, WALL = 34, COVER = 18, RIM = 12, US = 1.35;
export interface Overlay { x: number; y: number; kind: 'move' | 'atk' | 'ally' | 'aoe' | 'sel' | 'path' | 'range' | 'mark' }

interface Pal { bg0: string; bg1: string; f1: string; f2: string; diff: string; wallT: string; wallL: string; wallR: string; cov: string; water: string; hazard: string; high: string; mark: string; edge: string }
const PALS: Record<string, Pal> = {
  alley: { bg0: '#2a1b3a', bg1: '#120d1e', f1: '#b69568', f2: '#a8875c', diff: '#8a6c47', wallT: '#d6b98a', wallL: '#8d6a4a', wallR: '#a77f58', cov: '#7a4f2e', water: '#3a6a7a', hazard: '#a03a2a', high: '#c9a874', mark: '#d4a574', edge: 'rgba(0,0,0,.25)' },
  aqueduct: { bg0: '#0f2a2e', bg1: '#071316', f1: '#6e7e78', f2: '#65756f', diff: '#53625c', wallT: '#8b9a92', wallL: '#46544f', wallR: '#5a6a64', cov: '#4b5a54', water: '#2f7f90', hazard: '#a03a2a', high: '#82938b', mark: '#e0b84a', edge: 'rgba(0,0,0,.3)' },
  mirror: { bg0: '#1c1a3a', bg1: '#0a0918', f1: '#cfd3e6', f2: '#c2c7df', diff: '#a7aed0', wallT: '#eef0fb', wallL: '#8e95bd', wallR: '#aab1d6', cov: '#9ba3cf', water: '#6a7fd0', hazard: '#a03a2a', high: '#e3e6f6', mark: '#8E44AD', edge: 'rgba(40,30,90,.25)' },
  tavern: { bg0: '#2a1a12', bg1: '#120a08', f1: '#8b5e3c', f2: '#7e5435', diff: '#664228', wallT: '#a77f58', wallL: '#5a3a22', wallR: '#70482c', cov: '#4e321e', water: '#3a6a7a', hazard: '#a03a2a', high: '#a87d54', mark: '#d4a574', edge: 'rgba(0,0,0,.3)' },
  plaza: { bg0: '#4a1a1a', bg1: '#150808', f1: '#b58f72', f2: '#a9846a', diff: '#8a6a52', wallT: '#d2b48f', wallL: '#7e5a44', wallR: '#966c52', cov: '#6a4430', water: '#3a6a7a', hazard: '#d8492a', high: '#c19a7c', mark: '#d4a574', edge: 'rgba(0,0,0,.3)' },
  garden: { bg0: '#14301f', bg1: '#06120b', f1: '#6f9a5e', f2: '#668f55', diff: '#4f7a45', wallT: '#2f6b3a', wallL: '#1a3d22', wallR: '#235030', cov: '#b8b3c8', water: '#9aa6c8', hazard: '#a03a2a', high: '#8fb27a', mark: '#c58be6', edge: 'rgba(0,0,0,.22)' },
  crater: { bg0: '#0c0a18', bg1: '#030208', f1: '#3a3452', f2: '#342e4b', diff: '#292441', wallT: '#4a4468', wallL: '#171428', wallR: '#211c38', cov: '#2b2640', water: '#5b6fd0', hazard: '#a03a2a', high: '#4e4870', mark: '#8E44AD', edge: 'rgba(120,100,200,.18)' },
  market: { bg0: '#3a1a4a', bg1: '#12071c', f1: '#c9a878', f2: '#bd9c6c', diff: '#9a7c52', wallT: '#e0c8a0', wallL: '#8a5a8a', wallR: '#a46aa4', cov: '#7b3a7a', water: '#3a6a7a', hazard: '#a03a2a', high: '#d4b888', mark: '#d4a574', edge: 'rgba(0,0,0,.25)' },
  ruins: { bg0: '#2a2224', bg1: '#0c0809', f1: '#7e7468', f2: '#756b60', diff: '#5a5148', wallT: '#9a9080', wallL: '#4a4238', wallR: '#5e554a', cov: '#4e463c', water: '#3a6a7a', hazard: '#d8492a', high: '#8e8478', mark: '#d4a574', edge: 'rgba(0,0,0,.3)' },
  sanctum: { bg0: '#2a1840', bg1: '#0c0614', f1: '#6a5a8a', f2: '#605081', diff: '#4a3d68', wallT: '#8a78b0', wallL: '#2e2448', wallR: '#3c3060', cov: '#5a3a6a', water: '#3a6a7a', hazard: '#a03a2a', high: '#7d6aa0', mark: '#e0b84a', edge: 'rgba(0,0,0,.28)' },
  mine: { bg0: '#1a1a24', bg1: '#08080e', f1: '#8c8aa0', f2: '#82809a', diff: '#6a6880', wallT: '#a9a7c0', wallL: '#4a4860', wallR: '#605e7a', cov: '#55536c', water: '#3a6a7a', hazard: '#a03a2a', high: '#9d9bb5', mark: '#d4a574', edge: 'rgba(0,0,0,.3)' },
};
const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16); const r = Math.min(255, Math.max(0, ((n >> 16) & 255) * f)), g = Math.min(255, Math.max(0, ((n >> 8) & 255) * f)), b = Math.min(255, Math.max(0, (n & 255) * f));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
};

interface Vis { x: number; y: number; path: P[]; flash: number; shake: number; alpha: number; bounce: number; dead: number; wobble: number }
interface Float { x: number; y: number; text: string; cls: string; t: number; dx: number }
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; grav: number }
interface Proj { x1: number; y1: number; x2: number; y2: number; t: number; kind: string }
interface Ring { x: number; y: number; t: number; color: string; max: number }

export class Renderer {
  ctx: CanvasRenderingContext2D; b?: Battle; map?: MapDef; pal: Pal = PALS.alley;
  zoom = 1; panX = 0; panY = 0; W = 0; H = 0; dpr = 1;
  vis = new Map<number, Vis>(); overlays: Overlay[] = []; hover: P | null = null; activeUid = -1; selUid = -1;
  floats: Float[] = []; parts: Part[] = []; projs: Proj[] = []; rings: Ring[] = [];
  last = 0; time = 0; shake = 0; running = true; dust: { x: number; y: number; s: number; v: number }[] = [];
  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    for (let i = 0; i < 40; i++) this.dust.push({ x: Math.random(), y: Math.random(), s: Math.random() * 2 + .5, v: Math.random() * .02 + .005 });
    const loop = (t: number) => { if (!this.running) return; const dt = Math.min(.05, (t - this.last) / 1000 || 0); this.last = t; this.time += dt; this.update(dt); this.draw(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    canvas.addEventListener('wheel', e => { e.preventDefault(); const z = this.zoom * (e.deltaY < 0 ? 1.1 : 0.91); this.zoom = Math.max(.5, Math.min(2, z)); }, { passive: false });
    let drag: { x: number; y: number } | null = null;
    canvas.addEventListener('mousedown', e => { if (e.button === 2 || e.button === 1) drag = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => (drag = null));
    window.addEventListener('mousemove', e => { if (drag) { this.panX += e.clientX - drag.x; this.panY += e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; } });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  destroy() { this.running = false; }
  resize() {
    const r = this.canvas.getBoundingClientRect(); this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = r.width; this.H = r.height; this.canvas.width = r.width * this.dpr; this.canvas.height = r.height * this.dpr;
  }
  setBattle(b: Battle, map: MapDef) {
    this.b = b; this.map = map; this.pal = PALS[map.theme] ?? PALS.alley; this.vis.clear(); this.floats = []; this.parts = []; this.overlays = [];
    for (const u of b.units) this.vis.set(u.uid, { x: u.x, y: u.y, path: [], flash: 0, shake: 0, alpha: 1, bounce: 0, dead: 0, wobble: Math.random() * 6 });
    this.zoom = 1; this.panX = 0; this.panY = 0; this.resize();
  }
  // ---------- proyección ----------
  scale() { const g = this.b!.grid; const w = (g.w + g.h) * TW / 2, h = (g.w + g.h) * TH / 2 + WALL; return Math.min(this.W / (w + 80), this.H / (h + 80)) * this.zoom; }
  proj(x: number, y: number, h = 0): P {
    const g = this.b!.grid, s = this.scale();
    const ox = this.W / 2 + this.panX, oy = this.H / 2 + this.panY - ((g.w + g.h) * TH / 4) * s + 10;
    return { x: ox + (x - y) * TW / 2 * s + 0, y: oy + (x + y) * TH / 2 * s - h * s + (g.h - g.w) * 0 };
  }
  tileFromMouse(mx: number, my: number): P | null {
    const g = this.b?.grid; if (!g) return null; const s = this.scale();
    const cand: { x: number; y: number; d: number }[] = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const t = g.tiles[y][x]; const hgt = t.kind === 'high' ? ELEV : 0; const p = this.proj(x, y, hgt);
      const dx = Math.abs(mx - p.x) / (TW / 2 * s), dy = Math.abs(my - (p.y + TH / 2 * s)) / (TH / 2 * s);
      if (dx + dy <= 1) cand.push({ x, y, d: x + y });
    }
    if (!cand.length) return null; cand.sort((a, b) => b.d - a.d); return { x: cand[0].x, y: cand[0].y };
  }
  center(x: number, y: number, h = 0): P { const p = this.proj(x, y, h); return { x: p.x, y: p.y + TH / 2 * this.scale() }; }
  // ---------- eventos ----------
  play(events: BEvent[]) {
    for (const e of events) {
      if (e.t === 'move') { const v = this.vis.get(e.uid); if (v) v.path.push(...e.path.slice(1)); }
      else if (e.t === 'float') { const u = this.b!.byUid(e.uid); if (u) { const v = this.vis.get(e.uid)!; this.floats.push({ x: v.x, y: v.y, text: e.text, cls: e.cls, t: 0, dx: (Math.random() - .5) * 18 }); } }
      else if (e.t === 'hit') { const v = this.vis.get(e.uid); if (v) { v.flash = 1; v.shake = 1; } this.shake = Math.max(this.shake, .5); }
      else if (e.t === 'snap') { const v = this.vis.get(e.uid); if (v) { v.x = e.x; v.y = e.y; v.path = []; } this.shake = Math.max(this.shake, .8); }
      else if (e.t === 'death') { const v = this.vis.get(e.uid); if (v) v.dead = 0.001; const u = this.b!.byUid(e.uid); if (u) this.burst(u.x, u.y, '#d8b27a', 18); }
      else if (e.t === 'spawn') { const u = this.b!.byUid(e.uid); if (u) this.vis.set(e.uid, { x: u.x, y: u.y, path: [], flash: 0, shake: 0, alpha: 1, bounce: 1, dead: 0, wobble: 0 }); }
      else if (e.t === 'fx') this.fx(e);
      else if (e.t === 'tile') this.tileFx(e);
    }
  }
  tileFx(e: Extract<BEvent, { t: 'tile' }>) {
    const col = e.kind === 'boom' || e.kind === 'ignite' ? '#ff8a3d' : e.kind === 'build' ? '#b9c4d8' : e.kind === 'burnout' ? '#6a6a6a' : '#b89a6a';
    this.burst(e.x, e.y, col, e.kind === 'boom' ? 30 : 14); if (e.kind === 'boom') { this.rings.push({ x: e.x, y: e.y, t: 0, color: '#ff8a3d', max: 1.6 }); this.shake = 1; } else if (e.kind === 'break') this.shake = Math.max(this.shake, .4);
  }
  fx(e: Extract<BEvent, { t: 'fx' }>) {
    if (e.kind === 'debris') { this.burst(e.x, e.y, '#b89a6a', 6); return; }
    if (e.kind === 'heal') { const c = this.center(e.x, e.y, 20); for (let i = 0; i < 14; i++) this.parts.push({ x: c.x + (Math.random() - .5) * 20, y: c.y, vx: (Math.random() - .5) * 20, vy: -30 - Math.random() * 30, life: 0, max: .9, color: '#f1c40f', size: 2.5, grav: 0 }); }
    else if (e.kind === 'boom') { this.burst(e.x, e.y, '#ff8a3d', 26); this.rings.push({ x: e.x, y: e.y, t: 0, color: '#ff8a3d', max: 2 }); this.shake = 1; }
    else if (e.kind === 'burst') this.rings.push({ x: e.x, y: e.y, t: 0, color: '#e0b84a', max: 2.5 });
    else if (e.x2 != null) this.projs.push({ x1: e.x, y1: e.y, x2: e.x2, y2: e.y2!, t: 0, kind: e.kind });
  }
  burst(x: number, y: number, color: string, n: number) {
    const c = this.center(x, y, 18); for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 20 + Math.random() * 60; this.parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0, max: .6 + Math.random() * .5, color, size: 2 + Math.random() * 2, grav: 90 }); }
  }
  busy() { for (const v of this.vis.values()) if (v.path.length || (v.dead > 0 && v.dead < 1)) return true; return this.projs.length > 0 || this.floats.some(f => f.t < .35); }
  // ---------- update ----------
  update(dt: number) {
    if (!this.b) return;
    for (const [uid, v] of this.vis) {
      const u = this.b.byUid(uid);
      if (v.path.length) { const t = v.path[0]; const dx = t.x - v.x, dy = t.y - v.y, d = Math.hypot(dx, dy), sp = 9 * dt; if (d <= sp) { v.x = t.x; v.y = t.y; v.path.shift(); } else { v.x += dx / d * sp; v.y += dy / d * sp; } }
      else if (u && !v.path.length && Math.hypot(u.x - v.x, u.y - v.y) > 0.01 && u.x !== undefined) { /* teletransporte */ v.x = u.x; v.y = u.y; }
      v.flash = Math.max(0, v.flash - dt * 4); v.shake = Math.max(0, v.shake - dt * 3); v.bounce = Math.max(0, v.bounce - dt * 2);
      if (v.dead > 0) { v.dead += dt * 1.4; v.alpha = Math.max(0, 1 - v.dead); }
      v.wobble += dt;
    }
    for (const f of this.floats) f.t += dt; this.floats = this.floats.filter(f => f.t < 1.4);
    for (const p of this.parts) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt; } this.parts = this.parts.filter(p => p.life < p.max);
    for (const p of this.projs) p.t += dt * 4.5; this.projs = this.projs.filter(p => p.t < 1);
    for (const r of this.rings) r.t += dt * 2.2; this.rings = this.rings.filter(r => r.t < 1);
    this.shake = Math.max(0, this.shake - dt * 2);
    for (const d of this.dust) { d.x = (d.x + d.v * dt) % 1; }
  }
  // ---------- dibujo ----------
  diamond(x: number, y: number, s: number, fill: string, stroke?: string) {
    const c = this.ctx; c.beginPath(); c.moveTo(x, y); c.lineTo(x + TW / 2 * s, y + TH / 2 * s); c.lineTo(x, y + TH * s); c.lineTo(x - TW / 2 * s, y + TH / 2 * s); c.closePath();
    c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  }
  box(x: number, y: number, s: number, h: number, top: string, left: string, right: string) {
    const c = this.ctx, hh = h * s;
    c.beginPath(); c.moveTo(x - TW / 2 * s, y + TH / 2 * s - hh); c.lineTo(x, y + TH * s - hh); c.lineTo(x, y + TH * s); c.lineTo(x - TW / 2 * s, y + TH / 2 * s); c.closePath(); c.fillStyle = left; c.fill();
    c.beginPath(); c.moveTo(x + TW / 2 * s, y + TH / 2 * s - hh); c.lineTo(x, y + TH * s - hh); c.lineTo(x, y + TH * s); c.lineTo(x + TW / 2 * s, y + TH / 2 * s); c.closePath(); c.fillStyle = right; c.fill();
    c.beginPath(); c.moveTo(x, y - hh); c.lineTo(x + TW / 2 * s, y + TH / 2 * s - hh); c.lineTo(x, y + TH * s - hh); c.lineTo(x - TW / 2 * s, y + TH / 2 * s - hh); c.closePath(); c.fillStyle = top; c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke();
  }
  draw() {
    const c = this.ctx; c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const g0 = c.createRadialGradient(this.W / 2, this.H * .35, 20, this.W / 2, this.H / 2, Math.max(this.W, this.H));
    g0.addColorStop(0, (this.pal.bg0)); g0.addColorStop(1, this.pal.bg1); c.fillStyle = g0; c.fillRect(0, 0, this.W, this.H);
    c.fillStyle = 'rgba(255,230,180,.25)'; for (const d of this.dust) { c.beginPath(); c.arc(d.x * this.W, (d.y * this.H + this.time * 6 * d.s) % this.H, d.s, 0, 6.28); c.fill(); }
    if (!this.b) return; const b = this.b, g = b.grid, s = this.scale();
    if (this.shake > 0) c.translate((Math.random() - .5) * 6 * this.shake, (Math.random() - .5) * 6 * this.shake);
    // suelo
    for (let d = 0; d < g.w + g.h - 1; d++) for (let y = 0; y < g.h; y++) { const x = d - y; if (x < 0 || x >= g.w) continue; const t = g.tiles[y][x]; this.drawFloor(x, y, t.kind, s); }
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const t = g.tiles[y][x]; if (t.obj) { const q = this.center(x, y); const c = this.ctx; const pulse = 0.5 + 0.5 * Math.sin(this.time * 3 + x + y); c.save(); c.globalAlpha = 0.55 + 0.35 * pulse; c.fillStyle = '#ffd66b'; c.beginPath(); c.moveTo(q.x, q.y - 9 * s); c.lineTo(q.x + 7 * s, q.y); c.lineTo(q.x, q.y + 5 * s); c.lineTo(q.x - 7 * s, q.y); c.closePath(); c.fill(); c.fillStyle = '#1a1020'; c.font = `bold ${Math.round(10 * s)}px sans-serif`; c.textAlign = 'center'; c.fillText('!', q.x, q.y + 3 * s); c.restore(); } }
    // overlays
    for (const o of this.overlays) this.drawOverlay(o, s);
    if (this.hover && g.inb(this.hover.x, this.hover.y)) { const t = g.tiles[this.hover.y][this.hover.x]; const p = this.proj(this.hover.x, this.hover.y, t.kind === 'high' ? ELEV : 0); this.diamond(p.x, p.y, s, 'rgba(255,255,255,.10)', 'rgba(255,255,255,.7)'); }
    // objetos y unidades ordenados por profundidad
    type D = { depth: number; fn: () => void };
    const items: D[] = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const t = g.tiles[y][x]; if (t.kind === 'wall' || t.kind === 'cover') items.push({ depth: x + y + 0.1, fn: () => this.drawBlock(x, y, t.kind, s) }); }
    for (const u of b.units) { const v = this.vis.get(u.uid); if (!v || v.alpha <= 0.02) continue; items.push({ depth: v.x + v.y + 0.5, fn: () => this.drawUnit(u, v, s) }); }
    items.sort((a, b2) => a.depth - b2.depth); for (const it of items) it.fn();
    // proyectiles, anillos, partículas
    for (const p of this.projs) { const a = this.center(p.x1, p.y1, 22), z = this.center(p.x2, p.y2, 22); const t = Math.min(1, p.t); const x = a.x + (z.x - a.x) * t, y = a.y + (z.y - a.y) * t;
      c.strokeStyle = p.kind === 'bolt' ? '#cfe7ff' : p.kind === 'arrow' ? '#f0e0b0' : '#fff'; c.lineWidth = p.kind === 'slash' ? 3 : 2; c.beginPath(); c.moveTo(a.x + (z.x - a.x) * Math.max(0, t - .25), a.y + (z.y - a.y) * Math.max(0, t - .25)); c.lineTo(x, y); c.stroke();
      if (p.kind === 'bolt') { c.fillStyle = 'rgba(180,220,255,.8)'; c.beginPath(); c.arc(x, y, 4, 0, 6.28); c.fill(); } }
    for (const r of this.rings) { const p = this.center(r.x, r.y, 0); c.strokeStyle = r.color; c.globalAlpha = 1 - r.t; c.lineWidth = 3; c.beginPath(); c.ellipse(p.x, p.y, r.t * r.max * TW * s, r.t * r.max * TH * s, 0, 0, 6.28); c.stroke(); c.globalAlpha = 1; }
    for (const p of this.parts) { c.globalAlpha = 1 - p.life / p.max; c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size, 0, 6.28); c.fill(); } c.globalAlpha = 1;
    // textos flotantes
    c.textAlign = 'center'; c.font = `bold ${Math.round(18 * Math.max(.8, s))}px "Roboto Mono", monospace`;
    for (const f of this.floats) { const p = this.center(f.x, f.y, 44); const yy = p.y - f.t * 38 * s; c.globalAlpha = Math.max(0, 1 - Math.max(0, f.t - .8) / .6);
      const col = f.cls === 'heal' ? '#5be37d' : f.cls === 'crit' ? '#ffd23f' : f.cls === 'miss' ? '#b8b8c8' : f.cls === 'status' ? '#d9b6ff' : '#ff6b5e';
      c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(f.text, p.x + f.dx, yy); c.fillStyle = col; c.fillText(f.text, p.x + f.dx, yy); } c.globalAlpha = 1;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  drawFloor(x: number, y: number, kind: string, s: number) {
    const P = this.pal, h = kind === 'high' ? ELEV : 0; const p = this.proj(x, y, h);
    if (kind === 'wall' || kind === 'cover') { const q = this.proj(x, y, 0); this.diamond(q.x, q.y, s, shade(P.f2, .6)); return; }
    if (kind === 'high') { this.box(p.x, p.y + h * s, s, h, P.high, shade(P.high, .6), shade(P.high, .75)); return; }
    let col = (x + y) % 2 ? P.f1 : P.f2;
    if (kind === 'diff') col = P.diff; else if (kind === 'water') col = P.water; else if (kind === 'hazard') col = P.hazard; else if (kind === 'mark') col = (x + y) % 2 ? P.f1 : P.f2;
    this.diamond(p.x, p.y, s, col, P.edge);
    const c = this.ctx;
    if (kind === 'diff') { c.strokeStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(p.x - 10 * s, p.y + 14 * s); c.lineTo(p.x + 6 * s, p.y + 10 * s); c.moveTo(p.x - 4 * s, p.y + 22 * s); c.lineTo(p.x + 12 * s, p.y + 18 * s); c.stroke(); }
    if (kind === 'water') { c.strokeStyle = 'rgba(255,255,255,.28)'; c.beginPath(); const wv = Math.sin(this.time * 2 + x + y) * 2; c.moveTo(p.x - 14 * s, p.y + 16 * s + wv); c.quadraticCurveTo(p.x, p.y + 10 * s + wv, p.x + 14 * s, p.y + 16 * s + wv); c.stroke(); }
    if (kind === 'hazard' && this.b!.grid.at(x, y)?.ch === 'f') { for (let i = 0; i < 3; i++) { const fx = p.x + (i - 1) * 11 * s, ph = this.time * 7 + i * 2 + x; const h = (8 + Math.sin(ph) * 3 + i % 2 * 4) * s; c.fillStyle = i === 1 ? '#ffd23f' : '#ff7a2a'; c.beginPath(); c.moveTo(fx - 5 * s, p.y + 22 * s); c.quadraticCurveTo(fx, p.y + 22 * s - h * 2.4, fx + 5 * s, p.y + 22 * s); c.fill(); } }
    else if (kind === 'hazard') { c.fillStyle = `rgba(255,200,80,${.35 + .2 * Math.sin(this.time * 6 + x)})`; c.beginPath(); c.moveTo(p.x, p.y + 6 * s); c.lineTo(p.x + 7 * s, p.y + 22 * s); c.lineTo(p.x - 7 * s, p.y + 22 * s); c.fill(); }
    if (kind === 'mark') { const pulse = .5 + .3 * Math.sin(this.time * 3 + x); c.strokeStyle = `rgba(142,68,173,${pulse + .3})`; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, p.y + 16 * s, 20 * s, 10 * s, 0, 0, 6.28); c.stroke(); c.beginPath(); c.moveTo(p.x, p.y + 6 * s); c.lineTo(p.x + 10 * s, p.y + 16 * s); c.lineTo(p.x, p.y + 26 * s); c.lineTo(p.x - 10 * s, p.y + 16 * s); c.closePath(); c.stroke(); c.lineWidth = 1; }
  }
  drawBlock(x: number, y: number, kind: string, s: number) {
    const P = this.pal; const p = this.proj(x, y, 0);
    if (kind === 'wall') { const g = this.b!.grid; const brittle = g.at(x, y)!.ch === 'x'; const rim = x === 0 || y === 0 || x === g.w - 1 || y === g.h - 1; if (rim) { this.box(p.x, p.y, s, RIM, shade(P.wallT, .9), shade(P.wallL, .8), shade(P.wallR, .8)); return; } this.box(p.x, p.y, s, WALL, brittle ? shade(P.wallT, .85) : P.wallT, brittle ? shade(P.wallL, .9) : P.wallL, brittle ? shade(P.wallR, .9) : P.wallR); const c = this.ctx; if (brittle) { c.strokeStyle = 'rgba(0,0,0,.65)'; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x - 12 * s, p.y + 4 * s); c.lineTo(p.x - 4 * s, p.y + 14 * s); c.lineTo(p.x - 9 * s, p.y + 24 * s); c.lineTo(p.x + 2 * s, p.y + 34 * s); c.moveTo(p.x + 12 * s, p.y + 8 * s); c.lineTo(p.x + 5 * s, p.y + 20 * s); c.stroke(); } c.strokeStyle = 'rgba(0,0,0,.18)'; for (let i = 1; i < 3; i++) { const yy = p.y + TH * s - (WALL / 3) * i * s; c.beginPath(); c.moveTo(p.x - TW / 2 * s, yy - TH / 2 * s); c.lineTo(p.x, yy); c.lineTo(p.x + TW / 2 * s, yy - TH / 2 * s); c.stroke(); } }
    else {
      const t = this.b!.grid.at(x, y)!; const c = this.ctx;
      if (t.ch === 'o') { this.box(p.x, p.y, s, COVER, '#8a4a2a', '#5a2e18', '#6e3a20'); c.fillStyle = '#c0392b'; c.fillRect(p.x - 9 * s, p.y + 4 * s, 18 * s, 4 * s); c.fillStyle = '#ffd23f'; c.font = `bold ${Math.round(10 * s)}px sans-serif`; c.textAlign = 'center'; c.fillText('🔥', p.x, p.y + 20 * s); }
      else if (t.ch === 'C') this.box(p.x, p.y, s, COVER + 4, '#d7dbe6', '#8b92a6', '#a6adc2');
      else this.box(p.x, p.y, s, COVER, shade(P.cov, 1.25), shade(P.cov, .75), P.cov);
      if (t.hp != null && t.maxHp && t.hp < t.maxHp) { c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p.x - 6 * s, p.y + 4 * s); c.lineTo(p.x + 2 * s, p.y + 14 * s); c.lineTo(p.x - 3 * s, p.y + 22 * s); c.stroke(); }
    }
  }
  drawOverlay(o: Overlay, s: number) {
    const t = this.b!.grid.at(o.x, o.y); if (!t) return; const p = this.proj(o.x, o.y, t.kind === 'high' ? ELEV : 0);
    const map: Record<string, [string, string]> = { move: ['rgba(80,140,255,.38)', 'rgba(140,190,255,.9)'], atk: ['rgba(255,70,60,.42)', 'rgba(255,150,140,.95)'], ally: ['rgba(60,220,120,.38)', 'rgba(150,255,190,.95)'], aoe: ['rgba(255,150,40,.35)', 'rgba(255,200,120,.9)'], sel: ['rgba(255,215,90,.3)', 'rgba(255,230,130,1)'], path: ['rgba(255,255,255,.28)', 'rgba(255,255,255,.9)'], range: ['rgba(255,255,255,.07)', 'rgba(255,255,255,.18)'], mark: ['rgba(142,68,173,.35)', 'rgba(200,140,230,.9)'] };
    const [f, st] = map[o.kind]; this.diamond(p.x, p.y, s, f, st);
  }
  // ---------- sprites ----------
  drawUnit(u: Unit, v: Vis, s: number) {
    const c = this.ctx; const t = this.b!.grid.at(Math.round(v.x), Math.round(v.y)); const el = (t?.kind === 'high' ? ELEV : 0) + (u.fly && !u.dead ? 10 + Math.sin(this.time * 3) * 2 : 0);
    const bob = u.fly || u.sprite === 'djinn' ? Math.sin(this.time * 2 + v.wobble) * 2 : 0;
    const P = this.center(v.x, v.y, el); const sx = P.x + (v.shake ? (Math.random() - .5) * 6 * v.shake : 0), sy = P.y - bob * s;
    const k = s * US * (1 + (u.size - 1) * 0.55); c.globalAlpha = v.alpha * (this.b!.has(u, 'invisible') ? .4 : 1);
    // sombra y anillo de turno
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(P.x, P.y + 2 * s, 17 * k, 7 * k, 0, 0, 6.28); c.fill();
    if (u.uid === this.activeUid) { c.strokeStyle = `rgba(255,215,90,${.65 + .3 * Math.sin(this.time * 5)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(P.x, P.y + 2 * s, 21 * k, 9.5 * k, 0, 0, 6.28); c.stroke(); }
    if (u.uid === this.selUid) { c.strokeStyle = 'rgba(160,210,255,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(P.x, P.y + 2 * s, 24 * k, 11 * k, 0, 0, 6.28); c.stroke(); }
    if (u.side === 'pc') { c.strokeStyle = 'rgba(80,200,120,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(P.x, P.y + 2 * s, 18 * k, 7.5 * k, 0, 0, 6.28); c.stroke(); } else { c.strokeStyle = 'rgba(230,80,70,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(P.x, P.y + 2 * s, 18 * k, 7.5 * k, 0, 0, 6.28); c.stroke(); }
    const down = u.down; const deadK = v.dead > 0 ? 1 - v.dead * .5 : 1; const bounce = v.bounce * 10;
    c.save(); c.translate(sx, sy - bounce); c.scale(k * deadK, k * deadK);
    if (down) { c.rotate(-1.35); c.translate(-8, 4); }
    this.sprite(u); c.restore();
    if (v.flash > 0) { c.globalAlpha = v.flash * .5 * v.alpha; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(sx, sy - 22 * k, 11 * k, 20 * k, 0, 0, 6.28); c.fill(); c.globalAlpha = v.alpha; }
    // barra de PG y estados
    if (!u.dead) {
      const bw = 30 * k, bx = sx - bw / 2, by = sy - 50 * k;
      c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(bx - 1, by - 1, bw + 2, 7);
      const pct = Math.max(0, u.hp / u.maxHp); c.fillStyle = pct > .5 ? '#2ecc71' : pct > .25 ? '#f1c40f' : '#e74c3c'; c.fillRect(bx, by, bw * pct, 5);
      if (u.temp > 0) { c.fillStyle = '#5dade2'; c.fillRect(bx, by + 5, Math.min(bw, bw * u.temp / u.maxHp), 2); }
      if (u.down) { c.font = 'bold 11px Roboto Mono'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 3; const t2 = `☠ ${u.death.succ}✓ ${Math.min(3, u.death.fail)}✗`; c.strokeText(t2, sx, by - 6); c.fillText(t2, sx, by - 6); }
      const shown = u.statuses.filter(st => st.id !== 'surgeUsed' && st.id !== 'sneakUsed' && st.id !== 'ambusher').slice(0, 5);
      shown.forEach((st, i) => { const colr = ['bless', 'shieldFaith', 'aided', 'radiantSoul', 'rallied', 'dodging', 'invisible'].includes(st.id) ? '#5be37d' : ['hex', 'hunterMark', 'hexCurse', 'faerie', 'bane', 'vulnerable', 'guided'].includes(st.id) ? '#c58be6' : '#ff8a6b'; c.fillStyle = colr; c.fillRect(bx + i * 8, by + 8, 6, 4); });
    }
    c.globalAlpha = 1;
  }
  sprite(u: Unit) {
    const c = this.ctx; const col = u.color; const dark = shade(col, .55), light = shade(col, 1.3);
    const pcId = u.pcId; const skin = pcId === 'zyrthar' ? '#4d4a6a' : pcId === 'romain' ? '#b8453a' : pcId === 'pact' ? '#efe6c8' : '#d2a679';
    switch (u.sprite) {
      case 'humanoid': {
        c.fillStyle = dark; c.beginPath(); c.moveTo(-11, 0); c.lineTo(11, 0); c.lineTo(7, -22); c.lineTo(-7, -22); c.closePath(); c.fill();
        c.fillStyle = col; c.beginPath(); c.moveTo(-9, -4); c.lineTo(9, -4); c.lineTo(7, -24); c.lineTo(-7, -24); c.closePath(); c.fill();
        c.fillStyle = light; c.fillRect(-8, -14, 16, 3); // faja
        c.fillStyle = skin; c.beginPath(); c.arc(0, -30, 7, 0, 6.28); c.fill();
        c.fillStyle = dark; c.beginPath(); c.ellipse(0, -35, 8.5, 5, 0, Math.PI, 0); c.fill(); // turbante / capucha
        if (pcId === 'romain') { c.fillStyle = '#2a1a1a'; c.beginPath(); c.moveTo(-5, -36); c.lineTo(-8, -43); c.lineTo(-2, -37); c.moveTo(5, -36); c.lineTo(8, -43); c.lineTo(2, -37); c.fill(); }
        if (pcId === 'pact') { c.strokeStyle = 'rgba(255,240,180,.9)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-6, -22); c.quadraticCurveTo(-24, -30, -18, -46); c.moveTo(6, -22); c.quadraticCurveTo(24, -30, 18, -46); c.stroke(); }
        if (pcId === 'joren') { c.strokeStyle = '#6b4a2a'; c.lineWidth = 2; c.beginPath(); c.arc(13, -20, 13, -1.2, 1.2); c.stroke(); }
        if (pcId === 'rabb') { c.fillStyle = '#cfc4ff'; c.fillRect(11, -34, 3, 22); }
        if (pcId === 'panchi') { c.fillStyle = skin; c.beginPath(); c.arc(-11, -16, 4, 0, 6.28); c.arc(11, -16, 4, 0, 6.28); c.fill(); }
        if (u.id === 'linyera') { c.fillStyle = '#fff'; c.fillRect(-3, -28, 6, 2); }
        c.fillStyle = '#fff'; c.fillRect(-3, -31, 2, 2); c.fillRect(2, -31, 2, 2);
        break; }
      case 'construct': {
        c.fillStyle = dark; c.fillRect(-12, -26, 24, 26); c.fillStyle = col; c.fillRect(-10, -26, 20, 22); c.fillStyle = light; c.fillRect(-10, -26, 20, 4);
        c.fillStyle = col; c.fillRect(-7, -38, 14, 12); c.fillStyle = '#ffdd88'; c.fillRect(-4, -33, 3, 3); c.fillRect(2, -33, 3, 3);
        c.strokeStyle = dark; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -20); c.lineTo(-18, -8); c.moveTo(12, -20); c.lineTo(18, -8); c.stroke();
        if (u.id === 'qilaat') { c.fillStyle = '#b02a2a'; c.fillRect(-2, -20, 4, 8); }
        break; }
      case 'beast': {
        c.fillStyle = dark; c.beginPath(); c.ellipse(0, -8, 14, 8, 0, 0, 6.28); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(0, -10, 11, 6, 0, 0, 6.28); c.fill();
        c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(10, -12); c.quadraticCurveTo(24, -22, 14, -34); c.stroke(); c.fillStyle = '#ff5544'; c.beginPath(); c.arc(14, -34, 2.5, 0, 6.28); c.fill();
        c.strokeStyle = dark; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, -12); c.lineTo(-18, -18); c.moveTo(-6, -8); c.lineTo(-17, -6); c.stroke();
        c.fillStyle = '#ff8844'; c.fillRect(-6, -14, 2, 2); c.fillRect(-1, -15, 2, 2);
        break; }
      case 'undead': {
        c.fillStyle = dark; c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.lineTo(6, -20); c.lineTo(-8, -22); c.closePath(); c.fill();
        c.fillStyle = col; c.beginPath(); c.moveTo(-7, -2); c.lineTo(7, -2); c.lineTo(5, -20); c.lineTo(-6, -21); c.closePath(); c.fill();
        c.fillStyle = shade(col, 1.15); c.beginPath(); c.arc(1, -27, 7, 0, 6.28); c.fill();
        c.fillStyle = '#220'; c.fillRect(-3, -29, 3, 3); c.fillRect(3, -29, 3, 3); c.fillRect(-2, -23, 6, 2);
        c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-8, -18); c.lineTo(-17, -8); c.moveTo(8, -18); c.lineTo(17, -10); c.stroke();
        c.strokeStyle = '#e8e8c0'; c.lineWidth = 1.5; for (const sx of [-17, 17]) { c.beginPath(); c.moveTo(sx, sx < 0 ? -8 : -10); c.lineTo(sx + (sx < 0 ? -3 : 3), sx < 0 ? -3 : -5); c.stroke(); }
        break; }
      case 'djinn': case 'elemental': {
        const g = c.createLinearGradient(0, -40, 0, 0); g.addColorStop(0, light); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(-10, -28); c.quadraticCurveTo(-14, -10, -2, 0); c.quadraticCurveTo(12, -10, 10, -28); c.closePath(); c.fill();
        c.fillStyle = col; c.beginPath(); c.arc(0, -32, 8, 0, 6.28); c.fill(); c.fillStyle = '#fff'; c.fillRect(-4, -34, 2, 2); c.fillRect(2, -34, 2, 2);
        c.fillStyle = col; c.beginPath(); c.moveTo(-3, -38); c.quadraticCurveTo(0, -52 - Math.sin(this.time * 8) * 3, 3, -38); c.fill();
        c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(-9, -22); c.lineTo(-18, -14); c.moveTo(9, -22); c.lineTo(18, -14); c.stroke();
        break; }
      case 'mirror': {
        c.globalAlpha *= .85; const g = c.createLinearGradient(-10, -40, 10, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, col); g.addColorStop(1, dark);
        c.fillStyle = g; c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.lineTo(7, -24); c.lineTo(-7, -24); c.closePath(); c.fill();
        c.beginPath(); c.arc(0, -31, 7, 0, 6.28); c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-5, -34); c.lineTo(-1, -40); c.moveTo(-8, -10); c.lineTo(-4, -20); c.stroke();
        c.fillStyle = '#6a3a9a'; c.fillRect(-3, -32, 2, 2); c.fillRect(2, -32, 2, 2); break; }
      case 'colossus': {
        c.fillStyle = '#2a2418'; c.fillRect(-13, -4, 10, 8); c.fillRect(3, -4, 10, 8);
        c.fillStyle = dark; c.fillRect(-15, -36, 30, 34); c.fillStyle = col; c.fillRect(-13, -36, 26, 30);
        c.fillStyle = light; c.fillRect(-13, -36, 26, 5);
        for (const [gx, gy] of [[-8, -26], [8, -26], [0, -16]] as const) { c.fillStyle = '#b04ad8'; c.beginPath(); c.arc(gx, gy, 3.4, 0, 6.28); c.fill(); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(gx - 1, gy - 2, 1.5, 1.5); }
        c.fillStyle = dark; c.fillRect(-8, -46, 16, 12); c.fillStyle = '#111'; c.fillRect(-6, -43, 12, 4);
        c.strokeStyle = '#6b6b78'; c.lineWidth = 2.5; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 15, -30); c.lineTo(sx * 24, -18); c.stroke(); c.fillStyle = '#444'; c.beginPath(); c.arc(sx * 24, -16, 6, 0, 6.28); c.fill(); c.fillStyle = '#999'; for (let a = 0; a < 6.28; a += 1.05) { c.beginPath(); c.arc(sx * 24 + Math.cos(a) * 6, -16 + Math.sin(a) * 6, 1.6, 0, 6.28); c.fill(); } }
        break; }
      case 'pylon': {
        const g = c.createLinearGradient(0, -40, 0, 0); g.addColorStop(0, '#e6a8ff'); g.addColorStop(1, '#5a1f78');
        c.fillStyle = '#2b2236'; c.fillRect(-9, -4, 18, 5); c.fillStyle = g; c.beginPath(); c.moveTo(0, -42); c.lineTo(9, -22); c.lineTo(5, -4); c.lineTo(-5, -4); c.lineTo(-9, -22); c.closePath(); c.fill();
        c.strokeStyle = `rgba(230,170,255,${.5 + .3 * Math.sin(this.time * 4)})`; c.lineWidth = 2; c.stroke(); break; }
      case 'serpent': {
        c.fillStyle = dark; c.beginPath(); c.moveTo(-12, 0); c.lineTo(12, 0); c.lineTo(8, -24); c.lineTo(-8, -24); c.closePath(); c.fill();
        c.fillStyle = col; c.beginPath(); c.moveTo(-9, -3); c.lineTo(9, -3); c.lineTo(6, -24); c.lineTo(-6, -24); c.closePath(); c.fill();
        c.fillStyle = '#d9c9a0'; c.beginPath(); c.arc(0, -30, 7, 0, 6.28); c.fill(); c.fillStyle = '#111'; c.fillRect(-3, -31, 2, 2); c.fillRect(2, -31, 2, 2);
        c.strokeStyle = '#3d5a2a'; c.lineWidth = 3; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 7, -26); c.quadraticCurveTo(sx * 20, -34 + Math.sin(this.time * 3 + sx) * 3, sx * 13, -46); c.stroke(); c.fillStyle = '#3d5a2a'; c.beginPath(); c.arc(sx * 13, -46, 2.6, 0, 6.28); c.fill(); }
        break; }
      case 'wall': { c.fillStyle = 'rgba(160,220,255,.65)'; c.fillRect(-14, -30, 28, 30); c.strokeStyle = '#fff'; c.strokeRect(-14, -30, 28, 30); break; }
      default: { c.fillStyle = col; c.beginPath(); c.arc(0, -16, 12, 0, 6.28); c.fill(); }
    }
    c.fillStyle = 'rgba(255,255,255,.0)';
  }
}
export { TW, TH };
