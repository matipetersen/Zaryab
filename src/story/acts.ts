import type { Node } from './types';
import type { Effect } from '../state';
import { EPILOGUE } from './endings';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const BG = (id: string): Node => ({ t: 'bg', id });

// ═══════════════════════════ CAP. VII — LA IGLESIA DEL SIMURG ═══════════════════════════
export const CAP7: Node[] = [
  T('Capítulo VII — La Iglesia del Simurg', 'Las Si\'lats guían · el cubil de Dahhak', 'hammam'),
  N('Las Si\'lats no tienen rostro: son siluetas de luz que se mueven entre los arcos del acueducto, y hablan con el eco de un coro. Os conducen al oeste, por galerías que no figuran en ningún plano, hasta una iglesia con el techo abierto al cielo gris.'),
  S('Si\'lat', 'Aquí se juzgó a Azuran. Aquí lo partieron en dos para que no pudiera recordar. Aquí se esconde ahora quien huyó del Capitolio.', 'varias voces, apenas un susurro'),
  N('El suelo de la iglesia es un mosaico de plumas doradas. En el centro, una corona de fuego invertido flota sobre un altar derribado. Pact se detiene ante ella y siente que el mundo se vuelve a sostener sobre dos piernas.'),
  { t: 'choice', prompt: 'La Prueba de Azuran: Pact debe decidir qué hace con lo que fue.', options: [
    { label: 'Recordar el juramento: «Ni dioses ni djinns merecen fe ciega»', hint: 'Pact acepta lo que fue. Devoción.', e: { d: 2, flags: ['pact_recuerda', 'silats_guian'] }, result: ['La corona baja hasta sus manos, sin quemar. Azuran no dice nada: sonríe, por primera vez, con la cara de Pact.'] },
    { label: 'Negar a Azuran: «Yo soy Pact y ya no hay nadie más»', hint: 'Cortar el hilo antes de que tire de él.', e: { d: 0, c: 1, flags: ['pact_niega', 'silats_guian'] }, result: ['La corona se deshace en cenizas. Las Si\'lats guardan silencio: no es juicio, es duelo.'] },
    { label: 'Tomar la corona y usar su poder', hint: 'Corrupción: una corona invertida da fuerza a quien la lleva… y se la quita al que la sirve.', e: { c: 2, pf: 6, flags: ['pact_corona', 'silats_guian'] }, result: ['El fuego sube por los brazos de Pact. Por un segundo todos ven sus alas. Luego sólo queda quemadura en los hombros.'] },
  ] },
  S('Dahhak', 'Qué dulce, un ángel con dudas. Os esperaba.', 'desde la oscuridad de las naves, con muchas voces a la vez'),
  S('Dahhak', 'El Vizir cree que el desorden es el enemigo. Zahir cree que el enemigo es el olvido. Yo sé la verdad: el enemigo es la mirada que no se aparta del cielo. Los cuellos torcidos son los de quienes miraron la tierra y vieron lo que hay.', 'un cuello torcido asoma desde cada columna'),
  S('Dahhak', 'Os ofrezco una alianza: el cristal de Zahir os pesa, os duele, os cobra. Dejad que os lo quite. Yo no cobro. Yo sólo devoro.', 'su rostro no tiene boca; la voz sale de una fosa resonante'),
  { t: 'choice', prompt: 'Dahhak ofrece un trato que huele a mentira.', options: [
    { label: 'Escucharlo hasta el final', hint: 'Lo que dice puede ser útil, y es verdad en parte.', e: { c: 1, flags: ['dahhak_escuchado'] }, result: ['Os habla de Zahir, del Simurg partido, de Gul-Amarat. No miente. Dice todo lo suficientemente cierto como para que os preguntéis qué calla.'] },
    { label: 'Atacarlo sin más', hint: 'Ya habéis oído bastante.', e: {}, result: ['Dahhak ríe, y de cada columna cae una serpiente.'] },
  ] },
  N('La iglesia se llena de silbidos. De cada cuello torcido de Dahhak brota otro, y otro, y otro. El Portador de Cuellos se desenrolla del techo como una columna de víboras.'),
  { t: 'battle', enc: 'dahhak_final' },
  N('Dahhak cae de rodillas. Las serpientes se retiran, una a una, hacia las grietas. Lo que queda es un hombre pequeño con cuellos de más. Sonríe sin boca.'),
  S('Dahhak', 'Matadme y os sigo en cada sombra. Perdonadme y os debo un secreto. Escoged.', 'derrumbado, sin dejar de sonreír'),
  { t: 'choice', prompt: 'El falso dios de las víboras espera la sentencia.', options: [
    { label: 'Matarlo y quedaros con su fragmento', hint: '+PF. Un enemigo menos, y una promesa rota.', e: { c: 1, pf: 8, flags: ['dahhak_muerto', 'frag_dahhak'], rep: { dahhak: -2 } }, result: ['El cuerpo se deshace en arena y víboras muertas. Entre las cenizas, un fragmento de meteorito negro, caliente como un colmillo.'] },
    { label: 'Perdonarlo a cambio de su secreto', hint: 'Información y un aliado dudoso.', e: { d: 1, flags: ['dahhak_vivo', 'frag_dahhak', 'secreto_dahhak'], rep: { dahhak: 1 }, huella: 'Perdonasteis a Dahhak a cambio de un secreto sobre el Simurg dividido.' }, result: ['«El Simurg no fue dividido por los djinns. Se dividió solo. Por voluntad. Preguntadle a Zahir por qué.» Entrega el fragmento con la mano que le sobra.'] },
    { label: 'Absorber sus cuellos con el cristal', hint: '+Corrupción, +PF. Zahir lo aprobará… y Zahir miente.', e: { c: 3, pf: 14, flags: ['dahhak_devorado', 'frag_dahhak'], huella: 'Devorasteis a Dahhak con el cristal de Zahir.' }, result: ['El cristal late hambriento. Lo que fue Dahhak se reduce a un hilo de humo verde y entra en vuestros pechos. El eco de cien voces os acompaña un rato.'] },
  ] },
  BG('limbo'),
  S('Zahir (Caído)', 'Uno menos. Hay tantos otros fragmentos. ¿Os habéis preguntado alguna vez por qué los necesito todos?', 'el cristal se enfría'),
  { t: 'choice', prompt: 'Zahir dejó una pregunta en el aire: «¿Os habéis preguntado alguna vez por qué los necesito todos?»', options: [
    { label: '«Porque te faltan fragmentos para ser el Simurg»', hint: 'Arcanos CD 14.', check: { skill: 'arcanos', dc: 14 }, e: { flags: ['sabe_fragmentos'], d: 1 }, result: ['Zahir ríe, una risa breve. «Casi.» No dice más.'], fail: { e: {}, result: ['Zahir os mira en silencio. «No era una pregunta para ahora.»'] } },
    { label: 'No contestar: no os fiáis', e: { flags: ['desconfia_zahir'] }, result: ['Zahir asiente. «Es justo.»'] },
  ] },
  FX({ flags: ['cap7_done'], ruta: { sombra: 1 }, rep: { hijos: 1 } }, 'Capítulo VII completado. La guerra civil se acerca a vuestra puerta.'),
];

