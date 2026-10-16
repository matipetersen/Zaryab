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
      P(7, 2, 'e'), P(12, 2, 'e'), P(9, 4, 'e'), P(10, 4, 'e'), P(2, 5, 'e'), P(17, 5, 'e'), P(5, 11, 'a'), P(14, 11, 'a'),
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

Object.assign(MAPS, {
  pozo: {
    id: 'pozo', name: 'Lago de los Silencios', theme: 'crater',
    objective: 'Despeja la cueva del lago. La Lengua Muerta —la rama negra— espera en el centro.',
    rows: paint(20, 16, [
      ['fill', '.'],
      R(7, 5, 12, 10, '~'), R(8, 6, 11, 9, '~'), P(9, 7, '='), P(10, 8, '='), P(9, 8, '='), P(10, 7, '='),
      R(1, 1, 4, 3, '#'), R(15, 1, 18, 3, '#'), R(1, 12, 3, 14, '#'), R(16, 12, 18, 14, '#'),
      P(5, 6, 'c'), P(14, 6, 'c'), P(5, 10, 'c'), P(14, 10, 'c'), P(3, 8, ','), P(16, 8, ','), P(6, 3, ','), P(13, 3, ','),
      P(7, 2, 'e'), P(12, 2, 'e'), P(5, 4, 'e'), P(14, 4, 'e'), P(9, 4, 'e'), P(10, 4, 'e'), P(2, 7, 'e'),
      P(7, 14, '1'), P(8, 14, '2'), P(9, 14, '3'), P(10, 14, '4'), P(11, 14, '5'), P(12, 14, '6'),
    ]),
  },
  jardin: {
    id: 'jardin', name: 'Jardín de los Suspiros', theme: 'garden',
    objective: 'Cruza el laberinto de cipreses. Las rosas translúcidas tienen hambre.',
    rows: paint(20, 15, [
      ['fill', '.'],
      R(3, 3, 3, 8, '#'), R(6, 5, 6, 11, '#'), R(9, 1, 9, 6, '#'), R(12, 4, 12, 10, '#'), R(15, 2, 15, 8, '#'), R(16, 11, 17, 11, '#'), R(3, 10, 4, 10, '#'),
      R(8, 8, 10, 9, '~'), P(14, 12, '~'), P(2, 12, '~'),
      P(8, 3, 'c'), P(11, 7, 'c'), P(5, 9, 'c'), P(14, 5, 'c'), P(10, 12, 'c'),
      P(8, 2, 'e'), P(11, 2, 'e'), P(14, 9, 'e'), P(7, 7, 'e'), P(13, 2, 'e'), P(17, 6, 'e'),
      P(3, 13, '1'), P(5, 13, '2'), P(7, 13, '3'), P(9, 13, '4'), P(11, 13, '5'), P(13, 13, '6'),
    ]),
  },
  zoco: {
    id: 'zoco', name: 'Mercado de las Sombras', theme: 'market',
    objective: 'Abre paso entre los puestos. Hay oídos en cada toldo.',
    rows: paint(18, 14, [
      ['fill', '.'],
      R(2, 2, 3, 3, '#'), R(14, 2, 15, 3, '#'), R(2, 10, 3, 11, '#'), R(14, 10, 15, 11, '#'), R(8, 5, 9, 8, '#'),
      P(5, 3, 'c'), P(6, 3, 'c'), P(11, 3, 'c'), P(12, 3, 'c'), P(5, 8, 'c'), P(12, 8, 'c'), P(6, 6, 'c'), P(11, 6, 'c'), P(7, 10, 'c'), P(10, 10, 'c'),
      P(4, 6, ','), P(13, 6, ','), P(8, 3, ','), P(9, 3, ','),
      P(4, 1, 'e'), P(13, 1, 'e'), P(8, 2, 'e'), P(9, 2, 'e'), P(2, 6, 'e'), P(15, 6, 'e'),
      P(5, 12, '1'), P(7, 12, '2'), P(9, 12, '3'), P(11, 12, '4'), P(6, 11, '5'), P(12, 11, '6'),
    ]),
  },
  templo: {
    id: 'templo', name: 'Templo de Kelemvor (en ruinas)', theme: 'ruins',
    objective: 'Entre las cenizas aún quedan los símbolos de quienes lo incendiaron.',
    rows: paint(16, 14, [
      ['fill', '.'],
      R(1, 1, 2, 12, '#'), R(13, 1, 14, 12, '#'), R(3, 1, 12, 1, '#'),
      P(4, 4, 'c'), P(6, 4, 'c'), P(9, 4, 'c'), P(11, 4, 'c'), P(4, 7, 'c'), P(11, 7, 'c'),
      R(6, 6, 9, 8, '='), P(7, 10, '^'), P(8, 10, '^'), P(5, 9, '^'), P(10, 9, ','), P(3, 10, ','), P(12, 10, ','),
      P(5, 2, 'e'), P(7, 2, 'e'), P(8, 2, 'e'), P(10, 2, 'e'), P(4, 5, 'e'),
      P(5, 12, '1'), P(6, 12, '2'), P(7, 12, '3'), P(8, 12, '4'), P(9, 12, '5'), P(10, 12, '6'),
    ]),
  },
  santuario: {
    id: 'santuario', name: 'La Biblioteca (santuario del Simurg)', theme: 'sanctum',
    objective: 'Defiende el santuario. Los estantes caídos sirven de cobertura.',
    rows: paint(16, 14, [
      ['fill', '.'],
      R(2, 2, 2, 5, '#'), R(13, 2, 13, 5, '#'), R(2, 9, 2, 11, '#'), R(13, 9, 13, 11, '#'), R(5, 1, 10, 1, '#'),
      R(6, 5, 9, 7, '='), P(5, 4, 'c'), P(10, 4, 'c'), P(4, 8, 'c'), P(11, 8, 'c'), P(7, 10, 'c'), P(8, 10, 'c'),
      P(4, 3, ','), P(11, 3, ','),
      P(4, 1, 'e'), P(7, 2, 'e'), P(8, 2, 'e'), P(11, 1, 'e'), P(3, 6, 'e'), P(12, 6, 'e'),
      P(5, 12, '1'), P(6, 12, '2'), P(7, 12, '3'), P(8, 12, '4'), P(9, 12, '5'), P(10, 12, '6'),
    ]),
  },
});

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

  lago: { map: 'pozo', intro: 'Los túneles de los Hijos del Simurg desembocan en una caverna de cristal negro. El agua refleja el cielo al revés. Algo se mueve bajo la piel de la arena.',
    foes: [{ id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'ghul_catacumbas', slot: 2 }, { id: 'hormiga_arena', slot: 3 }, { id: 'hormiga_arena', slot: 4 }, { id: 'hormiga_arena', slot: 5 }] },
  espejo: { map: 'zoco', intro: 'El Mercado de las Sombras huele a aceite violeta. En el puesto de Madam Shub, el Espejo de Almas devuelve rostros que no son los vuestros.',
    foes: [{ id: 'mercenario_zoco', slot: 0 }, { id: 'mercenario_zoco', slot: 1 }, { id: 'serpiente_cristal', slot: 2 }, { id: 'serpiente_cristal', slot: 3 }] },
  te: { map: 'jardin', intro: 'Cipreses podados como manos gigantes. Rosas translúcidas que sangran néctar. Todo el mundo lleva máscara; las flores, no.',
    foes: [{ id: 'flor_carnivora', slot: 0 }, { id: 'flor_carnivora', slot: 1 }, { id: 'flor_carnivora', slot: 2 }, { id: 'guardia_arena', slot: 3 }, { id: 'guardia_arena', slot: 4 }] },
  zyr: { map: 'zoco', intro: "«La Casa Vel'Shara no olvida, Zyr'thar. No olvida. No perdona. No muere.»",
    foes: [{ id: 'drow_espia', slot: 0 }, { id: 'serpiente_cristal', slot: 2 }, { id: 'serpiente_cristal', slot: 3 }, { id: 'drow_espia', slot: 1, suffix: ' (hermana)' }] },
  joren: { map: 'zoco', intro: 'Un sello quemado en cuero: un círculo partido con un diente dentro. Los hombres de La Marca no esperaban visitas.',
    foes: [{ id: 'mercenario_zoco', slot: 0, suffix: ' (La Marca)' }, { id: 'mercenario_zoco', slot: 1, suffix: ' (La Marca)' }, { id: 'serpiente_cristal', slot: 2 }] },
  romain: { map: 'templo', intro: 'Cenizas, vigas negras y, grabado en una piedra: el sello del Conclave. Quien incendió este templo vuelve a por lo que olvidó.',
    foes: [{ id: 'inquisidor', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'perro_arena', slot: 3 }] },
  panchi: { map: 'santuario', intro: 'Entre los estantes, algo golpea las paredes: un golem defectuoso, roto, enojado, solo. Como alguien que conoces.',
    foes: [{ id: 'golem_arena', slot: 1 }] },
  pact: { map: 'cubo', intro: 'Tu reflejo lleva una corona de fuego invertido. Es lo que fuiste. Es lo que podrías volver a ser.',
    foes: [{ id: 'reflejo', slot: 0, suffix: ' — Eco de Azuran' }] },
  patrulla: { map: 'callejon', intro: 'Una patrulla del Conclave rastrea a uno de vuestros seguidores. Un perro de arena ya os ha olido.',
    foes: [{ id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'perro_arena', slot: 4 }] },
  asalto: { map: 'santuario', intro: 'Las campanas del Conclave suenan sobre la biblioteca. Los Inquisidores han venido por el cristal, por el altar y por vosotros.',
    foes: [{ id: 'inquisidor', slot: 0 }, { id: 'inquisidor', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'guardia_arena', slot: 3 }, { id: 'guardia_arena', slot: 4 }, { id: 'perro_arena', slot: 5 }] },
  ninos: { map: 'callejon', intro: 'Los niños del barrio juegan con sus escorpiones domesticados cuando llegan los guardias «a cobrar impuestos». Los escorpiones ya han decidido de qué lado están.',
    foes: [{ id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }], ally: [{ id: 'escorpion_obsidiana', slot: 0 }, { id: 'escorpion_obsidiana', slot: 1 }] },
  infiltrado: { map: 'zoco', intro: 'Un anillo brilla en el dedo del «comerciante»: detecta la magia de Zahir. Os ha reconocido por el cristal.',
    foes: [{ id: 'inquisidor', slot: 0 }, { id: 'perro_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }] },
  ghul_vendedor: { map: 'callejon', intro: '«Carne fresca, forastero, carne fresca…» El vendedor sonríe con demasiados dientes.',
    foes: [{ id: 'ghul_catacumbas', slot: 0 }, { id: 'ghul_swarmer', slot: 1 }, { id: 'ghul_swarmer', slot: 2 }] },
};
