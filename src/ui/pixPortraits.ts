// Retratos en pixel art (busto de 24×24 celdas) para el modo diorama, con la misma paleta cerrada que las figuras.
// Cada retrato se arma con capas dibujadas a mano: «X Y Z» = piel (luz, medio, sombra), «P Q O» = ropa (luz, sombra,
// acento). Esas letras se traducen a la paleta del juego por retrato; el resto son las letras de diorama.ts
// (k d D e b w r R v V f g W p + la rampa del tema s S t a A). «G» = verde oscuro (rampa del jardín), «M N L» = metal (rampa de la mina).
// Las expresiones son parches sobre cejas, ojos y boca, no copias enteras. La luz viene siempre de arriba a la izquierda.
import { pixFor } from './diorama';

export type Expr = 'neutral' | 'enojo' | 'tristeza' | 'sonrisa' | 'sorpresa';
export const EXPRS: Expr[] = ['neutral', 'enojo', 'tristeza', 'sonrisa', 'sorpresa'];
const N = 24, SCALE = 5; // 24 celdas × 5 = 120 px, el tamaño del retrato del diálogo

/** [x, y, filas] — '.' es transparente; flip = espejado horizontal. */
type Layer = [number, number, string[], boolean?];
/** Parche de expresión: [x, y, texto]; '.' no toca, '_' = color de fondo de la cara (piel o barba). */
type Patch = [number, number, string];
interface Face { x1: number; x2: number; y: number; mx: number; my: number; skin?: string; mouth?: string; brow?: string; tear?: boolean }
interface Def {
  theme?: string; bg?: string; glow?: string;
  map?: Record<string, string>;
  layers: Layer[];
  face?: Face;
  /** Parches propios por expresión (se aplican después de los genéricos, o en su lugar si generic=false). */
  ex?: Partial<Record<Expr, Patch[]>>;
  generic?: boolean;
  exprs?: Expr[];
  /** Variante: recolorea otro retrato y le suma capas. */
  from?: string; recolor?: Record<string, string>;
}

// ───── piezas comunes ─────
const HEAD: string[] = [
  '...kkkkkk...',
  '..kXYYYYZk..',
  '.kXYYYYYYZk.',
  'kXYYYYYYYYZk',
  'kXYYYYYYYYZk',
  'kXYkkYYkkZZk',
  'kXYYYYYYYYZk',
  'kXYwkYYwkZZk',
  'kXYYYYYYYZZk',
  'kXYYYXZYYZZk',
  'kXYYYYYYYZZk',
  'kXYYYkkYYZZk',
  '.kXYYYYYYZk.',
  '..kXYYYYZk..',
  '...kkkkkk...',
]; // en (6, 3): ojos en (9,10) y (13,10), boca en (10..13, 14)
const HEAD_F: string[] = [ // cara más fina (mujeres, niño): mandíbula angosta
  '...kkkkkk...',
  '..kXYYYYZk..',
  '.kXYYYYYYZk.',
  'kXYYYYYYYYZk',
  'kXYYYYYYYYZk',
  'kXYkkYYkkZZk',
  'kXYYYYYYYYZk',
  'kXYwkYYwkZZk',
  'kXYYYYYYYZZk',
  'kXYYYXZYYZZk',
  '.kXYYYYYYZk.',
  '.kXYYkkYYZk.',
  '..kXYYYYZk..',
  '...kXYYZk...',
  '....kkkk....',
];
const EARS: Layer[] = [[4, 9, ['.k', 'kX', 'kY', '.k']], [18, 9, ['k.', 'Zk', 'Zk', 'k.']]];
const BODY: string[] = [
  '.....kkkkkkYZkkkkkk.....',
  '...kkPPPPPkYZkQQQQQkk...',
  '..kPPPPPPPPkkQQQQQQQQk..',
  '.kPPPPPPPPPOOQQQQQQQQQk.',
  '.kPPPPPPPPPOOQQQQQQQQQk.',
  'kPPPPPPPPPPOOQQQQQQQQQQk',
]; // en (0, 18)
const BODY_N: string[] = [ // hombros angostos
  '.......kkkkYZkkkk.......',
  '.....kkPPPkYZkQQQkk.....',
  '....kPPPPPPkkQQQQQQk....',
  '...kPPPPPPPOOQQQQQQQk...',
  '..kPPPPPPPPOOQQQQQQQQk..',
  '..kPPPPPPPPOOQQQQQQQQk..',
];
const FACE: Face = { x1: 9, x2: 13, y: 10, mx: 10, my: 14 };
const head = (rows = HEAD): Layer => [6, 3, rows];
const body = (rows = BODY): Layer => [0, 18, rows];

