import type { Node } from './types';
import type { Effect } from '../state';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });

/** Polos de arquetipo por personaje: `arq[pc] > 0` es el polo A, `< 0` el B. Alimentan el Cap. XIII y el epílogo. */
export const POLOS: Record<string, [string, string]> = {
  romain: ['el Juez compasivo', 'el Verdugo'], pact: ['el Redentor', 'el Tirano'], rabb: ['el Autor de sí mismo', 'la Herramienta'],
  joren: ['el Protector', 'el Cazador'], zyrthar: ['la Guardiana', 'la Sombra'], panchi: ['el Maestro', 'la Llama'],
};
const a = (pc: string, n = 1): Effect => ({ arq: { [pc]: n } });
const b = (pc: string, n = 1): Effect => ({ arq: { [pc]: -n } });

/**
 * Historias de arquetipo (viaje del héroe): escenas cortas con elecciones que se juegan una vez al cerrar el capítulo.
 * Cada una mueve el polo A o B de algún personaje y deja una bandera que cambia lo que viene después.
 */
export const ARQ: Record<string, Node[]> = {
  // ── Mentor: Nadir ──
  cap2: [
    T('El Mentor que no era', 'Nadir, en el Bajo', 'bajo'),
    N('Nadir los espera en una esquina con un odre de agua y la cara de quien lleva todo el día ensayando una frase. Los trajo hasta Zaryab. Nunca dijo por qué conocía tan bien el camino a los pilares.'),
    S('Nadir', 'No les cobré el viaje. Pensé que me lo pagarían más adelante, y no con dinero.', 'sin mirar a nadie en concreto'),
    { t: 'choice', prompt: 'Nadir sabe algo. Quiere venderlo o regalarlo.', options: [
      { label: 'Sentarse a escucharlo', hint: 'Devoción · rumores. Nadir será un mentor.', e: { d: 1, rumors: 2, flags: ['nadir_mentor'], ...a('pact') }, result: ['Nadir les habla de los pilares, de la primera noche en que los vio apagarse, de un viejo conocido suyo que los llamaba «los rastros». Es poco, y es todo lo que tiene.'] },
      { label: 'Despedirlo con una bolsa de monedas', hint: '−20 PO. Nadir será sólo un guía.', e: { gold: -20, flags: ['nadir_guia'], ...b('pact') }, result: ['Nadir acepta, un poco decepcionado. «Si cambian de idea, pregunten en las tabernas por el que sabe de los pilares.»'] },
      { label: 'Preguntarle quién le paga por vigilarlos', hint: 'Engaño CD 14 (Zyr\'thar). Nadir es heraldo del Conclave.', check: { skill: 'engano', dc: 14, pc: 'zyrthar' }, e: { rep: { conclave: -1 }, flags: ['nadir_heraldo'], ...a('zyrthar') }, result: ['Nadir palidece. «Nadie me paga. Todavía.» Os confiesa que el Conclave le ofreció una bolsa por contar adónde ibais. No la ha cobrado, y no sabe si hará bien en no cobrarla.'], fail: { e: {}, result: ['Nadir sonríe, ofendido. «Son desconfiados. Es bueno.» No dice más.'] } },
    ] },
  ],
  // ── Guardián del umbral: Shul-Avar ──
  m_cap3: [
    IF('efrit_vivo', [
      T('El Guardián Amigo', 'El último encargo de Shul-Avar', 'hammam'),
      S('Shul-Avar', 'Antes de irme quiero hacer una cosa. Lo hice durante siglos por obligación: guardar una puerta. Ahora quiero guardarla por gusto, una vez, para saber qué se siente.', 'con un nudo en la garganta de fuego'),
      { t: 'choice', prompt: 'Shul-Avar les pide acompañarlo a una puerta vieja del acueducto.', options: [
        { label: 'Acompañarlo y guardar la puerta con él', hint: '+PF · +Devoción. Shul-Avar será leal.', e: { d: 1, pf: 6, flags: ['shul_leal'], ...a('joren') }, result: ['Pasan la noche sentados frente a una puerta vacía. Al amanecer, Shul-Avar dice: «Ya está. Era esto.» Se levanta sin cadenas y camina hacia el desierto.'] },
        { label: 'Dejarlo ir solo', hint: 'Respetar su elección. Shul-Avar los recordará.', e: { flags: ['shul_recuerda'] }, result: ['Lo ven alejarse con la espalda recta. Una hora después, alguien deja en su puerta una moneda de bronce con una llama grabada.'] },
      ] },
    ]),
  ],
  // ── Sombra: el Cubo de espejos (marca el arquetipo de cada PC) ──
  m_cap4: [
    T('La Sombra de Cada Uno', 'El Cubo de los Mil Reflejos', 'espejos'),
    N('Antes de abandonar el Cubo, cada uno de ustedes se queda un instante frente a su propio reflejo. No habla; no hace falta. Cada reflejo hace exactamente lo que ustedes no se atreven a hacer.'),
    { t: 'choice', prompt: 'Romain ve un templo en llamas y, entre las llamas, su balanza.', options: [
      { label: 'La balanza se inclina hacia la compasión', e: { ...a('romain') }, result: ['Romain baja la mirada. Pesa, y pesar le duele menos.'] },
      { label: 'La balanza se inclina hacia la justicia fría', e: { ...b('romain') }, result: ['Romain sostiene la mirada. La balanza no tiembla.'] },
    ] },
    { t: 'choice', prompt: 'Pact ve unas alas que no son suyas y una corona de fuego invertido.', options: [
      { label: 'Dejar que las alas se apaguen', e: { ...a('pact') }, result: ['Las alas se pliegan. Pact parpadea y, por un instante, es un hombre sin pasado y con futuro.'] },
      { label: 'Probarse la corona', e: { ...b('pact') }, result: ['La corona le sienta bien. Eso es lo peor.'] },
    ] },
    { t: 'choice', prompt: 'Rabb ve su espada escribiendo un nombre en la sangre.', options: [
      { label: 'Arrebatarle la pluma', e: { ...a('rabb') }, result: ['Rabb cierra el puño. La espada, por una vez, espera.'] },
      { label: 'Dejar que termine la frase', e: { ...b('rabb') }, result: ['El nombre queda escrito. Rabb no lo lee; ya lo ha olvidado.'] },
    ] },
    { t: 'choice', prompt: 'Joren ve a una mujer a su espalda, y una flecha apuntando a ambos.', options: [
      { label: 'Girar y cubrirla', e: { ...a('joren') }, result: ['Joren da un paso al frente. El reflejo desaparece.'] },
      { label: 'Disparar primero', e: { ...b('joren') }, result: ['La flecha cruza el espejo. El cristal no se rompe; se abre, como una puerta.'] },
    ] },
    { t: 'choice', prompt: 'Zyr\'thar ve su sombra, pero la sombra no la sigue: la espera.', options: [
      { label: 'Tenderle la mano', e: { ...a('zyrthar') }, result: ['La sombra duda, y luego toma la mano. Está fría, y es suya.'] },
      { label: 'Cortarle el paso', e: { ...b('zyrthar') }, result: ['La sombra retrocede. No olvida.'] },
    ] },
    { t: 'choice', prompt: 'Panchi ve a un enano pequeño, de rodillas, frente a una puerta cerrada.', options: [
      { label: 'Ayudarle a levantarse', e: { ...a('panchi') }, result: ['El reflejo le agarra el brazo con fuerza. Se levantan juntos.'] },
      { label: 'Romper la puerta', e: { ...b('panchi') }, result: ['La puerta cede. Detrás no hay nada; Panchi ruge igual.'] },
    ] },
  ],
  // ── Calvario: la vigilia antes del Coloso ──
  m_cap5: [
    T('La Vigilia', 'De qué huye cada uno', 'plaza'),
    N('La noche antes del Coloso nadie duerme. En un rincón de la plaza, alrededor de un brasero medio apagado, alguien rompe el silencio.'),
    { t: 'choice', prompt: 'Cada uno cuenta de qué huye. ¿A quién dejan hablar primero?', options: [
      { label: 'A Romain', hint: 'Su templo, su balanza.', e: { d: 1, ...a('romain') }, result: ['Romain habla de la noche en que su templo ardió, y de cómo desde entonces pesa a todo el mundo para no pesarse a sí mismo.'] },
      { label: 'A Rabb', hint: 'Su nombre, su espada.', e: { ...a('rabb') }, result: ['Rabb confiesa que lleva meses fingiendo recordar. A veces cree que el nombre que dice es solo uno que le dijeron. Nadie ríe.'] },
      { label: 'A Panchi', hint: 'Su rabia.', e: { ...a('panchi') }, result: ['Panchi dice: «Tengo miedo de no volver a ser el que era». Hace una pausa. «Pero tengo más miedo de volver a serlo».'] },
      { label: 'Callar y dejar que nadie hable', hint: 'Cada uno se queda con lo suyo.', e: { c: 1 }, result: ['Se apaga el brasero. A la mañana, todos lucharán un poco más solos de lo necesario.'] },
    ] },
  ],
  // ── Heraldo: la carta de Ellie ──
  m_cap6: [
    T('El Heraldo', 'Una carta de Qadir-Kalmah', 'medinat'),
    N('Un muchacho de pies descalzos llega a Medinat con un sobre sin remitente. Tiene un solo nombre en el dorso: Panchi.'),
    { t: 'choice', prompt: 'Panchi duda ante el sobre.', options: [
      { label: 'Leerla ahora', hint: 'Panchi se enfrenta. Será el Maestro.', e: { d: 1, flags: ['carta_ellie_leida'], ...a('panchi') }, result: ['La carta dice una sola línea: «No te pedí que ganaras. Te pedí que volvieras». Panchi la dobla. Esa noche duerme.'] },
      { label: 'Guardarla sin abrir', hint: 'La rabia se queda a salvo. Será la Llama.', e: { flags: ['carta_ellie_sin_abrir'], ...b('panchi') }, result: ['La guarda bajo el cinturón. Cada tanto la toca, como quien comprueba que la herida sigue.'] },
    ] },
  ],
  // ── Mentor falso: Dahhak y Pact ──
  m_cap7: [
    IF('dahhak_vivo', [
      T('El Mentor Falso', 'Dahhak habla con Pact', 'limbo'),
      S('Dahhak', 'Un caído que no sabe si bajó o lo bajaron. Qué desperdicio. Yo, a tu edad, ya había entendido que la corona no se rinde: se hereda.', 'amable como un abuelo'),
      { t: 'choice', prompt: 'Dahhak le tiende a Pact una mano.', options: [
        { label: 'Rechazarlo', hint: 'Pact elige su propio camino.', e: { d: 1, flags: ['pact_rechaza_dahhak'], ...a('pact') }, result: ['Pact retira la mano como de una brasa. Dahhak sonríe. «Tal vez en otro siglo.»'] },
        { label: 'Escuchar su oferta', hint: 'Pact se acerca a la corona. +PF.', e: { c: 1, pf: 6, flags: ['pact_oyo_dahhak'], ...b('pact') }, result: ['Pact oye una hora. Al final no dice sí, pero nadie le oyó decir no.'] },
      ] },
    ]),
  ],
  // ── Embaucador: EaNassr y Razul ──
  m_cap8: [
    T('El Embaucador Generoso', 'EaNassr tiene una oferta', 'zoco'),
    S('EaNassr', 'Los precios de las promesas suben cuando se acerca el invierno. Me han dicho que el Vizir les va a hacer una visita. Puedo venderle el silencio de ustedes; o puedo venderles el suyo.', 'sobándose el anillo de hueso'),
    { t: 'choice', prompt: 'EaNassr les ofrece un negocio.', options: [
      { label: 'Comprarle el silencio del Vizir', hint: '−80 PO · −2 Alerta. EaNassr gana confianza.', e: { gold: -80, alert: -2, flags: ['ea_vendio_silencio'], bond: { ea: 1 } }, result: ['EaNassr desaparece con las monedas. Cuando regresa, trae un sobre sellado: «Doce horas de calma». Las campanas tardan en sonar.'] },
      { label: 'Venderle el propio', hint: '+120 PO · +2 Alerta. Pagarán el doble.', e: { gold: 120, alert: 2, flags: ['ea_compro_silencio'] }, result: ['EaNassr sonríe de oreja a oreja. Un trato justo es el que deja al otro creyendo que ganó.'] },
      { label: 'Rechazar a ambos', hint: 'Sin deuda ni favor.', e: { d: 1 }, result: ['EaNassr se encoge de hombros. «Cada uno tiene sus prisas.»'] },
    ] },
  ],
  // ── Cambiaformas: Seraphel y Nafisa ──
  m_cap9: [
    T('Los Cambiaformas', 'Quién es quién en el Jardín', 'espejos'),
    N('Hay dos personas en esta ciudad que cambian de rostro según quién las mire: una lo hace con máscaras, la otra con silencios. Las dos los necesitan, y las dos les mienten un poco.'),
    { t: 'choice', prompt: '¿En quién confían más?', options: [
      { label: 'En Lady Nafisa', hint: 'La nobleza les abre puertas.', e: { rep: { conclave: 1 }, bond: { nafisa: 1 }, flags: ['confia_nafisa'] }, result: ['Nafisa sonríe con la máscara puesta. «Sabía que eran listos.»'] },
      { label: 'En Seraphel', hint: 'La Hija del Simurg les abre túneles.', e: { rep: { hijos: 1 }, flags: ['confia_seraphel'] }, result: ['Seraphel inclina la cabeza. «Cuando todo caiga, recuerden quién les dijo la verdad.»'] },
      { label: 'En ninguna de las dos', hint: 'Ni favores ni deudas.', e: { flags: ['no_confia_cambiaformas'] }, result: ['Las dos asienten, y ninguna parece molesta. Es lo que hacen los cambiaformas cuando los descubren: se vuelven más cuidadosos.'] },
    ] },
  ],
  // ── Niño divino: Farid ──
  m_cap10: [
    T('El Niño Divino', 'Lo que Farid ve', 'bajo'),
    S('Farid', 'Dentro de cinco días uno de ustedes va a soltar una cosa que lleva años apretando. No sé quién es. Se parece a una mano.', 'sentado en los escalones, con el arpa sobre las rodillas'),
    { t: 'choice', prompt: 'Farid les cuenta lo que ve, con la inocencia de quien no sabe lo que ve.', options: [
      { label: 'Escucharlo con atención', hint: '+Devoción. Farid confía más.', e: { d: 1, flags: ['farid_ve'], bond: { farid: 1 } }, result: ['Farid habla de colores, de manos, de una puerta que se abre sola. No todo se entiende. Todo, cuando ocurra, se reconocerá.'] },
      { label: 'Pedirle que no mire más', hint: 'Protegerlo. Pierde el don por un tiempo.', e: { flags: ['farid_protegido'], bond: { farid: 1 } }, result: ['Farid asiente. «Lo intentaré». Esa noche no toca el arpa; es la primera vez que no lo hace.'] },
    ] },
  ],
  // ── Aliado que se pierde: Abril en la Mina ──
  m_cap11: [
    T('El Aliado que se Pierde', 'Abril y el cuaderno', 'prison'),
    N('Abril bajó con ustedes para dibujar el mapa de lo que quedara. Cuando salieron, su cuaderno estaba en sus manos y ella no.'),
    { t: 'choice', prompt: 'Abril no ha salido de la mina.', options: [
      { label: 'Volver a buscarla', hint: '−8 PF. Joren se juega el pellejo.', e: { pf: -8, flags: ['abril_salvada'], bond: { abril: 2 }, ...a('joren') }, result: ['La encuentran sentada en el tercer nivel con la espalda contra una pared, dibujando de memoria. No pidió que fueran. Pero llora al verlos.'] },
      { label: 'Seguir adelante', hint: 'El culto necesita salir. Abril se pierde.', e: { c: 1, flags: ['abril_perdida'], ...b('joren') }, result: ['Nadie dice su nombre en el camino de vuelta. En el Bajo, alguien cuelga el cuaderno de un clavo. Allí se queda.'] },
    ] },
  ],
  // ── Sombra: lo que cada uno comparte con Razul ──
  m_cap12: [
    T('La Sombra que Habla', 'Lo que comparten con él', 'coliseo'),
    N('Al bajar la escalera del Vizir, cada uno ha pensado lo mismo sin decirlo: «Lo entiendo». No es fácil admitir que se comprende a un hombre que ha mantenido tres mil años una ciudad en pie con una sola idea.'),
    { t: 'choice', prompt: '¿Quién se atreve a decirlo en voz alta?', options: [
      { label: 'Pact: «Yo también quise ser corona»', e: { d: 1, ...a('pact') }, result: ['Pact lo dice mirando al suelo. Nadie lo contradice. Alguien le pone una mano en el hombro.'] },
      { label: 'Rabb: «Yo también fui un arma útil»', e: { d: 1, ...a('rabb') }, result: ['Rabb lo dice sin dramatismo. Es lo más honesto que ha dicho en meses.'] },
      { label: 'Zyr\'thar: «Yo también vendí a los míos»', e: { d: 1, ...a('zyrthar') }, result: ['Zyr\'thar lo dice con una sonrisa torcida. Es la forma que tiene de llorar.'] },
      { label: 'Nadie: es mejor no pensarlo', e: { c: 1 }, result: ['Se hace un silencio que pesa más que la escalera.'] },
    ] },
  ],
};