// ═══════════════════════════ CAP. VIII — LA VISITA DEL VIZIR ═══════════════════════════
export const CAP8: Node[] = [
  T('Capítulo VIII — La Visita del Vizir', 'La biblioteca · el té que nadie pidió', 'plaza'),
  N('Las campanas de Zaryab llevan dos días sin parar. Hoy suenan por fin en vuestra calle. Los seguidores corren a esconder niños y libros; Aisha apaga el fuego de la cocina; Apu vigila la puerta con una escoba, que es lo único que tiene.'),
  N('Pero no entra un ejército. Por la puerta de la biblioteca entra, sin armas ni escolta visible, un hombre alto y esquelético con una túnica dorada que murmura versos en lengua djinn. Detrás, a diez pasos, los Qilaat forman en la calle y no se mueven. Los Inquisidores se quedan fuera, como perros bien enseñados.'),
  IF('toco_veta', [N('Razul se detiene a un metro de vosotros. Mira la mano de quien tocó la arena violeta en el desierto. «Ya os había visto», dice. «Lo oís desde entonces, ¿verdad?»')]),
  S('Vizir Razul', 'No he venido a destruir nada. Si hubiera querido destruir algo, el Capitolio ya estaría aquí. He venido a sentarme.', 'con una voz que son varias voces a la vez, perfectamente acompasadas'),
  N('Se sienta. Mira la mesa larga, las sillas desparejadas, los platos de pan de arena. Se queda un buen rato mirando a Farid, que lo observa desde el fondo de la sala sin parpadear.'),
  S('Vizir Razul', '¿Podría pedirle a esta mujer un vaso de agua? Hace tres mil años que bebo té frío, y ya no recuerdo cuándo fue la última vez que alguien me trajo un vaso.', 'a Aisha, sin mirarla'),
  { t: 'choice', prompt: 'Aisha se ha quedado clavada. Os mira.', options: [
    { label: 'Que Aisha le sirva el vaso', hint: 'Un gesto de cortesía con el hombre que quemó su casa.', e: { d: 1, flags: ['razul_vaso'] }, result: ['Aisha le sirve el vaso con una mano que no tiembla, y vuelve a la cocina sin decir una palabra. Razul bebe despacio. «Gracias.» La palabra suena rara en su boca.'] },
    { label: 'Servírselo vosotros', e: {}, result: ['Se lo servís. Razul lo toma, lo huele y no lo bebe. Sólo quería comprobar si lo ofrecíais.'] },
    { label: 'Negarle el agua', hint: 'Aquí no se sirve a quien trae las campanas.', e: { c: 1, flags: ['razul_sin_agua'] }, result: ['Razul asiente, como quien ya conocía la respuesta. «Es justo.»'] },
  ] },
  S('Vizir Razul', 'He visto caer a tres dioses en esta ciudad. El primero se llamaba Merab. Prometió agua a los sedientos y se la quitó al segundo año. El segundo era una mujer, Hadir, que predicaba la paz y acabó dirigiendo una guerra. El tercero fue el Profeta de los Vientos, y creo que lo habéis conocido a través de mis Inquisidores.', 'contando con los dedos, como quien repasa una lista de la compra'),
  S('Vizir Razul', 'Todos empezaron como Zahir: con una promesa generosa, una voz amable, y alguien muy dolido al que ofrecerle un propósito.', 'mirándoos uno por uno'),
  { t: 'choice', prompt: 'Razul os ha dicho lo que piensa. Podéis responder.', options: [
    { label: '«¿Y tú? ¿También empezaste así?»', hint: 'Historia CD 15: reconocer el patrón en sus palabras.', check: { skill: 'arcanos', dc: 15 }, e: { flags: ['razul_historia'] }, result: ['Razul sonríe despacio. «Lo he pensado. No creo. Yo no prometí nada. Sólo me quedé cuando todos los demás se fueron.»', 'Dice algo más, en voz tan baja que sólo lo oye quien está atento: «Tres mil años son muchos para recordarlo todo. Pero olvidar es peor.»'], fail: { e: {}, result: ['Razul os mira con una especie de ternura cansada. «Todavía no.»'] } },
    { label: '«Si lo sabes, ¿por qué no los detuviste antes?»', e: { flags: ['razul_pregunta'] }, result: ['«Lo intenté. Cada vez que impedía que un dios naciera, otro lo hacía por detrás. La arena es paciente.» Se encoge de hombros. «Así que dejé de impedir que nacieran. Y empecé a impedir que quedaran.»'] },
    { label: 'Callar y esperar la oferta', e: {}, result: ['Razul asiente con aprobación. «Sabéis escuchar. Es raro entre los que traen cristales.»'] },
  ] },
  S('Vizir Razul', 'Mi oferta es sencilla. Me entregáis el cristal de Zahir —y al propio Zahir, si es que alguna vez se deja atrapar— y os dejo esta biblioteca, vuestros seguidores, vuestra ciudad pequeña dentro de la mía. No os cazarán. No os quemarán. Os dejaré vivir en paz.', 'casi amable'),
  S('Vizir Razul', 'Si me decís que no, entraré por la puerta con lo que traigo en la calle. Y esta vez no me sentaré.', 'sin levantar la voz'),
  { t: 'choice', prompt: 'La decisión del Cap. VIII fija vuestra Ruta.', options: [
    { label: 'Aceptar el trato de Razul', hint: 'Entregáis el cristal. La Ruta Balanza (Orden). Perdéis acceso a los Milagros.', e: { c: -1, d: -1, alert: -6, rep: { conclave: 3, hijos: -2 }, ruta: { orden: 4 }, flags: ['razul_pacto', 'trato_razul', 'fragmento_razul'] }, result: ['Entregáis el cristal. Razul lo toma con un guante y lo guarda sin mirarlo. El fragmento de meteorito que lleva a modo de sello cambia de manos. Una parte de vosotros se vacía.'] },
    { label: 'Negociar: lo que pedís a cambio', hint: 'Persuasión CD 17. Un fragmento a cambio de tiempo.', check: { skill: 'persuasion', dc: 17 }, e: { rep: { conclave: 2 }, alert: -4, ruta: { orden: 2 }, flags: ['razul_tregua', 'fragmento_razul'] }, result: ['Razul os mira largamente. «Os doy doce días y un fragmento. A cambio, nada: sólo palabra. Y la palabra, en Zaryab, es lo único que se paga con intereses.»'], fail: { e: { alert: 1, flags: ['razul_decepcion'] }, result: ['«Qué lástima.» Se levanta. «Entonces, no.»'], then: [{ t: 'battle', enc: 'asalto' }, FX({ pf: 10, alert: -3 }, 'Resistís el asalto. Razul se retira sin decir nada.')] } },
    { label: 'Rechazarlo y defender el santuario', hint: 'Batalla difícil. Los seguidores guardianes ayudan.', e: { d: 1, ruta: { pueblo: 2 }, flags: ['razul_rechazo'] }, result: ['Razul se levanta. «Tenía la esperanza de que fuerais los primeros en decir que sí.» Sale a la calle. La puerta se cierra detrás.'], then: [{ t: 'battle', enc: 'asalto' }, FX({ pf: 10, alert: -3 }, 'Rechazáis el asalto. Razul se retira sin decir nada.')] },
    { label: 'Evacuar y esconderse', hint: 'Salvas a los seguidores, el santuario queda maldito.', e: { alert: -3, ruta: { sombra: 1 }, flags: ['santuario_maldito'], pf: -10 }, result: ['Los adeptos salen por el pasadizo trasero. La biblioteca arde sin vosotros.'] },
  ] },
  IF('razul_pacto', [S('Zahir (Caído)', 'Os he oído. Habéis firmado con él. Os he perdonado antes. Esta vez no sé si podré.', 'una voz casi inaudible')], [
    IF('razul_rechazo', [N('Razul sale. En la mesa, entre los platos, queda un reloj de arena de bronce. Cada grano que cae hace un ruido mínimo, como un latido que alguien ha dejado funcionando para que lo oigáis.'), FX({ flags: ['razul_reloj'] }, 'Razul deja un reloj de arena: «lo que os queda».')]),
  ]),
  BG('limbo'),
  S('Zahir', 'Sabía que vendría. No os lo dije porque quería que lo vierais sin mi voz en vuestra cabeza. Quería que lo juzgarais con vuestros ojos.', 'lentamente'),
  S('Zahir', 'No es un monstruo. Es peor: tiene razón en casi todo. Pero se equivoca en una cosa. Un día os diré cuál.', 'con una dulzura inesperada'),
  FX({ flags: ['cap8_done'] }, 'Capítulo VIII completado. Ahora el juego calcula vuestra Ruta.'),
];

