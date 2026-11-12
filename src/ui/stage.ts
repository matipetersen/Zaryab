import { Renderer } from './render';
import { Battle } from '../engine/battle';
import { Grid } from '../engine/grid';
import { MAPS } from '../data/maps';
import { PARTY_BY_ID, makePC } from '../data/party';
import { makeFoe } from '../data/monsters';
import { SPEAKERS } from '../story/speakers';
import { gestureFor } from './acting';
import type { Unit } from '../engine/types';
import { sleep } from './dom';

/** Fondo de historia → mapa jugable donde transcurre la escena (los que no figuran quedan como fondo pintado). */
export const BG_MAP: Record<string, string> = {
  dunas: 'dunas', tormenta: 'dunas', prison: 'mina', coliseo: 'arena', medinat: 'medinat', bajo: 'callejon', choza: 'santuario', taller: 'santuario',
  zoco: 'zoco', hammam: 'pozo', espejos: 'cubo', cubo: 'cubo', acueducto: 'acueducto', plaza: 'plaza', oraculo: 'templo', limbo: 'cripta', jardin: 'jardin', mina: 'mina',
};

/** Escena sobre el mapa: la compañía entra caminando una sola vez al cambiar de mapa y después se queda quieta;
 *  quien habla da un saltito y se ilumina. Los enemigos solo aparecen si la escena los pide (nodo 'stage' con foes). */
