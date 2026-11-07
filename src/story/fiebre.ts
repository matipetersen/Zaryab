// La noche de la fiebre (cierre del Cap. IX) y su cobro en el Cap. XIII.
// Es la decisión que no se deshace: o Zahir entra en Farid, o uno de la compañía le da su aliento y muere para siempre.
// Si Zahir entró, en el Ritual del Eclipse se revela que Farid es el séptimo cuerpo, y alguien tiene que ocupar su lugar… o no.
import type { Node, Opt } from './types';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const BG = (id: string): Node => ({ t: 'bg', id });

export const PCS = ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi'] as const;
export const PC_NAME: Record<string, string> = { romain: 'Romain', pact: 'Pact', rabb: 'Rabb', joren: 'Joren', zyrthar: `Zyr'thar`, panchi: 'Panchi' };

/** Cómo da cada uno su aliento por Farid (Cap. IX). */
const ALIENTO: Record<string, string[]> = {
  romain: [
    `Romain apoya la balanza en el pecho de Farid y la otra mano sobre el suyo. «Kelemvor, una cuenta», dice, «y cerrala vos, que yo ya no la voy a ver». No hay luz ni ruido. Sólo el platillo, que baja despacio hasta tocar la mesa.`,
    `Farid abre los ojos. Romain ya los cerró. Aisha le acomoda el pelo detrás de los cuernos, como a un hijo, y nadie le dice que pare.`,
  ],
  pact: [
    `Pact se arrodilla junto a la mesa. «Ya caí una vez», le dice a Farid, que no lo oye. «La segunda es más fácil.» Se saca el aliento del pecho como quien se saca una capa y se lo pone al niño encima.`,
    `Las alas se apagan primero. Después, el resto. Farid respira. Pact no. Joren lo sostiene para que no caiga de costado, porque no hay nada más que hacer y alguien tiene que hacer algo.`,
  ],
  rabb: [
    `Rabb deja la espada sobre la mesa, lejos, con la hoja hacia la pared. «Que no mire», dice. Después toma la mano de Farid. «Yo no sé quién soy. Él sí sabe quién es. Es mejor negocio.»`,
    `Cuando se apaga, la espada grita una sola vez, como un perro que pierde al dueño. Farid se despierta con ese grito y pregunta quién lloraba. Nadie le contesta.`,
  ],
  joren: [
    `Joren no pide permiso. Nunca lo pidió. Le apoya a Farid la frente contra la suya y le dice algo que nadie más oye: el nombre de su hermano, quizás, o el de alguien de La Marca.`,
    `«Esta vez llegué a tiempo», dice, y se recuesta contra la pata de la mesa como si fuera a dormir. Farid se sienta de golpe, con un grito. Joren ya no cuenta a nadie.`,
  ],
  zyrthar: [
    `Zyr'thar se ríe bajito, como si alguien hubiera contado un chiste malo. «Qué poco elegante», dice. «Morir por un chico del Bajo. En casa no me lo perdonarían.» Le pone dos dedos en la frente a Farid y empuja algo hacia adentro.`,
    `Su sombra se queda un rato en la pared después de que ella se va. Después se va también. Farid abre los ojos y lo primero que dice es: «La señora de pelo blanco me pidió que no le contara a nadie».`,
  ],
  panchi: [
    `Panchi se cruje los nudillos, uno por uno. «Bueno», dice. «Alguien tiene que ganar esta.» Le apoya a Farid la palma abierta sobre el pecho: es la primera vez que lo ven pelear con la mano abierta.`,
    `Respira tres veces, hondo, como le enseñaron en el monasterio. A la tercera, el que respira es Farid. Panchi se ríe una sola vez y se queda así, con la sonrisa puesta.`,
  ],
};

