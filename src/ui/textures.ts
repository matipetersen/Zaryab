// Texturas procedurales por tema (suelo, muros, cajas, plataformas) en la paleta del juego: piedra labrada, mampostería, madera con herrajes
// e incrustaciones de estrella de ocho puntas. Se generan una vez y se cachean. El arte externo (src/assets/tiles) las reemplaza.
export interface TexPal { f1: string; f2: string; wallT: string; wallL: string; cov: string; high: string; mark: string; diff: string }
const cache = new Map<string, HTMLCanvasElement>();
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (hex: string, f: number, a = 1) => { const [r, g, b] = rgb(hex); const k = (v: number) => Math.max(0, Math.min(255, v * f)) | 0; return `rgba(${k(r)},${k(g)},${k(b)},${a})`; };
const mk = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

interface Style { cobble?: boolean; star?: boolean; moss?: string; speck: number; cracks: number; grout: number }
const STYLE: Record<string, Style> = {
  alley: { cobble: true, speck: 90, cracks: 2, grout: .55 }, aqueduct: { moss: '#4f7a52', speck: 110, cracks: 3, grout: .6 }, mirror: { star: true, speck: 40, cracks: 0, grout: .8 },
  plaza: { star: true, speck: 70, cracks: 2, grout: .6 }, garden: { moss: '#3f7a3a', cobble: true, speck: 120, cracks: 1, grout: .7 }, crater: { speck: 140, cracks: 4, grout: .5 },
  market: { star: true, speck: 80, cracks: 1, grout: .6 }, ruins: { moss: '#58704a', speck: 130, cracks: 5, grout: .5 }, sanctum: { star: true, speck: 50, cracks: 1, grout: .7 }, mine: { speck: 150, cracks: 4, grout: .5 }, tavern: { speck: 80, cracks: 1, grout: .5 },
};

