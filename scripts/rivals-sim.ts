// Simula la carrera por los fragmentos día por día, con el mundo real (frentes, errantes, Alerta, rivales) y
// jugadores de distinto ritmo. No juega las escenas ni los combates: marca cada capítulo como hecho cuando el
// jugador lo empezaría y cuenta los días que dura.
// Uso: tsx scripts/rivals-sim.ts [N=400] [semilla=1]
import { newCampaign, type Campaign } from '../src/state';
import { worldDay } from '../src/world/world';
import { FRAGS, RIVAL_IDS, RIVALS, currentFrag, fragOpen, inRace, eta, ensureRivals, setback, claimedBy, spy, INTEL_COST, type RivalId } from '../src/world/rivals';
import { HOSTILE } from '../src/world/pois';

const N = +(process.argv[2] || 400); let seed = +(process.argv[3] || 1);
// azar reproducible: el mundo usa Math.random
Math.random = () => { seed = (seed + 0x6d2b79f5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/** Días que dura cada capítulo principal (world/quests.ts). */
const DAYS: Record<number, number> = { 6: 4, 7: 3, 8: 1, 9: 3, 10: 3, 11: 4, 12: 3, 13: 2 };
interface Profile { name: string; gap: number; jitter: number; hunt: number; fortify: number; calm: number; spy?: boolean; desc: string }
const PROFILES: Profile[] = [
  { name: 'directo', gap: 1, jitter: 1, hunt: 0.15, fortify: 0.05, calm: 0.1, desc: 'va de capítulo en capítulo' },
  { name: 'normal', gap: 4, jitter: 2, hunt: 0.45, fortify: 0.15, calm: 0.2, desc: 'hace alguna secundaria entre capítulos' },
  { name: 'explorador', gap: 7, jitter: 3, hunt: 0.5, fortify: 0.2, calm: 0.25, desc: 'recorre la ciudad entre capítulos' },
  { name: 'atento', gap: 7, jitter: 3, hunt: 0.95, fortify: 0.5, calm: 0.4, spy: true, desc: 'el mismo ritmo que el explorador, pero caza errantes, refuerza barrios y espía' },
  { name: 'lento', gap: 11, jitter: 3, hunt: 0.3, fortify: 0.1, calm: 0.15, desc: 'se demora mucho y no frena a nadie' },
];

function day(c: Campaign) { c.day++; c.alertTick++; worldDay(c); if (c.alertTick >= 3) { c.alertTick = 0; c.alert = Math.min(10, c.alert + 1); } }
/** Un día libre en el hub: el jugador a veces caza errantes, refuerza un barrio o baja la Alerta. */
function hubDay(c: Campaign, p: Profile) {
  const r = c.roamers.find(x => HOSTILE.includes(x.kind));
  if (r && Math.random() < p.hunt) { c.roamers = c.roamers.filter(x => x !== r); c.alert = Math.max(0, c.alert - 1); setback(c, r.kind as RivalId, 30); }
  else if (Math.random() < p.fortify) { const d = Object.keys(c.front).find(k => HOSTILE.includes(c.front[k])); if (d) { const was = c.front[d]; c.front[d] = 'libre'; setback(c, was as RivalId, 15); } }
  if (Math.random() < p.calm) c.alert = Math.max(0, c.alert - 1);
  if (p.spy && c.rumors >= INTEL_COST && (c.rivals.thay.prog ?? 0) > 30) spy(c);
  if (c.day % 3 === 0) c.rumors++; // los seguidores traen rumores
  day(c);
}
/** Punto de partida: justo después de la caída del Capitolio (día y Alerta típicos de la campaña completa). */
function start(): Campaign {
  const c = newCampaign(); c.day = 24; c.alert = 3; c.pf = 30; c.rumors = 4; c.gold = 200;
  for (let i = 0; i <= 5; i++) c.flags.push(`cap${i}_done`); ensureRivals(c); return c;
}

interface Run { wins: Record<string, RivalId | undefined>; window: Record<string, number> }
function campaign(p: Profile): Run {
  const c = start(); const run: Run = { wins: {}, window: {} };
  for (let cap = 6; cap <= 12; cap++) {
    const gap = Math.max(0, p.gap + Math.round((Math.random() * 2 - 1) * p.jitter));
    for (let i = 0; i < gap; i++) {
      hubDay(c, p);
      const f = currentFrag(c); // al abrirse un fragmento, ¿cuántos días de colchón hay hasta que el rival más rápido termine?
      if (f && fragOpen(c, f) && run.window[f.id] === undefined) run.window[f.id] = Math.min(...RIVAL_IDS.filter(r => inRace(c, r, f)).map(r => eta(c, r, f)));
    }
    const f = FRAGS.find(x => x.cap === cap); if (f) { if (run.window[f.id] === undefined) run.window[f.id] = Math.min(...RIVAL_IDS.filter(r => inRace(c, r, f)).map(r => eta(c, r, f))); run.wins[f.id] = claimedBy(c, f); }
    c.flags.push(`cap${cap}_done`); c.lastMainDay = c.day; for (let i = 0; i < DAYS[cap]; i++) day(c);
  }
  return run;
}

const pct = (n: number, d: number) => `${Math.round(100 * n / d)}%`.padStart(5);
console.log(`Carrera por los fragmentos · ${N} campañas por ritmo de jugador\n`);
console.log(`${'ritmo'.padEnd(11)} ${'llegan primero'.padEnd(15)} ${'ninguna'.padStart(7)}   ${FRAGS.map(f => f.id.padStart(7)).join('')}   ${RIVAL_IDS.map(r => RIVALS[r].short.padStart(9)).join('')}`);
for (const p of PROFILES) {
  let total = 0, clean = 0; const per: Record<string, number> = {}; const by: Record<string, number> = {}; const win: Record<string, number[]> = {};
  for (let i = 0; i < N; i++) {
    const r = campaign(p); const ws = Object.entries(r.wins).filter(([, v]) => v); total += ws.length; if (!ws.length) clean++;
    for (const [f, v] of ws) { per[f] = (per[f] ?? 0) + 1; by[v!] = (by[v!] ?? 0) + 1; }
    for (const [f, w] of Object.entries(r.window)) (win[f] ??= []).push(w);
  }
  console.log(`${p.name.padEnd(11)} ${(total / N).toFixed(2).padStart(5)} por partida ${pct(clean, N).padStart(7)}   ${FRAGS.map(f => pct(per[f.id] ?? 0, N).padStart(7)).join('')}   ${RIVAL_IDS.map(r => (total ? pct(by[r] ?? 0, total) : '  -').padStart(9)).join('')}   (${p.desc})`);
  if (p.name === 'normal') console.log(`${''.padEnd(11)} colchón medio al abrirse cada fragmento: ${FRAGS.map(f => `${f.id} ${(win[f.id].reduce((a, b) => a + b, 0) / win[f.id].length).toFixed(1)} d`).join(' · ')}`);
}
console.log('\n«llegan primero»: fragmentos por partida a los que un rival llegó antes · «ninguna»: partidas sin perder ninguna carrera.');
console.log('Columnas por fragmento: % de partidas en que un rival llegó primero · por facción: reparto de esas llegadas.');