const aliento = (pc: string): Opt => ({
  label: `${PC_NAME[pc]} le da su aliento`, hint: `${PC_NAME[pc]} muere. Para siempre.`, alive: pc,
  e: { d: 2, dead: [pc], flags: ['farid_aliento', `perma_${pc}`], huella: `${PC_NAME[pc]} dio su vida por Farid la noche de la fiebre.` },
  result: ALIENTO[pc],
});

export const FIEBRE: Node[] = [
  BG('choza'),
  N(`Vuelven al Bajo pasada la medianoche. Hay luz en la biblioteca, demasiada, y voces que no deberían estar despiertas a esa hora.`),
  N(`Farid arde. Aisha lo tiene en brazos sobre la mesa larga de la cena, entre los platos sin levantar, y le habla al oído como se le habla a alguien que se está yendo: con cosas chiquitas, el nombre del perro, el pan de mañana. El niño no contesta. Tiene los labios grises y los ojos abiertos hacia el techo.`),
  S('Aisha', `Se apagó así, de golpe. Estaba cantando y se apagó. Hagan algo. Ustedes volvieron de la muerte, ¿no? Enséñenle.`, 'sin levantar la cabeza'),
  S('Romain', `El corazón todavía late. Lejos. Como alguien que golpea una puerta desde la otra punta de la casa.`, 'con dos dedos en el cuello del niño'),
  BG('limbo'),
  S('Zahir', `Puedo sostenerlo.`, 'muy bajo; es la primera vez que no espera a que le pregunten'),
  S('Zahir', `No es un milagro. Es lo que hice con ustedes en el desierto: entro un poco, sostengo desde adentro lo que se cae, y cuando él pueda solo, me corro. Lo hice seis veces. Sé hacerlo.`, 'con una paciencia que nunca le habían oído'),
  S('Zahir', `Pero tienen que dejarme. No entro donde no me abren.`, 'mirando a Aisha, no a ustedes'),
  S('Aisha', `Que entre. Que entre lo que sea.`, 'apretando a Farid contra el pecho'),
  S('Pact Risen', `La última vez que alguien me sostuvo desde adentro, tardé un siglo en saber dónde terminaba él y empezaba yo.`, 'sin mirar a nadie'),
  S('Romain', `Hay otra cuenta posible. Kelemvor la permite: un aliento que se va por uno que se queda. No es un milagro. Es un trueque, y no tiene vuelta.`, 'la balanza envuelta en el paño, todavía'),
  { t: 'choice', prompt: 'Farid se va. Hay dos maneras de retenerlo, y ninguna es gratis. Lo que elijan esta noche no se deshace.', options: [
    { label: 'Dejar que Zahir lo sostenga', hint: 'Aisha lo pidió.', e: { d: 1, flags: ['farid_zahir'], huella: 'Dejaron que Zahir sostuviera a Farid desde adentro.' }, result: [
      `Zahir entra en el niño como entra la luz por una persiana: de a poco, en franjas. Farid tose una vez y después llora, con el llanto furioso de los que vuelven. Aisha llora con él.`,
      `Esa noche Zahir no habla. Por la mañana, Farid cuenta que soñó con un pájaro que lo llevaba en la espalda y que no tuvo miedo. Aisha besa el cristal de cada uno de ustedes, uno por uno, sin pedir permiso. Nunca la vieron tan feliz.`,
    ] },
    ...PCS.map(aliento),
  ] },
  N(`Amanece sobre el Bajo. Alguien levanta los platos de la mesa. Alguien barre. Afuera, la ciudad no se enteró de nada.`),
];

