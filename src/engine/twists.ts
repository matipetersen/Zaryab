// Giros de objetivo por combate y terreno vivo: el mapa no es un decorado, juega su partido.
import type { Battle } from './battle';
import type { Unit } from './types';
import { cheb } from './grid';
import { roll, addFlat } from './dice';
import { makeFoe } from '../data/monsters';

export type HazardKind = 'collapse' | 'spikes' | 'fire' | 'flood' | 'storm';
export interface Reward { pf?: number; gold?: number; chem?: boolean; label: string }
export type BonusDef =
  | { kind: 'noDown' | 'keep'; text: string; reward: Reward }
  | { kind: 'rounds' | 'tiles' | 'lure'; n: number; text: string; reward: Reward }
  | { kind: 'kill'; id: string; n: number; text: string; reward: Reward };
export type When = { round: number; every?: number } | { down: string } | { hp: string; below: number };
export type Do =
  | { foes: string[] } | { allies: string[] } | { hazard: HazardKind } | { rout: true } | { win: string }
  | { enrage: string } | { heal: string; pct: number } | { bless: true };
export interface EvDef { when: When; note: string; do: Do[] }
export interface LandDef { kind: HazardKind; from: number; every: number }
export interface TwistDef { name: string; text: string; bonus?: BonusDef; events?: EvDef[] }

export interface Tele { x: number; y: number; kind: HazardKind; due: number }
export interface Zone { x: number; y: number; kind: 'altar' }
export interface Objective { text: string; state: 'open' | 'done' | 'failed'; reward: Reward; hint?: string }

/** Terreno vivo por mapa: qué hace el escenario cada tantas rondas (con una ronda de aviso en el suelo). */
export const LAND: Record<string, LandDef[]> = {
  dunas: [{ kind: 'storm', from: 2, every: 3 }], nido: [{ kind: 'storm', from: 2, every: 3 }],
  callejon: [{ kind: 'collapse', from: 3, every: 4 }], zoco: [{ kind: 'collapse', from: 3, every: 4 }], mina: [{ kind: 'collapse', from: 3, every: 3 }], cripta: [{ kind: 'collapse', from: 3, every: 4 }],
  acueducto: [{ kind: 'flood', from: 2, every: 3 }], pozo: [{ kind: 'flood', from: 3, every: 4 }],
  plaza: [{ kind: 'fire', from: 3, every: 3 }], medinat: [{ kind: 'fire', from: 3, every: 4 }], iglesia: [{ kind: 'fire', from: 3, every: 3 }], eclipse: [{ kind: 'fire', from: 2, every: 3 }],
  arena: [{ kind: 'spikes', from: 2, every: 3 }], ciudadela: [{ kind: 'spikes', from: 3, every: 3 }],
};
/** Mapas con un altar que cura a quien lo ocupa (aliado de quien lo conquiste). */
export const ALTARS = new Set(['pozo', 'iglesia', 'cementerio', 'jardin', 'templo', 'santuario', 'plaza', 'medinat']);
const ICON: Record<HazardKind, string> = { collapse: '🪨', spikes: '▲', fire: '🔥', flood: '💧', storm: '🌪' };
const WARN: Record<HazardKind, string> = {
  collapse: 'El techo cruje: se va a desprender en las casillas marcadas.', spikes: 'Se oyen engranajes: saldrán pinches en las casillas marcadas.',
  fire: 'Un brasero se vuelca: el fuego va a prender en las casillas marcadas.', flood: 'Una compuerta cede: el agua va a inundar las casillas marcadas.', storm: 'Se levanta viento: en la próxima ronda una tormenta de arena va a cegar las puntas.',
};

const free = (b: Battle, x: number, y: number) => { const t = b.grid.at(x, y); return !!t && !t.blocked && t.kind !== 'wall'; };
const living = (b: Battle) => b.units.filter(u => !u.dead && u.sprite !== 'wall' && !u.fly);

