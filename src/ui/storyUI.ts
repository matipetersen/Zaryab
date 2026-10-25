import { portraitUrl, slug } from './portraits';
import { h, sleep, avatar } from './dom';
import type { Node, Opt } from '../story/types';
import { SPEAKERS } from '../story/speakers';
import { applyEffect, has, built, previewEffect, type Campaign, type Effect } from '../state';
import { MARKS, MARK_ANSWER } from '../story/script';
import { PARTY_BY_ID } from '../data/party';
import { StageView, BG_MAP } from './stage';
import { assetUrl } from './assets';
import { audio, type Mood } from './audio';

const BG: Record<string, string> = {
  prison: 'radial-gradient(ellipse at 50% 90%, #3a2a1a 0%, #140e0a 60%, #060404 100%)',
  coliseo: 'radial-gradient(ellipse at 50% 20%, #8a4a7a 0%, #3a1a40 40%, #0d0716 100%)',
  medinat: 'radial-gradient(ellipse at 50% 60%, #c98a4a 0%, #7a3f5a 40%, #1d0f2a 100%)',
  dunas: 'radial-gradient(ellipse at 50% 70%, #d9d6e6 0%, #8d87a8 30%, #3b3258 65%, #120d1f 100%)',
  tormenta: 'linear-gradient(180deg, #8a7a66 0%, #b59d7b 40%, #5d4c3a 100%)',
  limbo: 'radial-gradient(ellipse at 50% 40%, #f2eee4 0%, #b9b2d6 35%, #3b3260 80%, #120d24 100%)',
  bajo: 'linear-gradient(180deg, #2a1a40 0%, #5a3a5a 40%, #1a1020 100%)',
  choza: 'radial-gradient(ellipse at 50% 60%, #6a3a22 0%, #2a160e 55%, #0a0605 100%)',
  zoco: 'linear-gradient(180deg, #4a1f5e 0%, #7b3a7a 30%, #d4a574 100%)',
  taller: 'radial-gradient(ellipse at 40% 50%, #8b5a2a 0%, #3a2210 55%, #0e0804 100%)',
  hammam: 'radial-gradient(ellipse at 50% 70%, #2f5a6a 0%, #162a36 55%, #050b10 100%)',
  espejos: 'radial-gradient(ellipse at 50% 50%, #5a5a9a 0%, #1c1c3c 60%, #07070f 100%)',
  acueducto: 'radial-gradient(ellipse at 50% 80%, #2f7f90 0%, #14363e 50%, #050f12 100%)',
  cubo: 'radial-gradient(ellipse at 50% 50%, #e4e6f4 0%, #8e95bd 40%, #1c1a3a 100%)',
  plaza: 'radial-gradient(ellipse at 50% 90%, #b0402a 0%, #5a1a1a 45%, #120505 100%)',
  oraculo: 'radial-gradient(ellipse at 50% 35%, #7a4fb0 0%, #2a1850 45%, #07040f 100%)',
};

export class StoryUI {
  stage?: StageView; el!: HTMLElement; bg!: HTMLElement; dlg!: HTMLElement; camp!: Campaign; hud!: () => void;
  battle!: (enc: string, foeCount?: number, foes?: any[]) => Promise<boolean>;
  onTop?: (i: number) => void;

