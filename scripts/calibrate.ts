// Calibra la potencia de los enemigos de cada combate para que, a su nivel de diseño y sin ayudas, el bot gane ≈ 50 %.
// Uso: tsx scripts/calibrate.ts <encuentros separados por coma> <salida.json> [N]
import { writeFileSync } from 'node:fs';
import { DESIGN_LVL, CALIBRATED } from '../src/data/difficulty';
import { playBattle } from './sim';
const names = process.argv[2].split(','); const out = process.argv[3]; const N = +(process.argv[4] || 36);
const res: Record<string, number> = {}; const log: string[] = [];
const rate = async (enc: string, f: number) => { CALIBRATED[enc] = f; let w = 0; for (let i = 0; i < N; i++) if ((await playBattle(enc, 7000 + i)).result === 'victory') w++; return w / N; };
for (const enc of names) {
  const p0 = process.env.FRESH ? 0 : (CALIBRATED[enc] ?? 0); let lo = p0 ? Math.log(p0 / 3) : Math.log(0.1), hi = p0 ? Math.log(p0 * 3) : Math.log(3000), best = p0 || 1, bestD = 9;
  for (let it = 0; it < (p0 ? 6 : 10); it++) {
    const mid = (lo + hi) / 2, f = Math.exp(mid), p = await rate(enc, f);
    if (Math.abs(p - 0.5) < bestD) { bestD = Math.abs(p - 0.5); best = f; }
    if (p > 0.5) lo = mid; else hi = mid; // más potencia → menos victorias
    if (bestD <= 0.04) break;
  }
  res[enc] = +best.toFixed(3); const fin = await rate(enc, best); log.push(`${enc} (nv ${DESIGN_LVL[enc]}) ×${res[enc]} → ${Math.round(fin * 100)} %`);
  console.log(log[log.length - 1]); writeFileSync(out, JSON.stringify(res, null, 1));
}
