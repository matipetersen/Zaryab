// Bot de jugador «competente» para balancear: usa habilidades, curaciones y recursos de forma razonable.
import { runAI } from '../src/engine/ai';
import type { Battle } from '../src/engine/battle';
import type { Unit, MAction } from '../src/engine/types';
import { cheb } from '../src/engine/grid';

export function pcActions(u: Unit): MAction[] {
  const a: MAction[] = u.weapons.filter(w => !w.bonusAction && w.id !== 'longbow_ss').map(w => ({ id: w.id, name: w.name, kind: w.ranged ? 'ranged' : 'melee', toHit: w.toHit, reach: w.range, dmg: w.dmg } as MAction));
  if (u.abilities.includes('eldritch_blast')) a.push({ id: 'eb', name: 'Estallido', kind: 'ranged', toHit: u.spellAtk, reach: 24, dmg: [{ dice: '1d10', type: 'force' }] } as MAction);
  return a;
}
export function botSetup(b: Battle) { for (const u of b.units) if (u.pcId) { u.ai = true; u.actions = pcActions(u); const main = u.actions[0]; if (main && (u.extraAtk ?? 0) > 0) u.multiattack = Array(1 + (u.extraAtk ?? 0)).fill(main.id); } }

const foesOf = (b: Battle, u: Unit) => b.foesOf(u).filter(f => f.sprite !== 'wall' && b.targetable(u, f) && f.hp > 0);
const nearest = (b: Battle, u: Unit, list: Unit[]) => [...list].sort((a, c) => cheb(a, u) - cheb(c, u))[0];

async function emulate(b: Battle, u: Unit) {
  const foes = foesOf(b, u); const allies = b.alliesOf(u).filter(a => a.pcId);
  const downed = allies.find(a => a.down && !a.dead && !a.stable);
  const hurt = [...allies].filter(a => !a.down && !a.dead && a.hp < a.maxHp * 0.45).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
  if (u.id === 'romain') {
    if (downed) b.useAbility(u, 'healing_word', downed);
    else if (hurt && !u.bonusUsed) b.useAbility(u, 'healing_word', hurt);
    const undead = foes.filter(f => f.undead && cheb(f, u) <= 6);
    if (undead.length >= 2 && u.res.channel > 0) b.useAbility(u, 'turn_undead', undefined);
    if (!u.actionUsed && !u.conc && u.abilities.includes('spirit_guardians') && foes.filter(f => cheb(f, u) <= 3).length >= 2 && b.slotLevels(u, 3).length) b.useAbility(u, 'spirit_guardians', undefined, b.slotLevels(u, 3)[0]);
    if (!u.actionUsed && !u.conc && b.round <= 2 && foes.length >= 3) b.useAbility(u, 'bless', undefined);
    if (!u.actionUsed && u.abilities.includes('flame_strike') && foes.length >= 3 && b.slotLevels(u, 5).length) { const t = nearest(b, u, foes); b.useAbility(u, 'flame_strike', { x: t.x, y: t.y }); }
    if (!u.actionUsed && hurt && cheb(u, hurt) <= 1) b.useAbility(u, 'cure_wounds', hurt);
    if (!u.actionUsed && foes.length) { const t = [...foes].sort((a, c) => c.hp - a.hp)[0]; if (b.slotLevels(u, 1).length > 1) b.useAbility(u, 'guiding_bolt', t); }
  } else if (u.id === 'pact') {
    if (u.hp < u.maxHp * 0.5) b.useAbility(u, 'second_wind', u);
    if (u.res.surge > 0 && foes.some(f => cheb(f, u) <= 3) && b.round >= 2) b.useAbility(u, 'action_surge', u);
  } else if (u.id === 'rabb') {
    const t = [...foes].sort((a, c) => c.hp - a.hp)[0];
    if (t && u.res.curse > 0) b.useAbility(u, 'hexblades_curse', t);
    else if (t && !u.conc && b.slotLevels(u, 1).length) b.useAbility(u, 'hex', t);
  } else if (u.id === 'joren') {
    const t = [...foes].sort((a, c) => c.hp - a.hp)[0];
    if (t && !u.conc && b.slotLevels(u, 1).length > 1) b.useAbility(u, 'hunters_mark', t);
    if (hurt && !u.actionUsed && cheb(u, hurt) <= 1 && b.slotLevels(u, 1).length) b.useAbility(u, 'cure_wounds', hurt);
  } else if (u.id === 'zyrthar') {
    if (foes.length >= 3 && u.res.faerie > 0 && b.round === 1) { const t = nearest(b, u, foes); b.useAbility(u, 'faerie_fire', { x: t.x, y: t.y }); }
    else if (!b.has(u, 'invisible') && foes.length && !u.bonusUsed) b.useAbility(u, 'hide', u);
  } else if (u.id === 'panchi') { /* ráfaga después de la acción principal */ }
}
async function post(b: Battle, u: Unit) {
  if (u.id === 'pact' && u.extraActions > 0 && !b.over) { u.extraActions--; u.actionUsed = false; u.attacksMade = 0; await runAI(b, u, undefined, bias); }
  if (u.id === 'panchi' && !b.over) {
    const adj = foesOf(b, u).filter(f => cheb(f, u) <= 1)[0];
    if (adj && u.actionUsed) { u.attacksMade = 1; /* el bot atacó con la acción (vía runAI) */ const w = u.weapons.find(x => x.bonusAction)!; if (u.res.ki > 0) b.useAbility(u, 'flurry', undefined); b.weaponAttack(u, w, adj); const adj2 = foesOf(b, u).filter(f => cheb(f, u) <= 1)[0]; if (adj2 && u.res.flurry > 0) b.weaponAttack(u, w, adj2); }
  }
}
const bias = (t: Unit) => (t.traits.includes('pilon') ? 9 : t.traits.includes('flees50') ? -5 : t.sprite === 'colossus' ? -1 : 0);
export async function botTurn(b: Battle, u: Unit) {
  await emulate(b, u); await runAI(b, u, undefined, bias); await post(b, u);
}