function target(b: Battle, kind: HazardKind): { x: number; y: number }[] {
  const us = living(b); if (!us.length) return [];
  const c = us[Math.floor(Math.random() * us.length)]; const out: { x: number; y: number }[] = [];
  if (kind === 'spikes') { for (let dx = -3; dx <= 3; dx++) if (free(b, c.x + dx, c.y)) out.push({ x: c.x + dx, y: c.y }); return out; }
  if (kind === 'flood') { for (let dy = 0; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) { const t = b.grid.at(c.x + dx, c.y + dy); if (t && t.kind === 'floor') out.push({ x: c.x + dx, y: c.y + dy }); } return out; }
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (free(b, c.x + dx, c.y + dy)) out.push({ x: c.x + dx, y: c.y + dy });
  return out;
}
export function telegraph(b: Battle, kind: HazardKind, round: number) {
  if (kind === 'storm') { b.log(`🌪 ${WARN.storm}`, 'sys'); b.mods.stormFrom = round + 1; b.mods.stormUntil = round + 2; return; }
  const tiles = target(b, kind); if (!tiles.length) return;
  for (const t of tiles) b.telegraphs.push({ ...t, kind, due: round + 1 }); b.log(`${ICON[kind]} ${WARN[kind]}`, 'sys');
}
function resolve(b: Battle, round: number) {
  const due = b.telegraphs.filter(t => t.due <= round); if (!due.length) return; b.telegraphs = b.telegraphs.filter(t => t.due > round);
  const dc = 12 + Math.floor((b.level - 1) / 4), dice = b.level >= 11 ? '4d6' : b.level >= 7 ? '3d6' : '2d6'; b.hazMode = true;
  for (const t of due) {
    if (t.kind === 'flood') { b.revert.push({ x: t.x, y: t.y, ch: b.grid.at(t.x, t.y)!.ch, round: round + 3 }); b.grid.setTile(t.x, t.y, '~'); b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y }); continue; }
    const v = b.unitAt(t.x, t.y);
    if (t.kind === 'collapse') { b.emit({ t: 'tile', kind: 'boom', x: t.x, y: t.y }); b.grid.setTile(t.x, t.y, ','); }
    if (t.kind === 'fire') { b.grid.setTile(t.x, t.y, 'f', 3); b.emit({ t: 'tile', kind: 'ignite', x: t.x, y: t.y }); }
    if (t.kind === 'spikes') b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y });
    if (v && !v.dead) { const name = ({ collapse: 'el derrumbe', spikes: 'los pinches', fire: 'el fuego' } as Record<string, string>)[t.kind]; const ok = b.save(v, 'dex', dc, `(${name})`); const d = roll(dice).total; b.damage(v, ok ? Math.floor(d / 2) : d, t.kind === 'fire' ? 'fire' : t.kind === 'spikes' ? 'piercing' : 'bludgeoning', undefined); }
  }
  b.hazMode = false;
}
function land(b: Battle, defs: LandDef[], round: number) { for (const d of defs) if (round >= d.from && (round - d.from) % d.every === 0) telegraph(b, d.kind, round); }

function matching(b: Battle, id: string) { return b.units.filter(u => u.id === id && !u.dead); }
function hpPct(b: Battle, id: string) { const m = matching(b, id); return m.length ? Math.min(...m.map(u => u.hp / u.maxHp)) : 1; }
function enrage(b: Battle, u: Unit) { for (const a of u.actions) { if (a.toHit != null) a.toHit += 2; if (a.dmg?.length) a.dmg = [{ ...a.dmg[0], dice: addFlat(a.dmg[0].dice, 2) }, ...a.dmg.slice(1)]; } u.speed += 1; b.float(u, '¡Furia!', 'status'); }
function arrival(b: Battle, side: 'foe' | 'pc'): { x: number; y: number } | undefined {
  const g = b.grid; const pool = side === 'foe' ? [...g.spawns.wave, ...g.spawns.foe] : [...g.spawns.ally, ...g.spawns.pc];
  return pool.find(p => !b.unitAt(p.x, p.y) && free(b, p.x, p.y)) ?? pool.map(p => { for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (free(b, p.x + dx, p.y + dy) && !b.unitAt(p.x + dx, p.y + dy)) return { x: p.x + dx, y: p.y + dy }; return undefined; }).find(Boolean);
}
function run(b: Battle, d: Do, ev: EvDef) {
  if ('foes' in d) for (const id of d.foes) { const p = arrival(b, 'foe'); if (!p) break; const u = makeFoe(id, p.x, p.y); b.scaleFoe?.(u); b.reinforce(u, p); }
  else if ('allies' in d) for (const id of d.allies) { const p = arrival(b, 'pc'); if (!p) break; b.reinforce(makeFoe(id, p.x, p.y, '', 'pc'), p); }
  else if ('hazard' in d) telegraph(b, d.hazard, b.round);
  else if ('rout' in d) { for (const f of b.units.filter(u => u.side === 'foe' && !u.dead && u.sprite !== 'wall' && !u.summoned)) { f.dead = true; f.hp = 0; b.emit({ t: 'death', uid: f.uid }); b.log(`${f.name} suelta el arma y huye despavorido.`, 'sys'); } b.checkEnd(); }
  else if ('win' in d) b.win(d.win);
  else if ('enrage' in d) for (const u of matching(b, d.enrage)) enrage(b, u);
  else if ('heal' in d) for (const u of matching(b, d.heal)) b.heal(u, Math.round(u.maxHp * d.pct), u, true);
  else if ('bless' in d) for (const u of b.units.filter(x => x.pcId && !x.dead)) b.addStatus(u, { id: 'bless', turns: 3 });
  void ev;
}

