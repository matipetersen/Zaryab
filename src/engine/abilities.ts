import type { Battle, Res } from './battle';
import type { Unit, DmgType, DmgPart } from './types';
import type { P } from './grid';
import { cheb } from './grid';
import { roll, rand } from './dice';

export type TargetKind = 'enemy' | 'ally' | 'allyOrSelf' | 'self' | 'none' | 'tile' | 'downedAlly' | 'any' | 'deadAlly';
export interface AbilityDef {
  id: string; name: string; desc: string; cost: 'action' | 'bonus' | 'free';
  range: number; target: TargetKind; slot?: number; use?: string; conc?: boolean; upcast?: boolean; los?: boolean;
  aoe?: number; tag?: 'heal' | 'attack' | 'buff' | 'control' | 'move' | 'utility';
  validate?: (b: Battle, u: Unit, t: any, l: number) => Res | undefined;
  run: (b: Battle, u: Unit, t: any, l: number) => void;
}
export const ABILITIES: Record<string, AbilityDef> = {};
const def = (a: AbilityDef) => { ABILITIES[a.id] = a; };

// ---------- helpers ----------
function spellAttack(b: Battle, u: Unit, t: Unit, dice: string, type: DmgType, name: string, ranged = true, extra?: (crit: boolean) => void) {
  const wasInvis = b.has(u, 'invisible');
  const r = b.rollAttack(u, t, u.spellAtk, { ranged, spell: true });
  b.emit({ t: 'fx', kind: ranged ? 'bolt' : 'slash', x: u.x, y: u.y, x2: t.x, y2: t.y });
  if (!r.hit) { b.log(`${u.name} lanza ${name} a ${t.name}: ${r.nat}→${r.total} vs CA ${r.ac}: falla.`, 'roll'); b.float(t, 'Falla', 'miss'); }
  else {
    const parts: DmgPart[] = [{ dice, type }];
    if (b.has(u, 'hex') && b.status(u, 'hex')!.val === t.uid) parts.push({ dice: '1d6', type: 'necrotic' });
    if (b.has(u, 'hexCurse') && b.status(u, 'hexCurse')!.val === t.uid) parts.push({ dice: String(u.prof), type });
    const rolled = b.rollParts(parts, r.crit);
    let tot = 0; const txt: string[] = [];
    for (const p of rolled) { tot += b.damage(t, p.amt, p.type, u, { crit: r.crit, silent: true }); txt.push(`${p.amt} ${p.type}`); }
    b.log(`${u.name} lanza ${name} a ${t.name}${r.adv ? ' (ventaja)' : ''}${r.crit ? ' ¡CRÍTICO!' : ''}: ${r.nat}→${r.total} vs CA ${r.ac}. Daño ${tot} (${txt.join(' + ')}).`, 'dmg');
    if (tot > 0) b.float(t, String(tot), r.crit ? 'crit' : 'dmg');
    extra?.(r.crit);
  }
  if (wasInvis) b.removeStatus(u, 'invisible');
}
const nearestAllies = (b: Battle, u: Unit, radius: number, n: number) =>
  b.alliesOf(u).filter(a => !a.down && a.sprite !== 'wall' && cheb(a, u) <= radius).sort((x, y) => cheb(x, u) - cheb(y, u)).slice(0, n);
const nearestFoes = (b: Battle, u: Unit, radius: number, n: number) =>
  b.foesOf(u).filter(f => cheb(f, u) <= radius && b.canSee(u, f).visible && b.targetable(u, f)).sort((x, y) => cheb(x, u) - cheb(y, u)).slice(0, n);

// ---------- generales ----------
def({ id: 'dash', name: 'Correr', desc: 'Duplicas tu movimiento este turno.', cost: 'action', range: 0, target: 'self', tag: 'move',
  run: (b, u) => { u.moveLeft += u.speed; b.log(`${u.name} corre.`, 'sys'); } });