// ═══════════════════════════ CAP. IX — EL JARDÍN DE LOS SUSPIROS ═══════════════════════════
export const CAP9: Node[] = [
  T('Capítulo IX — El Jardín de los Suspiros', 'La fiesta de máscaras de Lady Nafisa', 'espejos'),
  N('El Jardín de los Suspiros es un laberinto de cipreses podados en forma de rostros. En el centro, una fiesta de máscaras. Lady Nafisa recibe a los invitados con una sonrisa que no parpadea. Bajo el estanque del centro duerme algo antiguo.'),
  S('Lady Nafisa', 'Qué bien que hayáis venido. Mi Marid se aburre y le gusta la gente que cuenta cosas.', 'tendiéndoos una copa'),
  { t: 'choice', prompt: 'Para llegar al estanque, hay que cruzar la fiesta.', options: [
    { label: 'Infiltraros con máscaras robadas', hint: 'Engaño CD 16', check: { skill: 'engano', dc: 16 }, e: { flags: ['jardin_infiltrado'] }, result: ['Nadie os reconoce. En un rincón, un viejo duerme con el fragmento a sus pies.'], fail: { e: { alert: 1 }, result: ['Una invitada os mira demasiado tiempo. Los guardias de Nafisa empiezan a cerrar el círculo.'] } },
    { label: 'Hablar con Lady Nafisa', hint: 'Persuasión CD 15', check: { skill: 'persuasion', dc: 15 }, e: { rep: { mercaderes: 1 }, flags: ['nafisa_aliada'] }, result: ['Nafisa os lleva ella misma hasta el estanque. «El Marid y yo tenemos nuestras diferencias», dice.'], fail: { e: { alert: 1 }, result: ['«Qué aburridos. Que os acompañen los guardias.»'] } },
    { label: 'Ir directos al estanque', hint: 'Sin disfraz. Sin permiso.', e: { c: 1, alert: 1 }, result: ['La fiesta se detiene. Las máscaras se vuelven hacia vosotros a la vez.'] },
  ] },
  { t: 'say', who: 'Zyr\'thar', text: 'Mi sombra ya no coincide con mis movimientos. Me sigue con un paso de retraso. A veces me adelanta.', tone: 'sin mirar a nadie, entre dos cipreses' },
  { t: 'choice', prompt: 'La Sombra Perfecta de Zyr\'thar.', options: [
    { label: 'Aceptarla: dejar que la sombra actúe', hint: '+Corrupción', e: { c: 1, flags: ['zyr_sombra_acepta'] }, result: ['La sombra se mueve sola y apaga cuatro faroles de un solo gesto. Zyr\'thar sonríe por primera vez en semanas.'] },
    { label: 'Resistirla: ordenarle que se quede', hint: '+Devoción', e: { d: 1, flags: ['zyr_sombra_resiste'] }, result: ['La sombra se queda quieta, rabiosa, a un paso de distancia. Cuando se aleja, Zyr\'thar respira.'] },
    { label: 'Investigarla', hint: 'Arcanos CD 15. Podría ser un fragmento.', check: { skill: 'arcanos', dc: 15 }, e: { flags: ['zyr_sombra_fragmento'], pf: 4 }, result: ['Es un resto del Simurg, una pluma dormida que se aferró a Zyr\'thar. Un fragmento pequeño: no es un dios, pero pesa como uno.'], fail: { e: {}, result: ['La sombra se escurre antes de que consigáis sujetarla.'] } },
  ] },
  BG('pozo'),
  N('El estanque es en realidad un lago. El agua sube sin viento y de ella emerge un rostro enorme de espuma que cambia con el reflejo de quien lo mira.'),
  S('Marid', 'Os dije que cobraría. No dije cuánto.', 'varias voces, como agua que cae'),
  { t: 'choice', prompt: 'El Marid emerge del estanque con la cara cambiante. Aún no ha atacado.', options: [
    { label: 'Hablarle: ofrecerle el recuerdo de un río', hint: 'Persuasión CD 14 con Lady Nafisa de aliada.', if: 'nafisa_aliada', check: { skill: 'persuasion', dc: 14 }, e: { flags: ['marid_dialogo', 'frag_marid'], d: 1 }, result: ['Nafisa interviene con una frase en lengua de agua. El Marid se detiene. «Hace tiempo que nadie me habla de ríos.» Os entrega el fragmento sin pelear.'], fail: { e: {}, result: ['El Marid no se deja convencer.'], then: [{ t: 'battle', enc: 'marid' }] } },
    { label: 'Hablarle sin ayuda', hint: 'Persuasión CD 17.', check: { skill: 'persuasion', dc: 17 }, e: { flags: ['marid_dialogo', 'frag_marid'], d: 1 }, result: ['Le habláis de los ríos que ya no existen. El Marid guarda silencio. «Un recuerdo vale más que un combate.» Os entrega el fragmento.'], fail: { e: {}, result: ['«No.» El agua sube.'], then: [{ t: 'battle', enc: 'marid' }] } },
    { label: 'Atacarlo', e: {}, result: ['El agua se pone de pie.'], then: [{ t: 'battle', enc: 'marid' }] },
  ] },
  N('El Marid se calma sobre su propio lago. Lo que sube del fondo, se desploma sobre su propio lago y las aguas se calman. Lo que sube del fondo es un fragmento de meteorito envuelto en un recuerdo: la imagen de un niño riendo en un río que ya no existe.'),
  { t: 'choice', prompt: 'El Marid, atado a un fragmento que lo ancla a este lugar, os mira por última vez.', options: [
    { label: 'Liberarlo: que vuelva al mar', hint: '+Devoción. El Marid será aliado distante.', e: { d: 2, flags: ['marid_libre', 'frag_marid'], rep: { hijos: 1 } }, result: ['El agua del Jardín se desborda. Cuando se retira, el estanque está vacío: el Marid ha vuelto a un mar que ya no recordaba.'] },
    { label: 'Atarlo a vuestro servicio', hint: '+Corrupción, +PF. Un aliado a la fuerza.', e: { c: 2, pf: 10, flags: ['marid_atado', 'frag_marid'], huella: 'Atasteis a un Marid con su propio fragmento.' }, result: ['El fragmento late. El Marid se hunde en el estanque sin una palabra, pero sabe que le habéis quitado el nombre.'] },
    { label: 'Dejarlo dormir y llevaros sólo el fragmento', hint: 'Sin consecuencias directas.', e: { pf: 5, flags: ['frag_marid'] }, result: ['El Marid se sumerge con calma. El estanque vuelve a ser un estanque.'] },
  ] },
  BG('limbo'),
  S('Zahir', 'Hay un secreto que no os conté. No os elegí por casualidad ni por suerte. Os elegí por vuestras heridas. Cada uno de vosotros tenía una puerta abierta; yo sólo entré.', 'sin tono, casi un parte'),
  S('Zahir', 'No me pidáis perdón por ello. Pero os lo debo decir.', 'esperando'),
  FX({ flags: ['cap9_done'], ruta: { sombra: 1 } }, 'Capítulo IX completado.'),
];

