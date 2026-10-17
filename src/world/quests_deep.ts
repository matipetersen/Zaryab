// Versiones profundas de las misiones personales y secundarias. Se conectan como override de `script`
// (mismos ids, mismos flags, mismos ids de combate, mismas recompensas, huellas, ecos y checks que las originales).
import type { Node } from '../story/types';
import type { Effect } from '../state';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const BG = (id: string): Node => ({ t: 'bg', id });

// ═══════════════════════════ PERSONALES ═══════════════════════════

const P_ROMAIN: Node[] = [
  T(`El Templo Quemado`, `Arco de Romain · La Fe Rota`, `prison`),
  N(`Romain no dijo adónde iban. A tres calles del final del Bajo Zaryab dejó de hablar del todo, y los demás aprendieron a caminar sin preguntar. El callejón de los curtidores termina en un hueco de paredes negras: vigas caídas, un altar partido en dos, y sobre un pedestal una balanza de piedra a la que le arrancaron un platillo.`),
  S(`Romain`, `Se entraba por la izquierda. Los jueves la gente de la panadería dejaba pan en el escalón y yo hacía como que no sabía quién era. Después de la oración, el pan ya no estaba. Era un acuerdo.`, `sin cruzar el umbral`),
  N(`Panchi abre la boca para decir algo, mira la cara de Romain y se lo traga. Es la primera vez que lo hace en toda la campaña.`),
  S(`Zyr'thar`, `Esto no se quemó solo. Mirá dónde empiezan las marcas: primero las puertas, después las ventanas, recién al final el techo. Alguien se aseguró de que nadie saliera.`, `agachada junto a un marco`),
  N(`Romain camina hasta el altar. Pasa la mano por la piedra hasta que encuentra, grabado bajo el hollín, el sello del Conclave: siete vientos en círculo.`),
  S(`Romain`, `No fueron djinns. Fueron ellos. Los Inquisidores. Y yo les creí.`, `al encontrar el sello del Conclave grabado en una piedra`),
  S(`Romain`, `Llegaron a la mañana siguiente, con el humo todavía subiendo, y me ofrecieron un acta. Decía que había visto alas de djinn en el fuego. Yo no vi nada: estaba de rodillas. Pero firmé. Con esa acta quemaron dos calles más.`),
  S(`Joren Hell`, `Firmaste. No encendiste.`, `seco`),
  S(`Romain`, `Dejame cargar con lo mío, Joren. Es lo único que me dejaron.`),
  N(`Pasos en el callejón. Un Inquisidor Radiante entra con cuatro guardias que traen cinceles y baldes de cal. No vienen a rezar: vienen a borrar. Tras ellos, atado a una correa, un perro de arena olfatea las cenizas buscando herejía.`),
  S(`Inquisidor`, `Zona sellada por el Conclave. Retírense, o agreguen su nombre al expediente.`, `sin mirar la cara de nadie`),
  S(`Romain`, `Ya agregué el mío una vez.`),
  { t: 'battle', enc: 'romain' },
  N(`Cuando termina, el Inquisidor se arrastra sobre las cenizas con el cincel todavía en la mano. Tiene la túnica abierta y el rostro de alguien que lleva mucho tiempo sin dormir. Romain se agacha frente a él. Detrás, Pact se acerca un paso y se detiene: sabe que esto no le toca.`),
  S(`Inquisidor`, `Yo no lo quemé. Llegué después. Me mandaron a limpiar. Seis años que limpio.`, `con la boca llena de sangre`),
  S(`Romain`, `¿Cuántos había adentro?`),
  S(`Inquisidor`, `Veintiuno. Los conté al barrer. Había una nena que todavía tenía puesto el delantal del pan.`),
  N(`Romain no se mueve. En la mano libre aprieta, sin darse cuenta, el platillo que no tiene. El Inquisidor lo mira y entiende que nadie lo va a interrumpir.`),
  { t: 'choice', prompt: `Un Inquisidor herido se arrastra entre las cenizas. Romain lo mira. Tiene su templo a los pies.`, options: [
    { label: `Buscar venganza contra los Inquisidores`, hint: `Garras del Efrit. El precio es suyo.`, e: { c: 3, alert: 1, grant: { romain: { weapons: [{ id: 'garras', name: 'Garras del Efrit', range: 1, toHit: 5, dmg: [{ dice: '1d6+1', type: 'slashing' }, { dice: '1d6', type: 'fire' }] }] } }, flags: ['romain_venganza'] }, result: [
      `Romain deja caer la maza. Sus manos se cubren de brasas, y el cristal de Zahir late dentro del pecho de todos, satisfecho.`,
      `El Inquisidor no grita. Mira esas manos como si las reconociera, y cuando todo termina el sello del Conclave en la piedra quedó tan ennegrecido que ya no se lee. Zyr'thar le limpia la sangre de la capa a Romain sin decir nada; Panchi, que habría aplaudido a cualquiera menos a él, mira para otro lado.`] },
    { label: `Buscar pruebas para exponerlos`, hint: `La Luz del Simurg, mejorada.`, e: { d: 3, pf: 3, rep: { conclave: -1 }, grant: { romain: { traits: ['luzMejorada'] } }, flags: ['romain_pruebas', 'prueba_templo'] }, result: [
      `Entre las cenizas, bajo la piedra del altar, un pliego intacto dentro de un tubo de bronce: órdenes selladas del Inquisidor Jefe Kaelen, con la fecha de la noche del incendio. Romain lo guarda sobre el pecho.`,
      `Zyr'thar lo copia en tres hojas antes de que se enfríe el lacre. Una para Aisha, una para la biblioteca y una para el que sobreviva. El Inquisidor herido, atado al perro de arena que ya no le ladra, escucha la lista de nombres que Romain lee en voz alta, uno por uno, hasta que le tiembla la mandíbula.`] },
    { label: `Perdonar y seguir adelante`, hint: `Eclipse Personal: una duda que se vuelve poder.`, e: { d: 1, c: 1, grant: { romain: { abilities: ['eclipse_personal'], res: { eclipse: 1 } } }, flags: ['romain_perdon'] }, result: [
      `Romain pone la mano sobre el Inquisidor y no dice nada. Durante un instante el sol se apaga alrededor de los dos, y el perro de arena se echa en el suelo con las orejas gachas.`,
      `«No te perdono», dice Romain cuando vuelve la luz. «Dejo de pesarte. No es lo mismo.» El Inquisidor llora sin ruido, se levanta como puede y se va por el callejón sin cincel, sin cal y sin mirar atrás.`] },
  ] },
  BG(`bajo`),
  N(`Vuelven por el Bajo al atardecer. Romain lleva bajo el brazo el pivote de la balanza, un tubo de piedra del largo de un antebrazo que se rompió del pedestal al bajarlo. Nadie le pregunta para qué.`),
  IF(`romain_venganza`, [S(`Pact Risen`, `Esas brasas... ¿Te duelen?`, `a media voz`), S(`Romain`, `No. Eso es lo que me preocupa.`)]),
  IF(`romain_pruebas`, [S(`Zyr'thar`, `Con esas tres copias se puede hundir a un Inquisidor Jefe, o venderlo. Yo recomiendo la primera. La segunda paga mejor.`, `seca`), S(`Romain`, `Quiero a Kaelen frente a un juez, no en una bolsa.`)]),
  IF(`romain_perdon`, [S(`Joren Hell`, `Yo no lo habría soltado.`), S(`Romain`, `Yo tampoco. Lo solté igual.`)]),
  S(`Panchi`, `¿La de la panadería era la del comino?`, `después de seis cuadras de silencio`),
  S(`Romain`, `La del comino. Un pan chato, así. Se pegaba al paladar.`, `casi sonriendo`),
  S(`Panchi`, `Mañana la buscamos. Si sigue ahí, pago yo.`),
  FX({ flags: ['q_p_romain'] }, `Arco de Romain (1/3): El Templo Quemado.`),
];

