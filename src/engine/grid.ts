import type { Tile } from './types';

const LEGEND: Record<string, Omit<Tile, 'ch'>> = {
  '.': { kind: 'floor', h: 0, cost: 1, blocked: false },
  ',': { kind: 'diff', h: 0, cost: 2, blocked: false },
  '#': { kind: 'wall', h: 2, cost: 99, blocked: true },
  'c': { kind: 'cover', h: 1, cost: 99, blocked: true },
  '^': { kind: 'hazard', h: 0, cost: 1, blocked: false },
  '~': { kind: 'water', h: 0, cost: 2, blocked: false },
  '=': { kind: 'high', h: 1, cost: 2, blocked: false },
  '*': { kind: 'mark', h: 0, cost: 1, blocked: false },
};
export interface P { x: number; y: number }

export class Grid {
  w: number; h: number; tiles: Tile[][] = [];
  spawns: { pc: P[]; foe: P[]; ally: P[] } = { pc: [], foe: [], ally: [] };
  marks: P[] = [];
  constructor(rows: string[]) {
    this.h = rows.length; this.w = rows[0].length;
    const pcSlots: [number, P][] = [];
    rows.forEach((row, y) => {
      if (row.length !== this.w) throw new Error(`Fila ${y} mide ${row.length}, se esperaba ${this.w}: "${row}"`);
      const line: Tile[] = [];
      for (let x = 0; x < this.w; x++) {
        let ch = row[x];
        if (/[1-6]/.test(ch)) { pcSlots.push([+ch, { x, y }]); ch = '.'; }
        else if (ch === 'e') { this.spawns.foe.push({ x, y }); ch = '.'; }
        else if (ch === 'a') { this.spawns.ally.push({ x, y }); ch = '.'; }
        else if (ch === '*') this.marks.push({ x, y });
        const t = LEGEND[ch]; if (!t) throw new Error(`Carácter de mapa desconocido '${ch}' en (${x},${y})`);
        line.push({ ch, ...t });
      }
      this.tiles.push(line);
    });
    this.spawns.pc = pcSlots.sort((a, b) => a[0] - b[0]).map(s => s[1]);
  }
  inb(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  at(x: number, y: number): Tile | undefined { return this.inb(x, y) ? this.tiles[y][x] : undefined; }
  /** Línea de visión Bresenham. Muros bloquean; coberturas dan +2 CA si hay alguna en el camino. */
  los(a: P, b: P, blockers?: (x: number, y: number) => boolean): { visible: boolean; cover: 0 | 2 | 5 } {
    let x0 = a.x, y0 = a.y; const x1 = b.x, y1 = b.y;
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy, cover: 0 | 2 | 5 = 0;
    for (let guard = 0; guard < 200; guard++) {
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
      if (x0 === x1 && y0 === y1) break;
      const t = this.at(x0, y0)!;
      if (t.kind === 'wall') return { visible: false, cover: 5 };
      if (t.kind === 'cover') cover = 2;
      if (blockers && blockers(x0, y0)) return { visible: false, cover: 5 };
    }
    return { visible: true, cover };
  }
}
export const cheb = (a: P, b: P) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
export const key = (x: number, y: number) => x + ',' + y;
