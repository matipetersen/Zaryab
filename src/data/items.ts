import type { DmgType, DmgPart } from '../engine/types';

export type Slot = 'arma' | 'armadura' | 'talisman';
export type Rarity = 'comun' | 'poco' | 'raro' | 'unico';
export interface Bonus {
  ac?: number; atk?: number; dmg?: number; hp?: number; speed?: number; init?: number; saves?: number; spellDC?: number;
  applies?: 'melee' | 'ranged' | 'unarmed' | 'all'; extra?: DmgPart[]; resist?: DmgType[]; immune?: DmgType[];
}
export interface ItemDef {
  id: string; name: string; icon: string; kind: 'consumible' | 'equipo' | 'material' | 'clave'; rarity: Rarity; desc: string;
  price?: number; slot?: Slot; bonus?: Bonus; grants?: { abilities?: string[]; res?: Record<string, number>; traits?: string[] };
  ability?: string;            // consumibles: id de la habilidad que se ejecuta en combate
  lore?: string; stock?: boolean;   // stock: la tienda de EaNassr lo vende
}
const I = (o: ItemDef): ItemDef => o;

export const ITEMS: ItemDef[] = [
  // ───── consumibles (se usan en combate con «Objeto») ─────
  I({ id: 'pocion', name: 'Poción de curación', icon: '🧪', kind: 'consumible', rarity: 'comun', desc: 'Cura 2d4+2 PG a un aliado adyacente (acción adicional).', price: 50, ability: 'item_pocion', stock: true }),
  I({ id: 'pocion_mayor', name: 'Poción de curación mayor', icon: '⚗️', kind: 'consumible', rarity: 'poco', desc: 'Cura 4d4+4 PG a un aliado adyacente (acción adicional).', price: 150, ability: 'item_pocion_mayor', stock: true }),
  I({ id: 'antidoto', name: 'Antídoto del Pozo', icon: '🧫', kind: 'consumible', rarity: 'comun', desc: 'Quita veneno, ceguera y parálisis a un aliado adyacente.', price: 50, ability: 'item_antidoto', stock: true }),
  I({ id: 'frasco_fuego', name: 'Frasco de fuego', icon: '🔥', kind: 'consumible', rarity: 'comun', desc: 'Lanzás a 5 casillas: 2d6 de fuego en radio 1 (DES 12 mitad). Prende barriles y madera, deja fuego en el suelo.', price: 50, ability: 'item_fuego', stock: true }),
  I({ id: 'frasco_acido', name: 'Frasco de ácido', icon: '🧪', kind: 'consumible', rarity: 'comun', desc: 'Lanzás a 5 casillas: 2d6 de ácido a un objetivo y 20 de daño a cobertura o muro frágil.', price: 25, ability: 'item_acido', stock: true }),
  I({ id: 'pergamino_muro', name: 'Pergamino: Muro de Piedra', icon: '📜', kind: 'consumible', rarity: 'poco', desc: 'Alza un muro de piedra de 3 casillas (cobertura de 30 PG) a 5 casillas.', price: 120, ability: 'item_muro', stock: true }),
  I({ id: 'pergamino_fe', name: 'Pergamino: Escudo de la Fe', icon: '📜', kind: 'consumible', rarity: 'poco', desc: '+2 CA a un aliado durante 10 rondas, sin concentración.', price: 80, ability: 'item_escudo_fe' }),
  I({ id: 'arena_negra', name: 'Polvo de arena negra', icon: '⚫', kind: 'consumible', rarity: 'poco', desc: 'Volverte invisible hasta que ataques (producto de los Hijos del Simurg).', price: 100, ability: 'item_arena_negra' }),
  I({ id: 'elixir_valor', name: 'Elixir de valor', icon: '🍷', kind: 'consumible', rarity: 'poco', desc: 'Bendecido 10 rondas (+1d4 a ataques y salvaciones) para un aliado adyacente.', price: 90, ability: 'item_valor' }),
  I({ id: 'pan_arena', name: 'Pan de arena de Aisha', icon: '🥖', kind: 'consumible', rarity: 'comun', desc: 'Cura 1d4 PG a quien lo come. Deja un sabor a ceniza.', ability: 'item_pan' }),
  // ───── equipo ─────
  I({ id: 'espada_1', name: 'Espada larga +1', icon: '🗡', kind: 'equipo', rarity: 'poco', slot: 'arma', desc: '+1 al ataque y al daño cuerpo a cuerpo.', price: 400, bonus: { atk: 1, dmg: 1, applies: 'melee' }, stock: true }),
  I({ id: 'arco_1', name: 'Arco largo +1', icon: '🏹', kind: 'equipo', rarity: 'poco', slot: 'arma', desc: '+1 al ataque y al daño a distancia.', price: 400, bonus: { atk: 1, dmg: 1, applies: 'ranged' }, stock: true }),
  I({ id: 'veneno_arana', name: 'Hoja de veneno de arácnido', icon: '🐍', kind: 'equipo', rarity: 'poco', slot: 'arma', desc: '+1d4 de veneno a los ataques cuerpo a cuerpo.', price: 350, bonus: { extra: [{ dice: '1d4', type: 'poison' }], applies: 'melee' } }),
  I({ id: 'hueso_pacto', name: 'Hueso del Pacto', icon: '🦴', kind: 'equipo', rarity: 'raro', slot: 'arma', desc: 'Arma que drena: +1d6 necrótico a los ataques cuerpo a cuerpo. Late cuando hay un Inquisidor cerca.', bonus: { extra: [{ dice: '1d6', type: 'necrotic' }], applies: 'melee', atk: 1 }, lore: 'Hueso de djinn tallado como lanza. El Conclave lo prohíbe.' }),
  I({ id: 'guanteletes', name: 'Guanteletes de la Ira Rígida', icon: '🥊', kind: 'equipo', rarity: 'raro', slot: 'arma', desc: '+1 al daño desarmado. 1/día: Puño de Llama Estancada (+2d6 fuego al impactar).', bonus: { dmg: 1, applies: 'unarmed' }, grants: { abilities: ['puno_llama'], res: { llama: 1 } }, lore: 'El portador sueña que está encadenado, ardiendo lentamente.' }),
  I({ id: 'cota_1', name: 'Cota de mallas +1', icon: '🛡', kind: 'equipo', rarity: 'poco', slot: 'armadura', desc: '+1 CA.', price: 450, bonus: { ac: 1 }, stock: true }),
  I({ id: 'bronce_vivo', name: 'Armadura de bronce viviente', icon: '⚙️', kind: 'equipo', rarity: 'raro', slot: 'armadura', desc: '+2 CA. Las runas giran cuando alguien miente.', bonus: { ac: 2, init: -1 } }),
  I({ id: 'tunica_aguas', name: 'Túnica de los Siete Vientos', icon: '👘', kind: 'equipo', rarity: 'poco', slot: 'armadura', desc: '+1 CA y resistencia al fuego.', price: 380, bonus: { ac: 1, resist: ['fire'] }, stock: true }),
  I({ id: 'escudo_cedro', name: 'Escudo de cedro rúnico', icon: '🔰', kind: 'equipo', rarity: 'comun', slot: 'talisman', desc: '+1 CA.', price: 150, bonus: { ac: 1 }, stock: true }),
  I({ id: 'anillo_prot', name: 'Anillo de protección', icon: '💍', kind: 'equipo', rarity: 'raro', slot: 'talisman', desc: '+1 CA y +1 a todas las salvaciones.', price: 900, bonus: { ac: 1, saves: 1 } }),
  I({ id: 'botas_viento', name: 'Botas de los Cuatro Vientos', icon: '🥾', kind: 'equipo', rarity: 'poco', slot: 'talisman', desc: '+10 ft de velocidad.', price: 350, bonus: { speed: 2 }, stock: true }),
  I({ id: 'capa_arena', name: 'Capa de Arena Viva', icon: '🧥', kind: 'equipo', rarity: 'raro', slot: 'talisman', desc: 'Camuflaje: empezás cada combate invisible hasta que ataques o recibas daño.', grants: { traits: ['capaArena'] } }),
  I({ id: 'gema_fuego', name: 'Gema de Fuego Sellado', icon: '💎', kind: 'equipo', rarity: 'raro', slot: 'talisman', desc: '1/día: Manos Ardientes (3d6 de fuego a enemigos a 2 casillas, DES 13 mitad).', grants: { abilities: ['manos_ardientes'], res: { gema: 1 } }, lore: 'Una llama que ya no sabe cómo apagarse.' }),
  I({ id: 'perla_violeta', name: 'Perla violeta de Farid', icon: '🔮', kind: 'equipo', rarity: 'poco', slot: 'talisman', desc: 'Almacena una Bendición: 1 vez por combate, bendice a 3 aliados sin gastar espacio.', grants: { abilities: ['bendicion_perla'], res: { perla: 1 } }, lore: 'Lo que dejó el parásito de arena al morir.' }),
  I({ id: 'amuleto_hueso', name: 'Amuleto de hueso', icon: '🦴', kind: 'equipo', rarity: 'comun', slot: 'talisman', desc: 'Resistencia necrótica. Era del esposo de Aisha.', bonus: { resist: ['necrotic'] } }),
  I({ id: 'lampara_mercurio', name: 'Lámpara de Mercurio', icon: '🪔', kind: 'equipo', rarity: 'raro', slot: 'talisman', desc: '+1 a la CD de tus conjuros… pero te envenena: −2 PG máximos.', bonus: { spellDC: 1, hp: -2 }, lore: 'Almacena hechizos, pero envenena al usuario.' }),
  // ───── materiales ─────
  I({ id: 'esencia_fuego', name: 'Esencia de fuego', icon: '🜂', kind: 'material', rarity: 'poco', desc: 'Esencia elemental de un efrit. Sirve en el taller.' }),
  I({ id: 'esencia_agua', name: 'Esencia de agua', icon: '🜄', kind: 'material', rarity: 'poco', desc: 'Esencia elemental de un mirad.' }),
  I({ id: 'esencia_aire', name: 'Esencia de aire', icon: '🜁', kind: 'material', rarity: 'poco', desc: 'Esencia elemental de un jann.' }),
  I({ id: 'colmillo_ghul', name: 'Colmillo de ghul', icon: '🦷', kind: 'material', rarity: 'comun', desc: 'Material de taller.' }),
  I({ id: 'cristal_serpiente', name: 'Cristal de serpiente', icon: '💠', kind: 'material', rarity: 'comun', desc: 'Material de taller.' }),
  I({ id: 'nucleo_golem', name: 'Núcleo de golem', icon: '⚙', kind: 'material', rarity: 'poco', desc: 'Núcleo de energía rúnica.' }),
  I({ id: 'llave_bronce', name: 'Llave de bronce de la mazmorra', icon: '🗝', kind: 'clave', rarity: 'unico', desc: 'Abre las mazmorras de la Ciudadela.' }),
  I({ id: 'sello_helm', name: 'Sello de Helm', icon: '👁', kind: 'equipo', rarity: 'raro', slot: 'talisman', desc: '+2 a las salvaciones. Un aura de 3 casillas que retrasa los encantamientos enemigos (aproximada como +2 a salvaciones).', bonus: { saves: 2 }, lore: 'Medallón gris con el ojo de Helm en relieve. Suprime desde afuera.' }),
  I({ id: 'venda_ellie', name: 'Venda de Ellie', icon: '🩹', kind: 'clave', rarity: 'unico', desc: '«Traelo o no vengas.» Una venda de lino con un nudo que sólo Panchi sabe deshacer.' }),
  I({ id: 'fragmento', name: 'Fragmento del meteorito', icon: '☄', kind: 'clave', rarity: 'unico', desc: 'Hierro del cielo. Pulsa cuando mirás a Zahir.' }),
];
export const ITEM: Record<string, ItemDef> = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export const RECIPES: { id: string; out: string; mats: number; gold: number; need?: string; note: string }[] = [
  { id: 'r_pocion', out: 'pocion', mats: 2, gold: 0, note: 'Hierbas del Pozo y paciencia.' },
  { id: 'r_antidoto', out: 'antidoto', mats: 1, gold: 0, note: 'Con la rama del Lago.', need: 'remedio_veneno' },
  { id: 'r_fuego', out: 'frasco_fuego', mats: 2, gold: 0, note: 'Aceite de lámpara y yesca.' },
  { id: 'r_acido', out: 'frasco_acido', mats: 1, gold: 0, note: 'Mercurio diluido.' },
  { id: 'r_muro', out: 'pergamino_muro', mats: 4, gold: 30, note: 'Tinta de runas.' },
  { id: 'r_valor', out: 'elixir_valor', mats: 3, gold: 0, note: 'Vino especiado de Cabernet.' },
  { id: 'r_botas', out: 'botas_viento', mats: 8, gold: 100, need: 'djinns_libres', note: 'Con una esencia de Tadhem.' },
  { id: 'r_bronce', out: 'bronce_vivo', mats: 10, gold: 150, need: 'cap5_done', note: 'Piezas recuperadas de un Qilaat.' },
];
export const START_INV: Record<string, number> = { pocion: 3, antidoto: 1, frasco_fuego: 2, frasco_acido: 1 };
export const START_GOLD = 150;
export const SHOP_STOCK = ITEMS.filter(i => i.stock);

