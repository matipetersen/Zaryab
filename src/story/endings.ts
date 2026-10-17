import type { Node } from './types';
import { ARQ_EPILOGO } from './arquetipos';
import type { Campaign } from '../state';
import { has } from '../state';

const N = (text: string): Node => ({ t: 'narr', text });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });

/** Ruta al terminar el Cap. VIII (ver docs/DISENO.md §3). */
export function computeRuta(c: Campaign): 'sombra' | 'fe' | 'balanza' {
  if (c.c >= 7 && c.d <= 4) return 'sombra';
  if (c.d >= 7 && c.c <= 4) return 'fe';
  if ((c.c >= 4 && c.c <= 6 && c.d >= 4 && c.d <= 6) || has(c, 'postura_orden')) return 'balanza';
  const r = c.ruta; const best = Object.entries(r).sort((a, b) => b[1] - a[1])[0]?.[0];
  return best === 'orden' ? 'balanza' : best === 'pueblo' ? 'fe' : 'sombra';
}
export const RUTA_LABEL = { sombra: 'Camino de Zahir (Sombra)', fe: 'Camino del Simurg libre (Fe)', balanza: 'Camino del Juez (Balanza)' } as const;

/** Banderas derivadas que desbloquean las opciones del final (se calculan antes del Cap. XIII). */
export function finalFlags(c: Campaign): string[] {
  const f: string[] = [];
  const frags = ['frag_dahhak', 'frag_marid', 'frag_mazhar', 'frag_gusano', 'frag_razul'].filter(x => has(c, x)).length;
  if (c.d >= 7 && c.seal <= 30 && frags >= 3) f.push('puede_liberar');
  if (c.c >= 7) f.push('puede_gobernar');
  if (c.seal >= 60 || has(c, 'dahhak_devorado')) f.push('puede_espiral');
  if (has(c, 'razul_silencio') || (has(c, 'huerfanos_descansan') && has(c, 'frag_gusano'))) f.push('puede_silencio');
  if (c.c >= 4 && c.c <= 6 && c.d >= 4 && c.d <= 6) f.push('puede_equilibrio');
  for (const pc of ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi']) { const v = c.arq[pc] ?? 0; if (v > 0) f.push(`arq_${pc}_a`); else if (v < 0) f.push(`arq_${pc}_b`); }
  f.push(c.gusano.power >= 10 ? 'gusano_abismal' : c.gusano.power >= 6 ? 'gusano_colosal' : c.gusano.power >= 3 ? 'gusano_adulto' : 'gusano_cria');
  return f;
}

const PC_LINES: Node[] = [
  N('— Epílogo de la compañía —'),
  IF('farid_roto', [N('Romain: Ellie rompió la canción. Farid ríe otra vez en la casa de Aisha. Romain mide almas por las noches, y por fin sueña sin balanzas.')], [IF('romain_voz', [N('Romain: no vuelve a hablar. Le basta con una mirada, y una libreta, y las manos de Farid sobre las suyas.')], [IF('farid_sellado', [N('Romain: guarda el alma de Farid en una balanza que nunca pesa lo mismo. A veces la mira. A veces no.')])])]),
  IF('pact_recuerda', [N('Pact: lleva el nombre de Azuran sin cargarlo. Cuenta que a veces el aire huele a plumas y no pregunta por qué.')], [IF('pact_corona', [N('Pact: las alas le salen negras por la espalda. Dice que no las pidió. Nadie le cree, y él tampoco.')], [N('Pact: cortó el hilo con Azuran. Sigue sin recordar, pero duerme tranquilo.')])]),
  IF('rabb_activado', [N('Rabb: la espada ya no susurra. Habla. Y Rabb la escucha con una calma que no tenía.')], [IF('rabb_rechaza_pacto', [N('Rabb: guarda la espada en un cofre y no la abre. Dice que ya sabe quién es. Nadie le pregunta.')])]),
  IF('joren_perdona', [N('Joren: volvió a Medinat a sentarse junto al muerto que respira. No hablan. Es la mejor conversación de su vida.')], [IF('joren_mata', [N('Joren: cobró su deuda. Dice que no cambió nada. Hace tres semanas que no duerme.')], [N('Joren: dejó vivir a Kaelen y se llevó a Abril a ver el desierto de noche.')])]),
  IF('zyr_sombra_acepta', [N('Zyr\'thar: la sombra lo precede ahora. Dicen que es la mejor ladrona de Zaryab, y que su dueño apenas aparece.')], [IF('zyr_sombra_fragmento', [N('Zyr\'thar: guarda la pluma de su sombra en un frasco. Ya no se escapa, aunque a veces canta.')], [N('Zyr\'thar: se quedó con su sombra a un paso de distancia. Prefiere así.')])]),
  IF('conoce_ellie', [N('Panchi: volvió a Medinat con la Venda de Ellie en la muñeca. Perdió el torneo. Está entrenando el siguiente.')], [N('Panchi: se queda a cuidar la biblioteca. Un golem, rebautizado «Defectuoso», le trae el té.')]),
  ...ARQ_EPILOGO,
  N('— El que escarba —'),
  IF('gusano_abismal', [N('Bajo Zaryab, a medianoche, la tierra se arquea con una calma que no es de este mundo. El Gusano de Cabeza de Martillo es ahora mayor que las murallas y todos lo saben, y nadie lo dice. Se cuenta que cada generación le deja una ofrenda en la puerta del Bajo. Se cuenta también que, cuando la ofrenda no llega, llega él.')], [IF('gusano_colosal', [N('El Gusano sigue ahí abajo, más grande de lo que nadie quiso. Los niños lo dibujan en la tiza y los viejos lo rezan en voz baja. No hay ciudad en el desierto que no tenga su monstruo; Zaryab ha aprendido a convivir con el suyo.')], [IF('gusano_adulto', [N('A veces, en las noches de viento, la arena se mueve sola bajo una calle del Bajo. Los perros ladran. El Gusano no ha muerto: nadie lo ha matado. Es una de las pocas cosas que Zaryab sabe de sí misma con certeza.')], [N('Una vez, en el Bajo, un niño juró haber visto una cabeza plana asomar entre dos casas. Nadie le creyó. Esa noche, el niño durmió con una luz encendida, y la luz no se apagó por la mañana.')])])]),
  N('— Los arcos se cierran —'),
  IF('romain_peso_santo', [N('Romain: pesó a Razul con compasión y la balanza se inclinó a su favor. Desde entonces pesa las almas sin miedo, y a veces, de noche, enciende una vela por una niña llamada Yasmin.')], [IF('romain_peso_verdugo', [N('Romain: pesó a Razul sin piedad. La balanza ya no está vacía: pesa lo que pesó. Dicen que desde entonces los hombres de Zaryab tiemblan al oírlo hablar de justicia.')], [IF('romain_peso_duda', [N('Romain: no quiso pesar a Razul. La balanza vacía de Kelemvor sigue vacía, y por primera vez eso no le duele.')])])]),
  IF('pact_rinde', [N('Pact: rindió la corona. No tiene alas ni juicio, pero tiene una casa al borde de la ciudad y un niño llamado Farid que le pregunta cada noche cómo se vuela.')], [IF('pact_asume', [N('Pact: asumió la corona. Ahora es un ángel de la verdad, y a veces una voz doble le susurra qué es verdad y qué no. No lo lleva mal: lo lleva en dos.')])]),
  IF('rabb_rompe', [N('Rabb: rompió el pacto. La espada ya no habla, ni miente, ni recuerda. Rabb sigue sin saber quién fue, y ha empezado a decidir quién quiere ser.')], [IF('rabb_firma', [N('Rabb: firmó un contrato nuevo con su propio nombre. La espada lo repite al amanecer, con voz bajita, para que no se olvide.')], [IF('rabb_reescribe', [N('Rabb: se dejó reescribir. Ahora recuerda una vida completa. A veces, de noche, duda de que sea la suya.')])])]),
  IF('velshara_mata', [N('Zyr\'thar: cobró la deuda de la Casa Vel\'Shara. Su sombra ahora la sigue a un paso de distancia, quieta.')], [IF('velshara_expone', [N('Zyr\'thar: expuso a Vel\'Shara ante toda Zaryab. La Casa arde sin que ella haya tocado un cuchillo.')], [IF('velshara_perdona', [N('Zyr\'thar: perdonó a su hermana. Es el único cuchillo que nunca ha lanzado, y el que más pesa.')])])]),
  IF('panchi_cierra', [N('Panchi: cerró el puño. Es el golpe más lento y más preciso de su vida. Después, abrió la mano y no la volvió a cerrar durante un mes.')], [IF('panchi_perdona', [N('Panchi: abrió la mano. Ellie le pone la venda cada mañana, y los dos fingen que no se miran.')], [IF('panchi_guarda', [N('Panchi: guardó su rabia. La conserva como quien guarda una piedra en el bolsillo: no para tirarla, sino para recordar su peso.')])])]),
  IF('qadir_golem', [N('Qadir-Kalmah: el golem Defectuoso volvió al claustro. Los monjes lo llaman «hijo» y le han dado un nombre nuevo.')]),
];

const END = (title: string, text: string): Node => ({ t: 'end', title, text });

export const EPILOGUE: Node[] = [
  IF('pacto_roto', [
    N('El Pacto Roto. Ellie rompe el pacto en el instante en que Zahir cree haber ganado. Los cristales de sus pechos se apagan como brasas bajo el agua. Zahir cae de rodillas, pequeño, sin plumas: sólo una figura alta y cansada.'),
    N('«No quería ser dios», dice. «Quería que alguien me cantara.» Aisha, desde el fondo de la sala, empieza a tararear la nana. Nadie se atreve a callarla.'),
    ...PC_LINES, END('Fin · El Pacto Roto', 'Zahir sobrevive como un hombre cualquiera en una biblioteca. Ya no hay dioses; hay una nana desafinada y una ciudad que, por una vez, está sola.')
  ], [
  IF('sacrificio_elegido', [N('El Sacrificio. Hay una puerta de piedra, en una mina que ya no existe, cerrada desde dentro. Quien la cerró no volvió. Su nombre quedó grabado en la biblioteca.')]),
  IF('final_espiral', [
    N('La Espiral. Zahir se alza como el Simurg completo, y por un instante todos creen que es una liberación. No lo es. El cielo de Zaryab se cierra como un puño.'),
    ...PC_LINES, END('Fin · La Espiral', 'Zahir no es misericordioso. Lo fue sólo mientras necesitaba a alguien que le abriera la puerta.')
  ], [IF('final_gobernar', [
    N('Gobernar Zaryab. Zahir se sienta en el trono del Vizir con un cristal violeta en el pecho. Los seguidores lo llaman señor. Ustedes son los consejeros que él nunca tuvo, y los prisioneros que nunca pidió.'),
    ...PC_LINES, END('Fin · El Trono de Arena', 'El Simurg sigue dividido y hambriento. Pero la ciudad ya no se queja: no queda nadie que se atreva.')
  ], [IF('final_liberar', [
    N('Liberación del Simurg. Los fragmentos giran y se funden en un ave de luz cálida que despliega las alas sobre toda Zaryab. Los djinns esclavos rompen sus cadenas una a una. La ciudad, sin dueño, empieza a llorar.'),
    ...PC_LINES, END('Fin · El Simurg Libre', 'Zaryab cae, y con ella los muros que mantenían a los djinns. Algunos tardarán años en decidir si les convenía.')
  ], [IF('final_silencio', [
    N('El Silencio. Los fragmentos duermen bajo piedra y arena. Los djinns eligen quedarse o irse. El Vizir, si sobrevivió, ya no recuerda por qué se levantaba cada mañana.'),
    ...PC_LINES, END('Fin · El Silencio', '«Zaryab no necesita un dios. Necesita silencio suficiente para decidir sola.»')
  ], [IF('final_destruir', [
    N('Destrucción. Los fragmentos se parten y la ciudad tiembla. Zahir se desvanece sin un grito. Zaryab sobrevive herida: sin djinns, sin dios, con la culpa de haberlo hecho.'),
    ...PC_LINES, END('Fin · Los Fragmentos Rotos', 'Zaryab sobrevive. Pero la biblioteca se llena de nombres, y ninguno de ellos es el de un dios.')
  ], [
    N('Equilibrio. Ni dios ni tirano. Zahir queda en la biblioteca, vigilado por los seguidores; el Vizir, si vive, gobierna con una promesa. El Gusano duerme. La ciudad es frágil, pero está entera.'),
    ...PC_LINES, END('Fin · La Balanza', 'Un orden frágil que depende de que ninguno de ustedes se canse primero.')
  ])])])])]),
  ]),
];
