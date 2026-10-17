import { ECOS } from './morales';
import { INTERLUDES } from '../story/interludes';
import type { Node } from '../story/types';
import type { Campaign } from '../state';
import { has, built } from '../state';
import { gusanoDue } from './gusano';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });

/** Eventos que dispara el reloj (Alerta, días sin avanzar la trama principal). */
export const EVENTS: Record<string, Node[]> = {
  patrulla: [
    { t: 'chapter', title: 'La Patrulla', sub: 'El Conclave rastrea a un seguidor', bg: 'bajo' },
    N('Las campanas del Conclave suenan dos veces en el Bajo Zaryab. Una patrulla de bronce viviente baja por la calle con un perro de arena husmeando. Buscan a uno de vuestros adeptos.'),
    { t: 'choice', prompt: '¿Cómo recibís a la patrulla?', options: [
      { label: 'Plantarle cara', hint: 'Combate.', e: { alert: -1, d: 0 }, result: ['Los guardias desenvainan. El perro gruñe.'], then: [{ t: 'battle', enc: 'patrulla' }] },
      { label: 'Sobornarlos', hint: '−4 PF', e: { pf: -4, alert: -2 }, result: ['Un buen puñado de monedas. La patrulla se va, pero se acuerda de las caras.'] },
    ] },
  ],
  asalto: [
    { t: 'chapter', title: 'La Visita del Vizir', sub: 'El Conclave llega a la biblioteca', bg: 'plaza' },
    S('Vizir Razul', 'Construís un nido de ratas… sobre huesos robados.', 'burlón, amenazante'),
    S('Vizir Razul', 'El viento sopla solo para los dignos. ¿Creéis que sois dignos?', 'frío, autoritario'),
    N('Inquisidores, guardias de bronce y perros de arena rodean la biblioteca. Las campanas no paran. Por una vez, Zahir no dice nada.'),
    { t: 'choice', prompt: 'El santuario está en peligro.', options: [
      { label: 'Defender el santuario', hint: 'Batalla difícil. Si ganáis, +10 PF.', e: {}, result: ['Los estantes caen. Los candiles se encienden. Es vuestra casa.'], then: [{ t: 'battle', enc: 'asalto' }, { t: 'fx', e: { pf: 10, alert: -4, flags: ['santuario_defendido'] }, note: 'El santuario resiste. Los adeptos lo cuentan durante semanas.' }] },
      { label: 'Evacuar y esconderse', hint: 'Salvas a los seguidores, pierdes PF (15) y el santuario queda maldito.', e: { alert: -3, flags: ['santuario_maldito'] }, result: ['Los adeptos salen por el pasadizo trasero. Cuando volvéis, las paredes sangran más violeta que antes.'], then: [{ t: 'fx', e: { pf: -15 } }] },
      { label: 'Negociar con Razul', hint: '+1 fragmento; −2 Devoción (trato con el diablo).', e: { d: -2, alert: -4, rep: { conclave: 2 }, flags: ['trato_razul', 'fragmento_razul'] }, result: ['«Un trato justo», dice Razul con una voz de muchos tonos. «Vuestro culto puede vivir mientras no abra la boca.»'] },
    ] },
  ],
  zahir_llama: [
    { t: 'bg', id: 'limbo' },
    { t: 'if', flag: 'cap11_done', then: [S('Zahir', 'Quedan pocos fragmentos y poco cristal. Os estoy pidiendo que corráis, no que paseéis.', 'sin aliento, casi suplicando')], else: [{ t: 'if', flag: 'cap7_done', then: [S('Zahir', 'He esperado siglos, pero ahora sé contar los días. Y cada día que paseáis me roba uno.', 'con una calma que asusta')], else: [S('Zahir', 'No les di la segunda vida para que la gasten paseando.', 'tras demasiados días de silencio'), S('Zahir', 'El cristal se enfría. Cada día sin hacer lo que prometieron es un latido menos.', 'serio, casi triste')] }] },
    { t: 'fx', e: { pf: -3, fe: -1 }, note: 'Zahir os descuenta fe por vuestra tardanza: −3 PF, y los seguidores dudan. Avanzad la historia.' },
  ],
  eclipse_aviso1: [
    { t: 'chapter', title: 'El Cielo se Oscurece', sub: 'Faltan treinta días', bg: 'plaza' },
    N('Una mañana, el sol sale con un borde mordido. Los viejos del Zoco lo ven y se persignan. Los niños lo señalan con un dedo manchado de tiza.'),
    S('Zahir', 'Treinta días. Lo siento en los huesos. Lo que no hagáis hoy, lo hará el Eclipse por vosotros.', 'sin teatralidad'),
    { t: 'fx', e: { rumors: 1 }, note: 'El Eclipse llegará en treinta días.' },
  ],
  eclipse_aviso2: [
    { t: 'chapter', title: 'La Sombra Crece', sub: 'Faltan diez días', bg: 'plaza' },
    N('A mediodía hace frío. Las campanas del Conclave suenan por nadie. Las sombras se alargan hacia el sur, hacia las Catacumbas, como brújulas.'),
    S('Zahir', 'Diez días. Después, no habrá elección: sólo lo que hayáis llegado a ser.', 'casi en un susurro'),
    { t: 'fx', e: { alert: 1 }, note: 'Diez días para el Eclipse. Lo que dejéis sin hacer, quedará sin hacer.' },
  ],
  eclipse_llega: [
    { t: 'chapter', title: 'El Eclipse', sub: 'No esperó a nadie', bg: 'limbo' },
    N('A mediodía el sol se apaga. El Zoco calla. Las campanas dejan de sonar. Debajo de la biblioteca, en las Catacumbas, algo respira por fin con alivio.'),
    S('Zahir', 'Es hora. Lo que no hicisteis, lo hará la ciudad sola. Lo que sois, ya lo sois. Vamos.', 'con voz de siempre, y de nunca'),
    { t: 'fx', e: { flags: ['eclipse_forzado'] }, note: 'El Eclipse llegó. Los capítulos que dejasteis atrás quedan sin resolver.' },
  ],
  razul_plazo: [
    { t: 'if', flag: 'cap12_done', then: [], else: [
      { t: 'chapter', title: 'Se Acabó el Plazo', sub: 'Razul cobra', bg: 'plaza' },
      N('Suenan las campanas del Conclave a la hora exacta. Razul no manda emisarios: viene él, con el reloj de arena vacío en una mano y una lista en la otra.'),
      S('Vizir Razul', 'Os di tiempo. Lo habéis gastado en otras cosas. No me ofendo. Cobro.', 'sin levantar la voz'),
      { t: 'fx', e: { pf: -8, alert: 3, rep: { conclave: -1 }, flags: ['razul_cobro'] }, note: 'Razul cobra: −8 PF, +3 Alerta.' },
    ] },
  ],
  desierto: [
    { t: 'chapter', title: 'El Desierto', sub: 'Elegisteis iros', bg: 'dunas' },
    N('Una noche, sin avisar, recogéis lo poco que os pertenece. Aisha deja de amasar. Farid levanta la mirada del arpa y no dice nada.'),
    S('Zahir', 'No os culpo. Yo también quise irme alguna vez. Nunca supe adónde.', 'con una voz apagada, casi tierna'),
    N('El cristal se enfría en vuestro pecho, latido a latido. Detrás de vosotros, Zaryab sigue su curso sin pedir permiso: el Conclave, la guerra, el Eclipse. Delante, sólo dunas blancas y el viento que sopla para quien lo merece.'),
    { t: 'end', title: 'Fin · El Desierto', text: 'Os fuisteis. El Eclipse llegó igual, y Zaryab aprendió a vivir sin vosotros, o a no vivir. Nadie volvió a hablar de la compañía; de vez en cuando, un caminante cuenta que en las dunas hay seis huellas que no llevan a ninguna parte.' },
  ],
  cacería: [
    { t: 'chapter', title: 'La Cacería', sub: 'Zaryab entera os busca', bg: 'plaza' },
    N('Alerta máxima. Cada esquina tiene un cartel con vuestras caras. Los Inquisidores han roto el altar de la biblioteca y quemado los estantes. Ya no hay vuelta atrás.'),
    { t: 'fx', e: { pf: -10, alert: -3, rep: { inquisidores: -2 }, flags: ['santuario_saqueado'], unflag: [] }, note: 'Perdéis PF y el Conclave os mira más de cerca. Mañana habrá nuevos carteles.' },
  ],
};

