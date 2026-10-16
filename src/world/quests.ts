import type { Node } from '../story/types';
import type { Campaign, Effect } from '../state';
import { has } from '../state';
import { MORALES } from './morales';
import { CAP6 } from '../story/cap6';
import { CAP7, CAP8, CAP9, CAP10, CAP11, CAP12, CAP13 } from '../story/acts';
import { ACT2 } from './act2quests';
import { MAUNATOR } from '../story/maunator';
import { CAP0, CAP1, CAP2, CAP3, CAP4, CAP5 } from '../story/script';

export type QKind = 'main' | 'side' | 'personal' | 'faction';
export interface QuestDef {
  id: string; title: string; kind: QKind; district: string; giver: string; blurb: string;
  when: (c: Campaign) => boolean; days: number; next?: string; alert?: number; script: Node[]; reward: string; planned?: boolean; pc?: string;
}
const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const done = (id: string) => (c: Campaign) => has(c, id);

// ───────────────────────── Misiones secundarias ─────────────────────────
const S_LAGO: Node[] = [
  T('El Precio de la Salvación', 'Lago de los Silencios · el milagro que envenena', 'cubo'),
  N('Aisha os entrega el mapa de túneles de los Hijos del Simurg. «Allí enfermó Farid. Allí enferman todos.» Las cuevas están llenas de criaturas, y por eso la gente no se mete: un escondite perfecto contra el Conclave.'),
  N('En un recodo, un hombre yace con el pecho abierto de arañazos. Es Shib, de los Hijos del Simurg. Respira apenas.'),
  { t: 'choice', prompt: 'Shib os mira sin ver. Aún vive.', options: [
    { label: 'Curar a Shib con magia', hint: 'Gastáis tiempo y fuerzas, pero un aliado vive.', e: { d: 1, rep: { hijos: 1 }, flags: ['shib_curado'] }, result: ['Shib tose, escupe arena y sonríe: «Alguien con una luz de verdad.» Os cuenta de las criaturas de las cuevas y de por qué nadie baja aquí.'] },
    { label: 'Dejarlo: la misión es lo primero', e: { c: 1, rep: { hijos: -1 } }, result: ['Pasáis de largo. Detrás, un hilo de voz: «…no… me dejéis…»'] },
  ] },
  N('El Lago de los Silencios: un cráter de cristal negro donde el agua refleja el cielo al revés. En el centro, una rama negra imposible de arrancar: la Lengua Muerta. Alguien ha grabado en su corteza el sello del Conclave.'),
  S('Voz', 'Quien bebe de este lago olvida su nombre… pero gana el don de entender a los djinns.', 'un eco bajo el agua'),
  { t: 'battle', enc: 'lago' },
  { t: 'choice', prompt: 'La rama negra late bajo vuestras manos. Es un conducto alquímico: una trampa espiritual que marca a los niños «porosos».', options: [
    { label: 'Arrancar la rama y purificar el agua', hint: 'El Lago dejará de envenenar.', e: { d: 1, pf: 4, rep: { hijos: 1 }, flags: ['lago_purificado', 'remedio_veneno'] }, result: ['La rama grita sin voz. El agua se aclara. Aprendéis a preparar un remedio contra el veneno del Pozo.'] },
    { label: 'Quemarla: que el Conclave sepa que hemos estado aquí', hint: 'Humo visible a leguas.', e: { c: 1, alert: 1, flags: ['lago_quemado'] }, result: ['El humo violeta se ve desde el Bajo Zaryab. Las campanas del Conclave no tardan en sonar.'] },
    { label: 'Llevarse un trozo como prueba contra el Conclave', hint: 'Una prueba vale más que mil sermones.', e: { pf: 2, rep: { hijos: 1, conclave: -1 }, flags: ['prueba_rama', 'remedio_veneno'] }, result: ['Cortáis una astilla negra. Pesa como un hueso. Si Aisha la ve, tendrá su venganza con pruebas.'] },
  ] },
  S('Shib', 'Os llevaré al líder de los Hijos. Pero que quede claro: nosotros no adoramos a un djinn, adoramos a lo que el Simurg fue.', 'si sigue vivo'),
  { t: 'choice', prompt: 'Los Hijos del Simurg escuchan vuestra historia.', options: [
    { label: 'Convertirlos a la fe del culto', hint: 'Un seguidor es un latido más en el cristal.', e: { pf: 5, rep: { hijos: 2 }, follow: ['Shib'], flags: ['hijos_convertidos'] }, result: ['El líder de los Hijos arrodilla a los suyos. Shib hace de enlace y pasa a vivir en la biblioteca.'] },
    { label: 'Ofrecer una alianza entre iguales', e: { d: 1, rep: { hijos: 2 }, follow: ['Shib'], flags: ['hijos_aliados'] }, result: ['«La arena cubrirá las cadenas», dice el líder. Os abre sus túneles secretos.'] },
  ] },
  FX({ flags: ['q_s_lago'] }, 'Misión cumplida: El Precio de la Salvación.'),
];

