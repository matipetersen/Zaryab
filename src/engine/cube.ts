// Mecánica del Cubo de Maunator: rotaciones, medidor de alerta, objetos interactuables y objetivos.
import type { Battle } from './battle';
import type { Unit } from './types';
import { cheb } from './grid';
import { roll, rand } from './dice';
import { makeFoe } from '../data/monsters';
import { ROT_SEQ, CUBE_W, A0_TILES, ROOMS } from '../data/maunator';
import { skillMod } from '../world/checks';
import type { Skill } from '../story/types';

export const ALERT_LABEL = ['SILENCIO', 'SOSPECHA', 'ALARMA', 'EMERGENCIA'];
const PERIOD = [3, 2, 1, 1];
const S = 6;

export interface CubeState {
  alert: number; step: number; lastRot: number; knowsPattern: boolean; kethras: boolean; deadGuards: number; alarmRots: number;
  layout: number[]; compuerta: number; compuertaOpen: boolean; pudding: boolean; idle: Record<number, number>; goal: string[]; log: string[];
}
export const cubeOf = (b: Battle) => b.cube!;

/** Preparación inicial según las banderas de la historia (mz_*). */
export function cubeInit(b: Battle, flags: string[]) {
  const has = (f: string) => flags.includes(f);
  b.cube = { alert: 0, step: 0, lastRot: 1, knowsPattern: false, kethras: false, deadGuards: 0, alarmRots: 0, layout: ROOMS.map((_, i) => i), compuerta: 0, compuertaOpen: false, pudding: false, idle: {}, goal: ['calavera1', 'calavera2', 'calavera3'], log: [] };
  b.storyFlags = new Set(flags);
  if (has('mz_sabe_cubo')) b.cube.knowsPattern = true;
  if (has('mz_llave_maestra')) setTimeout(() => raiseAlert(b, 2, 'La llave maestra dispara la alarma'), 0);
}

export function raiseAlert(b: Battle, to: number, why: string) {
  const c = b.cube!; if (to <= c.alert) return; const was = c.alert; c.alert = Math.min(3, to);
  b.log(`⚠ ${why}. Alerta del Cubo: ${ALERT_LABEL[was]} → ${ALERT_LABEL[c.alert]}.`, 'sys'); b.emit({ t: 'fx', kind: 'burst', x: 11, y: 11 });
  if (c.alert >= 2) { for (const u of b.units) if (!u.dead && u.traits.includes('wakeAlarm')) b.flags['w' + u.uid] = 1; for (const u of b.units) if (u.id === 'grethak' && u.traits.includes('inert')) leave(b, u, 'Grethak abandona el mapa buscando la salida.'); }
  if (c.alert >= 2 && !c.kethras) spawnKethras(b);
}
function leave(b: Battle, u: Unit, msg: string) { b.log(msg, 'sys'); u.dead = true; u.fled = true; u.hp = 0; b.emit({ t: 'death', uid: u.uid }); }
function roomCenter(b: Battle, roomIdx: number) { const c = cubeOf(b); const pos = c.layout.indexOf(roomIdx); const ox = (pos % 4) * S, oy = Math.floor(pos / 4) * S; return { x: ox + 2, y: oy + 2 }; }
function spawnKethras(b: Battle) {
  const c = cubeOf(b); c.kethras = true; const d2 = ROOMS.findIndex(r => r.id === 'D2'); const p = b.freeNear(roomCenter(b, d2)); if (!p) return;
  const k = makeFoe('kethras', p.x, p.y); const sc = b.scaleFoe; if (sc) sc(k); b.reinforce(k, p); b.log('Kethras baja en persona: el Cubo responde a su voz.', 'sys');
}
export function onGuardDeath(b: Battle, u: Unit) {
  const c = b.cube; if (!c || !u.traits.includes('guard')) return; c.deadGuards++;
  if (c.deadGuards === 1) raiseAlert(b, 1, 'Un guardia caído'); else if (c.deadGuards >= 2) raiseAlert(b, 2, 'Dos guardias caídos');
}

