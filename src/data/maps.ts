import type { MapDef } from '../engine/types';

type Op = ['fill', string] | ['rect', number, number, number, number, string] | ['put', number, number, string];
function paint(w: number, h: number, ops: Op[]): string[] {
  const g: string[][] = Array.from({ length: h }, () => Array(w).fill('#'));
  for (const o of ops) {
    if (o[0] === 'fill') for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) g[y][x] = o[1];
    else if (o[0] === 'rect') for (let y = o[2]; y <= o[4]; y++) for (let x = o[1]; x <= o[3]; x++) g[y][x] = o[5];
    else g[o[2]][o[1]] = o[3];
  }
  return g.map(r => r.join(''));
}
const R = (x0: number, y0: number, x1: number, y1: number, ch: string): Op => ['rect', x0, y0, x1, y1, ch];
const P = (x: number, y: number, ch: string): Op => ['put', x, y, ch];

export const MAPS: Record<string, MapDef> = {
  callejon: {
    id: 'callejon', name: 'Callejones del Bajo Zaryab', theme: 'alley',
    objective: 'Derrota al Linyera y a los guardias del Conclave.',
    rows: paint(20, 14, [
      ['fill', '.'],
      R(1, 1, 5, 4, '#'), R(8, 1, 11, 3, '#'), R(14, 1, 18, 4, '#'), R(1, 9, 4, 12, '#'), R(15, 9, 18, 12, '#'),
      R(6, 5, 13, 5, ','), R(7, 7, 12, 8, '='),
      P(6, 7, 'c'), P(13, 7, 'c'), P(8, 10, 'c'), P(11, 10, 'c'), P(3, 6, 'c'), P(16, 6, 'c'), P(6, 2, 'c'),
      P(9, 2, '.'), P(10, 2, '.'),
      P(7, 2, 'e'), P(12, 2, 'e'), P(9, 4, 'e'), P(10, 4, 'e'), P(2, 5, 'e'), P(17, 5, 'e'),
      P(7, 12, '1'), P(8, 12, '2'), P(9, 12, '3'), P(10, 12, '4'), P(11, 12, '5'), P(12, 12, '6'),
      P(6, 9, ','), P(13, 9, ','), P(5, 10, ','),
    ]),
  },
  acueducto: {
    id: 'acueducto', name: 'Acueducto Olvidado (oeste)', theme: 'aqueduct',
    objective: 'Resiste a los ghuls y extrae el fragmento del meteorito.',
    rows: paint(22, 16, [
      ['fill', '.'],
      R(8, 1, 13, 14, '~'),           // canal central
      R(9, 6, 12, 7, '.'),            // puente
      R(1, 1, 4, 3, '#'), R(17, 1, 20, 3, '#'), R(1, 12, 4, 14, '#'), R(17, 12, 20, 14, '#'),
      P(6, 4, 'c'), P(15, 4, 'c'), P(6, 9, 'c'), P(15, 9, 'c'), P(3, 7, ','), P(18, 7, ','), P(2, 8, ','), P(19, 8, ','),
      R(9, 1, 12, 2, '='),
      P(10, 1, '*'), P(11, 1, '*'),
      P(5, 1, 'e'), P(16, 1, 'e'), P(7, 3, 'e'), P(14, 3, 'e'), P(5, 5, 'e'), P(16, 5, 'e'), P(10, 3, 'e'),
      P(8, 14, '.'), P(9, 14, '.'),
      P(6, 14, '1'), P(7, 14, '2'), P(14, 14, '3'), P(15, 14, '4'), P(6, 13, '5'), P(15, 13, '6'),
    ]),
  },
  cubo: {
    id: 'cubo', name: 'Cubo de los Mil Reflejos — Geometría del Dolor', theme: 'mirror',
    objective: 'Sobrevive a los reflejos corruptos. Cuando caen, se funden brevemente con quien los rompe.',
    rows: paint(15, 15, [
      ['fill', '.'],
      P(7, 7, '.'), P(3, 3, '*'), P(11, 3, '*'), P(2, 7, '*'), P(12, 7, '*'), P(3, 11, '*'), P(11, 11, '*'),
      R(6, 6, 8, 8, '='),
      P(5, 5, 'c'), P(9, 5, 'c'), P(5, 9, 'c'), P(9, 9, 'c'),
      P(4, 2, 'e'), P(10, 2, 'e'), P(7, 4, 'e'), P(2, 5, 'e'), P(12, 5, 'e'),
      P(4, 13, '1'), P(6, 13, '2'), P(8, 13, '3'), P(10, 13, '4'), P(5, 12, '5'), P(9, 12, '6'),
    ]),
  },
};

export interface Encounter { map: string; foes: { id: string; slot: number; suffix?: string }[]; ally?: { id: string; slot: number }[]; intro: string }
/** Los slots son índices en el orden de lectura de los marcadores 'e' / 'a' del mapa. */
export const ENCOUNTERS: Record<string, Encounter> = {
  linyera: {
    map: 'callejon', intro: 'El viejo linyera se arranca la máscara de mendigo. Sus dientes son demasiado blancos. Silba, y el callejón se llena de armaduras de bronce.',
    foes: [{ id: 'linyera', slot: 2 }, { id: 'guardia_arena', slot: 0, suffix: ' I' }, { id: 'guardia_arena', slot: 1, suffix: ' II' }, { id: 'escorpion_obsidiana', slot: 4 }, { id: 'escorpion_obsidiana', slot: 5 }],
  },
  acueducto: {
    map: 'acueducto', intro: 'Al tocar el fragmento sellado en la cerradura, las piletas rotas escupen ghuls. Los espectros se multiplican a su alrededor.',
    foes: [{ id: 'ghul_mutado', slot: 0 }, { id: 'ghul_mutado', slot: 1 }, { id: 'ghul_swarmer', slot: 2 }, { id: 'ghul_swarmer', slot: 3 }, { id: 'ghul_swarmer', slot: 4 }, { id: 'ghul_swarmer', slot: 5 }],
  },
  cubo: {
    map: 'cubo', intro: 'Pisaste la marca equivocada. La sala se traga tu reflejo… y lo devuelve con tu cara, pero sin tu alma.',
    foes: [{ id: 'reflejo', slot: 0, suffix: ' de Pact' }, { id: 'reflejo', slot: 1, suffix: ' de Rabb' }, { id: 'reflejo', slot: 2, suffix: ' de Joren' }],
  },
};
