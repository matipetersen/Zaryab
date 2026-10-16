import type { MonsterDef, Unit, Mods } from '../engine/types';

const m = (str: number, dex: number, con: number, int: number, wis: number, cha: number): Mods => ({ str, dex, con, int, wis, cha });

export const MONSTERS: Record<string, MonsterDef> = {
  guardia_arena: {
    id: 'guardia_arena', name: 'Guardia de Arena', type: 'humanoide', cr: '1/2', hp: 22, ac: 14, speed: 30, mods: m(2, 1, 2, 0, 0, -1), prof: 2,
    actions: [
      { id: 'espada', name: 'Espada de Arena', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '1d8+2', type: 'slashing' }, { dice: '1d4', type: 'piercing' }], save: { ab: 'con', dc: 12, cond: 'blinded', turns: 1 } },
      { id: 'grito', name: 'Grito del Viento', kind: 'save', reach: 3, save: { ab: 'dex', dc: 12, cond: 'prone', turns: -1 }, recharge: 5 },
    ],
    xp: 100, color: '#b08d57', glyph: 'G', sprite: 'construct', lore: 'Armadura de bronce viviente con runas que giran como serpientes al mentir.',
  },
  linyera: {
    id: 'linyera', name: 'Linyera de Dientes Blancos', type: 'humanoide (Marid disfrazado)', cr: '1', hp: 23, ac: 15, speed: 40, mods: m(1, 5, 1, 0, 2, 0), prof: 2,
    actions: [
      { id: 'golpe', name: 'Golpe desarmado', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d6+3', type: 'bludgeoning' }] },
      { id: 'dardo', name: 'Dardo', kind: 'ranged', toHit: 5, reach: 4, dmg: [{ dice: '1d4+3', type: 'piercing' }] },
    ],
    multiattack: ['golpe', 'golpe'], xp: 200, color: '#9a8f78', glyph: 'L', sprite: 'humanoid',
    lore: 'Espía del Conclave. Sonríe con dientes demasiado blancos para su rostro marchito.',
  },
  escorpion_obsidiana: {
    id: 'escorpion_obsidiana', name: 'Escorpión de Obsidiana', type: 'bestia', cr: '1/8', hp: 11, ac: 13, speed: 30, mods: m(-2, 3, 2, -5, 0, -4), prof: 2,
    actions: [{ id: 'aguijon', name: 'Aguijón Venenoso', kind: 'melee', toHit: 3, reach: 1, dmg: [{ dice: '1d4+1', type: 'piercing' }], save: { ab: 'con', dc: 11, cond: 'poisoned', turns: 2, dot: '1d6' } }],
    xp: 25, color: '#2b2b3a', glyph: 's', sprite: 'beast',
  },
  ghul_swarmer: {
    id: 'ghul_swarmer', name: 'Ghul Enjambre', type: 'no-muerto', cr: '1/2', hp: 13, ac: 13, speed: 30, mods: m(1, 3, 1, -1, 0, -2), prof: 2, undead: true,
    actions: [
      { id: 'garra', name: 'Garra', kind: 'melee', toHit: 3, reach: 1, dmg: [{ dice: '1d6+1', type: 'slashing' }, { dice: '1d4', type: 'necrotic' }], save: { ab: 'con', dc: 11, cond: 'disadvNext', turns: 2 } },
      { id: 'festin', name: 'Festín del Enjambre', kind: 'save', reach: 0, aoe: 2, aoeSelf: true, dmg: [{ dice: '2d6', type: 'necrotic' }], half: true, save: { ab: 'dex', dc: 11 }, recharge: 5 },
    ],
    traits: ['swarm'], xp: 100, color: '#7c8a5e', glyph: 'g', sprite: 'undead', lore: 'Copias espectrales que se agrupan: cuantos más ghuls, más peligrosos.',
  },
  ghul_mutado: {
    id: 'ghul_mutado', name: 'Ghul Mutado', type: 'no-muerto', cr: '1/2', hp: 15, ac: 13, speed: 40, mods: m(1, 3, 1, -1, 0, -2), prof: 2, undead: true,
    actions: [
      { id: 'garra', name: 'Garra Mutada', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '1d6+1', type: 'slashing' }, { dice: '1d4', type: 'necrotic' }], save: { ab: 'con', dc: 11, cond: 'disadvNext', turns: 2 } },
      { id: 'festin', name: 'Festín del Enjambre', kind: 'save', reach: 0, aoe: 2, aoeSelf: true, dmg: [{ dice: '2d6', type: 'necrotic' }], half: true, save: { ab: 'dex', dc: 11 }, recharge: 5 },
    ],
    onDeath: { name: 'Explosión de necroarena', dmg: [{ dice: '1d6', type: 'necrotic' }], radius: 1, dc: 11, ab: 'dex' },
    traits: ['swarm'], xp: 125, color: '#8e9a4e', glyph: 'G', sprite: 'undead', lore: 'Mutado por el fragmento del meteorito: más veloz, y estalla al morir.',
  },
  ifrit_menor: {
    id: 'ifrit_menor', name: 'Ifrit Menor', type: 'elemental', cr: '1', hp: 27, ac: 14, speed: 30, mods: m(1, 4, 1, 0, 1, 3), prof: 2, immune: ['fire'],
    actions: [
      { id: 'golpe', name: 'Golpe Ardiente', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '1d6+4', type: 'bludgeoning' }, { dice: '1d6', type: 'fire' }] },
      { id: 'llama', name: 'Doblar Llamas', kind: 'save', reach: 6, save: { ab: 'con', dc: 12, cond: 'disadvNext', turns: 2 }, recharge: 5 },
    ],
    xp: 200, color: '#e2572b', glyph: 'I', sprite: 'djinn',
  },
  reflejo: {
    id: 'reflejo', name: 'Reflejo Corrupto', type: 'constructo ilusorio', cr: '3', hp: 40, ac: 15, speed: 30, mods: m(2, 2, 2, 0, 0, 0), prof: 2,
    actions: [
      { id: 'ira', name: 'Sombra de la Ira', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '2d6', type: 'psychic' }] },
      { id: 'eco', name: 'Eco de Acción', kind: 'save', reach: 6, dmg: [{ dice: '1d8', type: 'psychic' }], save: { ab: 'wis', dc: 14, cond: 'disadvNext', turns: 2 }, recharge: 5 },
    ],
    onDeath: { name: 'Reflejo Inestable', dmg: [{ dice: '0', type: 'none' }], radius: 1, dc: 13, ab: 'wis', cond: 'paralyzed' },
    xp: 700, color: '#aab7d8', glyph: 'R', sprite: 'mirror', lore: 'Copia a su original, pero sin conjuros. Al romperse se funde brevemente con quien lo golpeó.',
  },
  nasnas: {
    id: 'nasnas', name: 'Nasnas Deforme', type: 'aberración', cr: '1/4', hp: 13, ac: 12, speed: 30, mods: m(1, 2, 1, -2, 0, -2), prof: 2,
    actions: [{ id: 'garra', name: 'Zarpazo torcido', kind: 'melee', toHit: 3, reach: 1, dmg: [{ dice: '1d6+1', type: 'slashing' }] }],
    xp: 50, color: '#7a4e3a', glyph: 'n', sprite: 'beast', lore: 'Medio cuerpo que salta: seguidor del culto de Dahhak.',
  },
  inquisidor: {
    id: 'inquisidor', name: 'Inquisidor Radiante', type: 'humanoide', cr: '3', hp: 39, ac: 16, speed: 30, mods: m(1, 2, 2, 3, 4, 3), prof: 3,
    actions: [
      { id: 'maza', name: 'Maza Radiante', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d6+2', type: 'bludgeoning' }, { dice: '1d6', type: 'radiant' }] },
      { id: 'rayo', name: 'Rayo Guía', kind: 'ranged', toHit: 5, reach: 24, dmg: [{ dice: '4d6', type: 'radiant' }], recharge: 5 },
      { id: 'juicio', name: 'Juicio Cegador', kind: 'save', reach: 6, aoe: 2, save: { ab: 'con', dc: 13, cond: 'blinded', turns: 1 }, recharge: 5 },
    ],
    onDeath: { name: 'Alma Radiante', dmg: [{ dice: '2d8', type: 'radiant' }], radius: 2, dc: 13, ab: 'dex' },
    xp: 700, color: '#e6c25a', glyph: 'Ɨ', sprite: 'humanoid',
  },
  qilaat: {
    id: 'qilaat', name: 'Qilaat (armadura viviente)', type: 'constructo', cr: '5', hp: 85, ac: 18, speed: 30, mods: m(6, 0, 5, 0, 2, -1), prof: 3, immune: ['poison', 'psychic'],
    actions: [
      { id: 'puno', name: 'Puño de Latón', kind: 'melee', toHit: 7, reach: 1, dmg: [{ dice: '2d8+6', type: 'bludgeoning' }] },
      { id: 'vapor', name: 'Chorro de Vapor', kind: 'save', reach: 0, aoe: 3, aoeSelf: true, dmg: [{ dice: '5d6', type: 'fire' }], half: true, save: { ab: 'con', dc: 15 }, recharge: 5 },
    ],
    xp: 1800, color: '#c79a3b', glyph: 'Q', sprite: 'construct',
  },

  ghul_catacumbas: {
    id: 'ghul_catacumbas', name: 'Ghul de las Catacumbas', type: 'no-muerto', cr: '2', hp: 32, ac: 12, speed: 30, mods: m(3, 2, 3, -2, 0, -2), prof: 2, undead: true,
    actions: [{ id: 'garras', name: 'Garras Venenosas', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '2d4+2', type: 'piercing' }, { dice: '1d6', type: 'poison' }], save: { ab: 'con', dc: 12, cond: 'poisoned', turns: 2 } }],
    xp: 450, color: '#6d7a4e', glyph: 'G', sprite: 'undead', lore: 'Criatura demacrada de piel de reptil y dedos alargados para cavar tumbas.',
  },
  ghul_invocado: {
    id: 'ghul_invocado', name: 'Ghul Invocado', type: 'no-muerto', cr: '1', hp: 25, ac: 12, speed: 30, mods: m(3, 2, 3, -2, 0, -2), prof: 2, undead: true,
    actions: [{ id: 'garras', name: 'Garras', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '2d4+2', type: 'slashing' }] }],
    xp: 0, color: '#8a6aa8', glyph: 'g', sprite: 'undead',
  },
  hormiga_arena: {
    id: 'hormiga_arena', name: 'Hormiga de Arena', type: 'bestia', cr: '0', hp: 3, ac: 11, speed: 30, mods: m(-2, 1, 0, -5, 0, -4), prof: 2,
    actions: [{ id: 'mordisco', name: 'Mordisco', kind: 'melee', toHit: 3, reach: 1, dmg: [{ dice: '1d4', type: 'piercing' }] }],
    xp: 10, color: '#b8864b', glyph: 'h', sprite: 'beast', lore: 'Salen de la piel de los envenenados por el Pozo del Silencio.',
  },
  flor_carnivora: {
    id: 'flor_carnivora', name: 'Flor Carnívora', type: 'planta', cr: '1/2', hp: 22, ac: 11, speed: 5, mods: m(2, 0, 2, -4, 0, -4), prof: 2,
    actions: [{ id: 'mordisco', name: 'Zarcillo y Mordisco', kind: 'melee', toHit: 4, reach: 2, dmg: [{ dice: '1d8+2', type: 'piercing' }], save: { ab: 'str', dc: 12, cond: 'restrained', turns: 2 } }],
    xp: 100, color: '#b0306a', glyph: 'f', sprite: 'beast', lore: 'Rosas de pétalos translúcidos que sangran néctar violeta.',
  },
  drow_espia: {
    id: 'drow_espia', name: "Espía de la Casa Vel'Shara", type: 'humanoide (drow)', cr: '1', hp: 27, ac: 15, speed: 30, mods: m(0, 4, 1, 1, 2, 1), prof: 2,
    actions: [
      { id: 'espada', name: 'Espada corta envenenada', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d6+3', type: 'piercing' }], save: { ab: 'con', dc: 12, cond: 'poisoned', turns: 3 } },
      { id: 'ballesta', name: 'Ballesta de mano', kind: 'ranged', toHit: 5, reach: 6, dmg: [{ dice: '1d6+3', type: 'piercing' }] },
    ],
    multiattack: ['espada', 'espada'], xp: 200, color: '#3d3858', glyph: 'V', sprite: 'humanoid', lore: 'La Casa Vel\'Shara no olvida. No perdona. No muere.',
  },
  mercenario_zoco: {
    id: 'mercenario_zoco', name: 'Mercenario del Zoco', type: 'humanoide', cr: '2', hp: 45, ac: 15, speed: 30, mods: m(3, 3, 3, 1, 0, 0), prof: 2,
    actions: [
      { id: 'cuchillo', name: 'Cuchillo curvo', kind: 'melee', toHit: 5, reach: 1, dmg: [{ dice: '1d6+3', type: 'slashing' }] },
      { id: 'mercurio', name: 'Frasco de Mercurio', kind: 'save', reach: 4, aoe: 1, dmg: [{ dice: '2d6', type: 'acid' }], half: true, save: { ab: 'dex', dc: 13 }, recharge: 5 },
    ],
    multiattack: ['cuchillo', 'cuchillo'], xp: 450, color: '#8a4aa0', glyph: 'M', sprite: 'humanoid', lore: 'Turbante violeta y cuchillos curvos bañados en mercurio.',
  },
  serpiente_cristal: {
    id: 'serpiente_cristal', name: 'Serpiente de Cristal', type: 'constructo', cr: '1/2', hp: 16, ac: 15, speed: 30, mods: m(-2, 4, 1, -4, 0, -4), prof: 2,
    actions: [{ id: 'mordisco', name: 'Mordisco Silencioso', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '1d4+2', type: 'piercing' }], save: { ab: 'con', dc: 12, cond: 'paralyzed', turns: 1 } }],
    xp: 100, color: '#7fd1c8', glyph: 'c', sprite: 'beast', lore: 'Espía mágico del Zoco: se mueve como una joya hasta atacar.',
  },
  golem_arena: {
    id: 'golem_arena', name: 'Golem de Arena Defectuoso', type: 'constructo', cr: '3', hp: 60, ac: 16, speed: 20, mods: m(4, -1, 4, -5, -1, -5), prof: 2, immune: ['poison', 'psychic'],
    actions: [{ id: 'golpe', name: 'Golpetear', kind: 'melee', toHit: 6, reach: 1, dmg: [{ dice: '2d8+4', type: 'bludgeoning' }] }],
    onDeath: { name: 'Desmoronarse', dmg: [{ dice: '3d6', type: 'slashing' }], radius: 1, dc: 14, ab: 'dex' },
    xp: 700, color: '#a8744a', glyph: 'Ω', sprite: 'construct', lore: 'Arcilla y runas violetas, moviéndose de forma espasmódica. Roto, enojado, solo.',
  },
  adorador: {
    id: 'adorador', name: 'Adorador del Simurg', type: 'humanoide', cr: '1/2', hp: 27, ac: 11, speed: 30, mods: m(1, 0, 1, 0, 1, 0), prof: 2,
    actions: [{ id: 'daga', name: 'Daga Ritual', kind: 'melee', toHit: 3, reach: 1, dmg: [{ dice: '1d4+1', type: 'slashing' }, { dice: '1d6', type: 'necrotic' }] }],
    xp: 100, color: '#9a6ac8', glyph: 'a', sprite: 'humanoid', lore: 'Fanático de túnica parchada con un cristal violeta incrustado en el pecho.',
  },
  nino_poseido: {
    id: 'nino_poseido', name: 'Niño Poseído por Zahir', type: 'humanoide', cr: '2', hp: 40, ac: 12, speed: 30, mods: m(-1, 1, 0, 1, 2, 3), prof: 2,
    actions: [
      { id: 'toque', name: 'Toque de Zahir', kind: 'save', reach: 6, dmg: [{ dice: '2d6', type: 'necrotic' }], save: { ab: 'wis', dc: 13 } },
      { id: 'arañazo', name: 'Arañazo de arena', kind: 'melee', toHit: 3, reach: 1, dmg: [{ dice: '1d6', type: 'slashing' }] },
    ],
    xp: 450, color: '#d9b6ff', glyph: 'F', sprite: 'djinn', lore: 'Ojos de arena que fluye y voz de eco múltiple.',
  },
  perro_arena: {
    id: 'perro_arena', name: 'Perro de Arena', type: 'bestia', cr: '1/2', hp: 22, ac: 13, speed: 40, mods: m(2, 2, 1, -4, 1, -3), prof: 2,
    actions: [{ id: 'mordisco', name: 'Mordisco', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '1d6+2', type: 'piercing' }], save: { ab: 'str', dc: 12, cond: 'prone', turns: -1 } }],
    xp: 100, color: '#c9a060', glyph: 'p', sprite: 'beast', lore: 'Rastreador de los Inquisidores: nunca pierde un olor a herejía.',
  },
  djinn_menor: {
    id: 'djinn_menor', name: 'Djinn Menor', type: 'elemental', cr: '1', hp: 30, ac: 13, speed: 30, mods: m(1, 2, 1, 0, 0, 1), prof: 2, fly: 30,
    actions: [{ id: 'zarpazo', name: 'Zarpazo de arena', kind: 'melee', toHit: 4, reach: 1, dmg: [{ dice: '1d8+2', type: 'slashing' }] }],
    xp: 0, color: '#d8a64f', glyph: 'd', sprite: 'djinn',
  },
};