// ═══════════════════════════ CAP. X — EL HIJO DEL LAGO ═══════════════════════════
export const CAP10: Node[] = [
  T('Capítulo X — El Hijo del Lago', 'La cripta de las Trece Caras', 'limbo'),
  N('Farid se despierta de madrugada hablando en una lengua que nadie le enseñó. Canta, con la voz de otro, una melodía de huesos que suena a nana. Los ghuls del barrio de abajo empiezan a levantarse al compás.'),
  S('Farid', 'Dice que me quiere como un hijo. Dice que no me hará daño. Dice que tiene trece caras y que todas me quieren.', 'a medias dormido'),
  S('Aisha', 'Por favor. Por favor. Es mi hijo.', 'sin soltar a Farid ni un segundo'),
  { t: 'choice', prompt: 'La Balanza de Romain: medir el alma de Farid para decidir qué hacer.', options: [
    { label: 'Sellar el alma de Farid', hint: 'Lo salva del Lich pero lo vuelve frío.', e: { c: 1, flags: ['farid_sellado'], huella: 'Sellasteis el alma de un niño para salvarlo de un Lich.' }, result: ['Romain pone una mano sobre el pecho de Farid. Cuando la retira, el niño sigue vivo… y ya no canta, ni sueña, ni ríe.'] },
    { label: 'Ofrecer la voz de Romain al Lich', hint: 'Romain paga con su voz. Devoción.', e: { d: 2, flags: ['romain_voz'], huella: 'Romain cambió su voz por el alma de Farid.' }, result: ['Romain habla una última vez, con una voz que no reconoceríais. Cuando termina, no vuelve a hablar. Farid despierta.'] },
    { label: 'Romper la conexión con la ayuda de Ellie', hint: 'Requiere la Venda de Ellie.', if: 'conoce_ellie', e: { d: 1, flags: ['farid_roto', 'ellie_rompe'] }, result: ['La venda de Ellie se enrolla en la muñeca de Farid como una serpiente de lino. «Ya está», dice una voz que no está allí. La canción deja de sonar.'] },
  ] },
  N('La cripta de Al-Mazhar está bajo el cementerio del Bajo Zaryab, a trece escalones de profundidad. Cada peldaño tiene una máscara tallada que llora arena negra.'),
  S('Al-Mazhar', 'Bienvenidos, hijos míos. Qué tarde llegáis. Ya estaba a punto de cenar.', 'una voz paternal, amable, calurosa'),
  S('Al-Mazhar', 'No temáis. Nadie aquí os hará daño. Sólo os pido que os sentéis… y que no os levantéis.', 'trece máscaras giran detrás de él, una por una'),
  IF('rabb_pregunta', [S('Al-Mazhar', 'Tú, el de la espada que susurra. Yo conocí al que te vendió. Siéntate: hay historias que cuestan una cena.', 'a Rabb, con una sonrisa que no es suya')]),
  { t: 'choice', prompt: 'Al-Mazhar canta a coro con trece niños pálidos. Su canción levanta ghuls. Hay otra manera de enfrentarla.', options: [
    { label: 'Cantar la nana de Farid contra la canción del Lich', hint: 'Religión CD 16 (Romain). Si funciona, Al-Mazhar se apaga sin combate.', check: { skill: 'religion', dc: 16, pc: 'romain' }, e: { flags: ['mazhar_nana', 'frag_mazhar'], d: 2 }, result: ['Romain empieza a cantar la nana de la biblioteca, desafinada y torpe. Desde los estantes de arriba, desde la casa de Aisha, desde las voces de los seguidores, la nana sube por el cuerpo de Al-Mazhar como una hiedra. Las trece máscaras se paran, una por una. El Lich cae de rodillas.'], fail: { e: {}, result: ['La nana suena débil. El Lich sonríe, casi con ternura. «No, hijo mío. No así.»'], then: [{ t: 'battle', enc: 'al_mazhar' }] } },
    { label: 'Atacarlo', hint: 'Combate contra el Lich de las Trece Caras.', e: {}, result: ['Los ghuls cantan a coro.'], then: [{ t: 'battle', enc: 'al_mazhar' }] },
  ] },
  N('Al-Mazhar se apaga. Cada máscara cae al suelo, una tras otra, y de ellas surgen trece niños pálidos con arena negra en los ojos. No atacan. Sólo miran.'),
  { t: 'choice', prompt: 'Los trece huérfanos de Al-Mazhar, levantados y liberados.', options: [
    { label: 'Darles descanso con el rito de Kelemvor', hint: 'Romain: Devoción, y sus almas descansan.', e: { d: 2, flags: ['huerfanos_descansan', 'frag_mazhar'], rep: { hijos: 1 } }, result: ['Romain murmura el rito de Kelemvor. Uno a uno, los niños se disuelven en arena blanca y se llevan la canción con ellos.'] },
    { label: 'Llevároslos al culto como seguidores', hint: '+PF, +5 seguidores. Un Lich nunca se va del todo.', e: { c: 2, pf: 10, recruits: 5, flags: ['huerfanos_culto', 'frag_mazhar'], huella: 'Aceptasteis como seguidores a los trece niños del Lich.' }, result: ['Los niños os siguen sin una palabra. El cristal late hambriento.'] },
    { label: 'Destruirlos con el cristal', hint: '+Corrupción, +PF. No hay vuelta atrás.', e: { c: 3, pf: 14, flags: ['huerfanos_destruidos', 'frag_mazhar'], huella: 'Destruisteis a trece niños que el Lich había levantado.' }, result: ['El cristal absorbe la arena de sus ojos. Los trece caen como muñecos. No sentís nada, y eso os asusta.'] },
  ] },
  IF('pact_recuerda', [N('Pact recuerda, por un instante, la voz de una mujer que dijo: «No te aferres a quien te enseñó a luchar. Aférrate a quien te enseñó a perdonar.» Pero no sabe si es de Azuran o suya.')]),
  S('Rabb Locke', 'Me dijo algo antes de caer. «Tu espada no recuerda lo que olvidaste. Recuerda lo que fuiste.»', 'sin mirar a nadie'),
  { t: 'choice', prompt: 'El Pacto Original de Rabb.', options: [
    { label: 'Aceptar la verdad: no olvidó, fue activado', hint: 'Rabb acepta lo que es. +Corrupción, +poder.', e: { c: 1, flags: ['rabb_activado'] }, result: ['La espada vibra, aliviada. Rabb cierra los ojos y ve, por primera vez, una cara que no es la suya con una sonrisa que sí.'] },
    { label: 'Rechazar el pacto', hint: 'Rabb quiere ser él mismo. +Devoción.', e: { d: 1, flags: ['rabb_rechaza_pacto'] }, result: ['La espada se queda fría. Rabb la envaina sin hablar.'] },
  ] },
  FX({ flags: ['cap10_done'], ruta: { pueblo: 1 } }, 'Capítulo X completado. Al-Mazhar ha caído. La Mina de Alabastro se abre.'),
];