const P_PACT: Node[] = [
  T(`La Corona Invertida`, `Arco de Pact Risen · El Nombre Sellado`, `espejos`),
  N(`Las Si'lats los esperan bajo un arco del acueducto, al caer la noche. No hablan: caminan por delante, siluetas de luz que se apagan cuando alguien las mira de frente, y los conducen por galerías que gotean hasta un templete sin techo. Es un cuadrado de piedra abierto al cielo, y en el suelo, grabada con tanta fineza que parece ceniza, una corona de fuego al revés.`),
  S(`Rabb Locke`, `Una corona invertida. Qué sutileza la de los ángeles.`, `con las manos en los bolsillos`),
  S(`Si'lat`, `Aquí se juzgó a Azuran. El Portador del Segundo Aliento no otorgaba poder: lo medía. Su juicio final fue considerado inaceptable: «ni dioses ni djinns merecen fe ciega». Por eso lo quemaron y lo arrojaron a la carne mortal.`, `la mayor`),
  S(`Romain`, `¿Y a nosotros por qué nos traen?`),
  S(`Si'lat`, `No los traemos a ustedes. Ustedes vienen a que lo oigan. Un hombre que cae no debería caer solo.`),
  N(`Pact Risen se quita el cinturón con la espada y lo deja sobre la piedra. Hace una reverencia corta a las Si'lats, tan formal que es casi un chiste, y nadie ríe. Se arrodilla en el centro de la corona. El fuego dorado asoma por las grietas de la piel, en los hombros, donde estuvieron las alas.`),
  S(`Pact Risen`, `Si hay algo que debo, que lo cobren aquí. No quiero que me alcance en la calle.`, `sin levantar la vista`),
  N(`En el aire se forma su reflejo: un hombre de pie, coronado, sin alas, con la cara de Pact y una calma que Pact nunca tuvo. La corona le arde sobre la frente, boca abajo.`),
  S(`Azuran`, `Medí a mil almas. No me tembló la mano. A vos sí te tiembla. ¿Qué hiciste, que no podés dejar de pedir perdón?`, `sin crueldad, como quien pregunta la hora`),
  S(`Pact Risen`, `No sé. Lo siento aquí, desde que desperté. Es una cuenta que me falta.`),
  S(`Azuran`, `Entonces la cuenta es tuya, no mía. Peleá por ella.`),
  { t: 'battle', enc: 'pact' },
  N(`El eco se desmorona por los bordes, como una hoja que se consume al revés. Pact queda de rodillas, con las manos abiertas sobre la piedra, y Romain se acerca a sostenerlo del hombro antes de que nadie se lo pida. En el suelo quedan unas cenizas doradas, tibias.`),
  S(`Si'lat`, `Azuran no condenó a nadie. Se negó a dictar la sentencia que el Conclave y el cielo le exigían. Eso fue lo imperdonable. La culpa que sentís, Pact, puede no ser tuya. O puede serlo. Las cenizas no lo dicen: lo dice lo que hagas con ellas.`),
  { t: 'choice', prompt: `El eco se desmorona. En el suelo quedan unas cenizas doradas.`, options: [
    { label: `Aceptar la corona y declarar su verdad`, hint: `Una Verdad por combate.`, e: { d: 1, grant: { pact: { abilities: ['declarar_verdad'], res: { verdad: 1 } } }, flags: ['pact_acepta_corona'] }, result: [
      `Pact se pone en pie. La corona de fuego invertido arde sobre su cabeza sólo un instante. «Recuerdo mi juramento», dice. «Ni dioses ni djinns.»`,
      `Las Si'lats se arrodillan, todas a la vez, y las cenizas suben en una columna delgada hasta perderse en el cielo. Rabb deja de sonreír. «No sé qué sos», le dice, «pero voy a caminar a tu lado cuando lo averigües.»`] },
    { label: `Sellar la memoria otra vez`, hint: `Seguir siendo Pact Risen.`, e: { c: 1, flags: ['pact_sella_memoria'] }, result: [
      `Pact tapa las cenizas con la palma. «Todavía no.» Las Si'lats inclinan la cabeza, aliviadas y tristes.`,
      `La corona del suelo se apaga, trazo por trazo, y el templete vuelve a ser un cuadrado de piedra bajo el cielo. Zyr'thar se encoge de hombros: «Es tu cabeza.» Pact asiente, y en el hombro derecho, donde ardía, le queda una marca fría que no se va.`] },
    { label: `Pedir a Romain que mida su alma`, hint: `Un juicio ajeno.`, e: { d: 1, pf: 2, flags: ['pact_juicio_romain'] }, result: [
      `Romain levanta una balanza invisible. El platillo de Pact baja… y, a su lado, el de Azuran sube. Pesan lo mismo.`,
      `«No puedo decidir cuál de los dos vale más», dice Romain, con la voz ronca de quien lleva tiempo sin una balanza entera. «Pero puedo sostener el otro lado hasta que lo decidas vos.» Pact lo mira con tanta gratitud que Romain se ve obligado a mirar el suelo.`] },
  ] },
  IF(`pact_acepta_corona`, [N(`Antes de irse, Romain se acerca a las cenizas, ahora dispersas, y deja caer un puñado de arena sobre ellas, como se hace en un entierro. «No es un duelo», le dice a nadie. «Es la costumbre.»`)]),
  IF(`pact_sella_memoria`, [N(`Una de las Si'lats se queda atrás, junto a las cenizas selladas. Cuando Pact se vuelve a mirarla, alza una mano en un saludo corto: no es reproche. Es una puerta que queda entornada.`)]),
  IF(`pact_juicio_romain`, [N(`Romain camina junto a Pact hasta la salida, sin decir nada. Hay algo nuevo entre ellos: no una amistad todavía, sino el acuerdo tácito de que uno de los dos cargará lo que el otro no pueda.`)]),
  BG(`acueducto`),
  N(`Salen del templete por la misma galería. Las Si'lats se quedan atrás, apagadas.`),
  S(`Pact Risen`, `Debí agradecerles. ¿Les agradecí?`, `formal, preocupado`),
  S(`Rabb Locke`, `Hiciste una reverencia que le serviría a un virrey. Estás perdonado por cualquier cosa de modales.`),
  S(`Pact Risen`, `Rabb, hablo en serio. No sé hasta dónde puedo cumplir con todo lo que dice que debo.`),
  S(`Rabb Locke`, `Empezá por comer. A mí me sirve. Hay lentejas en la biblioteca, y Aisha no pregunta por los pecados.`),
  FX({ flags: ['q_p_pact'] }, `Arco de Pact Risen (1/3): La Corona Invertida.`),
];