def({ id: 'dodge', name: 'Esquivar', desc: 'Los ataques contra ti tienen desventaja hasta tu próximo turno.', cost: 'action', range: 0, target: 'self', tag: 'buff',
  run: (b, u) => { b.addStatus(u, { id: 'dodging', turns: -1 }); b.log(`${u.name} se pone a la defensiva.`, 'sys'); } });

// ---------- Romain (Clérigo de la Tumba) ----------
def({ id: 'cure_wounds', name: 'Curar Heridas', desc: 'Toque. Cura 1d8+mod por nivel de espacio.', cost: 'action', range: 1, target: 'allyOrSelf', slot: 1, upcast: true, tag: 'heal',
  run: (b, u, t: Unit, l) => { const r = roll(`${l}d8`); const amt = r.total + u.spellMod; b.heal(t, amt, u); b.log(`${u.name} cura a ${t.name} (${amt}) con Curar Heridas.`, 'heal'); } });
def({ id: 'healing_word', name: 'Palabra de Curación', desc: 'Acción adicional, 12 casillas. Cura 1d4+mod por nivel de espacio.', cost: 'bonus', range: 12, target: 'allyOrSelf', slot: 1, upcast: true, tag: 'heal', los: false,
  run: (b, u, t: Unit, l) => { const r = roll(`${l}d4`); const amt = r.total + u.spellMod; b.heal(t, amt, u); b.log(`${u.name} susurra una Palabra de Curación: ${t.name} +${amt}.`, 'heal'); } });
def({ id: 'bless', name: 'Bendecir', desc: 'Concentración. Hasta 3 aliados a 6 casillas suman 1d4 a ataques y salvaciones.', cost: 'action', range: 0, target: 'none', slot: 1, conc: true, upcast: true, tag: 'buff',
  run: (b, u, _t, l) => { const al = nearestAllies(b, u, 6, 2 + l); u.conc = { id: 'bless', targets: al.map(a => a.uid) }; for (const a of al) b.addStatus(a, { id: 'bless', turns: 10, src: u.uid }); b.log(`${u.name} bendice a ${al.map(a => a.name).join(', ')}.`, 'buff'); } });
def({ id: 'bane', name: 'Perdición', desc: 'Concentración. Hasta 3 enemigos a 6 casillas: salvación CAR o restan 1d4 a ataques y salvaciones.', cost: 'action', range: 0, target: 'none', slot: 1, conc: true, upcast: true, tag: 'control',
  run: (b, u, _t, l) => { const fs = nearestFoes(b, u, 6, 2 + l); u.conc = { id: 'bane', targets: [] }; for (const f of fs) if (!b.save(f, 'cha', u.spellDC, '(Perdición)')) { b.addStatus(f, { id: 'bane', turns: 10, src: u.uid }); u.conc.targets.push(f.uid); } } });
def({ id: 'guiding_bolt', name: 'Rayo Guía', desc: 'Ataque de conjuro, 4d6 radiante. El siguiente ataque contra el objetivo tiene ventaja.', cost: 'action', range: 24, target: 'enemy', slot: 1, upcast: true, tag: 'attack',
  run: (b, u, t: Unit, l) => spellAttack(b, u, t, `${3 + l}d6`, 'radiant', 'Rayo Guía', true, () => b.addStatus(t, { id: 'guided', turns: 2, src: u.uid })) });
def({ id: 'inflict_wounds', name: 'Infligir Heridas', desc: 'Toque. Ataque de conjuro cuerpo a cuerpo, 3d10 necrótico.', cost: 'action', range: 1, target: 'enemy', slot: 1, upcast: true, tag: 'attack',
  run: (b, u, t: Unit, l) => spellAttack(b, u, t, `${2 + l}d10`, 'necrotic', 'Infligir Heridas', false) });
def({ id: 'shield_of_faith', name: 'Escudo de la Fe', desc: 'Acción adicional, concentración. Un aliado gana +2 CA.', cost: 'bonus', range: 12, target: 'allyOrSelf', slot: 1, conc: true, tag: 'buff', los: false,
  run: (b, u, t: Unit) => { u.conc = { id: 'shield_of_faith', targets: [t.uid] }; b.addStatus(t, { id: 'shieldFaith', turns: 100, src: u.uid }); b.log(`${u.name} protege a ${t.name} con el Escudo de la Fe.`, 'buff'); } });
