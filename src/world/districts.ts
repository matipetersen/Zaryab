import type { Campaign } from '../state';
import { has } from '../state';

export interface District { id: string; name: string; x: number; y: number; icon: string; blurb: string; bg: string; danger: number; open: (c: Campaign) => boolean; lockedNote?: string }

const after = (flag: string) => (c: Campaign) => has(c, flag);
export const DISTRICTS: District[] = [
  { id: 'santuario', name: 'La Biblioteca · Santuario', x: 52, y: 55, icon: '☥', bg: 'choza', danger: 1, open: () => true, blurb: 'Vuestra base: una biblioteca olvidada bajo el Bajo Zaryab, sobre los Huesos del Primer Pacto. Paredes que sangran aceite violeta.' },
  { id: 'bajo', name: 'Bajo Zaryab', x: 38, y: 40, icon: '⌂', bg: 'bajo', danger: 2, open: () => true, blurb: 'Adobe agrietado pintado con tiza violeta. Olor a especias quemadas y mentira fermentada.' },
  { id: 'zoco', name: 'Zoco de los Mil Soplos', x: 24, y: 26, icon: '✧', bg: 'zoco', danger: 2, open: after('cap2_done'), lockedNote: 'Aún no conocéis el camino al Zoco.', blurb: 'Seda púrpura, columnas de mármol veteadas de oro y esferas de cristal que graban contratos.' },
  { id: 'plaza', name: 'Plaza Central', x: 52, y: 20, icon: '⬛', bg: 'plaza', danger: 4, open: after('cap2_done'), blurb: 'El Capitolio del Vizir y, bajo las baldosas, un cubo de mármol sin inscripciones.' },
  { id: 'jardin', name: 'Jardín de los Suspiros', x: 78, y: 28, icon: '❀', bg: 'espejos', danger: 3, open: after('cap3_done'), lockedNote: 'Hace falta una invitación… o un nombre.', blurb: 'Cipreses podados como manos gigantes. Aquí los nobles juegan al Juego de las Máscaras.' },
  { id: 'acueductos', name: 'Acueductos del Oeste', x: 11, y: 52, icon: '≈', bg: 'acueducto', danger: 3, open: after('cap2_done'), blurb: 'Viejos baños y canales olvidados. El agua guarda lo que se hunde.' },
  { id: 'pozo', name: 'Lago de los Silencios', x: 26, y: 78, icon: '◉', bg: 'cubo', danger: 3, open: after('cap2_done'), blurb: 'Un cráter de cristal negro donde el agua refleja el cielo al revés. Una rama negra, «la Lengua Muerta», no deja de crecer.' },
  { id: 'ciudadela', name: 'Ciudadela de los Susurros', x: 76, y: 9, icon: '♜', bg: 'coliseo', danger: 8, open: () => false, lockedNote: 'Sellada hasta el Acto II.', blurb: 'Mármol blanco con runas que giran como serpientes cuando alguien miente.' },
  { id: 'iglesia', name: 'Iglesia del Simurg', x: 6, y: 18, icon: '✦', bg: 'hammam', danger: 6, open: () => false, lockedNote: 'Dahhak huirá hacia aquí. (Acto II)', blurb: 'Un templo del oeste que ya no reza al Simurg.' },
  { id: 'medinat', name: 'Medinat al-Rih', x: 90, y: 56, icon: '☾', bg: 'medinat', danger: 6, open: after('cap5_done'), lockedNote: 'Ciudad de los olvidados. (Acto II)', blurb: 'Los Nasnas se han alzado. Allí se celebra el Torneo de los Puños Cerrados.' },
  { id: 'mina', name: 'Mina de Alabastro', x: 70, y: 82, icon: '⛏', bg: 'prison', danger: 9, open: () => false, lockedNote: 'Cuatro niveles bajo la piedra. (Acto III)', blurb: 'Un gusano de brazos humanos espera en el corazón de la veta.' },
  { id: 'catacumbas', name: 'Catacumbas del Simurg', x: 50, y: 90, icon: '☠', bg: 'limbo', danger: 9, open: () => false, lockedNote: 'Los Huesos del Pacto. (Acto III)', blurb: 'Túneles con paredes que sangran aceite negro.' },
  { id: 'qadir', name: 'Qadir-Kalmah', x: 92, y: 82, icon: '⌖', bg: 'hammam', danger: 7, open: () => false, lockedNote: 'Ciudad de ruinas móviles. (Acto II–III)', blurb: 'Donde se esconde Ellie, la que rompe pactos.' },
];
export const ROADS: [string, string][] = [
  ['santuario', 'bajo'], ['bajo', 'zoco'], ['zoco', 'plaza'], ['plaza', 'jardin'], ['plaza', 'ciudadela'], ['jardin', 'ciudadela'], ['bajo', 'acueductos'], ['bajo', 'pozo'],
  ['acueductos', 'iglesia'], ['zoco', 'iglesia'], ['jardin', 'medinat'], ['santuario', 'mina'], ['santuario', 'catacumbas'], ['medinat', 'qadir'], ['mina', 'qadir'],
];
export const DISTRICT_BY_ID = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));
