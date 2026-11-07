// Escenas de nivelación: medido con scripts/tension.ts, cada personaje tenía un pico y después desaparecía.
// Estas escenas cortas van al cierre de los capítulos donde alguno caía a casi cero, para que los arcos suban
// por escalones. Cada una pone algo en juego para quien estaba ausente, y varias tienen una decisión suya.
// Si el personaje murió para siempre, la regla general de la historia saltea sus líneas.
import type { Node } from './types';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });

export const NIVEL: Record<string, Node[]> = {
  // ── Cap. I: despiertan en el callejón (Zyr'thar, Panchi y Joren estaban ausentes) ──
  cap1: [
    S('Panchi', `Nos colgaron. A mí. A un monje de Qadir-Kalmah, con soga y todo, delante de una plaza llena. Quiero el nombre del verdugo. No para matarlo. Bueno, un poco para matarlo.`, 'tocándose el cuello, donde no queda marca'),
    N(`Zyr'thar se queda quieta en la boca del callejón. Su sombra tarda un latido en seguirla, como un perro que se demora oliendo algo. Nadie más lo nota. Ella sí, y por primera vez en años tiene miedo de algo que no puede apuñalar.`),
    S(`Zyr'thar`, `Mi sombra llegó tarde. Las sombras no llegan tarde.`, 'en voz muy baja, para nadie'),
    S('Joren Hell', `Somos seis. Éramos siete en el desierto. ¿Dónde está Nadir?`, 'contando con los dedos, dos veces'),
    S('Joren Hell', `La última vez que conté y me faltaba uno fue en La Marca. No me gusta este número.`, 'sin bajar la mano'),
  ],

  // ── Cap. II: la noche en la choza (Romain, Pact, Rabb y Joren estaban ausentes) ──
  cap2: [
    T('La primera noche en el Bajo', 'La puerta de la choza de Aisha', 'bajo'),
    N(`Esa noche nadie duerme. En el Bajo se oye morir a alguien cada tanto, una tos que se apaga detrás de una pared. Romain cuenta las toses. Cuando llega a nueve, deja de contar.`),
    S('Romain', `Kelemvor solía decirme quién se iba. Esta noche no me dice nada. O no me oye, o ya no hablo su idioma.`, 'sentado en el umbral, la balanza vacía sobre las rodillas'),
    N(`Rabb tiene la espada apoyada contra la pared. Cada vez que la sombra de Farid se mueve en el jergón, la hoja vibra un poco, como un perro que reconoce un olor. Rabb le pone la mano encima para callarla y la hoja le corta la palma. No mucho. Lo suficiente.`),
    S('Rabb Locke', `Conoce algo de ese chico. O de lo que tenía adentro. No me quiere decir qué.`, 'chupándose la sangre del corte'),
    { t: 'choice', prompt: 'La hoja sigue vibrando cada vez que la sombra de Farid se mueve.', options: [
      { label: 'Rabb: sacar la espada de la choza y dormir afuera con ella', hint: 'Que no esté cerca del chico. El frío del Bajo de noche mata.', e: { d: 1, flags: ['rabb_aleja_hoja'] }, result: [`Rabb duerme en la calle, abrazado a la espada envuelta, con el miedo de despertarse con ella desenvainada. A la madrugada tiene los labios azules y la hoja está tibia, como si lo hubiera cuidado. No sabe qué pensar de eso.`] },
      { label: 'Rabb: apoyar la hoja junto a Farid para ver qué hace', hint: 'Saber, aunque cueste.', e: { c: 1, flags: ['rabb_prueba_hoja'] }, result: [`La hoja se calla de golpe. La sombra de Farid también. Durante un minuto entero, ni el chico ni la espada respiran. Aisha se despierta gritando, y Rabb retira la hoja con las manos temblando. Nunca le va a contar a nadie lo que sintió en ese minuto: hambre, y no era suya.`] },
    ] },
    N(`Pact no puede quedarse quieto: las alas le pican debajo de la piel, como cuando se acerca una tormenta. Joren, en la puerta, ve pasar a dos sacerdotes del Conclave. Marcan con tiza las casas donde hay chicos enfermos. La de Aisha ya tiene una cruz.`),
    { t: 'choice', prompt: 'Los sacerdotes siguen calle abajo, marcando puertas.', options: [
      { label: 'Joren: seguirlos sin que lo vean (Sigilo)', hint: 'Saber adónde llevan a los chicos marcados. Si lo ven, vuelven con guardias.', check: { skill: 'sigilo', dc: 12, pc: 'joren' }, e: { d: 1, flags: ['joren_sigue_marcas'], rumors: 1 },
        result: [`Joren los sigue tres calles, pegado a las paredes. Los sacerdotes entran a un pozo seco y salen sin el balde. Esa noche aprende dos cosas: dónde guarda el Conclave el veneno, y que todavía sabe moverse como en La Marca. No sabe cuál de las dos lo asusta más.`],
        fail: { e: { alert: 1 }, result: [`Un sacerdote se da vuelta justo cuando Joren pisa un vidrio. No grita. Sonríe y marca con tiza la pared que está al lado de Joren, a la altura de su cara. Después se va. Joren tarda una hora en volver a la choza.`] } },
      { label: 'Borrar la cruz de la puerta de Aisha', hint: 'Que no vuelvan por Farid.', e: { d: 1, flags: ['cruz_borrada'] }, result: [`Pact la borra con la manga. Panchi, sin decir nada, borra las de las tres casas de al lado. A la mañana siguiente, todas las cruces del barrio están borradas. Nadie sabe quién empezó.`] },
    ] },
  ],

  // ── Cap. III: la marca en la pared (Rabb, Joren y Zyr'thar estaban ausentes) ──
  m_cap3: [
    T('La marca en el Zoco', 'De vuelta del acueducto', 'zoco'),
    N(`Volviendo del acueducto, Zyr'thar se detiene frente a una pared del Zoco. Alguien rayó ahí, con la punta de un cuchillo, un símbolo chico: una araña con una sola pata levantada. Para cualquiera es un garabato. Para ella es una firma.`),
    S(`Zyr'thar`, `Vel'Shara. La Casa está en Zaryab. Y ese que firmó sabe que yo también.`, 'sin tocar la pared'),
    S('Joren Hell', `Las huellas de abajo son de hace dos días. Botas blandas, paso corto. Te están siguiendo desde antes de que te colgaran.`, 'agachado, con los dedos en el polvo'),
    S('Rabb Locke', `La hoja dice que conoce ese cuchillo. Que lo afiló una vez, con sangre de alguien que gritaba. Yo no me acuerdo. Ella sí.`, 'con una mano sobre la empuñadura, como quien calma a un caballo'),
    S('Joren Hell', `Si la siguen desde antes del juicio, sabían que nos iban a colgar. Alguien nos vendió en el desierto.`, 'mirando hacia el camino por el que llegaron, donde quedó Nadir'),
    { t: 'choice', prompt: 'La araña con una pata levantada quiere decir «te vimos». Zyr\'thar tiene que contestar.', options: [
      { label: `Zyr'thar: tachar la marca con su propio cuchillo`, hint: 'Que la Casa sepa que no se esconde. Le van a cobrar el orgullo.', e: { c: 1, flags: ['zyr_contesta_casa'] }, result: [`Zyr'thar raya la araña con tres cortes cruzados, el signo de los que se fueron sin pedir permiso. Al terminar le tiembla la mano. Esa noche duerme con el cuchillo abierto y la espalda contra la pared.`] },
      { label: 'Dejarla y no volver por esa calle', hint: 'Que crean que no la vio.', e: { d: 1, flags: ['zyr_ignora_casa'] }, result: [`Siguen de largo. Zyr'thar no mira atrás, y es lo más difícil que hizo en semanas. Su sombra sí mira.`] },
    ] },
  ],

  // ── Cap. IV: lo que mostraron los espejos (Joren y Panchi estaban ausentes) ──
  m_cap4: [
    N(`Al salir del Cubo, cada uno se lleva algo que vio en los espejos y no lo cuenta. Joren vio a su hermano con la máscara de zorro, de espaldas, alejándose por un pasillo que no terminaba nunca. Lo llamó. El reflejo no se dio vuelta.`),
    S('Joren Hell', `Si vuelvo a entrar, lo alcanzo. Sé que lo alcanzo.`, 'mirando la puerta de obsidiana que ya se cerró'),
    S('Panchi', `Yo vi a Ellie. Me miraba como se mira a un perro que mordió. No me dijo nada. Prefiero que me hubiera pegado.`, 'con los nudillos blancos'),
    { t: 'choice', prompt: 'La puerta del Cubo todavía late. Joren podría volver a entrar.', options: [
      { label: 'Joren: volver a entrar a buscarlo', hint: 'Los espejos cobran. Puede salir herido o no salir.', check: { skill: 'percepcion', dc: 13, pc: 'joren' }, e: { flags: ['joren_entra_cubo'] },
        result: [`Joren entra solo. Sale media hora después, con un corte en la mejilla que nadie le vio hacerse y la máscara de zorro en la mano, de verdad, de madera. No dice de dónde la sacó. Esa noche la pone al lado de su almohada y duerme por primera vez en meses.`],
        fail: { e: { c: 1, flags: ['joren_perdio_cubo'] }, result: [`Joren no vuelve. Panchi entra a buscarlo y lo encuentra sentado frente a un espejo, hablándole a nadie, con las uñas rotas de arañar el vidrio. Lo saca a la rastra. Joren no se acuerda de nada y no deja que nadie le pregunte.`] } },
      { label: 'Panchi: sacarlo de ahí a la fuerza', hint: 'Antes de que alguno de los dos vuelva a entrar.', e: { d: 1, flags: ['panchi_saca_joren'] }, result: [`Panchi lo agarra del brazo sin suavidad y no lo suelta hasta la plaza. Joren lo empuja, una vez, fuerte. Panchi aguanta el golpe sin moverse. «Pegame todo lo que quieras», le dice. «Pero afuera.»`] },
    ] },
  ],

  // ── Cap. V: el recuento en la plaza (Romain, Pact, Rabb y Zyr'thar estaban ausentes) ──
  m_cap5: [
    T('El recuento', 'La Plaza Central, entre los escombros del Coloso', 'plaza'),
    N(`Cuando el polvo baja, la plaza está llena de muertos de los dos lados: Qilaat con las lanzas todavía en la mano, Nasnas con piedras, vecinos que sólo querían ver. Romain camina entre ellos con la balanza. No la usa. No sabe para quién.`),
    N(`Debajo de una viga, Zyr'thar oye una respiración chica. Es una nena, enterrada hasta el pecho, con los ojos abiertos y sin llorar. Pact levanta la viga con la espalda y las alas se le encienden solas, doradas, sin que él lo quiera. Medio barrio lo ve. Esa imagen va a correr por Zaryab antes del anochecer.`),
    S('Rabb Locke', `La espada se tomó algo del Coloso cuando cayó. Está más pesada. Más contenta. La última vez que estuvo así de contenta, alguien murió. No me acuerdo quién.`, 'sosteniéndola lejos del cuerpo'),
    { t: 'choice', prompt: 'Medio barrio vio las alas de Pact encenderse. Ya hay gente arrodillada.', options: [
      { label: 'Pact: abrirlas del todo y dejar que miren', hint: 'Un ángel en la plaza. El Conclave también lo va a ver.', e: { alert: 2, recruits: 3, flags: ['pact_alas_plaza'] }, result: [`Pact abre las alas. Son más grandes de lo que nadie esperaba, y una está quemada en la punta. La gente llora. Un Qilaat suelta la lanza. Pact siente algo que no sentía desde antes de caer, y le da tanto miedo como alegría.`] },
      { label: 'Pact: esconderlas y salir de la plaza', hint: 'Nadie tiene que saber todavía.', e: { d: 1, flags: ['pact_esconde_alas'] }, result: [`Pact se arropa con la capa y se va entre el humo. Le duele la espalda como si se hubiera arrancado algo. Esa noche sueña con una mujer que le cose las alas y le dice «todavía no».`] },
    ] },
    { t: 'choice', prompt: 'Hay muertos de los dos bandos y nadie los va a enterrar hoy.', options: [
      { label: 'Romain: dar el rito de Kelemvor a todos, Qilaat y Nasnas por igual (Religión)', hint: 'Lo que le queda de fe, delante de toda la plaza. Si falla, la voz se le quiebra a mitad.', check: { skill: 'religion', dc: 13, pc: 'romain' }, e: { d: 2, flags: ['romain_rito_plaza'], rep: { hijos: 1 } },
        result: [`Romain dice los nombres que sabe y, para los que no sabe, dice «este». La plaza se calla. Un Qilaat herido se saca el casco para escuchar. Cuando termina, Romain no siente a Kelemvor. Siente otra cosa: que a alguien le importó. Por ahora alcanza.`],
        fail: { e: { c: 1 }, result: [`A la mitad del rito, la voz se le quiebra y no vuelve. Romain se queda arrodillado con la boca abierta y nada adentro. Zyr'thar le pone una mano en el hombro y termina la frase por él, mal, con las palabras equivocadas. Nadie se ríe.`] } },
      { label: 'Llevarse a la nena y dejar a los muertos', hint: 'Los vivos primero.', e: { flags: ['nena_plaza'], recruits: 1 }, result: [`La nena no suelta la mano de Zyr'thar en todo el camino a la biblioteca. Zyr'thar no se la saca. Dice que es para que no se pierda. Es mentira, y todos lo saben.`] },
    ] },
  ],

  // ── Cap. VI: los que no tienen dios (Romain, Rabb y Zyr'thar estaban ausentes) ──
  m_cap6: [
    T('Los que no tienen dios', 'Medinat al-Rih, al salir', 'medinat'),
    N(`En la salida de Medinat, una vieja Nasnas detiene a Romain por la manga. Quiere que entierre a su hijo, muerto en la revuelta. Pero sin dioses: Medinat no quiere ninguno, ni el de Romain.`),
    S('Romain', `No sé enterrar sin Kelemvor. Es como pedirme que hable sin lengua.`, 'mirando el cuerpo envuelto en una manta'),
    S(`Zyr'thar`, `Yo sí sé. En la Infraoscuridad enterramos así: sin nombres, para que nadie pueda llamarlos de vuelta. A mi madre la enterré así. Tenía nueve años y las manos sangrando.`, 'arremangándose'),
    { t: 'choice', prompt: `En la Infraoscuridad, quien entierra se queda con el nombre del muerto, para que nadie más lo use.`, options: [
      { label: `Zyr'thar: quedarse con el nombre del chico`, hint: 'Cargar con un muerto ajeno, como manda su gente.', e: { flags: ['zyr_carga_nombre'] }, result: [`La vieja le susurra el nombre al oído. Zyr'thar lo repite una vez, sin voz, y se lo guarda. Desde esa noche, cuando duerme, alguien dice ese nombre en su sombra. Ella no se queja. Es lo justo.`] },
      { label: `Zyr'thar: devolverle el nombre a la madre`, hint: 'Romper la costumbre de su Casa.', e: { d: 1, flags: ['zyr_devuelve_nombre'] }, result: [`«Es tuyo», le dice a la vieja. «En mi casa no lo entenderían. Por eso me fui.» La vieja la abraza, y Zyr'thar se queda dura como una estatua hasta que la suelta. Después se va a vomitar detrás de una pared.`] },
    ] },
    N(`Lo entierran entre los dos, sin rezos, con las manos. Rabb sostiene la espada lejos, porque la hoja quiere el cuerpo y él no la deja. Le cuesta. Le tiemblan los brazos como si sostuviera un peso enorme.`),
    S('Rabb Locke', `Si la suelto, se lo come. No sé cómo lo sé.`, 'con los dientes apretados'),
    { t: 'choice', prompt: 'La vieja les agradece y le pregunta a Romain si su dios lo va a castigar por esto.', options: [
      { label: 'Romain: «Si me castiga por esto, no es mi dios»', hint: 'Su fe cambia de forma.', e: { d: 1, flags: ['romain_entierro_sin_dios'] }, result: [`La vieja asiente como si hubiera esperado esa respuesta toda la vida. Romain se va de Medinat más liviano, y no sabe si eso es bueno.`] },
      { label: 'Romain: «Sí. Y lo voy a aceptar»', hint: 'La balanza pesa también al que pesa.', e: { flags: ['romain_acepta_castigo'] }, result: [`«Entonces sos mejor que tu dios», le dice la vieja, y no lo dice como un elogio. Romain lo va a pensar durante semanas.`] },
    ] },
  ],

  // ── Cap. VIII: lo que dejó el Vizir (Pact, Rabb y Joren estaban ausentes) ──
  m_cap8: [
    T('Lo que dejó el Vizir', 'La biblioteca, de noche', 'bajo'),
    N(`Cuando Razul se fue, la espada de Rabb siguió vibrando durante una hora. Dijo su nombre, el de Razul, con un tono que Rabb nunca le había oído: como quien nombra a un acreedor.`),
    { t: 'choice', prompt: 'La hoja sabe algo del Vizir. Rabb puede sacárselo.', options: [
      { label: 'Rabb: arrancarle a la hoja lo que sabe (Intimidar)', hint: 'Cuerpo a cuerpo con su propia arma. Si pierde, la hoja le cobra un recuerdo.', check: { skill: 'intimidar', dc: 14, pc: 'rabb' }, e: { flags: ['rabb_silaba', 'rabb_sabe_razul'] },
        result: [`Rabb aprieta la empuñadura hasta que le sangran los dedos. La hoja grita, y en el grito hay una sílaba, una sola, de su verdadero nombre. Rabb la repite en voz alta para no perderla. Es lo primero suyo que recupera desde el desierto.`, `«Razul me vendió», dice la hoja después, cansada. «O me compró. Hace tanto que ya no me acuerdo de qué lado de la mesa estaba.»`],
        fail: { e: { c: 1, flags: ['rabb_pierde_recuerdo'] }, result: [`La hoja gana. Rabb se despierta en el suelo de la biblioteca y no recuerda la cara de Aisha. Tiene que preguntarle cómo se llama. Ella se lo dice con una paciencia que lo avergüenza más que cualquier herida.`] } },
      { label: 'Dejarla hablar sola y no escucharla', hint: 'Rabb elige no saber todavía.', e: { d: 1 }, result: [`Rabb envuelve la espada en tres mantas y la deja en el sótano. Esa noche duerme bien por primera vez desde el desierto. Se siente culpable por eso.`] },
    ] },
    N(`Afuera, Joren reconoce a uno de los Qilaat que escoltaron al Vizir. Tiene una marca a fuego en la muñeca: la de La Marca. Ese hombre estuvo ahí. Joren le ve la cara y se le cierra la garganta.`),
    S('Pact Risen', `Joren. Mirame a mí. Hoy no. Si lo seguís esta noche, no volvés.`, 'parándose entre él y la calle, con las alas a medio abrir'),
    S('Joren Hell', `Sabe el nombre. El nombre del que dio la orden. Está a veinte pasos.`, 'con la mano en el carcaj'),
    { t: 'choice', prompt: 'El Qilaat de La Marca dobla la esquina.', options: [
      { label: 'Joren: dejarlo ir, por ahora', hint: 'Pact lo pide. El nombre puede esperar.', e: { d: 1, flags: ['joren_espera_marca'] }, result: [`Joren saca la mano del carcaj. Pact no se mueve hasta que el Qilaat desaparece. Después se sientan en el escalón, los dos, sin hablar, hasta que amanece.`] },
      { label: 'Joren: seguirlo y hacerlo hablar', hint: 'Riesgo de que el Conclave sepa dónde viven.', e: { c: 1, alert: 2, flags: ['joren_interroga_marca', 'kaelen_pista'] }, result: [`Joren vuelve a la madrugada con los nudillos rotos y un nombre que no dice. Pact le venda la mano sin preguntar. Cuando termina, Joren le dice «gracias» y algo más que Pact no alcanza a oír.`] },
    ] },
  ],

  // ── Cap. X: los frascos de La Marca y la cara del vendedor (Pact y Joren ausentes; Rabb, clímax débil) ──
  m_cap10: [
    T('Lo que quedó en los estantes', 'La cripta de las Trece Caras, después', 'limbo'),
    N(`Antes de subir, Joren recorre los estantes de Al-Mazhar leyendo etiquetas. Busca una sola palabra y la encuentra en el tercer estante desde abajo: «La Marca». Es un frasco chico, con la cera intacta.`),
    { t: 'choice', prompt: 'Puede ser la voz de cualquiera de los que murieron en La Marca. Puede ser la de su hermano.', options: [
      { label: 'Joren: abrirlo', hint: 'Escuchar lo que haya adentro, sea de quien sea.', e: { flags: ['joren_oye_frasco'] }, result: [`La voz que sale no es la de su hermano. Es la de un hombre que Joren no conoce, que pide perdón a alguien que no está. Joren se queda escuchando hasta el final. Después dice el nombre de su hermano en voz alta, para que en la cripta quede por lo menos una voz que lo diga.`] },
      { label: 'Joren: llevárselo cerrado', hint: 'No está listo. Puede que nunca lo esté.', e: { flags: ['joren_guarda_frasco'] }, result: [`Joren lo envuelve en un trapo y lo guarda en el carcaj, entre las flechas. A partir de ese día el carcaj suena distinto cuando camina. Nadie le dice nada.`] },
    ] },
    N(`Pact se queda junto a Aisha mientras ella junta los pedazos del frasco de su marido. No la ayuda: la cuida de que no se corte. Una de las máscaras caídas de Al-Mazhar tiene la cara de una mujer de pelo corto, y Pact la mira demasiado tiempo.`),
    S('Pact Risen', `Esa cara la conozco. No sé de dónde. Me duele la espalda, donde están las alas, cuando la miro.`, 'sin tocar la máscara'),
    N(`Entre las trece máscaras hay una que no cayó. Sigue colgada de su cuerda, girando sola, y cuando se detiene, mira a Rabb. Tiene su cara. Más joven, sin cicatrices, sonriendo como sonríe alguien que acaba de cerrar un buen negocio.`),
    S('Rabb Locke', `Ese soy yo. Firmando. Nadie me vendió la espada. Yo me vendí a ella.`, 'con la voz rota, de rodillas frente a la máscara'),
    S('Panchi', `Rabb. Mirá para acá. Eso es una máscara. Vos sos el que está acá abajo, con nosotros. El otro no vino.`, 'agarrándolo de la nuca, frente contra frente'),
    { t: 'choice', prompt: 'La máscara con la cara de Rabb sigue girando, sonriendo.', options: [
      { label: 'Rabb: partirla con la espada', hint: 'Que la hoja rompa la prueba de su propia venta. Puede que no quiera.', e: { d: 1, flags: ['rabb_rompe_mascara'] }, result: [`Rabb levanta la espada y la hoja se resiste: pesa como una puerta. Grita, la baja igual, y la máscara se parte en dos. De adentro cae un papel doblado, viejo, con una firma que es la suya. Lo quema en una de las velas del Lich sin leerlo. Le sangra la nariz durante una hora.`] },
      { label: 'Rabb: guardarse la máscara', hint: 'Quiere mirarla de nuevo, cuando pueda.', e: { c: 1, flags: ['rabb_guarda_mascara'] }, result: [`Rabb la descuelga con cuidado, como quien levanta a alguien dormido, y la mete en el morral. Pesa más de lo que debería. Desde esa noche, a veces, la oye reírse bajito cuando él duerme.`] },
    ] },
  ],

  // ── Cap. XI: la mina (Romain, Rabb, Joren y Zyr'thar estaban ausentes) ──
  m_cap11: [
    T('Las voces en la piedra', 'Mina de Alabastro, nivel 3', 'prison'),
    N(`En el tercer nivel de la mina, las paredes hablan. No fuerte: un murmullo, como gente rezando detrás de una puerta. Son los mineros que nadie bajó a buscar. Romain apoya la oreja en la piedra y se le llenan los ojos de lágrimas.`),
    { t: 'choice', prompt: 'Las almas de los mineros están atrapadas en el alabastro. Romain puede intentar soltarlas.', options: [
      { label: 'Romain: pesarlas una por una y dejarlas ir (Religión)', hint: 'Cuesta tiempo bajo tierra, con el gusano cerca. Si falla, las voces lo siguen.', check: { skill: 'religion', dc: 15, pc: 'romain' }, e: { d: 2, flags: ['romain_mineros'] },
        result: [`Tarda una hora. Una por una, las voces se callan con un suspiro. La última es de un chico que pregunta si ya puede irse a casa. Romain le dice que sí. Es la primera vez desde el templo quemado que siente la balanza moverse en su mano.`],
        fail: { e: { c: 1, flags: ['romain_voces_mina'] }, result: [`Las voces no se van. Se le pegan. Desde ese día, cuando Romain se queda en silencio, alguien murmura un nombre de minero dentro de su cabeza. Él aprende sus nombres. Es lo único que puede hacer.`] } },
      { label: 'Seguir: el gusano no espera', hint: 'Los vivos primero.', e: { flags: ['mineros_quedan'] }, result: [`Siguen bajando. El murmullo los acompaña dos niveles más y después se apaga. Romain no dice nada en todo el camino. Al salir, deja la balanza en la boca de la mina.`] },
    ] },
    N(`En los túneles angostos, Zyr'thar se queda sin aire. No es el polvo. Es la oscuridad cerrada, la piedra encima, el olor de la Infraoscuridad. Se apoya en la pared y tiembla como no la habían visto temblar nunca.`),
    S(`Zyr'thar`, `Me criaron acá abajo. Bueno, no acá. En un lugar igual. Me prometí no volver a bajar nunca. Mirá qué bien cumplo las promesas.`, 'con la frente contra la piedra'),
    { t: 'choice', prompt: `Zyr'thar no puede seguir. El gusano se oye dos niveles más abajo.`, options: [
      { label: `Zyr'thar: agarrarse del carcaj de Joren y bajar a ciegas`, hint: 'Confiar en alguien en la oscuridad. Nunca lo hizo.', e: { d: 1, chem: { 'joren+zyrthar': 2 }, flags: ['zyr_confia_joren'] }, result: [`Joren le tiende la correa sin mirarla, para no avergonzarla. «Yo veo en la oscuridad mejor de lo que creés. No te suelto.» No la suelta. Al llegar abajo, ella le devuelve la correa y le dice «nunca pasó». Él asiente. Pasó.`] },
      { label: `Zyr'thar: cerrar los ojos y caminar sola`, hint: 'Como la entrenaron. Si se pierde, el gusano la encuentra antes.', check: { skill: 'sigilo', dc: 14, pc: 'zyrthar' }, e: { flags: ['zyr_sola_mina'] }, result: [`Zyr'thar cierra los ojos y camina como le enseñaron de chica: contando pasos, oliendo la piedra. Llega primera. Se sienta a esperar a los demás con las manos en las rodillas, para que no vean cuánto le tiemblan.`], fail: { e: { c: 1 }, result: [`Se pierde. Durante diez minutos la oyen llamar desde un túnel lateral, cada vez más lejos, con una voz de nena que nadie le conocía. Joren la encuentra siguiendo el llanto. Ninguno de los dos vuelve a hablar de eso.`] } },
    ] },
    S('Rabb Locke', `La espada se calla acá abajo. Es la primera vez. Le tiene miedo al gusano. Y si ella tiene miedo, yo debería tener mucho más.`, 'sin reírse'),
  ],

  // ── Cap. XII: la víspera de Panchi (Panchi estaba ausente) ──
  m_cap12: [
    T('La mano de Panchi', 'La Ciudadela, en la escalera de bajada', 'limbo'),
    N(`Bajando de la Ciudadela, Panchi se queda atrás. Tiene la venda de Ellie en la muñeca y la mira como si fuera un mensaje que no termina de entender. «Traelo o no vengas.» Hace meses que lo repite. Recién ahora se pregunta qué es «lo».`),
    S('Panchi', `Pensé que era una cabeza. La de quien la lastimó. Después pensé que era un fragmento. Ahora creo que es otra cosa y me da más miedo.`, 'sentado en un escalón, con la venda entre los dedos'),
    S('Pact Risen', `¿Qué cosa?`, 'sentándose al lado'),
    S('Panchi', `Mi rabia. Que se la lleve entera, para que ella vea que la saqué de adentro. Y no sé si puedo pelear sin ella. No sé quién soy si no tengo los puños cerrados.`, 'abriendo y cerrando la mano, despacio'),
    { t: 'choice', prompt: 'Mañana es el Eclipse. Panchi no sabe si llega entero.', options: [
      { label: 'Panchi: practicar la mano abierta toda la noche', hint: 'Prepararse para soltar.', e: { d: 1, flags: ['panchi_practica_mano'] }, result: [`Panchi pelea contra la pared de la escalera con la mano abierta hasta que se le hinchan los dedos. Pact se queda despierto contando los golpes en voz baja. A la madrugada, Panchi apoya la palma en la piedra y la deja ahí, quieta. Es la primera vez que algo suyo se queda quieto.`] },
      { label: 'Panchi: cerrar el puño y guardar la rabia para mañana', hint: 'La va a necesitar.', e: { c: 1, flags: ['panchi_guarda_rabia'] }, result: [`Panchi aprieta el puño hasta que crujen los nudillos y se va a dormir así, con la mano cerrada. Pact lo tapa con su capa. «Mañana la soltás», le dice. Panchi ya duerme, o hace como que duerme.`] },
    ] },
  ],
};