const S_ESPEJO: Node[] = [
  T('El Espejo de Almas', 'Mercado de las Sombras', 'zoco'),
  S('EaNassr', 'Madam Shub tiene algo mío. Un Espejo de Almas. Lo vendí… y lo quiero de vuelta, sin que Madam Shub lo note. Sin preguntas, claro.', 'sobándose el anillo de hueso'),
  N('El Mercado de las Sombras es un bazar subterráneo iluminado por lámparas de aceite violeta. Se venden órganos de djinns en frascos. En el puesto de Madam Shub, un espejo de bronce devuelve rostros que no son los vuestros.'),
  { t: 'choice', prompt: '¿Cómo hacerse con el espejo?', options: [
    { label: 'Robarlo en silencio', hint: 'Sin ruido, sin sangre.', e: { flags: ['espejo_robado'] }, result: ['Zyr\'thar se funde entre los toldos. Cuando Madam Shub se vuelve, el espejo ya no está. Sólo queda un olor a incienso y a cuchillo.'] },
    { label: 'Sobornar a Madam Shub', hint: 'Oro (PF) por silencio.', e: { pf: -3, flags: ['espejo_comprado'] }, result: ['Madam Shub sonríe sin mostrar los dientes: «Un espejo es un espejo. Pero un cliente, un cliente es oro.»'] },
    { label: 'Asalto directo', hint: 'Combate contra mercenarios y serpientes de cristal.', e: { c: 1, alert: 1 }, result: ['Madam Shub silba. Los toldos se llenan de turbantes violetas.'], then: [{ t: 'battle', enc: 'espejo' }, FX({ flags: ['espejo_robado'] })] },
  ] },
  N('El Espejo de Almas no refleja el rostro: muestra lo que se ha hecho con él. Al mirarlo, cada uno ve algo que no le gusta.'),
  S('Romain', 'No veo mi cara. Veo un templo en llamas y a mí, de pie, con las manos limpias. ¿Por qué tengo las manos limpias?'),
  S('Pact Risen', 'Veo una corona. Está al revés. Arde.'),
  { t: 'choice', prompt: 'El espejo es poderoso. EaNassr espera.', options: [
    { label: 'Entregárselo a EaNassr', hint: 'Un aliado condicional.', e: { pf: 3, rep: { mercaderes: 2 }, flags: ['ea_aliado'] }, result: ['EaNassr lo acaricia como a un hijo: «Sois mejores de lo que dicen. Y eso, en Zaryab, es peligroso.»'] },
    { label: 'Quedaros con el espejo para el santuario', hint: 'EaNassr se acordará.', e: { c: 1, rep: { mercaderes: -2 }, build: ['espejo'], flags: ['ea_enemigo'] }, result: ['El Espejo de Almas queda colgado en la biblioteca. Muestra a cada visitante su Corrupción y su Devoción. EaNassr no olvida.'] },
  ] },
  FX({ flags: ['q_s_espejo'] }, 'Misión cumplida: El Espejo de Almas.'),
];

const S_TE: Node[] = [
  T('El Té Envenenado', 'Jardín de los Suspiros · la fiesta de las máscaras', 'espejos'),
  N('EaNassr os pidió envenenar los suministros de Lady Nafisa «sin preguntas». En el Jardín de los Suspiros, la fiesta de máscaras ya ha empezado: los nobles intercambian rostros con djinns menores y sirven un té de luna negra que permite soñar con ganancias futuras.'),
  { t: 'choice', prompt: '¿Cómo entráis?', options: [
    { label: 'Con invitaciones robadas y máscaras', hint: 'Entráis por la puerta grande.', result: ['Las máscaras os sientan bien: nadie os mira dos veces. «Todos mienten. Es lo que hace Zaryab interesante.»'] },
    { label: 'Por el jardín, entre los cipreses', hint: 'Las rosas translúcidas tienen hambre.', e: { alert: 1 }, result: ['Los cipreses podados como manos gigantes parecen cerrarse a vuestro paso.'], then: [{ t: 'battle', enc: 'te' }] },
  ] },
  S('Lady Nafisa', '¿Os gusta mi fiesta? Todos llevan máscaras. Todos mienten. Es lo que hace Zaryab interesante.', 'coqueta, peligrosa'),
  S('Vizir Razul', '¿Creísteis que un nido de ratas amenazaría mi ciudad? El Simurg os devorará…', 'un espejismo flotando entre los invitados'),
  N('Detrás de los canapés descubrís la verdad: el té no está envenenado por nadie… salvo por la propia Nafisa, que ha decidido que dos invitados de la mesa de honor no volverán a hablar.'),
  { t: 'choice', prompt: 'La copa de Lady Nafisa espera.', options: [
    { label: 'Envenenar los suministros según el pedido de EaNassr', hint: 'Cumplir el contrato sin preguntar.', e: { c: 2, alert: 1, rep: { mercaderes: 1 }, flags: ['nafisa_envenenada'] }, result: ['Mezcláis el polvo en el té. Cuando Lady Nafisa sonríe, ya es tarde.'] },
    { label: 'Sustituir el té envenenado', hint: 'Que la envenenadora beba su propia medicina.', e: { c: 1, pf: 3, flags: ['nafisa_en_deuda'] }, result: ['Intercambiáis las copas. Nafisa dormirá un día entero y tendrá que explicar por qué su té mareaba a los invitados.'] },
    { label: 'Exponer la conspiración ante los nobles', hint: 'Vuestra palabra contra una máscara.', e: { d: 1, pf: 4, rep: { conclave: -1 }, flags: ['nobles_aliados', 'info_razul'] }, result: ['Los nobles se quitan las máscaras uno a uno. Alguien, entre susurros, os pasa un pliego con los nombres que Razul vigila.'] },
  ] },
  FX({ flags: ['q_s_te'] }, 'Misión cumplida: El Té Envenenado.'),
];

