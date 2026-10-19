// Fase de inteligencia: la noche antes de un combate decisivo la compañía puede hacer DOS de tres esfuerzos
// (reconocer el terreno, interrogar a un cautivo, escuchar a un informante) y lo que averigüe se vuelve ventaja —o error— en la batalla.
// Inspirada en el «Asalto a Orchouma» (ver docs/ORCHOUMA.md). Todo el estado vive en banderas `i:<enc>:*`.
import type { Node, Opt, Skill } from './types';
import type { Campaign } from '../state';
import type { Battle } from '../engine/battle';
import type { TrapKind } from '../engine/traps';
import { has } from '../state';
import { cheb } from '../engine/grid';
import { ENCOUNTERS } from '../data/maps';

interface Recon { skill: Skill; dc: number; label: string; ok: string; bad: string }
interface Site {
  place: string; bg: string; hook: string;
  recon: [Recon, Recon, Recon, Recon];
  officer: { who: string; intro: string; talk: string; breakI: string; breakP: string; hold: string; dies: string };
  spy: { who: string; intro: string; offer: string };
}
export const INTEL: Record<string, Site> = {
  coloso: {
    place: 'el Capitolio', bg: 'plaza', hook: 'Las columnas del Capitolio vibran con un zumbido violeta. Dahhak prepara algo grande y los Nasnas ya cavan sus barricadas. Falta una noche.',
    recon: [
      { skill: 'sigilo', dc: 13, label: 'Rodear la plaza por los techos', ok: 'Cruzan las azoteas sin que una sola teja delate el paso. Desde arriba se ve cómo están plantadas las barricadas… y que bajo los adoquines sueltos hay cosas enterradas.', bad: 'Una teja suelta cae y un Nasnas levanta la cabeza. Retroceden antes de que den la voz, pero ya no se atreven a acercarse más.' },
      { skill: 'percepcion', dc: 13, label: 'Contar patrullas y relevos', ok: 'Anotan los turnos: cuándo cambia la guardia, de qué puertas salen los refuerzos de Dahhak y cuánto tardan.', bad: 'Las patrullas se cruzan sin patrón. Pierden la cuenta y vuelven con más dudas que respuestas.' },
      { skill: 'atletismo', dc: 14, label: 'Trepar el andamio del Coloso', ok: 'Llegan hasta la altura de las gemas. Hay una en el pecho que late más rápido que las demás: ahí está el punto flojo.', bad: 'El andamio cruje y cede. Se salvan colgando de una soga, y el ruido despierta a media plaza.' },
      { skill: 'arcanos', dc: 14, label: 'Leer las gemas del Coloso', ok: 'La escritura de las gemas es un contrato roto: Dahhak le debe obediencia que el Coloso ya no le tiene. Aprenden cómo sostener un hechizo en contra.', bad: 'Las gemas responden a la mirada. Un dolor blanco les parte la cabeza y se alejan con la nariz sangrando.' },
    ],
    officer: { who: 'un capitán Nasnas cautivo', intro: 'En un depósito atado a una columna hay un capitán Nasnas que sus compañeros dejaron atrás cuando se replegaron. Tiene la lengua hinchada y los ojos de quien ya hizo las cuentas.', talk: '«El Coloso no es suyo, ¿saben? Dahhak lo despierta con una gota de cada uno de nosotros. Cuando él pierda el control…»', breakI: 'Se quiebra entre sollozos: confiesa los relevos, la hora exacta de los refuerzos y la grieta del pecho del Coloso. Después no los mira más.', breakP: 'Lo escucha. Algo en la voz de ustedes le recuerda a alguien. Habla de los refuerzos: dos Nasnas por turno, por la puerta norte.', hold: 'Aprieta la mandíbula. Llora, pero no habla. Le queda poco.', dies: 'El capitán se desploma. Entre el miedo, el hambre y la herida, ya no despierta. Se llevó lo que sabía.' },
    spy: { who: 'una criada del Capitolio', intro: 'Una criada con las manos llenas de cal los intercepta en un pasillo. Dice que limpia las salas de Dahhak y que quiere salir de la ciudad antes del amanecer.', offer: '«Les cuento lo que vi. Ustedes me sacan de Zaryab. Trato justo, ¿no?»' },
  },
  al_mazhar: {
    place: 'la cripta de las trece máscaras', bg: 'limbo', hook: 'La cripta de Al-Mazhar canta desde hace tres noches. Cada canto levanta algo. Si entran a ciegas, entran al coro.',
    recon: [
      { skill: 'sigilo', dc: 13, label: 'Avanzar por las naves laterales', ok: 'Pasan por detrás del coro sin turbar la canción. Ven dónde duermen los cantores y qué losas están flojas.', bad: 'Un ghul gira la cabeza demasiado rápido. No los vio, pero ahora la canción tiene un compás nuevo: el de ustedes.' },
      { skill: 'percepcion', dc: 13, label: 'Escuchar el canto desde el umbral', ok: 'El canto tiene tres voces y una de ellas repite. Cuando la repetición se rompe, nace un ghul: ya saben cuándo mirar la grieta.', bad: 'La canción los marea. Pierden el hilo y vuelven al umbral sin nada.' },
      { skill: 'religion', dc: 14, label: 'Reconocer el ritual', ok: 'Es una liturgia invertida: las trece máscaras sostienen al Lich unas a otras. Quitar una cambia el cantar.', bad: 'Reconocen los versos, pero los leen del lado equivocado. Tienen una certeza falsa y no lo saben todavía.' },
      { skill: 'arcanos', dc: 14, label: 'Seguir los hilos de energía', ok: 'Rastrean el flujo hasta el trono: la energía sale de las losas del suelo. Ahí se abre el hueco por el que entra el Lich.', bad: 'Los hilos se enredan en sus dedos. Pasan un rato más cerca de la canción de lo que querrían.' },
    ],
    officer: { who: 'un acólito de las trece máscaras', intro: 'Al borde de la cripta, escondido entre ánforas, tiembla un acólito que huyó de la liturgia. Todavía lleva la máscara a medio quitar.', talk: '«Hay que cantar, o te cantan. Al-Mazhar no manda: pide, y uno obedece sin darse cuenta…»', breakI: 'Llora y lo suelta todo: la segunda voz, las losas flojas, el momento de la ronda en que el Lich respira para cantar otra vez.', breakP: 'Habla bajito, como si el eco lo oyera. Cuenta cuándo se levantan los ghuls extra y de dónde vienen.', hold: 'Se muerde los labios hasta sangrar. La canción le pesa más que ustedes.', dies: 'Se ahoga en un último verso que no es suyo. Ya no hay a quién preguntarle.' },
    spy: { who: 'un cantor desertor', intro: 'Un cantor sin máscara los alcanza en la escalera. Dice haber cantado trece años. Dice que quiere callar.', offer: '«Conozco el coro. Les doy el compás. Pero yo no vuelvo ahí abajo.»' },
  },
  gusano: {
    place: 'la mina de alabastro', bg: 'prison', hook: 'Cuatro niveles arriba, el silencio respira. Samira rezó para que la mina no los reconozca. Antes de bajar, la compañía tiene una noche.',
    recon: [
      { skill: 'sigilo', dc: 13, label: 'Explorar el nivel superior', ok: 'Descubren qué galerías están selladas por derrumbes viejos y qué piso está hueco. Marcan los tramos peligrosos en un croquis.', bad: 'El eco de un paso se multiplica por la roca. Algo, más abajo, deja de respirar un instante. Retroceden.' },
      { skill: 'percepcion', dc: 13, label: 'Seguir el rastro de los mineros', ok: 'Las huellas conducen en espiral. Hay marcas de cinceles: los mineros dejaron señales de dónde NO cavar.', bad: 'Las huellas se pisan y se borran. No logran separar qué es de ayer y qué es del Gusano.' },
      { skill: 'atletismo', dc: 14, label: 'Probar los apuntalamientos', ok: 'Con soga y fuerza, prueban los puntales. Saben qué vigas aguantan una pelea y cuáles son una trampa.', bad: 'Un puntal cede y casi les entierra la pierna. El polvo tarda en bajar y el silencio, también.' },
      { skill: 'medicina', dc: 14, label: 'Examinar a los afectados', ok: 'Los brazos del Gusano no son carne: son tejido muerto trabajando por un único corazón. Si cae el centro, se aflojan.', bad: 'Lo que ven los descompone. No aprenden nada útil y vuelven con una náusea que les dura el día.' },
    ],
    officer: { who: 'un capataz sobreviviente', intro: 'En una galería lateral, atado a una silla de capataz, un hombre de Samira que bajó con la primera cuadrilla. Está cuerdo. Eso es lo peor.', talk: '«Bajé con treinta. Volví solo. El Gusano no tiene ojos: oye. Oye los pasos, los gritos, hasta el miedo…»', breakI: 'Se quiebra y entrega lo que sabe: dónde el Gusano oye mal, qué brazo guarda la sala y cuánto tarda en recomponerse el centro.', breakP: 'Les cuenta de cómo lo vio moverse: despacio, calculando. Y de qué lado le falla el oído.', hold: 'No contesta. Tiembla de otra manera: de memoria, no de miedo.', dies: 'Se queda mirando un punto detrás de ustedes. Una vez, dos. Después deja de respirar.' },
    spy: { who: 'un minero con la lengua cortada', intro: 'Un minero sin lengua les escribe con carbón en la pared. Su letra es prolija. Dice que sabe un camino.', offer: '«CAMINO LIBRE POR EL OESTE. ÉL NO LO OYE. SÍGANME.»' },
  },
  razul_final: {
    place: 'la Ciudadela de los Susurros', bg: 'coliseo', hook: 'Joren conoce las mazmorras de la Ciudadela mejor que nadie. Razul las conoce mejor que Joren. Una noche para saber cuánto.',
    recon: [
      { skill: 'sigilo', dc: 14, label: 'Escurrirse por el sótano', ok: 'Joren los guía por una reja vieja: ven los pasillos, las guardias y las losas que Razul manda aflojar para los intrusos.', bad: 'Una reja chilla. Corren. Los guardias suben a ver y el sótano queda con más centinelas que antes.' },
      { skill: 'engano', dc: 14, label: 'Hacerse pasar por criados', ok: 'Con un uniforme robado y paciencia, recorren el servicio y escuchan a los criados contar quién duerme y quién no.', bad: 'Un criado los mira de más y pregunta por su hermano. Salen antes de que pregunte demasiado.' },
      { skill: 'percepcion', dc: 14, label: 'Mapear los susurros', ok: 'Los susurros de la Ciudadela no son brujería: son tuberías con voces. Cada una lleva al sitio exacto donde Razul escucha.', bad: 'Las voces los confunden. Tras un rato, no saben si oyeron algo o si algo los oyó.' },
      { skill: 'arcanos', dc: 15, label: 'Estudiar las máscaras de Razul', ok: 'Detrás de la máscara hay otra máscara: es un hechizo de espejo. Cuando una se rompe, la siguiente tarda en armarse.', bad: 'Algo en la máscara los mira de vuelta. Se llevan una jaqueca y la sensación de que Razul ya sabe que preguntaron.' },
    ],
    officer: { who: 'un Qilaat desertor, cautivo', intro: 'Joren y los suyos capturaron a un Qilaat que huía de la Ciudadela. Todavía lleva el escudo de obsidiana; se lo quitaron. Eso le dolió más que las cadenas.', talk: '«Razul no es lo que ustedes creen. No cree en nada. Por eso es tan peligroso: nunca duda…»', breakI: 'Cuenta todo: cómo respira Razul antes de cambiar de máscara, la guardia de los dos Inquisidores, y la puerta que el propio Vizir olvidó cerrar.', breakP: 'Recuerda, quizás por primera vez, por qué entró al servicio. Habla de las máscaras y de lo que Razul teme.', hold: 'Se vuelve hacia la pared. No tiene miedo de ustedes. Tiene miedo de Razul.', dies: 'Se muerde la lengua para no hablar. La herida lo mata antes de que lo vean venir.' },
    spy: { who: 'una sirvienta del Vizir', intro: 'Una mujer cubierta con un velo gris se cruza con ustedes en un callejón. Les ofrece un papel doblado. No dice quién la manda.', offer: '«Sé cómo es la Ciudadela por dentro. Sé cuándo la guardia descansa. Cuesta lo que ustedes saben pagar.»' },
  },
};

