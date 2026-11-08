// Exporta toda la historia (capítulos, entreactos, fogatas, interludios, misiones, eventos y finales) a Markdown,
// en el orden en que se juega, con las decisiones, sus consecuencias y las variantes por bandera.
// Uso: npx tsx scripts/export-story.ts [salida.md]
import { writeFileSync } from 'node:fs';
import type { Node, Opt } from '../src/story/types';
import { QUESTS, CHAPTER_SCRIPTS } from '../src/world/quests';
import { NOVEL } from '../src/story/novel';
import { INTERLUDES } from '../src/story/interludes';
import { ARQ } from '../src/story/arquetipos';
import { EVENTS } from '../src/world/events';
import { ECOS } from '../src/world/morales';
import { CAMPFIRE_SCENES } from '../src/story/campfire';
import { SKILL_LABEL } from '../src/world/checks';

const out: string[] = [];
const W = (s = '') => out.push(s);
const q = (depth: number) => '> '.repeat(depth);

function fx(e: any): string {
  if (!e) return '';
  const p: string[] = [];
  if (e.c) p.push(`Corrupción ${e.c > 0 ? '+' : ''}${e.c}`); if (e.d) p.push(`Devoción ${e.d > 0 ? '+' : ''}${e.d}`);
  if (e.pf) p.push(`PF ${e.pf > 0 ? '+' : ''}${e.pf}`); if (e.gold) p.push(`oro ${e.gold > 0 ? '+' : ''}${e.gold}`);
  if (e.alert) p.push(`alerta ${e.alert > 0 ? '+' : ''}${e.alert}`);
  for (const [k, v] of Object.entries(e.rep ?? {})) p.push(`rep. ${k} ${(v as number) > 0 ? '+' : ''}${v}`);
  if (e.dead?.length) p.push(`**muere para siempre: ${e.dead.join(', ')}**`);
  if (e.flags?.length) p.push(`marca: ${e.flags.join(', ')}`);
  if (e.huella) p.push(`huella: «${e.huella}»`);
  return p.join(' · ');
}

const seenMd = new Set<Node>();
/** Los bloques que se repiten (el epílogo de la compañía en cada final) se imprimen una vez y después se remiten. */
function nodes(ns: Node[], d = 0) {
  let run = 0;
  const flush = () => { if (run) { W(`${q(d)}*↺ (${run} bloque${run > 1 ? 's' : ''} igual${run > 1 ? 'es' : ''} a los de más arriba: el epílogo de la compañía se lee igual en todos los finales)*`); W(q(d)); run = 0; } };
  for (const n of ns) { const shared = (n.t === 'if' || n.t === 'narr') && seenMd.has(n); if (shared) { run++; continue; } flush(); if (n.t === 'if' || n.t === 'narr') seenMd.add(n); node(n, d); }
  flush();
}
function node(n: Node, d: number) {
  const Q = q(d);
  switch (n.t) {
    case 'chapter': W(`${Q}### ${n.title}${n.sub ? ` — *${n.sub}*` : ''}`); W(Q); return;
    case 'narr': W(`${Q}${n.text}`); W(Q); return;
    case 'say': W(`${Q}**${n.who}**${n.tone ? ` *(${n.tone})*` : ''}: ${n.text}`); W(Q); return;
    case 'fx': { const t = fx(n.e); if (n.note || t) { W(`${Q}*[${[n.note, t].filter(Boolean).join(' — ')}]*`); W(Q); } return; }
    case 'battle': W(`${Q}⚔ **Combate:** \`${n.enc}\`${n.soft ? ' (se puede perder)' : ''}`); W(Q); return;
    case 'if': {
      W(`${Q}**▸ Si \`${n.flag}\`:**`); nodes(n.then, d + 1);
      if (n.else?.length) { W(`${Q}**▸ Si no:**`); nodes(n.else, d + 1); }
      W(Q); return;
    }
    case 'choice': {
      W(`${Q}**✦ Elección:** ${n.prompt ?? ''}`); W(Q);
      n.options.forEach((o, i) => opt(o, i, d)); return;
    }
    case 'puzzle': W(`${Q}*[Acertijo de las marcas]*`); W(Q); return;
    case 'squad': W(`${Q}*[Elegir escuadra${(n as any).label ? ': ' + (n as any).label : ''}]*`); W(Q); return;
    case 'end': W(`${Q}#### FIN · ${n.title}`); W(`${Q}${n.text}`); W(Q); return;
    default: return;
  }
}
function opt(o: Opt, i: number, d: number) {
  const Q = q(d + 1);
  const cond = [o.if ? `requiere \`${o.if}\`` : '', o.alive ? `si vive ${o.alive}` : ''].filter(Boolean).join(', ');
  const ck = o.check ? `🎲 ${SKILL_LABEL[o.check.skill] ?? o.check.skill} CD ${o.check.dc}${o.check.pc ? ` (${o.check.pc})` : ''}` : '';
  W(`${Q}**${i + 1}. ${o.label}**${cond ? ` *(${cond})*` : ''}`);
  const meta = [o.hint ? `pista: «${o.hint}»` : '', ck, fx(o.e)].filter(Boolean).join(' · ');
  if (meta) W(`${Q}<small>${meta}</small>`);
  W(Q);
  for (const r of o.result ?? []) { W(`${Q}${r}`); W(Q); }
  if (o.then?.length) nodes(o.then, d + 1);
  if (o.check && o.fail) {
    W(`${Q}**Si falla:** ${fx(o.fail.e)}`); W(Q);
    for (const r of o.fail.result ?? []) { W(`${Q}${r}`); W(Q); }
    if (o.fail.then?.length) nodes(o.fail.then, d + 1);
  }
}
const sec = (title: string, ns: Node[] | undefined, level = '##') => { if (!ns?.length) return; W(`${level} ${title}`); W(); nodes(ns); W(); };

