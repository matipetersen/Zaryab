// «Modo diorama» (experimental, estilo Bleak Sword): el tablero se dibuja a baja resolución, se reduce a una paleta
// cerrada con tramado ordenado y se agranda con píxeles duros. El mapa flota como una isla en el vacío y las figuras
// son siluetas de pocos píxeles. Por ahora solo en el Callejón (ver DIORAMA_MAPS).

/** Mapas donde se puede activar. */
export const DIORAMA_MAPS = new Set(['callejon']);
const KEY = 'zaryab.diorama';
export function dioramaPref(): boolean { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } }
export function setDioramaPref(on: boolean) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* sin almacenamiento */ } }
export const dioramaFor = (mapId?: string) => !!mapId && DIORAMA_MAPS.has(mapId) && dioramaPref();
/** Ancho interno del lienzo (en píxeles reales) según el ancho de pantalla. */
export const pixelWidth = (W: number) => Math.round(Math.max(240, Math.min(440, W / 3)));

// ───── paleta cerrada: negros, ciruelas, piedra, arena, hueso; rojo para sangre y peligro; violeta solo para Zahir ─────
export const PIX: Record<string, string> = {
  k: '#0b0810', d: '#1c1622', D: '#2f2733', e: '#3f3540', s: '#544850', S: '#6c5d57', t: '#8a7668', a: '#a8927c', A: '#c9b49a',
  b: '#ece0c8', w: '#ffffff', r: '#b3192f', R: '#5e0b19', v: '#9a5cff', V: '#4e2a8a', f: '#e0a050', g: '#6f8f52',
};
const PALETTE: [number, number, number][] = ['#000000', ...Object.values(PIX)].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
/** Colores de escenario del Callejón en modo diorama (sustituyen a la paleta normal del renderer). */
export const DIORAMA_PAL = {
  bg0: '#000000', bg1: '#000000', f1: '#8a7668', f2: '#8a7668', diff: '#6c5d57', wallT: '#c9b49a', wallL: '#2f2733', wallR: '#544850',
  cov: '#8a7668', water: '#1c1622', hazard: '#b3192f', high: '#a8927c', mark: '#9a5cff', edge: 'rgba(11,8,16,.35)',
};

