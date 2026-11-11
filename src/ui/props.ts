// Identidad de cada mapa: qué forma toman sus coberturas y muros (en vez de cubos iguales en todos lados)
// y qué se recorta en el fondo detrás de la isla. Todo se dibuja con la paleta de la zona y luego se cuantiza.
const TW = 64, TH = 32;
type Pix = Record<string, string>;
export type PropKind = 'rock' | 'spire' | 'tomb' | 'cross' | 'column' | 'gold_column' | 'bone_column' | 'crystal' | 'alabaster' | 'cypress' | 'rose' | 'shelf'
  | 'stall' | 'stall_red' | 'pew' | 'chair' | 'beam' | 'statue' | 'mirror' | 'obelisk' | 'brazier' | 'post' | 'table' | 'well' | 'tent';

/** Forma de cada carácter de mapa por mapa. Lo que no figura se dibuja como bloque. */
export const PROPS: Record<string, Partial<Record<string, PropKind>>> = {
  dunas: { C: 'rock' },
  nido: { C: 'spire' },
  cementerio: { C: 'tomb', c: 'cross' },
  cripta: { C: 'bone_column', c: 'chair', x: 'table' },
  iglesia: { C: 'column', c: 'pew' },
  ciudadela: { C: 'gold_column', c: 'brazier' },
  eclipse: { C: 'obelisk' },
  pozo: { c: 'crystal' },
  mina: { C: 'alabaster' },
  jardin: { '#': 'cypress', c: 'rose' },
  santuario: { '#': 'shelf' },
  zoco: { c: 'stall' },
  medinat: { c: 'stall_red', C: 'well' },
  templo: { c: 'beam' },
  plaza: { c: 'statue' },
  cubo: { c: 'mirror' },
  arena: { C: 'post' },
  callejon: { '#': 'tent' },
};

/** Caja isométrica de `fx`×`fy` casillas centrada en (cx, cy), de altura h (en unidades de mundo). */
function isoBox(c: CanvasRenderingContext2D, cx: number, cy: number, fx: number, fy: number, h: number, s: number, top: string, left: string, right: string) {
  const hx = TW / 2 * s, hy = TH / 2 * s, H = h * s;
  const P = (u: number, v: number, z = 0) => ({ x: cx + (u - v) * hx, y: cy + (u + v) * hy - z });
  const N = P(-fx / 2, -fy / 2), E = P(fx / 2, -fy / 2), S = P(fx / 2, fy / 2), W = P(-fx / 2, fy / 2);
  const poly = (pts: { x: number; y: number }[], col: string) => { c.fillStyle = col; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath(); c.fill(); };
  poly([W, S, { x: S.x, y: S.y - H }, { x: W.x, y: W.y - H }], left);
  poly([S, E, { x: E.x, y: E.y - H }, { x: S.x, y: S.y - H }], right);
  poly([N, E, S, W].map(p => ({ x: p.x, y: p.y - H })), top);
}
const blob = (c: CanvasRenderingContext2D, pts: number[][], col: string) => { c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); };
const hash = (x: number, y: number) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 1000 / 1000;

