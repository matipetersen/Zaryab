import type { Encounter } from './maps';
import { levelScale } from './progression';
import CAL from './difficulty.cal.json';

/** Nivel de diseño de cada combate: con un grupo de ese nivel, sin ayudas y con el bot de pruebas, se gana ≈ 50 %. */
export const DESIGN_LVL: Record<string, number> = {
  noche: 1, linyera: 2,
  acueducto: 3, lago: 3, espejo: 3, zyr: 3, joren: 3, romain: 3, panchi: 3, patrulla: 3, ninos: 3, infiltrado: 3, ghul_vendedor: 3, recaudador: 3,
  cubo: 4, te: 4, pact: 4, caravana: 4, motin: 4, jann_zoco: 4, gusano_martillo: 4,
  coloso: 5, asalto: 5,
  revuelta_orden: 6, revuelta_pueblo: 6, revuelta_sombra: 6, tigre: 7, cementerio: 7, dahhak_final: 7,
  varreth: 8, d4_defensa: 8, marid: 9, al_mazhar: 10, gusano: 11, huida_mina: 11, razul_final: 13, eclipse: 14,
};
/** Combates que no se miden por victoria (duelo perdido, objetivos, huida): no se calibran. */
export const NO_CAL = new Set(['gusano_caza', 'torneo', 'cubo_maunator', 'tuneles_a', 'tuneles_b', 'kethras_quemarropa']);
export const CALIBRATED = CAL as Record<string, number>;

/** «Potencia» calibrada p (1 = sin cambio): PG ×p^0,6 (con tope total HP_RATIO), ataque +1,2·ln p y daño +1,5·ln p. */
const ENV = (globalThis as any).process?.env ?? {};
// la vida total enemiga tiene tope (HP_RATIO, en setup.ts): pasado ese punto la calibración sube ataque y daño
const PHP = +(ENV.PHP ?? 0.6), PHPCAP = +(ENV.PHPCAP ?? 99), PATK = +(ENV.PATK ?? 1.2), PDMG = +(ENV.PDMG ?? 1.5);
export const powerScale = (p: number) => ({ hp: Math.min(PHPCAP, Math.pow(p, PHP)), atk: Math.round(PATK * Math.log(p)), dmg: Math.trunc(PDMG * Math.log(p)) });
/** Escala de los enemigos: calibrada para ≈ 50 % al nivel de diseño; `edge` (ventajas de campaña) los debilita. */
export function foeScaleFor(encId: string, enc: Encounter, level: number, edge = 0): { hp: number; atk: number; dmg: number } | undefined {
  const d = DESIGN_LVL[encId];
  let base: { hp: number; atk: number; dmg: number } | undefined;
  if (d != null) { const s = levelScale(enc.scale, d); const q = powerScale(CALIBRATED[encId] ?? 1); base = { hp: s.hp * q.hp, atk: s.atk + q.atk, dmg: s.dmg + q.dmg }; }
  else if (enc.scale || level !== 3) base = levelScale(enc.scale, level);
  if (!base) return edge ? { hp: 1 / (1 + EDGE_HP * edge), atk: -Math.floor(edge / 20), dmg: 0 } : undefined;
  return { hp: base.hp / (1 + EDGE_HP * edge), atk: base.atk - Math.floor(edge / 20), dmg: base.dmg };
}
export const EDGE_HP = 0.013;
/** Vida total enemiga máxima respecto de la de la compañía (al nivel de diseño ≈ combates de 4–7 rondas). */
export const HP_RATIO = +(ENV.HPRATIO ?? 1.3);
/** Probabilidad estimada de victoria (logística centrada en el 50 % base). `delta` = niveles sobre el nivel de diseño. */
export const K_EDGE = 0.07;
export const winChance = (edge: number, delta = 0) => Math.round(100 / (1 + Math.exp(-K_EDGE * (edge + 4 * delta))));
