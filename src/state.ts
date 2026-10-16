import type { Weapon } from './engine/types';

export interface Grant { weapons?: Weapon[]; removeWeapons?: string[]; abilities?: string[]; traits?: string[]; res?: Record<string, number> }
export interface Effect {
  c?: number; d?: number; pf?: number; flags?: string[]; unflag?: string[];
  rep?: Record<string, number>; alert?: number; day?: number; follow?: string[]; build?: string[];
  grant?: Record<string, Grant>;
}
export type QStatus = 'active' | 'done' | 'failed';
export interface Campaign {
  c: number; d: number; pf: number; seal: number; flags: string[]; party: string[]; dead: string[];
  day: number; alert: number; alertTick: number; lastMainDay: number;
  rep: Record<string, number>; quests: Record<string, QStatus>; followers: string[]; buildings: string[];
  grants: Record<string, Grant>; oracleSeen: number[]; journal: string[];
  main: number;                                   // índice del próximo capítulo principal
  run: { script: string; idx: number } | null;   // guion en curso (se reanuda al cargar)
  battlesWon: number; xp: number;
}
export const FACTIONS: Record<string, string> = {
  conclave: 'Conclave de los Siete Vientos', hijos: 'Hijos del Simurg', mercaderes: 'Mercaderes del Zoco',
  inquisidores: 'Inquisidores de la Arena', nomadas: 'Nómadas del Vacío', dahhak: 'Culto de Dahhak', qilaat: 'Qilaat',
};
export const newCampaign = (): Campaign => ({
  c: 0, d: 0, pf: 0, seal: 0, flags: [], party: ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi'], dead: [],
  day: 1, alert: 0, alertTick: 0, lastMainDay: 1,
  rep: { conclave: 0, hijos: 0, mercaderes: 0, inquisidores: 0, nomadas: 0, dahhak: 0, qilaat: 0 },
  quests: {}, followers: [], buildings: [], grants: {}, oracleSeen: [], journal: [],
  main: 0, run: { script: 'cap1', idx: 0 }, battlesWon: 0, xp: 0,
});
const KEY = 'zaryab.save.v2';
export function saveGame(c: Campaign) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* sin storage */ } }
export function loadGame(): Campaign | null {
  try { const s = localStorage.getItem(KEY); if (!s) return null; return { ...newCampaign(), ...JSON.parse(s) }; } catch { return null; }
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
  for (const f of e.follow ?? []) if (!c.followers.includes(f)) { c.followers.push(f); out.push(`Se une: ${f}`); }
  for (const b of e.build ?? []) if (!c.buildings.includes(b)) { c.buildings.push(b); out.push(`Construido: ${b}`); }
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
  if (e.alert) o.push(`${e.alert > 0 ? '+' : ''}${e.alert} Alerta`);
  for (const [k, v] of Object.entries(e.rep ?? {})) o.push(`${v > 0 ? '+' : ''}${v} ${FACTIONS[k] ?? k}`);
  return o;
}
