import './style.css';
import { h, avatar } from './ui/dom';
import { StoryUI } from './ui/storyUI';
import { BattleUI, type BattleResult } from './ui/battleUI';
import { HubUI } from './ui/hubUI';
import { lootFor, setMonsterXp, ITEM } from './data/items';
import { MONSTERS } from './data/monsters';
import { InvUI } from './ui/invUI';
import { ENCOUNTERS } from './data/maps';
import { PARTY, PARTY_BY_ID } from './data/party';
import { buildBattle } from './engine/setup';
import { MIRACLES } from './engine/abilities';
import { newCampaign, loadGame, saveGame, clearSave, applyEffect, has, built, progMap, pendingLevel, type Campaign } from './state';
import { CHAPTER_SCRIPTS, QUEST_BY_ID, QUESTS } from './world/quests';
import { EVENTS, pendingEvent } from './world/events';
import { D100, ZONES, drawOracle, eventScript, type OEv } from './world/oracle';
import { autoPicks } from './data/progression';
import { computeRuta, finalFlags, RUTA_LABEL } from './story/endings';
import { tick, count, guardAllies } from './world/followers';
import { DISTRICT_BY_ID } from './world/districts';
import type { Node } from './story/types';

class App {
  app = document.getElementById('app')!; camp: Campaign = newCampaign(); settings = { permadeath: false };
  top!: HTMLElement; rootEl!: HTMLElement; menuEl!: HTMLElement; storyEl!: HTMLElement; battleEl!: HTMLElement; hubEl!: HTMLElement;
  story!: StoryUI; hub!: HubUI; hudEl!: HTMLElement; running = false;