// ═══════════════════════════ CAP. XI — LA VETA MALDITA ═══════════════════════════
export const CAP11: Node[] = [
  T('Capítulo XI — La Veta Maldita', 'Mina de Alabastro · cuatro niveles', 'prison'),
  N('La Mina de Alabastro tiene cuatro niveles: Extracción, Fundición, Residencial y El Corazón. Los mineros dicen que hace años dejó de salir alabastro. Ahora sólo sale silencio.'),
  S('Capitana Samira', 'Tres escuadras no han vuelto. Si bajáis, hacedlo en silencio. Si oís algo, parad. Si veis algo, no lo miréis.', 'con una mano en la empuñadura'),
  S('Abril', 'Yo bajo con vosotros. Alguien tiene que dibujar el mapa de lo que quede.', 'una joven con el pelo atado y un cuaderno bajo el brazo'),
  { t: 'choice', prompt: 'Para entrar en la mina hay que elegir cómo.', options: [
    { label: 'Entrar por voluntad propia, investigando', hint: 'Samira os acompaña. +Devoción.', e: { d: 1, rep: { conclave: 1 }, flags: ['mina_voluntaria'] }, result: ['Samira abre la puerta con su propia llave. «Cuando salgamos, quiero una explicación de todo esto.»'] },
    { label: 'Ser enviados como castigo', hint: 'Sin ayuda, sin mapa.', e: { c: 1, flags: ['mina_castigo'] }, result: ['La puerta se cierra a vuestra espalda con un golpe seco.'] },
  ] },
  N('Descendéis. Extracción: vagonetas vacías y picos clavados en las paredes. Fundición: hornos fríos, huesos de djinn entre las escorias. Residencial: camas hechas, platos sobre las mesas, nadie.'),
  N('En El Corazón, una espiral de brazos humanos sale de la roca. No tiene ojos. Cuando respira, el aire de toda la mina se detiene.'),
  { t: 'choice', prompt: 'Gul-Amarat no se vence tocándolo. Se esquiva. O se enfrenta cuando uno ya no puede huir.', options: [
    { label: 'No tocar la pared y retroceder en silencio', hint: 'Escapar sin despertarlo. Sigilo CD 16.', check: { skill: 'sigilo', dc: 16 }, e: { flags: ['gusano_dormido'] }, result: ['Pasáis a su lado sin hacer ruido. El Gusano respira, vuelve a respirar. No despierta.'], fail: { e: { alert: 1 }, result: ['Alguien roza la pared. Un temblor sube por el suelo.'], then: [{ t: 'battle', enc: 'huida_mina' }] } },
    { label: 'Tocar la pared', hint: 'Despertarlo a propósito. Huida de 8 rondas.', e: { c: 1 }, result: ['La pared late bajo vuestra mano. De ella cuelga una mano, y otra, y otra. El Gusano despierta.'], then: [{ t: 'battle', enc: 'huida_mina' }] },
  ] },
  N('Salís de las galerías en una nube de polvo. Detrás, la mina se hunde sobre sí misma. Pero la salida está sellada por una losa de alabastro, y el ruido del Gusano se acerca por las galerías.'),
  { t: 'choice', prompt: 'Una puerta de piedra puede cerrarse desde dentro. Hace falta una voluntad.', options: [
    { label: 'Que un compañero se quede y cierre la puerta', hint: 'El Sacrificio. No hay vuelta atrás.', e: { flags: ['sacrificio_elegido'] }, result: ['Nadie quiere decirlo. Entonces uno da un paso al frente.'] },
    { label: 'Luchar contra Gul-Amarat', hint: 'Combate contra el falso dios del silencio.', e: {}, result: ['Gul-Amarat se alza. No tiene ojos, pero sabe dónde estáis.'], then: [{ t: 'battle', enc: 'gusano' }, FX({ pf: 14, flags: ['frag_gusano', 'gusano_muerto'] }, 'El Corazón del Gusano se desploma. Entre las piedras queda un fragmento de meteorito y un silencio muy largo.')] },
  ] },
  BG('limbo'),
  S('Zahir', 'Lo que habéis visto en esa mina es lo que le pasa a un dios que se parte. No es un gusano: es un pedazo que se quedó sin nadie que le cantara.', 'con la voz quebrada'),
  S('Zahir', 'Entregadme los fragmentos y os dejaré ir. A todos. Os lo juro por quien fui antes de ser un fragmento.', 'suplicando casi'),
  { t: 'choice', prompt: 'Zahir ya no ordena. Ruega.', options: [
    { label: 'Prometerle que se los llevaréis', hint: 'Zahir se relaja. El Sello se acerca.', e: { c: 1, pf: 4, ruta: { sombra: 1 }, flags: ['zahir_promesa_fragmentos'] }, result: ['Zahir exhala. Es un sonido que no habíais oído nunca en él: alivio.'] },
    { label: 'No prometer nada', e: { d: 1 }, result: ['Zahir os mira. «Lo entiendo.» No lo entiende. Pero lo acepta.'] },
  ] },
  FX({ flags: ['cap11_done'], ruta: { pueblo: 1 } }, 'Capítulo XI completado. La Ciudadela de los Susurros está abierta.'),
];

