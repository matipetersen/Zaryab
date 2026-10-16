import type { Node } from '../story/types';
import type { Campaign } from '../state';
import { has, built } from '../state';

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
    S('Zahir', 'No les di la segunda vida para que la gasten paseando.', 'tras demasiados días de silencio'),
    S('Zahir', 'El cristal se enfría. Cada día sin hacer lo que prometieron es un latido menos.', 'serio, casi triste'),
    { t: 'fx', e: { pf: -3 }, note: 'Zahir os descuenta fe por vuestra tardanza. Sentid el cristal: espera una señal.' },
  ],
  cacería: [
    { t: 'chapter', title: 'La Cacería', sub: 'Zaryab entera os busca', bg: 'plaza' },
    N('Alerta máxima. Cada esquina tiene un cartel con vuestras caras. Los Inquisidores han roto el altar de la biblioteca y quemado los estantes. Ya no hay vuelta atrás.'),
    { t: 'fx', e: { pf: -10, alert: -3, rep: { inquisidores: -2 }, flags: ['santuario_saqueado'], unflag: [] }, note: 'Perdéis PF y el Conclave os mira más de cerca. Mañana habrá nuevos carteles.' },
  ],
};

export type Pending = { id: string } | null;
/** Devuelve el evento del reloj que toca disparar, si hay alguno. */
export function pendingEvent(c: Campaign): string | null {
  if (!has(c, 'cap2_done')) return null;
  if (c.alert >= 10 && !has(c, 'ev_cacería_done') && !built(c, 'torre')) return 'cacería';
  if (c.alert >= 7 && !has(c, 'ev_asalto_done')) return 'asalto';
  if (c.alert >= 4 && !has(c, 'ev_patrulla_done')) return 'patrulla';
  if (c.day - c.lastMainDay >= 12 && !has(c, 'cap4_done')) return 'zahir_llama';
  return null;
}