W('# Zaryab · Las Entrañas de Piedra Viva — la historia completa');
W();
W(`**Zaryab es un juego digital.** El juego lleva solo todas las marcas, ecos y reputaciones; el jugador nunca ve una lista ni tiene que anotar nada, y en una partida lee sólo la rama que eligió. Este documento muestra todas las ramas a la vez para poder revisar el guion, por eso se ve más denso de lo que se juega. Exportado el ${new Date().toISOString().slice(0, 10)}, en orden de juego. Las decisiones muestran pista, prueba, consecuencias (Corrupción, Devoción, marcas) y lo que se lee después; «▸ Si \`marca\`» son variantes según lo que se eligió antes. Las fogatas aparecen en su versión base. Al final hay un apéndice con los umbrales de los sistemas.`);
W();

const MAIN = QUESTS.filter(x => x.kind === 'main');
const INTER_AFTER: Record<string, string> = { m_cap7: 'noche1', m_cap9: 'noche2', m_cap10: 'noche3', m_cap11: 'noche4' };

W('# Parte I · La campaña'); W();
sec('Acto I', NOVEL.acto1, '##');
for (const k of ['cap0', 'cap1', 'cap2']) { sec(`Prólogo · ${k}`, NOVEL[`pro_${k}`] ?? undefined, '###'); sec(k === 'cap0' ? 'Capítulo 0' : `Capítulo ${k.slice(3)}`, CHAPTER_SCRIPTS[k], '##'); sec(`Entreacto (${k})`, NOVEL[k], '###'); sec(`Arquetipos (${k})`, ARQ[k], '###'); }
for (const m of MAIN) {
  if (m.id === 'm_cap6') sec('Acto II', NOVEL.acto2, '##');
  if (m.id === 'm_cap11') sec('Acto III', NOVEL.acto3, '##');
  sec(`${m.title}  ·  \`${m.id}\``, m.script, '##');
  sec('Entreacto', NOVEL[m.id], '###');
  sec('Junto al fuego', CAMPFIRE_SCENES(m.id), '###');
  sec('Arquetipos', ARQ[m.id], '###');
  if (INTER_AFTER[m.id]) sec(`Interludio · ${INTER_AFTER[m.id]}`, INTERLUDES[INTER_AFTER[m.id]], '###');
}
const KIND: Record<string, string> = { side: 'opcional', personal: 'misión personal · opcional, pero es el giro del arco', faction: 'de facción · opcional' };
W('# Parte II · Misiones personales y secundarias (opcionales)'); W(); W('Todo lo de esta parte es opcional: aparece en el mapa de la ciudad y se juega cuando el jugador quiera. Las misiones personales se abren desde el Cap. II y son el giro del arco de cada personaje. El Inventario de Maunator (el Cubo que se mueve) es una aventura opcional larga; si no se juega, sus personajes (Seraphel, Kethras) sólo aparecen en variantes.'); W();
for (const m of QUESTS.filter(x => x.kind !== 'main')) { sec(`${m.title}  ·  \`${m.id}\` (${KIND[m.kind] ?? m.kind}${m.pc ? ', ' + m.pc : ''})`, m.script, '##'); sec('Junto al fuego', CAMPFIRE_SCENES(m.id), '###'); sec('Entreacto', NOVEL[m.id], '###'); }
W('# Parte III · Eventos, ecos e interludios sueltos'); W();
const used = new Set(Object.values(INTER_AFTER));
for (const [k, v] of Object.entries(EVENTS)) if (!used.has(k) && !(k in ECOS)) sec(`Evento · \`${k}\``, v, '##');
for (const [k, v] of Object.entries(ECOS)) sec(`Eco · \`${k}\``, v, '##');