// ═══════════════════════════ CAP. XII — LA CIUDADELA DE LOS SUSURROS ═══════════════════════════
export const CAP12: Node[] = [
  T('Capítulo XII — La Ciudadela de los Susurros', 'Infiltración · Razul ibn Tameer', 'coliseo'),
  N('La Ciudadela de los Susurros no se asalta: se escucha. Cada pasillo repite, en voz baja, lo que se dijo la semana pasada. Cada sala guarda la frase que alguien no debía pronunciar. Es un edificio construido para recordarlo todo.'),
  IF('samira_confia', [S('Capitana Samira', 'Os abro la puerta del este y miro hacia otro lado. Después de esto no podré volver a esa puerta. Pensadlo.', 'quitándose la insignia sin hacer ruido')]),
  { t: 'choice', prompt: 'Para llegar al trono de Razul hay que atravesar cuatro salas.', options: [
    { label: 'Infiltraros por la escalera de los esclavos', hint: 'Sigilo CD 15.', check: { skill: 'sigilo', dc: 15 }, e: { flags: ['ciudadela_sigilo'] }, result: ['Pasáis entre los golems sin que se muevan. Los djinns de las mazmorras os miran con ojos que lo entienden todo.'], fail: { e: { alert: 2 }, result: ['Un golem de basalto abre los ojos. La alarma suena dos veces.'] } },
    { label: 'Por la escalera de los guardias, con engaño', hint: 'Engaño CD 16.', check: { skill: 'engano', dc: 16 }, e: { flags: ['ciudadela_engano'] }, result: ['Un Inquisidor cansado os franquea el paso. «Otra ronda», murmura. No pregunta de quién.'], fail: { e: { alert: 2 }, result: ['Un guardia compara vuestras caras con los carteles.'] } },
    { label: 'Por la escalera del Vizir', hint: 'Nadie la usa. Nadie sale.', e: { c: 1 }, result: ['Subís sin guardias, sin trampas, sin ruido. Es lo más inquietante que habéis hecho nunca.'] },
  ] },
  T('La Sala de las Voces', 'Tres mil años de frases que no se fueron', 'coliseo'),
  N('A mitad de ascenso, un pasillo largo y circular: las paredes están cubiertas de rendijas, y de cada rendija sale un murmullo. Aquí se guardan las palabras que la ciudad quiso olvidar. Sólo podéis escuchar tres de ellas antes de que el eco os desoriente.'),
  { t: 'choice', prompt: '¿Qué voz escucháis?', options: [
    { label: 'La más antigua, grabada bajo el yeso', hint: 'Merab, el primer dios caído de Zaryab.', e: { flags: ['voz_merab'] }, result: ['«Agua para todos. Lo prometí y no pude cumplirlo. Perdóname, hija mía. Perdóname.» El pasillo se queda helado. Merab no era un tirano: era un viejo asustado.'] },
    { label: 'Un grito de pájaro', hint: 'El Simurg real, antes de dividirse.', e: { flags: ['voz_simurg'] }, result: ['Un grito que no es un grito: es el sonido que se hace cuando algo grande decide partirse en pedazos para no tener que decidir. Os duele el pecho. Reconocéis algo de Zahir en esa voz.'] },
    { label: 'La más reciente, de un niño', hint: 'Farid, cantando.', e: { flags: ['voz_farid'] }, result: ['Una melodía sencilla, muy desafinada. Es la nana de la biblioteca. Hasta aquí han llegado las voces de vuestra casa. Razul lo oye todo.'] },
  ] },
  S('Inquisidor Kaelen', 'No hacía falta que subierais. Os dije en la plaza que no volviéramos a vernos.', 'una voz tranquila desde un balcón'),
  IF('joren_traicionado', [S('Joren Hell', 'A ti no te dije nada porque no hacía falta. Fuiste tú quien decidió.', 'sin mirar a Rabb')]),
  { t: 'choice', prompt: 'El Verdadero Culpable de Joren.', options: [
    { label: 'Matar a Kaelen', hint: 'Joren cobra su deuda.', e: { c: 1, flags: ['joren_mata'] }, result: ['Joren dispara una sola vez. Kaelen cae sin sorpresa.'] },
    { label: 'Capturarlo', hint: 'Para que declare ante Samira.', e: { d: 1, flags: ['joren_captura'] }, result: ['Kaelen deja caer las armas. «Si me lleváis ante alguien, que sea alguien que me escuche.»'] },
    { label: 'Perdonarlo', hint: 'Joren decide no repetir lo que le hicieron.', e: { d: 2, flags: ['joren_perdona'] }, result: ['Joren baja el arco. Kaelen no entiende por qué. Joren tampoco.'] },
  ] },
  BG('coliseo'),
  N('El trono de Razul no está en una sala: está en un balcón sin barandilla que da a toda la ciudad. Desde allí se ven las plazas, el Zoco, la biblioteca, las Catacumbas. Razul tiene la espalda recta y las manos a la espalda. Sin girarse, os saluda.'),
  S('Vizir Razul', 'Habéis llegado más lejos que los otros. Eso sólo significa que seréis olvidados más tarde.', 'su rostro es una máscara con otra máscara detrás'),
  S('Vizir Razul', 'Me llamé Razul ibn Tameer antes de llamarme Vizir. Fui arcanista, copista y un poco poeta. Había una niña, Yasmin, que sólo pedía que la ciudad no se quedara sin agua. Merab me dijo que sí. Merab me mintió. Yasmin murió de sed a los nueve años.', 'sin mirar atrás'),
  IF('voz_merab', [S('Vizir Razul', 'Habéis oído a Merab, ¿verdad? Os lo veo en la cara. Lloró al final. Lo supe. No lo perdoné.', 'en voz muy baja')]),
  S('Vizir Razul', 'Desde entonces tengo un trabajo: que ningún dios vuelva a prometer lo que no puede cumplir. Lo cumplo desde hace tres mil años. Lo cumpliré hasta que se me acabe la voz.', 'girándose por primera vez'),
  S('Vizir Razul', 'Pero estoy cansado. Más de lo que podéis imaginar. Hay un Corazón Dormido bajo esta torre: cuando Zaryab no me necesite, se apagará. Ese día no ha llegado. Podría llegar hoy.', 'casi sonriendo'),
  { t: 'choice', prompt: 'Razul no os pide que luchéis. Os da cuatro caminos.', options: [
    { label: '«No necesitamos un dios, necesitamos silencio»', hint: 'La vía del Silencio: Razul se apaga con su Corazón Dormido.', if: 'frag_mazhar', e: { flags: ['razul_silencio_oferta'], ruta: { orden: 1 } }, result: ['Razul guarda silencio un largo rato. «Eso es lo que yo habría dicho hace dos mil años.»'], then: [{ t: 'battle', enc: 'razul_final' }, FX({ flags: ['razul_silencio', 'frag_razul'], d: 1 }, 'Razul no cae: se apaga. El Corazón Dormido del Vizir se detiene.')] },
    { label: 'Aliaros con Razul contra Zahir', hint: 'Persuasión CD 18. Una alianza imposible que cambia el final.', check: { skill: 'persuasion', dc: 18 }, e: { flags: ['razul_aliado', 'frag_razul'], ruta: { orden: 3 }, rep: { conclave: 3 } }, result: ['«Todos los dioses empiezan con una voz amable», dice Razul. «Si me demostráis que el vuestro no lo hace, os escucharé.» Extiende la mano. Es la primera vez que le ofrece algo a alguien desde Yasmin.'], fail: { e: { alert: 2 }, result: ['Razul niega con la cabeza. «No lo suficiente.» Alza el bastón.'], then: [{ t: 'battle', enc: 'razul_final' }, FX({ flags: ['razul_muerto', 'frag_razul'], pf: 14 }, 'El Vizir cae. Su rostro se desvanece capa a capa hasta que no queda nada debajo.')] } },
    { label: 'Luchar contra Razul', hint: 'El Vizir cae. Zaryab queda sin dueño.', e: {}, result: ['Razul levanta el bastón.'], then: [{ t: 'battle', enc: 'razul_final' }, FX({ flags: ['razul_muerto', 'frag_razul'], pf: 14 }, 'El Vizir cae. Su rostro se desvanece capa a capa hasta que no queda nada debajo.')] },
  ] },
  BG('limbo'),
  S('Zahir', 'Habéis oído lo que dijo de mí. Lo que no os dijo es que yo estaba allí cuando murió Yasmin. Yo no la salvé. Podría haberlo hecho. No sé por qué no.', 'una voz que se quiebra por primera vez'),
  FX({ flags: ['cap12_done'] }, 'Capítulo XII completado. Las Catacumbas del Simurg se abren.'),
];

