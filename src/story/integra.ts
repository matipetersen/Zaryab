import type { Node } from './types';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: import('../state').Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });

/** Hilos del Cubo de Maunator que se cosen a la trama principal (se insertan en los Cap. X, XI y XII). */
export const X_MAZHAR_TOMO = IF('q_o_maunator', [S('Romain', 'Conozco este tono. Lo leí en un libro que nadie debería tener: el de los escribas de los muertos de Maunator. Los Lich de su estirpe se nombran con trece palabras, y cada una cierra una máscara.', 'a media voz, mirando las trece caras')]);

export const X_MAZHAR_OPT = { label: 'Leer en voz alta el Tomo de Maunator', hint: 'Requiere el Tomo (final «completo» o «incompleto» del Cubo). Romain nombra al Lich con las trece palabras. Sin combate.', if: 'mz_tomo_conserva', e: { d: 1, flags: ['mazhar_nana', 'mazhar_tomo', 'frag_mazhar'], huella: 'Le leyeron a un Lich el libro de los escribas de los muertos.' }, result: ['Romain abre el tomo que robaron en el Zoco y lee. No canta: nombra. Al-Mazhar levanta una mano, y cada palabra le arranca una máscara. «¿De dónde…?», alcanza a decir, y no es una pregunta de Lich, sino de hombre. La última máscara cae sin ruido. El libro, entre sus manos, se vuelve ceniza: ya cumplió su único trabajo.'] };

export const XI_SIMBOLO: Node[] = [IF('q_o_maunator', [
  N('En la pared, junto a una vagoneta volcada, alguien grabó un símbolo: un círculo con un ojo hundido. Ya lo vieron: estaba en los túneles pre-simurgianos bajo el Consulado de Thay, grabado sobre el sudario de una tumba de escribas. Lo que los sirvientes de Ghaunadaur llamaban «El Que Acecha», aquí se llama otra cosa. Pero sigue siendo un gusano.'),
  S('Seraphel', 'Si lo reconocen, no lo toquen. Aprendimos tarde que marcar su sitio es el mejor modo de atraerlo.', 'en un recuerdo, no en persona'),
  FX({ flags: ['sabe_simbolo_gusano', 'gusano_patron'], pf: 3 }, 'Reconocen el símbolo de Maunator: saben cómo respira Gul-Amarat. +3 PF.'),
])];

export const XII_KETHRAS: Node[] = [IF('q_o_maunator', [
  T('El Hombre del Bastón', 'Kethras, otra vez', 'coliseo'),
  N('En el último descansillo, antes del balcón de Razul, un hombre delgado con barba de ceniza espera con las manos a la espalda. Es el mismo que los persiguió por el sótano rotante de Maunator. Ha cambiado de ropa. No de ojos.'),
  IF('mz_trato_limpio', [
    S('Kethras', 'Les debo una promesa y no suelo olvidarlas. Suban. No vi nada. Mañana me preguntarán y tampoco habré visto nada.', 'apartándose del paso'),
    FX({ alert: -1, flags: ['kethras_pacto'] }, 'Kethras cumple el trato del Cubo. −1 Alerta.'),
  ], [
    S('Kethras', 'El Vizir me ofreció lo que ustedes me negaron: tiempo. No los odio. Pero tengo un patrón nuevo y ustedes son su próximo problema.', 'sin levantar el bastón todavía'),
    { t: 'choice', prompt: 'Kethras les cierra el paso.', options: [
      { label: 'Convencerlo de que ese patrón también lo traicionará', hint: 'Persuasión CD 17.', check: { skill: 'persuasion', dc: 17 }, e: { flags: ['kethras_neutral'], d: 1 }, result: ['Kethras guarda silencio demasiado tiempo. «Lo sé», dice al fin. «Lo supe desde que firmé.» Los deja pasar sin mirar dónde ponen los pies.'], fail: { e: {}, result: ['«No», dice, casi con ternura. Alza el bastón.'], then: [{ t: 'battle', enc: 'kethras_quemarropa', soft: true }] } },
      { label: 'Que Seraphel lo distraiga', hint: 'Requiere haber liberado a Seraphel en el Cubo.', if: 'mz_seraphel_libre', e: { d: 1, flags: ['kethras_burlado'] }, result: ['Una voz clara resuena en el pasillo contiguo: «¡Kethras! ¿Quieren saber quién cegó al Juez?» El mago gira un instante. Es todo lo que necesitáis.'] },
      { label: 'Pelear', hint: 'Combate corto: aguanten hasta que se agote su Bola de Fuego.', e: { c: 1, flags: ['kethras_combate'] }, result: ['Kethras suspira: «Qué previsibles».'], then: [{ t: 'battle', enc: 'kethras_quemarropa', soft: true }] },
    ] },
  ]),
])];