def({ id: 'word_of_radiance', name: 'Palabra de Resplandor', desc: 'Truco. Enemigos a 1 casilla: salvación CON o 1d6 radiante.', cost: 'action', range: 0, target: 'none', aoe: 1, tag: 'attack',
  run: (b, u) => { b.emit({ t: 'fx', kind: 'burst', x: u.x, y: u.y }); for (const f of b.foesOf(u).filter(f => cheb(f, u) <= 1)) { const ok = b.save(f, 'con', u.spellDC, '(Palabra de Resplandor)'); if (!ok) b.damage(f, roll('1d6').total, 'radiant', u); } } });
def({ id: 'spare_the_dying', name: 'Estabilizar', desc: 'Truco, toque. Estabiliza a un aliado a 0 PG.', cost: 'action', range: 1, target: 'downedAlly', tag: 'heal',
  run: (b, u, t: Unit) => { t.stable = true; b.log(`${u.name} estabiliza a ${t.name}.`, 'heal'); b.float(t, 'Estable', 'heal'); } });
def({ id: 'turn_undead', name: 'Expulsar no-muertos', desc: 'Canalizar Divinidad. No-muertos a 6 casillas: salvación SAB o huyen aterrados.', cost: 'action', range: 0, target: 'none', use: 'channel', aoe: 6, tag: 'control',
  run: (b, u) => { b.emit({ t: 'fx', kind: 'burst', x: u.x, y: u.y }); const u2 = b.foesOf(u).filter(f => f.undead && cheb(f, u) <= 6); if (!u2.length) b.log('No hay no-muertos a la vista.', 'sys'); for (const f of u2) if (!b.save(f, 'wis', u.spellDC, '(Expulsar)')) b.addStatus(f, { id: 'frightened', turns: 10, src: u.uid }); } });
def({ id: 'path_to_grave', name: 'Sendero a la Tumba', desc: 'Canalizar Divinidad. El próximo ataque contra la criatura la daña el doble.', cost: 'action', range: 6, target: 'enemy', use: 'channel', tag: 'control',
  run: (b, u, t: Unit) => { b.addStatus(t, { id: 'vulnerable', turns: 2, src: u.uid }); b.log(`${u.name} marca a ${t.name} para la tumba.`, 'buff'); } });
def({ id: 'lesser_restoration', name: 'Restauración Menor', desc: 'Toque. Quita cegado, envenenado o paralizado.', cost: 'action', range: 1, target: 'allyOrSelf', slot: 2, tag: 'heal',
  run: (b, u, t: Unit) => { for (const c of ['blinded', 'poisoned', 'paralyzed'] as const) b.removeStatus(t, c); b.float(t, 'Purificado', 'heal'); b.log(`${u.name} purifica a ${t.name}.`, 'heal'); } });
def({ id: 'aid', name: 'Auxilio', desc: 'Hasta 3 aliados a 6 casillas suben 5 PG máximos y actuales.', cost: 'action', range: 0, target: 'none', slot: 2, upcast: true, tag: 'buff',
  run: (b, u, _t, l) => { for (const a of nearestAllies(b, u, 6, 3)) { const g = 5 * (l - 1); a.maxHp += g; a.hp += g; b.float(a, `+${g} PG`, 'heal'); } b.log(`${u.name} invoca Auxilio.`, 'buff'); } });
def({ id: 'ray_of_enfeeblement', name: 'Rayo de Debilitamiento', desc: 'Concentración. Ataque de conjuro: el objetivo hace la mitad de daño con armas.', cost: 'action', range: 12, target: 'enemy', slot: 2, conc: true, tag: 'control',
  run: (b, u, t: Unit) => { const r = b.rollAttack(u, t, u.spellAtk, { ranged: true, spell: true }); b.emit({ t: 'fx', kind: 'bolt', x: u.x, y: u.y, x2: t.x, y2: t.y }); if (!r.hit) { b.log('El rayo falla.', 'roll'); b.float(t, 'Falla', 'miss'); u.conc = undefined; return; } u.conc = { id: 'ray_of_enfeeblement', targets: [t.uid] }; b.addStatus(t, { id: 'enfeebled', turns: 10, src: u.uid }); } });

