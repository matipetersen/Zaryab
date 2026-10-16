import { buildBattle } from '../src/engine/setup';
import { runAI } from '../src/engine/ai';
import { setSeed } from '../src/engine/dice';
import { progUpTo } from '../src/data/progression';
import { botSetup, botTurn } from './bot';
import { rotate, raiseAlert, OBJECTS } from '../src/engine/cube';
import { ROT_SEQ } from '../src/data/maunator';
setSeed(3);
const party = ['pact', 'rabb', 'joren', 'zyrthar', 'panchi'];
const b = buildBattle('cubo_maunator', party, { level: 8, prog: Object.fromEntries(party.map(id => [id, progUpTo(id, 8)])), flags: ['mz_sabe_cubo'] });
botSetup(b); b.start();
console.log('mapa', b.grid.w, 'x', b.grid.h, 'unidades', b.units.length, 'objs', b.grid.tiles.flat().filter(t => t.obj).length);
const count = () => b.grid.tiles.flat().reduce((m, t) => { m[t.ch] = (m[t.ch] ?? 0) + 1; return m; }, {} as Record<string, number>);
const before = JSON.stringify(count());
for (let i = 0; i < 16; i++) { const r = ROT_SEQ[i % 8]; rotate(b, r.k, r.i, r.d, r.label); }
console.log('tiles iguales tras 16 rotaciones (2 ciclos):', before === JSON.stringify(count()), 'layout', b.cube!.layout.join(','));
const bad = b.units.filter(u => !u.dead && b.grid.at(u.x, u.y)?.blocked); console.log('unidades en muro:', bad.length);
raiseAlert(b, 2, 'prueba');
let turns = 0;
while (!b.over && turns < 400) { const u = b.cur!; turns++; if (u.pcId) await botTurn(b, u); else await runAI(b, u); if (!b.over) b.endTurn(); b.takeEvents(); }
console.log('fin', b.result, 'ronda', b.round, 'alerta', b.cube!.alert, 'kethras', b.cube!.kethras, 'pudin', b.cube!.pudding, 'vivos pcs', b.units.filter(u => u.pcId && !u.dead).length);
console.log('objetos restantes', b.grid.tiles.flat().filter(t => t.obj).map(t => t.obj).join(','));
void OBJECTS;