const K = (enc: string, k: string) => `i:${enc}:${k}`;

function recon(enc: string, s: Site): Node[] {
  const out: Node[] = [{ t: 'narr', text: `Salen a reconocer ${s.place}. Cuatro intentos; cada acierto vale información, cada error cuesta algo.` }];
  s.recon.forEach((r, i) => out.push({ t: 'choice', prompt: r.label + '.', options: [{ label: r.label, check: { skill: r.skill, dc: r.dc }, e: { flags: [K(enc, 'r' + i)] }, result: [r.ok], fail: { e: { flags: [K(enc, 'x' + i)] }, result: [r.bad] } }] }));
  out.push({ t: 'narr', text: 'Vuelven antes del amanecer con lo que vieron. Lo que traen no es lo que querían, sino lo que se pudo.' });
  return out;
}
function officer(enc: string, s: Site, attempt = 0): Node[] {
  const o = s.officer; const hasWaves = !!ENCOUNTERS[enc]?.waves?.length;
  const fail = (c: number): Opt['fail'] => attempt === 0 ? { result: [o.hold], then: officer(enc, s, 1) } : { result: [o.dies], e: { flags: [K(enc, 'of_muerto')], c } };
  return [
    ...(attempt === 0 ? [{ t: 'narr', text: o.intro } as Node, { t: 'say', who: o.who, text: o.talk } as Node] : [{ t: 'narr', text: 'Un último intento. Después de esto, no queda nada que preguntar.' } as Node]),
    { t: 'choice', prompt: `¿Cómo lo trabajan? (${attempt === 0 ? 'primer' : 'segundo y último'} intento)`, options: [
      { label: 'Quebrarlo a la fuerza', hint: `Intimidar CD 19 · obtienen TODO lo que sabe · +1 Corrupción`, check: { skill: 'intimidar', dc: 19 }, e: { c: 1, flags: [K(enc, 'of_jefe'), K(enc, 'of_ref')] }, result: [o.breakI], fail: fail(1) },
      { label: 'Ganarse su confianza', hint: `Persuasión CD 16 · obtienen ${hasWaves ? 'cuándo y por dónde llegan los refuerzos' : 'la debilidad del jefe'}`, check: { skill: 'persuasion', dc: 16 }, e: { flags: [K(enc, hasWaves ? 'of_ref' : 'of_jefe')] }, result: [o.breakP], fail: fail(0) },
      { label: 'Dejarlo en paz', result: ['Lo desatan y le dan agua. No saben si hicieron bien. Tampoco saben qué se perdieron.'] },
    ] },
  ];
}
function spy(enc: string, s: Site): Node[] {
  const r = Math.random(); const kind: 'trampa' | 'falso' | 'cierto' = r < 0.3 ? 'trampa' : r < 0.6 ? 'falso' : 'cierto';
  const p = s.spy;
  const benefit: Node = { t: 'choice', prompt: 'Su información sirve. ¿Cómo la usan?', options: [
    { label: 'Atacar de noche, por sorpresa', hint: 'los enemigos pierden su primer turno', e: { flags: [K(enc, 'sp_noche')] }, result: ['Van a la hora que él dijo. La guardia está en su peor momento.'] },
    { label: 'Entrar por la ruta oculta', hint: 'ven todas las trampas del mapa', e: { flags: [K(enc, 'sp_ruta')] }, result: ['Les marca un camino que nadie vigila. Llegan sin pisar nada que no deban.'] },
    { label: 'Atacar donde el jefe es más débil', hint: 'el jefe empieza con menos vida', e: { flags: [K(enc, 'sp_debil')] }, result: ['Les cuenta dónde le duele. Ellos van directo a ese punto.'] },
  ] };
  const trust = (k: typeof kind): Node[] => k === 'cierto' ? [benefit]
    : k === 'trampa' ? [{ t: 'fx', e: { flags: [K(enc, 'sp_emb')] }, note: 'Era una trampa. Entran por donde él dijo… y los esperaban.' }, { t: 'narr', text: 'Era una trampa. Entran por donde él dijo… y los esperaban.' }]
    : [{ t: 'fx', e: { flags: [K(enc, 'sp_falso')] } }, { t: 'narr', text: 'Lo que les dijo era falso, pero inofensivo: pierden la noche confiando en un dato que no existe.' }];
  const known = (k: typeof kind): Node[] => k === 'cierto' ? [{ t: 'narr', text: 'Lo miran bien: no esquiva la mirada, no cambia el ritmo. Dice la verdad.' }, benefit]
    : k === 'trampa' ? [{ t: 'narr', text: 'Miente. Y miente con un plan: los quiere llevar a un lugar concreto. Es una emboscada.' }, { t: 'choice', prompt: '¿Qué hacen con eso?', options: [
      { label: 'Devolverle la trampa', hint: 'ellos preparan la emboscada contra los emboscadores', e: { flags: [K(enc, 'sp_contra')] }, result: ['Aceptan su “ayuda”. Ahora son ellos los que esperan.'] },
      { label: 'Despacharlo', result: ['Lo dejan ir sin sospechar que supieran. Mejor así.'] },
    ] }]
    : [{ t: 'narr', text: 'Miente, pero sin malicia: repite lo que oyó, y lo oyó mal. No vale la pena.' }];
  const read = (n: number): Node[] => [{ t: 'choice', prompt: `¿Miente? (intento ${n + 1} de 3)`, options: [
    { label: 'Leerlo con atención', hint: 'Percepción CD 16 · detecta con certeza si miente', check: { skill: 'percepcion', dc: 16 }, result: ['Se detienen en cada gesto.'], then: known(kind), fail: { result: ['No logran leerlo: sus gestos no dicen nada.'], then: n < 2 ? read(n + 1) : [{ t: 'choice', prompt: 'No lo leen. ¿Confían?', options: [
      { label: 'Confiar', result: ['Apuestan a ciegas.'], then: trust(kind) },
      { label: 'Despacharlo', result: ['Prefieren no arriesgar.'] },
    ] }] } },
    { label: 'Confiar sin más', then: trust(kind) },
    { label: 'Despacharlo', result: ['Lo despachan. A veces el peligro está en no escuchar. A veces, en escuchar.'] },
  ] }];
  return [{ t: 'narr', text: p.intro }, { t: 'say', who: p.who, text: p.offer }, ...read(0)];
}

