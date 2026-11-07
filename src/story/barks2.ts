// Más voz en combate: frases nuevas, réplicas entre compañeros, líneas contra cada jefe y tono según el alma de la compañía.
// Igual que barks.ts, es sólo interfaz: no toca el motor ni la simulación. `{o}` = el otro personaje.
import type { Expr } from '../ui/pixPortraits';

export type Bark2Ev = 'win' | 'revived' | 'dodge' | 'lastStand' | 'praise';
export const EXTRA: Record<string, Record<Bark2Ev, string[]>> = {
  romain: {
    win: ['Que cada uno vuelva a su platillo.', 'Recemos por ellos. Después, por nosotros.', 'Hoy la balanza nos dejó pasar.'],
    revived: ['Kelemvor me devolvió. Debe haberse equivocado de hoja.', 'Vi la puerta. No era para mí.', 'Volví. No pregunten qué había del otro lado.'],
    dodge: ['La muerte me rozó y siguió de largo.', 'Todavía no es mi hora.', 'Cerca. Pero no.'],
    lastStand: ['Bueno, Kelemvor. Somos vos y yo.', 'Si tengo que pesarlos a todos solo, que así sea.', 'Me quedo. Alguien tiene que rezar por ellos.'],
    praise: ['Bien medido, {o}.', '{o}, eso fue justicia.', 'Que Kelemvor lo reciba, {o}. Buen golpe.'],
  },
  pact: {
    win: ['Respiren. Cuenten quién falta. Nadie falta.', 'De pie. Todos. Así me gusta.', 'Otra vez de pie. Siempre de pie.'],
    revived: ['Ya caí una vez. Y me levanté. Esto es igual.', 'El segundo aliento existe. Lo acabo de usar.', 'Azuran, no hoy.'],
    dodge: ['Las alas sirven para algo.', '¿Eso era todo?', 'Demasiado lento para un caído.'],
    lastStand: ['Solo yo. Mejor: nadie más se lastima.', 'Vengan. Uno por uno o todos juntos.', 'Mientras esté de pie, nadie toca a los caídos.'],
    praise: ['¡Eso, {o}!', '{o}, conmigo. Así se pelea.', 'Buen golpe, {o}. Lo vi.'],
  },
  rabb: {
    win: ['La hoja está satisfecha. Yo no sé qué siento.', 'Fin. Alguien anote lo que hice. Yo me lo voy a olvidar.', 'Silencio, hoja. Ya está.'],
    revived: ['¿Quién soy? Ah, sí. Rabb. Creo.', 'La espada me trajo de vuelta. Me va a cobrar.', 'Volví. Me falta un recuerdo. Uno chico.'],
    dodge: ['La hoja me corrió. Gracias, supongo.', 'Ni me di cuenta.', 'Casi me olvido de esquivar. Casi.'],
    lastStand: ['Bueno, hoja. Sin testigos. Hacé lo tuyo.', 'Si me olvido de todo, al menos esto lo termino.', 'Solos vos y yo, espada. Como siempre.'],
    praise: ['{o}, eso fue lindo. Raro, pero lindo.', 'La hoja te envidia, {o}.', 'Bien, {o}. Eso me lo voy a acordar.'],
  },
  joren: {
    win: ['Todos. Están todos. Esta vez están todos.', 'Listo. Junten flechas.', 'Nadie se quedó atrás. Bien.'],
    revived: ['No me entierren todavía.', 'Sigo acá. La Marca no me llevó, esto tampoco.', 'Vi a los de la Marca. No me esperaban.'],
    dodge: ['Lo vi venir.', 'Demasiado ruido para pegarme.', 'Ni cerca.'],
    lastStand: ['Como en La Marca. No. Esta vez no.', 'Me quedan flechas. Me quedan razones.', 'Solo. Ya sé cómo es. No me gusta.'],
    praise: ['Bien, {o}.', '{o}, buen tiro. Para no ser arquero.', 'Eso, {o}. Uno menos.'],
  },
  zyrthar: {
    win: ['Bueno. Aplausos, por favor.', 'Fue elegante. Lo de ustedes, no tanto.', '¿Ya? Me estaba entreteniendo.'],
    revived: ['Qué humillante. No vuelvan a mirarme así.', 'Estaba descansando los ojos.', 'Nadie vio eso. ¿Verdad?'],
    dodge: ['¿Me buscabas?', 'Por acá no.', 'Tarde. Siempre tarde.'],
    lastStand: ['Bueno. Ahora sí me pongo seria.', 'Sola en la oscuridad. Como en casa.', 'Qué suerte: nadie para robarme el mérito.'],
    praise: ['No está mal, {o}.', '{o}, casi elegante.', 'Ese fue tuyo, {o}. Por esta vez.'],
  },
  panchi: {
    win: ['¡GANAMOS! ¿Hay comida? Tiene que haber comida.', '¡Ja! ¡Que vengan más!', 'Me duele todo. ¡Qué lindo día!'],
    revived: ['¡No me dormí! Bueno, un poco.', '¡Volví! ¿Quién me pegó? Lo quiero conocer.', 'Ellie se reiría de esto.'],
    dodge: ['¡Ja! ¡Por arriba!', '¿Eso era un golpe?', 'Más rápido, abuelo.'],
    lastStand: ['¡Bien! ¡Todos para mí!', 'Ahora sí: sin nadie que me frene.', 'Panchi contra el mundo. Me gusta el cartel.'],
    praise: ['¡Eso, {o}! ¡Así se pega!', '{o}, ¡te invito una cerveza!', '¡Ese fue hermoso, {o}!'],
  },
};

