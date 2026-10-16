import type { Weapon } from './engine/types';
import { START_INV, START_GOLD } from './data/items';
import { levelForXp, levelCap, type Prog } from './data/progression';
import { BOONS, BOND_NAME } from './world/bonds';
import { makeFollower, randomRecruit, migrate, type Follower } from './world/followers';

export interface Grant { weapons?: Weapon[]; removeWeapons?: string[]; abilities?: string[]; traits?: string[]; res?: Record<string, number> }
export interface Effect {
  c?: number; d?: number; pf?: number; flags?: string[]; unflag?: string[];
  rep?: Record<string, number>; alert?: number; day?: number; follow?: string[]; build?: string[];
  grant?: Record<string, Grant>; gold?: number; food?: number; items?: Record<string, number>; recruits?: number; dead?: string[]; ruta?: Record<string, number>;
  /** Eco diferido: un evento (EVENTS[id]) que estalla dentro de `in` días como consecuencia de una decisión. */
  echo?: { id: string; in: number }[]; /** Fija el plazo del Eclipse (días desde hoy) y programa sus avisos. */ eclipse?: number;
  /** Fe de todos los seguidores. */ fe?: number; rumors?: number; bond?: Record<string, number>; found?: string[]; /** Huella: línea del legado moral que verán el epílogo y el Diario. */ huella?: string;
}
export type QStatus = 'active' | 'done' | 'failed';
export interface Campaign {
  c: number; d: number; pf: number; seal: number; flags: string[]; party: string[]; dead: string[];
  day: number; alert: number; alertTick: number; lastMainDay: number;
  rep: Record<string, number>; quests: Record<string, QStatus>; followers: Follower[]; buildings: string[];
  food: number; mats: number; rumors: number; ticks: number; sermonDay: number; ritualCd: Record<string, number>; peek: { district: string; n: number } | null;
  grants: Record<string, Grant>; oracleSeen: number[]; journal: string[];
  main: number;                                   // índice del próximo capítulo principal
  run: { script: string; idx: number } | null;   // guion en curso (se reanuda al cargar)
  battlesWon: number; xp: number;
  ruta: Record<string, number>; ecos: { id: string; due: number }[]; huellas: string[];
  lvl: number; picks: Record<string, string[]>; squad: string[];
  gold: number; inv: Record<string, number>; equip: Record<string, string[]>;
  /** 0 amanecer · 1 día · 2 noche: cada visita a un lugar consume una fase; la tercera pasa el día. */
  phase: number; eclipseDay: number; found: string[]; bond: Record<string, number>; poiCd: Record<string, number>;
  front: Record<string, string>; frontTick: number; roamers: { id: string; district: string; kind: string; since: number }[]; roamerTick: number;
}
export const FACTIONS: Record<string, string> = {
  conclave: 'Conclave de los Siete Vientos', hijos: 'Hijos del Simurg', mercaderes: 'Mercaderes del Zoco',
  inquisidores: 'Inquisidores de la Arena', nomadas: 'Nómadas del Vacío', dahhak: 'Culto de Dahhak', qilaat: 'Qilaat',
};
export const newCampaign = (): Campaign => ({
  c: 0, d: 0, pf: 0, seal: 0, flags: [], party: ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi'], dead: [],
  day: 1, alert: 0, alertTick: 0, lastMainDay: 1,
  rep: { conclave: 0, hijos: 0, mercaderes: 0, inquisidores: 0, nomadas: 0, dahhak: 0, qilaat: 0 },
  quests: {}, followers: [], buildings: [], food: 6, mats: 0, rumors: 0, ticks: 0, sermonDay: 0, ritualCd: {}, peek: null, grants: {}, oracleSeen: [], journal: [],
  main: 0, run: { script: 'cap0', idx: 0 }, battlesWon: 0, xp: 0,
  lvl: 3, picks: {}, squad: [], ruta: { orden: 0, pueblo: 0, sombra: 0 }, ecos: [], huellas: [], gold: START_GOLD, inv: { ...START_INV }, equip: {},
  phase: 0, eclipseDay: 0, found: [], bond: {}, poiCd: {}, front: {}, frontTick: 0, roamers: [], roamerTick: 0,
});
const KEY = 'zaryab.save.v3';
export function saveGame(c: Campaign) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* sin storage */ } }
export function loadGame(): Campaign | null {
  try { const s = localStorage.getItem(KEY); if (!s) return null; const c = { ...newCampaign(), ...JSON.parse(s) }; c.followers = migrate(c.followers); c.inv ??= {}; c.equip ??= {}; c.ecos ??= []; c.lvl ??= 3; c.picks ??= {}; c.squad ??= []; c.ruta ??= { orden: 0, pueblo: 0, sombra: 0 }; c.huellas ??= []; c.found ??= []; c.bond ??= {}; c.poiCd ??= {}; c.front ??= {}; c.roamers ??= []; c.phase ??= 0; return c; } catch { return null; }
}
export function clearSave() { try { localStorage.removeItem(KEY); } catch { /* */ } }
export const has = (c: Campaign, f: string) => c.flags.includes(f);
export const built = (c: Campaign, b: string) => c.buildings.includes(b);

