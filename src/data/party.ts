import type { Unit, Weapon, Mods } from '../engine/types';
import type { Grant } from '../state';
import { ITEM } from './items';
import { addFlat } from '../engine/dice';
import { applyProgression, type Prog } from './progression';

export interface PCDef {
  id: string; name: string; race: string; klass: string; level: number; color: string; glyph: string; portrait: string;
  mods: Mods; saveProf: (keyof Mods)[]; hp: number; ac: number; speed: number; // pies
  weapons: Weapon[]; abilities: string[]; res: Record<string, number>; spellAb?: keyof Mods;
  traits: string[]; resist?: string[]; blurb: string; quest: string; sheet: 'pdf' | 'estimada';
  statusNote?: string;
}
const w = (o: Weapon) => o;

export const PARTY: PCDef[] = [
  {
    id: 'romain', name: 'Romain', race: 'Tiefling', klass: 'Clérigo (Dominio de la Tumba)', level: 3, color: '#c9b458', glyph: '☥', portrait: 'romain',
    mods: { str: 1, dex: 0, con: 1, int: 0, wis: 3, cha: 2 }, saveProf: ['wis', 'cha'], hp: 21, ac: 10, speed: 30,
    weapons: [w({ id: 'staff', name: 'Bastón', range: 1, toHit: 3, dmg: [{ dice: '1d6+1', type: 'bludgeoning' }] })],
    abilities: ['cure_wounds', 'healing_word', 'bless', 'bane', 'guiding_bolt', 'inflict_wounds', 'shield_of_faith', 'word_of_radiance', 'spare_the_dying', 'turn_undead', 'path_to_grave', 'lesser_restoration', 'aid', 'ray_of_enfeeblement'],
    res: { slot1: 4, slot2: 2, channel: 1 }, spellAb: 'wis', traits: ['undeadBane'], resist: ['fire'],
    blurb: 'Clérigo de Kelemvor. Perdió su fe cuando su templo fue quemado. Ve las almas en una balanza.',
    quest: 'Descubrir quién quemó su templo. El Vizir le encomienda sellar la canción del Lich antes de que Farid la cante.', sheet: 'pdf',
    statusNote: 'Ficha: CA 10 sin armadura (21 PG).',
  },
  {
    id: 'pact', name: 'Pact Risen', race: 'Aasimar', klass: 'Guerrero (Maestro de Batalla)', level: 3, color: '#e8e0b0', glyph: '✦', portrait: 'pact',
    mods: { str: 2, dex: 1, con: 2, int: 1, wis: 3, cha: 3 }, saveProf: ['str', 'con'], hp: 28, ac: 16, speed: 30,
    weapons: [
      w({ id: 'greatsword', name: 'Mandoble', range: 1, toHit: 4, dmg: [{ dice: '2d6+2', type: 'slashing' }] }),
      w({ id: 'longbow', name: 'Arco largo', range: 30, longRange: 30, toHit: 3, dmg: [{ dice: '1d8+1', type: 'piercing' }], ranged: true }),
    ],
    abilities: ['second_wind', 'action_surge', 'rally', 'radiant_soul', 'healing_hands'],
    res: { sw: 1, surge: 1, sd: 4, soul: 1, hh: 1 }, traits: [], resist: ['necrotic', 'radiant'],
    blurb: 'Aasimar caído. Bajo su nombre mortal late Azuran, el Portador del Segundo Aliento.',
    quest: 'Recordar su juramento y decidir qué hacer con la corona de fuego invertido.', sheet: 'pdf',
    statusNote: 'La ficha muestra CA 11; aquí usa la cota de mallas de su inventario (CA 16).',
  },
  {
    id: 'rabb', name: 'Rabb Locke', race: 'Humano', klass: 'Brujo (Hexblade)', level: 3, color: '#7a5cc9', glyph: '⚔', portrait: 'rabb',
    mods: { str: 0, dex: 2, con: 3, int: 0, wis: 0, cha: 3 }, saveProf: ['wis', 'cha'], hp: 27, ac: 15, speed: 30,
    weapons: [w({ id: 'pact', name: 'Espada de Pacto +1', range: 1, toHit: 6, dmg: [{ dice: '1d8+4', type: 'slashing' }], magic: true })],
    abilities: ['eldritch_blast', 'hex', 'wrathful_smite', 'hexblades_curse'],
    res: { slot2: 2, curse: 1 }, spellAb: 'cha', traits: [],
    blurb: 'Hexblade sin memoria. Su arma es un fragmento: el Eco de la Tercera Palabra usa a Rabb como lápiz.',
    quest: 'Descubrir quién le robó la memoria y qué pacto selló.', sheet: 'pdf',
  },
  {
    id: 'joren', name: 'Joren Hell', race: 'Humano', klass: 'Explorador (Acechador de la Penumbra)', level: 3, color: '#4f8a5b', glyph: '➶', portrait: 'joren',
    mods: { str: 1, dex: 3, con: 1, int: 0, wis: 2, cha: -1 }, saveProf: ['str', 'dex'], hp: 25, ac: 15, speed: 30,
    weapons: [
      w({ id: 'longbow', name: 'Arco largo', range: 30, longRange: 30, toHit: 5, dmg: [{ dice: '1d8+3', type: 'piercing' }], ranged: true, sharp: false }),
      w({ id: 'longbow_ss', name: 'Arco (Tirador Certero)', range: 30, longRange: 30, toHit: 0, dmg: [{ dice: '1d8+13', type: 'piercing' }], ranged: true, sharp: true, note: '−5 al ataque, +10 al daño; ignora cobertura' }),
      w({ id: 'shortsword', name: 'Espada corta', range: 1, toHit: 5, dmg: [{ dice: '1d6+3', type: 'piercing' }], finesse: true }),
    ],
    abilities: ['hunters_mark', 'cure_wounds'], res: { slot1: 3 }, spellAb: 'wis', traits: ['dreadInit'],
    blurb: 'Ranger criminal. Sus flechas ignoran la cobertura; su pasado, no.',
    quest: 'Limpiar su nombre. Un cargamento de "La Marca" lo arrastra hacia Medinat al-Rih.', sheet: 'pdf',
    statusNote: 'PG estimados (la ficha no los muestra).',
  },
  {
    id: 'zyrthar', name: "Zyr'thar", race: 'Drow', klass: 'Pícaro (Asesino)', level: 3, color: '#6b5b95', glyph: '🗡', portrait: 'zyrthar',
    mods: { str: 0, dex: 4, con: 1, int: 2, wis: 1, cha: 1 }, saveProf: ['dex', 'int'], hp: 21, ac: 15, speed: 30,
    weapons: [
      w({ id: 'shortsword', name: 'Espada corta', range: 1, toHit: 6, dmg: [{ dice: '1d6+4', type: 'piercing' }], finesse: true }),
      w({ id: 'hand_xbow', name: 'Ballesta de mano', range: 6, longRange: 24, toHit: 6, dmg: [{ dice: '1d6+4', type: 'piercing' }], ranged: true }),
    ],
    abilities: ['hide', 'cunning_dash', 'cunning_disengage', 'faerie_fire'], res: { faerie: 1 }, spellAb: 'cha', traits: ['sneak', 'assassinate'],
    blurb: 'Asesino drow que traicionó a la Casa Vel\'Shara. Vende sus cuchillos al mejor postor.',
    quest: 'Eliminar a los espías de su antigua casa.', sheet: 'estimada',
    statusNote: 'Sin ficha en los archivos: stats estimados de un Pícaro Asesino nv3.',
  },
  {
    id: 'panchi', name: 'Panchi', race: 'Enano', klass: 'Monje', level: 3, color: '#c26b3a', glyph: '✊', portrait: 'panchi',
    mods: { str: 1, dex: 3, con: 3, int: 0, wis: 2, cha: -1 }, saveProf: ['str', 'dex'], hp: 27, ac: 15, speed: 35,
    weapons: [
      w({ id: 'fist', name: 'Golpe desarmado', range: 1, toHit: 5, dmg: [{ dice: '1d6+3', type: 'bludgeoning' }], finesse: true }),
      w({ id: 'fist_bonus', name: 'Golpe adicional (artes marciales)', range: 1, toHit: 5, dmg: [{ dice: '1d6+3', type: 'bludgeoning' }], finesse: true, bonusAction: true }),
    ],
    abilities: ['flurry', 'patient_defense', 'step_of_wind', 'step_disengage'], res: { ki: 3 }, spellAb: 'wis', traits: [], resist: ['poison'],
    blurb: 'Monje enano de mal genio, exiliado por violencia excesiva. Busca un enemigo digno de su furia.',
    quest: 'Encontrar a Ellie (Sifra la Silente) y su venda: «Traelo o no vengas».', sheet: 'estimada',
    statusNote: 'Sin ficha en los archivos: stats estimados de un Monje enano nv3.',
  },
];
export const PARTY_BY_ID = Object.fromEntries(PARTY.map(p => [p.id, p]));

