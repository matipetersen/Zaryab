// Sistema de niveles (1→15) y evolución de arquetipos para los seis personajes, basado en D&D 5e.
import type { Mods, Unit, DmgPart } from '../engine/types';
import type { PCDef } from './party';
import { addFlat } from '../engine/dice';

export type Ab = keyof Mods;
export interface Patch {
  mods?: Partial<Mods>; ac?: number; speed?: number; init?: number; saves?: number; saveProf?: Ab[];
  weaponHit?: number; weaponDmg?: number; extraDmg?: { dice: string; type: DmgPart['type']; applies?: 'melee' | 'ranged' | 'all' };
  attacks?: number; abilities?: string[]; traits?: string[]; resist?: string[]; immune?: string[]; condImmune?: string[]; res?: Record<string, number>; fly?: boolean; spellDC?: number; hpPerLevel?: number;
}
export interface Feat { id: string; name: string; desc: string; patch?: Patch }
export interface Option extends Feat { path: 'luz' | 'sombra' | 'neutro'; need?: { d?: number; c?: number } }
export interface Tier { level: number; title: string; options: Option[] }
export interface Track {
  klass: string; hitDie: number; spellAb?: Ab; asi: number[]; weaponAb: { melee: Ab; ranged: Ab }; unarmoredDex?: boolean;
  paths: { luz: string; sombra: string; neutro: string };
  slots: Record<number, Record<string, number>>; res: Record<number, Record<string, number>>;
  auto: Record<number, Feat[]>; tiers: Tier[];
}

// ───── experiencia ─────
export const XP_TABLE: Record<number, number> = { 1: 0, 2: 120, 3: 400, 4: 1100, 5: 2500, 6: 8000, 7: 12000, 8: 16000, 9: 20500, 10: 25000, 11: 29000, 12: 33000, 13: 37500, 14: 42000, 15: 47000 };
export const MAX_LEVEL = 15;
/** Tope de nivel por acto (como en Tactics Ogre: la historia marca el ritmo). */
export function levelCap(flags: string[]): number { const h = (f: string) => flags.includes(f); return h('cap10_done') ? 15 : h('cap5_done') ? 10 : h('cap2_done') ? 5 : h('cap1_done') ? 3 : h('cap0_done') ? 2 : 1; }
/** Experiencia mínima garantizada al cerrar cada capítulo: resolver un jefe hablando, sigilo o sacrificio también hace crecer a la compañía.
 *  Es el nivel de diseño del próximo jefe menos uno, así que esquivar combates cuesta (≈ −7 %/nivel) pero no deja al grupo sin chances. */
export const MILESTONE_XP: [string, number][] = [['cap4_done', 1100], ['cap5_done', 2500], ['cap6_done', 8000], ['cap7_done', 16000], ['cap9_done', 20500], ['cap10_done', 25000], ['cap11_done', 33000], ['cap12_done', 37500]];
export function levelForXp(xp: number): number { let l = 1; for (let k = 2; k <= MAX_LEVEL; k++) if (xp >= XP_TABLE[k]) l = k; return l; }
export const profBonus = (level: number) => 2 + Math.floor((level - 1) / 4);

const F = (id: string, name: string, desc: string, patch?: Patch): Feat => ({ id, name, desc, patch });
const O = (path: Option['path'], id: string, name: string, desc: string, patch?: Patch, need?: Option['need']): Option => ({ id, name, desc, patch, path, need });
/** Opción neutra de cada nivel de evolución: siempre disponible, más modesta. */
const NEUTRO = (lv: number): Option => O('neutro', `n${lv}`, 'Camino del Equilibrio', lv === 5 ? '+1 a todas las salvaciones.' : lv === 9 ? '+1 CA y +2 PG por nivel.' : '+1 a ataque y +2 PG por nivel.', lv === 5 ? { saves: 1 } : lv === 9 ? { ac: 1, hpPerLevel: 2 } : { weaponHit: 1, hpPerLevel: 2 });

