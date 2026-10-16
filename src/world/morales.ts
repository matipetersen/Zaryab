import type { Node } from '../story/types';
import type { Campaign, Effect } from '../state';
import { has } from '../state';
import type { QuestDef } from './quests';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const done = (id: string) => (c: Campaign) => has(c, id);
const open = (id: string, flag: string) => (c: Campaign) => has(c, 'cap3_done') && !has(c, flag) && c.quests[id] !== 'done';
// Los importes del documento de diseño se reducen a la mitad en la economía del juego (el botín es pequeño).

// ═══════════════ ECOS: consecuencias diferidas ═══════════════
export const ECOS: Record<string, Node[]> = {
  eco_juicio_ejecutado: [T('Sangre en la Plaza', 'El eco del juicio', 'bajo'), N('El guardia colgado tenía un hermano en la Guardia Imperial. Cuatro días después, un sobre sin remitente aparece clavado con un cuchillo en la puerta de la biblioteca: un nombre, una hora, una amenaza.'),
    { t: 'choice', prompt: 'Los aldeanos que colgaron al guardia os miran. Esperan que los protejáis.', options: [
      { label: 'Defender al barrio', hint: 'Las patrullas llegan más rápido.', e: { alert: 1, d: 1, huella: 'Colgasteis a un guardia… y luego protegisteis a quienes lo hicieron.' }, result: ['Los aldeanos montan guardia con vosotros. Nadie habla de la soga.'] },
      { label: 'Entregar a los instigadores para calmar al Conclave', hint: 'Traición a quien os dio la razón.', e: { c: 2, alert: -2, rep: { conclave: 1 }, follow: [], huella: 'Entregasteis a los aldeanos que vosotros mismos animasteis a ejecutar.' }, result: ['Tres vecinos desaparecen. El barrio ya no os saluda.'] },
    ] }],
  eco_juicio_salvado: [T('El Guardia Agradecido', 'El eco del juicio', 'bajo'), S('Guardia', 'Me habéis dejado vivir. No sé por qué. Aquí tenéis: cada martes el Conclave cambia la ronda de la Plaza. Os aviso hoy porque no sé si mañana lo haré.', 'sin mirar a nadie'), FX({ alert: -2, rep: { conclave: 1 } }, 'El guardia os da el calendario de patrullas. −2 Alerta.')],
  eco_nino_muerto: [T('La Madre', 'El eco de la picadura', 'bajo'), N('La madre del niño no grita. Se sienta frente a la puerta de la biblioteca todos los días a la misma hora, sin pedir nada. A la tercera semana los seguidores empiezan a no mirarla.'), FX({ d: -1, huella: 'Dejasteis morir a un niño que podíais haber salvado. Su madre os espera cada día en la puerta.' }, 'Los seguidores susurran. −1 Devoción.')],
  eco_nino_salvado: [T('La Deuda de una Madre', 'El eco de la picadura', 'bajo'), N('Una mujer deja una cesta de pan de arena en la puerta de la biblioteca. Nunca dice su nombre. Cada tres días hay otra cesta.'), FX({ items: { pan_arena: 3 }, rep: { hijos: 1 } }, 'La gratitud del barrio llena la despensa.')],
  eco_ladron_traicion: [T('El Ladrón Vuelve', 'El eco del perdón', 'zoco'), N('Cuatro días después, el ladrón regresa con la mitad del Zoco detrás. Trae cuatro bolsas de monedas robadas «como ofrenda». Nadie pregunta de quién eran.'), FX({ gold: 120, rep: { mercaderes: -1 }, c: 1 }, 'Aceptáis el botín. Los Mercaderes lo notan.')],
  eco_inquisidor_traicion: [T('La Carta del Inquisidor', 'El eco de la deserción', 'plaza'), N('El Inquisidor que acogisteis deja una nota sobre la almohada de Romain: «Mi hermana sigue en la Ciudadela. Me prometieron su vida a cambio de la vuestra. Lo siento. No os vais a ir de aquí vivos.» Está sellada con cera de Conclave.'),
    { t: 'choice', prompt: 'La nota está fechada hace una hora.', options: [
      { label: 'Atraparlo antes de que huya', check: { skill: 'percepcion', dc: 15 }, hint: 'Percepción CD 15', e: { d: 1, huella: 'El Inquisidor os traicionó, pero lo cazasteis con vuestras propias manos.' }, result: ['Lo encontráis en el tejado, con una cuerda. Se rinde sin luchar. Os cuenta todo.'], fail: { e: { alert: 3, c: 1 }, result: ['Llegáis tarde. Las campanas del Conclave suenan dos veces.'] } },
      { label: 'Dejarlo ir: su hermana también es inocente', e: { d: 1, alert: 2, huella: 'Perdonasteis la traición de un Inquisidor por amor a su hermana.' }, result: ['Lo dejáis marchar. Nadie sabe si la hermana vivió.'] },
    ] }],
  eco_inquisidor_aceptado: [T('La Información del Desertor', 'El eco de la deserción', 'plaza'), S('Inquisidor Desertor', 'La Ciudadela tiene tres escaleras: la de los guardias, la de los esclavos y la del Vizir. La del Vizir no tiene guardias porque nadie tiene el valor de usarla.', 'bajando la voz'), FX({ flags: ['info_ciudadela'], rep: { inquisidores: -1 } }, 'Información sobre la Ciudadela obtenida.')],
  eco_inquisidor_entregado: [T('El Juicio de Samira', 'El eco de la deserción', 'plaza'), N('Samira condena al Inquisidor ante los guardias leales. No se oye su voz, sólo el sonido de la soga. Pero su respeto por vosotros, pequeño, sigue en pie.'), FX({ d: 1, rep: { conclave: 1 } }, 'Samira os debe un favor.')],
  eco_marid: [T('El Hueco', 'El eco del pacto', 'cubo'), N('Hay un nombre que Romain solía repetir antes de dormir. Hoy lo busca en su memoria y no lo encuentra. En su lugar hay una grieta limpia, sin dolor, como un diente que nunca existió.'), S('Romain', 'Había… alguien. Estoy seguro de que había alguien.', 'mirando sus manos'), FX({ huella: 'Cambiasteis el recuerdo de un ser querido por un fragmento del meteorito.' }, 'El Marid cumplió su parte. Vosotros, la vuestra.')],
  eco_marid_enemigo: [T('El Agua Recuerda', 'El eco del rechazo', 'pozo'), N('Cada pozo de la ciudad amanece amargo. Las lluvias no llegan. El Marid no ataca: espera, con la paciencia de los ríos.'), FX({ food: -2, rep: { hijos: -1 }, huella: 'Rechazasteis a un Marid. Zaryab bebe agua amarga por vuestra culpa.' }, 'Los víveres escasean. −2 víveres.')],
  eco_caravana_robada: [T('La Venganza de EaNasir', 'El eco del robo', 'zoco'), N('Cuando volvéis al Zoco todos los toldos están cerrados. Un chico os señala un cartel: vuestras caras, con una cifra que ningún Mercader pagaría por una cabeza sana.'), FX({ rep: { mercaderes: -2 }, alert: 1, huella: 'Robasteis a una caravana de supervivientes y EaNasir os puso precio.' }, 'EaNasir os retira su tienda. −2 rep. Mercaderes.')],
  eco_hereje: [T('El Joven Djinn', 'El eco de la caza', 'bajo'), N('El hereje al que salvasteis aparece una noche junto al altar, más alto, con los ojos de otro color. Os entrega algo sin decir nada: una escama de arena negra.'), FX({ items: { arena_negra: 2 }, rep: { hijos: 1 } }, 'Los Hijos del Simurg os envían un regalo.')],
  eco_tributo: [T('Ellos Vuelven', 'El eco del impuesto', 'bajo'), N('El Inquisidor al que convencisteis vuelve. Esta vez trae a doce guardias y una lista de nombres. «El Conclave no olvida las deudas, solo las aplaza.»'), FX({ alert: 2, rep: { conclave: -1 } }, 'La Alerta sube. Esto no ha terminado.')],
};