export function makePC(def: PCDef, grant?: Grant, equip: string[] = [], prog?: Prog): Unit {
  const u = buildPC(def, grant);
  if (prog) applyProgression(u, def, prog);
  applyEquip(u, equip);
  return u;
}
function buildPC(def: PCDef, grant?: Grant): Unit {
  const m = def.mods; const prof = 2;
  const saves = { ...m }; for (const k of def.saveProf) saves[k] += prof;
  const sm = def.spellAb ? m[def.spellAb] : 0;
  return {
    uid: 0, id: def.id, pcId: def.id, name: def.name, side: 'pc', ai: false, color: def.color, glyph: def.glyph, sprite: 'humanoid',
    x: 0, y: 0, size: 1, mods: { ...m }, saves, prof, level: def.level,
    hp: def.hp, maxHp: def.hp, temp: 0, ac: def.ac, speed: Math.ceil(def.speed / 5), fly: false,
    spellMod: sm, spellDC: 8 + prof + sm, spellAtk: prof + sm,
    weapons: [...def.weapons.filter(x => !grant?.removeWeapons?.includes(x.id)), ...(grant?.weapons ?? [])].map(x => ({ ...x })), abilities: [...new Set([...def.abilities, ...(grant?.abilities ?? []), 'dash', 'dodge', 'disengage', 'help', 'shove', 'stabilize'])], actions: [], multiattack: [],
    res: { ...def.res, ...(grant?.res ?? {}) }, resMax: { ...def.res, ...(grant?.res ?? {}) }, statuses: [], death: { succ: 0, fail: 0 }, down: false, dead: false, stable: false,
    moveLeft: 0, actionUsed: false, bonusUsed: false, extraActions: 0, attacksMade: 0, acted: false, initiative: 0,
    resist: (def.resist ?? []) as any, immune: [], vuln: [], condImmune: [], traits: [...def.traits, ...(grant?.traits ?? [])], xp: 0, undead: false,
    regen: 0, rechargeReady: {}, turnsTaken: 0, portrait: def.portrait,
  };
}

