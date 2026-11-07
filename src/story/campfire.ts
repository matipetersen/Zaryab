import type { Node, Opt } from './types';
import { has, type Campaign, type Effect } from '../state';
import { pairKey, chemPoints, NAMES } from '../engine/synergy';
import { POLOS } from './arquetipos';

/**
 * Fogatas: después de cada capítulo principal (y de cada misión personal), dos o tres de la compañía
 * hablan entre sí junto al fuego. La escena del capítulo exige su elenco; si alguno murió o no está,
 * se juega una conversación genérica del par con más química (o del par en tensión, si sus arquetipos
 * tiran para lados opuestos). Siempre termina en una elección que mueve la química (`chem`) y/o el
 * arquetipo (`arq`), y deja la bandera `fogata_<questId>_done`.
 */

// ───────── utilidades ─────────
/** Nombre de cada PC tal como aparece en SPEAKERS (retrato y color). */
const WHO: Record<string, string> = { romain: 'Romain', pact: 'Pact Risen', rabb: 'Rabb Locke', joren: 'Joren Hell', zyrthar: "Zyr'thar", panchi: 'Panchi' };
const N = (text: string): Node => ({ t: 'narr', text });
const S = (pc: string, text: string, tone?: string): Node => ({ t: 'say', who: WHO[pc] ?? pc, text, tone });
const X = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const T = (sub: string, bg: string, title = 'Junto al fuego'): Node => ({ t: 'chapter', title, sub, bg });
const nm = (pc: string) => NAMES[pc] ?? pc;

/** Suma varios efectos (química, arquetipo, banderas…). */
const E = (...es: Effect[]): Effect => {
  const out: Effect = {};
  for (const e of es) {
    if (e.chem) out.chem = { ...(out.chem ?? {}), ...e.chem };
    if (e.arq) { out.arq = { ...(out.arq ?? {}) }; for (const [k, v] of Object.entries(e.arq)) out.arq[k] = (out.arq[k] ?? 0) + v; }
    if (e.flags) out.flags = [...(out.flags ?? []), ...e.flags];
    if (e.d) out.d = (out.d ?? 0) + e.d;
    if (e.c) out.c = (out.c ?? 0) + e.c;
  }
  return out;
};
const ch = (a: string, b: string, n: number): Effect => ({ chem: { [pairKey(a, b)]: n } });
const ar = (pc: string, n: number): Effect => ({ arq: { [pc]: n } });
const fl = (...f: string[]): Effect => ({ flags: f });
/** Texto de ayuda: «+2 Pact–Romain · Pact → el Redentor». */
const rel = (a: string, b: string, n: number) => `${n > 0 ? '+' : ''}${n} relación ${nm(a)}–${nm(b)}`;
const pole = (pc: string, n: number) => `${nm(pc)} → ${POLOS[pc]?.[n > 0 ? 0 : 1] ?? ''}`;
const hint = (...h: string[]) => h.filter(Boolean).join(' · ');
const opt = (label: string, h: string, e: Effect, ...result: string[]): Opt => ({ label, hint: h, e, result });
const choice = (prompt: string, options: Opt[]): Node => ({ t: 'choice', prompt, options });

interface Ctx { c: Campaign; f: (flag: string) => boolean; alive: string[]; q: string }
interface Scene { cast: string[]; sub: string; bg: string; body: (x: Ctx) => Node[] }

