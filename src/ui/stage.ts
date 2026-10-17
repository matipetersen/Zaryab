import { Renderer } from './render';
import { Battle } from '../engine/battle';
import { Grid } from '../engine/grid';
import { MAPS } from '../data/maps';
import { PARTY_BY_ID, makePC } from '../data/party';
import { makeFoe } from '../data/monsters';
import { SPEAKERS } from '../story/speakers';
import type { Unit } from '../engine/types';
import { sleep } from './dom';

/** Fondo de historia → mapa jugable donde transcurre la escena (los que no figuran quedan como fondo pintado). */
export const BG_MAP: Record<string, string> = {
  dunas: 'dunas', tormenta: 'dunas', prison: 'mina', coliseo: 'arena', medinat: 'medinat', bajo: 'callejon', choza: 'santuario', taller: 'santuario',
  zoco: 'zoco', hammam: 'pozo', espejos: 'cubo', cubo: 'cubo', acueducto: 'acueducto', plaza: 'plaza', oraculo: 'templo',
};

/** Escena sobre el mapa: la compañía entra caminando, deambula, y quien habla se adelanta y se ilumina. */
export class StageView {
  canvas = document.createElement('canvas'); r: Renderer; b?: Battle; mapId = ''; party: string[] = []; alive = true; npcs: Unit[] = [];
  private wander = 0; private timer = 0;
  constructor(public host: HTMLElement) {
    this.canvas.className = 'stage-cv'; this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    host.append(this.canvas); this.r = new Renderer(this.canvas); this.r.cine = true;
    this.onResize = this.onResize.bind(this); window.addEventListener('resize', this.onResize);
    this.timer = window.setInterval(() => this.idle(), 2600);
  }
  onResize() { this.r.resize(); this.frame(); }
  destroy() { clearInterval(this.timer); window.removeEventListener('resize', this.onResize); this.r.destroy(); this.canvas.remove(); this.alive = false; }
  show(on: boolean) { this.canvas.style.display = on ? 'block' : 'none'; }
  /** Deja el mapa un poco arriba para que el cuadro de diálogo no tape a los personajes. */
  frame() {
    const r = this.r, b = this.b; r.zoom = r.W < 600 ? 2.4 : 1.6; r.panX = 0; r.panY = 0; if (!b) return;
    const hasFoes = b.units.some(u => u.side === 'foe' && u.id !== 'npc'); if (hasFoes) r.zoom = r.W < 600 ? 1.5 : 1.15;
    const pcs = b.units.filter(u => (hasFoes || u.side === 'pc') && u.id !== 'npc' && u.hp > 0); if (!pcs.length) return;
    const cx = pcs.reduce((a, u) => a + u.x, 0) / pcs.length, cy = pcs.reduce((a, u) => a + u.y, 0) / pcs.length;
    const p = r.proj(cx, cy); r.panX = r.W / 2 - p.x; r.panY = r.H * (r.W < 600 ? 0.3 : 0.36) - p.y;
  }