// ───── dotes disponibles en los niveles de mejora de característica ─────
export const FEATS: Feat[] = [
  F('tough', 'Duro', '+2 PG por nivel.', { hpPerLevel: 2 }),
  F('alert', 'Alerta', '+5 a la iniciativa.', { init: 5 }),
  F('mobile', 'Móvil', '+2 casillas de movimiento.', { speed: 2 }),
  F('warcaster', 'Lanzador de Guerra', 'Ventaja en las salvaciones de concentración.', { traits: ['warCaster'] }),
  F('resilient', 'Resistente', '+1 a todas las salvaciones.', { saves: 1 }),
];
export const ASI_ABS: Ab[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// ───── tablas de espacios de conjuro ─────
const slots = (...n: number[]) => Object.fromEntries(n.map((c, i) => ['slot' + (i + 1), c]));
const FULL: Record<number, Record<string, number>> = { 4: slots(4, 3), 5: slots(4, 3, 2), 6: slots(4, 3, 3), 7: slots(4, 3, 3, 1), 8: slots(4, 3, 3, 2), 9: slots(4, 3, 3, 3, 1), 10: slots(4, 3, 3, 3, 2), 11: slots(4, 3, 3, 3, 2, 1), 12: slots(4, 3, 3, 3, 2, 1), 13: slots(4, 3, 3, 3, 2, 1, 1), 14: slots(4, 3, 3, 3, 2, 1, 1), 15: slots(4, 3, 3, 3, 2, 1, 1, 1) };
const HALF: Record<number, Record<string, number>> = { 4: slots(3), 5: slots(4, 2), 6: slots(4, 2), 7: slots(4, 3), 8: slots(4, 3), 9: slots(4, 3, 2), 10: slots(4, 3, 2), 11: slots(4, 3, 3), 12: slots(4, 3, 3), 13: slots(4, 3, 3, 1), 14: slots(4, 3, 3, 1), 15: slots(4, 3, 3, 2) };
const pact = (n: number, lv: number) => ({ slot1: 0, slot2: 0, slot3: 0, slot4: 0, slot5: 0, ['slot' + lv]: n });
const WARLOCK: Record<number, Record<string, number>> = { 4: pact(2, 2), 5: pact(2, 3), 6: pact(2, 3), 7: pact(2, 4), 8: pact(2, 4), 9: pact(2, 5), 10: pact(2, 5), 11: pact(3, 5), 12: pact(3, 5), 13: pact(3, 5), 14: pact(3, 5), 15: pact(3, 5) };

// ───── Romain · Clérigo (Dominio de la Tumba) ─────
const ROMAIN: Track = {
  klass: 'Clérigo (Dominio de la Tumba)', hitDie: 8, spellAb: 'wis', asi: [4, 8, 12], weaponAb: { melee: 'str', ranged: 'dex' },
  paths: { luz: 'Guardián de Almas', sombra: 'Verdugo de la Balanza', neutro: 'Siervo del Equilibrio' },
  slots: FULL, res: { 6: { channel: 2 }, 10: { juicio: 1 } },
  auto: {
    4: [F('r4', 'Llama Sagrada', 'Truco: 1d8 radiante a distancia (DES).', { abilities: ['sacred_flame'] })],
    5: [F('r5', 'Guardianes Espirituales y Revivir', 'Conjuros de 3.er nivel. Destruir no-muertos mejora.', { abilities: ['spirit_guardians', 'revivify'] })],
    6: [F('r6', 'Canalizar Divinidad (2)', 'Dos usos de Canalizar Divinidad por descanso.')],
    7: [F('r7', 'Destierro y Protección contra la Muerte', 'Conjuros de 4.º nivel.', { abilities: ['banishment', 'death_ward'] })],
    8: [F('r8', 'Golpe Divino', '+1d8 necrótico a tu primer golpe cada turno.', { traits: ['divineStrike'] })],
    9: [F('r9', 'Curar en Masa y Golpe de Llamas', 'Conjuros de 5.º nivel.', { abilities: ['mass_cure_wounds', 'flame_strike'] })],
    10: [F('r10', 'Intervención Divina', 'Obtenés Juicio Final (1/día).', { abilities: ['juicio_final'] })],
    11: [F('r11', 'Sanar', 'Conjuro de 6.º nivel.', { abilities: ['heal_spell'] })],
    13: [F('r13', 'Mente Consagrada', '+1 a todas las salvaciones.', { saves: 1 })],
    14: [F('r14', 'Golpe Divino mejorado', 'El Golpe Divino pasa a 2d8.')],
    15: [F('r15', 'Centinela de la Muerte', 'Resistencia al daño necrótico.', { resist: ['necrotic'] })],
  },
  tiers: [
    { level: 5, title: 'Primera evolución', options: [
      O('luz', 'rl5', 'Luz del Simurg', 'Tus curas suman un dado extra.', { traits: ['luzMejorada'] }, { d: 2 }),
      O('sombra', 'rs5', 'Toque Mortal', 'Tus conjuros necróticos suman +1d8.', { traits: ['necroBoost'] }, { c: 2 }), NEUTRO(5)] },
    { level: 9, title: 'Segunda evolución', options: [
      O('luz', 'rl9', 'Aura de Vida', 'Aliados a 2 casillas recuperan PG al empezar su turno.', { traits: ['auraVida'] }, { d: 4 }),
      O('sombra', 'rs9', 'Aura de Sombra', 'Los enemigos a 2 casillas sufren daño necrótico al empezar su turno.', { traits: ['auraSombra'] }, { c: 4 }), NEUTRO(9)] },
    { level: 13, title: 'Evolución final', options: [
      O('luz', 'rl13', 'Santo de Zaryab', 'Resistencia radiante y necrótica, +2 salvaciones.', { resist: ['radiant', 'necrotic'], saves: 2 }, { d: 6 }),
      O('sombra', 'rs13', 'Juez de Almas', 'Juicio Final adicional y +1d6 necrótico a tus golpes.', { res: { juicio: 1 }, extraDmg: { dice: '1d6', type: 'necrotic', applies: 'melee' } }, { c: 6 }), NEUTRO(13)] },
  ],
};

// ───── Pact Risen · Guerrero (Maestro de Batalla) ─────
const PACT: Track = {
  klass: 'Guerrero (Maestro de Batalla)', hitDie: 10, asi: [4, 6, 8, 12, 14], weaponAb: { melee: 'str', ranged: 'dex' },
  paths: { luz: 'Caballero de Azuran', sombra: 'Caballero de Obsidiana', neutro: 'Juez Imparcial' },
  slots: {}, res: { 7: { sd: 5 }, 9: { indomitable: 1 }, 13: { indomitable: 2 }, 15: { sd: 6 } },
  auto: {
    5: [F('p5', 'Ataque Extra', 'Atacás dos veces con la acción de Atacar.', { attacks: 1 }), F('p5b', 'Maniobras: Derribo y Amenaza', 'Dos maniobras nuevas.', { abilities: ['trip_attack', 'menacing_attack'] })],
    7: [F('p7', 'Dado de superioridad extra', 'Un dado más (5).')],
    9: [F('p9', 'Indómito', 'Te librás de un estado una vez al día.', { abilities: ['indomitable'] })],
    10: [F('p10', 'Dados de superioridad d10', 'Los dados pasan a d10.', { traits: ['sd10'] })],
    11: [F('p11', 'Ataque Extra (3)', 'Atacás tres veces con la acción de Atacar.', { attacks: 1 })],
    13: [F('p13', 'Indómito (2)', 'Dos usos de Indómito.')],
    15: [F('p15', 'Imparable', 'Un dado de superioridad más (6).')],
  },
  tiers: [
    { level: 5, title: 'Primera evolución', options: [
      O('luz', 'pl5', 'Golpe Radiante', '+1d8 radiante a tu primer golpe cada turno.', { traits: ['radStrike'] }, { d: 2 }),
      O('sombra', 'ps5', 'Filo Caído', '+1d6 necrótico a tus golpes cuerpo a cuerpo.', { extraDmg: { dice: '1d6', type: 'necrotic', applies: 'melee' } }, { c: 2 }), NEUTRO(5)] },
    { level: 9, title: 'Segunda evolución', options: [
      O('luz', 'pl9', 'Aura de Valor', 'Los aliados cercanos se libran del miedo; +1 salvaciones.', { traits: ['auraValor'], saves: 1 }, { d: 4 }),
      O('sombra', 'ps9', 'Corona Invertida', 'Los enemigos a 2 casillas sufren daño necrótico al empezar su turno.', { traits: ['auraSombra'] }, { c: 4 }), NEUTRO(9)] },
    { level: 13, title: 'Evolución final', options: [
      O('luz', 'pl13', 'Alas de Azuran', 'Volás siempre, +2 CA.', { fly: true, ac: 2 }, { d: 6 }),
      O('sombra', 'ps13', 'Alas de Obsidiana', 'Volás siempre y resistís el daño no mágico.', { fly: true, resist: ['slashing', 'piercing', 'bludgeoning'] }, { c: 6 }), NEUTRO(13)] },
  ],
};

// ───── Rabb Locke · Brujo (Hexblade) ─────
const RABB: Track = {
  klass: 'Brujo (Hexblade)', hitDie: 8, spellAb: 'cha', asi: [4, 8, 12], weaponAb: { melee: 'cha', ranged: 'dex' },
  paths: { luz: 'Pactario Libre', sombra: 'Eco del Pacto', neutro: 'Pactario Prudente' },
  slots: WARLOCK, res: { 6: { specter: 1 }, 11: { arc6: 1 }, 13: { arc7: 1 }, 14: { curse: 2 } },
  auto: {
    4: [F('b4', 'Estallido Agónico', 'Tu Estallido Sobrenatural suma tu CAR al daño; Inmovilizar Persona.', { traits: ['agonizing'], abilities: ['hold_person'] })],
    5: [F('b5', 'Ataque Extra (Pacto del Filo)', 'Atacás dos veces; 2 rayos de Estallido; espacios de 3.er nivel.', { attacks: 1, abilities: ['vampiric_touch', 'fear_spell'] })],
    6: [F('b6', 'Espectro Maldito', 'Invocá un espectro aliado (1/día).', { abilities: ['accursed_specter'] })],
    7: [F('b7', 'Marchitar', 'Espacios de 4.º nivel.', { abilities: ['blight'] })],
    9: [F('b9', 'Inmovilizar Monstruo', 'Espacios de 5.º nivel.', { abilities: ['hold_monster'] })],
    10: [F('b10', 'Armadura de Maleficios', 'Tu maldición te protege: +1 CA.', { ac: 1 })],
    11: [F('b11', 'Arcano Místico (6.º)', 'Círculo de Muerte (1/día); 3 rayos de Estallido.', { abilities: ['circle_of_death'] })],
    12: [F('b12', 'Bebedor de Vida', 'Tus golpes suman tu CAR necrótico.', { traits: ['lifedrinker'] })],
    13: [F('b13', 'Arcano Místico (7.º)', 'Dedo de la Muerte (1/día).', { abilities: ['finger_of_death'] })],
    14: [F('b14', 'Maestro de Maleficios', 'Dos usos de Maldición del Hexblade.')],
    15: [F('b15', 'Maestría del Pacto', '+1 a la CD de tus conjuros.', { spellDC: 1 })],
  },
  tiers: [
    { level: 5, title: 'Primera evolución', options: [
      O('luz', 'bl5', 'Voluntad Propia', '+2 a las salvaciones de SAB y CAR.', { saves: 1 }, { d: 2 }),
      O('sombra', 'bs5', 'Eco del Pacto', '+1d6 necrótico a tus golpes con el arma de pacto.', { extraDmg: { dice: '1d6', type: 'necrotic', applies: 'melee' } }, { c: 2 }), NEUTRO(5)] },
    { level: 9, title: 'Segunda evolución', options: [
      O('luz', 'bl9', 'Armadura de Voluntad', '+1 CA y resistencia psíquica.', { ac: 1, resist: ['psychic'] }, { d: 4 }),
      O('sombra', 'bs9', 'Sed del Hexblade', 'Tus golpes y rayos devoran: +1d8 necrótico en melé.', { extraDmg: { dice: '1d8', type: 'necrotic', applies: 'melee' } }, { c: 4 }), NEUTRO(9)] },
    { level: 13, title: 'Evolución final', options: [
      O('luz', 'bl13', 'Pacto Roto', 'Un espacio de 5.º nivel adicional; resistís el daño necrótico.', { res: { slot5: 1 }, resist: ['necrotic'] }, { d: 6 }),
      O('sombra', 'bs13', 'Mil Voces', '+2 a la CD y a los ataques de conjuro; ataque adicional con el arma.', { spellDC: 2, attacks: 1 }, { c: 6 }), NEUTRO(13)] },
  ],
};

// ───── Joren Hell · Explorador (Acechador de la Penumbra) ─────
const JOREN: Track = {
  klass: 'Explorador (Acechador de la Penumbra)', hitDie: 10, spellAb: 'wis', asi: [4, 8, 12], weaponAb: { melee: 'dex', ranged: 'dex' },
  paths: { luz: 'Centinela del Pueblo', sombra: 'Cazador de la Penumbra', neutro: 'Explorador Errante' },
  slots: HALF, res: { 11: { volley: 1 } },
  auto: {
    4: [F('j4', 'Golpe Enredador', 'Conjuro de 1.er nivel.', { abilities: ['ensnaring_strike'] })],
    5: [F('j5', 'Ataque Extra', 'Atacás dos veces con la acción de Atacar.', { attacks: 1, abilities: ['zephyr_strike'] })],
    7: [F('j7', 'Mente de Hierro', 'Competencia en salvaciones de SAB.', { saveProf: ['wis'] })],
    8: [F('j8', 'Paso del Explorador', '+1 casilla de movimiento.', { speed: 1 })],
    9: [F('j9', 'Lluvia de Flechas', 'Conjuro de 3.er nivel.', { abilities: ['conjure_barrage'] })],
    10: [F('j10', 'Esconderse a la Vista', '+2 a la iniciativa.', { init: 2 })],
    11: [F('j11', 'Descarga', 'Atacá con el arco a todos los enemigos de una zona (1/día).', { abilities: ['volley'] })],
    14: [F('j14', 'Desvanecerse', '+2 a la iniciativa.', { init: 2 })],
    15: [F('j15', 'Esquiva en las Sombras', 'Esquiva Asombrosa (reduce a la mitad el primer golpe de cada ronda).', { traits: ['uncanny'] })],
  },
  tiers: [
    { level: 5, title: 'Primera evolución', options: [
      O('luz', 'jl5', 'Ojo de Cazador', '+1 a ataques con arco y +1 al daño.', { weaponHit: 1, weaponDmg: 1 }, { d: 2 }),
      O('sombra', 'js5', 'Penumbra', 'Empezás cada combate invisible hasta que ataques.', { traits: ['capaArena'] }, { c: 2 }), NEUTRO(5)] },
    { level: 9, title: 'Segunda evolución', options: [
      O('luz', 'jl9', 'Paso Ligero', '+2 casillas de movimiento.', { speed: 2 }, { d: 4 }),
      O('sombra', 'js9', 'Acechador Letal', '+1d6 de daño a distancia.', { extraDmg: { dice: '1d6', type: 'piercing', applies: 'ranged' } }, { c: 4 }), NEUTRO(9)] },
    { level: 13, title: 'Evolución final', options: [
      O('luz', 'jl13', 'Centinela del Pueblo', 'Aura de Valor: aliados libres de miedo.', { traits: ['auraValor'] }, { d: 6 }),
      O('sombra', 'js13', 'Sombra Absoluta', '+3 iniciativa y +1d8 de daño a distancia.', { init: 3, extraDmg: { dice: '1d8', type: 'piercing', applies: 'ranged' } }, { c: 6 }), NEUTRO(13)] },
  ],
};

// ───── Zyr'thar · Pícaro (Asesino) ─────
const ZYR: Track = {
  klass: 'Pícaro (Asesino)', hitDie: 8, spellAb: 'cha', asi: [4, 8, 10, 12], weaponAb: { melee: 'dex', ranged: 'dex' }, unarmoredDex: true,
  paths: { luz: 'Guardián del Alba', sombra: 'Cuchillo de Vel\'Shara', neutro: 'Sombra Independiente' },
  slots: {}, res: { 9: { poison: 1 }, 11: { smoke: 1 } },
  auto: {
    5: [F('z5', 'Esquiva Asombrosa', 'Reduce a la mitad el primer golpe de cada ronda. Ataque furtivo 3d6.', { traits: ['uncanny'] })],
    6: [F('z6', 'Pericia', '+1 a ataques.', { weaponHit: 1 })],
    7: [F('z7', 'Evasión', 'Las salvaciones de DES de efectos de área: sin daño si pasás, mitad si fallás.', { traits: ['evasion'] })],
    9: [F('z9', 'Hoja Envenenada', 'Untá tu hoja con veneno (1/día).', { abilities: ['poison_blade'] })],
    11: [F('z11', 'Talento Fiable y Bomba de Humo', 'Bomba de Humo (1/día).', { abilities: ['smoke_bomb'] })],
    13: [F('z13', 'Impostor', '+1 a ataques.', { weaponHit: 1 })],
    14: [F('z14', 'Sentido Ciego', '+2 a la iniciativa.', { init: 2 })],
    15: [F('z15', 'Mente Escurridiza', 'Competencia en salvaciones de SAB.', { saveProf: ['wis'] })],
  },
  tiers: [
    { level: 5, title: 'Primera evolución', options: [
      O('luz', 'zl5', 'Ladrón de Almas Libres', '+1 CA y +1 a salvaciones.', { ac: 1, saves: 1 }, { d: 2 }),
      O('sombra', 'zs5', 'Veneno Lento', '+1d6 de veneno a tus golpes cuerpo a cuerpo.', { extraDmg: { dice: '1d6', type: 'poison', applies: 'melee' } }, { c: 2 }), NEUTRO(5)] },
    { level: 9, title: 'Segunda evolución', options: [
      O('luz', 'zl9', 'Sombra Protectora', 'Aura de Valor: aliados libres de miedo.', { traits: ['auraValor'] }, { d: 4 }),
      O('sombra', 'zs9', 'Mano de Sombra', '+1d6 de daño en cada golpe.', { extraDmg: { dice: '1d6', type: 'slashing', applies: 'all' } }, { c: 4 }), NEUTRO(9)] },
    { level: 13, title: 'Evolución final', options: [
      O('luz', 'zl13', 'Ángel de las Sombras', '+1 CA y resistís el daño no mágico.', { ac: 1, resist: ['slashing', 'piercing', 'bludgeoning'] }, { d: 6 }),
      O('sombra', 'zs13', 'Cuchillos de Vel\'Shara', '+2 a ataques y +2d6 de daño.', { weaponHit: 2, extraDmg: { dice: '2d6', type: 'slashing', applies: 'all' } }, { c: 6 }), NEUTRO(13)] },
  ],
};

// ───── Panchi · Monje ─────
const PANCHI: Track = {
  klass: 'Monje', hitDie: 8, spellAb: 'wis', asi: [4, 8, 12], weaponAb: { melee: 'dex', ranged: 'dex' }, unarmoredDex: true,
  paths: { luz: 'Camino del Puño Abierto', sombra: 'Camino del Puño Cerrado', neutro: 'Camino del Peregrino' },
  slots: {}, res: { 6: { whole: 1 }, 15: { palm: 1 } },
  auto: {
    4: [F('m4', 'Caída Lenta', '+1 casilla de movimiento.', { speed: 1 })],
    5: [F('m5', 'Ataque Extra y Golpe Aturdidor', 'Atacás dos veces; el dado de artes marciales pasa a d8.', { attacks: 1, abilities: ['stunning_strike'] })],
    6: [F('m6', 'Golpes Imbuidos de Ki', '+1 al daño desarmado, +1 casilla de movimiento y Plenitud Corporal.', { weaponDmg: 1, speed: 1, abilities: ['wholeness_of_body'] })],
    7: [F('m7', 'Evasión y Quietud Mental', 'Evasión y no podés ser hechizado ni aterrado.', { traits: ['evasion'], condImmune: ['charmed', 'frightened'] })],
    10: [F('m10', 'Pureza Corporal', 'Inmune al veneno. +1 casilla de movimiento.', { immune: ['poison'], speed: 1 })],
    11: [F('m11', 'Artes marciales d10', 'El dado de artes marciales pasa a d10.')],
    13: [F('m13', 'Lengua del Sol y la Luna', '+1 a todas las salvaciones.', { saves: 1 })],
    14: [F('m14', 'Alma de Diamante', 'Competencia en todas las salvaciones.', { saveProf: ['str', 'dex', 'con', 'int', 'wis', 'cha'] })],
    15: [F('m15', 'Palma Vibrante', 'Una vez al día: 10d10 necrótico a un enemigo.', { abilities: ['quivering_palm'] })],
  },
  tiers: [
    { level: 5, title: 'Primera evolución', options: [
      O('luz', 'ml5', 'Puño Abierto', '+1 salvaciones y +1 casilla de movimiento.', { saves: 1, speed: 1 }, { d: 2 }),
      O('sombra', 'ms5', 'Puño Cerrado', '+2 al daño desarmado.', { weaponDmg: 2 }, { c: 2 }), NEUTRO(5)] },
    { level: 9, title: 'Segunda evolución', options: [
      O('luz', 'ml9', 'Palma Sanadora', 'Aliados a 2 casillas recuperan PG al empezar su turno.', { traits: ['auraVida'] }, { d: 4 }),
      O('sombra', 'ms9', 'Ira Rígida', '+1d6 de fuego a tus golpes desarmados.', { extraDmg: { dice: '1d6', type: 'fire', applies: 'melee' } }, { c: 4 }), NEUTRO(9)] },
    { level: 13, title: 'Evolución final', options: [
      O('luz', 'ml13', 'Corazón de Piedra', '+1 CA y resistís el daño contundente.', { ac: 1, resist: ['bludgeoning'] }, { d: 6 }),
      O('sombra', 'ms13', 'Llama Estancada', '+2d6 de fuego a tus golpes desarmados.', { extraDmg: { dice: '2d6', type: 'fire', applies: 'melee' } }, { c: 6 }), NEUTRO(13)] },
  ],
};

export const TRACKS: Record<string, Track> = { romain: ROMAIN, pact: PACT, rabb: RABB, joren: JOREN, zyrthar: ZYR, panchi: PANCHI };

// ───── decisiones guardadas ─────
// picks: 'asi:4:str+2' (+2 a la puntuación ≈ +1 al modificador) | 'asi:4:feat:tough' | 'tier:5:rl5'
export interface Prog { level: number; picks: string[] }
export const pickKey = (kind: string, level: number) => `${kind}:${level}:`;
export const getPick = (picks: string[], kind: string, level: number) => picks.find(p => p.startsWith(pickKey(kind, level)))?.slice(pickKey(kind, level).length);

export function optionById(pc: string, id: string): Option | undefined { return TRACKS[pc].tiers.flatMap(t => t.options).find(o => o.id === id); }
export function pendingChoices(pc: string, level: number): { asi: boolean; tier?: Tier } {
  const t = TRACKS[pc]; return { asi: t.asi.includes(level), tier: t.tiers.find(x => x.level === level) };
}
export function optionAvailable(o: Option, d: number, c: number): boolean { return !o.need || ((o.need.d ?? 0) <= d && (o.need.c ?? 0) <= c); }
/** Rasgos y opciones obtenidos hasta cierto nivel (para la hoja de personaje). */
/** Rasgos que ganan los niveles 2 y 3 (los ya incluidos en la ficha canónica de nivel 3). */
const EARLY: Record<string, Record<number, [string, string][]>> = {
  romain: { 2: [['Canalizar Divinidad', 'Expulsar no-muertos y Sendero a la Tumba (1 uso).'], ['Más conjuros', 'Un tercer espacio de 1.er nivel.']], 3: [['Conjuros de 2.º nivel', 'Ayuda, Restablecimiento menor y Rayo de debilitamiento.']] },
  pact: { 2: [['Oleada de Acción', 'Una acción adicional por descanso.']], 3: [['Maestro de Batalla', 'Dados de superioridad y Reagrupar.'], ['Alma Radiante', 'Revelación celestial del aasimar.']] },
  rabb: { 2: [['Más espacios de pacto', 'Un segundo espacio de conjuro.']], 3: [['Espacios de 2.º nivel', 'Tus espacios de pacto suben de nivel.']] },
  joren: { 2: [['Lanzamiento de conjuros', 'Marca del Cazador y Curar heridas (2 espacios).']], 3: [['Acechador de la Penumbra', 'Emboscador terrible: iniciativa y ataque extra en la primera ronda.']] },
  zyrthar: { 2: [['Acción Astuta', 'Correr o esconderte como acción adicional.']], 3: [['Asesino', 'Ventaja contra quien aún no actuó; furtivo 2d6.'], ['Magia drow', 'Fuego feérico.']] },
  panchi: { 2: [['Ki y Ráfaga de golpes', 'Ki, Defensa paciente y Paso del viento. +10 pies de movimiento.']], 3: [['Tradición monástica', 'Un punto de ki más.']] },
};
export function featuresUpTo(pc: string, prog: Prog): { level: number; name: string; desc: string; kind: 'auto' | 'path' | 'asi' | 'feat' }[] {
  const t = TRACKS[pc]; const out: { level: number; name: string; desc: string; kind: 'auto' | 'path' | 'asi' | 'feat' }[] = [];
  for (let l = 2; l <= Math.min(3, prog.level); l++) for (const [name, desc] of EARLY[pc]?.[l] ?? []) out.push({ level: l, name, desc, kind: 'auto' });
  for (let l = 4; l <= prog.level; l++) {
    for (const f of t.auto[l] ?? []) out.push({ level: l, name: f.name, desc: f.desc, kind: 'auto' });
    const a = getPick(prog.picks, 'asi', l); if (a) { if (a.startsWith('feat:')) { const f = FEATS.find(x => x.id === a.slice(5)); if (f) out.push({ level: l, name: f.name, desc: f.desc, kind: 'feat' }); } else out.push({ level: l, name: 'Mejora de característica', desc: a.replace(/\+/g, ' +').toUpperCase().replace('STR', 'FUE').replace('DEX', 'DES').replace('WIS', 'SAB').replace('CHA', 'CAR'), kind: 'asi' }); }
    const tp = getPick(prog.picks, 'tier', l); if (tp) { const o = optionById(pc, tp); if (o) out.push({ level: l, name: o.name, desc: o.desc, kind: 'path' }); }
  }
  return out;
}

const merge = (acc: Patch, p?: Patch) => {
  if (!p) return;
  for (const k of ['ac', 'speed', 'init', 'saves', 'weaponHit', 'weaponDmg', 'attacks', 'spellDC', 'hpPerLevel'] as const) if (p[k]) acc[k] = (acc[k] ?? 0) + p[k]!;
  for (const k of ['abilities', 'traits', 'resist', 'immune', 'condImmune', 'saveProf'] as const) if (p[k]) (acc[k] as any) = [...((acc[k] as any) ?? []), ...(p[k] as any[])];
  if (p.mods) { acc.mods ??= {}; for (const [k, v] of Object.entries(p.mods)) acc.mods[k as Ab] = (acc.mods[k as Ab] ?? 0) + (v as number); }
  if (p.res) { acc.res ??= {}; for (const [k, v] of Object.entries(p.res)) acc.res[k] = (acc.res[k] ?? 0) + v; }
  if (p.extraDmg) { (acc as any).extra = [...((acc as any).extra ?? []), p.extraDmg]; }
  if (p.fly) acc.fly = true;
};

/** Calcula el parche acumulado de rasgos automáticos, mejoras y opciones de evolución hasta `prog.level`. */
export function collectPatch(pc: string, prog: Prog): Patch & { extra?: NonNullable<Patch['extraDmg']>[]; asiMods: Partial<Mods> } {
  const t = TRACKS[pc]; const acc: Patch = {}; const asiMods: Partial<Mods> = {};
  for (let l = 4; l <= prog.level; l++) {
    for (const f of t.auto[l] ?? []) merge(acc, f.patch);
    const a = getPick(prog.picks, 'asi', l);
    if (a) {
      if (a.startsWith('feat:')) merge(acc, FEATS.find(f => f.id === a.slice(5))?.patch);
      else for (const part of a.split(',')) { const m = /^(str|dex|con|int|wis|cha)\+(\d)$/.exec(part); if (m) asiMods[m[1] as Ab] = (asiMods[m[1] as Ab] ?? 0) + +m[2]; }
    }
    const tp = getPick(prog.picks, 'tier', l); if (tp) merge(acc, optionById(pc, tp)?.patch);
  }
  return { ...(acc as any), asiMods };
}

/** Fichas de nivel 1 y 2: la ficha canónica es de nivel 3, así que se le quitan PG, recursos y rasgos que aún no tiene. */
const LOW: Record<string, Record<1 | 2, { res: Record<string, number>; drop: string[]; dropTraits?: string[]; speed?: number }>> = {
  romain: { 1: { res: { slot1: 2 }, drop: ['lesser_restoration', 'aid', 'ray_of_enfeeblement', 'turn_undead', 'path_to_grave'] }, 2: { res: { slot1: 3, channel: 1 }, drop: ['lesser_restoration', 'aid', 'ray_of_enfeeblement'] } },
  pact: { 1: { res: { sw: 1, hh: 1 }, drop: ['action_surge', 'rally', 'radiant_soul'] }, 2: { res: { sw: 1, surge: 1, hh: 1 }, drop: ['rally', 'radiant_soul'] } },
  rabb: { 1: { res: { slot1: 1, curse: 1 }, drop: [] }, 2: { res: { slot1: 2, curse: 1 }, drop: [] } },
  joren: { 1: { res: {}, drop: ['hunters_mark', 'cure_wounds'], dropTraits: ['dreadInit'] }, 2: { res: { slot1: 2 }, drop: [], dropTraits: ['dreadInit'] } },
  zyrthar: { 1: { res: {}, drop: ['cunning_dash', 'cunning_disengage', 'faerie_fire'], dropTraits: ['assassinate'] }, 2: { res: {}, drop: ['faerie_fire'], dropTraits: ['assassinate'] } },
  panchi: { 1: { res: { ki: 0 }, drop: ['flurry', 'patient_defense', 'step_of_wind', 'step_disengage'], speed: 5 }, 2: { res: { ki: 2 }, drop: [], speed: 7 } },
};
function applyLow(u: Unit, def: PCDef, L: 1 | 2) {
  const t = TRACKS[def.id]; const lo = LOW[def.id][L];
  u.level = L; u.maxHp = u.hp = def.hp - (3 - L) * (Math.floor(t.hitDie / 2) + 1 + def.mods.con);
  u.res = { ...lo.res }; u.resMax = { ...lo.res };
  u.abilities = u.abilities.filter(a => !lo.drop.includes(a)); u.traits = u.traits.filter(x => !(lo.dropTraits ?? []).includes(x));
  if (lo.speed) u.speed = lo.speed;
}

/** Aplica el nivel y las elecciones a una unidad construida con la ficha de nivel 3. */
export function applyProgression(u: Unit, def: PCDef, prog: Prog) {
  const t = TRACKS[def.id]; const L = Math.max(1, Math.min(MAX_LEVEL, prog.level));
  if (L < 3) { applyLow(u, def, L as 1 | 2); return; }
  if (L === 3 && !prog.picks.length) return;
  const p = collectPatch(def.id, { level: L, picks: prog.picks }) as Patch & { extra?: NonNullable<Patch['extraDmg']>[]; asiMods: Partial<Mods> };
  const prof = profBonus(L); const dProf = prof - 2;
  // ── características: +2 de puntuación ≈ +1 al modificador (las fichas guardan modificadores)
  const dMods: Partial<Mods> = {}; for (const [k, v] of Object.entries(p.asiMods)) dMods[k as Ab] = Math.floor((v as number) / 2);
  for (const [k, v] of Object.entries(p.mods ?? {})) dMods[k as Ab] = (dMods[k as Ab] ?? 0) + (v as number);
  for (const k of Object.keys(dMods) as Ab[]) u.mods[k] += dMods[k]!;
  // ── competencia, salvaciones
  u.level = L; u.prof = prof;
  const profSaves = new Set<Ab>([...def.saveProf, ...(p.saveProf ?? [])]);
  for (const k of Object.keys(u.saves) as Ab[]) u.saves[k] = u.mods[k] + (profSaves.has(k) ? prof : 0) + (p.saves ?? 0);
  // ── PG
  const conBase = def.mods.con, conNow = u.mods.con;
  const gain = (L - 3) * (Math.floor(t.hitDie / 2) + 1 + conNow + (p.hpPerLevel ?? 0)) + (conNow - conBase) * 3;
  u.maxHp = def.hp + Math.max(0, gain); u.hp = u.maxHp;
  // ── defensa, velocidad, iniciativa
  if (t.unarmoredDex) u.ac += (dMods.dex ?? 0);
  u.ac += p.ac ?? 0; u.speed += p.speed ?? 0; u.initBonus = (u.initBonus ?? 0) + (p.init ?? 0) + (dMods.dex ?? 0);
  // ── conjuros
  if (def.spellAb) { const sm = u.mods[def.spellAb]; u.spellMod = sm; u.spellDC = 8 + prof + sm + (p.spellDC ?? 0); u.spellAtk = prof + sm + (p.spellDC ?? 0); }
  // ── armas
  const unarmedDie = L >= 11 ? '1d10' : L >= 5 ? '1d8' : null;
  for (const w of u.weapons) {
    const ab = w.ranged ? t.weaponAb.ranged : t.weaponAb.melee; const dm = dMods[ab] ?? 0; const unarmed = w.id.startsWith('fist');
    w.toHit += dProf + dm + (p.weaponHit ?? 0) + (p.spellDC && ab === t.spellAb ? p.spellDC : 0);
    if (dm + (p.weaponDmg ?? 0)) w.dmg = [{ ...w.dmg[0], dice: addFlat(w.dmg[0].dice, dm + (p.weaponDmg ?? 0)) }, ...w.dmg.slice(1)];
    if (unarmed && unarmedDie) w.dmg = [{ ...w.dmg[0], dice: w.dmg[0].dice.replace(/^1d\d+/, unarmedDie) }, ...w.dmg.slice(1)];
    for (const e of p.extra ?? []) { const ok = !e.applies || e.applies === 'all' || (e.applies === 'melee' && !w.ranged) || (e.applies === 'ranged' && w.ranged); if (ok && !w.bonusAction) w.dmg = [...w.dmg, { dice: e.dice, type: e.type }]; }
  }
  u.extraAtk = (u.extraAtk ?? 0) + (p.attacks ?? 0);
  // ── recursos
  const tab = t.slots[L]; if (tab) for (const [k, v] of Object.entries(tab)) { u.res[k] = v; u.resMax[k] = v; }
  for (let l = 4; l <= L; l++) for (const [k, v] of Object.entries(t.res[l] ?? {})) { u.res[k] = v; u.resMax[k] = v; }
  if (def.id === 'panchi') { u.res['ki'] = L; u.resMax['ki'] = L; }
  for (const [k, v] of Object.entries(p.res ?? {})) { u.res[k] = (u.res[k] ?? 0) + v; u.resMax[k] = u.res[k]; }
  // ── rasgos y habilidades
  for (const a of p.abilities ?? []) if (!u.abilities.includes(a)) u.abilities.push(a);
  for (const tr of p.traits ?? []) if (!u.traits.includes(tr)) u.traits.push(tr);
  if (p.resist) u.resist.push(...(p.resist as any)); if (p.immune) u.immune.push(...(p.immune as any)); if (p.condImmune) u.condImmune.push(...(p.condImmune as any));
  if (p.fly) u.fly = true;
}

export const ASI_DEFAULT: Record<string, Ab> = { romain: 'wis', pact: 'str', rabb: 'cha', joren: 'dex', zyrthar: 'dex', panchi: 'dex' };
/** Elección automática (para pruebas, simulación y el botón «Automático»): ASI al atributo principal y camino según Devoción/Corrupción. */
export function autoPicks(pc: string, level: number, d: number, c: number): string[] {
  const t = TRACKS[pc]; const out: string[] = [];
  if (t.asi.includes(level)) out.push(`asi:${level}:${ASI_DEFAULT[pc]}+2`);
  const tier = t.tiers.find(x => x.level === level);
  if (tier) {
    const want: Option['path'] = d >= c ? 'luz' : 'sombra';
    const ok = tier.options.filter(o => optionAvailable(o, d, c));
    const o = ok.find(x => x.path === want) ?? ok.find(x => x.path !== 'neutro') ?? tier.options.find(x => x.path === 'neutro')!;
    out.push(`tier:${level}:${o.id}`);
  }
  return out;
}
export function progUpTo(pc: string, level: number, d = 5, c = 0): Prog { const picks: string[] = []; for (let l = 4; l <= level; l++) picks.push(...autoPicks(pc, l, d, c)); return { level, picks }; }
/** Factor de dificultad de un encuentro según el nivel del grupo (las escalas de maps.ts están calibradas para nivel 3). */
const ENV = (globalThis as any).process?.env ?? {};
export function levelScale(scale: { hp?: number; atk?: number } | undefined, level: number): { hp: number; atk: number; dmg: number } {
  const hp0 = scale?.hp ?? 1, atk0 = scale?.atk ?? 0; const e = +(ENV.HPEXP ?? 2.2), cap = +(ENV.HPCAP ?? 4), slope = +(ENV.ATKSLOPE ?? 1), ds = +(ENV.DMGSLOPE ?? 0.9);
  const k = level >= 3 ? Math.pow(level / 3, e) : (+(ENV.LOW1 ?? 1.2) + (level - 1) * (+(ENV.LOW2 ?? 1.4) - +(ENV.LOW1 ?? 1.2)));
  return { dmg: scale && level > 3 ? Math.floor((level - 3) * ds) : 0, hp: Math.min(Math.max(cap, hp0), hp0 * k), atk: atk0 > 0 ? atk0 : Math.min(+(ENV.ATKMAX ?? 3), Math.round(atk0 + (level - 3) * slope)) };
}
