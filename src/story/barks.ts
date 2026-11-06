import { NAMES } from '../engine/synergy';

/**
 * Frases de combate («barks»): una línea corta por personaje y evento, elegida al azar.
 * Son sólo de interfaz: no tocan el motor ni la simulación. `{o}` es el otro personaje (el caído, el que cura).
 */
export type BarkEv = 'allyDown' | 'foeKilled' | 'bossKilled' | 'crit' | 'lowHp' | 'healed' | 'miss' | 'start';

const L: Record<string, Record<BarkEv, string[]>> = {
  romain: {
    start: ['Kelemvor, mirá bien. Hoy pesamos a muchos.', 'Que la balanza no tiemble. Yo sí, un poco.', 'Nadie muere antes de su hora. Hoy, menos.', 'Pongan los platillos. Empezamos.'],
    allyDown: ['¡{o}! No es tu hora, ¿me oíste?', '{o}, aguantá. La balanza todavía no se inclina.', 'Kelemvor, a {o} no. Todavía no.', '¡Cúbranme! Voy por {o}.'],
    foeKilled: ['Pesado y medido.', 'Que encuentres el camino. Lejos de acá.', 'Uno menos en el platillo.', 'Descansá. Ya no te toca pelear.'],
    bossKilled: ['Esta cuenta también se cierra.', 'La balanza dictó. No yo.', 'Kelemvor lo recibe. Que lo juzgue con paciencia.'],
    crit: ['La balanza se inclinó de golpe.', 'Eso pesó.', 'Justicia, y de la rápida.'],
    lowHp: ['Me estoy pesando a mí mismo. No me gusta.', 'Todavía no, Kelemvor. Tengo trabajo.', 'Sangro. La balanza sigue firme.'],
    healed: ['Gracias, {o}. Te lo anoto del lado bueno.', '{o}, eso fue misericordia. Lo noto.', 'Vuelvo. La balanza también.'],
    miss: ['La mano tiembla. La fe no.', 'Mal medido.', 'Ni el platillo lo tocó.'],
  },
  pact: {
    start: ['Detrás de mí. Para esto sirven las alas.', 'Azuran, si estás despierto, hoy es buen día.', 'Formación. Nadie cae mientras yo esté de pie.', 'Respiren. El segundo aliento es mío.'],
    allyDown: ['¡{o}! Levantate, te presto el aliento.', 'No. A {o} no se lo llevan.', '¡{o} cayó! Conmigo, ¡ahora!', 'Azuran, ayudame con {o}.'],
    foeKilled: ['Siguiente.', 'Ni dioses ni djinns. Ni vos.', 'Caído. Sé cómo se siente.', 'Despejado. Avancen.'],
    bossKilled: ['Otro dios falso que aprende a caer.', 'Se terminó. Respiren conmigo.', 'Por un momento la corona pesó menos.'],
    crit: ['¡Fuego invertido!', 'Eso fue Azuran. O yo. Da igual.', 'El mandoble recuerda mejor que yo.'],
    lowHp: ['Me queda un aliento. Uno basta.', 'Ya caí una vez. Sé levantarme.', 'Las alas arden. Sigo.'],
    healed: ['Gracias, {o}. Te debo un aliento.', '{o}, otra vez de pie. Gracias.', 'Siento el calor. Gracias.'],
    miss: ['Las alas me desequilibran.', 'Azuran se ríe de eso. Yo no.', 'Otra vez. Más cerca.'],
  },
  rabb: {
    start: ['La espada tiene hambre. Yo, curiosidad.', 'Después que alguien me diga mi nombre.', 'Silencio, hoja. Hoy mando yo.', 'Ya oigo la frase que quiere escribir.'],
    allyDown: ['¡{o}! La espada dice que no importa. Miente.', '{o}, no te atrevas a olvidarte de mí.', 'Callate, hoja. ¡Voy por {o}!', 'Alguien cúbrame. {o} está en el suelo.'],
    foeKilled: ['La hoja firmó. Yo sólo sostuve.', 'Uno más en el contrato.', '¿Ese fui yo o fue ella?', 'Tachado.'],
    bossKilled: ['La espada está contenta. Eso me preocupa.', 'Fin del capítulo. El siguiente lo elijo yo.', 'Firmado con mi nombre. El que sea.'],
    crit: ['La hoja suspiró. Mala señal.', 'Esa frase la escribió ella.', 'Maldición cumplida.'],
    lowHp: ['La hoja me pide más. No tengo.', 'Si caigo, que nadie lea lo que escribe.', 'Me olvido de cosas. Como de esquivar.'],
    healed: ['Gracias, {o}. La hoja no te lo agradece.', 'Esto me lo voy a acordar. Bien.', '{o}, te debo un recuerdo.'],
    miss: ['La hoja falló a propósito. Lo juro.', 'Mi mano o la suya, no sé.', 'Hasta la espada se ríe.'],
  },
  joren: {
    start: ['Ya los conté. Son más.', 'Flechas listas. Nadie se queda atrás esta vez.', 'Silencio. Sé dónde respiran.', 'Que no sea como en La Marca.'],
    allyDown: ['¡{o}! No. No otra vez.', '{o}, no me hagas enterrarte.', 'Cubran a {o}. ¡Yo lo marco!', 'Otra vez llego tarde. ¡{o}!'],
    foeKilled: ['Abajo.', 'Uno. Siguiente.', 'No me vio venir.', 'Ese no se levanta.'],
    bossKilled: ['Listo. Ahora se puede respirar.', 'Que alguien lo anote. Yo no quiero.', 'Lo tuve en la mira desde la entrada.'],
    crit: ['Entre las costillas.', 'Cobertura, decía.', 'Ahí. Justo ahí.'],
    lowHp: ['Tengo sangre en los ojos. Igual veo.', 'No es la primera vez. Ojalá la última.', 'Si caigo, sigan. Siempre siguen.'],
    healed: ['Gracias, {o}. No hacía falta.', '…Gracias.', '{o}, te debo una. Y yo pago.'],
    miss: ['El viento.', 'Mal. Respirar, de nuevo.', 'Se movió. No debería.'],
  },
  zyrthar: {
    start: ['Qué lindo. Todos mirando para el lado equivocado.', 'Avísenme cuando sea divertido.', 'Yo no estoy. Hasta que esté.', 'Hagan ruido. Lo necesito.'],
    allyDown: ['¿{o}? Qué falta de estilo. Levantate.', 'Nadie toca a {o}. Eso es mío.', '{o} cayó. Ahora sí me enojé.', 'Ay, {o}. Siempre en el medio.'],
    foeKilled: ['Ni lo vio.', 'Silencio. Así me gusta.', 'Otro que no leyó la letra chica.', 'De nada.'],
    bossKilled: ['¿Ese era el dios? Decepcionante.', 'La Casa me habría pagado el triple.', 'Anótenmelo. Con mi nombre bien escrito.'],
    crit: ['Por la espalda. Como manda la tradición.', 'Justo donde duele.', 'Eso fue arte.'],
    lowHp: ['Bueno. Esto ya no es divertido.', 'Mi sombra me está esperando. Que espere.', 'Sangro con elegancia, al menos.'],
    healed: ['{o}, no te pongas sentimental.', 'Gracias. No se lo cuentes a nadie.', 'Mmm. Útil.'],
    miss: ['Eso fue una advertencia.', 'A propósito. Para que tenga esperanza.', 'Ni una palabra, Panchi.'],
  },
  panchi: {
    start: ['¡Bien! Ya me estaba aburriendo.', 'Pongan las lentejas. Esto dura poco.', '¿Quién quiere el primero? Yo.', 'Respirar, golpear, respirar. Fácil.'],
    allyDown: ['¡{o}! ¿Quién fue? ¡¿QUIÉN FUE?!', '{o}, levantate, cabezón. Te necesito.', 'Nadie toca a {o}. Nadie.', '¡Aguantá, {o}! Voy para allá.'],
    foeKilled: ['¡Al suelo!', 'Ese no come más.', '¡Siguiente!', 'Uno. ¿Contamos?'],
    bossKilled: ['¡Ja! ¿Eso era todo, dios de pacotilla?', 'Ahora sí. Ahora se come.', 'Me duelen los nudillos. Valió.'],
    crit: ['¡Eso sonó a hueso!', '¡Puño de Medinat!', 'Ellie, ¿viste eso?'],
    lowHp: ['Estoy bien. Bueno, casi. Más o menos.', 'Tengo cuerda para rato. Poca.', 'Duele. Me gusta. No, mentira, duele.'],
    healed: ['¡Gracias, {o}! Te invito una cena.', 'Así sí. ¡Vuelvo!', '{o}, sos lo más.'],
    miss: ['¡Se movió! ¡Tramposo!', 'Era un amague. Claro.', 'Bah. El próximo va.'],
  },
};
export const BARK_LINES = L;