export class StageView {
  canvas = document.createElement('canvas'); r: Renderer; b?: Battle; mapId = ''; party: string[] = []; alive = true; npcs: Unit[] = [];
  /** Enemigos que la escena pidió mostrar (ids de monstruo, en orden). */ foes: string[] = [];
  /** Animación de cámara en curso (para que el encuadre no salte al entrar o salir alguien). */ private cam = 0;
  constructor(public host: HTMLElement) {
    this.canvas.className = 'stage-cv'; this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    host.append(this.canvas); this.r = new Renderer(this.canvas); this.r.cine = true;
    this.onResize = this.onResize.bind(this); window.addEventListener('resize', this.onResize);
  }
  onResize() { this.r.resize(); this.frame(); }
  destroy() { cancelAnimationFrame(this.cam); window.removeEventListener('resize', this.onResize); this.r.destroy(); this.canvas.remove(); this.alive = false; }
  show(on: boolean) { this.canvas.style.display = on ? 'block' : 'none'; }
  /** Cámara de cutscene: si hay foco, encuadra a esa figura (más cerca). */
  focusUid = -1; focusZoom = 2.2;
  /** Figura en escena por id de la compañía o por nombre visible. */
  unit(who: string): Unit | undefined { const b = this.b; if (!b) return; const w = who.toLowerCase(); return b.units.find(u => !u.dead && (u.pcId === who || u.id === who || u.name.toLowerCase() === w || u.name.toLowerCase().startsWith(w + ' '))); }
  focus(who: string | null, zoom = 2.2) { const u = who ? this.unit(who) : undefined; this.focusUid = u ? u.uid : -1; this.focusZoom = zoom; this.frame(true); }
  fall(who: string) { const u = this.unit(who); if (u) { u.down = true; const v = this.r.vis.get(u.uid); if (v) { v.shake = 1; v.flash = 1; } } }
  rise(who: string) { const b = this.b; const u = b?.units.find(x => x.pcId === who || x.name.toLowerCase().startsWith(who.toLowerCase())); if (u) { u.down = false; const v = this.r.vis.get(u.uid); if (v) v.bounce = 1; } }
  hop(who: string) { const u = this.unit(who); const v = u && this.r.vis.get(u.uid); if (v) v.gest = { g: 'hop', t: 0 }; }
  hide(who: string) { const u = this.unit(who); if (u) this.fadeOut(u); }
  step(who: string, dx: number, dy: number) { const u = this.unit(who); if (u) this.walk(u, u.x + dx, u.y + dy); }
  fxAt(kind: string, who: string, color?: string) {
    const u = who === 'center' ? undefined : this.unit(who); const b = this.b; if (!b) return;
    const x = u ? u.x : Math.round(b.grid.spawns.pc.reduce((a, q) => a + q.x, 0) / Math.max(1, b.grid.spawns.pc.length)), y = u ? u.y : Math.round(b.grid.spawns.pc.reduce((a, q) => a + q.y, 0) / Math.max(1, b.grid.spawns.pc.length));
    const r = this.r as any;
    if (kind === 'boom' || kind === 'burst') r.fx({ t: 'fx', kind, x, y });
    else if (kind === 'ring') { r.rings.push({ x, y, t: 0, color: color ?? '#e0b84a', max: 3 }); setTimeout(() => r.rings.push({ x, y, t: 0, color: color ?? '#e0b84a', max: 2 }), 220); }
    else if (kind === 'sparks') r.sparks(x, y, 70, color ?? '#ffd23f');
    else if (kind === 'wisps') { r.wisps(x, y); setTimeout(() => r.wisps(x, y), 300); }
  }
  /** Encuadre: deja el mapa un poco arriba para que el cuadro de diálogo no tape a los personajes. */
  private target() {
    const r = this.r, b = this.b; let zoom = r.W < 600 ? 2.4 : 1.6; if (!b) return { zoom, panX: 0, panY: 0 };
    const fu = this.focusUid >= 0 ? b.units.find(u => u.uid === this.focusUid) : undefined;
    if (fu) { const z = this.focusZoom * (r.W < 600 ? 1.3 : 1); const z0 = r.zoom, x0 = r.panX, y0 = r.panY; r.zoom = z; r.panX = 0; r.panY = 0; const o = ((fu.size ?? 1) - 1) / 2; const p = r.proj(fu.x + o, fu.y + o); r.zoom = z0; r.panX = x0; r.panY = y0; return { zoom: z, panX: r.W / 2 - p.x, panY: r.H * (0.36 + 0.1 * ((fu.size ?? 1) - 1)) - p.y }; }
    const live = b.units.filter(u => !u.dead && u.id !== 'npc');
    const hasFoes = live.some(u => u.side === 'foe'); if (hasFoes) zoom = r.W < 600 ? 1.5 : 1.15;
    const pcs = live.filter(u => hasFoes || u.side === 'pc'); if (!pcs.length) return { zoom, panX: 0, panY: 0 };
    const cx = pcs.reduce((a, u) => a + u.x, 0) / pcs.length, cy = pcs.reduce((a, u) => a + u.y, 0) / pcs.length;
    const z0 = r.zoom, x0 = r.panX, y0 = r.panY; r.zoom = zoom; r.panX = 0; r.panY = 0; const p = r.proj(cx, cy); r.zoom = z0; r.panX = x0; r.panY = y0;
    return { zoom, panX: r.W / 2 - p.x, panY: r.H * (r.W < 600 ? 0.3 : 0.36) - p.y };
  }
  /** Encuadra a la escena; con `smooth` la cámara se desliza en vez de saltar. */
  frame(smooth = false) {
    cancelAnimationFrame(this.cam); const r = this.r; const t = this.target();
    if (!smooth) { r.zoom = t.zoom; r.panX = t.panX; r.panY = t.panY; return; }
    const from = { zoom: r.zoom, panX: r.panX, panY: r.panY }; const t0 = performance.now(), dur = 700;
    const step = (now: number) => { const k = Math.min(1, (now - t0) / dur), e = k * k * (3 - 2 * k); const tt = this.target();
      r.zoom = from.zoom + (tt.zoom - from.zoom) * e; r.panX = from.panX + (tt.panX - from.panX) * e; r.panY = from.panY + (tt.panY - from.panY) * e;
      if (k < 1 && this.alive) this.cam = requestAnimationFrame(step); };
    this.cam = requestAnimationFrame(step);
  }

