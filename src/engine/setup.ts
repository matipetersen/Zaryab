import { Battle } from './battle';
import { Grid } from './grid';
import { MAPS, ENCOUNTERS } from '../data/maps';
import { PARTY_BY_ID, makePC } from '../data/party';
import { makeFoe } from '../data/monsters';
import type { Unit } from './types';

import type { Encounter } from '../data/maps';
export function buildBattle(encId: string, partyIds: string[], opts: { foes?: Encounter['foes'] } = {}): Battle {
  const enc = ENCOUNTERS[encId]; const map = MAPS[enc.map]; const grid = new Grid(map.rows);
  const units: Unit[] = [];
  partyIds.forEach((id, i) => {
    const u = makePC(PARTY_BY_ID[id]); const p = grid.spawns.pc[i]; if (!p) return;
    u.x = p.x; u.y = p.y;
    units.push(u);
  });
  for (const f of opts.foes ?? enc.foes) { const p = grid.spawns.foe[f.slot]; if (!p) throw new Error(`Slot ${f.slot} inexistente en ${map.id}`); units.push(makeFoe(f.id, p.x, p.y, f.suffix ?? '')); }
  for (const a of enc.ally ?? []) { const p = grid.spawns.ally[a.slot]; units.push(makeFoe(a.id, p.x, p.y, '', 'pc')); }
  return new Battle(grid, units);
}
