// Simulación sin interfaz con un bot competente. Uso: tsx scripts/sim.ts [encuentro|all] [N] [log]
import { buildBattle } from '../src/engine/setup';
import { runAI } from '../src/engine/ai';
import { setSeed } from '../src/engine/dice';
import { ENCOUNTERS } from '../src/data/maps';
import { PARTY } from '../src/data/party';
import { botSetup, botTurn } from './bot';

export async function playBattle(enc: string, seed: number, verbose = false, party = PARTY.map(p => p.id), opts: { pf?: number; allies?: string[] } = {}) {
  setSeed(seed);
  const b = buildBattle(enc, party, { allies: opts.allies, pf: opts.pf });
  botSetup(b); b.start();
  const everDown = new Set<string>(); let turns = 0;
  while (!b.over && turns < 600) {
    const u = b.cur!; turns++;
    if (u.pcId) await botTurn(b, u); else await runAI(b, u);
    for (const p of b.units) if (p.pcId && (p.down || p.dead)) everDown.add(p.pcId);
    if (!b.over) b.endTurn();
    for (const e of b.takeEvents()) if (verbose && e.t === 'log') console.log(e.text);
  }
  const pcs = b.units.filter(u => u.pcId);
  return { result: b.result ?? 'timeout', round: b.round, downs: everDown.size, dead: pcs.filter(p => p.dead).length, hpLeft: pcs.reduce((s, p) => s + (p.dead ? 0 : Math.max(0, p.hp)), 0) / pcs.reduce((s, p) => s + p.maxHp, 0) };
}
const isMain = import.meta.url === `file://${process.argv[1]}`;
const arg = process.argv[2] || "all"; const N = +(process.argv[3] || 80);
if (!isMain) { /* importado por tune.ts */ }
else if (process.argv[4] === 'log') await playBattle(arg, 1, true);
else {
  console.log('encuentro      victorias  caídos/combate  muertes  rondas  PG restantes');
  for (const enc of arg === 'all' ? Object.keys(ENCOUNTERS) : [arg]) {
    let w = 0, downs = 0, dead = 0, rounds = 0, hp = 0;
    for (let i = 0; i < N; i++) { const r = await playBattle(enc, 5000 + i); if (r.result === 'victory') w++; downs += r.downs; dead += r.dead; rounds += r.round; hp += r.hpLeft; }
    console.log(enc.padEnd(14), `${String(Math.round(w / N * 100)).padStart(5)}%`, `${(downs / N).toFixed(2).padStart(14)}`, `${(dead / N).toFixed(2).padStart(10)}`, `${(rounds / N).toFixed(1).padStart(7)}`, `${Math.round(hp / N * 100)}%`.padStart(10));
  }
}
