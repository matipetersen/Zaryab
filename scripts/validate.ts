// Validador estático de contenido: encuentros, hablantes, tabla del oráculo, flags de requisitos.
import { QUESTS } from '../src/world/quests';
import { EVENTS } from '../src/world/events';
import { D100, ZONES } from '../src/world/oracle';
import { ENCOUNTERS, MAPS } from '../src/data/maps';
import { MONSTERS } from '../src/data/monsters';
import { SPEAKERS } from '../src/story/speakers';
import { POIS, POI_BY_ID, ROAMER_ENC } from '../src/world/pois';
import { BOONS, BOND_NAME } from '../src/world/bonds';
import { NOVEL } from '../src/story/novel';
import { FRAGS } from '../src/story/novelReact';
import { ARQ, RESURRECCION } from '../src/story/arquetipos';
import { CAP1, CAP2 } from '../src/story/script';
import { Grid } from '../src/engine/grid';
import type { Node } from '../src/story/types';

let bad = 0; const err = (m: string) => { bad++; console.log('✗', m); };
const walk = (nodes: Node[], where: string, f: (n: Node) => void) => { for (const n of nodes) { f(n); if (n.t === 'choice') for (const o of n.options) { if (o.then) walk(o.then, where, f); } if (n.t === 'if') { walk(n.then, where, f); walk(n.else ?? [], where, f); } } };
const check = (nodes: Node[], where: string) => walk(nodes, where, n => {
  if (n.t === 'battle' && !ENCOUNTERS[n.enc]) err(`${where}: encuentro inexistente ${n.enc}`);
  if (n.t === 'say' && !SPEAKERS[n.who]) err(`${where}: hablante sin retrato ${n.who}`);
});
for (const q of QUESTS) check(q.script, q.id);
for (const [k, v] of Object.entries(EVENTS)) check(v, 'ev:' + k);
for (const p of POIS) { check(p.script, 'poi:' + p.id); const j = JSON.stringify(p.script); for (const m of j.matchAll(/"found":\[("[^\]]*)\]/g)) for (const id of m[1].split(',').map(x => x.replace(/"/g, ''))) if (!POI_BY_ID[id]?.hidden) err(`poi ${p.id}: found «${id}» no es un POI oculto`); for (const m of j.matchAll(/"bond":\{"(\w+)"/g)) if (!BOND_NAME[m[1]] || !BOONS[m[1]]) err(`poi ${p.id}: vínculo ${m[1]} sin ventaja`); if (p.hidden && !POIS.some(q => q !== p && JSON.stringify(q.script).includes(`"${p.id}"`))) err(`poi oculto ${p.id}: nadie lo revela`); }
for (const e of Object.values(ROAMER_ENC)) if (!ENCOUNTERS[e]) err(`errante: encuentro ${e}`);
for (const [k, v] of Object.entries(NOVEL)) check(v, 'novel:' + k);
for (const x of FRAGS) check(x.nodes, 'frag:' + x.id);
for (const [k, v] of Object.entries(ARQ)) check(v, 'arq:' + k);
check(RESURRECCION, 'resurreccion');
check(CAP1, 'cap1'); check(CAP2, 'cap2');
for (const e of [...D100, ...Object.values(ZONES).flat()]) { if (e.enc && !ENCOUNTERS[e.enc]) err(`oráculo ${e.n}: encuentro ${e.enc}`); for (const o of e.opts ?? []) o.then && check(o.then, 'oráculo ' + e.n); }
const nums = new Set(D100.map(e => e.n)); const missing: number[] = []; for (let i = 1; i <= 100; i++) if (!nums.has(i)) missing.push(i);
if (D100.length !== nums.size) err('números repetidos en D100');
console.log(`Oráculo d100: ${D100.length} eventos (faltan: ${missing.join(', ') || 'ninguno'}) · zonales: ${Object.values(ZONES).flat().length}`);
for (const [id, e] of Object.entries(ENCOUNTERS)) {
  const m = MAPS[e.map]; if (!m) { err(`encuentro ${id}: mapa ${e.map}`); continue; } const g = new Grid(m.rows);
  for (const f of e.foes) { if (!MONSTERS[f.id]) err(`${id}: monstruo ${f.id}`); if (!g.spawns.foe[f.slot]) err(`${id}: slot ${f.slot} no existe en ${m.id} (${g.spawns.foe.length})`); }
  for (const a of e.ally ?? []) if (!g.spawns.ally[a.slot]) err(`${id}: ally slot ${a.slot}`);
  if (g.spawns.pc.length < 6) err(`${m.id}: sólo ${g.spawns.pc.length} casillas de PJ`);
}
console.log(`${QUESTS.length} misiones · ${Object.keys(ENCOUNTERS).length} encuentros · ${Object.keys(MAPS).length} mapas · ${Object.keys(MONSTERS).length} monstruos`);
console.log(bad ? `${bad} problemas` : 'Contenido válido ✔');
if (bad) process.exit(1);
