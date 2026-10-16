import './style.css';
import { h, avatar } from './ui/dom';
import { StoryUI } from './ui/storyUI';
import { BattleUI, type BattleResult } from './ui/battleUI';
import { CHAPTERS } from './story/script';
import { ENCOUNTERS, MAPS } from './data/maps';
import { PARTY, PARTY_BY_ID } from './data/party';
import { buildBattle } from './engine/setup';
import { newCampaign, loadGame, saveGame, clearSave, applyEffect, type Campaign } from './state';

class App {
  app = document.getElementById('app')!; camp: Campaign = newCampaign(); settings = { permadeath: false };
  top!: HTMLElement; rootEl!: HTMLElement; menuEl!: HTMLElement; storyEl!: HTMLElement; battleEl!: HTMLElement;
  story!: StoryUI; hudEl!: HTMLElement;

  constructor() {
    try { this.settings = { ...this.settings, ...JSON.parse(localStorage.getItem('zaryab.settings') || '{}') }; } catch { /* */ }
    this.hudEl = h('div', { class: 'meters' });
    this.top = h('div', { id: 'topbar' }, h('div', { class: 'brand' }, 'ZARYAB · Las Entrañas de Piedra Viva'), this.hudEl);
    this.menuEl = h('div', { class: 'screen', id: 'menu' }); this.storyEl = h('div', { class: 'screen hidden' }); this.battleEl = h('div', { class: 'screen hidden' });
    this.rootEl = h('div', { id: 'root' }, this.menuEl, this.storyEl, this.battleEl);
    this.app.append(this.top, this.rootEl);
    this.story = new StoryUI(this.storyEl);
    this.story.battle = (enc, n, foes) => this.runBattle(enc, n, foes);
    this.story.hud = () => this.renderHud();
    this.renderHud(); this.showMenu();
    const q = new URLSearchParams(location.search);
    if (q.get('battle')) this.devBattle(q.get('battle')!);
  }
  show(which: 'menu' | 'story' | 'battle') { this.menuEl.classList.toggle('hidden', which !== 'menu'); this.storyEl.classList.toggle('hidden', which !== 'story'); this.battleEl.classList.toggle('hidden', which !== 'battle'); }
  renderHud() {
    const c = this.camp; this.hudEl.innerHTML = '';
    const m = (cls: string, label: string, v: number, max: number) => h('div', { class: `meter ${cls}` }, label, h('div', { class: 'bar' }, h('i', { style: { width: (v / max) * 100 + '%' } })), h('span', {}, `${v}/${max}`));
    this.hudEl.append(m('corr', 'Corrupción', c.c, 10), m('dev', 'Devoción', c.d, 10), h('div', { class: 'meter pf' }, 'PF ', h('b', {}, String(c.pf))),
      h('button', { class: 'tb-btn', onClick: () => { saveGame(this.camp); } }, 'Guardar'), h('button', { class: 'tb-btn', onClick: () => location.reload() }, 'Menú'));
  }
  showMenu() {
    this.show('menu'); const save = loadGame(); const m = this.menuEl; m.innerHTML = '';
    const roster = h('div', { class: 'roster' }, ...PARTY.map(p => h('div', { class: 'chip', title: p.blurb }, avatar(p.glyph, p.color, undefined, 28), h('span', {}, `${p.name} · ${p.klass}${p.sheet === 'estimada' ? ' ⚠' : ''}`))));
    const perm = h('input', { type: 'checkbox', id: 'perm' }) as HTMLInputElement; perm.checked = this.settings.permadeath;
    perm.addEventListener('change', () => { this.settings.permadeath = perm.checked; localStorage.setItem('zaryab.settings', JSON.stringify(this.settings)); });
    m.append(h('h1', {}, 'ZARYAB'), h('h2', {}, 'LAS ENTRAÑAS DE PIEDRA VIVA'), roster,
      h('button', { class: 'btn', onClick: () => { clearSave(); this.camp = newCampaign(); this.start(); } }, 'Nueva campaña'),
      h('button', { class: 'btn', disabled: !save, onClick: () => { this.camp = save!; this.start(); } }, save ? `Continuar (Cap. ${save.cursor.chapter + 1})` : 'Continuar'),
      h('label', { class: 'small', style: { display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' } }, perm, 'Muerte permanente (si no, el cristal de Zahir devuelve a los caídos a cambio de Corrupción y PF)'),
      h('div', { class: 'mnote' }, 'Combate de D&D 5.ª edición sobre cuadrícula isométrica. Fichas reales de Romain, Pact Risen, Rabb Locke y Joren Hell. ⚠ Zyr\'thar y Panchi usan estadísticas estimadas (sin ficha en los archivos). Controles: clic para mover/atacar · M mover · A atacar · H habilidades · Espacio terminar turno · rueda zoom · botón derecho arrastrar.'));
  }
  async start() {
    this.renderHud(); this.show('story'); this.story.camp = this.camp; this.story.mount();
    let ci = this.camp.cursor.chapter; let start = this.camp.cursor.path[0] ?? 0;
    for (; ci < CHAPTERS.length; ci++) {
      const nodes = CHAPTERS[ci]; const off = start; this.camp.cursor = { chapter: ci, path: [off] };
      this.story.onTop = i => { this.camp.cursor = { chapter: ci, path: [off + i] }; saveGame(this.camp); };
      await this.story.play(nodes.slice(off), true); start = 0;
      this.camp.cursor = { chapter: ci + 1, path: [0] }; saveGame(this.camp);
    }
  }
  async runBattle(enc: string, foeCount?: number, foes?: any[]): Promise<boolean> {
    const e = ENCOUNTERS[enc]; const party = this.camp.party.filter(p => !this.camp.dead.includes(p));
    let list = foes ?? e.foes; if (foeCount) list = list.slice(0, foeCount);
    const b = buildBattle(enc, party, { foes: list });
    this.show('battle'); const ui = new BattleUI(this.battleEl);
    const res = await ui.run(b, e.map, e.intro);
    const won = res.result === 'victory';
    const overlay = this.resultOverlay(res, enc); this.battleEl.append(overlay);
    await new Promise<void>(r => overlay.querySelector('button')!.addEventListener('click', () => r()));
    ui.destroy(); overlay.remove(); this.battleEl.innerHTML = ''; this.show('story');
    if (won) { this.camp.battlesWon++; this.camp.xp += res.xp; this.afterVictory(res); this.renderHud(); }
    return won;
  }
  afterVictory(res: BattleResult) {
    for (const id of res.dead) {
      if (this.settings.permadeath) { if (!this.camp.dead.includes(id)) this.camp.dead.push(id); }
      else applyEffect(this.camp, { c: 1, pf: -3 });
    }
  }
  resultOverlay(res: BattleResult, enc: string) {
    const won = res.result === 'victory'; const names = (ids: string[]) => ids.map(i => PARTY_BY_ID[i].name).join(', ');
    const lines: (string | HTMLElement)[] = [];
    if (won) {
      lines.push(h('div', {}, `Rondas: ${res.rounds} · Experiencia obtenida: `, h('b', {}, String(res.xp)), ' XP'));
      if (res.downed.length) lines.push(h('div', {}, `Caídos que se recuperan: ${names(res.downed.filter(d => !res.dead.includes(d)))}`));
      if (res.dead.length) lines.push(h('div', { style: { color: '#ff9c8f' } }, this.settings.permadeath ? `Han muerto para siempre: ${names(res.dead)}.` : `${names(res.dead)} murió… y el cristal de Zahir lo devuelve. +1 Corrupción, −3 PF.`));
      lines.push(h('div', { class: 'small' }, 'Tras el combate, un descanso corto restaura PG y recursos.'));
    } else lines.push(h('div', {}, 'La compañía ha caído. Zahir susurra: «Aún no.» Puedes reintentar el combate.'));
    void enc; void MAPS;
    return h('div', { class: 'overlay' }, h('div', { class: 'card' }, h('h2', {}, won ? 'Victoria' : 'Derrota'), h('div', { class: 'res' }, ...lines), h('button', { class: 'btn' }, won ? 'Continuar' : 'Reintentar')));
  }
  async devBattle(enc: string) {
    this.show('battle'); this.camp = newCampaign(); const e = ENCOUNTERS[enc]; const b = buildBattle(enc, this.camp.party); const ui = new BattleUI(this.battleEl); (window as any).__ui = ui; (window as any).__b = b;
    await ui.run(b, e.map, e.intro);
  }
}
new App();