export const XII_ROMAIN_OPT = { label: 'Pesarlo con los ojos abiertos', hint: 'Seraphel avisó a Romain del plan de cegar al Juez de la Balanza: ahora ve a pesar.', if: 'mz_seraphel_libre', e: { d: 2, flags: ['romain_peso_santo', 'romain_ve'], huella: 'Romain pesó a Razul sin ceguera, porque una Hija del Simurg le avisó de la trampa.' }, result: ['Romain levanta la balanza y no cierra los ojos. «Me dijeron que intentarían cegarme», dice. «Lo han hecho. Pero ellos no sabían que, por el camino, alguien me enseñó a ver sin mirar.» La balanza se inclina hacia la compasión, y no se mueve más.'] };

export const XII_CYRIC: Node[] = [IF('q_o_cyric', [IF('oraculo_verdadero', [S('Vizir Razul', 'También han silenciado al Oráculo. Qué manera tan económica de matar a un dios: dejarlo decir la verdad.', 'con algo parecido a una sonrisa')], [IF('oraculo_cyric', [S('Vizir Razul', 'Se quedaron con la herencia de Cyric. Les durará lo que tarde en cobrarles intereses.', 'cansado')])])])];

/** Misión «La Herencia de Cyric»: nace de los hilos abiertos del Cubo de Maunator. */
export const CYRIC: Node[] = [
  T('La Herencia de Cyric', 'Medinat al-Rih · bajo el Oráculo', 'medinat'),
  S('Seraphel', 'Kethras buscaba esto, no el tomo. El tomo era la llave. La cerradura está bajo el Oráculo: un artefacto de Cyric que le enseñó a mentir a la ciudad entera.', 'con las manos vendadas, mirando por una grieta'),
  N('Bajo el estrado del Oráculo de las Mil Lenguas hay una cámara de cristal. En ella, un espejo plano devuelve sus rostros con un retraso de medio segundo. Cada vez que habla el Oráculo, el espejo se estremece: es la voz de un dios muerto que, aún hoy, se rehúsa a decir la verdad.'),
  S('Oráculo de las Mil Lenguas', 'No les mentiré esta vez. Me han dicho que ya no tengo derecho. Pero mentir es lo único que hago bien.', 'por primera vez, sin eco'),
  { t: 'choice', prompt: 'El artefacto de Cyric sigue funcionando.', options: [
    { label: 'Silenciar la mentira: que el Oráculo diga siempre la verdad', hint: 'El Oráculo deja de mentir para siempre. +2 Devoción, +1 Alerta.', e: { d: 2, alert: 1, rep: { hijos: 1 }, flags: ['oraculo_verdadero', 'q_o_cyric'], huella: 'Obligaron al Oráculo a decir la verdad.' }, result: ['Apoyan la mano en el espejo. Un crujido largo, como de hielo al sol. Desde entonces el Oráculo hablará sin trampas. Dicen que le cuesta, y que a ratos llora.'] },
    { label: 'Quedarse con la herencia', hint: '+12 PF, +2 Corrupción. El Oráculo seguirá mintiendo.', e: { c: 2, pf: 12, flags: ['oraculo_cyric', 'q_o_cyric'], huella: 'Se quedaron con la herencia de Cyric.' }, result: ['El espejo se funde con el cristal de sus pechos con un susurro. Algo antiguo les sonríe desde dentro: «Qué bien. Por fin alguien con quien mentir.»'] },
    { label: 'Entregarlo al Conclave', hint: '−3 Alerta, +2 rep. Conclave. Los Hijos se sentirán traicionados.', e: { alert: -3, rep: { conclave: 2, hijos: -2 }, flags: ['oraculo_entregado', 'q_o_cyric'], huella: 'Entregaron al Conclave la herencia de Cyric.' }, result: ['Un funcionario sin rostro recoge el espejo con guantes de lino. Nadie les da las gracias. Alguien, a lo lejos, tose.'] },
  ] },
];
