// Tirada de d20 animada para las pruebas de la historia: el dado rueda, rebota y cae en el número.
// Cada personaje tiene su dado (color, filo y emblema); no se muestra la CD, solo lo que salió.
import { h } from './dom';
import { audio } from './audio';

interface DieStyle { lab?: string; face: string; dark: string; edge: string; ink: string; glyph: string; name: string }
const STYLES: Record<string, DieStyle> = {
  romain: { face: '#d8c27a', dark: '#8a7432', edge: '#3a2c10', ink: '#2a1c08', glyph: '☥', name: 'hueso dorado' },
  pact: { face: '#f2ecd2', dark: '#b9ad84', edge: '#6a5a2a', ink: '#7a5a10', glyph: '✦', name: 'marfil y oro' },
  rabb: { face: '#7a5cc9', dark: '#3e2a78', edge: '#1a0f33', ink: '#e8dcff', glyph: '⚔', name: 'obsidiana violeta' },
  joren: { face: '#5f8f52', dark: '#33552c', edge: '#16260f', ink: '#efe6c8', glyph: '➶', name: 'madera de fresno' },
  zyrthar: { lab: '#b8a6e0', face: '#3b3350', dark: '#1d1828', edge: '#0b0810', ink: '#ff5a6a', glyph: '🗡', name: 'piedra de la Infraoscuridad' },
  panchi: { face: '#c26b3a', dark: '#7a3a18', edge: '#2e1406', ink: '#fff0d8', glyph: '✊', name: 'cobre batido' },
};
const DEF: DieStyle = { face: '#b8a98a', dark: '#6e6250', edge: '#2a2218', ink: '#1a140c', glyph: '◆', name: 'hueso' };
export const dieStyle = (pc: string) => STYLES[pc] ?? DEF;

/** SVG de un d20 visto de frente: hexágono, triángulo central y las caras de alrededor. */
function dieSvg(s: DieStyle): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('class', 'd20');
  const P = (pts: string, fill: string) => { const p = document.createElementNS(NS, 'polygon'); p.setAttribute('points', pts); p.setAttribute('fill', fill); p.setAttribute('stroke', s.edge); p.setAttribute('stroke-width', '3'); p.setAttribute('stroke-linejoin', 'round'); svg.append(p); };
  // hexágono exterior dividido en caras: arriba claras, abajo oscuras (luz de arriba a la izquierda)
  const c = [50, 4], tr = [90, 27], br = [90, 73], b = [50, 96], bl = [10, 73], tl = [10, 27];
  const t1 = [50, 30], t2 = [72, 66], t3 = [28, 66]; // triángulo central
  const pt = (...ps: number[][]) => ps.map(p => p.join(',')).join(' ');
  P(pt(c, tr, t1), s.face); P(pt(c, t1, tl), s.face); P(pt(tl, t1, t3), s.face); P(pt(tl, t3, bl), s.dark);
  P(pt(tr, t2, t1), s.dark); P(pt(tr, br, t2), s.dark); P(pt(bl, t3, b), s.dark); P(pt(t3, t2, b), s.dark); P(pt(t2, br, b), s.dark);
  P(pt(t1, t2, t3), s.face);
  const tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', '50'); tx.setAttribute('y', '59'); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-size', '22'); tx.setAttribute('fill', s.ink); tx.setAttribute('class', 'd20n'); tx.textContent = '20'; svg.append(tx);
  return svg;
}

/** Arma la tirada dentro de `box` y resuelve cuando el dado se detiene. */
export function rollDie(box: HTMLElement, pc: string, who: string, skill: string, d20: number, mod: number): Promise<void> {
  const s = dieStyle(pc); const fast = !!(window as any).__fast;
  const svg = dieSvg(s); const num = svg.querySelector('.d20n') as SVGTextElement;
  const die = h('div', { class: 'die rolling', title: `Dado de ${s.name}` }); die.append(svg);
  const res = h('div', { class: 'die-res' });
  box.append(h('div', { class: 'dice' }, h('div', { class: 'die-who', style: { color: s.lab ?? s.face } }, `${s.glyph} ${who} tira ${skill}`), die, res));
  const total = d20 + mod; const ms = fast ? 60 : 1300;
  return new Promise(done => {
    const t0 = performance.now(); let last = 0;
    const tick = (now: number) => {
      const k = (now - t0) / ms;
      if (k < 1) { // los números se frenan a medida que el dado pierde impulso
        if (now - last > 40 + 160 * k * k) { last = now; if (k > .25 && Math.random() < .5) audio.sfx('step'); num.textContent = String(1 + Math.floor(Math.random() * 20)); }
        requestAnimationFrame(tick); return;
      }
      num.textContent = String(d20); audio.sfx(d20 === 20 ? 'crit' : d20 === 1 ? 'miss' : 'click'); die.classList.remove('rolling'); die.classList.add(d20 === 20 ? 'crit' : d20 === 1 ? 'fumble' : 'land');
      res.append(h('div', { class: 'die-total' }, String(total)), h('div', { class: 'die-math' }, `d20 ${d20} ${mod >= 0 ? '+' : '−'} ${Math.abs(mod)}`),
        ...(d20 === 20 ? [h('div', { class: 'die-tag crit' }, '¡Crítico!')] : d20 === 1 ? [h('div', { class: 'die-tag fumble' }, 'Pifia')] : []));
      setTimeout(done, fast ? 0 : 450);
    };
    requestAnimationFrame(tick);
  });
}