Object.assign(EVENTS, ECOS, INTERLUDES);
export type Pending = { id: string } | null;
/** Devuelve el evento del reloj que toca disparar, si hay alguno. */
export function pendingEvent(c: Campaign): string | null {
  if (!has(c, 'cap2_done')) return null;
  if (has(c, 'ev_noche3_done') && has(c, 'conoce_ellie') && !has(c, 'ev_qadir_done')) return 'qadir';
  for (const [after, ev] of [['cap7_done', 'noche1'], ['cap9_done', 'noche2'], ['cap10_done', 'noche3'], ['cap11_done', 'noche4']] as const) if (has(c, after) && !has(c, `ev_${ev}_done`)) return ev;
  if (gusanoDue(c)) return 'gusano_caza';
  if (c.alert >= 10 && !has(c, 'ev_cacería_done') && !built(c, 'torre')) return 'cacería';
  if (c.alert >= 7 && !has(c, 'ev_asalto_done')) return 'asalto';
  if (c.alert >= 4 && !has(c, 'ev_patrulla_done')) return 'patrulla';
  const zp = has(c, 'cap11_done') ? 8 : has(c, 'cap7_done') ? 10 : 12;
  if (c.day - c.lastMainDay >= zp && !has(c, 'cap13_done')) return 'zahir_llama';
  return null;
}
