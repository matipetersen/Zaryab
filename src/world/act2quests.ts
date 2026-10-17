import type { Node } from '../story/types';
import type { Campaign, Effect } from '../state';
import { has } from '../state';
import type { QuestDef } from './quests';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const open = (id: string, flag: string) => (c: Campaign) => has(c, 'cap6_done') && !has(c, flag) && c.quests[id] !== 'done';

const S_TIGRE: Node[] = [
  T('El Nido del Roc', 'Pico del Viento · los Nómadas del Vacío', 'plaza'),
  N('Los Nómadas del Vacío no hablan mucho. Los guían por dunas que cambian de lugar, hasta un pico de piedra donde un Roc enorme y ciego yace en su nido, con las alas rotas. A su lado, un anciano mueve la cabeza.'),
  S('Nómada', 'Fue el tigre. Lo vio llegar con la tormenta y no pudo apartarse. Ahora ruge desde la cumbre y no deja que nadie suba a cuidar del Roc.', 'sin quitar la mano del pico del ave'),
  S('Nómada', 'Sólo hay una forma de acercarse a un tigre de tormenta: mirarle a los ojos sin miedo. O matarlo. Pero yo creo que no fue su culpa.', 'bajando la voz'),
  N('Un rugido parte la roca. Sobre la cumbre, recortado contra el cielo gris, un tigre con alas de roc se deja caer hacia ustedes. Los rayos le corren por el lomo.'),
  { t: 'choice', prompt: 'El Tigre Alado de las Tormentas baja en picado.', options: [
    { label: 'Plantarle cara y mirarle a los ojos', hint: 'Intimidar CD 16. Si fallás, hay combate.', check: { skill: 'intimidar', dc: 16 }, e: { d: 1, flags: ['tigre_domado', 'nomadas_ayuda'], rep: { nomadas: 2 } }, result: ['El tigre se detiene a un palmo. Los mira. Los huele. Se tumba sobre la piedra con un gruñido de queja. Está dominado, no domado.'], fail: { e: {}, result: ['El tigre ruge y la roca tiembla.'], then: [{ t: 'battle', enc: 'tigre' }] } },
    { label: 'Atacarlo', hint: 'Combate contra el tigre alado.', e: { c: 1 }, result: ['El tigre descubre los colmillos. Las nubes se cierran sobre el pico.'], then: [{ t: 'battle', enc: 'tigre' }] },
  ] },
  N('El tigre, herido, se encorva entre las ruinas del nido. Respira con dificultad. No intenta huir.'),
  { t: 'choice', prompt: '¿Qué hacen con la bestia que cegó al Roc?', options: [
    { label: 'Dominarlo y llevárselo como compañero', hint: 'Un tigre alado combate a su lado.', e: { d: 1, flags: ['tigre_domado', 'nomadas_ayuda'], rep: { nomadas: 2 }, ruta: { pueblo: 1 } }, result: ['El tigre baja la cabeza. Es la primera vez que lo hace ante nadie. Los Nómadas aplauden en silencio.'] },
    { label: 'Matarlo y quedarse con su garra', hint: '+PF. Un trofeo.', e: { c: 1, pf: 6, flags: ['tigre_muerto'], items: { frasco_fuego: 1 } }, result: ['El tigre no se defiende. Murió mirando al cielo del que cayó.'] },
    { label: 'Dejarlo marchar', hint: '+Devoción. El tigre se pierde en las nubes.', e: { d: 2, flags: ['tigre_libre'], rep: { nomadas: 1 } }, result: ['El tigre despliega las alas y se pierde entre las nubes sin mirar atrás.'] },
  ] },
  S('Nómada', 'El Roc vivirá. Los Nómadas recordarán su cara. No es poco.', 'por primera vez, sonríe'),
  FX({ flags: ['q_s_tigre'], rep: { nomadas: 1 } }, 'Misión cumplida: El Nido del Roc.'),
];

const S_CEMENTERIO: Node[] = [
  T('El Cementerio Olvidado', 'Los muertos marchan en formación', 'limbo'),
  N('Las tumbas están alineadas con la precisión de un desfile. Cada lápida tiene el mismo símbolo: un ave quemada. No hay nombres. Nadie en Zaryab sabe quiénes fueron.'),
  S('Romain', 'Kelemvor no los reclamó. Aquí hay un ejército que murió sin que nadie lo anotara en su libro.', 'tocando una lápida'),
  N('Una mano de hueso emerge de la tierra. Luego otra. Los muertos se levantan en filas, con la lentitud de quien nunca dejó de recibir órdenes.'),
  { t: 'battle', enc: 'cementerio' },
  N('Cuando cae el último, en el silencio del campo, un caballero osario se queda de pie, quieto, con la mano sobre el pomo de una espada de hueso. No ataca. Los mira.'),
  S('Caballero Osario', 'No hay guerra. No hay general. No hay… nadie que nos diga cuándo parar.', 'una voz de grava, casi humana'),
  { t: 'choice', prompt: 'El ejército de los muertos olvidados espera una orden.', options: [
    { label: 'Darles descanso con el rito de Kelemvor', hint: 'Romain: +Devoción. Los muertos descansan.', e: { d: 2, flags: ['ejercito_descansa'], rep: { hijos: 1 } }, result: ['Romain recita el rito. Los muertos se sientan uno a uno sobre sus propias tumbas y se deshacen en polvo cálido.'] },
    { label: 'Aceptarlos como ejército del culto', hint: '+5 PF, +5 seguidores, +Corrupción.', e: { c: 2, pf: 5, recruits: 5, follow: ['Caballero Osario'], flags: ['ejercito_culto'], huella: 'Reclutaron a un ejército de muertos olvidados que no habían pedido volver.' }, result: ['El caballero hinca una rodilla. «Una orden, por fin.» Detrás, cien siluetas de hueso hacen lo mismo.'] },
    { label: 'Dejarlos marchando', hint: 'Sin consecuencias. Pero el Conclave los encontrará.', e: { alert: 1 }, result: ['Se alejan. Detrás, los muertos siguen marchando, sin destino.'] },
  ] },
  FX({ flags: ['q_s_cementerio'], rep: { hijos: 0 } }, 'Misión cumplida: El Cementerio Olvidado.'),
];

export const ACT2: QuestDef[] = [
  { id: 's_tigre', title: 'El Nido del Roc', kind: 'side', district: 'pico', giver: 'Nómadas del Vacío', blurb: 'Un tigre alado con alas de roc y el pelaje lleno de rayos ha cegado al Roc de los Nómadas.', when: open('s_tigre', 'q_s_tigre'), days: 2, script: S_TIGRE, reward: 'Compañero: Tigre Alado · Nómadas' },
  { id: 's_cementerio', title: 'El Cementerio Olvidado', kind: 'side', district: 'cementerio', giver: 'Romain', blurb: 'Un campo de tumbas anónimas y un ejército que Zaryab borró de sus libros.', when: open('s_cementerio', 'q_s_cementerio'), days: 2, script: S_CEMENTERIO, reward: '+PF · seguidores muertos o descanso' },
];
