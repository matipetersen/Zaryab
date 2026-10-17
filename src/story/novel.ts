import type { Node } from './types';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const BG = (id: string): Node => ({ t: 'bg', id });

/**
 * Escenas de novela entre capítulos y entre actos. Se reproducen solas (una vez) al cerrar el capítulo indicado.
 * Algunas ocurren lejos de la compañía: el lector sabe cosas que los personajes no.
 * Claves: `pro_*` y `cap0..2` (prólogo), `m_capN` (tras ese capítulo principal), `acto1|2|3` (portadas de acto).
 */
export const NOVEL: Record<string, Node[]> = {
  // ───────────────────────── ACTO I · MUERTE Y PACTO ─────────────────────────
  acto1: [
    T('ACTO I', 'Muerte y pacto', 'dunas'),
    N('Antes de la ciudad hubo un pájaro. Los viejos del desierto lo llaman Simurg y dicen que sus alas daban sombra a cuarenta ciudades. Nadie ha visto ya esa sombra. Nadie recuerda quién la apagó.'),
    N('Zaryab se levantó sobre la ausencia: un cuenco de adobe y mármol donde el viento llega por turnos y el agua se reparte con ceremonia. Se llama a sí misma eterna. Es una ciudad que repite una frase para no oír el silencio de debajo.'),
    N('Seis desconocidos caminan hacia ella sin saber que ya los esperan.'),
  ],
  cap0: [
    T('Entreacto', 'Lo que callan los pilares', 'dunas'),
    N('Cuando la compañía se durmió, el viento cambió de dirección. No fue de golpe; el viento es discreto. Primero movió la arena sobre las huellas, borrando las de seis pares de botas. Luego se detuvo sobre los cuatro pilares torcidos y los escuchó.'),
    N('Los pilares no son de piedra. Son de lo que queda de una pluma cuando el pájaro que la perdió lleva demasiado tiempo muerto. Guardan una sola idea, repetida desde antes de las ciudades: «volvé».'),
    N('A varias leguas, tras la ventana de una torre de bronce, un hombre de ojos cansados levantó la cabeza de un libro de cuentas. Sintió, sin saber por qué, que la arena de su ciudad pesaba un poco más que ayer. Anotó la hora. Era un hombre que anotaba todo.'),
  ],
  cap1: [
    T('Entreacto', 'El Vizir lee sus cuentas', 'prison'),
    N('Razul ibn Tameer no había ordenado una ejecución en cuatro años. Se lavó las manos en el aguamanil de plata y se miró el reflejo: una cara de funcionario, sin edad, con la fatiga de quien conoce el final de las historias antes de que empiecen.'),
    S('Vizir Razul', 'Seis. Seis extranjeros con el mismo cristal en el pecho. Decime, escriba, ¿cuántos cristales así hemos visto en esta ciudad?', 'sin dejar de secarse las manos'),
    S('Escriba', 'Ninguno, Vizir.', 'tragando saliva'),
    S('Vizir Razul', 'Cuatro. Pero ninguno de ellos llegó a mí colgado de un cuello. Llegaron como cuentos. Como sermones. Como el siglo pasado, que fue un sermón muy largo.', 'casi en un susurro'),
    N('Dejó el aguamanil. Fuera, las campanas del Conclave marcaban la hora con la precisión de un reloj que ya no cree en el tiempo.'),
    S('Vizir Razul', 'Que nadie toque sus cuerpos. Quiero saber cuánto tarda en cerrarse una herida que no debería cerrarse.', 'volviendo a su escritorio'),
  ],
  cap2: [
    T('Entreacto', 'Una ciudad llamada Zaryab', 'bajo'),
    N('Si se quiere entender Zaryab hay que subir a un tejado al amanecer. Desde allí se ve cómo la ciudad se ordena sola: arriba, las torres de bronce del Conclave de los Siete Vientos, siete campanarios que cada mañana tocan una nota distinta; abajo, el Bajo Zaryab, adobe y tiza violeta, donde la gente reza a un dios que ya no tiene nombre.'),
    N('Los Siete Vientos gobiernan porque hace trescientos años un hombre ató a un djinn con una promesa y lo obligó a girar. Fue el primer molino. Después vinieron el segundo, el tercero, los cien. La luz de las torres es luz esclava. Todo el mundo lo sabe y se dice, bajito, que es una buena luz.'),
    N('En el Bajo, una mujer llamada Aisha mide el pan con los dedos. Un niño toca el arpa en la esquina, tres notas, y se calla antes de la cuarta. Nadie le ha pedido que recuerde. Todos esperan que lo haga.'),
    N('La biblioteca bajo el barrio sangra aceite violeta por las paredes. Los estantes están vacíos de libros y llenos de otra cosa: de la paciencia de un lugar que solo necesita que alguien vuelva a abrir la puerta.'),
  ],

  // ───────────────────────── Entreactos del Acto I ─────────────────────────
  m_cap3: [
    T('Entreacto', 'El cuaderno de Al-Khush', 'taller'),
    N('Al-Khush solía hablar de las cosas como de viejos amigos. Una lámpara era «la señora de la esquina». Una llave, «la que sabe». Cuando le preguntaban por los djinns, bajaba la voz.'),
    S('Al-Khush', 'Una vez conocí a uno que cantaba mientras trabajaba. Cantaba para no oír el engranaje que lo hacía girar. Lo vendieron por tres monedas de plata. Tres. Recuerdo que lo pensé: tres monedas, y una canción.', 'mirando una lámpara apagada'),
    N('Aquella noche escribió en su cuaderno, con letra pequeña y apretada: «Si algún día alguien rompe la rueda, que no se detenga a contar los daños». Cerró el cuaderno. Lo dejó donde cualquiera podía encontrarlo, que es el modo más seguro de esconder algo.'),
  ],
  m_cap4: [
    T('Entreacto', 'Dahhak sueña en voz alta', 'plaza'),
    N('En una sala del Capitolio, un hombre de dedos largos y sonrisa generosa colocaba, uno por uno, los reflejos del Cubo sobre una mesa de mármol. Cada reflejo mostraba una versión distinta de él: el que había sido, el que pudo ser, el que fingía ser.'),
    S('Dahhak', 'Qué hermoso sería, ¿verdad?, ser un dios al que nadie tuviera que pedirle nada.', 'a un reflejo que le sostenía la mirada'),
    N('El reflejo no contestó. Los reflejos de Dahhak jamás contestaban. Era lo que más le gustaba de ellos.'),
    N('Al otro lado de la sala, un coloso de hierro y oro esperaba en silencio, con las gemas todavía apagadas. Alguien lo había construido para custodiar la ciudad. Alguien más había decidido que ya no la custodiaría a ella.'),
  ],

  // ───────────────────────── ACTO II ─────────────────────────
  acto2: [
    T('ACTO II', 'Los falsos dioses', 'plaza'),
    N('El Capitolio sigue sangrando aceite violeta, y la ciudad ha empezado a hablar de ello con la voz baja de los que ya han elegido un bando. Hay quien dice que cayó un coloso. Hay quien dice que cayó un régimen. Los dos tienen razón y los dos mienten.'),
    S('Zahir', 'Tres veces el mundo intentó tener un dios. Tres veces se equivocó. Merab prometió agua a los sedientos y, al segundo año, se la quitó. Hadir predicó la paz y terminó dirigiendo una guerra. El Profeta de los Vientos prometió que el viento nunca se iría, y se fue.', 'desde el limbo, con las plumas apagadas'),
    S('Zahir', 'Yo no soy como ellos. Eso les dije. No les mentí: no soy como ellos. Soy peor, porque yo sé por qué fallaron.', 'una confesión que nadie entiende todavía'),
    N('Siete fragmentos de un mismo meteorito duermen en siete manos distintas. Cada uno es un trozo de aquel pájaro que dio sombra a cuarenta ciudades. Cada uno ha encontrado a alguien con una herida del tamaño exacto para alojarlo.'),
    N('Se les llamará falsos dioses porque eso es lo que serán al final. Pero antes habrá un tiempo —breve, hermoso— en el que cada uno de ellos sea sinceramente adorado.'),
  ],
  m_cap6: [
    T('Entreacto', 'Sifra no olvida', 'medinat'),
    N('Lejos de Medinat, en las ruinas móviles de Qadir-Kalmah, una mujer encapuchada escribía una carta que nunca enviaría. Tenía una muñeca vendada con lino blanco y la costumbre de no hablar. Los monjes la llamaban Sifra la Silente. Ella, a veces, se llamaba Ellie.'),
    N('«Perdió», escribió. Y debajo: «Pero no se fue». Subrayó la segunda frase tres veces. Era la letra de alguien que hacía mucho tiempo que no se permitía esperar a nadie.'),
    N('Dobló la carta, la metió en la manga y miró por la ventana: la ciudad entera cambiaba de lugar otra vez, como si no se atreviese a quedarse quieta. Pensó que a veces también le pasaba a la gente.'),
  ],
  m_cap7: [
    T('Entreacto', 'Las plumas del Simurg', 'limbo'),
    N('Después de que Dahhak cayera, las Si\'lats recogieron los cuellos que habían quedado sobre las losas. Los lavaron, los envolvieron, los enterraron. Era la única manera que conocían de decir «lo sentimos» a un dios al que habían rezado y que las había devorado.'),
    S('Zahir', 'Cuando era pájaro, tenía veintitrés plumas de oro. Ahora no recuerdo cuántas son mías.', 'sin dirigirse a nadie'),
    N('Una pluma cayó, lenta, desde algún lugar sin techo. No llegó a tocar el suelo. En el aire, quedó convertida en polvo dorado. Las Si\'lats, que estaban recogiendo, no lo vieron. Alguien más sí.'),
  ],
  m_cap8: [
    T('Entreacto', 'El vaso de agua', 'bajo'),
    N('Esa noche, en su despacho, el Vizir Razul dejó sobre la mesa un vaso de agua que no había bebido. Lo miró durante una hora. Hay quien dice que esa agua era la misma que había servido a una niña llamada Yasmin, hace tres milenios. Es una exageración. La realidad es más pequeña y peor: era un vaso cualquiera. Lo guardaba por costumbre.'),
    S('Vizir Razul', 'Merab también pidió agua. Y se la dimos. Y no sirvió de nada.', 'a la habitación vacía'),
    N('Apagó la lámpara. El resplandor del vaso se mantuvo un instante más, como si el agua recordara.'),
  ],
  m_cap9: [
    T('Entreacto', 'La máscara de Lady Nafisa', 'espejos'),
    N('Cuando la fiesta terminó y los invitados desfilaron hacia sus carruajes, Lady Nafisa se quedó sola en el salón con una copa que no había tocado. Se quitó la máscara de plata y la dejó sobre el aparador. Debajo, su cara era exactamente la misma.'),
    S('Lady Nafisa', 'Es curioso. Cuando era joven creía que la máscara escondía a otra persona.', 'a su propio reflejo'),
    N('El Marid había salido de su lago hacía una hora y el agua aún no había vuelto a su lugar. En la orilla, un pez plateado se debatía sobre la hierba. Nafisa lo recogió y lo devolvió al estanque con las dos manos, como se devuelve algo prestado.'),
  ],

  // ───────────────────────── Hilos opcionales ─────────────────────────
  o_maunator: [
    T('Entreacto', 'El sótano que se mueve', 'cubo'),
    N('Hay ciudades que se hunden. Maunator, la de los escribas de los muertos, se hundió con método: primero los libros, luego las casas, al final los propios escribas, de pie en sus mesas, tomando nota de cómo les llegaba el agua. Dos mil años después, bajo un consulado extranjero del Zoco, sus salas todavía se desplazan en un orden que nadie recuerda haber fijado.'),
    N('Alguien en Zaryab dijo una vez que el Cubo no era un sótano, sino una frase larga que se escribía a sí misma. Si es verdad, ustedes han leído un párrafo.'),
  ],
  o_cyric: [
    T('Entreacto', 'La mentira que sostenía la ciudad', 'oraculo'),
    N('Durante generaciones, el Oráculo de las Mil Lenguas dijo lo contrario de lo que sabía, y Zaryab aprendió a vivir así: a leer entre líneas, a pagar por las verdades a medias, a sospechar de todo lo que sonara claro. Fue una buena escuela de ciudad.'),
    N('Ahora alguien ha tocado el espejo. Por la mañana, en el Zoco, los vendedores de augurios han abierto sus puestos con la cara de los que no saben qué venden.'),
  ],

  // ───────────────────────── ACTO III ─────────────────────────
  acto3: [
    T('ACTO III', 'El Eclipse', 'limbo'),
    N('Una mañana el sol salió con un borde mordido. Fue un instante, nada más, y casi nadie levantó la cabeza. Pero los niños lo señalaron, y los ancianos del Zoco se tocaron la frente con los dedos, como si temieran haber olvidado algo.'),
    S('Zahir', 'Cuento los días porque es lo único que me queda por hacer. Si no los cuento, ¿qué soy? ¿Un pájaro que espera?', 'con la voz más humana que ha tenido nunca'),
    S('Zahir', 'No les mentí. Los dejé creer. No es lo mismo. Eso me dije durante tres siglos. Ahora no estoy seguro de que haya diferencia.', 'bajando la cabeza'),
    N('Debajo de la biblioteca, en las Catacumbas del Simurg, siete pedestales aguardan en la oscuridad. Alguien los limpia cada semana, sin saber para qué. Los estantes sangran un poco más cada noche.'),
    N('Farid canta una canción que no recuerda haber aprendido. Aisha tararea el final, que nunca llega. Y en la Ciudadela de los Susurros, un hombre que ha visto caer a tres dioses sube una escalera muy lenta y se detiene en el último peldaño para tomar aire.'),
  ],
  m_cap11: [
    T('Entreacto', 'El libro de la Veta', 'prison'),
    N('En el cuarto nivel de la mina, bajo una capa de polvo de alabastro, alguien dejó un libro de cuentas. Las entradas son regulares: nombres de mineros, jornales, raciones. Las últimas páginas están en blanco. Antes de la última entrada hay una nota, escrita con tiza: «Esta noche el silencio ha vuelto a respirar. No se lo digás a nadie».'),
    N('Los vigilantes bajaron a recoger los cuerpos y no encontraron ninguno. Se llevaron las herramientas, cerraron la puerta y declararon el pozo agotado. Una forma elegante de decir que nadie quería volver a hablar de ello.'),
    S('Capitana Samira', 'Hay secretos que el Conclave no esconde porque sean peligrosos, sino porque son vergonzosos.', 'mirando una puerta cerrada'),
  ],
  m_cap12: [
    T('Entreacto', 'La noche antes', 'limbo'),
    N('Nadie durmió bien esa noche en el Bajo Zaryab. Aisha dejó pan en la mesa y no lo tocó. Farid tocó las cuatro notas, por fin, una detrás de otra, y las lámparas del barrio se apagaron al unísono, como si alguien hubiera soplado.'),
    S('Zahir', 'He visto esta noche muchas veces. En todas, alguien me miraba como me miran ustedes. En todas, yo prometía algo.', 'sentado entre siete pedestales vacíos'),
    N('Zahir pasó la mano por la piedra del círculo. Estaba fría. Nunca había sentido la piedra; desde que era pájaro había habido siempre viento entre él y las cosas. Ahora tocaba el suelo y el suelo lo tocaba a él.'),
    S('Zahir', 'Quiero que me perdonen. Pero también quiero que no me perdonen, porque de lo contrario habría que aceptar que lo que hice estuvo bien.', 'a la oscuridad'),
    N('Afuera, la ciudad contenía la respiración. En alguna parte, una campana tocó dos veces y se calló. Era el tipo de silencio que viene antes de que un pájaro vuelva a abrir las alas.'),
  ],
};