const lastLine: Record<string, string> = {};
/** Una frase al azar para `pcId` ante `ev` (sin repetir la última), o null si no hay. */
export function bark(pcId: string, ev: BarkEv, ctx?: { other?: string }): string | null {
  const pool = L[pcId]?.[ev]; if (!pool?.length) return null;
  const o = ctx?.other ? (NAMES[ctx.other] ?? ctx.other) : '';
  const usable = pool.filter(l => (o || !l.includes('{o}')) && l !== lastLine[pcId + ev]);
  const list = usable.length ? usable : pool.filter(l => o || !l.includes('{o}')); if (!list.length) return null;
  const line = list[Math.floor(Math.random() * list.length)]; lastLine[pcId + ev] = line;
  return line.replace(/\{o\}/g, o);
}

/** Probabilidad de que un evento dispare una frase (los graves siempre). */
const CHANCE: Record<BarkEv, number> = { start: 1, allyDown: 1, bossKilled: 1, lowHp: 0.9, crit: 0.6, foeKilled: 0.45, healed: 0.5, miss: 0.25 };
/** Estos ignoran la pausa de dos turnos (pero no el límite de uno por evento y ronda). */
const URGENT: BarkEv[] = ['allyDown', 'bossKilled', 'start'];

/**
 * Freno para que no se llene de frases: como máximo una cada 2 turnos (salvo las urgentes)
 * y una sola por tipo de evento en cada ronda.
 */
export class BarkGate {
  turn = 0; private last = -99; private seen = new Map<BarkEv, number>();
  tick() { this.turn++; }
  allow(ev: BarkEv, round: number): boolean {
    if (this.seen.get(ev) === round) return false;
    if (!URGENT.includes(ev) && this.turn - this.last < 2) return false;
    if (Math.random() >= CHANCE[ev]) return false;
    this.seen.set(ev, round); this.last = this.turn; return true;
  }
}

/** Versión corta para el modo diorama (texto pixelado): las dos primeras palabras, sin signos. */
export const shortBark = (line: string) => line.replace(/[¿?¡!.,…«»"]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).join(' ').slice(0, 12);