// ───── rotaciones ─────
function pcDistanceScore(b: Battle) { const pcs = b.units.filter(u => u.pcId && !u.dead && !u.down); let s = 0; for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) s += cheb(pcs[i], pcs[j]); return s; }
export function rotate(b: Battle, kind: 'fila' | 'col', idx: number, dir: 1 | -1, label: string) {
  const g = b.grid; const c = cubeOf(b); const W = CUBE_W;
  if (kind === 'fila') {
    for (let y = idx * S; y < idx * S + S; y++) { const old = g.tiles[y].slice(); for (let x = 0; x < W; x++) g.tiles[y][(x + dir * S + W) % W] = old[x]; }
    for (const u of b.units) if (u.y >= idx * S && u.y < idx * S + S) { u.x = (u.x + dir * S + W) % W; b.emit({ t: 'snap', uid: u.uid, x: u.x, y: u.y }); }
    const row = c.layout.slice(idx * 4, idx * 4 + 4); const nr = row.map((_, i) => row[(i - dir + 4) % 4]); for (let i = 0; i < 4; i++) c.layout[idx * 4 + i] = nr[i];
  } else {
    for (let x = idx * S; x < idx * S + S; x++) { const old = g.tiles.map(r => r[x]); for (let y = 0; y < W; y++) g.tiles[(y + dir * S + W) % W][x] = old[y]; }
    for (const u of b.units) if (u.x >= idx * S && u.x < idx * S + S) { u.y = (u.y + dir * S + W) % W; b.emit({ t: 'snap', uid: u.uid, x: u.x, y: u.y }); }
    const col = [0, 1, 2, 3].map(r => c.layout[r * 4 + idx]); const nc = col.map((_, i) => col[(i - dir + 4) % 4]); for (let r = 0; r < 4; r++) c.layout[r * 4 + idx] = nc[r];
  }
  for (const [x, y] of A0_TILES) g.setTile(x, y, '~');
  b.log(`El suelo vibra seis segundos… ${label}.`, 'sys'); b.emit({ t: 'fx', kind: 'burst', x: 11, y: 11 });
  if (c.alert >= 2) { c.alarmRots++; if (c.alarmRots >= 20 && !c.compuertaOpen) openCompuerta(b); }
}
function kethrasPick(b: Battle) {
  let best = { k: 'fila' as 'fila' | 'col', i: 0, d: 1 as 1 | -1, score: -1, label: '' };
  for (const r of ROT_SEQ) { const snap = JSON.stringify(b.units.map(u => [u.x, u.y])); void snap; const pcs = b.units.filter(u => u.pcId && !u.dead && !u.down); let s = 0; for (const p of pcs) { const inLine = r.k === 'fila' ? Math.floor(p.y / S) === r.i : Math.floor(p.x / S) === r.i; s += inLine ? 1 : 0; } if (s > best.score) best = { ...r, score: s }; }
  void pcDistanceScore; return best;
}
export function cubeRound(b: Battle, round: number) {
  const c = b.cube; if (!c) return;
  // inacción: si ninguna unidad aliada cambió de sala en dos rondas el Cubo se adelanta
  const period = PERIOD[c.alert];
  const due = round - c.lastRot >= period;
  if (c.knowsPattern && !due && round - c.lastRot === period - 1) { const next = ROT_SEQ[c.step % ROT_SEQ.length]; b.log(`Próxima rotación en 1 ronda: ${next.label}.`, 'sys'); }
  if (!due) return;
  c.lastRot = round; const extra = c.alert >= 3 ? 2 : 1;
  for (let n = 0; n < extra; n++) {
    const r = c.alert >= 2 && c.kethras && n === 0 ? kethrasPick(b) : ROT_SEQ[c.step % ROT_SEQ.length]; if (!(c.alert >= 2 && c.kethras && n === 0)) c.step++;
    rotate(b, r.k, r.i, r.d, r.label ?? `${r.k} ${r.i + 1}`);
  }
}
export function openCompuerta(b: Battle) {
  const c = cubeOf(b); if (c.compuertaOpen) return; c.compuertaOpen = true; c.pudding = true;
  const d2 = ROOMS.findIndex(r => r.id === 'D2'); const p = b.freeNear(roomCenter(b, d2)); if (!p) return;
  const pu = makeFoe('black_pudding', p.x, p.y); const sc = b.scaleFoe; if (sc) sc(pu); b.reinforce(pu, p); b.log('La compuerta de D2 cede: el Pudin Negro entra al Cubo.', 'sys');
}