export function makeFoe(id: string, x: number, y: number, nameSuffix = '', side: 'foe' | 'pc' = 'foe'): Unit {
  const d = MONSTERS[id]; if (!d) throw new Error('Monstruo desconocido ' + id);
  const saves: Mods = { ...d.mods, ...(d.saves ?? {}) } as Mods;
  return {
    uid: 0, id: d.id, name: d.name + nameSuffix, side, ai: true, color: d.color, glyph: d.glyph, sprite: d.sprite, x, y, size: d.size ?? 1,
    mods: { ...d.mods }, saves, prof: d.prof, level: 0, hp: d.hp, maxHp: d.hp, temp: 0, ac: d.ac, speed: Math.ceil(d.speed / 5), fly: !!d.fly,
    spellMod: 0, spellDC: 12, spellAtk: 4, weapons: [], abilities: [], actions: d.actions.map(a => ({ ...a })), multiattack: d.multiattack ?? [],
    res: {}, resMax: {}, statuses: [], death: { succ: 0, fail: 0 }, down: false, dead: false, stable: false,
    moveLeft: 0, actionUsed: false, bonusUsed: false, extraActions: 0, attacksMade: 0, acted: false, initiative: 0,
    resist: [...(d.resist ?? [])], immune: [...(d.immune ?? [])], vuln: [...(d.vuln ?? [])], condImmune: [...(d.condImmune ?? [])],
    traits: [...(d.traits ?? [])], xp: d.xp, cr: d.cr, undead: !!d.undead, onDeath: d.onDeath, regen: d.regen ?? 0,
    rechargeReady: Object.fromEntries(d.actions.filter(a => a.recharge).map(a => [a.id, true])), turnsTaken: 0,
  };
}
