// Mide la tensión dramática por capítulo y por personaje a partir del guion (no de una opinión).
// Por cada capítulo (con sus entreactos, fogatas, interludios y arquetipos) junta todos los pasajes —incluidas
// todas las variantes y los resultados de cada opción— y suma, para cada personaje:
//   · presencia: 1 por pasaje en que habla o es nombrado;
//   · intensidad: +2 por cada palabra de peligro/pérdida/violencia en esos pasajes (léxico abajo);
//   · protagonismo: +4 si una decisión es suya (prueba con su nombre o «Nombre: …» en la opción);
//   · riesgo de muerte: +8 si una opción lo mata para siempre.
// La tensión de la historia (todos) usa la intensidad por cada 100 palabras del capítulo, más el jefe del capítulo.
// Uso: npx tsx scripts/tension.ts [salida.json]
import { writeFileSync } from 'node:fs';
import type { Node } from '../src/story/types';
import { QUESTS, CHAPTER_SCRIPTS } from '../src/world/quests';
import { NOVEL } from '../src/story/novel';
import { INTERLUDES } from '../src/story/interludes';
import { ARQ } from '../src/story/arquetipos';
import { CAMPFIRE_SCENES } from '../src/story/campfire';

const PCS = ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi'] as const;
const NAME: Record<string, RegExp> = { romain: /\bRomain\b/, pact: /\bPact\b/, rabb: /\bRabb\b/, joren: /\bJoren\b/, zyrthar: /Zyr'?thar/, panchi: /\bPanchi\b/ };
const LEX = /\b(muer(e|en|o|es|a|as|an)\b|muert\w*|mat(a|ar|ó|aron|en)\b|asesin\w*|sangr\w*|grit\w*|llor\w*|lágrim\w*|miedo|terror|aterr\w*|caíd\w*|cae\b|cayó|golpe\w*|ard(e|en|ía)|fuego|llamas|venen\w*|traici\w*|mient(e|o|en|es|a|as|an)\b|mentir\w*|herid\w*|dolor|duele|sacrific\w*|desesper\w*|rabia|furi\w*|tiembl\w*|cadáver\w*|tumba\w*|ejecut\w*|ahorc\w*|cuchill\w*|ghul\w*|lich|monstruo\w*|perd(er|ió|ido|imos)|huir|huye|grieta|derrumb\w*|eclipse|fiebre|apag(a|ó|an)|niño\w* muert\w*)\b/gi;

interface P { who?: string; text: string; boost?: Record<string, number> }
function flat(ns: Node[] | undefined, out: P[] = []): P[] {
  for (const n of ns ?? []) {
    if (n.t === 'narr') out.push({ text: n.text });
    else if (n.t === 'say') out.push({ who: n.who, text: n.text });
    else if (n.t === 'if') { flat(n.then, out); flat(n.else, out); }
    else if (n.t === 'choice') for (const o of n.options) {
      const boost: Record<string, number> = {};
      const own = o.check?.pc ?? o.alive ?? PCS.find(p => new RegExp('^' + NAME[p].source + '[^:]{0,12}:').test(o.label));
      if (own) boost[own] = (boost[own] ?? 0) + 4;
      for (const d of o.e?.dead ?? []) boost[d] = (boost[d] ?? 0) + 8;
      out.push({ text: [o.label, ...(o.result ?? [])].join(' '), boost });
      flat(o.then, out); if (o.fail) { out.push({ text: (o.fail.result ?? []).join(' ') }); flat(o.fail.then, out); }
    }
  }
  return out;
}
const MAIN = QUESTS.filter(q => q.kind === 'main');
const INTER: Record<string, string> = { m_cap7: 'noche1', m_cap9: 'noche2', m_cap10: 'noche3', m_cap11: 'noche4' };
const BOSS: Record<string, number> = { m_cap5: 3, m_cap7: 3, m_cap9: 3, m_cap10: 3, m_cap11: 3, m_cap12: 3, m_cap13: 4 };
const units: { id: string; label: string; ps: P[] }[] = [
  { id: 'cap0', label: 'Prólogo', ps: flat([...(NOVEL.acto1 ?? []), ...CHAPTER_SCRIPTS.cap0, ...(NOVEL.cap0 ?? [])]) },
  { id: 'cap1', label: 'I', ps: flat([...CHAPTER_SCRIPTS.cap1, ...(NOVEL.cap1 ?? [])]) },
  { id: 'cap2', label: 'II', ps: flat([...CHAPTER_SCRIPTS.cap2, ...(NOVEL.cap2 ?? []), ...(ARQ.cap2 ?? [])]) },
  ...MAIN.map((m, i) => ({ id: m.id, label: ['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'][i],
    ps: flat([...(m.id === 'm_cap6' ? NOVEL.acto2 ?? [] : []), ...(m.id === 'm_cap11' ? NOVEL.acto3 ?? [] : []), ...m.script, ...(NOVEL[m.id] ?? []), ...CAMPFIRE_SCENES(m.id), ...(ARQ[m.id] ?? []), ...(INTER[m.id] ? INTERLUDES[INTER[m.id]] : [])]) })),
];
const res = units.map(u => {
  const pcs: Record<string, number> = {}; let words = 0, hits = 0;
  for (const p of u.ps) {
    const h = (p.text.match(LEX) ?? []).length; words += p.text.split(/\s+/).length; hits += h;
    for (const pc of PCS) {
      const involved = NAME[pc].test(p.text) || (p.who && NAME[pc].test(p.who)) || p.boost?.[pc];
      if (!involved) continue;
      pcs[pc] = (pcs[pc] ?? 0) + 1 + 2 * h + (p.boost?.[pc] ?? 0);
    }
  }
  return { id: u.id, label: u.label, words, density: +(100 * hits / Math.max(1, words)).toFixed(2), boss: BOSS[u.id] ?? 0, raw: pcs };
});
// escala 0–10: personajes contra el máximo de cualquier personaje en cualquier capítulo; la historia contra su propio máximo
// raíz de las palabras: ni el capítulo largo gana por volumen ni el corto se dispara por una sola escena
const dens = res.map(r => Object.fromEntries(PCS.map(p => [p, (r.raw[p] ?? 0) / Math.sqrt(Math.max(300, r.words))])));
const maxPc = Math.max(...dens.flatMap(d => Object.values(d)));
const storyRaw = res.map(r => r.density + r.boss * 0.6); const maxS = Math.max(...storyRaw);
const out = res.map((r, i) => ({ id: r.id, label: r.label, words: r.words, story: +(10 * storyRaw[i] / maxS).toFixed(1),
  pcs: Object.fromEntries(PCS.map(p => [p, +(10 * dens[i][p] / maxPc).toFixed(1)])) }));
// misiones personales: se juegan cuando el jugador quiera desde el Cap. II; se miden aparte con la misma escala
const PQ: Record<string, string> = { romain: 'p_romain', pact: 'p_pact', rabb: 'p_rabb', joren: 'p_joren', zyrthar: 'p_zyr', panchi: 'p_panchi' };
const personal = Object.fromEntries(PCS.map(pc => { const q = QUESTS.find(x => x.id === PQ[pc]); if (!q) return [pc, null];
  const ps = flat([...q.script, ...CAMPFIRE_SCENES(q.id)]); let raw = 0, words = 0; for (const p of ps) { const h = (p.text.match(LEX) ?? []).length; words += p.text.split(/\s+/).length; if (NAME[pc].test(p.text) || (p.who && NAME[pc].test(p.who)) || p.boost?.[pc]) raw += 1 + 2 * h + (p.boost?.[pc] ?? 0); }
  return [pc, { title: q.title, value: +Math.min(10, 10 * raw / Math.sqrt(Math.max(300, words)) / maxPc).toFixed(1) }]; }));
const file = process.argv[2] ?? 'docs/tension.json';
writeFileSync(file, JSON.stringify({ chapters: out, personal }, null, 1));
console.log(personal);
console.table(out.map(o => ({ cap: o.label, palabras: o.words, historia: o.story, ...o.pcs })));