// ═══════════════════════════ ESCENAS POR CAPÍTULO ═══════════════════════════
const CHAPTER: Record<string, Scene[]> = {
  // ── Cap. III: el acueducto, los djinns, el sacrificio al agua, el nombre de Azuran ──
  m_cap3: [{
    cast: ['pact', 'romain', 'panchi'], sub: 'Después del acueducto · Pact, Romain y Panchi', bg: 'dunas',
    body: ({ f }) => [
      N('Hacen fuego en una terraza del Bajo, con tablas de un puesto roto. El agua del acueducto todavía les gotea de la ropa. Pact no se sienta: se queda de pie, de espaldas a las llamas, como si el fuego le debiera algo.'),
      S('panchi', 'Sentate, Pact. Me ponés nervioso. Parecés una columna con opiniones.', 'revolviendo las brasas con un palo'),
      S('pact', 'Me llamaron Azuran. Tres mujeres de humo me miraron a la cara y me dijeron un nombre que no me acuerdo de haber tenido.', 'sin darse vuelta'),
      ...(f('sacrificio_voz') ? [S('romain', 'Ayer no teníamos voz y hoy la usamos para esto. Bien. Para eso la recuperamos.', 'con la garganta todavía áspera')]
        : f('sacrificio_recuerdo') ? [S('romain', 'Le dimos al agua un recuerdo feliz. Yo no sé cuál era el mío. Vos, al menos, recibiste uno a cambio.', 'tocándose la sien')]
          : [S('romain', 'El agua nos cobró algo de lo que fuimos. A vos te devolvió algo. No es mal negocio, aunque duela.', 'mirando el fragmento envuelto en un paño')]),
      ...(f('efrit_muerto') ? [S('panchi', 'Yo tengo unos guanteletes que sueñan que se queman. Cada uno carga lo suyo. Comé.', 'alcanzándole pan sin mirarlo')]
        : [S('panchi', 'Tres djinns se fueron caminando gracias a nosotros. Eso no lo hizo ningún Azuran. Lo hicimos nosotros. Comé.', 'alcanzándole pan sin mirarlo')]),
      S('romain', 'Un nombre no es una sentencia, Pact. Es un platillo. Todavía falta saber qué ponés en el otro.', 'en voz baja, como quien reza'),
      S('pact', '¿Y si en el otro platillo está lo que hizo Azuran?', 'sentándose por fin'),
      choice('Pact los mira a los dos. Espera que alguien le diga qué hacer con ese nombre.', [
        opt('Que Romain lo pese: «Sos Pact. Azuran es herencia, no deuda»', hint(rel('pact', 'romain', 2), pole('pact', 1)), E(ch('pact', 'romain', 2), ar('pact', 1)),
          'Romain apoya la balanza vacía en la rodilla de Pact. No pesa nada. Pact se ríe por primera vez en días, una risa corta, de alivio.'),
        opt('Que Panchi lo resuelva a su modo: comer, dormir, pelear mañana', hint(rel('pact', 'panchi', 2)), E(ch('pact', 'panchi', 2)),
          'Panchi le llena la boca de pan y le tira una manta encima. «Mañana sos quien quieras. Hoy sos el que se come esto.» Pact duerme seis horas seguidas.'),
        opt('Que Pact busque el poder de Azuran: «Si fui eso, quiero saber cuánto»', hint(pole('pact', -1), rel('pact', 'romain', -1)), E(ar('pact', -1), ch('pact', 'romain', -1)),
          'Romain no contesta. Guarda la balanza. Pact mira sus manos hasta que el fuego se apaga, buscando una chispa dorada que no llega.'),
      ]),
    ],
  }],

  // ── Cap. IV: Zahir acusa a cada uno; el Cubo; Rabb oye su nombre ──
  m_cap4: [{
    cast: ['rabb', 'zyrthar'], sub: 'Después del Cubo · Rabb y Zyr\'thar', bg: 'dunas',
    body: ({ f }) => [
      N('Nadie quiere dormir cerca de un espejo. Arman el fuego en el patio de la biblioteca, lejos de cualquier superficie que brille. Zyr\'thar afila un cuchillo que ya está afilado. Rabb dibuja letras en la tierra con la punta de la espada y las borra con el pie.'),
      S('zyrthar', '«Sombra que corta sin pensar.» Me lo dijo un pájaro quemado. Pienso muchísimo antes de cortar, para que conste.', 'sin levantar la vista del cuchillo'),
      S('rabb', 'A mí me dijo que me vendí dos veces. Lo peor es que no sé si exageró o si se quedó corto.', 'borrando otra letra'),
      X('Arma de Pacto', 'Se quedó corto.', 'un susurro que sólo Rabb debería oír, pero Zyr\'thar levanta la cabeza'),
      S('zyrthar', 'Tu espada habla con la boca llena. ¿Siempre es tan maleducada?', 'con media sonrisa'),
      S('rabb', 'En el Cubo oí un nombre en una lengua que nadie habla. Creo que era el mío. Lo estoy escribiendo para no perderlo, y cada vez me sale distinto.', 'mostrándole la tierra garabateada'),
      ...(f('respuesta_desafio') ? [S('zyrthar', 'Le plantamos cara a Zahir y tembló como un chico. Eso me gustó más de lo que debería.', 'guardando el cuchillo')]
        : f('respuesta_sumisa') ? [S('zyrthar', 'Le dijimos «tenés razón» a un pájaro en llamas. No me lo voy a perdonar en una semana, mínimo.', 'guardando el cuchillo')]
          : [S('zyrthar', 'Le dijimos la verdad a Zahir y no nos fulminó. Anotalo también, ya que estás escribiendo.', 'guardando el cuchillo')]),
      choice('Rabb tiene un nombre a medio escribir en la tierra. Zyr\'thar lo mira.', [
        opt('Zyr\'thar le enseña a escribirlo en una letra que nadie más lee', hint(rel('rabb', 'zyrthar', 2), pole('rabb', 1)), E(ch('rabb', 'zyrthar', 2), ar('rabb', 1)),
          'Zyr\'thar le corrige el trazo con la punta del cuchillo: escritura drow, la que se usa para los contratos que no deben leerse. «Así lo guardás vos, no ella.» La espada, por una vez, se calla.'),
        opt('Zyr\'thar borra la tierra: «Los nombres son correas»', hint(pole('zyrthar', -1), pole('rabb', -1), rel('rabb', 'zyrthar', 1)), E(ar('zyrthar', -1), ar('rabb', -1), ch('rabb', 'zyrthar', 1)),
          'Pasa la bota por encima de las letras. Rabb la mira, y en vez de enojarse se ríe. «Puede ser.» La espada vibra contenta, y eso a ninguno de los dos le gusta.'),
        opt('Dejarlos en silencio, cada uno con lo suyo', hint('Sin cambios'), {},
          'Rabb sigue escribiendo y borrando. Zyr\'thar sigue afilando. Al amanecer los dos tienen algo nuevo y ninguno se lo cuenta al otro.'),
      ]),
    ],
  }],

  // ── Cap. V: el Coloso cae; la Postura ──
  m_cap5: [{
    cast: ['joren', 'panchi'], sub: 'La noche después del Coloso · Joren y Panchi', bg: 'plaza',
    body: ({ f }) => [
      N('La plaza todavía humea. Desde un tejado del Bajo se ve el Capitolio arrodillado, sangrando aceite violeta. Panchi tiene los nudillos en un balde de agua fría. Joren cuenta flechas, las que volvieron y las que no.'),
      S('panchi', 'Le rompimos la rodilla a un gigante de cuatro pisos. Decímelo de nuevo, que me gusta cómo suena.', 'sacando una mano del balde, roja como un ladrillo'),
      S('joren', 'Doce flechas. Volvieron siete. Las otras cinco están en algún lugar de esa plaza, en alguien.', 'sin sonreír'),
      ...(f('postura_orden') ? [S('panchi', 'Lo que no me gusta es haber peleado al lado de los muñecos de cobre del Vizir. Me pica la nuca.', 'frunciendo la barba'),
        S('joren', 'La Marca también decía que el orden protege. Después me mandó a cargar cajas que respiraban.', 'muy bajo')]
        : f('postura_pueblo') ? [S('panchi', 'Abrimos los túneles. Había una vieja con una gallina debajo del brazo. Me dio las gracias tres veces. Tres.', 'orgulloso como un chico'),
          S('joren', 'Ahora son nuestros. Si los encuentran, los cuelgan con nosotros. Eso también es proteger.', 'muy bajo')]
          : [S('panchi', 'Nos quedamos mirando cómo se caía todo y después compramos lo que quedaba. No sé si somos listos o carroñeros.', 'frunciendo la barba'),
            S('joren', 'En La Marca nos llamaban «los que llegan después». Nunca fue un elogio.', 'muy bajo')]),
      S('panchi', 'Ya está otra vez. La Marca. ¿Cuándo me vas a contar qué cargaste, Joren?', 'secándose las manos en el pantalón'),
      S('joren', 'Cuando sepa a quién.', 'guardando las flechas una por una'),
      choice('Panchi espera. Joren no va a decir nada más esta noche, a menos que alguien empuje.', [
        opt('Panchi empuja: «Mañana rompemos otro gigante. Y otro. Hasta que hables»', hint(pole('panchi', -1), rel('joren', 'panchi', 1)), E(ar('panchi', -1), ch('joren', 'panchi', 1)),
          'Joren casi sonríe. «Vas a quedarte sin gigantes.» «Hay muchos», dice Panchi, y golpea el balde. El agua salta. Es su forma de decir que va a esperar.'),
        opt('Panchi no empuja: se sienta a su lado y le pasa la mitad de su manta', hint(pole('panchi', 1), rel('joren', 'panchi', 2)), E(ar('panchi', 1), ch('joren', 'panchi', 2)),
          'Joren acepta la manta. Al rato dice una sola palabra: «Medinat». Panchi asiente como si fuera una frase entera. Para él, lo es.'),
        opt('Joren cuenta las cinco flechas perdidas en voz alta, una por una', hint(pole('joren', 1)), E(ar('joren', 1)),
          '«Una para el que corría con el chico. Una para el que no corrió.» Cuenta las cinco. Panchi lo escucha hasta el final sin interrumpir, que en él es un milagro.'),
      ]),
    ],
  }],

  // ── Cap. VI: Medinat, el muerto que respira, el Torneo, la venda de Ellie ──
  m_cap6: [{
    cast: ['panchi', 'joren'], sub: 'Medinat al-Rih, de madrugada · Panchi y Joren', bg: 'medinat',
    body: ({ f }) => [
      N('Medinat les presta un patio con un brasero y dos banquetas cojas. Panchi tiene un ojo cerrado por la hinchazón y la venda de lino de Ellie enrollada en la muñeca. Joren no se sacó el carcaj en toda la noche.'),
      S('panchi', 'Perdí. Decilo vos, que a mí no me sale.', 'mirando el fuego con el ojo que le queda'),
      S('joren', 'Perdiste. Contra alguien que no remató. Eso no es perder del todo.', 'sentándose en la banqueta más rota'),
      ...(f('torneo_digno') ? [S('panchi', 'Me dijo que era bueno. Que le dolió. Cuarenta años esperando que alguien me diga eso, y me lo dice la que me tumbó.', 'casi riéndose')] : []),
      ...(f('carta_ellie_leida') ? [S('panchi', '«No te pedí que ganaras. Te pedí que volvieras.» Eso dice la carta. ¿Qué carajo quiere decir eso, Joren?', 'con la voz rota de golpe')]
        : f('carta_ellie_sin_abrir') ? [S('panchi', 'Tengo una carta de ella acá, en el cinturón. No la abrí. Si la abro y dice lo que temo, no sé qué hago con las manos.', 'tocándose la cintura')] : []),
      ...(f('joren_traicionado') ? [
        S('joren', 'Yo enterré a un amigo dos veces. La segunda lo enterramos nosotros, Panchi. Ustedes. Yo no los paré.', 'con la mandíbula dura'),
        S('panchi', 'Yo tampoco los paré. Eso también es mío. No lo cargués solo.', 'sin mirarlo, que es como Panchi pide perdón'),
      ] : f('joren_perdon_ruta') ? [
        S('joren', 'Me sirvió agua. El hombre que enterré me sirvió agua y no me preguntó nada. Yo esperaba que me escupiera.', 'mirándose las manos'),
      ] : [
        S('joren', 'Me dijo el nombre del que lo vendió. Ahora tengo una flecha con dueño. No sé si eso es mejor.', 'acariciando el carcaj'),
      ]),
      S('panchi', 'Somos un par de idiotas. Uno pierde peleas a propósito y el otro entierra gente viva.', 'empujándolo con el hombro'),
      choice('Dos hombres duros en dos banquetas rotas. Alguno de los dos tiene que hablar primero.', [
        opt('Joren habla de La Marca: «Cargué una persona en una caja»', hint(rel('joren', 'panchi', 2), pole('joren', 1)), E(ch('joren', 'panchi', 2), ar('joren', 1)),
          'Lo cuenta entero, sin adornos. Panchi no dice nada; le pone una mano en la nuca, pesada como una piedra caliente, y la deja ahí hasta que Joren termina.'),
        opt('Panchi habla de Ellie: «Me fui de casa por pegarle a alguien que quería»', hint(rel('joren', 'panchi', 2), pole('panchi', 1)), E(ch('joren', 'panchi', 2), ar('panchi', 1)),
          'Es la primera vez que Panchi dice «quería» en voz alta. Joren lo escucha y al final dice: «Entonces volvé.» Panchi se ríe y llora al mismo tiempo, y culpa al humo.'),
        opt('Ninguno habla: Panchi propone pegarle a una pared hasta que amanezca', hint(pole('panchi', -1), pole('joren', -1)), E(ar('panchi', -1), ar('joren', -1)),
          'La pared de adobe pierde. Ellos también, un poco. Al amanecer los dos tienen los nudillos abiertos y nada dicho.'),
      ]),
    ],
  }],

  // ── Cap. VII: la Prueba de Azuran, Dahhak, la envidia de Rabb ──
  m_cap7: [{
    cast: ['pact', 'rabb', 'romain'], sub: 'Bajo la lluvia, después de la Iglesia · Pact, Rabb y Romain', bg: 'hammam',
    body: ({ f }) => [
      N('Se refugian bajo un arco del acueducto mientras llueve. El fuego cuesta: la leña está mojada y Romain sopla con una paciencia de sepulturero. Pact se mira las manos. Rabb le pasa la cantimplora sin que se la pida.'),
      ...(f('pact_recuerda') ? [S('pact', '«Ni dioses ni djinns merecen fe ciega.» Lo dije y la corona no me quemó. Ahora tengo que vivir con haberlo dicho.', 'abriendo y cerrando la mano')]
        : f('pact_corona') ? [S('pact', 'Todavía me arde en los brazos. No es dolor. Es como cuando uno tiene razón y nadie le cree.', 'con las venas doradas bajo la piel')]
          : [S('pact', 'La hice ceniza. A la corona. A él. Y ahora me sobra espacio adentro y no sé con qué llenarlo.', 'mirando la lluvia')]),
      S('rabb', 'Vos tenés un nombre de sobra y yo ninguno. Deberíamos poner un puesto en el Zoco.', 'con la espada sobre las rodillas'),
      X('Arma de Pacto', 'El ángel tiene dueño. Vos tenés dueña.', 'un murmullo que se mezcla con la lluvia'),
      S('rabb', 'Callate.', 'a la espada, sin levantar la voz; los otros dos fingen no haber oído'),
      ...(f('dahhak_muerto') ? [S('romain', 'Las voces de Dahhak se fueron con él. La risa en la pared de Farid también. Pesé eso toda la tarde. Todavía no sé de qué lado cae.', 'soplando la brasa')]
        : f('dahhak_devorado') ? [S('romain', 'Lo metimos en el cristal. Cien voces, adentro de algo que nos habla. No me pidan que lo pese. No me alcanza la balanza.', 'soplando la brasa, más fuerte de lo necesario')]
          : [S('romain', 'Lo dejamos vivo a cambio de un secreto. A veces la misericordia es sólo un mal negocio con buena cara. A veces no.', 'soplando la brasa')]),
      ...(f('pact_oyo_dahhak') ? [S('rabb', 'Escuchaste a Dahhak una hora entera, Pact. No te juzgo. Yo escucho a esta cosa todos los días.', 'golpeando la vaina con los nudillos')] : []),
      choice('La brasa por fin prende. Los tres tienen algo que decir y uno solo va a decirlo.', [
        opt('Pact a Rabb: «Si encuentro una forma de devolverte un nombre, es tuya»', hint(rel('pact', 'rabb', 2), pole('pact', 1)), E(ch('pact', 'rabb', 2), ar('pact', 1)),
          'Rabb lo mira un rato largo. «No me prometas cosas que dependen de dioses.» Pero esa noche duerme apoyado en el hombro de Pact, y la espada no dice nada.'),
        opt('Romain a Pact: «Pesá lo que hiciste hoy, no lo que fuiste»', hint(rel('pact', 'romain', 2), pole('romain', 1)), E(ch('pact', 'romain', 2), ar('romain', 1)),
          'Pact cierra los ojos y pesa. Romain no le pregunta el resultado. Es la primera vez que la balanza la sostiene otro.'),
        opt('Rabb a los dos: «Ustedes por lo menos saben a quién le deben»', hint(pole('rabb', -1), rel('pact', 'rabb', -1)), E(ar('rabb', -1), ch('pact', 'rabb', -1)),
          'Lo dice con más filo del que quería. Nadie contesta. La espada ronronea, satisfecha, y Rabb se va a dormir a la otra punta del arco.'),
      ]),
    ],
  }],

  // ── Cap. VIII: Razul en la mesa, el vaso de agua, Yasmin, la Ruta ──
  m_cap8: [{
    cast: ['romain', 'zyrthar', 'panchi'], sub: 'La noche de la visita · Romain, Zyr\'thar y Panchi', bg: 'bajo',
    body: ({ f }) => [
      ...(f('santuario_maldito') ? [N('No hay biblioteca esta noche: hay un callejón detrás de ella, un brasero robado y el olor de los libros quemados todavía en la ropa. Panchi no dijo una palabra desde que salieron.')]
        : [N('Cuando se va el último Qilaat, la biblioteca tarda en volver a respirar. Arman el fuego en el patio, con las sillas desparejadas que Razul no usó. El vaso sigue en la mesa. Nadie se anima a levantarlo.')]),
      S('zyrthar', 'La Casa Vel\'Shara le vende venenos desde antes de que yo naciera. Lo dijo como quien comenta el clima. Lo odio por eso. Y le creo.', 'con los brazos cruzados'),
      S('romain', 'Me dijo que una balanza vacía es la única honesta. Llevo años creyendo que era un castigo. Y él la llamó honesta.', 'mirando sus manos'),
      ...(f('razul_vaso') ? [S('panchi', 'Aisha le sirvió el vaso. Con la misma mano con la que me pega con el cucharón. No le tembló. Yo temblé por ella.', 'con un respeto raro en la voz')]
        : f('razul_sin_agua') ? [S('panchi', 'Le negamos el agua a un viejo. Estuvo bien. Estuvo bien, ¿no? Decime que estuvo bien.', 'demasiado rápido')] : []),
      ...(f('razul_yasmin') ? [S('romain', 'Yasmin tenía nueve años. Él la pesa todos los días desde hace tres mil. Yo sé lo que es eso. No quiero saberlo.', 'muy bajo')] : []),
      ...(f('razul_pacto') ? [S('zyrthar', 'Y le dimos el cristal. Vendimos a nuestro dios por una tregua. Bienvenidos a mi oficio.', 'con una sonrisa sin gracia')]
        : f('razul_rechazo') ? [S('zyrthar', 'Le dijimos que no. Dejó un reloj de arena en la mesa. Es lo más elegante que vi hacer a un enemigo.', 'mirando el reloj de reojo')]
          : f('razul_tregua') ? [S('zyrthar', 'Le compramos tiempo con un fragmento. El tiempo es lo único que nunca sale barato.', 'sin mirar a nadie')]
            : [S('zyrthar', 'Corrimos. A veces es lo más inteligente. Nunca es lo más lindo.', 'sin mirar a nadie')]),
      S('panchi', 'Lo que no entiendo es por qué me cayó bien. Quemó casas, mató gente, y me cayó bien. Eso me da más miedo que el Coloso.', 'pateando una brasa'),
      choice('Razul se fue, pero dejó algo sentado en cada uno. ¿Quién tiene razón esta noche?', [
        opt('Romain: «Entenderlo no es perdonarlo. Pero es empezar»', hint(rel('romain', 'panchi', 2), pole('romain', 1)), E(ch('panchi', 'romain', 2), ar('romain', 1)),
          'Panchi asiente despacio, como quien prueba un diente flojo. «Empezar», repite. Romain le pasa la balanza para que la sostenga un rato. A Panchi le parece livianísima.'),
        opt('Zyr\'thar: «Un hombre que entiende todo es el más peligroso»', hint(rel('romain', 'zyrthar', 2), pole('zyrthar', 1)), E(ch('romain', 'zyrthar', 2), ar('zyrthar', 1)),
          'Romain la mira con sorpresa y algo de gratitud. «Tenés razón.» Zyr\'thar se encoge de hombros. «Suelo tenerla. Me pagan por eso.» Esa noche hace la primera guardia sin que se lo pidan.'),
        opt('Panchi: «Si vuelve, le sirvo yo el agua. Y después le pego»', hint(pole('panchi', -1), rel('panchi', 'zyrthar', 1)), E(ar('panchi', -1), ch('panchi', 'zyrthar', 1)),
          'Zyr\'thar se ríe de verdad, una risa corta y sorprendida. Romain no. Panchi se acuesta con los puños cerrados y sueña con vasos de agua que nunca terminan de llenarse.'),
      ]),
    ],
  }],

  // ── Cap. IX: el Jardín, la sombra de Zyr'thar, el Marid, «los elegí por sus heridas» ──
  m_cap9: [{
    cast: ['zyrthar', 'rabb'], sub: 'Después del Jardín · Zyr\'thar y Rabb', bg: 'espejos',
    body: ({ f }) => [
      N('Vuelven del Jardín con las máscaras en la mano. Encienden el fuego en una fuente seca del barrio de los nobles, entre cipreses que suspiran. La sombra de Zyr\'thar llega un segundo tarde a sentarse.'),
      S('rabb', 'Tu sombra se sentó después que vos. Lo vi.', 'en voz baja, sin acusar'),
      ...(f('zyr_sombra_acepta') ? [S('zyrthar', 'Le dejé apagar cuatro faroles. Lo hizo mejor que yo. Eso es lo que no me deja dormir.', 'mirando la pluma oscura en el suelo')]
        : f('zyr_sombra_resiste') ? [S('zyrthar', 'Le dije «quieta» y se quedó quieta. Rabiosa, pero quieta. Como un perro que todavía no sabe que no es tuyo.', 'mirando la pluma oscura en el suelo')]
          : [S('zyrthar', 'Es un pedazo del Simurg. Una pluma que se me pegó. Hermana de un río. Mi vida era más simple cuando sólo mataba gente.', 'mirando la pluma oscura en el suelo')]),
      S('rabb', 'Somos dos que llevan a alguien adentro. Vos lo llevás detrás. Yo lo llevo en la vaina.', 'tocando la empuñadura'),
      X('Arma de Pacto', 'Ella no tiene contrato. Qué desperdicio.', 'apenas un roce de metal'),
      S('zyrthar', 'Decile a tu espada que la mía no firma con desconocidos.', 'sin pestañear'),
      ...(f('marid_libre') ? [S('rabb', 'El Marid volvió al mar. Pact rompió los pestillos uno por uno. Hay días en que este grupo me sorprende.', 'casi tierno')]
        : f('marid_atado') ? [S('rabb', 'Atamos un río con su propio fragmento. La espada aplaudió. Cuando la espada aplaude, algo hicimos mal.', 'serio')] : []),
      S('zyrthar', 'Zahir dijo que nos eligió por nuestras heridas. Que entró por la puerta abierta. Yo pensaba que mis puertas estaban cerradas con llave.', 'muy bajo, casi para la sombra'),
      choice('La sombra se apoya en la rodilla de Zyr\'thar, como un gato. Rabb la mira y ella lo mira a él.', [
        opt('Rabb le tiende la mano a la sombra, no a Zyr\'thar', hint(rel('rabb', 'zyrthar', 2), pole('zyrthar', 1)), E(ch('rabb', 'zyrthar', 2), ar('zyrthar', 1)),
          'La sombra duda y después le roza los dedos: fría, suave. Zyr\'thar no dice nada durante un rato. Después dice «gracias» tan bajo que podría ser el viento de los cipreses.'),
        opt('Zyr\'thar: «Lo que se lleva adentro se usa. Igual que tu espada»', hint(pole('zyrthar', -1), pole('rabb', -1), rel('rabb', 'zyrthar', 1)), E(ar('zyrthar', -1), ar('rabb', -1), ch('rabb', 'zyrthar', 1)),
          'Rabb asiente, porque es cómodo asentir. La sombra se estira hasta el borde del fuego y se queda ahí, contenta. La espada también. Ninguno de los dos duerme.'),
        opt('Rabb: «Si un día me pierdo en la espada, cortá vos»', hint(rel('rabb', 'zyrthar', 2), pole('rabb', 1)), E(ch('rabb', 'zyrthar', 2), ar('rabb', 1)),
          'Zyr\'thar lo mira mucho tiempo. «Te cobro barato», dice. Es lo más parecido a una promesa que alguien le hizo a Rabb desde que tiene memoria.'),
      ]),
    ],
  }],

  // ── Cap. X: Farid y el Lich, la voz de Romain, Aisha y el frasco, el Pacto Original de Rabb ──
  m_cap10: [{
    cast: ['romain', 'rabb'], sub: 'Al salir de la cripta · Romain y Rabb', bg: 'bajo',
    body: ({ f }) => [
      N('Trece escalones hacia arriba. Arriba los espera una noche sin canción. Aisha se llevó a Farid a dormir y el barrio, por primera vez en semanas, no tiene ghuls en las esquinas. Hacen fuego en la boca del cementerio.'),
      ...(f('romain_voz') ? [
        N('Romain no puede hablar. Le dio la voz al Lich a cambio del alma de Farid. Escribe con un palo en la ceniza, letra grande y prolija, de quien copió muchas oraciones.'),
        N('«¿Qué te dijo antes de caer?», escribe Romain.'),
      ] : [S('romain', '¿Qué te dijo antes de caer, Rabb? Te vi la cara en la escalera.', 'con la balanza envuelta en el paño')]),
      S('rabb', '«Tu espada no recuerda lo que olvidaste. Recuerda lo que fuiste.» Lindo, ¿no? Como un epitafio con trampa.', 'mirando el fuego'),
      ...(f('rabb_activado') ? [S('rabb', 'Acepté. Me puso en la mano un recuerdo que no es mío y que es mío. Ahora sé hacer cosas que no aprendí. Me asusta lo bien que se siente.', 'con la voz plana')]
        : f('rabb_rechaza_pacto') ? [S('rabb', 'Le dije que no. La espada está muda desde entonces. Nunca pensé que iba a extrañar que me insultaran.', 'golpeando la vaina, sin respuesta')] : []),
      ...(f('aisha_oyo_marido') ? [f('romain_voz') ? N('Romain escribe: «Aisha oyó a su marido tararear. Yo ya no puedo tararear. Me parece un precio justo.»') : S('romain', 'Aisha oyó a su marido. Tararear, nada más. Eso pesa más que todo el oro de la ciudad.', 'muy bajo')] : []),
      ...(f('huerfanos_descansan') ? [S('rabb', 'Los trece chicos descansaron con tu rito. Te vi mover los labios. No hacía falta voz, por lo visto.', 'casi sonriendo')]
        : f('huerfanos_destruidos') ? [S('rabb', 'Lo de los trece chicos… la espada no dijo nada. Ni ella. Fue lo peor.', 'sin mirar a Romain')] : []),
      choice(f('romain_voz') ? 'Romain le alcanza el palo a Rabb. Le toca escribir a él.' : 'Romain le ofrece la balanza. Rabb la mira como a un animal desconocido.', [
        opt('Rabb escribe su nombre en la ceniza, el que se inventó', hint(rel('rabb', 'romain', 2), pole('rabb', 1)), E(ch('rabb', 'romain', 2), ar('rabb', 1)),
          'Escribe «Rabb Locke». Romain lo lee, asiente y le pone al lado una marca: el sello de Kelemvor que se usa para los nombres que no se borran. Rabb no sabía que existía. Ahora sí.'),
        opt('Romain pesa a Rabb, aunque él no quiera', hint(rel('rabb', 'romain', 1), pole('romain', -1)), E(ch('rabb', 'romain', 1), ar('romain', -1)),
          'La balanza se inclina hacia un lado y después hacia el otro, sin decidir. Romain la guarda con cara dura. Rabb se ríe sin ganas: «Hasta tu dios duda de mí».'),
        opt('Ninguno escribe ni pesa: se quedan mirando el cementerio', hint(rel('rabb', 'romain', 1)), E(ch('rabb', 'romain', 1)),
          'Hay noches en que no se arregla nada. Ésta es una. Pero se quedan los dos hasta que el fuego es ceniza, y eso cuenta.'),
      ]),
    ],
  }],

  // ── Cap. XI: la Mina, Gul-Amarat, Samira e Idris, Abril, el sacrificio ──
  m_cap11: [{
    cast: ['panchi', 'pact'], sub: 'A la salida de la Mina · Panchi y Pact', bg: 'prison',
    body: ({ f }) => [
      N('Acampan a media legua de la boca de la mina, donde el desierto se vuelve gris. Nadie quiere estar más cerca. Panchi cocina lentejas con lo que queda. Le echa la sal al final, como dice Aisha.'),
      ...(f('sacrificio_elegido') ? [
        N('Hay un lugar vacío junto al fuego. Nadie lo ocupa. Panchi sirve un plato de más y lo deja ahí, humeando, hasta que se enfría.'),
        S('pact', 'Se quedó del otro lado de la puerta. Yo tengo dos almas y me quedé de este lado. Algo está mal en la cuenta.', 'con la voz quebrada'),
        S('panchi', 'No hay cuenta. Hay alguien que eligió. Comé, que si no, eligió para nada.', 'empujándole el plato, brusco y tierno'),
      ] : [
        S('pact', 'Lo oí silbar. Al hermano de Samira. Un brazo en una pared, silbando desafinado. No me lo voy a sacar de la cabeza.', 'mirando hacia la mina'),
        S('panchi', 'Ella lo oyó decir «Sami». Eso sí te lo tenés que llevar. Lo otro dejalo en la pared.', 'revolviendo la olla'),
      ]),
      ...(f('abril_salvada') ? [S('panchi', 'Y Abril está acá. Dibujando a todos dormidos. A mí me hizo la nariz más grande. Mentirosa.', 'señalando con la cuchara')]
        : f('abril_perdida') ? [S('pact', 'Abril no salió. Colgaron su cuaderno de un clavo. Yo voté por seguir. Yo.', 'sin poder terminar')] : []),
      S('panchi', 'Cuando volvía para allá abajo, a sacar a Samira del brazo, no tenía rabia. Primera vez en mi vida que empujo a alguien sin rabia. Raro.', 'mirándose las manos'),
      S('pact', 'Eso que hiciste tiene nombre. Azuran lo tenía. Se llamaba «sostener».', 'casi sonriendo'),
      choice('La olla hierve. Pact y Panchi están más cansados que nunca y más cerca que nunca.', [
        opt('Pact: «Enseñame a empujar sin rabia»', hint(rel('pact', 'panchi', 2), pole('panchi', 1)), E(ch('pact', 'panchi', 2), ar('panchi', 1)),
          'Panchi se para, lo pone en guardia y le enseña a empujar con la palma abierta, desde la cadera. «Así. Como si cerraras una puerta para que no entre el frío.» Practican hasta que las lentejas se pegan.'),
        opt('Panchi: «Y vos dejá de pedir perdón por estar vivo»', hint(rel('pact', 'panchi', 2), pole('pact', 1)), E(ch('pact', 'panchi', 2), ar('pact', 1)),
          'Pact abre la boca para pedir perdón por pedir perdón, y se calla. Panchi le da un golpe en el hombro que lo tumba de la piedra. Se ríen como chicos.'),
        opt('Panchi: «La próxima pared que tenga brazos, la rompo entera»', hint(pole('panchi', -1)), E(ar('panchi', -1)),
          'Pact no lo contradice. Mira la mina un largo rato. Esa noche ninguno de los dos come mucho.'),
      ]),
    ],
  }],

  // ── Cap. XII: la Ciudadela, Kaelen, Nythra, Romain pesa a Razul ──
  m_cap12: [{
    cast: ['joren', 'zyrthar'], sub: 'La noche antes del Eclipse · Joren y Zyr\'thar', bg: 'dunas',
    body: ({ f }) => [
      N('Salen de la Ciudadela por una escalera que nadie vigila. Acampan en las dunas, fuera de la ciudad, porque ninguno quiere dormir bajo un techo de Zaryab esta noche. Joren y Zyr\'thar se quedan despiertos: los dos encontraron hoy a alguien de su pasado.'),
      ...(f('joren_mata') ? [S('joren', 'Una flecha. Kaelen ni se sorprendió. Esperaba sentir algo cuando cayera. Sentí que se me acababan las flechas con nombre.', 'desarmando el arco')]
        : f('joren_captura') ? [S('joren', 'Lo até para que lo juzgue Samira. Un hombre atado no es un hombre perdonado. Pero tampoco está muerto. Me alcanza.', 'desarmando el arco')]
          : f('joren_perdona') ? [S('joren', 'Lo dejé ir. Kaelen no entendió por qué. Yo tampoco. Pero el amigo que me sirvió agua lo habría entendido.', 'desarmando el arco')]
            : [S('joren', 'Hoy no apunté a nadie con nombre. Pensé que iba a sentirme más liviano.', 'desarmando el arco')]),
      ...(f('velshara_mata') ? [S('zyrthar', 'Nythra cayó sobre sus pergaminos. Mi hermana. Fue limpio. Madre estaría orgullosa. Eso es lo peor de todo.', 'sin expresión')]
        : f('velshara_expone') ? [S('zyrthar', 'La Casa Vel\'Shara arde en público por mí. Nythra va a vivir sabiendo que fui yo. Eso es más cruel que un cuchillo, y lo sé.', 'sin expresión')]
          : f('velshara_perdona') ? [S('zyrthar', 'Le dije que no era mi hermana. Y me fui. Nunca me fui de ningún lado sin dejar a alguien sangrando. Me tiemblan las manos.', 'mostrándolas, y sí, tiemblan')]
            : [S('zyrthar', 'Mi hermana estaba ahí. Vendiendo venenos. Igual que siempre.', 'sin expresión')]),
      S('joren', 'Mañana se termina todo. Lo que sea que hagamos con Zahir.', 'mirando el cielo, donde la luna ya tiene una mordida'),
      ...(f('romain_peso_santo') ? [S('zyrthar', 'Romain pesó a Razul y la balanza se inclinó a la compasión. Si eso le pasa a un tirano de tres mil años, quizás haya esperanza hasta para mí.', 'con una media sonrisa')]
        : f('romain_peso_verdugo') ? [S('zyrthar', 'Romain pesó a Razul con justicia. Lo vi en su cara: no le gustó lo que la balanza dijo de él mismo.', 'en voz baja')] : []),
      ...(f('razul_muerto') ? [S('joren', 'Razul está muerto. La ciudad no tiene dueño. Hace dos años eso me habría parecido una buena noticia.', '')]
        : f('razul_aliado') ? [S('joren', 'Y el Vizir pelea con nosotros mañana. Si me lo decían el primer día, le apuntaba al que me lo dijera.', '')] : []),
      choice('Dos cazadores bajo un cielo mordido. Mañana el Eclipse. Esta noche, sólo esto.', [
        opt('Joren: «Si mañana caigo, cuidá a Panchi. Se hace el duro»', hint(rel('joren', 'zyrthar', 2), pole('joren', 1)), E(ch('joren', 'zyrthar', 2), ar('joren', 1)),
          '«Y vos cuidá a Rabb, que se hace el gracioso», contesta ella. Se dan la mano como dos mercenarios que cierran un contrato, y ninguno la suelta enseguida.'),
        opt('Zyr\'thar: «Mañana, que la sombra haga lo que tenga que hacer»', hint(pole('zyrthar', -1), rel('joren', 'zyrthar', 1)), E(ar('zyrthar', -1), ch('joren', 'zyrthar', 1)),
          'Joren no le discute. Afila una última flecha y se la da. «Para tu sombra», dice. Ella la guarda sin preguntar.'),
        opt('Los dos se quedan despiertos hasta el amanecer, sin hablar', hint(rel('joren', 'zyrthar', 1), pole('zyrthar', 1)), E(ch('joren', 'zyrthar', 1), ar('zyrthar', 1)),
          'No hablan. Pero cuando el sol sale, mordido, Zyr\'thar le apoya la cabeza en el hombro un segundo, uno solo. Joren no se mueve para no espantarla.'),
      ]),
    ],
  }],

  // ── Cap. XIII: después del Eclipse, la última fogata (el elenco se arma con los que quedan) ──
  m_cap13: [],

  // ── Misiones personales: el dueño del arco y quien mejor lo conoce ──
  p_romain: [{
    cast: ['romain', 'pact'], sub: 'Después del Templo Quemado · Romain y Pact', bg: 'prison',
    body: ({ f }) => [
      N('Romain enciende el fuego con una viga del templo quemado. Dice que la madera ya sabe arder; que sería un desperdicio no dejarla terminar.'),
      S('romain', 'Los Inquisidores. No djinns, no herejes. Hombres con un sello del Conclave. Y yo les recé durante años.', 'mirando el sello en la piedra'),
      S('pact', 'Te vi en la pelea. Pegabas con el bastón como si cada golpe fuera una pregunta.', 'sentándose del otro lado del fuego'),
      ...(f('romain_venganza') ? [S('romain', 'Elegí la venganza. Las garras me queman las manos. Kelemvor no dijo nada. Supongo que el silencio también es una sentencia.', 'con las manos vendadas')]
        : f('romain_pruebas') ? [S('romain', 'Tengo pruebas. Las voy a mostrar donde duela. Eso es justicia o es orgullo; todavía no lo sé.', 'guardando el sello')]
          : f('romain_perdon') ? [S('romain', 'Lo dejé ir. Al Inquisidor. Le perdoné un templo. ¿Sabés lo que pesa eso en una balanza? Nada. Y lo es todo.', 'casi temblando')] : []),
      S('pact', 'Yo no sé de dioses, Romain. Sé de gente que se levanta. Vos te levantaste.', 'tendiéndole la mano'),
      choice('Romain mira la mano de Pact. Detrás, su templo termina de arder.', [
        opt('Tomar la mano de Pact y levantarse', hint(rel('pact', 'romain', 2), pole('romain', 1)), E(ch('pact', 'romain', 2), ar('romain', 1)),
          'Romain se levanta. «Gracias», dice, y no aclara a quién. Pact sospecha que a él, y a Kelemvor, y a la viga que sigue ardiendo.'),
        opt('Quedarse sentado: «Dejame pesar esto solo»', hint(pole('romain', -1)), E(ar('romain', -1)),
          'Pact baja la mano y se queda cerca, sin decir nada. Romain pesa toda la noche. Al amanecer la balanza sigue vacía y él tiene la cara de piedra.'),
      ]),
    ],
  }],
  p_pact: [{
    cast: ['pact', 'romain'], sub: 'Después de la Corona Invertida · Pact y Romain', bg: 'dunas',
    body: ({ f }) => [
      N('Vuelven del templete sin techo con cenizas doradas en las botas. Pact no habló en todo el camino. En la biblioteca, Romain prepara té y lo sirve en dos tazas desparejadas.'),
      S('pact', 'Peleé contra mi reflejo. Coronado, sin alas. Tenía mi cara y era mejor que yo en todo.', 'sosteniendo la taza sin tomar'),
      ...(f('pact_juicio_romain') ? [S('romain', 'Me pediste que te pesara. Lo hice. No te voy a decir el resultado: no porque sea malo, sino porque es tuyo.', 'sin mirarlo')]
        : f('pact_acepta_corona') ? [S('romain', 'Aceptaste la corona y dijiste tu verdad en voz alta. Te vi. Se te enderezó la espalda. No sé si me gustó.', 'con franqueza')]
          : f('pact_sella_memoria') ? [S('romain', 'Sellaste la memoria otra vez. Es tu derecho. Pero un recuerdo sellado sigue pesando, aunque no se vea.', 'con suavidad')] : []),
      S('pact', 'Azuran juzgaba. Medía el poder de los dioses. Lo quemaron por decir que nadie merece fe ciega. Me gusta ese tipo. Me da miedo parecerme.', 'tomando por fin un sorbo'),
      S('romain', 'Juzgar no es lo malo. Lo malo es juzgar sin mirar. Vos mirás demasiado. Es el otro problema.', 'casi sonriendo'),
      choice('El té se enfría. Pact todavía tiene ceniza dorada en las uñas.', [
        opt('Pact: «Si un día me pongo la corona, avisame si me ves cambiar»', hint(rel('pact', 'romain', 2), pole('pact', 1)), E(ch('pact', 'romain', 2), ar('pact', 1)),
          '«Te aviso», dice Romain. «Y si no me escuchás, te pego con el bastón.» Es la primera broma que Pact le oye. Se ríe tanto que derrama el té.'),
        opt('Pact: «Quizás ser mejor que yo no sea tan malo»', hint(pole('pact', -1)), E(ar('pact', -1)),
          'Romain no contesta. Recoge las tazas. Pact se queda mirando las cenizas doradas hasta que se apagan solas.'),
      ]),
    ],
  }],
  p_rabb: [{
    cast: ['rabb', 'zyrthar'], sub: 'Después del Nombre en el Arma · Rabb y Zyr\'thar', bg: 'espejos',
    body: ({ f }) => [
      N('La biblioteca está a oscuras salvo por una vela. Rabb tiene la espada desenvainada sobre la mesa, como un invitado incómodo. Zyr\'thar entra sin hacer ruido y se sienta enfrente.'),
      S('zyrthar', '¿Le estás haciendo un interrogatorio? Porque así no se hace. Primero se le ofrece algo.', 'apoyando los codos en la mesa'),
      S('rabb', '«Ese no es tu nombre.» Eso dijo. Y el Oráculo dijo que nunca firmé nada, o sea que firmé. Me están rodeando, Zyr.', 'sin apartar la vista de la hoja'),
      ...(f('rabb_libre') ? [S('rabb', 'Así que la destruí. Bueno, la cambié por una daga que no habla. Silencio total. Es horrible.', 'levantando la daga nueva, decepcionado')]
        : f('rabb_acepta') ? [S('rabb', 'Acepté el nombre que tengo. Rabb Locke. Lo inventé yo o me lo pusieron, da igual: lo uso yo.', 'con una firmeza nueva')]
          : f('rabb_memoria') ? [S('rabb', 'Voy a investigar. Cada pista que encuentro tiene mi letra. Eso no me tranquiliza.', 'golpeando la mesa con un dedo')] : []),
      X('Arma de Pacto', 'La drow sabe. Las drow siempre saben.', 'un hilo de voz desde el acero'),
      S('zyrthar', 'Sé que los contratos tienen cláusulas de salida. Siempre. Hasta los de Vel\'Shara. Hay que leer la letra chica.', 'mirando la hoja directo, como a un rival'),
      choice('Rabb y Zyr\'thar frente a una espada que escucha.', [
        opt('Leer juntos «la letra chica» de la hoja, runa por runa', hint(rel('rabb', 'zyrthar', 2), pole('rabb', 1)), E(ch('rabb', 'zyrthar', 2), ar('rabb', 1)),
          'Se pasan la noche copiando runas. Zyr\'thar encuentra una que se repite al revés. «Esto es una firma», dice. «Y no es la tuya.» Rabb siente algo raro: esperanza.'),
        opt('Envainar la espada y dejar que ella hable mañana', hint(pole('rabb', -1)), E(ar('rabb', -1)),
          'Rabb envaina. La espada ronronea. Zyr\'thar lo mira con una decepción que no se molesta en ocultar, y se va a dormir.'),
      ]),
    ],
  }],
  p_joren: [{
    cast: ['joren', 'panchi'], sub: 'Después del Manifiesto · Joren y Panchi', bg: 'zoco',
    body: ({ f }) => [
      N('Joren no vuelve a la biblioteca. Panchi lo encuentra en un tejado del Zoco, con el manifiesto de La Marca en la mano y el arco sin cuerda.'),
      S('panchi', 'Te busqué en tres tabernas. En ninguna te conocían, lo cual es raro, porque tenés cara de deber plata.', 'subiendo con dificultad'),
      S('joren', '«La mercancía era una persona.» Yo cargué esas cajas, Panchi. Yo les puse la tapa.', 'sin mirarlo'),
      ...(f('joren_medinat') ? [S('joren', 'Mañana salgo para Medinat. Con o sin ustedes.', 'apretando el papel')]
        : f('joren_promesa') ? [S('joren', 'Prometí terminar lo de acá primero. Odio las promesas. Las cumplo todas.', 'apretando el papel')]
          : f('joren_nomadas') ? [S('joren', 'Los Nómadas del Vacío van a preguntar por el camino. Yo nunca pedí ayuda. Me dio vergüenza.', 'apretando el papel')] : []),
      S('panchi', 'Yo le rompí la mandíbula a un monje que me quería. Por una pavada. Así que no te hagas el único monstruo del tejado.', 'sentándose a su lado, resoplando'),
      choice('Joren tiene el manifiesto en la mano. Panchi tiene la mano abierta.', [
        opt('Joren le da el manifiesto a Panchi: «Guardalo vos»', hint(rel('joren', 'panchi', 2), pole('joren', 1)), E(ch('joren', 'panchi', 2), ar('joren', 1)),
          'Panchi lo dobla en cuatro y lo guarda en el cinturón, junto a sus propias cosas pesadas. «Cuando lo quieras, está acá.» Joren respira como si se hubiera sacado una piedra del pecho.'),
        opt('Joren quema el manifiesto: «Ya sé el camino de memoria»', hint(pole('joren', -1), rel('joren', 'panchi', 1)), E(ar('joren', -1), ch('joren', 'panchi', 1)),
          'El papel arde rápido. Joren tensa la cuerda del arco otra vez. Panchi no dice nada, pero no se va: se queda hasta que Joren baja del tejado.'),
      ]),
    ],
  }],
  p_zyr: [{
    cast: ['zyrthar', 'joren'], sub: 'Después de los Cuchillos · Zyr\'thar y Joren', bg: 'zoco',
    body: ({ f }) => [
      N('Zyr\'thar limpia un cuchillo que no usó. Joren la mira desde el otro lado del fuego, con la paciencia de quien espera a un animal herido.'),
      S('zyrthar', '«La Casa no olvida. No perdona. No muere.» Tienen el lema más aburrido del Subsuelo. Lo bordan en las sábanas.', 'sin levantar la vista'),
      ...(f('zyr_eliminada') ? [S('zyrthar', 'La espía ya no va a repetirlo. Rápido, limpio. Como me enseñaron. Odio que me salga tan bien.', 'pasando el trapo una vez más')]
        : f('zyr_info') ? [S('zyrthar', 'Me dijo nombres. Cinco. Uno es de mi hermana. Lo sabía. Igual me dolió oírlo.', 'pasando el trapo una vez más')]
          : f('zyr_mensaje') ? [S('zyrthar', 'La dejé ir con un mensaje. «Vengan.» Una palabra. Quería ver si me temblaba la voz. No me tembló.', 'pasando el trapo una vez más')] : []),
      S('joren', 'Yo también tuve una casa que no perdonaba. La dejé. Me siguió igual. Se aprende a dormir con un ojo.', 'echando una rama al fuego'),
      S('zyrthar', '¿Y con los dos? ¿Se aprende a dormir con los dos ojos cerrados?', 'por primera vez, mirándolo'),
      choice('Zyr\'thar espera una respuesta de verdad. Es raro que la pida.', [
        opt('Joren: «Con alguien de guardia, sí. Dormí. Yo miro»', hint(rel('joren', 'zyrthar', 2), pole('zyrthar', 1)), E(ch('joren', 'zyrthar', 2), ar('zyrthar', 1)),
          'Zyr\'thar duda mucho. Después se acuesta de espaldas al fuego. Joren hace la guardia entera. Ella duerme hasta el mediodía y nadie se lo menciona jamás.'),
        opt('Joren: «No. Nunca. Acostumbrate»', hint(pole('zyrthar', -1), pole('joren', -1)), E(ar('zyrthar', -1), ar('joren', -1)),
          'Ella asiente, como quien confirma un precio. Hacen guardia los dos, toda la noche, cada uno mirando hacia un lado distinto.'),
      ]),
    ],
  }],
  p_panchi: [{
    cast: ['panchi', 'romain'], sub: 'Después del Golem · Panchi y Romain', bg: 'choza',
    body: ({ f }) => [
      N('La biblioteca tiene agujeros nuevos en las paredes. Panchi los tapa con barro, uno por uno, con una prolijidad que nadie le conocía. Romain le alcanza el barro.'),
      S('panchi', 'Era como yo. Roto, enojado, solo. Le hablé como me hubiera gustado que me hablaran.', 'alisando el barro con el pulgar'),
      ...(f('golem_aliado') ? [S('romain', 'Y ahora te obedece. Con una runa en la frente. ¿Eso es lo que te hubiera gustado que te hicieran?', 'sin dureza, pero sin rodeos')]
        : f('nucleo_golem') ? [S('romain', 'Le sacaste el núcleo. Rápido. Dolió menos de lo que duele vivir así, quizás. Kelemvor lo recibe.', 'con suavidad')]
          : f('golem_prestado') ? [S('romain', 'Le diste un enemigo que no eras vos. Eso es lo más sabio que te vi hacer, Panchi.', 'alcanzándole más barro')] : []),
      S('panchi', 'Me echaron del monasterio por pegar de más. Mi maestro dijo que la ira es un fuego que se come la casa de uno primero. Yo pensé que exageraba.', 'con la voz baja, rara en él'),
      S('romain', 'Los fuegos que se comen casas los conozco. Al mío no lo prendí yo. Al tuyo sí. Eso significa que lo podés apagar.', 'mirando una grieta'),
      choice('Panchi tiene las manos llenas de barro y el ceño menos fruncido que de costumbre.', [
        opt('Panchi: «Enseñame a rezar. O a lo que sea que hacés vos»', hint(rel('panchi', 'romain', 2), pole('panchi', 1)), E(ch('panchi', 'romain', 2), ar('panchi', 1)),
          'Romain le enseña a contar respiraciones. Panchi se duerme en la cuarta. Romain lo tapa con una manta y termina de arreglar la pared solo.'),
        opt('Panchi: «El fuego es lo único que me hace fuerte»', hint(pole('panchi', -1)), E(ar('panchi', -1)),
          'Romain no le discute. Le pasa el último puñado de barro. Panchi lo aprieta tan fuerte que se le escurre entre los dedos.'),
      ]),
    ],
  }],
};

