// La carrera por los fragmentos: otras facciones buscan el mismo fragmento que la compañía.
// Cada rival camina por los caminos de la ciudad hasta el barrio del próximo fragmento y, cuando ese capítulo
// ya se puede jugar, se pone a excavar. Si termina antes que la compañía, «llega primero»: no se queda con el
// fragmento (la historia sigue igual), pero gana fuerza en la ciudad y les cobra algo. Las marcas `rival_<frag>`
// quedan para que, más adelante, cada capítulo pueda arrancar distinto según quién llegó antes.
import type { Campaign } from '../state';
import { has } from '../state';
import { ROADS, DISTRICT_BY_ID } from './districts';

export type RivalId = 'conclave' | 'culto' | 'thay';
export interface RivalState { at: string; prog: number; power: number; step: number; wins: string[] }
export interface Frag { id: string; cap: number; district: string; name: string; not?: RivalId[] }

/** Fragmentos en disputa, en orden de historia. Los del Acto I llegan antes de que estalle la guerra civil. */
export const FRAGS: Frag[] = [
  { id: 'dahhak', cap: 7, district: 'iglesia', name: 'el fragmento de Dahhak', not: ['culto'] },   // el Culto defiende a su dios, no lo saquea
  { id: 'marid', cap: 9, district: 'jardin', name: 'el fragmento del Marid' },
  { id: 'mazhar', cap: 10, district: 'bajo', name: 'el fragmento de Al-Mazhar' },
  { id: 'gusano', cap: 11, district: 'mina', name: 'el fragmento de Gul-Amarat' },
  { id: 'razul', cap: 12, district: 'ciudadela', name: 'el fragmento de Razul', not: ['conclave'] }, // el Conclave lo custodia
];

export const RIVALS: Record<RivalId, { name: string; short: string; icon: string; color: string; home: string; from: string; why: string }> = {
  conclave: { name: 'El Conclave de los Siete Vientos', short: 'Conclave', icon: '♛', color: '#c9a45c', home: 'plaza', from: 'cap5_done',
    why: 'Razul quiere los fragmentos bajo llave: un dios suelto es una ciudad que deja de obedecer.' },
  culto: { name: 'El Culto de Dahhak', short: 'Culto', icon: '🐍', color: '#c06a8a', home: 'acueductos', from: 'cap5_done',
    why: 'Quieren cuellos nuevos para su señor. Cada fragmento es una voz más.' },
  thay: { name: 'El Consulado de Thay', short: 'Thay', icon: '✶', color: '#9b7fe0', home: 'zoco', from: 'cap6_done',
    why: 'Kethras compra todo lo que brilla. A Thay no le importa Zaryab: le importa lo que se lleva.' },
};
export const RIVAL_IDS = Object.keys(RIVALS) as RivalId[];

const ENV = (globalThis as any).process?.env ?? {};
/** Días que tarda un rival en cruzar de un barrio al siguiente. */
export const STEP_DAYS = 1;
/** Avance base de excavación por día (sobre 100). */
export const BASE_RATE: Record<RivalId, number> = { conclave: +(ENV.RV_CON ?? 7.1), culto: +(ENV.RV_CUL ?? 9.1), thay: +(ENV.RV_THAY ?? 8.2) };

const ADJ: Record<string, string[]> = {};
for (const [a, b] of ROADS) { (ADJ[a] ??= []).push(b); (ADJ[b] ??= []).push(a); }
/** Camino más corto entre dos barrios (incluye el origen y el destino). */
export function route(from: string, to: string): string[] {
  if (from === to) return [from];
  const prev: Record<string, string> = { [from]: from }; const q = [from];
  while (q.length) { const x = q.shift()!; for (const y of ADJ[x] ?? []) if (!(y in prev)) { prev[y] = x; if (y === to) { const p = [to]; let k = to; while (k !== from) { k = prev[k]; p.unshift(k); } return p; } q.push(y); } }
  return [from];
}

