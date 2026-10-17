import type { Node } from './types';
import type { Effect } from '../state';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });
const FX = (e: Effect, note?: string): Node => ({ t: 'fx', e, note });
const IF = (flag: string, then: Node[], els?: Node[]): Node => ({ t: 'if', flag, then, else: els });
const T = (title: string, sub: string, bg: string): Node => ({ t: 'chapter', title, sub, bg });
const BG = (id: string): Node => ({ t: 'bg', id });

/** Interludios de relajación entre jefes: se disparan solos en el hub (ver pendingEvent). */
export const INTERLUDES: Record<string, Node[]> = {
  // ───────── tras Dahhak ─────────
  noche1: [
    T('La Cena de la Biblioteca', 'Un respiro · la primera noche sin campanas', 'choza'),
    N('Por primera vez desde que despertaron en aquel callejón, no suena ninguna campana. Aisha puso una mesa larga entre los estantes, con platos que no hacen juego y pan de arena que sabe un poco a ceniza. Los seguidores se sientan donde pueden: en los escalones, sobre cajas, en el suelo.'),
    S('Aisha', 'Mi marido decía que la mesa es el único altar que no necesita dioses. Coman. Mañana habrá guerra. Hoy hay pan.', 'sirviendo con una cuchara de madera'),
    { t: 'choice', prompt: 'La mesa está llena de gente que antes no sabía cómo estar en la misma habitación.', options: [
      { label: 'Ayudar a Aisha en la cocina', hint: 'Los gestos pequeños fundan los cultos más sólidos.', e: { d: 1, flags: ['cena_cocina'] }, result: ['Aisha les pone un cuchillo en la mano sin decir nada. Es su manera de decir gracias.'] },
      { label: 'Sentarse a escuchar a los seguidores', hint: 'Ranma, Cabernet y Apu tienen mucho que contar.', e: { pf: 2, flags: ['cena_escucha'] }, result: ['Cabernet cuenta cómo vendió una vez un vino sin alcohol a un Inquisidor. Apu jura que es mentira. Es verdad. Todos ríen.'] },
      { label: 'Quedarse apartados mirando la sala', hint: 'La costumbre de los que han visto morir a otros.', e: {}, result: ['Ven a quienes protegen cenar, discutir, tirarse miguitas. Es raro. Es bueno.'] },
    ] },
    S('Farid', 'Pact, ¿es verdad que tenés alas?', 'sentándose a su lado con el plato en equilibrio'),
    { t: 'choice', prompt: 'Farid tiene la cara limpia por primera vez. Espera.', options: [
      { label: '«A veces. Pero no las uso para huir.»', e: { d: 1 }, result: ['Farid asiente con una seriedad enorme. «Está bien. Yo tampoco huyo ya.»'] },
      { label: '«Prefiero no hablar de eso.»', e: {}, result: ['Farid se encoge de hombros: «Yo tampoco hablaba, antes. Si querés, después.»'] },
      { label: 'Mostrárselas un instante, en la sombra de los estantes', hint: 'Un secreto entre dos.', e: { flags: ['farid_vio_alas'] }, result: ['La luz sube por los estantes un segundo. Farid abre la boca. «¡Son como del pájaro del sueño!» Pact baja la mirada: no sabe si eso es bueno.'] },
    ] },
    N('En el tejado, Joren y Zyr\'thar hacen guardia sin hacer guardia: pasan una cantimplora de mano en mano.'),
    S('Zyr\'thar', 'Dicen que el muerto que respira… ¿es verdad lo que se cuenta de él, o lo inventaron tus remordimientos?', 'sin mirarle'),
    IF('q_p_joren', [{ t: 'choice', prompt: 'Joren tarda en contestar.', options: [
      { label: '«Es verdad, y no sé si podré con ello.»', e: { d: 1, flags: ['joren_abierto'] }, result: ['Zyr\'thar le pasa la cantimplora otra vez. Es una forma de decir «aquí estoy».'] },
      { label: '«No hablo de eso.»', e: {}, result: ['Zyr\'thar asiente. Los dos han vivido de callar. Callan.'] },
    ] }], [N('Joren se encoge de hombros y mira las estrellas, que esta noche sí se ven.')]),
    BG('limbo'),
    S('Zahir', 'Los veo reír. No esperaba que me gustara.', 'una voz suave, sin el eco habitual'),
    S('Zahir', 'Un uso de mi poder me sobra. Puedo devolver a Pact una de sus memorias: el nombre de quien le cosió las alas. Sólo tienen que pedirlo.', 'casi tímido'),
    { t: 'choice', prompt: 'Zahir ofrece un regalo sin precio visible.', options: [
      { label: 'Aceptar: Pact recuerda un nombre', hint: 'Zahir gana confianza. El Sello se acerca.', e: { c: 1, pf: 3, ruta: { sombra: 1 }, flags: ['zahir_regalo_1'] }, result: ['Pact abre los ojos. «Mirabel.» Es todo lo que dice. Se sienta en el suelo con la cara entre las manos.'] },
      { label: 'Rechazar: «Lo recordaré por mí mismo»', hint: 'Zahir calla un segundo de más.', e: { d: 1, ruta: { pueblo: 1 }, flags: ['zahir_rechazo_1'] }, result: ['Zahir ríe bajito. «Qué testarudos.» Se desvanece. No parece enfadado. Parece… tomado nota.'] },
    ] },
    FX({ flags: ['ev_noche1_done'] }, 'Descanso: el culto tiene una cena. Zahir, un primer regalo ofrecido.'),
  ],

  // ───────── tras el Marid ─────────
  noche2: [
    T('Lo que se Dice a Media Voz', 'Una visita inesperada en mitad de la noche', 'choza'),
    N('Llaman a la puerta de la biblioteca a una hora en que nadie llama. Es Samira, la capitana de la Guardia Imperial, sin armadura y con un manto sobre los hombros. Lleva tres días sin dormir y no lo disimula.'),
    S('Capitana Samira', 'Vine sola. Si alguien me sigue, no sé nada. Saben lo que hay bajo la Mina de Alabastro. Yo no. Quiero saberlo antes de que los Inquisidores lo sepan por mí.', 'sentándose sin que nadie se lo pida'),
    S('Abril', 'Dibujé el primer nivel de memoria. Los mineros no volvían. Los que volvían no hablaban.', 'dejando un cuaderno sobre la mesa'),
    { t: 'choice', prompt: 'Samira es leal al Conclave. O lo era. Les pide confianza.', options: [
      { label: 'Contárselo todo', hint: 'Persuasión CD 14. Una aliada dentro de la Guardia.', check: { skill: 'persuasion', dc: 14 }, e: { rep: { conclave: 1 }, flags: ['samira_confia'] }, result: ['Samira escucha hasta el final sin interrumpir. Cuando terminan, dice: «Si Razul sabía esto, no es el hombre que sirvo.» Se levanta. «Cuenten conmigo.»'], fail: { e: {}, result: ['Samira los mira con cautela: algo no cuadra. «Lo pensaré.» Se va antes del amanecer.'] } },
      { label: 'Contarle sólo lo justo', hint: 'Ni confía ni se enemista.', e: { flags: ['samira_justo'] }, result: ['Samira asiente, sin darse por satisfecha. «Es más de lo que me han dicho mis superiores.»'] },
      { label: 'Echarla: no hay nada que contar', hint: 'Samira se lo recordará.', e: { rep: { conclave: -1 }, flags: ['samira_hostil'] }, result: ['Samira se pone el manto despacio. «Qué lástima.» Cierra la puerta con cuidado.'] },
    ] },
    S('Romain', 'Samira dijo algo que no logro quitarme: «Los dioses no pesan lo mismo que los hombres.» Lo dijo ella. No yo.', 'esa noche, a solas, mirando una balanza vacía'),
    { t: 'choice', prompt: 'Romain les pide un momento.', options: [
      { label: 'Escucharlo sin decir nada', e: { d: 1 }, result: ['Romain habla durante una hora. De un templo, de un incendio, de la voz que lo llamó «Siervo». No pide respuestas.'] },
      { label: 'Decirle que Kelemvor sigue pesando', hint: 'Una frase de fe.', e: { d: 1, flags: ['romain_consolado'] }, result: ['Romain sonríe por primera vez en días. «Eso me lo dijo mi maestra. Gracias por recordármelo.»'] },
    ] },
    N('Más tarde, en la cocina, Panchi amasa pan con una furia que Aisha observa con respeto. «Es la primera masa que sobrevive a sus manos», dice. Panchi gruñe: «Es una masa muy bien educada.» Por un momento, Aisha se ríe, y es el sonido más raro de la noche.'),
    S('Pact Risen', 'Samira, ¿qué se jura, cuando se jura lealtad a un Vizir?', 'de guardia en la puerta, sin mirarla'),
    { t: 'choice', prompt: 'Pact y Samira, un aasimar y una soldado, hablan de promesas.', options: [
      { label: 'Contarle lo de Azuran', hint: 'Compartir una partición propia.', e: { d: 1, flags: ['pact_contó_azuran'] }, result: ['Samira escucha sin interrumpir. «Mi padre decía que un hombre partido por la mitad sigue siendo un hombre entero si sabe dónde está cada mitad.» Pact sonríe, agradecido.'] },
      { label: 'Hablar sólo del Conclave', e: {}, result: ['Samira asiente. Es lo suyo. Se entienden por lo que no dicen.'] },
    ] },
    FX({ flags: ['ev_noche2_done'] }, 'Una noche de confidencias. Samira, un cuaderno de Abril, las dudas de Romain, el pan de Panchi y la promesa de Pact.'),
  ],

  // ───────── tras Al-Mazhar ─────────
  noche3: [
    T('La Nana', 'La biblioteca vuelve a oírse', 'choza'),
    IF('huerfanos_culto', [N('Los trece niños de Al-Mazhar duermen en un rincón de la biblioteca, tapados con mantas. No hablan. Nadie preguntó cuántos entienden lo que son.')], [N('La biblioteca está en silencio. Demasiado. Es el silencio que sigue a una canción de huesos.')]),
    S('Farid', 'Aisha… ¿me cantás algo?', 'a media voz, desde el jergón'),
    N('Aisha duda. No tiene voz de cantante. Empieza igualmente, con una nana de Qadir que sólo ella recuerda. Poco a poco, desde los estantes, se unen los demás seguidores. Es la nana más desafinada de la ciudad. No hay otro sonido igual.'),
    { t: 'choice', prompt: 'Farid los mira. Sabe que algo le pasó en la cripta. Quiere preguntar.', options: [
      { label: 'Decirle la verdad: el Lich cantaba para él', hint: 'Cuesta, pero es lo justo.', e: { d: 1, flags: ['farid_sabe'] }, result: ['Farid asiente. «Lo sabía. Lo oía en sueños. Gracias por no mentirme.» Se duerme antes de que acabe la nana.'] },
      { label: 'Decirle que fue una pesadilla', hint: 'Protegerlo, por ahora.', e: { flags: ['farid_protegido'] }, result: ['«Está bien.» Farid cierra los ojos. Sonríe con la cara de quien prefiere creer.'] },
    ] },
    S('Rabb Locke', 'Mi espada dejó de susurrar hoy. Eso me asusta más que cuando susurraba.', 'afilando una hoja que no necesita ser afilada'),
    IF('rabb_activado', [N('Rabb sabe lo que significa. No lo dice. Su arma tiene el filo de un recuerdo que no es suyo, y es suyo.')], [N('Rabb envaina la espada, despacio, como quien cierra un libro que no quiere leer todavía.')]),
    BG('limbo'),
    S('Zahir', 'Uno de mis fragmentos se rompió esta noche. Lo sentí en los huesos. No sabía que podía doler.', 'una voz muy baja'),
    S('Zahir', 'Gracias por liberar a esos niños. Lo digo en serio. Es la primera vez que le digo gracias a alguien.', 'casi confuso'),
    { t: 'choice', prompt: 'Zahir está distinto. Más humano. Más peligroso.', options: [
      { label: '«¿Qué sos, Zahir?»', hint: 'Una pregunta directa.', e: { flags: ['zahir_pregunta'] }, result: ['Zahir tarda en contestar. «Un fragmento. Lo sé desde el principio. Se lo diré cuando el último esté en su sitio.»'] },
      { label: '«No necesitamos tus gracias.»', e: { c: 1, flags: ['zahir_rechazo_2'] }, result: ['«Claro que no.» Zahir se desvanece. Esa noche el cristal no late.'] },
    ] },
    S('Zyr\'thar', 'Mi hermana mayor me enseñó a lanzar un cuchillo sin ruido. También me enseñó que a quien te enseña, hay que enterrarlo antes de que te supere.', 'en el tejado, afilando'),
    S('Joren Hell', 'Mala enseñanza.', 'sin dejar de mirar las estrellas'),
    S('Zyr\'thar', 'Buena para sobrevivir.', 'con una media sonrisa que no llega a los ojos'),
    S('Panchi', '¿Se puede tener un hermano al que se quiere y se odia a la vez?', 'sentado en la escalera, sin mirar a nadie'),
    N('Nadie contesta. Todos lo saben.'),
    FX({ flags: ['ev_noche3_done'] }, 'Una nana desafinada, un dios que dice gracias y tres personas que hablan de hermanos.'),
  ],

  // ───────── tras Gul-Amarat ─────────
  noche4: [
    T('La Víspera', 'Última noche antes de la Ciudadela', 'choza'),
    N('Mañana subirán a la Ciudadela de los Susurros. Nadie lo dice. Aisha preparó el último pan con un gesto de despedida y los seguidores dejaron de cantar. Cada uno encuentra su manera de pasar la noche.'),
    IF('dibujo_residencial', [S('Farid', 'Ese dibujo… lo hice yo. Lo hice antes de enfermarme. ¿Dónde estaba?', 'sosteniendo el papel con las dos manos'), N('Nadie contesta. Aisha lo abraza. El pájaro torcido, con seis siluetas encima, queda sobre la mesa junto al pan.')]),
    IF('conoce_ellie', [
      N('Una sombra entra por el tejado: Sifra la Silente, con la venda de lino que dio a Panchi enroscada en la muñeca.'),
      S('Sifra (Ellie)', 'Un pacto sólo se rompe desde dentro. Cuando Zahir esté completo, sólo hay un instante: cuando cree que ha ganado. Si me traen ese instante, lo rompo.', 'tres frases, la primera en meses'),
      FX({ flags: ['ellie_sabe'] }, 'Ellie les dio la clave: el instante en que Zahir cree haber ganado.'),
    ]),
    { t: 'choice', prompt: 'La noche es larga. ¿A quién buscan?', options: [
      { label: 'A Romain, en la capilla', hint: 'Está haciendo la ronda de las almas.', e: { d: 1, flags: ['vispera_romain'] }, result: ['Romain les enseña la balanza vacía. «Quiero que sea lo primero que mire mañana.»'] },
      { label: 'A Pact, bajo el cristal roto del tejado', e: { d: 1, flags: ['vispera_pact'] }, result: ['Pact tiene la corona entre las manos. «Si muero mañana, que la use alguien más.»'] },
      { label: 'A Panchi, vendándose los puños', e: { flags: ['vispera_panchi'] }, result: ['Panchi sonríe con medio labio. «Traelo o no vengas. Voy a ir.»'] },
      { label: 'A Aisha y a Farid, que no fueron a dormir', hint: 'Lo que dejan atrás.', e: { d: 1, pf: 3, flags: ['vispera_aisha'] }, result: ['Aisha los abraza sin una palabra. Farid les da un dibujo: un pájaro, muy torcido, con seis personas encima.'] },
    ] },
    BG('limbo'),
    S('Zahir', 'Mañana suben hasta el Vizir. Les ofrezco algo que no pedí a ninguna otra compañía: una promesa.', 'serio'),
    S('Zahir', 'Cuando los fragmentos estén juntos, Farid estará sano; la corona de Pact, perdonada; el nombre de Rabb, devuelto; el hijo de nadie, un hijo de alguien. Todo.', 'sin apartar la vista'),
    { t: 'choice', prompt: 'Es la oferta más generosa que Zahir ha hecho nunca. Eso es lo que la hace sospechosa.', options: [
      { label: 'Aceptar la promesa', hint: 'Zahir confía en ustedes del todo.', e: { c: 2, pf: 6, ruta: { sombra: 2 }, flags: ['zahir_promesa'] }, result: ['Zahir sonríe. Es la sonrisa de alguien que ve su casa al final del camino.'] },
      { label: 'Pedirle que lo jure por el Simurg', hint: 'Una pregunta que no está en el guion.', e: { d: 1, flags: ['zahir_jura'] }, result: ['Zahir duda. «Lo juro por el Simurg.» La palabra suena rara en su boca, como un hueso en la sopa.'] },
      { label: 'Callar y escuchar', e: {}, result: ['Zahir no necesita que contesten. Sabe que oyeron.'] },
    ] },
    FX({ flags: ['ev_noche4_done'] }, 'La víspera: cada uno despidió a alguien. Zahir hizo su mejor oferta.'),
  ],

  // ───────── Panchi · Qadir-Kalmah (sólo si conoce a Ellie) ─────────
  qadir: [
    T('El Monasterio que se Mueve', 'Qadir-Kalmah · ruinas que caminan', 'hammam'),
    N('Sifra la Silente llega al amanecer, sin avisar, y deja caer una cuerda desde el tejado. «Panchi. Sólo vos. Ya.» Panchi la sigue sin preguntar. Cuando el sol está alto, la ciudad queda atrás y la arena empieza a vibrar bajo los pies.'),
    N('Qadir-Kalmah no está quieta. Es una ciudad de piedra blanca, de claustros y torres cortadas, que camina muy despacio sobre pies de arena. A veces se detiene a descansar y los pájaros se posan en sus almenas. A veces se pone en marcha y los monjes que no han muerto salen a barrer las losas.'),
    S('Sifra (Ellie)', 'Éste fue tu monasterio. Tu maestro me enseñó lo que sé. Vos ya habías huido cuando se cayó la última torre. Yo no.', 'por primera vez, una frase larga, con voz muy cansada'),
    S('Panchi', 'Lo sé. Lo supe siempre. No lo dije.', 'mirando una puerta cerrada'),
    IF('golem_aliado', [N('Detrás de Panchi, el golem Defectuoso se queda inmóvil a la entrada. Una runa se ilumina en su frente: reconoce el lugar.'), { t: 'choice', prompt: 'El golem fue la última obra del monasterio. ¿Se lo devuelven?', options: [
      { label: 'Dejar que el golem entre', hint: 'Volverá a ser lo que fue.', e: { d: 1, flags: ['qadir_visto', 'qadir_golem'] }, result: ['El golem cruza el umbral. En el claustro, los monjes se detienen. Uno, muy viejo, le toca la frente con dos dedos. «Hijo.»'] },
      { label: 'Traerlo de vuelta con ustedes', hint: 'Sigue siendo tuyo.', e: { flags: ['qadir_visto', 'qadir_solo'] }, result: ['El golem no se mueve. Ellie lo mira, asiente. «Es tuyo. Siempre lo fue.»'] },
    ] }], [
      { t: 'choice', prompt: 'Ellie lo mira. La puerta del claustro está entreabierta.', options: [
        { label: 'Entrar', hint: 'Enfrentar lo que dejó atrás.', e: { d: 1, flags: ['qadir_visto', 'qadir_solo'] }, result: ['Panchi cruza el umbral. Una hora después sale con los ojos rojos y una piedra en la mano. No dice nada. Ellie tampoco.'] },
        { label: 'No atreverse todavía', e: { flags: ['qadir_visto', 'qadir_rechazo'] }, result: ['Panchi se da la vuelta. Ellie no lo detiene. «Cuando quieras.» La ciudad sigue caminando.'] },
      ] }]),
    S('Sifra (Ellie)', 'Cuando llegue el Eclipse, vendré. No hay otra manera de romper un pacto que estando allí.', 'entregándole la venda otra vez'),
    FX({ flags: ['ev_qadir_done'] }, 'Qadir-Kalmah: el monasterio que se mueve. Ellie promete aparecer en el Eclipse.'),
  ],
};