// ═══════════════════════════ LA ÚLTIMA FOGATA (tras el Cap. XIII) ═══════════════════════════
function lastFire(x: Ctx): Node[] | null {
  const { c, f } = x; const cast = topByChem(c, x.alive, 3); if (cast.length < 2) return null;
  const [a, b, d] = cast;
  const end = f('final_liberar') ? 'El cielo tiene un pájaro más, y ya no es de nadie.' : f('final_gobernar') ? 'Zahir gobierna. La ciudad aprende su nombre a la fuerza.'
    : f('final_espiral') ? 'La Espiral vuelve a girar. Alguien, dentro de mil años, va a encontrar este fuego.' : f('final_destruir') ? 'Los fragmentos son polvo. Zaryab sobrevive, con culpa.'
      : f('final_silencio') ? 'Los dioses se callaron. Por primera vez, la ciudad se oye a sí misma.' : f('final_equilibrio') ? 'La balanza quedó quieta. Nadie sabe cuánto dura eso.' : 'El Eclipse pasó. Lo que viene ahora no lo escribió ningún dios.';
  const toastLines: Record<string, string> = {
    romain: 'Por los que pesamos. Y por los que nos pesaron a nosotros.', pact: 'Por el segundo aliento. Y por el tercero, si hace falta.',
    rabb: 'Por los nombres. Los que nos dieron y los que nos inventamos.', joren: 'Por los que no llegamos a salvar. Y por los que sí.',
    zyrthar: 'Por la letra chica. Que esta vez la leímos.', panchi: '¡Por las lentejas! Con la sal al final.',
  };
  return [
    T('Después del Eclipse · ' + cast.map(nm).join(', '), 'dunas', 'La última fogata'),
    N(`Lejos de las catacumbas, en las mismas dunas por las que llegaron, encienden un fuego. ${end}`),
    S(a, toastLines[a], 'levantando un cuenco de agua'),
    S(b, toastLines[b], 'levantando el suyo'),
    ...(d ? [S(d, toastLines[d], 'último, con la voz gastada')] : []),
    ...(c.dead.filter(p => WHO[p]).length ? [N(`Dejan un cuenco de más en la arena por ${c.dead.filter(p => WHO[p]).map(nm).join(' y ')}. Nadie lo toca.`)] : []),
    choice('El fuego se apaga despacio. ¿Quién dice la última palabra?', [
      opt(`${nm(a)}`, hint(rel(a, b, 2)), E(ch(a, b, 2)), `${nm(a)} no dice nada. Se queda mirando las brasas y sonríe. Es suficiente.`),
      opt(`${nm(b)}`, hint(rel(a, b, 2)), E(ch(a, b, 2)), `${nm(b)} dice «mañana» y nadie le pregunta mañana qué. Por primera vez, mañana es una palabra que les pertenece.`),
    ]),
  ];
}

