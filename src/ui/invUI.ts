import { h } from './dom';
import { ITEM, ITEMS, RECIPES, SHOP_STOCK, type Slot } from '../data/items';
import { PARTY_BY_ID } from '../data/party';
import { has, progOf, type Campaign } from '../state';
import { TRACKS, featuresUpTo, optionById, getPick } from '../data/progression';

const SLOTS: [Slot, string][] = [['arma', '⚔ Arma'], ['armadura', '🛡 Armadura'], ['talisman', '✦ Talismán']];
const RAR: Record<string, string> = { comun: '', poco: 'good', raro: 'mag', unico: 'bad' };

/** Inventario: equipo por personaje, mochila, tienda de EaNassr y taller. */
export class InvUI {
  tab = 'equipo'; msg = ''; who = '';
  equipped(c: Campaign, id: string) { return Object.values(c.equip).flat().filter(x => x === id).length; }
  free(c: Campaign, id: string) { return (c.inv[id] ?? 0) - this.equipped(c, id); }
  slotOf(c: Campaign, pc: string, s: Slot) { return (c.equip[pc] ?? []).find(i => ITEM[i]?.slot === s); }
  equip(c: Campaign, pc: string, id: string) {
    const it = ITEM[id]; const cur = (c.equip[pc] ??= []).filter(i => ITEM[i]?.slot !== it.slot); cur.push(id); c.equip[pc] = cur;
  }
  render(c: Campaign, tab: string, refresh: () => void): HTMLElement {
    this.tab = tab; const party = c.party.filter(p => !c.dead.includes(p)); if (!this.who || !party.includes(this.who)) this.who = party[0];
    const go = (t: string) => () => { this.msg = ''; this.tab = t; refresh(); };
    const b = h('div', { class: 'res' });
    b.append(h('div', { class: 'tabs' }, ...[['personajes', '📖 Personajes'], ['equipo', '🧍 Equipo'], ['mochila', '🎒 Mochila'], ['tienda', '🏺 Tienda de EaNassr'], ['taller', '🔨 Taller']].map(([id, lb]) => h('button', { class: `tabbtn ${tab === id ? 'on' : ''}`, onClick: go(id) }, lb))),
      h('div', {}, h('span', { class: 'tag' }, `💰 ${c.gold} PO`), h('span', { class: 'tag' }, `🧱 Materiales ${c.mats}`)));
    if (this.msg) b.append(h('div', { class: 'msg' }, this.msg));
    const say = (m: string) => { this.msg = m; refresh(); };
    const card = (id: string, extra: (HTMLElement | null)[] = []) => { const it = ITEM[id]; return h('div', { class: 'jq' }, h('span', {}, it.icon + ' '), h('b', {}, it.name), ' ', h('span', { class: `tag ${RAR[it.rarity]}` }, it.rarity), h('div', { class: 'small' }, it.desc), it.lore ? h('div', { class: 'small lore' }, it.lore) : null, ...extra); };
    if (tab === 'personajes') {
      b.append(h('div', { class: 'tabs' }, ...party.map(p => h('button', { class: `tabbtn ${this.who === p ? 'on' : ''}`, onClick: () => { this.who = p; refresh(); } }, PARTY_BY_ID[p].name))));
      const def = PARTY_BY_ID[this.who]; const t = TRACKS[this.who]; const prog = progOf(c, this.who);
      const paths = [5, 9, 13].filter(l => l <= prog.level).map(l => { const id = getPick(prog.picks, 'tier', l); const o = id ? optionById(this.who, id) : undefined; return o ? t.paths[o.path] : null; }).filter(Boolean);
      b.append(h('div', { class: 'sec' }, `${def.name} · ${t.klass} ${prog.level}`), h('div', { class: 'small lore' }, def.blurb),
        paths.length ? h('div', {}, h('span', { class: 'tag mag' }, `Arquetipo: ${paths[paths.length - 1]}`)) : h('div', { class: 'small' }, 'Aún sin evolución de arquetipo (se elige al nivel 5, 9 y 13).'));
      const feats = featuresUpTo(this.who, prog); if (!feats.length) b.append(h('div', { class: 'small' }, 'Nivel 3: rasgos de la ficha original.'));
      for (const f of feats) b.append(h('div', { class: 'jq' }, h('span', { class: `tag ${f.kind === 'path' ? 'mag' : f.kind === 'auto' ? 'good' : ''}` }, `Nv ${f.level}`), h('b', {}, ' ' + f.name), h('div', { class: 'small' }, f.desc)));
      const nx = t.tiers.find(x => x.level > prog.level); if (nx) b.append(h('div', { class: 'small', style: { marginTop: '8px' } }, `Próxima evolución de arquetipo: nivel ${nx.level} (${nx.title}).`));
    } else if (tab === 'equipo') {
      b.append(h('div', { class: 'tabs' }, ...party.map(p => h('button', { class: `tabbtn ${this.who === p ? 'on' : ''}`, onClick: () => { this.who = p; refresh(); } }, PARTY_BY_ID[p].name))));
      for (const [s, lb] of SLOTS) {
        const cur = this.slotOf(c, this.who, s); b.append(h('div', { class: 'sec' }, lb));
        if (cur) b.append(card(cur, [h('button', { class: 'btn sm ghost', onClick: () => { c.equip[this.who] = c.equip[this.who].filter(i => i !== cur); refresh(); } }, 'Quitar')])); else b.append(h('div', { class: 'small' }, '— vacío —'));
        for (const it of ITEMS.filter(i => i.slot === s && i.id !== cur && this.free(c, i.id) > 0))
          b.append(card(it.id, [h('button', { class: 'btn sm', onClick: () => { this.equip(c, this.who, it.id); refresh(); } }, `Equipar a ${PARTY_BY_ID[this.who].name}`)]));
      }
    } else if (tab === 'mochila') {
      const own = ITEMS.filter(i => (c.inv[i.id] ?? 0) > 0); if (!own.length) b.append(h('div', { class: 'small' }, 'La mochila está vacía.'));
      for (const kind of ['consumible', 'equipo', 'material', 'clave'] as const) {
        const l = own.filter(i => i.kind === kind); if (!l.length) continue; b.append(h('div', { class: 'sec' }, { consumible: 'Consumibles (se usan en combate con «Objeto»)', equipo: 'Equipo', material: 'Materiales', clave: 'Objetos clave' }[kind]));
        for (const i of l) b.append(card(i.id, [h('span', { class: 'tag' }, `×${c.inv[i.id]}${i.kind === 'equipo' ? ` (${this.equipped(c, i.id)} equipado)` : ''}`)]));
      }
    } else if (tab === 'tienda') {
      const disc = c.rep.mercaderes >= 2 ? 0.85 : c.rep.mercaderes <= -2 ? 1.25 : 1; b.append(h('div', { class: 'small lore' }, 'EaNassr sonríe con tres dientes de oro. «Precios de amigo.» Mentira, pero casi.' + (disc < 1 ? ' (−15 % por tu fama entre los Mercaderes)' : disc > 1 ? ' (+25 %: no le caes bien)' : '')));
      for (const it of SHOP_STOCK) { const pr = Math.round((it.price ?? 100) * disc); b.append(card(it.id, [h('button', { class: 'btn sm', disabled: c.gold < pr, onClick: () => { c.gold -= pr; c.inv[it.id] = (c.inv[it.id] ?? 0) + 1; say(`Compras ${it.name} por ${pr} PO.`); } }, `Comprar · ${pr} PO`), h('span', { class: 'tag' }, `tienes ${c.inv[it.id] ?? 0}`)])); }
      b.append(h('div', { class: 'sec' }, 'Vender (50 %)'));
      for (const it of ITEMS.filter(i => i.price && this.free(c, i.id) > 0 && i.kind !== 'clave')) { const pr = Math.floor((it.price ?? 0) / 2); b.append(h('div', { class: 'small' }, `${it.icon} ${it.name} ×${this.free(c, it.id)} `, h('button', { class: 'btn sm ghost', onClick: () => { c.inv[it.id]--; c.gold += pr; say(`Vendes ${it.name} por ${pr} PO.`); } }, `+${pr} PO`))); }
    } else {
      b.append(h('div', { class: 'small lore' }, 'Aisha enciende el horno de la biblioteca. Con materiales y un poco de oro se fabrica casi todo lo que EaNassr vende más caro.'));
      for (const r of RECIPES) {
        const it = ITEM[r.out]; const lock = r.need && !has(c, r.need); if (lock) continue; const ok = c.mats >= r.mats && c.gold >= r.gold;
        b.append(card(r.out, [h('div', { class: 'small' }, r.note), h('button', { class: 'btn sm', disabled: !ok, onClick: () => { c.mats -= r.mats; c.gold -= r.gold; c.inv[r.out] = (c.inv[r.out] ?? 0) + 1; say(`Fabricas ${it.name}.`); } }, `Fabricar · ${r.mats} mat.${r.gold ? ` + ${r.gold} PO` : ''}`)]));
      }
    }
    return b;
  }
}
