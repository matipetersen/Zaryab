/** Fondo animado de la pantalla principal: noche en el desierto, arena que fluye con el viento y una fogata que ilumina y proyecta sombras. */
export class MenuFx {
  cv = document.createElement('canvas'); c: CanvasRenderingContext2D; W = 0; H = 0; dpr = 1; t = 0; last = 0; raf = 0; alive = true;
  sand = Array.from({ length: 260 }, () => ({ x: Math.random(), y: .3 + Math.random() * .7, z: Math.random(), p: Math.random() * 6 }));
  embers: { x: number; y: number; vx: number; vy: number; l: number; m: number }[] = [];
  flames: { x: number; y: number; vx: number; vy: number; l: number; m: number; s: number }[] = [];
  stars = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random() * .5, s: Math.random() * 1.5 + .3, p: Math.random() * 6 }));
  // sombras: figuras encapuchadas sentadas alrededor del fuego y rocas
  props = [{ dx: -.2, dy: .0, w: 26, h: 44, kind: 'fig' }, { dx: -.12, dy: .035, w: 24, h: 40, kind: 'fig' }, { dx: .13, dy: .03, w: 25, h: 42, kind: 'fig' }, { dx: .21, dy: -.005, w: 27, h: 46, kind: 'fig' }, { dx: -.31, dy: -.02, w: 60, h: 30, kind: 'rock' }, { dx: .33, dy: -.03, w: 70, h: 36, kind: 'rock' }, { dx: .02, dy: .075, w: 22, h: 38, kind: 'fig' }, { dx: -.05, dy: -.06, w: 24, h: 40, kind: 'fig' }];
  onResize = () => this.fit();
  constructor(public host: HTMLElement) {
    this.cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none'; host.prepend(this.cv); this.c = this.cv.getContext('2d')!;
    this.fit(); window.addEventListener('resize', this.onResize); this.last = performance.now(); this.raf = requestAnimationFrame(n => this.frame(n));
  }
  fit() { const r = this.host.getBoundingClientRect(); this.dpr = Math.min(2, devicePixelRatio || 1); this.W = r.width; this.H = r.height; this.cv.width = this.W * this.dpr; this.cv.height = this.H * this.dpr; }
  destroy() { this.alive = false; cancelAnimationFrame(this.raf); window.removeEventListener('resize', this.onResize); this.cv.remove(); }
  dune(base: number, amp: number, ph: number, col: string, scroll = 0) {
    const c = this.c, W = this.W, H = this.H; c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 10) c.lineTo(x, H * base + Math.sin(x / W * 4.2 + ph + scroll) * amp * H + Math.sin(x / W * 9 + ph * 1.7) * amp * H * .3);
    c.lineTo(W, H); c.closePath(); c.fill();
  }
  frame(now: number) {
    if (!this.alive) return; const dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
    if (this.cv.offsetParent === null) { this.raf = requestAnimationFrame(n => this.frame(n)); return; }
    this.t += dt; const t = this.t, c = this.c, W = this.W, H = this.H; c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const flick = .82 + .12 * Math.sin(t * 13) + .08 * Math.sin(t * 31 + 1) + .05 * (Math.random() - .5);
    const fx = W * .5, fy = H * .9, R = Math.max(W, H) * .5 * flick;
    // cielo y estrellas
    const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#04020c'); sky.addColorStop(.45, '#140a2a'); sky.addColorStop(.75, '#2c1540'); sky.addColorStop(1, '#1a0d24'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
    for (const s of this.stars) { c.globalAlpha = .35 + .5 * Math.sin(t * 1.3 + s.p) ** 2; c.fillStyle = '#fff'; c.fillRect(s.x * W, s.y * H, s.s, s.s); } c.globalAlpha = 1;
    c.fillStyle = 'rgba(235,228,255,.85)'; c.beginPath(); c.arc(W * .82, H * .14, Math.min(W, H) * .04, 0, 6.28); c.fill();
    // dunas lejanas
    this.dune(.58, .03, 0, '#2b1640', t * .02); this.dune(.65, .035, 2, '#22112f', -t * .015); this.dune(.73, .04, 4, '#190d25', t * .01);
    // suelo
    const gr = c.createLinearGradient(0, H * .7, 0, H); gr.addColorStop(0, '#1d0f27'); gr.addColorStop(1, '#2a1830'); c.fillStyle = gr; c.fillRect(0, H * .74, W, H * .26);
    // viento: cintas de arena que corren por las dunas
    const gust = .6 + .4 * Math.sin(t * .35) + .25 * Math.sin(t * .9 + 2);
    c.save(); c.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const yb = H * (.6 + i * .024), sp = 40 + i * 9; c.strokeStyle = `rgba(214,170,150,${.05 + .015 * (i % 4)})`; c.lineWidth = 1 + (i % 3);
      c.beginPath(); const off = (t * sp * gust + i * 137) % (W * 1.4);
      for (let x = -40; x <= W + 40; x += 16) { const y = yb + Math.sin((x + off * .4) / 70 + i) * 3 + Math.sin((x - off) / 190 + i * 2) * 5; x < -30 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    }
    c.restore();
    // sombras proyectadas por la luz del fuego (se alargan y bailan con la llama)
    for (const p of this.props) {
      const bx = fx + p.dx * W, by = fy + p.dy * H, vx = bx - fx, vy = by - fy, d = Math.hypot(vx, vy) || 1, len = (p.h * 3.4 + 80) * (.9 + .25 * (flick - .8)) * (1.1 - Math.min(.5, d / R));
      const ex = bx + vx / d * len + Math.sin(t * 9 + p.dx * 20) * 2, ey = by + vy / d * len * .35;
      c.fillStyle = `rgba(2,1,6,${.8 * Math.max(.3, 1 - d / (R * 1.1))})`; c.beginPath(); c.moveTo(bx - p.w / 2, by); c.lineTo(bx + p.w / 2, by); c.lineTo(ex + p.w * .25, ey); c.lineTo(ex - p.w * .25, ey); c.closePath(); c.fill();
    }
    // figuras (siluetas con borde iluminado hacia el fuego)
    for (const p of this.props) {
      const bx = fx + p.dx * W, by = fy + p.dy * H, side = Math.sign(fx - bx) || 1; c.fillStyle = '#0a0612'; c.beginPath();
      if (p.kind === 'rock') { c.ellipse(bx, by, p.w, p.h * .8, 0, Math.PI, 0); c.fill(); } else { c.moveTo(bx - p.w / 2, by); c.quadraticCurveTo(bx - p.w * .4, by - p.h * .75, bx, by - p.h * .85); c.quadraticCurveTo(bx + p.w * .4, by - p.h * .75, bx + p.w / 2, by); c.closePath(); c.fill(); c.beginPath(); c.arc(bx, by - p.h * .92, p.w * .3, 0, 6.28); c.fill(); }
      c.strokeStyle = `rgba(255,150,70,${.35 * flick})`; c.lineWidth = 2; c.beginPath(); if (p.kind === 'rock') c.ellipse(bx, by, p.w, p.h * .8, 0, side > 0 ? -Math.PI * .5 : Math.PI, side > 0 ? 0 : Math.PI * 1.5 - Math.PI * 1.5 + Math.PI * 1.5); else { c.moveTo(bx + side * p.w * .42, by - p.h * .35); c.quadraticCurveTo(bx + side * p.w * .3, by - p.h * .8, bx + side * p.w * .05, by - p.h * 1.1); } c.stroke();
    }
    // fogata: leños y llamas
    c.fillStyle = '#2a1408'; c.save(); c.translate(fx, fy); for (const a of [-.5, .5]) { c.save(); c.rotate(a); c.fillRect(-26, -4, 52, 8); c.restore(); } c.restore();
    for (let i = 0; i < 3; i++) this.flames.push({ x: fx + (Math.random() - .5) * 22, y: fy - 4, vx: (Math.random() - .5) * 14 + Math.sin(t * 2) * 6, vy: -(60 + Math.random() * 60), l: 0, m: .5 + Math.random() * .5, s: 10 + Math.random() * 12 });
    if (Math.random() < .35) this.embers.push({ x: fx + (Math.random() - .5) * 20, y: fy - 10, vx: (Math.random() - .3) * 40 + gust * 20, vy: -(40 + Math.random() * 90), l: 0, m: 1.6 + Math.random() * 1.6 });
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const f of this.flames) { f.l += dt; f.x += f.vx * dt; f.y += f.vy * dt; const k = f.l / f.m; const g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.s * (1 - k * .6)); g.addColorStop(0, `rgba(255,${200 - k * 120 | 0},${90 - k * 80 | 0},${.55 * (1 - k)})`); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(f.x, f.y, f.s, 0, 6.28); c.fill(); }
    this.flames = this.flames.filter(f => f.l < f.m);
    for (const e of this.embers) { e.l += dt; e.x += e.vx * dt + Math.sin(t * 5 + e.m * 9) * .4; e.y += e.vy * dt; c.fillStyle = `rgba(255,${150 + Math.random() * 80 | 0},60,${Math.max(0, 1 - e.l / e.m)})`; c.fillRect(e.x, e.y, 2, 2); }
    this.embers = this.embers.filter(e => e.l < e.m);
    // luz cálida del fuego sobre todo el paisaje (parpadea)
    for (const [r, col, a] of [[1, 'rgba(255,120,40,A)', .3], [.5, 'rgba(255,160,70,A)', .3], [.12, 'rgba(255,225,160,A)', .6]] as const) { const g = c.createRadialGradient(fx, fy - 12, 0, fx, fy - 12, R * r); g.addColorStop(0, col.replace('A', String(a * flick))); g.addColorStop(1, col.replace('A', '0')); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    c.restore();
    // arena en el aire: corre con el viento y se tiñe de cálido cerca del fuego
    for (const s of this.sand) {
      const sp = (30 + s.z * 120) * gust; s.x += sp * dt / W; s.y += Math.sin(t * .8 + s.p) * .02 * dt - .003 * dt * s.z; if (s.x > 1.05) { s.x = -.05; s.y = .3 + Math.random() * .7; }
      const x = s.x * W, y = s.y * H, near = Math.max(0, 1 - Math.hypot(x - fx, y - fy) / R), len = 4 + s.z * 16 * gust;
      c.strokeStyle = `rgba(${200 + near * 55 | 0},${150 + near * 70 | 0},${150 - near * 40 | 0},${.18 + .3 * s.z * (.5 + near)})`; c.lineWidth = .8 + s.z * 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - len, y - len * .08); c.stroke();
    }
    // viñeta
    const v = c.createRadialGradient(W / 2, H * .6, Math.min(W, H) * .3, W / 2, H * .6, Math.max(W, H) * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    this.raf = requestAnimationFrame(n => this.frame(n));
  }
}
