import { h } from './dom';
import { DISTRICTS, ROADS, DISTRICT_BY_ID, type District } from '../world/districts';
import { QUESTS, type QuestDef } from '../world/quests';
import { BUILDINGS, FOLLOWER_INFO, RITOS } from '../world/buildings';
import { MIRACLES, ABILITIES } from '../engine/abilities';
import { FACTIONS, has, built, applyEffect, type Campaign } from '../state';

export type HubAction = { t: 'quest'; id: string } | { t: 'oracle'; district: string } | { t: 'rest' } | { t: 'menu' };
const KIND_LABEL: Record<string, string> = { main: '★ Principal', side: 'Secundaria', personal: 'Personal', faction: 'Facción' };

export class HubUI {
  root: HTMLElement; camp!: Campaign; sel = 'santuario'; resolve?: (a: HubAction) => void; onChange?: () => void; modal: HTMLElement | null = null;
  constructor(root: HTMLElement) { this.root = root; }

  questStatus(q: QuestDef): 'done' | 'available' | 'locked' | 'planned' { if (q.planned) return 'planned'; if (this.camp.quests[q.id] === 'done') return 'done'; return q.when(this.camp) ? 'available' : 'locked'; }
  choose(camp: Campaign): Promise<HubAction> {
    this.camp = camp; this.render();
    return new Promise(res => { this.resolve = res; });
  }
  pick(a: HubAction) { this.closeModal(); const r = this.resolve; this.resolve = undefined; r?.(a); }

