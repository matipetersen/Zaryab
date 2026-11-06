// Ventana del Códice: pestañas por categoría, lista de entradas (las nuevas con punto) y panel de lectura.
// En pantallas angostas (≤ 640 px) muestra primero la lista y, al tocar una entrada, la lectura con «← Volver».
import { h } from './dom';
import type { Campaign } from '../state';
import { CODEX, CODEX_CATS, codexUnlocked, markRead, readCount, type CodexCat, type CodexView } from '../world/codex';

const CAT_ICON: Record<CodexCat, string> = { 'Dioses': '✦', 'Facciones': '⚑', 'Lugares': '⌖', 'Personas': '☺', 'Objetos y conceptos': '◈', 'La compañía': '☥' };
export interface CodexOpts { onRead?: () => void; onClose?: () => void }

/** Abre el Códice encima de `host`. Devuelve una función para cerrarlo. */
export function openCodex(host: HTMLElement, c: Campaign, opts: CodexOpts = {}): () => void {
  let cat: CodexCat = CODEX_CATS[0]; let sel: string | null = null; let reading = false;
  // la última lectura de cada entrada (antes de marcarla), para resaltar los párrafos nuevos mientras la ventana siga abierta
  const before: Record<string, number> = {};
  const firstNew = codexUnlocked(c).find(v => v.isNew || v.grew); if (firstNew) cat = firstNew.cat;

  const card = h('div', { class: 'card wide cx-card', role: 'dialog', 'aria-label': 'Códice' });
  const ov = h('div', { class: 'overlay cx-ov', onClick: (e: MouseEvent) => { if (e.target === ov) close(); } }, card);
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); if (reading && narrow()) { reading = false; draw(); } else close(); } };
  const narrow = () => window.matchMedia('(max-width: 640px)').matches;
  function close() { document.removeEventListener('keydown', onKey, true); ov.remove(); opts.onClose?.(); }

  function pick(v: CodexView) {
    if (!(v.id in before)) before[v.id] = readCount(c, v.id);
    sel = v.id; reading = true;
    if (v.isNew || v.grew) { markRead(c, v.id); opts.onRead?.(); }
    draw();
  }

  function draw() {
    { // en escritorio siempre hay algo abierto: la primera entrada nueva de la categoría, o la primera
      const vs = codexUnlocked(c).filter(v => v.cat === cat);
      if (sel && !vs.some(v => v.id === sel)) sel = null;
      if (!sel && !narrow() && vs.length) { const v = vs.find(x => x.isNew || x.grew) ?? vs[0]; if (!(v.id in before)) before[v.id] = readCount(c, v.id); sel = v.id; if (v.isNew || v.grew) { markRead(c, v.id); opts.onRead?.(); } }
    }
    const all = codexUnlocked(c); const inCat = all.filter(v => v.cat === cat);
    const total = CODEX.filter(e => e.cat === cat).length;
    const cur = inCat.find(v => v.id === sel) ?? null;

    const tabs = h('div', { class: 'tabs cx-tabs' }, ...CODEX_CATS.map(k => {
      const vs = all.filter(v => v.cat === k); const fresh = vs.some(v => v.isNew || v.grew);
      return h('button', { class: `tabbtn ${k === cat ? 'on' : ''}`, onClick: () => { cat = k; sel = null; reading = false; draw(); } }, `${CAT_ICON[k]} ${k} `, h('span', { class: 'cx-n' }, String(vs.length)), fresh ? h('i', { class: 'cx-dot', title: 'Hay entradas nuevas' }) : null);
    }));

    const list = h('div', { class: 'cx-list' });
    if (!inCat.length) list.append(h('div', { class: 'small lore cx-empty' }, 'Todavía no saben nada de esto. Sigan adelante.'));
    for (const v of inCat) list.append(h('button', { class: `cx-item ${v.id === sel ? 'on' : ''} ${v.isNew ? 'new' : ''}`, onClick: () => pick(v) },
      v.isNew || v.grew ? h('i', { class: 'cx-dot' }) : h('i', { class: 'cx-dot off' }), h('span', { class: 'cx-t' }, v.title), v.grew ? h('span', { class: 'cx-more' }, '+') : null));
    if (total > inCat.length) list.append(h('div', { class: 'small cx-left' }, `${total - inCat.length} entrada${total - inCat.length > 1 ? 's' : ''} por descubrir`));

    const pane = h('article', { class: 'cx-read' });
    if (cur) {
      const prev = before[cur.id] ?? cur.paras.length;
      pane.append(h('button', { class: 'btn sm ghost cx-back', onClick: () => { reading = false; draw(); } }, '← Volver'), h('div', { class: 'cx-cat' }, `${CAT_ICON[cur.cat]} ${cur.cat}`), h('h3', { class: 'cx-h' }, cur.title));
      cur.paras.forEach((p, i) => pane.append(h('p', { class: `cx-p ${i >= prev && prev > 0 ? 'fresh' : ''} ${i > 0 ? 'more' : ''}` }, p)));
    } else pane.append(h('div', { class: 'small lore cx-hint' }, 'Elijan una entrada de la lista.'));

    const n = all.length;
    card.innerHTML = '';
    card.append(
      h('div', { class: 'cx-head' }, h('h2', {}, '📜 Códice'), h('span', { class: 'small' }, `${n} de ${CODEX.length} entradas`), h('button', { class: 'cx-x', title: 'Cerrar', 'aria-label': 'Cerrar', onClick: close }, '✕')),
      tabs,
      h('div', { class: `cx-body ${reading && cur ? 'reading' : ''}` }, list, pane),
    );
    if (reading && cur) pane.scrollTop = 0;
  }

  document.addEventListener('keydown', onKey, true);
  host.append(ov); draw();
  return close;
}
