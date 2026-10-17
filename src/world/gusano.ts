import type { Campaign } from '../state';
import { has } from '../state';
import type { Node } from '../story/types';

const N = (text: string): Node => ({ t: 'narr', text });
const S = (who: string, text: string, tone?: string): Node => ({ t: 'say', who, text, tone });

/** Fragmentos del meteorito que lleva el grupo (distintos). Cuantos más, más fuerte lo atrae. */
export function fragments(c: Campaign): number {
  const groups = [['fragmento_2'], ['fragmento_3'], ['frag_dahhak'], ['frag_marid', 'fragmento_marid'], ['frag_mazhar'], ['frag_gusano'], ['frag_razul', 'fragmento_razul']];
  return groups.filter(g => g.some(f => has(c, f))).length;
}
export const hunting = (c: Campaign) => has(c, 'cap3_done') && !has(c, 'cap13_done') && fragments(c) >= 1;
export const STAGES = ['Cría', 'Adulto', 'Colosal', 'Abismal'];
export const stage = (c: Campaign) => c.gusano.power >= 10 ? 3 : c.gusano.power >= 6 ? 2 : c.gusano.power >= 3 ? 1 : 0;
/** Días entre ataques: menos con más fragmentos y con más poder. */
export const interval = (c: Campaign) => Math.max(5, 16 - 2 * fragments(c) - Math.floor(c.gusano.power / 4));

/** Un día de caza: crece con el tiempo y avisa antes de atacar. */
export function gusanoDay(c: Campaign): string[] {
  const out: string[] = []; if (!hunting(c)) return out;
  if (!c.gusano.next) c.gusano.next = c.day + interval(c) + 3;
  if (!c.gusano.grown) c.gusano.grown = c.day;
  if (c.day - c.gusano.grown >= 14) { c.gusano.grown = c.day; c.gusano.power = Math.min(14, c.gusano.power + 1); }
  if (c.day === c.gusano.next - 2) out.push('La tierra tiembla bajo el barrio. Algo grande escarba, y cada vez escarba más cerca.');
  return out;
}
export const gusanoDue = (c: Campaign) => hunting(c) && c.gusano.next > 0 && c.day >= c.gusano.next;

const FIRST = [N('La primera vez no hizo ruido. Un temblor en la taza de té. Un perro que ladra a un suelo vacío. Luego la calle se abrió en un círculo perfecto y de la boca de la tierra salió una cabeza plana, ancha como una puerta, con ojos a los lados y sin ninguna cara.'), N('Los viejos del desierto lo llaman el Gusano de Cabeza de Martillo. Dicen que si le cortás un trozo, el trozo vive. Que si le cortás dos, hay dos. Que no se mata: se sobrevive a él. Y que va detrás de lo que brilla.')];
const BY_STAGE = [
  [N('La cabeza asoma, olisquea el aire, y gira hacia el cristal de su pecho como una brújula hacia el norte.')],
  [N('Ha crecido. Ya no es un gusano que acecha: es un animal que sabe que acecha. Los muros del Bajo se estremecen cuando respira.')],
  [N('Tres cabezas, ahora. Cada una con un ojo distinto de lo que ha devorado. En una, van a reconocer un trozo de rostro: lo que ha comido, lo guarda.')],
  [N('Ya no cabe en las calles. Se desliza bajo ellas y las arquea como una ola, y por donde pasa las casas se inclinan, saludando. Es más antiguo que la ciudad, y no está de buen humor.')],
];
/** El Gusano nunca muere: ustedes deciden cuánto le dan. */
export function gusanoScript(c: Campaign): Node[] {
  const st = stage(c), p = c.gusano.power, fr = fragments(c);
  const nodes: Node[] = [{ t: 'chapter', title: 'El que Escarba', sub: `Gusano de Cabeza de Martillo · ${STAGES[st]} · ${fr} fragmento${fr > 1 ? 's' : ''}`, bg: 'acueducto' }];
  if (c.gusano.seen === 0) nodes.push(...FIRST); nodes.push(...BY_STAGE[st]);
  nodes.push({ t: 'choice', prompt: 'El suelo vuelve a abrirse. ¿Qué hacen?', options: [
    { label: 'Huir por los túneles', hint: `Sigilo CD ${12 + p}. Si falla, los alcanza.`, check: { skill: 'sigilo', dc: 12 + p }, e: { flags: ['gusano_huida'] }, result: ['Se deslizan entre los muros mientras la cabeza se pasea sobre ustedes. Cuando se aleja, son los únicos que no olvidan respirar.'], fail: { e: { gusano: 1, devora: true }, result: ['Los oye. Los alcanza. Llevaba un instante, apenas, pero es el instante que necesitaba para comer.'] } },
    { label: 'Plantarle cara', hint: 'Combate: aguanten 5 rondas. No se le puede matar.', e: {}, result: ['Los cinco se giran a la vez. Es la primera vez que algo en Zaryab los mira como si valieran.'], then: [{ t: 'battle', enc: 'gusano_caza' }, { t: 'fx', e: { flags: ['gusano_resistido'] }, note: 'Resisten. El Gusano se hunde en la arena, herido: no muerto.' }] },
    { label: 'Dejar que coma', hint: 'Los deja en paz ~8 días. Devora algo y crece.', e: { gusano: 1, devora: true, sacia: 8 }, result: ['Le ofrecen lo que tienen. Come sin prisa, sin gratitud. Lo que desaparece no vuelve.'] },
  ] });
  nodes.push({ t: 'if', flag: 'gusano_resistido', then: [S('Zahir', 'No se mata, ustedes lo saben. Hace lo que hace cualquier cosa hambrienta: vuelve. Lo que pueden hacer es ser el obstáculo más caro que encuentre.', 'con un respeto inesperado')] });
  return nodes;
}

/** Cabezas en el combate: una más a partir de potencia 6 y otra desde 11. La regeneración y el poder las hacen incómodas, no imposibles. */
export const huntFoes = (power: number) => Array.from({ length: 1 + (power >= 6 ? 1 : 0) + (power >= 11 ? 1 : 0) }, (_, i) => ({ id: 'gusano_martillo', slot: i }));
