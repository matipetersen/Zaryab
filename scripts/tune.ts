import { ENCOUNTERS } from '../src/data/maps';
import { playBattle } from './sim';
const N = 50;
const names = process.argv[2] ? process.argv[2].split(',') : Object.keys(ENCOUNTERS).filter(e => e !== 'coloso');
const scales: [number, number][] = process.argv[3] ? process.argv[3].split(';').map(x => x.split(',').map(Number) as [number, number]) : [[1, 0], [1.3, 1], [1.6, 1], [1.6, 2], [2, 2]];
console.log('encuentro      escala(hp,atk)   victorias caídos muertes rondas PG%');
for (const enc of names) {
  for (const [hp, atk] of scales) {
    ENCOUNTERS[enc].scale = { hp, atk };
    let w = 0, downs = 0, dead = 0, rounds = 0, hpL = 0;
    for (let i = 0; i < N; i++) { const r = await playBattle(enc, 9000 + i); if (r.result === 'victory') w++; downs += r.downs; dead += r.dead; rounds += r.round; hpL += r.hpLeft; }
    console.log(enc.padEnd(14), `×${hp} +${atk}`.padEnd(10), `${String(Math.round(w / N * 100)).padStart(6)}%`, (downs / N).toFixed(2).padStart(7), (dead / N).toFixed(2).padStart(7), (rounds / N).toFixed(1).padStart(6), `${Math.round(hpL / N * 100)}%`.padStart(5));
  }
}
