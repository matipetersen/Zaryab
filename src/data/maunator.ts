// «El Inventario de Maunator» — operación de infiltración adaptada a Zaryab (ver docs/MAUNATOR.md).
import type { MonsterDef, MapDef, Mods } from '../engine/types';

const m = (str: number, dex: number, con: number, int: number, wis: number, cha: number): Mods => ({ str, dex, con, int, wis, cha });

// ───────────────────────── Bestiario ─────────────────────────
export const MAUNATOR_MONSTERS: Record<string, MonsterDef> = {
  guardia_consulado: {
    id: 'guardia_consulado', name: 'Guardia de Élite Thayano', type: 'humanoide', cr: '3', hp: 75, ac: 17, speed: 30, mods: m(3, 2, 3, 0, 1, 0), prof: 2, condImmune: ['charmed'], traits: ['guard'],
    actions: [{ id: 'espada', name: 'Espada imbuida en fuego', kind: 'melee', toHit: 6, reach: 1, dmg: [{ dice: '1d8+3', type: 'slashing' }, { dice: '1d6', type: 'fire' }] }],
    multiattack: ['espada', 'espada'], xp: 700, color: '#a33a3a', glyph: 'G', sprite: 'humanoid', lore: 'Tatuajes rojos de Thay que los vuelven inmunes al hechizo. Vigilan sin hablar.',
  },
  veterano_consulado: {
    id: 'veterano_consulado', name: 'Soldado Veterano', type: 'humanoide', cr: '2', hp: 45, ac: 16, speed: 30, mods: m(3, 1, 2, 0, 1, 0), prof: 2, traits: ['guard'],
    actions: [{ id: 'hacha', name: 'Hacha de guerra', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d10+3', type: 'slashing' }] }], xp: 450, color: '#b86a4a', glyph: 'S', sprite: 'humanoid', lore: 'Veteranos de la Guardia del Consulado. Alguien firma notas con «S.».',
  },
  zombi_elite: {
    id: 'zombi_elite', name: 'Zombi de Élite', type: 'no-muerto', cr: '1', hp: 45, ac: 8, speed: 20, mods: m(3, -2, 3, -4, -2, -3), prof: 2, undead: true, immune: ['poison'], traits: ['zombieFort'],
    actions: [{ id: 'golpe', name: 'Golpe torpe', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d8+3', type: 'bludgeoning' }] }], xp: 200, color: '#7a8a5a', glyph: 'Z', sprite: 'undead', lore: 'Se queda en pie cuando debería caer.',
  },
  guardian_runico: {
    id: 'guardian_runico', name: 'Guardián Rúnico', type: 'constructo', cr: '4', hp: 85, ac: 17, speed: 25, mods: m(4, 0, 4, -4, 0, -4), prof: 2, immune: ['poison', 'psychic'], condImmune: ['charmed', 'frightened', 'paralyzed'], traits: ['absorbSpell', 'dormant', 'guardianR'],
    actions: [{ id: 'puno', name: 'Puño de Runas', kind: 'melee', toHit: 6, reach: 1, dmg: [{ dice: '2d8+4', type: 'bludgeoning' }, { dice: '1d6', type: 'force' }] }], multiattack: ['puno', 'puno'], xp: 1100, color: '#9a8fd0', glyph: 'R', sprite: 'construct',
    lore: 'Absorbe conjuros de nivel 3 o menor. Ataca en silencio cuando se retira un objeto de la mesa.',
  },
  golem_carne: {
    id: 'golem_carne', name: 'Golem de Carne', type: 'constructo', cr: '5', hp: 93, ac: 9, speed: 30, mods: m(4, -1, 4, -4, 0, -5), prof: 3, immune: ['poison', 'lightning'], condImmune: ['charmed', 'frightened', 'paralyzed', 'poisoned'], traits: ['dormant', 'woundCurse', 'frenzy'],
    actions: [{ id: 'golpe', name: 'Golpe', kind: 'melee', toHit: 7, reach: 1, dmg: [{ dice: '2d8+4', type: 'bludgeoning' }] }], multiattack: ['golpe', 'golpe'], xp: 1800, color: '#a8744a', glyph: 'F', sprite: 'construct',
    lore: 'Cosido con trozos de prisioneros. Su primer golpe deja una Maldición de Herida que impide curar. Bajo sus pies, una calavera.',
  },
  aprendiz: {
    id: 'aprendiz', name: 'Aprendiz de Thay', type: 'humanoide', cr: '2', hp: 22, ac: 13, speed: 30, mods: m(-1, 2, 1, 3, 1, 0), prof: 2, traits: ['guard', 'apprentice'],
    actions: [
      { id: 'proyectil', name: 'Proyectil Mágico', kind: 'ranged', toHit: 5, reach: 12, dmg: [{ dice: '3d4+3', type: 'force' }] },
      { id: 'alarma', name: 'Alarma', kind: 'buff', reach: 0, note: 'alarma' },
    ], xp: 450, color: '#d68a3a', glyph: 'a', sprite: 'humanoid', lore: 'Humano de 22 años. Metódico, sin culpa. Si ve intrusos, lanza Alarma.',
  },
  sujeto_c1: {
    id: 'sujeto_c1', name: 'Sujeto 3', type: 'humanoide', cr: '0', hp: 14, ac: 8, speed: 20, mods: m(0, -1, 0, 0, 0, 0), prof: 2, traits: ['inert'],
    actions: [], xp: 0, color: '#b8a89a', glyph: '†', sprite: 'humanoid', lore: 'Se transforma en no-muerto sobre la mesa. «Me pusieron algo adentro.» La calavera 3 está cosida a su torso.',
  },
  seraphel: {
    id: 'seraphel', name: 'Seraphel, Hija del Simurg', type: 'humanoide', cr: '3', hp: 38, ac: 13, speed: 30, mods: m(0, 2, 1, 1, 4, 2), prof: 2, traits: ['inert'],
    actions: [
      { id: 'maza', name: 'Maza de luz', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '1d6+2', type: 'radiant' }] },
      { id: 'curar', name: 'Curar Heridas', kind: 'heal', reach: 1, heal: '3d8+4', recharge: 4 },
    ], xp: 0, color: '#e8d8a0', glyph: 'S', sprite: 'humanoid', lore: 'Prisionera en una jaula de plata. Habla primero y sabe de D4 y de la barcaza.',
  },
  grethak: {
    id: 'grethak', name: 'Grethak', type: 'humanoide', cr: '2', hp: 45, ac: 15, speed: 30, mods: m(3, 1, 2, 0, 1, 0), prof: 2, traits: ['inert', 'grethak'],
    actions: [{ id: 'espada', name: 'Espada corta', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d8+3', type: 'slashing' }] }], multiattack: ['espada', 'espada'], xp: 0, color: '#6a8a4a', glyph: 'g', sprite: 'humanoid',
    lore: '«Yo no sabía lo que había abajo. O me dije que no lo sabía. No sé cuál de las dos cosas es peor.»',
  },
  quasi_deva: {
    id: 'quasi_deva', name: 'Quasi-Deva Corrupto', type: 'celestial', cr: '5', hp: 70, ac: 14, speed: 30, fly: 30, mods: m(3, 2, 3, 0, 2, 1), prof: 3, immune: ['radiant'], traits: ['dormant', 'wakeAlarm'],
    actions: [
      { id: 'toque', name: 'Toque Corrupto', kind: 'melee', toHit: 6, reach: 1, dmg: [{ dice: '2d8+3', type: 'necrotic' }] },
      { id: 'luz', name: 'Luz Rota', kind: 'save', reach: 0, aoe: 3, aoeSelf: true, dmg: [{ dice: '3d6', type: 'radiant' }], half: true, save: { ab: 'con', dc: 14, cond: 'blinded', turns: 1 }, recharge: 5 },
    ], xp: 1800, color: '#d8d0e0', glyph: 'Q', sprite: 'djinn', lore: 'Un celestial menor vaciado desde dentro: pierde la fe sin morir. «Un dios que no puede ver, no puede juzgar.»',
  },
  fragmento_fe: {
    id: 'fragmento_fe', name: 'Fragmento de Fe', type: 'celestial', cr: '1', hp: 20, ac: 12, speed: 30, fly: 30, mods: m(-2, 2, 0, 0, 1, 0), prof: 2, traits: ['dormant', 'wakeAlarm'],
    actions: [{ id: 'chispa', name: 'Chispa de luz', kind: 'ranged', toHit: 4, reach: 8, dmg: [{ dice: '2d6', type: 'radiant' }] }], xp: 200, color: '#f0e6b0', glyph: 'f', sprite: 'djinn',
  },
  esclavo: {
    id: 'esclavo', name: 'Esclavo liberado', type: 'humanoide', cr: '0', hp: 6, ac: 10, speed: 30, mods: m(0, 0, 0, 0, 0, 0), prof: 2, actions: [{ id: 'puno', name: 'Puñetazo', kind: 'melee', toHit: 2, reach: 1, dmg: [{ dice: '1d3', type: 'bludgeoning' }] }], xp: 0, color: '#b89a7a', glyph: 'e', sprite: 'humanoid',
  },
  varreth: {
    id: 'varreth', name: 'Varreth, Mago Rojo', type: 'humanoide', cr: '4', hp: 38, ac: 15, speed: 30, mods: m(-1, 2, 1, 4, 2, 1), prof: 2,
    actions: [
      { id: 'proyectil', name: 'Proyectil Mágico', kind: 'ranged', toHit: 6, reach: 12, dmg: [{ dice: '3d4+3', type: 'force' }] },
      { id: 'bola', name: 'Bola de Fuego', kind: 'save', reach: 10, aoe: 2, dmg: [{ dice: '8d6', type: 'fire' }], half: true, save: { ab: 'dex', dc: 14 }, recharge: 5 },
    ], xp: 1100, color: '#c0392b', glyph: 'V', sprite: 'humanoid', lore: '28 años, primer encargo. No sabe nada del Cubo. Si lo despiertan, grita.',
  },
  kethras: {
    id: 'kethras', name: 'Kethras, Mago Rojo de Thay', type: 'humanoide', cr: '9', hp: 99, ac: 15, speed: 30, mods: m(-1, 2, 1, 5, 2, 0), prof: 4, condImmune: ['charmed'], traits: ['capture'],
    actions: [
      { id: 'rayo', name: 'Rayo de Frío', kind: 'ranged', toHit: 9, reach: 12, dmg: [{ dice: '4d6', type: 'cold' }] },
      { id: 'bola', name: 'Bola de Fuego potenciada', kind: 'save', reach: 12, aoe: 3, dmg: [{ dice: '8d6', type: 'fire' }], half: true, save: { ab: 'dex', dc: 17 }, recharge: 5 },
      { id: 'cono', name: 'Cono de Frío', kind: 'save', reach: 0, aoe: 4, aoeSelf: true, dmg: [{ dice: '8d8', type: 'cold' }], half: true, save: { ab: 'con', dc: 17 }, recharge: 6 },
    ], multiattack: ['rayo', 'rayo'], xp: 5000, color: '#9a2a2a', glyph: 'K', sprite: 'humanoid',
    lore: 'Prioriza capturar sobre matar. No odia a nadie: trata a los dioses como variables. Negociable con el tomo como palanca.',
  },
  black_pudding: {
    id: 'black_pudding', name: 'Pudin Negro (sirviente de El Que Acecha)', type: 'cieno', cr: '4', hp: 85, ac: 7, speed: 20, mods: m(3, -3, 3, -5, -2, -5), prof: 2, size: 2,
    immune: ['acid', 'cold', 'lightning'], condImmune: ['blinded', 'charmed', 'deafened' as any, 'frightened', 'prone', 'paralyzed', 'stunned'] as any, traits: ['acidBody', 'corrosion', 'split'],
    actions: [{ id: 'seudopodo', name: 'Seudópodo', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d6+3', type: 'bludgeoning' }, { dice: '4d8', type: 'acid' }] }], xp: 1100, color: '#2a2a3a', glyph: 'P', sprite: 'beast',
    lore: 'Corroe las armas, se parte al cortarlo y devuelve ácido a quien lo golpea. No distingue bandos: avanza hacia el movimiento y la luz.',
  },
};

// ───────────────────────── Cubo de Maunator: 4×4 salas de 6×6 ─────────────────────────
const S = 6; export const CUBE_W = S * 4;
interface Foe { x: number; y: number; id: string; suffix?: string }
interface RoomDef { id: string; name: string; doors: string; interior: string[]; foes?: Foe[]; objs?: { x: number; y: number; id: string }[]; pcs?: boolean; wave?: boolean }
const R = (id: string, name: string, doors: string, interior: string[], extra: Partial<RoomDef> = {}): RoomDef => ({ id, name, doors, interior, ...extra });
/** doors: letras N E S O (O = oeste) */
export const ROOMS: RoomDef[] = [
  R('A1', 'Entrada y control', 'ES', ['....', '.cc.', '....', '....'], { foes: [{ x: 1, y: 1, id: 'guardia_consulado', suffix: ' I' }, { x: 2, y: 1, id: 'guardia_consulado', suffix: ' II' }], objs: [{ x: 0, y: 3, id: 'registro' }] }),
  R('A2', 'Corredor de marcas', 'EO', ['....', '....', '....', '....'], { pcs: true }),
  R('A3', 'Sala de guardia', 'OES', ['....', '.cc.', '....', '....'], { foes: [{ x: 0, y: 0, id: 'veterano_consulado' }, { x: 1, y: 0, id: 'veterano_consulado' }, { x: 2, y: 0, id: 'veterano_consulado', suffix: ' (Sigmund)' }, { x: 3, y: 0, id: 'veterano_consulado' }], objs: [{ x: 1, y: 3, id: 'tablero' }] }),
  R('A4', 'Sala trampa', 'OS', ['....', '....', '..,.', '....'], { foes: [{ x: 2, y: 2, id: 'zombi_elite' }], objs: [{ x: 1, y: 1, id: 'glifo' }] }),
  R('B1', 'Altar del Silencio', 'NE', ['.c.c', '....', '.c.c', '....'], { objs: [{ x: 1, y: 1, id: 'calavera1' }] }),
  R('B2', 'Archivo', 'OS', ['CCCC', '....', 'CCCC', '....'], { foes: [{ x: 3, y: 1, id: 'guardian_runico' }], objs: [{ x: 0, y: 1, id: 'tomo' }, { x: 2, y: 1, id: 'cuadernos' }, { x: 1, y: 3, id: 'diario' }] }),
  R('B3', 'Espejo del Silencio', 'NE', ['....', '....', '....', '.o..'], { objs: [{ x: 2, y: 0, id: 'espejo' }] }),
  R('B4', 'Patrulla', 'ON', ['....', '.c..', '....', '....'], { foes: [{ x: 0, y: 1, id: 'guardia_consulado', suffix: ' (veterano)' }, { x: 3, y: 1, id: 'guardia_consulado', suffix: ' (veterano II)' }, { x: 1, y: 3, id: 'zombi_elite' }], objs: [{ x: 2, y: 3, id: 'tabla' }] }),
  R('C1', 'Experimentación', 'ES', ['....', '.cc.', '....', '....'], { foes: [{ x: 1, y: 2, id: 'aprendiz' }, { x: 2, y: 1, id: 'sujeto_c1' }], objs: [{ x: 2, y: 2, id: 'calavera3' }] }),
  R('C2', 'Prisionero', 'NOE', ['....', '....', '....', '....'], { foes: [{ x: 2, y: 1, id: 'seraphel' }], objs: [{ x: 2, y: 2, id: 'jaula' }] }),
  R('C3', 'Sala del Golem', 'OSE', ['....', '.o..', '....', '....'], { foes: [{ x: 1, y: 1, id: 'golem_carne' }], objs: [{ x: 2, y: 2, id: 'calavera2' }] }),
  R('C4', 'Almacén', 'O', ['c.c.', '....', '....', '.c.c'], { wave: false, objs: [{ x: 0, y: 1, id: 'pociones' }, { x: 3, y: 1, id: 'esclavos' }, { x: 2, y: 3, id: 'medallon4' }] }),
  R('D1', 'Cuartel de esclavos', 'NE', ['....', '.c..', '....', '....'], { foes: [{ x: 2, y: 2, id: 'grethak' }], objs: [{ x: 1, y: 2, id: 'grethak_hablar' }] }),
  R('D2', 'Cruce', 'OE', ['....', '....', '....', '....'], { wave: true, objs: [{ x: 1, y: 3, id: 'compuerta' }] }),
  R('D3', 'Laboratorio', 'NOE', ['.o..', '....', '.CC.', '....'], { foes: [{ x: 1, y: 1, id: 'quasi_deva' }, { x: 2, y: 1, id: 'fragmento_fe' }, { x: 0, y: 3, id: 'fragmento_fe' }], objs: [{ x: 3, y: 1, id: 'sello_helm' }, { x: 3, y: 3, id: 'nota_d3' }] }),
  R('D4', 'La Salida', 'O', ['....', '....', '....', '....'], { objs: [{ x: 3, y: 2, id: 'salida' }] }),
];
/** Secuencia de 8 rotaciones: [fila|col, índice 0-3, sentido ±1]. */
export const ROT_SEQ: { k: 'fila' | 'col'; i: number; d: 1 | -1; label: string }[] = [
  { k: 'fila', i: 1, d: 1, label: 'Fila B → derecha' }, { k: 'col', i: 2, d: 1, label: 'Columna 3 ↓ abajo' }, { k: 'fila', i: 3, d: -1, label: 'Fila D ← izquierda' }, { k: 'col', i: 0, d: -1, label: 'Columna 1 ↑ arriba' },
  { k: 'fila', i: 0, d: 1, label: 'Fila A → derecha' }, { k: 'col', i: 1, d: -1, label: 'Columna 2 ↑ arriba' }, { k: 'fila', i: 2, d: -1, label: 'Fila C ← izquierda' }, { k: 'col', i: 3, d: 1, label: 'Columna 4 ↓ abajo' },
];
export interface BuiltMap { rows: string[]; foes: { x: number; y: number; id: string; suffix?: string }[]; objs: { x: number; y: number; id: string }[]; waves: { x: number; y: number }[] }
export function buildCube(): BuiltMap {
  const g: string[][] = Array.from({ length: CUBE_W }, () => Array(CUBE_W).fill('.'));
  const foes: BuiltMap['foes'] = [], objs: BuiltMap['objs'] = [], waves: BuiltMap['waves'] = [];
  ROOMS.forEach((r, idx) => {
    const ox = (idx % 4) * S, oy = Math.floor(idx / 4) * S;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const edge = x === 0 || y === 0 || x === S - 1 || y === S - 1; let ch = edge ? 'x' : (r.interior[y - 1]?.[x - 1] ?? '.');
      if (edge) { const door = (y === 0 && x === 2 && r.doors.includes('N')) || (y === S - 1 && x === 2 && r.doors.includes('S')) || (x === 0 && y === 2 && r.doors.includes('O')) || (x === S - 1 && y === 2 && r.doors.includes('E')); if (door) ch = '.'; }
      g[oy + y][ox + x] = ch;
    }
    for (const f of r.foes ?? []) foes.push({ x: ox + 1 + f.x, y: oy + 1 + f.y, id: f.id, suffix: f.suffix });
    for (const o of r.objs ?? []) objs.push({ x: ox + 1 + o.x, y: oy + 1 + o.y, id: o.id });
    if (r.wave) waves.push({ x: ox + 2, y: oy + 2 });
    if (r.pcs) { const pos: [number, number][] = [[0, 3], [1, 3], [2, 3], [3, 3], [0, 2], [3, 2]]; pos.forEach(([x, y], i) => { g[oy + 1 + y][ox + 1 + x] = String(i + 1); }); }
  });
  // pozo central fijo (A0): 2×2 de agua en el centro del tablero
  for (const [x, y] of [[11, 11], [12, 11], [11, 12], [12, 12]]) g[y][x] = '~';
  // marcadores de enemigos en orden de lectura (y, x) → el índice es el slot
  const ordered = [...foes].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const f of ordered) g[f.y][f.x] = 'e';
  for (const w of waves) g[w.y][w.x] = 'w';
  return { rows: g.map(r => r.join('')), foes: ordered, objs, waves };
}
export const CUBE = buildCube();
export const A0_TILES: [number, number][] = [[11, 11], [12, 11], [11, 12], [12, 12]];

export const MAUNATOR_MAPS: Record<string, MapDef> = {
  cubo_maunator: { id: 'cubo_maunator', name: 'El Cubo de Maunator', theme: 'sanctum', objective: 'Encuentra el tomo (Archivo) y las tres calaveras (Altar, Golem, Sujeto) y llega a La Salida. El Cubo rota: cada sala viaja con sus puertas.', rows: CUBE.rows, objs: CUBE.objs },
  d4_salida: { id: 'd4_salida', name: 'D4 · La Salida', theme: 'sanctum', objective: 'Aguanta 3 rondas mientras la puerta se abre. Kethras y el Pudin ya vienen.',
    rows: ['xxxxxxxxxxxx', 'x..........x', 'x.1.2.3....x', 'x.4.5.6....x', 'x..........x', 'x....cc....x', 'x.e.....e..x', 'x..........x', 'x.w......w.x', 'xxxxxxxxxxxx'] },
  tuneles_a: { id: 'tuneles_a', name: 'Túneles pre-Simurg · Z1–Z4', theme: 'mine', objective: 'Corre hacia la bifurcación. Kethras os sigue: cuidado con el fuego.',
    rows: ['#####*.#####', '#....,.....#', '#..........#', '#.,..cc....#', '#...........', '#...,.......', '#.....o.....', '#....##.....', '#...........', '#..,........', '#...........', '#.1.2.3.4.5.', '#.w.6.......', '############'] },
  tuneles_b: { id: 'tuneles_b', name: 'Túneles pre-Simurg · Z5–Z6', theme: 'mine', objective: 'Llega a la reja. El Pudin os persigue: no pelees en el túnel estrecho.',
    rows: ['####*..*####', '#....e.....#', '#..........#', '#.,........#', '#..........#', '#....##....#', '#...........', '#..,........', '#...........', '#.1.2.3.4.5.', '#.w.6.......', '############'] },
};

// Aliados que se liberan en el Cubo y siguen en D4 (sin el rasgo «inerte»)
MAUNATOR_MONSTERS.seraphel_aliada = { ...MAUNATOR_MONSTERS.seraphel, id: 'seraphel_aliada', traits: [] };
MAUNATOR_MONSTERS.grethak_aliado = { ...MAUNATOR_MONSTERS.grethak, id: 'grethak_aliado', traits: [] };
