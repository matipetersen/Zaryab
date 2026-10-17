import type { Node } from './types';
import type { Encounter } from '../data/maps';
import type { MapDef } from '../engine/types';
import { MONSTERS } from '../data/monsters';
import { PARTY_BY_ID } from '../data/party';

const N = (text: string): Node => ({ t: 'narr', text });
const NAME: Record<string, string> = { romain: 'Romain', pact: 'Pact Risen', rabb: 'Rabb Locke', joren: 'Joren Hell', zyrthar: "Zyr'thar", panchi: 'Panchi' };
const S = (pc: string, text: string, tone?: string): Node => ({ t: 'say', who: NAME[pc], text, tone });

type Cat = 'bicho' | 'ghul' | 'gente' | 'constructo' | 'espectro' | 'muerto' | 'jefe' | 'otro';
const catOf = (id: string): Cat => {
  if (/escorpion|hormiga|perro|gusano|serpiente|flor_carn/.test(id)) return 'bicho';
  if (/ghul/.test(id)) return 'ghul';
  if (/guardia|inquisidor|qilaat|mercenario|adorador|adepto|nasnas|linyera|sifra|espia|ladron|kethras|mordec/.test(id)) return 'gente';
  if (/golem|coloso|pilon|constructo|guardian/.test(id)) return 'constructo';
  if (/reflejo|sombra|eco|ifrit|jann|marid|djinn|espectro/.test(id)) return 'espectro';
  if (/esquel|zombi|osario|muerto|lich|mazhar|hueso/.test(id)) return 'muerto';
  return 'otro';
};