/** Botín: oro por XP + objetos con probabilidad según el enemigo caído. */
const DROPS: Record<string, [string, number][]> = {
  ifrit_menor: [['esencia_fuego', 0.6]], djinn_menor: [['esencia_aire', 0.5]], golem_arena: [['nucleo_golem', 0.4]], guardia_arena: [['nucleo_golem', 0.15], ['pocion', 0.15]],
  ghul_mutado: [['colmillo_ghul', 0.5]], ghul_catacumbas: [['colmillo_ghul', 0.4]], serpiente_cristal: [['cristal_serpiente', 0.6]], inquisidor: [['pocion', 0.4], ['pergamino_fe', 0.2]],
  mercenario_zoco: [['pocion', 0.3], ['frasco_fuego', 0.2]], drow_espia: [['arena_negra', 0.3], ['frasco_acido', 0.3]], nasnas: [['esencia_agua', 0.4]], qilaat: [['nucleo_golem', 0.5]],
};
export function lootFor(kills: string[], rnd = Math.random): { gold: number; items: Record<string, number>; mats: number } {
  const items: Record<string, number> = {}; let gold = 0, mats = 0;
  for (const id of kills) {
    gold += Math.round((MON_XP[id] ?? 25) * 0.35); mats += rnd() < 0.4 ? 1 : 0;
    for (const [it, p] of DROPS[id] ?? []) if (rnd() < p) items[it] = (items[it] ?? 0) + 1;
  }
  return { gold, items, mats };
}
let MON_XP: Record<string, number> = {};
export const setMonsterXp = (m: Record<string, number>) => { MON_XP = m; };