/** Guion de la fase de inteligencia para un encuentro (vacío si no corresponde). */
export function intelScript(enc: string): Node[] {
  const s = INTEL[enc]; if (!s) return [];
  const hub = (used: string[]): Node[] => {
    const act = (id: string, label: string, hint: string, body: Node[]): Opt => ({ label, hint, disabled: used.includes(id) ? 'Ya lo hicieron.' : undefined, then: [...body, ...(used.length + 1 >= 2 ? [{ t: 'narr', text: 'Se acaba la noche. No hay tiempo para más.' } as Node] : hub([...used, id]))] });
    return [{ t: 'choice', prompt: used.length === 0 ? 'Hay tiempo para DOS esfuerzos. ¿Qué hacen esta noche?' : 'Queda tiempo para uno más.', options: [
      act('rec', 'Reconocer el terreno', 'cuatro tiradas; descubre trampas, refuerzos y el punto flojo del jefe', recon(enc, s)),
      act('ofi', 'Interrogar al cautivo', 'Intimidar CD 19 o Persuasión CD 16 · dos fallos y muere', officer(enc, s)),
      act('esp', 'Escuchar al informante', 'ofrece algo, pero puede mentir (y puede ser una trampa)', spy(enc, s)),
      { label: 'Descansar y entrar así', hint: 'sin ventajas ni riesgos', result: ['Duermen lo que se puede dormir. Mañana será mañana.'] },
    ] }];
  };
  return [{ t: 'fx', e: { flags: [K(enc, 'done')] } }, { t: 'bg', id: s.bg }, { t: 'chapter', title: 'La noche antes', sub: 'Fase de inteligencia', bg: s.bg }, { t: 'narr', text: s.hook }, ...hub([])];
}
export const needsIntel = (c: Campaign, enc: string) => !!INTEL[enc] && !has(c, K(enc, 'done'));

