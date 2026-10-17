// Habilidades que se desbloquean al subir de nivel (5e). Se cargan después de abilities.ts.
import type { Unit, DmgType } from './types';
import type { P } from './grid';
import { cheb } from './grid';
import { roll } from './dice';
import { makeFoe } from '../data/monsters';
import { def, spellAttack, nearestAllies, nearestFoes, sdDie } from './abilities';

// ───── Romain · Clérigo de la Tumba ─────
def({ id: 'sacred_flame', name: 'Llama Sagrada', desc: 'Truco. Un enemigo a 12 casillas: salvación DES o 1d8 radiante (2d8 al nv 5, 3d8 al nv 11).', cost: 'action', range: 12, target: 'enemy', tag: 'attack',
  run: (b, u, t: Unit) => { const n = 1 + (u.level >= 5 ? 1 : 0) + (u.level >= 11 ? 1 : 0); b.emit({ t: 'fx', kind: 'bolt', x: u.x, y: u.y, x2: t.x, y2: t.y }); const ok = b.save(t, 'dex', u.spellDC, '(Llama Sagrada)'); if (!ok) b.damage(t, roll(`${n}d8`).total, 'radiant', u); } });
def({ id: 'spirit_guardians', name: 'Guardianes Espirituales', desc: 'Concentración. Espíritus giran a tu alrededor: los enemigos a 3 casillas sufren 3d8 radiante/necrótico al empezar su turno (SAB para la mitad).', cost: 'action', range: 0, target: 'none', slot: 3, conc: true, upcast: true, tag: 'attack',
  run: (b, u, _t, l) => { u.conc = { id: 'spirit_guardians', targets: [] }; b.addStatus(u, { id: 'spiritGuard', turns: 100, src: u.uid, val: l }, true); b.emit({ t: 'fx', kind: 'burst', x: u.x, y: u.y }); b.log(`${u.name} rodea el campo de espíritus.`, 'buff'); } });
def({ id: 'revivify', name: 'Revivir', desc: 'Toque. Un aliado caído vuelve con 1d4+4 PG.', cost: 'action', range: 1, target: 'downedAlly', slot: 3, tag: 'heal', los: false,
  run: (b, u, t: Unit) => { const h = roll('1d4').total + 4; b.heal(t, h, u); b.log(`${u.name} revive a ${t.name} (${h} PG).`, 'heal'); } });
def({ id: 'death_ward', name: 'Protección contra la Muerte', desc: 'Toque. El aliado, la primera vez que caiga a 0 PG, queda con 1 PG.', cost: 'action', range: 1, target: 'allyOrSelf', slot: 4, tag: 'buff',
  run: (b, u, t: Unit) => { b.addStatus(t, { id: 'deathWard', turns: 600, src: u.uid }, true); b.float(t, 'Protegido', 'heal'); b.log(`${u.name} protege a ${t.name} contra la muerte.`, 'buff'); } });
def({ id: 'banishment', name: 'Destierro', desc: 'Concentración. Un enemigo a 12 casillas: salvación CAR o queda paralizado (desterrado) hasta 10 rondas.', cost: 'action', range: 12, target: 'enemy', slot: 4, conc: true, upcast: true, tag: 'control',
  run: (b, u, t: Unit) => { if (!b.save(t, 'cha', u.spellDC, '(Destierro)')) { u.conc = { id: 'banishment', targets: [t.uid] }; b.addStatus(t, { id: 'paralyzed', turns: 10, src: u.uid }); b.log(`${t.name} desaparece del campo.`, 'buff'); } else u.conc = undefined; } });
def({ id: 'flame_strike', name: 'Golpe de Llamas', desc: 'Un punto a 12 casillas, radio 2: 4d6 fuego + 4d6 radiante, salvación DES para la mitad.', cost: 'action', range: 12, target: 'point', slot: 5, aoe: 2, tag: 'attack',
  run: (b, u, t: P) => { b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y }); b.hitArea(t, 2, roll('4d6').total, 'fire', u); for (const f of b.foesOf(u).filter(f => cheb(f, t) <= 2)) { const ok = b.save(f, 'dex', u.spellDC, '(Golpe de Llamas)'); const d = roll('4d6').total; b.damage(f, ok ? Math.floor(d / 2) : d, 'radiant', u); } } });
def({ id: 'mass_cure_wounds', name: 'Curar Heridas en Masa', desc: 'Hasta 6 aliados a 6 casillas recuperan 3d8+mod.', cost: 'action', range: 0, target: 'none', slot: 5, tag: 'heal',
  run: (b, u) => { for (const a of nearestAllies(b, u, 6, 6)) { const h = roll('3d8').total + u.spellMod; b.heal(a, h, u); } b.log(`${u.name} invoca Curar Heridas en Masa.`, 'heal'); } });