// ═══════════════════════════ CONVERSACIONES GENÉRICAS (una por par) ═══════════════════════════
type Gen = (x: Ctx) => Node[];
const GEN: Record<string, Gen> = {
  [pairKey('pact', 'romain')]: () => [
    N('Pact limpia el mandoble. Romain lustra la balanza. Ninguno de los dos necesita hacerlo.'),
    S('romain', '¿Alguna vez te preguntaste si Azuran pesaba almas, como yo? Juzgar y medir no son tan distintos.', ''),
    S('pact', 'Él medía dioses. Vos medís gente. Me gusta más lo tuyo: la gente pesa más.', 'sin dejar de pasar el trapo'),
    S('romain', 'Eso es lo más teológico que dijiste nunca. No se lo cuentes a Kelemvor, que se pone celoso.', 'con una sonrisa mínima'),
    choice('Una noche tranquila, rara. ¿De qué hablan?', [
      opt('De qué harían si todo terminara mañana', hint(rel('pact', 'romain', 2)), E(ch('pact', 'romain', 2)), 'Pact quiere un huerto. Romain quiere un templo sin balanza. Se ríen de los dos sueños, y los guardan igual.'),
      opt('De lo que callan: la corona, la fe rota', hint(rel('pact', 'romain', 1), pole('romain', 1), pole('pact', 1)), E(ch('pact', 'romain', 1), ar('romain', 1), ar('pact', 1)), 'Hablan hasta tarde. Lo que dicen no sale de ese fuego. Al día siguiente se miran distinto, como dos que se saben un secreto.'),
    ]),
  ],
  [pairKey('rabb', 'zyrthar')]: () => [
    N('Zyr\'thar juega con una moneda entre los nudillos. Rabb la sigue con los ojos, hipnotizado.'),
    S('zyrthar', 'Apuesto a que tu espada no sabe hacer esto.', 'haciendo desaparecer la moneda'),
    X('Arma de Pacto', 'Sé hacer desaparecer gente.', 'con desdén metálico'),
    S('rabb', 'No le hagas caso. Es una envidiosa.', 'tapando la empuñadura con la capa'),
    choice('La moneda reaparece detrás de la oreja de Rabb.', [
      opt('Que Zyr\'thar le enseñe el truco', hint(rel('rabb', 'zyrthar', 2)), E(ch('rabb', 'zyrthar', 2)), 'Rabb lo aprende al tercer intento. Es la primera cosa en meses que sabe hacer y que no le enseñó la espada.'),
      opt('Que apuesten algo de verdad: un secreto', hint(rel('rabb', 'zyrthar', 1), pole('zyrthar', -1)), E(ch('rabb', 'zyrthar', 1), ar('zyrthar', -1)), 'Gana Zyr\'thar, claro. Rabb paga con un secreto. Ella lo guarda en algún lugar donde guarda cosas que algún día podrían servirle.'),
    ]),
  ],
  [pairKey('joren', 'panchi')]: () => [
    N('Panchi ronca. Joren hace guardia. Después Panchi deja de roncar y se sienta a su lado, sin decir que estaba despierto.'),
    S('panchi', 'Te toca dormir. Dormí. Yo miro.', 'bostezando'),
    S('joren', 'Vos mirás mal. Mirás para adelante. Hay que mirar para los costados.', 'sin moverse'),
    S('panchi', 'Para los costados estás vos. Por eso funciona.', 'dándole un codazo'),
    choice('Dos guardias para una sola noche.', [
      opt('Joren duerme', hint(rel('joren', 'panchi', 2), pole('joren', 1)), E(ch('joren', 'panchi', 2), ar('joren', 1)), 'Joren duerme. Panchi mira para adelante y, de vez en cuando, para los costados. Le sale bastante bien.'),
      opt('Hacen la guardia los dos', hint(rel('joren', 'panchi', 1)), E(ch('joren', 'panchi', 1)), 'Hacen la guardia los dos, en silencio. Al amanecer Panchi está dormido sobre el hombro de Joren, que no se mueve.'),
    ]),
  ],
  [pairKey('pact', 'rabb')]: () => [
    N('Rabb y Pact comparten la cantimplora, como en la Iglesia. Se volvió costumbre.'),
    S('rabb', 'Tu ángel y mi espada deberían conocerse. Organizar una cena. Nosotros ponemos el vino.', ''),
    S('pact', 'Azuran no come. Creo. Nunca le pregunté.', 'pensándolo en serio'),
    S('rabb', 'Ves, ese es el problema. Vivimos con gente adentro y no les preguntamos nada.', 'con una risa cansada'),
    choice('La cantimplora va y viene.', [
      opt('Hacerse una pregunta cada uno, en serio', hint(rel('pact', 'rabb', 2), pole('rabb', 1)), E(ch('pact', 'rabb', 2), ar('rabb', 1)), 'Pact pregunta qué recuerda Rabb de su infancia. Rabb dice «nada» y después, despacio, «un perro». Es un comienzo.'),
      opt('Seguir con las bromas', hint(rel('pact', 'rabb', 1)), E(ch('pact', 'rabb', 1)), 'Siguen con las bromas hasta que se acaba el agua. A veces reírse es la forma de no preguntar, y está bien.'),
    ]),
  ],
  [pairKey('joren', 'pact')]: () => [
    N('Joren le arregla una correa del peto a Pact sin que se lo pida. Tiene manos de artesano.'),
    S('pact', 'Gracias. ¿Dónde aprendiste?', ''),
    S('joren', 'Cargando cajas para gente mala. Las correas se cortaban. Las cajas no podían caerse.', 'sin levantar la vista'),
    S('pact', 'Yo protegía algo, creo. Antes. No me acuerdo qué. Me quedó la costumbre de pararme adelante.', 'tocándose el pecho'),
    choice('Dos hombres que protegen por costumbre.', [
      opt('Joren: «Entonces pará adelante. Yo cubro atrás»', hint(rel('joren', 'pact', 2), pole('joren', 1)), E(ch('joren', 'pact', 2), ar('joren', 1)), 'Lo dicen como un pacto de soldados. Al día siguiente, en combate, se nota.'),
      opt('Pact: «¿Y quién te cubre a vos, Joren?»', hint(rel('joren', 'pact', 1), pole('pact', 1)), E(ch('joren', 'pact', 1), ar('pact', 1)), 'Joren no sabe qué contestar. Termina la correa y se va. Pero a la mañana se acomoda, sin decir nada, al lado de Pact.'),
    ]),
  ],
  [pairKey('pact', 'zyrthar')]: () => [
    N('Zyr\'thar observa a Pact como se observa a un blanco. Él lo nota y le sostiene la mirada.'),
    S('zyrthar', 'Tenés un punto ciego a la izquierda. Ahí donde tendrías un ala, si la sacaras.', 'evaluando'),
    S('pact', 'Lo sé. Por eso siempre te pongo a mi izquierda.', 'tranquilo'),
    S('zyrthar', '…Eso fue casi un cumplido. No lo repitas.', 'desviando la mirada por primera vez'),
    choice('Zyr\'thar no está acostumbrada a que confíen en ella.', [
      opt('Pact insiste: «Confío en vos»', hint(rel('pact', 'zyrthar', 2), pole('zyrthar', 1)), E(ch('pact', 'zyrthar', 2), ar('zyrthar', 1)), '«Error de principiante», dice ella. Pero al día siguiente se pone a su izquierda antes de que él lo pida.'),
      opt('Pact se calla: deja que ella decida', hint(rel('pact', 'zyrthar', 1)), E(ch('pact', 'zyrthar', 1)), 'Zyr\'thar decide no decidir. Pero el punto ciego, desde esa noche, nunca vuelve a quedar descubierto.'),
    ]),
  ],
  [pairKey('panchi', 'pact')]: () => [
    N('Panchi intenta enseñarle a Pact a cocinar. Es un desastre. Los dos están cubiertos de harina.'),
    S('panchi', 'Las alas te las dio un dios y no sabés amasar. Qué desperdicio de milagro.', 'golpeando la masa'),
    S('pact', 'Las alas no ayudan. Tiran harina para todos lados.', 'sacudiéndose'),
    S('panchi', 'Ah, ¿viste? Ahora sí te reís. Hace una semana que no te oigo.', 'satisfecho'),
    choice('El pan, si sale, va a salir horrible.', [
      opt('Insistir hasta que salga', hint(rel('pact', 'panchi', 2)), E(ch('pact', 'panchi', 2)), 'Sale horrible. Se lo comen igual, enteros, y Panchi declara que es el mejor pan de Zaryab.'),
      opt('Que Panchi le cuente de su monasterio mientras amasa', hint(rel('pact', 'panchi', 1), pole('panchi', 1)), E(ch('pact', 'panchi', 1), ar('panchi', 1)), 'Panchi habla de su maestro, del pan del monasterio, de la mañana en que lo echaron. Amasa más despacio. El pan sale un poco mejor.'),
    ]),
  ],
  [pairKey('rabb', 'romain')]: () => [
    N('Romain lee en voz baja un libro de oraciones. Rabb escucha desde el otro lado del fuego, haciéndose el dormido.'),
    S('rabb', '¿Kelemvor tiene registro de los que se olvidan de sí mismos? Pregunto por un amigo.', 'sin abrir los ojos'),
    S('romain', 'Kelemvor recibe a todos por su nombre verdadero. Incluso a los que no lo saben.', 'cerrando el libro'),
    S('rabb', 'Entonces alguien, en algún lado, sabe cómo me llamo. Qué alivio. Qué injusticia.', 'abriendo un ojo'),
    choice('Romain tiene una respuesta y no sabe si darla.', [
      opt('Romain: «Mientras tanto, te llamo Rabb. Y lo anoto»', hint(rel('rabb', 'romain', 2), pole('rabb', 1)), E(ch('rabb', 'romain', 2), ar('rabb', 1)), 'Romain escribe «Rabb Locke» en la última página del libro de oraciones. Rabb lo ve y no dice nada durante mucho rato.'),
      opt('Romain: «Quizás sea mejor no saberlo»', hint(rel('rabb', 'romain', 1), pole('rabb', -1)), E(ch('rabb', 'romain', 1), ar('rabb', -1)), 'Rabb lo piensa. «Quizás.» La espada vibra, de acuerdo. A ninguno de los dos le gusta estar de acuerdo con ella.'),
    ]),
  ],
  [pairKey('joren', 'romain')]: () => [
    N('Joren se acerca a Romain con una pregunta que trae masticada desde hace días.'),
    S('joren', 'Si alguien carga una caja, sin saber qué hay adentro… ¿tu balanza lo pesa igual?', 'mirando el suelo'),
    S('romain', 'Mi balanza pesa lo que hiciste después de saberlo.', 'despacio'),
    S('joren', 'Después de saberlo me escapé.', ''),
    S('romain', 'Y ahora estás acá, preguntando. Eso también se pone en el platillo.', ''),
    choice('Joren tiene la mandíbula apretada.', [
      opt('Joren: «Entonces voy a seguir poniendo cosas en el platillo»', hint(rel('joren', 'romain', 2), pole('joren', 1)), E(ch('joren', 'romain', 2), ar('joren', 1)), 'Romain asiente. Es todo. Joren duerme mejor esa noche, sin saber por qué.'),
      opt('Joren: «Hay cosas que no se compensan»', hint(rel('joren', 'romain', 1), pole('joren', -1)), E(ch('joren', 'romain', 1), ar('joren', -1)), '«Es verdad», dice Romain, y no lo consuela con mentiras. Joren lo respeta más por eso.'),
    ]),
  ],
  [pairKey('romain', 'zyrthar')]: () => [
    N('Zyr\'thar le alcanza a Romain un frasco sin etiqueta.'),
    S('zyrthar', 'Veneno de araña de Vel\'Shara. Si alguna vez tenés que dar una muerte limpia, esto no duele.', 'como quien regala un perfume'),
    S('romain', 'Es el regalo más horrible y más considerado que me hicieron nunca.', 'sosteniéndolo con dos dedos'),
    S('zyrthar', 'Es mi especialidad.', ''),
    choice('Romain tiene un frasco de muerte en la mano.', [
      opt('Romain lo guarda: «La misericordia a veces tiene esta forma»', hint(rel('romain', 'zyrthar', 2), pole('romain', 1)), E(ch('romain', 'zyrthar', 2), ar('romain', 1)), 'Zyr\'thar parpadea, sorprendida de que lo entienda. «Exacto.» Se quedan un rato en un silencio que no es incómodo.'),
      opt('Romain se lo devuelve: «No mato a nadie que no haya pesado»', hint(rel('romain', 'zyrthar', 1), pole('zyrthar', 1)), E(ch('romain', 'zyrthar', 1), ar('zyrthar', 1)), 'Zyr\'thar lo guarda sin ofenderse. «Algún día vas a pesar más rápido.» Romain espera que no.'),
    ]),
  ],
  [pairKey('panchi', 'romain')]: () => [
    N('Panchi le trae a Romain un plato de lentejas sin preguntar si tiene hambre.'),
    S('panchi', 'Comé. Los clérigos se olvidan de comer porque se creen que rezar alimenta.', 'poniéndole la cuchara en la mano'),
    S('romain', 'Rezar alimenta. Pero las lentejas también.', 'aceptando'),
    S('panchi', 'Ah, ¿ves? Ahí está. Teología práctica.', 'satisfecho'),
    choice('Romain come. Panchi lo mira como una madre severa.', [
      opt('Romain le pregunta por su maestro', hint(rel('panchi', 'romain', 2), pole('panchi', 1)), E(ch('panchi', 'romain', 2), ar('panchi', 1)), 'Panchi habla de él con un cariño que se le escapa por las orejas. Romain escucha y, al final, dice una oración breve por el viejo monje. Panchi se emociona y lo niega.'),
      opt('Comen en silencio', hint(rel('panchi', 'romain', 1)), E(ch('panchi', 'romain', 1)), 'Comen en silencio. Romain repite el plato. Panchi considera eso una victoria personal.'),
    ]),
  ],
  [pairKey('joren', 'rabb')]: () => [
    N('Rabb prueba a tirar con el arco de Joren. La flecha sale torcida y se clava en una palmera, muy lejos del blanco.'),
    S('joren', 'Bien. Mataste una palmera. Estaba amenazando a alguien.', 'impasible'),
    S('rabb', '¿Acabás de hacer un chiste? Que alguien llame a Panchi.', 'bajando el arco, maravillado'),
    X('Arma de Pacto', 'Yo no fallo.', 'ofendida desde la vaina'),
    choice('Joren le tiende otra flecha.', [
      opt('Rabb intenta otra vez, con paciencia', hint(rel('joren', 'rabb', 2), pole('rabb', 1)), E(ch('joren', 'rabb', 2), ar('rabb', 1)), 'La quinta flecha da en el blanco. Rabb grita como un chico. La espada se pasa el resto de la noche enfurruñada.'),
      opt('Rabb devuelve el arco: «Prefiero lo que sé»', hint(rel('joren', 'rabb', 1), pole('rabb', -1)), E(ch('joren', 'rabb', 1), ar('rabb', -1)), 'Joren se encoge de hombros. Rabb vuelve a la espada. Ella ronronea. Algo se cerró sin hacer ruido.'),
    ]),
  ],
  [pairKey('panchi', 'rabb')]: () => [
    N('Rabb le cuenta a Panchi un chiste que le contó la espada. Panchi no se ríe.'),
    S('panchi', 'Ese chiste es malísimo. Tu espada no tiene gracia.', 'masticando'),
    S('rabb', 'Ya sé. Pero es el único que me sé. Los otros me los olvidé.', 'con una sonrisa triste'),
    S('panchi', 'Entonces te enseño uno mío. Hay un enano, un elfo y un djinn en una taberna…', 'acomodándose'),
    choice('Panchi va a contar un chiste. Esto puede salir muy mal.', [
      opt('Escuchar el chiste entero', hint(rel('panchi', 'rabb', 2), pole('rabb', 1)), E(ch('panchi', 'rabb', 2), ar('rabb', 1)), 'El chiste es peor que el de la espada. Rabb se ríe hasta llorar. Ahora tiene un chiste que es suyo.'),
      opt('Que la espada lo interrumpa', hint(rel('panchi', 'rabb', 1), pole('rabb', -1)), E(ch('panchi', 'rabb', 1), ar('rabb', -1)), 'La espada susurra el final antes que Panchi. Panchi la mira con odio. Rabb pide perdón por algo que no hizo, otra vez.'),
    ]),
  ],
  [pairKey('joren', 'zyrthar')]: () => [
    N('Joren y Zyr\'thar hacen la ronda juntos. Caminan igual: sin ruido, mirando para lados opuestos.'),
    S('zyrthar', 'Tres en el tejado de la izquierda. Borrachos.', 'sin girar la cabeza'),
    S('joren', 'Cuatro. Uno está dormido.', ''),
    S('zyrthar', 'Odio cuando tenés razón.', 'casi sonriendo'),
    choice('Una ronda tranquila. Demasiado.', [
      opt('Apostar quién ve más cosas antes del amanecer', hint(rel('joren', 'zyrthar', 2)), E(ch('joren', 'zyrthar', 2)), 'Empatan en cuarenta y dos. Ninguno acepta el empate. Siguen discutiendo durante el desayuno.'),
      opt('Hablar de las casas que dejaron atrás', hint(rel('joren', 'zyrthar', 1), pole('zyrthar', 1), pole('joren', 1)), E(ch('joren', 'zyrthar', 1), ar('zyrthar', 1), ar('joren', 1)), 'Hablan poco y con frases cortas. Es suficiente. Los dos saben lo que cuesta irse de un lugar que te sigue.'),
    ]),
  ],
  [pairKey('panchi', 'zyrthar')]: () => [
    N('Panchi le ofrece dátiles a Zyr\'thar, como en la cisterna. Ella acepta uno. Siempre acepta uno.'),
    S('panchi', '¿Por qué siempre uno? Tengo veinte.', 'sacudiendo la bolsa'),
    S('zyrthar', 'Porque si acepto dos, me empiezan a gustar. Y si me gustan, me volvés a ofrecer.', 'masticando despacio'),
    S('panchi', '¿Y qué tiene de malo que te ofrezca?', 'confundido'),
    S('zyrthar', 'Nada. Ese es el problema.', ''),
    choice('Panchi sostiene la bolsa abierta.', [
      opt('Zyr\'thar acepta un segundo dátil', hint(rel('panchi', 'zyrthar', 2), pole('zyrthar', 1)), E(ch('panchi', 'zyrthar', 2), ar('zyrthar', 1)), 'Lo acepta. Panchi sonríe como si hubiera ganado el Torneo. Ella hace como que no lo ve.'),
      opt('Zyr\'thar cierra la bolsa: «Uno es suficiente»', hint(rel('panchi', 'zyrthar', 1)), E(ch('panchi', 'zyrthar', 1)), 'Panchi guarda la bolsa, pero al día siguiente le vuelve a ofrecer. Y al otro. Ella acepta uno cada vez.'),
    ]),
  ],
};

