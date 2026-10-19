// Trampas y objetos ocultos: se buscan con la acción «Buscar», se notan de cerca con la Percepción pasiva y se desarman con «Interactuar».
import type { Battle } from './battle';
import type { Unit } from './types';
import { cheb } from './grid';
import { roll } from './dice';
import { skillMod } from '../world/checks';

export type TrapKind = 'mina' | 'red' | 'foso';
/** Trampa sembrada por el enemigo: solo dispara a la compañía y a sus aliados. */
export interface Trap { x: number; y: number; kind: TrapKind; dc: number; disarm: number; hidden: boolean; armed: boolean }
export const TRAP_LABEL: Record<TrapKind, string> = { mina: 'Mina mágica', red: 'Red de pegamento', foso: 'Foso con estacas' };
export const TRAP_ICON: Record<TrapKind, string> = { mina: '💥', red: '🕸', foso: '⛏' };

export const trapAt = (b: Battle, x: number, y: number) => b.traps.find(t => t.x === x && t.y === y && t.armed);
/** Modificador de Percepción de una unidad (compañía: según su ficha; el resto, Sabiduría). */
export const perception = (u: Unit) => (u.pcId ? skillMod(u.pcId, 'percepcion') : u.mods.wis);

function reveal(b: Battle, t: Trap, by: Unit, how: string) {
  t.hidden = false; const tile = b.grid.at(t.x, t.y); if (tile && !tile.obj) { tile.obj = 'trampa'; }
  b.log(`🔍 ${by.name} ${how}: ${TRAP_LABEL[t.kind]} en (${t.x},${t.y}). Se puede evitar o desarmar con Interactuar.`, 'sys'); b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y });
}
/** Acción Buscar: tirada de Percepción y revela lo oculto en 4 casillas con línea de visión. */
export function searchArea(b: Battle, u: Unit): string {
  const d = roll('1d20').total, mod = perception(u), total = d + mod; let found = 0;
  for (const t of b.traps) if (t.armed && t.hidden && cheb(u, t) <= 4 && b.grid.los(u, t).visible && total >= t.dc) { reveal(b, t, u, `encuentra`); found++; }
  const g = b.grid;
  for (let y = u.y - 4; y <= u.y + 4; y++) for (let x = u.x - 4; x <= u.x + 4; x++) { const tl = g.at(x, y); if (tl?.hid && tl.obj && total >= tl.hid && g.los(u, { x, y }).visible) { tl.hid = undefined; found++; b.log(`🔍 ${u.name} descubre algo en (${x},${y}).`, 'sys'); b.emit({ t: 'fx', kind: 'burst', x, y }); } }
  b.log(`🔍 ${u.name} busca (Percepción ${d}${mod >= 0 ? '+' : ''}${mod} = ${total}): ${found ? `halla ${found}` : 'no halla nada'}.`, 'roll'); return found ? 'ok' : 'nada';
}
/** Percepción pasiva: al terminar de moverse, quien pasa a una casilla de algo oculto lo nota si 10 + Percepción alcanza. */
export function passiveNotice(b: Battle, u: Unit) {
  if (!u.pcId || u.dead || u.down) return; const pass = 10 + perception(u);
  for (const t of b.traps) if (t.armed && t.hidden && cheb(u, t) <= 1 && pass >= t.dc) reveal(b, t, u, 'nota con el rabillo del ojo');
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const tl = b.grid.at(u.x + dx, u.y + dy); if (tl?.hid && tl.obj && pass >= tl.hid) { tl.hid = undefined; b.log(`🔍 ${u.name} nota algo oculto cerca.`, 'sys'); } }
}
/** Disparo de la trampa al pisarla. */
export function triggerTrap(b: Battle, u: Unit, t: Trap) {
  t.armed = false; const tile = b.grid.at(t.x, t.y); if (tile?.obj === 'trampa') tile.obj = undefined; b.log(`⚠ ¡${u.name} activa ${TRAP_LABEL[t.kind].toLowerCase()}!`, 'dmg');
  if (t.kind === 'mina') {
    b.emit({ t: 'tile', kind: 'boom', x: t.x, y: t.y }); b.hazMode = true;
    for (const v of b.units) if (!v.dead && cheb(v, t) <= 1 && v.sprite !== 'wall') { const ok = b.save(v, 'dex', 13, '(mina)'); const dmg = roll('3d6').total; b.damage(v, ok ? Math.floor(dmg / 2) : dmg, 'fire', undefined); }
    b.hazMode = false;
  } else if (t.kind === 'red') { b.addStatus(u, { id: 'restrained', turns: 2 }); b.log(`${u.name} queda atrapado en el pegamento (se libera en 2 rondas o con Fuerza).`, 'sys'); }
  else { const ok = b.save(u, 'dex', 13, '(foso)'); const dmg = roll('2d6').total; b.damage(u, ok ? 0 : dmg, 'piercing', undefined); if (!ok) b.addStatus(u, { id: 'prone', turns: -1 }); }
}
/** Interactuar con una trampa revelada: intento de desarmarla (Destreza + competencia si la compañía la tiene). */
export function disarmTrap(b: Battle, u: Unit, x: number, y: number): string {
  const t = b.traps.find(q => q.x === x && q.y === y && q.armed); if (!t) return 'No hay nada que desarmar.';
  const d = roll('1d20').total, mod = u.mods.dex + (u.pcId === 'zyrthar' || u.pcId === 'joren' ? (u.prof ?? 0) : 0), total = d + mod;
  if (total >= t.disarm) { t.armed = false; const tile = b.grid.at(x, y); if (tile) tile.obj = undefined; return `Desarma ${TRAP_LABEL[t.kind].toLowerCase()} (${d}${mod >= 0 ? '+' : ''}${mod} = ${total} vs CD ${t.disarm}).`; }
  if (total <= t.disarm - 5) { triggerTrap(b, u, t); return `✗ Falla por mucho (${total} vs CD ${t.disarm}) y la dispara.`; }
  return `✗ No logra desarmarla (${total} vs CD ${t.disarm}). Puede intentarlo otra vez.`;
}
