import type { Effect } from '../state';
export type Skill = 'persuasion' | 'engano' | 'intimidar' | 'sigilo' | 'medicina' | 'percepcion' | 'arcanos' | 'religion' | 'atletismo';
/** Prueba de habilidad: el mejor de la compañía tira d20 + mod. Éxito → e/result/then; fallo → fail. */
export interface Check { skill: Skill; dc: number; pc?: string }
export interface Fail { e?: Effect; result?: string[]; then?: Node[] }
export interface Opt { label: string; hint?: string; disabled?: string; e?: Effect; result?: string[]; then?: Node[]; if?: string; check?: Check; fail?: Fail }
export type Node =
  | { t: 'chapter'; title: string; sub: string; bg?: string }
  | { t: 'bg'; id: string }
  | { t: 'narr'; text: string }
  | { t: 'say'; who: string; text: string; tone?: string }
  | { t: 'choice'; prompt?: string; options: Opt[] }
  | { t: 'battle'; enc: string; foeCount?: number; title?: string; soft?: boolean }
  | { t: 'puzzle'; id: 'marks' }
  | { t: 'fx'; e: Effect; note?: string }
  | { t: 'if'; flag: string; then: Node[]; else?: Node[] }
  | { t: 'end'; title: string; text: string };
