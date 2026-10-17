// Genera los emblemas de retrato de los seis personajes a partir de game-icons.net (CC BY 3.0, vía @iconify-json/game-icons).
// Uso: node scripts/make-portraits.mjs  → escribe src/ui/pcPortraits.ts
import { readFileSync, writeFileSync } from 'node:fs';
const set = JSON.parse(readFileSync(new URL('../node_modules/@iconify-json/game-icons/icons.json', import.meta.url), 'utf8'));
const PC = {
  romain: { icon: 'daemon-skull', c: '#c9b458', bg: '#4a2f1d' },
  pact: { icon: 'spiked-halo', c: '#f3e7b0', bg: '#4a4a5c' },
  rabb: { icon: 'warlock-hood', c: '#b894ff', bg: '#2d1d52' },
  joren: { icon: 'archer', c: '#8fd19a', bg: '#1d3a28' },
  zyrthar: { icon: 'hooded-assassin', c: '#c9b8ff', bg: '#2a2246' },
  panchi: { icon: 'dwarf-face', c: '#f0a060', bg: '#5a2e14' },
};
const out = {};
for (const [id, p] of Object.entries(PC)) {
  const ic = set.icons[p.icon]; if (!ic) throw new Error('falta ' + p.icon);
  const w = ic.width ?? set.width ?? 512, h = ic.height ?? set.height ?? 512;
  out[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="#0c0814"/></radialGradient><radialGradient id="l" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${p.c}" stop-opacity=".35"/><stop offset="1" stop-color="${p.c}" stop-opacity="0"/></radialGradient></defs><rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="48" r="40" fill="url(#l)"/><circle cx="50" cy="48" r="36" fill="none" stroke="${p.c}" stroke-opacity=".55" stroke-width="1.2"/><circle cx="50" cy="48" r="39.5" fill="none" stroke="${p.c}" stroke-opacity=".25" stroke-width=".6"/><g transform="translate(18 16) scale(${64 / Math.max(w, h)})" fill="${p.c}" color="${p.c}">${ic.body}</g></svg>`;
}
writeFileSync(new URL('../src/ui/pcPortraits.ts', import.meta.url), `// Emblemas de retrato de los seis personajes (generados por scripts/make-portraits.mjs).\n// Iconos de game-icons.net, licencia CC BY 3.0 (ver CREDITS.md). Para usar arte propio, poné src/assets/portraits/<id>.jpg|png|webp: tiene prioridad.\nexport const PC_SVG: Record<string, string> = ${JSON.stringify(out, null, 1)};\nconst toUri = (svg: string) => 'data:image/svg+xml;base64,' + btoa(svg);\nexport const PC_PORTRAITS: Record<string, string> = Object.fromEntries(Object.entries(PC_SVG).map(([k, v]) => [k, toUri(v)]));\n`);
console.log('ok', Object.keys(out));
