// Acto II · parte A, reescrito y ampliado: Cap. VII (La Iglesia del Simurg / Dahhak) y Cap. VIII (La Visita del Vizir / Razul en la mesa).
// Reglas: conserva flags, ecos, huellas y ids de combate de acts.ts. El fragmento de Dahhak se decide con fragChoice('dahhak');
// el de Razul NO se decide aquí (Cap. XII).
import { fragChoice } from './frag';
import type { Node } from './types';
import type { Effect } from '../state';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const BG = (id: string): Node => ({ t: 'bg', id });

// ═══════════════════════════ CAP. VII — LA IGLESIA DEL SIMURG ═══════════════════════════
export const CAP7: Node[] = [
  T('Capítulo VII — La Iglesia del Simurg', 'Las Si\'lats guían · el cubil de Dahhak', 'hammam'),

  // ───── El camino con las Si'lats ─────
  N('Las Si\'lats no tienen rostro: son siluetas de luz que se mueven entre los arcos del acueducto y hablan con el eco de un coro. Los conducen al oeste, por galerías que no figuran en ningún plano, con el agua goteando en cántaros que nadie vació en siglos. Caminan en fila. Las Si\'lats no pisan: flotan a un palmo del suelo, y eso a Panchi le parece una falta de respeto hacia los pies de todos los demás.'),
  S('Panchi', 'Cuatro horas, y ni una silla. ¿Ustedes no se cansan nunca? ¿O es que cuando uno no tiene piernas no hace falta sentarse?', 'cojeando un poco, con la mano en la rodilla'),
  S('Si\'lat', 'Nos cansamos de otras cosas.', 'una sola voz, y detrás el murmullo de las demás'),
  N('Delante de ustedes, la galería se abre en una cisterna redonda. Una de las Si\'lats toma una taza de barro de una repisa, la llena y se la ofrece a Pact. La taza está tibia. El agua huele a piedra.'),
  S('Si\'lat', 'Beban. Lo que sigue se hace con la boca limpia.', 'tendiendo la taza con las dos manos'),
  { t: 'choice', prompt: 'Las Si\'lats hablan poco y por turnos. Esta es la ocasión de preguntarles algo.', options: [
    { label: 'Preguntarles qué se comió Dahhak para quedarse con tantos cuellos', hint: 'Entender al enemigo antes de entrar.', e: { flags: ['silats_cuellos'], d: 1 }, result: ['Las Si\'lats se miran entre sí, que es una manera de decir que se callan algo. «Voces», dice la mayor. «Las toma tibias, cuando todavía están diciendo el nombre de alguien. Cada cuello es una persona que no terminó la frase.»', 'Romain se queda con la taza a medio camino de la boca. Beben igual, pero nadie dice nada más hasta la boca de la galería.'] },
    { label: 'Preguntarles cómo lo juzgaron a Azuran', hint: 'Pact escucha. Los demás miran el suelo.', e: { flags: ['silats_azuran'] }, result: ['«Con una balanza de plumas», dice una de ellas. «No lo condenó el peso. Lo condenó que, al final, pidió que lo partieran. Dijo que había visto lo que había que ver y no quería recordarlo entero.»', 'Pact deja la taza en la repisa. Nadie le pregunta qué vio. Rabb, a su lado, hace sonar la espada contra la hebilla del cinturón, dos veces, como quien llama a la puerta de otro.'] },
    { label: 'No preguntar nada y seguir', hint: 'Las Si\'lats dicen lo que quieren decir, y no más.', e: {}, result: ['Dejan la taza vacía donde estaba. Las Si\'lats no insisten. A partir de ahí el camino es más corto de lo que debería: en las galerías que no figuran en ningún plano, parece que los pasillos se acortan para quien no pregunta.'] },
  ] },
  S('Zyr\'thar', 'Hay cuatro salidas desde el centro de la cisterna. Dos están tapiadas. No es una pregunta, Panchi: dejá de buscar el asiento.', 'sin girarse'),
  S('Panchi', 'Yo no busco asiento. Busco una pared que no me mire.', 'metiendo una mano en el bolsillo y ofreciéndole un puñado de dátiles'),
  S('Zyr\'thar', 'Dos están tapiadas.', 'aceptando uno, sin cambiar la cara'),
  N('Es lo más parecido a una conversación que han tenido en toda la semana. Rabb les saca la cuenta: un dátil, cuatro salidas, doscientas dos zancadas hasta la boca de la galería. Se lo guarda para sí. Es lo más parecido a una broma que se permite.'),

  // ───── La iglesia y la Prueba de Azuran ─────
  N('La galería termina en una escalera ancha, rota por las raíces. Arriba, el techo se abrió hace mucho al cielo gris, y la lluvia fina de la tarde cae sobre una nave de columnas bajas. El suelo es un mosaico de plumas doradas, desgastado en el centro por pies que ya no vienen. En medio, sobre un altar derribado, una corona de fuego invertido flota a la altura del pecho de un hombre.'),
  S('Si\'lat', 'Aquí se juzgó a Azuran. Aquí lo partieron en dos para que no pudiera recordar. Aquí se esconde ahora quien huyó del Capitolio.', 'las demás repiten la última palabra, apenas audible'),
  N('Pact se detiene ante la corona. Siente el mundo sostenerse sobre dos piernas, que es lo que le pasa cuando algo lo reconoce antes de que él lo reconozca. Los demás se quedan en el umbral. Nadie se lo pidió. Es el pacto no escrito de la compañía: hay cosas que se miran desde la puerta.'),
  S('Azuran', 'Llegás tarde. Tardaste tanto que me cansé de esperar y me puse a hablar solo.', 'la voz sale de la corona, con el timbre de Pact pero más lenta'),
  S('Pact Risen', 'Yo no te pedí que me habitaras.', 'sin acercarse todavía'),
  S('Azuran', 'Tampoco yo te lo pedí a vos. Alguien nos cosió una espalda con dos juramentos distintos, y a uno de los dos le tocó el olvido. Mirá cómo te tiemblan las manos: ya sabés cuál.', 'sin acusar'),
  S('Pact Risen', 'Si tomo la corona, ¿vuelvo a ser vos?', 'en voz baja, con el formalismo de quien pide permiso a un tribunal'),
  S('Azuran', 'Si tomás la corona vas a recordarme. Es distinto. Los que tienen miedo de ser reemplazados confunden las dos cosas. Los que fueron reemplazados una vez, también.', 'con una paciencia que no es suya'),
  { t: 'choice', prompt: 'La Prueba de Azuran: Pact debe decidir qué hace con lo que fue.', options: [
    { label: 'Recordar el juramento: «Ni dioses ni djinns merecen fe ciega»', hint: 'Pact acepta lo que fue. Devoción.', e: { d: 2, flags: ['pact_recuerda', 'silats_guian'] }, result: ['La corona baja hasta sus manos, sin quemar. Pact repite el juramento en voz alta, palabra por palabra, y las palabras le salen enteras, como si nunca se hubieran ido. Las plumas del mosaico se enderezan una a una.', 'Azuran no dice nada: sonríe, por primera vez, con la cara de Pact. Después la corona se apaga, y lo único que queda es un hombre arrodillado que acaba de aprender un idioma que ya sabía.'] },
    { label: 'Negar a Azuran: «Yo soy Pact y ya no hay nadie más»', hint: 'Cortar el hilo antes de que tire de él.', e: { d: 0, c: 1, flags: ['pact_niega', 'silats_guian'] }, result: ['La corona se deshace en cenizas, sin llama, como un papel de tabaco. El mosaico bajo ella queda ennegrecido en un círculo perfecto. Las Si\'lats guardan silencio: no es juicio, es duelo.', 'Pact se queda mirando sus manos vacías. Dice «Gracias» sin saber a quién. Rabb le pone una mano en el hombro, y por una vez no hace ninguna broma.'] },
    { label: 'Tomar la corona y usar su poder', hint: 'Corrupción: una corona invertida da fuerza a quien la lleva… y se la quita al que la sirve.', e: { c: 2, pf: 6, flags: ['pact_corona', 'silats_guian'] }, result: ['El fuego sube por los brazos de Pact. Por un segundo todos ven sus alas, enormes, abiertas sobre las columnas, y la luz es tan blanca que Joren se tapa los ojos con el antebrazo. Luego el fuego baja y sólo queda quemadura en los hombros, dos manchas negras bajo la tela.', 'La voz de Azuran se queda dentro, más callada. Pact camina de vuelta hacia la nave con un andar nuevo, y a nadie le gusta cuánto se parece a un hombre que sabe adónde va.'] },
  ] },

  // ───── Un respiro antes de entrar ─────
  N('Hay un silencio de unos minutos. Joren revisa las cuerdas del arco, Zyr\'thar cuenta otra vez las columnas, y Rabb se sienta en el borde del altar derribado, con la espada sobre las rodillas.'),
  S('Rabb Locke', 'Qué gracioso. Vos recuperaste un nombre y yo sigo preguntándole al acero cómo me llamo. Se parece a esas peleas de hermanos, en las que uno hereda el reloj y el otro la deuda.', 'sin ironía suficiente para esconder la envidia'),
  S('Pact Risen', 'Tampoco es un reloj, Rabb. Es más bien una condena que viene con un nombre.', 'sentándose a su lado, rígido'),
  S('Rabb Locke', 'Aun así.', 'y le alcanza la cantimplora'),

  // ───── Dahhak ─────
  N('Entonces las columnas empiezan a hablar. No es un susurro: es una conversación entera, de mercado, con regateo, con risas, con alguien que llama a un niño para que vuelva a la mesa. De cada columna asoma un cuello torcido, pálido, de víbora, y cada cuello mueve la boca con una frase distinta.'),
  S('Dahhak', 'Qué dulce, un ángel con dudas. Los esperaba.', 'desde la oscuridad de las naves; la voz sale de todos los cuellos a la vez, pero lo dice uno solo'),
  N('Sale de detrás del altar. No es el monstruo que imaginaban: es un hombre flaco, sin boca, con el cuello demasiado largo, que camina descalzo sobre las plumas del mosaico con el cuidado de quien pisa un suelo ajeno. De sus hombros y su espalda cuelgan cuellos como las cuerdas de un laúd destemplado.'),
  S('Dahhak', 'No se asusten por los ruidos. Son los que me quedaron. Esa de allá era cocinera en Medinat; todavía regatea. El del fondo vendía agua en el Zoco antes de que Razul cobrara el agua. Y ese otro…', 'se interrumpe; uno de sus cuellos ríe, una risita aguda, descuidada'),
  N('La risa llega hasta Romain y le recorre la nuca. Es la risa que se oye cuando un niño enfermo tose y su sombra, en la pared, se divierte. La han oído antes. Era la sombra de Farid, en la choza de Aisha, el primer día.'),
  IF('farid_voces', [S('Dahhak', 'Ese muchacho que curaron con sangre de djinn. Lo oyen reír en el agua, ¿verdad? No fui yo, no al principio. Las voces buscan una grieta donde caber. Él dejó una abierta, ustedes la dejaron abierta, y yo sólo acomodé a los que ya estaban afuera.', 'con algo parecido a la timidez')], [
    IF('farid_curado', [S('Dahhak', 'Al niño del Bajo lo curaron bien. Pero a una voz hambrienta le basta con un rastro. Hay una grieta donde el Pozo del Silencio lo tocó, y por ahí, a veces, me escuchan.', 'sin mirarlos')]),
  ]),
  S('Romain', 'Esa risa es de un niño que no existe. ¿Qué le hiciste a Farid?', 'con la balanza vacía en la mano y la voz muy baja'),
  S('Dahhak', 'Nada. Eso es lo que me define: nunca hago nada. Me comen las voces de los que comí, ellas hablan donde pueden, y a veces se pegan a la sombra de un chico. Si lo desean, dejo de hablarle. No es un favor. Es una cortesía entre dos que se oyen.', 'y uno de sus cuellos se queda quieto, con la boca cerrada'),
  S('Dahhak', 'El Vizir cree que el desorden es el enemigo. Zahir cree que el enemigo es el olvido. Yo sé la verdad: el enemigo es la mirada que no se aparta del cielo. Los cuellos torcidos son los de quienes miraron la tierra y vieron lo que hay.', 'un cuello torcido asoma desde cada columna'),
  S('Dahhak', 'Les ofrezco una alianza: el cristal de Zahir les pesa, les duele, les cobra. Dejen que se lo quite. Yo no cobro. Yo sólo devoro.', 'su rostro no tiene boca; la voz sale de una fosa resonante'),
  { t: 'choice', prompt: 'Dahhak ofrece un trato que huele a mentira.', options: [
    { label: 'Escucharlo hasta el final', hint: 'Lo que dice puede ser útil, y es verdad en parte.', e: { c: 1, flags: ['dahhak_escuchado'] }, result: ['Les habla de Zahir, del Simurg partido, de Gul-Amarat y de una mina que tiene hambre. No miente. Dice todo lo suficientemente cierto como para que se pregunten qué calla.', 'Mientras habla, camina en círculo alrededor de Pact, sin tocarlo, como alrededor de un pozo del que no se sabe la profundidad.'], then: [
      S('Dahhak', 'A vos te lo digo, ángel. Zahir te cobra el nombre cada vez que lo recordás. Un regalo suyo es un préstamo con tu cara de garantía. Hay otro camino a Azuran, uno que no pasa por su cristal. Yo lo recorrí con otros que pedían lo mismo. No te cobraría nada. Sólo tendrías que dejarme acompañarte una temporada.', 'con tanta dulzura que parece sincero'),
      S('Pact Risen', '¿Y a Farid? ¿Qué le cuesta a Farid?', 'como si el nombre le saliera antes que la pregunta'),
      S('Dahhak', 'Nada. Yo dejaría de hablarle. Hoy mismo. Es lo único que puedo prometer sin mentir, porque es lo único que no me cuesta.', 'y las risitas de las columnas se callan, una a una'),
      { t: 'choice', prompt: 'Pact tiene delante un camino a Azuran sin pagarle a Zahir. Y a un niño que podría dormir en paz.', options: [
        { label: 'Rechazarlo: «Ya pagué lo que debía por estar acá»', hint: 'Pact elige cargar con lo suyo. Devoción.', e: { d: 1 }, result: ['Pact da un paso atrás, hasta que su espalda toca el pecho de Panchi, que no se mueve. «No», dice. «Voy a recordar yo, a mi ritmo, con el nombre que me toque. Y a Farid lo cuido con las manos que tengo.» Dahhak asiente, como quien oyó la respuesta que esperaba y de todos modos lamenta.'] },
        { label: 'Fingir que acepta para acercarse', hint: 'Engaño CD 15. Si sale bien, el primer golpe es de ustedes.', check: { skill: 'engano', dc: 15 }, e: { c: 1, pf: 3, flags: ['dahhak_oferta_pact'] }, result: ['Pact baja los hombros, inclina la cabeza, y se deja llevar tres pasos hacia el centro de la nave. Dahhak extiende una mano de dedos demasiado largos. Es la distancia exacta que Zyr\'thar y Joren necesitaban.', 'Lo que viene a continuación será una pelea. Pero la empezarán ustedes.'], fail: { e: { c: 1, alert: 1 }, result: ['Dahhak sonríe con la fosa que tiene por boca. «Mintió muy bien. Pero un ángel miente con los hombros, y los tuyos no se lo creen.» Las columnas se llenan de silbidos.'] } },
        { label: 'Preguntarle el precio en voz alta, para que todos oigan', hint: 'Intimidar CD 14. Quizás se le escape algo.', check: { skill: 'intimidar', dc: 14 }, e: { flags: ['dahhak_precio'], pf: 2 }, result: ['«Todo cuesta», admite Dahhak al fin, con una sinceridad que les pone la piel de gallina. «El camino que te ofrezco termina con vos dentro de uno de mis cuellos, ángel. Es un precio muy bajo para quien ya está partido en dos.» Rabb silba, largo. Nadie lo contradice.'], fail: { e: {}, result: ['Dahhak ríe sin sonido y deja la pregunta en el aire como si fuera una moneda. «Lo sabrás cuando lo necesites.»'] } },
      ] },
    ] },
    { label: 'Atacarlo sin más', hint: 'Ya oyeron bastante.', e: {}, result: ['Dahhak ríe, y de cada columna cae una serpiente. Una voz de mujer, en alguna parte, exclama «¡Cuidado!» sin dirigirse a nadie.'] },
  ] },
  N('La iglesia se llena de silbidos. De cada cuello torcido de Dahhak brota otro, y otro, y otro. El Portador de Cuellos se desenrolla del techo como una columna de víboras, y las voces de los comidos se arman una sobre la otra hasta que parece que toda la ciudad está hablando a la vez en un solo cuerpo.'),
  { t: 'battle', enc: 'dahhak_final' },

  // ───── Después del combate ─────
  N('Dahhak cae de rodillas. Las serpientes se retiran, una a una, hacia las grietas. Lo que queda es un hombre pequeño con cuellos de más, apoyado en un altar, jadeando por un orificio que no es una boca. Los cuellos que le quedan no dicen nada. Por primera vez, las voces están calladas.'),
  S('Dahhak', 'Mátenme y los sigo en cada sombra. Perdónenme y les debo un secreto. Escojan.', 'derrumbado, sin dejar de sonreír'),
  S('Dahhak', 'Y si el niño les importa: al callarme me callo con todos. Se acabó el reírse en las paredes. Eso no es un chantaje. Es la cuenta.', 'sin mirar a nadie'),
  { t: 'choice', prompt: 'El falso dios de las víboras espera la sentencia.', options: [
    { label: 'Matarlo y quedarse con su fragmento', hint: '+PF. Un enemigo menos, y una promesa rota.', e: { c: 1, pf: 8, flags: ['dahhak_muerto'], rep: { dahhak: -2 } }, result: ['El cuerpo se deshace en arena y víboras muertas. Las voces, una por una, se despiden con la frase que dejaron a medias: «el pan está en la mesa», «dile que no tarde», «ya voy». Se oyen todas juntas un instante y después ninguna.', 'Entre las cenizas queda un fragmento de meteorito negro, caliente como un colmillo.'] },
    { label: 'Perdonarlo a cambio de su secreto', hint: 'Información y un aliado dudoso.', e: { d: 1, flags: ['dahhak_vivo', 'secreto_dahhak'], rep: { dahhak: 1 }, huella: 'Perdonaron a Dahhak a cambio de un secreto sobre el Simurg dividido.' }, result: ['«El Simurg no fue dividido por los djinns. Se dividió solo. Por voluntad. Pregúntenle a Zahir por qué.» Se levanta con esfuerzo y se limpia las manos en la túnica, un gesto de hombre.', 'Antes de irse hacia las grietas, se detiene frente a Romain: «A su niño no le hablo más. Lo juro por los que me quedan.» El fragmento queda en el suelo, entre las plumas, sin que nadie lo recoja todavía.'] },
    { label: 'Absorber sus cuellos con el cristal', hint: '+Corrupción, +PF. Zahir lo aprobará… y Zahir miente.', e: { c: 3, pf: 14, flags: ['dahhak_devorado'], huella: 'Devoraron a Dahhak con el cristal de Zahir.' }, result: ['El cristal late hambriento. Lo que fue Dahhak se reduce a un hilo de humo verde y entra en sus pechos. El eco de cien voces los acompaña un rato: una cocinera que regatea, un aguatero, una risita aguda que no se queda quieta.', 'Panchi se lleva el puño al esternón y respira como quien tiene una piedra adentro. Nadie dice «Esto no estuvo bien». Todos lo piensan en la misma frase.'] },
  ] },
  fragChoice('dahhak'),

  // ───── Zahir ─────
  BG('limbo'),
  S('Zahir (Caído)', 'Uno menos. Hay tantos otros fragmentos. ¿Se han preguntado alguna vez por qué los necesito todos?', 'el cristal se enfría'),
  { t: 'choice', prompt: 'Zahir dejó una pregunta en el aire: «¿Se han preguntado alguna vez por qué los necesito todos?»', options: [
    { label: '«Porque te faltan fragmentos para ser el Simurg»', hint: 'Arcanos CD 14.', check: { skill: 'arcanos', dc: 14 }, e: { flags: ['sabe_fragmentos'], d: 1 }, result: ['Zahir ríe, una risa breve. «Casi.» No dice más, pero el cristal se enfría un grado, como si hubiera dejado una puerta entreabierta y se hubiera arrepentido a medias.'], fail: { e: {}, result: ['Zahir los mira en silencio. «No era una pregunta para ahora.» El cristal late dos veces más despacio de lo que acostumbra.'] } },
    { label: 'No contestar: no se fían', e: { flags: ['desconfia_zahir'] }, result: ['Zahir asiente. «Es justo.» Es lo que dice cuando algo le duele y quiere que no se note. Los seis salen de la iglesia bajo la lluvia, sin hablarle al cristal.'] },
  ] },
  FX({ flags: ['cap7_done'], ruta: { sombra: 1 }, rep: { hijos: 1 } }, 'Capítulo VII completado. La guerra civil se acerca a su puerta.'),
];

