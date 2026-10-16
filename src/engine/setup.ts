import { Battle } from './battle';
import { Grid } from './grid';
import { MAPS, ENCOUNTERS } from '../data/maps';
import { PARTY_BY_ID, makePC } from '../data/party';
import { makeFoe } from '../data/monsters';
import type { Unit } from './types';
import type { Grant } from '../state';

import type { Encounter } from '../data/maps';
export interface BuildOpts { foes?: Encounter['foes']; grants?: Record<string, Grant>; pf?: number; miracles?: string[]; allies?: string[] }
export function buildBattle(encId: string, partyIds: string[], opts: BuildOpts = {}): Battle {
  const enc = ENCOUNTERS[encId]; const map = MAPS[enc.map]; const grid = new Grid(map.rows);
  const units: Unit[] = [];
  partyIds.forEach((id, i) => {
    const u = makePC(PARTY_BY_ID[id], opts.grants?.[id]); const p = grid.spawns.pc[i]; if (!p) return;
    u.x = p.x; u.y = p.y; for (const m of opts.miracles ?? []) if (!u.abilities.includes(m)) u.abilities.push(m);
    units.push(u);
  });
  for (const f of opts.foes ?? enc.foes) { const p = grid.spawns.foe[f.slot]; if (!p) throw new Error(`Slot ${f.slot} inexistente en ${map.id}`); const fu = makeFoe(f.id, p.x, p.y, f.suffix ?? ''); const sc = enc.scale; if (sc) { if (sc.hp) { fu.maxHp = Math.round(fu.maxHp * sc.hp); fu.hp = fu.maxHp; } if (sc.atk) for (const a of fu.actions) if (a.toHit != null) a.toHit += sc.atk; } units.push(fu); }
  for (const a of enc.ally ?? []) { const p = grid.spawns.ally[a.slot]; units.push(makeFoe(a.id, p.x, p.y, '', 'pc')); }
  const taken = new Set(units.map(u => u.x + ',' + u.y));
  for (const id of opts.allies ?? []) { // aliados extra: casilla libre junto a la compañía
    const base = grid.spawns.pc[Math.min(1, grid.spawns.pc.length - 1)]; let placed = false;
    for (let r = 1; r < 5 && !placed; r++) for (let dy = -r; dy <= r && !placed; dy++) for (let dx = -r; dx <= r && !placed; dx++) { const x = base.x + dx, y = base.y + dy; const t = grid.at(x, y); if (t && !t.blocked && !taken.has(x + ',' + y)) { units.push(makeFoe(id, x, y, '', 'pc')); taken.add(x + ',' + y); placed = true; } }
  }
  const b = new Battle(grid, units); b.pfPool = opts.pf ?? 0;
  if (enc.waves?.length) b.onRound = (bb, round) => {
    for (const w of enc.waves!) {
      if (round < w.round || (w.until && round > w.until) || (w.every ? (round - w.round) % w.every !== 0 : round !== w.round)) continue;
      if (w.note) bb.log(w.note, 'sys');
      w.foes.forEach((id, i) => { const spots = grid.spawns.wave.filter(p => !bb.unitAt(p.x, p.y)); const p = spots[(i + round) % Math.max(1, spots.length)]; if (p) bb.reinforce(makeFoe(id, p.x, p.y), p); });
    }
  };
  return b;
}