const S_KHUSH: Node[] = [
  T('Hilos de un Djinn Libre', 'Taller de Al-Khush', 'taller'),
  N('Al-Khush os recibe en el taller oculto. No habla; dibuja runas voladoras en el aire. La alfombra que se sacrificó era parte de él. Os muestra un telar vacío: quiere tejer otra, pero necesita un hilo que nunca haya sido de un amo.'),
  { t: 'if', flag: 'djinns_libres', then: [
    N('Riyam y Tadhem, los djinns que ayudasteis a huir, aparecen en el taller. Tadhem se deshace en brisa y entra entre los hilos. Riyam deja caer una gota de agua viva en la trama.'),
    FX({ d: 1, build: ['alfombra'], flags: ['alfombra_viviente'] }, 'La nueva alfombra respira. Viajar entre distritos ya no consume días.'),
  ], else: [
    { t: 'if', flag: 'efrit_muerto', then: [
      N('Al-Khush toma un ascua del Guantelete de la Ira Rígida. El hilo que sale arde sin quemarse. Hay quien murmura que se oye una voz de Efrit en el tejido.'),
      FX({ c: 1, build: ['alfombra'], flags: ['alfombra_ardiente'] }, 'Una alfombra de fuego cautivo. Funciona… y exige un precio.'),
    ], else: [
      { t: 'choice', prompt: 'No tenéis ningún hilo libre.', options: [
        { label: 'Pedir perdón y ofrecer PF como respeto', hint: '−2 PF', e: { pf: -2, d: 1, build: ['alfombra'], flags: ['alfombra_deuda'] }, result: ['Al-Khush acepta el respeto; no el oro. Teje con paciencia infinita.'] },
        { label: 'Intentar comprar un hilo a los mercaderes', e: { c: 1 }, result: ['Al-Khush rechaza el hilo con un gesto seco. «Esa no es mi alfombra», parece decir. Os echa del taller.'] },
      ] },
    ] },
  ] },
  FX({ flags: ['q_s_khush'] }, 'Misión cumplida: Hilos de un Djinn Libre.'),
];

const S_NINOS: Node[] = [
  T('Niños y Escorpiones', 'Bajo Zaryab', 'bajo'),
  N('Los niños del barrio juegan con escorpiones de obsidiana domesticados. Esta vez, tres guardias los han acorralado «para cobrar impuestos».'),
  S('Niño', '¡No son peligrosos! ¡Sólo pican cuando les gritan!', 'asustado, con un escorpión en el hombro'),
  { t: 'choice', prompt: '¿Qué hacéis?', options: [
    { label: 'Pagar a los guardias para que se vayan', hint: '−3 PF', e: { pf: -3, alert: 0 }, result: ['Los guardias cuentan las monedas y se van riendo. Los niños no os miran.'] },
    { label: 'Defender a los niños (los escorpiones lucharán a vuestro lado)', hint: 'Combate con aliados.', e: { d: 1, alert: 1, flags: ['ninos_defendidos'] }, result: ['Los escorpiones se erizan. El barrio entero os mira desde las ventanas.'], then: [{ t: 'battle', enc: 'ninos' }, FX({ pf: 3, follow: ['Los niños del barrio'], rep: { hijos: 1 } }, 'Los niños dibujan el ojo del Simurg en las paredes.')] },
  ] },
  FX({ flags: ['q_s_ninos'] }, 'Misión cumplida: Niños y Escorpiones.'),
];