// ═══════════════════════════ CAP. VIII — LA VISITA DEL VIZIR ═══════════════════════════
export const CAP8: Node[] = [
  T('Capítulo VIII — La Visita del Vizir', 'La biblioteca · el té que nadie pidió', 'plaza'),

  // ───── Preparativos ─────
  N('Las campanas de Zaryab llevan dos días sin parar. Hoy suenan por fin en su calle. En la biblioteca todos se mueven a la vez y sin hablar: los seguidores corren a esconder niños y libros, Ranma arrastra un baúl de manuscritos hasta el sótano, Cabernet vacía en el desagüe una botella que aprecia más que a sus padres, Apu planta una escoba junto a la puerta como si fuera una lanza y se queda mirándola.'),
  S('Aisha', 'Que alguien me diga por qué hay una olla de lentejas en el fuego si va a venir el hombre que mata gente. Es una pregunta. No se la hago a nadie en particular.', 'con las manos en las caderas, apagando la llama de a poco'),
  S('Panchi', 'Porque si lo matan de hambre antes de pelear, perdemos nosotros. Es táctica.', 'cargando una mesa que pesa más que él'),
  S('Aisha', 'Esa mesa se queda donde estaba, enano. Es la única que sirve para sentarse a hablar.', 'sin mirarlo, quitando el mantel con una mano'),
  N('Panchi la deja caer con un golpe sordo. Sabe cuándo una discusión está perdida. Aisha le alcanza el mantel y no le dice nada más: lo dobla, lo vuelve a extender, y lo alisa dos veces con la palma.'),
  { t: 'choice', prompt: 'Aún queda tiempo para decidir cómo recibir al Vizir.', options: [
    { label: 'Poner la mesa como en la cena: pan, un jarro, sillas', hint: 'Cortesía. Devoción.', e: { d: 1, flags: ['cap8_mesa'] }, result: ['Aisha asiente, casi con alivio, y trae el pan de arena y el jarro de barro. Alguien acomoda las sillas desparejadas, una frente a otra, con la patas flojas hacia la pared. Se ve como lo que es: la mesa de gente que no se esconde.'] },
    { label: 'Esconder a los niños y poner guardias en las ventanas', hint: 'Prudencia. +PF.', e: { pf: 3, flags: ['cap8_guardias'] }, result: ['Shib distribuye a los más duros en los tejados con ladrillos y arcos viejos. Los niños bajan al sótano con una linterna y la orden de no hacer ruido. Farid se queda, porque nadie logra convencerlo de lo contrario.'] },
    { label: 'Dejar todo como está', hint: 'Que lo vea tal cual es.', e: {}, result: ['El desorden es el de siempre: un estante a medio llenar, los platos de la mañana sin lavar, un gato dormido sobre la bolsa de harina. Aisha los mira con reproche. «Qué bonito, vamos a morir con la cocina sucia.»'] },
  ] },

  // ───── Razul entra ─────
  N('Pero no entra un ejército. Por la puerta de la biblioteca entra, sin armas ni escolta visible, un hombre alto y esquelético con una túnica dorada que murmura versos en lengua djinn. Detrás, a diez pasos, los Qilaat forman en la calle y no se mueven. Los Inquisidores se quedan fuera, como perros bien enseñados.'),
  IF('toco_veta', [N('Razul se detiene a un metro de ustedes. Mira la mano de quien tocó la arena violeta en el desierto. «Ya los había visto», dice. «Lo oyen desde entonces, ¿verdad?»')]),
  S('Vizir Razul', 'No he venido a destruir nada. Si hubiera querido destruir algo, el Capitolio ya estaría aquí. He venido a sentarme.', 'con una voz que son varias voces a la vez, perfectamente acompasadas'),
  IF('cap8_mesa', [N('Mira la mesa puesta, el pan, el jarro, las sillas desparejadas. Se queda un segundo largo con la mano sobre el respaldo de la más cercana, como si temiera que la silla se fuera a deshacer.')], [
    IF('cap8_guardias', [N('Levanta la vista hacia los tejados. Ni siquiera parpadea. «Muy bien puestos», dice, a nadie. «Los arqueros de la izquierda tienen el sol en los ojos.»')], [
      N('Mira el desorden de la sala sin asombro: los platos sin lavar, el gato, los estantes vacíos. Es la mirada de alguien que alguna vez tuvo una casa así.'),
    ]),
  ]),
  N('Se sienta. Los mira a todos, uno a uno, sin apuro. Después a Farid, que lo observa desde el fondo de la sala sin parpadear, con el arpa sobre las rodillas.'),

  // ───── El recorrido ─────
  N('Entonces se levanta, aunque acaba de sentarse, y empieza a caminar por la sala con las manos a la espalda. No pide permiso. Se detiene frente a cada uno como un coleccionista que revisa un anaquel, y a cada uno le habla de otra manera, como si hubiera aprendido seis idiomas distintos para esta tarde.'),
  S('Vizir Razul', 'Romain de Kelemvor. Conocí a tu dios cuando todavía se discutía si pesaba o no. Una balanza que sólo mide es una crueldad; una que decide es un oficio. ¿Cuál cargás?', 'inclinando la cabeza apenas, el gesto de un colega'),
  S('Romain', 'La que me dejaron vacía.', 'sin levantar la voz'),
  S('Vizir Razul', 'Es la única honesta.', 'y sigue de largo'),
  S('Vizir Razul', 'Y vos, Pact. Te reí en la cara cuando te vi las alas en mi sala de juicio. No me disculpo. Pero sé lo que cuesta llevar algo que otros ven antes que uno.', 'con un tono más seco, sin condescender'),
  S('Pact Risen', 'Me llamo Pact.', 'rígido'),
  S('Vizir Razul', 'Esta semana, sí.', 'sin burla'),
  S('Vizir Razul', 'Rabb. La espada que te susurra es de las que firman. Lo sabés, creo. Preguntale quién puso el nombre en la hoja, y fijate si te contesta con su voz o con la de otro.', 'bajando la voz, como quien da un consejo de oficio'),
  S('Rabb Locke', 'Qué amable. Ahora voy a dormir peor, gracias.', 'con una sonrisa torcida; la espada, bajo la capa, se queda muda'),
  S('Vizir Razul', 'Joren Hell.', 'y se detiene frente al cazador, que baja la vista al suelo'),
  IF('joren_perdon_ruta', [S('Vizir Razul', 'Hablaste con él, ¿no? Con el hombre vendado. Me alegro. Yo no lo hice por él: lo hice por tu puntería, que me conviene. Ahora que lo sabés, es tu decisión si seguís queriendo ser un arma.', 'sin una sola palabra más de la necesaria')], [
    IF('joren_culpable_pista', [S('Vizir Razul', 'Te dijo que fui yo. Es verdad. También es verdad que lo enterraste vos.', 'mirándolo a los ojos')], [
      S('Vizir Razul', 'Hay hombres que se entierran dos veces, y siguen respirando. Es un talento. No una virtud.', 'sin acusar'),
    ]),
  ]),
  S('Joren Hell', 'Sí.', 'sin levantar la vista'),
  S('Vizir Razul', 'Zyr\'thar. La Casa Vel\'Shara me vende venenos desde antes de que tuvieras nombre. Si algún día querés saber a cuánto, preguntá.', 'sin cambiar el tono, como quien menciona el clima'),
  S('Zyr\'thar', 'Ya lo sé.', 'seca como un cuchillo bien guardado'),
  IF('torneo_perdido', [S('Vizir Razul', 'Y el monje que perdió contra Sifra. Me alegra. Hay derrotas que son una escuela. La mía fue el hambre, y llegué a la misma conclusión: lo peor no es perder. Es no volver a intentarlo.', 'a Panchi, con una cortesía rara')], [
    S('Vizir Razul', 'Y el enano de los puños. Dicen que tenés una deuda con una luchadora sin voz. Pagala cuando puedas. Ese tipo de deudas se heredan, y no a quien uno quisiera.', 'a Panchi, con una cortesía rara'),
  ]),
  S('Panchi', 'No me gusta que me conozcan tanto.', 'cruzándose de brazos'),
  S('Vizir Razul', 'A mí tampoco. Es el único precio de la edad.', ''),
  N('Se detiene por último frente a Aisha, que ha salido de la cocina con un trapo en las manos y no se decide a soltarlo. Razul inclina la cabeza como lo haría ante una anfitriona.'),
  S('Vizir Razul', '¿Podría pedirle a esta mujer un vaso de agua? Hace tres mil años que bebo té frío, y ya no recuerdo cuándo fue la última vez que alguien me trajo un vaso.', 'a Aisha, sin mirarla'),

  // ───── El vaso de agua ─────
  { t: 'choice', prompt: 'Aisha se ha quedado clavada. Los mira.', options: [
    { label: 'Que Aisha le sirva el vaso', hint: 'Un gesto de cortesía con el hombre que quemó su casa.', e: { d: 1, flags: ['razul_vaso'] }, result: ['Aisha le sirve el vaso con una mano que no tiembla, y vuelve a la cocina sin decir una palabra. Razul bebe despacio, hasta el fondo. «Gracias.» La palabra suena rara en su boca, como un idioma que dejó de usar hace mucho.', 'Cuando deja el vaso en la mesa, queda un círculo húmedo. Razul lo mira un buen rato y después lo cubre con la manga para que no se seque.'] },
    { label: 'Servírselo ustedes', e: {}, result: ['Se lo sirven. Razul lo toma, lo huele y no lo bebe. Sólo quería comprobar si lo ofrecían. Lo deja intacto sobre el mantel, junto al pan, y desde ese momento el vaso lleno parece más un arma que un gesto.'] },
    { label: 'Negarle el agua', hint: 'Aquí no se sirve a quien trae las campanas.', e: { c: 1, flags: ['razul_sin_agua'] }, result: ['Razul asiente, como quien ya conocía la respuesta. «Es justo.» Se pasa la lengua por los labios secos y no vuelve a pedirla. A Farid, desde el fondo, se le cae algo de las manos: una nota del arpa, por lo bajo.'] },
  ] },

  // ───── Los tres dioses ─────
  S('Vizir Razul', 'He visto caer a tres dioses en esta ciudad. El primero se llamaba Merab. Prometió agua a los sedientos y se la quitó al segundo año. Fue un dios generoso hasta que llegó el verano. El segundo era una mujer, Hadir, que predicaba la paz y acabó dirigiendo una guerra. Los que la seguían tenían razón en casi todo. Eso fue lo peor. El tercero fue el Profeta de los Vientos, y creo que lo han conocido a través de mis Inquisidores.', 'contando con los dedos, como quien repasa una lista de la compra'),
  S('Vizir Razul', 'Todos empezaron como Zahir: con una promesa generosa, una voz amable, y alguien muy dolido al que ofrecerle un propósito.', 'mirándolos uno por uno'),
  { t: 'choice', prompt: 'Razul les ha dicho lo que piensa. Pueden responder.', options: [
    { label: '«¿Y vos? ¿También empezaste así?»', hint: 'Historia CD 15: reconocer el patrón en sus palabras.', check: { skill: 'arcanos', dc: 15 }, e: { flags: ['razul_historia'] }, result: ['Razul sonríe despacio. «Lo he pensado. No creo. Yo no prometí nada. Sólo me quedé cuando todos los demás se fueron.»', 'Dice algo más, en voz tan baja que sólo lo oye quien está atento: «Tres mil años son muchos para recordarlo todo. Pero olvidar es peor.»'], fail: { e: {}, result: ['Razul los mira con una especie de ternura cansada. «Todavía no.»'] } },
    { label: '«Si lo sabés, ¿por qué no los detuviste antes?»', e: { flags: ['razul_pregunta'] }, result: ['«Lo intenté. Cada vez que impedía que un dios naciera, otro lo hacía por detrás. La arena es paciente.» Se encoge de hombros. «Así que dejé de impedir que nacieran. Y empecé a impedir que quedaran.»', 'Lo dice sin orgullo. Como un portero que repite el horario de las puertas.'] },
    { label: 'Callar y esperar la oferta', e: {}, result: ['Razul asiente con aprobación. «Saben escuchar. Es raro entre los que traen cristales.» Y por primera vez desde que entró, mira hacia la ventana, no hacia ellos.'] },
  ] },

  // ───── Yasmin ─────
  N('Hay un silencio largo. En la cocina, Aisha deja de revolver la olla. Razul vuelve a sentarse y apoya las dos manos abiertas sobre la mesa, de modo que se vea que no tiene nada en ellas.'),
  S('Vizir Razul', 'Voy a contarles lo único que nunca digo, así no creen que vine a asustarlos. Fui Razul ibn Tameer, copista. Escribía las cuentas del pozo de la Plaza Vieja. Una niña venía todas las mañanas con un cántaro de barro más grande que ella. Se llamaba Yasmin. Era hija de una vecina. Me traía un dátil como pago por dejarla mirar cómo se escribía.', 'con la voz de siempre, pero más lento'),
  S('Vizir Razul', 'Aquel año el pozo se secó. Merab dijo que sí, que traería la lluvia. Yo lo oí decirlo con estas orejas. Le creí. Le creí tanto que fui yo quien le escribió los decretos de agua. Y los decretos eran muy hermosos.', 'sin sonreír'),
  S('Vizir Razul', 'Yasmin tenía nueve años. Se sentó una tarde en mi escritorio con el cántaro vacío y me preguntó cuándo llegaba la lluvia. Le dije que pronto. Murió esa noche, con la boca resquebrajada, mientras yo copiaba un decreto sobre la abundancia. Tuve un vaso de agua junto al tintero todo el tiempo. No lo vi. Es el tipo de cosa que no se ve hasta que importa.', 'y baja la vista a su propia mano'),
  N('Nadie dice nada. En la cocina, el cucharón vuelve a rozar la olla muy despacio. Farid, en el fondo de la sala, toca una sola nota en el arpa, la más grave, y la deja sonar hasta que se apaga.'),
  S('Vizir Razul', 'Y no estaba solo en el cuarto. Había alguien más. En la ventana, un pájaro. De plumas doradas. Miraba. No dijo nada, no hizo nada. Vi cómo se sacudía la ceniza del ala cuando todo terminó, como quien termina de comer.', 'mirando a Farid, y luego a nadie'),
  { t: 'choice', prompt: 'Razul acaba de hablar de un pájaro dorado en la ventana. Todos piensan en la misma persona.', options: [
    { label: 'Preguntarle si sabe qué era ese pájaro', hint: 'Persuasión CD 14. Razul no dice un nombre, pero tampoco lo oculta.', check: { skill: 'persuasion', dc: 14 }, e: { flags: ['razul_yasmin', 'razul_pajaro'], d: 1 }, result: ['Razul los mira durante un largo rato. «Lo supe después, no antes. Lo supe cuando vi a vuestro Zahir por primera vez, desde mi balcón, con la misma manera de ladear la cabeza.» No dice más. No hace falta.', 'Joren se pone de pie y se vuelve a sentar. Pact se tapa la boca con el dorso de la mano.'], fail: { e: { flags: ['razul_yasmin'] }, result: ['«No lo sé», dice Razul, y es evidente que sí. «No me corresponde a mí decirlo.» Vuelve a su silencio, con la mandíbula tensa, y el tema queda en la mesa como un cuchillo sin dueño.'] } },
    { label: 'Ofrecerle compañía en el recuerdo, sin preguntar', hint: 'Romain y Pact lo acompañan. Devoción.', e: { d: 1, flags: ['razul_yasmin'] }, result: ['Romain apoya la balanza vacía sobre la mesa, junto al vaso, y no dice una palabra. Pact acerca una silla al otro lado. Razul los mira, sorprendido, y tarda en reconocer lo que le ofrecen. «Gracias», dice otra vez, y esta vez le sale mejor.'] },
    { label: 'Callar: lo que oyeron no se contesta', e: { flags: ['razul_yasmin'] }, result: ['El silencio es más largo de lo que nadie quisiera. Cuando Razul vuelve a hablar, su voz es otra vez la del Vizir: pareja, afilada, sin una grieta. Pero Aisha sale de la cocina un momento, deja otro dátil junto al vaso y vuelve a entrar sin una palabra.'] },
  ] },

  // ───── La oferta ─────
  S('Vizir Razul', 'Mi oferta es sencilla. Me entregan el cristal de Zahir —y al propio Zahir, si es que alguna vez se deja atrapar— y les dejo esta biblioteca, sus seguidores, su ciudad pequeña dentro de la mía. No los cazarán. No los quemarán. Los dejaré vivir en paz.', 'casi amable'),
  S('Vizir Razul', 'Si me dicen que no, entraré por la puerta con lo que traigo en la calle. Y esta vez no me sentaré.', 'sin levantar la voz'),
  { t: 'choice', prompt: 'La decisión del Cap. VIII fija su Ruta.', options: [
    { label: 'Aceptar el trato de Razul', hint: 'Entregan el cristal. La Ruta Balanza (Orden). Pierden acceso a los Milagros.', e: { c: -1, d: -1, alert: -6, rep: { conclave: 3, hijos: -2 }, ruta: { orden: 4 }, flags: ['razul_pacto', 'trato_razul', 'fragmento_razul'] }, result: ['Entregan el cristal. Razul lo toma con un guante y lo guarda sin mirarlo. El fragmento de meteorito que lleva a modo de sello cambia de manos. Una parte de ustedes se vacía.', 'Los Qilaat de la calle dan media vuelta como un solo hombre. Los campanarios dejan de sonar, de a uno. En la biblioteca, nadie sabe si es silencio o duelo.'] },
    { label: 'Negociar: lo que piden a cambio', hint: 'Persuasión CD 17. Un fragmento a cambio de tiempo.', check: { skill: 'persuasion', dc: 17 }, e: { rep: { conclave: 2 }, alert: -4, ruta: { orden: 2 }, flags: ['razul_tregua', 'fragmento_razul'], echo: [{ id: 'razul_plazo', in: 14 }] }, result: ['Razul los mira largamente. «Les doy doce días y un fragmento. A cambio, nada: sólo palabra. Y la palabra, en Zaryab, es lo único que se paga con intereses.»', 'Se levanta, estira la mano sobre la mesa, y cuando se la estrechan, la suya está fría y seca como pergamino. No sonríe. Pero antes de salir se detiene a mirar el vaso, y asiente.'], fail: { e: { alert: 1, flags: ['razul_decepcion'] }, result: ['«Qué lástima.» Se levanta. «Entonces, no.»'], then: [{ t: 'battle', enc: 'asalto' }, FX({ pf: 10, alert: -3 }, 'Resisten el asalto. Razul se retira sin decir nada.')] } },
    { label: 'Rechazarlo y defender el santuario', hint: 'Batalla difícil. Los seguidores guardianes ayudan.', e: { d: 1, ruta: { pueblo: 2 }, flags: ['razul_rechazo'] }, result: ['Razul se levanta. «Tenía la esperanza de que fueran los primeros en decir que sí.» Sale a la calle. La puerta se cierra detrás.', 'Afuera, un silbato. Dentro, Aisha deja caer el trapo y recoge el cuchillo del pan sin que nadie se lo pida. Shib grita algo desde el tejado. Los Qilaat empiezan a avanzar.'], then: [{ t: 'battle', enc: 'asalto' }, FX({ pf: 10, alert: -3 }, 'Rechazan el asalto. Razul se retira sin decir nada.')] },
    { label: 'Evacuar y esconderse', hint: 'Salvan a los seguidores, el santuario queda maldito.', e: { alert: -3, ruta: { sombra: 1 }, flags: ['santuario_maldito'], pf: -10 }, result: ['Los adeptos salen por el pasadizo trasero. Ranma carga los manuscritos, Apu arrastra a Cabernet, que sigue protestando por su botella. Aisha es la última: apaga la olla, cubre el pan con un trapo y cierra la puerta como si fuera a volver a cenar.', 'La biblioteca arde sin ustedes.'] },
  ] },

  // ───── Consecuencias ─────
  IF('razul_pacto', [S('Zahir (Caído)', 'Los oí. Firmaron con él. Los perdoné antes. Esta vez no sé si voy a poder.', 'una voz casi inaudible')], [
    IF('razul_rechazo', [N('Razul sale. En la mesa, entre los platos, queda un reloj de arena de bronce. Cada grano que cae hace un ruido mínimo, como un latido que alguien ha dejado funcionando para que lo oigan.'), FX({ flags: ['razul_reloj'], echo: [{ id: 'razul_plazo', in: 25 }] }, 'Razul deja un reloj de arena: «lo que les queda».')]),
  ]),

  // ───── Después de la visita ─────
  IF('santuario_maldito', [
    N('Desde la calle de atrás miran cómo las llamas lamen los estantes. Panchi no dice nada: tiene la mandíbula tan apretada que se le oye crujir. Cabernet abraza una sola botella, la que no tiró. Es la que le queda.'),
    S('Aisha', 'Dejé pan. No lo van a comer ellos. Lo van a comer las ratas. Es lo que importa.', 'con el rostro hacia el humo'),
  ], [
    N('Cuando la puerta se cierra detrás de los Qilaat, la sala tarda en volver a respirar. Aisha recoge el vaso de la mesa y lo mira a contraluz, como para asegurarse de que sigue siendo de ella. Apu, aún con la escoba, se deja caer en una silla y se queda mirando el techo.'),
    S('Panchi', 'Yo pensé que la escoba era para el final del día. No para recibir a un dios.', 'ayudando a Apu a incorporarse'),
    N('Cabernet, con la cara sucia de harina, descorcha lo que le quedaba. Nadie le dice que no. Nadie lo había visto reírse así desde que llegaron a Zaryab.'),
  ]),
  BG('limbo'),
  S('Zahir', 'Sabía que vendría. No se lo dije porque quería que lo vieran sin mi voz en su cabeza. Quería que lo juzgaran con sus propios ojos.', 'lentamente'),
  S('Zahir', 'No es un monstruo. Es peor: tiene razón en casi todo. Pero se equivoca en una cosa. Un día les diré cuál.', 'con una dulzura inesperada'),
  FX({ flags: ['cap8_done'] }, 'Capítulo VIII completado. Ahora el juego calcula su Ruta.'),
];
