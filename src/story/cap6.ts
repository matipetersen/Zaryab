import type { Node, Opt } from './types';
import type { Effect } from '../state';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });

/** Las tres maneras de recibir al muerto que respira (se repiten si Joren no logra leerlo). */
const JOREN_OPTS: Opt[] = [
    { label: 'Dejar que Joren hable con él a solas', hint: 'Sólo le pertenece a Joren.', e: { d: 1, flags: ['joren_perdon_ruta'] }, result: ['Se alejan. Cuando vuelven a mirar, Joren está sentado en el suelo y el hombre vendado le sirve agua. Ninguno habla. Es la conversación más larga que le han visto.'] },
    { label: 'Interrogarlo ustedes: ¿quién lo vendió?', hint: 'Intimidar CD 14: respuestas rápidas, sin consuelo.', check: { skill: 'intimidar', dc: 14 }, e: { c: 1, flags: ['joren_culpable_pista'] }, result: ['«Fue el Vizir. Fue Razul. Me dieron por muerto para usarme como moneda», confiesa. Joren no dice nada. Su arco baja un dedo.'], fail: { e: { d: -1 }, result: ['El hombre vendado calla, y su silencio los acusa a ustedes. Joren se aparta de todos.'] } },
    { label: 'Matarlo: es una amenaza para el culto', hint: 'Lo que sabe puede hundirnos a todos.', e: { c: 3, flags: ['joren_traicionado'], huella: 'Mataron a un hombre que Joren creía muerto y que sólo quería ver a su amigo.' }, result: ['Nadie lo detiene. Joren no les dirige la palabra durante tres días.'] },
];