// ───── retratos ─────
const D: Record<string, Def> = {
  // Pact Risen — aasimar: piel de oro pálido, halo, alas a la espalda, cicatriz en la mejilla.
  pact: {
    theme: 'market', bg: 'D', glow: 'e', map: { X: 'b', Y: 'A', Z: 'a', P: 'e', Q: 'D', O: 'f' }, face: FACE,
    layers: [
      [0, 9, ['.....k', '....kw', '...kwb', '..kwbb', '.kwbbA', 'kwbbAk', 'kwbAkw', 'kbAkwb', 'kAkwbA', 'kkwbAk', '.kbAk.']],
      [18, 9, ['k.....', 'ak....', 'Aak...', 'AAak..', 'aAAak.', 'kaAAak', 'akaAak', 'Aakaak', 'aAakak', 'kaAakk', '.kaak.']],
      body(), head(), ...EARS,
      [6, 3, ['..kkkkkkkk..', '.kfffffffftk', 'kffffffffftk', 'kfXXYYYYfftk', 'kfXYYYYYYYtk']],
      [7, 0, ['.bwwwwwwwb.', 'w.........w', '.bwwwwwwwb.'].map(r => r.replace(/w/g, 'f').replace(/^(.)f/, '$1w'))],
      [14, 11, ['R']], [13, 12, ['R']], [12, 13, ['R']],
      [9, 18, ['kfYZfk']], [10, 19, ['ff']],
    ],
  },
  // Romain — tiefling de piel roja, cuernos, clérigo de la tumba; la balanza en el pecho.
  romain: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'r', Y: 'r', Z: 'R', P: 'D', Q: 'd', O: 'D' }, face: FACE,
    layers: [
      body(), head(), [4, 9, ['.k', 'kr', 'kr', '.k']], [18, 9, ['k.', 'Rk', 'Rk', 'k.']],
      [6, 3, ['..kkkkkkkk..', '.kdDDDDDddk.', 'kdDDDDDDDddk', 'kDXYYYYYYZdk', 'kdXYYYYYYZdk']],
      [2, 0, ['.kk....', 'kbAk...', 'kbAk...', 'kbAAk..', '.kbAAkk', '..kbAAA', '...kkbA']], [15, 0, ['....kk.', '...kAak', '...kAak', '..kAaak', 'kkAaak.', 'AAaak..', 'Aakk...']],
      [9, 10, ['f']], [13, 10, ['f']],
      [8, 19, ['...ff...', '.ffffff.', '.f.ff.f.', 'fff..fff', '...ff...']],
    ],
  },
  // Rabb Locke — brujo encapuchado, violeta, la cara en sombra; la empuñadura de la espada al hombro.
  rabb: {
    theme: 'sanctum', bg: 'd', glow: 'D', map: { X: 'e', Y: 'D', Z: 'd', P: 'V', Q: 'd', O: 'v' }, face: { ...FACE, brow: 'k' },
    layers: [
      body(), head(),
      [4, 1, ['.....kkkkkk.....', '....kvvvvVVk....', '...kvvvVVVVVk...', '..kvvVVVVVVVVk..', '.kvVkkkkkkkkVVk.',
        '.kvVkddddddkVVk.', '.kvVk......kVVk.', '.kvV........VVk.', '.kvV........VVk.', '.kvV........VVk.', '.kvV........VVk.',
        '.kvV........VVk.', '.kvV........VVk.', '.kvVk......kVVk.', '.kvVVk....kVVVk.', '.kvvVVkkkkVVVVk.', 'kvvVVVVVVVVVVVVk']],
      [9, 10, ['v']], [13, 10, ['v']],
      [18, 11, ['..kk.', '.kbak', '..kk.', '..kdk', '..kdk', 'kfffk', '.kfk.']],
    ],
    ex: { enojo: [[9, 10, 'w'], [13, 10, 'w']], sorpresa: [[9, 10, 'w'], [13, 10, 'w']] },
  },
  // Joren Hell — capucha verde de explorador, barba de tres días, carcaj al hombro.
  joren: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'S', Q: 's', O: 't' }, face: FACE,
    layers: [
      [16, 10, ['...kbk', '..kbrk', '.kbrk.', 'kttk..', 'kstk..', 'kstk..', 'kstk..']],
      body(), head(), ...EARS,
      [4, 1, ['.....kkkkkk.....', '....kggggGGk....', '...kgggGGGGGk...', '..kggGGGGGGGGk..', '.kggGkSSSSSSkGGk', '.kgGkSSSSSSSSkGk',
        '.kgGkS......SkGk', '.kgGk........kGk', '.kgGk........kGk', '.kgGk........kGk', '.kgGk........kGk', '.kgG..........Gk',
        '.kgG..........Gk', '.kgGk........kGk', '.kggGk......kGGk', '.kggGGkkkkkkGGGk', 'kggGGGGGGGGGGGGk']],
      [7, 15, ['.t.t.t.t.', 't.t.t.t.t']], [8, 16, ['.t.t.t.']], [8, 13, ['t', '.']], [15, 13, ['t']],
      [3, 19, ['kt', '.kt', '..kt', '...kt', '....kt']],
    ],
  },
  // Zyr'thar — drow: piel oscura, pelo blanco largo, ojos rojos, orejas en punta.
  zyrthar: {
    theme: 'crater', bg: 'd', glow: 'S', map: { X: 'a', Y: 't', Z: 'S', P: 'D', Q: 'd', O: 'V' }, face: { ...FACE, brow: 'w' },
    layers: [
      body(),
      [3, 5, ['..kwk', '.kwbk', '.kwbk', 'kwbAk', 'kwbAk', 'kwbAk', 'kwbAk', 'kwbAk', 'kwbAk', 'kwAk.', 'kwAk.', 'kwAk.', 'kAk..', 'kk...']],
      [16, 5, ['kAk..', 'kAAk.', 'kAAk.', 'kAAAk', 'kAAAk', 'kAAAk', 'kAAAk', 'kAAAk', 'kAAAk', '.kAAk', '.kAAk', '.kAAk', '..kAk', '...kk']],
      head(),
      [1, 8, ['kk...', 'kak..', '.kaak', '..kkk']], [18, 8, ['...kk', '..kSk', 'kSSk.', 'kkk..']],
      [6, 2, ['..kkkkkkkk..', '.kwwwwwwbbk.', 'kwwwwwwwbbAk', 'kwwbbbwwbAAk', 'kwbXYYYbbAAk', 'kwXYYYYYYAAk', 'kwXYYYYYYZAk']],
      [9, 8, ['ww']], [13, 8, ['ww']], [9, 10, ['rk']], [13, 10, ['rk']],
      [10, 19, ['VV']], [10, 20, ['VV']],
    ],
  },
  // Panchi — enano monje: calvo con vincha roja, barba naranja enorme.
  panchi: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'r', Q: 'R', O: 'k' }, face: { ...FACE, mouth: 'f' },
    layers: [
      body(), head(), [3, 9, ['.k', 'kX', 'kY', 'kY', '.k']], [19, 9, ['k.', 'Zk', 'Zk', 'Zk', 'k.']],
      [6, 3, ['...kkkkkk...', '..kbAYYYZk..', '.kXbYYYYYZk.', 'krrrrrrrrRRk', 'kRRRRRRRRRRk']],
      [17, 6, ['krk.', 'kRrk', '.kRk', '..kk']],
      [5, 12, [
        'k............k', 'kf..........tk', 'kff..ffff..ftk', 'kfffffffffftk.', '.kfffff..fftk.', '.kffffffffftk.', '..kfffffffftk.', '..kfffffffftk.', '...kffffftk...', '....kfffftk...', '.....kkkk.....']],
      [8, 15, ['kk', '.k']], [14, 15, ['kk']],
      [10, 15, ['f..f']],
    ],
  },
  // Zahir — dios pájaro del fuego y la mentira: plumaje violeta y blanco, ojos en llamas, pico de oro.
  zahir: {
    theme: 'sanctum', bg: 'd', glow: 'V', face: { x1: 7, x2: 14, y: 10, mx: 10, my: 15 }, generic: false,
    layers: [[0, 0, mir([
      '............',
      '.......r....',
      '......kfk..f',
      '...f..kvk.kf',
      '..kfk.kvkkvw',
      '..kvk.kvvkvw',
      '..kvvkkvwwww',
      '...kvvwwwwww',
      '...kvwwwwwww',
      '..kvwwkkkkww',
      '..kvwkrfwkww',
      '..kvwwkrfkww',
      '..kvvwwkkkkb',
      '...kvvwwwkbf',
      '...kvvvwwkbf',
      '....kvvvvkkf',
      '....kVvvvvkk',
      '...kVVvvvvvk',
      '..kVvvwvvvwv',
      '.kVvwwvvvwwv',
      'kVvwwvvvwwvv',
      'kVwwvvvwwvvw',
      'kvwvvvwwvvww',
      'kvvvvwwvvwww',
    ], { w: 'b', v: 'V', b: 'f', f: 'f', V: 'V' }, { 10: { r: 'r', f: 'f' } })]],
    ex: {
      enojo: [[6, 9, 'kk...'], [7, 10, 'kk'], [16, 10, 'kk'], [13, 9, '...kk'], [8, 10, 'rf'], [14, 10, 'fr'], [10, 15, 'krrk'], [11, 16, 'kk']],
      tristeza: [[6, 9, '...kk'], [13, 9, 'kk...'], [8, 10, 'Vv'], [14, 10, 'vV'], [8, 11, 'VV'], [14, 11, 'VV'], [8, 12, 'r'], [8, 13, 'r']],
      sonrisa: [[6, 8, 'kkk'], [6, 9, '.ww..'], [13, 9, 'kkkkk'], [14, 10, 'kk'], [10, 15, 'k..r'], [13, 14, 'k']],
      sorpresa: [[6, 8, 'kkkk'], [14, 8, 'kkkk'], [6, 9, '.wwww'], [13, 9, 'wwww.'], [7, 10, 'kwwf'], [13, 10, 'fwwk'], [10, 15, 'krrk'], [11, 16, 'kk']],
    },
  },
  // Zahir caído — el mismo pájaro con el plumaje quemado: ceniza, brasas y una cresta rota.
  zahir_caido: {
    from: 'zahir', bg: 'k', glow: 'R', recolor: { w: 'b', A: 'e', v: 'R', V: 'd', f: 'f' },
    layers: [
      [7, 1, ['k']], [10, 1, ['....']], [9, 2, ['k...']], [3, 3, ['k']], [20, 3, ['r']], [2, 4, ['.']],
      [8, 7, ['r']], [16, 8, ['e']], [15, 7, ['r', 'r']], [4, 18, ['r']], [18, 19, ['f']], [6, 21, ['r']], [20, 22, ['r']], [12, 20, ['f']],
      [9, 6, ['eke']], [11, 4, ['k']],
    ],
  },
  // Vizir Razul — máscara de oro tras la que asoma otra máscara blanca; turbante y túnica rojo oscuro.
  razul: {
    theme: 'market', bg: 'd', glow: 'R', map: { X: 'b', Y: 'f', Z: 'a', P: 'R', Q: 'd', O: 'f' }, generic: false,
    face: { x1: 9, x2: 13, y: 10, mx: 10, my: 14 },
    layers: [
      body([
        '....kkkkkkkkkkkkkkkk....',
        '..kkRRRkffkkkkffkddRkk..',
        '.kRRRRRkfRkddkRfkdddddk.',
        '.kRRRRRRkfRkkRfkddddddk.',
        'kRRRRRRRkfRffRfkdddddddk',
        'kRRRRRRRRkfRRfkddddddddk',
      ]),
      [8, 15, ['kkkkkkkk', '.kddddk.', '.kdddk..', '..kdk...', '..kk....']],
      head(),
      [5, 0, ['.....kkkkkk.....', '...kkrRRRRRkk...', '..krrRRRRRRRRk..', '.krrRRRkkRRRRRk.', '.krRRRkfwkRRRRk.', 'krrRRRRkfkRRRRRk', 'kkkkkkkkkkkkkkkk', 'krRkk......kkRRk']],
      [6, 8, ['kXYYYYYYYYZk', 'kXkkkYYkkkak', 'kXkwkYYkwkak', 'kXYYYYYYYZak', 'kXYYYbaYYZak', 'kXYYYYYYYawk', 'kXYkkkkkkwbk', '.kXYYYYYYwk.']],
      [16, 12, ['w', 'k', 'w']],
    ],
    ex: {
      enojo: [[9, 10, '.r.'], [13, 10, '.r.'], [8, 9, '.kk'], [13, 9, 'kk.'], [10, 8, 'k'], [13, 8, 'k']],
      tristeza: [[9, 10, '.V.'], [13, 10, '.V.'], [10, 11, 'b'], [10, 12, 'f'], [10, 13, 'b']],
      sonrisa: [[9, 14, 'k....k'], [10, 14, 'kkkk'], [9, 13, 'k'], [14, 13, 'k'], [9, 14, 'Y'], [14, 14, 'a']],
      sorpresa: [[9, 9, 'kkk'], [13, 9, 'kkk'], [9, 10, 'wwk'], [13, 10, 'kww']],
    },
  },
  // Dahhak — el hombre de los cuellos: dos serpientes le brotan de los hombros.
  dahhak: {
    theme: 'ruins', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'D', Q: 'd', O: 'f' }, face: FACE,
    layers: [
      body(), head(), ...EARS,
      [6, 1, ['.kf..ff..fk.', '.kfk.ff.kfk.', '.kfffffffak.', '.kfrffffrak.', 'kkkkkkkkkkkk', 'keDDDDDDDddk', 'keXYYYYYYZdk', 'kdXYYYYYYZdk']],
      [7, 15, ['k.kkkk.k..', 'keDDDDDdk.', '.keDDDdk..', '..keDdk...', '...kdk....']],
      [10, 15, ['kk']],
      [0, 2, ['.kkk...', 'kgggk..', 'kgrgGk.', 'kgggGk.', '.kGGk..', '..kgGk.', '..kgGk.', '...kgGk', '...kgGk', '..kggGk', '..kgGk.', '.kggk..', '.kgGk..', '.kgGk..', '..kgGk.', '...kgGk', '....kgk']],
      [17, 2, ['...kkk.', '..kgggk', '.kGgrgk', '.kGgggk', '..kGGk.', '.kGgk..', '.kGgk..', 'kGgk...', 'kGgk...', 'kGggk..', '.kGgk..', '..kggk.', '..kGgk.', '..kGgk.', '.kGgk..', 'kGgk...', 'kgk....']],
    ],
  },
  // Aisha — pañuelo ciruela, ojeras de no dormir.
  aisha: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'S', Q: 's', O: 'p' }, face: FACE,
    layers: [
      body(BODY_N), head(HEAD_F),
      [4, 1, ['.....kkkkkk.....', '....kppVVVVk....', '...kpVVVVVVVk...', '..kpVVVVVVVVVk..', '.kpVkkkkkkkkVVk.', '.kpVkdddddddkVk.',
        '.kpVkdXYYYYYdkVk', '.kpVk........kVk', '.kpVk........kVk', '.kpV..........Vk', '.kpV..........Vk', '.kpV..........Vk',
        '.kpVk........kVk', '.kpVVk......kVVk', '.kpVVk......kVVk', '.kpVVVk....kVVVk', '.kpVVVVkkkkVVVVk', 'kppVVVVVVVVVVVVk']],
      [9, 11, ['tt']], [13, 11, ['tt']], [11, 14, ['R', '.']], [12, 14, ['R']],
    ],
  },
  // EaNassr — mercader: turbante blanco con gema, bigote fino, aro de oro.
  eanassr: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'a', Y: 't', Z: 'S', P: 'A', Q: 'a', O: 'W' }, face: FACE,
    layers: [
      body(), head(), ...EARS, [4, 12, ['f']],
      [5, 0, ['......kkkk......', '....kkbbbAkk....', '...kbbwwbbAAk...', '..kbwwbbbbAAAk..', '.kbwbbbkfkbAAAk.', '.kbbbbAkfkAAAak.', 'kbbbbAAAkAAAAaak', 'kkkkkkkkkkkkkkkk']],
      [6, 7, ['kXYYYYYYYYZk']],
      [8, 13, ['.kkkkkk.', 'k......k']], [11, 15, ['kk', 'kk']],
      [9, 9, ['k']], [14, 8, ['k']],
    ],
  },
  // Farid — niño enfermo, piel translúcida, ojos grandes y ojerosos.
  farid: {
    theme: 'mirror', bg: 'd', glow: 'D', map: { X: 'w', Y: 'b', Z: 'A', P: 'a', Q: 't', O: 't' }, face: { ...FACE, y: 12, my: 16 },
    layers: [
      body(BODY_N), [6, 5, HEAD_F],
      [4, 11, ['.k', 'kX', 'kY', '.k']], [18, 11, ['k.', 'Zk', 'Zk', 'k.']],
      [6, 4, ['...k.kk.k...', '..kekeekdk..', '.keeeeeeeddk', 'keeDDeeeeddk', 'keDdXYdDYdDk', 'kdXYYYYYYZdk']],
      [9, 13, ['aa']], [13, 13, ['aa']],
    ],
  },
  // Sifra (Ellie) — guerrera alta de hombros anchos, venda en la frente, quemaduras del cuello a la oreja.
  sifra: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'e', Q: 'D', O: 't' }, face: FACE,
    layers: [
      body(['....kkkkkkkYZkkkkkkk....', '.kkeeeeekkkYZkkkDDDDDkk.', 'keeeeeeeeekkkkDDDDDDDDDk', 'keeeeeeeekttttkDDDDDDDDk', 'keeeeeetttkkktttDDDDDDDk', 'keeeeekkk.....kkkDDDDDDk']),
      head(), ...EARS,
      [6, 3, ['..kkkkkkkk..', '.kSSSSSSSsk.', 'kSSSSSSSSssk', 'kbbbbbbbbAAk', 'kXYYYbAYYZsk']],
      [17, 6, ['bk', 'Ak']],
      [15, 12, ['p', 'pR', 'Rp', 'pRk']], [15, 16, ['Rp']], [16, 15, ['k']], [14, 17, ['pR']], [18, 10, ['p', 'R']],
    ],
  },
  // Nadir — gnomo guía: gorro verde con antiparras, nariz grande, bigote.
  nadir: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'g', Q: 'G', O: 't' }, face: { ...FACE, y: 11, my: 15, mouth: 'S', brow: 'b' },
    layers: [
      body(BODY_N), [6, 4, HEAD],
      [2, 9, ['kk..', 'kXk.', '.kYk', '..kk']], [18, 9, ['..kk', '.kZk', 'kZk.', 'kk..']],
      [5, 1, ['......kkk.......', '....kkgggkk.....', '...kggggggGk....', '..kgggggggGGk...', '.kkkkkkkkkkkkk..', 'kgWWkggggkWWkGk.', 'kgWwkGGGGkWwkGGk', 'kkkkkkkkkkkkkkkk']],
      [16, 1, ['r', 'r', '.']],
      [9, 9, ['bb..bb']], [9, 11, ['wk']], [13, 11, ['wk']],
      [10, 12, ['.kk.', 'kApk', 'kppk']], [9, 15, ['SSSSSS']], [8, 15, ['k']], [15, 15, ['k']], [9, 16, ['S....S']],
    ],
  },
  // Kethras — el hombre del bastón: túnica rojo oscuro, barba gris, cristal en el bastón.
  kethras: {
    theme: 'ruins', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'R', Q: 'd', O: 'f' }, face: { ...FACE, mouth: 'A', brow: 'b' },
    layers: [
      [19, 0, ['.kk.', 'kvwk', 'kvVk', '.kk.', '.kt.', '.kt.', '.ks.', '.kt.', '.kt.', '.ks.', '.kt.', '.kt.', '.ks.', '.kt.', '.kt.', '.ks.', '.kt.', '.kt.', '.ks.', '.kt.', '.kt.', '.ks.', '.kt.', '.kt.'].map(r => r.replace(/^\.k(.)\.$/, '.k$1k'))],
      body(), head(),
      [4, 1, ['.....kkkkkk.....', '....krrRRRRk....', '...krrRRRRRRk...', '..krRRRRRRRRRk..', '.krRkkkkkkkkRRk.', '.krRkXYYYYYZkRk.', '.krRk......kRRk.', '.krR........RRk.', '.krR........RRk.', '.krR........RRk.', '.krR........RRk.']],
      [9, 9, ['bb..bb']],
      [7, 13, ['kA......tk', 'kAAA..AAtk', '.kAAAAAAtk', '.kAAAAAAtk', '..kAAAAtk.', '..kAAAAtk.', '...kAAtk..', '....kkk...']],
      [10, 14, ['.kk.']],
    ],
  },
  // Capitana Samira — guardia imperial: hombreras doradas, capa roja, pelo negro atado.
  samira: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'a', Y: 't', Z: 'S', P: 'f', Q: 'a', O: 'R' }, face: FACE,
    layers: [
      [16, 4, ['.kk.', 'kedk', 'kek.', 'kdk.', '.kek', '.kdk', '.kek', 'kdk.', 'kRk.', '.k..']],
      body(['.....kkkkkkYZkkkkkk.....', '.kkkkkRRRkkkkkkRRRkkkkk.', 'kffffkRRRRkkkkRRRRkaaaak', 'kffffakRRRRRRRRRRkaaaaak', '.kfaakkRRfRRRRfRRkkaaak.', 'kkkkkRRRRRRRRRRRRRRkkkkk']),
      head(HEAD_F), ...EARS,
      [6, 3, ['..kkkkkkkk..', '.keeeeeDDdk.', 'keeeDDDDDDdk', 'keXYYYYYYZdk', 'kDXYYYYYYZdk']],
    ],
  },
  // Lady Nafisa — noble madura: peinado alto con joyas, aros y collar.
  nafisa: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'p', Q: 'V', O: 'f' }, face: FACE,
    layers: [
      body(BODY_N), head(HEAD_F), ...EARS, [4, 12, ['f', 'p']], [19, 12, ['f', 'p']],
      [5, 0, ['....kkkkkkkk....', '...kDeeeeeeDk...', '..kDeeefpfeeDk..', '..kDeeeefeeeDk..', '.kDeeeeeeeeeDDk.', '.kDXXYYYYYYZDDk.', 'kDeXYYYYYYYYZDDk']],
      [9, 12, ['t']], [14, 12, ['t']], [11, 14, ['RR']],
      [8, 18, ['k......k', '.kffffk.', '..kfpk..', '...kk...']],
    ],
  },
  // genéricos: guardia (casco con nasal y penacho), gente del Bajo (pañuelo), acólito (capucha y máscara blanca).
  guardia: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', A: 'M', a: 'N', t: 'L', s: 'L', S: 'e', O: 'r' }, face: { ...FACE, x1: 9, x2: 13 },
    layers: [
      [10, 0, ['.kk.', 'krrk', 'krRk', '.kk.']],
      body(['.....kkkkkkYZkkkkkk.....', '...kkAAaaakkkktttssskk...', '..kAAaaaaaaakkttttssssk..', '.kAaakkkkkkkkkkkkkkssssk.', '.kaaaaaaaaaaaattttssssk.', 'kaaaaaaaaaaattttttssssk']),
      [5, 3, ['...kkkkkk...', '..kAAAaattk.', '.kAAaaaaaatk', 'kAAaaaaaaattk', 'kkkkkkkkkkkkkk']],
      head(),
      [5, 3, ['....kkkkkk....', '..kkAAAaatkk..', '.kAAaaaaaaattk.', 'kAAaaaaaaaaattk', 'kkkkkkkkkkkkkkk', '.kak.....kt.kak', '.kak.....kt.kak'].map(r => r.slice(0, 14))],
      [11, 7, ['at', 'at', 'at', 'kk']],
    ],
  },
  vecino: {
    theme: 'tavern', bg: 'd', glow: 'D', map: { X: 'A', Y: 'a', Z: 't', P: 'a', Q: 't', O: 'S' }, face: FACE,
    layers: [
      body(), head(), ...EARS,
      [5, 2, ['...kkkkkkkk...', '..kAAAAaaattk.', '.kAAaaaaaaattk', 'kAaaaaaaaaattk', 'kkkkkkkkkkkkkk', 'k.dXYYYYYYZd.k'].map(r => r.slice(0, 14))],
      [6, 7, ['kd', 'kd']], [16, 7, ['dk', 'dk']],
      [9, 15, ['t.t.t.']],
    ],
  },
  acolito: {
    theme: 'sanctum', bg: 'k', glow: 'R', map: { X: 'b', Y: 'b', Z: 'A', P: 'D', Q: 'd', O: 'r' }, generic: false,
    face: FACE,
    layers: [
      body(), head(),
      [4, 1, ['.....kkkkkk.....', '....kDDDDddk....', '...kDDDDDdddk...', '..kDDDDDDdddDk..', '.kDDkkkkkkkkddk.', '.kDDk......kddk.', '.kDD........ddk', '.kDD........ddk', '.kDD........ddk', '.kDD........ddk', '.kDD........ddk', '.kDD........ddk', '.kDD........ddk', '.kDDk......kddk', '.kDDDk....kdddk', '.kDDDDkkkkddddk', 'kDDDDDDDDdddddk']],
      [8, 9, ['bkkbbkkb', 'bkkbbkkb']], [11, 12, ['A']], [10, 14, ['kkkk']], [11, 4, ['r', 'r']], [10, 5, ['....']],
      [10, 20, ['rr', 'kr']],
    ],
    ex: { enojo: [[9, 10, 'r'], [14, 10, 'r']], tristeza: [[9, 11, 'r'], [9, 12, 'r'], [14, 9, 'k']], sorpresa: [[9, 10, 'w'], [14, 10, 'w']] },
  },
};

