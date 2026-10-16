import type { Campaign } from '../state';
import { has } from '../state';
import { DISTRICT_BY_ID } from './districts';
import { FRONT_DISTRICTS, FRONT_LABEL, HOSTILE, ROAMER_ENC } from './pois';

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
/** Frentes de la guerra civil: arrancan al caer el Capitolio y cambian de manos cada pocos días. */
export function ensureFronts(c: Campaign) {
  if (!has(c, 'cap5_done') || Object.keys(c.front).length) return;
  c.front = { plaza: 'conclave', zoco: 'conclave', bajo: 'libre', acueductos: 'culto', medinat: 'nasnas' };
}
const weights = (c: Campaign): [string, number][] => [['conclave', 1 + c.alert / 3], ['culto', has(c, 'cap7_done') ? 0.6 : 1.2], ['nasnas', 1], ['libre', Math.max(0.3, 1.6 - c.alert / 5)]];
function shiftFront(c: Campaign): string {
  const ds = FRONT_DISTRICTS.filter(d => DISTRICT_BY_ID[d].open(c)); const d = pick(ds); const cur = c.front[d];
  const ws = weights(c).filter(([f]) => f !== cur); const tot = ws.reduce((a, [, w]) => a + w, 0); let r = Math.random() * tot; let nf = ws[0][0];
  for (const [f, w] of ws) { r -= w; if (r <= 0) { nf = f; break; } }
  c.front[d] = nf; const nm = DISTRICT_BY_ID[d].name;
  if (nf === 'conclave') { c.alert = Math.min(10, c.alert + 1); return `El Conclave toma ${nm}: +1 Alerta.`; }
  if (nf === 'culto') { c.pf = Math.max(0, c.pf - 2); return `El Culto de Dahhak infiltra ${nm}: −2 PF.`; }
  if (nf === 'nasnas') return `Los Nasnas levantan barricadas en ${nm}.`;
  return `${nm} queda libre: los vecinos respiran.`;
}
function spawnRoamer(c: Campaign): string | null {
  if (c.roamers.length >= 3) return null;
  const ds = FRONT_DISTRICTS.filter(d => DISTRICT_BY_ID[d].open(c) && ROAMER_ENC[c.front[d]] && !c.roamers.some(r => r.district === d)); if (!ds.length) return null;
  const d = pick(ds); const f = c.front[d]; c.roamers.push({ id: `r${c.day}_${Math.floor(Math.random() * 1000)}`, district: d, kind: f, since: c.day });
  const who = f === 'conclave' ? 'Un recaudador del Conclave' : f === 'culto' ? 'Un infiltrado del Culto' : 'Una partida de ghuls hambrientos';
  return `${who} merodea por ${DISTRICT_BY_ID[d].name}. Si lo ignoráis, subirá la Alerta.`;
}
/** Un día de mundo vivo. Devuelve las líneas para el Diario. */
export function worldDay(c: Campaign): string[] {
  const out: string[] = []; if (!has(c, 'cap5_done')) return out; ensureFronts(c);
  c.frontTick++; if (c.frontTick >= 6) { c.frontTick = 0; out.push(shiftFront(c)); }
  c.roamerTick++; if (c.roamerTick >= 4) { c.roamerTick = 0; const s = spawnRoamer(c); if (s) out.push(s); }
  const stale = c.roamers.filter(r => c.day - r.since >= 8);
  if (stale.length) { c.roamers = c.roamers.filter(r => !stale.includes(r)); c.alert = Math.min(10, c.alert + stale.length); out.push(`Dejasteis a ${stale.length} errante(s) a su aire: +${stale.length} Alerta.`); }
  return out;
}
export const hostile = (c: Campaign, d: string) => HOSTILE.includes(c.front[d]);
export const frontName = (c: Campaign, d: string) => FRONT_LABEL[c.front[d]] ?? '';
