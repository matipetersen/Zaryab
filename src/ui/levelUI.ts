import { h } from './dom';
import { PARTY_BY_ID } from '../data/party';
import { TRACKS, FEATS, ASI_ABS, ASI_DEFAULT, XP_TABLE, pendingChoices, optionAvailable, autoPicks, featuresUpTo, type Option } from '../data/progression';
import { pendingLevel, type Campaign } from '../state';

const AB_LABEL: Record<string, string> = { str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
const PATH_COLOR: Record<string, string> = { luz: '#e8e0b0', sombra: '#c9a6ff', neutro: '#9aa3b5' };

/** Pantalla de subida de nivel: rasgos nuevos, mejora de característica o dote, y evolución de arquetipo. */
export class LevelUI {
  sel: Record<string, { asi?: string; tier?: string }> = {};
  render(c: Campaign, done: () => void): HTMLElement {
    const next = pendingLevel(c); const root = h('div', { class: 'res' });
    if (!next) { root.append(h('div', { class: 'small' }, `Nivel ${c.lvl}. Siguiente nivel con ${XP_TABLE[c.lvl + 1] ?? '—'} XP (tienen ${c.xp}).`)); return root; }
    const party = c.party.filter(p => !c.dead.includes(p));
    root.append(h('div', { class: 'msg' }, `¡Subida de nivel! ${c.lvl} → ${next}`), h('div', { class: 'small' }, 'Cada personaje recibe sus rasgos de clase automáticamente. Donde hay una decisión, elijan: el arquetipo evoluciona con su Corrupción y Devoción.'));
    for (const pc of party) {
      const def = PARTY_BY_ID[pc]; const t = TRACKS[pc]; const choice = pendingChoices(pc, next); const st = (this.sel[pc] ??= {});
      const card = h('div', { class: 'jq' }, h('b', {}, `${def.name} · ${t.klass} ${next}`));
      const gained = featuresUpTo(pc, { level: next, picks: [] }).filter(f => f.level === next && f.kind === 'auto');
      for (const f of gained) card.append(h('div', { class: 'small' }, h('span', { class: 'tag good' }, 'Rasgo'), ` ${f.name} — ${f.desc}`));
      if (!gained.length && !choice.asi && !choice.tier) card.append(h('div', { class: 'small' }, 'PG, bono de competencia y espacios de conjuro mejoran con el nivel.'));
      if (choice.asi) {
        st.asi ??= `${ASI_DEFAULT[pc]}+2`;
        const row = h('div', { class: 'frow', style: { flexWrap: 'wrap' } }, h('span', { class: 'small' }, 'Mejora de característica: '));
        for (const ab of ASI_ABS) row.append(h('button', { class: `tabbtn ${st.asi === ab + '+2' ? 'on' : ''}`, onClick: () => { st.asi = ab + '+2'; this.redraw(c, done); } }, `${AB_LABEL[ab]} +2`));
        const row2 = h('div', { class: 'frow', style: { flexWrap: 'wrap' } }, h('span', { class: 'small' }, 'o una dote: '));
        for (const f of FEATS) row2.append(h('button', { class: `tabbtn ${st.asi === 'feat:' + f.id ? 'on' : ''}`, title: f.desc, onClick: () => { st.asi = 'feat:' + f.id; this.redraw(c, done); } }, f.name));
        card.append(row, row2);
      }
      if (choice.tier) {
        const d = c.d, co = c.c; if (!st.tier) st.tier = autoPicks(pc, next, d, co).find(x => x.startsWith('tier:'))?.split(':')[2];
        card.append(h('div', { class: 'sec' }, `Evolución de arquetipo: ${choice.tier.title}`));
        for (const o of choice.tier.options) {
          const ok = optionAvailable(o, d, co);
          card.append(h('button', { class: `choice ${st.tier === o.id ? 'on' : ''}`, disabled: !ok, style: { borderColor: st.tier === o.id ? PATH_COLOR[o.path] : undefined, opacity: ok ? 1 : 0.5 }, onClick: () => { st.tier = o.id; this.redraw(c, done); } },
            h('b', { style: { color: PATH_COLOR[o.path] } }, `${o.name} `), h('small', {}, `(${t.paths[o.path]})`), h('small', {}, o.desc + reason(o))));
        }
      }
      root.append(card);
    }
    const go = h('button', { class: 'btn', onClick: () => { this.apply(c, next, party); this.sel = {}; done(); } }, `Subir al nivel ${next}`);
    const auto = h('button', { class: 'btn ghost', onClick: () => { this.sel = {}; this.apply(c, next, party, true); done(); } }, 'Automático');
    root.append(go, ' ', auto);
    return root;
  }
  redraw!: (c: Campaign, done: () => void) => void;
  apply(c: Campaign, level: number, party: string[], auto = false) {
    for (const pc of party) {
      const picks = (c.picks[pc] ??= []); const st = this.sel[pc] ?? {}; const ch = pendingChoices(pc, level);
      if (auto) { picks.push(...autoPicks(pc, level, c.d, c.c)); continue; }
      if (ch.asi) picks.push(`asi:${level}:${st.asi ?? ASI_DEFAULT[pc] + '+2'}`);
      if (ch.tier) { const o = st.tier ?? autoPicks(pc, level, c.d, c.c).find(x => x.startsWith('tier:'))!.split(':')[2]; picks.push(`tier:${level}:${o}`); }
    }
    c.lvl = level;
  }
}
const reason = (o: Option) => o.need ? `  ·  requiere ${[o.need.d ? `Devoción ≥ ${o.need.d}` : '', o.need.c ? `Corrupción ≥ ${o.need.c}` : ''].filter(Boolean).join(' y ')}` : '';