/** Rito de resurrección del Cap. XIII: cada personaje deja atrás su arquetipo viejo o lo acepta. */
const rite = (pc: string, name: string, askA: string, askB: string): Node[] => [
  IF(`arq_${pc}_a`, [N(`${name}: ha caminado hacia ${POLOS[pc][0]}. La pregunta ya no es qué será, sino si puede dejar de temer serlo.`)], [
    IF(`arq_${pc}_b`, [N(`${name}: ha caminado hacia ${POLOS[pc][1]}. La pregunta ya no es qué será, sino si puede dejar de justificarlo.`)], [N(`${name}: sigue en el cruce. Aún no ha elegido.`)]),
  ]),
  { t: 'choice', prompt: `La resurrección de ${name}.`, options: [
    { label: askA, e: { d: 1, arq: { [pc]: 2 }, flags: [`res_${pc}_a`] }, result: ['Lo dice despacio. No es una victoria; es una puerta que se abre.'] },
    { label: askB, e: { c: 1, arq: { [pc]: -2 }, flags: [`res_${pc}_b`] }, result: ['Lo acepta sin teatro. Es más fácil de lo que pensaba, y por eso asusta.'] },
  ] },
];
export const RESURRECCION: Node[] = [
  T('La Resurrección', 'Antes del Eclipse', 'limbo'),
  N('Antes del Eclipse, en el círculo de piedra, cada uno de ustedes siente la misma cosa: que lo que ha sido hasta ahora ya no alcanza. Es el momento de decidir en quién se convierten al salir de aquí.'),
  ...rite('romain', 'Romain', 'Pesar con compasión', 'Pesar con justicia'),
  ...rite('pact', 'Pact', 'Rendir la corona', 'Aceptar la corona'),
  ...rite('rabb', 'Rabb', 'Escribir su propio nombre', 'Dejar que otro lo escriba'),
  ...rite('joren', 'Joren', 'Proteger sin cobrar', 'Seguir cazando'),
  ...rite('zyrthar', 'Zyr\'thar', 'Caminar junto a su sombra', 'Vivir en su sombra'),
  ...rite('panchi', 'Panchi', 'Abrir la mano', 'Cerrar el puño'),
];

/** Líneas de epílogo por arquetipo final: manda el rito del Cap. XIII y, si no se hizo, el camino recorrido. */
const nm = (pc: string) => pc === 'zyrthar' ? "Zyr'thar" : pc[0].toUpperCase() + pc.slice(1);
const lineA = (pc: string) => N(`${nm(pc)}: terminó siendo ${POLOS[pc][0]}. No porque lo decidiera una vez, sino porque lo decidió muchas.`);
const lineB = (pc: string) => N(`${nm(pc)}: terminó siendo ${POLOS[pc][1]}. Quienes lo conocieron antes dicen que se le notaba desde el principio, en cómo callaba.`);
export const ARQ_EPILOGO: Node[] = [N('— Quiénes fueron —'), ...Object.keys(POLOS).map(pc =>
  IF(`res_${pc}_a`, [lineA(pc)], [IF(`res_${pc}_b`, [lineB(pc)], [IF(`arq_${pc}_a`, [lineA(pc)], [IF(`arq_${pc}_b`, [lineB(pc)])])])]))];
