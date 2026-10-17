import { Battle, COND_LABEL, isHiddenCond } from '../engine/battle';
import { runAI } from '../engine/ai';
import { ABILITIES } from '../engine/abilities';
import { Renderer } from './render';
import { h, sleep, avatar } from './dom';
import { cheb } from '../engine/grid';
import { avg } from '../engine/dice';
import { MAPS } from '../data/maps';
import { PARTY_BY_ID } from '../data/party';
import { ITEM } from '../data/items';
import { OBJECTS, ALERT_LABEL } from '../engine/cube';
import { ROT_SEQ } from '../data/maunator';
import { MONSTERS } from '../data/monsters';
import type { Unit, Weapon, BEvent, Ab } from '../engine/types';
import type { P } from '../engine/grid';

type Mode = { k: 'idle' } | { k: 'interact' } | { k: 'move' } | { k: 'terrain'; w: Weapon } | { k: 'weapon'; w: Weapon } | { k: 'ability'; id: string; lvl: number } | { k: 'busy' };
export interface BattleResult { result: 'victory' | 'defeat'; xp: number; pfSpent: number; survivors: Record<string, number>; downed: string[]; dead: string[]; rounds: number; carry?: string[]; flagsOut?: string[]; cubeAlert?: number; foeHpPct?: number; kills: string[]; used: Record<string, number> }