const S_LIBRO: Node[] = [
  T('El Libro del Sabio', 'Zoco de los Mil Soplos', 'zoco'),
  S('Sabio Anciano', 'Os contaré los secretos de la ciudad cueva si me ayudáis a recuperar mi libro de hechizos. Un mercader de ojos grandes me lo vendió y se lo revendió a un loro.', 'con una barba de polvo'),
  { t: 'choice', prompt: '¿Cómo recuperáis el libro?', options: [
    { label: 'Comprarlo', hint: '−2 PF', e: { pf: -2 }, result: ['El libro huele a mercurio y a tinta de calamar.'] },
    { label: 'Pedírselo a Al-Khush (conoce a todos los comerciantes)', e: { d: 1 }, result: ['Al-Khush dibuja un camino de runas hasta el puesto exacto.'] },
    { label: 'Robarlo', e: { c: 1, alert: 1 }, result: ['Un loro grita vuestro nombre. Salís corriendo con el libro bajo el brazo.'] },
  ] },
  S('Sabio Anciano', 'Zaryab no se fundó. Se *descubrió*: sus primeros constructores no sabían sobre qué estaban excavando. Bajo el Bajo Zaryab… hay huesos. Más huesos de los que cualquier ciudad debería poder cargar.', 'tras hojear el libro'),
  FX({ pf: 2, flags: ['q_s_libro', 'lore_fundacion'] }, 'Misión cumplida: El Libro del Sabio. Aprendéis cómo se fundó Zaryab.'),
];

// ───────────────────────── Arcos personales ─────────────────────────
const P_ROMAIN: Node[] = [
  T('El Templo Quemado', 'Arco de Romain · La Fe Rota', 'prison'),
  N('Romain se detiene ante unas ruinas ennegrecidas. Vigas calcinadas. Un altar partido. Una balanza de piedra a la que le han arrancado un platillo. Fue su templo.'),
  S('Romain', 'No fueron djinns. Fueron ellos. Los Inquisidores. Y yo… yo les creí.', 'al encontrar el sello del Conclave grabado en una piedra'),
  N('Pasos. Un Inquisidor Radiante y sus guardias vuelven a borrar las pruebas. Les sigue un perro de arena que nunca pierde un olor a herejía.'),
  { t: 'battle', enc: 'romain' },
  { t: 'choice', prompt: 'Un Inquisidor herido se arrastra entre las cenizas. Romain lo mira. Tiene su templo a los pies.', options: [
    { label: 'Buscar venganza contra los Inquisidores', hint: 'Garras del Efrit. El precio es suyo.', e: { c: 3, alert: 1, grant: { romain: { weapons: [{ id: 'garras', name: 'Garras del Efrit', range: 1, toHit: 5, dmg: [{ dice: '1d6+1', type: 'slashing' }, { dice: '1d6', type: 'fire' }] }] } }, flags: ['romain_venganza'] }, result: ['Romain deja caer la maza. Sus manos se cubren de brasas. El cristal de Zahir late, satisfecho.'] },
    { label: 'Buscar pruebas para exponerlos', hint: 'La Luz del Simurg, mejorada.', e: { d: 3, pf: 3, rep: { conclave: -1 }, grant: { romain: { traits: ['luzMejorada'] } }, flags: ['romain_pruebas', 'prueba_templo'] }, result: ['Entre las cenizas, un pliego intacto: órdenes selladas del Inquisidor Jefe Kaelen. Romain lo guarda sobre el pecho.'] },
    { label: 'Perdonar y seguir adelante', hint: 'Eclipse Personal: una duda que se vuelve poder.', e: { d: 1, c: 1, grant: { romain: { abilities: ['eclipse_personal'], res: { eclipse: 1 } } }, flags: ['romain_perdon'] }, result: ['Romain pone la mano sobre el Inquisidor y no dice nada. Durante un instante, el sol se apaga a su alrededor.'] },
  ] },
  FX({ flags: ['q_p_romain'] }, 'Arco de Romain (1/3): El Templo Quemado.'),
];