const clamp = (n: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, n));
export function applyEffect(c: Campaign, e?: Effect): string[] {
  if (!e) return [];
  const out: string[] = [];
  if (e.c) {
    c.c = clamp(c.c + e.c); out.push(`${e.c > 0 ? '+' : ''}${e.c} Corrupción`);
    if (e.c > 0 && built(c, 'altar')) { const g = 1 + Math.floor(Math.random() * 6); c.pf += g; c.seal += g; out.push(`+${g} PF (Altar de Huesos)`); }
  }
  if (e.d) { c.d = clamp(c.d + e.d); out.push(`${e.d > 0 ? '+' : ''}${e.d} Devoción`); }
  if (e.pf) { c.pf = Math.max(0, c.pf + e.pf); if (e.pf > 0) c.seal += e.pf; out.push(`${e.pf > 0 ? '+' : ''}${e.pf} PF`); }
  for (const [k, v] of Object.entries(e.rep ?? {})) { c.rep[k] = clamp((c.rep[k] ?? 0) + v, -5, 5); out.push(`${v > 0 ? '+' : ''}${v} rep. ${FACTIONS[k] ?? k}`); }
  if (e.alert) { c.alert = clamp(c.alert + e.alert); out.push(`${e.alert > 0 ? '+' : ''}${e.alert} Alerta`); }
  for (const f of e.follow ?? []) if (!c.followers.some(x => x.name === f)) { c.followers.push(makeFollower(f, c.day)); out.push(`Se une: ${f}`); }
  for (const b of e.build ?? []) if (!c.buildings.includes(b)) { c.buildings.push(b); out.push(`Construido: ${b}`); }
  if (e.gold) { c.gold = Math.max(0, c.gold + e.gold); out.push(`${e.gold > 0 ? '+' : ''}${e.gold} PO`); }
  for (const [k, n] of Object.entries(e.items ?? {})) { c.inv[k] = Math.max(0, (c.inv[k] ?? 0) + n); out.push(`${n > 0 ? '+' : ''}${n} ${k}`); }
  if (e.food) { c.food = Math.max(0, c.food + e.food); out.push(`${e.food > 0 ? '+' : ''}${e.food} víveres`); }
  for (const [k, v] of Object.entries(e.ruta ?? {})) c.ruta[k] = (c.ruta[k] ?? 0) + v;
  for (const d of e.dead ?? []) if (!c.dead.includes(d)) { c.dead.push(d); out.push(`Muere para siempre: ${d}`); }
  if (e.recruits) { for (let i = 0; i < e.recruits; i++) c.followers.push(randomRecruit(c.day)); out.push(`+${e.recruits} seguidores`); }
  for (const x of e.echo ?? []) c.ecos.push({ id: x.id, due: c.day + x.in });
  if (e.eclipse) { c.eclipseDay = c.day + e.eclipse; for (const [id, at] of [['eclipse_aviso1', e.eclipse - 30], ['eclipse_aviso2', e.eclipse - 10], ['eclipse_llega', e.eclipse]] as const) c.ecos.push({ id, due: c.day + at }); out.push(`El Eclipse llegará en ${e.eclipse} días.`); }
  if (e.rumors) { c.rumors = Math.max(0, c.rumors + e.rumors); out.push(`${e.rumors > 0 ? '+' : ''}${e.rumors} rumores`); }
  for (const f of e.found ?? []) if (!c.found.includes(f)) { c.found.push(f); out.push('Nuevo lugar descubierto'); }
  for (const [k, v] of Object.entries(e.bond ?? {})) {
    const before = c.bond[k] ?? 0; const now = c.bond[k] = clamp(before + v, 0, 5); if (now > before) out.push(`Vínculo con ${BOND_NAME[k] ?? k}: ${now}/5`);
    for (const lv of [3, 5]) if (before < lv && now >= lv && BOONS[k]?.[lv]) { out.push(...applyEffect(c, BOONS[k][lv].e)); c.journal.push(`Día ${c.day}: ${BOND_NAME[k]} ${BOONS[k][lv].text}`); out.push(BOONS[k][lv].text); }
  }
  if (e.fe) { for (const f of c.followers) f.fe = clamp(f.fe + e.fe); out.push(`${e.fe > 0 ? '+' : ''}${e.fe} fe de los seguidores`); }
  if (e.huella && !c.huellas.includes(e.huella)) c.huellas.push(e.huella);
  for (const f of e.flags ?? []) if (!c.flags.includes(f)) c.flags.push(f);
  for (const f of e.unflag ?? []) c.flags = c.flags.filter(x => x !== f);
  for (const [pc, g] of Object.entries(e.grant ?? {})) {
    const cur = (c.grants[pc] ??= {});
    cur.weapons = [...(cur.weapons ?? []), ...(g.weapons ?? [])]; cur.removeWeapons = [...(cur.removeWeapons ?? []), ...(g.removeWeapons ?? [])];
    cur.abilities = [...new Set([...(cur.abilities ?? []), ...(g.abilities ?? [])])]; cur.traits = [...new Set([...(cur.traits ?? []), ...(g.traits ?? [])])];
    cur.res = { ...(cur.res ?? {}), ...(g.res ?? {}) }; out.push(`Nueva habilidad: ${pc}`);
  }
  return out;
}
/** Vista previa para el Espejo del Alma (no aplica nada). */
export function previewEffect(e?: Effect): string[] {
  if (!e) return [];
  const o: string[] = [];
  if (e.c) o.push(`${e.c > 0 ? '+' : ''}${e.c} Corrupción`); if (e.d) o.push(`${e.d > 0 ? '+' : ''}${e.d} Devoción`); if (e.pf) o.push(`${e.pf > 0 ? '+' : ''}${e.pf} PF`);
  if (e.gold) o.push(`${e.gold > 0 ? '+' : ''}${e.gold} PO`);
  if (e.alert) o.push(`${e.alert > 0 ? '+' : ''}${e.alert} Alerta`);
  for (const [k, v] of Object.entries(e.rep ?? {})) o.push(`${v > 0 ? '+' : ''}${v} ${FACTIONS[k] ?? k}`);
  return o;
}

/** Nivel al que podría subir el grupo ahora (0 si no hay subida pendiente). */
export const pendingLevel = (c: Campaign) => { const target = Math.min(levelForXp(c.xp), levelCap(c.flags)); return target > c.lvl ? c.lvl + 1 : 0; };
export const progOf = (c: Campaign, pc: string): Prog => ({ level: c.lvl, picks: c.picks[pc] ?? [] });
export const progMap = (c: Campaign, ids: string[]) => Object.fromEntries(ids.map(id => [id, progOf(c, id)]));
