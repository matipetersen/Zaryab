import { chemLevel, chemPoints, BASE_CHEM } from '../engine/synergy';
import type { Campaign } from '../state';
import { ITEM } from '../data/items';
import { BUILDINGS } from './buildings';
import { MIRACLES } from '../engine/abilities';

const RARITY: Record<string, number> = { comun: 1, poco: 2, raro: 3, unico: 4 };
export interface Edge { points: number; lines: string[] }
/** Ventajas que la campaña da en un combate. Con 0 puntos la probabilidad de victoria es la base (≈ 50 %). */
export function computeEdge(c: Campaign, party: string[], allies: number): Edge {
  const lines: string[] = []; let pts = 0;
  const add = (n: number, why: string) => { if (n) { pts += n; lines.push(`${n > 0 ? '+' : ''}${n} ${why}`); } };
  const gear = Math.min(12, party.flatMap(p => c.equip[p] ?? []).reduce((s, id) => s + (RARITY[ITEM[id]?.rarity] ?? 1), 0));
  add(gear, 'equipo mágico'); add(Math.min(8, Math.floor(Object.entries(c.inv).filter(([k]) => ITEM[k]?.kind === 'consumible').reduce((s, [, n]) => s + n, 0) / 2)), 'consumibles');
  add(Math.min(15, allies * 5), 'aliados en el campo'); add(Math.min(10, c.buildings.filter(b => BUILDINGS.some(x => x.id === b)).length * 2), 'edificios del santuario');
  add(Math.min(6, Math.floor(c.followers.filter(f => !f.sick).length / 2)), 'seguidores'); add(Math.min(6, Math.floor(c.pf / 8)), 'PF en reserva');
  add(Math.min(4, MIRACLES.filter(m => (m.need === 'd' ? c.d : c.c) >= m.min).length), 'milagros disponibles');
  add(Math.min(5, Math.floor(Object.values(c.bond).reduce((s, n) => s + n, 0) / 2)), 'vínculos con la ciudad');
  add(Math.min(6, [...new Set([...Object.keys(BASE_CHEM), ...Object.keys(c.chem ?? {})])].reduce((n, k) => n + chemLevel(chemPoints(c.chem, k)), 0)), 'sinergias de la compañía');
  add(c.alert >= 10 ? -8 : c.alert >= 7 ? -4 : 0, 'Alerta del Conclave');
  return { points: Math.max(-12, Math.min(45, pts)), lines };
}