  constructor(public root: HTMLElement) {}
  mount() {
    this.root.innerHTML = ''; this.root.className = 'screen'; this.root.id = 'story';
    this.bg = h('div', { class: 'bg' }); this.dlg = h('div', { class: 'dialog hidden' });
    this.stage?.destroy(); this.el = h('div', { style: { position: 'absolute', inset: '0' } }, this.bg, h('div', { class: 'vignette' }), this.dlg);
    this.root.append(this.el); this.stage = new StageView(this.bg); this.stage.show(false); this.setBg('prison');
  }
  /** Quiénes aparecen en escena: la escuadra elegida o toda la compañía viva. */
  cast(): string[] { const c = this.camp; const alive = c.party.filter(id => !c.dead.includes(id)); return c.squad?.length ? c.squad.filter(id => alive.includes(id)) : alive; }
  /** Enemigos de un nodo 'stage' que aún no se mostraron: aparecen con la siguiente línea (la que los presenta). */
  private pendingFoes?: string[];
  /** Cambia el fondo. Si el fondo corresponde a un mapa, la escena pasa a ese mapa SIN enemigos; si es el mismo mapa,
   *  nadie se mueve ni se repite la entrada. `scene`: empieza una escena nueva (capítulo) → se van también los interlocutores.
   *  `mapLater`: el próximo nodo es un 'stage' que elige el mapa, así que acá solo se cambia el fondo pintado y la música. */
  setBg(id: string, scene = false, mapLater = false) {
    this.pendingFoes = undefined;
    const MOOD: Record<string, Mood> = { dunas: 'desert', tormenta: 'desert', medinat: 'city', zoco: 'city', plaza: 'city', bajo: 'city', taller: 'city', choza: 'sacred', oraculo: 'sacred', limbo: 'sacred', prison: 'tense', coliseo: 'tense', hammam: 'tense', espejos: 'tense', cubo: 'tense', acueducto: 'tense' }; audio.setMood(MOOD[id] ?? 'tense');
    const art = assetUrl('bg', id); this.bg.style.background = art ? `url(${art}) center/cover` : (BG[id] ?? BG.prison);
    if (mapLater) return;
    const m = art ? undefined : BG_MAP[id]; if (m && this.stage) { void this.stage.set(m, this.cast(), []); if (scene) this.stage.clear(true); } else { this.stage?.clear(true); this.stage?.show(false); }
  }

