// Guiones de encuentro: reglas especiales que se ejecutan al inicio y cada ronda.
import type { Battle } from './battle';
import { cheb } from './grid';
import { roll, rand } from './dice';
import { cubeInit, cubeRound } from './cube';

function fireballTelegraph(b: Battle, round: number, warnRound: number, dc: number, chance: number) {
  const c = b.flags['fbTarget'] as { x: number; y: number } | undefined;
  if (round === warnRound && rand() < chance) {
    const pcs = b.units.filter(u => u.pcId && !u.dead && !u.down); if (!pcs.length) return;
    const back = [...pcs].sort((a, z) => z.y - a.y)[0]; b.flags['fbTarget'] = { x: back.x, y: back.y };
    b.log('Kethras alza una mano: un círculo ardiente se dibuja en el suelo. ¡Salgan del área!', 'sys'); b.emit({ t: 'fx', kind: 'burst', x: back.x, y: back.y });
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const t = b.grid.at(back.x + dx, back.y + dy); if (t && !t.blocked) b.grid.setTile(back.x + dx, back.y + dy, 'f', 2); }
  } else if (round === warnRound + 1 && c) {
    b.log('La Bola de Fuego de Kethras explota.', 'roll'); b.emit({ t: 'fx', kind: 'boom', x: c.x, y: c.y });
    for (const v of b.units) if (!v.dead && cheb(v, c) <= 2) { const ok = b.save(v, 'dex', dc, '(Bola de Fuego)'); const d = roll('8d6').total; b.damage(v, ok ? Math.floor(d / 2) : d, 'fire', undefined); }
    b.flags['fbTarget'] = undefined;
  }
}

export function initScript(id: string, b: Battle, flags: string[]) {
  b.storyFlags = new Set(flags);
  if (id === 'cubo') { cubeInit(b, flags); b.scripts.push((bb, r) => cubeRound(bb, r)); }
  if (id === 'd4') {
    b.log('Ronda 1: los medallones encajan. El pulso viaja por la roca. EMERGENCIA.', 'sys');
    if (flags.includes('mz_d4_errores')) { const pcs = b.units.filter(u => u.pcId); const v = pcs[0]; if (v) { const d = roll('2d8').total; b.damage(v, d, 'force', undefined); b.log(`Un medallón mal colocado hiere a ${v.name} (${d}).`, 'sys'); } }
    b.scripts.push((bb, r) => { if (r === 2) bb.log('Ronda 2: la puerta se retrae a la mitad. Kethras entra por D3 con guardias.', 'sys'); if (r === 3) bb.log('Ronda 3: ¡la puerta está abierta! ¡Retirada!', 'sys'); });
  }
  if (id === 'tuneles_a') {
    const chance = flags.includes('mz_alerta_2') ? 0.9 : flags.includes('mz_alerta_1') ? 0.5 : 0.35;
    b.scripts.push((bb, r) => { if (r === 3) { bb.log('Kethras lanza Muralla de Fuerza: la galería se parte en dos.', 'sys'); for (let x = 4; x <= 7; x++) bb.grid.setTile(x, 5, 'x'); } fireballTelegraph(bb, r, 3, 17, chance); });
  }
  if (id === 'tuneles_b') {
    b.scripts.push((bb, r) => { if (r === 2) bb.log('Kethras llega por detrás. El Pudin Negro sale por delante. El sándwich se cierra.', 'sys'); });
  }
}
