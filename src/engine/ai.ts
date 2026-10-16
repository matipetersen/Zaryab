import type { Battle } from './battle';
import type { Unit, MAction } from './types';
import { cheb, key, P } from './grid';
import { avg } from './dice';

type Pause = (ms?: number) => Promise<void>;
export type Bias = (t: Unit) => number;
const sleep0: Pause = async () => {};

interface Option { score: number; tile: P; action?: MAction; target?: Unit | P; why: string }

function candidateTargets(b: Battle, u: Unit): Unit[] {
  const cs = b.status(u, 'charmed')?.src;
  return b.foesOf(u).filter(t => t.sprite !== 'wall' && b.targetable(u, t) && t.uid !== cs);
}
function actionRange(a: MAction) { return a.reach; }

function scoreAction(b: Battle, u: Unit, a: MAction, from: P, t: Unit, fs: Unit[], bias?: Bias): number {
  const saveX = u.x, saveY = u.y; u.x = from.x; u.y = from.y;
  try {
    const dist = cheb(from, t);
    if (dist > actionRange(a) && !(a.aoeSelf)) return -1;
    if (a.kind !== 'save' || !a.aoeSelf) { if (dist > 1 && !b.canSee(u, t).visible) return -1; }
    let s = 0;
    if (a.aoe) {
      const c: P = a.aoeSelf ? from : t;
      for (const v of fs) if (cheb(v, c) <= a.aoe) s += b.expectedDamage(u, a, v) * (v.down ? 0.3 : 1);
      for (const v of b.alliesOf(u)) if (v !== u && cheb(v, c) <= a.aoe) s -= b.expectedDamage(u, a, v) * 1.2;
      if (a.aoeSelf && cheb(from, t) > a.aoe) return -1;
      if (s <= 0) return -1;
    } else {
      s = b.expectedDamage(u, a, t) * (t.down ? 0.3 : 1);
      if (!a.dmg && a.save?.cond) s = 4;           // control puro
      if (a.save?.cond && a.dmg) s += 2;
      if (a.save?.cond === 'disadvNext') s += 1;
    }
    if (a.recharge) s *= 1.15;
    const dmgEst = b.expectedDamage(u, a, t); if (!t.down && dmgEst >= t.hp) s += 12;
    s += (1 - t.hp / t.maxHp) * 3;
    if (t.mods.wis >= 3 && t.abilities.some(x => x === 'cure_wounds')) s += 1.5; // curanderos
    if (bias) s += bias(t);
    return s;
  } finally { u.x = saveX; u.y = saveY; }
}

function bestOption(b: Battle, u: Unit, acts: MAction[], tiles: P[], bias?: Bias): Option | undefined {
  const fs = candidateTargets(b, u); let best: Option | undefined;
  for (const tile of tiles) for (const a of acts) {
    if (a.kind === 'heal' || a.kind === 'buff' || a.kind === 'summon') continue;
    if (a.recharge && !u.rechargeReady[a.id]) continue;
    for (const t of fs) {
      const sc = scoreAction(b, u, a, tile, t, fs, bias); if (sc < 0) continue;
      const trav = cheb(tile, u) * 0.01; const here = tile.x === u.x && tile.y === u.y ? 0.05 : 0;
      const total = sc - trav + here;
      if (!best || total > best.score) best = { score: total, tile, action: a, target: a.aoe && !a.aoeSelf ? { x: t.x, y: t.y } : t, why: a.name };
    }
  }
  return best;
}

async function doMove(b: Battle, u: Unit, tile: P, pause: Pause) {
  if (tile.x === u.x && tile.y === u.y) return;
  const r = b.move(u, tile.x, tile.y); if (r.ok) await pause(380);
}
function fleeTile(b: Battle, u: Unit, src: Unit | undefined): P | undefined {
  if (!src) return undefined; let best: P | undefined, bd = cheb(u, src);
  for (const v of [...b.reach(u).values()].filter(v => !v.occ)) { const d = cheb(v, src); if (d > bd) { bd = d; best = { x: v.x, y: v.y }; } }
  return best;
}