/** Fila espejada: la mitad izquierda tal cual y la derecha reflejada con la paleta de sombra. */
function mir(half: string[], swap: Record<string, string>, keep: Record<number, Record<string, string>> = {}): string[] {
  return half.map((row, y) => row + [...row].reverse().map(ch => (keep[y]?.[ch] ?? swap[ch] ?? ch)).join(''));
}

// ───── expresiones genéricas (cejas, ojos y boca) ─────
function generic(f: Face, e: Expr): Patch[] {
  const { x1, x2, y, mx, my } = f; const B = f.brow ?? 'k';
  const br = (s: string) => s.replace(/k/g, B);
  switch (e) {
    case 'enojo': return [[x1, y - 2, br('k_')], [x1, y - 1, br('_k')], [x2, y - 2, br('_k')], [x2, y - 1, br('k_')], [mx, my, 'kwwk']];
    case 'tristeza': return [[x1, y - 3, br('_k')], [x1, y - 2, br('k_')], [x2, y - 3, br('k_')], [x2, y - 2, br('_k')], [mx, my, '_kk_'], [mx, my + 1, 'k__k'], ...(f.tear === false ? [] : [[x1, y + 1, 'W'] as Patch])];
    case 'sonrisa': return [[mx, my, 'k__k'], [mx, my + 1, '_kk_']];
    case 'sorpresa': return [[x1, y - 3, br('kk')], [x1, y - 2, '__'], [x2, y - 3, br('kk')], [x2, y - 2, '__'], [mx, my, '_kk_'], [mx, my + 1, '_kk_']];
    default: return [];
  }
}