/** Estado vivo de los objetivos (para el panel y el resultado). */
export function objectiveStatus(b: Battle): Objective[] {
  const out: Objective[] = [];
  for (const o of b.objectives) {
    const s = { ...o }; const d = o.def!;
    if (b.over) s.state = b.result === 'victory' && check(b, d, true) ? 'done' : 'failed';
    else s.state = check(b, d, false) === false ? 'failed' : 'open';
    s.hint = hint(b, d); out.push(s);
  }
  return out;
}
function check(b: Battle, d: BonusDef, final: boolean): boolean {
  switch (d.kind) {
    case 'noDown': return b.everDown.size === 0;
    case 'keep': return b.allyUids.every(uid => { const u = b.byUid(uid); return !!u && !u.dead; });
    case 'rounds': return final ? b.round <= d.n : b.round <= d.n;
    case 'tiles': return final ? b.tilesBroken >= d.n : true;
    case 'lure': return final ? b.hazardKills >= d.n : true;
    case 'kill': { const r = b.killRound[d.id]; return final ? r != null && r <= d.n : r != null || b.round <= d.n; }
  }
}
function hint(b: Battle, d: BonusDef): string {
  switch (d.kind) { case 'rounds': return `ronda ${b.round}/${d.n}`; case 'tiles': return `${b.tilesBroken}/${d.n}`; case 'lure': return `${b.hazardKills}/${d.n}`; case 'kill': return b.killRound[d.id] != null ? '✔' : `ronda ${b.round}/${d.n}`; default: return ''; }
}

export function installTwists(b: Battle, encId: string, mapId: string, level: number, def: TwistDef | undefined, withLand: boolean) {
  b.level = level;
  if (withLand) {
    const L = LAND[mapId]; if (L) b.scripts.push((bb, r) => { resolve(bb, r); for (const f of bb.revert.filter(x => x.round <= r)) { const t = bb.grid.at(f.x, f.y); if (t && t.ch === '~') bb.grid.setTile(f.x, f.y, f.ch); } bb.revert = bb.revert.filter(x => x.round > r); land(bb, L, r); });
    else b.scripts.push((bb, r) => resolve(bb, r));
    if (ALTARS.has(mapId)) placeAltar(b);
  }
  if (!def) return;
  b.twist = { name: def.name, text: def.text };
  if (def.bonus) b.objectives.push({ text: def.bonus.text, state: 'open', reward: def.bonus.reward, def: def.bonus });
  b.allyUids = b.units.filter(u => u.side === 'pc' && !u.pcId && u.sprite !== 'wall').map(u => u.uid);
  const fired = new Set<number>(); const evs = def.events ?? [];
  const tick = (bb: Battle, round: number) => {
    evs.forEach((ev, i) => {
      const w = ev.when; let go = false;
      if ('round' in w) go = w.every ? round >= w.round && (round - w.round) % w.every === 0 && !fired.has(i * 1000 + round) : round === w.round && !fired.has(i);
      else if ('down' in w) go = !fired.has(i) && bb.units.some(u => u.id === w.down) && matching(bb, w.down).length === 0;
      else go = !fired.has(i) && matching(bb, w.hp).length > 0 && hpPct(bb, w.hp) < w.below;
      if (!go) return; fired.add('round' in w && w.every ? i * 1000 + round : i); bb.log(`⚡ ${ev.note}`, 'sys'); for (const d of ev.do) run(bb, d, ev);
    });
  };
  b.scripts.push((bb, r) => tick(bb, r)); b.watchers.push(bb => tick(bb, bb.round));
}
function placeAltar(b: Battle) {
  const g = b.grid; const pcs = g.spawns.pc, foes = g.spawns.foe; if (!pcs.length || !foes.length) return;
  const avg = (a: { x: number; y: number }[]) => ({ x: a.reduce((s, p) => s + p.x, 0) / a.length, y: a.reduce((s, p) => s + p.y, 0) / a.length });
  const A = avg(pcs), B = avg(foes); let best: { x: number; y: number } | undefined, bd = 1e9;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const t = g.tiles[y][x]; if (t.kind !== 'floor' || t.obj || b.unitAt(x, y)) continue; const da = Math.hypot(x - A.x, y - A.y), db = Math.hypot(x - B.x, y - B.y); const s = Math.abs(da - db) + (da + db) * 0.02; if (s < bd) { bd = s; best = { x, y }; } }
  if (best) b.zones.push({ ...best, kind: 'altar' });
}
/** Al empezar su turno, quien ocupa un altar se reconforta (sea del bando que sea: hay que conquistarlo). */
export function zonesTurn(b: Battle, u: Unit) {
  for (const z of b.zones) if (z.x === u.x && z.y === u.y && !u.dead) { const h = roll('1d6').total + 1; const got = b.heal(u, h, u, true); if (got) { b.float(u, '+' + got, 'heal'); b.log(`✚ El altar reconforta a ${u.name} (+${got}).`, 'heal'); } }
}
void cheb;
