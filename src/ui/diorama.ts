// «Modo diorama» (estilo Bleak Sword): el tablero se dibuja a baja resolución, se reduce a una paleta cerrada con
// tramado ordenado y se agranda con píxeles duros. Cada mapa flota como una isla en el vacío y las figuras son
// siluetas de pocos píxeles. Cada zona tiene su rampa de cinco tonos; el resto de la paleta es común a todo el juego.

const KEY = 'zaryab.diorama';
export function dioramaPref(): boolean { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } }
export function setDioramaPref(on: boolean) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* sin almacenamiento */ } }
export const dioramaFor = (mapId?: string) => !!mapId && dioramaPref();
/** Ancho interno del lienzo (en píxeles reales) según el ancho de pantalla. */
export const pixelWidth = (W: number) => Math.round(Math.max(240, Math.min(440, W / 3)));

// ───── paleta: negros y ciruelas comunes, rampa propia de cada zona (s S t a A), hueso, blanco; rojo = sangre, violeta = Zahir ─────
const CORE: Record<string, string> = {
  k: '#0b0810', d: '#1c1622', D: '#2f2733', e: '#3f3540', b: '#ece0c8', w: '#ffffff', r: '#b3192f', R: '#5e0b19',
  v: '#9a5cff', V: '#4e2a8a', f: '#e0a050', g: '#6f8f52', W: '#5a8aa8', p: '#e88ac0',
};
/** Rampa de cada tema de mapa (oscuro → claro) y color de agua. */
const RAMPS: Record<string, [string, string, string, string, string]> = {
  alley: ['#544850', '#6c5d57', '#8a7668', '#a8927c', '#c9b49a'],
  aqueduct: ['#2f4446', '#44595a', '#5d7270', '#7c8f88', '#a3b2a8'],
  mirror: ['#3a3c58', '#555a7a', '#7a80a0', '#a4aac6', '#cdd2e6'],
  tavern: ['#4a3022', '#634030', '#80553c', '#a0714e', '#c49a6c'],
  plaza: ['#5a2e2a', '#7a4436', '#9a6048', '#b88060', '#d6a882'],
  garden: ['#2e3e2c', '#3f5338', '#566c48', '#74885a', '#9aaa78'],
  crater: ['#2a2338', '#3b3150', '#54476a', '#74668a', '#9c8fb0'],
  market: ['#5a3a2c', '#7a5236', '#9a6e44', '#bc905a', '#dcb680'],
  ruins: ['#3e3836', '#554d48', '#6e655c', '#8c8274', '#b0a594'],
  sanctum: ['#3a2c48', '#4e3c60', '#685280', '#866ca0', '#a890c0'],
  mine: ['#34343e', '#48485a', '#626278', '#828298', '#a8a8bc'],
};
const pixCache = new Map<string, Record<string, string>>();
/** Colores con nombre de una letra (los mismos que usan las figuras) para un tema. */
export function pixFor(theme = 'alley'): Record<string, string> {
  let m = pixCache.get(theme); if (m) return m; const ramp = RAMPS[theme] ?? RAMPS.alley;
  m = { ...CORE, s: ramp[0], S: ramp[1], t: ramp[2], a: ramp[3], A: ramp[4] }; pixCache.set(theme, m); return m;
}
/** Paleta del renderer (suelo, muros, cobertura…) para un tema en modo diorama. */
export function palFor(theme = 'alley') {
  const P = pixFor(theme);
  return { bg0: '#000000', bg1: '#000000', f1: P.t, f2: P.t, diff: P.S, wallT: P.A, wallL: P.D, wallR: P.s, cov: P.a, water: theme === 'crater' ? P.V : '#24485e', hazard: P.r, high: P.a, mark: P.v, edge: 'rgba(11,8,16,.35)' };
}

