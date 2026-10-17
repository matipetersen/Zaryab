import { h } from './dom';

const KEY = 'zaryab.hubguide.v1';
const STEPS: [string, string][] = [
  ['El mapa de Zaryab', 'Cada círculo es un **distrito**. Tocá uno para ver sus lugares y misiones en el panel de la derecha. El número rojo o dorado indica cuántas misiones hay disponibles; el dorado es la **historia principal**.'],
  ['Qué hacer primero', 'Buscá el cartel «★ Siguiente paso» arriba del mapa: te dice dónde está la próxima misión principal. Las misiones **personales** abren el arco de cada personaje; las secundarias dan XP, PF y consecuencias.'],
  ['El tiempo corre', 'Visitar un lugar consume una **fase del día** (amanecer → día → noche). Las misiones y los descansos pasan días enteros. Hay relojes: la **Alerta** del Conclave sube sola, y tras la caída del Capitolio empieza la **cuenta atrás del Eclipse**.'],
  ['El santuario', 'En **☥ Santuario** reclutás seguidores, hacés sermones y rituales, construís edificios y sacás milagros. Desde ahí también se **sube de nivel** (botón dorado abajo).'],
  ['Consejo', 'No hace falta hacerlo todo. Avanzá la historia, hacé las misiones personales y descansá cuando los PF o el grupo lo pidan. Podés reabrir esta guía con el botón **?**.'],
];
export const hubGuideSeen = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return true; } };
const md = (t: string) => t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
export function openHubGuide(parent: HTMLElement, i = 0) {
  parent.querySelector('#hubguide')?.remove();
  const el = h('div', { id: 'hubguide', class: 'overlay' }); const s = STEPS[i]; const last = i === STEPS.length - 1;
  const body = h('div', { class: 'res' }); body.innerHTML = md(s[1]);
  const close = () => { try { localStorage.setItem(KEY, '1'); } catch { /* */ } el.remove(); };
  el.append(h('div', { class: 'card' }, h('div', { class: 'small' }, `Guía del mapa · ${i + 1}/${STEPS.length}`), h('h2', {}, s[0]), body,
    h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } }, i > 0 ? h('button', { class: 'btn ghost', style: { minWidth: '0' }, onClick: () => openHubGuide(parent, i - 1) }, '‹') : null, h('button', { class: 'btn', style: { minWidth: '0' }, onClick: () => (last ? close() : openHubGuide(parent, i + 1)) }, last ? 'Entendido' : 'Siguiente ›'), h('button', { class: 'btn ghost', style: { minWidth: '0' }, onClick: close }, 'Cerrar'))));
  parent.append(el);
}