// ───── composición y render ─────
const gridCache = new Map<string, string[][]>();
function grid(id: string): string[][] {
  let g = gridCache.get(id); if (g) return g;
  const d = D[id];
  g = d.from ? grid(d.from).map(r => r.map(ch => d.recolor?.[ch] ?? ch)) : Array.from({ length: N }, () => Array<string>(N).fill('.'));
  const map = d.map ?? {};
  for (const [x, y, rows, flip] of d.layers) rows.forEach((row, j) => {
    const w = row.length;
    for (let i = 0; i < w; i++) {
      const ch = row[flip ? w - 1 - i : i]; if (ch === '.' || ch === ' ') continue;
      const X = x + i, Y = y + j; if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
      g![Y][X] = map[ch] ?? ch;
    }
  });
  gridCache.set(id, g); return g;
}
const defOf = (id: string): Def => { const d = D[id]; return d.from ? { ...D[d.from], ...d, layers: d.layers, ex: { ...D[d.from].ex, ...d.ex } } : d; };
export function exprsOf(id: string): Expr[] {
  const d = defOf(id); if (d.exprs) return d.exprs;
  return EXPRS.filter(e => e === 'neutral' || d.generic !== false || d.ex?.[e]);
}
function withExpr(id: string, e: Expr): string[][] {
  const d = defOf(id); const g = grid(id).map(r => r.slice()); if (e === 'neutral') return g;
  const map = d.map ?? {}; const f = d.face;
  const patches = [...(f && d.generic !== false ? generic(f, e) : []), ...(d.ex?.[e] ?? [])];
  for (const [x, y, s] of patches) for (let i = 0; i < s.length; i++) {
    const ch = s[i]; if (ch === '.') continue; const X = x + i; if (X < 0 || X >= N || y < 0 || y >= N) continue;
    const bgc = ch === '_' ? (y >= (f?.my ?? 99) && f?.mouth ? f.mouth : f?.skin ?? 'Y') : ch;
    g[y][X] = map[bgc] ?? d.recolor?.[bgc] ?? bgc;
  }
  return g;
}
/** Letras extra: colores de la rampa de otro tema (verde del jardín, metal de la mina). */
const EXTRA: Record<string, [string, string]> = { G: ['garden', 'S'], M: ['mine', 'A'], N: ['mine', 'a'], L: ['mine', 't'] };
const urlCache = new Map<string, string>();
/** Data URL del retrato `id` con la expresión `e` (cacheado). Null si no existe o no hay DOM. */
export function pixPortraitUrl(id: string, e: Expr = 'neutral'): string | null {
  if (!D[id] || typeof document === 'undefined') return null;
  if (!exprsOf(id).includes(e)) e = 'neutral';
  const key = id + '|' + e; const hit = urlCache.get(key); if (hit) return hit;
  const c = document.createElement('canvas'); c.width = c.height = N * SCALE;
  const ctx = c.getContext('2d'); if (!ctx) return null; ctx.imageSmoothingEnabled = false;
  const d = defOf(id); const P = pixFor(d.theme ?? 'alley');
  const col = (ch: string) => { const x = EXTRA[ch]; return x ? pixFor(x[0])[x[1]] : P[ch] ?? P.k; };
  // fondo: color liso y un halo tramado detrás de la cabeza
  ctx.fillStyle = col(d.bg ?? 'd'); ctx.fillRect(0, 0, c.width, c.height);
  if (d.glow) { ctx.fillStyle = col(d.glow); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const r = Math.hypot(x - 11.5, y - 9.5); if (r < 8.5 || (r < 11 && (x + y) % 2 === 0)) ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
  } }
  const g = withExpr(id, e);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const ch = g[y][x]; if (ch === '.') continue; ctx.fillStyle = col(ch); ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE); }
  const url = c.toDataURL('image/png'); urlCache.set(key, url); return url;
}
export const PIX_IDS = Object.keys(D);