function star8(c: CanvasRenderingContext2D, cx: number, cy: number, R: number, col: string, lw = 1.6) {
  c.strokeStyle = col; c.lineWidth = lw; for (let k = 0; k < 2; k++) { c.beginPath(); for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2 + k * Math.PI / 4; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; const a2 = a + Math.PI / 2, x2 = cx + Math.cos(a2) * R, y2 = cy + Math.sin(a2) * R; i ? c.lineTo(x, y) : c.moveTo(x, y); c.lineTo(x2, y2); } c.closePath(); c.stroke(); }
  c.beginPath(); c.arc(cx, cy, R * .36, 0, 6.28); c.stroke();
}
/** Cuadrado 128×128 con el patrón; luego se proyecta al rombo isométrico 128×64. */
function floorSquare(pal: TexPal, theme: string, parity: number, variant: number): HTMLCanvasElement {
  const st = STYLE[theme] ?? STYLE.alley, base = parity ? pal.f1 : pal.f2, r = rng(hashStr(theme) + parity * 977 + variant * 131);
  const q = mk(128, 128), c = q.getContext('2d')!; c.fillStyle = mix(base, 1); c.fillRect(0, 0, 128, 128);
  if (st.cobble) { // adoquines redondeados
    for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) { const cx = col * 32 + 16 + (row % 2 ? 12 : -4) + (r() - .5) * 4, cy = row * 32 + 16 + (r() - .5) * 4; const g = c.createRadialGradient(cx - 4, cy - 5, 2, cx, cy, 19); g.addColorStop(0, mix(base, 1.18)); g.addColorStop(1, mix(base, .86)); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, 14 + r() * 3, 13 + r() * 3, r() * 3, 0, 6.28); c.fill(); c.strokeStyle = mix(base, .5, .7); c.lineWidth = 1.4; c.stroke(); }
  } else { // losas irregulares
    const cuts = [0, 36 + r() * 18, 128]; const cuts2 = [0, 52 + r() * 24, 128]; c.strokeStyle = mix(base, .45, st.grout); c.lineWidth = 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const x0 = cuts[i], x1 = cuts[i + 1], y0 = (i ? cuts2 : [0, 40 + r() * 30, 128])[j], y1 = (i ? cuts2 : [0, 0, 128])[j + 1] || 128; const w = x1 - x0, h = (j ? 128 : (i ? cuts2[1] : 60)) - (j ? (i ? cuts2[1] : 60) : 0); void h; void y1; const yy0 = j ? (i ? cuts2[1] : 60) : 0, yy1 = j ? 128 : (i ? cuts2[1] : 60); const f = .92 + r() * .16; c.fillStyle = mix(base, f); c.fillRect(x0 + 1.5, yy0 + 1.5, w - 3, yy1 - yy0 - 3); c.strokeRect(x0 + 1.5, yy0 + 1.5, w - 3, yy1 - yy0 - 3); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x0 + 2, yy0 + 2, w - 4, 3); }
  }
  for (let i = 0; i < st.speck; i++) { const x = r() * 128, y = r() * 128; c.fillStyle = r() < .5 ? 'rgba(255,240,210,.10)' : 'rgba(10,4,20,.16)'; c.fillRect(x, y, 1 + r() * 2.5, 1 + r() * 2); }
  for (let i = 0; i < st.cracks; i++) { c.strokeStyle = 'rgba(10,4,20,.38)'; c.lineWidth = 1; c.beginPath(); let x = r() * 128, y = r() * 128; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .4) * 22; y += (r() - .4) * 22; c.lineTo(x, y); } c.stroke(); }
  if (st.moss && r() < .6) for (let i = 0; i < 12; i++) { c.fillStyle = st.moss.length === 7 ? st.moss + '55' : st.moss; c.beginPath(); c.ellipse(r() * 128, r() * 128, 4 + r() * 8, 3 + r() * 5, r() * 3, 0, 6.28); c.fill(); }
  if (st.star && variant === 0 && parity === 1) { star8(c, 64, 64, 34, mix(pal.mark, 1, .55), 2.2); star8(c, 64, 64, 18, mix(pal.mark, 1, .35), 1.4); }
  else if (st.star && variant === 1) { c.strokeStyle = mix(pal.mark, 1, .35); c.lineWidth = 1.4; c.strokeRect(14, 14, 100, 100); for (const [x, y] of [[14, 14], [114, 14], [14, 114], [114, 114]]) star8(c, x, y, 9, mix(pal.mark, 1, .5), 1.1); }
  return q;
}
export function floorTex(pal: TexPal, theme: string, x: number, y: number): HTMLCanvasElement {
  const parity = (x + y) % 2, variant = (x * 7 + y * 13) % 3, key = `f:${theme}:${parity}:${variant}`; let t = cache.get(key); if (t) return t;
  const sq = floorSquare(pal, theme, parity, variant); t = mk(128, 64); const c = t.getContext('2d')!; c.setTransform(.5, .25, -.5, .25, 64, 0); c.drawImage(sq, 0, 0); cache.set(key, t); return t;
}
/** Muros, cajas y plataformas: textura cuadrada 128×128 (opaca) que se aplica a las caras del bloque. */
export function blockTex(pal: TexPal, theme: string, kind: 'wall' | 'cover' | 'high' | 'door', ch = ''): HTMLCanvasElement {
  const key = `b:${theme}:${kind}:${ch}`; let t = cache.get(key); if (t) return t; t = mk(128, 128); const c = t.getContext('2d')!; const r = rng(hashStr(key));
  if (kind === 'door') { // portón de madera oscura con herrajes y estrella de ocho puntas
    c.fillStyle = '#3a2216'; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 6; i++) { const x = i * 21.3; c.fillStyle = `rgba(${70 + r() * 25 | 0},${40 + r() * 14 | 0},${22 + r() * 10 | 0},1)`; c.fillRect(x + 1, 0, 19.3, 128); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x, 0, 1.6, 128); for (let k = 0; k < 5; k++) { c.strokeStyle = 'rgba(20,8,2,.35)'; c.lineWidth = 1; c.beginPath(); const xx = x + 4 + r() * 12; c.moveTo(xx, r() * 128); c.lineTo(xx + (r() - .5) * 3, r() * 128); c.stroke(); } }
    c.fillStyle = '#26202c'; for (const y of [18, 54, 98]) { c.fillRect(0, y, 128, 10); c.fillStyle = '#c9a458'; for (let x = 8; x < 128; x += 20) { c.beginPath(); c.arc(x, y + 5, 2.4, 0, 6.28); c.fill(); } c.fillStyle = '#26202c'; }
    star8(c, 64, 64, 22, '#e8c872', 2.4); c.fillStyle = '#e8c872'; c.beginPath(); c.arc(64, 64, 5, 0, 6.28); c.fill(); c.strokeStyle = '#c9a458'; c.lineWidth = 3; c.beginPath(); c.arc(64, 92, 7, 0, 6.28); c.stroke();
    cache.set(key, t); return t;
  }
  if (kind === 'cover' && (ch === 'c' || ch === 'o')) { // madera: tablones con herrajes
    c.fillStyle = mix(pal.cov, 1.15); c.fillRect(0, 0, 128, 128); for (let i = 0; i < 5; i++) { const y = i * 25.6; c.fillStyle = mix(pal.cov, .9 + r() * .3); c.fillRect(0, y + 1, 128, 23.6); c.strokeStyle = 'rgba(30,12,4,.5)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); const yy = y + 4 + r() * 16; c.moveTo(r() * 40, yy); c.lineTo(60 + r() * 68, yy + (r() - .5) * 3); c.stroke(); } c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, y, 128, 1.6); }
    c.fillStyle = '#2a2230'; c.fillRect(0, 18, 128, 10); c.fillRect(0, 100, 128, 10); c.fillStyle = '#c9a458'; for (const x of [10, 118]) for (const y of [23, 105]) { c.beginPath(); c.arc(x, y, 3, 0, 6.28); c.fill(); }
    if (ch === 'o') { c.fillStyle = 'rgba(200,60,40,.7)'; c.fillRect(0, 56, 128, 16); }
  } else { // mampostería: hiladas de sillares con mortero
    const base = kind === 'cover' ? '#d7dbe6' : kind === 'high' ? pal.high : pal.wallT; c.fillStyle = mix(base, .96); c.fillRect(0, 0, 128, 128); const rows = kind === 'wall' ? 5 : 4, bh = 128 / rows;
    for (let row = 0; row < rows; row++) { const off = row % 2 ? 24 : 0; for (let x = -off; x < 128; x += 48) { const f = .88 + r() * .24; c.fillStyle = mix(base, f); c.fillRect(x + 1.5, row * bh + 1.5, 45, bh - 3); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x + 2, row * bh + 2, 44, 3); c.fillStyle = 'rgba(0,0,0,.10)'; c.fillRect(x + 2, row * bh + bh - 5, 44, 3); } }
    c.strokeStyle = mix(base, .42, .8); c.lineWidth = 2; for (let row = 0; row <= rows; row++) { c.beginPath(); c.moveTo(0, row * bh); c.lineTo(128, row * bh); c.stroke(); }
    for (let i = 0; i < 70; i++) { c.fillStyle = r() < .5 ? 'rgba(255,240,210,.08)' : 'rgba(10,4,20,.14)'; c.fillRect(r() * 128, r() * 128, 1 + r() * 3, 1 + r() * 2); }
    if (kind === 'wall' && (STYLE[theme]?.star || theme === 'market' || theme === 'sanctum')) { c.fillStyle = mix(pal.mark, 1, .22); c.fillRect(0, 50, 128, 12); star8(c, 64, 56, 6, mix(pal.mark, 1, .6), 1.2); for (const x of [16, 40, 88, 112]) star8(c, x, 56, 4, mix(pal.mark, 1, .45), 1); }
    if (STYLE[theme]?.moss && kind === 'wall') for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(70,110,60,.30)'; c.beginPath(); c.ellipse(r() * 128, 110 + r() * 18, 8 + r() * 10, 3 + r() * 4, 0, 0, 6.28); c.fill(); }
  }
  cache.set(key, t); return t;
}