// ═══════════════════════════ CAP. XIII — EL RITUAL DEL ECLIPSE ═══════════════════════════
export const CAP13: Node[] = [
  T('Capítulo XIII — El Ritual del Eclipse', 'Catacumbas del Simurg · los Huesos del Pacto', 'limbo'),
  N('Las Catacumbas del Simurg están bajo la biblioteca. Siempre estuvieron. Los pasillos huelen a incienso viejo y a arena mojada. En la cámara central, siete pedestales rodean un círculo de piedra tallada con espirales fracturadas, las mismas del desierto.'),
  S('Zahir', 'Gracias por traerme todos. Os lo dije: el Simurg os eligió. No fue casualidad. Fue destino.', 'sin forma humana, solo una silueta de plumas'),
  IF('frag_dahhak', [N('Un pedestal acoge el fragmento de Dahhak. Pulsa con el eco de cien voces.')]),
  IF('frag_marid', [N('Otro pedestal acoge el fragmento del Marid. Gotea sin parar.')]),
  IF('frag_mazhar', [N('El fragmento de Al-Mazhar late como una nana.')]),
  IF('frag_gusano', [N('El fragmento de Gul-Amarat está tan callado que duele.')]),
  IF('frag_razul', [N('El fragmento de Razul pesa más que el resto.')]),
  S('Zahir', 'La verdad. Que no os dije. El Simurg no fue dividido. Se dividió. Y yo soy sólo uno de los fragmentos. El primero que despertó. El más hambriento.', 'las plumas caen como ceniza'),
  IF('voz_simurg', [S('Zahir', 'Habéis oído su grito en la Ciudadela. Sí. Aquel soy yo. Aquel fui. Y sigo gritando.', 'sin mirar a nadie')]),
  IF('zahir_promesa', [S('Zahir', 'Os prometí a Farid sano, la corona perdonada, el nombre de Rabb. Lo sigo prometiendo. Es verdad. No es toda la verdad.', 'con una mano abierta')]),
  IF('zahir_regalo_1', [S('Zahir', 'Os di el nombre de Mirabel. Fue un regalo. También fue un cebo.', 'con una media sonrisa triste')]),
  S('Zahir', 'El ritual del Eclipse unirá los fragmentos. El Simurg volverá a ser uno. Pero para eso necesito un cuerpo. Y vosotros me habéis dado siete.', 'sin pudor'),
  { t: 'choice', prompt: 'Es el momento de decidir el destino de Zaryab.', options: [
    { label: 'Unir los fragmentos y liberar al Simurg', hint: 'Requiere Devoción ≥ 7 y Sello ≤ 30.', if: 'puede_liberar', e: { d: 2, flags: ['final_liberar'] }, result: ['Los fragmentos se alzan de los pedestales y giran. Zahir grita de rabia: no estaba en el plan.'] },
    { label: 'Dejar que Zahir se una a los fragmentos', hint: 'Zahir gobernará. Corrupción ≥ 7.', if: 'puede_gobernar', e: { c: 2, flags: ['final_gobernar'] }, result: ['Zahir ríe. Es la primera vez que se le oye feliz.'] },
    { label: 'Entregarle todo sin preguntar', hint: 'La Espiral. El Sello se llena.', if: 'puede_espiral', e: { c: 3, flags: ['final_espiral'] }, result: ['Entregáis los fragmentos uno a uno. Zahir los toma con manos de humo. Su sonrisa se ensancha.'] },
    { label: 'Destruir los fragmentos', hint: 'Zaryab sobrevive. Con culpa.', e: { d: 1, flags: ['final_destruir'] }, result: ['Los fragmentos se parten bajo vuestras manos. Un grito sin voz recorre las catacumbas.'] },
    { label: 'Enterrarlos y dejar que Zaryab decida sola', hint: 'El Silencio. Los dioses se retiran.', if: 'puede_silencio', e: { d: 1, flags: ['final_silencio'] }, result: ['Cerráis el círculo de piedra con arena y silencio. Zahir os mira, y por primera vez no habla.'] },
    { label: 'Mantener el equilibrio entre fe y corrupción', hint: 'Requiere Corrupción y Devoción entre 4 y 6.', if: 'puede_equilibrio', e: { flags: ['final_equilibrio'] }, result: ['Los fragmentos se aquietan. Zahir os mira con algo parecido a respeto.'] },
  ] },
  IF('mz_seraphel_libre', [S('Seraphel', 'Me dijisteis que me liberarais para algo. Aquí estoy. No sé qué puedo hacer, pero aquí estoy.', 'entrando por una escalera lateral con las manos vendadas')]),
  IF('samira_confia', [S('Capitana Samira', 'La Guardia está contenida arriba. Tenéis lo que tarden en dar la alarma. No es mucho.', 'con una espada de mano')]),
  IF('razul_aliado', [S('Vizir Razul', 'Ya lo habéis visto. Me quedan fuerzas para un último trabajo. Que sea éste.', 'bajando del último escalón, con el bastón en alto')]),
  IF('ellie_sabe', [{ t: 'choice', prompt: 'Sifra la Silente aparece de la nada, con la venda de lino en la muñeca. Hay un instante, uno sólo, en que Zahir cree haber ganado.', options: [
    { label: 'Dejar que Zahir crea que ha ganado… y usar la venda de Ellie', hint: 'El Pacto Roto: Zahir queda sin su máscara de dios.', e: { d: 2, flags: ['pacto_roto'] }, result: ['Zahir abre los brazos. «Habéis venido. Lo habéis traído todo.» Es entonces cuando Ellie levanta la mano. La venda de lino se enciende como una cuerda de alambre. «Ahora.» Zahir se queda con la boca abierta.'] },
    { label: 'Ignorar a Ellie', e: {}, result: ['Ellie baja la mano. Os mira. No dice nada. Se desvanece.'] },
  ] }]),
  IF('sacrificio_elegido', [N('Y, desde algún rincón de las catacumbas, la puerta de la mina se cierra otra vez. Hay un precio que no se olvida.')]),
  N('Zahir abre las alas. Son de fuego y de mentira. El eclipse cae sobre la cámara y apaga las antorchas. Cuando se enciende otra vez, Zahir no es una silueta: es un ave del tamaño de un templo.'),
  S('Zahir', 'Yo soy el Simurg. Todos los demás sólo fueron pájaros.', 'una voz que viene de todas partes'),
  { t: 'battle', enc: 'eclipse' },
  N('El Simurg del Eclipse se desploma entre llamas doradas. Las plumas flotan como ceniza luminosa, y una por una se apagan. Lo que queda es una figura alta y andrógina, con ropajes de plumas rotas.'),
  S('Zahir', 'No sé si he ganado o he perdido. Pero ha sido bonito ser un dios, aunque fuera un momento.', 'casi sin voz'),
  FX({ flags: ['cap13_done'] }, 'El Ritual del Eclipse ha terminado.'),
  ...EPILOGUE,
];