/** El fragmento por el que se corre ahora: el primero cuyo capítulo no está hecho. */
export function currentFrag(c: Campaign): Frag | undefined { return FRAGS.find(f => !has(c, `cap${f.cap}_done`)); }
/** La compañía ya puede jugar ese capítulo: recién ahí se puede excavar. */
export const fragOpen = (c: Campaign, f: Frag) => has(c, `cap${f.cap - 1}_done`) && !has(c, `cap${f.cap}_done`);
export const raceActive = (c: Campaign) => has(c, 'cap5_done') && !has(c, 'cap12_done');
export const inRace = (c: Campaign, r: RivalId, f: Frag) => has(c, RIVALS[r].from) && !f.not?.includes(r);
/** Alguien ya llegó primero a este fragmento. */
export const claimedBy = (c: Campaign, f: Frag): RivalId | undefined => RIVAL_IDS.find(r => has(c, `rival_${f.id}_${r}`));

export function ensureRivals(c: Campaign) {
  c.rivals ??= {} as Campaign['rivals'];
  for (const r of RIVAL_IDS) c.rivals[r] ??= { at: RIVALS[r].home, prog: 0, power: 0, step: 0, wins: [] };
}

/** Velocidad de excavación de hoy: barrios que domina, Alerta (al Conclave lo ayuda la ciudad en guardia), desorden (a Thay) y victorias previas. */
export function rate(c: Campaign, r: RivalId): number {
  const held = Object.values(c.front).filter(f => f === r).length;
  const chaos = Object.values(c.front).filter(f => f !== 'libre').length;
  let k = 1 + 0.18 * held + 0.15 * c.rivals[r].power;
  if (r === 'conclave') k *= 1 + c.alert / 40;
  if (r === 'culto' && has(c, 'cap7_done')) k *= 1.15; // sin su dios, el Culto se desespera: cava con más furia
  if (r === 'thay') k *= 1 + 0.05 * chaos;
  return BASE_RATE[r] * k;
}
/** Días que le faltan a un rival para terminar (caminar + excavar), si nadie lo frena. */
export function eta(c: Campaign, r: RivalId, f: Frag): number {
  const s = c.rivals[r]; const hops = route(s.at, f.district).length - 1;
  const walk = hops ? hops * STEP_DAYS - s.step : 0; return Math.ceil(walk + (100 - s.prog) / rate(c, r));
}

const FIRST: Record<RivalId, (f: Frag) => string> = {
  conclave: f => `El Conclave llegó primero a ${f.name}: los ibis negros ya custodian el lugar. +2 Alerta, y la Guardia sale a las calles.`,
  culto: f => `El Culto de Dahhak llegó primero a ${f.name}: lo bañaron en sangre y cantos. −4 PF: los seguidores lo sienten en el cristal.`,
  thay: f => `Thay llegó primero a ${f.name}: Kethras compró a medio barrio para quedarse con el mapa. Se llevan 2 rumores y 20 PO de sus informantes.`,
};
/** Un rival terminó antes que la compañía. */
function arrive(c: Campaign, r: RivalId, f: Frag): string {
  const s = c.rivals[r]; s.power++; s.wins.push(f.id); c.flags.push(`rival_${f.id}`, `rival_${f.id}_${r}`);
  if (r === 'conclave') c.alert = Math.min(10, c.alert + 2);
  if (r === 'culto') c.pf = Math.max(0, c.pf - 4);
  if (r === 'thay') { c.rumors = Math.max(0, c.rumors - 2); c.gold = Math.max(0, c.gold - 20); }
  // gana un barrio del frente (Thay no tiene tropas: le deja el lugar al Conclave)
  const side = r === 'thay' ? 'conclave' : r; const cand = Object.keys(c.front).filter(d => c.front[d] !== side && DISTRICT_BY_ID[d]?.open(c));
  let extra = '';
  if (cand.length) { const d = cand[Math.floor(Math.random() * cand.length)]; c.front[d] = side; extra = ` ${DISTRICT_BY_ID[d].name} pasa a manos del ${side === 'conclave' ? 'Conclave' : 'Culto'}.`; }
  return FIRST[r](f) + extra;
}

