import type { Node } from './types';
import type { Effect } from '../state';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const BG = (id: string): Node => ({ t: 'bg', id });

/** «El Inventario de Maunator» — operación de robo en el Consulado Cerrado de Thay (Zoco). Todas las banderas llevan el prefijo mz_. */
export const MAUNATOR: Node[] = [
  // ══════════ 0 · BRIEFING ══════════
  T('El Inventario de Maunator', 'Operación · Zoco de los Mil Soplos', 'zoco'),
  N('EaNassr os recibe en la trastienda de su puesto, con las cortinas echadas y un té que nadie ha pedido. Sobre la mesa, un dibujo a carboncillo: la fachada del Consulado Cerrado de Thay, una casa de ladrillo rojo que lleva años sin abrir sus ventanas.'),
  S('EaNassr', 'Hay un libro en theskan, escrito en loross, y lo quiero. Un guardia de dentro os mete. Pagan los Mercaderes; yo sólo pongo el té.', 'frotándose el anillo de hueso'),
  S('EaNassr', 'El libro es el Inventario de Maunator, uno de los diecinueve tomos de la Enciclopedia de los Muertos y sus Reliquias. Lo escribió Noeene, Alta Escriba de Jergal, hace más de cuatro mil años, cuando Maunator todavía flotaba.', 'bajando la voz'),
  { t: 'squad', n: 5, label: 'El Cubo es estrecho. Elegid a quienes entran (4–5).' },
  { t: 'choice', prompt: '¿Cuánto queréis saber antes de entrar?', options: [
    { label: 'Todo. Si no hay información, no hay trato', hint: 'Persuasión CD 14: EaNassr suelta lo que sabe.', check: { skill: 'persuasion', dc: 14 }, e: { flags: ['mz_sabe_cubo', 'mz_nota_ealtos'] }, result: ['EaNassr suspira. «Bajo la casa hay un sótano que se mueve. Los guardias lo llaman supersticiones. Yo, Cubo. Y creo que el mago que lo dirige, Kethras, quiere algo más que un libro.»', 'Os da el nombre de un guardia, Mordec, y un truco: círculo de tiza = limpio, X = comprometido.'], fail: { e: { flags: ['mz_poco_info'] }, result: ['EaNassr sonríe sin enseñar nada. «Lo que no sé, no puedo venderlo.» Os da el nombre de Mordec y poco más.'] } },
    { label: 'Lo justo: el libro y la puerta', hint: '+60 PO. Menos ruido, menos sorpresas buenas.', e: { gold: 60, flags: ['mz_poco_info'] }, result: ['EaNassr os pone un saquito en la mano. «Buen criterio.» Dice «cubo» una vez, a media frase, y se arrepiente.'] },
    { label: 'Nada. Los trabajos de EaNassr sólo huelen a trampa si preguntas', hint: 'Entrar a ciegas.', e: { d: 0, flags: ['mz_poco_info', 'mz_ciegos'] }, result: ['EaNassr levanta una ceja. «Como queráis. Os llevaréis la sorpresa entera.»'] },
  ] },
  FX({ flags: ['mz_inicio'] }, 'Operación aceptada: El Inventario de Maunator.'),

  // ══════════ 1 · LA EMBAJADA ══════════
  T('La Embajada', 'Consulado Cerrado de Thay · primera planta', 'plaza'),
  N('Detención obligatoria: un guardia viene en sentido contrario por el callejón y tenéis que esperar sin poder moveros. Desde la calle se ve luz en una ventana del primer piso: dos siluetas hablan. Uno es un hombre llamado Brennan, y el otro es un mago de túnica roja que murmura una frase en voz baja.'),
  S('Kethras', '…el Manco no mirará. Cyric lo hará todo por mí… sin juicio.', 'apenas audible, a Brennan'),
  S('Mordec', 'Por aquí. No habléis, no toquéis y no encendáis nada. El Cubo… la sala de abajo… hay un tiempo límite. Cuando oigáis la campana, tenéis que haber vuelto o no vais a volver.', 'guardia a sueldo de EaNassr, con la mano en la tiza'),
  S('Mordec', 'No sé lo que hay abajo. Lo que sí sé es que a la cocina no hace falta que paséis.', 'sin mirar'),
  IF('mz_ciegos', [], [N('Mordec no sabe que el Cubo está roto. Nadie le ha dicho que hay algo más que un sótano.')]),
  { t: 'choice', prompt: 'La cocina: olor a especias y, debajo, algo que no pertenece a una sede diplomática.', options: [
    { label: 'Leer la cartelera de la cocina', hint: 'Una nota firmada «S.»: Investigación CD 10 si pasáis sin prestar atención.', check: { skill: 'percepcion', dc: 10 }, e: { flags: ['mz_nota_sigmund'] }, result: ['«Que alguien avise a quien dé la orden: una rata activó el sistema otra vez. Friederich dice que está diseñado para intrusos arcanos. El sello de contención también bloqueó la cocina. —S.»', 'Dos cosas: la reja y el sello son automáticos, no Kethras. Y Kethras tiene que bajar en persona para reabrir. «S.» es Sigmund, un veterano de la sala de guardia.'], fail: { e: {}, result: ['Pasáis sin ver nada. La cocina huele a anís.'] } },
    { label: 'Registrar la cocina entera', hint: 'Las pociones malditas están ahí. Tentador.', e: { flags: ['mz_nota_sigmund', 'mz_pociones_vistas'] }, result: ['Encontráis la nota y, en un estante, tres pociones rojas con un precio garabateado. Mordec las recomienda: «Para el camino.»'] },
  ] },
  { t: 'choice', prompt: 'En la mesa de la cocina hay tres botellas rojas. Mordec las recomienda.', options: [
    { label: 'Beber una cada uno', hint: 'Cura 1d4, pero Kethras os rastrea 24 horas y la mano queda translúcida (Medicina o Arcanos CD 13 lo detecta).', if: 'mz_pociones_vistas', e: { flags: ['mz_pociones_malditas'], items: { pocion: 3 } }, result: ['Un calor suave. En la palma de cada mano, una marca translúcida que no estaba.'] },
    { label: 'Dejarlas', e: {}, result: ['Mordec encoge los hombros.'] },
    { label: 'Comprobarlas antes con Medicina', hint: 'Medicina CD 13.', if: 'mz_pociones_vistas', check: { skill: 'medicina', dc: 13 }, e: { flags: ['mz_pociones_detectadas'] }, result: ['Algo respira dentro del cristal: es un rastreo. Las dejáis donde están.'], fail: { e: { flags: ['mz_pociones_malditas'], items: { pocion: 3 } }, result: ['No notáis nada y las bebéis. Bien frías.'] } },
  ] },
  N('La armería: estantes vacíos y un anillo de plata sobre un cojín. Brilla con una luz tenue y promete +1 de CA aparente.'),
  { t: 'choice', prompt: 'El anillo parece demasiado bonito.', options: [
    { label: 'Ponérselo a alguien', hint: 'Arcanos CD 13 lo delata. Anula la detección pasiva en el Cubo.', e: { flags: ['mz_anillo'] }, result: ['Un calorcito agradable. La percepción pasiva del pícaro se vuelve de algodón.'] },
    { label: 'Estudiarlo con Arcanos', hint: 'Arcanos CD 13.', check: { skill: 'arcanos', dc: 13 }, e: { flags: ['mz_anillo_detectado'] }, result: ['Es una cuerda: hace de lazo para el glifo de un cuarto que todavía no habéis visto. Lo dejáis.'], fail: { e: { flags: ['mz_anillo'] }, result: ['No encontráis nada raro. Se lo queda el que tiene más cara de ladrón.'] } },
    { label: 'Dejarlo', e: {}, result: ['Los anillos bonitos suelen costar caro.'] },
  ] },
  { t: 'choice', prompt: 'Sobre una mesa, abandonada entre papeles, hay una llave maestra.', options: [
    { label: 'Llevársela', hint: 'Abre todo. Al bajar al cubo dispara la ALARMA desde el turno 1.', e: { flags: ['mz_llave_maestra'] }, result: ['Pesa menos de lo que debería.'] },
    { label: 'No tocarla', e: {}, result: ['Es lo que haría un ladrón con experiencia.'] },
  ] },
  { t: 'choice', prompt: 'Escaleras arriba, dos pisos. Mordec baja la voz: no os recomienda subir.', options: [
    { label: 'Segundo piso: el mago visitante', hint: 'Varreth duerme. Riesgo puro, cero información útil.', e: {}, result: ['Un mago de 28 años, primer encargo, durmiendo con la boca abierta.'], then: [{ t: 'choice', prompt: 'Varreth.', options: [
      { label: 'Pasar sin hacer ruido', hint: 'Sigilo CD 14.', check: { skill: 'sigilo', dc: 14 }, e: {}, result: ['Subís y bajáis sin despertar a nadie.'], fail: { e: {}, result: ['Un escalón cruje. Varreth se incorpora, grita, y se hace invisible.'], then: [{ t: 'battle', enc: 'varreth' }] } },
      { label: 'Atacar mientras duerme', e: { c: 1 }, result: ['Varreth no llega a lanzar nada.'] },
    ] }] },
    { label: 'Tercer piso: el archivo personal de Kethras', hint: 'Las páginas 7-114 (el Sudario Silente). Robarlas cambia el desenlace.', e: {}, result: ['Un archivo pequeño, ordenado con una obsesión que da pena.'], then: [{ t: 'choice', prompt: 'El archivo de Kethras.', options: [
      { label: 'Forzar el cajón y llevarse las páginas', hint: 'Sigilo o Juego de Manos CD 16.', check: { skill: 'sigilo', dc: 16 }, e: { flags: ['mz_paginas'] }, result: ['Entre cuadernos, un cuadernillo cosido a mano: faltan las páginas 7-114, y aquí está su sitio. Vienen en un sobre sin etiqueta. Las páginas arrancadas del Inventario de Maunator.'], fail: { e: { alert: 1, flags: ['mz_paginas_falla'] }, result: ['Una runa se ilumina en el cajón. Nada se mueve, pero Kethras ahora sabe que alguien ha estado aquí.'] } },
      { label: 'No tocar nada', e: {}, result: ['Dejáis el archivo como estaba.'] },
    ] }] },
    { label: 'Bajar directamente', e: {}, result: ['Mordec respira aliviado.'] },
  ] },
  N('Detrás de una puerta de hierro negro, una escalera de caracol baja y baja. La campana de la torre da las doce. Mordec dibuja un círculo con tiza en la jamba, mira el techo, y se da la vuelta.'),
  S('Mordec', 'Si salís por aquí con algo en las manos, que no se note. Si vuelvo y veo una X, no sé quién sois.', 'ya de espaldas'),

  // ══════════ 2 · EL CUBO ══════════
  T('El Cubo de Maunator', 'La sala que se mueve · 4×4 habitaciones', 'prison'),
  N('El Cubo es una cuadrícula de habitaciones bajo el sótano: cuatro por cuatro, cada una con su propio olor. Cada pocos minutos, el suelo vibra seis segundos —piedra masiva contra piedra masiva— y una fila o una columna se desplaza una posición. Las puertas viajan con las salas.'),
  IF('mz_sabe_cubo', [N('EaNassr os lo advirtió: «Si dos salas quedan adyacentes sin puerta compartida, abrir paso cuesta un turno entero. O hay que rodear. Y si estáis quietos dos turnos, el Cubo castiga la inacción.»')], [N('Nadie os ha avisado de que las paredes cambian.')]),
  IF('mz_llave_maestra', [N('La llave maestra pesa en el bolsillo. Al cruzar el umbral, un zumbido recorre las paredes: el Cubo ya sabe que estáis dentro.')]),
  { t: 'battle', enc: 'cubo_maunator', soft: true },
  IF('mz_capturados', [
    N('Los cuatro mundos se cierran sobre vosotros: Kethras os ha cercado. Os despertáis en una celda sin ventanas, con la cabeza ligera y la voz de Kethras demasiado cerca.'),
    S('Kethras', 'Prefiero capturar a matar. Los muertos no firman. Los vivos sí: lo que sabéis, y lo que ya no recordaréis.', 'afable, casi aburrido'),
    FX({ flags: ['mz_final_captura'], c: 1, alert: 2, gold: -80 }, 'Capturados. Modificar Memoria os costará un recuerdo y la operación fracasa. (Hay un capítulo de rescate posible.)'),
  ], [
    // ══════════ 3 · D4 ══════════
    T('La Salida (D4)', 'Tres cuencas para tres medallones', 'prison'),
    N('La puerta hacia los túneles no se abre al instante: tres cráneos rotan y la piedra se retrae en exactamente tres turnos. No hay forma de acelerarlo. Cuando los medallones entran en las cuencas, el pulso viaja por la roca y el Pudin Negro y Kethras lo notan a la vez. El Cubo pasa a EMERGENCIA automática.'),
    IF('mz_orden_conocido', [N('Gracias al registro de A1, sabéis el orden: altar, carne, mente. Cada medallón en su cuenca, sin errores.')], [
      { t: 'choice', prompt: 'Hay un orden correcto de medallones, y no lo sabéis del todo.', options: [
        { label: 'Probar y rezar', hint: 'Cada intento incorrecto: 2d8 de daño y una rotación más.', e: { flags: ['mz_d4_errores'] }, result: ['La primera cuenca vibra y os quema las manos. La segunda también. A la tercera acertáis… y Kethras ya tiene vuestra posición.'] },
        { label: 'Deducir el orden con Investigación', hint: 'CD 14.', check: { skill: 'arcanos', dc: 14 }, e: { flags: ['mz_orden_conocido'] }, result: ['Las cuencas están grabadas con los símbolos de los lugares de donde vinieron las calaveras. El orden es el del diagrama: altar, carne, mente.'], fail: { e: { flags: ['mz_d4_errores'] }, result: ['Os equivocáis una vez.'] } },
      ] },
    ]),
    { t: 'battle', enc: 'd4_defensa' },
    FX({ flags: ['mz_d4_ok'] }, 'La puerta se abre. Los túneles os esperan.'),

    // ══════════ 4 · LOS TÚNELES ══════════
    T('Los Túneles', 'Pre-Simurg · Z1 a Z6 · el sándwich', 'mina'),
    N('Los túneles son pre-simurgianos: los hizo alguien antes de que existiera el nombre de Zaryab. En las paredes, un símbolo grabado una y otra vez: un ojo con una espiral de dientes. Es el símbolo de El Que Acecha. Gul-Amarat. Los murales cuentan que lo que sirve a El Que Acecha no puede ser destruido por el fuego de los hombres, sólo persuadido a esperar.'),
    IF('mz_pociones_malditas', [N('La marca translúcida de vuestras manos parpadea: Kethras sabe exactamente dónde estáis.')]),
    { t: 'battle', enc: 'tuneles_a', soft: true },
    IF('mz_capturados', [
      N('Un muro de fuerza cae del techo y parte al grupo en dos. Kethras llega por la izquierda con una sonrisa cansada.'),
      FX({ flags: ['mz_final_captura', 'q_o_maunator'], c: 1 }, 'Kethras gana la persecución. Captura.'),
    ], [
      // ══════════ 5 · NEGOCIACIÓN EN Z4 ══════════
      N('En la bifurcación, un símbolo de El Que Acecha. Kethras os alcanza, jadeante, con la túnica rota, pero las manos no le tiemblan: ha usado Muralla de Fuerza para partir al grupo y ahora quiere hablar.'),
      IF('mz_carry_tomo', [
        IF('mz_paginas', [
          S('Kethras', 'Las páginas 7-114. Vos las tenéis. Yo tengo un tomo sin su alma y vosotros dos mil años sin saber qué es.', 'casi amable'),
          { t: 'choice', prompt: 'Kethras lanza Detectar Pensamientos: sabrá si es un farol.', options: [
            { label: 'Trato limpio: páginas por paso libre', hint: 'Final «incompleto»: Kethras se retira, sin Bola de Fuego ni persecución.', e: { d: 1, flags: ['mz_trato_limpio'] }, result: ['Kethras acepta. Retrocede. No os persigue. Llegaréis a los muelles con el tomo, sin las páginas.'] },
            { label: 'Trato + robo: que el ladrón le birle las páginas mientras habla', hint: 'Juego de Manos CD 18 vs Percepción pasiva 17 de Kethras.', check: { skill: 'sigilo', dc: 18 }, e: { flags: ['mz_trato_robo'] }, result: ['Kethras no se entera hasta abrir el sobre en los muelles. Resultado completo.'], fail: { e: { flags: ['mz_trato_roto'] }, result: ['Kethras mira su bolsillo vacío un segundo de más. «Qué decepción.» Ataca a quemarropa.'], then: [{ t: 'battle', enc: 'kethras_quemarropa', soft: true }] } },
            { label: 'Destruir el tomo por despecho', hint: 'Una tercera vía: ni Kethras ni nadie lo tendrá.', e: { c: 1, flags: ['mz_tomo_destruido'] }, result: ['Quemáis las primeras páginas. Kethras no grita: sólo cierra los ojos. «Lo siento por Noeene.»'] },
          ] },
        ], [
          S('Kethras', 'Sin las páginas el tomo es un libro bonito. Os dejo ir… con el tomo. A cambio, vuestra palabra. Y esa no la voy a detectar.', 'detectando pensamientos'),
          { t: 'choice', prompt: 'Sin páginas, el farol es lo único que tenéis.', options: [
            { label: 'Farolear: «Tenemos las páginas»', hint: 'Kethras lo detecta siempre. La persecución sigue.', e: { flags: ['mz_farol'] }, result: ['Kethras sonríe con tristeza. «No. No las tenéis.» Alza el bastón.'] },
            { label: 'Rendirse con el tomo', hint: 'Entregáis el tomo. Kethras se retira.', e: { flags: ['mz_tomo_perdido'] }, result: ['Kethras se lleva el tomo, sin prisa, y desaparece por el túnel de la izquierda.'] },
          ] },
        ]),
      ], [N('Sin el tomo no hay palanca: Kethras sólo os mira. «Entonces no tenéis nada que me interese. Pero sí que sabéis demasiado.» Alza la mano.')]),
      { t: 'battle', enc: 'tuneles_b', soft: true },
      IF('mz_capturados', [FX({ flags: ['mz_final_captura', 'q_o_maunator'], c: 1 }, 'El Pudin y Kethras os cierran el paso. Captura.')], [
        // ══════════ 6 · MUELLES BAJOS ══════════
        T('Los Muelles Bajos de Medinat al-Rih', 'La barcaza · lo que lleváis y quién vive', 'plaza'),
        N('La reja oxidada cede bajo los medallones. Al otro lado, un muelle de piedra negra y una barcaza que cabecea sobre un río de ceniza. Medinat al-Rih no sabe de vuestra llegada. Todavía.'),
        IF('mz_seraphel_libre', [S('Seraphel', 'Os debo la vida. Llevad esto a los Hijos del Simurg: el plan de Kethras es cegar al Juez de la Balanza para que un dios caído actúe sin testigos. Decidle a vuestro sacerdote que el Manco no estará mirando.', 'con la mano de plata en el pecho'), FX({ rep: { hijos: 2 }, follow: ['Seraphel'] }, 'Seraphel se une al santuario como contacto de los Hijos del Simurg.')]),
        IF('mz_carry_sello', [FX({ items: { sello_helm: 1 } }, 'Obtenéis el Sello de Helm: una aura que reduce la precisión de ilusiones y retrasa encantamientos.')]),
        IF('mz_tomo_destruido', [FX({ flags: ['mz_final_destruido'], gold: 0 }, 'Zarpáis con las cenizas del tomo. EaNassr pierde el trato y no vuelve a hablar del asunto.')], [
          IF('mz_carry_tomo', [
            IF('mz_tomo_perdido', [FX({ flags: ['mz_final_fuga'], rep: { mercaderes: -1 } }, 'Final FUGA: Kethras se llevó el tomo. Sólo el recuerdo de su rostro.')], [
              IF('mz_trato_limpio', [FX({ flags: ['mz_final_incompleto', 'mz_tomo_conserva'], gold: 160, rep: { mercaderes: 1 } }, 'Final INCOMPLETO: el tomo sin las páginas. EaNassr está contento a medias.')], [
                IF('mz_farol', [FX({ flags: ['mz_final_fuga'], alert: 1 }, 'Final FUGA: Kethras os dejó marchar tras la persecución, sin el tomo.')], [
                  FX({ flags: ['mz_final_completo', 'mz_tomo_conserva'], gold: 320, rep: { mercaderes: 2 }, pf: 6 }, 'Final COMPLETO: tomo y páginas. Kethras será un enemigo futuro.')]),
              ]),
            ]),
          ], [
            IF('mz_carry_diario', [FX({ flags: ['mz_final_senuelo'], rep: { mercaderes: -1 }, alert: 1 }, 'Final SEÑUELO: sólo el diario. EaNassr descubre que fue una trampa.')], [
              FX({ flags: ['mz_final_fuga'] }, 'Final FUGA: salís con las manos vacías, pero vivos.')]),
          ]),
        ]),
        FX({ flags: ['mz_hilos_abiertos', 'q_o_maunator'] }, 'Hilos abiertos: el segundo aprendiz desaparecido, la herencia de Cyric en Medinat al-Rih, Seraphel como contacto, el tomo de taxonomía de no-muertos como escándalo.'),
      ]),
    ]),
  ]),
];
