import { RESURRECCION } from './arquetipos';
import { X_MAZHAR_TOMO, X_MAZHAR_OPT, XI_SIMBOLO, XII_KETHRAS, XII_ROMAIN_OPT, XII_CYRIC } from './integra';
import type { Node } from './types';
import type { Effect } from '../state';
import { EPILOGUE } from './endings';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const BG = (id: string): Node => ({ t: 'bg', id });

export { CAP7, CAP8 } from './act2a';
export { CAP9, CAP10 } from './act2b';

export { CAP11, CAP12 } from './act3a';

// ═══════════════════════════ CAP. XIII — EL RITUAL DEL ECLIPSE ═══════════════════════════
export const CAP13: Node[] = [
  T('Capítulo XIII — El Ritual del Eclipse', 'Catacumbas del Simurg · los Huesos del Pacto', 'limbo'),
  N('Las Catacumbas del Simurg están bajo la biblioteca. Siempre estuvieron. Los pasillos huelen a incienso viejo y a arena mojada. En la cámara central, siete pedestales rodean un círculo de piedra tallada con espirales fracturadas, las mismas del desierto.'),
  S('Zahir', 'Gracias por traerme todos. Les dije: el Simurg los eligió. No fue casualidad. Fue destino.', 'sin forma humana, solo una silueta de plumas'),
  IF('frag_dahhak', [N('Un pedestal acoge el fragmento de Dahhak. Pulsa con el eco de cien voces.')]),
  IF('frag_marid', [N('Otro pedestal acoge el fragmento del Marid. Gotea sin parar.')]),
  IF('frag_mazhar', [N('El fragmento de Al-Mazhar late como una nana.')]),
  IF('frag_gusano', [N('El fragmento de Gul-Amarat está tan callado que duele.')]),
  IF('frag_razul', [N('El fragmento de Razul pesa más que el resto.')]),
  IF('frag_dahhak_roto', [N('El pedestal de Dahhak está vacío. Pact lo mira un largo rato: ese hueco lo hicieron ellos.')]),
  IF('frag_marid_roto', [N('Del pedestal del Marid cae una gota de agua limpia, cada tanto. Zyr\'thar la oye caer y no dice nada.')]),
  IF('frag_mazhar_roto', [N('En el pedestal de Al-Mazhar solo queda ceniza. Aisha, arriba, canta bajito. Aquí abajo se oye apenas.')]),
  IF('frag_gusano_roto', [N('El pedestal de Gul-Amarat es una piedra lisa. Samira apoya la mano en ella al pasar, como en una lápida.')]),
  IF('frag_razul_roto', [N('Donde iba el fragmento de Razul hay una silla de piedra. Nadie se atreve a sentarse.')]),
  IF('frag_dahhak_roto', [S('Zahir', 'Sentí romperse a Dahhak. Fue como perder un diente. No les reprocho nada: sólo digo que cada hueco que dejaron es un lugar donde ahora estoy más solo.', 'con la voz más débil que nunca')]),
  S('Zahir', 'La verdad. Que no les dije. El Simurg no fue dividido. Se dividió. Y yo soy sólo uno de los fragmentos. El primero que despertó. El más hambriento.', 'las plumas caen como ceniza'),
  IF('voz_simurg', [S('Zahir', 'Han oído su grito en la Ciudadela. Sí. Aquel soy yo. Aquel fui. Y sigo gritando.', 'sin mirar a nadie')]),
  IF('zahir_promesa', [S('Zahir', 'Les prometí a Farid sano, la corona perdonada, el nombre de Rabb. Lo sigo prometiendo. Es verdad. No es toda la verdad.', 'con una mano abierta')]),
  IF('zahir_regalo_1', [S('Zahir', 'Les di el nombre de Mirabel. Fue un regalo. También fue un cebo.', 'con una media sonrisa triste')]),
  S('Zahir', 'El ritual del Eclipse unirá los fragmentos. El Simurg volverá a ser uno. Pero para eso necesito un cuerpo. Y ustedes me dieron siete.', 'sin pudor'),
  { t: 'choice', prompt: 'Es el momento de decidir el destino de Zaryab.', options: [
    { label: 'Unir los fragmentos y liberar al Simurg', hint: 'Requiere Devoción ≥ 7 y Sello ≤ 30.', if: 'puede_liberar', e: { d: 2, flags: ['final_liberar'] }, result: ['Los fragmentos se alzan de los pedestales y giran. Zahir grita de rabia: no estaba en el plan.'] },
    { label: 'Dejar que Zahir se una a los fragmentos', hint: 'Zahir gobernará. Corrupción ≥ 7.', if: 'puede_gobernar', e: { c: 2, flags: ['final_gobernar'] }, result: ['Zahir ríe. Es la primera vez que se le oye feliz.'] },
    { label: 'Entregarle todo sin preguntar', hint: 'La Espiral. El Sello se llena.', if: 'puede_espiral', e: { c: 3, flags: ['final_espiral'] }, result: ['Entregan los fragmentos uno a uno. Zahir los toma con manos de humo. Su sonrisa se ensancha.'] },
    { label: 'Destruir los fragmentos', hint: 'Zaryab sobrevive. Con culpa.', e: { d: 1, flags: ['final_destruir'] }, result: ['Los fragmentos se parten bajo sus manos. Un grito sin voz recorre las catacumbas.'] },
    { label: 'Enterrarlos y dejar que Zaryab decida sola', hint: 'El Silencio. Los dioses se retiran.', if: 'puede_silencio', e: { d: 1, flags: ['final_silencio'] }, result: ['Cierran el círculo de piedra con arena y silencio. Zahir los mira, y por primera vez no habla.'] },
    { label: 'Mantener el equilibrio entre fe y corrupción', hint: 'Requiere Corrupción y Devoción entre 4 y 6.', if: 'puede_equilibrio', e: { flags: ['final_equilibrio'] }, result: ['Los fragmentos se aquietan. Zahir los mira con algo parecido a respeto.'] },
  ] },
  IF('mz_seraphel_libre', [S('Seraphel', 'Me dijeron que me liberaran para algo. Aquí estoy. No sé qué puedo hacer, pero aquí estoy.', 'entrando por una escalera lateral con las manos vendadas')]),
  IF('samira_confia', [S('Capitana Samira', 'La Guardia está contenida arriba. Tienen lo que tarden en dar la alarma. No es mucho.', 'con una espada de mano')]),
  IF('razul_aliado', [S('Vizir Razul', 'Ya lo han visto. Me quedan fuerzas para un último trabajo. Que sea éste.', 'bajando del último escalón, con el bastón en alto')]),
  IF('ellie_sabe', [S('Sifra (Ellie)', 'Panchi. ¿Lo trajiste?', 'a un paso de él, sin mirarle')]),
  IF('ellie_sabe', [{ t: 'choice', prompt: 'Panchi tiene delante lo que Ellie le pidió: «Traelo». Es su rabia.', options: [
    { label: 'Cerrar el puño', hint: 'Golpear a Zahir con todo.', e: { c: 1, flags: ['panchi_cierra'] }, result: ['Panchi cierra el puño. Es el golpe más lento y más preciso de su vida.'] },
    { label: 'Abrir la mano', hint: 'Perdonar.', e: { d: 1, flags: ['panchi_perdona'] }, result: ['Panchi abre la mano, y por un instante no hay ira en ella.'] },
    { label: 'Guardar la rabia para después', e: { flags: ['panchi_guarda'] }, result: ['Panchi sonríe con medio labio. «Todavía no. Lo necesito.»'] },
  ] }]),
  IF('ellie_sabe', [{ t: 'choice', prompt: 'Sifra la Silente aparece de la nada, con la venda de lino en la muñeca. Hay un instante, uno sólo, en que Zahir cree haber ganado.', options: [
    { label: 'Dejar que Zahir crea que ha ganado… y usar la venda de Ellie', hint: 'El Pacto Roto: Zahir queda sin su máscara de dios.', e: { d: 2, flags: ['pacto_roto'] }, result: ['Zahir abre los brazos. «Han venido. Lo han traído todo.» Es entonces cuando Ellie levanta la mano. La venda de lino se enciende como una cuerda de alambre. «Ahora.» Zahir se queda con la boca abierta.'] },
    { label: 'Ignorar a Ellie', e: {}, result: ['Ellie baja la mano. Los mira. No dice nada. Se desvanece.'] },
  ] }]),
  S('Azuran', 'Pact. Soy yo. El que fuiste. El que serás. Tengo una corona y no sé si quiero seguir llevándola.', 'una voz dorada, dentro de la cabeza de Pact'),
  { t: 'choice', prompt: 'El Segundo Aliento de Pact: ¿qué hace con la corona de fuego invertido?', options: [
    { label: 'Rendir la corona: vivir como humano', hint: 'Pierde las alas y gana una vida.', e: { d: 1, flags: ['pact_rinde'] }, result: ['La corona se apaga entre sus manos. Pact exhala, como alguien que suelta una carga. Las alas no vuelven a salir. Sonríe.'] },
    { label: 'Asumir la corona: ángel de la verdad', hint: 'Azuran y Pact, juntos.', e: { c: 1, flags: ['pact_asume'] }, result: ['Pact se pone la corona. Una sola vez, el eclipse se llena de luz. Una voz doble, la suya y la de Azuran, dice: «Ahora sí.»'] },
  ] },
  S('Rabb Locke', 'La espada me susurra otra vez. Dice que hay un contrato nuevo. Que puedo reescribirme. Que ya no habrá huecos.', 'con la mano en la empuñadura'),
  { t: 'choice', prompt: 'El Reescribir de Rabb: tres formas de acabar con el pacto que no recuerda haber firmado.', options: [
    { label: 'Dejar que lo reescriban', hint: 'Memoria completa, pero ajena.', e: { c: 1, flags: ['rabb_reescribe'] }, result: ['La espada vibra. Los huecos se llenan. Rabb abre los ojos con una cara que no es la suya y que es suya.'] },
    { label: 'Firmar un contrato nuevo con el Simurg', hint: 'Sin olvido.', e: { d: 1, flags: ['rabb_firma'] }, result: ['Rabb firma con su propio nombre, el que se inventó. La espada se queda muda, y luego, muy bajito, repite el nombre.'] },
    { label: 'Romper el pacto', hint: 'Sólo con la clave de Ellie.', if: 'ellie_sabe', e: { d: 2, flags: ['rabb_rompe'] }, result: ['La espada se deshace en ceniza gris. Rabb sostiene una empuñadura vacía. Es la primera vez que se queda sin voz ajena. Llora, aunque no sabe por qué.'] },
  ] },
  ...RESURRECCION,
  IF('sacrificio_elegido', [N('Y, desde algún rincón de las catacumbas, la puerta de la mina se cierra otra vez. Hay un precio que no se olvida.')]),
  N('Zahir abre las alas. Son de fuego y de mentira. El eclipse cae sobre la cámara y apaga las antorchas. Cuando se enciende otra vez, Zahir no es una silueta: es un ave del tamaño de un templo.'),
  S('Zahir', 'Yo soy el Simurg. Todos los demás sólo fueron pájaros.', 'una voz que viene de todas partes'),
  { t: 'battle', enc: 'eclipse' },
  N('El Simurg del Eclipse se desploma entre llamas doradas. Las plumas flotan como ceniza luminosa, y una por una se apagan. Lo que queda es una figura alta y andrógina, con ropajes de plumas rotas.'),
  S('Zahir', 'No sé si gané o perdí. Pero ha sido bonito ser un dios, aunque fuera un momento.', 'casi sin voz'),
  FX({ flags: ['cap13_done'] }, 'El Ritual del Eclipse ha terminado.'),
  ...EPILOGUE,
];
