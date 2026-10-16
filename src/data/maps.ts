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
      P(6, 7, 'c'), P(13, 7, 'c'), P(8, 10, 'o'), P(11, 10, 'o'), P(3, 6, 'c'), P(16, 6, 'c'), P(6, 2, 'c'), P(9, 6, 'o'),
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
  plaza: {
    id: 'plaza', name: 'Plaza Central de Zaryab', theme: 'plaza',
    objective: 'Derriba al Coloso. Los tres pilones púrpura lo alimentan: rómpelos. Dahhak no puede ser detenido, sólo herido.',
    rows: paint(24, 18, [
      ['fill', '.'],
      R(7, 1, 16, 3, '#'), R(10, 4, 13, 4, '='), P(11, 3, '.'), P(12, 3, '.'),
      R(1, 1, 3, 5, '#'), R(20, 1, 22, 5, '#'),
      R(4, 8, 5, 8, 'c'), R(18, 8, 19, 8, 'c'), R(8, 10, 9, 10, 'c'), R(14, 10, 15, 10, 'c'), P(11, 7, 'c'), P(12, 7, 'c'), P(6, 5, 'c'), P(17, 5, 'c'),
      R(18, 12, 21, 14, '^'), R(2, 12, 4, 13, ','), P(10, 12, 'o'), P(13, 12, 'o'), P(6, 9, 'o'), P(17, 9, 'o'),
      P(12, 5, 'e'), P(11, 4, 'e'), P(6, 6, 'e'), P(17, 6, 'e'), P(11, 9, 'e'), P(5, 3, 'e'), P(18, 3, 'e'),
      P(1, 8, 'w'), P(22, 8, 'w'), P(1, 10, 'w'), P(22, 10, 'w'),
      P(8, 15, '1'), P(10, 15, '2'), P(12, 15, '3'), P(14, 15, '4'), P(9, 16, '5'), P(13, 16, '6'),
    ]),
  },

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
  dunas: {
    id: 'dunas', name: 'Las Dunas Blancas', theme: 'crater',
    objective: 'Sobrevive al ataque nocturno. Usa las rocas negras como cobertura.',
    rows: paint(20, 14, [
      ['fill', '.'],
      R(2, 3, 5, 5, ','), R(13, 7, 17, 9, ','), R(8, 6, 11, 7, ','), P(10, 4, ','), P(4, 10, ','), P(15, 3, ','),
      P(6, 5, 'C'), P(13, 5, 'C'), P(9, 8, 'C'), P(10, 8, 'C'), P(3, 8, 'C'),
      P(7, 4, '*'), P(12, 6, '*'), P(8, 9, '*'), P(11, 9, '*'), P(15, 8, '*'),
      P(4, 1, 'e'), P(8, 1, 'e'), P(12, 1, 'e'), P(16, 1, 'e'), P(2, 3, 'e'), P(17, 4, 'e'),
      P(7, 12, '1'), P(8, 12, '2'), P(9, 12, '3'), P(10, 12, '4'), P(11, 12, '5'), P(12, 12, '6'),
    ]),
  },
  medinat: {
    id: 'medinat', name: 'Medinat al-Rih · Plaza de los Olvidados', theme: 'market',
    objective: 'Sofoca la revuelta. Las barricadas y los puestos se pueden romper.',
    rows: paint(22, 16, [
      ['fill', '.'],
      R(1, 1, 4, 3, '#'), R(17, 1, 20, 3, '#'), R(8, 1, 13, 2, '#'), R(1, 12, 3, 14, '#'), R(18, 12, 20, 14, '#'),
      R(6, 6, 7, 6, 'c'), R(14, 6, 15, 6, 'c'), R(10, 8, 11, 8, 'C'), P(4, 8, 'o'), P(17, 8, 'o'), P(9, 5, 'c'), P(12, 5, 'c'),
      R(8, 10, 13, 10, ','), P(2, 7, ','), P(19, 7, ','), R(9, 12, 12, 12, '~'),
      P(5, 4, 'e'), P(8, 4, 'e'), P(13, 4, 'e'), P(16, 4, 'e'), P(10, 3, 'e'), P(11, 3, 'e'), P(3, 6, 'e'), P(18, 6, 'e'),
      P(7, 14, '1'), P(8, 14, '2'), P(9, 14, '3'), P(12, 14, '4'), P(13, 14, '5'), P(14, 14, '6'),
    ]),
  },
  arena: {
    id: 'arena', name: 'Torneo de los Puños Cerrados', theme: 'sanctum',
    objective: 'Un solo luchador por bando. Sifra no pelea a muerte: pelea hasta que cae uno. Resiste lo que puedas.',
    rows: paint(12, 10, [
      ['fill', '.'],
      R(5, 4, 6, 5, '*'), P(2, 2, 'C'), P(9, 2, 'C'), P(2, 7, 'C'), P(9, 7, 'C'),
      P(6, 2, 'e'), P(5, 7, '1'), P(4, 7, '2'), P(6, 7, '3'), P(3, 8, '4'), P(7, 8, '5'), P(5, 8, '6'),
    ]),
  },
  iglesia: {
    id: 'iglesia', name: 'Iglesia del Simurg · Cubil de Dahhak', theme: 'ruins',
    objective: 'Derrota a Dahhak. Por cada cuello que cortas, le nacerá otro: golpea al cuerpo y rompe sus pilares para dejarlo sin cobertura.',
    rows: paint(22, 16, [
      ['fill', '.'],
      R(1, 1, 5, 3, '#'), R(16, 1, 20, 3, '#'), R(9, 1, 12, 2, '#'),
      R(4, 6, 4, 9, 'C'), R(17, 6, 17, 9, 'C'), R(8, 8, 9, 8, 'c'), R(12, 8, 13, 8, 'c'), P(10, 6, 'x'), P(11, 6, 'x'),
      R(7, 11, 14, 11, ','), P(2, 12, '^'), P(19, 12, '^'), P(10, 5, 'o'),
      P(10, 3, 'e'), P(7, 4, 'e'), P(14, 4, 'e'),
      P(7, 14, '1'), P(8, 14, '2'), P(9, 14, '3'), P(12, 14, '4'), P(13, 14, '5'), P(14, 14, '6'),
    ]),
  },
  cripta: {
    id: 'cripta', name: 'Cripta de las Trece Caras', theme: 'ruins',
    objective: 'Derrota a Al-Mazhar. Cada turno cambia de máscara: resiste dos daños y teme a uno. Los ghuls se levantan al ritmo de su canción.',
    rows: paint(22, 16, [
      ['fill', '.'],
      R(1, 1, 3, 4, '#'), R(18, 1, 20, 4, '#'), R(8, 1, 13, 1, '#'),
      R(5, 6, 5, 8, 'C'), R(16, 6, 16, 8, 'C'), R(9, 6, 12, 6, 'x'), R(8, 9, 8, 9, 'c'), R(13, 9, 13, 9, 'c'),
      R(9, 11, 12, 11, '*'), P(3, 10, ','), P(18, 10, ','),
      P(10, 3, 'e'), P(7, 3, 'e'), P(14, 3, 'e'),
      P(2, 6, 'w'), P(19, 6, 'w'), P(2, 9, 'w'), P(19, 9, 'w'),
      P(7, 14, '1'), P(8, 14, '2'), P(9, 14, '3'), P(12, 14, '4'), P(13, 14, '5'), P(14, 14, '6'),
    ]),
  },
  mina: {
    id: 'mina', name: 'El Corazón de la Mina de Alabastro', theme: 'mine',
    objective: 'Gul-Amarat no puede ser herido a fondo mientras sus brazos vivan. Córtalos y luego ataca el cuerpo. Que nadie haga ruido.',
    rows: paint(22, 16, [
      ['fill', '.'],
      R(1, 1, 4, 5, '#'), R(17, 1, 20, 5, '#'), R(1, 11, 3, 14, '#'), R(18, 11, 20, 14, '#'),
      R(8, 8, 9, 8, 'C'), R(12, 8, 13, 8, 'C'), P(6, 10, 'c'), P(15, 10, 'c'), P(10, 12, 'o'), P(11, 12, 'o'),
      R(7, 2, 14, 3, ','), P(5, 6, '='), P(16, 6, '='),
      P(10, 3, 'e'), P(7, 4, 'e'), P(14, 4, 'e'), P(8, 6, 'e'), P(13, 6, 'e'),
      P(7, 14, '1'), P(8, 14, '2'), P(9, 14, '3'), P(12, 14, '4'), P(13, 14, '5'), P(14, 14, '6'),
    ]),
  },
  ciudadela: {
    id: 'ciudadela', name: 'Ciudadela de los Susurros · Sala del Trono', theme: 'sanctum',
    objective: 'Derrota a Razul. Su bastón y sus Qilaat responden a su voz: rompe sus runas y no te quedes quieto.',
    rows: paint(22, 16, [
      ['fill', '.'],
      R(1, 1, 4, 4, '#'), R(17, 1, 20, 4, '#'), R(8, 1, 13, 3, '#'), R(10, 4, 11, 4, '='),
      R(4, 7, 4, 10, 'C'), R(17, 7, 17, 10, 'C'), R(8, 8, 8, 8, 'c'), R(13, 8, 13, 8, 'c'), R(9, 10, 12, 10, '*'),
      P(10, 5, 'e'), P(5, 5, 'e'), P(16, 5, 'e'), P(7, 7, 'e'), P(14, 7, 'e'),
      P(7, 14, '1'), P(8, 14, '2'), P(9, 14, '3'), P(12, 14, '4'), P(13, 14, '5'), P(14, 14, '6'),
    ]),
  },
  eclipse: {
    id: 'eclipse', name: 'Las Catacumbas del Simurg · El Eclipse', theme: 'crater',
    objective: 'Zahir se ha elevado como el Simurg. Su eclipse ciega y sus alas queman: rompe los cuatro pilares de la cámara para debilitar el sello.',
    rows: paint(24, 18, [
      ['fill', '.'],
      R(1, 1, 5, 4, '#'), R(18, 1, 22, 4, '#'), R(9, 1, 14, 2, '#'),
      P(6, 7, 'C'), P(17, 7, 'C'), P(6, 11, 'C'), P(17, 11, 'C'), R(11, 8, 12, 9, '*'),
      R(2, 8, 4, 10, ','), R(19, 8, 21, 10, ','), P(8, 13, 'o'), P(15, 13, 'o'),
      P(11, 4, 'e'), P(7, 5, 'e'), P(16, 5, 'e'),
      P(3, 6, 'w'), P(20, 6, 'w'), P(3, 12, 'w'), P(20, 12, 'w'),
      P(8, 16, '1'), P(10, 16, '2'), P(12, 16, '3'), P(14, 16, '4'), P(9, 15, '5'), P(13, 15, '6'),
    ]),
  },
  nido: {
    id: 'nido', name: 'Pico del Viento · Nido del Roc', theme: 'crater',
    objective: 'El Tigre Alado ataca desde el aire. No lo mates: míralo a los ojos o derríbalo.',
    rows: paint(20, 14, [
      ['fill', '.'],
      R(1, 1, 3, 3, '#'), R(16, 1, 18, 3, '#'), R(1, 10, 2, 12, '#'), R(17, 10, 18, 12, '#'),
      R(8, 5, 11, 7, '='), P(5, 5, 'C'), P(14, 5, 'C'), P(5, 9, 'C'), P(14, 9, 'C'), P(9, 9, ','), P(10, 9, ','),
      P(9, 3, 'e'),
      P(7, 12, '1'), P(8, 12, '2'), P(9, 12, '3'), P(10, 12, '4'), P(11, 12, '5'), P(12, 12, '6'),
    ]),
  },
  cementerio: {
    id: 'cementerio', name: 'El Cementerio Olvidado', theme: 'ruins',
    objective: 'Los muertos se levantan por oleadas. Romain y Pact pueden expulsarlos; las losas rotas dan cobertura.',
    rows: paint(22, 16, [
      ['fill', '.'],
      R(1, 1, 3, 3, '#'), R(18, 1, 20, 3, '#'), R(9, 1, 12, 2, '#'),
      R(5, 5, 6, 5, 'C'), R(15, 5, 16, 5, 'C'), R(8, 7, 9, 7, 'c'), R(12, 7, 13, 7, 'c'), P(10, 9, 'C'), P(11, 9, 'C'),
      R(3, 10, 4, 12, ','), R(17, 10, 18, 12, ','), P(10, 12, '*'),
      P(6, 3, 'e'), P(9, 4, 'e'), P(12, 4, 'e'), P(15, 3, 'e'), P(4, 7, 'e'), P(17, 7, 'e'),
      P(2, 5, 'w'), P(19, 5, 'w'), P(10, 2, 'w'),
      P(7, 14, '1'), P(8, 14, '2'), P(9, 14, '3'), P(12, 14, '4'), P(13, 14, '5'), P(14, 14, '6'),
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
      P(5, 3, 'c'), P(6, 3, 'c'), P(11, 3, 'c'), P(12, 3, 'c'), P(5, 8, 'o'), P(12, 8, 'o'), P(6, 6, 'c'), P(11, 6, 'c'), P(7, 10, 'c'), P(10, 10, 'c'), P(8, 9, 'x'),
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
      R(1, 1, 2, 12, '#'), R(13, 1, 14, 12, '#'), R(3, 1, 12, 1, '#'), P(5, 1, 'x'), P(6, 1, 'x'), P(9, 1, 'x'),
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
      R(2, 2, 2, 5, '#'), R(13, 2, 13, 5, '#'), R(2, 9, 2, 11, '#'), R(13, 9, 13, 11, '#'), R(5, 1, 10, 1, '#'), P(5, 3, 'x'), P(10, 3, 'x'), P(7, 9, 'o'),
      R(6, 5, 9, 7, '='), P(5, 4, 'c'), P(10, 4, 'c'), P(4, 8, 'c'), P(11, 8, 'c'), P(7, 10, 'c'), P(8, 10, 'c'),
      P(4, 3, ','), P(11, 3, ','),
      P(4, 1, 'e'), P(7, 2, 'e'), P(8, 2, 'e'), P(11, 1, 'e'), P(3, 6, 'e'), P(12, 6, 'e'),
      P(5, 12, '1'), P(6, 12, '2'), P(7, 12, '3'), P(8, 12, '4'), P(9, 12, '5'), P(10, 12, '6'),
    ]),
  },
});

