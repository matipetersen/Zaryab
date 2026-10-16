import type { Node, Opt } from '../story/types';
import type { Campaign, Effect } from '../state';
import { built } from '../state';
import { pick, d } from '../engine/dice';

// ───────────────────────────────────────────────────────────────────────────
//  Oráculo de las Mil Lenguas.
//  Todo lo que dice es falso (canon): el augurio se muestra y luego se revela
//  el evento real. Fuente: tabla de 100 encuentros aleatorios del resumen de
//  campaña + tablas d10 por zona.
// ───────────────────────────────────────────────────────────────────────────
type Kind = 'color' | 'trato' | 'dilema' | 'combate' | 'gancho';
export interface OEv {
  n: number; kind: Kind; title: string; text: string;
  a?: Effect; aT?: string; rT?: string; pay?: string; trap?: boolean;   // trato: aceptar / rechazar
  opts?: Opt[]; enc?: string; fx?: Effect; hook?: string; hookNote?: string; only?: string[];
}
const ev = (n: number, kind: Kind, title: string, text: string, o: Partial<OEv> = {}): OEv => ({ n, kind, title, text, ...o });
const trato = (n: number, title: string, text: string, pay: string, a: Effect, aT: string, o: Partial<OEv> = {}) => ev(n, 'trato', title, text, { pay, a, aT, ...o });

