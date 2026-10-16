export interface Effect { c?: number; d?: number; pf?: number; flags?: string[]; unflag?: string[] }
export interface Campaign {
  c: number; d: number; pf: number; flags: string[]; party: string[]; dead: string[];
  cursor: { chapter: number; path: number[] };   // posición en el guion (índices anidados)
  log: string[]; battlesWon: number; xp: number;
}
export const newCampaign = (): Campaign => ({ c: 0, d: 0, pf: 0, flags: [], party: ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi'], dead: [], cursor: { chapter: 0, path: [0] }, log: [], battlesWon: 0, xp: 0 });
const KEY = 'zaryab.save.v1';
export function saveGame(c: Campaign) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* sin storage */ } }
export function loadGame(): Campaign | null { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
export function clearSave() { try { localStorage.removeItem(KEY); } catch { /* */ } }

export function applyEffect(c: Campaign, e?: Effect): string[] {
  if (!e) return [];
  const out: string[] = [];
  const clamp = (n: number) => Math.max(0, Math.min(10, n));
  if (e.c) { c.c = clamp(c.c + e.c); out.push(`${e.c > 0 ? '+' : ''}${e.c} Corrupción`); }
  if (e.d) { c.d = clamp(c.d + e.d); out.push(`${e.d > 0 ? '+' : ''}${e.d} Devoción`); }
  if (e.pf) { c.pf = Math.max(0, c.pf + e.pf); out.push(`${e.pf > 0 ? '+' : ''}${e.pf} PF`); }
  for (const f of e.flags ?? []) if (!c.flags.includes(f)) c.flags.push(f);
  for (const f of e.unflag ?? []) c.flags = c.flags.filter(x => x !== f);
  return out;
}
export const has = (c: Campaign, f: string) => c.flags.includes(f);
