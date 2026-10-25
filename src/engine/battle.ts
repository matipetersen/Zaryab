import { chemOf, chemLevel, pairKey } from './synergy';
import { trapAt, triggerTrap, passiveNotice, type Trap } from './traps';
import { zonesTurn, type Tele, type Zone, type Objective, type BonusDef } from './twists';
import { Grid, P, cheb, key } from './grid';
import { d20, roll, avg, rand, pick, addFlat } from './dice';
import type { Unit, Weapon, MAction, BEvent, CondId, Status, DmgType, DmgPart, Ab, Side } from './types';
import { ABILITIES } from './abilities';
import './abilities2';
import { onGuardDeath, stepTrap, OBJECTS, cubeRound, cubeInit, type CubeState } from './cube';

import { makeFoe as makeFoeLazy } from '../data/monsters';
const MASCARAS: { name: string; res: DmgType[]; vuln: DmgType }[] = [
  { name: 'las Lágrimas', res: ['cold', 'poison'], vuln: 'fire' }, { name: 'la Ira', res: ['fire', 'slashing'], vuln: 'cold' }, { name: 'la Duda', res: ['psychic', 'necrotic'], vuln: 'radiant' },
  { name: 'la Hambruna', res: ['poison', 'acid'], vuln: 'lightning' }, { name: 'el Padre', res: ['radiant', 'bludgeoning'], vuln: 'necrotic' }, { name: 'la Nodriza', res: ['cold', 'piercing'], vuln: 'fire' },
  { name: 'el Sabio', res: ['psychic', 'lightning'], vuln: 'acid' }, { name: 'el Huérfano', res: ['slashing', 'piercing'], vuln: 'radiant' }, { name: 'la Peste', res: ['poison', 'necrotic'], vuln: 'radiant' },
  { name: 'el Verdugo', res: ['bludgeoning', 'slashing'], vuln: 'psychic' }, { name: 'la Madre', res: ['fire', 'acid'], vuln: 'cold' }, { name: 'el Silencio', res: ['thunder', 'psychic'], vuln: 'lightning' },
  { name: 'la Última', res: ['necrotic', 'cold'], vuln: 'fire' },
];
export const COND_LABEL: Record<CondId, string> = {
  prone: 'Derribado', blinded: 'Cegado', poisoned: 'Envenenado', frightened: 'Aterrado', charmed: 'Hechizado', paralyzed: 'Paralizado',
  stunned: 'Aturdido', restrained: 'Inmovilizado', invisible: 'Invisible', burning: 'En llamas', dodging: 'Esquiva', bless: 'Bendecido',
  bane: 'Maldecido', shieldFaith: 'Escudo de Fe', hex: 'Maleficio', hunterMark: 'Marca del Cazador', hexCurse: 'Maldición Hexblade',
  enfeebled: 'Debilitado', flameFist: 'Puño de llama', wrathSmite: 'Golpe Iracundo', radiantSoul: 'Alma Radiante', rallied: 'Reanimado', vulnerable: 'Vulnerable',
  guided: 'Guiado', aided: 'Auxiliado', sharp: 'Tirador Certero', weakened: 'Debilitado', ambusher: 'Emboscador', noHeal: 'Sin curación', spiritGuard: 'Guardianes', deathWard: 'Protegido', ensnare: 'Enredador', faerie: 'Delineado',
  taunted: 'Provocado', disadvNext: 'Desventaja', surgeUsed: '', sneakUsed: '', disengaged: 'Desenganche', helped: 'Ayudado', grappled: 'Agarrado', ready: 'Acción preparada', sprinting: 'Esprintando',
};
const CONC_CONDS: CondId[] = ['bless', 'bane', 'shieldFaith', 'hex', 'hunterMark', 'enfeebled', 'wrathSmite', 'spiritGuard', 'ensnare'];
/** Estados que se guardan uno por cada fuente (dos aliados ayudando, dos agarres…). */
const SRC_CONDS: CondId[] = ['helped', 'frightened', 'charmed', 'grappled'];
const HIDDEN_CONDS: CondId[] = ['surgeUsed', 'sneakUsed'];
export const isHiddenCond = (c: CondId) => HIDDEN_CONDS.includes(c);

export interface Res { ok: boolean; msg?: string }
export interface AtkResult { hit: boolean; crit: boolean; nat: number; total: number; ac: number; adv: boolean; dis: boolean }
export type Target = Unit | P | undefined;

export class Battle {
  grid: Grid; units: Unit[]; order: Unit[] = []; idx = -1; round = 0;
  events: BEvent[] = []; over = false; result?: 'victory' | 'defeat'; nextUid = 1000;
  flags: Record<string, any> = {};
  maxRounds = 0; surviveRounds = 0; goalOnly = false; goal?: { x: number; y: number }; goalMsg = '';
  cube?: CubeState; carry: Record<string, boolean> = {}; storyFlags = new Set<string>(); storyFlagsOut = new Set<string>(); scaleFoe?: (u: Unit) => void; scripts: ((b: Battle, round: number) => void)[] = []; inv: Record<string, number> = {}; itemsUsed: Record<string, number> = {};
  pfPool = 0; pfSpent = 0; onRound?: (b: Battle, round: number) => void;
  constructor(grid: Grid, units: Unit[]) { this.grid = grid; this.units = units; units.forEach(u => (u.uid = this.nextUid++)); }