const P_PACT: Node[] = [
  T('La Corona Invertida', 'Arco de Pact Risen · El Nombre Sellado', 'espejos'),
  N('Las Si\'lats os llevan a un templete sin techo: un cuadrado de piedra bajo el cielo, con una corona de fuego al revés grabada en el suelo. «Aquí se juzgó una vez a Azuran», dice la mayor.'),
  S("Si'lat", 'El Portador del Segundo Aliento no otorgaba poder: lo medía. Su juicio final fue considerado inaceptable: «ni dioses ni djinns merecen fe ciega». Por eso lo quemaron y lo arrojaron a la carne mortal.', 'la mayor'),
  N('Pact se arrodilla en el centro de la corona. El fuego dorado asoma por las grietas de su piel. Y entonces, en el aire, se forma su reflejo: una figura de pie, coronada, sin alas.'),
  { t: 'battle', enc: 'pact' },
  { t: 'choice', prompt: 'El eco se desmorona. En el suelo quedan unas cenizas doradas.', options: [
    { label: 'Aceptar la corona y declarar su verdad', hint: 'Una Verdad por combate.', e: { d: 1, grant: { pact: { abilities: ['declarar_verdad'], res: { verdad: 1 } } }, flags: ['pact_acepta_corona'] }, result: ['Pact se pone en pie. La corona de fuego invertido arde sobre su cabeza sólo un instante. «Recuerdo mi juramento», dice. «Ni dioses ni djinns.»'] },
    { label: 'Sellar la memoria otra vez', hint: 'Seguir siendo Pact Risen.', e: { c: 1, flags: ['pact_sella_memoria'] }, result: ['Pact tapa las cenizas con la palma. «Todavía no.» Las Si\'lats inclinan la cabeza, aliviadas y tristes.'] },
    { label: 'Pedir a Romain que mida su alma', hint: 'Un juicio ajeno.', e: { d: 1, pf: 2, flags: ['pact_juicio_romain'] }, result: ['Romain levanta una balanza invisible. El platillo de Pact baja… y, a su lado, el de Azuran sube. Pesan lo mismo.'] },
  ] },
  FX({ flags: ['q_p_pact'] }, 'Arco de Pact Risen (1/3): La Corona Invertida.'),
];

const P_RABB: Node[] = [
  T('El Nombre en el Arma', 'Arco de Rabb Locke · La Memoria Robada', 'espejos'),
  N('La biblioteca está en silencio. Rabb empuña su espada de pacto sin pensar. La hoja susurra.'),
  S('Arma de Pacto', 'Rabb… Rabb Locke… ese no es tu nombre. Tu nombre es… tu nombre es… ¡despierta!', 'una voz que no es de nadie'),
  N('En un rincón, la sombra del Oráculo de las Mil Lenguas parece reír. Todo lo que dice es falso, así que podéis escuchar al revés.'),
  S('Oráculo de las Mil Lenguas', 'Rabb no tiene ningún pasado. Rabb nunca olvidó nada. Rabb nunca firmó ningún contrato.', 'una verdad invertida'),
  { t: 'choice', prompt: '«Tu nombre es…» El susurro se corta.', options: [
    { label: 'Investigar su pasado', hint: 'Un fragmento de memoria. Dolerá.', e: { d: 1, flags: ['rabb_memoria'] }, result: ['Un destello: una mesa, una mano que no es la suya firmando con sangre, una voz que dice «olvidar». Rabb se tambalea.'] },
    { label: 'Aceptar su nueva identidad', hint: 'El Eco gana terreno.', e: { c: 2, flags: ['rabb_acepta'] }, result: ['«Soy Rabb Locke», dice. La hoja ronronea. Algo en él sonríe sin boca.'] },
    { label: 'Destruir el arma', hint: 'Libertad… a cambio de la espada. Eclipse Personal.', e: { grant: { rabb: { removeWeapons: ['pact'], weapons: [{ id: 'daga', name: 'Daga de acero', range: 1, toHit: 4, dmg: [{ dice: '1d4+2', type: 'piercing' }], finesse: true }], abilities: ['eclipse_personal'], res: { eclipse: 1 } } }, flags: ['rabb_libre'] }, result: ['La hoja se parte con un grito de cristal. Rabb cae de rodillas, vacío y ligero. A su alrededor, por un instante, se apaga el sol.'] },
  ] },
  FX({ flags: ['q_p_rabb'] }, 'Arco de Rabb Locke (1/3): El Nombre en el Arma.'),
];