// ───── interacción con objetos ─────
export function skillRoll(u: Unit, skill: Skill, dc: number) { const mod = u.pcId ? skillMod(u.pcId, skill) : 0; const d = roll('1d20').total; return { ok: d + mod >= dc, d, mod }; }
export interface ObjDef { label: string; hint: string; skill?: Skill; dc?: number; choices?: { id: string; label: string }[]; once?: boolean; run: (b: Battle, u: Unit, tile: { x: number; y: number }, choice?: string) => string }
const carry = (b: Battle, id: string) => { b.carry[id] = true; };
const unitById = (b: Battle, id: string) => b.units.find(x => x.id === id && !x.dead);
export const OBJECTS: Record<string, ObjDef> = {
  grethak_hablar: { label: 'Hablar con Grethak', hint: 'Persuasión CD 16: aliarse.', once: true, skill: 'persuasion', dc: 16, run: (b, u) => { const g = unitById(b, 'grethak'); if (!g) return 'Grethak ya no está.'; const r = skillRoll(u, 'persuasion', 16); if (!r.ok) return `✗ Grethak aparta la mirada (${r.d}+${r.mod}). «No sé quién sois.»`; g.traits = g.traits.filter(t => t !== 'inert'); g.side = 'pc'; g.ai = true; b.storyFlagsOut.add('grethak_aliado'); return 'Grethak se une al grupo: «Yo no sabía lo que había abajo. O me dije que no lo sabía.»'; } },
  registro: { label: 'Registro de guardias', hint: 'Una nota sobre medallones.', once: true, run: b => { b.storyFlagsOut.add('orden_conocido'); b.storyFlags.add('mz_orden_conocido'); return 'Una nota: «el orden de la memoria: altar, carne, mente». Dos entradas tachadas: «compuerta sur» y «retirado del proyecto».'; } },
  tablero: { label: 'Tablero de guardia', hint: 'Mapa del muelle bajo Medinat.', once: true, run: b => { b.storyFlagsOut.add('mapa_muelle'); return 'Un mapa de los Muelles Bajos de Medinat al-Rih con la ruta de la barcaza.'; } },
  glifo: { label: 'Glifo invisible', hint: 'Se activa al pisarlo.', once: true, run: (b, u) => { raiseAlert(b, 1, `Un glifo invisible se enciende bajo ${u.name}`); for (const z of b.units) if (z.id === 'zombi_elite' && !z.dead) b.flags['w' + z.uid] = 1; const d = b.freeNear(u); if (d) { const z = makeFoe('zombi_elite', d.x, d.y); if (b.scaleFoe) b.scaleFoe(z); b.reinforce(z, d); } return 'Los no-muertos del glifo despiertan.'; } },
  calavera1: { label: 'Altar del Silencio', hint: 'Calavera 1 sobre el altar.', once: true, run: b => { carry(b, 'calavera1'); return 'Tomas la primera calavera. Las velas negras se apagan una a una.'; } },
  calavera2: { label: 'Bajo el golem', hint: 'Calavera 2.', once: true, run: b => { carry(b, 'calavera2'); const g = unitById(b, 'golem_carne'); if (g) { b.flags['w' + g.uid] = 1; b.log('El golem de carne vuelve la cabeza hacia vosotros.', 'sys'); } return 'Tomas la segunda calavera de debajo de la bota del golem.'; } },
  calavera3: { label: 'El sujeto', hint: 'Calavera 3 cosida en su torso.', once: true, choices: [{ id: 'extraer', label: 'Extraer la calavera (lo mata)' }, { id: 'vivo', label: 'Llevarlo vivo (se transformará)' }], run: (b, u, _t, ch) => {
    const s = unitById(b, 'sujeto_c1');
    if (ch === 'vivo') { carry(b, 'calavera3'); b.storyFlagsOut.add('sujeto_vivo'); if (s) { s.traits = s.traits.filter(t => t !== 'inert'); s.side = 'pc'; s.ai = true; } return 'Cargáis con el sujeto. En algún punto del túnel dejará de ser él.'; }
    carry(b, 'calavera3'); b.storyFlagsOut.add('sujeto_muerto'); if (s) { s.hp = 0; s.dead = true; b.emit({ t: 'death', uid: s.uid }); } return 'Extraes la calavera. El sujeto susurra algo y se queda quieto.'; } },
  espejo: { label: 'Espejo del Silencio', hint: 'Reflejo correcto 3 s; luego, el miedo.', run: (b, u) => { const ok = b.save(u, 'wis', 16, '(Espejo)'); if (!ok) { b.addStatus(u, { id: 'frightened', turns: 3 }); return 'El espejo muestra tu mayor miedo.'; } return 'Resistes la mirada del espejo.'; } },
  tabla: { label: 'Tabla de nombres', hint: 'Uno tachado: la pista del Pudin.', once: true, run: b => { b.storyFlagsOut.add('pista_pudin'); return 'Una tabla de nombres con uno tachado. Debajo: «compuerta sur».'; } },
  tomo: { label: 'El Inventario', hint: 'Sección blanca, 3.ª estantería. Investigación CD 15 y un turno.', skill: 'arcanos', dc: 15, once: true, run: (b, u) => { const r = skillRoll(u, 'arcanos', 15); if (!r.ok) return `✗ No dais con el tomo (${r.d}+${r.mod}).`; carry(b, 'tomo'); const g = unitById(b, 'guardian_runico'); if (g) { b.flags['w' + g.uid] = 1; b.log('Al retirar el objeto de la mesa, el Guardián Rúnico se mueve en silencio.', 'sys'); } return 'Sacas el Inventario de Maunator. Lomo sin título, vitela de altísima calidad.'; } },
  cuadernos: { label: 'Cuadernos de Kethras', hint: 'Revelan el plan.', once: true, run: b => { b.storyFlagsOut.add('plan_completo'); b.cube!.knowsPattern = true; return 'El plan completo: la herencia de Cyric, el Sudario Silente y el Quasi-Deva. El patrón de rotación aparece en los márgenes.'; } },
  diario: { label: 'Diario señuelo', hint: 'Demasiado limpio.', once: true, run: b => { b.storyFlagsOut.add('diario_senuelo'); carry(b, 'diario'); return 'Notas legibles, más fáciles que el tomo. Algo sospechoso en la contratapa.'; } },
  jaula: { label: 'Jaula de plata', hint: 'Seraphel habla primero.', once: true, run: b => { const s = unitById(b, 'seraphel'); if (s) { s.traits = s.traits.filter(t => t !== 'inert'); s.side = 'pc'; s.ai = true; } b.storyFlagsOut.add('seraphel_libre'); return 'Seraphel sale de la jaula y se une al grupo: cura y conoce D4 y la barcaza.'; } },
  pociones: { label: 'Pociones', hint: 'Marcadas por Kethras.', once: true, run: b => { b.storyFlagsOut.add('pociones_cubo'); b.inv['pocion'] = (b.inv['pocion'] ?? 0) + 3; return 'Tres pociones rojas. Algo respira dentro del cristal.'; } },
  esclavos: { label: 'Compuerta de esclavos', hint: 'Decisión moral.', once: true, choices: [{ id: 'liberar', label: 'Liberarlos' }, { id: 'dejar', label: 'Dejarlos' }], run: (b, _u, _t, ch) => { if (ch === 'liberar') { b.storyFlagsOut.add('esclavos_libres'); raiseAlert(b, 1, 'Los esclavos huyen y alguien los oye'); return 'Liberáis a los esclavos. Podréis contar con algunos en la defensa de D4.'; } b.storyFlagsOut.add('esclavos_dejados'); return 'Los dejáis. Los grilletes tintinean un rato.'; } },
  medallon4: { label: 'Medallón sin marca', hint: 'Caja sin marca.', once: true, run: b => { carry(b, 'medallon4'); b.storyFlagsOut.add('medallon4'); return 'Un medallón de emergencia de Kethras. Vibra en sincronía con algo.'; } },
  compuerta: { label: 'Compuerta sur', hint: 'Dos turnos quitando cuñas.', run: (b) => { const c = cubeOf(b); c.compuerta++; if (c.compuerta >= 2) { openCompuerta(b); return 'La compuerta cede. El Pudin entra.'; } return 'Quitas la primera cuña. Un olor químico y dulce sube por la rendija.'; } },
  sello_helm: { label: 'Sello de Helm', hint: 'Medallón gris con el ojo de Helm.', once: true, run: b => { carry(b, 'sello'); b.storyFlagsOut.add('sello_helm'); return 'Tomas el Sello de Helm: las ilusiones parpadean a tu alrededor.'; } },
  nota_d3: { label: 'Nota del experimento', hint: 'Religión CD 12: polvo plateado de Tyr.', once: true, run: (b, u) => { const r = skillRoll(u, 'religion', 12); b.storyFlagsOut.add('experimento_ok'); return r.ok ? 'Polvo plateado con el símbolo de Tyr: el experimento funciona.' : 'Una nota en Común: «El Quasi-Deva funciona.»'; } },
  salida: { label: 'Puerta a los túneles', hint: 'Requiere las tres calaveras.', run: b => { const c = cubeOf(b); const need = c.goal; const have = need.every(n => b.carry[n]); if (!have) return `La puerta no responde: faltan calaveras (${need.filter(n => !b.carry[n]).length}).`; b.win('Las tres calaveras encajan en las cuencas.'); return 'Las cuencas se llenan: la puerta empieza a abrirse.'; } },
};
export function stepTrap(b: Battle, u: Unit) {
  const t = b.grid.at(u.x, u.y); if (!t?.obj || !b.cube) return; const o = OBJECTS[t.obj]; if (!o) return;
  if (t.obj === 'glifo' && !b.storyFlags.has('mz_anillo')) { b.log(o.run(b, u, u), 'sys'); t.obj = undefined; return; }
  if (t.obj === 'glifo') { b.log(`${u.name} pisa un glifo que el anillo ocultaba.`, 'sys'); b.log(o.run(b, u, u), 'sys'); t.obj = undefined; return; }
  if (t.obj === 'espejo' && !b.flags['esp' + u.uid]) { b.flags['esp' + u.uid] = 1; b.log(o.run(b, u, u), 'sys'); }
}
void rand;