/** Réplicas: cuando alguien habla, a veces otro le contesta. RE[quien contesta][a quien] — si no hay línea propia, una genérica. */
export const RE: Record<string, Record<string, string[]>> = {
  romain: {
    pact: ['Pact, no cargues con todo. La balanza es de los dos.'], rabb: ['Rabb, esa hoja habla demasiado. Vos no tanto.'],
    joren: ['Joren, nadie se queda atrás. Yo me encargo.'], zyrthar: ['Zyr\'thar, un día me vas a contar qué te ríe tanto.'], panchi: ['Panchi, más despacio. Kelemvor tiene cola.'],
    any: ['Que así sea.', 'Lo anoto en la balanza.'],
  },
  pact: {
    romain: ['Romain, si caigo, no me reces. Levantame.'], rabb: ['Rabb, la espada es tuya. No al revés.'],
    joren: ['Joren, cubrí a los de atrás. Yo voy adelante.'], zyrthar: ['Zyr\'thar, menos charla y más espalda.'], panchi: ['¡Panchi, la formación!'],
    any: ['Conmigo.', 'Entendido.'],
  },
  rabb: {
    romain: ['¿Kelemvor sabe mi nombre, Romain? Porque yo no.'], pact: ['Pact, sos el único que no le tiene miedo a la hoja.'],
    joren: ['Joren cuenta enemigos. Yo cuento lo que me olvido.'], zyrthar: ['Zyr\'thar, la hoja dice que le caés bien. Desconfiá.'], panchi: ['Panchi, a veces envidio tu cabeza vacía.'],
    any: ['La hoja opina igual.', 'Hm.'],
  },
  joren: {
    romain: ['Romain, rezá más bajo. Te oyen.'], pact: ['Te cubro, Pact.'], rabb: ['Rabb, mirá dónde pisás. Y con quién hablás.'],
    zyrthar: ['Zyr\'thar, por una vez, no te alejes.'], panchi: ['Panchi. Silencio. Por favor.'],
    any: ['Ajá.', 'Siguiente.'],
  },
  zyrthar: {
    romain: ['Romain, qué solemne. ¿Te duele la cola?'], pact: ['Pact, ¿siempre tan heroico? Agota.'],
    rabb: ['Rabb, tu espada tiene mejor conversación que vos.'], joren: ['Joren, sonreí. Es gratis.'], panchi: ['Panchi, qué ruido. Me encanta.'],
    any: ['Encantador.', 'Si vos lo decís.'],
  },
  panchi: {
    romain: ['¡Romain, después me bendecís los nudillos!'], pact: ['¡Pact, dejame uno a mí!'], rabb: ['¡Rabb, decile a la espada que es mi turno!'],
    joren: ['¡Joren, te gané! Bueno, voy ganando.'], zyrthar: ['¡Zyr\'thar, eso fue trampa! ¡Enseñame!'],
    any: ['¡Eso!', '¡Ja!'],
  },
};
export function reply(responder: string, speaker: string): string | null {
  const r = RE[responder]; if (!r) return null; const pool = [...(r[speaker] ?? []), ...(r.any ?? [])];
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

/** Al empezar un combate contra un jefe: el que tenga algo que decirle. */
export const BOSS: Record<string, Partial<Record<string, string[]>>> = {
  coloso: { pact: ['Un gigante de piedra. Ya vi caer cosas más altas.'], panchi: ['¡Es enorme! ¡Mejor! ¡Más para pegar!'], joren: ['Las piernas. Siempre las piernas.'] },
  tigre_alado: { joren: ['No le apunten a las alas. Todavía no sé si quiero matarlo.'], zyrthar: ['Un gatito con alas. Adorable. Peligroso.'], panchi: ['¡Un gato volador! ¡Lo quiero!'] },
  dahhak_final: { romain: ['Dahhak. Cien cuellos y ni un alma que pesar.'], pact: ['Otro dios que se alimenta de los demás. Se termina hoy.'], rabb: ['Las serpientes me miran. La hoja les contesta.'] },
  marid_guardian: { romain: ['Un trato viejo, una deuda vieja. Hoy se cobra.'], zyrthar: ['Mucha agua para tan poca paciencia.'], joren: ['Lejos del agua. Que no nos arrastre.'] },
  al_mazhar: { romain: ['Trece caras. Ninguna es la suya.'], rabb: ['Él sabe algo de mí. Lo voy a hacer hablar.'], pact: ['Le robó la voz a un muerto. Eso no se perdona.'], panchi: ['¡Devolvé las voces, viejo!'] },
  gul_amarat: { joren: ['Lo oigo bajo los pies. Muévanse.'], panchi: ['¡Un gusano! ¡De estos sí que me como uno!'], zyrthar: ['Odio los túneles. Me recuerdan a casa.'] },
  razul_final: { romain: ['Vizir. Usaste mi fe como un mapa. Ahora te leo yo.'], zyrthar: ['Un hombre sin cara. Por fin alguien a mi altura.'], pact: ['Detrás de cada máscara, otra. Rompámoslas todas.'] },
  simurg_eclipse: { pact: ['Zahir. Me hablaste desde adentro todo este tiempo.'], romain: ['Ningún dios está por encima de la balanza. Ni vos.'], rabb: ['Así que esta es la voz. Es más chica de lo que creía.'], zyrthar: ['El pájaro mentiroso. Encantada de conocerte, al fin.'], panchi: ['¡Un pájaro gigante! ¡Esto va a ser épico!'], joren: ['Lo tengo en la mira. Nunca lo tuve tan cerca.'] },
};

/** El alma de la compañía tiñe lo que dicen al empezar y al matar: oscuro con mucha Corrupción, luminoso con mucha Devoción. */
export const TONE: Record<'dark' | 'light', Record<string, { start: string[]; foeKilled: string[] }>> = {
  dark: {
    romain: { start: ['El cristal pide. Kelemvor calla. Hoy escucho al cristal.'], foeKilled: ['Al platillo oscuro. Que pese.'] },
    pact: { start: ['Ya no peleo para protegerlos. Peleo porque me gusta. Eso me asusta.'], foeKilled: ['Más. Necesito más.'] },
    rabb: { start: ['La hoja y yo estamos de acuerdo. Mala señal.'], foeKilled: ['Rico. No, no dije eso.'] },
    joren: { start: ['No cuento a los enemigos. Ya no.'], foeKilled: ['Que sufra. No, que caiga. Da igual.'] },
    zyrthar: { start: ['Ah, el olor de casa. Sangre y obediencia.'], foeKilled: ['Para el cristal. Que tenga hambre.'] },
    panchi: { start: ['Hoy no tengo hambre de comida.'], foeKilled: ['¡Otro para el altar!'] },
  },
  light: {
    romain: { start: ['Kelemvor está cerca. Lo siento en las manos.'], foeKilled: ['Descansá. Nadie te va a usar más.'] },
    pact: { start: ['Ya no estoy caído. Esta vez soy yo el que levanta.'], foeKilled: ['Que encuentres algo mejor del otro lado.'] },
    rabb: { start: ['Hoy la hoja está callada. Me gusta cómo suena eso.'], foeKilled: ['Lo siento. De verdad.'] },
    joren: { start: ['Esta vez llegamos a tiempo. Lo sé.'], foeKilled: ['Ya está. Ya no duele.'] },
    zyrthar: { start: ['Qué raro. Tengo ganas de proteger a alguien.'], foeKilled: ['Rápido y sin dolor. Me estoy ablandando.'] },
    panchi: { start: ['¡Por los del Bajo!'], foeKilled: ['¡Y ese por los chicos del barrio!'] },
  },
};

/** Cara del retrato según lo que pasa (y quién es). */
export function moodFor(pc: string, ev: string): Expr {
  if (ev === 'allyDown') return pc === 'panchi' || pc === 'zyrthar' ? 'enojo' : 'tristeza';
  if (ev === 'lowHp' || ev === 'lastStand') return pc === 'panchi' ? 'enojo' : 'tristeza';
  if (ev === 'revived' || ev === 'dodge') return 'sorpresa';
  if (ev === 'miss') return pc === 'zyrthar' ? 'sonrisa' : 'enojo';
  if (ev === 'crit' || ev === 'foeKilled' || ev === 'bossKilled' || ev === 'win' || ev === 'healed' || ev === 'praise') return pc === 'joren' && ev === 'foeKilled' ? 'neutral' : 'sonrisa';
  if (ev === 'boss') return 'enojo';
  return 'neutral';
}