def({ id: 'heal_spell', name: 'Sanar', desc: 'Un aliado a 12 casillas recupera 70 PG y se purifica.', cost: 'action', range: 12, target: 'allyOrSelf', slot: 6, tag: 'heal', los: false,
  run: (b, u, t: Unit) => { b.heal(t, 70, u); for (const c of ['blinded', 'poisoned', 'paralyzed', 'frightened', 'stunned'] as const) b.removeStatus(t, c); b.log(`${u.name} sana a ${t.name}.`, 'heal'); } });
def({ id: 'juicio_final', name: 'Juicio Final', desc: '1/día. Enemigos a 4 casillas: 6d8 necrótico (CON mitad).', cost: 'action', range: 0, target: 'none', use: 'juicio', aoe: 4, tag: 'attack',
  run: (b, u) => { b.emit({ t: 'fx', kind: 'burst', x: u.x, y: u.y }); for (const f of b.foesOf(u).filter(f => cheb(f, u) <= 4)) { const ok = b.save(f, 'con', u.spellDC, '(Juicio Final)'); const d = roll('6d8').total; b.damage(f, ok ? Math.floor(d / 2) : d, 'necrotic', u); } b.log(`${u.name} pronuncia el Juicio Final.`, 'roll'); } });

// ───── Pact Risen · Maestro de Batalla ─────
def({ id: 'trip_attack', name: 'Maniobra: Derribo', desc: 'Dado de superioridad. Ataque cuerpo a cuerpo + dado; salvación FUE o cae derribado.', cost: 'free', range: 1, target: 'enemy', use: 'sd', tag: 'control',
  run: (b, u, t: Unit) => { const w = u.weapons.find(x => !x.ranged && !x.bonusAction)!; const d = roll(sdDie(u)).total; const r = b.rollAttack(u, t, w.toHit, {}); if (r.hit) { b.damage(t, d + roll(w.dmg[0].dice).total, w.dmg[0].type, u); if (!b.save(t, 'str', 8 + u.prof + u.mods.str, '(Derribo)')) b.addStatus(t, { id: 'prone', turns: 1, src: u.uid }); } else b.log(`${u.name} falla el Derribo.`, 'roll'); } });
def({ id: 'menacing_attack', name: 'Maniobra: Ataque Amenazador', desc: 'Dado de superioridad. Ataque cuerpo a cuerpo + dado; salvación SAB o queda aterrado.', cost: 'free', range: 1, target: 'enemy', use: 'sd', tag: 'control',
  run: (b, u, t: Unit) => { const w = u.weapons.find(x => !x.ranged && !x.bonusAction)!; const d = roll(sdDie(u)).total; const r = b.rollAttack(u, t, w.toHit, {}); if (r.hit) { b.damage(t, d + roll(w.dmg[0].dice).total, w.dmg[0].type, u); if (!b.save(t, 'wis', 8 + u.prof + u.mods.str, '(Amenaza)')) b.addStatus(t, { id: 'frightened', turns: 2, src: u.uid }); } else b.log(`${u.name} falla.`, 'roll'); } });
def({ id: 'indomitable', name: 'Indómito', desc: 'Te librás de aterrado, aturdido, paralizado o hechizado.', cost: 'free', range: 0, target: 'self', use: 'indomitable', tag: 'heal',
  run: (b, u) => { for (const c of ['frightened', 'stunned', 'paralyzed', 'charmed', 'blinded'] as const) b.removeStatus(u, c); b.float(u, 'Indómito', 'heal'); b.log(`${u.name} se sobrepone.`, 'heal'); } });
def({ id: 'alas_azuran', name: 'Alas de Azuran', desc: 'Acción adicional. Alas de luz: volás 10 rondas.', cost: 'bonus', range: 0, target: 'self', tag: 'buff',
  run: (b, u) => { u.fly = true; b.addStatus(u, { id: 'radiantSoul', turns: 10, src: u.uid }); b.log(`${u.name} despliega las alas de Azuran.`, 'buff'); } });

// ───── Rabb Locke · Hexblade ─────
const held = (name: string, desc: string, slot: number, ab: 'wis' | 'cha', range: number) => def({ id: name, name: desc.split('|')[0], desc: desc.split('|')[1], cost: 'action', range, target: 'enemy', slot, conc: true, upcast: true, tag: 'control',
  run: (b, u, t: Unit) => { if (!b.save(t, ab, u.spellDC, `(${desc.split('|')[0]})`)) { u.conc = { id: name, targets: [t.uid] }; b.addStatus(t, { id: 'paralyzed', turns: 10, src: u.uid }); b.log(`${t.name} queda inmóvil.`, 'buff'); } else u.conc = undefined; } });