  render() {
    const c = this.camp; this.root.innerHTML = ''; this.root.className = 'screen'; this.root.id = 'hub';
    const map = h('div', { class: 'wmap' });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.classList.add('wsvg');
    svg.innerHTML = `<defs><radialGradient id="gr" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#3a2552"/><stop offset="1" stop-color="#0a0714"/></radialGradient></defs>
      <rect width="100" height="100" fill="url(#gr)"/>
      <path d="M44 0 L58 0 L55 16 L61 30 L56 44 L63 58 L55 72 L60 86 L52 100 L42 100 L47 84 L40 70 L46 56 L38 42 L45 28 L40 14 Z" fill="#05030b" opacity=".85"/>
      <path d="M44 0 L58 0 L55 16 L61 30 L56 44 L63 58 L55 72 L60 86 L52 100 L42 100 L47 84 L40 70 L46 56 L38 42 L45 28 L40 14 Z" fill="none" stroke="#6B2D5C" stroke-width=".4"/>`;
    for (const [a, b] of ROADS) { const A = DISTRICT_BY_ID[a], B = DISTRICT_BY_ID[b]; const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', String(A.x)); l.setAttribute('y1', String(A.y)); l.setAttribute('x2', String(B.x)); l.setAttribute('y2', String(B.y)); l.setAttribute('stroke', (A.open(c) && B.open(c)) ? '#d4a574' : '#4a3a5a'); l.setAttribute('stroke-width', '.35'); l.setAttribute('stroke-dasharray', (A.open(c) && B.open(c)) ? '' : '1 1'); svg.append(l); }
    map.append(svg);
    for (const d of DISTRICTS) {
      const open = d.open(c); const avail = QUESTS.filter(q => q.district === d.id && this.questStatus(q) === 'available');
      const hasMain = avail.some(q => q.kind === 'main'); const hasPers = avail.some(q => q.kind === 'personal');
      const el = h('button', { class: `node ${open ? '' : 'locked'} ${this.sel === d.id ? 'sel' : ''} ${hasMain ? 'main' : ''}`, style: { left: d.x + '%', top: d.y + '%' }, title: d.name, onClick: () => { this.sel = d.id; this.render(); } },
        h('span', { class: 'ic' }, d.icon), h('span', { class: 'nm' }, d.name), avail.length ? h('span', { class: `dot ${hasMain ? 'm' : hasPers ? 'p' : ''}` }, String(avail.length)) : null);
      map.append(el);
    }
    const dist = DISTRICT_BY_ID[this.sel]; this.root.append(map, this.panel(dist), this.bottom());
  }
  panel(d: District): HTMLElement {
    const c = this.camp; const open = d.open(c); const p = h('aside', { class: 'wpanel' });
    p.append(h('h3', {}, d.name), h('div', { class: 'small' }, `Peligro ${'●'.repeat(Math.min(5, Math.ceil(d.danger / 2)))}${'○'.repeat(5 - Math.min(5, Math.ceil(d.danger / 2)))}`), h('p', { class: 'lore' }, d.blurb));
    if (!open) { p.append(h('div', { class: 'tag bad' }, '🔒 ' + (d.lockedNote ?? 'Cerrado'))); return p; }
    const qs = QUESTS.filter(q => q.district === d.id); const order = { main: 0, personal: 1, side: 2, faction: 3 } as Record<string, number>;
    qs.sort((a, b) => order[a.kind] - order[b.kind]);
    for (const q of qs) {
      const st = this.questStatus(q); if (st === 'locked') continue;
      p.append(h('div', { class: `qcard ${st} ${q.kind}` }, h('div', { class: 'qk' }, KIND_LABEL[q.kind] + (q.pc ? ` · ${q.pc}` : '')), h('b', {}, q.title), h('div', { class: 'small' }, q.blurb), h('div', { class: 'small' }, `Recompensa: ${q.reward}`),
        st === 'available' ? h('button', { class: 'btn sm', onClick: () => this.pick({ t: 'quest', id: q.id }) }, q.kind === 'main' ? `Iniciar (${q.days} días)` : `Aceptar (${q.days} día${q.days > 1 ? 's' : ''})`) : st === 'done' ? h('div', { class: 'tag good' }, '✔ Completada') : h('div', { class: 'tag' }, 'Próximamente')));
    }
    const free = built(c, 'alfombra');
    p.append(h('div', { class: 'qcard' }, h('div', { class: 'qk' }, 'Oráculo de las Mil Lenguas'), h('div', { class: 'small' }, `Recorrer el distrito: el Oráculo miente, pero el evento es real. Cuesta ${free ? 'ningún día (Alfombra Viviente)' : '1 día'}.`), h('button', { class: 'btn sm', onClick: () => this.pick({ t: 'oracle', district: d.id }) }, '🔮 Recorrer ' + d.name)));
    return p;
  }
  bottom(): HTMLElement {
    const c = this.camp;
    return h('div', { class: 'wbar' },
      h('button', { class: 'act', onClick: () => this.openSanctuary() }, '☥ Santuario'),
      h('button', { class: 'act', onClick: () => this.openJournal() }, '📜 Diario de misiones'),
      h('button', { class: 'act', onClick: () => this.pick({ t: 'rest' }) }, '🌙 Descansar un día'),
      h('button', { class: 'act', onClick: () => this.pick({ t: 'menu' }) }, 'Guardar y salir'),
      h('div', { class: 'pips' }, h('span', { class: 'pip free' }, `Día ${c.day}`), h('span', { class: `pip ${c.alert >= 7 ? '' : 'free'}`, style: c.alert >= 7 ? { color: '#ff9c8f', borderColor: '#8a3a34' } : {} }, `Alerta ${c.alert}/10`), h('span', { class: 'pip free' }, `PF ${c.pf}`)));
  }
  // ───────── modales ─────────
  closeModal() { this.modal?.remove(); this.modal = null; }
  openModal(title: string, body: HTMLElement) {
    this.closeModal();
    const m = h('div', { class: 'overlay', onClick: (e: MouseEvent) => { if (e.target === m) this.closeModal(); } }, h('div', { class: 'card wide' }, h('h2', { style: { fontSize: '26px' } }, title), body, h('button', { class: 'btn ghost', style: { marginTop: '12px' }, onClick: () => this.closeModal() }, 'Cerrar')));
    this.modal = m; this.root.append(m);
  }
  openJournal() {
    const c = this.camp; const b = h('div', { class: 'res jr' });
    for (const kind of ['main', 'personal', 'side'] as const) {
      b.append(h('div', { class: 'sec' }, KIND_LABEL[kind]));
      for (const q of QUESTS.filter(q => q.kind === kind)) { const st = this.questStatus(q); if (st === 'locked' && kind !== 'main') continue; b.append(h('div', { class: 'jq' }, h('span', { class: `tag ${st === 'done' ? 'good' : st === 'available' ? 'mag' : ''}` }, st === 'done' ? '✔' : st === 'available' ? '●' : st === 'planned' ? '…' : '🔒'), h('b', {}, ' ' + q.title), h('div', { class: 'small' }, `${DISTRICT_BY_ID[q.district].name} · ${q.giver}`))); }
    }
    b.append(h('div', { class: 'sec' }, 'Reputación'));
    for (const [k, v] of Object.entries(c.rep)) b.append(h('div', { class: 'small' }, `${FACTIONS[k] ?? k}: ${v >= 0 ? '+' : ''}${v}`));
    if (c.journal.length) { b.append(h('div', { class: 'sec' }, 'Diario')); for (const j of c.journal.slice(-12).reverse()) b.append(h('div', { class: 'small' }, j)); }
    this.openModal('Diario de misiones', b);
  }
  openSanctuary() {
    const c = this.camp; const b = h('div', { class: 'res' });
    const stats = h('div', {}, h('span', { class: 'tag' }, `PF ${c.pf}`), h('span', { class: 'tag' }, `Seguidores ${c.followers.length}`), h('span', { class: 'tag' }, `Día ${c.day}`), built(c, 'biblioteca') ? h('span', { class: 'tag bad' }, `Sello del Simurg ${Math.min(100, c.seal)}/100`) : h('span', { class: 'tag' }, 'Sello del Simurg: ??? (la Biblioteca lo revelaría)'));
    b.append(stats, h('div', { class: 'sec' }, 'Edificios y objetos'));
    for (const bd of BUILDINGS) {
      const own = built(c, bd.id); const canBuy = !own && c.pf >= bd.pf;
      b.append(h('div', { class: 'jq' }, h('span', {}, bd.icon + ' '), h('b', {}, bd.name), h('div', { class: 'small' }, bd.effect), h('div', { class: 'small lore' }, bd.blurb),
        own ? h('span', { class: 'tag good' }, '✔ construido') : h('button', { class: 'btn sm', disabled: !canBuy, onClick: () => { c.pf -= bd.pf; c.buildings.push(bd.id); if (bd.id === 'collar') applyEffect(c, { c: 3 }); this.onChange?.(); this.openSanctuary(); } }, `Construir · ${bd.pf} PF`)));
    }
    b.append(h('div', { class: 'sec' }, 'Milagros (se gastan PF en combate)'));
    for (const m of MIRACLES) { const ab = ABILITIES[m.id]; const val = m.need === 'd' ? c.d : c.c; const ok = val >= m.min; b.append(h('div', { class: 'jq' }, h('span', { class: `tag ${ok ? 'good' : ''}` }, ok ? '✔' : '🔒'), h('b', {}, ' ' + ab.name), h('div', { class: 'small' }, `${ab.desc} · requiere ${m.need === 'd' ? 'Devoción' : 'Corrupción'} ≥ ${m.min}`))); }
    b.append(h('div', { class: 'sec' }, 'Seguidores'));
    if (!c.followers.length) b.append(h('div', { class: 'small' }, 'Aún no tenéis seguidores.'));
    for (const f of c.followers) b.append(h('div', { class: 'jq' }, h('b', {}, f), h('div', { class: 'small' }, FOLLOWER_INFO[f] ?? 'Se unió al culto.')));
    b.append(h('div', { class: 'small lore', style: { marginTop: '8px' } }, RITOS));
    this.openModal('Santuario · La Biblioteca', b);
  }
}
void has;