/** Lo que cada personaje diría al ver a cada clase de enemigo. */
const REACT: Record<Cat, Record<string, string[]>> = {
  bicho: {
    romain: ['No son soldados. Es hambre con patas. Cuidado con el veneno: yo curo, pero no hago milagros con el veneno.', '¡Insectos! Mantengan la formación: no dejen que me rodeen.'],
    pact: ['¡A mí! Yo los freno en el frente, los demás flanquean.', 'Bichos grandes. Tienen mala puntería, pero muerden muchos a la vez. No se queden solos.'],
    rabb: ['Odio los bichos. Por favor, que nadie me pida que los toque.', 'La espada susurra que huelen a miedo. Mío, aparentemente.'],
    joren: ['Están agrupados. Si dispersan, los separo con flechas, uno por uno.', 'Huelen el calor del cuerpo. No se amontonen junto a la fogata.'],
    zyrthar: ['Los del flanco son los débiles. Voy por detrás.', 'Pequeños, rápidos, ponzoñosos. Mi tipo de enemigo.'],
    panchi: ['¡Vengan, bichos! ¡Esta mañana me levanté de mal humor!', 'Los aplasto de a uno. O de a tres, si se juntan.'],
  },
  ghul: {
    romain: ['Muertos hambrientos. La luz de Kelemvor los incomoda: quédense cerca de mí.', 'Su mordisco paraliza. No dejen que nadie quede solo.'],
    pact: ['No son lo que fueron. No tengan lástima.', 'Yo aguanto la línea. Ustedes, no dejen que se acerquen a Romain.'],
    rabb: ['Odio a los que no mueren. Son demasiado… familiares.', 'Dejen algunos con vida; quiero ver qué me dice la espada.'],
    joren: ['Vienen en tropel. Busquen un cuello de botella.', 'Disparo a los que van adelante. Que nadie corra.'],
    zyrthar: ['Carne podrida, reflejos lentos. Los rodeo.', 'Si me muerden, me convierto en parte del problema. No me muerdan.'],
    panchi: ['Ya los vi. En mi tierra los llamamos «cena de mañana».', 'Uno por uno. Sin prisa. Sin piedad.'],
  },
  gente: {
    romain: ['No quiero matar a nadie que pueda arrepentirse. Pero si es necesario…', 'Son personas. Piensen antes de golpear.'],
    pact: ['Hombres de uniforme. Tienen órdenes; nosotros, un motivo.', 'Agrúpense detrás de mí. Que los arqueros elijan a quién caer.'],
    rabb: ['Espadas, escudos, miedo. Todo lo de siempre.', 'La espada quiere un nombre. Les voy a dar uno.'],
    joren: ['Hay un oficial. Cuando caiga, los demás dudarán.', 'Cubran los flancos. No me gusta ser blanco fácil.'],
    zyrthar: ['El que da las órdenes tiene la bolsa más gorda. Voy a por él.', 'Me ven venir. Que no me vean llegar.'],
    panchi: ['Voy al más grande.', 'No me gustan los uniformes. Voy a romper unos cuantos.'],
  },
  constructo: {
    romain: ['No tienen alma. No puedo ayudarlos con eso, pero sí a quien los rompa.', 'Algo los gobierna desde dentro. Busquen el punto débil.'],
    pact: ['Metal contra carne: cuidado con los golpes grandes. Que nadie quede en el camino.', 'No se detienen. Hay que romperlos o rodearlos.'],
    rabb: ['Hechos para obedecer. Qué asco.', 'Los hechizos de fuego les hacen cosquillas; busquen la junta.'],
    joren: ['Lentos pero pesados. Los puedo mantener lejos.', 'Sin cobertura no los frenamos. Busquen columnas.'],
    zyrthar: ['No sangran. No sienten. Es una lástima para mi oficio.', 'Si no hay puntos vitales, buscaré puntos flojos.'],
    panchi: ['¡Al fin algo que no se rompe con una mirada!', 'Golpeo hasta que se abolle. Después, un poco más.'],
  },
  espectro: {
    romain: ['Lo que ven no es lo que es. No miren a los ojos.', 'Dejen que yo bendiga al que esté al frente. La luz ayuda.'],
    pact: ['No se separen. Algo quiere dividirnos.', 'Yo me ocupo del frente. Ustedes, de lo que no se ve.'],
    rabb: ['Mi espada los reconoce. No me gusta lo que susurra.', 'Los hechizos los lastiman mejor que el acero.'],
    joren: ['Sombras. Me ven antes de que yo los vea. Mala combinación.', 'No miren las sombras. Miren el suelo.'],
    zyrthar: ['Reconozco a una sombra mentirosa cuando la veo.', 'Cuidado con los espejos: no son lo que parecen.'],
    panchi: ['Si se puede golpear, se puede vencer.', 'Fantasmas. Qué comodidad: no huelen.'],
  },
  muerto: {
    romain: ['Los muertos no deben caminar. Les devuelvo el descanso.', 'La luz es mi arma. Que nadie me deje solo.'],
    pact: ['Hueso y rencor. Hagan lo que hagan, no se queden quietos.', 'Frente a mí, todos. Los muertos no cansan: nosotros sí.'],
    rabb: ['Los muertos recuerdan más que yo. Qué envidia.', 'Voy a pedirles perdón al romperlos.'],
    joren: ['Flechas de luz, si tengo. Si no, flechas comunes.', 'No dejen que me rodeen. No me gusta estar en el medio.'],
    zyrthar: ['Los muertos no tienen puntos vitales, pero sí cuellos. Todos tienen cuello.', 'Me gustan más los vivos. Pero no se puede tener todo.'],
    panchi: ['Pedimos permiso a los huesos antes de romperlos.', 'Que vengan. Ya nada me asusta.'],
  },
  jefe: {
    romain: ['Es más grande de lo que esperaba. Concéntrense en no morir y después en matarlo.', 'No se separen. Si uno cae, el resto lo cubre.'],
    pact: ['Yo me paro delante. El resto, a su ritmo.', 'Jefes así caen cuando todos hacen su parte. No hay héroes solos.'],
    rabb: ['Esto no se mata con un golpe. Piensen.', 'La espada se despertó. Eso nunca es bueno.'],
    joren: ['Busquen cobertura y no se amontonen. Tiene alcance largo.', 'Si cae un pilar o una columna, aprovéchenlo.'],
    zyrthar: ['Mientras ustedes lo distraen, yo busco el hueco.', 'Las grandes cosas siempre tienen un punto ciego.'],
    panchi: ['¡Por fin!', 'Quiero que me mire a los ojos antes de caer.'],
  },
  otro: {
    romain: ['Respiren. Escuchen. Después, golpeen.', 'Que nadie se aleje de los demás.'],
    pact: ['Formación. Yo al frente.', 'No hay vergüenza en retroceder si es para volver mejor.'],
    rabb: ['Qué desagradable. Pero no me aburro.', 'La espada tiene ganas. Yo, un poco menos.'],
    joren: ['Observen el terreno. Yo busco la altura.', 'No avancen sin cubrirse.'],
    zyrthar: ['Alguien va a perder algo importante hoy. Prefiero que no sea yo.', 'Yo voy por el flanco.'],
    panchi: ['Se lo ganaron.', 'Vamos a ver de qué están hechos.'],
  },
};