// ═══════════════ MISIONES MORALES (21–26) ═══════════════
const M_NINO: Node[] = [
  T('El Niño y el Escorpión', 'Bajo Zaryab · una picadura', 'bajo'),
  N('Un niño yace en el suelo del callejón, la pierna hinchada y negra. Otro, de rodillas junto a un escorpión domesticado, llora tanto que no puede hablar. Los vecinos miran desde las puertas y nadie se acerca.'),
  { t: 'choice', prompt: 'El veneno tarda minutos, no horas.', options: [
    { label: 'Curar al niño con magia y medicina', hint: 'Medicina CD 14', check: { skill: 'medicina', dc: 14 }, e: { d: 2, rep: { hijos: 1 }, flags: ['nino_salvado'], echo: [{ id: 'eco_nino_salvado', in: 3 }] }, result: ['Romain cierra la herida; el niño abre los ojos y pregunta por su escorpión. Los vecinos, por fin, se acercan.'], fail: { e: { d: 0, flags: ['nino_secuelas'] }, result: ['Lo salváis, pero el veneno ya le ha comido media pierna. Cojeará toda su vida.'] } },
    { label: 'Buscar el antídoto en el Zoco', hint: 'Cuesta un día más. Usa un Antídoto del Pozo si lo tenéis.', e: { items: { antidoto: -1 }, d: 1, flags: ['nino_salvado'], echo: [{ id: 'eco_nino_salvado', in: 4 }] }, result: ['Corréis medio barrio. El antídoto llega justo.'] },
    { label: 'Castigar al dueño del escorpión', hint: 'El niño sobrevive; el otro llorará esto siempre.', e: { c: 1, flags: ['nino_castigo'] }, result: ['El pequeño dueño recibe una paliza ejemplar. El niño picado vive, y también el miedo.'] },
    { label: 'Ignorarlo: no es vuestro asunto', hint: 'Ojos que no ven…', e: { d: -1, flags: ['nino_muerto'], echo: [{ id: 'eco_nino_muerto', in: 4 }] }, result: ['Os alejáis. El llanto se corta antes de que lleguéis a la esquina.'] },
  ] },
  FX({ flags: ['q_m_nino'] }, 'Misión cumplida: El Niño y el Escorpión.'),
];
const M_LADRON: Node[] = [
  T('El Ladrón Arrepentido', 'Zoco de los Mil Soplos', 'zoco'),
  N('Notáis que falta peso en el cinturón. Antes de que lo busquéis, un hombre delgado os corta el paso, de rodillas, con vuestra bolsa en las dos manos temblorosas.'),
  S('Ladrón', 'Os he robado. Lo siento. Mi mujer… mis hijos tienen fiebre en el Bajo Zaryab. No he comido hace dos días. No lo habría hecho si hubiera otra salida.', 'sin atreverse a levantar la vista'),
  { t: 'choice', prompt: 'El ladrón espera vuestra sentencia.', options: [
    { label: 'Perdonarlo y darle de comer', hint: 'Cuesta 40 PO.', e: { gold: -40, d: 2, flags: ['ladron_perdonado'], echo: [{ id: 'eco_ladron_traicion', in: 4 }] }, result: ['Lo ayudáis a levantarse. Él llora sin ruido.'] },
    { label: 'Castigarlo: que aprenda', hint: 'Pierde una mano en la plaza.', e: { c: 1, alert: 0, rep: { mercaderes: 1 }, huella: 'Disteis un castigo ejemplar a un ladrón que sólo quería comer.' }, result: ['Los Mercaderes aprueban. Ninguno ha tenido hambre en su vida.'] },
    { label: 'Reclutarlo para el culto', hint: 'Un ladrón es un buen seguidor… y un buen rumor.', e: { pf: 1, follow: ['Ladrón Arrepentido'], d: 0 }, result: ['«Haré lo que ordenéis», dice. Y lo cumplirá, porque no tiene nada más.'] },
  ] },
  FX({ flags: ['q_m_ladron'] }, 'Misión cumplida: El Ladrón Arrepentido.'),
];
const M_DJINN: Node[] = [
  T('El Djinn Esclavizado', 'Zoco de los Mil Soplos', 'zoco'),
  N('En el tenderete de un comerciante gordo cuelga una lámpara de mercurio. Dentro, un djinn pequeño de humo gris trabaja moliendo especias que nadie ha comprado. Cuando os ve, sus ojos se llenan de agua.'),
  S('Djinn', 'Por favor. Han pasado ocho años. Ocho años. Rompedme si tenéis que hacerlo, pero no me dejéis aquí.', 'una voz de humo'),
  { t: 'choice', prompt: 'El comerciante sonríe: «Es mío. Está pagado.»', options: [
    { label: 'Liberarlo a la fuerza', hint: 'Altercado en el Zoco.', e: { pf: 5, alert: 1, rep: { mercaderes: -1, hijos: 1 }, follow: ['Djinn Liberado'], flags: ['djinn_liberado'] }, result: ['La lámpara se rompe contra el suelo. El humo gris se arremolina, bendice a Romain por tres segundos y se une al santuario.'] },
    { label: 'Comprarlo', hint: 'Cuesta 250 PO.', disabled: undefined, e: { gold: -250, d: 1, follow: ['Djinn Liberado'], flags: ['djinn_comprado'] }, result: ['El comerciante cuenta las monedas con una sonrisa. Vosotros, sin embargo, ya no pensáis en él.'] },
    { label: 'Usarlo: su fuerza alimenta el cristal', hint: '+10 PF, +3 Corrupción. Irreversible.', e: { pf: 10, c: 3, flags: ['djinn_usado'], huella: 'Exprimisteis a un djinn esclavizado para alimentar el cristal de Zahir.' }, result: ['El djinn grita, pero no hacia vosotros. Zahir bebe. El humo gris se hace ceniza.'] },
  ] },
  FX({ flags: ['q_m_djinn'] }, 'Misión cumplida: El Djinn Esclavizado.'),
];
const M_INQ: Node[] = [
  T('El Inquisidor Arrepentido', 'Plaza Central', 'plaza'),
  N('Un hombre con la túnica del Conclave, sin armas y sin escolta, os espera en un banco de la plaza, sentado como quien aguarda el verdugo.'),
  S('Inquisidor', 'He quemado a ciento tres personas. Las conté. Quiero desertar. Os puedo dar la distribución de la Ciudadela… y mi vida, si la queréis.', 'sin parpadear'),
  { t: 'choice', prompt: 'No sabéis si miente. Pero las manos de ese hombre no tiemblan.', options: [
    { label: 'Aceptarlo en el culto', hint: 'Arriesgado: puede ser una trampa.', e: { follow: ['Inquisidor Desertor'], d: -1, flags: ['inq_aceptado'], echo: [{ id: 'eco_inquisidor_aceptado', in: 3 }, { id: 'eco_inquisidor_traicion', in: 9 }] }, result: ['Los seguidores se apartan cuando entra al santuario.'] },
    { label: 'Matarlo aquí y ahora', hint: 'La justicia que nadie le dio a sus víctimas.', e: { c: 3, rep: { inquisidores: -1 }, huella: 'Matasteis a un Inquisidor desarmado que pedía clemencia.' }, result: ['No se resiste. Eso es lo peor.'] },
    { label: 'Entregarlo a Samira', hint: 'Ella decidirá.', e: { d: 1, rep: { conclave: 1 }, flags: ['inq_samira'], echo: [{ id: 'eco_inquisidor_entregado', in: 4 }] }, result: ['Samira no dice nada cuando lo recibe. Asiente una sola vez.'] },
  ] },
  FX({ flags: ['q_m_inq'] }, 'Misión cumplida: El Inquisidor Arrepentido.'),
];
const M_MARID: Node[] = [
  T('El Pacto con el Marid', 'Lago de los Silencios', 'cubo'),
  N('El agua se alza sin viento. De ella emerge un rostro de espuma, enorme, antiquísimo, que habla con la voz de varias personas a la vez.'),
  S('Marid', 'Hay un fragmento del cielo bajo mi lago. Es vuestro por una sola cosa: el recuerdo de alguien a quien amáis. Un nombre, una cara, un olor. Lo guardaré yo. Mejor que vosotros.', 'varias voces'),
  { t: 'choice', prompt: 'El Marid no miente. Los marids nunca mienten: sólo cobran.', options: [
    { label: 'Aceptar: entregar un recuerdo', hint: '+1 fragmento, +3 Corrupción. Irreversible.', e: { c: 3, flags: ['fragmento_marid', 'marid_pacto'], echo: [{ id: 'eco_marid', in: 2 }] }, result: ['Romain ofrece el nombre de una persona. El agua lo toma sin ruido y le devuelve un fragmento de hierro negro que pulsa.'] },
    { label: 'Rechazar con firmeza', hint: '+2 Devoción, pero el Marid será enemigo.', e: { d: 2, flags: ['marid_enemigo'], echo: [{ id: 'eco_marid_enemigo', in: 5 }] }, result: ['«Entonces el agua recordará esto», dice el Marid, y se hunde.'] },
    { label: 'Negociar un trato justo', hint: 'Persuasión CD 18', check: { skill: 'persuasion', dc: 18 }, e: { flags: ['fragmento_marid'], rep: { hijos: 1 }, huella: 'Negociasteis con un Marid sin ceder nada. Sólo una persona podría haberlo logrado.' }, result: ['Tras una hora de hablar de ríos y deudas, el Marid ríe como una cascada. «Os doy el fragmento. A cambio, no olvidéis que ha habido un río.»'], fail: { e: { c: 1, flags: ['marid_enemigo'], echo: [{ id: 'eco_marid_enemigo', in: 5 }] }, result: ['El Marid se ofende. «Habéis regateado con la memoria.» Se hunde sin responder.'] } },
  ] },
  FX({ flags: ['q_m_marid'] }, 'Misión cumplida: El Pacto con el Marid.'),
];
const M_JUICIO: Node[] = [
  T('El Juicio del Pueblo', 'Bajo Zaryab · una soga', 'bajo'),
  N('Un tumulto llena la calle. Una soga cuelga del arco del acueducto. Debajo, un guardia del Conclave atado, con la cara hinchada a golpes. Los vecinos lo rodean en silencio.'),
  S('Vecina', 'Se llevó a mi marido hace tres años. Nunca volvió. Le pedí que me dijera dónde estaba. Se rio. Hoy se ríe menos.', 'sin elevar la voz'),
  { t: 'choice', prompt: 'Los aldeanos esperan una señal.', options: [
    { label: 'Dejar que lo ejecuten', hint: '+2 Corrupción, +1 PF; el barrio se une al culto.', e: { c: 2, pf: 1, recruits: 2, flags: ['juicio_ejecutado'], echo: [{ id: 'eco_juicio_ejecutado', in: 4 }], huella: 'Dejasteis que colgaran a un guardia sin juicio.' }, result: ['La soga se tensa. Nadie vitorea. Luego dos vecinos se arrodillan ante el altar.'] },
    { label: 'Salvarlo', hint: '+2 Devoción, el barrio desconfía.', e: { d: 2, rep: { hijos: -1 }, flags: ['juicio_salvado'], echo: [{ id: 'eco_juicio_salvado', in: 3 }] }, result: ['Cortáis la soga. La vecina escupe en el suelo y se va sin mirar atrás.'] },
    { label: 'Juzgarlo con justicia', hint: 'Intimidar CD 14 para imponer el juicio. +1 Devoción, +1 Corrupción.', check: { skill: 'intimidar', dc: 14 }, e: { d: 1, c: 1, rep: { hijos: 1 }, recruits: 1, flags: ['juicio_justo'], huella: 'Presidisteis el juicio del guardia: ni soga ni indulto, sino verdad.' }, result: ['Cada vecino declara. El guardia confiesa catorce nombres. Lo entregáis al Conclave con la lista. El barrio respeta el método, aunque no el resultado.'], fail: { e: { c: 1 }, result: ['El tumulto os supera. Lo cuelgan igual, mientras gritáis.'] } },
  ] },
  FX({ flags: ['q_m_juicio'] }, 'Misión cumplida: El Juicio del Pueblo.'),
];