  // ---------- esperar avance ----------
  advance(): Promise<void> {
    return new Promise(res => {
      const done = () => { window.removeEventListener('keydown', key); this.root.removeEventListener('click', click); res(); };
      const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); done(); } };
      const click = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('.choice, .puzzle, button, select')) return; done(); };
      window.addEventListener('keydown', key); this.root.addEventListener('click', click);
    });
  }
  async type(el: HTMLElement, text: string) {
    let skip = !!(window as any).__fast; const stop = () => (skip = true);
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { skip = true; e.stopPropagation(); } };
    this.root.addEventListener('click', stop, { once: true }); window.addEventListener('keydown', key, true);
    for (let i = 0; i <= text.length && !skip; i++) { el.textContent = text.slice(0, i); await sleep(text[i - 1] === '.' ? 90 : 14); }
    el.textContent = text; this.root.removeEventListener('click', stop); window.removeEventListener('keydown', key, true);
  }
  badges(lines: string[]): HTMLElement { return h('div', { class: 'badges' }, ...lines.map(l => h('span', { class: `badge ${/Corrup/.test(l) ? 'c' : /Devoc/.test(l) ? 'd' : /PF/.test(l) ? 'pf' : 'n'}` }, l))); }

  async show(who: string | null, text: string, tone?: string, extra?: HTMLElement | null) {
    this.dlg.classList.remove('hidden'); this.dlg.innerHTML = '';
    const sp = who ? SPEAKERS[who] : undefined; this.stage?.speak(who);
    const txt = h('div', { class: `txt ${who ? '' : 'narr'}` });
    const body = h('div', { style: { flex: '1', minWidth: '0' } }, who ? h('div', { class: 'who' }, who) : null, tone ? h('div', { class: 'tone' }, `(${tone})`) : null, txt);
    const row = h('div', { class: 'row' });
    if (sp) { const url = portraitUrl(sp.img ?? slug(who!)); const p = h('div', { class: 'portrait', style: { background: url ? `url(${url}) center/cover` : sp.color } }, url ? '' : sp.glyph); row.append(p); }
    row.append(body); this.dlg.append(row); if (extra) this.dlg.append(extra);
    const hint = h('div', { class: 'hint' }, (window.matchMedia?.('(hover: none)').matches ? 'tocá para continuar' : 'clic · espacio para continuar')); this.dlg.append(hint);
    await this.type(txt, text);
  }
  async pause() { await this.advance(); }
  private revealFoes() { const f = this.pendingFoes; if (!f) return; this.pendingFoes = undefined; this.stage?.setFoes(f); }

  // ---------- reproducción ----------
  async play(nodes: Node[], top = false): Promise<void> {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]; await this.node(n, nodes[i + 1]);
      if (top) this.onTop?.(i + 1);
    }
  }
  async node(n: Node, next?: Node): Promise<void> {
    switch (n.t) {
      case 'chapter': {
        this.dlg.classList.add('hidden'); if (n.bg) this.setBg(n.bg, true, next?.t === 'stage');
        const t = h('div', { class: 'stage-title' }, h('h1', {}, n.title), h('p', {}, n.sub)); this.el.append(t); await sleep((window as any).__fast ? 50 : 500); await Promise.race([this.advance(), sleep((window as any).__fast ? 100 : 5500)]); t.remove(); return; }
      case 'bg': this.setBg(n.id); return;
      // El mapa y la compañía aparecen ya; los enemigos pedidos, con la línea siguiente (la que los presenta).
      case 'stage': this.bg.style.background = BG.limbo; await this.stage?.set(n.map, this.cast(), []); this.stage?.clear(true); this.pendingFoes = n.foes?.length ? n.foes : undefined; return;
      case 'narr': this.revealFoes(); await this.show(null, n.text); await this.pause(); return;
      case 'say': this.revealFoes(); await this.show(n.who, n.text, n.tone); await this.pause(); return;
      case 'fx': { const lines = applyEffect(this.camp, n.e); this.hud(); if (n.note || lines.length) { await this.show(null, n.note ?? 'Ha ocurrido algo.', undefined, this.badges(lines)); await this.pause(); } return; }
      case 'if': { const ok = has(this.camp, n.flag); await this.play(ok ? n.then : n.else ?? []); return; }
      case 'choice': return this.choice(n.prompt, n.options);
      // al volver del combate, los enemigos de la escena previa (briefing) ya no están en el mapa
      case 'battle': { let won = false; while (!won) { won = await this.battle(n.enc, n.foeCount); if (n.soft) break; } this.pendingFoes = undefined; this.stage?.clear(); return; }
      case 'puzzle': return this.marksPuzzle();
      case 'squad': return this.squadPick(n.n, n.label);
      case 'end': this.dlg.classList.add('hidden'); { const t = h('div', { class: 'stage-title' }, h('h1', {}, n.title), h('p', {}, n.text)); t.style.top = '30%'; t.querySelector('p')!.setAttribute('style', 'max-width:720px;margin:14px auto;line-height:1.7;letter-spacing:.04em;text-transform:none'); this.el.append(t); const b = h('button', { class: 'btn', style: { position: 'absolute', bottom: '14%', left: '50%', transform: 'translateX(-50%)' } }, 'Volver al mapa de Zaryab'); this.el.append(b); await new Promise<void>(r => b.addEventListener('click', () => r())); t.remove(); b.remove(); } return;
    }
  }
  async choice(prompt: string | undefined, options: Opt[]) {
    const avail = options.filter(o => !o.if || has(this.camp, o.if));
    const wrap = h('div', { class: 'choices' });
    const picked = await new Promise<Opt>(res => {
      for (const o of avail) wrap.append(h('button', { class: 'choice', disabled: !!o.disabled, onClick: () => res(o) }, o.label, o.check ? h('small', { style: { color: '#e8c872' } }, `🎲 ${SKILL_LABEL[o.check.skill]} CD ${o.check.dc} · mejor: ${bestFor(this.camp, o.check)}`) : null, o.hint || o.disabled ? h('small', {}, o.disabled ?? o.hint) : null, built(this.camp, 'espejo') && !o.disabled && previewEffect(o.e).length ? h('small', { style: { color: '#c9a6ff' } }, '☽ ' + previewEffect(o.e).join(' · ')) : null));
      this.show(null, prompt ?? 'Elijan.', undefined, wrap);
    });
    let branch: { e?: Effect; result?: string[]; then?: Node[] } = picked;
    if (picked.check) {
      const r = rollCheck(this.camp, picked.check); const ok = r.total >= picked.check.dc;
      await this.show(null, `${PARTY_BY_ID[r.pc].name} — ${SKILL_LABEL[picked.check.skill]} (CD ${picked.check.dc}): d20 ${r.d20} ${r.mod >= 0 ? '+' : ''}${r.mod} = ${r.total}. ${r.d20 === 20 ? '¡Crítico! ' : r.d20 === 1 ? 'Pifia. ' : ''}${ok ? 'ÉXITO.' : 'FALLO.'}`, undefined); await this.pause();
      if (!ok) branch = picked.fail ?? {};
    }
    const lines = applyEffect(this.camp, branch.e); this.hud();
    for (let i = 0; i < (branch.result?.length ?? 0); i++) { await this.show(null, branch.result![i], undefined, i === branch.result!.length - 1 && lines.length ? this.badges(lines) : null); await this.pause(); }
    if (!branch.result?.length && lines.length) { await this.show(null, '…', undefined, this.badges(lines)); await this.pause(); }
    if (branch.then) await this.play(branch.then);
  }

  // ---------- elección de escuadra ----------
  async squadPick(max: number, label?: string) {
    this.dlg.classList.add('hidden');
    const alive = this.camp.party.filter(id => !this.camp.dead.includes(id)); const chosen = new Set<string>(alive.slice(0, max));
    const box = h('div', { class: 'box' }, h('h3', {}, 'Escuadra'), h('p', {}, label ?? `Elijan hasta ${max} personajes.`));
    const go = h('button', { class: 'btn', style: { marginTop: '14px' } }, 'Confirmar escuadra');
    const draw = () => { for (const el of [...box.querySelectorAll('.rowp')]) el.remove(); for (const id of alive) { const d = PARTY_BY_ID[id]; const on = chosen.has(id); box.insertBefore(h('div', { class: 'rowp' }, h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, avatar(d.glyph, d.color, undefined, 34), h('div', {}, h('b', {}, d.name), h('div', { class: 'small' }, d.klass))), h('button', { class: `tabbtn ${on ? 'on' : ''}`, onClick: () => { if (on) chosen.delete(id); else if (chosen.size < max) chosen.add(id); draw(); } }, on ? '✔ Va' : 'Se queda')), go); } go.textContent = `Confirmar escuadra (${chosen.size}/${max})`; };
    box.append(go); draw(); const ov = h('div', { class: 'puzzle' }, box); this.el.append(ov);
    await new Promise<void>(res => go.addEventListener('click', () => { if (chosen.size >= 1) res(); }));
    this.camp.squad = [...chosen]; ov.remove();
  }

  // ---------- puzzle de las seis marcas ----------
  async marksPuzzle() {
    this.dlg.classList.add('hidden');
    const party = this.camp.party.filter(id => !this.camp.dead.includes(id));
    const selects: Record<string, HTMLSelectElement> = {};
    const box = h('div', { class: 'box' }, h('h3', {}, 'Geometría del Dolor'), h('p', {}, 'Cada marca brilla al detectar la esencia verdadera de un alma, no su clase ni su rol. Todos deben ocupar la marca que refleja su alma real durante tres rondas. Quien se equivoque será sustituido por una copia hostil.'));
    for (const id of party) {
      const d = PARTY_BY_ID[id]; const sel = h('select', {}, h('option', { value: '' }, '— elegir marca —'), ...MARKS.map(m => h('option', { value: m.id }, m.name))); selects[id] = sel;
      box.append(h('div', { class: 'rowp' }, h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, avatar(d.glyph, d.color, undefined, 34), h('div', {}, h('b', {}, d.name), h('div', { class: 'small' }, d.blurb))), sel));
    }
    const go = h('button', { class: 'btn', style: { marginTop: '14px' } }, 'Ocupar las marcas');
    box.append(go); const ov = h('div', { class: 'puzzle' }, box); this.el.append(ov);
    await new Promise<void>(res => go.addEventListener('click', () => { if (party.some(id => !selects[id].value)) { go.textContent = 'Asignen una marca a cada alma'; return; } res(); }));
    const wrong = party.filter(id => selects[id].value !== MARK_ANSWER[id]); ov.remove();
    if (!wrong.length) { this.camp.flags.push('marcas_perfectas'); await this.show(null, 'Seis marcas. Seis almas. Una sola respiración. Las tres rondas pasan en silencio y la puerta se abre sin que un solo reflejo despierte. «Seis deben ser uno… y uno debe ser seis.»'); await this.pause(); applyEffect(this.camp, { d: 1 }); this.hud(); return; }
    const names = wrong.map(id => PARTY_BY_ID[id].name);
    await this.show(null, `La sala se traga el reflejo de ${names.join(', ')} y lo sustituye por una copia hostil: tiene su cara, sus gestos… y ninguna de sus dudas.`); await this.pause();
    const foes = wrong.slice(0, 3).map((id, i) => ({ id: 'reflejo', slot: i, suffix: ' de ' + PARTY_BY_ID[id].name.split(' ')[0] }));
    let won = false; while (!won) won = await this.battle('cubo', undefined, foes); this.pendingFoes = undefined; this.stage?.clear();
    await this.show(null, 'Los reflejos estallan en vidrios flotantes que susurran. Quienes los rompieron sienten un instante de parálisis y una visión: un secreto sobre sí mismos que preferirían no conocer.'); await this.pause();
  }
}
export type { Effect };
import { rollCheck, bestFor, SKILL_LABEL } from '../world/checks';