/** Textos propios de los combates con más historia. `sit`: qué está pasando; `who`: voces. */
const CUSTOM: Record<string, { sit: string; who?: [string, string][] }> = {
  noche: { sit: 'Habían acampado sin una mala sombra en el horizonte, y por eso nadie vigiló bien. Del desierto salen, en silencio, escorpiones negros del tamaño de un perro y un animal de arena que ya huele a la comida. Los agarran con las armas guardadas y las botas fuera.', who: [['pact', '¡Arriba! ¡Arriba todos! ¡Alguien encienda la fogata!'], ['panchi', 'Nos sorprendieron… unos insectos. No puedo creer que unos bichos nos hayan sorprendido.'], ['joren', 'Cuidado con los dos de la izquierda: el perro es la distracción.']] },
  linyera: { sit: 'El viejo linyera sonríe mostrando demasiados dientes blancos. Tiene a dos guardias de arena detrás y a los escorpiones de un trabajo anterior. Es una emboscada preparada, y ustedes acaban de entrar.', who: [['zyrthar', 'Conozco esa sonrisa. Es la de quien cobra por adelantado.'], ['romain', 'No es solo un linyera. El pozo del Silencio lo tiene atado.']] },
  acueducto: { sit: 'El agua de las piletas rotas escupe ghuls apenas tocan el fragmento sellado. El acueducto es una trampa de piedra: pasillos estrechos, agua baja que frena los pasos y columnas para cubrirse.', who: [['pact', 'Un cuello de botella. Yo me planto en él. Los demás, atrás.']] },
  coloso: { sit: 'El Capitolio se abre como una flor de hierro y de él sale el Coloso de Dahhak. Los pilones brillan en violeta: si no los apagan, se volverá más fuerte. Los guardias aliados aguantan lo que pueden.', who: [['romain', 'Los pilones son lo que lo alimenta. Rompan los pilones primero.'], ['rabb', 'Es enorme. Y es lo único en esta ciudad que no miente: quiere matarnos.']] },
  patrulla: { sit: 'Una patrulla del Conclave baja por el callejón con un perro de arena. No vienen a hablar: vienen a registrar, y cuando encuentran algo, golpean primero.', who: [['joren', 'Cuatro. Cinco con el perro. Podemos contra cinco.']] },
  asalto: { sit: 'Las campanas suenan sobre la biblioteca. Los Inquisidores rompen las puertas con bronce viviente. Defienden su casa: cada metro cedido es un estante menos.', who: [['pact', 'Esta es nuestra casa. No la perdemos.']] },
  cubo: { sit: 'El Cubo de los Mil Reflejos devuelve a cada uno la versión de sí mismo que menos le gusta. Los reflejos atacan con los trucos de quienes los miran.', who: [['zyrthar', 'No me miren a la cara. A mí menos.']] },
  dahhak_final: { sit: 'En la Iglesia del Simurg, Dahhak se desenrolla como un tronco del que brotan cuellos. Cada cuello habla; cada boca promete algo distinto. Si cortan uno, rebrota otro.', who: [['romain', 'No lo escuchen. Cada cuello miente con una voz distinta.'], ['pact', 'Ataquen siempre al mismo cuello: hay que cortar antes de que regrese.']] },
  eclipse: { sit: 'El eclipse cae sobre las catacumbas. Zahir abre alas de fuego y de mentira. Es el último combate de esta historia, y él lo sabe.', who: [['romain', 'Hagan lo que vinieron a hacer. No pienso que haya otro momento.']] },
};