// Tabla de búsqueda 32×32×32 → índice de paleta (se arma una vez)
let LUT: Uint8Array | null = null;
function lut() {
  if (LUT) return LUT; LUT = new Uint8Array(32768);
  for (let r = 0; r < 32; r++) for (let g = 0; g < 32; g++) for (let b = 0; b < 32; b++) {
    const R = r * 8 + 4, G = g * 8 + 4, B = b * 8 + 4; let best = 0, bd = 1e9;
    for (let i = 0; i < PALETTE.length; i++) { const p = PALETTE[i]; const dr = R - p[0], dg = G - p[1], db = B - p[2]; const d = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (d < bd) { bd = d; best = i; } }
    LUT[(r << 10) | (g << 5) | b] = best;
  }
  return LUT;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Reduce el lienzo entero a la paleta con tramado ordenado 4×4 (los degradados se vuelven puntos, como en el pixel art). */
export function quantize(ctx: CanvasRenderingContext2D, w: number, h: number, amp = 16) {
  if (w < 2 || h < 2) return; const L = lut(); const img = ctx.getImageData(0, 0, w, h); const d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; const o = (BAYER[(y & 3) * 4 + (x & 3)] / 15 - .5) * amp;
    const r = Math.max(0, Math.min(255, d[i] + o)) >> 3, g = Math.max(0, Math.min(255, d[i + 1] + o)) >> 3, b = Math.max(0, Math.min(255, d[i + 2] + o)) >> 3;
    const p = PALETTE[L[(r << 10) | (g << 5) | b]]; d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// ───── figuras en pixel art (10 de ancho; se alinean por los pies). «c»/«C» = color propio del enemigo ─────
const T: Record<string, string[]> = {
  pact: ['....ww....', '.A..kk..A.', 'AA.kbbk.AA', 'AAAkbbkAAA', '.AAkkkkAA.', '..kAbbAk.w', '.kAAbbAAkw', '.kbAbbAbkw', '..kAAAAk.w', '..kbbbbk.k', '..kfAAfk..', '..kbbbbk..', '..kbkkbk..', '..kbk.kbk.', '..kak.kak.', '.kkk...kkk'],
  romain: ['..k....k..', '..kk..kk..', '...krrk...', '..krrrrk..', '..krwrwk..', '...krrk...', '..kRRRRk..', '.kRRbbRRk.', '.kRRbbRRkf', '.kRRbbRRkf', '.kRRRRRRk.', '.kRRRRRRk.', '.kRRRRRRk.', '..kRRRRk..', '..kdk.kdk.', '..kkk.kkk.'],
  rabb: ['...kkkk...', '..kVVVVk..', '..kVddVk..', '..kdbbdk..', '..kVVVVk..', '.kVVVVVVk.', '.kVVvvVVkw', '.kVVvvVVkw', '.kVVVVVVkw', '.kVVVVVVkw', '..kVVVVkkw', '..kVVVVk..', '..kVVVVk..', '..kVk.kVk.', '..kdk.kdk.', '..kkk.kkk.'],
  joren: ['...kkkk...', '..kggggk..', '..kgaagk..', '..kgaagk..', '...kggk.k.', '..kggggkAk', '.kgggSggkA', '.kggSgggkA', '.kgSggggkA', '..kSSSSk.A', '..kaaaakAk', '..kggggk.k', '..kggggk..', '..kSk.kSk.', '..kSk.kSk.', '..kkk.kkk.'],
  zyrthar: ['...kwwk...', '..kwwwwk..', '..kwDDwk..', '..kDrDrk..', '...kDDk...', '..kddddk..', '.kddDDddk.', '.kdDddDdk.', '.kddddddk.', 'wkddddddkw', 'wkSSSSSSkw', '..kddddk..', '..kddddk..', '..kdk.kdk.', '..kdk.kdk.', '..kkk.kkk.'],
  panchi: ['...kkkk...', '..kaaaak..', '..kakkak..', '..kaaaak..', '.kfffffk..', 'kafffffak.', 'kaRRRRRak.', 'kaRRRRRak.', 'kkRRRRRkk.', '..kAAAAk..', '..kRRRRk..', '..kRk.kRk.', '..kak.kak.', '..kkk.kkk.'],
  guardia: ['....r....w', '...kkkk..w', '..kAAAAk.S', '..kAkkAk.S', '..kArrAk.S', '...kkkk..S', '..kcccckkS', '.kcccccckS', '.kcAAAAckS', '.kcccccckS', '..kCCCCk.S', '..kcccck.S', '..kcccck..', '..kck.kck.', '..kCk.kCk.', '..kkk.kkk.'],
  linyera: ['...kkkk...', '..kSSSSk..', '.kSddddSk.', '.kSdrdrSk.', '.kSdwwdSk.', '..kSSSSSk.', '.kSSSSSSSk', 'kSSaSSSSSk', 'kSSSSaSSSk', '.kSSSSSSk.', '..kSSSSk..', '..kdk.kdk.', '..kkk.kkk.'],
  inquisidor: ['...kkkk...', '..kddddk..', '..kdwwdk..', '..kdwwdk..', '...kddk...', '..kddddk..', '.kddrrddk.', '.kddrrddk.', '.kddddddk.', '.kddddddk.', '.kddddddk.', 'kdddddddk.', 'kddddddddk', 'kkkkkkkkkk'],
  ghul: ['...kkk....', '..kAAAk...', '..kArAk...', '..kAAAkk..', '.kAAAAAAk.', 'kAAkAAAAAk', 'k.kAAAAkAk', '..kAAAAk.k', '..kAAAAk..', '..kAk.kAk.', '.kAk...kAk', '.kkk...kkk'],
  escorpion: ['......kk..', '.....kcck.', '......kck.', '.......ck.', '......kck.', '..kkkkkck.', '.kcccccck.', 'kcrcrcccck', 'kccccccck.', '.kCkCkCk..', 'k.k.k.k.k.'],
  perro: ['kk........', 'kcck......', 'krcckkkkk.', '.kccccccck', '..kccccck.', '..kck.kck.', '..kk..kk..'],
  humanoid: ['...kkkk...', '..kCCCCk..', '..kCrrCk..', '..kCCCCk..', '...kCCk...', '..kcccck..', '.kcccccck.', '.kccCCcck.', '.kcccccck.', '.kcccccck.', '..kCCCCk..', '..kcccck..', '..kcccck..', '..kck.kck.', '..kCk.kCk.', '..kkk.kkk.'],
  beast: ['..........', '.kk....kk.', 'kcck..kcck', 'kcrckkcrck', '.kcccccck.', 'kcccccccck', '.kCkCkCkk.', '.k.k.k.k..'],
};
const ALIAS: Record<string, string> = { guardia_arena: 'guardia', guardia_consulado: 'guardia', escorpion_obsidiana: 'escorpion', perro_arena: 'perro', ghul_catacumbas: 'ghul', ghul_swarmer: 'ghul', ghul_mutado: 'ghul', ghul_cantor: 'ghul', mercenario_zoco: 'humanoid', nasnas: 'humanoid' };
export function templateFor(pcId: string | undefined, id: string, sprite: string): string[] {
  if (pcId && T[pcId]) return T[pcId];
  const a = ALIAS[id] ?? id; if (T[a]) return T[a];
  return sprite === 'beast' ? T.beast : T.humanoid;
}

/**
 * Dibuja una figura en coordenadas reales del lienzo (sin transformación), alineando cada celda a la grilla de píxeles.
 * (x, y) = pies de la figura en píxeles reales; cell = tamaño de celda en píxeles reales.
 */
export function drawFigure(ctx: CanvasRenderingContext2D, tpl: string[], x: number, y: number, cell: number, o: { body?: string; dark?: string; flip?: boolean; down?: boolean; flash?: boolean; bob?: number }) {
  const rows = tpl.length, cols = 10; const body = o.body ?? PIX.D, dark = o.dark ?? PIX.d;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const ox = Math.round(x - (o.down ? rows : cols) * cell / 2), oy = Math.round(y - (o.down ? cols : rows) * cell) - (o.bob ?? 0) * cell;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const ch = tpl[j][o.flip ? cols - 1 - i : i]; if (!ch || ch === '.') continue;
    ctx.fillStyle = o.flash ? PIX.w : ch === 'c' ? body : ch === 'C' ? dark : PIX[ch] ?? PIX.k;
    const cx = o.down ? j : i, cy = o.down ? cols - 1 - i : j; ctx.fillRect(ox + cx * cell, oy + cy * cell, cell, cell);
  }
  ctx.restore();
}