// ═══════════════ FACCIONES (7–10) ═══════════════
const F_MOTIN: Node[] = [
  T('El Motín de los Esclavos', 'Los Hijos del Simurg', 'coliseo'),
  S('Shib', 'Hay veinte djinns encadenados en las mazmorras de la Ciudadela. Si no los sacamos esta semana, los venden a la Mina.', 'jadeando'),
  { t: 'choice', prompt: 'Las mazmorras tienen golems de basalto y una sola entrada.', options: [
    { label: 'Infiltrarse', hint: 'Sigilo CD 16', check: { skill: 'sigilo', dc: 16 }, e: { pf: 5, rep: { hijos: 2 }, follow: ['Shib'], alert: 1, flags: ['djinns_liberados'] }, result: ['Pasáis entre los golems como sombras. Veinte llaves, veinte cadenas. Nadie os vio entrar. Nadie os verá salir.'], fail: { e: { alert: 3, rep: { hijos: 1 } }, result: ['Un golem despierta. Huís con diez, no con veinte.'] } },
    { label: 'Sobornar a un guardia', hint: '250 PO', e: { gold: -250, pf: 5, rep: { hijos: 2 }, follow: ['Shib'], flags: ['djinns_liberados'] }, result: ['El guardia cuenta las monedas y mira a otro lado.'] },
    { label: 'Atacar directamente', hint: '+2 Corrupción, combate difícil.', e: { c: 2, alert: 2, rep: { hijos: 2 } }, result: ['El basalto despierta con un crujido.'], then: [{ t: 'battle', enc: 'motin' }, FX({ pf: 5, follow: ['Shib'], flags: ['djinns_liberados'] }, 'Rompéis las cadenas con el ruido de una campana.')] },
  ] },
  FX({ flags: ['q_f_motin'] }, 'Misión cumplida: El Motín de los Esclavos.'),
];
const F_CARAVANA: Node[] = [
  T('La Caravana Perdida', 'Los Mercaderes del Zoco', 'zoco'),
  S('EaNassr', 'Mi sobrino Hakim salió hace una semana con tres camellos de seda negra. Los ghuls atacaron en el paso. Los supervivientes se ocultan en unas ruinas. Traedlos… y la seda, si queda.', 'frotándose el anillo'),
  N('Las ruinas huelen a podrido y a incienso rancio. Siete personas, la mitad heridas, os miran desde las sombras con ojos que han visto demasiadas cosas.'),
  { t: 'choice', prompt: 'La seda negra vale una fortuna. Las vidas, para EaNassr, mucho menos.', options: [
    { label: 'Escoltarlos de vuelta al Zoco', hint: '+150 PO, +1 aliado; emboscada de ghuls.', e: { gold: 150, rep: { mercaderes: 2 }, follow: ['Hakim'], d: 1, flags: ['caravana_escoltada'] }, result: ['Los ghuls salen de la arena como una marea.'], then: [{ t: 'battle', enc: 'caravana' }] },
    { label: 'Robarles la mercancía', hint: '+250 PO, +2 Corrupción, EaNassr se vuelve enemigo.', e: { gold: 250, c: 2, rep: { mercaderes: -2 }, flags: ['caravana_robada'], echo: [{ id: 'eco_caravana_robada', in: 3 }] }, result: ['Los supervivientes no se resisten. Alguno, creéis, murmura una maldición.'] },
    { label: 'Dejarlos: es demasiado peligroso', hint: '−1 Devoción, sin riesgo.', e: { d: -1, rep: { mercaderes: -1 } }, result: ['Volvéis al Zoco con las manos vacías y EaNassr os mira un rato largo.'] },
  ] },
  FX({ flags: ['q_f_caravana'] }, 'Misión cumplida: La Caravana Perdida.'),
];
const F_IMPUESTO: Node[] = [
  T('El Impuesto de Sangre', 'El Conclave en el Bajo Zaryab', 'bajo'),
  N('Un carro negro con ruedas de bronce se detiene en la plaza del barrio. Un Inquisidor desciende, escoltado por cuatro guardias. Abre un pergamino sin mirar a nadie.'),
  S('Recaudador', 'Por orden del Vizir: tres niños del barrio para el Ritual del Eclipse. Voluntarios, por supuesto. El Conclave es generoso con los voluntarios.', 'leyendo con tedio'),
  S('Aisha', 'Por favor… no tenemos qué ofrecerles. Ayudadnos.', 'agarrando vuestra manga'),
  { t: 'choice', prompt: 'Un barrio entero contiene la respiración.', options: [
    { label: 'Matar al recaudador', hint: '+3 Corrupción, +5 PF; el barrio se une al culto.', e: { c: 3, pf: 5, recruits: 3, alert: 2, rep: { conclave: -2 }, flags: ['impuesto_matado'], huella: 'Matasteis a un recaudador del Conclave delante de todo el barrio.' }, result: ['Las espadas salen de las vainas. El barrio mira.'], then: [{ t: 'battle', enc: 'recaudador' }] },
    { label: 'Pagar el impuesto', hint: '500 PO. +1 Devoción.', e: { gold: -500, d: 1, rep: { conclave: 1 }, flags: ['impuesto_pagado'] }, result: ['Pagáis. Los niños se quedan. El carro se va con un crujido de bronce.'] },
    { label: 'Negociar', hint: 'Persuasión CD 18. Vuelve con más hombres.', check: { skill: 'persuasion', dc: 18 }, e: { rep: { conclave: 0 }, echo: [{ id: 'eco_tributo', in: 6 }], flags: ['impuesto_negociado'] }, result: ['El recaudador cede, de mala gana. «Volveremos», dice. Y lo dice en serio.'], fail: { e: { c: 1, alert: 1 }, result: ['«Habéis insultado al Vizir.» Dos guardias se llevan a un niño.'] } },
  ] },
  FX({ flags: ['q_f_impuesto'] }, 'Misión cumplida: El Impuesto de Sangre.'),
];
const F_HEREJE: Node[] = [
  T('La Caza del Hereje', 'Los Inquisidores de la Arena', 'plaza'),
  S('Inquisidor Orm', 'Un hereje. Un joven djinn escapado de la Ciudadela, protegido por nidos de Hijos del Simurg. Recompensa: la vida de vuestro cristal, un poco de oro, un buen nombre.', 'suavemente'),
  N('Lo encontráis en un almacén vacío, tiritando, con las muñecas rojas de grilletes. Os mira sin pedir nada.'),
  { t: 'choice', prompt: 'El joven djinn no tiene más de doce años.', options: [
    { label: 'Capturarlo', hint: '+250 PO, +1 Corrupción.', e: { gold: 250, c: 1, rep: { inquisidores: 2, hijos: -2 }, huella: 'Entregasteis a un niño djinn a los Inquisidores por oro.' }, result: ['Orm sonríe. Cuenta las monedas. No pregunta qué hacéis con los ojos.'] },
    { label: 'Salvarlo', hint: '+5 PF, +1 aliado (Hijos del Simurg).', e: { pf: 5, rep: { hijos: 2, inquisidores: -2 }, follow: ['Joven Djinn'], flags: ['hereje_salvado'], echo: [{ id: 'eco_hereje', in: 5 }] }, result: ['Lo escondéis entre los estantes. Orm no volverá a creeros.'] },
    { label: 'Fingir su captura y ayudarlo a escapar', hint: 'Engaño CD 16. +250 PO y +3 PF.', check: { skill: 'engano', dc: 16 }, e: { gold: 250, pf: 3, rep: { hijos: 1 }, flags: ['hereje_salvado'], echo: [{ id: 'eco_hereje', in: 5 }] }, result: ['Orm inspecciona un cuerpo de arena y cuero con la cara del chico. «Bien hecho.» Paga, sonríe, se va.'], fail: { e: { c: 1, alert: 2, rep: { inquisidores: -2 } }, result: ['Orm huele la mentira. «Un cadáver de cuero.» Sus guardias salen del almacén antes de que terminéis la frase.'] } },
  ] },
  FX({ flags: ['q_f_hereje'] }, 'Misión cumplida: La Caza del Hereje.'),
];