const P_JOREN: Node[] = [
  T('El Manifiesto de La Marca', 'Arco de Joren Hell · El Crimen que No Cometió', 'zoco'),
  N('En un mostrador de inventario sellado, entre pergaminos arrugados, Joren ve un sello quemado en cuero: un círculo partido con un diente dentro. El símbolo de su antigua célula de contrabandistas.'),
  N('Un manifiesto de carga: «Artículo entregado: 1 paquete sellado de La Marca. Destino parcial: Zoco Sur. Resto del envío: reenviado a Medinat al-Rih. Contacto: desconocido. Pago: en sangre.»'),
  S('EaNassr', 'Curioso el símbolo, ¿no? Llegó por mar… dicen que con tormentas. Yo solo gestioné su paso. Zaryab es un puente, no un hogar. El resto fue hacia el Este. A Medinat. No preguntes qué era. Aunque por tu cara… creo que ya lo sabés.', 'sonriendo'),
  N('Los hombres de La Marca no esperaban visitas.'),
  { t: 'battle', enc: 'joren' },
  { t: 'choice', prompt: 'Un mercenario moribundo balbucea: «La mercancía… era una persona.»', options: [
    { label: 'Ir a Medinat al-Rih sin perder tiempo', hint: 'El pasado de Joren se acerca.', e: { c: 1, flags: ['joren_medinat'] }, result: ['Joren recarga el arco. «Tengo que verlo con mis propios ojos.»'] },
    { label: 'Terminar la misión primero y prometer volver', e: { d: 1, flags: ['joren_promesa'] }, result: ['«Viven. No sé dónde. Pero viven. Y eso… eso es suficiente. Por ahora.»'] },
    { label: 'Pedir ayuda a los Nómadas del Vacío', hint: 'Ayudan… a cambio de un favor.', e: { d: 1, rep: { nomadas: 1 }, flags: ['joren_nomadas'] }, result: ['Un viejo sin nombre acepta guiarte por los planos de arena. A cambio, pedirá algo. Siempre piden algo.'] },
  ] },
  FX({ flags: ['q_p_joren', 'gancho_medinat'] }, 'Arco de Joren Hell (1/3): El Manifiesto de La Marca.'),
];

const P_ZYR: Node[] = [
  T("Los Cuchillos de Vel'Shara", "Arco de Zyr'thar · La Traición de la Casa", 'zoco'),
  N('En el Zoco, un drow de capucha larga os ha visto a través de las esferas de cristal. Zyr\'thar lo reconoce antes de que se mueva.'),
  S("Espía de Vel'Shara", "La Casa Vel'Shara no olvida, Zyr'thar. No olvida. No perdona. No muere.", 'sin elevar la voz'),
  { t: 'battle', enc: 'zyr' },
  { t: 'choice', prompt: 'La espía yace de rodillas. Aún respira.', options: [
    { label: 'Eliminarla', hint: 'Sin rastro.', e: { c: 2, flags: ['zyr_eliminada'] }, result: ['Un cuchillo, un silencio. La Casa tardará en enterarse.'] },
    { label: 'Interrogarla', hint: 'Justicia y datos.', e: { d: 1, pf: 2, flags: ['zyr_info'] }, result: ["Habla de otros tres espías en Zaryab, de un contrato firmado en una torre y del nombre de la matriarca: Vel'Shara-Kael."] },
    { label: 'Dejarla ir con un mensaje', hint: 'Más espías vendrán. Pero ganáis tiempo.', e: { alert: 1, flags: ['zyr_mensaje'] }, result: ['«Decid a la Casa que ya no me hace falta pedir permiso.» La espía desaparece. Algo, en la sombra de Zyr\'thar, parece sonreír.'] },
  ] },
  FX({ flags: ['q_p_zyr'] }, "Arco de Zyr'thar (1/3): Los Cuchillos de Vel'Shara."),
];

const P_PANCHI: Node[] = [
  T('El Golem Defectuoso', 'Arco de Panchi · La Ira del Monje', 'choza'),
  N('Entre los estantes de la biblioteca, un golem de arcilla y runas violetas golpea las paredes sin parar. Se mueve de forma espasmódica. Está roto. Está enojado. Está solo.'),
  S('Panchi', 'Tú… tú eres como yo. Roto. Enojado. Solo. Ven. Luchemos. O seamos amigos. O ambas.', 'con los puños apretados'),
  { t: 'choice', prompt: '¿Qué hacéis con el golem?', options: [
    { label: 'Desmantelarlo y extraer su núcleo', hint: 'Combate. Un núcleo de energía.', e: { pf: 3, flags: ['nucleo_golem'] }, result: ['Panchi se lanza sin pensar.'], then: [{ t: 'battle', enc: 'panchi' }] },
    { label: 'Redirigir su ira contra enemigos', hint: 'Ayudará en el próximo combate.', e: { flags: ['golem_prestado'] }, result: ['Panchi grita una orden. El golem gira la cabeza con un crujido. «Tu enemigo no soy yo», parece decir.'] },
    { label: 'Controlarlo (golem permanente)', hint: '+1 Corrupción y un golem en cada combate.', e: { c: 1, flags: ['golem_aliado'] }, result: ['Una runa nueva en la frente del golem. Obedece. Panchi no lo mira a los ojos.'] },
  ] },
  FX({ flags: ['q_p_panchi'] }, 'Arco de Panchi (1/3): El Golem Defectuoso.'),
];