/** Un día de carrera. Devuelve las líneas para el Diario. */
export function rivalsDay(c: Campaign): string[] {
  const out: string[] = []; if (!raceActive(c)) return out; ensureRivals(c);
  const f = currentFrag(c); if (!f) return out;
  // cambió el fragmento en disputa: se reinicia la excavación (las posiciones y la fuerza se conservan)
  if (c.rivalFrag !== f.id) { const prev = FRAGS.find(x => x.id === c.rivalFrag); c.rivalFrag = f.id;
    if (prev && !claimedBy(c, prev)) { const close = RIVAL_IDS.filter(r => c.rivals[r].prog >= 60); if (close.length) out.push(`Llegaron antes que ${close.map(r => RIVALS[r].short).join(' y ')} a ${prev.name}: se quedan con las manos vacías.`); }
    for (const r of RIVAL_IDS) { c.rivals[r].prog = 0; }
    if (has(c, 'cap5_done')) out.push(`Se corre la voz: ${f.name} está en ${DISTRICT_BY_ID[f.district].name}. Otros también lo buscan.`);
  }
  if (claimedBy(c, f)) return out; // ya llegó alguien: los demás esperan a ver qué hace la compañía
  for (const r of RIVAL_IDS) {
    if (!inRace(c, r, f)) continue; const s = c.rivals[r];
    if (s.at !== f.district) { s.step++; if (s.step >= STEP_DAYS) { s.step = 0; const p = route(s.at, f.district); s.at = p[1] ?? s.at; } continue; }
    if (!fragOpen(c, f)) continue; // ya están ahí, pero todavía no saben dónde cavar
    s.prog = Math.min(100, s.prog + rate(c, r) * (0.3 + 1.4 * Math.random())); // días buenos y días malos: no siempre gana el más rápido
    if (s.prog >= 100) { out.push(arrive(c, r, f)); break; }
  }
  return out;
}

/** Golpes de la compañía que frenan a un rival (un errante abatido, un frente reforzado). */
export function setback(c: Campaign, r: RivalId, n: number): string | null {
  if (!raceActive(c)) return null; ensureRivals(c); const s = c.rivals[r]; if (s.prog <= 0) return null;
  s.prog = Math.max(0, s.prog - n); return `${RIVALS[r].short} pierde terreno en la carrera (−${n}).`;
}

/** Espiar a los rivales: con información fresca se ve el avance exacto y cuánto les falta. */
export const INTEL_COST = 2;
/** Espiar: se ve el avance exacto y, de paso, los informantes le venden a Thay un mapa falso. */
export function spy(c: Campaign): string {
  c.rumors -= INTEL_COST; c.rivalIntel = c.day; const sb = setback(c, 'thay', 15);
  return `Sus informantes siguen a los rivales${sb ? ' y le venden a Kethras un mapa falso: ' + sb : '.'}`;
}
export const intelFresh = (c: Campaign) => (c.rivalIntel ?? -9) >= c.day - 1;
export function band(c: Campaign, r: RivalId, f: Frag): string {
  const s = c.rivals[r]; if (!inRace(c, r, f)) return f.not?.includes(r) ? 'no compite por este' : 'todavía no entra en juego';
  if (claimedBy(c, f) === r) return 'llegó primero';
  if (s.at !== f.district) { const hops = route(s.at, f.district).length - 1; return `en camino · a ${hops} barrio${hops > 1 ? 's' : ''}`; }
  if (!fragOpen(c, f)) return 'esperando en el lugar';
  if (intelFresh(c)) { const n = eta(c, r, f); return `${Math.floor(s.prog)} % · le falta${n === 1 ? ' 1 día' : `n ${n} días`}`; }
  return s.prog < 35 ? 'recién empieza a cavar' : s.prog < 70 ? 'cava a buen ritmo' : '¡a punto de llegar!';
}