/** Turno completo de una unidad controlada por IA. */
export async function runAI(b: Battle, u: Unit, pause: Pause = sleep0, bias?: Bias): Promise<void> {
  if (u.dead || u.down) return;
  if (b.has(u, 'frightened')) {
    const s = b.status(u, 'frightened')!; const src = s.src ? b.byUid(s.src) : undefined;
    const t = fleeTile(b, u, src); if (t) await doMove(b, u, t, pause); b.log(`${u.name} huye aterrado.`, 'sys'); return;
  }
  if (b.has(u, 'charmed') && candidateTargets(b, u).length === 0) return;
  const maxActs = 1 + u.multiattack.length * 0;
  void maxActs;
  // 1) multiataque
  const seq = u.multiattack.length ? u.multiattack.map(id => u.actions.find(a => a.id === id)!) : [];
  for (let guard = 0; guard < 3 && !b.over; guard++) {
    const tiles = [...b.reach(u).values()].filter(v => !v.occ).map(v => ({ x: v.x, y: v.y }));
    const acts = u.actions.filter(a => !u.actionUsed || (seq.length && seq.includes(a)));
    if (u.actionUsed && !(seq.length && u.attacksMade > 0 && u.attacksMade < seq.length)) break;
    // opciones con la acción principal (o la siguiente del multiataque)
    const pool = seq.length && u.attacksMade > 0 ? [seq[u.attacksMade]] : (seq.length ? [...u.actions.filter(a => !seq.includes(a)), seq[0]] : u.actions);
    void acts;
    const opt = bestOption(b, u, pool, seq.length && u.attacksMade > 0 ? [{ x: u.x, y: u.y }] : tiles, bias);
    if (!opt) break;
    await doMove(b, u, opt.tile, pause);
    if (!opt.action || !opt.target) break;
    let a = opt.action;
    if (seq.length && a === seq[0] && u.attacksMade === 0) {
      // ejecuta todo el multiataque contra el mejor objetivo disponible
      for (let i = 0; i < seq.length && !b.over; i++) {
        const tg = i === 0 ? opt.target as Unit : pickTarget(b, u, seq[i]) ?? (opt.target as Unit);
        if (!tg || (tg as Unit).dead) break;
        if (cheb(u, tg as P) > seq[i].reach && !(seq[i].aoe)) break;
        b.monsterAct(u, seq[i], tg); await pause(520);
      }
      u.actionUsed = true; break;
    }
    b.monsterAct(u, a, opt.target); await pause(560);
    u.actionUsed = true; u.attacksMade = 99;
  }
  // 2) si no pudo atacar, acércate
  if (!u.actionUsed && !b.over) {
    const fs = candidateTargets(b, u); if (fs.length) {
      let best: P | undefined, bd = 1e9;
      for (const v of [...b.reach(u).values()].filter(v => !v.occ)) {
        const dmin = Math.min(...fs.map(t => cheb(v, t)));
        const hz = b.grid.at(v.x, v.y)?.kind === 'hazard' ? 3 : 0;
        const score = dmin + hz - (cheb(u, fs[0]) === 0 ? 0 : 0);
        if (score < bd) { bd = score; best = { x: v.x, y: v.y }; }
      }
      if (best) await doMove(b, u, best, pause);
    }
  }
}
function pickTarget(b: Battle, u: Unit, a: MAction): Unit | undefined {
  const fs = candidateTargets(b, u).filter(t => cheb(u, t) <= a.reach); if (!fs.length) return undefined;
  return fs.sort((x, y) => (b.expectedDamage(u, a, y) * (y.down ? .3 : 1)) - (b.expectedDamage(u, a, x) * (x.down ? .3 : 1)) || x.hp - y.hp)[0];
}
void key; void avg;