/** Aplica el equipo (arma, armadura, talismanes) a una unidad ya construida. */
export function applyEquip(u: Unit, equip: string[]) {
  for (const id of equip) {
    const it = ITEM[id]; if (!it || it.kind !== 'equipo') continue; const b = it.bonus;
    if (b) {
      u.ac += b.ac ?? 0; u.maxHp += b.hp ?? 0; u.hp = Math.min(u.maxHp, u.hp + (b.hp ?? 0)); u.speed += b.speed ?? 0; u.initBonus = (u.initBonus ?? 0) + (b.init ?? 0);
      if (b.saves) for (const k of Object.keys(u.saves) as (keyof typeof u.saves)[]) u.saves[k] += b.saves;
      if (b.spellDC) { u.spellDC += b.spellDC; u.spellAtk += b.spellDC; }
      if (b.resist) u.resist.push(...(b.resist as any)); if (b.immune) u.immune.push(...(b.immune as any));
      for (const w of u.weapons) {
        const unarmed = w.id.startsWith('fist'); const ok = !b.applies || b.applies === 'all' || (b.applies === 'melee' && !w.ranged) || (b.applies === 'ranged' && w.ranged) || (b.applies === 'unarmed' && unarmed);
        if (!ok) continue; w.toHit += b.atk ?? 0; if (b.dmg) w.dmg = [{ ...w.dmg[0], dice: addFlat(w.dmg[0].dice, b.dmg) }, ...w.dmg.slice(1)]; if (b.extra) w.dmg = [...w.dmg, ...b.extra];
      }
    }
    if (it.grants) { for (const a of it.grants.abilities ?? []) if (!u.abilities.includes(a)) u.abilities.push(a); for (const [k, v] of Object.entries(it.grants.res ?? {})) { u.res[k] = (u.res[k] ?? 0) + v; u.resMax[k] = (u.resMax[k] ?? 0) + v; } for (const t of it.grants.traits ?? []) u.traits.push(t); }
  }
}