  // ---------- terreno destruible / modificable ----------
  destructible(x: number, y: number) { const t = this.grid.at(x, y); return !!t && t.hp != null && t.hp > 0; }
  /** Daña una casilla; devuelve true si se destruye. El fuego prende lo inflamable. */
  damageTile(x: number, y: number, amt: number, type: DmgType, src?: Unit): boolean {
    const t = this.grid.at(x, y); if (!t || t.hp == null || amt <= 0) return false;
    if (t.kind === 'wall' && type === 'psychic') return false;
    t.hp -= amt; this.emit({ t: 'fx', kind: 'debris', x, y });
    if (t.hp > 0) { if (type === 'fire' && t.flam && t.hp <= t.maxHp! / 2) { this.destroyTile(x, y, type, src); return true; } return false; }
    this.destroyTile(x, y, type, src); return true;
  }
  destroyTile(x: number, y: number, type: DmgType, src?: Unit) {
    const t = this.grid.at(x, y); if (!t) return; this.tilesBroken++; const name = t.ch === 'o' ? 'El barril' : t.kind === 'wall' ? 'El muro' : 'La cobertura';
    const boom = t.boom, flam = t.flam;
    if (boom) { this.log(`${name} estalla en una bola de fuego.`, 'dmg'); this.emit({ t: 'tile', kind: 'boom', x, y }); }
    else this.log(`${name} se hace pedazos.`, 'sys');
    if (flam && (type === 'fire' || boom)) { this.grid.setTile(x, y, 'f', 3); this.emit({ t: 'tile', kind: 'ignite', x, y }); } else { this.grid.setTile(x, y, ','); this.emit({ t: 'tile', kind: 'break', x, y }); }
    if (boom) {
      for (const v of this.units.filter(u => !u.dead && cheb(u, { x, y }) <= 1)) { const ok = this.save(v, 'dex', 12, '(explosión)'); const r = roll('3d6').total; this.damage(v, ok ? Math.floor(r / 2) : r, 'fire', src); }
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && this.destructible(x + dx, y + dy)) this.damageTile(x + dx, y + dy, 8, 'fire', src);
    }
  }
  /** Efecto de área sobre el terreno (explosiones, golpes sísmicos, aliento…). */
  hitArea(c: P, radius: number, amt: number, type: DmgType, src?: Unit) {
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) { const x = c.x + dx, y = c.y + dy; if (this.destructible(x, y)) this.damageTile(x, y, amt, type, src); }
    if (type === 'fire') for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) { const t = this.grid.at(c.x + dx, c.y + dy); if (t && !t.blocked && t.kind === 'floor' && cheb(c, { x: c.x + dx, y: c.y + dy }) <= Math.max(0, radius - 1)) { this.grid.setTile(c.x + dx, c.y + dy, 'f', 3); this.emit({ t: 'tile', kind: 'ignite', x: c.x + dx, y: c.y + dy }); } }
  }
  /** Crea cobertura de piedra en línea (muro). */
  buildWall(from: P, target: P, len = 3, ch = 'C') {
    const dx = target.x - from.x, dy = target.y - from.y; const vertical = Math.abs(dx) >= Math.abs(dy);
    const placed: P[] = [];
    for (let i = -Math.floor(len / 2); i <= Math.floor(len / 2); i++) { const x = target.x + (vertical ? 0 : i), y = target.y + (vertical ? i : 0); const t = this.grid.at(x, y); if (t && !t.blocked && (t.kind === 'floor' || t.kind === 'diff') && !this.unitAt(x, y)) { this.grid.setTile(x, y, ch); this.emit({ t: 'tile', kind: 'build', x, y }); placed.push({ x, y }); } }
    return placed.length;
  }
  /** Fuego: cada ronda se apaga, se propaga a lo inflamable y finalmente deja ceniza. */
  tickTerrain() {
    const g = this.grid;
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const t = g.tiles[y][x]; if (t.ch !== 'f') continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const n = g.at(x + dx, y + dy); if (n && n.hp != null && n.flam && d20() >= 11) this.damageTile(x + dx, y + dy, 6, 'fire'); }
      t.turns = (t.turns ?? 1) - 1; if (t.turns <= 0) { g.setTile(x, y, '.'); this.emit({ t: 'tile', kind: 'burnout', x, y }); }
    }
  }
  /** Ataque a una casilla destructible con un arma (impacto automático). */
  attackTerrain(u: Unit, w: Weapon, x: number, y: number): Res {
    if (this.incapacitated(u)) return { ok: false, msg: 'No podés actuar.' };
    if (!this.destructible(x, y)) return { ok: false, msg: 'Eso no se puede romper.' };
    if (cheb(u, { x, y }) > (w.longRange ?? w.range) || (cheb(u, { x, y }) > 1 && !this.grid.los(u, { x, y }).visible)) return { ok: false, msg: 'Fuera de alcance.' };
    if (w.bonusAction) return { ok: false, msg: 'Usá un arma normal.' };
    const mid = u.attacksMade > 0 && u.attacksMade < this.maxAttacks(u);
    if (!mid) { if (!this.spendAction(u)) return { ok: false, msg: 'No te queda acción.' }; u.attacksMade = 0; }
    const dmg = w.dmg.reduce((s, p) => s + roll(p.dice).total, 0); this.emit({ t: 'fx', kind: w.ranged ? 'arrow' : 'slash', x: u.x, y: u.y, x2: x, y2: y });
    this.log(`${u.name} golpea el terreno con ${w.name} (${dmg}).`, 'sys'); this.damageTile(x, y, dmg, w.dmg[0].type, u); u.attacksMade++; u.acted = true; return { ok: true };
  }

  // ---------- util ----------
  emit(e: BEvent) { this.events.push(e); }
  takeEvents() { const e = this.events; this.events = []; return e; }
  log(text: string, cls = '') { this.emit({ t: 'log', text, cls }); }
  float(u: Unit, text: string, cls: string) { this.emit({ t: 'float', uid: u.uid, text, cls }); }
  get cur(): Unit | undefined { return this.order[this.idx]; }
  byUid(id: number) { return this.units.find(u => u.uid === id); }
  unitAt(x: number, y: number) { return this.units.find(u => !u.dead && u.x === x && u.y === y); }
  foesOf(u: Unit) { return this.units.filter(t => !t.dead && t.side !== u.side); }
  alliesOf(u: Unit) { return this.units.filter(t => !t.dead && t.side === u.side); }
  dist(a: P, b: P) { return cheb(a, b); }
  has(u: Unit, id: CondId) { return u.statuses.some(s => s.id === id); }
  status(u: Unit, id: CondId) { return u.statuses.find(s => s.id === id); }
  incapacitated(u: Unit) { return u.down || u.dead || this.has(u, 'paralyzed') || this.has(u, 'stunned'); }
  /** Relación (puntos) entre pares de la compañía: la fija la campaña; por defecto, la de partida. */
  chem: Record<string, number> = {};
  // ───── giros de objetivo y terreno vivo (ver twists.ts) ─────
  level = 3; twist?: { name: string; text: string }; objectives: (Objective & { def?: BonusDef })[] = []; telegraphs: Tele[] = []; zones: Zone[] = []; revert: { x: number; y: number; ch: string; round: number }[] = [];
  /** Niebla de guerra: la compañía solo ve lo que alcanza su línea de visión (muros y puertas cerradas la cortan). Solo afecta a lo que se muestra, no a las reglas. */
  traps: Trap[] = [];
  fogOn = true; visionR = 10; scripted = false; seen = new Set<string>(); private _visSig = ''; private _vis = new Set<string>();
  visibleTiles(): Set<string> {
    const g = this.grid, R = this.visionR, eyes = this.units.filter(u => u.side === 'pc' && u.sprite !== 'wall' && !u.dead && !u.down);
    const sig = g.ver + '|' + eyes.map(u => u.x + ',' + u.y).join(';'); if (sig === this._visSig) return this._vis;
    const vis = new Set<string>(); for (const e of eyes) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const x = e.x + dx, y = e.y + dy; if (!g.inb(x, y) || dx * dx + dy * dy > R * R + R) continue; if (g.los(e, { x, y }).visible) vis.add(x + ',' + y); }
    this._visSig = sig; this._vis = vis; for (const k of vis) this.seen.add(k); return vis;
  }
  /** ¿La compañía ve a esta unidad? (los aliados siempre se ven). */
  isSeen(u: Unit) { return !this.fogOn || u.side === 'pc' || this.visibleTiles().has(u.x + ',' + u.y); }
  openDoor(x: number, y: number, u?: Unit) { const t = this.grid.at(x, y); if (!t || t.ch !== 'D') return; this.grid.setTile(x, y, 'd'); this.emit({ t: 'tile', kind: 'door', x, y }); this.log(`${u ? u.name + ' abre' : 'Se abre'} la puerta.`, 'sys'); }
  mods = { stormFrom: 0, stormUntil: 0 }; hazardKills = 0; hazMode = false; tilesBroken = 0; everDown = new Set<string>(); killRound: Record<string, number> = {}; allyUids: number[] = []; watchers: ((b: Battle) => void)[] = [];
  /** Rondas que cada par pasó a ≤ 2 casillas (para subir su relación al terminar). */
  together: Record<string, number> = {}; roundsSeen = 0;
  // ───── terreno: dónde estás parado cambia tu defensa y tu ataque ─────
  terrainMods(u: Unit): { ac: number; atk: number; rangedAtk: number; notes: string[] } {
    const t = this.grid.at(u.x, u.y); const out = { ac: 0, atk: 0, rangedAtk: 0, notes: [] as string[] };
    if (!t || u.fly) return out;
    if (t.kind === 'high') { out.ac += 1; out.rangedAtk += 2; out.notes.push('Posición elevada: +1 CA, +2 a distancia'); }
    if (t.kind === 'diff') { out.ac += 1; out.notes.push('Escombros: +1 CA'); }
    if (t.kind === 'water') { out.ac -= 1; out.atk -= 1; out.notes.push('Agua: −1 CA y −1 al ataque'); }
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const k = this.grid.at(u.x + dx, u.y + dy)?.kind; return k === 'wall' || k === 'cover'; })) { out.ac += 1; out.notes.push('Al abrigo de un muro o una caja: +1 CA'); }
    return out;
  }
  // ───── sinergias y formaciones de la compañía ─────
  pcsNear(u: Unit, r: number) { return this.units.filter(v => v !== u && v.pcId && u.pcId && !v.dead && !v.down && cheb(u, v) <= r); }
  /** Bonos de química: cada compañero cercano suma según el nivel de relación (adyacente: completo; a 2 casillas: mitad). */
  synergy(u: Unit): { ac: number; atk: number; parts: string[] } {
    if (!u.pcId || u.down || u.dead) return { ac: 0, atk: 0, parts: [] };
    let S = 0; const parts: string[] = [];
    for (const v of this.pcsNear(u, 2)) { const L = chemLevel(chemOf(this.chem, u.pcId, v.pcId!)); if (!L) continue; const w = cheb(u, v) <= 1 ? L : Math.floor(L / 2); if (w) { S += w; parts.push(`${v.name} (${['', 'Compañeros', 'Aliados', 'Hermanos'][L]})`); } }
    return { ac: (S >= 1 ? 1 : 0) + (S >= 4 ? 1 : 0), atk: (S >= 2 ? 1 : 0) + (S >= 5 ? 1 : 0), parts };
  }
  /** Formaciones (sólo la compañía): Falange (línea de tres: +1 CA), Núcleo (rodeado por 3 aliados: +2 CA). */
  formation(u: Unit): { ac: number; names: string[] } {
    if (!u.pcId || u.down || u.dead) return { ac: 0, names: [] };
    const nb = this.pcsNear(u, 1); const names: string[] = []; let ac = 0;
    const has = (dx: number, dy: number) => nb.some(v => v.x === u.x + dx && v.y === u.y + dy);
    if ((has(1, 0) && has(-1, 0)) || (has(0, 1) && has(0, -1)) || (has(1, 1) && has(-1, -1)) || (has(1, -1) && has(-1, 1))) { ac += 1; names.push('Falange +1 CA'); }
    if (nb.length >= 3) { ac += 2; names.push('Núcleo protegido +2 CA'); }
    return { ac, names };
  }
  /** Enlaces visibles de relación entre compañeros cercanos (para dibujarlos). */
  synergyLinks(): { a: Unit; b: Unit; level: number }[] {
    const out: { a: Unit; b: Unit; level: number }[] = []; const pcs = this.units.filter(u => u.pcId && !u.dead && !u.down);
    for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) { const L = chemLevel(chemOf(this.chem, pcs[i].pcId!, pcs[j].pcId!)); if (L && cheb(pcs[i], pcs[j]) <= 2) out.push({ a: pcs[i], b: pcs[j], level: L }); }
    return out;
  }
  recordTogether() {
    this.roundsSeen++; const pcs = this.units.filter(u => u.pcId && !u.dead && !u.down);
    for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) if (cheb(pcs[i], pcs[j]) <= 2) { const k = pairKey(pcs[i].pcId!, pcs[j].pcId!); this.together[k] = (this.together[k] ?? 0) + 1; }
  }
  /** Pares que pelearon juntos al menos la mitad de las rondas: ganan un punto de relación. */
  chemGains(): Record<string, number> { const g: Record<string, number> = {}; if (this.roundsSeen < 3) return g; for (const [k, n] of Object.entries(this.together)) if (n >= this.roundsSeen * 0.5) g[k] = 1; return g; }
  ac(u: Unit, cover = 0) {
    const tm = this.terrainMods(u).ac; const sy = u.pcId ? this.synergy(u).ac + this.formation(u).ac : 0;
    return u.ac + (this.has(u, 'shieldFaith') ? 2 : 0) + cover + tm + sy;
  }
  maxAttacks(u: Unit) { return 1 + (u.extraAtk ?? 0) + (this.has(u, 'ambusher') && u.turnsTaken === 1 ? 1 : 0); }

  addStatus(t: Unit, s: Status, quiet = false) {
    if (t.dead || t.condImmune.includes(s.id)) { if (!quiet) this.float(t, 'Inmune', 'status'); return false; }
    const perSrc = CONC_CONDS.includes(s.id) || SRC_CONDS.includes(s.id); // ayuda, miedo, encanto o agarre de dos fuentes distintas conviven
    const ex = t.statuses.find(x => x.id === s.id && (x.src === s.src || !perSrc));
    if (this.cur === t && s.turns > 0) s.fresh = true; // puesto durante el propio turno: no se descuenta al terminarlo
    if (ex) { ex.turns = ex.turns < 0 || s.turns < 0 ? -1 : Math.max(ex.turns, s.turns); ex.val = s.val ?? ex.val; ex.dot = s.dot ?? ex.dot; ex.fresh = ex.fresh || s.fresh; if (s.conc) ex.conc = true; }
    else t.statuses.push(s);
    if ((s.id === 'paralyzed' || s.id === 'stunned') && t.conc) this.breakConc(t, ' (incapacitado)');
    if (!quiet && COND_LABEL[s.id]) this.float(t, COND_LABEL[s.id], 'status');
    if (s.id === 'prone' || s.id === 'paralyzed' || s.id === 'stunned') this.emit({ t: 'hit', uid: t.uid });
    return true;
  }
  removeStatus(t: Unit, id: CondId) { t.statuses = t.statuses.filter(s => s.id !== id); }
  breakConc(u: Unit, why = '') {
    if (!u.conc) return;
    const ab = ABILITIES[u.conc.id];
    this.log(`${u.name} pierde la concentración${ab ? ' en ' + ab.name : ''}${why}.`, 'sys');
    for (const t of this.units) t.statuses = t.statuses.filter(s => !(s.src === u.uid && (s.conc || (CONC_CONDS.includes(s.id) && s.conc !== false))));
    u.conc = undefined;
  }

  // ---------- flujo de turnos ----------
  start() {
    for (const u of this.units) u.initiative = d20() + u.mods.dex + (u.traits.includes('dreadInit') ? u.mods.wis : 0) + (u.traits.includes('initProf') ? u.prof : 0) + (u.initBonus ?? 0);
    this.order = this.units.filter(u => u.sprite !== 'wall')
      .sort((a, b) => b.initiative - a.initiative || b.mods.dex - a.mods.dex);
    this.round = 1; this.idx = -1;
    for (const u of this.units) if (u.traits.includes('dreadInit') && !this.has(u, 'ambusher')) this.addStatus(u, { id: 'ambusher', turns: -1 }, true);
    for (const u of this.units) if (u.traits.includes('capaArena')) { this.addStatus(u, { id: 'invisible', turns: 3, src: u.uid }, true); this.log(`${u.name} se camufla con su Capa de Arena Viva.`, 'buff'); }
    this.emit({ t: 'round', n: 1 });
    this.log('— Ronda 1 —', 'round');
    this.nextTurn();
  }
  nextTurn(): Unit | undefined {
    for (let guard = 0; guard < 500 && !this.over; guard++) {
      this.idx++;
      if (this.idx >= this.order.length) { this.idx = 0; this.recordTogether(); this.round++; if (this.surviveRounds && this.round > this.surviveRounds && !this.over) { this.over = true; this.result = 'victory'; this.emit({ t: 'end', result: 'victory' }); return; } if (this.maxRounds && this.round > this.maxRounds && !this.over) { this.over = true; this.result = 'defeat'; this.emit({ t: 'end', result: 'defeat' }); return; } this.emit({ t: 'round', n: this.round }); this.log(`— Ronda ${this.round} —`, 'round'); this.tickTerrain(); this.onRound?.(this, this.round); }
      const u = this.order[this.idx];
      if (u.dead) continue;
      for (const w of this.watchers) w(this);
      this.startTurn(u); zonesTurn(this, u);
      if (this.over) return undefined;
      this.emit({ t: 'turn', uid: u.uid });
      if (u.dead) continue;
      if (this.incapacitated(u)) { this.endTurn(true); return this.cur; }
      return u;
    }
    return undefined;
  }
  startTurn(u: Unit) {
    u.turnsTaken++; u.reactionUsed = false;
    const lost = !!u.surprised;
    for (const o of this.units) if (this.has(o, 'helped') && this.status(o, 'helped')!.src === u.uid) this.removeStatus(o, 'helped'); // la ayuda dura hasta el próximo turno de quien ayuda
    u.actionUsed = false; u.bonusUsed = false; u.extraActions = 0; u.attacksMade = 0; u.res['flurry'] = 0;
    u.moveLeft = u.speed + (this.has(u, 'ambusher') && u.turnsTaken === 1 ? 2 : 0);
    this.removeStatus(u, 'dodging'); this.removeStatus(u, 'sprinting'); this.removeStatus(u, 'disengaged'); this.removeStatus(u, 'surgeUsed'); this.removeStatus(u, 'sneakUsed');
    for (const k of Object.keys(u.rechargeReady)) if (!u.rechargeReady[k]) {
      const a = u.actions.find(x => x.id === k);
      if (a?.recharge) { const r = Math.floor(rand() * 6) + 1; if (r >= a.recharge) { u.rechargeReady[k] = true; this.log(`${u.name} recupera ${a.name}.`, 'sys'); } }
    }
    if (!u.dead) { this.bossStart(u); this.auraStart(u); }
    if (u.traits.includes('pilonRegen') && !u.dead) { const n = this.units.filter(x => !x.dead && x.traits.includes('pilon')).length; if (n && u.hp < u.maxHp) { const g = Math.min(u.maxHp - u.hp, n * 7); u.hp += g; this.float(u, `+${g}`, 'heal'); this.log(`Los pilones alimentan al Coloso (+${g}).`, 'sys'); } }
    if (u.traits.includes('smash') && !u.dead) { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && this.destructible(u.x + dx, u.y + dy)) { this.log(`${u.name} aplasta lo que se interpone.`, 'sys'); this.destroyTile(u.x + dx, u.y + dy, 'bludgeoning', u); } }
    if (u.regen && !u.down && u.hp > 0 && u.hp < u.maxHp) { u.hp = Math.min(u.maxHp, u.hp + u.regen); this.float(u, `+${u.regen}`, 'heal'); }
    // daño por turno
    const wasDown = u.down;
    for (const s of [...u.statuses]) if (s.dot && !u.dead) {
      const r = roll(s.dot); this.log(`${u.name} sufre ${r.total} por ${COND_LABEL[s.id]}.`, 'dmg');
      this.damage(u, r.total, s.id === 'burning' ? 'fire' : 'poison', undefined);
    }
    const tile = this.grid.at(u.x, u.y);
    if (tile?.kind === 'hazard' && !u.dead && !u.down && !u.fly) { const r = roll('1d6'); this.log(`${u.name} arde en terreno peligroso (${r.total}).`, 'dmg'); this.damage(u, r.total, 'fire', undefined); }
    if (u.dead) return;
    if (wasDown && u.down && !u.stable) this.deathSave(u);
    if (this.has(u, 'restrained') || this.has(u, 'grappled')) u.moveLeft = 0;
    if (this.has(u, 'prone') && !u.down && u.moveLeft > 0) { this.removeStatus(u, 'prone'); u.moveLeft = Math.floor(u.moveLeft / 2); this.log(`${u.name} se levanta.`, 'sys'); }
    this.removeStatus(u, 'ready');
    if (this.has(u, 'paralyzed') || this.has(u, 'stunned')) { u.moveLeft = 0; u.actionUsed = true; u.bonusUsed = true; }
    if (lost) { u.surprised = false; u.lostTurn = true; u.moveLeft = 0; u.actionUsed = true; u.bonusUsed = true; this.log(`${u.name} está sorprendido y pierde su primer turno.`, 'sys'); this.float(u, 'Sorpresa', 'miss'); }
  }
  endTurn(auto = false) {
    const u = this.cur; if (!u) return;
    for (const s of [...u.statuses]) if (s.turns > 0) { if (s.fresh) { s.fresh = false; continue; } s.turns--; if (s.turns === 0) { u.statuses = u.statuses.filter(x => x !== s); if (s.id === 'radiantSoul') u.fly = false; } }
    if (u.conc && (u.down || u.dead)) this.breakConc(u);
    if (!auto && !u.ai) { /* turno del jugador terminado */ }
    if (this.over) return;
    this.nextTurn();
  }
  deathSave(u: Unit) {
    const n = d20();
    if (n === 20) { u.down = false; u.hp = 1; u.death = { succ: 0, fail: 0 }; this.log(`${u.name} tira ${n} en salvación de muerte: ¡vuelve en sí con 1 PG!`, 'heal'); this.float(u, '¡20!', 'heal'); return; }
    if (n >= 10) { u.death.succ++; this.log(`${u.name}: salvación de muerte ${n} (éxito ${u.death.succ}/3).`, 'sys'); if (u.death.succ >= 3) { u.stable = true; this.log(`${u.name} se estabiliza.`, 'heal'); } }
    else { u.death.fail += n === 1 ? 2 : 1; this.log(`${u.name}: salvación de muerte ${n} (fallo ${Math.min(3, u.death.fail)}/3).`, 'dmg'); if (u.death.fail >= 3) this.kill(u); }
  }

  // ---------- movimiento ----------
  blockedFor(u: Unit, x: number, y: number) {
    const t = this.grid.at(x, y); if (!t) return true;
    if (t.kind === 'wall') return true;
    if (t.kind === 'cover' && !u.fly) return true;
    return false;
  }
  reach(u: Unit, budget = this.has(u, 'grappled') || this.has(u, 'restrained') || this.incapacitated(u) ? 0 : u.moveLeft): Map<string, { x: number; y: number; cost: number; prev?: string; occ?: boolean }> {
    const out = new Map<string, { x: number; y: number; cost: number; prev?: string; occ?: boolean }>();
    const start = key(u.x, u.y); out.set(start, { x: u.x, y: u.y, cost: 0 });
    const open: string[] = [start];
    while (open.length) {
      open.sort((a, b) => out.get(a)!.cost - out.get(b)!.cost);
      const k = open.shift()!; const cur = out.get(k)!;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const nx = cur.x + dx, ny = cur.y + dy;
        if (this.blockedFor(u, nx, ny)) continue;
        if (dx && dy && (this.grid.at(cur.x + dx, cur.y)?.kind === 'wall' || this.grid.at(cur.x, cur.y + dy)?.kind === 'wall')) continue;
        const occ = this.unitAt(nx, ny);
        if (occ && occ !== u && occ.side !== u.side && !occ.down) continue;
        const t = this.grid.at(nx, ny)!;
        const c = cur.cost + (u.fly ? 1 : t.cost);
        if (c > budget) continue;
        const nk = key(nx, ny);
        if (!out.has(nk) || out.get(nk)!.cost > c) { out.set(nk, { x: nx, y: ny, cost: c, prev: k }); if (!open.includes(nk)) open.push(nk); }
      }
    }
    for (const v of out.values()) { const o = this.unitAt(v.x, v.y); if (o && o !== u) v.occ = true; } // se puede cruzar, no terminar
    return out;
  }
  /** Arma o ataque que usa una acción preparada o un ataque de oportunidad: [alcance, ejecutar]. */
  readyStrike(h: Unit): { range: number; run: (t: Unit) => void } | undefined {
    const w = h.weapons.find(x => !x.bonusAction);
    if (w) return { range: w.range, run: t => { const sv = [h.actionUsed, h.bonusUsed, h.extraActions, h.attacksMade] as const; h.actionUsed = false; h.extraActions = 0; h.attacksMade = 0; this.weaponAttack(h, w, t); [h.actionUsed, h.bonusUsed, h.extraActions, h.attacksMade] = sv as any; } };
    const a = h.actions.find(x => (x.kind === 'melee' || x.kind === 'ranged') && !x.recharge && !x.aoe && !x.aoeSelf);
    return a ? { range: a.reach ?? 1, run: t => { this.monsterAct(h, a, t); } } : undefined;
  }
  /** Acciones preparadas: si `u` entra en el alcance de quien esperaba, este ataca como reacción. */
  triggerReady(u: Unit, from: P, to: P) {
    for (const h of this.foesOf(u)) {
      if (!this.has(h, 'ready') || !this.canReact(h)) continue;
      const st = this.readyStrike(h); if (!st) continue;
      if (cheb(to, h) <= st.range && cheb(from, h) > st.range) { h.reactionUsed = true; this.removeStatus(h, 'ready'); this.log(`⏱ ${h.name} ejecuta su acción preparada contra ${u.name}.`, 'sys'); st.run(u); if (u.dead || u.down) return; }
    }
  }
  /** Soltar a quien agarraba si se aleja, cae o queda incapacitado. */
  releaseGrapples() { for (const t of this.units) { const s = this.status(t, 'grappled'); if (!s) continue; const g = s.src ? this.byUid(s.src) : undefined; if (!g || g.dead || this.incapacitated(g) || cheb(g, t) > 1) this.removeStatus(t, 'grappled'); } }
  /** Intento de escapar de un agarre: prueba de FUE/DES contra Atletismo de quien agarra. */
  tryEscape(u: Unit): boolean {
    const s = this.status(u, 'grappled'); if (!s) return true; const g = s.src ? this.byUid(s.src) : undefined; if (!g) { this.removeStatus(u, 'grappled'); return true; }
    const a = roll('1d20').total + Math.max(u.mods.str, u.mods.dex) + (u.pcId ? (u.prof ?? 0) : 0), d = roll('1d20').total + g.mods.str + (g.prof ?? 0);
    if (a > d) { this.removeStatus(u, 'grappled'); if (this.cur === u && !this.has(u, 'restrained')) u.moveLeft = Math.max(u.moveLeft, u.speed); this.log(`${u.name} se zafa del agarre de ${g.name} (${a} vs ${d}).`, 'buff'); return true; }
    this.log(`${u.name} no logra zafarse de ${g.name} (${a} vs ${d}).`, 'sys'); return false;
  }
  /** Flanqueo: un aliado que pueda actuar está justo al otro lado del objetivo. */
  flanked(a: Unit, t: Unit): boolean {
    if (cheb(a, t) !== 1) return false;
    const o = this.unitAt(t.x * 2 - a.x, t.y * 2 - a.y);
    return !!o && o !== a && o.side === a.side && o.sprite !== 'wall' && !o.fled && !this.incapacitated(o);
  }
  // ───── ataques de oportunidad (reglas 5e) ─────
  canReact(u: Unit) { return !u.reactionUsed && !u.surprised && !this.incapacitated(u) && u.sprite !== 'wall' && !u.fled; }
  /** Enemigos con reacción que pueden atacar a `u` al pasar de `from` a `to` (salir de su alcance de 5 pies sin Desengancharse). */
  provokers(u: Unit, from: P, to: P): Unit[] {
    if (this.has(u, 'disengaged') || this.has(u, 'invisible')) return [];
    return this.foesOf(u).filter(h => this.canReact(h) && cheb(from, h) <= 1 && cheb(to, h) > 1);
  }
  /** Cuántos ataques de oportunidad provocaría recorrer este camino (para avisar al jugador). */
  opportunityCount(u: Unit, path: P[]): number {
    let n = 0; const used = new Set<number>();
    for (let i = 1; i < path.length; i++) for (const h of this.provokers(u, path[i - 1], path[i])) if (!used.has(h.uid)) { used.add(h.uid); n++; }
    return n;
  }
  opportunity(h: Unit, u: Unit) {
    let ok = false;
    if (h.pcId || h.weapons.length) {
      const w = h.weapons.find(x => !x.ranged && !x.bonusAction);
      if (w) { h.reactionUsed = true; this.log(`⚔ ${h.name} aprovecha un ataque de oportunidad contra ${u.name}.`, 'sys'); const sv = [h.actionUsed, h.bonusUsed, h.extraActions, h.attacksMade] as const; h.actionUsed = false; h.extraActions = 0; h.attacksMade = 0; this.weaponAttack(h, w, u); [h.actionUsed, h.bonusUsed, h.extraActions, h.attacksMade] = sv as any; ok = true; }
    }
    if (!ok) {
      const a = h.actions.find(x => x.kind === 'melee' && !x.recharge && !x.aoe && !x.aoeSelf);
      if (a) { h.reactionUsed = true; this.log(`⚔ ${h.name} aprovecha un ataque de oportunidad contra ${u.name}.`, 'sys'); this.monsterAct(h, a, u); }
    }
  }
  /** Camino (con la casilla de salida) hasta (x, y) según el mapa de alcance `r`. */
  pathTo(r: ReturnType<Battle['reach']>, x: number, y: number): P[] {
    const path: P[] = []; let k: string | undefined = key(x, y);
    while (k) { const n: { x: number; y: number; prev?: string } = r.get(k)!; path.unshift({ x: n.x, y: n.y }); k = n.prev; }
    return path;
  }
  move(u: Unit, x: number, y: number): Res {
    const r = this.reach(u); const dest = r.get(key(x, y));
    if (!dest || dest.occ || (x === u.x && y === u.y)) return { ok: false, msg: 'No podés llegar allí.' };
    const path: P[] = []; let k: string | undefined = key(x, y);
    while (k) { const n: { x: number; y: number; prev?: string } = r.get(k)!; path.unshift({ x: n.x, y: n.y }); k = n.prev; }
    // Se recorre casilla a casilla: al salir del alcance de un enemigo con reacción, este ataca; si cae, el movimiento se corta ahí.
    let cur = path[0], spent = 0; const trail: P[] = [path[0]];
    for (let i = 1; i < path.length; i++) {
      const nxt = path[i];
      for (const h of this.provokers(u, cur, nxt)) { u.x = cur.x; u.y = cur.y; this.opportunity(h, u); if (u.dead || u.down || this.over) break; }
      if (u.dead || u.down || this.over) break;
      if (this.grid.at(nxt.x, nxt.y)?.ch === 'D') this.openDoor(nxt.x, nxt.y, u);
      u.x = nxt.x; u.y = nxt.y; this.triggerReady(u, cur, nxt); u.x = cur.x; u.y = cur.y;
      if (u.dead || u.down || this.over) break;
      spent += u.fly ? 1 : this.grid.at(nxt.x, nxt.y)!.cost; cur = nxt; trail.push(nxt);
      const trap = u.side === 'pc' && !u.fly ? trapAt(this, nxt.x, nxt.y) : undefined; if (trap) { u.x = nxt.x; u.y = nxt.y; triggerTrap(this, u, trap); break; } // las trampas detienen el avance
    }
    const stopped = cur.x !== x || cur.y !== y;
    u.moveLeft = stopped ? 0 : u.moveLeft - dest.cost; u.x = cur.x; u.y = cur.y; this.releaseGrapples();
    if (trail.length > 1) this.emit({ t: 'move', uid: u.uid, path: trail });
    if (u.dead || u.down) return { ok: true };
    passiveNotice(this, u);
    const tile = this.grid.at(u.x, u.y);
    if (tile?.kind === 'hazard' && !u.fly) { const rr = roll('1d6'); this.log(`${u.name} pisa terreno peligroso (${rr.total}).`, 'dmg'); this.damage(u, rr.total, 'fire', undefined); }
    if (this.cube) stepTrap(this, u);
    if (this.goal && u.pcId && !u.dead && u.x === this.goal.x && u.y === this.goal.y) this.win(this.goalMsg || 'Alcanzan la salida.');
    return { ok: true };
  }

  // ---------- tiradas ----------
  canSee(a: Unit, b: Unit): { visible: boolean; cover: 0 | 2 | 5 } {
    if (cheb(a, b) <= 1) return { visible: true, cover: 0 };
    return this.grid.los(a, b);
  }
  rollAttack(a: Unit, t: Unit, toHit: number, o: { ranged?: boolean; spell?: boolean; ignoreCover?: boolean; autoCrit?: boolean; forceAdv?: boolean; forceDis?: boolean; flat?: boolean } = {}): AtkResult {
    const vis = this.canSee(a, t);
    const cover = o.ignoreCover ? 0 : vis.cover;
    let adv = !!o.forceAdv, dis = !!o.forceDis;
    const melee = cheb(a, t) <= 1 && !o.ranged;
    if (this.has(a, 'invisible')) adv = true;
    if (this.has(t, 'guided')) { adv = true; this.removeStatus(t, 'guided'); }
    if (this.has(t, 'faerie')) adv = true;
    if (this.has(t, 'sprinting') || this.has(t, 'blinded') || this.has(t, 'restrained') || this.has(t, 'stunned') || this.has(t, 'paralyzed') || t.down) adv = true;
    if (this.has(t, 'prone') && cheb(a, t) <= 1) adv = true;
    if (this.has(t, 'prone') && cheb(a, t) > 1) dis = true;
    if (melee && this.flanked(a, t)) adv = true;
    if (this.has(t, 'helped')) { const hs = this.status(t, 'helped')!; const hp = hs.src ? this.byUid(hs.src) : undefined; if (hp && hp.side === a.side && hp !== a) { adv = true; this.removeStatus(t, 'helped'); } }
    // Atacar a distancia con un enemigo adyacente (que pueda actuar) impone desventaja.
    if (o.ranged && this.foesOf(a).some(f => f.sprite !== 'wall' && !f.fled && !this.incapacitated(f) && cheb(f, a) <= 1)) dis = true;
    if (a.traits.includes('swarm') && this.units.some(u => u !== a && !u.dead && u.side === a.side && u.traits.includes('swarm') && cheb(u, a) <= 2)) adv = true;
    if (a.traits.includes('assassinate') && t.turnsTaken === 0) adv = true; // Asesinar: contra quien todavía no jugó
    if (this.has(a, 'poisoned') || this.has(a, 'blinded') || this.has(a, 'prone') || this.has(a, 'restrained') || this.has(a, 'disadvNext')) dis = true;
    if (this.has(a, 'frightened')) { const s = this.status(a, 'frightened')!; const src = s.src ? this.byUid(s.src) : undefined; if (!src || this.canSee(a, src).visible) dis = true; }
    if (this.has(t, 'dodging') || this.has(t, 'invisible')) dis = true; // ventajas y desventajas se cancelan entre sí
    if (this.has(a, 'disadvNext')) this.removeStatus(a, 'disadvNext');
    let nat = d20(); let n2 = nat;
    if (adv && !dis) { n2 = d20(); nat = Math.max(nat, n2); } else if (dis && !adv) { n2 = d20(); nat = Math.min(nat, n2); }
    let bonus = toHit;
    const tm = this.terrainMods(a); bonus += tm.atk + (o.ranged ? tm.rangedAtk : 0); if (o.ranged && this.round >= this.mods.stormFrom && this.round <= this.mods.stormUntil && this.mods.stormFrom) bonus -= 2;
    if (a.pcId) { bonus += this.synergy(a).atk; if (melee && !this.flanked(a, t) && this.units.some(v => v !== a && v.pcId && !v.dead && !v.down && cheb(v, t) <= 1)) bonus += 1; } // Cerco: dos aliados sobre el mismo objetivo
    if (this.has(a, 'bless')) bonus += Math.floor(rand() * 4) + 1;
    if (this.has(a, 'bane')) bonus -= Math.floor(rand() * 4) + 1;
    const ac = this.ac(t, cover);
    const critRange = this.has(a, 'hexCurse') && this.status(a, 'hexCurse')!.val === t.uid ? 19 : 20;
    const total = nat + bonus;
    // primero hay que acertar (el 20 natural siempre acierta); recién entonces paralizado, inconsciente o sorprendido lo vuelven crítico
    const hit = nat !== 1 && (nat >= critRange || total >= ac);
    const crit = hit && (o.autoCrit || nat >= critRange || ((this.has(t, 'paralyzed') || t.down) && cheb(a, t) <= 1));
    return { hit, crit: !!crit && hit, nat, total, ac, adv: adv && !dis, dis: dis && !adv };
  }
  save(t: Unit, ab: Ab, dc: number, label = ''): boolean {
    if ((ab === 'str' || ab === 'dex') && (this.has(t, 'paralyzed') || this.has(t, 'stunned') || t.down)) { this.log(`${t.name} falla automáticamente la salvación${label}.`, 'sys'); return false; }
    const sAdv = ab === 'dex' && this.has(t, 'dodging'), sDis = ab === 'dex' && this.has(t, 'restrained');
    let n = d20(); if (sAdv !== sDis) { const n2 = d20(); n = sAdv ? Math.max(n, n2) : Math.min(n, n2); } if (this.has(t, 'bless')) n += Math.floor(rand() * 4) + 1; if (this.has(t, 'bane')) n -= Math.floor(rand() * 4) + 1;
    const total = n + t.saves[ab];
    const ok = total >= dc;
    this.log(`${t.name} salva ${ab.toUpperCase()} ${label}: ${total} vs CD ${dc} → ${ok ? 'éxito' : 'fallo'}.`, 'roll');
    return ok;
  }

  // ---------- daño / curación ----------
  rollParts(parts: DmgPart[], crit: boolean, bonus = 0): { amt: number; type: DmgType; txt: string }[] {
    return parts.map((p, i) => { const r = roll(p.dice, crit); return { amt: Math.max(0, r.total + (i === 0 ? bonus : 0)), type: p.type, txt: r.text }; });
  }
  /** Un impacto con varias partes de daño: resistencias por parte y después un solo evento de daño. */
  damageHit(t: Unit, parts: { amt: number; type: DmgType }[], src?: Unit, o: { crit?: boolean; attack?: boolean; silent?: boolean } = {}): number {
    if (t.dead) return 0; let sum = 0;
    for (const p of parts) { if (p.amt <= 0 || t.immune.includes(p.type)) continue; let a = p.amt; if (t.resist.includes(p.type)) a = Math.floor(a / 2); if (t.vuln.includes(p.type)) a *= 2; sum += a; }
    if (sum > 0 && this.has(t, 'vulnerable')) { sum *= 2; this.removeStatus(t, 'vulnerable'); }
    if (sum > 0 && o.attack && src && t.traits.includes('uncanny') && !t.down && this.canReact(t) && this.canSee(t, src).visible) { t.reactionUsed = true; sum = Math.floor(sum / 2); this.log(`${t.name} esquiva lo peor del golpe (Esquiva Asombrosa).`, 'sys'); }
    const main = parts.reduce((m, p) => (p.amt > m.amt ? p : m), parts[0] ?? { amt: 0, type: 'bludgeoning' as DmgType });
    return this.damage(t, sum, main.type, src, { crit: o.crit, silent: o.silent, resolved: true });
  }
  damage(t: Unit, amt: number, type: DmgType, src?: Unit, o: { quiet?: boolean; silent?: boolean; crit?: boolean; resolved?: boolean } = {}): number {
    if (t.dead || amt <= 0) return 0;
    if (t.traits.includes('dormant')) this.flags['w' + t.uid] = 1;
    let a = amt;
    if (!o.resolved) {
      if (t.immune.includes(type)) a = 0;
      else { if (t.resist.includes(type)) a = Math.floor(a / 2); if (t.vuln.includes(type)) a *= 2; }
      if (a > 0 && this.has(t, 'vulnerable')) { a *= 2; this.removeStatus(t, 'vulnerable'); }
    }
    if (a > 0 && t.traits.includes('shielded') && this.units.some(x => !x.dead && x.side === t.side && x.traits.includes('brazo'))) { a = Math.floor(a / 2); if (!this.flags['shieldNote']) { this.flags['shieldNote'] = 1; this.log(`Los brazos protegen a ${t.name}: el daño se reduce a la mitad mientras sigan vivos.`, 'sys'); } }
    if (a <= 0) { if (!o.quiet) this.float(t, '0', 'miss'); return 0; }
    this.emit({ t: 'hit', uid: t.uid });
    if (!o.silent) this.float(t, String(a), o.crit ? 'crit' : 'dmg');
    if (t.down) { // ya caído: fallo de salvación de muerte (y deja de estar estable)
      t.death.fail += o.crit ? 2 : 1; t.stable = false;
      this.log(`${t.name} recibe daño inconsciente (fallo ${Math.min(3, t.death.fail)}/3).`, 'dmg');
      if (t.death.fail >= 3 || a >= t.maxHp) this.kill(t, src);
      return a;
    }
    const dealt = a; const absorbed = Math.min(t.temp, a); t.temp -= absorbed; a -= absorbed;
    if (t.hp - a <= 0 && this.has(t, 'deathWard')) { this.removeStatus(t, 'deathWard'); t.hp = 1 + a; this.log(`La Protección contra la Muerte salva a ${t.name}.`, 'heal'); }
    const before = t.hp; t.hp -= a;
    if (t.traits.includes('zombieFort') && t.hp <= 0 && type !== 'radiant' && !o.crit) { const dc = 5 + a; if (this.save(t, 'con', dc, '(Fortaleza de No-muerto)')) { t.hp = 1; this.log(`${t.name} se mantiene en pie.`, 'sys'); } }
    if (t.traits.includes('frenzy') && t.hp > 0 && t.hp <= t.maxHp * 0.4 && !this.flags['frz' + t.uid]) { this.flags['frz' + t.uid] = 1; for (const ac of t.actions) if (ac.toHit != null) ac.toHit += 2; t.ac -= 2; this.log(`¡${t.name} entra en frenesí!`, 'sys'); }
    if (t.traits.includes('split') && t.hp >= 4 && (type === 'slashing' || type === 'lightning') && this.units.filter(x => x.id === t.id && !x.dead).length < 8) { const half = Math.floor(t.hp / 2); const p2 = this.freeNear(t); if (p2) { t.hp -= half; const c = makeFoeLazy(t.id, p2.x, p2.y); c.hp = half; c.maxHp = Math.max(half, c.maxHp); if (this.scaleFoe) this.scaleFoe(c); c.hp = half; this.summon(c, t, p2); this.log(`${t.name} se parte en dos.`, 'sys'); } }
    if (t.traits.includes('enrage') && t.hp > 0 && t.hp <= t.maxHp / 2 && !this.flags['enr' + t.uid]) { this.flags['enr' + t.uid] = 1; for (const ac of t.actions) { if (ac.toHit != null) ac.toHit += 2; if (ac.save) ac.save = { ...ac.save, dc: ac.save.dc + 2 }; } for (const k of Object.keys(t.rechargeReady)) t.rechargeReady[k] = true; this.log(`¡${t.name} entra en furia! Sus ataques mejoran y recupera sus poderes.`, 'sys'); this.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y }); }
    if (t.hp <= 0) {
      const over = -t.hp; t.hp = 0;
      const pcLike = !!t.pcId;
      if (pcLike && over < t.maxHp) {
        t.down = true; if (t.pcId) this.everDown.add(t.pcId); t.stable = false; t.death = { succ: 0, fail: 0 };
        this.addStatus(t, { id: 'prone', turns: -1 }, true);
        this.log(`${t.name} cae inconsciente (0 PG).`, 'dmg'); this.float(t, '¡Caído!', 'crit');
        this.breakConc(t);
        this.checkEnd();
      } else this.kill(t, src);
    } else if (t.traits.includes('flees50') && t.hp <= t.maxHp / 2) { this.flee(t); }
    else if (t.conc && dealt > 0 && before > 0) { // una prueba por impacto, contando el daño absorbido por PG temporales
      const dc = Math.max(10, Math.floor(dealt / 2));
      let n = d20(); if (t.traits.includes('warCaster')) n = Math.max(n, d20()); n += t.saves.con; if (this.has(t, 'bless')) n += Math.floor(rand() * 4) + 1;
      this.log(`${t.name} concentración: ${n} vs CD ${dc}.`, 'roll');
      if (n < dc) this.breakConc(t, ' (dañado)');
    }
    return a + absorbed;
  }
  kill(t: Unit, src?: Unit) {
    if (t.dead) return;
    if (this.hazMode && t.side === 'foe') this.hazardKills++; if (t.pcId) this.everDown.add(t.pcId);
    t.dead = true; t.hp = 0; t.down = false; if (t.side === 'foe' && !this.units.some(u => u !== t && u.id === t.id && !u.dead)) this.killRound[t.id] ??= this.round;
    this.emit({ t: 'death', uid: t.uid });
    this.log(`${t.name} cae${t.side === 'pc' ? ' y muere' : ''}.`, 'dmg');
    this.breakConc(t);
    onGuardDeath(this, t);
    if (t.traits.includes('pilon')) for (const co of this.units.filter(x => !x.dead && x.traits.includes('pilonRegen'))) { this.log(`El pilón estalla y el Coloso recibe la sacudida.`, 'dmg'); this.damage(co, 18, 'force', src); }
    if (t.traits.includes('boss')) for (const f of this.units.filter(x => !x.dead && x.traits.includes('flees50'))) this.flee(f);
    if (src) { const hc = this.status(src, 'hexCurse'); if (hc && hc.val === t.uid) { const h = Math.max(1, src.level + src.mods.cha); this.heal(src, h, src, true); this.log(`${src.name} se cura ${h} (Maldición Hexblade).`, 'heal'); } }
    if (t.onDeath) {
      const od = t.onDeath; this.log(`¡${t.name} — ${od.name}!`, 'dmg'); this.emit({ t: 'fx', kind: 'boom', x: t.x, y: t.y });
      for (const v of this.units) if (!v.dead && cheb(v, t) <= od.radius && v !== t) {
        const ok = this.save(v, od.ab, od.dc, `(${od.name})`);
        this.damageHit(v, this.rollParts(od.dmg, false).map(r => ({ amt: ok ? Math.floor(r.amt / 2) : r.amt, type: r.type })), undefined);
        if (!ok && od.cond) this.addStatus(v, { id: od.cond, turns: 1 });
      }
    }
    for (const w of this.watchers) w(this);
    this.checkEnd();
  }
  flee(t: Unit, msg = 'huye herido hacia el oeste, hacia la Iglesia del Simurg.') {
    if (t.dead) return; t.dead = true; t.fled = true; t.hp = 0; this.emit({ t: 'death', uid: t.uid });
    this.log(`${t.name} ${msg}`, 'sys'); this.flags['fled_' + t.id] = true; this.checkEnd();
  }
  heal(t: Unit, amt: number, src?: Unit, quiet = false): number {
    if (t.dead || amt <= 0) return 0;
    if (t.undead) return 0;
    if (this.has(t, 'noHeal')) { if (!quiet) this.log(`${t.name} no puede curarse (Maldición de Herida).`, 'sys'); return 0; }
    const before = t.down ? 0 : t.hp;
    if (t.down) { t.down = false; t.stable = false; t.death = { succ: 0, fail: 0 }; t.hp = Math.min(t.maxHp, amt); this.log(`${t.name} recupera el conocimiento.`, 'heal'); }
    else t.hp = Math.min(t.maxHp, t.hp + amt);
    amt = t.hp - before;
    if (!quiet) this.float(t, '+' + amt, 'heal');
    this.emit({ t: 'fx', kind: 'heal', x: t.x, y: t.y });
    return amt;
  }
  checkEnd() {
    if (this.over) return;
    const bosses = this.units.filter(u => u.traits.includes('boss'));
    const foes = bosses.length ? bosses.filter(u => !u.dead) : this.units.filter(u => u.side === 'foe' && !u.dead && !u.summoned && u.sprite !== 'wall' && !u.traits.includes('objective-ignore'));
    const pcs = this.units.filter(u => !!u.pcId && !u.dead && !u.down);
    if (!foes.length && !this.goalOnly) { this.over = true; this.result = 'victory'; this.emit({ t: 'end', result: 'victory' }); }
    else if (!pcs.length) { this.over = true; this.result = 'defeat'; this.emit({ t: 'end', result: 'defeat' }); }
  }

  // ---------- economía de acción ----------
  spendAction(u: Unit): boolean {
    if (!u.actionUsed) { u.actionUsed = true; return true; }
    if (u.extraActions > 0) { u.extraActions--; u.attacksMade = 0; return true; }
    return false;
  }
  hasAction(u: Unit) { return !u.actionUsed || u.extraActions > 0 || (u.attacksMade > 0 && u.attacksMade < this.maxAttacks(u)); }
  inRange(a: Unit, t: Unit, range: number, needLos = true) {
    if (cheb(a, t) > range) return false;
    return !needLos || this.canSee(a, t).visible;
  }
  targetable(a: Unit, t: Unit) { return !t.dead && !(this.has(t, 'invisible') && cheb(a, t) > 1 && t.side !== a.side); }

  // ---------- ataque con arma (PJ) ----------
  weaponAttack(u: Unit, w: Weapon, t: Unit): Res {
    if (this.incapacitated(u)) return { ok: false, msg: 'No podés actuar.' };
    if (!this.targetable(u, t) || t.side === u.side) return { ok: false, msg: 'Objetivo inválido.' };
    if (this.has(u, 'charmed') && this.status(u, 'charmed')!.src === t.uid) return { ok: false, msg: 'No podés atacar a quien te hechizó.' };
    if (!this.inRange(u, t, w.longRange ?? w.range)) return { ok: false, msg: 'Fuera de alcance o sin línea de visión.' };
    const longShot = w.longRange && cheb(u, t) > w.range;
    if (w.bonusAction) { if (u.bonusUsed && !(u.res['flurry'] > 0)) return { ok: false, msg: 'Ya usaste tu acción adicional.' }; }
    else {
      const mid = u.attacksMade > 0 && u.attacksMade < this.maxAttacks(u);
      if (!mid) { if (!this.spendAction(u)) return { ok: false, msg: 'No te queda acción.' }; u.attacksMade = 0; }
    }
    if (w.bonusAction) { if (u.res['flurry'] > 0) u.res['flurry']--; else u.bonusUsed = true; }
    const ranged = !!w.ranged;
    const sharp = !!w.sharp;
    const wasInvis = this.has(u, 'invisible');
    const r = this.rollAttack(u, t, w.toHit, { ranged, ignoreCover: sharp, forceAdv: false, forceDis: !!longShot && !sharp, autoCrit: u.traits.includes('assassinate') && !!t.surprised });
    this.emit({ t: 'fx', kind: ranged ? 'arrow' : 'slash', x: u.x, y: u.y, x2: t.x, y2: t.y });
    const tag = `${r.adv ? ' (ventaja)' : r.dis ? ' (desventaja)' : ''}`;
    if (!r.hit) { this.log(`${u.name} ataca con ${w.name}${tag}: ${r.nat}→${r.total} vs CA ${r.ac}: falla.`, 'roll'); this.float(t, 'Falla', 'miss'); }
    else {
      const parts: DmgPart[] = [...w.dmg];
      let bonusTxt = '';
      const ex: DmgPart[] = [];
      if (this.has(u, 'hex') && this.status(u, 'hex')!.val === t.uid) ex.push({ dice: '1d6', type: 'necrotic' });
      if (this.has(u, 'hunterMark') && this.status(u, 'hunterMark')!.val === t.uid) ex.push({ dice: '1d6', type: w.dmg[0].type });
      if (this.has(u, 'hexCurse') && this.status(u, 'hexCurse')!.val === t.uid) ex.push({ dice: String(u.prof), type: w.dmg[0].type });
      if (this.has(u, 'flameFist') && !ranged) { ex.push({ dice: '2d6', type: 'fire' }); this.removeStatus(u, 'flameFist'); }
      if (this.has(u, 'radiantSoul') && !this.has(u, 'surgeUsed')) { ex.push({ dice: '3', type: 'radiant' }); this.addStatus(u, { id: 'surgeUsed', turns: -1 }, true); }
      if (this.has(u, 'wrathSmite') && !ranged) { ex.push({ dice: '1d6', type: 'psychic' }); this.removeStatus(u, 'wrathSmite'); if (!this.save(t, 'wis', u.spellDC, '(Golpe Iracundo)')) this.addStatus(t, { id: 'frightened', turns: 10, src: u.uid }); }
      if (u.traits.includes('sneak') && !this.has(u, 'sneakUsed') && (w.finesse || ranged)) {
        const flank = this.units.some(a => a !== u && !a.dead && a.side === u.side && !this.incapacitated(a) && cheb(a, t) <= 1);
        if (r.adv || (flank && !r.dis)) { ex.push({ dice: `${Math.ceil(u.level / 2)}d6`, type: w.dmg[0].type }); this.addStatus(u, { id: 'sneakUsed', turns: -1 }, true); bonusTxt = ' +Ataque furtivo'; }
      }
      if (this.has(u, 'ambusher') && u.attacksMade === 1 && u.turnsTaken === 1) ex.push({ dice: '1d8', type: w.dmg[0].type });
      if (this.has(u, 'ensnare') && !ranged) { this.removeStatus(u, 'ensnare'); if (!this.save(t, 'str', u.spellDC, '(Golpe Enredador)')) this.addStatus(t, { id: 'restrained', turns: 5, src: u.uid }); }
      for (const [tr, dice, type] of [['divineStrike', u.level >= 14 ? '2d8' : '1d8', 'necrotic'], ['radStrike', u.level >= 14 ? '2d8' : '1d8', 'radiant']] as const) if (u.traits.includes(tr) && !ranged && !this.flags[`${tr}${u.uid}_${this.round}`]) { this.flags[`${tr}${u.uid}_${this.round}`] = 1; ex.push({ dice, type }); }
      if (u.traits.includes('lifedrinker') && !ranged) ex.push({ dice: String(Math.max(1, u.spellMod)), type: 'necrotic' });
      if (t.traits.includes('acidBody') && !ranged) { const ac = roll('2d8').total; this.log(`El ácido del ${t.name} abrasa a ${u.name} (${ac}).`, 'dmg'); this.damage(u, ac, 'acid', undefined); }
      if (t.traits.includes('corrosion') && !w.magic && !ranged) { const k = 'corr' + u.uid; const n = (this.flags[k] ?? 0); if (n < 5) { this.flags[k] = n + 1; w.dmg = [{ ...w.dmg[0], dice: addFlat(w.dmg[0].dice, -1) }, ...w.dmg.slice(1)]; this.log(`El arma de ${u.name} se corroe (−${n + 1}).`, 'sys'); } }
      const all = this.rollParts([...parts, ...ex], r.crit);
      let total = 0; const txt: string[] = [];
      const enf = this.has(u, 'enfeebled');
      const hitParts = all.map(p => ({ amt: enf ? Math.floor(p.amt / 2) : p.amt, type: p.type })); for (const p of hitParts) txt.push(`${p.amt} ${p.type}`);
      total += this.damageHit(t, hitParts, u, { crit: r.crit, attack: true, silent: true });
      // mostrar el total una sola vez
      this.log(`${u.name} golpea a ${t.name} con ${w.name}${tag}${r.crit ? ' ¡CRÍTICO!' : ''}: ${r.nat}→${r.total} vs CA ${r.ac}. Daño ${total} (${txt.join(' + ')})${bonusTxt}.`, 'dmg');
      if (total > 0) this.float(t, String(total), r.crit ? 'crit' : 'dmg');
    }
    if (!w.bonusAction) { u.attacksMade++; if (u.attacksMade >= this.maxAttacks(u)) { /* secuencia completa */ } }
    if (wasInvis) this.removeStatus(u, 'invisible');
    u.acted = true;
    return { ok: true };
  }

  // ---------- habilidades ----------
  slotLevels(u: Unit, min: number): number[] {
    const out: number[] = []; for (let l = min; l <= 9; l++) if ((u.res['slot' + l] ?? 0) > 0) out.push(l); return out;
  }
  canUse(u: Unit, id: string): Res {
    const ab = ABILITIES[id]; if (!ab) return { ok: false, msg: 'Habilidad desconocida.' };
    if (this.incapacitated(u)) return { ok: false, msg: 'No podés actuar.' };
    if (ab.cost === 'action' && !(!u.actionUsed || u.extraActions > 0)) return { ok: false, msg: 'Sin acción.' };
    if (ab.cost === 'bonus' && u.bonusUsed) return { ok: false, msg: 'Sin acción adicional.' };
    if (ab.slot && !this.slotLevels(u, ab.slot).length) return { ok: false, msg: 'Sin espacios de conjuro.' };
    if (ab.use && (u.res[ab.use] ?? 0) <= 0) return { ok: false, msg: 'Sin usos restantes.' };
    if (ab.pf && this.pfPool < ab.pf) return { ok: false, msg: `Faltan PF (${ab.pf}).` };
    if (ab.item && (this.inv[ab.item] ?? 0) <= 0) return { ok: false, msg: 'No te quedan.' };
    return { ok: true };
  }
  useAbility(u: Unit, id: string, target: Target, lvl?: number): Res {
    const ab = ABILITIES[id]; const c = this.canUse(u, id); if (!c.ok) return c;
    let L = lvl ?? 0;
    if (ab.slot) { const lv = this.slotLevels(u, ab.slot); L = lvl && lv.includes(lvl) ? lvl : lv[0]; }
    if (ab.target !== 'self' && ab.target !== 'none') { // el objetivo tiene que estar entre los válidos (alcance, línea de visión, bando)
      const ts = this.abilityTargets(u, id, L); const tg = target as any;
      if (!tg || !ts.some(x => x === tg || (!(x as Unit).uid && !tg.uid && (x as P).x === tg.x && (x as P).y === tg.y))) return { ok: false, msg: 'Objetivo fuera de alcance o inválido.' };
    }
    const v = ab.validate?.(this, u, target as any, L); if (v && !v.ok) return v;
    if (target && (target as Unit).uid && (target as Unit).traits?.includes('absorbSpell') && (ab.tag === 'attack' || ab.tag === 'control') && ab.cost !== 'free' && (ab.slot ?? 0) <= 3 && !ab.id.startsWith('item_') && ab.id !== 'dash') { const tg = target as Unit; const h = roll('4d8').total; if (ab.slot) u.res['slot' + L]--; if (ab.use) u.res[ab.use]--; if (ab.cost === 'action') { this.spendAction(u); u.attacksMade = 99; } if (ab.cost === 'bonus') u.bonusUsed = true; tg.hp = Math.min(tg.maxHp, tg.hp + h); this.log(`${tg.name} absorbe ${ab.name} y se cura ${h}.`, 'sys'); u.acted = true; return { ok: true }; }
    if (ab.conc) this.breakConc(u);
    if (ab.cost === 'action') { this.spendAction(u); u.attacksMade = 99; }
    if (ab.cost === 'bonus') u.bonusUsed = true;
    if (ab.slot) u.res['slot' + L]--;
    if (ab.use) u.res[ab.use]--;
    if (ab.pf) { this.pfPool -= ab.pf; this.pfSpent += ab.pf; }
    if (ab.item) { this.inv[ab.item]--; this.itemsUsed[ab.item] = (this.itemsUsed[ab.item] ?? 0) + 1; }
    u.acted = true;
    ab.run(this, u, target as any, L);
    return { ok: true };
  }
  /** Objetivos válidos para el UI de una habilidad. */
  abilityTargets(u: Unit, id: string, lvl = 0): (Unit | P)[] {
    const ab = ABILITIES[id]; if (!ab) return [];
    if (ab.target === 'self' || ab.target === 'none') return [u];
    const out: (Unit | P)[] = [];
    if (ab.target === 'point') {
      for (let y = 0; y < this.grid.h; y++) for (let x = 0; x < this.grid.w; x++) if (cheb(u, { x, y }) <= ab.range && (x !== u.x || y !== u.y) && (this.grid.los(u, { x, y }).visible || this.destructible(x, y))) { const t = this.grid.at(x, y)!; if (t.kind === 'wall' && !t.hp) continue; out.push({ x, y }); }
      return out;
    }
    if (ab.target === 'tile') {
      for (let y = 0; y < this.grid.h; y++) for (let x = 0; x < this.grid.w; x++) { if (cheb(u, { x, y }) <= ab.range && !this.blockedFor(u, x, y) && !this.unitAt(x, y) && (cheb(u, { x, y }) <= 1 || this.grid.los(u, { x, y }).visible)) out.push({ x, y }); }
      return out;
    }
    for (const t of this.units) {
      if (t.dead && ab.target !== 'deadAlly') continue;
      if (ab.target === 'enemy' && (t.side === u.side || !this.targetable(u, t) || t.dead)) continue;
      if (ab.target === 'ally' && (t.side !== u.side || t.dead || t.sprite === 'wall')) continue;
      if (ab.target === 'allyOrSelf' && (t.side !== u.side || t.dead)) continue;
      if (ab.target === 'downedAlly' && !(t.side === u.side && t.down && !t.dead)) continue;
      if (ab.target === 'any' && t.dead) continue;
      if (!this.inRange(u, t, ab.range, ab.los !== false && ab.range > 1)) continue;
      out.push(t);
    }
    return out;
  }

  // ---------- acciones de monstruo ----------
  expectedDamage(u: Unit, a: MAction, t: Unit): number {
    if (!a.dmg) return 0;
    const dmg = a.dmg.reduce((s, p) => s + avg(p.dice) * (t.immune.includes(p.type) ? 0 : t.resist.includes(p.type) ? .5 : t.vuln.includes(p.type) ? 2 : 1), 0);
    if (a.kind === 'save') { const dc = a.save?.dc ?? 12; const need = dc - t.saves[a.save?.ab ?? 'dex']; const pFail = Math.min(1, Math.max(0, (need - 1) / 20)); return dmg * (pFail + (a.half ? (1 - pFail) / 2 : 0)); }
    const need = this.ac(t) - (a.toHit ?? 4); const p = Math.min(0.95, Math.max(0.05, (21 - need) / 20));
    return dmg * p;
  }
  monsterAct(u: Unit, a: MAction, t: Unit | P): Res {
    if (a.recharge && !u.rechargeReady[a.id]) return { ok: false, msg: 'Sin recargar.' };
    if (a.kind === 'melee' || a.kind === 'ranged') {
      const tu = t as Unit; if (!tu.uid) return { ok: false };
      const r = this.rollAttack(u, tu, a.toHit ?? 4, { ranged: a.kind === 'ranged' });
      this.emit({ t: 'fx', kind: a.kind === 'ranged' ? 'bolt' : 'slash', x: u.x, y: u.y, x2: tu.x, y2: tu.y });
      if (!r.hit) { this.log(`${u.name} usa ${a.name} contra ${tu.name}: ${r.nat}→${r.total} vs CA ${r.ac}: falla.`, 'roll'); this.float(tu, 'Falla', 'miss'); }
      else {
        const parts = this.rollParts(a.dmg ?? [], r.crit);
        let total = 0; const txt: string[] = [];
        const enf = this.has(u, 'enfeebled') && a.kind === 'melee';
        const hitParts = parts.map(p => ({ amt: enf ? Math.floor(p.amt / 2) : p.amt, type: p.type })); for (const p of hitParts) txt.push(`${p.amt} ${p.type}`);
        total += this.damageHit(tu, hitParts, u, { crit: r.crit, attack: true, silent: true });
        this.log(`${u.name} usa ${a.name} contra ${tu.name}${r.adv ? ' (ventaja)' : r.dis ? ' (desventaja)' : ''}${r.crit ? ' ¡CRÍTICO!' : ''}: ${r.nat}→${r.total} vs CA ${r.ac}. Daño ${total} (${txt.join(' + ')}).`, 'dmg');
        if (total > 0) this.float(tu, String(total), r.crit ? 'crit' : 'dmg');
        if (u.traits.includes('woundCurse') && !this.flags['wc' + u.uid] && !tu.dead) { this.flags['wc' + u.uid] = 1; this.addStatus(tu, { id: 'noHeal', turns: 600, src: u.uid }); this.log(`${tu.name} sufre la Maldición de Herida: no puede curarse.`, 'sys'); }
        if (a.save && !tu.dead) { if (!this.save(tu, a.save.ab, a.save.dc, `(${a.name})`) && a.save.cond) this.addStatus(tu, { id: a.save.cond, turns: a.save.turns ?? 1, src: u.uid, dot: a.save.dot }); }
      }
    } else if (a.kind === 'save') {
      const center: P = a.aoeSelf || !a.aoe ? u : (t as P);
      const victims = a.aoe ? this.units.filter(v => !v.dead && v.side !== u.side && cheb(v, center) <= a.aoe!) : [t as Unit];
      this.emit({ t: 'fx', kind: 'burst', x: center.x, y: center.y });
      this.log(`${u.name} usa ${a.name}.`, 'roll');
      if (a.dmg && a.aoe) this.hitArea(center, a.aoe, a.dmg.reduce((sum, p) => sum + roll(p.dice).total, 0), a.dmg[0].type, u);
      for (const v of victims) {
        const ok = this.save(v, a.save!.ab, a.save!.dc, `(${a.name})`);
        if (a.dmg) { const ev = v.traits.includes('evasion') && a.save!.ab === 'dex'; this.damageHit(v, this.rollParts(a.dmg, false).map(p => ({ amt: ok ? (ev ? 0 : a.half ? Math.floor(p.amt / 2) : 0) : (ev ? Math.floor(p.amt / 2) : p.amt), type: p.type })), u); }
        if (!ok && a.save!.cond && !v.dead) this.addStatus(v, { id: a.save!.cond, turns: a.save!.turns ?? 1, src: u.uid, dot: a.save!.dot });
      }
    } else if (a.kind === 'heal') {
      const tu = (t as Unit) ?? u; const r = roll(a.heal ?? '1d6'); this.heal(tu, r.total, u); this.log(`${u.name} usa ${a.name} y cura ${r.total} a ${tu.name}.`, 'heal');
    } else if (a.kind === 'buff') {
      this.log(`${u.name} usa ${a.name}.`, 'roll'); if (a.note === 'alarma' && this.cube) { import('./cube').then(c => c.raiseAlert(this, 2, 'El aprendiz lanza Alarma')); } if (a.save?.cond) this.addStatus(u, { id: a.save.cond, turns: a.save.turns ?? 3, src: u.uid });
    }
    if (a.recharge) u.rechargeReady[a.id] = false;
    u.acted = true;
    return { ok: true };
  }

  /** Rasgos de jefe que actúan al comienzo de su turno (hidra, máscaras, inundación). */
  bossStart(u: Unit) {
    if (u.side !== 'foe') return;
    if (u.traits.includes('hydra')) {
      const n = this.units.filter(x => !x.dead && x.id === 'cuello_dahhak').length;
      if (n < 3) { const p = this.freeNear(u); if (p) { this.summon(makeFoeLazy('cuello_dahhak', p.x, p.y), u, p); this.log(`Un nuevo cuello brota del cuerpo de ${u.name}.`, 'sys'); } }
    }
    if (u.traits.includes('mascaras')) {
      const m = MASCARAS[(u.turnsTaken + Math.floor(rand() * 13)) % MASCARAS.length];
      u.resist = [...m.res]; u.vuln = [m.vuln]; this.log(`${u.name} muestra la máscara de ${m.name}: resiste ${m.res.join(' y ')}, es vulnerable a ${m.vuln}.`, 'sys'); this.emit({ t: 'fx', kind: 'burst', x: u.x, y: u.y });
    }
    if (u.traits.includes('flood')) {
      const w: P[] = []; for (let y = 0; y < this.grid.h; y++) for (let x = 0; x < this.grid.w; x++) { const t = this.grid.at(x, y)!; if ((t.kind === 'floor' || t.kind === 'diff') && !this.unitAt(x, y) && [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => this.grid.at(x + dx, y + dy)?.kind === 'water')) w.push({ x, y }); }
      for (let i = 0; i < 3 && w.length; i++) { const k = Math.floor(rand() * w.length); const p = w.splice(k, 1)[0]; this.grid.setTile(p.x, p.y, '~'); this.emit({ t: 'tile', kind: 'build', x: p.x, y: p.y }); }
      this.log(`${u.name} hace subir el agua: el campo se inunda.`, 'sys');
      if (this.grid.at(u.x, u.y)?.kind === 'water' && u.hp < u.maxHp) { const g = Math.min(u.maxHp - u.hp, 8); u.hp += g; this.float(u, `+${g}`, 'heal'); this.log(`${u.name} se alimenta del agua (+${g}).`, 'sys'); }
    }
  }

  /** Auras y efectos persistentes de personaje que se evalúan al empezar el turno de `u`. */
  auraStart(u: Unit) {
    if (u.dead || u.down) return;
    for (const s of this.units) {
      if (s.dead || s.down || s === u && !['auraVida', 'auraValor'].some(t => s.traits.includes(t))) continue;
      const d = cheb(s, u);
      if (s.traits.includes('auraVida') && s.side === u.side && d <= 2 && u.hp < u.maxHp && !u.dead) { const h = this.heal(u, s.prof + 1, s, true); if (h) this.float(u, `+${h}`, 'heal'); }
      if (s.traits.includes('auraValor') && s.side === u.side && d <= 2 && this.has(u, 'frightened')) { this.removeStatus(u, 'frightened'); this.log(`${s.name} infunde valor a ${u.name}.`, 'buff'); }
      if (s.traits.includes('auraSombra') && s.side !== u.side && d <= 2) { this.damage(u, 2 + s.prof, 'necrotic', s); }
      const sg = this.status(s, 'spiritGuard');
      if (sg && s.side !== u.side && d <= 3) { const dmg = roll(`${sg.val ?? 3}d8`).total; const ok = this.save(u, 'wis', s.spellDC, '(Guardianes Espirituales)'); this.damage(u, ok ? Math.floor(dmg / 2) : dmg, 'radiant', s); }
    }
  }
  freeNear(o: P): P | undefined {
    for (let r = 1; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = o.x + dx, y = o.y + dy; const t = this.grid.at(x, y); if (t && !t.blocked && !this.unitAt(x, y)) return { x, y }; }
    return undefined;
  }

  win(msg: string) { if (this.over) return; this.log(msg, 'sys'); this.over = true; this.result = 'victory'; this.emit({ t: 'end', result: 'victory' }); }
  /** Interacción con un objeto del mapa (tomo, calaveras, jaulas…). Cuesta la acción. */
  interact(u: Unit, x: number, y: number, choice?: string): Res {
    const t = this.grid.at(x, y); if (!t?.obj || t.hid) return { ok: false, msg: 'No hay nada con lo que interactuar.' };
    if (cheb(u, { x, y }) > 1) return { ok: false, msg: 'Acércate.' };
    if (!this.hasAction(u)) return { ok: false, msg: 'No te queda acción.' };
    const o = OBJECTS[t.obj]; if (!o) return { ok: false, msg: 'Nada que hacer.' };
    if (!this.spendAction(u)) return { ok: false };
    u.attacksMade = 99; u.acted = true; u.moveLeft = Math.min(u.moveLeft, 1); // un turno completo
    const id = t.obj; const msg = o.run(this, u, { x, y }, choice); this.log(`${u.name}: ${o.label}. ${msg}`, 'sys');
    if (o.once && t.obj === id && !msg.startsWith('✗')) t.obj = undefined;
    return { ok: true };
  }
  /** Los efectos de rasgos al terminar de actuar (script del encuentro). */
  runScripts(round: number) { for (const f of this.scripts) f(this, round); }
  xpValue() { return this.units.filter(u => u.side === 'foe' && u.dead && !u.summoned && !u.fled).reduce((s, u) => s + u.xp, 0); }
  /** Refuerzo: entra al final del orden de iniciativa. */
  reinforce(u: Unit, p: P) { u.initiative = -1; this.spawn(u, p); this.order.push(u); this.log(`¡Llegan refuerzos: ${u.name}!`, 'sys'); }
  /** Invoca una criatura aliada controlada por la IA; entra en el orden de iniciativa justo después del invocador. */
  summon(u: Unit, owner: Unit, p: P) {
    u.side = owner.side; u.ai = true; u.summoned = true; u.initiative = owner.initiative - 0.5; this.spawn(u, p);
    const i = this.order.indexOf(owner); this.order.splice(i + 1, 0, u); if (this.idx > i) this.idx++;
  }
  spawn(u: Unit, p: P) { u.uid = this.nextUid++; u.x = p.x; u.y = p.y; this.units.push(u); this.emit({ t: 'spawn', uid: u.uid }); }
}
export type { Side };
