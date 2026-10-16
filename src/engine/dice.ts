// Dados con RNG sembrable (para tests/simulaciones deterministas).
let seed = (Date.now() ^ 0x9e3779b9) >>> 0;
export function setSeed(s: number) { seed = s >>> 0; }
export function rand(): number {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const d = (n: number) => 1 + Math.floor(rand() * n);
export const d20 = () => d(20);

export interface Roll { total: number; rolls: number[]; text: string }

/** "2d6+3", "1d8", "4", "1d10-1". Crítico duplica los dados (no el modificador), como en 5e. */
export function roll(expr: string, crit = false): Roll {
  const m = expr.replace(/\s/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) { const n = parseInt(expr, 10) || 0; return { total: n, rolls: [], text: String(n) }; }
  const n = parseInt(m[1], 10) * (crit ? 2 : 1), s = parseInt(m[2], 10), bonus = m[3] ? parseInt(m[3], 10) : 0;
  const rolls: number[] = [];
  for (let i = 0; i < n; i++) rolls.push(d(s));
  const total = rolls.reduce((a, b) => a + b, 0) + bonus;
  return { total: Math.max(0, total), rolls, text: `${n}d${s}[${rolls.join(',')}]${bonus ? (bonus > 0 ? '+' : '') + bonus : ''}` };
}
export function avg(expr: string): number {
  const m = expr.replace(/\s/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return parseInt(expr, 10) || 0;
  return parseInt(m[1], 10) * (parseInt(m[2], 10) + 1) / 2 + (m[3] ? parseInt(m[3], 10) : 0);
}
/** Suma `bonus` plano a una expresión de dados. */
export function addFlat(expr: string, bonus: number): string {
  const m = expr.replace(/\s/g, '').match(/^(\d+d\d+)([+-]\d+)?$/);
  if (!m) return String((parseInt(expr, 10) || 0) + bonus);
  const b = (m[2] ? parseInt(m[2], 10) : 0) + bonus;
  return m[1] + (b ? (b > 0 ? '+' : '') + b : '');
}
export const pick = <T,>(a: T[]): T => a[Math.floor(rand() * a.length)];