// ───── nombre del hablante → retrato ─────
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const BY_NAME: [RegExp, string][] = [
  [/zahir.*caido|caido.*zahir/, 'zahir_caido'], [/zahir/, 'zahir'], [/razul|vizir/, 'razul'], [/dahhak/, 'dahhak'],
  [/^pact|pact risen/, 'pact'], [/romain/, 'romain'], [/rabb/, 'rabb'], [/joren/, 'joren'], [/zyr.?thar/, 'zyrthar'], [/panchi/, 'panchi'],
  [/aisha/, 'aisha'], [/eanassr|ea nassr/, 'eanassr'], [/sifra|ellie/, 'sifra'], [/^nadir\b/, 'nadir'], [/kethras/, 'kethras'],
  [/samira/, 'samira'], [/nafisa/, 'nafisa'], [/^farid/, 'farid'],
  // genéricos por pistas del nombre
  [/acolito|mascara|cantor|adorador|culto|sacerdote|inquisidor/, 'acolito'],
  [/guardia|capitan|soldado|qilaat|centinela|veterano|recaudador/, 'guardia'],
  [/^(un|una) |vecin|minero|criada|sirvienta|capataz|ladron|nomada|linyera|escriba|el cojo|mercader|tabernero|posadero/, 'vecino'],
];
export function portraitIdFor(who: string): string | null {
  const n = norm(who); for (const [re, id] of BY_NAME) if (re.test(n)) return id; return null;
}
/** Expresión a partir del texto de tono («furioso», «casi en un susurro», «sin sonreír»…). */
export function exprFor(tone?: string): Expr {
  if (!tone) return 'neutral';
  // «sin dejar de sonreír» sigue sonriendo; «sin sonreír», «sin burla» niegan la palabra que sigue
  const t = norm(tone).replace(/sin dejar de /g, '').replace(/\bsin (\w+)/g, '');
  if (/furi|grit|\bira\b|iracund|rabia|colera|enfurec|ruge|rugi|escupe|amenaz|apret\w* los dientes|feroz|brusc/.test(t)) return 'enojo';
  if (/sorprend|asombr|atonit|estupefact|boquiabiert|pasmad|incredul|sobresalt|de golpe|abre los ojos/.test(t)) return 'sorpresa';
  if (/llor|trist|susurr|cansad|tiembl|derrumb|lagrim|quebr|abatid|dolor|inaudible|muy baja|a media voz|apenas|tragando saliva|vencid|sollo/.test(t)) return 'tristeza';
  if (/sonri|sonrie|\brie\b|riendo|\brisa|risita|burl|divertid|ironi|carcaj|amable|complacid/.test(t)) return 'sonrisa';
  return 'neutral';
}
/** Retrato en pixel art para un hablante (nombre tal como aparece en los diálogos) y un tono. */
export function pixPortrait(who: string, tone?: string): string | null {
  const id = portraitIdFor(who); return id ? pixPortraitUrl(id, exprFor(tone)) : null;
}