  constructor() {
    try { this.settings = { ...this.settings, ...JSON.parse(localStorage.getItem('zaryab.settings') || '{}') }; } catch { /* */ }
    this.hudEl = h('div', { class: 'meters' });
    this.top = h('div', { id: 'topbar' }, h('div', { class: 'brand' }, 'ZARYAB · Las Entrañas de Piedra Viva'), this.hudEl);
    this.menuEl = h('div', { class: 'screen', id: 'menu' }); this.storyEl = h('div', { class: 'screen hidden' }); this.battleEl = h('div', { class: 'screen hidden' }); this.hubEl = h('div', { class: 'screen hidden' });
    this.rootEl = h('div', { id: 'root' }, this.menuEl, this.storyEl, this.hubEl, this.battleEl);
    this.app.append(this.top, this.rootEl);
    this.story = new StoryUI(this.storyEl); this.hub = new HubUI(this.hubEl); this.hub.inv = new InvUI();
    this.story.battle = (enc, n, foes) => this.runBattle(enc, n, foes); this.story.hud = () => this.renderHud();
    this.hub.onChange = () => { this.renderHud(); saveGame(this.camp); }; this.hub.api = { advance: n => this.advance(n) };
    this.renderHud(); this.showMenu();
    const q = new URLSearchParams(location.search);
    if (q.get('battle')) this.devBattle(q.get('battle')!);
    (window as any).__app = this;
  }
  show(which: 'menu' | 'story' | 'hub' | 'battle') { this.menuEl.classList.toggle('hidden', which !== 'menu'); this.storyEl.classList.toggle('hidden', which !== 'story'); this.hubEl.classList.toggle('hidden', which !== 'hub'); this.battleEl.classList.toggle('hidden', which !== 'battle'); }
  renderHud() {
    const c = this.camp; this.hudEl.innerHTML = '';
    const m = (cls: string, label: string, v: number, max: number) => h('div', { class: `meter ${cls}` }, label, h('div', { class: 'bar' }, h('i', { style: { width: (v / max) * 100 + '%' } })), h('span', {}, `${v}/${max}`));
    this.hudEl.append(h('div', { class: 'meter' }, `Día ${c.day}`), m('corr', 'Corrupción', c.c, 10), m('dev', 'Devoción', c.d, 10), h('div', { class: 'meter pf' }, 'PF ', h('b', {}, String(c.pf))),
      h('button', { class: 'tb-btn', onClick: () => saveGame(this.camp) }, 'Guardar'), h('button', { class: 'tb-btn', onClick: () => { saveGame(this.camp); location.reload(); } }, 'Menú'));
  }
  showMenu() {
    this.show('menu'); const save = loadGame(); const m = this.menuEl; m.innerHTML = '';
    const roster = h('div', { class: 'roster' }, ...PARTY.map(p => h('div', { class: 'chip', title: p.blurb }, avatar(p.glyph, p.color, undefined, 28), h('span', {}, `${p.name} · ${p.klass}${p.sheet === 'estimada' ? ' ⚠' : ''}`))));
    const perm = h('input', { type: 'checkbox', id: 'perm' }) as HTMLInputElement; perm.checked = this.settings.permadeath;
    perm.addEventListener('change', () => { this.settings.permadeath = perm.checked; localStorage.setItem('zaryab.settings', JSON.stringify(this.settings)); });
    m.append(h('h1', {}, 'ZARYAB'), h('h2', {}, 'LAS ENTRAÑAS DE PIEDRA VIVA'), roster,
      h('button', { class: 'btn', onClick: () => { clearSave(); this.camp = newCampaign(); this.start(); } }, 'Nueva campaña'),
      h('button', { class: 'btn', disabled: !save, onClick: () => { this.camp = save!; this.start(); } }, save ? `Continuar (día ${save.day})` : 'Continuar'),
      h('label', { class: 'small', style: { display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' } }, perm, 'Muerte permanente (si no, el cristal de Zahir devuelve a los caídos a cambio de Corrupción y PF)'),
      h('div', { class: 'mnote' }, 'Combate de D&D 5.ª edición sobre cuadrícula isométrica. Fichas reales de Romain, Pact Risen, Rabb Locke y Joren Hell. ⚠ Zyr\'thar y Panchi usan estadísticas estimadas. Controles: clic para mover/atacar · M mover · A atacar · H habilidades · Espacio terminar turno · rueda zoom · botón derecho arrastrar.'));
  }

  // ───────── guiones ─────────
  scriptNodes(id: string): Node[] {
    if (CHAPTER_SCRIPTS[id]) return CHAPTER_SCRIPTS[id];
    if (id.startsWith('q:')) return QUEST_BY_ID[id.slice(2)].script;
    if (id.startsWith('ev:')) return EVENTS[id.slice(3)];
    if (id.startsWith('oracle:')) { const n = +id.slice(7); const e = [...D100, ...Object.values(ZONES).flat()].find(x => x.n === n)!; return eventScript(this.camp, { ev: e, omen: 'Nada ocurrirá hoy.', zone: '' }); }
    return [];
  }
  async runScript(id: string, from = 0, nodes?: Node[]) {
    const list = nodes ?? this.scriptNodes(id); this.show('story'); if (!this.storyEl.querySelector('.bg')) { this.story.camp = this.camp; this.story.mount(); }
    this.story.camp = this.camp; this.camp.run = { script: id, idx: from }; this.story.onTop = i => { this.camp.run = { script: id, idx: from + i }; saveGame(this.camp); };
    await this.story.play(list.slice(from), true);
    this.camp.run = null; if (id === 'cap1') applyEffect(this.camp, { flags: ['cap1_done'] }); saveGame(this.camp);
  }
  advance(days: number) {
    const c = this.camp;
    for (let i = 0; i < days; i++) {
      c.day++; c.alertTick++;
      if (c.alertTick >= 3) { c.alertTick = 0; c.alert = Math.min(10, c.alert + 1); for (const l of tick(c)) c.journal.push(`Día ${c.day}: ${l}`); }
      if (built(c, 'torre') && c.day % 7 === 0) c.alert = Math.max(0, c.alert - 1);
    }
    this.renderHud();
  }
  async start() {
    this.renderHud(); this.story.camp = this.camp; this.story.mount(); this.show('story');
    if (this.camp.run) await this.runScript(this.camp.run.script, this.camp.run.idx);
    await this.hubLoop();
  }
  async hubLoop() {
    if (!has(this.camp, 'cap0_done') && !has(this.camp, 'cap1_done')) await this.runScript('cap0');
    if (!has(this.camp, 'cap1_done')) await this.runScript('cap1');
    if (!has(this.camp, 'cap2_done')) await this.runScript('cap2');
    for (;;) {
      const due = this.camp.ecos.findIndex(x => x.due <= this.camp.day);
      if (due >= 0) { const [eco] = this.camp.ecos.splice(due, 1); this.camp.journal.push(`Día ${this.camp.day}: una decisión del pasado vuelve a llamar a la puerta.`); await this.runScript('ev:' + eco.id); this.renderHud(); saveGame(this.camp); continue; }
      const ev = pendingEvent(this.camp);
      if (ev) { applyEffect(this.camp, { flags: [`ev_${ev}_done`] }); if (ev === 'zahir_llama') this.camp.lastMainDay = this.camp.day; await this.runScript('ev:' + ev); this.renderHud(); continue; }
      if ((window as any).__autolevel) { const c = this.camp; for (let n = pendingLevel(c); n; n = pendingLevel(c)) { for (const pc of c.party.filter(p => !c.dead.includes(p))) (c.picks[pc] ??= []).push(...autoPicks(pc, n, c.d, c.c)); c.lvl = n; } }
      this.show('hub'); this.renderHud();
      const a = await this.hub.choose(this.camp);
      if (a.t === 'menu') { saveGame(this.camp); location.reload(); return; }
      if (a.t === 'rest') { this.advance(1); this.camp.journal.push(`Día ${this.camp.day}: descansáis en la biblioteca.`); saveGame(this.camp); continue; }
      if (a.t === 'quest') {
        const q = QUEST_BY_ID[a.id]; if (a.id === 'm_cap13') applyEffect(this.camp, { flags: finalFlags(this.camp) }); await this.runScript('q:' + a.id);
        if (a.id === 'm_cap8') { const r = computeRuta(this.camp); applyEffect(this.camp, { flags: ['ruta_' + r] }); this.camp.journal.push(`Día ${this.camp.day}: vuestra Ruta es el ${RUTA_LABEL[r]}.`); }
        this.camp.quests[q.id] = 'done'; this.camp.journal.push(`Día ${this.camp.day}: completáis «${q.title}».`);
        if (q.kind === 'main') this.camp.lastMainDay = this.camp.day;
        this.advance(q.days); let nx = q.next;
        while (nx) { const nq = QUEST_BY_ID[nx]; await this.runScript('q:' + nx); this.camp.quests[nx] = 'done'; this.camp.journal.push(`Día ${this.camp.day}: completáis «${nq.title}».`); this.camp.lastMainDay = this.camp.day; this.advance(nq.days); nx = nq.next; } if (q.alert) applyEffect(this.camp, { alert: q.alert }); this.renderHud(); saveGame(this.camp); continue;
      }
      if (a.t === 'peek') {
        const dr = drawOracle(this.camp, a.district); this.camp.rumors -= 2; this.camp.peek = { district: a.district, n: dr.ev.n }; this.camp.journal.push(`Día ${this.camp.day}: los espías avisan: «${dr.ev.title}» en ${DISTRICT_BY_ID[a.district].name}.`); saveGame(this.camp); continue;
      }
      if (a.t === 'oracle') {
        let dr = drawOracle(this.camp, a.district); const pk = this.camp.peek;
        if (pk && pk.district === a.district) { const found = [...D100, ...Object.values(ZONES).flat()].find(x => x.n === pk.n); if (found) dr = { ...dr, ev: found }; } this.camp.peek = null;
        const e: OEv = dr.ev; this.camp.oracleSeen.push(e.n);
        let nodes = eventScript(this.camp, dr);
        if (built(this.camp, 'pozo_vis') || count(this.camp, 'visionario') > 0) nodes = [{ t: 'bg', id: 'oraculo' }, { t: 'say', who: 'Oráculo de las Mil Lenguas', text: `${built(this.camp, 'pozo_vis') ? 'El Pozo de Visiones me obliga' : 'Farid sueña por mí'} a decir la verdad: ${e.title}.`, tone: 'por primera vez, no miente' }, ...nodes.slice(2)];
        await this.runScript('oracle:' + e.n, 0, nodes); void DISTRICT_BY_ID;
        if (!built(this.camp, 'alfombra')) this.advance(1); this.camp.journal.push(`Día ${this.camp.day}: el Oráculo anuncia «${e.title}».`); this.renderHud(); saveGame(this.camp);
      }
    }
  }

  // ───────── combate ─────────
  async runBattle(enc: string, foeCount?: number, foes?: any[]): Promise<boolean> {
    const e = ENCOUNTERS[enc]; const c = this.camp; const party = e.duel ? e.duel.party.filter(p => c.party.includes(p)) : c.party.filter(p => !c.dead.includes(p));
    let list = foes ?? e.foes; if (foeCount) list = list.slice(0, foeCount);
    const miracles = MIRACLES.filter(m => (m.need === 'd' ? c.d : c.c) >= m.min).map(m => m.id);
    const allies: string[] = []; if (has(c, 'golem_aliado') || has(c, 'golem_prestado')) allies.push('golem_arena');
    if (has(c, 'tigre_domado') && !e.duel) allies.push('tigre_companero');
    if (e.defense) { const g = guardAllies(c); for (let i = 0; i < g.n; i++) allies.push(i < g.brave ? 'adorador_valiente' : 'adorador'); }
    const b = buildBattle(enc, party, { foes: list, grants: c.grants, pf: c.pf, miracles, allies, equip: c.equip, inv: c.inv, level: c.lvl, prog: progMap(c, party) });
    this.show('battle'); const ui = new BattleUI(this.battleEl);
    const res = await ui.run(b, e.map, e.intro);
    const duel = !!e.duel; const won = res.result === 'victory' || duel;
    if (duel) { const pct = res.foeHpPct ?? 1; if (pct <= 0.55) applyEffect(c, { flags: ['torneo_digno'] }); }
    setMonsterXp(Object.fromEntries(Object.values(MONSTERS).map(m => [m.id, m.xp])));
    for (const [k, n] of Object.entries(res.used)) c.inv[k] = Math.max(0, (c.inv[k] ?? 0) - n);
    const loot = won && !duel ? lootFor(res.kills) : null; if (loot) { c.gold += loot.gold; c.mats += loot.mats; for (const [k, n] of Object.entries(loot.items)) c.inv[k] = (c.inv[k] ?? 0) + n; }
    const overlay = duel ? h('div', { class: 'overlay' }, h('div', { class: 'card' }, h('h2', {}, res.result === 'victory' ? 'Ganas el combate' : 'Panchi cae'), h('div', { class: 'res' }, h('div', {}, `Rondas: ${res.rounds}. Sifra ${Math.round((res.foeHpPct ?? 1) * 100)} % en pie.`)), h('button', { class: 'btn' }, 'Continuar'))) : this.resultOverlay(res, loot); this.battleEl.append(overlay);
    await new Promise<void>(r => overlay.querySelector('button')!.addEventListener('click', () => r()));
    ui.destroy(); overlay.remove(); this.battleEl.innerHTML = ''; this.show('story');
    c.pf = Math.max(0, c.pf - res.pfSpent);
    if (won && !duel) {
      c.battlesWon++; c.xp += res.xp; if (has(c, 'golem_prestado')) c.flags = c.flags.filter(f => f !== 'golem_prestado');
      for (const id of res.dead) { if (this.settings.permadeath) { if (!c.dead.includes(id)) c.dead.push(id); } else applyEffect(c, { c: 1, pf: count(c, 'curandero') ? -2 : -3 }); }
    }
    this.renderHud(); saveGame(c); return won;
  }
  resultOverlay(res: BattleResult, loot?: ReturnType<typeof lootFor> | null) {
    const won = res.result === 'victory'; const names = (ids: string[]) => ids.map(i => PARTY_BY_ID[i].name).join(', ');
    const lines: (string | HTMLElement)[] = [];
    if (won) {
      lines.push(h('div', {}, `Rondas: ${res.rounds} · Experiencia: `, h('b', {}, String(res.xp)), ' XP'));
      if (loot) lines.push(h('div', {}, '💰 Botín: ', h('b', {}, `${loot.gold} PO`), loot.mats ? ` · ${loot.mats} materiales` : '', ...Object.entries(loot.items).map(([k, n]) => ` · ${ITEM[k].icon} ${ITEM[k].name} ×${n}`)));
      if (pendingLevel(this.camp)) lines.push(h('div', { style: { color: '#e8c872' } }, '⬆ ¡Habéis ganado experiencia suficiente para subir de nivel! Hacedlo desde el mapa.'));
      if (res.pfSpent) lines.push(h('div', {}, `PF gastados en milagros: ${res.pfSpent}`));
      if (res.downed.length) lines.push(h('div', {}, `Caídos que se recuperan: ${names(res.downed.filter(d => !res.dead.includes(d)))}`));
      if (res.dead.length) lines.push(h('div', { style: { color: '#ff9c8f' } }, this.settings.permadeath ? `Han muerto para siempre: ${names(res.dead)}.` : `${names(res.dead)} murió… y el cristal de Zahir lo devuelve. +1 Corrupción, −3 PF.`));
      lines.push(h('div', { class: 'small' }, 'Tras el combate, un descanso corto restaura PG y recursos.'));
    } else lines.push(h('div', {}, 'La compañía ha caído. Zahir susurra: «Aún no.» Puedes reintentar el combate.'));
    return h('div', { class: 'overlay' }, h('div', { class: 'card' }, h('h2', {}, won ? 'Victoria' : 'Derrota'), h('div', { class: 'res' }, ...lines), h('button', { class: 'btn' }, won ? 'Continuar' : 'Reintentar')));
  }
  async devBattle(enc: string) {
    this.show('battle'); this.camp = newCampaign(); const e = ENCOUNTERS[enc]; const b = buildBattle(enc, this.camp.party, { pf: 30, miracles: MIRACLES.map(m => m.id), inv: this.camp.inv, equip: { romain: ['espada_1', 'cota_1'], rabb: ['gema_fuego', 'botas_viento'] } }); const ui = new BattleUI(this.battleEl); (window as any).__ui = ui; (window as any).__b = b;
    await ui.run(b, e.map, e.intro);
  }
}
(window as any).__quests = QUESTS;
new App();