// ═══════════════ RECLUTAMIENTO (27–29) ═══════════════
const R_PADRES: Node[] = [
  T('Los Padres Enfermos', 'Bajo Zaryab · cinco camas', 'bajo'),
  N('Cinco niños arden de fiebre en una choza de adobe. Cinco madres os miran. Aisha tiene un pergamino arrugado: el remedio de Khalil necesita Lágrima de Luna y una rama del árbol petrificado.'),
  { t: 'choice', prompt: 'No hay ingredientes para todos sin sacrificar algo.', options: [
    { label: 'Curar a los cinco', hint: 'Cuesta 4 materiales y 2 días de búsqueda. +5 PF y 5 seguidores.', e: { pf: 5, recruits: 5, d: 1, flags: ['padres_curados'] }, result: ['Cinco camas, cinco respiraciones. Las madres os besan las manos.'] },
    { label: 'Curar a dos', hint: 'Sólo hay ingredientes para dos. +2 PF, 2 seguidores.', e: { pf: 2, recruits: 2, flags: ['padres_parcial'], huella: 'Elegisteis quién de cinco niños viviría.' }, result: ['Elegís. Tres madres lloran en silencio. Dos os siguen.'] },
    { label: 'No curar a ninguno', hint: '−2 Devoción; los padres maldicen al grupo.', e: { d: -2, flags: ['padres_ninguno'], huella: 'Dejasteis morir a cinco niños enfermos.' }, result: ['Una madre escupe a vuestros pies. Otra no dice nada, que es peor.'] },
  ] },
  FX({ flags: ['q_r_padres'] }, 'Misión cumplida: Los Padres Enfermos.'),
];
const R_MONJES: Node[] = [
  T('Los Monjes de Kelemvor', 'Bajo Zaryab · una cripta', 'bajo'),
  N('Detrás de una puerta de carbón, nueve monjes con la cabeza afeitada rezan en voz baja. En el centro, un anciano de ojos blancos: el hermano Ezra.'),
  S('Ezra', 'Kelemvor mide las almas. Zahir las trueca. No necesito más para decidir.', 'sin volverse'),
  { t: 'choice', prompt: 'Romain conoce el rito de Kelemvor. Ezra lo sabe.', options: [
    { label: 'Convencerlos', hint: 'Persuasión CD 18. +3 seguidores y a Ezra.', check: { skill: 'persuasion', dc: 18, pc: 'romain' }, e: { recruits: 3, follow: ['Anciano Ezra'], d: 1, flags: ['monjes_unidos'] }, result: ['Romain habla de la balanza y del precio de un alma. Ezra baja la cabeza. «Qué cruel que me lo digas tú.»'], fail: { e: { d: -1 }, result: ['Ezra no se levanta. «No vendré. Pero guardaré vuestro secreto.»'] } },
    { label: 'Forzarlos', hint: '+3 Corrupción, +3 seguidores por miedo.', e: { c: 3, recruits: 3, flags: ['monjes_forzados'], huella: 'Obligasteis a nueve monjes de Kelemvor a servir a un dios que no era el suyo.' }, result: ['Los monjes ceden. Ezra no vuelve a hablar.'] },
    { label: 'Dejarlos', hint: '−1 Devoción, sin riesgo.', e: { d: -1 }, result: ['Cerráis la puerta. No sabéis si volverán a abrirla.'] },
  ] },
  FX({ flags: ['q_r_monjes'] }, 'Misión cumplida: Los Monjes de Kelemvor.'),
];
const R_LADRONES: Node[] = [
  T('Los Ladrones del Zoco', 'Zoco de los Mil Soplos', 'zoco'),
  S('Nadia', 'Somos buenos en lo que hacemos. Pero necesitamos un propósito. Y vosotros, protección. Seguro que eso se parece a una alianza.', 'jugando con una daga'),
  { t: 'choice', prompt: 'Nadia es sonriente y letal.', options: [
    { label: 'Aceptarlos', hint: '+3 seguidores y a Nadia, −1 Devoción.', e: { recruits: 3, follow: ['Nadia'], d: -1, flags: ['ladrones_aceptados'] }, result: ['Nadia saluda con la daga. Dos bolsas desaparecen. Una vuelve.'] },
    { label: 'Rechazarlos', hint: '+1 Devoción, pero los ladrones serán rivales.', e: { d: 1, rep: { mercaderes: 1 }, flags: ['ladrones_rivales'] }, result: ['Nadia escupe un hueso de dátil. «Otra vez será.»'] },
    { label: 'Usarlos como espías', hint: '+1 aliado, información, +1 Corrupción.', e: { c: 1, follow: ['Nadia'], flags: ['info_ciudadela'] }, result: ['Nadia sonríe: no ha dicho que sí, pero tampoco que no.'] },
  ] },
  FX({ flags: ['q_r_ladrones'] }, 'Misión cumplida: Los Ladrones del Zoco.'),
];