const toRGB = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const quant = new Map<string, { pal: [number, number, number][]; lut: Uint8Array }>();
function quantFor(theme: string) {
  let q = quant.get(theme); if (q) return q;
  const P = pixFor(theme); const pal = ['#000000', ...Object.values(P), palFor(theme).water].map(toRGB); const lut = new Uint8Array(32768);
  for (let r = 0; r < 32; r++) for (let g = 0; g < 32; g++) for (let b = 0; b < 32; b++) {
    const R = r * 8 + 4, G = g * 8 + 4, B = b * 8 + 4; let best = 0, bd = 1e9;
    for (let i = 0; i < pal.length; i++) { const p = pal[i]; const dr = R - p[0], dg = G - p[1], db = B - p[2]; const d = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (d < bd) { bd = d; best = i; } }
    lut[(r << 10) | (g << 5) | b] = best;
  }
  q = { pal, lut }; quant.set(theme, q); return q;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Reduce el lienzo entero a la paleta del tema con tramado ordenado 4×4 (los degradados se vuelven puntos). */
export function quantize(ctx: CanvasRenderingContext2D, w: number, h: number, theme = 'alley', amp = 16) {
  if (w < 2 || h < 2) return; const { pal, lut } = quantFor(theme); const img = ctx.getImageData(0, 0, w, h); const d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; const o = (BAYER[(y & 3) * 4 + (x & 3)] / 15 - .5) * amp;
    const r = Math.max(0, Math.min(255, d[i] + o)) >> 3, g = Math.max(0, Math.min(255, d[i + 1] + o)) >> 3, b = Math.max(0, Math.min(255, d[i + 2] + o)) >> 3;
    const p = pal[lut[(r << 10) | (g << 5) | b]]; d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// ───── figuras (se alinean por los pies; «c»/«C» = cuerpo y sombra según el tipo de criatura) ─────
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
  mago: ['....kk....', '...kVVk...', '..kVVVVk..', '.kkkkkkkk.', '..kbbbbk..', '..kbkkbk..', '...kbbk...', '..kVVVVk.f', '.kVVVVVVkk', '.kVVvvVVkk', '.kVVVVVVk.', '.kVVVVVVk.', 'kVVVVVVVVk', 'kkkkkkkkkk'],
  razul: ['...kkkk...', '...kffk...', '..kffffk..', '..kwwwwk..', '..kwkkwk..', '..kwwwwk..', '.kRkkkkRk.', 'kRRfRRfRRk', 'kRRRffRRRk', 'kRRRRRRRRk', '.kRRRRRRk.', '.kRRRRRRk.', 'kRRRRRRRRk', 'kkkkkkkkkk'],
  ghul: ['...kkk....', '..kAAAk...', '..kArAk...', '..kAAAkk..', '.kAAAAAAk.', 'kAAkAAAAAk', 'k.kAAAAkAk', '..kAAAAk.k', '..kAAAAk..', '..kAk.kAk.', '.kAk...kAk', '.kkk...kkk'],
  esqueleto: ['...kkkk...', '..kbbbbk..', '..kbkkbk..', '..kbbbbk..', '...kbbk...', '..k.bb.k.w', '.kbkbbkbkw', '..k.bb.k.w', '...kbbk..w', '..kb..bk.k', '..kb..bk..', '..kb..bk..', '.kbk..kbk.', '.kkk..kkk.'],
  caballero: ['...kkkk...', '..kDDDDk..', '..kDrrDk..', '..kDDDDk..', '..kkDDkk..', '.kDDDDDDkk', 'kAkDDDDDkb', 'kAkDbbDDkb', 'kAkDDDDDkb', 'kAkDDDDk.b', '.k.kDDDk.k', '...kDkDk..', '..kbk.kbk.', '..kkk.kkk.'],
  sombra: ['...kkkk...', '..kddddk..', '.kdrddrdk.', '.kddddddk.', '..kddddk..', '.kddddddk.', 'kddddddddk', '.kdddddk..', '..kddddk..', '...kdddk..', '....kddk..', '.....kdk..', '......k...'],
  djinn: ['....f.....', '...ff..f..', '...kcck...', '..kcwcwk..', '..kcccck..', 'kcckcckcck', '.k.kcck.k.', '...kcck...', '...kcck...', '....kck...', '....kc....', '.....c....', '....c.....'],
  espejo: ['...kkkk...', '..kwbbwk..', '..kbvvbk..', '..kwbbwk..', '...kbbk...', '..kbwwbk..', '.kbwvvwbk.', '.kbwvvwbk.', '.kbwwwwbk.', '..kbbbbk..', '..kbwwbk..', '..kbk.kbk.', '..kwk.kwk.', '..kkk.kkk.'],
  mazhar: ['.v.v.v.v..', '.kvkvkvk..', '..kwwwwk..', '..kwkkwk..', '..kwwwwk..', '.kdkwwkdk.', 'kddddddddk', 'kdvddddvdk', 'kddddddddk', '.kddddddk.', '.kddddddk.', 'kddddddddk', 'kkkkkkkkkk'],
  serpiente: ['........kkk...', '.......kcrck..', '.......kccck..', '........kck...', '........kck...', '...kkk..kck...', '..kcCck.kck...', '.kck.kckkck...', '.kck..kccck...', '..kck..kcck...', '...kcckcCk....', '....kccck.....', '..kkkkkkkkkk..'],
  serpiente_chica: ['......kk..', '.....kcrk.', '.....kcck.', '......kck.', '..kkk..kck', '.kcCck.kck', 'kck.kckcck', '.kck.kcck.', '..kkkkkk..'],
  gusano: ['..k.k..k.k....', '..kbk..kbk....', '...kbk.kbk.k..', '....kbkkbkkbk.', '..k..kbbbbbk..', '..kbk.kbbbk...', '...kbkkbbbkk..', '....kbbbbbbbk.', '...kbbkkkbbk..', '..kddddddddk..', '.kddddddddddk.', 'kkkkkkkkkkkkkk'],
  brazo: ['..k.k.k...', '..kbkbk...', '...kbbk...', '...kbk....', '....kbk...', '...kbk....', '..kbk.....', '..kbk.....', '...kbk....', '...kbbk...', '..kddddk..', '.kddddddk.'],
  coloso: ['....kkkkkk....', '...kAAAAAAk...', '...kAvAAvAk...', '...kAAAAAAk...', '....kkAAkk....', '.kkkAAAAAAkkk.', 'kAAkAAvvAAkAAk', 'kAAkAAvvAAkAAk', 'kAAkAAAAAAkAAk', 'kAAkAAAAAAkAAk', 'kkkkAAAAAAkkkk', 'kAk.kAAAAk.kAk', '.k..kAAAAk..k.', '....kAkkAk....', '...kAAk.kAAk..', '...kAAk.kAAk..', '..kAAAk.kAAAk.', '..kkkkk.kkkkk.'],
  pilon: ['....kk....', '...kvvk...', '...kvwk...', '..kvvwvk..', '..kvvwvk..', '..kVvvvk..', '..kVvvvk..', '..kVVvvk..', '..kVVVvk..', '.kssssssk.', '.kSSSSSSk.', 'kkkkkkkkkk'],
  marid: ['...kkkk...', '..kWWWWk..', '..kWwWwk..', '..kWWWWk..', '.kWWWWWWk.', 'kWWkWWkWWk', 'kWk.WW.kWk', '...kWWk...', '..kWWWWk..', '.kWWWWWWk.', 'kWWWWWWWWk', '.kkkkkkkk.'],
  golem: ['..kkkkkk..', '..kssssk..', '..ksffsk..', '..kssssk..', 'kkkkkkkkkk', 'kSkssssksk', 'kSkssssksk', 'kSkSSSSksk', 'kkkssssk.k', '..ksssk...', '..kskksk..', '.kssk.kssk', '.kkkk.kkkk'],
  flor: ['..kk..kk..', '.kggkkggk.', '.kgrrrrgk.', '..krwwrk..', '..krrrrk..', '...kggk...', '....kg....', '...kg.....', '..kgg.kk..', '.kggkkggk.', 'kkkkkkkkkk'],
  tigre: ['kk..........kk', 'kAAk......kAAk', '.kAAk....kAAk.', '..kAAkkkkAAk..', '...kfkfkfffk..', '..kffkfkffkrk.', '.kfffffffffffk', '.kffkffkffkff.', '..kfk.kfk.kfk.', '..kk..kk..kk..'],
  pudin: ['....kkkk....', '..kkddddkk..', '.kddddddddk.', 'kdddwdddwddk', 'kddddddddddk', 'kddddddddddk', '.kkkkkkkkkk.'],
  nasnas: ['....kkk...', '...kcck...', '...kcrk...', '...kcck...', '..kccck...', '.kcccck...', 'kc.kcck...', '...kcck...', '...kcck...', '....kck...', '....kck...', '...kcck...', '...kkkk...'],
  escorpion: ['......kk..', '.....kcck.', '......kck.', '.......ck.', '......kck.', '..kkkkkck.', '.kcccccck.', 'kcrcrcccck', 'kccccccck.', '.kCkCkCk..', 'k.k.k.k.k.'],
  perro: ['kk........', 'kcck......', 'krcckkkkk.', '.kccccccck', '..kccccck.', '..kck.kck.', '..kk..kk..'],
  simurg: ['vv............vv', 'kvvk........kvvk', '.kvvk..kk..kvvk.', '..kvvkkffkkvvk..', '...kvvkwwkvvk...', '....kkvffvkk....', '.....kvffvk.....', '....kvvffvvk....', '...kvvVffVvvk...', '....kVVffVVk....', '.....kVffVk.....', '......kffk......', '.......kk.......'],
  humanoid: ['...kkkk...', '..kCCCCk..', '..kCrrCk..', '..kCCCCk..', '...kCCk...', '..kcccck..', '.kcccccck.', '.kccCCcck.', '.kcccccck.', '.kcccccck.', '..kCCCCk..', '..kcccck..', '..kcccck..', '..kck.kck.', '..kCk.kCk.', '..kkk.kkk.'],
  beast: ['..........', '.kk....kk.', 'kcck..kcck', 'kcrckkcrck', '.kcccccck.', 'kcccccccck', '.kCkCkCkk.', '.k.k.k.k..'],
};
const ALIAS: Record<string, string> = {
  guardia_arena: 'guardia', guardia_consulado: 'guardia', veterano_consulado: 'guardia', qilaat: 'guardia', escorpion_obsidiana: 'escorpion', hormiga_arena: 'escorpion', perro_arena: 'perro',
  ghul_catacumbas: 'ghul', ghul_swarmer: 'ghul', ghul_mutado: 'ghul', ghul_cantor: 'ghul', ghul_invocado: 'ghul', zombi_elite: 'ghul', sujeto_c1: 'ghul',
  esqueleto_arena: 'esqueleto', esqueleto_arquero: 'esqueleto', caballero_osario: 'caballero', sombra_arena: 'sombra',
  ifrit_menor: 'djinn', jann_enganador: 'djinn', nino_poseido: 'djinn', djinn_menor: 'djinn', quasi_deva: 'djinn', fragmento_fe: 'djinn',
  reflejo: 'espejo', al_mazhar: 'mazhar', gusano_martillo: 'serpiente', dahhak: 'serpiente', cuello_dahhak: 'serpiente_chica', dahhak_final: 'serpiente', serpiente_cristal: 'serpiente_chica',
  gul_amarat: 'gusano', brazo_gusano: 'brazo', coloso: 'coloso', pilon: 'pilon', marid_guardian: 'marid', golem_arena: 'golem', golem_carne: 'golem', guardian_runico: 'golem',
  flor_carnivora: 'flor', tigre_alado: 'tigre', tigre_companero: 'tigre', black_pudding: 'pudin', nasnas: 'nasnas', simurg_eclipse: 'simurg',
  razul_final: 'razul', razul_aliado: 'razul', aprendiz: 'mago', kethras: 'mago', varreth: 'mago', drow_espia: 'zyrthar', mercenario_zoco: 'humanoid', adorador: 'linyera', adorador_valiente: 'linyera', esclavo: 'linyera',
  seraphel: 'pact', seraphel_aliada: 'pact', grethak: 'panchi', grethak_aliado: 'panchi', sifra: 'humanoid',
};
const BY_SPRITE: Record<string, string> = { construct: 'golem', undead: 'esqueleto', djinn: 'djinn', elemental: 'marid', mirror: 'espejo', serpent: 'serpiente', colossus: 'coloso', pylon: 'pilon', beast: 'beast' };
export function templateFor(pcId: string | undefined, id: string, sprite: string): string[] {
  if (pcId && T[pcId]) return T[pcId];
  const a = ALIAS[id] ?? id; if (T[a]) return T[a];
  return T[BY_SPRITE[sprite] ?? 'humanoid'] ?? T.humanoid;
}
/** Colores de cuerpo («c»/«C») según la criatura: los enemigos son siluetas oscuras; djinn de fuego, marid de agua. */
export function bodyFor(side: string, sprite: string, P: Record<string, string>): [string, string] {
  if (sprite === 'djinn') return [P.f, P.R]; if (sprite === 'elemental') return [P.W, P.V];
  return side === 'pc' ? [P.S, P.s] : [P.D, P.d];
}

/**
 * Dibuja una figura en coordenadas reales del lienzo (sin transformación), alineando cada celda a la grilla de píxeles.
 * (x, y) = pies de la figura en píxeles reales; cell = tamaño de celda en píxeles reales.
 */
export function drawFigure(ctx: CanvasRenderingContext2D, tpl: string[], x: number, y: number, cell: number, o: { pix: Record<string, string>; body?: string; dark?: string; flip?: boolean; down?: boolean; flash?: boolean; bob?: number; lean?: number }) {
  const rows = tpl.length, cols = tpl[0].length; const P = o.pix; const body = o.body ?? P.D, dark = o.dark ?? P.d;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const ox = Math.round(x - (o.down ? rows : cols) * cell / 2), oy = Math.round(y - (o.down ? cols : rows) * cell) - (o.bob ?? 0) * cell;
  for (let j = 0; j < rows; j++) {
    const shift = o.lean && !o.down ? Math.round(o.lean * (rows - j) / rows) * cell : 0; // inclinación al atacar: la cabeza va más lejos que los pies
    for (let i = 0; i < cols; i++) {
      const ch = tpl[j][o.flip ? cols - 1 - i : i]; if (!ch || ch === '.') continue;
      ctx.fillStyle = o.flash ? P.w : ch === 'c' ? body : ch === 'C' ? dark : P[ch] ?? P.k;
      const cx = o.down ? j : i, cy = o.down ? cols - 1 - i : j; ctx.fillRect(ox + cx * cell + shift, oy + cy * cell, cell, cell);
    }
  }
  ctx.restore();
}

// ───── tipografía de píxeles 3×5 para textos flotantes (daño, «falla», estados) ─────
const G: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110', '4': '101101111001001',
  '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110', '+': '000010111010000', '-': '000000111000000',
  '!': '010010010000010', '?': '110001010000010', '.': '000000000000010', ':': '000010000010000', '/': '001001010100100', '%': '101001010100101', ' ': '000000000000000',
};
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
/** Texto centrado en (x, y) (píxeles reales, línea de base abajo) con contorno negro de 1 celda. */
export function drawPixText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cell: number, color: string) {
  const t = [...plain(text)].filter(ch => G[ch]); const w = t.length * 4 * cell - cell; const x0 = Math.round(x - w / 2), y0 = Math.round(y - 5 * cell);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const pass of [0, 1]) {
    ctx.fillStyle = pass ? color : '#0b0810';
    t.forEach((ch, n) => { const g = G[ch]; for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') {
      const px = x0 + (n * 4 + i) * cell, py = y0 + j * cell;
      if (pass) ctx.fillRect(px, py, cell, cell); else ctx.fillRect(px - cell, py - cell, cell * 3, cell * 3);
    } });
  }
  ctx.restore();
}
