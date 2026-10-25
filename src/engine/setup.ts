import { Battle } from './battle';
import { Grid } from './grid';
import { MAPS, ENCOUNTERS } from '../data/maps';
import { PARTY_BY_ID, makePC } from '../data/party';
import { makeFoe } from '../data/monsters';
import type { Unit } from './types';
import type { Grant } from '../state';
import { foeScaleFor } from '../data/difficulty';
import { addFlat } from './dice';
import { initScript } from './scripts';
import { installTwists } from './twists';
import { TWISTS, NO_LAND } from '../data/twists';

import type { Encounter } from '../data/maps';
export interface BuildOpts { foes?: Encounter['foes']; grants?: Record<string, Grant>; pf?: number; miracles?: string[]; allies?: string[]; equip?: Record<string, string[]>; level?: number; flags?: string[]; prog?: Record<string, import('../data/progression').Prog>; inv?: Record<string, number>; edge?: number; powerup?: number; chem?: Record<string, number> }
export function buildBattle(encId: string, partyIds: string[], opts: BuildOpts = {}): Battle {
  const enc = ENCOUNTERS[encId]; const map = MAPS[enc.map]; const grid = new Grid(map.rows, map.objs);
  const units: Unit[] = [];
  partyIds.forEach((id, i) => {
    const u = makePC(PARTY_BY_ID[id], opts.grants?.[id], opts.equip?.[id], opts.prog?.[id]); const p = grid.spawns.pc[i]; if (!p) return;
    u.x = p.x; u.y = p.y; for (const m of opts.miracles ?? []) if (!u.abilities.includes(m)) u.abilities.push(m);
    units.push(u);
  });
  const sc0 = foeScaleFor(encId, enc, opts.level ?? 3, opts.edge ?? 0); const pw = opts.powerup ?? 0;
  const sc = pw ? { hp: (sc0?.hp ?? 1) * (1 + 0.15 * pw), atk: (sc0?.atk ?? 0) + Math.floor(pw / 3), dmg: (sc0?.dmg ?? 0) + Math.floor(pw / 2) } : sc0;
  const scaleFoe = (fu: Unit) => { if (!sc) return; if (sc.hp !== 1) { fu.maxHp = Math.round(fu.maxHp * sc.hp); fu.hp = fu.maxHp; } if (sc.atk) for (const a of fu.actions) if (a.toHit != null) a.toHit += sc.atk; if (sc.dmg) for (const a of fu.actions) if (a.dmg?.length) a.dmg = [{ ...a.dmg[0], dice: addFlat(a.dmg[0].dice, sc.dmg) }, ...a.dmg.slice(1)]; };
  for (const f of opts.foes ?? enc.foes) { const p = grid.spawns.foe[f.slot]; if (!p) throw new Error(`Slot ${f.slot} inexistente en ${map.id}`); const fu = makeFoe(f.id, p.x, p.y, f.suffix ?? ''); scaleFoe(fu); units.push(fu); }
  for (const a of enc.ally ?? []) { const p = grid.spawns.ally[a.slot]; const al = makeFoe(a.id, p.x, p.y, '', 'pc'); al.traits.push('encAlly'); units.push(al); }
  const taken = new Set(units.map(u => u.x + ',' + u.y));
  for (const id of opts.allies ?? []) { // aliados extra: casilla libre junto a la compañía
    const base = grid.spawns.pc[Math.min(1, grid.spawns.pc.length - 1)]; let placed = false;
    for (let r = 1; r < 5 && !placed; r++) for (let dy = -r; dy <= r && !placed; dy++) for (let dx = -r; dx <= r && !placed; dx++) { const x = base.x + dx, y = base.y + dy; const t = grid.at(x, y); if (t && !t.blocked && !taken.has(x + ',' + y)) { units.push(makeFoe(id, x, y, '', 'pc')); taken.add(x + ',' + y); placed = true; } }
  }
  if (enc.surprise) for (const u of units) if (u.sprite !== 'wall' && u.side === (enc.surprise === 'party' ? 'pc' : 'foe')) u.surprised = true;
  const b = new Battle(grid, units); for (const t of map.traps ?? []) b.traps.push({ x: t.x, y: t.y, kind: t.kind, dc: t.dc ?? 14, disarm: t.disarm ?? 13, hidden: true, armed: true }); b.chem = opts.chem ?? {}; b.pfPool = opts.pf ?? 0; b.inv = { ...(opts.inv ?? {}) }; b.maxRounds = enc.duel?.rounds ?? 0; b.surviveRounds = enc.survive ?? 0;
  b.scaleFoe = scaleFoe; b.goalOnly = !!(enc.goal || enc.objective); if (enc.goal) { b.goal = enc.goal; b.goalMsg = enc.goalMsg ?? ''; }
  b.scripted = !!enc.script; if (enc.script) initScript(enc.script, b, opts.flags ?? []);
  const twist = enc.script || enc.duel || enc.soft ? undefined : TWISTS[encId]; installTwists(b, encId, enc.map, opts.level ?? 3, twist, !NO_LAND.has(encId) && !enc.script && !enc.duel && !enc.soft);
  if (enc.waves?.length || enc.script || b.scripts.length) b.onRound = (bb, round) => {
    bb.runScripts(round);
    if (!enc.waves) return;
    const R = round - bb.waveDelay; // la fase de inteligencia puede retrasar las oleadas
    for (const w of enc.waves!) {
      const round = R;
      if (round < w.round || (w.until && round > w.until) || (w.every ? (round - w.round) % w.every !== 0 : round !== w.round)) continue;
      if (w.note) bb.log(w.note, 'sys');
      w.foes.forEach((id, i) => { const spots = grid.spawns.wave.filter(p => !bb.unitAt(p.x, p.y)); const p = spots[(i + round) % Math.max(1, spots.length)]; if (p) { const wf = makeFoe(id, p.x, p.y); scaleFoe(wf); bb.reinforce(wf, p); } });
    }
  };
  return b;
}
