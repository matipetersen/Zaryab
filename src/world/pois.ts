import type { Node } from '../story/types';
import type { Campaign } from '../state';
import { has } from '../state';

/** Lugar de interés: una escena corta dentro de un distrito. Cada visita consume una fase del día. */
export interface Poi {
  id: string; district: string; name: string; icon: string; desc: string; cd: number;
  /** Fases en que está abierto (0 amanecer · 1 día · 2 noche); por omisión, todas. */
  ph?: number[]; when?: (c: Campaign) => boolean; hidden?: boolean; npc?: string; script: Node[];
}
export const PHASE = ['Amanecer', 'Día', 'Noche'];
export const PHASE_ICON = ['🌅', '☀', '🌙'];

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const after = (f: string) => (c: Campaign) => has(c, f);

export const POIS: Poi[] = [
  { id: 'aisha_cocina', district: 'santuario', name: 'La cocina de Aisha', icon: '🍞', npc: 'aisha', cd: 3, desc: 'Olor a pan de arena y a cuna ajena.', script: [
    N('Aisha amasa sin mirar. Tararea algo que se corta justo antes del final, como siempre.'),
    S('Aisha', 'Come. No sé qué sois, pero estáis flacos.', 'sin levantar la vista'),
    { t: 'choice', prompt: '¿Qué hacéis?', options: [
      { label: 'Ayudarla a amasar', hint: '+1 víveres · vínculo', e: { food: 1, bond: { aisha: 1 } }, result: ['Amasáis en silencio. Cuando termina la tanda, Aisha os da la primera hogaza, todavía caliente.'] },
      { label: 'Preguntarle por la nana', hint: 'Vínculo · +1 Devoción', e: { d: 1, bond: { aisha: 1 } }, result: ['«Me la cantaba mi madre. Me la cantaba a mí y a un niño que no era mío.» No dice más. No hace falta.'] },
    ] },
  ] },
  { id: 'biblioteca_noche', district: 'santuario', name: 'Los estantes sin dueño', icon: '📚', ph: [2], cd: 5, desc: 'De noche, los libros sangran menos y susurran más.', script: [
    N('Entre los estantes hay volúmenes que nadie escribió. Uno se abre solo.'),
    { t: 'choice', prompt: 'Una página se ilumina en violeta.', options: [
      { label: 'Leerla entera', hint: '+4 PF · +1 Corrupción', e: { pf: 4, c: 1 }, result: ['Es una lista de nombres con fechas futuras. El primero es el vuestro. Cerráis el libro con las manos frías.'] },
      { label: 'Cerrarlo y apagar el candil', hint: '+1 Devoción', e: { d: 1 }, result: ['El libro intenta abrirse otra vez. Lo aplastáis bajo otro más pesado.'] },
    ] },
  ] },
  { id: 'farid_calle', district: 'bajo', name: 'Farid y su arpa', icon: '🎶', npc: 'farid', cd: 4, desc: 'Un niño toca en la esquina. No pide monedas.', script: [
    N('Farid toca tres notas, se detiene, las repite. Lleva días intentando recordar la cuarta.'),
    { t: 'choice', prompt: 'El niño os mira.', options: [
      { label: 'Sentaros a escuchar', hint: 'Vínculo con Farid', e: { bond: { farid: 1 } }, result: ['La cuarta nota no llega. Pero Farid sonríe como si sí.'] },
      { label: 'Dejarle unas monedas', hint: '−5 PO · vínculo ×2', e: { gold: -5, bond: { farid: 2 } }, result: ['«No hacía falta», dice. Se las guarda en el bolsillo de la camisa, justo sobre el corazón.'] },
    ] },
  ] },
  { id: 'taberna_escorpion', district: 'bajo', name: 'Taberna del Escorpión', icon: '🍺', ph: [1, 2], cd: 3, desc: 'Donde las mentiras se pagan en rondas.', script: [
    N('El tabernero sirve sin preguntar. En la mesa del fondo, dos guardias de bronce hablan demasiado alto, o lo bastante.'),
    { t: 'choice', prompt: 'Las voces cruzan la sala.', options: [
      { label: 'Invitar una ronda y escuchar', hint: '−5 PO · +2 rumores', e: { gold: -5, rumors: 2 }, result: ['Entre risas y bronce, oís de patrullas, de pasillos bajo los acueductos y de un mural de tiza que «llora cuando hay luna».'] },
      { label: 'Seguir a los guardias', check: { skill: 'sigilo', dc: 13 }, hint: 'Sigilo CD 13 · descubrís un lugar', e: { found: ['mural_tiza'], rumors: 1 }, result: ['Los seguís hasta un muro de adobe con tiza violeta. Lo que dibujaron ahí no está en ningún mapa.'], fail: { e: { alert: 1 }, result: ['Uno se gira. Tenéis que improvisar una excusa muy larga y muy mala.'] } },
    ] },
  ] },
  { id: 'mural_tiza', district: 'bajo', name: 'El mural que llora', icon: '🖌', ph: [2], hidden: true, cd: 8, desc: 'Un mural de tiza violeta, escondido tras un patio.', script: [
    N('El mural muestra un ave partida en siete. Sus ojos de tiza gotean al ritmo de vuestro pulso.'),
    { t: 'choice', prompt: 'Sentís que el cristal responde.', options: [
      { label: 'Apoyar la mano en el ave', hint: '+8 PF · +1 Corrupción', e: { pf: 8, c: 1, found: ['ratas_acueducto'] }, result: ['El cristal bebe. Cuando soltáis, un hilo de tiza apunta hacia el oeste, hacia los acueductos.'] },
      { label: 'Borrar un ojo con la manga', hint: '+2 Devoción · −1 Alerta', e: { d: 2, alert: -1 }, result: ['Dejáis de ser observados, un poco. El mural parece agradecerlo con una grieta menos.'] },
    ] },
  ] },
  { id: 'ea_puesto', district: 'zoco', name: 'El puesto de EaNassr', icon: '💍', npc: 'ea', cd: 4, desc: 'Anillos de hueso y negocios sin recibo.', script: [
    S('EaNassr', 'Mis mejores clientes son los que no vuelven a preguntar por el cambio.', 'sobándose el anillo de hueso'),
    { t: 'choice', prompt: 'EaNassr ladea la cabeza.', options: [
      { label: 'Regatear una baratija', hint: 'Persuasión CD 13 · +30 PO · vínculo', check: { skill: 'persuasion', dc: 13 }, e: { gold: 30, bond: { ea: 1 } }, result: ['Cerráis un trato donde nadie sabe quién robó a quién. EaNassr está encantado.'], fail: { e: { gold: -10 }, result: ['Os cobra la lección. Con intereses.'] } },
      { label: 'Invitarle a una copa', hint: '−6 PO · vínculo ×2', e: { gold: -6, bond: { ea: 2 } }, result: ['Brindáis por «las deudas bien pagadas». Es la primera vez que le veis reír sin mirar la puerta.'] },
    ] },
  ] },
  { id: 'shub_trastienda', district: 'zoco', name: 'La trastienda de Madam Shub', icon: '🪞', npc: 'shub', ph: [1, 2], cd: 5, desc: 'Espejos que devuelven rostros que no son los vuestros.', script: [
    S('Madam Shub', 'Cada espejo me debe un favor. Cada cliente, dos.', 'con una sonrisa de espejo roto'),
    { t: 'choice', prompt: 'Madam Shub os ofrece un trato.', options: [
      { label: 'Comprar información', hint: '−10 PO · +3 rumores · vínculo', e: { gold: -10, rumors: 3, bond: { shub: 1 } }, result: ['Os vende secretos al peso. Los de los demás, entiéndase.'] },
      { label: 'Dejar que os mire en un espejo', hint: '+1 Corrupción · +6 PF · vínculo', e: { c: 1, pf: 6, bond: { shub: 1 } }, result: ['El rostro del espejo os sonríe con vuestros dientes. Shub apunta algo en un cuaderno.'] },
    ] },
  ] },
  { id: 'samira_cuartel', district: 'plaza', name: 'El cuartel de la Guardia', icon: '🛡', npc: 'samira', ph: [0, 1], cd: 4, when: after('cap3_done'), desc: 'Capitana Samira, entre papeles y juramentos.', script: [
    S('Capitana Samira', 'Me pagan por obedecer. Nadie dijo que fuera gratis.', 'sin levantar la mirada del informe'),
    { t: 'choice', prompt: 'Samira os observa.', options: [
      { label: 'Ofrecer información sobre el Conclave', hint: 'vínculo · −1 rep. Conclave', e: { bond: { samira: 1 }, rep: { conclave: -1 }, found: ['mirador_plaza'] }, result: ['Samira toma notas y, sin que nadie lo vea, marca una cruz en un plano: un mirador olvidado sobre la plaza.'] },
      { label: 'Ayudar a un recluta en apuros', hint: '+1 Devoción · vínculo', e: { d: 1, bond: { samira: 1 } }, result: ['Samira no dice nada. Pero a la salida, un guardia os abre la puerta con un gesto de respeto.'] },
    ] },
  ] },
  { id: 'mirador_plaza', district: 'plaza', name: 'El mirador olvidado', icon: '🔭', hidden: true, ph: [0, 2], cd: 6, desc: 'Una torre sin nombre sobre el Capitolio.', script: [
    N('Desde aquí se ve todo: las patrullas, las campanas, el ir y venir de bronce. Alguien ha dejado un catalejo.'),
    { t: 'choice', prompt: 'Observáis la ciudad.', options: [
      { label: 'Memorizar las rondas', hint: '−2 Alerta', e: { alert: -2 }, result: ['Tres rutas de patrulla, dos horarios. Podréis evitarlos.'] },
      { label: 'Contar los refuerzos', hint: '+2 rumores · +4 PF', e: { rumors: 2, pf: 4 }, result: ['Más soldados de los que el Vizir admite. Más de los que la ciudad puede pagar.'] },
    ] },
  ] },
  { id: 'nafisa_salon', district: 'jardin', name: 'El salón de Lady Nafisa', icon: '🎭', npc: 'nafisa', ph: [1, 2], cd: 5, desc: 'Máscaras, té y venenos de buena crianza.', script: [
    S('Lady Nafisa', 'Aquí nadie miente. Todos fingen, que es más elegante.', 'agitando el abanico'),
    { t: 'choice', prompt: 'Nafisa ofrece té.', options: [
      { label: 'Aceptar el té', hint: 'Medicina CD 12 · vínculo ×2', check: { skill: 'medicina', dc: 12 }, e: { bond: { nafisa: 2 } }, result: ['Reconocéis la hierba amarga antes de beber. Nafisa asiente, como quien aprueba un examen.'], fail: { e: { pf: -3, bond: { nafisa: 1 } }, result: ['Estaba envenenado. Poco. Un recordatorio, no una amenaza.'] } },
      { label: 'Declinar con elegancia', hint: 'vínculo · +2 rumores', e: { bond: { nafisa: 1 }, rumors: 2 }, result: ['«Precavidos. Me gusta.» Os cuenta un chisme a cambio de ninguno.'] },
    ] },
  ] },
  { id: 'rosas_noche', district: 'jardin', name: 'Las rosas que sangran', icon: '🌹', ph: [2], cd: 6, desc: 'Rosas translúcidas que sangran néctar.', script: [
    N('De noche las rosas se abren. Cada pétalo guarda un deseo de alguien que no volvió.'),
    { t: 'choice', prompt: 'Un pétalo cae en vuestra mano.', options: [
      { label: 'Guardarlo para el altar', hint: '+6 PF · +1 Corrupción', e: { pf: 6, c: 1 }, result: ['El deseo ajeno os da fuerza. Y un poco de culpa, que es parecida.'] },
      { label: 'Devolverlo a la tierra', hint: '+1 Devoción', e: { d: 1 }, result: ['Lo enterráis bajo el ciprés más viejo. La rosa se cierra, aliviada.'] },
    ] },
  ] },
  { id: 'banos_olvidados', district: 'acueductos', name: 'Los baños olvidados', icon: '♨', ph: [0, 1], cd: 6, desc: 'Un lugar para que nadie os busque.', script: [
    N('Agua tibia, vapor y silencio. En las paredes quedan mosaicos de gente que se bañaba sin miedo.'),
    { t: 'fx', e: { alert: -1, pf: 2 }, note: 'Un buen baño: Alerta −1, +2 PF.' },
  ] },
  { id: 'ratas_acueducto', district: 'acueductos', name: 'El contrabandista del canal', icon: '🐀', hidden: true, ph: [2], cd: 6, desc: 'Un hombre sin nombre vende lo que nadie debería poder comprar.', script: [
    S('El Cojo', 'Nunca me habéis visto. Mejor para los dos.', 'desde la sombra de un arco'),
    { t: 'choice', prompt: 'El contrabandista abre una caja.', options: [
      { label: 'Comprar pociones', hint: '−30 PO · 2 pociones', e: { gold: -30, items: { pocion: 2 } }, result: ['Dos frascos, cerrados con cera negra. Probablemente son lo que dice la etiqueta.'] },
      { label: 'Venderle información del Conclave', hint: '+40 PO · +1 Alerta', e: { gold: 40, alert: 1 }, result: ['Paga bien. Demasiado bien para no ser sospechoso.'] },
    ] },
  ] },
  { id: 'lago_orilla', district: 'pozo', name: 'La orilla del Lago', icon: '🌊', ph: [2], cd: 6, desc: 'Un cielo invertido en el agua.', script: [
    N('La Lengua Muerta crece unos dedos más cada noche. En el agua, el cielo gira al revés.'),
    { t: 'choice', prompt: 'Algo en el reflejo os hace señas.', options: [
      { label: 'Mirar sin parpadear', hint: 'Arcanos CD 14 · +8 PF', check: { skill: 'arcanos', dc: 14 }, e: { pf: 8 }, result: ['Veis una escena: siete figuras sentadas en círculo. Una os mira. Lleva vuestra cara.'], fail: { e: { c: 1 }, result: ['El reflejo os devuelve la mirada y vosotros no lo olvidáis.'] } },
      { label: 'Rezar al Simurg', hint: '+1 Devoción', e: { d: 1 }, result: ['El agua se aquieta un instante. Es suficiente.'] },
    ] },
  ] },
  { id: 'abril_puesto', district: 'medinat', name: 'El puesto de Abril', icon: '🍯', npc: 'abril', when: after('cap6_done'), cd: 4, desc: 'Dulces de dátil y noticias de primera mano.', script: [
    S('Abril', 'Joren dice que sois de fiar. Joren no suele decir eso de nadie.', 'repartiendo dátiles'),
    { t: 'choice', prompt: 'Abril os mira esperando.', options: [
      { label: 'Ayudarla a repartir comida', hint: '−2 víveres · vínculo ×2', e: { food: -2, bond: { abril: 2 } }, result: ['El barrio os ve repartiendo dátiles. Nadie pregunta de qué lado estáis.'] },
      { label: 'Contarle historias del santuario', hint: 'vínculo · +1 Devoción', e: { d: 1, bond: { abril: 1 } }, result: ['Abril escucha como quien no ha tenido a nadie que le cuente cosas.'] },
    ] },
  ] },
  { id: 'ring_punos', district: 'medinat', name: 'El ring de los Puños Cerrados', icon: '🥊', when: after('cap6_done'), ph: [1, 2], cd: 5, desc: 'Apuestas, sudor y un gong oxidado.', script: [
    N('Panchi no puede evitarlo: se acerca al ring y mide con los ojos al campeón de turno.'),
    { t: 'choice', prompt: 'Alguien os ofrece una apuesta.', options: [
      { label: 'Apostar a que Panchi gana', hint: 'Atletismo CD 14 · ±40 PO', check: { skill: 'atletismo', dc: 14 }, e: { gold: 40 }, result: ['Panchi no pelea siquiera: el campeón retrocede. Cobráis sin sudar.'], fail: { e: { gold: -20 }, result: ['El campeón era mejor de lo que parecía.'] } },
      { label: 'Mirar y aprender', hint: '+3 PF', e: { pf: 3 }, result: ['Anotáis tres ideas y un nombre. Los nombres, a veces, valen más que las ideas.'] },
    ] },
  ] },
  { id: 'fuego_nomada', district: 'pico', name: 'El fuego de los Nómadas', icon: '🔥', when: after('cap6_done'), ph: [2], cd: 6, desc: 'Fuegos en las alturas, canciones del Vacío.', script: [
    N('Los Nómadas del Vacío cantan al cielo desnudo. Os hacen sitio sin preguntar.'),
    { t: 'choice', prompt: 'Una anciana os ofrece un cuenco.', options: [
      { label: 'Compartir el cuenco', hint: '+1 rep. Nómadas · +3 PF', e: { rep: { nomadas: 1 }, pf: 3 }, result: ['Es té de ceniza. Sabe a algo que no se puede nombrar, y por eso es sagrado.'] },
      { label: 'Preguntar por el tigre alado', hint: '+2 rumores', e: { rumors: 2 }, result: ['«Sólo mira sin miedo a quien no tiene nada que perder.» Os dan una pista y una advertencia.'] },
    ] },
  ] },
  { id: 'lapidas_noche', district: 'cementerio', name: 'Las lápidas sin nombre', icon: '🪦', when: after('cap6_done'), ph: [2], cd: 6, desc: 'Un ejército que Zaryab olvidó.', script: [
    N('Todas las lápidas están en blanco. Algunas se mueven un dedo cuando las miráis.'),
    { t: 'choice', prompt: 'Una de ellas tiene un nombre a medio grabar.', options: [
      { label: 'Terminar de grabarlo', hint: '+1 Devoción · +4 PF', e: { d: 1, pf: 4 }, result: ['Al terminar, el muerto deja de marchar. Descansa, al fin.'] },
      { label: 'Llevaros un hueso para el altar', hint: '+10 PF · +2 Corrupción', e: { pf: 10, c: 2 }, result: ['El hueso pesa más de lo que debería. El altar lo recibe con avidez.'] },
    ] },
  ] },
];
export const POI_BY_ID = Object.fromEntries(POIS.map(p => [p.id, p]));
export const HOSTILE = ['conclave', 'culto'];
export const FRONT_LABEL: Record<string, string> = { conclave: 'Conclave', nasnas: 'Nasnas', culto: 'Culto de Dahhak', libre: 'Libre' };
export const FRONT_COLOR: Record<string, string> = { conclave: '#c9a45c', nasnas: '#8fc4a8', culto: '#c06a8a', libre: '#7a9bd4' };
export const FRONT_DISTRICTS = ['bajo', 'zoco', 'plaza', 'acueductos', 'medinat'];
export const ROAMER_ENC: Record<string, string> = { conclave: 'recaudador', culto: 'infiltrado', nasnas: 'caravana' };

/** ¿Cierra la facción hostil que domina el distrito los puestos de personajes? Con vínculo ≥3 los vecinos os ocultan. */
export const closedByFront = (c: Campaign, p: Poi) => !!p.npc && HOSTILE.includes(c.front[p.district]) && (c.bond[p.npc] ?? 0) < 3;
export const poiState = (c: Campaign, p: Poi): 'ok' | 'night' | 'cd' | 'front' | 'hidden' | 'locked' => {
  if (p.hidden && !c.found.includes(p.id)) return 'hidden';
  if (p.when && !p.when(c)) return 'locked';
  if ((c.poiCd[p.id] ?? 0) > c.day) return 'cd';
  if (p.ph && !p.ph.includes(c.phase)) return 'night';
  if (closedByFront(c, p)) return 'front';
  return 'ok';
};