// ═══════════════════════════ selección del elenco ═══════════════════════════
const alivePCs = (c: Campaign) => c.party.filter(p => WHO[p] && !c.dead.includes(p));
const tension = (c: Campaign, a: string, b: string) => { const x = c.arq?.[a] ?? 0, y = c.arq?.[b] ?? 0; return x * y < 0 ? Math.abs(x) + Math.abs(y) : 0; };
function pairs(alive: string[]): [string, string][] { const out: [string, string][] = []; for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) out.push([alive[i], alive[j]]); return out; }
/** Los N vivos con más química entre sí (empieza por el mejor par y suma al que más química tenga con ellos). */
function topByChem(c: Campaign, alive: string[], n: number): string[] {
  const ps = pairs(alive); if (!ps.length) return alive.slice(0, n);
  ps.sort((p, q) => chemPoints(c.chem, pairKey(...q)) - chemPoints(c.chem, pairKey(...p)));
  const out = [...ps[0]];
  while (out.length < n) {
    const rest = alive.filter(p => !out.includes(p)); if (!rest.length) break;
    rest.sort((p, q) => out.reduce((s, o) => s + chemPoints(c.chem, pairKey(o, q)), 0) - out.reduce((s, o) => s + chemPoints(c.chem, pairKey(o, p)), 0));
    out.push(rest[0]);
  }
  return out;
}
/** Par para la conversación genérica: el de más química o, si hay arquetipos opuestos fuertes, el par en tensión (alterna por capítulo). */
export function pickPair(c: Campaign, alive: string[], seed: number): { pair: [string, string]; tense: boolean } | null {
  const ps = pairs(alive); if (!ps.length) return null;
  const unused = ps.filter(p => !has(c, `fogata_g_${pairKey(...p)}`)); const pool = unused.length ? unused : ps;
  const byChem = [...pool].sort((p, q) => chemPoints(c.chem, pairKey(...q)) - chemPoints(c.chem, pairKey(...p)) || pairKey(...p).localeCompare(pairKey(...q)));
  const byTension = [...pool].sort((p, q) => tension(c, ...q) - tension(c, ...p) || pairKey(...p).localeCompare(pairKey(...q)));
  const tp = byTension[0];
  if (tension(c, ...tp) >= 2 && (seed % 2 === 1 || chemPoints(c.chem, pairKey(...byChem[0])) < 3)) return { pair: tp, tense: true };
  return { pair: byChem[0], tense: false };
}
const seedOf = (q: string) => [...q].reduce((s, ch2) => s + ch2.charCodeAt(0), 0);