import { MAUNATOR_MAPS, CUBE } from './maunator';
export interface Wave { round: number; every?: number; until?: number; foes: string[]; note?: string }
export interface Encounter { objective?: boolean; script?: string; goal?: { x: number; y: number }; goalMsg?: string; soft?: boolean; scaleWaves?: boolean; survive?: number; duel?: { rounds: number; party: string[] }; defense?: boolean; scale?: { hp?: number; atk?: number }; waves?: Wave[]; map: string; foes: { id: string; slot: number; suffix?: string }[]; ally?: { id: string; slot: number }[]; intro: string }
/** Los slots son índices en el orden de lectura de los marcadores 'e' / 'a' del mapa. */
export const ENCOUNTERS: Record<string, Encounter> = {
  noche: { scale: { hp: 1.0, atk: 0 }, map: 'dunas', intro: 'Cinco días de marcha. A la sexta noche, algo huele vuestra comida desde las dunas: chasquidos, patas, ojos que reflejan la fogata.',
    foes: [{ id: 'escorpion_obsidiana', slot: 0 }, { id: 'escorpion_obsidiana', slot: 2 }, { id: 'escorpion_obsidiana', slot: 4 }, { id: 'perro_arena', slot: 3 }] },
  linyera: { scale: { hp: 0.75, atk: -1 },
    map: 'callejon', intro: 'El viejo linyera se arranca la máscara de mendigo. Sus dientes son demasiado blancos. Silba, y el callejón se llena de armaduras de bronce.',
    foes: [{ id: 'linyera', slot: 2 }, { id: 'guardia_arena', slot: 0, suffix: ' I' }, { id: 'guardia_arena', slot: 1, suffix: ' II' }, { id: 'escorpion_obsidiana', slot: 4 }, { id: 'escorpion_obsidiana', slot: 5 }],
  },
  acueducto: { scale: { hp: 1.3, atk: 1 },
    map: 'acueducto', intro: 'Al tocar el fragmento sellado en la cerradura, las piletas rotas escupen ghuls. Los espectros se multiplican a su alrededor.',
    foes: [{ id: 'ghul_mutado', slot: 0 }, { id: 'ghul_mutado', slot: 1 }, { id: 'ghul_swarmer', slot: 2 }, { id: 'ghul_swarmer', slot: 3 }, { id: 'ghul_swarmer', slot: 4 }, { id: 'ghul_swarmer', slot: 5 }],
  },
  cubo: {
    map: 'cubo', intro: 'Pisaste la marca equivocada. La sala se traga tu reflejo… y lo devuelve con tu cara, pero sin tu alma.',
    foes: [{ id: 'reflejo', slot: 0, suffix: ' de Pact' }, { id: 'reflejo', slot: 1, suffix: ' de Rabb' }, { id: 'reflejo', slot: 2, suffix: ' de Joren' }],
  },

  lago: { scale: { hp: 1.6, atk: 1 }, map: 'pozo', intro: 'Los túneles de los Hijos del Simurg desembocan en una caverna de cristal negro. El agua refleja el cielo al revés. Algo se mueve bajo la piel de la arena.',
    foes: [{ id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'ghul_catacumbas', slot: 2 }, { id: 'hormiga_arena', slot: 3 }, { id: 'hormiga_arena', slot: 4 }, { id: 'hormiga_arena', slot: 5 }] },
  espejo: { scale: { hp: 0.75, atk: -1 }, map: 'zoco', intro: 'El Mercado de las Sombras huele a aceite violeta. En el puesto de Madam Shub, el Espejo de Almas devuelve rostros que no son los vuestros.',
    foes: [{ id: 'mercenario_zoco', slot: 0 }, { id: 'mercenario_zoco', slot: 1 }, { id: 'serpiente_cristal', slot: 2 }, { id: 'serpiente_cristal', slot: 3 }] },
  te: { scale: { hp: 2, atk: 2 }, map: 'jardin', intro: 'Cipreses podados como manos gigantes. Rosas translúcidas que sangran néctar. Todo el mundo lleva máscara; las flores, no.',
    foes: [{ id: 'flor_carnivora', slot: 0 }, { id: 'flor_carnivora', slot: 1 }, { id: 'flor_carnivora', slot: 2 }, { id: 'guardia_arena', slot: 3 }, { id: 'guardia_arena', slot: 4 }] },
  zyr: { scale: { hp: 0.75, atk: -1 }, map: 'zoco', intro: "«La Casa Vel'Shara no olvida, Zyr'thar. No olvida. No perdona. No muere.»",
    foes: [{ id: 'drow_espia', slot: 0 }, { id: 'serpiente_cristal', slot: 2 }, { id: 'serpiente_cristal', slot: 3 }, { id: 'drow_espia', slot: 1, suffix: ' (hermana)' }] },
  joren: { map: 'zoco', intro: 'Un sello quemado en cuero: un círculo partido con un diente dentro. Los hombres de La Marca no esperaban visitas.',
    foes: [{ id: 'mercenario_zoco', slot: 0, suffix: ' (La Marca)' }, { id: 'mercenario_zoco', slot: 1, suffix: ' (La Marca)' }, { id: 'serpiente_cristal', slot: 2 }] },
  romain: { map: 'templo', intro: 'Cenizas, vigas negras y, grabado en una piedra: el sello del Conclave. Quien incendió este templo vuelve a por lo que olvidó.',
    foes: [{ id: 'inquisidor', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'perro_arena', slot: 3 }] },
  panchi: { scale: { hp: 1.6, atk: 2 }, map: 'santuario', intro: 'Entre los estantes, algo golpea las paredes: un golem defectuoso, roto, enojado, solo. Como alguien que conoces.',
    foes: [{ id: 'golem_arena', slot: 1 }] },
  pact: { scale: { hp: 2.5, atk: 3 }, map: 'cubo', intro: 'Tu reflejo lleva una corona de fuego invertido. Es lo que fuiste. Es lo que podrías volver a ser.',
    foes: [{ id: 'reflejo', slot: 0, suffix: ' — Eco de Azuran' }] },
  patrulla: { scale: { hp: 1.3, atk: 1 }, defense: true, map: 'callejon', intro: 'Una patrulla del Conclave rastrea a uno de vuestros seguidores. Un perro de arena ya os ha olido.',
    foes: [{ id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'perro_arena', slot: 4 }] },
  asalto: { scale: { hp: 0.85, atk: -1 }, defense: true, map: 'santuario', intro: 'Las campanas del Conclave suenan sobre la biblioteca. Los Inquisidores han venido por el cristal, por el altar y por vosotros.',
    foes: [{ id: 'inquisidor', slot: 0 }, { id: 'inquisidor', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'guardia_arena', slot: 3 }, { id: 'guardia_arena', slot: 4 }, { id: 'perro_arena', slot: 5 }] },
  ninos: { scale: { hp: 1.6, atk: 2 }, map: 'callejon', intro: 'Los niños del barrio juegan con sus escorpiones domesticados cuando llegan los guardias «a cobrar impuestos». Los escorpiones ya han decidido de qué lado están.',
    foes: [{ id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }], ally: [{ id: 'escorpion_obsidiana', slot: 0 }, { id: 'escorpion_obsidiana', slot: 1 }] },
  infiltrado: { scale: { hp: 1.3, atk: 1 }, map: 'zoco', intro: 'Un anillo brilla en el dedo del «comerciante»: detecta la magia de Zahir. Os ha reconocido por el cristal.',
    foes: [{ id: 'inquisidor', slot: 0 }, { id: 'perro_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }] },
  ghul_vendedor: { scale: { hp: 1.6, atk: 1 }, map: 'callejon', intro: '«Carne fresca, forastero, carne fresca…» El vendedor sonríe con demasiados dientes.',
    foes: [{ id: 'ghul_catacumbas', slot: 0 }, { id: 'ghul_swarmer', slot: 1 }, { id: 'ghul_swarmer', slot: 2 }] },
  recaudador: { scale: { hp: 0.75, atk: -1 }, map: 'callejon', intro: 'El Inquisidor chasquea los dedos. Cuatro guardias de bronce rodean la plaza del barrio. Los vecinos retroceden: nadie quiere ver esto, y todos lo verán.',
    foes: [{ id: 'inquisidor', slot: 2 }, { id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 4 }, { id: 'guardia_arena', slot: 5 }] },
  caravana: { scale: { hp: 1.6, atk: 2 }, map: 'callejon', intro: 'Los ghuls emergen de las dunas con el hambre intacta. Los supervivientes de la caravana se acurrucan tras los barriles.',
    foes: [{ id: 'ghul_mutado', slot: 2 }, { id: 'ghul_swarmer', slot: 0 }, { id: 'ghul_swarmer', slot: 1 }, { id: 'ghul_swarmer', slot: 4 }, { id: 'ghul_swarmer', slot: 5 }] },
  motin: { scale: { hp: 0.6, atk: -1 }, map: 'templo', intro: 'Las mazmorras de la Ciudadela huelen a hierro y a miedo. Los golems de basalto abren los ojos de piedra: cada cadena rota resuena como una campana.',
    foes: [{ id: 'golem_arena', slot: 0 }, { id: 'golem_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'guardia_arena', slot: 3 }] },
  revuelta_orden: { scale: { hp: 1.6, atk: 1 }, map: 'medinat', intro: 'Los Nasnas han alzado barricadas con los puestos del mercado. Vienen escoltados por los Qilaat y los vecinos os miran como a otro soldado del Vizir: «¡Sicarios de Razul!»',
    foes: [{ id: 'nasnas', slot: 0 }, { id: 'nasnas', slot: 1 }, { id: 'nasnas', slot: 2 }, { id: 'nasnas', slot: 3 }, { id: 'nasnas', slot: 4 }, { id: 'nasnas', slot: 5 }, { id: 'nasnas', slot: 6 }] },
  revuelta_pueblo: { scale: { hp: 0.35, atk: -2 }, map: 'medinat', intro: 'Los refugiados de Zaryab entran por las puertas del este. Los Qilaat de Razul les cierran el paso con sus escudos de obsidiana: «Protocolo de contención.»',
    foes: [{ id: 'qilaat', slot: 4 }, { id: 'guardia_arena', slot: 0 }, { id: 'guardia_arena', slot: 1 }, { id: 'guardia_arena', slot: 2 }, { id: 'guardia_arena', slot: 3 }] },
  revuelta_sombra: { scale: { hp: 0.5, atk: -2 }, map: 'medinat', intro: 'Nadie os conoce aquí y nadie os debe nada. Los mercenarios de Dahhak aprovechan el desorden para probar a los recién llegados.',
    foes: [{ id: 'mercenario_zoco', slot: 0 }, { id: 'mercenario_zoco', slot: 1 }, { id: 'mercenario_zoco', slot: 2 }, { id: 'nasnas', slot: 3 }, { id: 'nasnas', slot: 4 }, { id: 'nasnas', slot: 5 }] },
  torneo: { duel: { rounds: 6, party: ['panchi'] }, map: 'arena', intro: 'La arena huele a sudor, a aceite y a sangre vieja. Frente a Panchi, una mujer encapuchada que no ha dicho una palabra desde que entró.',
    foes: [{ id: 'sifra', slot: 0 }] },
  tigre: { scale: { hp: 0.65, atk: -1 }, map: 'nido', intro: 'Un rugido parte la roca. Desde lo alto del Pico, un tigre con alas de roc se deja caer sobre el nido. Los Nómadas dicen que sólo lo doma quien lo mira sin miedo.',
    foes: [{ id: 'tigre_alado', slot: 0 }] },
  cementerio: { scale: { hp: 0.25, atk: -6 }, map: 'cementerio', intro: 'Las losas se agrietan. Una mano de hueso emerge entre las tumbas olvidadas y luego otra. Un ejército que Zaryab borró de sus libros vuelve a marchar.',
    foes: [{ id: 'esqueleto_arena', slot: 0 }, { id: 'esqueleto_arena', slot: 1 }, { id: 'esqueleto_arena', slot: 2 }, { id: 'esqueleto_arquero', slot: 3 }, { id: 'esqueleto_arquero', slot: 4 }, { id: 'caballero_osario', slot: 5 }],
    waves: [{ round: 3, every: 3, until: 9, foes: ['sombra_arena', 'sombra_arena'], note: 'Dos sombras de arena se levantan de las losas.' }] },
  dahhak_final: { scale: { hp: 0.25, atk: -5 }, map: 'iglesia', intro: 'Las naves de la Iglesia del Simurg están llenas de serpientes. Al fondo, Dahhak se desenrolla: ya no es un hombre, es un tronco del que brotan cuellos, y cada uno tiene una voz.',
    foes: [{ id: 'dahhak_final', slot: 0 }, { id: 'nasnas', slot: 1 }, { id: 'nasnas', slot: 2 }] },
  marid: { scale: { hp: 0.4, atk: -3 }, map: 'pozo', intro: 'El agua se pone de pie. El Marid sale del lago con una cara que cambia según el reflejo de quien lo mira. «Os dije que cobraría. No dije cuánto.»',
    foes: [{ id: 'marid_guardian', slot: 0 }] },
  al_mazhar: { scale: { hp: 0.4, atk: -4 }, map: 'cripta', intro: 'Trece máscaras giran sobre un trono de huesos. «Bienvenidos, hijos míos», dice una voz paternal. Los ghuls cantan a coro.',
    foes: [{ id: 'al_mazhar', slot: 0 }, { id: 'ghul_cantor', slot: 1 }, { id: 'ghul_cantor', slot: 2 }],
    waves: [{ round: 2, every: 2, until: 12, foes: ['ghul_swarmer', 'ghul_swarmer'], note: 'La canción de Al-Mazhar levanta dos ghuls más.' }] },
  gusano: { scale: { hp: 0.45, atk: -3 }, map: 'mina', intro: 'Todo está en silencio. El silencio respira. En el centro de la sala, una espiral de brazos humanos se abre como una flor y no tiene ojos.',
    foes: [{ id: 'gul_amarat', slot: 0 }, { id: 'brazo_gusano', slot: 1 }, { id: 'brazo_gusano', slot: 2 }, { id: 'brazo_gusano', slot: 3 }, { id: 'brazo_gusano', slot: 4 }] },
  razul_final: { scale: { hp: 0.4, atk: -7 }, map: 'ciudadela', intro: 'Razul se pone de pie. Detrás de la máscara hay otra máscara. «Habéis llegado más lejos que los otros. Eso sólo significa que seréis olvidados más tarde.»',
    foes: [{ id: 'razul_final', slot: 0 }, { id: 'inquisidor', slot: 3 }, { id: 'inquisidor', slot: 4 }] },
  eclipse: { scale: { hp: 0.3, atk: -5 }, map: 'eclipse', intro: 'El cielo de las catacumbas se vuelve negro. Zahir abre las alas: son de fuego y de mentira. «Yo soy el Simurg. Todos los demás sólo fueron pájaros.»',
    foes: [{ id: 'simurg_eclipse', slot: 0 }],
    waves: [{ round: 3, every: 3, until: 12, foes: ['sombra_arena', 'sombra_arena'], note: 'El eclipse levanta dos sombras de arena.' }] },
  huida_mina: { survive: 8, scale: { hp: 0.5, atk: -2 }, map: 'mina', intro: 'El suelo tiembla. Cada temblor cambia las galerías. Hay que subir cuatro niveles antes de que el silencio os alcance: sobrevivid hasta que se abra la salida.',
    foes: [{ id: 'ghul_mutado', slot: 0 }, { id: 'ghul_mutado', slot: 1 }, { id: 'brazo_gusano', slot: 2 }, { id: 'brazo_gusano', slot: 3 }],
    waves: [{ round: 2, every: 2, until: 8, foes: ['ghul_swarmer', 'ghul_swarmer'], note: 'Los ghuls de la mina se agolpan en las galerías.' }] },
  coloso: { scale: { hp: 1.1, atk: 0 }, defense: true, map: 'plaza', intro: 'Las columnas del Capitolio se abren como pétalos y emerge un coloso de hierro y oro. Dahhak trepa por su espalda, le susurra algo hueco… y las gemas se encienden en púrpura enfermizo. «¿Querían un dios? Les traje uno.»',
    foes: [{ id: 'coloso', slot: 0 }, { id: 'dahhak', slot: 1 }, { id: 'pilon', slot: 2 }, { id: 'pilon', slot: 3 }, { id: 'pilon', slot: 4 }],
    waves: [{ round: 3, every: 3, until: 9, foes: ['nasnas'], note: 'Los Nasnas de Dahhak cruzan las barricadas.' }] },
};

Object.assign(MAPS, MAUNATOR_MAPS);
// ───── «El Inventario de Maunator» ─────
Object.assign(ENCOUNTERS, {
  cubo_maunator: { script: 'cubo', objective: true, soft: true, scale: { hp: 0.7, atk: -1 }, map: 'cubo_maunator', intro: 'El Cubo de Maunator: cuatro por cuatro habitaciones que se desplazan. Cada pocos minutos el suelo vibra seis segundos. Mantened la cabeza fría: la alarma tiene que sonar tarde o temprano.',
    foes: CUBE.foes.map((f, i) => ({ id: f.id, slot: i, suffix: f.suffix })) },
  d4_defensa: { script: 'd4', survive: 3, scale: { hp: 0.6, atk: -1 }, scaleWaves: true, map: 'd4_salida', intro: 'Tres medallones, tres cuencas, tres turnos. El pulso viaja por la roca: el Pudin y Kethras ya lo saben.',
    foes: [{ id: 'black_pudding', slot: 0 }, { id: 'guardia_consulado', slot: 1 }], waves: [{ round: 2, foes: ['kethras', 'guardia_consulado', 'guardia_consulado'], note: 'Kethras entra en el mapa por D3 con refuerzos de guardia.' }] },
  tuneles_a: { script: 'tuneles_a', objective: true, soft: true, goal: { x: 5, y: 0 }, goalMsg: 'Alcanzáis la bifurcación.', scale: { hp: 0.6, atk: -1 }, scaleWaves: true, map: 'tuneles_a', intro: 'Los túneles pre-simurgianos. Cada antorcha se apaga desde el sur: algo viene.',
    foes: [], waves: [{ round: 2, foes: ['kethras'], note: 'Kethras os persigue por la galería.' }] },
  tuneles_b: { script: 'tuneles_b', objective: true, soft: true, goal: { x: 4, y: 0 }, goalMsg: 'La reja cede: Los Muelles Bajos.', scale: { hp: 0.6, atk: -1 }, scaleWaves: true, map: 'tuneles_b', intro: 'El túnel se estrecha. Delante, algo negro avanza hacia la luz. Detrás, pasos de botas.',
    foes: [{ id: 'black_pudding', slot: 0 }], waves: [{ round: 2, foes: ['kethras'], note: 'Kethras llega por detrás: el sándwich se cierra.' }] },
  varreth: { scale: { hp: 0.8, atk: -1 }, map: 'zoco', intro: 'Varreth abre los ojos y grita. Se cubre con Armadura de Mago y desaparece de vuestra vista.', foes: [{ id: 'varreth', slot: 0 }] },
  kethras_quemarropa: { survive: 4, soft: true, scale: { hp: 0.6, atk: -1 }, map: 'tuneles_b', intro: 'El trato se ha roto. Kethras os ataca a quemarropa: Bola de Fuego, Rayo de Frío, sin una palabra más.', foes: [{ id: 'kethras', slot: 0 }] },
} as Record<string, Encounter>);