held('hold_person', 'Inmovilizar Persona|Concentración. Un humanoide a 12 casillas: salvación SAB o queda paralizado.', 2, 'wis', 12);
held('hold_monster', 'Inmovilizar Monstruo|Concentración. Una criatura a 12 casillas: salvación SAB o queda paralizada.', 5, 'wis', 12);
def({ id: 'vampiric_touch', name: 'Toque Vampírico', desc: 'Toque, ataque de conjuro: 3d6 necrótico y recuperás la mitad.', cost: 'action', range: 1, target: 'enemy', slot: 3, upcast: true, tag: 'attack',
  run: (b, u, t: Unit, l) => { const before = t.hp; spellAttack(b, u, t, `${l}d6`, 'necrotic', 'Toque Vampírico', false); const lost = Math.max(0, before - t.hp); if (lost) b.heal(u, Math.floor(lost / 2), u); } });
def({ id: 'fear_spell', name: 'Miedo', desc: 'Enemigos a 3 casillas: salvación SAB o quedan aterrados.', cost: 'action', range: 0, target: 'none', slot: 3, aoe: 3, tag: 'control',
  run: (b, u) => { b.emit({ t: 'fx', kind: 'burst', x: u.x, y: u.y }); for (const f of nearestFoes(b, u, 3, 8)) if (!b.save(f, 'wis', u.spellDC, '(Miedo)')) b.addStatus(f, { id: 'frightened', turns: 3, src: u.uid }); } });
def({ id: 'blight', name: 'Marchitar', desc: 'Un enemigo a 6 casillas: 8d8 necrótico (CON mitad).', cost: 'action', range: 6, target: 'enemy', slot: 4, upcast: true, tag: 'attack',
  run: (b, u, t: Unit, l) => { const ok = b.save(t, 'con', u.spellDC, '(Marchitar)'); const d = roll(`${l + 4}d8`).total; b.damage(t, ok ? Math.floor(d / 2) : d, 'necrotic', u); } });
def({ id: 'circle_of_death', name: 'Círculo de Muerte (Arcano)', desc: '1/día. Enemigos a 3 casillas de un punto a 12: 8d6 necrótico (CON mitad).', cost: 'action', range: 12, target: 'point', use: 'arc6', aoe: 3, tag: 'attack',
  run: (b, u, t: P) => { b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y }); for (const f of b.foesOf(u).filter(f => cheb(f, t) <= 3)) { const ok = b.save(f, 'con', u.spellDC, '(Círculo de Muerte)'); const d = roll('8d6').total; b.damage(f, ok ? Math.floor(d / 2) : d, 'necrotic', u); } } });
def({ id: 'finger_of_death', name: 'Dedo de la Muerte (Arcano)', desc: '1/día. Un enemigo a 12 casillas: 7d8+30 necrótico (CON mitad).', cost: 'action', range: 12, target: 'enemy', use: 'arc7', tag: 'attack',
  run: (b, u, t: Unit) => { const ok = b.save(t, 'con', u.spellDC, '(Dedo de la Muerte)'); const d = roll('7d8').total + 30; b.damage(t, ok ? Math.floor(d / 2) : d, 'necrotic', u); } });
def({ id: 'accursed_specter', name: 'Espectro Maldito', desc: '1/día. Invocás un espectro aliado (sombra de arena) en una casilla a 3.', cost: 'action', range: 3, target: 'tile', use: 'specter', tag: 'utility',
  run: (b, u, t: P) => { const g = makeFoe('sombra_arena', t.x, t.y, ' (espectro)', u.side); b.summon(g, u, t); b.log(`${u.name} libera un espectro maldito.`, 'buff'); } });

// ───── Joren Hell · Acechador de la Penumbra ─────
def({ id: 'zephyr_strike', name: 'Golpe de Céfiro', desc: 'Acción adicional. Ganás +3 casillas de movimiento y no provocas ataques de oportunidad.', cost: 'bonus', range: 0, target: 'self', slot: 1, tag: 'move',
  run: (b, u) => { u.moveLeft += 3; b.addStatus(u, { id: 'disengaged', turns: 1, src: u.uid }, true); b.log(`${u.name} corre como el viento.`, 'buff'); } });
