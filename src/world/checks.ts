import type { Campaign } from '../state';
import type { Check, Skill } from '../story/types';
import { PARTY_BY_ID } from '../data/party';
import type { Mods } from '../engine/types';

export const SKILL_LABEL: Record<Skill, string> = { persuasion: 'Persuasión', engano: 'Engaño', intimidar: 'Intimidar', sigilo: 'Sigilo', medicina: 'Medicina', percepcion: 'Percepción', arcanos: 'Arcanos', religion: 'Religión', atletismo: 'Atletismo' };
const AB: Record<Skill, keyof Mods> = { persuasion: 'cha', engano: 'cha', intimidar: 'cha', sigilo: 'dex', medicina: 'wis', percepcion: 'wis', arcanos: 'int', religion: 'int', atletismo: 'str' };
/** Competencias por personaje (las de Zyr'thar y Panchi son estimadas, como sus fichas). */
const PROF: Record<string, Skill[]> = {
  romain: ['medicina', 'religion', 'persuasion'], pact: ['persuasion', 'intimidar', 'atletismo', 'percepcion'], rabb: ['engano', 'intimidar', 'arcanos'],
  joren: ['percepcion', 'sigilo', 'atletismo'], zyrthar: ['sigilo', 'engano', 'percepcion'], panchi: ['medicina', 'religion', 'atletismo'],
};
export const skillMod = (pc: string, sk: Skill) => PARTY_BY_ID[pc].mods[AB[sk]] + (PROF[pc]?.includes(sk) ? 2 : 0);
function best(c: Campaign, ck: Check) {
  const alive = c.party.filter(p => !c.dead.includes(p)); const team = c.squad?.length ? alive.filter(p => c.squad.includes(p)) : alive;
  const pool = ck.pc && team.includes(ck.pc) ? [ck.pc] : team;
  return pool.map(pc => ({ pc, mod: skillMod(pc, ck.skill) })).sort((a, b) => b.mod - a.mod)[0];
}
export const bestFor = (c: Campaign, ck: Check) => { const b = best(c, ck); return `${PARTY_BY_ID[b.pc].name} ${b.mod >= 0 ? '+' : ''}${b.mod}`; };
export function rollCheck(c: Campaign, ck: Check, rnd = Math.random) {
  const b = best(c, ck); const d20 = 1 + Math.floor(rnd() * 20); return { pc: b.pc, mod: b.mod, d20, total: d20 + b.mod };
}
