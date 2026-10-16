import type { Effect } from '../state';
export interface Opt { label: string; hint?: string; disabled?: string; e?: Effect; result?: string[]; then?: Node[]; if?: string }
export type Node =
  | { t: 'chapter'; title: string; sub: string; bg?: string }
  | { t: 'bg'; id: string }
  | { t: 'narr'; text: string }
  | { t: 'say'; who: string; text: string; tone?: string }
  | { t: 'choice'; prompt?: string; options: Opt[] }
  | { t: 'battle'; enc: string; foeCount?: number; title?: string }
  | { t: 'puzzle'; id: 'marks' }
  | { t: 'fx'; e: Effect; note?: string }
  | { t: 'if'; flag: string; then: Node[]; else?: Node[] }
  | { t: 'end'; title: string; text: string };
