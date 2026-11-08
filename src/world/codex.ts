// El Códice: lo que la compañía (y quien lee por encima de su hombro) sabe del mundo de Zaryab.
// Cada entrada se desbloquea por el avance real de la campaña y suma párrafos (`more`) a medida que se toman decisiones.
// Las lecturas se guardan en `c.flags` con prefijo `cx_` (`cx_<id>` leída; `cx_<id>@<n>` leída con n párrafos), así viajan con la partida.
import type { Campaign } from '../state';
import { has } from '../state';

export type CodexCat = 'Dioses' | 'Facciones' | 'Lugares' | 'Personas' | 'Objetos y conceptos' | 'La compañía';
export const CODEX_CATS: CodexCat[] = ['Dioses', 'Facciones', 'Lugares', 'Personas', 'Objetos y conceptos', 'La compañía'];
export type Entry = { id: string; cat: CodexCat; title: string; unlock: (c: Campaign) => boolean; text: string; more?: { when: (c: Campaign) => boolean; text: string }[] };
type P = (c: Campaign) => boolean;

// ── condiciones ──
const always: P = () => true;
/** Alguna de las banderas. */
const f = (...xs: string[]): P => c => xs.some(x => has(c, x));
/** Todas las banderas. */
const all = (...xs: string[]): P => c => xs.every(x => has(c, x));
const q = (id: string): P => c => c.quests[id] === 'done';
const or = (...ps: P[]): P => c => ps.some(p => p(c));
const and = (...ps: P[]): P => c => ps.every(p => p(c));
const not = (p: P): P => c => !p(c);
const repAtLeast = (k: string, n: number): P => c => (c.rep[k] ?? 0) >= n;
const repAtMost = (k: string, n: number): P => c => (c.rep[k] ?? 0) <= n;
const bond = (k: string, n: number): P => c => (c.bond[k] ?? 0) >= n;
const poleA = (pc: string): P => c => (c.arq[pc] ?? 0) > 0;
const poleB = (pc: string): P => c => (c.arq[pc] ?? 0) < 0;
const frag = (id: string): P => f(`frag_${id}`, `frag_${id}_roto`);
const found = (id: string): P => c => c.found.includes(id);
const alive = (pc: string): P => c => !c.dead.includes(pc);

