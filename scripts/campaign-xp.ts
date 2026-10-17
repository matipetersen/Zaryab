// ¿A qué nivel llegan a cada jefe si pelean todo o si esquivan todo lo esquivable? (XP de los monstruos vs. nivel de diseño de cada jefe)
import { ENCOUNTERS } from '../src/data/maps';
import { MONSTERS } from '../src/data/monsters';
import { DESIGN_LVL, winChance } from '../src/data/difficulty';
import { levelForXp, levelCap } from '../src/data/progression';

const xp = (enc: string) => (ENCOUNTERS[enc]?.foes ?? []).reduce((s, f) => s + (MONSTERS[f.id]?.xp ?? 0), 0);
/** Camino principal en orden: [capítulo, combates obligatorios, combates esquivables (con hablar/sigilo/sacrificio)]. */
const PATH: [string, string[], string[]][] = [
  ['cap0', ['noche'], []], ['cap2', ['linyera'], ['ghul_vendedor']], ['cap3', ['acueducto'], []], ['cap5', ['coloso'], []],
  ['cap6', ['revuelta_orden'], ['tigre', 'cementerio']], ['cap7', ['dahhak_final'], []], ['cap8', [], ['asalto']], ['cap9', [], ['marid']],
  ['cap10', [], ['al_mazhar']], ['cap11', [], ['huida_mina', 'gusano']], ['cap12', ['razul_final'], []], ['cap13', ['eclipse'], []],
];
// Secundarias con combate (XP aproximado disponible antes del Cap. VII si se hacen todas)
const SIDE = ['lago', 'espejo', 'te', 'zyr', 'joren', 'romain', 'panchi', 'pact', 'patrulla', 'ninos', 'infiltrado', 'recaudador', 'caravana', 'motin', 'jann_zoco'];
const flagsAfter = (i: number) => PATH.slice(0, i).map(p => p[0] + '_done');
for (const mode of ['pelea todo', 'esquiva todo']) {
  let total = 0; console.log(`\n== ${mode} ==`); console.log('jefe'.padEnd(16), 'XP', 'nivel', 'diseño', 'Δ', 'prob. de victoria aprox.');
  PATH.forEach(([cap, must, skip], i) => {
    const gained = (mode === 'pelea todo' ? [...must, ...skip] : must).reduce((s, e) => s + xp(e), 0); const sideXp = mode === 'pelea todo' && cap === 'cap6' ? SIDE.reduce((s, e) => s + xp(e), 0) : 0;
    const boss = [...must, ...skip].filter(e => DESIGN_LVL[e] != null).sort((a, b) => DESIGN_LVL[b] - DESIGN_LVL[a])[0];
    const lvl = Math.min(levelForXp(total + 0), levelCap(flagsAfter(i)));
    if (boss) { const d = DESIGN_LVL[boss]; console.log(boss.padEnd(16), String(total).padStart(5), String(lvl).padStart(4), String(d).padStart(5), String(lvl - d).padStart(3), winChance(0, lvl - d) + ' %'); }
    total += gained + sideXp;
  });
  console.log('XP total al final:', total, '→ nivel', levelForXp(total));
}
