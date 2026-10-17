import { PARTY, makePC } from '../src/data/party';
import { TRACKS } from '../src/data/progression';
for (const L of [3, 5, 10, 15]) {
  console.log('── nivel', L);
  for (const d of PARTY) {
    const t = TRACKS[d.id]; const picks: string[] = [];
    for (let l = 4; l <= L; l++) { if (t.asi.includes(l)) picks.push(`asi:${l}:${l % 8 === 4 ? 'con' : 'wis'}+2`); const tier = t.tiers.find(x => x.level === l); if (tier) picks.push(`tier:${l}:${tier.options[l % 2 ? 0 : 1].id}`); }
    const u = makePC(d, undefined, [], { level: L, picks });
    const bad = Object.entries({ hp: u.maxHp, ac: u.ac, prof: u.prof, dc: u.spellDC, spd: u.speed }).filter(([, v]) => !Number.isFinite(v));
    console.log(d.id.padEnd(8), `PG ${u.maxHp} CA ${u.ac} comp +${u.prof} CD ${u.spellDC} vel ${u.speed} ataques ${1 + (u.extraAtk ?? 0)} arma ${u.weapons[0].toHit}/${u.weapons[0].dmg.map(x => x.dice).join('+')}`, 'slots', Object.entries(u.res).filter(([k]) => k.startsWith('slot')).map(([k, v]) => k.slice(4) + ':' + v).join(','), 'hab', u.abilities.length, bad.length ? 'NaN!' + JSON.stringify(bad) : '');
  }
}