export const CODEX: Entry[] = [
  // ═════════════════════════ DIOSES ═════════════════════════
  { id: 'simurg', cat: 'Dioses', title: 'El Simurg', unlock: always,
    text: 'Antes de la ciudad hubo un pájaro. Los viejos del desierto dicen que sus alas daban sombra a cuarenta ciudades y que su canto hacía brotar pozos donde la arena había jurado no dar nada. En Zaryab ya nadie le reza por su nombre: la gente del Bajo murmura a «un dios sin nombre» sin saber que le está hablando a él. Hace siglos que nadie ve su sombra, y nadie recuerda quién la apagó. Los copistas lo dibujan siempre de perfil, como si mirarlo de frente fuera de mala educación.',
    more: [
      { when: f('cap0_done', 'cap1_done'), text: 'Los cuatro pilares torcidos del desierto no son de piedra: son lo que queda de una pluma cuando el pájaro que la perdió lleva demasiado tiempo muerto. Guardan una sola idea, repetida desde antes de las ciudades: «volvé».' },
      { when: f('cap7_done'), text: 'Zahir dejó escapar, una noche, que cuando era pájaro tenía veintitrés plumas de oro. El cronista anota la frase con cuidado: «cuando era pájaro». No dijo «cuando servía al pájaro».' },
      { when: f('sabe_simurg_dividido', 'voz_simurg'), text: 'En la Sala de las Voces de la Ciudadela quedó grabado un grito que no es un grito: el sonido que hace algo enorme cuando decide partirse en pedazos para no tener que decidir. El Simurg no fue asesinado. Se dividió.' },
      { when: f('cap13_done'), text: 'En las Catacumbas, la máscara cayó: Zahir no es un siervo del Simurg sino uno de sus pedazos, el que se negó a dormir. Los otros fragmentos son el resto del pájaro, desparramado en las heridas de una ciudad.' },
      { when: f('final_liberar'), text: 'Coda: el día del Eclipse, una sombra con alas pasó sobre Zaryab. Duró lo que dura un suspiro. Los niños del Bajo juran que olía a lluvia.' },
    ] },
  { id: 'zahir', cat: 'Dioses', title: 'Zahir, el de las plumas doradas', unlock: f('cap0_done', 'cap1_done'),
    text: 'Djinn de voz amable y plumas doradas que espera a los muertos en un vacío blanco. A la compañía, recién ejecutada por orden del Vizir, le ofreció una segunda vida a cambio de ser apóstoles del Simurg. Habla de salvación con la paciencia de un maestro y con la puntualidad de un cobrador. Les dejó un cristal en el pecho que late como un segundo corazón. «No les di la segunda vida para que la gasten paseando», repite cuando los días pasan sin que la historia avance.',
    more: [
      { when: f('zahir_regalo_1'), text: 'Su primer regalo fue un nombre: Pact abrió los ojos y dijo «Mirabel». Zahir sonrió como sonríe quien acaba de prestar dinero.' },
      { when: f('desconfia_zahir', 'desconfianza_zahir', 'zahir_pregunta', 'zahir_rechazo_1'), text: 'La compañía ya le hizo preguntas que no quiso contestar. El cronista observa que Zahir contesta todo menos una cosa: qué piensa hacer cuando esté entero.' },
      { when: f('cap7_done'), text: '«Los elegí por sus heridas», admitió tras la caída de Dahhak. Lo dijo como un elogio. Nadie lo tomó así.' },
      { when: f('cap11_done'), text: 'En los últimos días cuenta el tiempo en voz alta. Ya no ordena: ruega. Y ruega mejor de lo que ordenaba.' },
      { when: f('cap13_done'), text: '«Quiero que me perdonen. Pero también quiero que no me perdonen, porque de lo contrario habría que aceptar que lo que hice estuvo bien.» La máscara cayó en las Catacumbas: Zahir es un fragmento del Simurg que se partió por voluntad propia y usó a la compañía como cuerpo.' },
      { when: f('pacto_roto'), text: 'Tras el Pacto Roto vive en la biblioteca como un hombre cualquiera, alto y cansado, sin plumas. «No quería ser dios», dijo. «Quería que alguien me cantara.»' },
    ] },
  { id: 'dahhak', cat: 'Dioses', title: 'Dahhak, el de los cien cuellos', unlock: f('cap3_done'),
    text: 'Primer falso dios que la compañía encontró de frente: un hombre de dedos largos y sonrisa generosa que colecciona reflejos de sí mismo y los prefiere porque no contestan. Sus fieles, las Si\'lats, le ofrecían el cuello; él se los quedaba. Construyó —o robó— un Coloso de hierro y oro para custodiar Zaryab y después decidió que el Coloso ya no la custodiaría a ella. «Qué hermoso sería ser un dios al que nadie tuviera que pedirle nada», dicen que dijo. En su fragmento late la herida de Farid.',
    more: [
      { when: f('cap5_done'), text: 'El Coloso cayó en la Plaza Central y el Capitolio quedó sangrando aceite violeta. Dahhak huyó hacia el oeste, a la Iglesia del Simurg, a rezarle a un dios que él mismo había vaciado.' },
      { when: f('dahhak_muerto'), text: 'Murió en la Iglesia. Las Si\'lats recogieron los cuellos que quedaron sobre las losas, los lavaron y los enterraron: su manera de pedir perdón a un dios que las había devorado.' },
      { when: f('dahhak_vivo'), text: 'La compañía lo perdonó a cambio de un secreto. Vive. Dicen que todavía habla con los reflejos y que, por primera vez, alguno le contesta.' },
      { when: f('dahhak_devorado'), text: 'El cristal absorbió sus cuellos. Algo de Dahhak late ahora en el pecho de la compañía, y el cronista prefiere no escribir qué.' },
      { when: f('frag_dahhak_roto'), text: 'Su fragmento se partió contra el altar. Cien voces gritaron a la vez y se callaron. Farid despertó llorando sin saber por qué.' },
      { when: f('frag_dahhak_zahir'), text: 'Su fragmento fue a manos de Zahir. Esa noche Farid durmió sin hablar con los cuellos torcidos.' },
    ] },
  { id: 'marid', cat: 'Dioses', title: 'El Marid del Jardín', unlock: or(f('cap6_done', 'q_m_marid'), q('m_marid')),
    text: 'Señor de las aguas que bajó del mar a una ciudad de arena y nunca encontró el camino de vuelta. Los nobles lo alojaron en el estanque del Jardín de los Suspiros y lo adoraron con fiestas de máscaras, como se adora a un animal raro. Custodia un fragmento del meteorito que le pesa en el pecho como una piedra en un odre. Se lo vio, disfrazado, como un linyera de dientes blancos en los caminos del Bajo. Su fragmento duerme cerca de la sombra de Zyr\'thar.',
    more: [
      { when: f('marid_riyam'), text: 'Riyam, uno de los djinns que la compañía liberó en los acueductos, intercedió ante su padre. El Marid escuchó a su hija antes que a los dioses.' },
      { when: f('marid_libre'), text: 'Lo dejaron volver al mar. El Jardín olió a sal durante una semana y el estanque quedó, por fin, quieto.' },
      { when: f('marid_atado'), text: 'Quedó atado al servicio del culto. El agua obedece, pero el cronista oyó que en las noches de luna golpea el borde del estanque como quien golpea una puerta.' },
      { when: f('marid_dialogo'), text: 'Le hablaron sin ayuda y le ofrecieron el recuerdo de un río. El Marid lloró agua dulce.' },
      { when: f('marid_enemigo'), text: 'Quedó enemigo de la compañía. Las fuentes de la ciudad gotean a destiempo desde entonces.' },
      { when: f('frag_marid_roto'), text: 'Su fragmento se abrió y el agua que salió era limpia. La sombra de Zyr\'thar se quedó quieta, y ella respiró.' },
    ] },
  { id: 'mazhar', cat: 'Dioses', title: 'Al-Mazhar, el Lich de las Trece Caras', unlock: f('cap9_done'),
    text: 'Tercer falso dios, enterrado bajo el Bajo Zaryab. Lleva trece máscaras y cada una canta una voz distinta: la de un muerto que alguien no terminó de llorar. Su canción se filtra por las rendijas hasta las camas de los niños, y Farid aprendió a cantarle de vuelta. Es el dios de los duelos que nadie cierra. Aisha lo oyó, una noche, cantar con la voz de su marido muerto; desde entonces deja la ventana cerrada aunque haga calor.',
    more: [
      { when: f('mazhar_nana'), text: 'Romain le cantó la nana de la biblioteca, desafinada y torpe. Desde los estantes, desde la casa de Aisha, las voces del barrio se sumaron, y la canción del Lich se apagó sin combate.' },
      { when: f('huerfanos_descansan'), text: 'Sus trece niños se sentaron a la mesa, apoyaron la frente y se deshicieron en arena blanca. Romain dijo el rito de Kelemvor sin que le temblara la voz.' },
      { when: f('huerfanos_culto'), text: 'Sus trece niños duermen ahora en un rincón de la biblioteca, tapados con mantas. Nadie preguntó cuántos entienden lo que son.' },
      { when: f('cap10_done'), text: 'Al-Mazhar cayó, y con él se abrió la Mina de Alabastro: el Lich custodiaba, sin saberlo, la puerta de algo peor.' },
      { when: f('frag_mazhar_roto'), text: 'Romain rompió su fragmento con el dorso de la balanza. Las trece máscaras se apagaron juntas.' },
    ] },
  { id: 'gulamarat', cat: 'Dioses', title: 'Gul-Amarat, el del silencio', unlock: f('cap10_done'),
    text: 'Cuarto falso dios: un gusano de brazos humanos enroscado en el corazón de la Mina de Alabastro. No tiene ojos, pero sabe dónde están. Los brazos que le crecen del cuerpo fueron de mineros, y algunos todavía llevan anillos. Es el dios del silencio que el Conclave prefirió no nombrar: cerraron la mina, declararon el pozo agotado y siguieron cobrando el alabastro. «Esta noche el silencio ha vuelto a respirar. No se lo digás a nadie», reza la última nota del libro de la Veta.',
    more: [
      { when: f('samira_habla_idris'), text: 'Una de sus manos llevaba el anillo de Idris, el marido de Samira. Cuando ella le habló, los dedos dibujaron en la piedra el compás de una respiración.' },
      { when: f('gusano_muerto'), text: 'Cayó. Los brazos se deshicieron como cera al sol y, durante un instante, cada mano soltó lo que apretaba.' },
      { when: f('gusano_dormido', 'gusano_huida'), text: 'La compañía pasó a su lado sin despertarlo. Sigue allí abajo, respirando, contando a los que no volvieron.' },
      { when: f('sacrificio_elegido'), text: 'Uno de ellos se quedó y cerró la puerta desde dentro. El fragmento quedó con él, del otro lado.' },
      { when: f('frag_gusano_roto'), text: 'Su fragmento se desmoronó como sal. La mina dejó de callar y Samira lloró sin que nadie la viera.' },
    ] },
  { id: 'antiguos', cat: 'Dioses', title: 'Merab, Hadir y el Profeta de los Vientos', unlock: f('cap5_done'),
    text: 'Zaryab intentó tener un dios tres veces antes, y tres veces se equivocó. Merab prometió agua a los sedientos y al segundo año se la quitó. Hadir predicó la paz y terminó dirigiendo una guerra. El Profeta de los Vientos juró que el viento nunca se iría, y se fue. Los escribas del Conclave los llaman «los dioses caducados». Zahir los cita como quien cita a parientes que fracasaron: «Yo no soy como ellos. Soy peor, porque yo sé por qué fallaron».',
    more: [
      { when: f('voz_merab'), text: 'Bajo el yeso de la Ciudadela quedó la voz de Merab: «Agua para todos. Lo prometí y no pude cumplirlo. Perdóname, hija mía». No era un tirano: era un viejo asustado.' },
      { when: f('razul_historia', 'cap12_done'), text: 'Razul los vio caer a los tres. A eso le llama la Espiral del Dios Caducado: una voz amable, un pueblo agradecido, una promesa imposible, y otra vez el desierto.' },
    ] },
  { id: 'kelemvor', cat: 'Dioses', title: 'Kelemvor, el Juez de los Muertos', unlock: always,
    text: 'Dios extranjero de la muerte justa, al que sirve Romain. Kelemvor no castiga ni premia: pesa. Cada alma sube a su balanza y queda donde debe quedar. En Zaryab su culto es casi una curiosidad; el Conclave tolera a sus monjes porque entierran a los pobres sin cobrar. «Kelemvor juzga almas, pero el Conclave las convierte en arena», dice Romain cuando el vino le suelta la lengua. Cuando la compañía murió en la arena, Kelemvor no los reclamó, y eso es una herida que Romain todavía no sabe dónde ponerse.',
    more: [
      { when: q('p_romain'), text: 'En las ruinas del Templo Quemado del Bajo, Romain encontró el sello del Conclave en las vigas: fueron ellos quienes prendieron fuego a la casa de su dios.' },
      { when: f('monjes_unidos'), text: 'Los Monjes de Kelemvor del anciano Ezra se sumaron al culto. Rezan dos veces: una por el Simurg y otra, más bajito, por el Juez.' },
      { when: f('huerfanos_descansan'), text: 'El rito de Kelemvor dio descanso a los niños de Al-Mazhar. Fue la primera vez, desde la arena, que Romain sintió que su dios lo escuchaba.' },
    ] },
  { id: 'cyric', cat: 'Dioses', title: 'Cyric, el Príncipe de las Mentiras', unlock: or(q('o_maunator'), q('o_cyric'), f('q_o_maunator')),
    text: 'Otro dios extranjero, menos bienvenido que Kelemvor. Bajo el Oráculo de las Mil Lenguas duerme un artefacto suyo: un espejo que enseñó a la ciudad a mentir con método. Kethras lo buscaba. Los vendedores de augurios del Zoco nunca supieron que trabajaban para él. Los teólogos de Maunator lo describen como «el que sonríe del otro lado de cada contrato». Ningún templo de Zaryab le reza; todos, de algún modo, le pagan el diezmo.',
    more: [
      { when: f('oraculo_verdadero'), text: 'La compañía apoyó la mano en el espejo y lo obligó a decir la verdad para siempre. Dicen que al Oráculo le cuesta, y que a ratos llora.' },
      { when: f('oraculo_entregado', 'oraculo_cyric'), text: 'El artefacto cambió de manos. El cronista no anota en cuáles; Cyric sabe leer.' },
    ] },
  { id: 'gusano_martillo', cat: 'Dioses', title: 'El que Escarba', unlock: c => has(c, 'cap3_done') && (c.gusano.seen > 0 || c.gusano.power > 0),
    text: 'No es un dios, aunque los mineros viejos le dejan ofrendas: el Gusano de Cabeza de Martillo, una bestia de túnel que huele los fragmentos del meteorito como un perro huele el pan. Cuantos más lleva la compañía, más rápido llega. Primero es una cría que rasca las paredes de la biblioteca; después, si nadie le pone freno, algo mayor que las murallas. Se lo oye antes de verlo: un golpe sordo bajo los pies, tres veces, y luego nada.',
    more: [
      { when: c => c.gusano.power >= 6, text: 'Ya es colosal. Las fuentes del Bajo tiemblan cuando pasa por debajo, y Aisha guarda los platos en el suelo.' },
      { when: c => c.gusano.power >= 10, text: 'Abismal. El cronista deja de anotar sus pasadas: son demasiadas, y nadie quiere leerlas.' },
    ] },

  // ═════════════════════════ FACCIONES ═════════════════════════
  { id: 'conclave', cat: 'Facciones', title: 'El Conclave de los Siete Vientos', unlock: always,
    text: 'Gobierna Zaryab desde siete torres de bronce que cada mañana tocan una nota distinta. Hace trescientos años un hombre ató a un djinn con una promesa y lo obligó a girar: fue el primer molino, y el principio de su poder. La luz de las torres es luz esclava; todo el mundo lo sabe y se dice, bajito, que es una buena luz. Su Vizir es Razul. Su guardia, los ibis negros. Su método, los papeles: nada en Zaryab ocurre sin un sello del Conclave, ni siquiera un incendio.',
    more: [
      { when: repAtLeast('conclave', 3), text: 'Algunos escribas ya saludan a la compañía en la calle. No por afecto: por cálculo. En el Conclave, el respeto es una línea de presupuesto.' },
      { when: repAtMost('conclave', -3), text: 'El nombre de la compañía figura en las listas negras de las siete torres. Los recaudadores cruzan la calle cuando los ven, y luego mandan a otros.' },
      { when: f('marcados_por_razul', 'razul_cobro'), text: 'Razul cobra sus plazos. El Conclave no olvida una deuda; la anota y le pone fecha.' },
    ] },
  { id: 'hijos', cat: 'Facciones', title: 'Los Hijos del Simurg', unlock: f('cap1_done', 'cap2_done'),
    text: 'Una red de túneles, contraseñas y pan compartido bajo el Bajo Zaryab. Los Hijos del Simurg rezan al dios olvidado sin saber muy bien cómo se llamaba, y esconden a los que el Conclave busca. Shib los guía, cuando no está muriéndose. No tienen templos: tienen cocinas. «La mesa es el único altar que no necesita dioses», decía el marido de Aisha, y los Hijos lo repiten como un salmo. Recibieron a la compañía con desconfianza y luego con sopa.',
    more: [
      { when: q('s_lago'), text: 'En el Lago de los Silencios, la compañía bajó por sus túneles y encontró a Shib moribundo junto a la rama del Conclave. Desde entonces los Hijos les abren puertas que no figuran en ningún mapa.' },
      { when: repAtLeast('hijos', 3), text: 'Los Hijos ya hablan de la compañía como de «los nuestros». En el Bajo, eso vale más que un título.' },
      { when: f('hijos_aliados', 'hijos_convertidos'), text: 'Los Hijos marchan con el culto. Algunos dicen que es lo que siempre esperaron; otros, que cambiaron de dueño.' },
    ] },
  { id: 'mercaderes', cat: 'Facciones', title: 'Los Mercaderes del Zoco', unlock: f('cap2_done'),
    text: 'Seda púrpura, columnas veteadas de oro y esferas de cristal que graban contratos: el Zoco de los Mil Soplos tiene su propio gobierno, y se llama precio. Los Mercaderes no creen en dioses sino en plazos, y por eso se llevan bien con todos. Venden a ambos bandos de cualquier guerra, y cobran el flete del regreso. EaNassr es su sonrisa más conocida; Madam Shub, la menos recomendable. Un dicho del Zoco: «En Zaryab todo se compra, menos la sed».',
    more: [
      { when: repAtLeast('mercaderes', 3), text: 'Los Mercaderes ya les fían. El cronista sospecha que eso los compromete más que una deuda.' },
      { when: f('caravana_escoltada', 'caravana_robada'), text: 'El asunto de la caravana perdida corrió por todo el Zoco. Algunos los llaman protectores; otros, socios incómodos.' },
    ] },
  { id: 'inquisidores', cat: 'Facciones', title: 'Los Inquisidores de la Arena', unlock: f('cap2_done'),
    text: 'Brazo armado de la fe oficial. Visten de ocre, llevan lanzas de punta de vidrio y ejecutan sentencias que el Conclave prefiere no firmar. Persiguen herejes, cultos y todo lo que huela a dios sin permiso. Romain sabe que fueron ellos quienes quemaron su templo. Joren tiene una cuenta con uno en particular: Kaelen, que firmó la noche del incendio de La Marca. Algunos desertan; el desierto les cobra la deserción.',
    more: [
      { when: f('inq_aceptado', 'inq_samira', 'q_m_inq'), text: 'Un inquisidor desertor encontró refugio con la compañía. Lo que contó sobre los métodos de la orden no cabe en este códice.' },
      { when: f('joren_mata', 'joren_perdona', 'joren_captura'), text: 'El asunto de Kaelen se cerró en la Ciudadela. La orden no olvidará cómo; Joren tampoco.' },
    ] },
  { id: 'nomadas', cat: 'Facciones', title: 'Los Nómadas del Vacío', unlock: f('cap5_done', 'cap6_done'),
    text: 'Viven donde el mapa termina y el desierto empieza a hablar solo. Los Nómadas del Vacío no entran a la ciudad si pueden evitarlo; comercian en los bordes, leen el viento y crían al Roc en el Pico del Viento. Desconfían de los dioses que se quedan quietos. «Un dios que no se mueve es un pozo seco», dicen. Joren aprendió a cazar con gente como ellos, y lo saludan con la mano abierta, que entre ellos es saludo de igual a igual.',
    more: [
      { when: f('tigre_libre', 'tigre_domado', 'tigre_muerto'), text: 'El tigre alado que cegó al Roc ya no ronda el Pico. Los Nómadas cantan una canción nueva sobre aquella tormenta.' },
      { when: repAtLeast('nomadas', 2), text: 'Les reservan un lugar junto al fuego. Es el mayor honor que conocen.' },
    ] },
  { id: 'culto_dahhak', cat: 'Facciones', title: 'El Culto de Dahhak y las Si\'lats', unlock: f('cap3_done'),
    text: 'Antes de que la compañía fundara su culto, Zaryab ya tenía uno clandestino: el de Dahhak. Sus sacerdotisas, las Si\'lats, ofrecían el cuello al dios y él se lo quedaba. Visten velos de ceniza y caminan en fila, siempre en número impar. Sus infiltrados rondan los distritos con monedas falsas y promesas verdaderas. Tras la caída de su dios, las Si\'lats no se dispersaron: buscaron a quién servir, y algunas encontraron a Pact.',
    more: [
      { when: f('silats_guian', 'pact_azuran'), text: 'Las Si\'lats guiaron a Pact hasta el templete donde Azuran fue juzgado. Se arrodillaron ante él todas a la vez, y las cenizas subieron en una columna delgada.' },
      { when: repAtMost('dahhak', -2), text: 'Lo que queda del Culto de Dahhak considera a la compañía su enemiga. Se reconocen por la tiza gris en el dobladillo.' },
    ] },
  { id: 'qilaat', cat: 'Facciones', title: 'Los Qilaat', unlock: f('cap4_done', 'cap5_done'),
    text: 'Guardia de élite de la Ciudadela, formada en anillos alrededor del Capitolio, con escudos de obsidiana y lanzas de impulso arcano. Los Qilaat no hablan de servicio: hablan de juramento. Se los recluta de niños y se los entrena para no oír los susurros de las runas que giran cuando alguien miente. Cuando el Coloso cayó y nadie dio órdenes, giraron las lanzas hacia donde les pareció; el cronista no se atreve a decir que eligieron mal.',
    more: [
      { when: f('cap12_done'), text: 'En la Ciudadela de los Susurros, los Qilaat custodiaban la última escalera de Razul. Algunos bajaron las lanzas antes de que se las bajaran.' },
      { when: repAtLeast('qilaat', 2), text: 'Un capitán Qilaat les debe la vida. Los Qilaat pagan sus deudas en pasillos abiertos y puertas que no se cierran.' },
    ] },
  { id: 'nasnas', cat: 'Facciones', title: 'Los Nasnas', unlock: f('cap5_done'),
    text: 'Los que Zaryab quiso olvidar: los deformes, los que no pasaron las pruebas, los hijos de nadie. Construyeron Medinat al-Rih con adobe y velas torcidas y, cuando cayó el Capitolio, se alzaron. Sus líderes hablan poco y recuerdan mucho. El Conclave los llama «media gente»; ellos se llaman a sí mismos «los enteros», con una ironía que no se presta. En su ciudad se celebra el Torneo de los Puños Cerrados.',
    more: [
      { when: f('postura_pueblo'), text: 'La compañía tomó partido por el Pueblo y los Nasnas lo recuerdan: en Medinat, sus nombres se pronuncian sin escupir.' },
      { when: f('postura_orden'), text: 'La compañía tomó partido por el Orden. En Medinat les cierran las puertas con educación, que es la peor manera.' },
      { when: f('medinat_aliado'), text: 'Medinat al-Rih es aliada del culto. Los Nasnas no rezan, pero comparten el agua.' },
    ] },
  { id: 'velshara', cat: 'Facciones', title: 'La Casa Vel\'Shara', unlock: or(q('p_zyr'), f('q_p_zyr', 'zyr_info', 'zyr_mensaje', 'zyr_eliminada')),
    text: 'Casa drow de cuchillos y contratos, con agentes en tres continentes y ninguna dirección conocida. Zyr\'thar creció en ella y huyó de ella; ellos no la olvidaron. Sus espías se reconocen por un anillo que no brilla y por la costumbre de sentarse de espaldas a la pared. Vel\'Shara no perdona la traición: la cobra con intereses, a veces durante generaciones. Su lema, que nadie dice en voz alta: «La sombra paga».',
    more: [
      { when: f('cap11_done'), text: 'Nythra Vel\'Shara, la hermana mayor de Zyr\'thar, vendía venenos al Vizir desde la Ciudadela. El reencuentro no fue largo.' },
      { when: f('velshara_mata'), text: 'Zyr\'thar cobró la deuda de la Casa. Su sombra ahora la sigue a un paso de distancia, quieta.' },
      { when: f('velshara_expone'), text: 'Zyr\'thar expuso a Vel\'Shara ante toda Zaryab. La Casa arde sin que ella haya tocado un cuchillo.' },
      { when: f('velshara_perdona'), text: 'Zyr\'thar perdonó a su hermana. Es el único cuchillo que nunca lanzó, y el que más pesa.' },
    ] },
  { id: 'lamarca', cat: 'Facciones', title: 'La Marca', unlock: or(q('p_joren'), f('q_p_joren')),
    text: 'Una célula de contrabandistas y cazadores a la que Joren perteneció antes de que alguien la vendiera. Sellaban sus cargamentos con un círculo atravesado, y sus manifiestos todavía aparecen en bodegas del Zoco Sur. Una noche ardió todo: la guarida, los nombres, los que dormían dentro. Joren salió; otros no. Desde entonces busca al que firmó la orden. En Medinat, La Marca tiene un muerto que respira.',
    more: [
      { when: f('cap6_done'), text: 'En Medinat al-Rih, Joren se reencontró con un compañero de La Marca al que daba por muerto. Respira. Habla poco. Recuerda demasiado.' },
      { when: f('joren_culpable_pista', 'cap12_done'), text: 'El nombre de la orden era Kaelen, inquisidor, y la fecha coincidía con la noche del incendio. «No lo hice por maldad», dijo él. Joren no le preguntó por qué entonces.' },
    ] },

  // ═════════════════════════ LUGARES ═════════════════════════
  { id: 'zaryab', cat: 'Lugares', title: 'Zaryab', unlock: always,
    text: 'Un cuenco de adobe y mármol donde el viento llega por turnos y el agua se reparte con ceremonia. Zaryab se llama a sí misma eterna: es una ciudad que repite una frase para no oír el silencio de debajo. Arriba, las torres de bronce del Conclave; abajo, el Bajo, adobe y tiza violeta, donde la gente reza a un dios sin nombre. Para entenderla hay que subirse a un tejado al amanecer y mirar cómo se acomoda sola.',
    more: [
      { when: f('cap5_done'), text: 'Desde la caída del Capitolio, la ciudad habla en voz baja, como los que ya eligieron un bando. Los frentes cambian de manos cada pocos días.' },
      { when: f('cap10_done'), text: 'Una mañana el sol salió con un borde mordido. Los ancianos del Zoco se tocaron la frente, como si temieran haber olvidado algo.' },
      { when: f('final_desierto'), text: 'La compañía le dio la espalda. Zaryab siguió repitiendo su frase.' },
    ] },
  { id: 'pilares', cat: 'Lugares', title: 'Los Cuatro Pilares Torcidos', unlock: always,
    text: 'En el desierto, a varias jornadas de la ciudad, cuatro pilares se inclinan unos hacia otros como viejos que se cuentan un secreto. Las tormentas los rodean sin tocarlos. Nadir, el guía, conocía el camino demasiado bien. Allí capturaron a la compañía los ibis negros del Conclave, y allí empezó todo. Los nómadas no acampan cerca: dicen que de noche los pilares escuchan, y que lo que escuchan lo cuentan.',
    more: [
      { when: f('nadir_mentor', 'nadir_guia', 'nadir_heraldo'), text: 'Un viejo conocido de Nadir los llamaba «los rastros»: lo que queda en la arena cuando algo muy grande pasó y no volvió.' },
      { when: f('cap7_done'), text: 'Son plumas. O lo que queda de una pluma cuando el pájaro lleva demasiado tiempo muerto.' },
    ] },
  { id: 'santuario', cat: 'Lugares', title: 'La Biblioteca · Santuario', unlock: f('cap1_done', 'cap2_done'),
    text: 'Una biblioteca olvidada bajo el Bajo Zaryab, sobre los Huesos del Primer Pacto. Las paredes sangran aceite violeta y los estantes están vacíos de libros y llenos de otra cosa: de la paciencia de un lugar que sólo necesitaba que alguien volviera a abrir la puerta. Allí fundó la compañía su culto. Aisha puso una mesa larga entre los estantes, con platos que no hacen juego, y desde entonces es una casa.',
    more: [
      { when: f('cap8_done'), text: 'Razul bajó a la biblioteca. Desde esa noche hay un vaso en la mesa que nadie usa.' },
      { when: f('santuario_defendido'), text: 'El santuario resistió un asalto. Las marcas de las lanzas siguen en la puerta; nadie quiso taparlas.' },
      { when: f('santuario_saqueado', 'santuario_maldito'), text: 'El santuario sufrió. Hay estantes que no volvieron a levantarse y un olor que no se va.' },
      { when: c => c.followers.length >= 10, text: 'Ya son más de diez los que duermen entre los estantes. De noche la biblioteca respira como una casa llena.' },
    ] },
  { id: 'bajo', cat: 'Lugares', title: 'El Bajo Zaryab', unlock: always,
    text: 'Adobe agrietado pintado con tiza violeta. Olor a especias quemadas y a mentira fermentada. En el Bajo, una mujer llamada Aisha mide el pan con los dedos y un niño toca el arpa en la esquina, tres notas, y se calla antes de la cuarta. Los chicos del barrio aprenden pronto quién viene a cobrar. Es el lugar donde la compañía curó a Farid y donde el Conclave aprendió, tarde, que había perdido el control de algo.',
    more: [
      { when: found('mural_tiza'), text: 'Tras un patio escondido hay un mural de tiza violeta que llora de noche. Los vecinos lo repintan cada semana; el mural sigue llorando.' },
      { when: f('ninos_defendidos', 'q_s_ninos'), text: 'Los niños del barrio y sus escorpiones domésticos recuerdan quién los defendió de los guardias. Les dejan dátiles en la puerta.' },
    ] },
  { id: 'zoco', cat: 'Lugares', title: 'El Zoco de los Mil Soplos', unlock: f('cap2_done'),
    text: 'Seda púrpura, columnas de mármol veteadas de oro y esferas de cristal que graban cada contrato con la voz de quien lo firma. En el Zoco se venden alfombras que respiran, lámparas con inquilino y verdades a medias, por peso. Al caer la tarde abre el Mercado de las Sombras, donde Madam Shub atiende sin mostrar las manos. El Oráculo de las Mil Lenguas tiene allí su puesto y su clientela fiel.',
    more: [
      { when: f('ea_cubre'), text: 'EaNassr compró el silencio de todo el Zoco. Cuando la compañía pasa, los mercaderes miran sus balanzas.' },
      { when: or(q('o_maunator'), f('q_o_maunator')), text: 'Bajo un consulado extranjero del Zoco se mueve un sótano de Maunator. El cronista lo sabe porque la compañía salió de él con menos de lo que entró y más de lo que esperaba.' },
    ] },
  { id: 'plaza', cat: 'Lugares', title: 'La Plaza Central y el Capitolio', unlock: f('cap2_done'),
    text: 'El corazón administrativo de Zaryab: el Capitolio del Vizir, siete escalinatas para siete Vientos y una fuente que sólo corre los días de audiencia. Bajo las baldosas duerme un cubo de mármol sin inscripciones. Allí se proclaman los impuestos, se leen las sentencias y, una vez al año, se libera una paloma que nadie vuelve a ver. Los mendigos dicen que la plaza escucha.',
    more: [
      { when: f('cap5_done'), text: 'El Coloso de Dahhak cayó aquí. El Capitolio sigue sangrando aceite violeta; los barrenderos ya no intentan limpiarlo.' },
      { when: found('mirador_plaza'), text: 'Sobre el Capitolio hay una torre sin nombre con un mirador olvidado. Desde allí se ve toda la ciudad y, en días claros, los pilares.' },
    ] },
  { id: 'cubo', cat: 'Lugares', title: 'El Cubo de los Mil Reflejos', unlock: f('cap4_done', 'cubo_superado'),
    text: 'Bajo la Plaza Central, un cubo de mármol sin inscripciones esconde un laberinto de espejos donde cada reflejo muestra una versión distinta de quien lo mira: la que fue, la que pudo ser, la que finge ser. Allí guardaba el Conclave un fragmento del meteorito. Alguien dijo que el Cubo no es un sótano, sino una frase larga que se escribe a sí misma. La compañía leyó un párrafo y salió con el fragmento y con más preguntas.',
    more: [
      { when: f('cap4_done'), text: 'En el Cubo, cada uno de los seis se vio una vez a sí mismo y tuvo que responderle. Ninguno contó del todo qué vio.' },
      { when: f('rabb_recuerda'), text: 'Rabb oyó, entre los espejos, un nombre que no era el suyo. Desde entonces recuerda cosas pequeñas: un olor, una escalera, una mano.' },
    ] },
  { id: 'jardin', cat: 'Lugares', title: 'El Jardín de los Suspiros', unlock: f('cap3_done'),
    text: 'Cipreses podados como manos gigantes, senderos de grava blanca y un estanque donde vive —o vivía— el Marid. Aquí los nobles juegan al Juego de las Máscaras: nadie dice su nombre, todos saben el de todos. Lady Nafisa es la anfitriona. Se entra con invitación o con un nombre que valga como una. Los jardineros son mudos por contrato y sordos por prudencia.',
    more: [
      { when: f('cap9_done'), text: 'La fiesta de máscaras terminó con el Marid fuera de su lago. En la orilla, Nafisa devolvió un pez al estanque con las dos manos, como se devuelve algo prestado.' },
      { when: or(q('s_te'), f('q_s_te')), text: 'Hubo veneno en el té de la última recepción. El cronista anota que nadie murió, y que eso fue obra de alguien.' },
    ] },
  { id: 'acueductos', cat: 'Lugares', title: 'Los Acueductos del Oeste', unlock: f('cap2_done'),
    text: 'Viejos baños y canales que el Conclave dejó de mantener cuando encontró agua más barata en las espaldas de los djinns. El agua guarda lo que se hunde: monedas, cartas, cuerpos, promesas. Allí esperaba el primer fragmento del meteorito, y allí la compañía encontró a tres djinns encadenados a una rueda. Los contrabandistas usan los canales de noche; las ratas, a toda hora.',
    more: [
      { when: f('efrit_vivo', 'djinns_libres'), text: 'Shul-Avar, Riyam y Tadhem se fueron con una sonrisa de agua y arena. La rueda se quedó quieta por primera vez en un siglo.' },
      { when: found('ratas_acueducto'), text: 'Un contrabandista sin nombre vende en el canal lo que nadie debería poder comprar. Acepta pago en recuerdos.' },
    ] },
  { id: 'pozo', cat: 'Lugares', title: 'El Lago de los Silencios', unlock: f('cap2_done'),
    text: 'Un cráter de cristal negro donde el agua refleja el cielo al revés. En el centro crece una rama negra, «la Lengua Muerta», que no deja de crecer y que el Conclave riega con algo que no es agua. De ese lago salió la fiebre que enfermó a Farid y a otros niños. Farid dice que allí aprendió canciones. Nadie le pregunta de quién.',
    more: [
      { when: f('lago_purificado'), text: 'La compañía purificó la rama. El agua todavía refleja al revés, pero ya no enferma a nadie.' },
      { when: f('lago_quemado'), text: 'La compañía quemó la rama. Durante tres días, el cráter humeó como una pipa; después, nada.' },
    ] },
  { id: 'medinat', cat: 'Lugares', title: 'Medinat al-Rih', unlock: f('cap5_done'),
    text: 'Ciudad de adobe y velas torcidas al este de Zaryab, construida por los Nasnas y por todos los que la ciudad grande no quiso. Huele a cuero, a té con humo y a revuelta. En su plaza se celebra el Torneo de los Puños Cerrados, donde los monjes de Qadir-Kalmah miden a quien se atreva. Las calles cambian de nombre cada vez que cambia el gobierno, así que los vecinos se orientan por los olores.',
    more: [
      { when: f('cap6_done'), text: 'Aquí Panchi perdió ante Sifra la Silente, y Joren encontró a un muerto que respira. Medinat no es un lugar al que se vuelva sin motivo.' },
      { when: bond('abril', 3), text: 'Abril cuenta en Medinat que la compañía es de fiar. En una ciudad de desconfiados, su palabra abre puertas.' },
    ] },
  { id: 'iglesia', cat: 'Lugares', title: 'La Iglesia del Simurg', unlock: f('cap6_done'),
    text: 'Un templo del oeste que ya no reza al Simurg. Dahhak se refugió aquí tras la caída del Coloso y lo convirtió en su nido: los mosaicos del pájaro están rayados con uña, y en el altar quedan las marcas de cien cuellos. Los fieles antiguos lo abandonaron uno por uno. Las Si\'lats se quedaron. En la cúpula hay un agujero por donde, dicen, una vez entró una pluma.',
    more: [
      { when: f('cap7_done'), text: 'La Iglesia vio la caída de Dahhak. Las Si\'lats todavía barren el suelo cada mañana, por costumbre o por penitencia.' },
      { when: f('estudio_relieves'), text: 'En los relieves del ábside, la compañía encontró el Simurg pintado con veintitrés plumas de oro. Una está raspada.' },
    ] },
  { id: 'pico', cat: 'Lugares', title: 'El Pico del Viento · Nido del Roc', unlock: f('cap6_done'),
    text: 'Una cumbre de piedra al norte donde los Nómadas del Vacío dicen que anida el Roc, el ave más grande que queda en el mundo desde que el Simurg dejó de volar. Desde arriba se ven las dos ciudades y el desierto entre ellas como un mantel arrugado. El viento allí no llega por turnos: llega todo junto. Algo más grande que el Roc ruge a veces entre las nubes.',
    more: [
      { when: f('tigre_libre'), text: 'El tigre alado de pelaje de rayos se perdió entre las nubes. El Roc vuelve a ver, y los Nómadas a cantar.' },
      { when: f('tigre_domado'), text: 'El tigre alado aceptó una mano. Cuando hay tormenta, baja al santuario a dormir.' },
      { when: f('tigre_muerto'), text: 'El tigre alado murió en el Nido. Su piel brilla todavía cuando truena.' },
    ] },
  { id: 'cementerio', cat: 'Lugares', title: 'El Cementerio Olvidado', unlock: f('cap6_done'),
    text: 'Un campo de tumbas anónimas que el Conclave borró de sus libros. Bajo las lápidas lisas yace un ejército entero que Zaryab prefirió no recordar: los soldados de una guerra que nunca se declaró. Los muertos aún marchan en formación las noches sin luna, buscando una orden que ya nadie va a dar. Romain fue el primero en querer saber sus nombres.',
    more: [
      { when: or(q('s_cementerio'), f('q_s_cementerio')), text: 'La compañía bajó al Cementerio. Los muertos ya no marchan todos: algunos se sentaron.' },
      { when: f('ejercito_descansa'), text: 'El ejército sin nombre descansa. Romain anotó cada nombre que pudo leer en un cuaderno que no presta.' },
      { when: f('ejercito_culto'), text: 'El ejército sin nombre marcha ahora para el culto. Nadie en el Bajo sale de noche cuando pasan.' },
    ] },
  { id: 'mina', cat: 'Lugares', title: 'La Mina de Alabastro', unlock: f('cap10_done'),
    text: 'Cuatro niveles bajo la piedra, una veta blanca que alimentó los palacios del Conclave y un silencio que no es ausencia de ruido. Los vigilantes declararon el pozo agotado cuando bajaron a recoger los cuerpos y no encontraron ninguno. En el cuarto nivel quedó un libro de cuentas con nombres, jornales y raciones; las últimas páginas están en blanco. El padre de Abril bajó por esa boca durante veintidós años.',
    more: [
      { when: f('cap11_done'), text: '«Hay secretos que el Conclave no esconde porque sean peligrosos, sino porque son vergonzosos», dijo Samira frente a una puerta cerrada.' },
      { when: f('abril_perdida'), text: 'Abril no volvió. En el Bajo, alguien colgó su cuaderno de un clavo. Allí se queda.' },
      { when: f('abril_salvada'), text: 'Volvieron por Abril. La encontraron en el tercer nivel, dibujando de memoria. No pidió que fueran, pero lloró al verlos.' },
    ] },
  { id: 'ciudadela', cat: 'Lugares', title: 'La Ciudadela de los Susurros', unlock: f('cap11_done'),
    text: 'Mármol blanco con runas que giran como serpientes cuando alguien miente. Es la casa de Razul y la memoria del Conclave: archivos, celdas y una escalera muy lenta que lleva a un despacho donde un vaso de agua espera sobre la mesa. En la Sala de las Voces, las paredes guardan lo que se dijo en ellas durante tres mil años. Nadie habla fuerte en la Ciudadela; las runas lo agradecen.',
    more: [
      { when: f('ciudadela_sigilo', 'ciudadela_engano'), text: 'La compañía entró sin que la Ciudadela lo supiera del todo. Las runas, en cambio, lo supieron enseguida.' },
      { when: f('voz_merab', 'voz_simurg', 'voz_farid'), text: 'En la Sala de las Voces quedaron grabados Merab, el Simurg y, rendija por rendija, la nana que canta Farid.' },
    ] },
  { id: 'catacumbas', cat: 'Lugares', title: 'Las Catacumbas del Simurg', unlock: f('cap12_done'),
    text: 'Debajo de la biblioteca, túneles con paredes que sangran aceite negro y siete pedestales en círculo que alguien limpia cada semana sin saber para qué. Son los Huesos del Pacto: el lugar donde el Simurg se partió y donde Zahir espera que vuelva a juntarse. El suelo está frío. Desde que era pájaro, Zahir nunca había sentido la piedra; aquí la toca, y la piedra lo toca a él.',
    more: [
      { when: f('frag_dahhak_roto', 'frag_marid_roto', 'frag_mazhar_roto', 'frag_gusano_roto', 'frag_razul_roto'), text: 'Algunos pedestales quedaron vacíos por decisión de la compañía. Zahir los mira como se mira un diente que falta.' },
      { when: f('cap13_done'), text: 'Aquí terminó el Eclipse. El cronista no describe el final: lo vivieron ustedes.' },
    ] },
  { id: 'qadir', cat: 'Lugares', title: 'Qadir-Kalmah', unlock: f('cap6_done', 'conoce_ellie', 'qadir_visto', 'ev_qadir_done'),
    text: 'Ciudad de ruinas móviles al sureste: los edificios cambian de lugar como si no se atrevieran a quedarse quietos. Allí se esconde Ellie, la que rompe pactos, y allí estaba el monasterio de Panchi antes de que él se fuera con la ira por equipaje. Los monjes de Qadir-Kalmah entrenan el puño cerrado y la mano abierta, y dicen que lo difícil no es pegar sino elegir. No figura en los mapas del Conclave: los mapas no la alcanzan.',
    more: [
      { when: f('ev_qadir_done', 'qadir_visto'), text: '«Éste fue tu monasterio», le dijo Ellie a Panchi. Lo dijo en pasado, y él no la corrigió.' },
      { when: f('qadir_golem'), text: 'El golem Defectuoso entró al claustro. Los monjes lo llaman «hijo».' },
    ] },
  { id: 'maunator', cat: 'Lugares', title: 'Maunator', unlock: or(q('o_maunator'), f('q_o_maunator', 'mz_inicio')),
    text: 'La ciudad de los escribas de los muertos, que se hundió con método: primero los libros, luego las casas, al final los propios escribas, de pie en sus mesas, tomando nota de cómo les llegaba el agua. Dos mil años después, bajo un consulado extranjero del Zoco, sus salas todavía se desplazan en un orden que nadie recuerda haber fijado. De allí salió un tomo que sirve contra Al-Mazhar, para quien sepa leerlo en voz alta.',
    more: [
      { when: f('mz_tomo_conserva'), text: 'La compañía conserva el Tomo de Maunator. Por las noches se oye pasar sus páginas solas.' },
      { when: f('mz_tomo_destruido', 'mz_tomo_perdido'), text: 'El Tomo de Maunator ya no está. El cronista no sabe si es una pérdida o un alivio.' },
    ] },

  // ═════════════════════════ PERSONAS ═════════════════════════
  { id: 'razul', cat: 'Personas', title: 'Razul ibn Tameer, el Vizir', unlock: f('cap0_done', 'cap1_done'),
    text: 'Vizir del Conclave, con cara de funcionario sin edad y la fatiga de quien conoce el final de las historias antes de que empiecen. Juzgó a la compañía en la arena y la ejecutó sin levantar la voz. Anota todo: la hora, el peso de la arena, cuánto tarda en cerrarse una herida que no debería cerrarse. «Seis extranjeros con el mismo cristal en el pecho. ¿Cuántos cristales así hemos visto?», preguntó a su escriba. La respuesta correcta era cuatro.',
    more: [
      { when: f('cap8_done'), text: 'Bajó a la biblioteca y se sentó a la mesa del culto. «Merab también pidió agua. Y se la dimos. Y no sirvió de nada», dijo luego a una habitación vacía.' },
      { when: f('razul_pacto'), text: 'La compañía aceptó su trato. Razul no sonrió: anotó la fecha.' },
      { when: f('razul_tregua'), text: 'Negociaron una tregua con plazo. Razul cumple los plazos; espera lo mismo.' },
      { when: f('razul_rechazo'), text: 'Rechazaron su trato. «Bien», dijo. «Al menos ahora sé con quién hablo.»' },
      { when: f('razul_yasmin', 'cap12_done'), text: 'Hace tres milenios vio morir a una niña llamada Yasmin, y desde entonces se quedó cuando todos los demás se fueron. Bajo su torre late el Corazón Dormido.' },
      { when: f('razul_aliado'), text: 'Les tendió la mano contra Zahir. Era la primera vez que le ofrecía algo a alguien desde Yasmin.' },
      { when: f('razul_silencio'), text: 'No cayó: se apagó. El Corazón Dormido del Vizir se detuvo, y por primera vez en tres mil años, Razul se sentó.' },
      { when: f('razul_muerto'), text: 'El Vizir cayó. Zaryab quedó sin dueño, y el despacho, con un vaso de agua sin beber.' },
    ] },
  { id: 'aisha', cat: 'Personas', title: 'Aisha', unlock: f('cap1_done', 'cap2_done'),
    text: 'Tejedora del Bajo, madre de Farid, viuda de un hombre que decía que la mesa es el único altar que no necesita dioses. Mide el pan con los dedos y cuenta las bocas dos veces. Fue la primera en arrodillarse ante la compañía y la primera en dejar de llamarlos «los forasteros». Cocina para el culto sin que nadie se lo pida, y su pan de arena sabe un poco a ceniza. «Yo no tartamudeo con el Conclave», dijo una vez, y nadie lo puso en duda.',
    more: [
      { when: bond('aisha', 3), text: 'Canta la nana en voz alta, por fin. La biblioteca parece menos fría.' },
      { when: f('aisha_venganza', 'aisha_maldice'), text: 'Hay algo en Aisha que ya no se dobla. Juró venganza y la cuida como al pan: tapada, tibia, esperando.' },
      { when: f('aisha_oyo_marido'), text: 'Oyó la voz de su marido en la canción de Al-Mazhar. No lo cuenta. Cierra la ventana.' },
      { when: bond('aisha', 5), text: 'Llenó la despensa con pan de arena de todo el mes. En el Bajo, eso es una declaración de amor.' },
    ] },
  { id: 'farid', cat: 'Personas', title: 'Farid', unlock: f('cap1_done', 'cap2_done', 'farid_curado'),
    text: 'Hijo de Aisha, envenenado por la fiebre del Lago y curado por la compañía en sus primeros días. Toca el arpa en la esquina: tres notas, y se calla antes de la cuarta. Ve cosas. Dice que en el Lago aprendió canciones, y nadie le pregunta de quién. Es el niño divino de esta historia, el que ve lo que los adultos no ven. Su herida aloja el fragmento de Dahhak.',
    more: [
      { when: f('farid_vio_alas', 'farid_ve'), text: 'Farid les vio las alas a los seis, o algo parecido. Lo dibujó con tiza en la puerta de la biblioteca.' },
      { when: f('cap10_done'), text: 'Cantó con el Lich, de igual a igual. Desde entonces su voz tiene una nota que no es del todo suya.' },
      { when: f('farid_roto'), text: 'Ellie rompió la canción. Farid ríe otra vez en la casa de Aisha.' },
      { when: f('farid_sellado'), text: 'Su alma quedó guardada en la balanza de Romain, que nunca pesa lo mismo.' },
      { when: f('cap12_done'), text: 'La noche antes del Eclipse tocó las cuatro notas, una detrás de otra, y las lámparas del barrio se apagaron al unísono.' },
      { when: bond('farid', 5), text: 'Les dedicó una melodía que no es de nadie. Se les aflojó algo en el pecho.' },
    ] },
  { id: 'eanassr', cat: 'Personas', title: 'EaNassr', unlock: f('cap2_done'),
    text: 'Mercader del Zoco con más sonrisas que dientes, contacto de la compañía en la sala de espejos. Vende información, djinns, alfombras y, cuando le conviene, a sus clientes. Es el embaucador de esta historia: ayuda siempre, pero siempre a costa de alguien, y rara vez es él. «No soy un hombre malo», suele decir. «Soy un hombre con existencias.» Le gusta el té con demasiada azúcar y los tratos con una cláusula de más.',
    more: [
      { when: f('ea_vendio_silencio', 'ea_compro_silencio'), text: 'Les ofreció vender a Razul su silencio. El precio, como siempre, lo pagó otro.' },
      { when: bond('ea', 3), text: 'Les fió un cofre de monedas «para el viaje». En el Zoco, fiar es lo más parecido a querer.' },
      { when: f('ea_aliado'), text: 'Es aliado del culto. El cronista lo anota con lápiz.' },
      { when: f('ea_enemigo'), text: 'Es enemigo del culto. Lo anota con tinta.' },
    ] },
  { id: 'shub', cat: 'Personas', title: 'Madam Shub', unlock: f('cap2_done'),
    text: 'Atiende un puesto en el Mercado de las Sombras sin mostrar nunca las manos. Vende espejos de almas, pociones de dudosa receta y adelantos sobre mercancía que nadie vio. Dicen que fue la amante de tres djinns y la viuda de dos; ella no lo desmiente porque le aumenta la clientela. Su perfume es de agua de rosas y algo quemado debajo. Trata a la compañía como a buenos clientes, que en su oficio es casi una amistad.',
    more: [
      { when: bond('shub', 3), text: 'Les pagó un «adelanto» por mercancía que ni vieron. El cronista sospecha que el adelanto es la mercancía.' },
      { when: f('shub_aliada'), text: 'Les regaló dos pociones de su reserva privada. Madam Shub no regala nada; esta vez lo hizo.' },
    ] },
  { id: 'nafisa', cat: 'Personas', title: 'Lady Nafisa', unlock: f('cap3_done'),
    text: 'Anfitriona del Jardín de los Suspiros y reina del Juego de las Máscaras. Conoce los secretos de la nobleza porque es ella quien los guarda bajo llave. Cambia de rostro según quién la mire: aliada, rival o recluta. «Cuando era joven creía que la máscara escondía a otra persona», dijo una noche a su reflejo. Debajo de la máscara de plata su cara es exactamente la misma, y eso es lo más inquietante de ella.',
    more: [
      { when: f('nafisa_envenenada'), text: 'Alguien envenenó su té. Sobrevivió, y desde entonces sirve ella misma las tazas.' },
      { when: f('nafisa_aliada', 'confia_nafisa'), text: 'Eligió el lado de la compañía. Con Nafisa, eso significa que lo eligió hoy.' },
      { when: f('nafisa_aval'), text: 'Avaló el nombre de la compañía ante la corte. En la nobleza, su firma vale más que una espada.' },
    ] },
  { id: 'samira', cat: 'Personas', title: 'La Capitana Samira', unlock: f('cap5_done', 'cap6_done'),
    text: 'Capitana de la Guardia, dura como un ladrillo cocido y honesta hasta lo inconveniente. Sirve al Conclave porque alguien tiene que cuidar las calles, no porque crea en los Siete Vientos. Su marido, Idris el albañil, bajó a la Mina de Alabastro y no volvió. Lleva su anillo en un cordón. Conoce a Abril desde que era una niña con un cuaderno. Cuando sonríe, que es poco, se le nota el esfuerzo.',
    more: [
      { when: bond('samira', 3), text: 'Perdió «por error» el expediente de la compañía. Es lo más cerca que estuvo de una mentira en veinte años.' },
      { when: f('samira_habla_idris'), text: 'Habló con lo que quedaba de Idris en el corazón de la mina. Nadie oyó qué le dijo. Volvió con la mano abierta.' },
      { when: f('samira_confia'), text: 'Juró que, llegado el día, la Guardia no apuntaría a la compañía.' },
      { when: f('samira_hostil'), text: 'Samira ya no los saluda. Los mira como se mira un expediente sin cerrar.' },
    ] },
  { id: 'abril', cat: 'Personas', title: 'Abril', unlock: f('cap6_done'),
    text: 'Hija de un minero de alabastro, cartógrafa de lo que nadie quiere mapear. Lleva un cuaderno contra el pecho y cuenta los escalones en voz alta. Vende dulces de dátil y noticias de primera mano. Su padre bajó por la boca de la mina durante veintidós años; un día no subió. Desde entonces dibuja de memoria lo que los demás prefieren olvidar. Escucha como quien no tuvo a nadie que le contara cosas.',
    more: [
      { when: f('abril_dibujo_brazos', 'dibujo_residencial'), text: 'Dibujó lo que vio en la mina, brazos incluidos. «Un registro para quienes los busquen después.»' },
      { when: f('abril_perdida'), text: 'Abril se perdió en la mina. Es el aliado que esta historia se cobró.' },
      { when: f('abril_salvada'), text: 'Volvieron a buscarla, y Joren se jugó el pellejo. Abril siguió dibujando.' },
      { when: f('joren_perdona'), text: 'Joren se la llevó a ver el desierto de noche. Ella lo dibujó; él no se reconoce.' },
    ] },
  { id: 'alkhush', cat: 'Personas', title: 'Al-Khush', unlock: f('cap2_done'),
    text: 'Anciano sordomudo de barba desgastada que repara alfombras mágicas con delicadeza obsesiva. Habla de las cosas como de viejos amigos: una lámpara es «la señora de la esquina», una llave, «la que sabe». Cuando le preguntan por los djinns, baja la voz que no tiene. «Una vez conocí a uno que cantaba mientras trabajaba. Lo vendieron por tres monedas de plata», escribió en su cuaderno.',
    more: [
      { when: f('cap3_done'), text: 'En su cuaderno, con letra apretada: «Si algún día alguien rompe la rueda, que no se detenga a contar los daños».' },
      { when: f('alfombra_viviente'), text: 'Tejió con la compañía una alfombra viviente. Respira, se queja del frío y lleva a cualquiera a cualquier distrito sin gastar el día.' },
    ] },
  { id: 'shulavar', cat: 'Personas', title: 'Shul-Avar, Riyam y Tadhem', unlock: f('cap3_done'),
    text: 'Tres djinns encadenados a la rueda de los acueductos: Shul-Avar, un efrit de voz grave; Riyam, de agua, hija del Marid; y Tadhem, de arena, que no habla con desconocidos. Llevaban siglos girando para dar luz a las torres. Shul-Avar guardaba una puerta por obligación. «Ahora quiero guardarla por gusto, una vez, para saber qué se siente», dijo cuando la compañía rompió las cadenas.',
    more: [
      { when: f('efrit_muerto'), text: 'Shul-Avar murió en los acueductos. La rueda siguió girando un rato sin él, como un perro que no sabe que su dueño se fue.' },
      { when: f('shul_leal'), text: 'Pasaron la noche con Shul-Avar frente a una puerta vacía. Al amanecer dijo: «Ya está. Era esto», y caminó hacia el desierto sin cadenas.' },
      { when: f('marid_riyam'), text: 'Riyam cumplió su palabra y habló por la compañía ante su padre, el Marid.' },
    ] },
  { id: 'nadir', cat: 'Personas', title: 'Nadir, el guía', unlock: f('cap0_done', 'cap1_done'),
    text: 'El guía que llevó a la compañía por el desierto hasta los cuatro pilares. No cobró el viaje: dijo que se lo pagarían más adelante, y no con dinero. Conocía el camino demasiado bien. Tiene la cara de quien lleva todo el día ensayando una frase y un odre de agua que nunca termina de vaciarse. En las tabernas del Bajo lo llaman «el que sabe de los pilares».',
    more: [
      { when: f('nadir_mentor'), text: 'Se sentaron a escucharlo. Nadir les contó lo poco que sabía, que era todo lo que tenía. Es un mentor pobre, pero verdadero.' },
      { when: f('nadir_guia'), text: 'Lo despidieron con una bolsa de monedas. Nadir aceptó, un poco decepcionado, y se volvió un guía más.' },
      { when: f('nadir_heraldo'), text: 'Confesó que el Conclave le ofreció una bolsa por contar adónde iban. No la cobró. Todavía.' },
    ] },
  { id: 'ellie', cat: 'Personas', title: 'Ellie · Sifra la Silente', unlock: f('cap6_done', 'conoce_ellie'),
    text: 'Monja de Qadir-Kalmah, encapuchada, con una muñeca vendada en lino blanco y la costumbre de no hablar. Los monjes la llaman Sifra la Silente; ella, a veces, se llama Ellie. Derrotó a Panchi en el Torneo de los Puños Cerrados y luego le escribió una carta que nunca envió: «Perdió. Pero no se fue». Subrayó la segunda frase tres veces. Sabe romper pactos, y dice que un pacto sólo se rompe desde dentro.',
    more: [
      { when: f('carta_ellie_leida'), text: 'Panchi leyó la carta antes de tiempo. No dijo nada. Durmió con ella bajo la almohada.' },
      { when: f('carta_ellie_sin_abrir'), text: 'Panchi guardó la carta sin abrir. Dice que la leerá cuando la merezca.' },
      { when: f('ellie_sabe'), text: 'Les dio la clave: el instante en que Zahir cree haber ganado. «Cuando llegue el Eclipse, vendré.»' },
      { when: f('pacto_roto'), text: 'Cumplió. Rompió el pacto desde dentro, y los cristales se apagaron como brasas bajo el agua.' },
    ] },
  { id: 'kaelen', cat: 'Personas', title: 'El Inquisidor Kaelen', unlock: f('cap12_done', 'joren_culpable_pista'),
    text: 'Inquisidor de la Arena, de manos juntas a la espalda y voz de quien dicta. Firmó la orden que quemó la guarida de La Marca, con la fecha de la noche del incendio. No lo niega: «No lo hice por maldad». Para él fue un trámite; para Joren, el día en que se le acabó el mundo. Kaelen es lo que pasa cuando un hombre bueno obedece demasiado tiempo.',
    more: [
      { when: f('joren_mata'), text: 'Joren cobró su deuda. Kaelen cayó sin sorpresa, como si esperara sin apuro un recado.' },
      { when: f('joren_perdona'), text: 'Joren lo dejó vivir. Kaelen se quedó de pie en el balcón mucho después, con la orden sin cumplir en la mano.' },
      { when: f('joren_captura'), text: 'Lo capturaron para llevarlo ante un juez, no en una bolsa. Kaelen no entiende por qué.' },
    ] },
  { id: 'nythra', cat: 'Personas', title: 'Nythra Vel\'Shara', unlock: f('cap11_done'),
    text: 'Hermana mayor de Zyr\'thar y envenenadora de la Casa Vel\'Shara, al servicio del Vizir en la Ciudadela. Escribe sus recetas en pergaminos perfumados y firma con una gota de cera negra. Enseñó a Zyr\'thar a caminar sin ruido cuando eran niñas, y a no confiar en nadie, ella incluida. Es la sombra que Zyr\'thar habría sido si se hubiera quedado.',
    more: [
      { when: f('velshara_mata'), text: 'Cayó sobre sus pergaminos con una sonrisa casi amable. Un frasco rodó hasta el borde de la mesa y no se rompió.' },
      { when: f('velshara_perdona'), text: 'Vive. Zyr\'thar la perdonó, y Nythra todavía no sabe qué hacer con eso.' },
      { when: f('velshara_expone'), text: 'Su nombre y el de la Casa se leyeron en la Plaza. Nythra huyó al desierto con lo puesto.' },
    ] },
  { id: 'azuran', cat: 'Personas', title: 'Azuran', unlock: f('pact_azuran', 'cap7_done'),
    text: 'Un ángel juzgado y caído, cuyo juicio tuvo lugar en un templete de los acueductos. Pact lleva su luz por dentro, o Azuran lleva la de Pact: ninguno de los dos lo sabe bien. Su lema era «Ni dioses ni djinns merecen fe ciega». Habla por la boca de Pact en los momentos menos oportunos. «Si tomás la corona, vas a recordarme», le dijo. Es la memoria que Pact eligió perder.',
    more: [
      { when: f('pact_recuerda'), text: 'Pact recordó el juramento. Azuran sonrió, por primera vez, con la cara de Pact.' },
      { when: f('pact_corona'), text: 'Pact tomó la corona invertida. Una llamarada dorada fracturada le salió del cuerpo, y las alas, negras.' },
      { when: f('pact_niega'), text: '«Yo soy Pact y ya no hay nadie más.» Azuran no contestó. El silencio también es una respuesta.' },
      { when: f('pact_asume'), text: 'En el Eclipse, una voz doble dijo: «Ahora sí».' },
    ] },
  { id: 'seraphel', cat: 'Personas', title: 'Seraphel y Kethras', unlock: or(q('o_maunator'), f('q_o_maunator', 'cap8_done')),
    text: 'Dos cambiaformas del Acto II, las dos caras de una misma moneda. Seraphel, de rostro claro y voz de campana, apareció prisionera en el Cubo de Maunator y sabe cosas del Juez de la Balanza que nadie debería saber. Kethras, de rojo sangre, buscaba bajo el Oráculo el artefacto de Cyric y prepara, dicen, un magnicidio divino. Su bando cambia según el trato que reciban. «Mentir es sólo hablar antes de tiempo», dice Kethras.',
    more: [
      { when: f('confia_seraphel'), text: 'La compañía confió en Seraphel. Ella inclinó la cabeza y avisó a Romain de un plan para cegarlo.' },
      { when: f('kethras_pacto'), text: 'Kethras cumplió el trato del Cubo, para sorpresa de todos, incluido él.' },
      { when: f('kethras_burlado', 'kethras_combate'), text: 'Kethras no perdona que lo hayan superado. Volverá en la Ciudadela.' },
    ] },
  { id: 'shib', cat: 'Personas', title: 'Shib', unlock: f('cap2_done'),
    text: 'Guía de los Hijos del Simurg, el que conoce cada túnel del Bajo y cada contraseña. Tiene la costumbre de estar muriéndose en los peores momentos, y la de no morirse del todo. Liberó djinns con la compañía y abrió los túneles la noche de la plaza para que el pueblo bajara a la biblioteca. Distribuye a los más duros en los tejados con ladrillos y arcos viejos; no sabe otra manera de proteger.',
    more: [
      { when: f('shib_curado'), text: 'Lo curaron con magia, a costa de tiempo y fuerzas. Shib dice que les debe una vida; ellos dicen que todavía les debe una sopa.' },
    ] },
  { id: 'oraculo', cat: 'Personas', title: 'El Oráculo de las Mil Lenguas', unlock: always,
    text: 'Puesto ambulante, espejo parlante o mujer con mil lenguas —según quién lo cuente—, el Oráculo recorre los distritos con la compañía y les dice lo que va a pasar. Miente siempre. Pero el evento es real. Durante generaciones dijo lo contrario de lo que sabía, y Zaryab aprendió a leer entre líneas, a pagar por las verdades a medias y a sospechar de todo lo que sonara claro. Fue una buena escuela de ciudad.',
    more: [
      { when: f('oraculo_verdadero'), text: 'Desde que la compañía tocó el espejo, el Oráculo dice la verdad. Los vendedores de augurios del Zoco abren sus puestos con cara de no saber qué venden.' },
    ] },
  { id: 'idris_yasmin', cat: 'Personas', title: 'Los ausentes: Idris, Yasmin, Mirabel', unlock: f('zahir_regalo_1', 'cap11_done', 'razul_yasmin'),
    text: 'Toda herida tiene un nombre, y esta historia está llena de nombres que no responden. El cronista los reúne aquí porque nadie más lo hará. Mirabel, el nombre que Zahir le devolvió a Pact como primer regalo. Idris el albañil, marido de Samira, que bajó a la mina. Yasmin, la niña a la que Razul sirvió un vaso de agua hace tres milenios. Cada falso dios se alimentó de uno de estos huecos.',
    more: [
      { when: f('samira_habla_idris'), text: 'Idris todavía escuchaba. Sus dedos, en la piedra, marcaron el compás de una respiración.' },
      { when: f('romain_peso_santo'), text: 'Romain enciende, algunas noches, una vela por una niña llamada Yasmin.' },
    ] },

  // ═════════════════════════ OBJETOS Y CONCEPTOS ═════════════════════════
  { id: 'fragmentos', cat: 'Objetos y conceptos', title: 'Los fragmentos del meteorito', unlock: f('cap2_done', 'fragmento_2'),
    text: 'Siete fragmentos de un mismo meteorito duermen en siete manos distintas. Cada uno es un trozo de aquel pájaro que dio sombra a cuarenta ciudades, y cada uno encontró a alguien con una herida del tamaño exacto para alojarlo. Zahir los quiere todos. Atraen al Gusano que escarba. Y no se juntan «porque sí»: cada vez hay que decidir si se le ceden a Zahir, si se guardan o si se rompen. Romper uno cuesta ahora y debilita a Zahir al final.',
    more: [
      { when: f('fragmento_3', 'cubo_superado'), text: 'El del Cubo de los Mil Reflejos le dio a Pact el poder de declarar «Una Verdad».' },
      { when: c => ['dahhak', 'marid', 'mazhar', 'gusano', 'razul'].filter(x => has(c, `frag_${x}_roto`)).length >= 2, text: 'La compañía ya rompió más de uno. Zahir no se lo reprocha: «Cada hueco que dejaron es un lugar donde ahora estoy más solo».' },
      { when: c => ['dahhak', 'marid', 'mazhar', 'gusano', 'razul'].filter(x => has(c, `frag_${x}_zahir`)).length >= 2, text: 'Varios fragmentos ya están en manos de Zahir. Sus plumas brillan un poco más. Las de la compañía, un poco menos.' },
    ] },
  { id: 'cristal', cat: 'Objetos y conceptos', title: 'El cristal de Zahir', unlock: f('cap0_done', 'cap1_done', 'cristal_zahir'),
    text: 'Un cristal violeta incrustado en el pecho de cada uno de los seis, que late como un segundo corazón. Es el precio y la prueba del pacto: por él resucitaron, por él lanzan milagros y por él Zahir sabe siempre dónde están. Se enfría cuando no cumplen lo prometido y se calienta cuando algo del Simurg anda cerca. Razul contó cuatro cristales antes que éstos; ninguno llegó colgado de un cuello.',
    more: [
      { when: f('hueso_djinn'), text: 'Junto al cristal, Zahir les dio un hueso de djinn: pueden ordenar a un Jann una vez al día.' },
      { when: f('pacto_roto'), text: 'Los cristales se apagaron. El hueco en el pecho tarda en cerrarse; el cronista sospecha que no se cierra.' },
    ] },
  { id: 'corrupcion', cat: 'Objetos y conceptos', title: 'Corrupción y Devoción', unlock: always,
    text: 'Las dos balanzas del culto. La Devoción crece con cada gesto que no espera recompensa: curar, perdonar, compartir el pan. La Corrupción, con cada atajo: el cristal hambriento, el miedo como herramienta, la sangre bien pagada. No se anulan: se puede ser muy devoto y muy corrupto a la vez, y los peores santos de Zaryab lo fueron. De ellas dependen los milagros que el cristal concede y los finales que quedan abiertos.',
    more: [
      { when: c => c.c >= 7, text: 'La Corrupción de la compañía ya se huele en la calle. Los niños del Bajo dejan de jugar cuando pasan.' },
      { when: c => c.d >= 7, text: 'La Devoción de la compañía ya es leyenda menor. Hay quien les deja flores secas en el umbral de la biblioteca.' },
      { when: c => c.c >= 4 && c.c <= 6 && c.d >= 4 && c.d <= 6 && has(c, 'cap8_done'), text: 'Están en el filo: ni santos ni monstruos. El cronista sospecha que ése es el lugar más difícil de sostener.' },
    ] },
  { id: 'postura', cat: 'Objetos y conceptos', title: 'La Postura: Orden, Pueblo o Sombra', unlock: f('cap5_done', 'postura_orden', 'postura_pueblo', 'postura_sombra'),
    text: 'Ante el Coloso de Dahhak, con la Plaza Central en llamas, la compañía tuvo que tomar partido en la guerra civil. El Orden ofrece estabilidad a cambio de obediencia. El Pueblo, justicia a cambio de caos. La Sombra, poder a cambio de no preguntar. Ninguna es inocente. La Postura decide cómo los recibe Medinat al-Rih, quién les abre la puerta y quién les cobra la entrada.',
    more: [
      { when: f('postura_orden'), text: 'Eligieron el Orden. Los escribas los saludan; los Nasnas, no.' },
      { when: f('postura_pueblo'), text: 'Eligieron al Pueblo. Shib abrió los túneles e Idris, Layla y Taj bajaron a la biblioteca con sus familias.' },
      { when: f('postura_sombra'), text: 'Eligieron la Sombra. Nadie lo dice en voz alta, que es exactamente lo que buscaban.' },
    ] },
  { id: 'ruta', cat: 'Objetos y conceptos', title: 'La Ruta: Sombra, Fe o Balanza', unlock: f('cap8_done'),
    text: 'Tras la visita del Vizir, la suma de sus actos fija un camino. El Camino de Zahir (Sombra) acerca el plan del djinn a su cumplimiento. El Camino del Simurg libre (Fe) apuesta por devolverle las alas al pájaro. El Camino del Juez (Balanza) busca un orden frágil que dependa de que nadie se canse primero. La Ruta no es una cárcel: es una pendiente. Se puede subir, pero cuesta.',
    more: [
      { when: f('ruta_sombra'), text: 'Su Ruta es la Sombra. Zahir sonríe más seguido.' },
      { when: f('ruta_fe'), text: 'Su Ruta es la Fe. Las plumas de Zahir tiemblan cuando hablan del Simurg libre.' },
      { when: f('ruta_balanza'), text: 'Su Ruta es la Balanza. Romain la lleva colgada del cinto como un recordatorio.' },
    ] },
  { id: 'eclipse', cat: 'Objetos y conceptos', title: 'El Eclipse', unlock: c => c.eclipseDay > 0 || has(c, 'cap5_done'),
    text: 'El día en que el sol se apague sobre Zaryab, Zahir completará su ritual en las Catacumbas. Desde la caída del Capitolio, la cuenta corre: ochenta días. Los astrónomos del Conclave lo saben y no lo publican. Los ancianos del Zoco lo sienten en las rodillas. Si la compañía llega sin terminar lo que empezó, el Eclipse no espera: se lanza con lo que haya.',
    more: [
      { when: f('cap10_done'), text: 'Una mañana el sol salió con un borde mordido. Fue un instante, nada más. Los niños lo señalaron.' },
      { when: f('eclipse_forzado'), text: 'El Eclipse llegó antes de que estuvieran listos. Nadie está listo para un Eclipse.' },
      { when: f('cap13_done'), text: 'El Eclipse pasó. Lo que quedó de Zaryab es obra de ustedes.' },
    ] },
  { id: 'djinns', cat: 'Objetos y conceptos', title: 'Los djinns y los molinos', unlock: always,
    text: 'La luz de las torres del Conclave es luz esclava: cien djinns atados con promesas giran ruedas día y noche para encender las lámparas de la ciudad alta. El primero fue atado hace trescientos años por un hombre cuyo nombre se perdió con razón. Los djinns no envejecen, pero se gastan: cantan para no oír el engranaje, y un día dejan de cantar. Los venden por tres monedas de plata.',
    more: [
      { when: f('djinns_libres', 'djinns_liberados', 'djinn_liberado'), text: 'Algunas lámparas del Capitolio no se encendieron una madrugada. El Conclave habló de un fallo técnico. El Bajo habló de otra cosa.' },
      { when: f('djinn_comprado', 'djinn_usado'), text: 'La compañía también compró o usó un djinn. El cronista no juzga; anota.' },
    ] },
  { id: 'sello', cat: 'Objetos y conceptos', title: 'Los PF y el Sello del Simurg', unlock: f('cap1_done', 'cap2_done'),
    text: 'Los Puntos de Fe son la moneda del culto: se ganan con sermones, seguidores y milagros, y se gastan en edificios, rituales y frentes. Cada punto de fe que entra queda también grabado en el Sello del Simurg, una cifra que la Biblioteca lleva en sus paredes aunque nadie la vea. Cuanto más alto el Sello, más cerca está Zahir de su ritual. La fe se acumula; nadie dijo que fuera gratis.',
    more: [
      { when: c => c.seal >= 60, text: 'El Sello ya pasó la mitad. Las paredes de la biblioteca sangran más aceite, y de un violeta más oscuro.' },
    ] },
  { id: 'arma_pacto', cat: 'Objetos y conceptos', title: 'El Arma de Pacto', unlock: f('cap3_done', 'rabb_recuerda'),
    text: 'La espada de Rabb Locke no es una espada cualquiera: es el contrato de un pacto que él no recuerda haber firmado. Susurra de noche. Dice que «Rabb Locke» no es su nombre. Cada vez que Rabb pierde un recuerdo, la hoja brilla un poco más. Algunos brujos llaman a estas armas «hipotecas con filo». Rabb la llama «ella», cuando cree que nadie lo oye.',
    more: [
      { when: f('rabb_activado'), text: 'Rabb aceptó la verdad: no olvidó, fue activado. La espada ya no susurra; habla.' },
      { when: f('rabb_rechaza_pacto'), text: 'Rabb rechazó el Pacto Original. Guarda la espada en un cofre y no la abre.' },
      { when: f('rabb_rompe'), text: 'La espada se deshizo en ceniza gris. Rabb sostuvo una empuñadura vacía y lloró sin saber por qué.' },
    ] },
  { id: 'alfombra', cat: 'Objetos y conceptos', title: 'La alfombra viviente', unlock: f('alfombra_viviente', 'alfombra_ardiente', 'alfombra_defectuosa', 'alfombra_sacrificada'),
    text: 'Tejida a mano por Al-Khush con hilos de djinn libre, la alfombra respira, se queja del frío y tiene opiniones sobre las rutas. Lleva a la compañía de un distrito a otro sin consumir el día. Los mercaderes del Zoco ofrecieron por ella lo que vale una casa con patio; nadie se la vendió. Al-Khush dice que cada nudo es un nombre de djinn vendido, para que alguien los lleve encima.',
    more: [
      { when: f('alfombra_sacrificada'), text: 'La alfombra se sacrificó. Al-Khush guardó un hilo en el bolsillo.' },
      { when: f('honro_alfombra'), text: 'La compañía honró a la alfombra. En el Zoco aún se cuenta.' },
    ] },
  { id: 'nana', cat: 'Objetos y conceptos', title: 'La nana de la biblioteca', unlock: f('cap2_done'),
    text: 'Una melodía sencilla, muy desafinada, de cuatro notas. Farid la toca en el arpa y se calla antes de la cuarta. Aisha la tararea y nunca llega al final. Nadie recuerda haberla aprendido: estaba en la biblioteca antes que ellos, como el aceite de las paredes. El cronista sospecha que es más vieja que Zaryab, y que alguien la cantaba para que un pájaro grande se durmiera.',
    more: [
      { when: f('mazhar_nana'), text: 'Contra el Lich, la nana funcionó como una hiedra: subió por su cuerpo y lo apagó.' },
      { when: f('voz_farid'), text: 'Alguien la copió en la pared de la Sala de las Voces, rendija por rendija, con paciencia de copista.' },
      { when: f('cap12_done'), text: 'La noche antes del Eclipse, Farid tocó las cuatro notas.' },
    ] },
  { id: 'corazon_dormido', cat: 'Objetos y conceptos', title: 'El Corazón Dormido', unlock: f('cap12_done', 'razul_yasmin'),
    text: 'Bajo la torre de la Ciudadela late, despacio, el corazón que mantiene vivo a Razul desde hace tres mil años. No es suyo: es un pedazo del Simurg que el Vizir tomó la noche en que murió Yasmin, cuando decidió quedarse. «Cuando Zaryab no me necesite, se apagará», dijo. Alrededor del Corazón, la piedra está tibia y las runas no giran: allí nadie miente porque nadie habla.',
    more: [
      { when: f('razul_silencio'), text: 'Se detuvo. El Vizir no cayó: se apagó.' },
      { when: f('frag_razul_roto'), text: 'El fragmento se rompió. Donde iba hay una silla de piedra y nadie se atreve a sentarse.' },
    ] },
  { id: 'espiral', cat: 'Objetos y conceptos', title: 'La Espiral del Dios Caducado', unlock: f('cap8_done', 'razul_historia'),
    text: 'Así llama Razul a lo que ha visto repetirse durante tres milenios: una voz amable promete, un pueblo agradecido adora, la promesa resulta imposible, el dios se vuelve tirano o se apaga, y otra vez el desierto. Merab, Hadir, el Profeta. Razul cree que Zahir es la cuarta vuelta. «Todos los dioses empiezan con una voz amable», dice. Lo que no dice es si él mismo es parte de la espiral.',
    more: [
      { when: f('final_espiral'), text: 'La compañía eligió la Espiral. Zahir se unió a los fragmentos, y Razul, en algún lugar, anotó la fecha.' },
    ] },
  { id: 'venda', cat: 'Objetos y conceptos', title: 'La Venda de Ellie', unlock: f('conoce_ellie', 'torneo_digno', 'torneo_perdido'),
    text: 'Una tira de lino blanco que Ellie lleva enrollada en la muñeca y que, según los monjes de Qadir-Kalmah, ata y desata. Se enrolla sola, como una serpiente de lino, en la muñeca de quien la necesita. Tocarla es sentir un nudo deshacerse en algún lugar del cuerpo. En el Eclipse, quien la lleve podrá romper lo que otros juraron.',
    more: [
      { when: f('torneo_digno'), text: 'Panchi perdió con dignidad, y Ellie lo reconoció. Ese día la venda cambió de muñeca.' },
      { when: f('panchi_perdona'), text: 'Ellie le pone la venda cada mañana, y los dos fingen que no se miran.' },
    ] },
  { id: 'huellas', cat: 'Objetos y conceptos', title: 'Las Huellas', unlock: c => c.huellas.length > 0,
    text: 'Lo que la compañía deja atrás. Cada decisión que pesa queda escrita en la memoria de Zaryab como una línea en la arena: no la borra el viento, sólo la cubre. Las Huellas no son buenas ni malas; son lo que la ciudad contará de ustedes cuando ya no estén. El Diario las recoge, y el epílogo también. El cronista, en este códice, se limita a recordar que existen.',
    more: [
      { when: c => c.huellas.length >= 5, text: 'Ya son muchas. La ciudad empieza a contar historias de ustedes que ustedes no reconocen.' },
    ] },

  // ═════════════════════════ LA COMPAÑÍA ═════════════════════════
  { id: 'compania', cat: 'La compañía', title: 'Los seis apóstoles', unlock: always,
    text: 'Seis desconocidos llegaron por el desierto empujados por una tormenta: un clérigo de Kelemvor, un aasimar de alas dormidas, un brujo sin memoria, un cazador con una deuda, una asesina drow y un monje enano con la ira en los nudillos. Los capturaron los ibis negros, los juzgó el Vizir Razul y los ejecutó. Despertaron en un vacío blanco, frente a un djinn de plumas doradas. Lo que vino después es este códice.',
    more: [
      { when: f('cap5_done'), text: 'Para el Bajo ya no son forasteros: son «los del cristal». Para el Conclave, un problema con seis nombres.' },
      { when: c => c.dead.length > 0, text: 'No todos siguen de pie. La compañía aprendió que una segunda vida no garantiza una tercera.' },
      { when: f('cap13_done'), text: 'Cada uno eligió quién sería. El epílogo lo cuenta; el cronista se limita a dar fe.' },
    ] },
  { id: 'pc_romain', cat: 'La compañía', title: 'Romain', unlock: always,
    text: 'Clérigo de Kelemvor, el Juez de los Muertos. Sabio huérfano criado en un templo que el Conclave quemó, carga una balanza vacía que su dios le dio para pesar almas y que nunca se inclinó. Cuando la compañía murió en la arena, Kelemvor no los reclamó, y Zahir aprovechó la duda. Su arco es el de la Balanza Vacía: si llegará a ser el Juez compasivo o el Verdugo depende de qué pese primero.',
    more: [
      { when: f('romain_venganza'), text: 'En el Templo Quemado eligió la venganza contra los Inquisidores. Las Garras del Efrit le arden en las manos.' },
      { when: f('romain_pruebas'), text: 'En el Templo Quemado eligió buscar pruebas. La Luz del Simurg brilla más en él.' },
      { when: f('romain_perdon'), text: 'En el Templo Quemado eligió perdonar. Una duda que se volvió poder: el Eclipse Personal.' },
      { when: and(poleA('romain'), f('cap4_done')), text: 'Se inclina hacia el Juez compasivo: pesa antes de condenar, y a veces no condena.' },
      { when: and(poleB('romain'), f('cap4_done')), text: 'Se inclina hacia el Verdugo: su balanza ya no está vacía, y pesa lo que pesa.' },
      { when: f('romain_voz'), text: 'Ofreció su voz al Lich para salvar a Farid. Ya no habla; le basta una mirada y una libreta.' },
      { when: f('romain_peso_santo'), text: 'Pesó a Razul con compasión, y la balanza se inclinó a su favor.' },
      { when: f('romain_peso_verdugo'), text: 'Pesó a Razul sin piedad. Los hombres de Zaryab tiemblan al oírlo hablar de justicia.' },
      { when: f('romain_peso_duda'), text: 'No quiso pesar a Razul. La balanza sigue vacía, y por primera vez eso no le duele.' },
    ] },
  { id: 'pc_pact', cat: 'La compañía', title: 'Pact Risen', unlock: always,
    text: 'Aasimar de alas dormidas, el Caído que busca redención. Razul se burló de sus alas en el juicio; Zahir le devolvió un nombre. Pact guarda dentro la luz de Azuran, un ángel juzgado, y no sabe dónde termina uno y empieza el otro. Habla poco y, cuando lo hace, declara verdades que pesan como piedras. Su arco es el del Segundo Aliento: Redentor o Tirano, según qué haga con una corona invertida.',
    more: [
      { when: f('zahir_regalo_1'), text: '«Mirabel.» Es todo lo que dijo cuando Zahir le devolvió el recuerdo. Se sentó en el suelo con la cara entre las manos.' },
      { when: f('dahhak_oferta_pact', 'pact_oyo_dahhak'), text: 'Dahhak le ofreció ser su aprendiz y una corona. Pact escuchó, que es más de lo que muchos se atreven.' },
      { when: f('pact_rechaza_dahhak'), text: 'Rechazó al mentor falso. Dahhak lo miró como se mira una oportunidad perdida.' },
      { when: and(poleA('pact'), f('cap4_done')), text: 'Se inclina hacia el Redentor: carga con lo que fue sin dejar que lo gobierne.' },
      { when: and(poleB('pact'), f('cap4_done')), text: 'Se inclina hacia el Tirano: la corona le queda cómoda, y eso es lo que da miedo.' },
      { when: f('pact_rinde'), text: 'Rindió la corona. No tiene alas ni juicio, pero tiene una casa al borde de la ciudad.' },
      { when: f('pact_asume'), text: 'Asumió la corona: un ángel de la verdad con voz doble.' },
    ] },
  { id: 'pc_rabb', cat: 'La compañía', title: 'Rabb Locke', unlock: always,
    text: 'Brujo sin memoria, el Amnésico buscador. Despertó en el desierto con una espada de pacto en la mano y un nombre que la espada dice que no es el suyo. «¿Quién soy?», preguntó en el juicio, y Razul anotó la pregunta. Pierde recuerdos como otros pierden monedas. Su arco es el del Nombre en el Arma: Autor de sí mismo o Herramienta, según quién escriba el siguiente contrato.',
    more: [
      { when: f('rabb_memoria'), text: 'Investigó su pasado. Encontró una escalera, un olor y una mano, y ninguna cara.' },
      { when: f('rabb_acepta'), text: '«Soy Rabb Locke», dijo, y la hoja se calló un rato.' },
      { when: f('rabb_libre'), text: 'Intentó destruir el arma. La hoja se partió, pero algo siguió hablando.' },
      { when: and(poleA('rabb'), f('cap4_done')), text: 'Se inclina hacia el Autor de sí mismo: decide quién quiere ser aunque no sepa quién fue.' },
      { when: and(poleB('rabb'), f('cap4_done')), text: 'Se inclina hacia la Herramienta: obedece con una calma que inquieta a los demás.' },
      { when: f('rabb_firma'), text: 'Firmó un contrato nuevo con su propio nombre. La espada lo repite al amanecer.' },
      { when: f('rabb_reescribe'), text: 'Se dejó reescribir. Recuerda una vida completa y a veces duda de que sea la suya.' },
    ] },
  { id: 'pc_joren', cat: 'La compañía', title: 'Joren Hell', unlock: always,
    text: 'Cazador, el Forajido vengador. Perteneció a La Marca hasta la noche en que alguien la vendió y la guarida ardió con su gente dentro. Desde entonces caza al que firmó la orden. Duerme con la cantimplora en el pecho y una flecha suelta en la mano. Habla de rastros y vientos como otros hablan del clima. Su arco es el del Muerto que Respira: Protector o Cazador, según qué haga cuando tenga al culpable delante.',
    more: [
      { when: f('joren_abierto'), text: '«Es verdad, y no sé si podré con ello.» Es lo más largo que dijo sobre sí mismo.' },
      { when: f('cap6_done'), text: 'En Medinat se reencontró con un compañero de La Marca al que daba por muerto. Respira.' },
      { when: and(poleA('joren'), f('cap4_done')), text: 'Se inclina hacia el Protector: apunta primero a lo que amenaza a los suyos.' },
      { when: and(poleB('joren'), f('cap4_done')), text: 'Se inclina hacia el Cazador: la presa es lo único que le ordena el día.' },
      { when: f('joren_mata'), text: 'Cobró su deuda con Kaelen. Dice que no cambió nada.' },
      { when: f('joren_perdona'), text: 'Dejó vivir a Kaelen y volvió a Medinat a sentarse junto al muerto que respira.' },
      { when: f('joren_captura'), text: 'Llevó a Kaelen ante un juez. Es la primera vez que entrega una presa viva.' },
    ] },
  { id: 'pc_zyrthar', cat: 'La compañía', title: 'Zyr\'thar', unlock: always,
    text: 'Asesina drow, la Traidora embaucadora. Creció en la Casa Vel\'Shara y la traicionó; desde entonces mira las puertas antes que las caras. Tiene una sombra que no siempre le obedece y que, en el Jardín de los Suspiros, mostró un rizo de pluma. Ríe poco y con media boca. Su arco es el de la Sombra Perfecta: Guardiana o Sombra, según si aprende a confiar o a desaparecer.',
    more: [
      { when: f('zyr_eliminada'), text: 'Eliminó a la espía de Vel\'Shara en el Zoco. Ganó tiempo; la Casa, motivos.' },
      { when: f('zyr_mensaje'), text: 'Dejó ir a la espía con un mensaje para la Casa. El mensaje no se transcribe aquí.' },
      { when: f('zyr_sombra_acepta'), text: 'Dejó que la sombra actuara. Por primera vez sonrió con la boca entera.' },
      { when: f('zyr_sombra_resiste'), text: 'Le ordenó a la sombra quedarse quieta. Le temblaron las rodillas, pero la sombra obedeció.' },
      { when: f('zyr_sombra_fragmento'), text: 'Su sombra es un resto del Simurg, una pluma dormida que se alimenta de ella.' },
      { when: and(poleA('zyrthar'), f('cap4_done')), text: 'Se inclina hacia la Guardiana: se para entre los suyos y la puerta.' },
      { when: and(poleB('zyrthar'), f('cap4_done')), text: 'Se inclina hacia la Sombra: cada vez cuesta más verla llegar.' },
    ] },
  { id: 'pc_panchi', cat: 'La compañía', title: 'Panchi', unlock: always,
    text: 'Monje enano de Qadir-Kalmah, el Guerrero furioso. Dejó el monasterio con la ira por equipaje y los nudillos vendados. Dice que la meditación es para los que no tienen a quién pegarle, y luego medita una hora sin que nadie lo vea. Odia que le muevan la mesa. Su arco es el de la Ira del Monje: Maestro o Llama, según si aprende a abrir la mano. «Traelo o no vengas», le dijeron una vez.',
    more: [
      { when: f('golem_aliado'), text: 'Controló al golem roto que golpeaba la biblioteca. Lo bautizó «Defectuoso» y le enseña a hacer té.' },
      { when: f('nucleo_golem'), text: 'Desmanteló el golem y se quedó con su núcleo. Dice que late cuando él se enoja.' },
      { when: f('torneo_perdido', 'torneo_digno'), text: 'Perdió el Torneo de los Puños Cerrados ante Sifra la Silente. No se fue.' },
      { when: and(poleA('panchi'), f('cap4_done')), text: 'Se inclina hacia el Maestro: enseña a los chicos del Bajo a caer sin romperse.' },
      { when: and(poleB('panchi'), f('cap4_done')), text: 'Se inclina hacia la Llama: la ira ya no le cabe en los nudillos.' },
      { when: f('panchi_cierra'), text: 'Cerró el puño contra Zahir. El golpe más lento y preciso de su vida.' },
      { when: f('panchi_perdona'), text: 'Abrió la mano.' },
      { when: f('panchi_guarda'), text: 'Guardó la rabia, como quien guarda una piedra en el bolsillo para recordar su peso.' },
    ] },
];
void alive; void not; void all;