  /** Muestra la escena en `mapId` con la compañía `party` y exactamente los enemigos `foes`.
   *  Si el mapa no cambió, no se rehace nada: solo entran/salen quienes difieren (sin repetir la entrada). */
  async set(mapId: string, party: string[], foes: string[] = []) {
    const map = MAPS[mapId]; if (!map) { this.show(false); return; }
    const wasHidden = this.canvas.style.display === 'none'; this.show(true); const ids = party.filter(id => PARTY_BY_ID[id]);
    if (mapId === this.mapId && this.b) {
      // mismo mapa: no se rehace nada; si el lienzo estaba oculto (fondo pintado) solo se reajusta el tamaño
      if (wasHidden) { this.r.resize(); this.frame(); }
      this.syncParty(ids); this.setFoes(foes); return;
    }
    this.mapId = mapId; this.npcs = []; this.party = ids; this.foes = []; this.focusUid = -1;
    const grid = new Grid(map.rows, map.objs, map.foeOrder); const units: Unit[] = [];
    ids.forEach((id, i) => { const p = grid.spawns.pc[i] ?? grid.spawns.pc[0]; if (!p) return; const u = makePC(PARTY_BY_ID[id]); u.x = p.x; u.y = p.y; units.push(u); });
    const b = new Battle(grid, units); this.b = b; this.r.setBattle(b, map); this.r.cine = true; this.r.activeUid = -1; this.frame();
    // entrada (una sola vez por mapa): parten del borde del grupo y caminan a su lugar
    units.forEach((u, i) => this.enter(u, i));
    this.setFoes(foes);
  }
  /** Hace entrar caminando a `u` desde fuera del grupo hasta donde ya está ubicado. */
  private enter(u: Unit, i: number) { const home = { x: u.x, y: u.y }; const from = this.entryTile(i); const v = this.r.vis.get(u.uid); if (!v) return; u.x = from.x; u.y = from.y; v.x = from.x; v.y = from.y; const b = this.b; setTimeout(() => { if (this.b === b) this.walk(u, home.x, home.y); }, i * 170); } // entran de a uno, no en bloque
  /** Ajusta la compañía sin rehacer la escena: quien ya no está se desvanece, quien se suma entra caminando. */
  private syncParty(ids: string[]) {
    const b = this.b!; const same = ids.length === this.party.length && ids.every((id, i) => id === this.party[i]); if (same) return;
    for (const u of b.units.filter(u => u.side === 'pc' && u.id !== 'npc' && u.pcId && !ids.includes(u.pcId))) this.fadeOut(u);
    const have = new Set(b.units.filter(u => u.side === 'pc' && !u.dead).map(u => u.pcId));
    ids.filter(id => !have.has(id)).forEach((id, k) => {
      const sp = b.grid.spawns.pc.find(p => !b.unitAt(p.x, p.y)) ?? this.freeNear(b.grid.spawns.pc[0]?.x ?? 0, b.grid.spawns.pc[0]?.y ?? 0);
      const u = makePC(PARTY_BY_ID[id]); u.x = sp.x; u.y = sp.y; this.add(u, 1); this.enter(u, k);
    });
    this.party = ids;
  }
  /** Deja en escena exactamente estos enemigos: los que sobran se desvanecen y los nuevos aparecen en sus puestos. */
  setFoes(foes: string[]) {
    const b = this.b; if (!b) { this.foes = []; return; }
    const want = foes.slice(0, b.grid.spawns.foe.length); if (want.length === this.foes.length && want.every((id, i) => id === this.foes[i])) return;
    for (const u of b.units.filter(u => u.side === 'foe' && u.id !== 'npc' && !u.dead)) this.fadeOut(u);
    want.forEach((id, i) => { const p = b.grid.spawns.foe[i]; try { const f = makeFoe(id, p.x, p.y); const t = b.unitAt(p.x, p.y) ? this.freeNear(p.x, p.y) : p; f.x = t.x; f.y = t.y; this.add(f, 0.01, true); } catch { /* monstruo desconocido */ } });
    // la niebla de guerra del mapa escondería a los enemigos pedidos (están lejos del grupo): se levanta mientras estén en escena
    b.fogOn = want.length === 0; this.foes = want; this.frame(true);
  }
  /** Vuelve a la escena «limpia» del mapa: sin enemigos (y, si se pide, sin interlocutores). La compañía no se mueve. */
  clear(npcs = false) { this.setFoes([]); if (npcs) { for (const n of this.npcs) this.fadeOut(n); this.npcs = []; } this.r.activeUid = -1; }
  private add(u: Unit, alpha: number, bounce = false) {
    const b = this.b!; u.uid = b.nextUid++; b.units.push(u);
    const v = { x: u.x, y: u.y, path: [], flash: 0, shake: 0, alpha, bounce: bounce ? 1 : 0, dead: 0, wobble: Math.random() * 6 }; this.r.vis.set(u.uid, v);
    if (alpha < 1) { const fade = () => { v.alpha = Math.min(1, v.alpha + .05); if (v.alpha < 1 && this.alive) requestAnimationFrame(fade); }; requestAnimationFrame(fade); }
  }
  fadeOut(u: Unit) {
    const b = this.b; if (!b) return; u.dead = true; const v = this.r.vis.get(u.uid);
    const gone = () => { if (this.b !== b) return; b.units = b.units.filter(x => x !== u); this.r.vis.delete(u.uid); };
    if (!v) { gone(); return; } const fade = () => { if (this.b !== b) return; v.alpha = Math.max(0, v.alpha - .07); if (v.alpha > 0) requestAnimationFrame(fade); else gone(); }; requestAnimationFrame(fade);
  }
  private entryTile(i: number) { // entran desde el lado opuesto a los enemigos (si los rodean, desde donde haya lugar)
    const g = this.b!.grid; const s = g.spawns.pc[0] ?? { x: 0, y: 0 }; const pcs = g.spawns.pc, fs = g.spawns.foe;
    const c = (a: { x: number; y: number }[]) => ({ x: a.reduce((t, p) => t + p.x, 0) / a.length, y: a.reduce((t, p) => t + p.y, 0) / a.length });
    const dirs: number[][] = [];
    if (fs.length && pcs.length) { const P = c(pcs), F = c(fs); const dx = P.x - F.x, dy = P.y - F.y; if (Math.hypot(dx, dy) > 2) { const ax = Math.abs(dx) >= Math.abs(dy); dirs.push(ax ? [Math.sign(dx), 0] : [0, Math.sign(dy)], ax ? [Math.sign(dx), Math.sign(dy) || 1] : [Math.sign(dx) || 1, Math.sign(dy)]); } }
    dirs.push([-1, 0], [0, -1], [-1, -1], [-1, 1], [1, -1], [1, 0], [0, 1]);
    for (const [ux, uy] of dirs) for (let r = 4; r >= 2; r--) { const x = s.x + ux * r + (uy ? i % 2 : 0), y = s.y + uy * r + (ux && !uy ? i % 2 : 0); const t = g.at(x, y); if (t && t.kind !== 'wall' && t.kind !== 'cover' && t.kind !== 'void') return { x, y }; }
    return { x: s.x, y: s.y }; }
  /** Camina por el camino más corto (sin atravesar muros). */
  walk(u: Unit, x: number, y: number) {
    const b = this.b; if (!b) return; const v = this.r.vis.get(u.uid); if (!v) return;
    u.moveLeft = 99; const reach = b.reach(u, 99); const dest = reach.get(x + ',' + y);
    if (!dest) { u.x = x; u.y = y; v.x = x; v.y = y; return; }
    const path = b.pathTo(reach, x, y); v.path.push(...path.slice(1)); u.x = x; u.y = y;
  }
  private freeNear(x: number, y: number) { const b = this.b!; for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const t = b.grid.at(x + dx, y + dy); if (t && t.kind !== 'wall' && t.kind !== 'cover' && !b.unitAt(x + dx, y + dy)) return { x: x + dx, y: y + dy }; } return { x, y }; }
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
    this.npcs.push(base); if (this.npcs.length > 3) this.fadeOut(this.npcs.shift()!); return base;
  }
  /** Quien habla se ilumina y da un saltito; si es un NPC, aparece en escena. */
  speak(who: string | null, tone?: string) {
    const b = this.b; if (!b || this.canvas.style.display === 'none') return;
    if (!who) { this.r.activeUid = -1; return; }
    const u = b.units.find(x => x.name === who && !x.dead) ?? this.npc(who); if (!u) { this.r.activeUid = -1; return; }
    this.r.activeUid = u.uid; const v = this.r.vis.get(u.uid); if (!v) return;
    const g = gestureFor(u.pcId, tone, u.id === 'npc' ? undefined : u.sprite, u.name); v.gest = { g, t: 0 }; // cada uno habla con su gesto (y el tono lo cambia)
    if (g === 'stomp') setTimeout(() => { (this.r as any).shake = Math.max((this.r as any).shake, .25); }, 300);
  }
}
export { sleep };