// ---------- Pact Risen (Guerrero / Maestro de Batalla / Aasimar) ----------
def({ id: 'second_wind', name: 'Tomar Aliento', desc: 'Acción adicional. Recuperas 1d10+3 PG.', cost: 'bonus', range: 0, target: 'self', use: 'sw', tag: 'heal',
  run: (b, u) => { const a = roll('1d10').total + u.level; b.heal(u, a, u); b.log(`${u.name} toma aliento (+${a}).`, 'heal'); } });
def({ id: 'action_surge', name: 'Oleada de Acción', desc: 'Obtienes una acción adicional este turno.', cost: 'free', range: 0, target: 'self', use: 'surge', tag: 'buff',
  run: (b, u) => { u.extraActions++; b.log(`${u.name} lanza una Oleada de Acción.`, 'buff'); b.float(u, '¡Oleada!', 'status'); } });
def({ id: 'rally', name: 'Reagrupar', desc: 'Acción adicional, dado de superioridad. Aliado a 12 casillas gana 1d8+CAR PG temporales.', cost: 'bonus', range: 12, target: 'allyOrSelf', use: 'sd', tag: 'buff', los: false,
  run: (b, u, t: Unit) => { const a = roll('1d8').total + u.mods.cha; t.temp = Math.max(t.temp, a); b.float(t, `+${a} temp`, 'heal'); b.log(`${u.name} reagrupa a ${t.name} (+${a} PG temporales).`, 'buff'); } });
def({ id: 'radiant_soul', name: 'Alma Radiante', desc: 'Brotan alas luminosas: vuelas y sumas 3 de daño radiante por turno (10 rondas).', cost: 'action', range: 0, target: 'self', use: 'soul', tag: 'buff',
  run: (b, u) => { u.fly = true; b.addStatus(u, { id: 'radiantSoul', turns: 10, src: u.uid }); b.log(`Dos alas de luz brotan de la espalda de ${u.name}.`, 'buff'); b.emit({ t: 'fx', kind: 'heal', x: u.x, y: u.y }); } });
def({ id: 'healing_hands', name: 'Manos Curativas', desc: 'Toque. Recupera PG igual a tu nivel.', cost: 'action', range: 1, target: 'allyOrSelf', use: 'hh', tag: 'heal',
  run: (b, u, t: Unit) => { b.heal(t, u.level, u); b.log(`${u.name} cura ${u.level} a ${t.name}.`, 'heal'); } });

// ---------- Rabb Locke (Hexblade) ----------
def({ id: 'eldritch_blast', name: 'Estallido Sobrenatural', desc: 'Truco. Ataque de conjuro a 24 casillas: 1d10 de fuerza.', cost: 'action', range: 24, target: 'enemy', tag: 'attack',
  run: (b, u, t: Unit) => spellAttack(b, u, t, '1d10', 'force', 'Estallido Sobrenatural') });
def({ id: 'hex', name: 'Maleficio', desc: 'Acción adicional, concentración. +1d6 necrótico a tus ataques contra el objetivo.', cost: 'bonus', range: 18, target: 'enemy', slot: 1, conc: true, tag: 'control',
  run: (b, u, t: Unit) => { u.conc = { id: 'hex', targets: [t.uid] }; b.addStatus(t, { id: 'hex', turns: 600, src: u.uid, val: t.uid }, true); b.addStatus(u, { id: 'hex', turns: 600, src: u.uid, val: t.uid }, true); b.float(t, 'Maleficio', 'status'); b.log(`${u.name} maldice a ${t.name}.`, 'buff'); } });