// ───────────── apéndice: los sistemas y sus umbrales ─────────────
const SYS: [string, string[]][] = [
  ['Corrupción y Devoción (0 a 10)', [
    'El juego las guarda con decimales y muestra el entero. Las decisiones no dicen cuánto suman: el jugador sólo ve moverse el medidor.',
    'Cada suba rinde menos cerca del tope (se multiplica por 1 − valor/12, con un mínimo de 0,3), y subir una baja la otra 0,35 por punto.',
    'Milagros en combate: Devoción ≥ 2 Bendición de las Arenas, ≥ 4 Muro de Virtud, ≥ 6 Renacimiento Puro; Corrupción ≥ 2 Grito de la Tormenta, ≥ 4 Pacto con el Abismo, ≥ 6 Eclipse de Zahir.',
    'Voz en combate: con Corrupción ≥ 7 (y más de un punto sobre Devoción) la compañía habla en tono oscuro; con Devoción ≥ 7 (y más de un punto sobre Corrupción), en tono luminoso.',
    'Seguidores: el escéptico pierde fe si Corrupción ≥ 6; el fanático gana fe si Corrupción ≥ 4.',
  ]],
  ['Ruta (se fija al cerrar el Cap. VIII)', [
    'Sombra si Corrupción ≥ 7 y Devoción ≤ 4. Fe si Devoción ≥ 7 y Corrupción ≤ 4. Balanza si las dos están entre 4 y 6, o si se eligió la postura del Orden en el Cap. V.',
    'Si no se cumple ninguna, gana la ruta con más puntos acumulados en las decisiones (Orden → Balanza, Pueblo → Fe, Sombra → Sombra).',
  ]],
  ['Puntos de Fe y Sello', [
    'Los PF se ganan con decisiones, sermones, ofrendas y combates, y se gastan en milagros y rituales.',
    'El Sello cuenta todos los PF ganados en la campaña; gastarlos no lo baja. Mide cuánto alimentaron al cristal.',
  ]],
  ['Alerta del Conclave (0 a 10)', [
    '≥ 4: una patrulla viene a buscarlos. ≥ 7: asaltan la biblioteca. ≥ 10: cacería (salvo que hayan construido la Torre).',
    'En combate, la Alerta alta los pone en desventaja: −4 con Alerta ≥ 7 y −8 con ≥ 10.',
  ]],
  ['Fragmentos del Simurg', [
    'Cinco fragmentos atados a alguien: Dahhak (Farid), Marid (Zyr\'thar), Al-Mazhar (Aisha), Gul-Amarat (Samira) y Razul (Zaryab).',
    'Cada uno se cede a Zahir (Sombra +1), se guarda (+6 PF) o se rompe (−6 PF, Devoción +1, y Zahir llega más débil al ritual).',
  ]],
  ['Finales (Cap. XIII)', [
    'Liberar: Devoción ≥ 7, Sello ≤ 30 y al menos 3 fragmentos resueltos (guardados, cedidos o rotos).',
    'Gobernar: Corrupción ≥ 7.',
    'Espiral: Sello ≥ 60, o haber devorado a Dahhak.',
    'Silencio: la vía del Silencio con Razul, o los huérfanos de Al-Mazhar en paz más el fragmento de Gul-Amarat resuelto.',
    'Equilibrio: Corrupción y Devoción entre 4 y 6.',
    'Destruir: siempre disponible.',
    'Pacto Roto: haber conocido a Ellie y usar su venda en el ritual; reemplaza al resto.',
  ]],
  ['Muertes permanentes', [
    'La noche de la fiebre (Cap. IX): si alguien da su aliento por Farid. El séptimo cuerpo (Cap. XIII): si alguien ocupa el lugar de Farid.',
    'En combate, desde el Cap. III, sólo con la opción de muerte permanente activada; si no, el caído vuelve con +1 Corrupción.',
    'Toda muerte permanente se confirma antes de elegirla. El ritual del cristal (12 PF) revive a los caídos en combate, nunca a quien dio su aliento.',
    'Un muerto para siempre ya no habla ni protagoniza opciones; las escenas que dependían de él tienen su variante.',
  ]],
];
W('# Apéndice · Los sistemas y sus umbrales'); W();
for (const [t, ls] of SYS) { W(`## ${t}`); W(); for (const l of ls) W(`- ${l}`); W(); }
const file = process.argv[2] ?? 'docs/HISTORIA_COMPLETA.md';
writeFileSync(file, out.join('\n'));
const words = out.join(' ').split(/\s+/).length;
console.log(`${file}: ${out.length} líneas, ~${words} palabras`);