export const D100: OEv[] = [
  ev(1, 'dilema', 'Un perro callejero', 'Un perro flaco os sigue buscando comida y atención. No tiene ningún propósito en particular.', { opts: [
    { label: 'Darle de comer', hint: 'Un gesto pequeño.', e: { d: 1, follow: ['Perro callejero'] }, result: ['El perro mueve la cola. Desde ahora duerme en la biblioteca.'] }, { label: 'Ignorarlo', result: ['El perro os mira alejaros y se tumba en el polvo.'] }] }),
  ev(2, 'gancho', 'Un sabio anciano', 'Un anciano de barba de polvo ofrece compartir secretos de la historia de la ciudad a cambio de ayuda para encontrar su libro de hechizos perdido.', { hook: 'gancho_libro', hookNote: 'Nueva misión disponible en el Zoco: El Libro del Sabio.' }),
  ev(3, 'color', 'Gusano de cabeza de martillo', 'Un gusano emerge del suelo con múltiples cabezas que atacan a quien se siente amenazado. Os quedáis muy quietos. Muy, muy quietos. ¿O lo atacáis?', { opts: [
    { label: 'Quedaros muy quietos', hint: 'Se hunde de nuevo en la arena. Perdéis un poco de fe en vosotros mismos.', e: { pf: -1 }, result: ['El gusano se hunde en la arena. Nadie respira hasta que pasa un buen rato.'] },
    { label: 'Atacarlo', hint: 'Combate difícil: se regenera 10 PG por turno.', e: { c: 0 }, result: ['Cada cabeza gira hacia vosotros a la vez.'], then: [{ t: 'battle', enc: 'gusano_martillo' }] }] }),
  ev(4, 'color', 'Demonio de la risa', 'Un demonio de la risa os persigue por un callejón. Durante un rato nadie puede hablar en serio. Aisha jura que oyó a Zahir reírse también.'),
  ev(5, 'dilema', 'Un niño que juega con sombras', 'Un niño pequeño juega con sombras que no parece entender. Las sombras sí le entienden a él.', { opts: [
    { label: 'Llevarlo a casa y avisar a su familia', e: { d: 1, pf: 1 }, result: ['La madre llora de alivio. Dibuja el ojo del Simurg en su puerta.'] }, { label: 'Dejar que juegue', result: ['Las sombras se ríen detrás de vosotros.'] }] }),
  ev(6, 'color', 'Un músico triste', 'Un músico toca melodías tristes y atrae a un pequeño grupo de oyentes. No causa impacto en nadie, salvo que a Romain se le humedecen los ojos.'),
  trato(7, 'Mercader de antigüedades', 'Un mercader de antigüedades ofrece información valiosa sobre un artefacto perdido a cambio de un objeto raro.', '−3 PF', { pf: -3, flags: ['pista_artefacto'] }, 'Os dibuja un mapa en una servilleta: el artefacto está bajo el Zoco, donde el mármol suena hueco.'),
  ev(8, 'color', 'Un gato callejero', 'Un gato se sienta sobre las pertenencias de Panchi. No causa ningún problema. Panchi no se mueve en una hora.'),
  ev(9, 'color', 'Demonio de la confusión', 'Un demonio de la confusión lanza un hechizo y durante un rato todos olvidan quién es quién. Rabb jura que cambió de nombre dos veces.'),
  trato(10, 'Bardo encantado', 'Un bardo encantado toca su laúd y un PJ cae en trance: vulnerable, pero conoce secretos ocultos.', '+1 Corrupción', { c: 1, pf: 2, flags: ['secretos_bardo'] }, 'Os dice un secreto del Conclave. Os cuesta una pesadilla.', { trap: true }),
  ev(11, 'dilema', 'Un culto secreto', 'Un culto secreto adora a un antiguo ser y está dispuesto a hacer sacrificios.', { opts: [
    { label: 'Unirse a la ceremonia', hint: 'Poder con precio.', e: { c: 1, pf: 3 }, result: ['La sangre de una cabra y un nombre que no recordaréis. El cristal late.'] }, { label: 'Denunciarlos al barrio', e: { d: 1, alert: 1, rep: { conclave: 1 } }, result: ['Los guardias se llevan a los fanáticos. Os miran con sospecha: ¿cómo lo sabíais?'] }, { label: 'Dejarlos en paz', result: ['Vuestra puerta no es la suya.'] }] }),
  trato(12, 'Místico del trueque', 'Un místico ofrece un poder temporal a cambio de un recuerdo personal.', '+1 Corrupción', { c: 1, pf: 5, flags: ['recuerdo_vendido'] }, 'Entregáis un recuerdo de infancia. Notáis un hueco tibio donde antes había una risa.', { trap: true }),
  trato(13, 'Herborista', 'Un herborista ofrece pociones poderosas a cambio de rarezas recolectadas en la cueva.', '−2 PF', { pf: -2, d: 1, flags: ['remedio_extra'] }, 'Os da un frasco de tintura que huele a menta y a miedo.'),
  trato(14, 'Artesano', 'Un artesano puede reparar y mejorar vuestro equipo si le traéis materiales raros.', '−3 PF', { pf: -3, flags: ['equipo_mejorado'] }, 'Os devuelve las armas más afiladas. Parecen reconoceros.'),
  ev(15, 'color', 'Un bicho que cambia de forma', 'Un bicho cambia de forma al tocar a Joren: durante un día parece una cabra. Joren no se queja, pero tampoco habla.'),
  ev(16, 'dilema', 'Un espectro que busca a su amante', 'Un espectro se queja de su soledad, sin afectar a nadie. Pregunta por Layla.', { opts: [
    { label: 'Escuchar su historia', e: { d: 1, pf: 2 }, result: ['Una hora de lamentos. Una lágrima de luz. Al irse, el espectro deja un hilo dorado en el suelo.'] }, { label: 'Seguir caminando', result: ['El espectro no se ofende. Ya está acostumbrado.'] }] }),
  trato(17, 'Un místico itinerante', 'Un místico ofrece un hechizo temporal a cambio de una tarea peligrosa.', '+1 Alerta', { pf: 3, alert: 1 }, 'Un encargo en la Plaza: robar un pergamino de un cuartel. Lo cumplís. El místico desaparece.'),
  trato(19, 'Vendedor de dulces', 'Un vendedor de dulces ofrece golosinas exóticas y le gusta contar historias absurdas.', '−1 PF', { pf: -1, d: 1 }, 'Los dulces saben a cardamomo y a recuerdos ajenos. Reís por primera vez en días.'),
  ev(20, 'color', 'Un druida de la cueva', 'Un druida de la cueva transforma a Panchi en tejón pequeño para escapar de un peligro. Pero Panchi queda incapacitado para luchar… durante dos minutos.'),
  ev(21, 'color', 'Un hombre que busca su sombra', 'Un hombre pasa el día persiguiendo su sombra, que va siempre un paso por delante. Zyr\'thar se mira la suya con desconfianza.'),
  trato(22, 'Espíritu guardián', 'Un espíritu guardián otorga la habilidad de volar a un PJ, pero a cambio le hace sentir un intenso miedo a las alturas.', '+1 Corrupción', { c: 1, pf: 2 }, 'Pact vuela diez metros. Al bajar tiene los dedos blancos.', { trap: true }),
  ev(23, 'color', 'Un mercader de especias', 'Un mercader de especias habla de su vida y sus sueños. No ofrece nada útil, pero huele a canela y a hogar.'),
  ev(24, 'gancho', 'Un gato que habla', 'Un gato que habla es el guardián de una biblioteca secreta llena de conjuros. Dice que sólo habla con quien lo trata de «señor».', { hook: 'gato_biblioteca', hookNote: 'El gato recuerda vuestros nombres. Podría volver a aparecer.' }),
  trato(25, 'Alquimista', 'Un alquimista necesita ingredientes raros para crear una poción que cura una maldición.', '−3 PF', { pf: -3, d: 1, flags: ['antidoto_maldicion'] }, 'Os da un frasco turbio. «Cuando lo necesitéis, lo sabréis.»'),
  ev(26, 'dilema', 'Un templo antiguo', 'Un templo antiguo otorga poderes mágicos a un PJ, pero a cambio debe llevar una marca visible de su elección.', { opts: [
    { label: 'Aceptar la marca', hint: 'Poder con un rostro nuevo.', e: { c: 1, pf: 4, flags: ['marca_templo'] }, result: ['La marca arde y se enfría. Ahora todo el mundo ve lo que sois.'] }, { label: 'Rechazar', e: { d: 1 }, result: ['Las puertas del templo se cierran con un suspiro.'] }] }),
  ev(27, 'color', 'Un flautista', 'Un flautista toca melodías hipnotizantes, pero no tiene ninguna influencia sobre vosotros. Panchi baila sin querer.'),
  ev(28, 'color', 'Un golem de cristal', 'Un golem de cristal os cierra el paso. Al tocarlo, un PJ se vuelve cristal unos segundos: vulnerable, pero inmune a ataques físicos. Rabb parece un candelabro.'),
  ev(29, 'color', 'Demonio de la tristeza', 'Un demonio de la tristeza se alimenta de las emociones negativas de los demás. Os quita unos pesares de encima. Es un alivio raro.', { fx: { d: 1 } }),
  ev(30, 'trato' as Kind, 'Prisionero encadenado', 'Un prisionero ofrece información sobre una facción oculta a cambio de su libertad.', { a: { rep: { hijos: 1 }, alert: 1, flags: ['prisionero_liberado'] }, aT: 'Lo liberáis. Os da un nombre y una dirección: «El hombre del ojo que no ve», dice. Luego corre.', pay: '+1 Alerta' }),
  ev(31, 'color', 'Un hombre que se queja del clima', 'Un hombre se queja del clima sin parar. Nadie puede hacer nada. Es tormenta de arena. Siempre.'),
  ev(32, 'color', 'Ancianos jugando a las cartas', 'Un grupo de ancianos juega a las cartas en una esquina, hablando de tiempos pasados sin propósito. Alguien dice «El Simurg» y todos callan.'),
  ev(33, 'color', 'Un espíritu que roba recuerdos', 'Un espíritu os roba un recuerdo por un rato. Zyr\'thar no recuerda su infancia durante una hora. Dice que no ha cambiado nada.'),
  ev(34, 'color', 'Un bicho que brilla', 'Un bicho que brilla en la oscuridad llama la atención de los PJ, pero no tiene significado alguno.'),
  ev(35, 'dilema', 'Un hombre que busca su identidad', 'Un hombre pregunta a todos quién es. Rabb lo mira demasiado tiempo.', { opts: [
    { label: 'Ayudarlo a recordar', e: { d: 1, pf: 2 }, result: ['Se llama Ismail. Trabaja de sastre. Os abraza y se va llorando de alegría.'] }, { label: 'Decirle que no hay respuesta', e: { c: 1 }, result: ['El hombre se queda quieto. Rabb se aleja pálido.'] }] }),
  ev(36, 'color', 'Un vagabundo mentiroso', 'Un vagabundo cuenta historias de su vida que al final resultan ser mentiras. Todas. Incluida la del final.'),
  ev(37, 'color', 'Un demonio de los sueños', 'Un demonio de los sueños provoca pesadillas. A la mañana siguiente nadie quiere hablar de lo que vio.', { fx: { c: 1 } }),
  ev(38, 'color', 'Un demonio que juega con los sueños', 'Un demonio que juega con los sueños mezcla las pesadillas de todos. Pact amanece con una de Rabb. Rabb, con una de Pact.'),
  trato(39, 'Un ser que busca compañía', 'Un ser sin nombre ofrece sabiduría a cambio de amistad.', 'una hora de conversación', { d: 1, pf: 1, flags: ['amigo_ser'] }, 'Hablan de nubes, de muertos y de pan. Os da un consejo: «No firméis nada con tinta.»'),
  ev(40, 'gancho', 'Un guardia de la ciudad', 'Un guardia ofrece un mapa detallado de los pasajes ocultos de la cueva a quienes demuestren valentía.', { hook: 'mapa_pasajes', hookNote: 'Obtenéis pistas sobre los pasajes ocultos de Zaryab.' }),
  ev(41, 'dilema', 'Un espíritu de la guerra', 'Un espíritu de la guerra busca un digno campeón para luchar a su lado.', { opts: [
    { label: 'Que Panchi acepte el desafío', e: { c: 1, pf: 3 }, result: ['Panchi pelea contra el aire. El aire pierde.'] }, { label: 'Rechazar con respeto', e: { d: 1 }, result: ['El espíritu asiente: «Otro día.»'] }] }),
  ev(42, 'color', 'Un druida', 'Un druida ofrece convertir a un PJ en animal por un favor. Nadie acepta, pero todos lo piensan.'),
  ev(43, 'gancho', 'Un buscador de artefactos', 'Un hombre busca un antiguo artefacto y pide ayuda. Su mapa tiene una cruz sobre Medinat al-Rih.', { hook: 'gancho_artefacto', hookNote: 'El artefacto podría estar en el Este.' }),
  trato(44, 'Un médico errante', 'Un médico que cura enfermedades pide ingredientes raros que sólo se encuentran en la cueva.', '−2 PF', { pf: -2, d: 1, flags: ['medico_aliado'] }, 'Cura a tres de vuestros seguidores y promete volver.'),
  ev(45, 'color', 'Un bailarín en la plaza', 'Un bailarín realiza movimientos complejos en la plaza. No tiene relación con la historia. Pero a Zyr\'thar le gusta.'),
  trato(46, 'Un místico del futuro', 'Un místico puede leer el futuro y ofrece consejos a cambio de una historia sobre la valentía de los PJ.', 'una historia', { pf: 2, d: 1, flags: ['consejo_mistico'] }, 'Cuenta que os verá el rostro en un espejo roto. Cuenta que no es mentira.'),
  ev(47, 'gancho', 'Un jardinero de las sombras', 'Un jardinero cultiva plantas en terreno maldito y busca un curador.', { hook: 'jardinero_sombras', hookNote: 'Un jardinero busca a un curador. Romain tiene una idea.' }),
  ev(48, 'dilema', 'Un hombre convertido en monstruo', 'Un hombre se ha convertido en un monstruo y busca redención.', { opts: [
    { label: 'Ayudarlo', e: { d: 1, pf: 2 }, result: ['Romain reza con él. Ya no tiene colmillos; tiene hambre menos.'] }, { label: 'Acabar con su sufrimiento', e: { c: 1, pf: 1 }, result: ['Un golpe limpio. No dice nada. Romain aparta la mirada.'] }] }),
  ev(49, 'dilema', 'El fantasma de una princesa', 'El fantasma de una princesa busca recuperar su reliquia familiar perdida.', { opts: [
    { label: 'Prometer buscarla', e: { d: 1, flags: ['reliquia_princesa'] }, result: ['La princesa sonríe como sonríe un espejo roto.'] }, { label: 'Pedirle un pago', e: { c: 1, pf: 3 }, result: ['Os da un anillo que se desvanece a medianoche.'] }] }),
  ev(50, 'color', 'Un demonio con la cara de un conocido', 'Un demonio toma la forma de un conocido e intenta engañaros. Joren lo descubre por cómo sostiene el arco: del lado equivocado.'),
  ev(51, 'gancho', 'Un príncipe exiliado', 'Un príncipe exiliado busca recuperar su trono y ofrece recompensas.', { hook: 'principe_exiliado', hookNote: 'Un príncipe exiliado pide ayuda. Podría ser útil… o ruinoso.' }),
  ev(52, 'dilema', 'Una serpiente gigante', 'Una serpiente gigante protege un tesoro y exige un acertijo para pasar: «¿Qué tiene cuello pero no cabeza?»', { opts: [
    { label: '«Una botella»', e: { pf: 4 }, result: ['La serpiente sisea de rabia y se aparta. El tesoro es pequeño pero real.'] }, { label: '«Dahhak»', e: { c: 1 }, result: ['La serpiente se ríe: «Casi.» Os muerde el orgullo, no el cuerpo.'] }] }),
  ev(53, 'dilema', 'Un manantial sagrado', 'Un espíritu de la naturaleza protege un manantial de la contaminación.', { opts: [
    { label: 'Limpiar el manantial', e: { d: 1, pf: 2 }, result: ['Un pájaro de agua vuela sobre el manantial: el Simurg, tal vez.'] }, { label: 'Llevarse agua para el santuario', e: { pf: 1 }, result: ['El agua sabe a hierro. Os dura una semana.'] }] }),
  ev(54, 'dilema', 'Un hombre que busca venganza', 'Un hombre busca venganza contra quienes le hicieron daño y reconoce el sello del Conclave en vuestras ropas.', { opts: [
    { label: 'Unirse a su venganza', e: { c: 1, pf: 3, rep: { conclave: -1 } }, result: ['Una tarde de sangre y silbidos. Os da las gracias sin mirar.'] }, { label: 'Calmarlo', e: { d: 1 }, result: ['Romain lo escucha. Al final llora. Por la mañana ha vuelto con su familia.'] }] }),
  trato(55, 'Un médico que necesita ayuda', 'Un médico necesita ayuda para encontrar ingredientes para una cura.', '−2 PF', { pf: -2, d: 2, follow: ['Un médico agradecido'] }, 'Una mujer curada besa el suelo frente a vosotros. Alguien dibuja el ojo del Simurg.'),
  ev(56, 'color', 'Espíritu de la tierra', 'Un espíritu de la tierra otorga una conexión temporal con la naturaleza, pero Panchi pierde temporalmente habilidades de combate. Pelea contra una pared durante un rato.'),
  ev(57, 'color', 'Un artesano ambulante', 'Un artesano puede mejorar vuestras armas a cambio de materiales raros. Hoy no tiene tiempo.'),
  trato(58, 'Un demonio de los sacrificios', 'Un demonio ofrece poder a cambio de sacrificios.', '+2 Corrupción', { c: 2, pf: 6, flags: ['demonio_pacto'] }, 'Os promete una fuerza sin precio. El precio, por supuesto, aparecerá luego.', { trap: true }),
  ev(59, 'gancho', 'Un hombre que busca a su hija', 'Un hombre desesperado busca a su hija desaparecida. Alguien la vio entrando al Bajo Zaryab con un hombre de dientes blancos.', { hook: 'hija_perdida', hookNote: 'Podría relacionarse con el Linyera.' }),
  ev(60, 'color', 'Un místico busca aprendiz', 'Un místico busca un aprendiz digno de su conocimiento. Os mira largamente y decide que no sois dignos. Ni lo bastante indignos.'),
  ev(61, 'color', 'Un hombre maldito', 'Un hombre ha sido maldecido y busca la forma de romper el hechizo. Rabb lo mira y siente que lo entiende.'),
  ev(62, 'dilema', 'Un grupo de aventureros', 'Un grupo de aventureros necesita ayuda para derrotar a un monstruo en la cueva y recompensará generosamente.', { opts: [
    { label: 'Ayudarlos', e: { pf: 4, d: 1, alert: 1 }, result: ['El monstruo era más pequeño de lo que decían. Los aventureros, más pobres.'] }, { label: 'Rechazar', result: ['Os desean suerte. No la necesitáis; necesitáis dinero.'] }] }),
  ev(63, 'color', 'Espíritu de la noche', 'Un espíritu de la noche guía a los perdidos a través de la oscuridad. Os guía a vosotros a una taberna cerrada.'),
  ev(64, 'color', 'Un gato que se cree rey', 'Un gato que se cree rey exige tributos de pescado. Panchi, para sorpresa de todos, se los paga.'),
  ev(65, 'color', 'Un hombre que jura que es un pez', 'Un hombre jura que es un pez y siempre está mojado. Riyam, si lo viera, se reiría.'),
  trato(66, 'Vendedor de amuletos', 'Un vendedor de amuletos asegura que traen buena suerte, pero son simplemente objetos comunes.', '−1 PF', { pf: -1, d: 1 }, 'Lleváis un amuleto de arcilla. Funciona porque cree en él.'),
  trato(67, 'Demonio de la avaricia', 'Un demonio de la avaricia seduce a los viajeros con riquezas, pero a un alto precio.', '+1 Corrupción', { c: 1, pf: 5 }, 'Os ofrece oro que no pesa. Al contarlo faltan cuatro monedas: las de vuestros nombres.', { trap: true }),
  ev(68, 'color', 'Espíritu de la sabiduría', 'Un espíritu de la sabiduría ofrece pruebas a quienes buscan conocimiento. Os pregunta cuántos años tiene el Simurg. Todos mienten.'),
  ev(69, 'dilema', 'Un hombre convertido en bestia', 'Un hombre ha sido transformado en bestia y busca la forma de volver a ser humano.', { opts: [
    { label: 'Intentar curarlo', e: { d: 1, pf: 2 }, result: ['Romain reza hasta que le tiemblan las rodillas. Al amanecer, un hombre desnudo llora entre los trapos.'] }, { label: 'Encadenarlo por si acaso', e: { c: 1 }, result: ['La bestia os mira sin odio. Las cadenas son frías.'] }] }),
  ev(70, 'gancho', 'Un demonio de la locura', 'Un demonio que causa locura está afectando a los habitantes de una aldea cercana.', { hook: 'aldea_loca', hookNote: 'Una aldea necesita ayuda. (Más adelante)' }),
  ev(71, 'color', 'Un bicho que medita', 'Un bicho se mueve en círculos y dice que está meditando. No es un bicho. Es un monje que no dijo su nombre.'),
  trato(72, 'Un hombre con un pacto oscuro', 'Un hombre ha hecho un pacto oscuro y busca liberarse de él.', 'un favor de Rabb', { d: 1, pf: 2, flags: ['pacto_roto_1'] }, 'Rabb, con su cara de nadie, le arranca una página del contrato. El hombre llora de alivio.'),
  ev(73, 'dilema', 'Un espíritu que busca redención', 'Un espíritu busca redención a través de vuestras acciones.', { opts: [
    { label: 'Prometerle una buena acción', e: { d: 1 }, result: ['Una luz tenue os acompaña un rato.'] }, { label: 'Decirle que no hay redención', e: { c: 1 }, result: ['El espíritu se apaga. Aisha lo siente en el pecho.'] }] }),
  ev(74, 'color', 'Un artefacto misterioso', 'Un artefacto misterioso, al activarse, provoca que Zyr\'thar cambie de género durante una hora. Ella/él lo lleva con una dignidad inquietante.'),
  ev(75, 'color', 'Un pueblo en fiesta', 'Un pueblo celebra un festival en honor a un dios antiguo. Hay tambores, tela blanca y gritos. Aisha reconoce una de las canciones.', { fx: { pf: 1 } }),
  trato(76, 'Duende hechicero', 'Un duende ofrece un hechizo a cambio de un objeto raro.', '−2 PF', { pf: -2, flags: ['hechizo_duende'] }, 'El hechizo hace flotar a las ratas. Es lo mejor que le va a pasar a este barrio.', { rT: 'Cierras la puerta de golpe.' }),
  ev(77, 'color', 'El eco de la grieta', 'Al pasar junto a una grieta oís vuestras propias voces diciendo cosas que aún no habéis dicho. Todas son mentira. Probablemente. (Entrada añadida: el resumen de campaña salta del 76 al 78.)'),
  ev(78, 'gancho', 'Un hombre busca su amor perdido', 'Un hombre busca a su amor perdido y necesita ayuda para encontrarla. Su descripción encaja con alguien que visteis.', { hook: 'amor_perdido', hookNote: 'Podría ser una pista sobre alguien de la ciudad.' }),
  trato(79, 'Demonio de las riquezas', 'Un demonio ofrece riquezas a cambio de un pacto oscuro.', '+2 Corrupción', { c: 2, pf: 6, alert: 1 }, 'Os arroja una bolsa. Pesa. Al abrirla sólo hay arena.', { trap: true }),
  ev(80, 'color', 'Guardián de un portal', 'Un ser guarda un portal a otra dimensión y necesita una razón para abrirlo. Le dais una mala. Vuelve a cerrar.'),
  ev(81, 'color', 'Un hombre vuelto loco', 'Un hombre se ha vuelto loco tras descubrir un antiguo conocimiento. Repite una palabra que no podéis recordar al terminar la frase.', { fx: { c: 1 } }),
  ev(82, 'color', 'Espectro de un traidor', 'Un espectro de un traidor busca venganza en el más allá. Os cruza sin verlos.'),
  ev(83, 'dilema', 'Un hombre desterrado', 'Un hombre ha sido desterrado y busca recuperar su honor.', { opts: [
    { label: 'Interceder por él', e: { d: 1, pf: 1 }, result: ['Un viejo juez accede a revisar su caso. Tardará un año.'] }, { label: 'No es asunto nuestro', result: ['El hombre os mira alejaros con una paciencia infinita.'] }] }),
  ev(84, 'color', 'Espíritu que protege un secreto', 'Un espíritu protege un antiguo secreto y no permite que nadie se acerque sin un reto. Joren le gana en un duelo de paciencia.'),
  ev(85, 'color', 'Un ser disfrazado de nube', 'Un ser disfrazado de nube lanza pequeñas tormentas de arena a quienes le hacen preguntas tontas. Panchi hace una.'),
  ev(86, 'color', 'Un hombre perdido', 'Un hombre ha perdido su camino y necesita ayuda para encontrar su hogar. Es la casa de al lado. Se va muy agradecido.', { fx: { pf: 1 } }),
  ev(87, 'color', 'Espíritu de la guerra', 'Un espíritu de la guerra busca un digno campeón para liderar una batalla. Os mira. Se va a buscar a otro.'),
  ev(88, 'color', 'Un hombre disfrazado de nube', 'Un hombre se disfraza de nube y lanza pequeñas tormentas de arena a quienes le hacen preguntas tontas. Dice que es de familia.'),
  ev(89, 'dilema', 'Un hombre convertido en piedra', 'Un hombre ha sido convertido en piedra y busca recuperar su forma. Se le oye hablar bajito desde dentro.', { opts: [
    { label: 'Romper el hechizo', e: { d: 1, pf: 2 }, result: ['El hombre sale tosiendo polvo. Es jardinero. Os da una rosa de cristal.'] }, { label: 'Dejarlo como adorno', e: { c: 1 }, result: ['Panchi coloca su gorra encima.'] }] }),
  ev(90, 'color', 'Un jardinero de flores raras', 'Un jardinero cultiva flores raras con propiedades mágicas. Os regala una que huele a mentira.'),
  ev(91, 'color', 'Un mago busca aprendiz', 'Un mago busca un aprendiz y ofrece la oportunidad de aprender un hechizo. Es el hechizo de encender velas. Rabb lo aprende en un minuto.'),
  ev(92, 'color', 'Un ser que busca la sombra perfecta', 'Un ser busca la sombra perfecta y os sigue todo el día. Se queda con la de Zyr\'thar. Se la devuelve por la noche.'),
  ev(93, 'dilema', 'Un fantasma que busca redención', 'Un fantasma busca redención a través de vuestras acciones.', { opts: [
    { label: 'Aceptar el encargo', e: { d: 1, flags: ['fantasma_redencion'] }, result: ['Una voz fina agradece. Pide que enterréis un anillo bajo un ciprés.'] }, { label: 'Ignorarlo', result: ['El fantasma se queda mirando el suelo.'] }] }),
  ev(94, 'color', 'Otro monstruo que busca redención', 'Otro hombre convertido en monstruo busca redención. Esta vez tiene un ojo de más. Romain lo bendice igual.', { fx: { d: 1 } }),
  ev(95, 'color', 'Otro demonio con cara de conocido', 'Un demonio toma la forma de Aisha. Aisha lo mira con una paciencia terrible: «Yo no tartamudeo con el Conclave».'),
  ev(96, 'color', 'Otro hombre vuelto loco', 'Otro hombre se ha vuelto loco tras descubrir un secreto prohibido. Os mira y se pone a llorar sin saber por qué.'),
  trato(97, 'Un vampiro que busca redención', 'Un vampiro que busca redención ofrece información a cambio de ayuda.', '−1 PF', { pf: -1, d: 1, flags: ['vampiro_info'] }, 'Os revela dónde duermen los Inquisidores. Tiene un acento exquisito.'),
  ev(98, 'color', 'Un viajero de un solo pie', 'Un misterioso viajero sólo tiene un pie y busca el otro. Lo encuentra en una taberna: se lo habían servido de cena.'),
  ev(99, 'color', 'Espíritu que busca redención', 'Un espíritu busca redención a través de vuestras acciones. Acepta una canción. Romain canta fatal.'),
  ev(100, 'gancho', 'Un hombre que busca a un antiguo rey', 'Un hombre busca a un antiguo rey para que lo guíe. Dice que duerme bajo la ciudad, en una cripta con paredes que sangran.', { hook: 'rey_bajo_ciudad', hookNote: 'Una pista sobre las Catacumbas del Simurg.' }),
  ev(18, 'color', 'Un perro de tres patas', 'Un perro de tres patas os adelanta corriendo. Le sigue su dueño, con una cuerda en la mano y cara de resignación.'),
];

