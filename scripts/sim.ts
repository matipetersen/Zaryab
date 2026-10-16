// Simulación sin interfaz: PCs y monstruos controlados por IA, para detectar errores del motor.
import { buildBattle } from '../src/engine/setup';
import { runAI } from '../src/engine/ai';
import { setSeed } from '../src/engine/dice';
import { ENCOUNTERS } from '../src/data/maps';
import { PARTY } from '../src/data/party';
import type { Unit, MAction } from '../src/engine/types';
import { cheb } from '../src/engine/grid';

function pcActions(u: Unit): MAction[] {
  return u.weapons.filter(w => !w.bonusAction && w.id !== 'longbow_ss').map(w => ({ id: w.id, name: w.name, kind: w.ranged ? 'ranged' : 'melee', toHit: w.toHit, reach: w.range, dmg: w.dmg } as MAction));
}
async function playBattle(enc: string, seed: number, verbose = false) {
  setSeed(seed);
  const b = buildBattle(enc, PARTY.map(p => p.id));
  for (const u of b.units) if (u.side === 'pc') { u.ai = true; u.actions = pcActions(u); }
  b.start();
  let turns = 0;
  while (!b.over && turns < 400) {
    const u = b.cur!; turns++;
    if (u.side === 'pc' && !u.down) {
      // curación simple de Romain
      const hurt = b.units.find(a => a.side === 'pc' && !a.dead && a.hp < a.maxHp * 0.5 && !a.down);
      const downed = b.units.find(a => a.side === 'pc' && a.down && !a.dead);
      if (u.id === 'romain' && (downed || hurt)) {
        const t = downed ?? hurt!; const r = b.useAbility(u, 'healing_word', t); if (!r.ok && verbose) console.log('HW fail', r.msg);
      }
      if (u.id === 'rabb') b.useAbility(u, 'hexblades_curse', b.foesOf(u)[0]);
      if (u.id === 'romain' && b.foesOf(u).some(f => f.undead)) b.useAbility(u, 'turn_undead', undefined);
      if (u.id === 'romain' && !u.actionUsed) { const f = b.foesOf(u).sort((x, y) => cheb(x, u) - cheb(y, u))[0]; if (f && cheb(f, u) <= 24) b.useAbility(u, 'guiding_bolt', f); }
    }
    await runAI(b, u);
    if (!b.over) b.endTurn();
    if (verbose) for (const e of b.takeEvents()) if (e.t === 'log') console.log(e.text); else b.takeEvents();
    else b.takeEvents();
  }
  const pcs = b.units.filter(u => u.side === 'pc');
  return { result: b.result ?? 'timeout', round: b.round, alive: pcs.filter(p => !p.dead && !p.down).length, dead: pcs.filter(p => p.dead).length };
}
const arg = process.argv[2];
if (arg === 'log') { await playBattle(process.argv[3] || 'linyera', Number(process.argv[4] || 1), true); }
else {
  for (const enc of (process.argv[2] && process.argv[2] !== 'log' ? [process.argv[2]] : Object.keys(ENCOUNTERS))) {
    const stats = { victory: 0, defeat: 0, timeout: 0, rounds: 0, deaths: 0 }; const N = 60;
    for (let i = 0; i < N; i++) { const r = await playBattle(enc, 1000 + i); stats[r.result as 'victory']++; stats.rounds += r.round; stats.deaths += r.dead; }
    console.log(enc.padEnd(10), `victorias ${stats.victory}/${N}`, `derrotas ${stats.defeat}`, `timeouts ${stats.timeout}`, `rondas medias ${(stats.rounds / N).toFixed(1)}`, `muertes medias ${(stats.deaths / N).toFixed(2)}`);
  }
}