const P_RABB: Node[] = [
  T(`El Nombre en el Arma`, `Arco de Rabb Locke · La Memoria Robada`, `espejos`),
  N(`La biblioteca de noche tiene su propia música: Panchi roncando detrás de los anaqueles, una olla que se enfría sobre las brasas, la cuchara de Aisha golpeando el borde cuando termina de revolver. Rabb está sentado a la mesa larga con la espada de pacto desnuda sobre los antebrazos. La hoja susurra. Hace rato que susurra.`),
  N(`Farid baja la escalera descalzo, con una manta sobre los hombros, y se sienta frente a Rabb sin preguntar.`),
  S(`Farid`, `Tu espada habla.`, `bajito`),
  S(`Rabb Locke`, `¿Y qué dice?`),
  S(`Farid`, `Tu nombre. Pero lo dice al revés. Y cuando te dormís, lo dice bien.`),
  N(`Rabb mira a Farid un buen rato. Después manda al chico a la cama con un cuento que no se cree ni él, y apoya la espada sobre la mesa. La hoja deja de callar.`),
  S(`Arma de Pacto`, `Rabb… Rabb Locke… ese no es tu nombre. Tu nombre es… tu nombre es… ¡despertá!`, `una voz que no es de nadie`),
  N(`En un rincón, entre dos estantes, la sombra del Oráculo de las Mil Lenguas parece reír. Es una sombra fija, sin dueño visible, que Aisha jura que no estaba el día anterior. Todo lo que dice es falso, así que se puede escuchar al revés.`),
  S(`Oráculo de las Mil Lenguas`, `Rabb no tiene ningún pasado. Rabb nunca olvidó nada. Rabb nunca firmó ningún contrato. Rabb nunca tuvo un nombre que valiera la pena recordar.`, `una verdad invertida`),
  S(`Zyr'thar`, `Dalo vuelta. Tiene pasado. Olvidó algo. Firmó. Y el nombre vale tanto que alguien pagó por borrarlo.`, `desde la escalera, con una taza en la mano`),
  S(`Rabb Locke`, `Sutil. Siempre soñé con que me explicaran mi vida con una frase negativa.`),
  S(`Zyr'thar`, `Una sola cosa más: el Oráculo miente, la espada no. Si la hoja quiere que te despiertes, es porque alguien la hizo para eso.`),
  N(`La hoja se calla de golpe, a mitad de una sílaba. En el silencio, Rabb siente algo que le sube por el brazo: no es dolor, es la memoria de un dolor.`),
  { t: 'choice', prompt: `«Tu nombre es…» El susurro se corta.`, options: [
    { label: `Investigar su pasado`, hint: `Un fragmento de memoria. Dolerá.`, e: { d: 1, flags: ['rabb_memoria'] }, result: [
      `Un destello: una mesa, una mano que no es la suya firmando con sangre, una voz que dice «olvidar». Rabb se tambalea.`,
      `Junto a su firma hay otra, en otra letra, de un nombre que no logra leer. La hoja se enfría en sus manos. Romain, que había estado leyendo en la otra punta de la mesa, llega antes de que Rabb caiga y lo sostiene; Panchi, despertado por el ruido, trae un balde de agua que nadie pidió.`] },
    { label: `Aceptar su nueva identidad`, hint: `El Eco gana terreno.`, e: { c: 2, flags: ['rabb_acepta'] }, result: [
      `«Soy Rabb Locke», dice. La hoja ronronea. Algo en él sonríe sin boca.`,
      `La sombra del Oráculo se queda quieta, por una vez sin burlas. Desde lo alto de la escalera, Farid los observa con la manta hasta la nariz y no vuelve a hablar de la espada. Rabb duerme esa noche, por primera vez en semanas, sin soñar con nada.`] },
    { label: `Destruir el arma`, hint: `Libertad… a cambio de la espada. Eclipse Personal.`, e: { grant: { rabb: { removeWeapons: ['pact'], weapons: [{ id: 'daga', name: 'Daga de acero', range: 1, toHit: 4, dmg: [{ dice: '1d4+2', type: 'piercing' }], finesse: true }], abilities: ['eclipse_personal'], res: { eclipse: 1 } } }, flags: ['rabb_libre'] }, result: [
      `La hoja se parte con un grito de cristal. Rabb cae de rodillas, vacío y ligero. A su alrededor, por un instante, se apaga el sol.`,
      `Cuando vuelve la luz, la biblioteca está en un silencio nuevo: ya no hay nadie que susurre. Joren, sin decir palabra, deja sobre la mesa una daga de acero de su propio morral. «Para que tengas algo que sostener», le dice. La sombra del rincón se desvanece antes de poder reírse.`] },
  ] },
  IF(`rabb_memoria`, [N(`Entre los estantes, Zyr'thar anota en un cuaderno viejo: una mesa, una firma, una palabra. «Cuando recuerdes otra», dice sin levantar la vista, «te la leo en voz alta para que se te quede.» Rabb asiente. Es la oferta más práctica que le han hecho nunca.`)]),
  IF(`rabb_acepta`, [N(`La hoja descansa sobre la mesa, tibia, ronroneando. Joren la mira de lejos, con el arco al hombro, y decide no sentarse del lado donde da el filo.`)]),
  IF(`rabb_libre`, [N(`Panchi, medio dormido, sale de los estantes con una manta y se sienta junto a Rabb sin decir nada. Se queda ahí, roncando bajito, hasta que amanece.`)]),
  N(`Aisha aparece al pie de la escalera con un candil, en camisón, y mira la mesa y los restos de lo que haya pasado.`),
  S(`Aisha`, `No quiero saber. Pero van a comer algo. Las ollas no se enfrían para nada.`),
  S(`Rabb Locke`, `Aisha, ¿qué comida pido yo? Digo, siempre. ¿Alguna vez lo noté?`),
  S(`Aisha`, `Pan con aceite, y lo mojás hasta que se deshace. Tres veces esta semana lo pediste, sin darte cuenta.`),
  N(`Rabb sonríe, esta vez de verdad. Es un dato mínimo, una costumbre de nadie, pero es suyo. Aisha le pone el plato delante y se va a oscuras, dejando el candil.`),
  FX({ flags: ['q_p_rabb'] }, `Arco de Rabb Locke (1/3): El Nombre en el Arma.`),
];

const P_JOREN: Node[] = [
  T(`El Manifiesto de La Marca`, `Arco de Joren Hell · El Crimen que No Cometió`, `zoco`),
  N(`El depósito de EaNassr huele a especias viejas y a cuero seco. Joren está contando cajas con Zyr'thar cuando se detiene frente a un mostrador de inventario sellado, entre pergaminos arrugados, y se queda quieto. Sobre un trozo de cuero hay un sello quemado: un círculo partido con un diente dentro.`),
  S(`Zyr'thar`, `¿Joren?`),
  S(`Joren Hell`, `La Marca.`, `la mano ya sobre el cuero`),
  N(`Un manifiesto de carga, doblado en tres: «Artículo entregado: 1 paquete sellado de La Marca. Destino parcial: Zoco Sur. Resto del envío: reenviado a Medinat al-Rih. Contacto: desconocido. Pago: en sangre.» Joren lo lee dos veces. Después lo lee otra vez, más despacio.`),
  S(`Zyr'thar`, `¿Quiénes son?`),
  S(`Joren Hell`, `Mi gente. Éramos siete. Un envío salió mal. Seis murieron. Dijeron que lo vendí yo.`),
  S(`Zyr'thar`, `¿Lo vendiste?`),
  S(`Joren Hell`, `No.`),
  S(`Zyr'thar`, `Entonces ya tenemos una cosa que averiguar.`, `y guarda el cuchillo con que contaba las cajas`),
  S(`EaNassr`, `Curioso el símbolo, ¿no? Llegó por mar... dicen que con tormentas. Yo solo gestioné su paso. Zaryab es un puente, no un hogar. El resto fue hacia el Este. A Medinat. No preguntes qué era. Aunque por tu cara... creo que ya lo sabés.`, `sonriendo`),
  S(`Joren Hell`, `¿Quién firmó la recepción?`),
  S(`EaNassr`, `Un hombre con cicatriz y dos escoltas. Pagó en sangre, como dice el papel, y no volvió. Si buscás gente de La Marca, hay una bodega en el Zoco Sur con el mismo sello en la puerta. No les digas que te mandé.`, `frotándose el anillo`),
  N(`La bodega del Zoco Sur tiene un portón de madera con el diente partido pintado a brocha. Panchi lo estudia durante un minuto entero.`),
  S(`Panchi`, `Dos adentro, uno en el techo. Los del techo siempre se duermen.`),
  S(`Joren Hell`, `No este.`),
  N(`Dentro, cinco hombres juegan a los dados sobre un cajón. Uno de ellos se levanta al ver a Joren: cuarenta años, barba corta, la misma cicatriz en la ceja que Joren recuerda de todos los inviernos.`),
  S(`Voz`, `Joren Hell. Te dábamos por muerto.`),
  S(`Joren Hell`, `Eso dicen.`),
  S(`Voz`, `Vendiste al grupo. Todavía hay hombres que pagarían por tu cabeza. Nos dejaron la bodega a nosotros.`),
  S(`Joren Hell`, `No vendí a nadie.`, `una sola vez, sin elevar la voz`),
  N(`Los hombres de La Marca no esperaban visitas.`),
  { t: 'battle', enc: 'joren' },
  N(`Cuando termina, el de la cicatriz yace contra los cajones con la mano apretada sobre una herida que no va a cerrar. Joren se arrodilla a su lado. Zyr'thar se queda de pie junto a la puerta, vigilando la calle, para darles aire.`),
  S(`Voz`, `Nos pagaron para custodiar... no sabíamos qué. La mercancía... era una persona.`, `con un hilo de voz`),
  S(`Joren Hell`, `¿Viva?`),
  S(`Voz`, `La entregaron viva. A Medinat. Pagaron en sangre, de eso sí me acuerdo.`),
  N(`Cierra los ojos. Joren le baja los párpados con dos dedos, tal como hacía, años atrás, con los suyos.`),
  { t: 'choice', prompt: `Un mercenario moribundo balbucea: «La mercancía… era una persona.»`, options: [
    { label: `Ir a Medinat al-Rih sin perder tiempo`, hint: `El pasado de Joren se acerca.`, e: { c: 1, flags: ['joren_medinat'] }, result: [
      `Joren recarga el arco. «Tengo que verlo con mis propios ojos.»`,
      `Panchi ya se está atando las vendas, y Zyr'thar, sin que nadie se lo pida, empieza a repartir las raciones en bolsas. Salen por la puerta trasera antes de que alguien del Zoco Sur se pregunte por el ruido; tras ellos queda un portón con el diente partido y un charco que nadie va a limpiar.`] },
    { label: `Terminar la misión primero y prometer volver`, e: { d: 1, flags: ['joren_promesa'] }, result: [
      `«Viven. No sé dónde. Pero viven. Y eso… eso es suficiente. Por ahora.»`,
      `Joren corta un trozo del cuero con el sello y lo cose dentro de su carcaj, sin una palabra. Zyr'thar lo mira hacerlo. «Voy a recordártelo», le dice. «Cuando te olvides.» Joren asiente. Es la promesa más larga que ha hecho en años.`] },
    { label: `Pedir ayuda a los Nómadas del Vacío`, hint: `Ayudan… a cambio de un favor.`, e: { d: 1, rep: { nomadas: 1 }, flags: ['joren_nomadas'] }, result: [
      `Un viejo sin nombre acepta guiarte por los planos de arena. A cambio, pedirá algo. Siempre piden algo.`,
      `Lo encuentran al anochecer, sentado junto a su camello, bebiendo té en un vaso sin asa. Escucha todo con la vista en el fuego, hace un único gesto con la cabeza y dice: «Cuando llegue la hora de cobrar, vas a saber que es esa.» Panchi se queja de que no han negociado nada. Joren responde que no hacía falta.`] },
  ] },
  IF(`joren_medinat`, [N(`Camino a la salida del Zoco Sur, Joren se detiene frente a un mapa pintado en la pared de una casa. Pone el dedo sobre Medinat al-Rih y lo deja ahí, sin mover la mano, durante un rato largo.`)]),
  IF(`joren_promesa`, [N(`Joren pasa junto a un puesto de herreros y compra, sin regatear, una aguja gruesa de cuero y hilo encerado. Zyr'thar le sostiene la bolsa y no pregunta para qué.`)]),
  IF(`joren_nomadas`, [N(`El viejo sin nombre ya los espera junto al camello, a la salida. No dice nada de lo que va a cobrar. Se limita a acomodar la silla y a mirar el cielo como si el cielo se lo hubiera dicho todo.`)]),
  N(`Salen a la calle con el manifiesto doblado en el bolsillo de Joren. Panchi, por su parte, ha encontrado entre los cajones una horma de queso con forma de camello y la lleva bajo el brazo como un trofeo.`),
  S(`Panchi`, `Es botín. Lo confisco. Después lo discutimos.`),
  S(`Zyr'thar`, `Es queso, Panchi.`),
  S(`Panchi`, `Es queso con forma de camello. Ya hay jerarquía.`),
  FX({ flags: ['q_p_joren', 'gancho_medinat'] }, `Arco de Joren Hell (1/3): El Manifiesto de La Marca.`),
];

