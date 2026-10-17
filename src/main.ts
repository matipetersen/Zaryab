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
import { VARIANTS, INCIDENTS, POI_BY_ID, ROAMER_ENC, PHASE, PHASE_ICON } from './world/pois';
import { computeEdge } from './world/edge';
import { DESIGN_LVL, NO_CAL, winChance } from './data/difficulty';
import { NOVEL } from './story/novel';
import { chemPoints } from './engine/synergy';
import { briefing } from './story/briefings';
import { MAPS } from './data/maps';
import { ARQ } from './story/arquetipos';
import { reactive } from './story/novelReact';
import { huntFoes, gusanoScript, interval, hunting, stage, STAGES } from './world/gusano';
import { worldDay, ensureFronts } from './world/world';
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
    const c = this.camp; this.hudEl.innerHTML = ''; const left = c.eclipseDay && !has(c, 'cap13_done') ? Math.max(0, c.eclipseDay - c.day) : -1;
    const m = (cls: string, label: string, v: number, max: number) => h('div', { class: `meter ${cls}` }, label, h('div', { class: 'bar' }, h('i', { style: { width: (v / max) * 100 + '%' } })), h('span', {}, `${v}/${max}`));
    this.hudEl.append(h('div', { class: 'meter' }, `Día ${c.day} · ${PHASE_ICON[c.phase]} ${PHASE[c.phase]}`), ...(hunting(c) ? [h('div', { class: 'meter', title: 'Potencia ' + c.gusano.power, style: { color: c.gusano.next - c.day <= 3 ? '#ff9c8f' : '' } }, `🪱 ${STAGES[stage(c)]}${c.gusano.next - c.day <= 3 ? ' · cerca' : ''}`)] : []), ...(left >= 0 ? [h('div', { class: 'meter', style: { color: left <= 10 ? '#ff9c8f' : left <= 30 ? '#e8c872' : '' } }, `🌑 Eclipse en ${left} d`)] : []), m('corr', 'Corrupción', c.c, 10), m('dev', 'Devoción', c.d, 10), h('div', { class: 'meter pf' }, 'PF ', h('b', {}, String(c.pf))),
      h('button', { class: 'tb-btn', onClick: () => saveGame(this.camp) }, 'Guardar'), h('button', { class: 'tb-btn', onClick: () => { saveGame(this.camp); location.reload(); } }, 'Menú'));
  }
  showMenu() {
    this.show('menu'); const save = loadGame(); const m = this.menuEl; m.innerHTML = '';
    const ROLE: Record<string, [string, string]> = {
      romain: ['Sostén', 'Cura, protege y juzga a los muertos'], pact: ['Frontline', 'Maniobras de combate y liderazgo'],
      rabb: ['Duelista', 'Daño brutal con un arma que lo usa a él'], joren: ['Francotirador', 'Flechas a distancia, ignora coberturas'],
      zyrthar: ['Asesino', 'Golpe furtivo y emboscadas'], panchi: ['Brawler', 'Monje veloz, golpes encadenados'] };
    const cards = h('div', { class: 'cards' }, ...PARTY.map(p => {
      const [role, line] = ROLE[p.id] ?? ['', p.blurb];
      const card = h('div', { class: 'pcard', title: p.blurb },
        avatar(p.glyph, p.color, p.portrait, 64), h('b', {}, p.name), h('i', {}, `${p.race} · ${p.klass.split(' (')[0]}`), h('span', { class: 'role' }, role), h('small', {}, line)); card.style.setProperty('--c', p.color); return card;
    }));
    const rules = h('div', { class: 'rules' }, ...[['🎲', 'D&D 5.ª edición', 'Tiradas, CA, salvaciones'], ['🗺️', 'Táctica isométrica', 'Flanqueo, altura, terreno'], ['🤝', 'Sinergias', 'Pelear en formación rinde'], ['⚖️', 'Decisiones', 'Tus elecciones cambian el final']]
      .map(([i, t, d]) => h('div', { class: 'rule' }, h('span', {}, i), h('b', {}, t), h('small', {}, d))));
    const perm = h('input', { type: 'checkbox', id: 'perm' }) as HTMLInputElement; perm.checked = this.settings.permadeath;
    perm.addEventListener('change', () => { this.settings.permadeath = perm.checked; localStorage.setItem('zaryab.settings', JSON.stringify(this.settings)); });
    m.append(h('div', { class: 'hero' }, h('h1', {}, 'ZARYAB'), h('h2', {}, 'LAS ENTRAÑAS DE PIEDRA VIVA'), h('p', { class: 'tag' }, 'Seis almas rotas. Una ciudad que respira. Un eclipse que no espera.')),
      cards, rules,
      h('div', { class: 'cta' },
        h('button', { class: 'btn', onClick: () => { clearSave(); this.camp = newCampaign(); this.start(); } }, 'Nueva campaña'),
        h('button', { class: 'btn', disabled: !save, onClick: () => { this.camp = save!; this.start(); } }, save ? `Continuar · día ${save.day}` : 'Continuar')),
      h('label', { class: 'perm' }, perm, h('span', {}, 'Muerte permanente'), h('small', {}, ' — si no, Zahir devuelve a los caídos a cambio de Corrupción')),
      h('div', { class: 'mnote' }, 'Tocá una casilla para previsualizar y de nuevo para confirmar · Guía rápida con el botón ?'));
  }

  // ───────── guiones ─────────
  scriptNodes(id: string): Node[] {
    if (CHAPTER_SCRIPTS[id]) return CHAPTER_SCRIPTS[id];
    if (id.startsWith('q:')) return QUEST_BY_ID[id.slice(2)].script;
    if (id === 'ev:gusano_caza') return gusanoScript(this.camp);
    if (id.startsWith('ev:')) return EVENTS[id.slice(3)];
    if (id.startsWith('cut:')) return NOVEL[id.slice(4)] ?? [];
    if (id.startsWith('arq:')) return ARQ[id.slice(4)] ?? [];
    if (id.startsWith('poi:')) { const p = POI_BY_ID[id.slice(4)]; return VARIANTS[p.id]?.[this.camp.phase] ?? p.script; }
    if (id.startsWith('inc:')) { const [ph, i] = id.slice(4).split('_').map(Number); return INCIDENTS[ph].scenes[i]; }
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
    c.phase = 0;
    for (let i = 0; i < days; i++) {
      c.day++; c.alertTick++; for (const l of worldDay(c)) c.journal.push(`Día ${c.day}: ${l}`);
      if (c.alertTick >= 3) { c.alertTick = 0; c.alert = Math.min(10, c.alert + 1); for (const l of tick(c)) c.journal.push(`Día ${c.day}: ${l}`); }
      if (built(c, 'torre') && c.day % 7 === 0) c.alert = Math.max(0, c.alert - 1);
    }
    this.renderHud();
  }
  /** Una visita consume una fase del día (amanecer → día → noche); la tercera pasa el día. */
  passPhase() { const c = this.camp; c.phase++; if (c.phase >= 3) this.advance(1); else this.renderHud(); }
  /** El Eclipse llegó sin que lo detuvieran: los capítulos que faltan quedan sin resolver y empieza el ritual. */
  async forceEclipse() {
    const c = this.camp; const skipped: number[] = [];
    for (let i = 6; i <= 12; i++) if (!has(c, `cap${i}_done`)) { skipped.push(i); applyEffect(c, { flags: [`cap${i}_done`, `skipped_cap${i}`] }); }
    if (skipped.length) c.journal.push(`Día ${c.day}: el Eclipse los alcanzó antes de los capítulos ${skipped.join(', ')}.`);
    if (!c.flags.some(f => f.startsWith('ruta_'))) applyEffect(c, { flags: ['ruta_' + computeRuta(c)] });
    applyEffect(c, { flags: finalFlags(c) }); c.squad = []; await this.runScript('q:m_cap13'); c.quests['m_cap13'] = 'done'; saveGame(c); this.renderHud();
  }
  async start() {
    this.renderHud(); this.story.camp = this.camp; this.story.mount(); this.show('story');
    if (this.camp.run) await this.runScript(this.camp.run.script, this.camp.run.idx);
    await this.hubLoop();
  }
  /** En el prólogo (aún sin mapa) los niveles 2 y 3 se ganan solos: no hay elecciones que tomar. */
  async prologueLevels() {
    const c = this.camp; this.graceRevive(); let n = pendingLevel(c), last = 0;
    for (; n && n <= 3; n = pendingLevel(c)) { c.lvl = n; last = n; }
    if (last) { c.journal.push(`Día ${c.day}: la compañía alcanza el nivel ${last}.`); saveGame(c); await this.runScript('lvl', 0, [{ t: 'fx', e: {}, note: `¡Suben al nivel ${last}! ${last === 2 ? 'Ganan Canalizar Divinidad, Oleada de Acción, Ki y Acción Astuta.' : 'Cada personaje recibe su arquetipo.'}` }]); }
  }
  /** Escena de novela entre capítulos o actos: se reproduce una sola vez. */
  async cutscene(key: string) {
    const c = this.camp; if (!NOVEL[key] || has(c, `nov_${key}`)) return;
    const r = reactive(c, key); applyEffect(c, { flags: [`nov_${key}`, ...r.used.map(u => `nov_f_${u}`)] });
    await this.runScript('cut:' + key, 0, [...NOVEL[key], ...r.nodes]); saveGame(c);
  }
  /** Tras un capítulo principal: entreacto propio y, si cierra un acto, la portada del siguiente. */
  async arq(key: string) {
    const c = this.camp; if (!ARQ[key] || has(c, `arq_${key}_done`)) return;
    applyEffect(c, { flags: [`arq_${key}_done`] }); await this.runScript('arq:' + key); saveGame(c);
  }
  async novel(qid: string) {
    await this.cutscene(qid); await this.arq(qid);
    if (qid === 'm_cap5') await this.cutscene('acto2');
    if (qid === 'm_cap10') await this.cutscene('acto3');
  }
  /** Antes del Cap. III la muerte no es definitiva: el cristal de Zahir devuelve a los caídos (también en partidas guardadas viejas). */
  graceRevive() {
    const c = this.camp; if (has(c, 'cap3_done') || !c.dead.length) return;
    c.journal.push(`Día ${c.day}: el cristal de Zahir devuelve a ${c.dead.length === 1 ? 'un caído' : `${c.dead.length} caídos`}. «Aún no.»`); c.dead = []; saveGame(c);
  }
  async hubLoop() {
    this.graceRevive();
    if (!has(this.camp, 'cap0_done') && !has(this.camp, 'cap1_done')) { await this.cutscene('acto1'); await this.runScript('cap0'); await this.prologueLevels(); await this.cutscene('cap0'); }
    if (!has(this.camp, 'cap1_done')) { await this.runScript('cap1'); await this.prologueLevels(); await this.cutscene('cap1'); }
    if (!has(this.camp, 'cap2_done')) { await this.runScript('cap2'); await this.cutscene('cap2'); await this.arq('cap2'); }
    for (;;) {
      const due = this.camp.ecos.findIndex(x => x.due <= this.camp.day);
      if (due >= 0) { const [eco] = this.camp.ecos.splice(due, 1); this.camp.journal.push(`Día ${this.camp.day}: una decisión del pasado vuelve a llamar a la puerta.`); await this.runScript('ev:' + eco.id); this.renderHud(); saveGame(this.camp); continue; }
      if (has(this.camp, 'eclipse_forzado') && !has(this.camp, 'cap13_done')) { await this.forceEclipse(); continue; }
      const ev = pendingEvent(this.camp);
      if (ev) { applyEffect(this.camp, { flags: [`ev_${ev}_done`] }); if (ev === 'zahir_llama') this.camp.lastMainDay = this.camp.day; await this.runScript('ev:' + ev);
        if (ev === 'gusano_caza') { const g = this.camp.gusano; g.seen++; this.camp.journal.push(`Día ${this.camp.day}: el Gusano los alcanza (${STAGES[stage(this.camp)]}).`); if (g.next <= this.camp.day) g.next = this.camp.day + interval(this.camp); }
        this.renderHud(); saveGame(this.camp); continue; }
      if ((window as any).__autolevel) { const c = this.camp; for (let n = pendingLevel(c); n; n = pendingLevel(c)) { for (const pc of c.party.filter(p => !c.dead.includes(p))) (c.picks[pc] ??= []).push(...autoPicks(pc, n, c.d, c.c)); c.lvl = n; } }
      ensureFronts(this.camp); this.show('hub'); this.renderHud();
      const a = await this.hub.choose(this.camp);
      if (a.t === 'menu') { saveGame(this.camp); location.reload(); return; }
      if (a.t === 'poi') {
        const p = POI_BY_ID[a.id]; this.camp.poiCd[p.id] = this.camp.day + p.cd; this.camp.journal.push(`Día ${this.camp.day}: visitan ${p.name}.`);
        await this.runScript('poi:' + p.id);
        const inc = INCIDENTS[this.camp.phase]; if (p.district !== 'santuario' && Math.random() < inc.chance) { const i = Math.floor(Math.random() * inc.scenes.length); await this.runScript('inc:' + this.camp.phase + '_' + i); }
        this.passPhase(); this.renderHud(); saveGame(this.camp); continue;
      }
      if (a.t === 'roamer') {
        const r = this.camp.roamers.find(x => x.id === a.id); if (!r) continue; const won = await this.runBattle(ROAMER_ENC[r.kind]);
        if (won) { this.camp.roamers = this.camp.roamers.filter(x => x.id !== r.id); const g = 25 + Math.floor(Math.random() * 30); applyEffect(this.camp, { gold: g, alert: -1, rep: r.kind === 'conclave' ? { conclave: -1 } : {} }); this.camp.journal.push(`Día ${this.camp.day}: abaten a un errante (${r.kind}) en ${DISTRICT_BY_ID[r.district].name}. +${g} PO.`); this.passPhase(); }
        saveGame(this.camp); continue;
      }
      if (a.t === 'reinforce') {
        const c = this.camp; if (c.pf < 3 || !c.front[a.district]) continue; c.pf -= 3; c.front[a.district] = 'libre'; c.journal.push(`Día ${c.day}: refuerzan ${DISTRICT_BY_ID[a.district].name}; vuelve a ser libre.`); this.passPhase(); saveGame(c); continue;
      }
      if (a.t === 'leave') {
        applyEffect(this.camp, { flags: ['final_desierto'] });
        await this.runScript('ev:desierto'); clearSave(); location.reload(); return;
      }
      if (a.t === 'rest') { this.camp.phase = 0; this.advance(1); this.camp.journal.push(`Día ${this.camp.day}: descansan en la biblioteca.`); saveGame(this.camp); continue; }
      if (a.t === 'quest') {
        const q = QUEST_BY_ID[a.id]; if (a.id === 'm_cap13') applyEffect(this.camp, { flags: finalFlags(this.camp) }); await this.runScript('q:' + a.id);
        if (a.id === 'm_cap8') { const r = computeRuta(this.camp); applyEffect(this.camp, { flags: ['ruta_' + r] }); this.camp.journal.push(`Día ${this.camp.day}: su Ruta es el ${RUTA_LABEL[r]}.`); }
        this.camp.quests[q.id] = 'done'; this.camp.squad = []; this.camp.journal.push(`Día ${this.camp.day}: completan «${q.title}».`);
        if (q.kind === 'main') this.camp.lastMainDay = this.camp.day;
        this.advance(q.days); await this.novel(q.id); let nx = q.next;
        while (nx) { const nq = QUEST_BY_ID[nx]; await this.runScript('q:' + nx); this.camp.quests[nx] = 'done'; this.camp.journal.push(`Día ${this.camp.day}: completan «${nq.title}».`); this.camp.lastMainDay = this.camp.day; this.advance(nq.days); await this.novel(nx); nx = nq.next; } if (q.alert) applyEffect(this.camp, { alert: q.alert }); this.renderHud(); saveGame(this.camp); continue;
      }
      if (a.t === 'peek') {
        const dr = drawOracle(this.camp, a.district); this.camp.rumors -= 2; this.camp.peek = { district: a.district, n: dr.ev.n }; this.camp.journal.push(`Día ${this.camp.day}: los espías avisan: «${dr.ev.title}» en ${DISTRICT_BY_ID[a.district].name}.`); saveGame(this.camp); continue;
      }
      if (a.t === 'oracle') {
        let dr = drawOracle(this.camp, a.district); const pk = this.camp.peek;
        if (pk && pk.district === a.district) { const found = [...D100, ...Object.values(ZONES).flat()].find(x => x.n === pk.n); if (found) dr = { ...dr, ev: found }; } this.camp.peek = null;
        const e: OEv = dr.ev; this.camp.oracleSeen.push(e.n);
        let nodes = eventScript(this.camp, dr);
        if (built(this.camp, 'pozo_vis') || count(this.camp, 'visionario') > 0 || has(this.camp, 'oraculo_verdadero')) nodes = [{ t: 'bg', id: 'oraculo' }, { t: 'say', who: 'Oráculo de las Mil Lenguas', text: `${built(this.camp, 'pozo_vis') ? 'El Pozo de Visiones me obliga' : has(this.camp, 'oraculo_verdadero') ? 'Cyric calla, por fin, y yo me atrevo' : 'Farid sueña por mí'} a decir la verdad: ${e.title}.`, tone: 'por primera vez, no miente' }, ...nodes.slice(2)];
        await this.runScript('oracle:' + e.n, 0, nodes); void DISTRICT_BY_ID;
        if (!built(this.camp, 'alfombra')) this.advance(1); this.camp.journal.push(`Día ${this.camp.day}: el Oráculo anuncia «${e.title}».`); this.renderHud(); saveGame(this.camp);
      }
    }
  }

  // ───────── combate ─────────
  /** Escena previa al combate: qué está pasando, quiénes son, cómo lo ven los personajes y por dónde empezar. */
  async briefBattle(enc: string, party: string[], list: { id: string }[]) {
    const e = ENCOUNTERS[enc], map = MAPS[e.map]; if (!map) return;
    const BG: Record<string, string> = { dunas: 'dunas', callejon: 'bajo', acueducto: 'acueducto', cubo: 'espejos', plaza: 'plaza', pozo: 'hammam', medinat: 'medinat', arena: 'coliseo', iglesia: 'limbo', cripta: 'limbo', mina: 'prison', ciudadela: 'coliseo', eclipse: 'limbo', nido: 'dunas', cementerio: 'limbo', jardin: 'espejos', zoco: 'zoco', templo: 'prison', santuario: 'choza' };
    this.show('story'); if (!this.storyEl.querySelector('.bg')) { this.story.camp = this.camp; this.story.mount(); }
    await this.story.play(briefing(enc, e, map, party, list.map(f => f.id), BG[e.map] ?? 'prison'));
  }
  async runBattle(enc: string, foeCount?: number, foes?: any[]): Promise<boolean> {
    const e = ENCOUNTERS[enc]; const c = this.camp; const alive = c.party.filter(p => !c.dead.includes(p)); const party = e.duel ? e.duel.party.filter(p => c.party.includes(p)) : (c.squad?.length ? c.squad.filter(p => alive.includes(p)) : alive);
    let list = foes ?? (enc === 'gusano_caza' ? huntFoes(c.gusano.power) : e.foes); if (foeCount) list = list.slice(0, foeCount);
    if (!e.soft || e.survive) await this.briefBattle(enc, party, list);
    const miracles = has(c, 'razul_pacto') ? [] : MIRACLES.filter(m => (m.need === 'd' ? c.d : c.c) >= m.min).map(m => m.id);
    const allies: string[] = []; if (has(c, 'golem_aliado') || has(c, 'golem_prestado')) allies.push('golem_arena');
    if (has(c, 'tigre_domado') && !e.duel) allies.push('tigre_companero');
    if (enc === 'd4_defensa') { if (has(c, 'mz_seraphel_libre')) allies.push('seraphel_aliada'); if (has(c, 'mz_grethak_aliado')) allies.push('grethak_aliado'); if (has(c, 'mz_esclavos_libres')) allies.push('esclavo', 'esclavo'); }
    if (enc === 'eclipse') { if (has(c, 'mz_seraphel_libre')) allies.push('seraphel_aliada'); if (has(c, 'mz_grethak_aliado')) allies.push('grethak_aliado'); if (has(c, 'marid_libre')) allies.push('djinn_menor'); if (has(c, 'razul_aliado')) allies.push('razul_aliado'); if (has(c, 'samira_confia')) allies.push('guardia_arena'); }
    if (e.defense) { const g = guardAllies(c); for (let i = 0; i < g.n; i++) allies.push(i < g.brave ? 'adorador_valiente' : 'adorador'); }
    const rated = DESIGN_LVL[enc] != null && !NO_CAL.has(enc) && !e.duel && !e.soft;
    const edge = rated ? computeEdge(c, party, allies.length) : { points: 0, lines: [] as string[] };
    const intro = rated ? `${e.intro}\n\n⚖ Probabilidad estimada de victoria: ${winChance(edge.points, c.lvl - DESIGN_LVL[enc])} %${edge.lines.length ? ' (' + edge.lines.join(' · ') + ')' : ' (sin ventajas de campaña)'}` : e.intro;
    const b = buildBattle(enc, party, { foes: list, grants: c.grants, pf: c.pf, miracles, allies, equip: c.equip, inv: c.inv, level: c.lvl, prog: progMap(c, party), flags: c.flags.filter(f => f.startsWith('mz_')), edge: edge.points, chem: c.chem, powerup: enc === 'gusano_caza' ? c.gusano.power : 0 });
    if (enc === 'eclipse' && has(c, 'pacto_roto')) for (const u of b.units) if (u.side === 'foe' && u.traits.includes('boss')) { u.maxHp = Math.round(u.maxHp * 0.65); u.hp = u.maxHp; }
    this.show('battle'); const ui = new BattleUI(this.battleEl);
    const res = await ui.run(b, e.map, intro);
    const duel = !!e.duel; const soft = !!e.soft; const victory = res.result === 'victory'; const won = victory || duel || soft;
    if (e.soft || e.script) { const fl = [...(res.flagsOut ?? []).map(f => 'mz_' + f), ...(res.carry ?? []).map(f => 'mz_carry_' + f)]; if (res.cubeAlert) fl.push('mz_alerta_' + res.cubeAlert); if (!victory && !duel) fl.push('mz_capturados'); applyEffect(c, { flags: fl }); }
    if (duel) { const pct = res.foeHpPct ?? 1; if (pct <= 0.55) applyEffect(c, { flags: ['torneo_digno'] }); }
    setMonsterXp(Object.fromEntries(Object.values(MONSTERS).map(m => [m.id, m.xp])));
    for (const [k, n] of Object.entries(res.used)) c.inv[k] = Math.max(0, (c.inv[k] ?? 0) - n);
    const loot = victory && !duel ? lootFor(res.kills) : null; if (loot) { c.gold += loot.gold; c.mats += loot.mats; for (const [k, n] of Object.entries(loot.items)) c.inv[k] = (c.inv[k] ?? 0) + n; }
    const overlay = (soft && !victory && !duel) ? h('div', { class: 'overlay' }, h('div', { class: 'card' }, h('h2', {}, 'Capturados'), h('div', { class: 'res' }, h('div', {}, 'El Cubo —o Kethras— los ha cercado. Nadie ha muerto todavía.')), h('button', { class: 'btn' }, 'Continuar'))) : duel ? h('div', { class: 'overlay' }, h('div', { class: 'card' }, h('h2', {}, res.result === 'victory' ? 'Ganás el combate' : 'Panchi cae'), h('div', { class: 'res' }, h('div', {}, `Rondas: ${res.rounds}. Sifra ${Math.round((res.foeHpPct ?? 1) * 100)} % en pie.`)), h('button', { class: 'btn' }, 'Continuar'))) : this.resultOverlay(res, loot); this.battleEl.append(overlay);
    await new Promise<void>(r => overlay.querySelector('button')!.addEventListener('click', () => r()));
    ui.destroy(); overlay.remove(); this.battleEl.innerHTML = ''; this.show('story');
    c.pf = Math.max(0, c.pf - res.pfSpent);
    if (victory && !duel) {
      c.battlesWon++; c.xp += res.xp; if (has(c, 'golem_prestado')) c.flags = c.flags.filter(f => f !== 'golem_prestado');
      for (const id of res.dead) { if (this.settings.permadeath && has(c, 'cap3_done')) { if (!c.dead.includes(id)) c.dead.push(id); } else applyEffect(c, { c: 1, pf: count(c, 'curandero') ? -2 : -3 }); }
    }
    if (victory && !duel) for (const [k, n] of Object.entries(res.chem ?? {})) c.chem[k] = chemPoints(c.chem, k) + n; // pelear en formación fortalece la relación
    this.renderHud(); saveGame(c); return won;
  }
  resultOverlay(res: BattleResult, loot?: ReturnType<typeof lootFor> | null) {
    const won = res.result === 'victory'; const names = (ids: string[]) => ids.map(i => PARTY_BY_ID[i].name).join(', ');
    const lines: (string | HTMLElement)[] = [];
    if (won) {
      lines.push(h('div', {}, `Rondas: ${res.rounds} · Experiencia: `, h('b', {}, String(res.xp)), ' XP'));
      if (loot) lines.push(h('div', {}, '💰 Botín: ', h('b', {}, `${loot.gold} PO`), loot.mats ? ` · ${loot.mats} materiales` : '', ...Object.entries(loot.items).map(([k, n]) => ` · ${ITEM[k].icon} ${ITEM[k].name} ×${n}`)));
      if (pendingLevel(this.camp)) lines.push(h('div', { style: { color: '#e8c872' } }, '⬆ ¡Han ganado experiencia suficiente para subir de nivel! Háganlo desde el mapa.'));
      if (res.pfSpent) lines.push(h('div', {}, `PF gastados en milagros: ${res.pfSpent}`));
      if (res.downed.length) lines.push(h('div', {}, `Caídos que se recuperan: ${names(res.downed.filter(d => !res.dead.includes(d)))}`));
      if (res.dead.length) lines.push(h('div', { style: { color: '#ff9c8f' } }, this.settings.permadeath ? `Han muerto para siempre: ${names(res.dead)}.` : `${names(res.dead)} murió… y el cristal de Zahir lo devuelve. +1 Corrupción, −3 PF.`));
      lines.push(h('div', { class: 'small' }, 'Tras el combate, un descanso corto restaura PG y recursos.'));
    } else lines.push(h('div', {}, 'La compañía ha caído. Zahir susurra: «Aún no.» Pueden reintentar el combate.'));
    return h('div', { class: 'overlay' }, h('div', { class: 'card' }, h('h2', {}, won ? 'Victoria' : 'Derrota'), h('div', { class: 'res' }, ...lines), h('button', { class: 'btn' }, won ? 'Continuar' : 'Reintentar')));
  }
  async devBattle(enc: string) {
    this.show('battle'); this.camp = newCampaign(); const e = ENCOUNTERS[enc]; const b = buildBattle(enc, this.camp.party, { pf: 30, miracles: MIRACLES.map(m => m.id), inv: this.camp.inv, equip: { romain: ['espada_1', 'cota_1'], rabb: ['gema_fuego', 'botas_viento'] } }); const ui = new BattleUI(this.battleEl); (window as any).__ui = ui; (window as any).__b = b;
    await ui.run(b, e.map, e.intro);
  }
}
(window as any).__quests = QUESTS;
new App();
