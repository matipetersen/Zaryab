import { CALIBRATED } from '../src/data/difficulty';
import { playBattle } from './sim';
for (const enc of process.argv[2].split(',')) { const out: string[] = []; for (const p of [1, 10, 100, 1000]) { CALIBRATED[enc] = p; let w = 0, r = 0, to = 0; for (let i = 0; i < 12; i++) { const x = await playBattle(enc, 7000 + i); if (x.result === 'victory') w++; if (x.result === 'timeout') to++; r += x.round; } out.push(`p${p}: ${Math.round(w / 12 * 100)}% r${(r / 12).toFixed(1)} to${to}`); } console.log(enc.padEnd(16), out.join(' | ')); }