const P_ZYR: Node[] = [
  T(`Los Cuchillos de Vel'Shara`, `Arco de Zyr'thar · La Traición de la Casa`, `zoco`),
  N(`En el Zoco hay una manera de caminar que Zyr'thar reconocería entre mil: el peso sobre el borde externo del pie, los hombros quietos, la cabeza girando sólo un cuarto. La está imitando alguien a veinte puestos de distancia. Zyr'thar ni siquiera se da vuelta.`),
  S(`Zyr'thar`, `No miren. Un drow de capucha larga, junto al puesto de frascos. Nos vio hace rato, a través de las esferas de cristal.`, `sin mover los labios`),
  S(`Panchi`, `¿Lo agarramos?`),
  S(`Zyr'thar`, `No. Es conmigo. Esperen acá y no se acerquen.`),
  N(`La siguen por un pasadizo entre toldos, donde la luz es de aceite violeta y los vendedores de órganos de djinn dejan de pregonar. La espía se detiene al final, en un patio sin salida, y se baja la capucha. Es una chica de veinte años a lo sumo, con las cejas pintadas y un anillo de plata en la oreja izquierda. En el cinto, un cuchillo de hoja corta y empuñadura gastada con una inicial grabada.`),
  S(`Espía de Vel'Shara`, `Lo hice yo misma. Lo copié del tuyo. Me dijeron que lo dejaste en la Casa cuando te fuiste, y que nadie se atrevió a tocarlo durante nueve años. Yo lo toqué. Me castigaron seis días.`, `con orgullo y miedo mezclados`),
  S(`Zyr'thar`, `Lo dejé porque era malo.`, `cínica`),
  S(`Espía de Vel'Shara`, `La Casa Vel'Shara no olvida, Zyr'thar. No olvida. No perdona. No muere.`, `sin elevar la voz`),
  N(`En la mano izquierda, la chica sostiene una esfera de cristal del tamaño de una ciruela. Late con una luz amarillenta. Cualquier cosa que se diga delante de ella la oye alguien más, en otro lugar, con paciencia.`),
  S(`Zyr'thar`, `La esfera. Si hablamos, escucha la mayor.`, `por lo bajo, a los demás`),
  S(`Joren Hell`, `Rompela.`),
  S(`Zyr'thar`, `No. Todavía no. Que oiga lo que quiera. Me toca decidir qué.`),
  { t: 'battle', enc: 'zyr' },
  N(`La espía queda de rodillas sobre las baldosas, sin arma, con el brazo sangrando bajo la manga. La esfera rueda por el suelo y se detiene contra el zapato de Panchi, que la pisa sin querer. Todavía brilla.`),
  S(`Espía de Vel'Shara`, `Hacelo. Es lo que se hace. Si volvés sin tu cuchillo, no volvés.`, `mirando el suelo`),
  N(`Zyr'thar la mira durante un largo rato. Panchi se rasca la oreja y mira al cielo; Joren se retira discretamente hasta la entrada del pasadizo. Nadie dice nada. Hay, entre las dos mujeres, algo que a ninguno le corresponde interrumpir.`),
  { t: 'choice', prompt: `La espía yace de rodillas. Aún respira.`, options: [
    { label: `Eliminarla`, hint: `Sin rastro.`, e: { c: 2, flags: ['zyr_eliminada'] }, result: [
      `Un cuchillo, un silencio. La Casa tardará en enterarse.`,
      `Zyr'thar aplasta la esfera bajo el talón, y la luz amarilla se apaga con un chasquido de vidrio. Recoge del suelo el cuchillo copiado con la inicial gastada y lo guarda en su cinto, entre los suyos, sin explicar nada. Panchi no vuelve a hacer una broma hasta pasar el siguiente puesto.`] },
    { label: `Interrogarla`, hint: `Justicia y datos.`, e: { d: 1, pf: 2, flags: ['zyr_info'] }, result: [
      `Habla de otros tres espías en Zaryab, de un contrato firmado en una torre y del nombre de la matriarca: Vel'Shara-Kael.`,
      `Joren anota los nombres en el reverso del manifiesto sin que nadie se lo pida. Cuando la chica termina, Zyr'thar le pasa un pañuelo para el brazo y le devuelve, sin mirarla, el cuchillo copiado. «Está mal balanceado. Fundilo y hacete otro», dice. La espía no sabe si le acaban de perdonar la vida o de dar un consejo.`] },
    { label: `Dejarla ir con un mensaje`, hint: `Más espías vendrán. Pero ganan tiempo.`, e: { alert: 1, flags: ['zyr_mensaje'] }, result: [
      `«Digan a la Casa que ya no me hace falta pedir permiso.» La espía desaparece. Algo, en la sombra de Zyr'thar, parece sonreír.`,
      `Zyr'thar levanta la esfera con dos dedos y se la pone a la altura de los ojos para decirlo despacio, sílaba por sílaba, a quien esté del otro lado. Después se la devuelve a la chica. En la salida del pasadizo, la espía se detiene un segundo, deja su cuchillo copiado en el suelo y se va sin recogerlo.`] },
  ] },
  IF(`zyr_eliminada`, [N(`Joren barre los restos de la esfera con el pie hasta una alcantarilla. Es la manera que tiene de decir que lo del patio quedó entre ellos.`)]),
  IF(`zyr_info`, [N(`Panchi lleva a la chica, con el brazo vendado, hasta la puerta oriental del Zoco, y la despide sin ceremonia. Ella se vuelve una sola vez, para mirar a Zyr'thar. Zyr'thar no le devuelve la mirada.`)]),
  IF(`zyr_mensaje`, [N(`En el cielo de la tarde un pájaro de papel se eleva desde un tejado del Zoco y toma rumbo al norte. Zyr'thar lo sigue con la vista hasta que se pierde. «Ya sabe», dice. «Ahora, a esperar.»`)]),
  BG(`zoco`),
  N(`Vuelven por el Zoco entre puestos que ya retomaron el pregón. Zyr'thar camina un poco más lenta que antes. Panchi la alcanza.`),
  S(`Panchi`, `Mis puños tienen nombre. Izquierdo y Peor. ¿El cuchillo tenía?`),
  S(`Zyr'thar`, `Los cuchillos no tienen nombre.`, `casi sonriendo`),
  S(`Panchi`, `Entonces se lo pongo yo. Dolores. Con ese chiste ya no puede matar a nadie.`),
  S(`Zyr'thar`, `Panchi.`),
  S(`Panchi`, `¿Qué?`),
  S(`Zyr'thar`, `Gracias por no preguntar.`),
  FX({ flags: ['q_p_zyr'] }, `Arco de Zyr'thar (1/3): Los Cuchillos de Vel'Shara.`),
];