/** Lo que dice Zahir según cómo terminó la noche de la fiebre (antes de pedir a nadie que lo perdone). */
const OCUPA: Record<string, string> = {
  romain: `Romain entra al círculo con la balanza en la mano. «Una cuenta más, Kelemvor. La última.» El dorado sale de Farid como el agua de un vaso que se inclina, y entra en él. Arriba, el niño se despierta llorando, y es su propio llanto.`,
  pact: `Pact abre las alas y se pone en el centro. «Yo ya tuve a alguien adentro. Sé convivir.» Zahir duda, apenas, antes de mudarse. Arriba, Farid deja de cantar.`,
  rabb: `Rabb se ríe. «Tengo huecos de sobra. Pasá.» La espada intenta impedirlo; él la suelta. Arriba, Farid pide pan con su voz de siempre.`,
  joren: `Joren deja el arco en el suelo. «Al chico no.» No dice más. Nunca dijo más. Arriba, la lámpara de Farid vuelve a encenderse.`,
  zyrthar: `Zyr'thar se sacude el polvo de la manga. «Siempre quise que alguien me habitara. Qué decepción que seas vos.» Arriba, Farid se ríe dormido.`,
  panchi: `Panchi abre la mano, por segunda vez en su vida. «Vení. Pero te aviso que adentro hay mucho ruido.» Arriba, Farid estornuda, y Aisha se ríe de puro alivio.`,
};
const ocupa = (pc: string): Opt => ({
  label: `${PC_NAME[pc]} ocupa el lugar de Farid`, hint: `${PC_NAME[pc]} no vuelve.`, alive: pc,
  e: { d: 2, dead: [pc], flags: ['farid_libre', `perma_${pc}`, 'sacrificio_farid'] }, result: [OCUPA[pc]],
});

export const SEPTIMO: Node[] = [
  { t: 'if', flag: 'farid_zahir', then: [
    S('Zahir', `Seis cristales di en el desierto. El séptimo me lo abrieron ustedes, una noche de fiebre, sobre una mesa con platos sucios. Me pidieron que lo sostuviera. Lo sostengo todavía.`, 'con la misma ternura de aquella noche, que ahora da miedo'),
    N(`Arriba, en la biblioteca, Farid deja de cantar a mitad de una nota. Aisha levanta la cabeza del pan.`),
    S('Zahir', `No le va a doler. Nunca les dolió a ustedes, ¿o sí?`, 'casi ofendido'),
    { t: 'choice', prompt: 'Zahir tiene a Farid por dentro. Para sacarlo, alguien tiene que ocupar su lugar.', options: [
      ...PCS.map(ocupa),
      { label: 'No hay otra manera', hint: 'Farid se queda con Zahir adentro.', e: { c: 2, flags: ['farid_tomado'], huella: 'Dejaron a Farid como el séptimo cuerpo de Zahir.' }, result: [`Nadie se mueve. Zahir asiente, despacio, como quien recibe un regalo que ya sabía que le iban a dar. Arriba, Farid vuelve a cantar, con una voz que no es la suya.`] },
    ] },
  ], else: [
    { t: 'if', flag: 'farid_aliento', then: [
      S('Zahir', `Iban a ser siete. Uno de ustedes le regaló su aliento a un chico del Bajo y me dejó con seis. Nunca me ganaron una cuenta con tanta torpeza. Y nunca la respeté tanto.`, 'mirando el lugar vacío del círculo'),
    ] },
  ] },
];

/** Epílogo de Farid (va antes de los finales). */
export const FARID_EPI: Node[] = [
  { t: 'if', flag: 'farid_tomado', then: [N(`Farid vive. Camina, come, se ríe. Pero de noche canta con una voz que no es la suya, y las lámparas del barrio se apagan cuando lo hace. Aisha le deja la puerta abierta igual, por si algún día vuelve el que era.`)] },
  { t: 'if', flag: 'farid_libre', then: [N(`Farid crece. No recuerda el pájaro, ni la fiebre, ni a quien ocupó su lugar. Aisha sí. Cada noche pone un plato de más en la mesa larga, y nadie le pregunta para quién.`)] },
  { t: 'if', flag: 'farid_aliento', then: [N(`Farid crece con un aliento prestado. Cuando corre, a veces se para de golpe y se toca el pecho, como si alguien adentro le hubiera dicho «más despacio». Aisha le enseñó el nombre de quien se lo dio. Lo dice antes de dormir.`)] },
];
