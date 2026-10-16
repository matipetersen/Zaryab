import { buildBattle } from '../src/engine/setup';
import { setSeed } from '../src/engine/dice';
import { OBJECTS } from '../src/engine/cube';
setSeed(5);
const party = ['pact', 'rabb', 'joren', 'zyrthar', 'panchi'];
const b = buildBattle('cubo_maunator', party, { level: 8, flags: [] }); b.start();
const pc = b.units.find(u => u.pcId === 'zyrthar')!;
const tiles = b.grid.tiles.flatMap((row, y) => row.map((t, x) => ({ x, y, obj: t.obj }))).filter(t => t.obj);
for (const t of tiles) {
  pc.x = t.x; pc.y = t.y; pc.actionUsed = false; pc.extraActions = 0; pc.attacksMade = 0; pc.moveLeft = 6;
  const o = OBJECTS[t.obj!]; const ch = o.choices?.[0]?.id;
  try { const r = b.interact(pc, t.x, t.y, ch); console.log(t.obj!.padEnd(16), r.ok ? 'ok' : r.msg, '|', b.takeEvents().filter(e => e.t === 'log').map((e: any) => e.text).slice(-1)[0]?.slice(0, 90)); } catch (e) { console.log(t.obj, 'ERROR', (e as Error).message); }
}
console.log('carry', Object.keys(b.carry).join(','), 'flagsOut', [...b.storyFlagsOut].join(','), 'alerta', b.cube!.alert, 'resultado', b.result);
// salida con las tres calaveras
pc.actionUsed = false; pc.attacksMade = 0;
const sal = b.grid.tiles.flatMap((row, y) => row.map((t, x) => ({ x, y, obj: t.obj }))).find(t => t.obj === 'salida');
console.log('salida aún presente:', !!sal);