const P_PANCHI: Node[] = [
  T(`El Golem Defectuoso`, `Arco de Panchi · La Ira del Monje`, `choza`),
  N(`Hay un golpe seco y regular contra la pared de la biblioteca, desde antes del amanecer. Apu, con la escoba como lanza, vigila desde la escalera. Cabernet se ha escondido detrás de un barril de vino sin alcohol. Aisha, sentada con los brazos cruzados, calcula cuántos estantes quedan en pie.`),
  N(`Entre los anaqueles, un golem de arcilla y runas violetas golpea las paredes sin parar. Se mueve de forma espasmódica. Está roto. Está enojado. Está solo.`),
  S(`Aisha`, `Llegó anoche. No tocó a nadie. Pero rompió lo que rompe, y no para.`),
  N(`Panchi baja la escalera con los puños apretados, listo para pelear con lo que fuera. Se detiene al pie de los escalones. Mira las runas de la frente del golem, y por un momento no respira.`),
  S(`Rabb Locke`, `¿Lo conocés?`),
  S(`Panchi`, `No. Sí. Son runas del monasterio. Nadie más las escribe así. Nadie más tiene la paciencia.`, `gruñendo`),
  S(`Golem`, `Alumno. Alumno. Puerta. Alumno. Puerta.`, `con un chirrido de piedra contra piedra`),
  N(`Panchi traga saliva. El golem gira la cabeza con un crujido y lo mira con ojos de cuarzo opaco. Se queda quieto.`),
  S(`Golem`, `Alumno. Puerta. Esperar.`),
  S(`Panchi`, `Mi maestro lo dejó de guardia. Es lo último que hizo antes de que se cayera la torre. «Quedate en la puerta hasta que vuelva el alumno». Y vino hasta acá, el boludo, atravesando el desierto. Siguió el rastro.`, `casi sin voz`),
  S(`Joren Hell`, `Ahora está roto.`),
  S(`Panchi`, `Hace mucho que está roto. Le faltó quien lo reparara.`),
  N(`El golem vuelve a golpear la pared, una vez, suave, como quien llama a una puerta que sabe cerrada. Panchi lo mira largo rato, con la mandíbula tensa.`),
  S(`Panchi`, `Vos... vos sos como yo. Roto. Enojado. Solo. Vení. Luchemos. O seamos amigos. O ambas.`, `con los puños apretados`),
  { t: 'choice', prompt: `¿Qué hacen con el golem?`, options: [
    { label: `Desmantelarlo y extraer su núcleo`, hint: `Combate. Un núcleo de energía.`, e: { pf: 3, flags: ['nucleo_golem'] }, result: [`Panchi se lanza sin pensar.`], then: [
      { t: 'battle', enc: 'panchi' },
      N(`Cuando el golem cae, ya no golpea ninguna pared. Panchi se arrodilla entre los trozos de arcilla y mete las manos hasta encontrar el núcleo: una esfera de cobre del tamaño de un puño, todavía caliente.`),
      S(`Golem`, `Puerta... alumno... cerrada.`, `la última voz, entrecortada`),
      N(`Panchi aprieta el núcleo contra el pecho unos segundos y se pone de pie sin mirar a nadie. Apu deja la escoba contra la pared. Aisha busca una escoba nueva, y en lugar de la palabra que le sube a la boca, le pone un plato de sopa delante.`),
    ] },
    { label: `Redirigir su ira contra enemigos`, hint: `Ayudará en el próximo combate.`, e: { flags: ['golem_prestado'] }, result: [
      `Panchi grita una orden. El golem gira la cabeza con un crujido. «Tu enemigo no soy yo», parece decir.`,
      `«La puerta ya no está acá», le explica Panchi, hablando despacio. «La puerta somos nosotros. Guardala.» El golem se planta frente a la entrada de la biblioteca y se queda así, inmóvil y firme. Apu le alcanza su escoba, muy serio. El golem la sostiene con una mano de arcilla y no la suelta.`] },
    { label: `Controlarlo (golem permanente)`, hint: `+1 Corrupción y un golem en cada combate.`, e: { c: 1, flags: ['golem_aliado'] }, result: [
      `Una runa nueva en la frente del golem. Obedece. Panchi no lo mira a los ojos.`,
      `Desde ahora el golem no dice «alumno». Dice «obedezco», con una voz más limpia y mucho peor. Aisha le saca el polvo a un estante, sin una palabra. Cabernet sale por fin de detrás del barril, mira la runa, y se vuelve a esconder.`] },
  ] },
  IF(`golem_aliado`, [N(`La runa nueva en la frente del golem brilla con un violeta limpio. Panchi pasa tres veces frente a ella en la noche, sin mirarla; a la cuarta se detiene un segundo. Aisha lo ve, y decide no ver.`)]),
  IF(`golem_prestado`, [N(`El golem se mantiene firme junto a la puerta con la escoba de Apu en la mano. Los vecinos que pasan cruzan de acera sin dejar de mirarlo. Uno le deja una moneda en el suelo, por las dudas.`)]),
  BG(`choza`),
  N(`Esa noche, Apu se sienta junto a Panchi en la escalera con dos tazones de sopa.`),
  N(`«Yo también tengo mal genio», dice Apu sin mirarlo. «No te creas único.»`),
  S(`Panchi`, `Vos tenés mal genio con las puertas. Yo con todo.`),
  N(`«Con las puertas», repite Apu, mojando el pan. «Ahí empieza.» Comen sin hablar. Es el primer silencio de Panchi en la biblioteca que no es de rabia.`),
  N(`Más tarde, cuando todos duermen, Panchi se sienta solo frente a la puerta de la biblioteca con las rodillas contra el pecho. Aisha le deja una manta sobre los hombros sin despertarlo del todo. Por primera vez en meses, Panchi no aprieta los puños mientras duerme.`),
  FX({ flags: ['q_p_panchi'] }, `Arco de Panchi (1/3): El Golem Defectuoso.`),
];

// ═══════════════════════════ SECUNDARIAS ═══════════════════════════

