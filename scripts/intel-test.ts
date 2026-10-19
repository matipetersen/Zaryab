import { buildBattle } from '../src/engine/setup';
import { ENCOUNTERS } from '../src/data/maps';
import { newCampaign } from '../src/state';
import { INTEL, intelScript, applyIntel } from '../src/story/intel';
for (const enc of Object.keys(INTEL)) {
  const e = ENCOUNTERS[enc]; const party = ['romain','pact','rabb','joren','zyrthar','panchi'];
  const mk = (flags: string[]) => { const c = newCampaign(); c.flags = flags.map(f => `i:${enc}:${f}`); const b = buildBattle(enc, party, { foes: e.foes, level: 6, prog: {} as any } as any); const boss = b.units.filter(u => u.side==='foe').sort((a,z)=>z.maxHp-a.maxHp)[0]; const hp0 = boss.maxHp; const lines = applyIntel(b, c, enc); return { lines, traps: b.traps.map(t=>`${t.kind}@${t.x},${t.y}${t.hidden?'?':''}`).join(' '), hp: `${hp0}->${boss.maxHp}`, sur: b.units.filter(u=>u.surprised).length }; };
  console.log(enc, 'nodes', intelScript(enc).length);
  console.log(' none ', JSON.stringify(mk([])));
  console.log(' done ', JSON.stringify(mk(['done'])));
  console.log(' full ', JSON.stringify(mk(['done','r0','r1','r2','r3','of_jefe','of_ref','sp_debil'])));
  console.log(' bad  ', JSON.stringify(mk(['done','x0','x1','x2','sp_emb'])));
}
