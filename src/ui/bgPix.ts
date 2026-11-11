// Fondos pintados en pixel art para las escenas que no pasan en un mapa (el vacío de Zahir y cualquier fondo sin mapa).
// Se dibujan a baja resolución con tramado ordenado y se escalan sin suavizado, como el resto del diorama.
const W = 192, H = 108;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16);
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

interface Scene { sky: string[]; ground?: string[]; horizon: number; draw?: (px: (x: number, y: number, c: number[]) => void, t: number) => void; motes?: string }
const PAL = {
  ink: '#120d24', violet: '#3b3260', lilac: '#b9b2d6', pale: '#f2eee4', gold: '#e0b84a', ember: '#ff9a3d',
};
/** El vacío de Zahir: cielo de ceniza, un eclipse que late, un suelo de espirales que se pierde. */
const VACIO: Scene = {
  sky: [PAL.pale, PAL.lilac, '#8a80b4', '#5a4f88'], ground: ['#2a2348', '#4a4078', '#6f64a0', '#4a4078'], horizon: 58,
  motes: PAL.gold,
  draw(px, t) {
    // eclipse: disco oscuro con corona dorada que respira
    const cx = W / 2, cy = 26, r = 11, pulse = 1 + Math.sin(t * 1.3) * .08;
    for (let y = cy - 20; y <= cy + 20; y++) for (let x = cx - 20; x <= cx + 20; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d < r) px(x, y, hex('#1c1630'));
      else if (d < r + 2.2 * pulse) px(x, y, hex(PAL.gold));
      else if (d < r + 7 * pulse && (x + y + Math.floor(t * 4)) % 3 === 0) px(x, y, hex('#f6d98a'));
    }
    // espirales del suelo en perspectiva (las mismas del desierto)
    for (let k = 0; k < 3; k++) for (let a = 0; a < 26; a += .045) {
      const rr = 3 + a * 3.1, ang = a + k * 2.09 + t * .08;
      const x = Math.round(cx + Math.cos(ang) * rr * 1.9), y = Math.round(72 + Math.sin(ang) * rr * .38);
      if (y > 59 && y < H) px(x, y, hex(k === 0 ? '#f6d98a' : '#b9b2d6'));
    }
  },
};
/** Fondos genéricos por id (sin mapa): cielo, suelo y partículas del lugar. */
const GENERIC: Record<string, Scene> = {
  vacio: VACIO,
};
const SKY: Record<string, [string[], string]> = {
  prison: [['#3a2a1a', '#140e0a', '#060404'], '#d9a066'], coliseo: [['#8a4a7a', '#3a1a40', '#0d0716'], '#e0b84a'], medinat: [['#c98a4a', '#7a3f5a', '#1d0f2a'], '#ffcf7a'],
  dunas: [['#d9d6e6', '#8d87a8', '#3b3258'], '#e8e0c8'], tormenta: [['#b59d7b', '#8a7a66', '#5d4c3a'], '#e2c79a'], bajo: [['#5a3a5a', '#2a1a40', '#1a1020'], '#c9a6ff'],
  choza: [['#6a3a22', '#2a160e', '#0a0605'], '#ff9a3d'], zoco: [['#d4a574', '#7b3a7a', '#4a1f5e'], '#ffd23f'], hammam: [['#2f5a6a', '#162a36', '#050b10'], '#9ad8e8'],
  espejos: [['#5a5a9a', '#1c1c3c', '#07070f'], '#c9c9ff'], acueducto: [['#2f7f90', '#14363e', '#050f12'], '#9ad8e8'], plaza: [['#b0402a', '#5a1a1a', '#120505'], '#ffb070'],
  oraculo: [['#7a4fb0', '#2a1850', '#07040f'], '#c9a6ff'], limbo: [['#f2eee4', '#b9b2d6', '#3b3260'], '#e0b84a'], cubo: [['#e4e6f4', '#8e95bd', '#1c1a3a'], '#ffffff'], taller: [['#8b5a2a', '#3a2210', '#0e0804'], '#ff9a3d'],
};
const sceneFor = (id: string): Scene => GENERIC[id] ?? (() => { const [s, m] = SKY[id] ?? SKY.prison; return { sky: s, ground: [s[1], s[2], '#000000'], horizon: 70, motes: m }; })();

/** Lienzo animado con el fondo `id`. Devuelve una función para detenerlo. */
export function paintBg(host: HTMLElement, id: string): () => void {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'bgpix';
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;object-fit:cover;pointer-events:none';
  host.prepend(cv); const ctx = cv.getContext('2d')!; const img = ctx.createImageData(W, H); const sc = sceneFor(id);
  const sky = sc.sky.map(hex), gr = (sc.ground ?? sc.sky).map(hex);
  const ramp = (cs: number[][], t: number) => { const n = cs.length - 1, k = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(k); return { a: cs[i], b: cs[i + 1], f: k - i }; };
  const motes = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: .5 + Math.random(), p: Math.random() * 6 }));
  const mc = hex(sc.motes ?? '#ffffff');
  let raf = 0, alive = true; const t0 = performance.now();
  const frame = (now: number) => {
    if (!alive) return; const t = (now - t0) / 1000; const d = img.data;
    const px = (x: number, y: number, c: number[]) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; };
    for (let y = 0; y < H; y++) {
      const inSky = y < sc.horizon; const r = inSky ? ramp(sky, y / sc.horizon) : ramp(gr, (y - sc.horizon) / (H - sc.horizon));
      for (let x = 0; x < W; x++) px(x, y, r.f > BAYER[(y & 3) * 4 + (x & 3)] ? r.b : r.a);
    }
    sc.draw?.(px, t);
    for (const m of motes) { const x = (m.x + t * 6 * m.v) % W, y = (m.y + Math.sin(t * m.v + m.p) * 3 - t * 2 * m.v + H * 10) % H; if ((Math.sin(t * 2 + m.p) + 1) > .6) px(x, y, mix(mc, [255, 255, 255], .2)); }
    ctx.putImageData(img, 0, 0); raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); cv.remove(); };
}