const S_LAGO: Node[] = [
  T(`El Precio de la Salvación`, `Lago de los Silencios · el milagro que envenena`, `cubo`),
  N(`Aisha extiende un mapa sobre la mesa larga, con las puntas sujetas por tazas. Son los túneles de los Hijos del Simurg, dibujados a carbonilla por alguien que los recorrió de rodillas. Farid, desde el fondo, tose una sola vez y todos lo escuchan.`),
  S(`Aisha`, `Allí enfermó Farid. Allí enferman todos. Si hay una manera de que no vuelva a pasar, quiero saberla.`, `sin levantar la vista del mapa`),
  N(`Las cuevas están llenas de criaturas, y por eso la gente no se mete: un escondite perfecto contra el Conclave. En las paredes del primer tramo hay dibujos de tiza hechos por manos muy chicas: un sol, un pájaro, tres rayas por cada día que alguien se quedó. Romain pasa los dedos por las rayas y no dice cuántas son.`),
  N(`En un recodo, un hombre yace con el pecho abierto de arañazos. Es Shib, de los Hijos del Simurg. Respira apenas.`),
  { t: 'choice', prompt: `Shib los mira sin ver. Aún vive.`, options: [
    { label: `Curar a Shib con magia`, hint: `Gastan tiempo y fuerzas, pero un aliado vive.`, e: { d: 1, rep: { hijos: 1 }, flags: ['shib_curado'] }, result: [
      `Shib tose, escupe arena y sonríe: «Alguien con una luz de verdad.» Les cuenta de las criaturas de las cuevas y de por qué nadie baja aquí.`,
      `Romain le limpia las heridas con agua de su cantimplora mientras Shib habla sin parar, como si el miedo le hubiera abierto una canilla. Cuando termina, camina solo hasta la salida del túnel, se sacude el polvo de la túnica y los guía.`] },
    { label: `Dejarlo: la misión es lo primero`, e: { c: 1, rep: { hijos: -1 } }, result: [
      `Pasan de largo. Detrás, un hilo de voz: «…no… me dejen…»`,
      `Nadie dice nada hasta el siguiente recodo, donde Romain se detiene un segundo, con la mano en la pared. Zyr'thar le pone una mano en el hombro y lo empuja suave hacia adelante. Del túnel sigue viniendo el eco, cada vez más tenue.`] },
  ] },
  N(`El Lago de los Silencios es un cráter de cristal negro donde el agua refleja el cielo al revés. En el centro, una rama negra imposible de arrancar: la Lengua Muerta. Alguien ha grabado en su corteza el sello del Conclave. A los pies de la rama, medio hundido en el barro de la orilla, hay un zapato de niño.`),
  S(`Voz`, `Quien bebe de este lago olvida su nombre… pero gana el don de entender a los djinns.`, `un eco bajo el agua`),
  N(`Algo se mueve bajo la piel de la arena. La superficie del lago se arruga en círculos que no vienen de ningún viento.`),
  { t: 'battle', enc: 'lago' },
  N(`Cuando todo se aquieta, la rama sigue latiendo bajo las manos de Romain. Al examinarla de cerca, ven que no es una planta: es un conducto alquímico, una trampa espiritual con raíces de cobre, y en su base hay una lista grabada a punzón. Nombres de niños. Al lado de cada uno, una marca. Entre los nombres está el de Farid.`),
  S(`Zyr'thar`, `«Porosos.» Eso dice al lado. Los que oyen a los djinns. El Conclave los marca desde chicos y los hace beber de acá hasta que ya no oyen nada, o hasta que ya no están.`),
  S(`Romain`, `Hicieron enfermar a los niños para que dejaran de escuchar.`, `con la voz quebrada`),
  { t: 'choice', prompt: `La rama negra late bajo sus manos. Es un conducto alquímico: una trampa espiritual que marca a los niños «porosos».`, options: [
    { label: `Arrancar la rama y purificar el agua`, hint: `El Lago dejará de envenenar.`, e: { d: 1, pf: 4, rep: { hijos: 1 }, flags: ['lago_purificado', 'remedio_veneno'] }, result: [
      `La rama grita sin voz. El agua se aclara. Aprenden a preparar un remedio contra el veneno del Pozo.`,
      `Cuando las raíces de cobre se aflojan, el cielo reflejado en el lago se endereza, y por primera vez se ve el agua tal cual es: poco profunda, tibia, con peces ciegos. Panchi se agacha a tocarla con un dedo. «Es agua», dice, casi decepcionado.`] },
    { label: `Quemarla: que el Conclave sepa que hemos estado aquí`, hint: `Humo visible a leguas.`, e: { c: 1, alert: 1, flags: ['lago_quemado'] }, result: [
      `El humo violeta se ve desde el Bajo Zaryab. Las campanas del Conclave no tardan en sonar.`,
      `La rama arde con un olor a medicina vieja. Joren se queda mirando cómo se enrosca el humo contra el techo de cristal. «Lo van a oler hasta la Ciudadela», dice. «Eso es lo que querés.» No es una pregunta, y nadie la contesta.`] },
    { label: `Llevarse un trozo como prueba contra el Conclave`, hint: `Una prueba vale más que mil sermones.`, e: { pf: 2, rep: { hijos: 1, conclave: -1 }, flags: ['prueba_rama', 'remedio_veneno'] }, result: [
      `Cortan una astilla negra. Pesa como un hueso. Si Aisha la ve, tendrá su venganza con pruebas.`,
      `Zyr'thar copia la lista de nombres en un pliego antes de que Pact tape la rama con su capa. Si el Conclave vuelve, va a encontrar el conducto intacto y ninguna sospecha. Si no vuelve, les queda una evidencia que se puede enseñar a un tribunal o a una turba.`] },
  ] },
  N(`Un resplandor tenue guía a los sobrevivientes del túnel hacia la salida. Los esperan allí los Hijos del Simurg: cinco o seis, con túnicas del color de la arena y los pies descalzos. Delante de ellos, una mujer ciega con un bastón de hueso.`),
  IF(`shib_curado`, [
    S(`Shib`, `Los llevaré al líder de los Hijos. Pero que quede claro: nosotros no adoramos a un djinn, adoramos a lo que el Simurg fue.`, `a la cabeza del grupo`),
  ], [
    S(`Shib`, `Llegué hasta acá solo, arrastrándome. No lo olvido. Pero los llevo igual, porque ahí atrás había chicos. Que quede claro: nosotros no adoramos a un djinn, adoramos a lo que el Simurg fue.`, `con el brazo en cabestrillo, sin mirar a Romain`),
  ]),
  N(`La mujer ciega, a la que los demás llaman la Madre del Pozo, escucha toda la historia con el rostro vuelto hacia el lago, aunque no lo pueda ver.`),
  S(`Voz`, `Les creo. Lo que no sé es qué quieren de nosotros. Los que bajan hasta acá siempre quieren algo.`, `la Madre del Pozo, con calma`),
  { t: 'choice', prompt: `Los Hijos del Simurg escuchan su historia.`, options: [
    { label: `Convertirlos a la fe del culto`, hint: `Un seguidor es un latido más en el cristal.`, e: { pf: 5, rep: { hijos: 2 }, follow: ['Shib'], flags: ['hijos_convertidos'] }, result: [
      `El líder de los Hijos arrodilla a los suyos. Shib hace de enlace y pasa a vivir en la biblioteca.`,
      `Los Hijos repiten las palabras que Romain les enseña, una a una, con una devoción que a Romain le cuesta sostener con la mirada. Esa noche, el cristal late más fuerte que de costumbre, y Aisha cuenta tres catres nuevos en el depósito.`] },
    { label: `Ofrecer una alianza entre iguales`, e: { d: 1, rep: { hijos: 2 }, follow: ['Shib'], flags: ['hijos_aliados'] }, result: [
      `«La arena cubrirá las cadenas», dice el líder. Les abre sus túneles secretos.`,
      `La Madre del Pozo les da un mapa distinto al de Aisha, mucho más viejo, con pasadizos que llegan hasta la Ciudadela. A cambio pide sólo una cosa: que cuando nazca otro niño poroso, alguien baje a avisarle antes de que lo marque el Conclave. Shib hace de enlace y pasa a vivir en la biblioteca.`] },
  ] },
  FX({ flags: ['q_s_lago'] }, `Misión cumplida: El Precio de la Salvación.`),
];