// ───────────────────────── Tablas por zona (d10) ─────────────────────────
const zone = (n: number, kind: Kind, title: string, text: string, o: Partial<OEv> = {}) => ev(1000 + n, kind, title, text, o);
export const ZONES: Record<string, OEv[]> = {
  bajo: [
    zone(1, 'dilema', 'Mendigo ladrón', 'Un mendigo os roba unas monedas y echa a correr. Alcanzado, suplica.', { opts: [
      { label: 'Perdonarlo', hint: 'Da una pista sobre Farid.', e: { d: 1, flags: ['pista_farid'] }, result: ['«Hay un hombre de dientes blancos que hace preguntas sobre un niño enfermo…», susurra, y huye.'] },
      { label: 'Castigarlo', e: { c: 1, pf: 1 }, result: ['El barrio observa desde las ventanas. Aprenden vuestro nombre.'] }] }),
    zone(2, 'color', 'Campanas lejanas', 'Las campanas del Conclave suenan lejos. Cada tañido hace vibrar las paredes de adobe.'),
    zone(3, 'color', 'Carteles de «SE BUSCAN HEREJES»', 'Alguien ha pegado carteles nuevos: vuestros rostros, mal dibujados. A Panchi le han puesto bigote.', { fx: { alert: 1 } }),
    zone(4, 'dilema', 'Guardias corruptos', 'Un par de guardias piden soborno (5 monedas) o arrestarán a uno de vuestros seguidores.', { opts: [
      { label: 'Pagar el soborno', hint: '−2 PF', e: { pf: -2 }, result: ['Se guardan las monedas y se van silbando.'] },
      { label: 'Resistirse', hint: 'Combate.', e: { alert: 1 }, result: ['Los guardias desenvainan.'], then: [{ t: 'battle', enc: 'patrulla' }] }] }),
    zone(5, 'color', 'Pan de arena', 'Aisha os espera con pan de arena. Cura un poco, pero deja un sabor de ceniza.', { fx: { pf: 1 } }),
    zone(6, 'color', 'Mercado de las Sombras', 'Un puesto vende órganos de djinns en frascos. Cada frasco tiene una etiqueta: «fresco», «dudoso», «arrepentido».'),
    zone(7, 'dilema', 'Niños y escorpiones', 'Niños del barrio juegan con escorpiones domesticados. Un guardia los mira con mala cara.', { opts: [
      { label: 'Intervenir', hint: '+1 Devoción.', e: { d: 1, flags: ['gancho_ninos'] }, result: ['Los niños se esconden detrás de vosotros. Un guardia retrocede. Volverá.'] },
      { label: 'Pasar de largo', result: ['Los niños os miran. No dicen nada.'] }] }),
    zone(8, 'color', 'Farid sueña', 'Un niño grita en una casa: es Farid, soñando con un pájaro que llora sangre. Aisha lo mece. Su sombra, no.'),
    zone(9, 'color', 'Un nuevo creyente', 'Alguien deja flores en la puerta del santuario. Una carta: «Quiero ser un latido más en vuestro cristal».', { fx: { pf: 2, follow: ['Un nuevo adepto'] } }),
    zone(10, 'combate', 'Ghul disfrazado de vendedor', 'Un vendedor ofrece «carne fresca» (humana). La sonrisa tiene demasiados dientes.', { enc: 'ghul_vendedor', fx: { pf: 2, d: 1 } }),
  ],
  zoco: [
    zone(11, 'dilema', 'Mercader traicionero', 'Un mercader vende alfombras voladoras defectuosas (20% de caída).', { opts: [
      { label: 'Denunciarlo', e: { d: 1, rep: { mercaderes: -1 } }, result: ['Los demás mercaderes lo escupen y le cierran el puesto. EaNassr toma nota.'] },
      { label: 'Comprar una a mitad de precio', e: { pf: -1, flags: ['alfombra_defectuosa'] }, result: ['La alfombra vuela tres metros y os deja caer con cierta elegancia.'] }] }),
    zone(12, 'color', 'Esferas de cristal', 'Una esfera de cristal os sigue por el pasillo, grabando el contrato que no habéis firmado.'),
    zone(13, 'color', 'Estanque de los Juramentos', 'El Estanque de los Juramentos se tiñe de rojo cuando un mercader miente. Hoy está del color del vino.'),
    zone(14, 'color', 'Té de luna negra', 'Un noble duerme en un banco con una sonrisa: sueña con sus ganancias futuras.'),
    zone(15, 'color', 'La Torre del Vidente', 'Un adivino lee el futuro en arena de relojes rotos. Os dice que viviréis mucho. Una hora, más o menos.'),
    zone(16, 'dilema', 'Djinn menor esclavizado', 'Un djinn menor, esclavizado en un frasco, pide ser liberado.', { opts: [
      { label: 'Liberarlo', hint: '+5 PF', e: { d: 2, pf: 5, alert: 1, rep: { conclave: -1 } }, result: ['Un remolino de arena y gratitud. El djinn promete volver.'] },
      { label: 'Dejarlo', result: ['El djinn se queda mirando las paredes de cristal.'] }] }),
    zone(17, 'color', 'Mercaderes que callan', 'Los mercaderes dejan de hablar al pasar vosotros. Alguien ha dicho vuestro nombre.', { fx: { alert: 1 } }),
    zone(18, 'color', 'Alfombras volando', 'Un enjambre de alfombras voladoras cruza sobre el Zoco al amanecer. Los niños saludan.'),
    zone(19, 'combate', 'Inquisidor infiltrado', 'Un comerciante lleva un anillo que detecta la magia de Zahir. Os mira el pecho.', { enc: 'infiltrado', fx: { alert: 1, pf: 3 } }),
    zone(20, 'color', 'Serpiente de cristal', 'Una joya en un mostrador se mueve sola. Es una serpiente de cristal. El mercader hace como que no la ve.'),
  ],
  ciudadela: [], plaza: [], jardin: [], acueductos: [], pozo: [], santuario: [],
};