function generic(x: Ctx): Node[] | null {
  const pk = pickPair(x.c, x.alive, seedOf(x.q)); if (!pk) return null;
  const [a, b] = pk.pair; const key = pairKey(a, b); const g = GEN[key]; if (!g) return null;
  const intro: Node[] = pk.tense ? [N(`Entre ${nm(a)} y ${nm(b)} hay algo tirante esta noche: ${nm(a)} camina hacia ${POLOS[a][(x.c.arq[a] ?? 0) > 0 ? 0 : 1]}, y ${nm(b)} hacia ${POLOS[b][(x.c.arq[b] ?? 0) > 0 ? 0 : 1]}. Igual se sientan al mismo fuego.`)] : [];
  return [T(`${nm(a)} y ${nm(b)}`, 'dunas'), ...intro, ...g(x), { t: 'fx', e: { flags: [`fogata_g_${key}`] } }];
}

/** Escena de fogata para después de `questId`, o null si ya se jugó, no corresponde o no hay con quién. */
export function campfire(c: Campaign, questId: string): Node[] | null {
  const done = `fogata_${questId}_done`;
  if (has(c, done) || !(questId in CHAPTER)) return null;
  const alive = alivePCs(c); if (alive.length < 2) return null;
  const x: Ctx = { c, f: fl2 => has(c, fl2), alive, q: questId };
  let body: Node[] | null = null;
  if (questId === 'm_cap13') body = lastFire(x);
  else {
    const sc = CHAPTER[questId].find(s => s.cast.every(p => alive.includes(p)));
    body = sc ? [T(sc.sub, sc.bg), ...sc.body(x)] : generic(x);
  }
  if (!body) return null;
  return [...body, { t: 'fx', e: { flags: [done] } }];
}

/** Para pruebas y para el validador: todas las claves con escena propia. */
export const CAMPFIRE_QUESTS = Object.keys(CHAPTER);
export const CAMPFIRE_GENERIC = Object.keys(GEN);
/** Para exportar el guion: todas las escenas de fogata de `questId` en su versión base (todos vivos, sin banderas). */
export function CAMPFIRE_SCENES(questId: string, base?: Campaign): Node[] {
  const c = base ?? ({ flags: [], arq: {}, chem: {}, dead: [], party: Object.keys(WHO) } as unknown as Campaign);
  const x: Ctx = { c, f: () => false, alive: Object.keys(WHO), q: questId };
  return (CHAPTER[questId] ?? []).flatMap(sc => [T(sc.sub, sc.bg), ...sc.body(x)]);
}