def({ id: 'conjure_barrage', name: 'Lluvia de Flechas', desc: 'Un punto a 6 casillas, radio 3: 3d8 de daño (DES mitad).', cost: 'action', range: 6, target: 'point', slot: 3, aoe: 3, tag: 'attack',
  run: (b, u, t: P) => { b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y }); for (const f of b.foesOf(u).filter(f => cheb(f, t) <= 3)) { const ok = b.save(f, 'dex', u.spellDC, '(Lluvia de Flechas)'); const d = roll('3d8').total; b.damage(f, ok ? Math.floor(d / 2) : d, 'piercing', u); } } });
def({ id: 'ensnaring_strike', name: 'Golpe Enredador', desc: 'Acción adicional. Tu siguiente golpe: salvación FUE o queda inmovilizado (enredado).', cost: 'bonus', range: 0, target: 'none', slot: 1, conc: true, tag: 'buff',
  run: (b, u) => { u.conc = { id: 'ensnaring_strike', targets: [] }; b.addStatus(u, { id: 'ensnare', turns: 10, src: u.uid }); } });
def({ id: 'volley', name: 'Descarga de Flechas', desc: 'Todos los enemigos a 2 casillas de un punto a 10: un ataque de arco a cada uno.', cost: 'action', range: 10, target: 'point', use: 'volley', aoe: 2, tag: 'attack',
  run: (b, u, t: P) => { const w = u.weapons.find(x => x.ranged)!; for (const f of b.foesOf(u).filter(f => cheb(f, t) <= 2)) { const r = b.rollAttack(u, f, w.toHit, { ranged: true }); if (r.hit) b.damage(f, roll(w.dmg[0].dice).total, w.dmg[0].type, u); } } });

// ───── Zyr'thar · Asesino ─────
def({ id: 'smoke_bomb', name: 'Bomba de Humo', desc: '1/día. Un punto a 6 casillas, radio 2: salvación CON o quedan cegados 2 turnos.', cost: 'action', range: 6, target: 'point', use: 'smoke', aoe: 2, tag: 'control',
  run: (b, u, t: P) => { b.emit({ t: 'fx', kind: 'burst', x: t.x, y: t.y }); for (const f of b.foesOf(u).filter(f => cheb(f, t) <= 2)) if (!b.save(f, 'con', 8 + u.prof + u.mods.dex, '(Humo)')) b.addStatus(f, { id: 'blinded', turns: 2, src: u.uid }); } });
def({ id: 'poison_blade', name: 'Hoja Envenenada', desc: '1/día. Tus golpes cuerpo a cuerpo añaden 1d6 de veneno 10 rondas.', cost: 'bonus', range: 0, target: 'self', use: 'poison', tag: 'buff',
  run: (b, u) => { for (const w of u.weapons) if (!w.ranged) w.dmg = [...w.dmg, { dice: '1d6', type: 'poison' as DmgType }]; b.log(`${u.name} unta su hoja con veneno.`, 'buff'); } });

// ───── Panchi · Monje ─────
def({ id: 'stunning_strike', name: 'Golpe Aturdidor', desc: 'Gastás 1 ki: un enemigo adyacente, salvación CON o queda aturdido 1 turno.', cost: 'free', range: 1, target: 'enemy', use: 'ki', tag: 'control',
  run: (b, u, t: Unit) => { if (!b.save(t, 'con', 8 + u.prof + u.mods.wis, '(Golpe Aturdidor)')) b.addStatus(t, { id: 'stunned', turns: 1, src: u.uid }); } });
def({ id: 'wholeness_of_body', name: 'Plenitud Corporal', desc: '1/día. Acción adicional: recuperás 3×nivel PG.', cost: 'bonus', range: 0, target: 'self', use: 'whole', tag: 'heal',
  run: (b, u) => { b.heal(u, u.level * 3, u); b.log(`${u.name} recupera la plenitud del cuerpo.`, 'heal'); } });
def({ id: 'quivering_palm', name: 'Palma Vibrante', desc: '1/día, gastás 3 ki. Un enemigo adyacente: salvación CON o recibe 10d10 necrótico (si salva, 10d10 reducido a la mitad).', cost: 'action', range: 1, target: 'enemy', use: 'palm', tag: 'attack',
  run: (b, u, t: Unit) => { const d = roll('10d10').total; const ok = b.save(t, 'con', 8 + u.prof + u.mods.wis, '(Palma Vibrante)'); b.damage(t, ok ? Math.floor(d / 2) : d, 'necrotic', u); u.res['ki'] = Math.max(0, (u.res['ki'] ?? 0) - 2); } });
void nearestAllies;