// ───────────────────────── Catálogo ─────────────────────────
export const QUESTS: QuestDef[] = [
  { id: 'm_cap3', title: 'Los Pecados Bajo el Agua', kind: 'main', district: 'zoco', giver: 'EaNassr · Zahir', blurb: 'EaNassr os cita en la sala de espejos. Zahir llama desde el agua. El fragmento del meteorito espera en los acueductos.', when: done('cap2_done'), days: 3, script: CAP3, reward: 'Fragmento 2 · Si\'lats · Azuran' },
  { id: 'm_cap4', title: 'El Reflejo se Rompe', kind: 'main', district: 'plaza', giver: 'Zahir', blurb: 'Zahir está furioso: hablasteis con Razul y con Dahhak. Debéis robar el meteorito del Cubo de los Mil Reflejos.', when: c => has(c, 'cap3_done') && (c.day >= 8 || Object.values(c.quests).filter(s => s === 'done').length >= 2), days: 3, script: CAP4, reward: 'Fragmento 3 · Pista de Ellie', next: 'm_cap5' },
  { id: 'm_cap5', title: 'La Caída del Capitolio', kind: 'main', district: 'plaza', giver: 'Dahhak', blurb: 'El Coloso corrupto de Dahhak avanza sobre la plaza. Jefe del Acto I y primera gran decisión.', when: done('cap4_done'), days: 2, script: CAP5, reward: 'Postura: Orden / Pueblo / Sombra' },
  { id: 'm_cap6', title: 'La Guerra Civil: Medinat al-Rih', kind: 'main', district: 'medinat', giver: 'Joren · Panchi', blurb: 'La revuelta de los Nasnas, el reencuentro de Joren y el Torneo de los Puños Cerrados. Tu Postura decide cómo te recibe la ciudad.', when: done('cap5_done'), days: 4, script: CAP6, reward: 'Venda de Ellie · pista a Ellie · aliados de Medinat' },
  { id: 'm_cap7', title: 'La Iglesia del Simurg', kind: 'main', district: 'iglesia', giver: "Las Si'lats", blurb: 'El cubil de Dahhak y la Prueba de Azuran. Primer falso dios: el Portador de Cuellos.', when: done('cap6_done'), days: 3, script: CAP7, reward: 'Fragmento de Dahhak · Prueba de Azuran' },
  { id: 'm_cap8', title: 'La Visita del Vizir', kind: 'main', district: 'santuario', giver: 'Las campanas', blurb: 'Razul baja a la biblioteca. Defender, evacuar o negociar. Aquí se fija vuestra Ruta.', when: done('cap7_done'), days: 1, script: CAP8, reward: 'Ruta calculada' },
  { id: 'm_cap9', title: 'El Jardín de los Suspiros', kind: 'main', district: 'jardin', giver: 'Lady Nafisa', blurb: 'La fiesta de máscaras y el Marid que custodia un fragmento. Segundo falso dios.', when: done('cap8_done'), days: 3, script: CAP9, reward: 'Fragmento del Marid · Sombra de Zyr\'thar' },
  { id: 'm_cap10', title: 'El Hijo del Lago', kind: 'main', district: 'bajo', giver: 'Farid', blurb: 'Farid canta con el Lich. La Balanza de Romain. Tercer falso dios: Al-Mazhar.', when: done('cap9_done'), days: 3, script: CAP10, reward: 'Fragmento de Al-Mazhar · Pacto de Rabb' },
  { id: 'm_cap11', title: 'La Veta Maldita', kind: 'main', district: 'mina', giver: 'Capitana Samira', blurb: 'Mina de Alabastro: cuatro niveles, huida y Gul-Amarat. Cuarto falso dios.', when: done('cap10_done'), days: 4, script: CAP11, reward: 'Fragmento de Gul-Amarat o el Sacrificio' },
  { id: 'm_cap12', title: 'La Ciudadela de los Susurros', kind: 'main', district: 'ciudadela', giver: 'Joren', blurb: 'Infiltración y Razul ibn Tameer. Verdadero Culpable de Joren.', when: done('cap11_done'), days: 3, script: CAP12, reward: 'Fragmento de Razul' },
  { id: 'm_cap13', title: 'El Ritual del Eclipse', kind: 'main', district: 'catacumbas', giver: 'Zahir', blurb: 'Los Huesos del Pacto. Jefe final y destino de Zaryab.', when: done('cap12_done'), days: 2, script: CAP13, reward: 'Final' },

  { id: 's_lago', title: 'El Precio de la Salvación', kind: 'side', district: 'pozo', giver: 'Aisha', blurb: 'Los túneles de los Hijos del Simurg, Shib moribundo y la rama del Conclave en el Lago. Purificar, quemar o llevar como prueba.', when: done('cap2_done'), days: 2, script: S_LAGO, reward: 'Seguidores · Hijos del Simurg · remedio' },
  { id: 's_espejo', title: 'El Espejo de Almas', kind: 'side', district: 'zoco', giver: 'EaNassr', blurb: 'Recuperar un Espejo de Almas del puesto de Madam Shub, en el Mercado de las Sombras.', when: done('cap3_done'), days: 1, alert: 0, script: S_ESPEJO, reward: 'Mercaderes · Espejo del Alma' },
  { id: 's_te', title: 'El Té Envenenado', kind: 'side', district: 'jardin', giver: 'EaNassr', blurb: 'La fiesta de máscaras de Lady Nafisa: sustituir, ejecutar o exponer el veneno.', when: done('cap3_done'), days: 2, script: S_TE, reward: 'Nobles aliados · información sobre Razul' },
  { id: 's_khush', title: 'Hilos de un Djinn Libre', kind: 'side', district: 'zoco', giver: 'Al-Khush', blurb: 'Al-Khush quiere tejer otra alfombra viviente.', when: c => has(c, 'alfombra_sacrificada') && has(c, 'cap3_done'), days: 1, script: S_KHUSH, reward: 'Alfombra Viviente' },
  { id: 's_ninos', title: 'Niños y Escorpiones', kind: 'side', district: 'bajo', giver: 'Los niños del barrio', blurb: 'Tres guardias acorralan a unos niños y a sus escorpiones domésticos.', when: c => has(c, 'gancho_ninos') && !has(c, 'q_s_ninos'), days: 1, alert: 1, script: S_NINOS, reward: '+Devoción · seguidores' },
  { id: 's_libro', title: 'El Libro del Sabio', kind: 'side', district: 'zoco', giver: 'Un sabio anciano', blurb: 'Un anciano ofrece los secretos de la ciudad a cambio de su libro de hechizos.', when: c => has(c, 'gancho_libro') && !has(c, 'q_s_libro'), days: 1, script: S_LIBRO, reward: 'Lore · PF' },

  { id: 'p_romain', title: 'El Templo Quemado', kind: 'personal', pc: 'romain', district: 'bajo', giver: 'Romain', blurb: 'Las ruinas de su templo guardan el sello del Conclave. Romain debe elegir entre venganza, pruebas y perdón.', when: done('cap2_done'), days: 1, alert: 1, script: P_ROMAIN, reward: 'Habilidad: Garras del Efrit / Luz mejorada / Eclipse Personal' },
  { id: 'p_panchi', title: 'El Golem Defectuoso', kind: 'personal', pc: 'panchi', district: 'santuario', giver: 'Panchi', blurb: 'Un golem roto golpea las paredes de la biblioteca.', when: done('cap2_done'), days: 1, script: P_PANCHI, reward: 'Núcleo / golem aliado' },
  { id: 'p_pact', title: 'La Corona Invertida', kind: 'personal', pc: 'pact', district: 'acueductos', giver: "Las Si'lats", blurb: 'Las Si\'lats guían a Pact a un templete donde Azuran fue juzgado.', when: c => has(c, 'pact_azuran'), days: 1, script: P_PACT, reward: 'Habilidad: Declarar una Verdad' },
  { id: 'p_rabb', title: 'El Nombre en el Arma', kind: 'personal', pc: 'rabb', district: 'santuario', giver: 'Rabb', blurb: 'La espada de pacto susurra un nombre que no es el de Rabb.', when: done('cap3_done'), days: 1, script: P_RABB, reward: 'Fragmento de memoria · Eclipse Personal' },
  { id: 'p_joren', title: 'El Manifiesto de La Marca', kind: 'personal', pc: 'joren', district: 'zoco', giver: 'Joren', blurb: 'Un sello de su vieja célula en el Zoco. Parte del cargamento fue a Medinat al-Rih.', when: done('cap3_done'), days: 1, alert: 1, script: P_JOREN, reward: 'Gancho: Medinat al-Rih' },
  { id: 'p_zyr', title: "Los Cuchillos de Vel'Shara", kind: 'personal', pc: 'zyrthar', district: 'zoco', giver: "Zyr'thar", blurb: 'Un espía de la Casa Vel\'Shara lo ha reconocido en el Zoco.', when: done('cap3_done'), days: 1, script: P_ZYR, reward: 'Información · tiempo' },
];
QUESTS.push(...MORALES, ...ACT2, { id: 'o_maunator', title: 'El Inventario de Maunator', kind: 'side', district: 'zoco', giver: 'EaNassr', blurb: 'Robar un tomo de escribas de los muertos de un consulado extranjero. Un sótano que se mueve, un mago que prepara un magnicidio divino y una salida con tres medallones.', when: c => has(c, 'cap8_done') && !has(c, 'q_o_maunator'), days: 3, alert: 1, script: MAUNATOR, reward: 'Tomo · Sello de Helm · Seraphel · Kethras como enemigo futuro' });
export const QUEST_BY_ID = Object.fromEntries(QUESTS.map(q => [q.id, q]));
export const CHAPTER_SCRIPTS: Record<string, Node[]> = { cap0: CAP0, cap1: CAP1, cap2: CAP2 };