  async set(mapId: string, party: string[], foes: string[] = []) {
    const map = MAPS[mapId]; if (!map) { this.show(false); return; }
    if (mapId === this.mapId && !foes.length) { this.show(true); return; }
    this.mapId = mapId; this.npcs = []; this.show(true);
    const grid = new Grid(map.rows, map.objs); const units: Unit[] = [];
    this.party = party.filter(id => PARTY_BY_ID[id]);
    this.party.forEach((id, i) => { const p = grid.spawns.pc[i] ?? grid.spawns.pc[0]; if (!p) return; const u = makePC(PARTY_BY_ID[id]); u.x = p.x; u.y = p.y; units.push(u); });
    foes.slice(0, grid.spawns.foe.length).forEach((id, i) => { try { const p = grid.spawns.foe[i]; units.push(makeFoe(id, p.x, p.y)); } catch { /* monstruo desconocido */ } });
    const b = new Battle(grid, units); this.b = b; this.r.setBattle(b, map); this.r.cine = true; this.frame();
    // entrada: parten del borde del grupo y caminan a su lugar
    const pcs = units.filter(u => u.side === 'pc'); const sp = grid.spawns.pc;
    pcs.forEach((u, i) => { const home = { x: u.x, y: u.y }; const from = this.entryTile(i); u.x = from.x; u.y = from.y; const v = this.r.vis.get(u.uid)!; v.x = from.x; v.y = from.y; this.walk(u, home.x, home.y, true); });
    void sp;
  }
  private entryTile(i: number) { const g = this.b!.grid; const s = g.spawns.pc[0] ?? { x: 0, y: 0 }; for (let r = 4; r >= 2; r--) for (const [dx, dy] of [[-r, 0], [0, -r], [-r, -r], [-r, r], [r, -r]]) { const t = g.at(s.x + dx + i % 2, s.y + dy); if (t && t.kind !== 'wall' && t.kind !== 'cover') return { x: s.x + dx + i % 2, y: s.y + dy }; } return { x: s.x, y: s.y }; }
  /** Camina por el camino más corto (sin atravesar muros). */
  walk(u: Unit, x: number, y: number, snap = false) {
    const b = this.b; if (!b) return; const v = this.r.vis.get(u.uid); if (!v) return;
    u.moveLeft = 99; const reach = b.reach(u, 99); const dest = reach.get(x + ',' + y);
    if (!dest) { u.x = x; u.y = y; v.x = x; v.y = y; return; }
    const path = b.pathTo(reach, x, y); v.path.push(...path.slice(1)); u.x = x; u.y = y; void snap;
  }
  private freeNear(x: number, y: number) { const b = this.b!; for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const t = b.grid.at(x + dx, y + dy); if (t && t.kind !== 'wall' && t.kind !== 'cover' && !b.unitAt(x + dx, y + dy)) return { x: x + dx, y: y + dy }; } return { x, y }; }
  /** Un paso aleatorio de alguien de la compañía, para que la escena no esté congelada. */
  idle() {
    const b = this.b; if (!b || this.canvas.style.display === 'none' || document.hidden) return;
    const pcs = b.units.filter(u => u.side === 'pc'); if (!pcs.length) return; const u = pcs[this.wander++ % pcs.length]; const v = this.r.vis.get(u.uid); if (!v || v.path.length) return;
    const t = this.freeNear(u.x + (Math.random() < .5 ? -1 : 1), u.y + (Math.random() < .5 ? -1 : 1)); if (Math.hypot(t.x - u.x, t.y - u.y) <= 2 && !b.unitAt(t.x, t.y)) this.walk(u, t.x, t.y);
  }
  /** Aparece el interlocutor (un NPC) cerca de los enemigos/aliados del mapa y se acerca. */
  private npc(who: string): Unit | undefined {
    const b = this.b; if (!b) return; const found = this.npcs.find(n => n.name === who); if (found) return found;
    const sp = SPEAKERS[who]; if (!sp) return; const base = makePC(PARTY_BY_ID[this.party[0] ?? 'romain']);
    const g = b.grid; const home = g.spawns.foe[this.npcs.length] ?? g.spawns.ally[0] ?? g.spawns.pc[g.spawns.pc.length - 1]; if (!home) return;
    const cx = Math.round(g.spawns.pc.reduce((a, q) => a + q.x, 0) / g.spawns.pc.length), cy = Math.round(g.spawns.pc.reduce((a, q) => a + q.y, 0) / g.spawns.pc.length);
    const dx = Math.sign(home.x - cx) * 3, dy = Math.sign(home.y - cy) * 3; const t = this.freeNear(cx + dx, cy + dy); Object.assign(base, { name: who, id: 'npc', pcId: undefined, color: sp.color, glyph: sp.glyph, side: 'foe', x: t.x, y: t.y }); base.uid = b.nextUid++; b.units.push(base);
    this.r.vis.set(base.uid, { x: t.x, y: t.y, path: [], flash: 0, shake: 0, alpha: 0.01, bounce: 1, dead: 0, wobble: 0 });
    // fundido de entrada
    const v = this.r.vis.get(base.uid)!; const fade = () => { v.alpha = Math.min(1, v.alpha + .06); if (v.alpha < 1) requestAnimationFrame(fade); }; fade();
    this.npcs.push(base); if (this.npcs.length > 3) { const old = this.npcs.shift()!; b.units = b.units.filter(u => u !== old); this.r.vis.delete(old.uid); } return base;
  }
  /** Quien habla se ilumina y da un saltito; si es un NPC, aparece en escena. */
  speak(who: string | null) {
    const b = this.b; if (!b || this.canvas.style.display === 'none') return;
    if (!who) { this.r.activeUid = -1; return; }
    const u = b.units.find(x => x.name === who) ?? this.npc(who); if (!u) { this.r.activeUid = -1; return; }
    this.r.activeUid = u.uid; const v = this.r.vis.get(u.uid); if (v) v.bounce = 1;
  }
}
export { sleep };