/** Acto II · Capítulo VI — La Guerra Civil: Medinat al-Rih. Tres entradas según la Postura del Cap. V. */
export const CAP6: Node[] = [
  { t: 'chapter', title: 'Capítulo VI — La Guerra Civil', sub: 'Medinat al-Rih · la ciudad de los olvidados', bg: 'medinat' },
  N('Medinat al-Rih no está en ningún mapa del Conclave. Es una ciudad de adobe y velas torcidas, construida por quienes Zaryab quiso olvidar: los Nasnas deformes, los que no pasaron las pruebas, los hijos de nadie. Hoy sus calles huelen a pólvora y a aceite quemado.'),
  IF('postura_orden', [
    N('Entran escoltados por una columna de Qilaat. Las puertas se cierran detrás de ustedes con un chasquido de bronce. Cada ventana se apaga a su paso: aquí no son libertadores, son el brazo del Vizir.'),
    S('Líder Nasnas', '¿Vienen a ordenarnos que bajemos las armas, o a vernos arder? Los Qilaat de Razul no saben distinguir.', 'desde una barricada, sin bajar la lanza'),
  ], [
    IF('postura_pueblo', [
      N('Entran a la cabeza de una larga fila de refugiados de Zaryab: familias, ancianos, artesanos con herramientas al hombro. Los Nasnas bajan las armas al ver a Shib y a los Hijos del Simurg. Alguien grita su nombre desde un tejado.'),
      S('Líder Nasnas', 'Dijeron que vendrían. No creía que Zaryab nos mandara a nadie vivo.', 'con un ojo de menos y la voz de un viejo'),
    ], [
      N('Entran solos, por una puerta lateral comprada con el oro de Dahhak. Nadie los espera y nadie los conoce. Un niño los sigue durante tres calles y desaparece sin una palabra. En una pared, alguien ha escrito con carbón: «NO HAY DIOSES PARA LOS DEFORMES».'),
      S('Líder Nasnas', 'Son los que Dahhak envió. Muy bien: demuestren que son algo más que su dinero.', 'sin acercarse'),
    ]),
  ]),
  { t: 'say', who: 'Zahir (Caído)', text: 'Aquí el cristal pesa distinto. Medinat al-Rih recuerda a un dios que ya no es suyo. Vayan con cuidado: a un pueblo olvidado no se le promete nada que no pueda cobrar.', tone: 'la voz llega con retraso, como un eco' },

  // ───── La revuelta ─────
  N('Antes de que lleguen al centro, un tumulto estalla en la plaza. Una barricada de puestos del mercado cierra la calle; detrás, los Nasnas; delante, quienes vienen a aplastarlos. No hay tiempo para esperar a que alguien decida por ustedes.'),
  { t: 'choice', prompt: 'La Plaza de los Olvidados arde en tres frentes. ¿Qué hacen?', options: [
    { label: 'Romper la barricada y reprimir la revuelta', hint: 'Orden: Razul lo sabrá y lo agradecerá.', if: 'postura_orden', e: { ruta: { orden: 2 }, rep: { qilaat: 1, nomadas: -1 }, alert: -1 }, result: ['Los Nasnas caen o huyen. Un niño los mira desde una ventana, sin odio. Eso es lo peor.'], then: [{ t: 'battle', enc: 'revuelta_orden' }] },
    { label: 'Interponerse entre los Qilaat y los vecinos', hint: 'Pueblo: Medinat les abrirá sus puertas, los Qilaat no.', if: 'postura_pueblo', e: { d: 1, ruta: { pueblo: 2 }, rep: { qilaat: -1, hijos: 1, nomadas: 1 } }, result: ['«Protocolo de contención», repite el Qilaat. La plaza se llena de refugiados. El vapor sube en columnas.'], then: [{ t: 'battle', enc: 'revuelta_pueblo' }] },
    { label: 'Dejar que la plaza se desangre y ofrecer sus servicios al que gane', hint: 'Sombra: mercenarios de Dahhak midiéndose con ustedes.', if: 'postura_sombra', e: { c: 1, ruta: { sombra: 2 }, rep: { dahhak: 1 } }, result: ['Los mercenarios salen de entre el humo con cuchillos de mercurio.'], then: [{ t: 'battle', enc: 'revuelta_sombra' }] },
    { label: 'Hacer lo que haría la Postura contraria', hint: 'Cambiar de bando a mitad de camino. Tendrá un precio.', e: { c: 1, d: -1, alert: 1 }, result: ['Nadie sabe de qué lado están. Los dos bandos se vuelven contra ustedes a la vez.'], then: [{ t: 'battle', enc: 'revuelta_sombra' }] },
    { label: 'Pact: subirse a la barricada y hacerse oír por los dos bandos (Intimidar)', hint: 'Una voz de juicio, como las que usaba Azuran. Si no se impone, los dos bandos se le echan encima.', check: { skill: 'intimidar', dc: 15, pc: 'pact' }, e: { d: 1, ruta: { pueblo: 1 }, rep: { nomadas: 1 } }, result: ['Pact trepa a la barricada y abre las alas, pálidas, sucias de hollín. No grita: habla, y la voz le sale doble, la suya y otra más vieja. «Basta.» Los Qilaat bajan las lanzas un palmo. Los Nasnas, otro. Nadie sabe quién empezó a bajarlas primero, y eso alcanza.', 'La plaza no se salva entera, pero nadie más muere en ella esta tarde.'], fail: { e: { c: 1, alert: 1 }, result: ['A Pact se le quiebra la voz en la segunda palabra. Un Nasnas le tira una piedra; un Qilaat lo apunta. De pronto los dos bandos tienen un enemigo en común, y es él.'], then: [{ t: 'battle', enc: 'revuelta_sombra' }] } },
  ] },
  N('El humo se levanta. La barricada es una ruina. Los vecinos de Medinat salen de sus casas con paso corto, mirando lo que queda.'),
  { t: 'choice', prompt: 'El Líder Nasnas les pregunta qué quieren a cambio.', options: [
    { label: 'Oro y víveres para el santuario', hint: '+PO, el culto crece.', e: { gold: 120, food: 3, ruta: { sombra: 1 }, rep: { nomadas: 0 } }, result: ['Un saco de cebada y monedas de plata de ley. «No es mucho», dice. «Es lo que tenemos.»'] },
    { label: 'Nada. Que nos recuerden', hint: 'Fe sin precio.', e: { d: 1, recruits: 2, ruta: { pueblo: 1 } }, result: ['Dos Nasnas, jóvenes y sin dinero, piden unirse al culto del Simurg sin que se lo ofrezcan.'] },
    { label: 'La palabra de Medinat: aliados cuando llegue el Eclipse', hint: 'Una promesa vale más que un saco.', e: { ruta: { orden: 1 }, flags: ['medinat_aliado'], rep: { hijos: 1 } }, result: ['«Cuando llegue el Eclipse, Medinat saldrá a la calle con ustedes.» Lo dice mirándolos a los ojos.'] },
  ] },

  // ───── Joren ─────
  { t: 'bg', id: 'bajo' },
  N('Al caer la tarde, en un callejón de Medinat, Joren se detiene tan de golpe que Rabb choca contra su espalda. Una figura envuelta en vendas grises sale de una puerta sin quicio, con un cubo de agua en cada mano. Camina como quien lleva demasiado tiempo caminando.'),
  S('El Muerto que Respira', 'Joren… Joren Hell. Te dije que no volvieras. Te dije que lo dejaras estar.', 'sin soltar los cubos'),
  S('Joren Hell', 'Te enterré. Yo mismo te enterré.', 'la voz le tiembla, por primera vez en toda la campaña'),
  IF('marca_contrasena', [
    S('Joren Hell', 'Diente partido, agua en la mano.', 'la contraseña de La Marca, en voz baja'),
    S('El Muerto que Respira', '…y sangre en el papel. Todavía te la acordás.', 'y, por primera vez, deja los cubos en el suelo'),
  ]),
  { t: 'choice', prompt: 'Joren tiene el arco cargado y no sabe a quién apunta.', options: [
    { label: 'Joren: buscar bajo las vendas lo que el hombre esconde (Percepción)', hint: 'Joren conoce cada cicatriz de La Marca; si no está, mira otro. Si falla, el hombre casi se le escapa.', check: { skill: 'percepcion', dc: 14, pc: 'joren' }, e: { d: 1, flags: ['joren_perdon_ruta', 'joren_culpable_pista'] }, result: ['Joren no mira la cara: mira la muñeca. Debajo de la venda, donde los de La Marca se tatuaban el diente partido, hay otra cosa encima: un sello del Conclave, quemado a hierro. «No te vendiste», dice Joren. «Te compraron.»', 'El hombre vendado deja los cubos en el suelo, por fin. «Fue Razul. Me dieron por muerto para usarme como moneda.» Joren baja el arco y se sienta a su lado sin pedir permiso.'], fail: { e: { d: -1 }, result: ['Joren se acerca demasiado rápido y el hombre retrocede hasta la pared, con los cubos derramándose. «No me mires así. Así me miraban ellos.» Por un momento parece que va a huir por la puerta sin quicio.'], then: [{ t: 'choice', prompt: 'El hombre vendado no se fue. Todavía.', options: JOREN_OPTS }] } },
    ...JOREN_OPTS,
  ] },

  // ───── Torneo ─────
  { t: 'chapter', title: 'El Torneo de los Puños Cerrados', sub: 'Medinat al-Rih · la arena', bg: 'coliseo' },
  N('Esa noche Medinat celebra, como celebra siempre cuando algo ha acabado: con puños. El Torneo de los Puños Cerrados se disputa a un solo combate por noche, a primera sangre o a primera rendición. Quien lo gana recibe un secreto que no está en venta.'),
  S('Panchi', 'Me dijeron que hay una luchadora que no habla. Que vence a todos y que nadie recuerda cómo.', 'con los nudillos ya vendados'),
  { t: 'choice', prompt: 'Panchi no necesita permiso para pelear. Pero ustedes pueden hacer algo más que mirar.', options: [
    { label: 'Apostar por Panchi', hint: 'Cuesta 60 PO. Si pierde, no lo recuperan.', e: { gold: -60, flags: ['apostaste_panchi'] }, result: ['El corredor de apuestas se ríe, pero no devuelve la moneda.'] },
    { label: 'Sabotear la arena', hint: 'Sigilo CD 15. Una trampa menos en la jaula.', check: { skill: 'sigilo', dc: 15 }, e: { flags: ['arena_saboteada'], c: 1 }, result: ['Aflojan una cuerda. Cuando Panchi pisa la jaula, algo cruje: un viejo mecanismo, desmontado.'], fail: { e: { alert: 1 }, result: ['Un guardia los ve. No dice nada, pero toma nota.'] } },
    { label: 'Panchi: calentar con las katas del monasterio y estudiar la guardia de Sifra (Atletismo)', hint: 'Es su pelea. Si sale bien, entra a la jaula entero y con un plan.', check: { skill: 'atletismo', dc: 15, pc: 'panchi' }, e: { d: 1, flags: ['torneo_digno'] }, result: ['Panchi hace las cuarenta katas de la mañana en un rincón de la arena, despacio, como le enseñaron, mientras mira calentar a Sifra. Ella apoya siempre el peso en el pie izquierdo antes de girar. Una costumbre. Una puerta.', 'Cuando entra en la jaula, Panchi ya sabe que va a perder. Pero sabe también dónde le va a doler a ella.'], fail: { e: { d: -1 }, result: ['A la mitad de las katas se le sube la rabia y las hace demasiado rápido. Algo cruje en el hombro. Panchi se lo venda él mismo, apretando los dientes, y entra en la jaula con un brazo que no termina de cerrarse.'] } },
    { label: 'Sólo mirar', hint: 'Respetar el combate.', e: { d: 1 }, result: ['Se sientan en la grada con el resto del barrio.'] },
  ] },
  { t: 'say', who: 'Sifra', text: '…', tone: 'sin palabras; se quita la capucha con una sola mano' },
  N('Sifra la Silente es alta, de hombros anchos, con cicatrices de quemadura que le suben desde el cuello hasta la oreja. No habla. Cuando se coloca en guardia, todos los murmullos de la arena se apagan a la vez.'),
  { t: 'battle', enc: 'torneo', soft: true },
  N('Panchi cae de rodillas. Sifra no remata. Retrocede un paso, cierra el puño, lo abre. Es la señal de que ha terminado.'),
  IF('torneo_digno', [
    N('Pero antes de irse mira a Panchi con algo que no es desprecio. Es la mirada que se le da a alguien que casi llega.'),
    S('Sifra (Ellie)', 'Sos bueno. Lo suficiente para que me duela. Pocos pueden decir eso.', 'por primera vez, en voz baja y áspera, con acento de las Tierras del Sur'),
  ], [
    S('Sifra (Ellie)', 'Todavía no.', 'una sola frase, sin mirarlo'),
  ]),
  S('Sifra (Ellie)', 'Me llaman Sifra. Antes me llamaba Ellie. Si alguien te pregunta por un pacto que no se puede romper, decile que conozco a quien sabe.', 'dejando caer una venda de lino sobre el suelo, junto a Panchi'),
  S('Sifra (Ellie)', 'Traelo. O no vengas.', 'ya de espaldas'),
  FX({ items: { venda_ellie: 1 }, flags: ['conoce_ellie', 'torneo_perdido'], d: 0 }, 'Panchi pierde el combate y recibe la Venda de Ellie. Ellie sabe romper pactos.'),

  // ───── Cierre ─────
  { t: 'bg', id: 'limbo' },
  S('Zahir (Caído)', 'Ya han visto lo que Medinat guarda. Un pueblo que no necesita a ningún dios. Los odiará si se acercan demasiado… y los adorará si se alejan lo justo.', 'el cristal late más despacio'),
  S('Zahir (Caído)', 'Dahhak se esconde en la Iglesia del Simurg, al oeste. Las Si\'lats los guiarán. Y Pact… Pact tendrá que enfrentarse a lo que no recuerda.', 'una pausa demasiado larga'),
  N('Medinat al-Rih se queda atrás, un resplandor naranja en el horizonte. Detrás de ustedes, la ciudad que nadie quiso decide cómo sobrevivir sin ustedes.'),
  FX({ flags: ['cap6_done'], rep: { nomadas: 1 } }, 'Capítulo VI completado. La Iglesia del Simurg espera.'),
];