/** Dibuja la cobertura/muro `k` en la casilla cuyo vértice superior del rombo es (px, py). */
export function drawProp(c: CanvasRenderingContext2D, k: PropKind, px: number, py: number, s: number, P: Pix, t: number, tx: number, ty: number) {
  const cx = px, cy = py + TH / 2 * s, r = hash(tx, ty);
  // sombra de contacto
  c.fillStyle = 'rgba(6,2,14,.35)'; c.beginPath(); c.ellipse(cx, cy + 2 * s, 20 * s, 9 * s, 0, 0, 6.28); c.fill();
  switch (k) {
    case 'rock': { // roca blanca redondeada de las dunas
      const w = (22 + r * 6) * s, h = (26 + r * 10) * s;
      blob(c, [[cx - w - 2 * s, cy + 1 * s], [cx - w * .95, cy - h * .62], [cx - w * .4, cy - h - 2 * s], [cx + w * .32, cy - h * .97], [cx + w + 2 * s, cy - h * .45], [cx + w * .92, cy + 3 * s], [cx, cy + 8 * s]], P.s);
      blob(c, [[cx - w, cy], [cx - w * .9, cy - h * .6], [cx - w * .4, cy - h], [cx + w * .3, cy - h * .95], [cx + w, cy - h * .45], [cx + w * .9, cy + 2 * s], [cx, cy + 6 * s]], P.a);
      blob(c, [[cx - w * .85, cy - h * .55], [cx - w * .4, cy - h], [cx + w * .3, cy - h * .95], [cx + w * .1, cy - h * .5], [cx - w * .4, cy - h * .35]], P.A);
      blob(c, [[cx + w * .1, cy - h * .5], [cx + w, cy - h * .45], [cx + w * .9, cy + 2 * s], [cx, cy + 6 * s], [cx - w * .1, cy - h * .1]], P.S); c.fillStyle = P.w; c.fillRect(cx - w * .5, cy - h * .85, 3 * s, 2 * s);
      break;
    }
    case 'spire': { // aguja de roca del pico
      const h = (40 + r * 14) * s;
      blob(c, [[cx - 16 * s, cy + 2 * s], [cx - 6 * s, cy - h], [cx + 2 * s, cy - h * .8], [cx + 15 * s, cy], [cx, cy + 7 * s]], P.t);
      blob(c, [[cx - 6 * s, cy - h], [cx + 2 * s, cy - h * .8], [cx + 15 * s, cy], [cx + 2 * s, cy + 5 * s]], P.S);
      blob(c, [[cx - 6 * s, cy - h], [cx - 2 * s, cy - h * .82], [cx - 9 * s, cy - h * .4]], P.A);
      break;
    }
    case 'tomb': case 'cross': { // lápida con arco o cruz torcida
      if (k === 'cross') { const lean = (r - .5) * 6 * s; c.fillStyle = P.D; c.fillRect(cx - 3 * s + lean, cy - 30 * s, 6 * s, 32 * s); c.fillRect(cx - 11 * s + lean, cy - 22 * s, 22 * s, 5 * s); c.fillStyle = P.t; c.fillRect(cx - 3 * s + lean, cy - 30 * s, 2 * s, 32 * s); c.fillRect(cx - 11 * s + lean, cy - 22 * s, 22 * s, 2 * s); isoBox(c, cx, cy, .5, .5, 4, s, P.S, P.s, P.D); break; }
      isoBox(c, cx, cy, .9, .9, 4, s, P.S, P.s, P.D);
      const w = 12 * s, h = 34 * s; c.fillStyle = P.D; c.beginPath(); c.moveTo(cx - w - 2 * s, cy + 1 * s); c.lineTo(cx - w - 2 * s, cy - h + w); c.arc(cx, cy - h + w, w + 2 * s, Math.PI, 0); c.lineTo(cx + w + 2 * s, cy + 1 * s); c.closePath(); c.fill(); c.fillStyle = P.A; c.beginPath(); c.moveTo(cx - w, cy); c.lineTo(cx - w, cy - h + w); c.arc(cx, cy - h + w, w, Math.PI, 0); c.lineTo(cx + w, cy); c.closePath(); c.fill();
      c.fillStyle = P.t; c.fillRect(cx + w - 3 * s, cy - h + w, 3 * s, h - w); c.fillStyle = P.S; c.fillRect(cx - 1.5 * s, cy - h + 8 * s, 3 * s, 12 * s); c.fillRect(cx - 5 * s, cy - h + 12 * s, 10 * s, 3 * s);
      break;
    }
    case 'column': case 'gold_column': case 'bone_column': { // columna con capitel
      const gold = k === 'gold_column', bone = k === 'bone_column'; const h = 44 * s, R = 9 * s;
      isoBox(c, cx, cy, .8, .8, 6, s, P.a, P.S, P.t);
      const body = bone ? P.b : P.a, dark = bone ? P.A : P.t;
      c.fillStyle = body; c.fillRect(cx - R, cy - h, R * 2, h - 6 * s); c.fillStyle = dark; c.fillRect(cx + R * .2, cy - h, R * .8, h - 6 * s);
      if (bone) { c.fillStyle = P.t; for (let i = 1; i < 5; i++) c.fillRect(cx - R, cy - h + i * 8 * s, R * 2, 2 * s); }
      else { c.fillStyle = P.S; c.fillRect(cx - R * .5, cy - h, 2 * s, h - 6 * s); }
      isoBox(c, cx, cy - h + 2 * s, .75, .75, 6, s, gold ? P.f : bone ? P.b : P.A, gold ? '#8a5a20' : P.t, gold ? '#b07a30' : P.a);
      if (bone) { c.fillStyle = P.k; c.fillRect(cx - 5 * s, cy - h - 10 * s, 3 * s, 3 * s); c.fillRect(cx + 2 * s, cy - h - 10 * s, 3 * s, 3 * s); }
      break;
    }
    case 'crystal': case 'alabaster': { // racimo de cristal negro (pozo) o alabastro (mina)
      const al = k === 'alabaster'; const A = al ? P.w : P.W, B = al ? P.A : P.V, C2 = al ? P.a : P.k;
      for (const [dx, h, w] of [[-9, 26, 6], [6, 34, 7], [-1, 44, 8], [12, 18, 5]] as const) {
        const x0 = cx + dx * s, H = (h + r * 8) * s, W = w * s;
        blob(c, [[x0 - W, cy], [x0 - W * .7, cy - H * .7], [x0, cy - H], [x0 + W * .7, cy - H * .7], [x0 + W, cy]], B);
        blob(c, [[x0, cy - H], [x0 + W * .7, cy - H * .7], [x0 + W, cy], [x0, cy]], C2);
        c.fillStyle = A; c.fillRect(x0 - W * .4, cy - H * .75, 2 * s, H * .5);
      }
      break;
    }
    case 'cypress': { // ciprés podado del jardín
      const h = (52 + r * 10) * s; c.fillStyle = P.D; c.fillRect(cx - 2 * s, cy - 8 * s, 4 * s, 10 * s);
      blob(c, [[cx - 13 * s, cy - 6 * s], [cx - 15 * s, cy - h * .4], [cx - 8 * s, cy - h * .85], [cx, cy - h], [cx + 8 * s, cy - h * .85], [cx + 15 * s, cy - h * .4], [cx + 13 * s, cy - 6 * s]], P.S);
      blob(c, [[cx, cy - h], [cx + 8 * s, cy - h * .85], [cx + 15 * s, cy - h * .4], [cx + 13 * s, cy - 6 * s], [cx + 2 * s, cy - 6 * s]], P.s);
      c.fillStyle = P.t; for (let i = 0; i < 5; i++) c.fillRect(cx - 8 * s + (i % 2) * 5 * s, cy - h * (.25 + i * .13), 3 * s, 2 * s);
      break;
    }
    case 'rose': { // rosal de rosas translúcidas
      blob(c, [[cx - 15 * s, cy], [cx - 13 * s, cy - 14 * s], [cx - 2 * s, cy - 20 * s], [cx + 12 * s, cy - 15 * s], [cx + 15 * s, cy], [cx, cy + 5 * s]], P.S);
      c.fillStyle = P.p; for (const [dx, dy] of [[-8, -12], [2, -16], [9, -9], [-2, -6], [-12, -4]]) c.fillRect(cx + dx * s, cy + dy * s, 4 * s, 4 * s);
      c.fillStyle = P.w; c.fillRect(cx + 2 * s, cy - 16 * s, 1.5 * s, 1.5 * s);
      break;
    }
    case 'shelf': { // estantería de la Biblioteca
      isoBox(c, cx, cy, 1, .7, 44, s, P.D, P.e, P.D);
      const cols = [P.r, P.f, P.W, P.g, P.b, P.v];
      for (let row = 0; row < 4; row++) for (let i = 0; i < 6; i++) { const u = -.5 + (i + .5) / 6; const bx = cx + (u - .35) * TW / 2 * s, by = cy + (u + .35) * TH / 2 * s - (8 + row * 10) * s; c.fillStyle = cols[(i + row * 2 + Math.floor(r * 5)) % cols.length]; c.fillRect(bx - 2 * s, by - 7 * s, 3.5 * s, 7 * s); }
      break;
    }
    case 'stall': case 'stall_red': { // puesto con toldo a rayas
      const a = k === 'stall' ? P.v : P.r, b2 = P.b;
      isoBox(c, cx, cy, .85, .85, 14, s, P.a, P.S, P.t);
      c.fillStyle = P.D; c.fillRect(cx - 22 * s, cy - 34 * s, 2 * s, 30 * s); c.fillRect(cx + 20 * s, cy - 34 * s, 2 * s, 30 * s);
      for (let i = 0; i < 5; i++) { const x0 = cx - 24 * s + i * 9.6 * s; blob(c, [[x0, cy - 38 * s + i * 1 * s], [x0 + 9.6 * s, cy - 38 * s + (i + 1) * 1 * s], [x0 + 9.6 * s, cy - 28 * s + (i + 1) * 2 * s], [x0, cy - 28 * s + i * 2 * s]], i % 2 ? b2 : a); }
      c.fillStyle = P.f; c.fillRect(cx - 6 * s, cy - 18 * s, 4 * s, 4 * s); c.fillStyle = P.g; c.fillRect(cx + 3 * s, cy - 17 * s, 4 * s, 3 * s);
      break;
    }
    case 'pew': { // banco de iglesia
      isoBox(c, cx, cy, .95, .45, 10, s, P.t, P.s, P.S);
      isoBox(c, cx, cy - 2 * s - 4 * s, .95, .12, 22, s, P.a, P.S, P.t);
      break;
    }
    case 'chair': { // sillita de niño en la mesa de Al-Mazhar
      isoBox(c, cx, cy, .45, .45, 10, s, P.a, P.S, P.t); isoBox(c, cx - 5 * s, cy - 4 * s, .45, .08, 24, s, P.A, P.t, P.a);
      c.fillStyle = P.b; c.beginPath(); c.ellipse(cx + 2 * s, cy - 12 * s, 5 * s, 2.5 * s, 0, 0, 6.28); c.fill();
      break;
    }
    case 'table': { // la mesa larga de la cripta
      isoBox(c, cx, cy, 1, .8, 18, s, P.t, P.s, P.S);
      c.fillStyle = P.b; c.beginPath(); c.ellipse(cx, cy - 18 * s, 6 * s, 3 * s, 0, 0, 6.28); c.fill(); c.fillStyle = P.W; c.fillRect(cx - 2 * s, cy - 26 * s, 4 * s, 7 * s);
      break;
    }
    case 'beam': { // vigas quemadas del templo
      isoBox(c, cx, cy, 1, .25, 8, s, P.D, P.k, P.d); isoBox(c, cx + 4 * s, cy - 6 * s, .25, 1, 8, s, P.e, P.k, P.D);
      c.fillStyle = (Math.sin(t * 4 + r * 9) > 0) ? P.f : '#ff7a2a'; c.fillRect(cx - 6 * s, cy - 12 * s, 2 * s, 2 * s); c.fillRect(cx + 8 * s, cy - 16 * s, 2 * s, 2 * s);
      break;
    }
    case 'statue': { // pedazos de estatua del Capitolio
      isoBox(c, cx, cy, .8, .8, 10, s, P.A, P.t, P.a);
      c.fillStyle = P.a; c.fillRect(cx - 7 * s, cy - 30 * s, 14 * s, 20 * s); c.fillStyle = P.t; c.fillRect(cx + 2 * s, cy - 30 * s, 5 * s, 20 * s);
      if (r > .5) { c.fillStyle = P.A; c.beginPath(); c.arc(cx - 1 * s, cy - 35 * s, 6 * s, 0, 6.28); c.fill(); } else { c.fillStyle = P.A; c.fillRect(cx - 14 * s, cy - 6 * s, 9 * s, 6 * s); }
      break;
    }
    case 'mirror': { // espejo del Cubo
      isoBox(c, cx, cy, .2, .9, 44, s, P.A, P.S, P.a);
      c.strokeStyle = P.w; c.lineWidth = 2 * s; c.beginPath(); const o = ((t * 20 + r * 40) % 40) * s; c.moveTo(cx - 4 * s, cy - 6 * s - o); c.lineTo(cx + 6 * s, cy - 14 * s - o); c.stroke();
      break;
    }
    case 'obelisk': { // pilar de huesos del Eclipse
      isoBox(c, cx, cy, .6, .6, 50, s, P.b, P.A, P.a);
      c.fillStyle = P.k; for (let i = 0; i < 4; i++) { c.fillRect(cx - 6 * s, cy - (12 + i * 10) * s, 3 * s, 3 * s); c.fillRect(cx + 4 * s, cy - (14 + i * 10) * s, 3 * s, 3 * s); }
      c.fillStyle = Math.sin(t * 3 + r * 6) > 0 ? P.r : P.R; c.beginPath(); c.arc(cx, cy - 58 * s, 5 * s, 0, 6.28); c.fill();
      break;
    }
    case 'brazier': { // brasero de la Ciudadela
      isoBox(c, cx, cy, .5, .5, 18, s, P.f, '#8a5a20', '#b07a30');
      for (let i = 0; i < 3; i++) { const fx = cx + (i - 1) * 5 * s, h = (10 + Math.sin(t * 7 + i * 2 + r * 6) * 4) * s; c.fillStyle = i === 1 ? P.f : '#ff7a2a'; blob(c, [[fx - 4 * s, cy - 22 * s], [fx, cy - 22 * s - h], [fx + 4 * s, cy - 22 * s]], c.fillStyle as string); }
      break;
    }
    case 'post': { // poste del ring con trapo rojo
      isoBox(c, cx, cy, .3, .3, 46, s, P.a, P.S, P.t); c.fillStyle = P.r; blob(c, [[cx + 4 * s, cy - 44 * s], [cx + 22 * s, cy - 40 * s + Math.sin(t * 3 + r * 6) * 3 * s], [cx + 4 * s, cy - 34 * s]], P.r);
      break;
    }
    case 'well': { // aljibe de piedra de Medinat
      isoBox(c, cx, cy, .9, .9, 14, s, P.S, P.t, P.a); c.fillStyle = P.W; c.beginPath(); c.ellipse(cx, cy - 14 * s, 11 * s, 5.5 * s, 0, 0, 6.28); c.fill();
      c.fillStyle = P.D; c.fillRect(cx - 15 * s, cy - 40 * s, 3 * s, 28 * s); c.fillRect(cx + 12 * s, cy - 40 * s, 3 * s, 28 * s); c.fillRect(cx - 15 * s, cy - 40 * s, 30 * s, 3 * s);
      break;
    }
    case 'tent': { // casillas de adobe del Bajo con ropa colgada
      isoBox(c, cx, cy, 1, 1, 34, s, P.a, P.s, P.S);
      c.fillStyle = P.f; c.fillRect(cx - 18 * s, cy - 20 * s, 4 * s, 5 * s); c.fillRect(cx + 12 * s, cy - 18 * s, 4 * s, 5 * s);
      break;
    }
  }
}