def({ id: 'wrathful_smite', name: 'Golpe Iracundo', desc: 'Acción adicional, concentración. Tu próximo golpe cuerpo a cuerpo: +1d6 psíquico y puede aterrar.', cost: 'bonus', range: 0, target: 'none', slot: 1, conc: true, tag: 'buff',
  run: (b, u) => { u.conc = { id: 'wrathful_smite', targets: [] }; b.addStatus(u, { id: 'wrathSmite', turns: 10, src: u.uid }); } });
def({ id: 'hexblades_curse', name: 'Maldición del Hexblade', desc: 'Acción adicional. El objetivo sufre +bono de competencia al daño, tus críticos en 19-20 y te curas si muere.', cost: 'bonus', range: 6, target: 'enemy', use: 'curse', tag: 'control',
  run: (b, u, t: Unit) => { b.addStatus(u, { id: 'hexCurse', turns: 10, src: u.uid, val: t.uid }, true); b.float(t, 'Maldito', 'status'); b.log(`${u.name} lanza su Maldición contra ${t.name}.`, 'buff'); } });

// ---------- Joren Hell (Acechador de la Penumbra) ----------
def({ id: 'hunters_mark', name: 'Marca del Cazador', desc: 'Acción adicional, concentración. +1d6 a tus ataques con arma contra el objetivo.', cost: 'bonus', range: 18, target: 'enemy', slot: 1, conc: true, tag: 'control',
  run: (b, u, t: Unit) => { u.conc = { id: 'hunters_mark', targets: [t.uid] }; b.addStatus(u, { id: 'hunterMark', turns: 600, src: u.uid, val: t.uid }, true); b.float(t, 'Marcado', 'status'); b.log(`${u.name} marca a ${t.name}.`, 'buff'); } });

// ---------- Zyr'thar (Pícaro / Asesino) ----------
def({ id: 'hide', name: 'Esconderse', desc: 'Acción adicional. Quedas oculto hasta que ataques.', cost: 'bonus', range: 0, target: 'self', tag: 'buff',
  run: (b, u) => { b.addStatus(u, { id: 'invisible', turns: 3, src: u.uid }); b.log(`${u.name} se funde con las sombras.`, 'buff'); } });
def({ id: 'cunning_dash', name: 'Acción Astuta: Correr', desc: 'Acción adicional. Duplicas tu movimiento.', cost: 'bonus', range: 0, target: 'self', tag: 'move',
  run: (b, u) => { u.moveLeft += u.speed; b.log(`${u.name} corre entre las sombras.`, 'sys'); } });
def({ id: 'faerie_fire', name: 'Fuego Feérico', desc: '1/día. Enemigos a 2 casillas del punto: salvación DES o quedan delineados (ventaja para atacarles).', cost: 'action', range: 12, target: 'tile', use: 'faerie', aoe: 2, tag: 'control',
  run: (b, u, t: P) => { b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y }); for (const f of b.foesOf(u).filter(f => cheb(f, t) <= 2)) if (!b.save(f, 'dex', u.spellDC, '(Fuego Feérico)')) b.addStatus(f, { id: 'faerie', turns: 10, src: u.uid }); } });

// ---------- Panchi (Monje) ----------
def({ id: 'flurry', name: 'Ráfaga de Golpes', desc: 'Gastas 1 ki: dos golpes desarmados como acción adicional.', cost: 'bonus', range: 0, target: 'none', use: 'ki', tag: 'attack',
  run: (b, u) => { u.res['flurry'] = 2; b.log(`${u.name} desata una Ráfaga de Golpes.`, 'buff'); } });
def({ id: 'patient_defense', name: 'Defensa Paciente', desc: 'Gastas 1 ki: Esquivar como acción adicional.', cost: 'bonus', range: 0, target: 'self', use: 'ki', tag: 'buff',
  run: (b, u) => { b.addStatus(u, { id: 'dodging', turns: -1 }); } });
def({ id: 'step_of_wind', name: 'Paso del Viento', desc: 'Gastas 1 ki: Correr como acción adicional.', cost: 'bonus', range: 0, target: 'self', use: 'ki', tag: 'move',
  run: (b, u) => { u.moveLeft += u.speed; } });
void rand;