export const CODEX_BY_ID: Record<string, Entry> = Object.fromEntries(CODEX.map(e => [e.id, e]));

// ── lectura ──
export interface CodexView { id: string; cat: CodexCat; title: string; paras: string[]; isNew: boolean; grew: boolean }
const readKey = (id: string) => `cx_${id}`;
/** Cuántos párrafos de la entrada se leyeron (0 = nunca). */
export function readCount(c: Campaign, id: string): number {
  if (!has(c, readKey(id))) return 0;
  const tag = c.flags.find(x => x.startsWith(readKey(id) + '@'));
  return tag ? Number(tag.slice(readKey(id).length + 1)) || 1 : 1;
}
export const visibleParas = (c: Campaign, e: Entry): string[] => [e.text, ...(e.more ?? []).filter(m => m.when(c)).map(m => m.text)];
export function codexUnlocked(c: Campaign): CodexView[] {
  return CODEX.filter(e => e.unlock(c)).map(e => {
    const paras = visibleParas(c, e); const r = readCount(c, e.id);
    return { id: e.id, cat: e.cat, title: e.title, paras, isNew: r === 0, grew: r > 0 && paras.length > r };
  });
}
/** Entradas desbloqueadas que aún no se leyeron (o que sumaron párrafos desde la última lectura). */
export function codexNew(c: Campaign): Entry[] {
  return CODEX.filter(e => e.unlock(c) && readCount(c, e.id) < visibleParas(c, e).length);
}
/** Marca la entrada como leída con los párrafos que tiene ahora. */
export function markRead(c: Campaign, id: string) {
  const e = CODEX_BY_ID[id]; if (!e) return;
  const n = visibleParas(c, e).length; const k = readKey(id);
  c.flags = c.flags.filter(x => !x.startsWith(k + '@'));
  if (!c.flags.includes(k)) c.flags.push(k);
  if (n > 1) c.flags.push(`${k}@${n}`);
}