const S_TE: Node[] = [
  T(`El Té Envenenado`, `Jardín de los Suspiros · la fiesta de las máscaras`, `espejos`),
  N(`EaNassr les entregó un frasquito de vidrio verde y una sonrisa. «Para los suministros de Lady Nafisa. Sin preguntas.» Los dejó en la entrada del Jardín de los Suspiros antes de que pudieran preguntar.`),
  N(`La fiesta de máscaras ya empezó. Los nobles intercambian rostros con djinns menores y sirven un té de luna negra que permite soñar con ganancias futuras. Hay faroles de papel colgados de los cipreses y mesas con manteles bordados.`),
  { t: 'choice', prompt: `¿Cómo entran?`, options: [
    { label: `Con invitaciones robadas y máscaras`, hint: `Entran por la puerta grande.`, result: [
      `Las máscaras les sientan bien: nadie los mira dos veces. «Todos mienten. Es lo que hace Zaryab interesante.»`,
      `Rabb se ha puesto una máscara de zorro, Zyr'thar una de ave blanca. A Panchi le toca una pequeña, de gato, que le queda como un pañuelo. Los nobles lo miran con tanta curiosidad que Romain se ve obligado a explicar que es «un pariente del interior».`] },
    { label: `Por el jardín, entre los cipreses`, hint: `Las rosas translúcidas tienen hambre.`, e: { alert: 1 }, result: [
      `Los cipreses podados como manos gigantes parecen cerrarse a su paso.`,
      `A mitad del sendero, las rosas translúcidas se abren hacia ellos con un goteo de néctar y un zumbido que no es de abeja.`], then: [{ t: 'battle', enc: 'te' }] },
  ] },
  S(`Lady Nafisa`, `¿Les gusta mi fiesta? Todos llevan máscaras. Todos mienten. Es lo que hace Zaryab interesante.`, `coqueta, peligrosa`),
  S(`Vizir Razul`, `¿Creyeron que un nido de ratas amenazaría mi ciudad? El Simurg los devorará…`, `un espejismo flotando entre los invitados`),
  N(`El espejismo del Vizir se desvanece sin que nadie, salvo ustedes, parezca verlo. Detrás de los canapés descubren la verdad: el té no está envenenado por nadie… salvo por la propia Nafisa, que ha decidido que dos invitados de la mesa de honor no volverán a hablar.`),
  N(`Rabb se acerca a la mesa de los postres con la excusa de un hojaldre. Vuelve con tres bocados y un dato: los criados de Nafisa cambian de bandeja cada vez que uno de los ingenieros pide agua. No es cortesía. Es vigilancia.`),
  S(`Rabb Locke`, `Les traen té y les quitan el vaso de agua. Saben lo que hacen.`, `masticando`),
  S(`Zyr'thar`, `Mirales las manos. Las uñas llenas de cal. Esos dos no son nobles: son ingenieros. Los de los acueductos.`, `con la copa vacía en la mano`),
  S(`Rabb Locke`, `¿Y por qué querría callar a dos ingenieros?`),
  S(`Zyr'thar`, `Porque hablan dormidos. Del río que taparon. Alguien le tiene miedo a lo que cuentan.`),
  N(`En la mesa de honor, uno de los hombres se rasca la nuca con una mano que tiembla. El otro no deja de mirar el fondo de su copa. Nafisa los atiende personalmente, con una sonrisa generosa, y se prepara para servirles de su propia tetera.`),
  { t: 'choice', prompt: `La copa de Lady Nafisa espera.`, options: [
    { label: `Envenenar los suministros según el pedido de EaNassr`, hint: `Cumplir el contrato sin preguntar.`, e: { c: 2, alert: 1, rep: { mercaderes: 1 }, flags: ['nafisa_envenenada'] }, result: [
      `Mezclan el polvo en el té. Cuando Lady Nafisa sonríe, ya es tarde.`,
      `Los dos ingenieros beben, uno por cortesía y el otro por miedo, y a la media hora los encuentran dormidos sobre el mantel, con un hilo de saliva verde en la comisura. Nafisa sabe que ese veneno no es suyo, y sabe de quién es. Esa noche Panchi no prueba bocado de lo que sirven, y Romain no mira a nadie.`] },
    { label: `Sustituir el té envenenado`, hint: `Que la envenenadora beba su propia medicina.`, e: { c: 1, pf: 3, flags: ['nafisa_en_deuda'] }, result: [
      `Intercambian las copas. Nafisa dormirá un día entero y tendrá que explicar por qué su té mareaba a los invitados.`,
      `Los ingenieros, ilesos, se van de la fiesta con la excusa de un dolor de cabeza. Nafisa cae sobre un diván, aún sonriendo, y los criados la rodean sin entender. Cuando despierte, sabrá quién le debe y quién le debe a quién.`] },
    { label: `Exponer la conspiración ante los nobles`, hint: `Su palabra contra una máscara.`, e: { d: 1, pf: 4, rep: { conclave: -1 }, flags: ['nobles_aliados', 'info_razul'] }, result: [
      `Los nobles se quitan las máscaras uno a uno. Alguien, entre susurros, les pasa un pliego con los nombres que Razul vigila.`,
      `Romain sube a una silla y dice, sin gritar, lo que vieron. Nafisa palidece y calla; los ingenieros, rescatados de su propia tetera, miran a los nobles como animales que se acaban de dar cuenta de que no los van a comer. Zyr'thar deja el pliego bajo una copa antes de que la guardia aparezca.`] },
  ] },
  N(`Antes de irse, Romain se detiene junto a uno de los ingenieros, que sigue sentado con la copa intacta. El hombre levanta la mirada. Tiene las uñas rotas, las manos de albañil. Habla en voz tan baja que sólo Romain lo oye.`),
  S(`Romain`, `¿Qué dijo? ¿Qué cuenta cuando duerme?`, `inclinándose a su altura`),
  N(`El ingeniero traga saliva antes de contestar: «Que el río todavía está ahí abajo. Que lo tapamos con cal y piedra, y que a veces, de noche, se oye pensar.»`),
  N(`Salen del jardín entre aplausos y murmullos, o entre silencios, según. Rabb se baja la máscara de zorro y la guarda en el bolsillo.`),
  S(`Rabb Locke`, `Me gustó la fiesta. Me gustó menos cómo terminó.`),
  S(`Panchi`, `A mí me gustó el pastel.`),
  FX({ flags: ['q_s_te'] }, `Misión cumplida: El Té Envenenado.`),
];

const M_JUICIO: Node[] = [
  T(`El Juicio del Pueblo`, `Bajo Zaryab · una soga`, `bajo`),
  N(`Un tumulto llena la calle. Una soga cuelga del arco del acueducto, y debajo, parado sobre un cajón, hay un guardia del Conclave atado, con la cara hinchada a golpes y la casaca sin botones. Los vecinos lo rodean en silencio. Nadie grita. Eso es lo que más inquieta.`),
  N(`Aisha está al fondo, con los brazos cruzados sobre el delantal. No dice nada. No mira a los forasteros.`),
  S(`Vecina`, `Se llevó a mi marido hace tres años. Nunca volvió. Le pedí que me dijera dónde estaba. Se rio. Hoy se ríe menos.`, `sin elevar la voz`),
  S(`Guardia`, `Yusuf. Se llamaba Yusuf, el zapatero. Me acuerdo. Había una lista, yo sólo la firmaba. No fui yo quien lo mató.`, `con la lengua hinchada`),
  S(`Vecina`, `Recordás el nombre. Qué bien.`),
  N(`Un chico de ocho años, subido a una barrica, sostiene la punta de la soga con las dos manos. No sabe para qué. Alguien se lo pidió, y le gustó que le pidieran algo.`),
  S(`Zyr'thar`, `Si lo cuelgan, es uno menos. Si lo sueltan, es uno más. Hacé las cuentas que quieras.`, `a media voz`),
  S(`Romain`, `No hay cuenta. Hay un hombre.`),
  S(`Pact Risen`, `Y hay una viuda. Y un chico con una soga.`, `en voz muy baja`),
  S(`Guardia`, `Tengo un hijo de seis años. Si me cuelgan, que sepa que me llamaba Tarek y que firmé listas porque me daban pan por firmar. No es excusa. Es lo que hubo.`, `mirando por fin a Romain`),
  N(`Un viejo del fondo escupe al suelo. Una mujer se tapa la boca con el borde del chal. En el arco, la soga se mece sola, con un chirrido leve de cáñamo viejo.`),
  S(`Joren Hell`, `Tres años. Se acuerda de todo.`, `seco`),
  N(`Todos los ojos del barrio están puestos en ustedes. Alguien, entre la gente, grita por fin: «¡Díganle que sí!». Y alguien más, mucho más bajo: «Por favor, díganle que no».`),
  { t: 'choice', prompt: `Los aldeanos esperan una señal.`, options: [
    { label: `Dejar que lo ejecuten`, hint: `+2 Corrupción, +1 PF; el barrio se une al culto.`, e: { c: 2, pf: 1, recruits: 2, flags: ['juicio_ejecutado'], echo: [{ id: 'eco_juicio_ejecutado', in: 4 }], huella: 'Dejaron que colgaran a un guardia sin juicio.' }, result: [
      `La soga se tensa. Nadie vitorea. Luego dos vecinos se arrodillan ante el altar.`,
      `El cajón cae. La vecina no mira. El chico de la barrica suelta la punta y se queda con las manos abiertas, como si no supiera dónde ponerlas. Aisha da media vuelta y se va sin mirar a nadie. Romain se queda hasta el final, solo, rezando una oración corta por el que cuelga y otra, más larga, por los que lo colgaron.`] },
    { label: `Salvarlo`, hint: `+2 Devoción, el barrio desconfía.`, e: { d: 2, rep: { hijos: -1 }, flags: ['juicio_salvado'], echo: [{ id: 'eco_juicio_salvado', in: 3 }] }, result: [
      `Cortan la soga. La vecina escupe en el suelo y se va sin mirar atrás.`,
      `Joren lo sostiene antes de que caiga y Pact le desata las manos. El guardia llora sin ruido, y por primera vez en tres años alguien le dice «gracias» sin entenderlo. Los vecinos retroceden, uno por uno, y esa noche en la puerta de la biblioteca aparece una pintada con una palabra que nadie lee en voz alta.`] },
    { label: `Juzgarlo con justicia`, hint: `Intimidar CD 14 para imponer el juicio. +1 Devoción, +1 Corrupción.`, check: { skill: 'intimidar', dc: 14 }, e: { d: 1, c: 1, rep: { hijos: 1 }, recruits: 1, flags: ['juicio_justo'], huella: 'Presidieron el juicio del guardia: ni soga ni indulto, sino verdad.' }, result: [
      `Cada vecino declara. El guardia confiesa catorce nombres. Lo entregan al Conclave con la lista. El barrio respeta el método, aunque no el resultado.`,
      `Cuando termina, la vecina se acerca al guardia, le mira la cara de cerca y dice un nombre: «Yusuf». El guardia asiente. Es la única justicia que le va a tocar. Aisha, desde el fondo, se desata el delantal y empieza a repartir pan.`], fail: { e: { c: 1 }, result: [
      `El tumulto los supera. Lo cuelgan igual, mientras gritan.`,
      `Romain intenta decir algo, pero ya nadie escucha. La soga se tensa en medio de un clamor que, por fin, es ruido de verdad. Cuando termina, la vecina llora sin que nadie sepa si es alivio o duelo, y ustedes se quedan en el borde de la plaza con la sensación de que alguien les robó una decisión que era suya.`] } },
  ] },
  BG(`bajo`),
  N(`Cae la noche sobre el Bajo Zaryab. En la plaza del acueducto quedan una soga, un cajón y un charco de cera de velas que nadie encendió. Aisha pasa por la biblioteca sin saludar y deja sobre la mesa la ración de sopa de todos, aunque llega tarde, y se va. Pact se queda mirando el plato sin probarlo.`),
  S(`Pact Risen`, `¿Cuántos juicios hizo Azuran? No lo recuerdo. Pero creo que no dormía las noches siguientes.`),
  S(`Zyr'thar`, `Nadie duerme. Los que duermen bien son los que no tuvieron que decidir.`),
  FX({ flags: ['q_m_juicio'] }, `Misión cumplida: El Juicio del Pueblo.`),
];