const ABN: Record<Ab, string> = { str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
const sgn = (n: number) => (n >= 0 ? '+' : '') + n;

export class BattleUI {
  root: HTMLElement; b!: Battle; r!: Renderer; canvas!: HTMLCanvasElement;
  mode: Mode = { k: 'idle' }; selUid = -1; resolveTurn?: () => void; finished?: (r: BattleResult) => void; stopped = false;
  left!: HTMLElement; right!: HTMLElement; bar!: HTMLElement; logEl!: HTMLElement; tracker!: HTMLElement; tip!: HTMLElement; menuEl: HTMLElement | null = null;
  keyH?: (e: KeyboardEvent) => void;

  constructor(root: HTMLElement) { this.root = root; }

  async run(b: Battle, mapId: string, intro: string): Promise<BattleResult> {
    this.b = b; this.stopped = false; this.root.innerHTML = ''; (window as any).__ui = this; (window as any).__b = b;
    const map = MAPS[mapId];
    this.canvas = h('canvas', { id: 'board' }); this.left = h('aside', { id: 'left', class: 'side' }); this.right = h('aside', { id: 'right', class: 'side' });
    this.bar = h('div', { id: 'actionbar' }); this.logEl = h('div', { id: 'log' }); this.tracker = h('div', { id: 'tracker' }); this.tip = h('div', { id: 'tooltip', class: 'hidden' });
    const stage = h('div', { id: 'stage' }, this.canvas, this.tracker, h('div', { id: 'objective' }, h('b', {}, map.name), h('div', {}, map.objective)), this.logEl);
    // En pantallas pequeñas, las columnas laterales pasan a ser cajones que se abren con estos botones.
    const drawer = (side: HTMLElement, other: HTMLElement) => () => { const open = !side.classList.contains('open'); other.classList.remove('open'); side.classList.toggle('open', open); };
    const dBtns = h('div', { id: 'drawers' }, h('button', { class: 'dbtn', onClick: drawer(this.left, this.right) }, '👥'), h('button', { class: 'dbtn', onClick: drawer(this.right, this.left) }, '📖'));
    stage.append(dBtns);
    this.root.append(this.left, stage, this.right, this.bar, this.tip);
    this.root.id = 'battle'; this.root.className = 'screen';
    this.r = new Renderer(this.canvas); this.r.setBattle(b, map);
    window.addEventListener('resize', this.onResize); setTimeout(() => this.r.resize(), 30);
    this.bindInput();
    this.addLog(intro, 'sys');
    return new Promise(res => { this.finished = res; this.loop(); });
  }
  onResize = () => this.r?.resize();
  destroy() { this.stopped = true; this.r?.destroy(); window.removeEventListener('resize', this.onResize); if (this.keyH) window.removeEventListener('keydown', this.keyH); this.root.id = ''; }

  // ---------- bucle ----------
  async flush() {
    const ev = this.b.takeEvents();
    for (const e of ev) if (e.t === 'log') this.addLog(e.text, e.cls);
    this.r.play(ev);
    this.renderPanels();
    let guard = 0; while (this.r.busy() && guard++ < 400) await sleep(30);
    return ev;
  }
  addLog(t: string, cls = '') { const d = h('div', { class: cls }, t); this.logEl.append(d); this.logEl.scrollTop = this.logEl.scrollHeight; }
  async loop() {
    const b = this.b; b.start(); await this.flush();
    while (!b.over && !this.stopped) {
      const u = b.cur; if (!u) break;
      this.r.activeUid = u.uid; this.selUid = u.uid; this.r.selUid = u.uid; this.renderAll();
      if (u.ai) {
        await sleep(250);
        await runAI(b, u, async ms => { await this.flush(); await sleep(ms ?? 300); });
        await this.flush(); if (b.over) break; b.endTurn(); await this.flush();
      } else {
        this.mode = { k: 'idle' }; this.renderAll(); this.updateOverlays();
        await new Promise<void>(res => { this.resolveTurn = res; });
        if (this.stopped) return; this.mode = { k: 'busy' }; this.clearMenu(); this.r.overlays = [];
        b.endTurn(); await this.flush();
      }
    }
    if (this.stopped) return;
    await this.flush(); await sleep(700);
    const pcs = b.units.filter(u => u.pcId);
    const survivors: Record<string, number> = {}; for (const p of pcs) if (!p.dead) survivors[p.pcId!] = p.hp;
    this.finished?.({ result: b.result ?? 'defeat', xp: b.xpValue(), pfSpent: b.pfSpent, survivors, downed: pcs.filter(p => p.down).map(p => p.pcId!), dead: pcs.filter(p => p.dead).map(p => p.pcId!), rounds: b.round, carry: Object.keys(b.carry), flagsOut: [...b.storyFlagsOut], cubeAlert: b.cube?.alert, foeHpPct: (() => { const f = b.units.filter(u => u.side === 'foe' && !u.summoned); const mx = f.reduce((a, u) => a + u.maxHp, 0); return mx ? f.reduce((a, u) => a + Math.max(0, u.hp), 0) / mx : 0; })(), kills: b.units.filter(u => u.side === 'foe' && u.dead && !u.summoned && !u.fled).map(u => u.id), used: { ...b.itemsUsed } });
  }
  endTurn() { if (this.resolveTurn && this.mode.k !== 'busy') { const f = this.resolveTurn; this.resolveTurn = undefined; f(); } }
  get cur(): Unit | undefined { const u = this.b.cur; return u && !u.ai ? u : undefined; }

  // ---------- entrada ----------
  bindInput() {
    let touch = false; this.canvas.addEventListener('pointerdown', e => { touch = e.pointerType === 'touch'; });
    this.canvas.addEventListener('mousemove', e => {
      if (touch) return; // el navegador táctil simula un mousemove al tocar: no debe contar como «vista previa»
      const rc = this.canvas.getBoundingClientRect(); const t = this.r.tileFromMouse(e.clientX - rc.left, e.clientY - rc.top); this.r.hover = t; this.showHoverTip(e, t);
    });
    this.canvas.addEventListener('mouseleave', () => { this.r.hover = null; this.tip.classList.add('hidden'); });
    this.canvas.addEventListener('click', e => {
      if (e.button !== 0 || performance.now() - this.r.lastDrag < 250) return; const rc = this.canvas.getBoundingClientRect(); const t = this.r.tileFromMouse(e.clientX - rc.left, e.clientY - rc.top); if (!t) return;
      // En pantalla táctil, el primer toque muestra la casilla (y su previsualización); el segundo, sobre la misma casilla, ejecuta.
      if (touch && this.mode.k !== 'idle' && this.mode.k !== 'busy' && !(this.r.hover && this.r.hover.x === t.x && this.r.hover.y === t.y)) { this.r.hover = t; this.showHoverTip(e, t); return; }
      this.clickTile(t);
    });
    this.keyH = (e: KeyboardEvent) => {
      if (!this.cur || this.mode.k === 'busy') return; if ((e.target as HTMLElement)?.tagName === 'SELECT') return;
      if (e.key === 'Escape') { this.setMode({ k: 'idle' }); }
      else if (e.key === 'm' || e.key === 'M') this.setMode({ k: 'move' });
      else if (e.key === 'a' || e.key === 'A') this.openAttackMenu();
      else if (e.key === 'h' || e.key === 'H') this.openAbilityMenu();
      else if (e.key === 'i' || e.key === 'I') this.openItemMenu();
      else if (e.key === 'f' || e.key === 'F') this.setMode({ k: 'interact' });
      else if (e.key === ' ' || e.key === 'e' || e.key === 'E') { e.preventDefault(); this.endTurn(); }
    };
    window.addEventListener('keydown', this.keyH);
  }
  unitAtTile(t: P) { return this.b.unitAt(t.x, t.y); }
  clickTile(t: P) {
    const u = this.cur; const under = this.unitAtTile(t);
    if (!u || this.mode.k === 'busy') { if (under) this.select(under); return; }
    const m = this.mode;
    if (m.k === 'interact') { const tl = this.b.grid.at(t.x, t.y); if (tl?.obj && cheb(u, t) <= 1) this.doInteract(u, t); else if (under) this.select(under); else this.setMode({ k: 'idle' }); return; }
    if (m.k === 'move') { const r = this.b.move(u, t.x, t.y); if (r.ok) { this.afterAction(); } else if (under) this.select(under); return; }
    if (m.k === 'terrain') { const r = this.b.attackTerrain(u, m.w, t.x, t.y); if (!r.ok) this.toast(r.msg!); this.afterAction(true); return; }
    if (m.k === 'weapon') {
      if (under && this.validTarget(u, under, m)) { const r = this.b.weaponAttack(u, m.w, under); if (!r.ok) this.toast(r.msg!); this.afterAction(true); } else if (under) this.select(under); else this.setMode({ k: 'idle' });
      return;
    }
    if (m.k === 'ability') {
      const ab = ABILITIES[m.id]; let target: any = under;
      if (ab.target === 'tile' || ab.target === 'point') target = t;
      if (!target || !this.validAbilityTarget(u, m, target)) { if (under) this.select(under); return; }
      const r = this.b.useAbility(u, m.id, target, m.lvl); if (!r.ok) this.toast(r.msg!); this.afterAction(true); return;
    }
    if (under) this.select(under);
  }
  validTarget(u: Unit, t: Unit, m: { w: Weapon }) { return t.side !== u.side && this.b.targetable(u, t) && this.b.inRange(u, t, m.w.longRange ?? m.w.range); }
  validAbilityTarget(u: Unit, m: { id: string; lvl: number }, t: any) { return this.b.abilityTargets(u, m.id, m.lvl).some(x => x === t || ((x as P).x === t.x && (x as P).y === t.y && !(x as Unit).uid === !t.uid)); }
  select(u: Unit) { this.selUid = u.uid; this.r.selUid = u.uid; this.renderRight(); this.renderLeft(); }
  toast(msg: string) { this.addLog(msg, 'sys'); const t = h('div', { class: 'hidden' }); void t; }

  async afterAction(attack = false) {
    const prev = this.mode; this.mode = { k: 'busy' }; this.clearMenu(); this.r.overlays = [];
    await this.flush(); if (this.b.over) { this.resolveTurn?.(); return; }
    const u = this.cur; this.mode = { k: 'idle' };
    // si seguimos en una secuencia de ataques, vuelve a armar el arma
    if (attack && u && prev.k === 'weapon' && u.attacksMade > 0 && u.attacksMade < this.b.maxAttacks(u) && !this.b.incapacitated(u)) this.setMode(prev); else this.setMode({ k: 'idle' });
    this.renderAll();
  }
  setMode(m: Mode) { this.mode = m; this.clearMenu(); this.updateOverlays(); this.renderBar(); }
  clearMenu() { this.menuEl?.remove(); this.menuEl = null; }

  updateOverlays() {
    const u = this.cur, b = this.b; const ov: any[] = []; this.r.overlays = ov; if (!u || this.mode.k === 'busy') return;
    const m = this.mode;
    if (m.k === 'interact') { for (let y = 0; y < b.grid.h; y++) for (let x = 0; x < b.grid.w; x++) if (b.grid.at(x, y)!.obj && cheb(u, { x, y }) <= 1) ov.push({ x, y, kind: 'mark' }); }
    if (m.k === 'move') for (const v of b.reach(u).values()) if (!v.occ && (v.x !== u.x || v.y !== u.y)) ov.push({ x: v.x, y: v.y, kind: 'move' });
    if (m.k === 'terrain') { const rg = m.w.longRange ?? m.w.range; for (let y = 0; y < b.grid.h; y++) for (let x = 0; x < b.grid.w; x++) if (b.destructible(x, y) && cheb(u, { x, y }) <= rg) ov.push({ x, y, kind: 'aoe' }); }
    if (m.k === 'weapon') {
      const rg = m.w.longRange ?? m.w.range; for (let y = 0; y < b.grid.h; y++) for (let x = 0; x < b.grid.w; x++) if (cheb(u, { x, y }) <= Math.min(rg, 14) && (x !== u.x || y !== u.y) && b.grid.at(x, y)!.kind !== 'wall') ov.push({ x, y, kind: 'range' });
      for (const t of b.foesOf(u)) if (this.validTarget(u, t, m)) ov.push({ x: t.x, y: t.y, kind: 'atk' });
    }
    if (m.k === 'ability') {
      const ab = ABILITIES[m.id]; const ts = b.abilityTargets(u, m.id, m.lvl);
      for (const t of ts) { const p = t as P; if ((t as Unit).uid) ov.push({ x: p.x, y: p.y, kind: (t as Unit).side === u.side ? 'ally' : 'atk' }); else ov.push({ x: p.x, y: p.y, kind: 'mark' }); }
      void ab;
    }
  }

  // ---------- paneles ----------
  renderAll() { this.renderPanels(); this.updateOverlays(); }
  renderPanels() { this.renderLeft(); this.renderRight(); this.renderBar(); this.renderTracker(); }
  card(u: Unit): HTMLElement {
    const b = this.b; const hp = Math.max(0, u.hp / u.maxHp) * 100;
    const slots = Object.keys(u.resMax).filter(k => k.startsWith('slot')).map(k => `${k.replace('slot', 'N')}:${u.res[k]}/${u.resMax[k]}`).join(' ');
    const el = h('div', { class: `unitcard ${b.cur === u ? 'cur' : ''} ${this.selUid === u.uid ? 'sel' : ''} ${u.dead ? 'dead' : ''}`, onClick: () => this.select(u) },
      avatar(u.glyph, u.color, undefined, 38),
      h('div', { class: 'info' }, h('div', { class: 'nm' }, h('span', {}, u.name), h('span', { class: 'small' }, `${u.hp}/${u.maxHp}`)),
        h('div', { class: 'bar hp' }, h('i', { style: { width: hp + '%' } })),
        h('div', { class: 'small' }, u.down ? `☠ salvaciones ${u.death.succ}✓ ${u.death.fail}✗` : u.dead ? 'Muerto' : (slots || `CA ${b.ac(u)}`))));
    return el;
  }
  renderLeft() {
    const b = this.b; this.left.innerHTML = ''; this.left.append(h('div', { class: 'sec' }, 'Compañía'));
    for (const u of b.units.filter(u => u.side === 'pc' && u.sprite !== 'wall')) this.left.append(this.card(u));
    this.left.append(h('div', { class: 'sec' }, 'Enemigos'));
    for (const u of b.units.filter(u => u.side === 'foe')) this.left.append(this.card(u));
  }
  renderTracker() {
    const b = this.b; this.tracker.innerHTML = ''; this.tracker.append(h('span', { class: 'rd' }, `Ronda ${b.round}`));
    b.order.forEach(u => { const el = h('div', { class: `tk ${b.cur === u ? 'cur' : ''} ${u.dead ? 'dead' : ''}`, title: `${u.name} (${u.initiative})`, style: { background: u.color, borderColor: u.side === 'pc' ? '#5be37d' : '#e5584b' }, onClick: () => this.select(u) }, u.glyph); this.tracker.append(el); });
  }
  renderRight() {
    const b = this.b; const u = b.byUid(this.selUid) ?? b.cur; const R = this.right; R.innerHTML = ''; if (!u) return;
    const def = u.pcId ? PARTY_BY_ID[u.pcId] : undefined;
    R.append(h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, avatar(u.glyph, u.color, undefined, 44), h('div', {}, h('div', { style: { fontFamily: 'var(--f-head)', fontSize: '17px', color: 'var(--secondary)' } }, u.name), h('div', { class: 'small' }, def ? `${def.race} · ${def.klass} ${u.level}` : (b.byUid(u.uid) && u.cr ? `FP ${u.cr}` : '')))));
    R.append(h('div', { class: 'stats' }, ...(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ab[]).map(k => h('div', {}, ABN[k], h('b', {}, sgn(u.mods[k]))))));
    R.append(h('div', {}, h('span', { class: 'tag' }, `CA ${b.ac(u)}`), h('span', { class: 'tag' }, `PG ${u.hp}/${u.maxHp}${u.temp ? ` (+${u.temp})` : ''}`), h('span', { class: 'tag' }, `Vel ${u.speed * 5} ft`), u.fly ? h('span', { class: 'tag good' }, 'Vuela') : null));
    const resTags = Object.keys(u.resMax).filter(k => u.resMax[k] > 0 && k !== 'flurry').map(k => h('span', { class: 'tag mag' }, `${RES[k] ?? k}: ${u.res[k]}/${u.resMax[k]}`)); if (resTags.length) R.append(h('div', { class: 'sec' }, 'Recursos'), h('div', {}, ...resTags));
    const st = u.statuses.filter(s => !isHiddenCond(s.id)); if (st.length) { R.append(h('div', { class: 'sec' }, 'Estados')); R.append(h('div', {}, ...st.map(s => h('span', { class: `tag ${['bless', 'shieldFaith', 'aided', 'radiantSoul', 'dodging', 'invisible'].includes(s.id) ? 'good' : 'bad'}`, title: s.turns > 0 ? `${s.turns} turnos` : '' }, COND_LABEL[s.id] || s.id)))); }
    if (u.resist.length || u.immune.length || u.vuln.length) R.append(h('div', {}, ...u.resist.map(x => h('span', { class: 'tag good' }, 'Res. ' + x)), ...u.immune.map(x => h('span', { class: 'tag good' }, 'Inm. ' + x)), ...u.vuln.map(x => h('span', { class: 'tag bad' }, 'Vuln. ' + x))));
    if (u.weapons.length) { R.append(h('div', { class: 'sec' }, 'Ataques')); for (const w of u.weapons) R.append(h('div', { class: 'small', style: { marginBottom: '3px' } }, `${w.name}: ${sgn(w.toHit)} · ${w.dmg.map(d => d.dice).join('+')} · ${w.range > 1 ? w.range * 5 + ' ft' : 'cuerpo a cuerpo'}`)); }
    if (u.actions.length) { R.append(h('div', { class: 'sec' }, 'Acciones')); for (const a of u.actions) R.append(h('div', { class: 'small', style: { marginBottom: '3px' } }, `${a.name}${a.toHit != null ? ` ${sgn(a.toHit)}` : ''}${a.dmg ? ' · ' + a.dmg.map(d => d.dice + ' ' + d.type).join(' + ') : ''}${a.save ? ` · CD ${a.save.dc} ${ABN[a.save.ab]}` : ''}${a.recharge ? ` (recarga ${a.recharge}-6${u.rechargeReady[a.id] ? ' ✔' : ' ✗'})` : ''}`)); }
    if (def) { R.append(h('div', { class: 'sec' }, 'Historia'), h('div', { class: 'lore' }, def.blurb), h('div', { class: 'lore', style: { marginTop: '6px' } }, '☉ ' + def.quest)); if (def.statusNote) R.append(h('div', { class: 'small', style: { marginTop: '6px', color: '#d9a24a' } }, '⚠ ' + def.statusNote)); }
    else { const md = MONSTERS[u.id]; if (md?.lore) R.append(h('div', { class: 'sec' }, 'Bestiario'), h('div', { class: 'lore' }, `${md.type}. ${md.lore}`)); }
    const cp = this.cubePanel(); if (cp) R.append(cp);
    const t = b.grid.at(u.x, u.y); R.append(h('div', { class: 'sec' }, 'Terreno'), h('div', { class: 'small' }, t ? TERRAIN[t.kind] : ''));
  }
  renderBar() {
    const u = this.cur, B = this.bar; B.innerHTML = ''; this.menuEl = null;
    if (!u) { B.append(h('div', { class: 'small', style: { padding: '8px 4px' } }, this.b.over ? 'Combate terminado.' : `Turno de ${this.b.cur?.name ?? '…'}`)); return; }
    const b = this.b; const busy = this.mode.k === 'busy'; const inc = b.incapacitated(u);
    const btn = (label: string, key: string, fn: () => void, on = false, dis = false) => h('button', { class: `act ${on ? 'on' : ''}`, disabled: dis || busy || inc, onClick: fn }, label, h('kbd', {}, key));
    B.append(btn('👣 Mover', 'M', () => this.setMode(this.mode.k === 'move' ? { k: 'idle' } : { k: 'move' }), this.mode.k === 'move', u.moveLeft <= 0));
    const canAtk = b.hasAction(u) || u.weapons.some(w => w.bonusAction && (!u.bonusUsed || u.res['flurry'] > 0));
    B.append(btn('⚔ Atacar', 'A', () => this.openAttackMenu(), this.mode.k === 'weapon', !canAtk));
    B.append(btn('✦ Habilidades', 'H', () => this.openAbilityMenu(), this.mode.k === 'ability'));
    if (b.cube || b.grid.tiles.some(r => r.some(t => t.obj))) B.append(btn('🔧 Interactuar', 'F', () => this.setMode(this.mode.k === 'interact' ? { k: 'idle' } : { k: 'interact' }), this.mode.k === 'interact', !b.hasAction(u)));
    B.append(btn('🎒 Objeto', 'I', () => this.openItemMenu(), false, !Object.entries(this.b.inv).some(([id, n]) => n > 0 && Object.values(ABILITIES).some(a => a.item === id))));
    B.append(btn('⏳ Terminar turno', 'Espacio', () => this.endTurn()));
    const left = u.moveLeft;
    B.append(h('div', { class: 'pips' },
      h('span', { class: `pip ${left > 0 ? 'free' : 'used'}` }, `Mov ${left * 5}ft`),
      h('span', { class: `pip ${b.hasAction(u) ? 'free' : 'used'}` }, `Acción${u.extraActions ? ' +' + u.extraActions : ''}${u.attacksMade > 0 && u.attacksMade < b.maxAttacks(u) ? ' (ataque ' + (u.attacksMade + 1) + ')' : ''}`),
      h('span', { class: `pip ${!u.bonusUsed || u.res['flurry'] > 0 ? 'free' : 'used'}` }, 'Adicional'),
      this.b.pfPool > 0 ? h('span', { class: 'pip free', title: 'Puntos de Fe disponibles para Milagros' }, `PF ${this.b.pfPool}`) : null));
  }
  openAttackMenu() {
    const u = this.cur; if (!u) return; this.clearMenu();
    const m = h('div', { class: 'menu' }, h('h4', {}, 'Ataque con arma'));
    for (const w of u.weapons) {
      const bonusOk = !w.bonusAction || !u.bonusUsed || u.res['flurry'] > 0;
      const dis = (w.bonusAction ? !bonusOk : !this.b.hasAction(u));
      m.append(h('button', { class: 'mi', disabled: dis, onClick: () => this.setMode({ k: 'weapon', w }), onMouseenter: (e: MouseEvent) => this.tipAt(e, `<b>${w.name}</b><br>${sgn(w.toHit)} al ataque · ${w.dmg.map(d => d.dice + ' ' + d.type).join(' + ')}<br>Alcance ${w.range * 5} ft${w.longRange && w.longRange !== w.range ? ' / ' + w.longRange * 5 : ''}${w.note ? '<br><i>' + w.note + '</i>' : ''}${w.bonusAction ? '<br>Acción adicional' : ''}`), onMouseleave: () => this.tip.classList.add('hidden') },
        h('span', { class: 'nm' }, w.name), h('span', { class: 'cost' }, `${sgn(w.toHit)} · ${w.dmg[0].dice}`)));
    }
    const canBreak = this.b.hasAction(u) && u.weapons.some(w => !w.bonusAction && [...Array(this.b.grid.h).keys()].some(y => [...Array(this.b.grid.w).keys()].some(x => this.b.destructible(x, y) && cheb(u, { x, y }) <= (w.longRange ?? w.range))));
    if (canBreak) { const w = u.weapons.find(x => !x.bonusAction)!; m.append(h('h4', {}, 'Terreno'), h('button', { class: 'mi', onClick: () => this.setMode({ k: 'terrain', w }) }, h('span', { class: 'nm' }, '💥 Romper / destruir terreno'), h('span', { class: 'cost' }, 'barriles, muros frágiles, cobertura'))); }
    this.menuEl = m; this.bar.append(m);
  }
  openAbilityMenu() {
    const u = this.cur; if (!u) return; this.clearMenu(); const b = this.b;
    const m = h('div', { class: 'menu' }); const groups: [string, string[]][] = [['Acción', []], ['Acción adicional', []], ['Gratuita', []]];
    for (const id of u.abilities) { const ab = ABILITIES[id]; if (!ab) continue; groups[ab.cost === 'action' ? 0 : ab.cost === 'bonus' ? 1 : 2][1].push(id); }
    for (const [name, ids] of groups) {
      if (!ids.length) continue; m.append(h('h4', {}, name));
      for (const id of ids) {
        const ab = ABILITIES[id]; const can = b.canUse(u, id); const lv = ab.slot ? b.slotLevels(u, ab.slot) : [];
        const cost = ab.pf ? `${ab.pf} PF` : ab.slot ? (ab.upcast ? `nv ${ab.slot}+` : `nv ${ab.slot}`) : ab.use ? `${RES[ab.use] ?? ab.use} ${u.res[ab.use] ?? 0}` : ab.id === 'dash' || ab.id === 'dodge' ? '' : 'truco';
        const row = h('div', { style: { display: 'flex', alignItems: 'center' } });
        const main = h('button', { class: 'mi', disabled: !can.ok, title: can.msg ?? '', onClick: () => this.pickAbility(id, lv[0] ?? 0), onMouseenter: (e: MouseEvent) => this.tipAt(e, `<b>${ab.name}</b><br>${ab.desc}${ab.conc ? '<br><i>Concentración</i>' : ''}${ab.range > 1 ? `<br>Alcance ${ab.range * 5} ft` : ''}`), onMouseleave: () => this.tip.classList.add('hidden') }, h('span', { class: 'nm' }, ab.name), h('span', { class: 'cost' }, cost));
        row.append(main);
        if (ab.upcast && lv.length > 1) for (const l of lv.slice(1)) row.append(h('button', { class: 'lvl', title: `Lanzar con espacio de nivel ${l}`, onClick: () => this.pickAbility(id, l) }, `▲${l}`));
        m.append(row);
      }
    }
    this.menuEl = m; this.bar.append(m);
  }
  async doInteract(u: Unit, t: P) {
    const tl = this.b.grid.at(t.x, t.y)!; const o = OBJECTS[tl.obj!]; if (!o) return;
    const go = (choice?: string) => { this.clearMenu(); const r = this.b.interact(u, t.x, t.y, choice); if (!r.ok) this.toast(r.msg!); this.afterAction(); };
    if (o.choices) { this.clearMenu(); const m = h('div', { class: 'menu' }, h('h4', {}, o.label)); for (const c of o.choices) m.append(h('button', { class: 'mi', onClick: () => go(c.id) }, h('span', { class: 'nm' }, c.label))); m.append(h('button', { class: 'mi', onClick: () => { this.clearMenu(); this.setMode({ k: 'idle' }); } }, h('span', { class: 'nm' }, 'Cancelar'))); this.menuEl = m; this.bar.append(m); return; }
    go();
  }
  cubePanel(): HTMLElement | null {
    const b = this.b; const c = b.cube; if (!c) return null;
    const names: Record<string, string> = { tomo: 'Inventario de Maunator', calavera1: 'Calavera 1', calavera2: 'Calavera 2', calavera3: 'Calavera 3', sello: 'Sello de Helm', diario: 'Diario', medallon4: 'Medallón sin marca' };
    const col = ['#9ad8a0', '#e8c872', '#e08a4a', '#e5584b'][c.alert];
    return h('div', {}, h('div', { class: 'sec' }, 'Cubo de Maunator'), h('div', {}, h('span', { class: 'tag', style: { color: col, borderColor: col } }, `Alerta: ${ALERT_LABEL[c.alert]}`), h('span', { class: 'tag' }, `Rotación cada ${[3, 2, 1, 1][c.alert]} ronda${c.alert >= 2 ? '' : 's'}`)),
      c.knowsPattern ? h('div', { class: 'small' }, `Próxima: ${ROT_SEQ[c.step % 8].label}`) : h('div', { class: 'small' }, 'Patrón desconocido (cuadernos o Investigación).'),
      h('div', { class: 'small' }, `Lleváis: ${Object.keys(b.carry).map(k => names[k] ?? k).join(', ') || 'nada'}`), h('div', { class: 'small' }, `Objetivo: tomo + 3 calaveras → La Salida (${c.goal.filter(g => b.carry[g]).length}/3).`));
  }
  openItemMenu() {
    const u = this.cur; if (!u) return; this.clearMenu(); const b = this.b;
    const m = h('div', { class: 'menu' }, h('h4', {}, 'Mochila de la compañía'));
    for (const ab of Object.values(ABILITIES).filter(a => a.item && (b.inv[a.item] ?? 0) > 0)) {
      const can = b.canUse(u, ab.id); const it = ITEM[ab.item!];
      m.append(h('button', { class: 'mi', disabled: !can.ok, title: can.msg ?? '', onClick: () => this.pickAbility(ab.id, 0), onMouseenter: (e: MouseEvent) => this.tipAt(e, `<b>${it.name}</b><br>${it.desc}`), onMouseleave: () => this.tip.classList.add('hidden') }, h('span', { class: 'nm' }, `${it.icon} ${it.name}`), h('span', { class: 'cost' }, `×${b.inv[ab.item!]} · ${ab.cost === 'bonus' ? 'adicional' : ab.cost === 'action' ? 'acción' : ''}`)));
    }
    this.menuEl = m; this.bar.append(m);
  }
  pickAbility(id: string, lvl: number) {
    const u = this.cur; if (!u) return; const ab = ABILITIES[id]; this.clearMenu();
    if (ab.target === 'self' || ab.target === 'none') { const r = this.b.useAbility(u, id, undefined, lvl); if (!r.ok) this.toast(r.msg!); this.afterAction(); return; }
    const ts = this.b.abilityTargets(u, id, lvl); if (!ts.length) { this.toast('No hay objetivos válidos.'); return; }
    this.setMode({ k: 'ability', id, lvl });
  }
  tipAt(e: MouseEvent, html: string) { this.tip.innerHTML = html; this.tip.classList.remove('hidden'); this.tip.style.left = Math.min(window.innerWidth - 320, e.clientX + 14) + 'px'; this.tip.style.top = Math.max(8, e.clientY - 90) + 'px'; }
  showHoverTip(e: MouseEvent, t: P | null) {
    if (!t) { this.tip.classList.add('hidden'); return; }
    const u = this.cur, under = this.unitAtTile(t); const m = this.mode;
    if (u && under && m.k === 'weapon' && this.validTarget(u, under, m)) {
      const vis = this.b.canSee(u, under); const need = this.b.ac(under, vis.cover) - m.w.toHit; const p = Math.round(Math.min(95, Math.max(5, (21 - need) * 5)));
      this.tipAt(e, `<b>${under.name}</b><br>Impacto ≈ <b>${p}%</b> (CA ${this.b.ac(under, vis.cover)}${vis.cover ? ', cobertura +' + vis.cover : ''})<br>Daño medio ≈ ${Math.round(m.w.dmg.reduce((s, d) => s + avg(d.dice), 0))}`); return;
    }
    if (under) { this.tipAt(e, `<b>${under.name}</b> · PG ${under.hp}/${under.maxHp} · CA ${this.b.ac(under)}${under.statuses.filter(s => !isHiddenCond(s.id)).length ? '<br>' + under.statuses.filter(s => !isHiddenCond(s.id)).map(s => COND_LABEL[s.id]).join(', ') : ''}`); return; }
    this.tip.classList.add('hidden');
  }
}
const RES: Record<string, string> = { eclipse: 'Eclipse', verdad: 'Una Verdad', slot1: 'Esp. N1', slot2: 'Esp. N2', slot3: 'Esp. N3', channel: 'Canalizar', sw: 'Tomar Aliento', surge: 'Oleada', sd: 'Dados Sup.', soul: 'Alma Radiante', hh: 'Manos Cur.', curse: 'Maldición', faerie: 'Fuego Feérico', ki: 'Ki', flurry: 'Ráfaga', slot4: 'Esp. N4', slot5: 'Esp. N5', slot6: 'Esp. N6', slot7: 'Esp. N7', slot8: 'Esp. N8', juicio: 'Juicio Final', indomitable: 'Indómito', specter: 'Espectro', arc6: 'Arcano 6', arc7: 'Arcano 7', volley: 'Descarga', poison: 'Veneno', smoke: 'Humo', whole: 'Plenitud', palm: 'Palma' };
const TERRAIN: Record<string, string> = { fire: 'Fuego: 1d6 al entrar o empezar el turno. Dura unas rondas y se propaga a lo inflamable.', floor: 'Suelo llano.', diff: 'Terreno difícil: cuesta el doble de movimiento.', wall: 'Muro: bloquea el paso y la visión.', cover: 'Cobertura: bloquea el paso; +2 CA a quien esté detrás.', hazard: 'Peligroso: 1d6 de fuego al entrar o empezar el turno.', water: 'Agua: terreno difícil.', high: 'Plataforma elevada: terreno difícil.', mark: 'Marca grabada en el suelo.' };
export type { BEvent };
