import { h } from './dom';
import { DISTRICTS, ROADS, DISTRICT_BY_ID, type District } from '../world/districts';
import { QUESTS, type QuestDef } from '../world/quests';
import { BUILDINGS, RITOS } from '../world/buildings';
import { ROLES, TRAITS, RITUALS, projection, sermon, recruit, ritual, setRole, type Role, type ActResult } from '../world/followers';
import { MIRACLES, ABILITIES } from '../engine/abilities';
import type { InvUI } from './invUI';
import { LevelUI } from './levelUI';
import { POIS, POI_BY_ID, PHASE, poiState, FRONT_LABEL, FRONT_COLOR, FRONT_DISTRICTS, closedByFront } from '../world/pois';
import { BOND_NAME } from '../world/bonds';
import { FACTIONS, has, built, applyEffect, pendingLevel, type Campaign } from '../state';

export type HubAction = { t: 'quest'; id: string } | { t: 'oracle'; district: string } | { t: 'peek'; district: string } | { t: 'rest' } | { t: 'menu' } | { t: 'poi'; id: string } | { t: 'roamer'; id: string } | { t: 'reinforce'; district: string } | { t: 'leave' };
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
      const fr = c.front[d.id]; const rm = c.roamers.filter(r => r.district === d.id).length;
      const el = h('button', { class: `node ${open ? '' : 'locked'} ${this.sel === d.id ? 'sel' : ''} ${hasMain ? 'main' : ''}`, style: { left: d.x + '%', top: d.y + '%', ...(fr && open ? { boxShadow: `0 0 0 2px ${FRONT_COLOR[fr]}, 0 0 14px ${FRONT_COLOR[fr]}66` } : {}) }, title: d.name + (fr ? ` · ${FRONT_LABEL[fr]}` : ''), onClick: () => { this.sel = d.id; this.render(); } },
        h('span', { class: 'ic' }, d.icon), h('span', { class: 'nm' }, d.name), avail.length ? h('span', { class: `dot ${hasMain ? 'm' : hasPers ? 'p' : ''}` }, String(avail.length)) : null, rm ? h('span', { class: 'dot', style: { background: '#a33', right: 'auto', left: '-4px' } }, '⚔') : null);
      map.append(el);
    }
    const dist = DISTRICT_BY_ID[this.sel]; this.root.append(map, this.panel(dist), this.bottom());
  }
  panel(d: District): HTMLElement {
    const c = this.camp; const open = d.open(c); const p = h('aside', { class: 'wpanel' });
    p.append(h('h3', {}, d.name), h('div', { class: 'small' }, `Peligro ${'●'.repeat(Math.min(5, Math.ceil(d.danger / 2)))}${'○'.repeat(5 - Math.min(5, Math.ceil(d.danger / 2)))}`), h('p', { class: 'lore' }, d.blurb));
    if (!open) { p.append(h('div', { class: 'tag bad' }, '🔒 ' + (d.lockedNote ?? 'Cerrado'))); return p; }
    const fr = c.front[d.id];
    if (fr) {
      p.append(h('div', { class: 'tag', style: { borderColor: FRONT_COLOR[fr], color: FRONT_COLOR[fr] } }, `⚑ Frente: ${FRONT_LABEL[fr]}`));
      if (fr !== 'libre' && FRONT_DISTRICTS.includes(d.id)) p.append(h('button', { class: 'btn sm ghost', disabled: c.pf < 3, onClick: () => this.pick({ t: 'reinforce', district: d.id }) }, `🛡 Reforzar el frente (−3 PF, una fase)`));
    }
    for (const r of c.roamers.filter(x => x.district === d.id)) p.append(h('div', { class: 'qcard main' }, h('div', { class: 'qk' }, '⚔ Errante'), h('b', {}, r.kind === 'conclave' ? 'Recaudador del Conclave' : r.kind === 'culto' ? 'Infiltrado del Culto de Dahhak' : 'Ghuls errantes'), h('div', { class: 'small' }, `Lleva ${c.day - r.since} días aquí. Si pasan 8, la Alerta sube.`), h('button', { class: 'btn sm', onClick: () => this.pick({ t: 'roamer', id: r.id }) }, 'Enfrentarlo (una fase)')));
    const pois = POIS.filter(x => x.district === d.id && poiState(c, x) !== 'hidden' && poiState(c, x) !== 'locked');
    if (pois.length) p.append(h('div', { class: 'sec' }, `Lugares · ${PHASE[c.phase]}`));
    for (const x of pois) {
      const st = poiState(c, x); const bond = x.npc ? c.bond[x.npc] ?? 0 : -1;
      p.append(h('div', { class: 'qcard' }, h('div', { class: 'qk' }, `${x.icon} ${x.hidden ? 'Descubierto · ' : ''}${x.npc ? `${BOND_NAME[x.npc]} ${'♥'.repeat(bond)}${'♡'.repeat(5 - bond)}` : 'Lugar'}`), h('b', {}, x.name), h('div', { class: 'small' }, x.desc),
        st === 'ok' ? h('button', { class: 'btn sm', onClick: () => this.pick({ t: 'poi', id: x.id }) }, 'Visitar (una fase)') : h('div', { class: 'tag' }, st === 'cd' ? `Volved en ${(c.poiCd[x.id] ?? 0) - c.day} día(s)` : st === 'night' ? `Sólo abierto: ${(x.ph ?? []).map(i => PHASE[i]).join(' / ')}` : 'Cerrado: la facción que domina el barrio ahuyentó a la gente. Reforzad el frente.')));
    }
    void POI_BY_ID; void closedByFront;
    const qs = QUESTS.filter(q => q.district === d.id); const order = { main: 0, personal: 1, side: 2, faction: 3 } as Record<string, number>;
    qs.sort((a, b) => order[a.kind] - order[b.kind]);
    for (const q of qs) {
      const st = this.questStatus(q); if (st === 'locked') continue;
      p.append(h('div', { class: `qcard ${st} ${q.kind}` }, h('div', { class: 'qk' }, KIND_LABEL[q.kind] + (q.pc ? ` · ${q.pc}` : '')), h('b', {}, q.title), h('div', { class: 'small' }, q.blurb), h('div', { class: 'small' }, `Recompensa: ${q.reward}`),
        st === 'available' ? h('button', { class: 'btn sm', onClick: () => this.pick({ t: 'quest', id: q.id }) }, q.kind === 'main' ? `Iniciar (${q.days} días)` : `Aceptar (${q.days} día${q.days > 1 ? 's' : ''})`) : st === 'done' ? h('div', { class: 'tag good' }, '✔ Completada') : h('div', { class: 'tag' }, 'Próximamente')));
    }
    const free = built(c, 'alfombra');
    p.append(h('div', { class: 'qcard' }, h('div', { class: 'qk' }, 'Oráculo de las Mil Lenguas'), h('div', { class: 'small' }, `Recorrer el distrito: el Oráculo miente, pero el evento es real. Cuesta ${free ? 'ningún día (Alfombra Viviente)' : '1 día'}.`), h('button', { class: 'btn sm', onClick: () => this.pick({ t: 'oracle', district: d.id }) }, '🔮 Recorrer ' + d.name), c.rumors >= 2 && !(c.peek && c.peek.district === d.id) ? h('button', { class: 'btn sm ghost', onClick: () => this.pick({ t: 'peek', district: d.id }) }, '👁 Preguntar a los espías (−2 rumores)') : null, c.peek && c.peek.district === d.id ? h('div', { class: 'tag good' }, 'Los espías ya saben qué os espera aquí.') : null));
    return p;
  }
  bottom(): HTMLElement {
    const c = this.camp;
    return h('div', { class: 'wbar' },
      h('button', { class: 'act', onClick: () => this.openSanctuary() }, '☥ Santuario'),
      h('button', { class: `act ${pendingLevel(c) ? 'on' : ''}`, onClick: () => this.openLevel() }, pendingLevel(c) ? `⬆ Subir a nivel ${pendingLevel(c)}` : `⭐ Nivel ${c.lvl}`),
      h('button', { class: 'act', onClick: () => this.openInventory() }, '🎒 Inventario'),
      h('button', { class: 'act', onClick: () => this.openJournal() }, '📜 Diario de misiones'),
      h('button', { class: 'act', onClick: () => this.pick({ t: 'rest' }) }, '🌙 Descansar un día'),
      h('button', { class: 'act', onClick: () => this.pick({ t: 'menu' }) }, 'Guardar y salir'),
      has(c, 'cap2_done') && !has(c, 'cap13_done') ? h('button', { class: 'act', style: { color: '#ff9c8f' }, onClick: () => this.confirmLeave() }, '🏜 Abandonar Zaryab') : null,
      h('div', { class: 'pips' }, h('span', { class: 'pip free' }, `Día ${c.day} · ${PHASE[c.phase]}`), h('span', { class: `pip ${c.alert >= 7 ? '' : 'free'}`, style: c.alert >= 7 ? { color: '#ff9c8f', borderColor: '#8a3a34' } : {} }, `Alerta ${c.alert}/10`), h('span', { class: 'pip free' }, `PF ${c.pf}`), h('span', { class: 'pip free' }, `${c.gold} PO`)));
  }
  confirmLeave() {
    const b = h('div', { class: 'res' }, h('div', {}, 'Podéis dar la espalda a Zaryab, a Zahir y al Eclipse. Es un final, no una pausa: la campaña termina aquí y la partida guardada se borra.'), h('div', { class: 'small lore' }, 'Si sólo queréis descansar, usad «Guardar y salir».'), h('button', { class: 'btn', style: { marginTop: '10px', background: '#4a1f1f' }, onClick: () => this.pick({ t: 'leave' }) }, 'Irme al desierto, de verdad'));
    this.openModal('¿Abandonar Zaryab?', b);
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
    if (c.huellas.length) { b.append(h('div', { class: 'sec' }, 'Huellas · lo que dejáis atrás')); for (const x of c.huellas) b.append(h('div', { class: 'small lore' }, '• ' + x)); }
    if (c.journal.length) { b.append(h('div', { class: 'sec' }, 'Diario')); for (const j of c.journal.slice(-12).reverse()) b.append(h('div', { class: 'small' }, j)); }
    this.openModal('Diario de misiones', b);
  }
  inv?: InvUI; lvl = new LevelUI();
  openInventory(tab = 'personajes') { if (!this.inv) return; this.openModal('Inventario · Equipo y objetos', this.inv.render(this.camp, tab, () => { this.onChange?.(); this.openInventory(this.inv!.tab); })); }
  openLevel() { const c = this.camp; this.lvl.redraw = () => this.openLevel(); const done = () => { this.onChange?.(); this.render(); this.closeModal(); if (pendingLevel(c)) this.openLevel(); }; this.openModal(pendingLevel(c) ? 'Subida de nivel' : 'Nivel del grupo', this.lvl.render(c, done)); }
  lastMsg = ''; api?: { advance: (n: number) => void };
  act(r: ActResult, tab: string) { this.lastMsg = r.text; if (r.ok && r.days) this.api?.advance(r.days); this.onChange?.(); this.openSanctuary(tab); }
  openSanctuary(tab = 'seguidores') {
    const c = this.camp; const b = h('div', { class: 'res' });
    const tabs = h('div', { class: 'tabs' }, ...[['seguidores', '👥 Seguidores'], ['rituales', '🕯 Rituales'], ['edificios', '🏛 Edificios'], ['milagros', '✦ Milagros']].map(([id, lb]) => h('button', { class: `tabbtn ${tab === id ? 'on' : ''}`, onClick: () => this.openSanctuary(id) }, lb)));
    const stats = h('div', {}, h('span', { class: 'tag' }, `PF ${c.pf}`), h('span', { class: 'tag' }, `🥖 Víveres ${c.food}`), h('span', { class: 'tag' }, `🧱 Materiales ${c.mats}`), h('span', { class: 'tag' }, `👁 Rumores ${c.rumors}`), h('span', { class: 'tag' }, `Seguidores ${c.followers.length}`), built(c, 'biblioteca') ? h('span', { class: 'tag bad' }, `Sello del Simurg ${Math.min(100, c.seal)}/100`) : h('span', { class: 'tag' }, 'Sello del Simurg: ???'));
    b.append(tabs, stats); if (this.lastMsg) b.append(h('div', { class: 'msg' }, this.lastMsg));
    if (tab === 'seguidores') {
      const p = projection(c);
      b.append(h('div', { class: 'small', style: { margin: '6px 0' } }, `Cada 3 días: ${[`+${p.pf} PF`, `+${p.food} víveres`, `+${p.mats} materiales`, `+${p.rumors} rumores`].join(' · ')} · el culto come ${p.need} víveres.${c.food < p.need ? ' ⚠ Faltan víveres.' : ''}`),
        h('div', {}, h('button', { class: 'btn sm', onClick: () => this.act(sermon(c, 'fe'), tab) }, 'Sermón de Fe (1 día)'), ' ', h('button', { class: 'btn sm', onClick: () => this.act(sermon(c, 'hierro'), tab) }, 'Sermón de Hierro (1 día, +1 Corrupción)'), ' ', h('button', { class: 'btn sm', onClick: () => this.act(recruit(c), tab) }, 'Predicar y reclutar (1 día)')));
      if (!c.followers.length) b.append(h('div', { class: 'small', style: { marginTop: '10px' } }, 'Aún no tenéis seguidores. Predicad en el Bajo Zaryab.'));
      for (const f of c.followers) {
        const sel = h('select', { onChange: (e: Event) => { setRole(c, f.id, (e.target as HTMLSelectElement).value as Role); this.onChange?.(); this.openSanctuary(tab); } }, ...f.apt.map(r => h('option', { value: r, selected: r === f.role }, `${ROLES[r].icon} ${ROLES[r].label}`)));
        b.append(h('div', { class: `fcard ${f.sick ? 'sick' : ''}` }, h('div', { class: 'fh' }, h('b', {}, f.name), f.trait ? h('span', { class: 'tag mag', title: TRAITS[f.trait].desc }, TRAITS[f.trait].label) : null, f.sick ? h('span', { class: 'tag bad' }, 'enfermo') : null, f.prov ? h('span', { class: 'tag', title: 'El canon sólo da el nombre: oficio provisional.' }, 'oficio provisional') : null),
          h('div', { class: 'fe' }, ...Array.from({ length: 10 }, (_, i) => h('i', { class: i < f.fe ? 'on' : '' }))), h('div', { class: 'small lore' }, f.blurb), h('div', { class: 'frow' }, sel, h('span', { class: 'small' }, ROLES[f.role].out))));
      }
    } else if (tab === 'rituales') {
      for (const r of RITUALS) {
        const asc = r.id === 'ascension';
        b.append(h('div', { class: 'jq' }, h('b', {}, r.name), h('div', { class: 'small' }, r.desc), h('div', { class: 'small', style: { color: 'var(--secondary)' } }, r.cost),
          asc ? h('div', {}, h('button', { class: 'btn sm', onClick: () => this.act(ritual(c, r.id, 'ascender'), tab) }, 'Ascender'), ' ', h('button', { class: 'btn sm', onClick: () => this.act(ritual(c, r.id, 'reliquia'), tab) }, 'Convertir en reliquia')) : h('button', { class: 'btn sm', onClick: () => this.act(ritual(c, r.id), tab) }, 'Celebrar')));
      }
      b.append(h('div', { class: 'small lore', style: { marginTop: '8px' } }, RITOS));
    } else if (tab === 'edificios') {
      for (const bd of BUILDINGS) {
        const own = built(c, bd.id); const mats = Math.min(c.mats, Math.floor(bd.pf / 2)); const need = bd.pf - mats * 2; const canBuy = !own && c.pf >= need;
        b.append(h('div', { class: 'jq' }, h('span', {}, bd.icon + ' '), h('b', {}, bd.name), h('div', { class: 'small' }, bd.effect), h('div', { class: 'small lore' }, bd.blurb),
          own ? h('span', { class: 'tag good' }, '✔ construido') : h('button', { class: 'btn sm', disabled: !canBuy, onClick: () => { c.pf -= need; c.mats -= mats; c.buildings.push(bd.id); if (bd.id === 'collar') applyEffect(c, { c: 3 }); this.lastMsg = `${bd.name} construido.`; this.onChange?.(); this.openSanctuary(tab); } }, `Construir · ${need} PF${mats ? ` + ${mats} materiales` : ''}`)));
      }
    } else {
      b.append(h('div', { class: 'small' }, 'Los Milagros se gastan en combate con PF. Los lanza cualquier portador del cristal de Zahir.'));
      for (const m of MIRACLES) { const ab = ABILITIES[m.id]; const val = m.need === 'd' ? c.d : c.c; const ok = val >= m.min; b.append(h('div', { class: 'jq' }, h('span', { class: `tag ${ok ? 'good' : ''}` }, ok ? '✔' : '🔒'), h('b', {}, ' ' + ab.name), h('div', { class: 'small' }, `${ab.desc} · requiere ${m.need === 'd' ? 'Devoción' : 'Corrupción'} ≥ ${m.min}`))); }
    }
    this.openModal('Santuario · La Biblioteca', b);
  }
}
void has;
