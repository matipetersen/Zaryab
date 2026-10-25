import { h } from './dom';
import { dioramaPref, pixelWidth, quantize } from './diorama';

/** Escena inicial: noche en el desierto, un meteorito cae detrás de los médanos y deja un resplandor violeta, blanco y rosa. */
export function playIntro(root: HTMLElement, onDone: () => void): void {
  const cv = h('canvas', { style: { position: 'absolute', inset: '0', width: '100%', height: '100%' } }) as HTMLCanvasElement;
  const cap = h('div', { class: 'intro-cap' }); const skip = h('button', { class: 'intro-skip' }, 'Saltar ›');
  const el = h('div', { class: 'intro' }, cv, cap, skip); root.append(el);
  const c = cv.getContext('2d')!; let W = 0, H = 0, dpr = 1;
  const pix = dioramaPref();
  const fit = () => { const r = el.getBoundingClientRect(); dpr = pix && r.width > 4 ? pixelWidth(r.width) / r.width : Math.min(1.25, devicePixelRatio || 1); cv.style.imageRendering = pix ? 'pixelated' : ''; W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; };
  fit(); window.addEventListener('resize', fit);
  const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * .62, s: Math.random() * 1.6 + .3, p: Math.random() * 6 }));
  const sand: { x: number; y: number; vx: number; vy: number; l: number }[] = [];
  const IMPACT = 6.2, END = 12.5; const impact = () => ({ x: W * .62, y: H * .79 });
  const lines: [number, string][] = [[.6, 'El desierto de Zaryab. Sin viento. Sin un alma.'], [3.4, 'Y de golpe, el cielo se parte.'], [7.4, 'Lo que cayó no es una piedra.'], [10, 'Es una puerta.']];
  let t = 0, last = performance.now(), done = false, raf = 0;
  const finish = () => { if (done) return; done = true; cancelAnimationFrame(raf); window.removeEventListener('resize', fit); window.removeEventListener('keydown', key); el.classList.add('out'); setTimeout(() => { el.remove(); onDone(); }, 600); };
  const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); finish(); } };
  window.addEventListener('keydown', key); skip.addEventListener('click', e => { e.stopPropagation(); finish(); }); el.addEventListener('click', () => { if (t > 1.5) finish(); });
  if ((window as any).__fast) { setTimeout(finish, 30); return; }

  const dune = (base: number, amp: number, ph: number, col: string, par: number) => {
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) c.lineTo(x, H * base + Math.sin(x / W * 5 + ph) * amp * H + Math.sin(x / W * 11 + ph * 2) * amp * H * .35 + par);
    c.lineTo(W, H); c.closePath(); c.fill();
  };
  const frame = (now: number) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const post = Math.max(0, t - IMPACT), glow = Math.min(1, post / 1.2), pulse = .75 + .25 * Math.sin(t * 2.4);
    const sh = post > 0 && post < 1.2 ? (1.2 - post) * 7 : 0; if (sh) c.translate((Math.random() - .5) * sh, (Math.random() - .5) * sh);
    // cielo
    const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#05030f'); sky.addColorStop(.5, '#150a2e'); sky.addColorStop(1, '#3a1a4a'); c.fillStyle = sky; c.fillRect(-20, -20, W + 40, H + 40);
    // resplandor tras la duna (violeta, blanco, rosa)
    const ip = impact();
    if (glow > 0) {
      for (const [col, r, a] of [['rgba(150,80,255,A)', .75, .55], ['rgba(255,110,190,A)', .5, .55], ['rgba(255,255,255,A)', .22, .85]] as const) {
        const g = c.createRadialGradient(ip.x, ip.y, 0, ip.x, ip.y, Math.max(W, H) * r * (.8 + .2 * pulse)); g.addColorStop(0, col.replace('A', String(a * glow * pulse))); g.addColorStop(1, col.replace('A', '0')); c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
      // columnas de luz
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) { const x = ip.x + (i - 2) * W * .035, hgt = H * (.55 + .12 * Math.sin(t * 1.7 + i)), col = ['255,120,200', '190,140,255', '255,255,255', '255,120,200', '170,120,255'][i]; const g = c.createLinearGradient(0, ip.y - hgt, 0, ip.y); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(.85, `rgba(${col},${.35 * glow * pulse})`); g.addColorStop(1, `rgba(${col},${.5 * glow * pulse})`); c.fillStyle = g; c.fillRect(x - W * .008, ip.y - hgt, W * .016, hgt); }
      // aurora
      for (let k = 0; k < 3; k++) { c.strokeStyle = ['rgba(180,120,255,.18)', 'rgba(255,130,200,.16)', 'rgba(255,255,255,.12)'][k]; c.lineWidth = H * .05; c.beginPath(); for (let x = 0; x <= W; x += 14) { const y = H * (.2 + k * .07) + Math.sin(x / W * 4 + t * .6 + k) * H * .04; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.globalAlpha = glow; c.stroke(); c.globalAlpha = 1; }
      c.restore();
    }
    // estrellas
    for (const s of stars) { c.globalAlpha = (.45 + .45 * Math.sin(t * 1.5 + s.p)) * (1 - glow * .5); c.fillStyle = '#fff'; c.fillRect(s.x * W, s.y * H, s.s, s.s); } c.globalAlpha = 1;
    // luna lejana
    c.fillStyle = 'rgba(230,225,255,.8)'; c.beginPath(); c.arc(W * .16, H * .16, Math.min(W, H) * .035, 0, 6.28); c.fill();
    // meteorito
    if (t > 3.6 && t < IMPACT) {
      const k = (t - 3.6) / (IMPACT - 3.6), e = k * k * (3 - 2 * k) * .35 + k * .65; const sx = W * 1.05, sy = -H * .08, x = sx + (ip.x - sx) * e, y = sy + (ip.y - sy) * e;
      const ang = Math.atan2(ip.y - sy, ip.x - sx); c.save(); c.globalCompositeOperation = 'lighter';
      for (const [col, w, len] of [['rgba(255,110,190,.35)', 22, .42], ['rgba(170,120,255,.45)', 12, .36], ['rgba(255,255,255,.9)', 4, .3]] as const) { const g = c.createLinearGradient(x, y, x - Math.cos(ang) * W * len, y - Math.sin(ang) * W * len); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); c.strokeStyle = g; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(ang) * W * len, y - Math.sin(ang) * W * len); c.stroke(); }
      const hg = c.createRadialGradient(x, y, 0, x, y, 46); hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(.35, 'rgba(255,160,220,.7)'); hg.addColorStop(1, 'rgba(160,100,255,0)'); c.fillStyle = hg; c.beginPath(); c.arc(x, y, 46, 0, 6.28); c.fill(); c.restore();
    }
    // destello e onda de choque
    if (post > 0 && post < 1.6) { c.fillStyle = `rgba(255,255,255,${Math.max(0, .95 - post * 1.3)})`; c.fillRect(-20, -20, W + 40, H + 40); c.strokeStyle = `rgba(255,200,240,${1 - post / 1.6})`; c.lineWidth = 4; c.beginPath(); c.ellipse(ip.x, ip.y, post * W * .55, post * H * .12, 0, 0, 6.28); c.stroke();
      if (post < .1) for (let i = 0; i < 90; i++) { const a = Math.random() * 6.28, v = 60 + Math.random() * 260; sand.push({ x: ip.x, y: ip.y, vx: Math.cos(a) * v, vy: -Math.abs(Math.sin(a)) * v * 1.2, l: 1 + Math.random() }); } }
    // médanos (capas con paralaje) — tapan el punto de impacto
    dune(.7, .035, 0, '#3b1d52', 0); dune(.77, .04, 1.7, '#2a1440', 0); dune(.86, .045, 3.1, '#150b22', 0);
    if (glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const rim = c.createRadialGradient(ip.x, H * .8, 0, ip.x, H * .8, W * .6); rim.addColorStop(0, `rgba(255,170,225,${.5 * glow * pulse})`); rim.addColorStop(1, 'rgba(255,140,210,0)'); c.fillStyle = rim; c.fillRect(0, 0, W, H); c.restore(); }
    // arena en el aire
    for (const p of sand) { p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; c.fillStyle = `rgba(255,210,240,${Math.max(0, p.l / 2)})`; c.fillRect(p.x, p.y, 2, 2); } while (sand.length && sand[0].l <= 0) sand.shift();
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // viñeta
    const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    // subtítulos
    const ln = [...lines].reverse().find(l => t >= l[0]); if (ln) { const a = Math.min(1, (t - ln[0]) / .8); cap.textContent = ln[1]; cap.style.opacity = String(a * (t > END - 1 ? Math.max(0, END - t) : 1)); }
    if (pix) quantize(c, cv.width, cv.height, 'crater');
    if (t >= END) { finish(); return; }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}