// ───── efectos en el campo de batalla ─────
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/** Siembra las trampas del enemigo, aplica lo averiguado y devuelve las líneas que el jugador debe leer en el briefing. */
export function applyIntel(b: Battle, c: Campaign, enc: string): string[] {
  const s = INTEL[enc]; if (!s || !has(c, K(enc, 'done'))) return [];
  const f = (k: string) => has(c, K(enc, k)); const lines: string[] = [];
  const n = [0, 1, 2, 3].filter(i => f('r' + i)).length, bad = [0, 1, 2, 3].filter(i => f('x' + i)).length;
  // 1) el enemigo siembra tres trampas (ocultas salvo que se haya reconocido el terreno)
  let seed = hash(enc), rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const g = b.grid, put: { x: number; y: number }[] = []; const kinds: TrapKind[] = ['mina', 'red', 'foso'];
  for (let tries = 0; tries < 400 && put.length < 3; tries++) {
    const x = Math.floor(rnd() * g.w), y = Math.floor(rnd() * g.h), t = g.at(x, y);
    if (!t || t.blocked || t.obj || t.hid || !(t.kind === 'floor' || t.kind === 'diff') || b.unitAt(x, y) || b.traps.some(q => q.x === x && q.y === y)) continue;
    if (g.spawns.pc.some(p => cheb(p, { x, y }) < 5) || put.some(p => cheb(p, { x, y }) < 4)) continue;
    put.push({ x, y });
  }
  const reveal = n >= 1 || f('sp_ruta');
  put.forEach((p, i) => b.traps.push({ x: p.x, y: p.y, kind: kinds[i % 3], dc: 15, disarm: 13, hidden: !reveal, armed: true }));
  if (put.length) lines.push(reveal ? `🗺 Conocen las ${put.length} trampas que sembró el enemigo.` : `⚠ El enemigo sembró ${put.length} trampas que no conocen: usen Buscar.`);
  // 2) jefe y soldados
  const foes = b.units.filter(u => u.side === 'foe' && u.sprite !== 'wall'); const boss = foes.find(u => u.traits.includes('boss')) ?? [...foes].sort((a, z) => z.maxHp - a.maxHp)[0];
  let cut = 0; if (n >= 3) cut += .1; if (n >= 4) cut += .1; if (f('of_jefe')) cut += .12; if (f('sp_debil')) cut += .12; cut = Math.min(.3, cut);
  if (boss && cut) { boss.maxHp = Math.round(boss.maxHp * (1 - cut)); boss.hp = boss.maxHp; lines.push(`🎯 Conocen el punto débil del jefe: empieza con ${Math.round(cut * 100)} % menos de vida.`); }
  if (bad >= 3 && n === 0) { for (const u of foes) { u.maxHp = Math.round(u.maxHp * 1.15); u.hp = u.maxHp; } lines.push('🚨 Los vieron: el enemigo está alerta y refuerza sus filas (+15 % de vida).'); }
  // 3) sorpresa
  const hasWaves = !!ENCOUNTERS[enc]?.waves?.length;
  if (n >= 3 || f('sp_noche') || f('sp_contra') || (f('of_ref') && !hasWaves)) { for (const u of foes) u.surprised = true; lines.push('🌙 Los atrapan desprevenidos: los enemigos pierden su primer turno.'); }
  if (f('sp_emb')) { for (const u of b.units) if (u.side === 'pc') u.surprised = true; lines.push('🪤 La emboscada del informante: la compañía pierde su primer turno.'); }
  if (f('sp_falso')) lines.push('🌫 El dato del informante era falso: no sirve de nada.');
  if (f('of_muerto')) lines.push('☠ El cautivo murió sin hablar.');
  // 4) refuerzos
  const delay = (hasWaves ? (f('of_ref') ? 2 : 0) + (n >= 2 ? 1 : 0) : 0);
  if (delay) { const orig = b.onRound; b.onRound = (bb, r) => { if (r - delay >= 1) orig?.(bb, r - delay); }; lines.push(`⏳ Saben cuándo llegan los refuerzos: se retrasan ${delay} ${delay === 1 ? 'ronda' : 'rondas'}.`); }
  return lines;
}