const S_NINOS: Node[] = [
  T(`Niños y Escorpiones`, `Bajo Zaryab`, `bajo`),
  N(`Los niños del barrio juegan con escorpiones de obsidiana domesticados. Los llevan en los hombros, en las gorras, en los bolsillos de los delantales. Hacen carreras en el callejón y apuestan botones. Hoy, tres guardias los han acorralado contra una pared «para cobrar impuestos».`),
  S(`Niño`, `¡No son peligrosos! ¡Sólo pican cuando les gritan!`, `asustado, con un escorpión en el hombro`),
  S(`Guardia`, `Impuesto de tenencia de bestias. Cinco monedas por cabeza. Cuenten los bichos y cuenten los niños, que a esos también los cobramos.`, `leyendo de una tablilla`),
  N(`Zyr'thar se agacha junto al muro y examina la tablilla del guardia desde la altura de un niño. Después se levanta, con la cara de quien acaba de encontrar la trampa en un juego.`),
  S(`Zyr'thar`, `No tiene sello. No hay ningún impuesto de tenencia en Zaryab. Esto es un cobro particular.`, `a media voz`),
  S(`Niño`, `Mi mamá dice que cuando vienen a cobrar sin sello es porque ya cobraron todo lo demás.`),
  N(`Los otros niños, siete u ocho, se han ido apiñando detrás del primero. La más chica, de unos cuatro años, sostiene entre las dos manos una caja de zapatos con agujeros. Dentro algo raspa con paciencia.`),
  S(`Niño`, `Ésa es la reina. Se llama Doña Rosa. Si se asusta, se pone brava.`, `señalando la caja con el mentón`),
  S(`Romain`, `Capitán, el barrio no tiene dinero. Pídanlo a quien se lo pueda dar.`, `adelantándose un paso, las manos a la vista`),
  S(`Guardia`, `Pídaselo al Vizir. Yo sólo cobro. Y los que se meten en un cobro pagan también.`, `sin dejar de mirar la tablilla`),
  N(`Un escorpión del tamaño de un puño trepa por la manga del niño y se queda mirando a los guardias con la cola alzada. Panchi se pone entre los guardias y la pared sin darse cuenta de que lo hace.`),
  { t: 'choice', prompt: `¿Qué hacen?`, options: [
    { label: `Pagar a los guardias para que se vayan`, hint: `−3 PF`, e: { pf: -3, alert: 0 }, result: [
      `Los guardias cuentan las monedas y se van riendo. Los niños no los miran.`,
      `Cuando el último guardia desaparece al fondo del callejón, los escorpiones bajan los aguijones. El niño del hombro guarda su bicho en el bolsillo y mira a Panchi, que se ha puesto muy interesado en una grieta de la pared. Nadie dice «gracias». Pero esa tarde, alguien deja un platito de dátiles en la puerta de la biblioteca.`] },
    { label: `Defender a los niños (los escorpiones lucharán a su lado)`, hint: `Combate con aliados.`, e: { d: 1, alert: 1, flags: ['ninos_defendidos'] }, result: [
      `Los escorpiones se erizan. El barrio entero los mira desde las ventanas.`,
      `Panchi cruje los nudillos. Los niños se esconden detrás de los barriles con sus escorpiones, que se adelantan como una guardia pequeña y furiosa. En cada ventana aparece una cara.`], then: [
      { t: 'battle', enc: 'ninos' },
      N(`Los guardias salen corriendo por el callejón, uno de ellos con un escorpión colgando de la bota. Detrás, los niños gritan y aplauden. Alguien abre una ventana y lanza un puñado de flores secas.`),
      FX({ pf: 3, follow: ['Los niños del barrio'], rep: { hijos: 1 } }, `Los niños dibujan el ojo del Simurg en las paredes.`),
      S(`Niño`, `¿Vamos a ser un culto de verdad? Yo quiero ser el que cuida la puerta.`, `con un escorpión trepado a la cabeza`),
      S(`Panchi`, `Hay lista de espera para eso.`, `gruñendo, con una media sonrisa`),
    ] },
  ] },
  BG(`bajo`),
  N(`Por la tarde, en el patio de la biblioteca, Aisha reparte pan a los niños y a sus escorpiones, que se reparten en cajas de cartón junto a la pared. La más chica, la de la caja de zapatos, se sienta en las rodillas de Romain sin pedir permiso y le muestra a Doña Rosa de cerca.`),
  S(`Aisha`, `Los chicos de este barrio aprenden pronto quién viene a cobrar. Lo que no aprenden es quién viene a ayudar. Ustedes les enseñaron una de las dos cosas.`, `sin levantar la vista de la olla`),
  IF(`ninos_defendidos`, [
    N(`Los niños han empezado a dibujar el ojo del Simurg con carbón en la pared del patio. Les sale chueco, con demasiadas pestañas. Pact, tras estudiarlo con mucha formalidad, pide que lo dejen así.`),
  ], [
    N(`Los niños no dibujan nada en la pared del patio. Comen, se miran, y el más grande vigila la calle desde el portón. Panchi se sienta a su lado, en silencio, hasta que anochece.`),
  ]),
  FX({ flags: ['q_s_ninos'] }, `Misión cumplida: Niños y Escorpiones.`),
];

export const DEEP: Record<string, Node[]> = {
  p_romain: P_ROMAIN, p_pact: P_PACT, p_rabb: P_RABB, p_joren: P_JOREN, p_zyr: P_ZYR, p_panchi: P_PANCHI,
  s_lago: S_LAGO, s_te: S_TE, m_juicio: M_JUICIO, s_ninos: S_NINOS,
};