export const MORALES: QuestDef[] = [
  { id: 'm_nino', title: 'El Niño y el Escorpión', kind: 'side', district: 'bajo', giver: 'Un niño llora', blurb: 'Un niño picado por un escorpión doméstico. El veneno corre.', when: open('m_nino', 'q_m_nino'), days: 1, script: M_NINO, reward: 'Devoción · eco en 3 días' },
  { id: 'm_ladron', title: 'El Ladrón Arrepentido', kind: 'side', district: 'zoco', giver: 'Un ladrón', blurb: 'Te roban… y vuelven con la bolsa en las manos.', when: open('m_ladron', 'q_m_ladron'), days: 1, script: M_LADRON, reward: 'Devoción o un seguidor' },
  { id: 'm_djinn', title: 'El Djinn Esclavizado', kind: 'side', district: 'zoco', giver: 'Una lámpara de mercurio', blurb: 'Un djinn que lleva ocho años moliendo especias en un tenderete.', when: open('m_djinn', 'q_m_djinn'), days: 1, script: M_DJINN, reward: '+5 / +10 PF o un aliado' },
  { id: 'm_inq', title: 'El Inquisidor Arrepentido', kind: 'side', district: 'plaza', giver: 'Un banco de la plaza', blurb: 'Un Inquisidor quiere desertar. Ha quemado a ciento tres personas.', when: open('m_inq', 'q_m_inq'), days: 1, script: M_INQ, reward: 'Aliado · información · o Corrupción' },
  { id: 'm_marid', title: 'El Pacto con el Marid', kind: 'side', district: 'pozo', giver: 'El agua del lago', blurb: 'Un Marid ofrece un fragmento del meteorito a cambio de un recuerdo.', when: open('m_marid', 'q_m_marid'), days: 1, script: M_MARID, reward: 'Fragmento de meteorito · irreversible' },
  { id: 'm_juicio', title: 'El Juicio del Pueblo', kind: 'side', district: 'bajo', giver: 'Una soga en el acueducto', blurb: 'El barrio ha capturado a un guardia corrupto. Todos esperan una señal.', when: open('m_juicio', 'q_m_juicio'), days: 1, script: M_JUICIO, reward: 'Seguidores · Corrupción/Devoción' },
  { id: 'f_motin', title: 'El Motín de los Esclavos', kind: 'faction', district: 'zoco', giver: 'Shib (Hijos del Simurg)', blurb: 'Veinte djinns encadenados en las mazmorras de la Ciudadela.', when: c => has(c, 'cap3_done') && has(c, 'q_s_lago') && !has(c, 'q_f_motin'), days: 2, alert: 1, script: F_MOTIN, reward: '+5 PF · Shib' },
  { id: 'f_caravana', title: 'La Caravana Perdida', kind: 'faction', district: 'zoco', giver: 'EaNassr (Mercaderes)', blurb: 'Una caravana de seda negra atacada por ghuls.', when: open('f_caravana', 'q_f_caravana'), days: 2, script: F_CARAVANA, reward: '+150 / +250 PO · aliado' },
  { id: 'f_impuesto', title: 'El Impuesto de Sangre', kind: 'faction', district: 'bajo', giver: 'Aisha (Conclave)', blurb: 'El Conclave exige tres niños para el Ritual del Eclipse.', when: open('f_impuesto', 'q_f_impuesto'), days: 1, script: F_IMPUESTO, reward: '+5 PF o +1 Devoción' },
  { id: 'f_hereje', title: 'La Caza del Hereje', kind: 'faction', district: 'plaza', giver: 'Inquisidor Orm', blurb: 'Un niño djinn escapado de la Ciudadela. Nadie lo quiere vivo.', when: open('f_hereje', 'q_f_hereje'), days: 1, script: F_HEREJE, reward: '+250 PO o +5 PF' },
  { id: 'r_padres', title: 'Los Padres Enfermos', kind: 'side', district: 'bajo', giver: 'Aisha', blurb: 'Cinco niños con fiebre del Pozo.', when: c => has(c, 'q_s_lago') && !has(c, 'q_r_padres'), days: 2, script: R_PADRES, reward: '+5 PF · 5 seguidores' },
  { id: 'r_monjes', title: 'Los Monjes de Kelemvor', kind: 'side', district: 'bajo', giver: 'Romain', blurb: 'Nueve monjes escondidos del Conclave. Su líder duda de Zahir.', when: c => has(c, 'q_p_romain') && !has(c, 'q_r_monjes'), days: 1, script: R_MONJES, reward: '3 seguidores · Ezra' },
  { id: 'r_ladrones', title: 'Los Ladrones del Zoco', kind: 'side', district: 'zoco', giver: 'Nadia', blurb: 'Una banda de ladrones ofrece unirse a cambio de protección.', when: open('r_ladrones', 'q_r_ladrones'), days: 1, script: R_LADRONES, reward: '3 seguidores · Nadia' },
];
void done;