/** Una pista táctica según el terreno del mapa y los enemigos. */
function tip(map: MapDef, foeIds: string[]): string {
  const rows = map.rows.join(''); const t: string[] = [];
  if (/[cCo]/.test(rows)) t.push('Hay cajas, piedras o barriles: dan cobertura (+2 o +5 a la CA) y los barriles explotan.');
  if (/=/.test(rows)) t.push('La altura da ventaja: quien dispara desde terreno elevado golpea con +2.');
  if (/[~]/.test(rows)) t.push('El agua y el terreno difícil cuestan el doble de movimiento.');
  if (/[f^]/.test(rows)) t.push('Hay fuego o terreno peligroso: quema a quien lo pise.');
  if (foeIds.some(i => /arquero|ballesta|dardo|inquisidor/.test(i))) t.push('Hay enemigos a distancia: rompan su línea de visión.');
  t.push('Salir del alcance de un enemigo provoca un ataque de oportunidad: usen «Desengancharse» si quieren retirarse.');
  t.push('Flanquear con un aliado en el lado opuesto da ventaja al ataque.');
  return t.slice(0, 3).join(' ');
}

/** Cutscene previa a cada combate: qué pasa, quiénes son, cómo lo ven los personajes y por dónde empezar. */
export function briefing(encId: string, enc: Encounter, map: MapDef, party: string[], foeIds: string[], bg: string): Node[] {
  const nodes: Node[] = [{ t: 'chapter', title: map.name, sub: enc.surprise === 'party' ? 'Los sorprenden' : enc.surprise === 'foes' ? 'Ustedes los sorprenden' : 'Antes del combate', bg }];
  nodes.push(N(enc.intro));
  const cu = CUSTOM[encId]; const alive = party.filter(p => PARTY_BY_ID[p]);
  if (cu) nodes.push(N(cu.sit));
  else {
    const counts = new Map<string, number>(); for (const f of foeIds) counts.set(f, (counts.get(f) ?? 0) + 1);
    const list = [...counts.entries()].map(([id, n]) => `${n > 1 ? n + ' × ' : ''}${MONSTERS[id]?.name ?? id}`).join(', ');
    if (list) nodes.push(N(`Frente a ustedes: ${list}.`));
  }
  // voces
  const said = new Set<string>();
  for (const [pc, text] of cu?.who ?? []) if (alive.includes(pc) && said.size < 3) { nodes.push(S(pc, text)); said.add(pc); }
  if (said.size < 2) {
    const cats = [...new Set(foeIds.map(catOf))]; const cat: Cat = foeIds.some(i => MONSTERS[i]?.cr && Number(MONSTERS[i].cr) >= 8) ? 'jefe' : (cats[0] ?? 'otro');
    const pool = alive.filter(p => !said.has(p)); let k = 0;
    for (const pc of pool) { if (said.size >= (cu ? 2 : 2)) break; const lines = REACT[cat][pc] ?? REACT.otro[pc]; const line = lines[(encId.length + k++) % lines.length]; nodes.push(S(pc, line)); said.add(pc); }
  }
  if (map.objective) nodes.push(N(`Objetivo: ${map.objective}`));
  nodes.push(N(`Pista táctica: ${tip(map, foeIds)}`));
  return nodes;
}