/** Altura aproximada de la silueta (para la niebla). */
export const PROP_H: Partial<Record<PropKind, number>> = { spire: 50, column: 44, gold_column: 44, bone_column: 44, cypress: 58, shelf: 44, mirror: 44, obelisk: 60, post: 46 };

/** Lo que se recorta detrás de la isla, en el vacío. (cx, top) es el centro horizontal del mapa y su borde superior en pantalla. */
export function drawBackdrop(c: CanvasRenderingContext2D, id: string, cx: number, top: number, W: number, H: number, s: number, P: Pix, t: number) {
  const k = Math.max(s, W / 1100);
  switch (id) {
    case 'dunas': { // luna pálida y agujas blancas a lo lejos
      c.fillStyle = P.A; c.beginPath(); c.arc(cx + 160 * k, top - 60 * k, 34 * k, 0, 6.28); c.fill(); c.fillStyle = P.a; c.beginPath(); c.arc(cx + 150 * k, top - 64 * k, 34 * k, 0, 6.28); c.fill();
      for (const [dx, h] of [[-260, 70], [-220, 110], [-190, 60], [210, 90], [250, 130], [290, 70]]) blob(c, [[cx + (dx - 18) * k, top + 30 * k], [cx + dx * k, top + (30 - h) * k], [cx + (dx + 16) * k, top + 30 * k]], P.t);
      break;
    }
    case 'eclipse': { // el eclipse sobre las catacumbas
      const R = 70 * k, y = top - 70 * k, pulse = 1 + Math.sin(t * 1.4) * .06;
      c.fillStyle = P.r; c.beginPath(); c.arc(cx, y, R * 1.35 * pulse, 0, 6.28); c.fill(); c.fillStyle = P.f; c.beginPath(); c.arc(cx, y, R * 1.12 * pulse, 0, 6.28); c.fill();
      c.fillStyle = P.k; c.beginPath(); c.arc(cx, y, R, 0, 6.28); c.fill();
      c.strokeStyle = P.f; c.lineWidth = 2 * k; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28 + t * .1; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 1.4, y + Math.sin(a) * R * 1.4); c.lineTo(cx + Math.cos(a) * R * (1.7 + (i % 3) * .2), y + Math.sin(a) * R * (1.7 + (i % 3) * .2)); c.stroke(); }
      break;
    }
    case 'plaza': { // la cúpula del Capitolio y sus alminares
      c.fillStyle = P.s; c.beginPath(); c.arc(cx, top - 10 * k, 80 * k, Math.PI, 0); c.fill(); c.fillRect(cx - 110 * k, top - 10 * k, 220 * k, 40 * k);
      for (const dx of [-150, 150]) { c.fillRect(cx + (dx - 8) * k, top - 120 * k, 16 * k, 150 * k); c.beginPath(); c.arc(cx + dx * k, top - 120 * k, 12 * k, Math.PI, 0); c.fill(); }
      c.fillStyle = P.f; c.fillRect(cx - 2 * k, top - 112 * k, 4 * k, 24 * k);
      break;
    }
    case 'ciudadela': { // torres de la Ciudadela, media luna y cuervos
      c.fillStyle = P.b; c.beginPath(); c.arc(cx - 180 * k, top - 80 * k, 22 * k, 0, 6.28); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(cx - 170 * k, top - 86 * k, 20 * k, 0, 6.28); c.fill();
      c.fillStyle = P.s; for (const [dx, h, w] of [[-120, 160, 30], [-70, 110, 24], [80, 190, 34], [140, 120, 26], [190, 90, 22]]) { c.fillRect(cx + (dx - w / 2) * k, top + 30 * k - h * k, w * k, h * k); blob(c, [[cx + (dx - w / 2 - 4) * k, top + 30 * k - h * k], [cx + dx * k, top + 30 * k - (h + 24) * k], [cx + (dx + w / 2 + 4) * k, top + 30 * k - h * k]], P.s); c.fillStyle = P.f; c.fillRect(cx + (dx - 2) * k, top + 30 * k - (h - 30) * k, 4 * k, 6 * k); c.fillStyle = P.s; }
      c.fillStyle = P.k; for (let i = 0; i < 5; i++) { const x = cx + ((t * 30 + i * 90) % 600 - 300) * k, y = top - (120 + Math.sin(t + i) * 20) * k; c.fillRect(x - 6 * k, y, 12 * k, 2 * k); c.fillRect(x - 1 * k, y - 2 * k, 3 * k, 4 * k); }
      break;
    }
    case 'nido': { // nubes y el pico detrás
      blob(c, [[cx - 300 * k, top + 40 * k], [cx - 40 * k, top - 200 * k], [cx + 30 * k, top - 170 * k], [cx + 300 * k, top + 40 * k]], P.s);
      blob(c, [[cx - 40 * k, top - 200 * k], [cx + 30 * k, top - 170 * k], [cx + 10 * k, top - 140 * k], [cx - 60 * k, top - 150 * k]], P.A);
      c.fillStyle = P.a; for (let i = 0; i < 4; i++) { const x = cx + ((t * 12 + i * 170) % 700 - 350) * k, y = top - (30 + i * 28) * k; c.beginPath(); c.ellipse(x, y, 60 * k, 10 * k, 0, 0, 6.28); c.fill(); }
      break;
    }
    case 'pozo': { // estalactitas de cristal negro colgando del techo
      for (let i = 0; i < 14; i++) { const x = cx + (i - 7) * 44 * k + (i % 3) * 8 * k, h = (60 + (i * 37) % 70) * k; blob(c, [[x - 12 * k, 0], [x + 12 * k, 0], [x, h]], i % 2 ? P.s : P.V); }
      break;
    }
    case 'cripta': { // las trece máscaras colgando de sus cuerdas
      for (let i = 0; i < 13; i++) { const x = cx + (i - 6) * 34 * k, sw = Math.sin(t * .8 + i) * 4 * k, y = top - (40 + (i % 2) * 22) * k + sw * .3; c.strokeStyle = P.D; c.lineWidth = 1.5 * k; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + sw, y - 12 * k); c.stroke();
        c.fillStyle = P.b; c.beginPath(); c.ellipse(x + sw, y, 10 * k, 13 * k, 0, 0, 6.28); c.fill(); c.fillStyle = P.k; c.fillRect(x + sw - 6 * k, y - 4 * k, 4 * k, 3 * k); c.fillRect(x + sw + 2 * k, y - 4 * k, 4 * k, 3 * k); c.fillRect(x + sw - 3 * k, y + 5 * k, 6 * k, 2 * k); }
      break;
    }
    case 'mina': { // la espiral de brazos de Gul-Amarat, en la oscuridad
      for (let a = 0; a < 14; a++) { const ang = a / 14 * 6.28 + t * .05, R1 = 30 * k, R2 = (120 + (a % 3) * 25) * k, y0 = top - 60 * k;
        c.strokeStyle = P.a; c.lineWidth = 6 * k; c.beginPath(); c.moveTo(cx + Math.cos(ang) * R1, y0 + Math.sin(ang) * R1 * .5); c.quadraticCurveTo(cx + Math.cos(ang + .5) * R2 * .7, y0 + Math.sin(ang + .5) * R2 * .35, cx + Math.cos(ang + .3) * R2, y0 + Math.sin(ang + .3) * R2 * .5); c.stroke();
        c.fillStyle = P.A; c.beginPath(); c.arc(cx + Math.cos(ang + .3) * R2, y0 + Math.sin(ang + .3) * R2 * .5, 5 * k, 0, 6.28); c.fill(); }
      c.fillStyle = P.k; c.beginPath(); c.ellipse(cx, top - 60 * k, 26 * k, 14 * k, 0, 0, 6.28); c.fill();
      break;
    }
    case 'jardin': { // hilera de cipreses y faroles
      for (let i = 0; i < 11; i++) { const x = cx + (i - 5) * 56 * k, h = (110 + (i % 3) * 30) * k; blob(c, [[x - 18 * k, top + 30 * k], [x, top + 30 * k - h], [x + 18 * k, top + 30 * k]], i % 2 ? P.s : P.S); }
      c.fillStyle = P.f; for (let i = 0; i < 6; i++) { const x = cx + (i - 2.5) * 90 * k; c.globalAlpha = .6 + .4 * Math.sin(t * 2 + i); c.fillRect(x - 3 * k, top - 40 * k, 6 * k, 8 * k); } c.globalAlpha = 1;
      break;
    }
    case 'templo': { // techo quemado y humo
      c.fillStyle = P.k; for (const [dx, a, l] of [[-140, -.5, 200], [-40, -.2, 240], [90, .35, 210], [190, .6, 160]]) { c.save(); c.translate(cx + dx * k, top + 20 * k); c.rotate(a); c.fillRect(-6 * k, -l * k, 12 * k, l * k); c.restore(); }
      c.fillStyle = P.D; for (let i = 0; i < 6; i++) { const y = top - ((t * 18 + i * 40) % 240) * k, x = cx + Math.sin(t * .6 + i) * 40 * k; c.globalAlpha = .5; c.beginPath(); c.arc(x, y, (18 + i * 4) * k, 0, 6.28); c.fill(); } c.globalAlpha = 1;
      break;
    }
    case 'iglesia': { // rosetón violeta y la serpiente enroscada
      const y = top - 90 * k; c.fillStyle = P.V; c.beginPath(); c.arc(cx, y, 64 * k, 0, 6.28); c.fill(); c.strokeStyle = P.v; c.lineWidth = 3 * k;
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; c.beginPath(); c.moveTo(cx, y); c.lineTo(cx + Math.cos(a) * 64 * k, y + Math.sin(a) * 64 * k); c.stroke(); } c.beginPath(); c.arc(cx, y, 22 * k, 0, 6.28); c.stroke();
      c.strokeStyle = P.k; c.lineWidth = 10 * k; c.beginPath(); for (let a = 0; a < 12; a += .2) { const x = cx + Math.cos(a * 1.6 + t * .3) * (40 + a * 9) * k, yy = y + 70 * k - a * 12 * k; a ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke();
      break;
    }
    case 'cementerio': { // árbol muerto, cruces torcidas y luna verde
      c.fillStyle = P.a; c.beginPath(); c.arc(cx - 170 * k, top - 90 * k, 26 * k, 0, 6.28); c.fill();
      c.strokeStyle = P.k; c.lineWidth = 8 * k; c.beginPath(); c.moveTo(cx + 190 * k, top + 30 * k); c.lineTo(cx + 180 * k, top - 90 * k); c.lineTo(cx + 140 * k, top - 140 * k); c.moveTo(cx + 182 * k, top - 60 * k); c.lineTo(cx + 230 * k, top - 110 * k); c.stroke(); c.lineWidth = 3 * k; c.beginPath(); c.moveTo(cx + 160 * k, top - 115 * k); c.lineTo(cx + 130 * k, top - 120 * k); c.moveTo(cx + 210 * k, top - 90 * k); c.lineTo(cx + 240 * k, top - 80 * k); c.stroke();
      c.fillStyle = P.s; for (const dx of [-260, -220, -120, 60, 110, 250]) { c.save(); c.translate(cx + dx * k, top + 20 * k); c.rotate((dx % 7) * .04); c.fillRect(-3 * k, -40 * k, 6 * k, 40 * k); c.fillRect(-12 * k, -30 * k, 24 * k, 5 * k); c.restore(); }
      break;
    }
    case 'callejon': { // techos del Bajo con ropa tendida y ventanas
      c.fillStyle = P.s; for (let i = 0; i < 9; i++) { const x = cx + (i - 4.5) * 70 * k, h = (90 + (i * 29) % 60) * k; c.fillRect(x, top + 30 * k - h, 64 * k, h); c.fillStyle = P.f; if (i % 2) c.fillRect(x + 20 * k, top + 30 * k - h + 20 * k, 8 * k, 10 * k); c.fillStyle = P.s; }
      c.strokeStyle = P.D; c.lineWidth = 1.5 * k; for (let j = 0; j < 2; j++) { const y = top - (40 + j * 30) * k; c.beginPath(); c.moveTo(cx - 280 * k, y); c.quadraticCurveTo(cx, y + 20 * k, cx + 280 * k, y); c.stroke(); for (let i = 0; i < 7; i++) { const x = cx + (i - 3) * 70 * k; c.fillStyle = [P.r, P.b, P.W, P.f][(i + j) % 4]; c.fillRect(x, y + 10 * k - Math.abs(i - 3) * 2 * k, 12 * k, 14 * k); } }
      break;
    }
    case 'zoco': { // cuerdas de faroles sobre el Mercado
      for (let j = 0; j < 3; j++) { const y = top - (30 + j * 40) * k; c.strokeStyle = P.D; c.lineWidth = 1.5 * k; c.beginPath(); c.moveTo(cx - 320 * k, y); c.quadraticCurveTo(cx, y + 34 * k, cx + 320 * k, y); c.stroke();
        for (let i = 0; i < 9; i++) { const u = (i - 4) / 4, x = cx + u * 280 * k, yy = y + (1 - u * u) * 17 * k; c.fillStyle = [P.f, P.v, P.r][(i + j) % 3]; c.globalAlpha = .7 + .3 * Math.sin(t * 2 + i + j); c.fillRect(x - 4 * k, yy, 8 * k, 10 * k); } } c.globalAlpha = 1;
      break;
    }
    case 'medinat': { // molinos de la Ciudad del Viento
      for (const [dx, h] of [[-230, 150], [-150, 110], [170, 170], [250, 120]]) { const x = cx + dx * k, y = top + 30 * k - h * k; c.fillStyle = P.S; c.fillRect(x - 10 * k, y, 20 * k, h * k); c.strokeStyle = P.A; c.lineWidth = 4 * k;
        for (let i = 0; i < 4; i++) { const a = t * .8 + i * 1.57 + dx; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 46 * k, y + Math.sin(a) * 46 * k); c.stroke(); } }
      break;
    }
    case 'arena': { // gradas llenas de cabezas
      for (let row = 0; row < 4; row++) { const y = top - row * 26 * k; c.fillStyle = row % 2 ? P.s : P.S; c.fillRect(cx - 330 * k, y, 660 * k, 24 * k); for (let i = 0; i < 40; i++) { const x = cx + (i - 20) * 16 * k + (row % 2) * 8 * k; c.fillStyle = [P.t, P.a, P.D][(i + row) % 3]; c.beginPath(); c.arc(x, y - 2 * k + Math.sin(t * 6 + i * 1.7 + row) * 1.5 * k, 5 * k, 0, 6.28); c.fill(); } }
      break;
    }
    case 'santuario': { // el cristal de Zahir flotando sobre la Biblioteca
      const y = top - 80 * k + Math.sin(t) * 6 * k; c.fillStyle = P.V; blob(c, [[cx, y - 40 * k], [cx + 22 * k, y], [cx, y + 40 * k], [cx - 22 * k, y]], P.V); blob(c, [[cx, y - 40 * k], [cx + 22 * k, y], [cx, y + 40 * k]], P.v);
      c.globalAlpha = .4 + .2 * Math.sin(t * 2); c.strokeStyle = P.v; c.lineWidth = 2 * k; c.beginPath(); c.arc(cx, y, 56 * k, 0, 6.28); c.stroke(); c.globalAlpha = 1;
      break;
    }
    case 'acueducto': { // arcos del acueducto
      c.fillStyle = P.s; c.fillRect(cx - 330 * k, top - 120 * k, 660 * k, 22 * k);
      for (let i = 0; i < 8; i++) { const x = cx + (i - 4) * 84 * k; c.fillRect(x, top - 100 * k, 18 * k, 130 * k); }
      c.fillStyle = P.W; for (let i = 0; i < 3; i++) { const x = cx + (-2 + i * 2) * 84 * k + 30 * k; c.globalAlpha = .5; c.fillRect(x, top - 98 * k + ((t * 60 + i * 30) % 20) * k, 4 * k, 120 * k); } c.globalAlpha = 1;
      break;
    }
    case 'cubo': { // esquirlas de espejo girando en el vacío
      for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 + t * .2, R = 230 * k, x = cx + Math.cos(a) * R, y = top - 40 * k + Math.sin(a) * R * .35; const w = (10 + (i % 3) * 6) * k;
        blob(c, [[x, y - w * 1.6], [x + w, y], [x, y + w * 1.6], [x - w * .6, y]], i % 2 ? P.A : P.a); c.fillStyle = P.w; c.fillRect(x - 1 * k, y - w, 2 * k, w); }
      break;
    }
    case 'cubo_maunator': { // engranajes de latón
      for (const [dx, dy, R, sp] of [[-200, -60, 60, 1], [-110, -110, 36, -1.6], [190, -80, 70, -.8]]) { const x = cx + dx * k, y = top + dy * k; c.fillStyle = P.S; c.beginPath(); c.arc(x, y, R * k, 0, 6.28); c.fill(); c.fillStyle = P.t;
        for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 + t * sp * .3; c.save(); c.translate(x + Math.cos(a) * R * k, y + Math.sin(a) * R * k); c.rotate(a); c.fillRect(-6 * k, -6 * k, 12 * k, 12 * k); c.restore(); } c.fillStyle = P.k; c.beginPath(); c.arc(x, y, R * .3 * k, 0, 6.28); c.fill(); }
      break;
    }
  }
}
