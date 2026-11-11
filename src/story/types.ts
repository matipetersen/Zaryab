import type { Effect } from '../state';
export type Skill = 'persuasion' | 'engano' | 'intimidar' | 'sigilo' | 'medicina' | 'percepcion' | 'arcanos' | 'religion' | 'atletismo';
/** Prueba de habilidad: el mejor de la compañía tira d20 + mod. Éxito → e/result/then; fallo → fail. */
export interface Check { skill: Skill; dc: number; pc?: string }
export interface Fail { e?: Effect; result?: string[]; then?: Node[] }
export interface Opt { label: string; hint?: string; /** Sólo si ese personaje sigue vivo. */ alive?: string; disabled?: string; e?: Effect; result?: string[]; then?: Node[]; if?: string; check?: Check; fail?: Fail }
/** Un paso de puesta en escena. `who` acepta el id de la compañía (romain…) o el nombre visible. */
export type Cue =
  | { shake: number } | { flash: string; ms?: number } | { fade: 'out' | 'in'; ms?: number } | { tint: string | null; ms?: number }
  | { fx: 'burst' | 'boom' | 'ring' | 'sparks' | 'wisps'; at: string; color?: string }
  | { walk: string; dx: number; dy: number } | { fall: string } | { rise: string } | { hop: string } | { hide: string }
  | { focus: string | null; zoom?: number } | { wait: number } | { music: string } | { sfx: string };
export type Node =
  | { t: 'chapter'; title: string; sub: string; bg?: string }
  | { t: 'bg'; id: string }
  | { t: 'stage'; map: string; foes?: string[] }
  /** mem: recuerda a un muerto a propósito (no se salta aunque lo nombre). */
  | { t: 'narr'; text: string; mem?: boolean }
  | { t: 'say'; who: string; text: string; tone?: string; mem?: boolean }
  | { t: 'choice'; prompt?: string; options: Opt[] }
  /** Puesta en escena: pasos que se ejecutan en orden (ver Cue). Sin mapa visible, los pasos de personajes se ignoran. */
  | { t: 'cue'; do: Cue[] }
  | { t: 'battle'; enc: string; foeCount?: number; title?: string; soft?: boolean }
  | { t: 'puzzle'; id: 'marks' }
  | { t: 'squad'; n: number; label?: string }
  | { t: 'fx'; e: Effect; note?: string }
  | { t: 'if'; flag: string; then: Node[]; else?: Node[] }
  | { t: 'end'; title: string; text: string };