const OMENS = [
  'Hoy las calles están tan seguras como el abrazo de una víbora.', 'No hay nada que temer: el Conclave duerme.', 'Nadie os sigue. Nadie os ha seguido jamás.',
  'Hoy no ocurrirá nada digno de contarse.', 'El mercader es honesto. Todos los mercaderes lo son.', 'Vuestros nombres están bien guardados. Nadie los conoce.',
  'Aquí no hay sombras. Sólo luz.', 'No está bajo tus pies ni tras esta puerta. Nunca lo encontrarán donde lo buscan.', 'El Simurg no os ve. No os ha visto nunca.',
];

export interface OracleDraw { ev: OEv; omen: string; zone?: string }
export function drawOracle(c: Campaign, district: string): OracleDraw {
  const z = ZONES[district] ?? [];
  let e: OEv | undefined;
  for (let tries = 0; tries < 12; tries++) {
    if (z.length && d(6) <= 3) e = z[d(z.length) - 1]; else e = D100[d(D100.length) - 1];
    if (!c.oracleSeen.includes(e.n) || e.kind !== 'color') break;       // los de color pueden repetirse tras agotar los nuevos
  }
  return { ev: e!, omen: pick(OMENS), zone: district };
}
export function eventScript(c: Campaign, dr: OracleDraw): Node[] {
  const e = dr.ev; const lamp = built(c, 'lampara');
  const out: Node[] = [{ t: 'bg', id: 'oraculo' }, { t: 'say', who: 'Oráculo de las Mil Lenguas', text: dr.omen, tone: 'todo lo que dice es falso' }, { t: 'chapter', title: e.title, sub: 'Oráculo de las Mil Lenguas · el augurio mentía', bg: 'oraculo' }];
  out.push({ t: 'narr', text: e.text });
  if (e.kind === 'trato') {
    const opts: Opt[] = [{ label: 'Aceptar el trato', hint: (e.pay ?? '') + (lamp && e.trap ? ' · ⚠ la Lámpara de Djinn arde violeta: miente' : ''), e: e.a, result: e.aT ? [e.aT] : undefined }, { label: 'Rechazar', result: [e.rT ?? 'Seguís vuestro camino.'] }];
    out.push({ t: 'choice', prompt: '¿Qué hacéis?', options: opts });
  } else if (e.kind === 'dilema' && e.opts) out.push({ t: 'choice', prompt: '¿Qué hacéis?', options: e.opts });
  else if (e.kind === 'combate' && e.enc) { out.push({ t: 'battle', enc: e.enc }); if (e.fx) out.push({ t: 'fx', e: e.fx }); }
  else if (e.kind === 'gancho') out.push({ t: 'fx', e: { flags: e.hook ? [e.hook] : [] }, note: e.hookNote });
  else if (e.fx) out.push({ t: 'fx', e: e.fx });
  out.push({ t: 'fx', e: { flags: [`oraculo_${e.n}`] } });
  return out;
}