// ───────────── versión HTML (para leer y marcar cambios) ─────────────
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const H: string[] = []; const toc: { id: string; title: string; lvl: number }[] = []; let nid = 0;
const PCC: Record<string, string> = { romain: 'romain', pact: 'pact', rabb: 'rabb', joren: 'joren', zyr: 'zyr', panchi: 'panchi', zahir: 'zahir', razul: 'razul', vizir: 'razul' };
const who = (w: string) => { const k = Object.keys(PCC).find(k => w.toLowerCase().replace(/[^a-z]/g, '').startsWith(k)); return k ? ` s-${PCC[k]}` : ''; };
const seenH = new Set<Node>();
function hn(ns: Node[]) {
  let run = 0;
  const flush = () => { if (run) { H.push(`<p class="meta">↺ ${run} bloque${run > 1 ? 's' : ''} igual${run > 1 ? 'es' : ''} a los de más arriba: el epílogo de la compañía se lee igual en todos los finales.</p>`); run = 0; } };
  for (const n of ns) { const shared = (n.t === 'if' || n.t === 'narr') && seenH.has(n); if (shared) { run++; continue; } flush(); if (n.t === 'if' || n.t === 'narr') seenH.add(n); hnode(n); }
  flush();
}
function hnode(n: Node) {
  switch (n.t) {
    case 'chapter': H.push(`<h4 class="scene">${esc(n.title)}${n.sub ? `<span>${esc(n.sub)}</span>` : ''}</h4>`); return;
    case 'narr': H.push(`<p class="narr">${esc(n.text)}</p>`); return;
    case 'say': H.push(`<p class="say${who(n.who)}"><b>${esc(n.who)}</b>${n.tone ? `<i>${esc(n.tone)}</i>` : ''}<span>${esc(n.text)}</span></p>`); return;
    case 'fx': { const t = fx(n.e); if (n.note || t) H.push(`<p class="meta fx">${esc([n.note, t].filter(Boolean).join(' — '))}</p>`); return; }
    case 'battle': H.push(`<p class="battle">Combate <code>${esc(n.enc)}</code>${n.soft ? ' · se puede perder' : ''}</p>`); return;
    case 'if': H.push(`<div class="branch"><div class="cond">si <code>${esc(n.flag)}</code></div>`); hn(n.then); if (n.else?.length) { H.push(`<div class="cond">si no</div>`); hn(n.else); } H.push(`</div>`); return;
    case 'choice': {
      H.push(`<div class="choice"><p class="prompt">${esc(n.prompt ?? 'Elección')}</p><ol>`);
      for (const o of n.options) {
        const cond = [o.if ? `requiere <code>${esc(o.if)}</code>` : '', o.alive ? `si vive ${esc(o.alive)}` : ''].filter(Boolean).join(' · ');
        const ck = o.check ? `prueba: ${esc(SKILL_LABEL[o.check.skill] ?? o.check.skill)} CD ${o.check.dc}${o.check.pc ? ` (${esc(o.check.pc)})` : ''}` : '';
        const meta = [o.hint ? `pista: «${esc(o.hint)}»` : '', ck, esc(fx(o.e))].filter(Boolean).join(' · ');
        H.push(`<li><details><summary>${esc(o.label)}${cond ? ` <small>${cond}</small>` : ''}</summary>${meta ? `<p class="meta">${meta}</p>` : ''}`);
        for (const r of o.result ?? []) H.push(`<p class="narr">${esc(r)}</p>`);
        if (o.then?.length) hn(o.then);
        if (o.check && o.fail) { H.push(`<div class="cond">si falla ${o.fail.e ? `<span class="meta">${esc(fx(o.fail.e))}</span>` : ''}</div>`); for (const r of o.fail.result ?? []) H.push(`<p class="narr">${esc(r)}</p>`); if (o.fail.then?.length) hn(o.fail.then); }
        H.push(`</details></li>`);
      }
      H.push(`</ol></div>`); return;
    }
    case 'end': H.push(`<div class="end"><h5>${esc(n.title)}</h5><p>${esc(n.text)}</p></div>`); return;
    case 'puzzle': H.push(`<p class="meta">[acertijo de las marcas]</p>`); return;
    case 'squad': H.push(`<p class="meta">[elegir escuadra]</p>`); return;
    default: return;
  }
}
const hsec = (title: string, ns: Node[] | undefined, lvl: 1 | 2 | 3) => {
  if (!ns?.length) return; const id = `s${++nid}`; toc.push({ id, title, lvl });
  H.push(`<section id="${id}" class="l${lvl}"><h${lvl + 1}>${esc(title)}</h${lvl + 1}>`); hn(ns); H.push(`</section>`);
};
const part = (title: string) => { const id = `s${++nid}`; toc.push({ id, title, lvl: 0 as any }); H.push(`<h2 class="part" id="${id}">${esc(title)}</h2>`); };
part('La campaña');
hsec('Acto I · Muerte y pacto', NOVEL.acto1, 1);
for (const k of ['cap0', 'cap1', 'cap2']) { hsec(k === 'cap0' ? 'Prólogo' : `Capítulo ${k === 'cap1' ? 'I' : 'II'}`, CHAPTER_SCRIPTS[k], 1); hsec('Entreacto', NOVEL[k], 2); hsec('Arquetipos', ARQ[k], 2); }
for (const m of MAIN) {
  if (m.id === 'm_cap6') hsec('Acto II · Los falsos dioses', NOVEL.acto2, 1);
  if (m.id === 'm_cap11') hsec('Acto III · El Eclipse', NOVEL.acto3, 1);
  hsec(m.title, m.script, 1); hsec('Entreacto', NOVEL[m.id], 2); hsec('Junto al fuego', CAMPFIRE_SCENES(m.id), 2); hsec('Arquetipos', ARQ[m.id], 2);
  if (INTER_AFTER[m.id]) hsec(`Interludio`, INTERLUDES[INTER_AFTER[m.id]], 2);
}
part('Misiones personales y secundarias (opcionales)'); H.push(`<p class="lead">Todo lo de esta parte es opcional: aparece en el mapa de la ciudad y se juega cuando el jugador quiera. Las misiones personales se abren desde el Cap. II y son el giro del arco de cada personaje. El Inventario de Maunator es una aventura opcional larga; si no se juega, Seraphel y Kethras sólo aparecen en variantes.</p>`);
for (const m of QUESTS.filter(x => x.kind !== 'main')) { hsec(`${m.title} · ${KIND[m.kind] ?? m.kind}`, m.script, 1); hsec('Junto al fuego', CAMPFIRE_SCENES(m.id), 2); hsec('Entreacto', NOVEL[m.id], 2); }
part('Eventos y ecos');
for (const [k, v] of Object.entries(EVENTS)) if (!used.has(k) && !(k in ECOS)) hsec(`Evento · ${k}`, v, 1);
for (const [k, v] of Object.entries(ECOS)) hsec(`Eco · ${k}`, v, 1);
part('Apéndice · Los sistemas y sus umbrales');
for (const [t, ls] of SYS) { const id = `s${++nid}`; toc.push({ id, title: t, lvl: 1 }); H.push(`<section id="${id}" class="l1 sys"><h2>${esc(t)}</h2><ul>${ls.map(l => `<li>${esc(l)}</li>`).join('')}</ul></section>`); }
const tocHtml = toc.filter(t => (t.lvl as number) <= 1).map(t => (t.lvl as number) === 0 ? `<li class="tp"><a href="#${t.id}">${esc(t.title)}</a></li>` : `<li><a href="#${t.id}">${esc(t.title)}</a></li>`).join('');
writeFileSync(process.argv[3] ?? 'docs/historia-body.html', `<!--TOC-->${tocHtml}<!--/TOC-->\n${H.join('\n')}`);
console.log('html', H.length, 'bloques');
