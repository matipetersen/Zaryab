// Recorre la campaña completa (diálogos + mapa + misiones + oráculo + combates con IA) para detectar errores.
import { chromium } from 'playwright-core';
const dir = process.argv[2] || '/tmp'; const pick = process.argv[3] || '0'; const maxMin = +(process.argv[4] || 0);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.addInitScript(() => { window.__fast = true; });
await page.goto('http://127.0.0.1:5173/'); await page.waitForTimeout(800);
await page.click('text=Nueva campaña');
let battles = new Set(), shots = 0, lastText = '', stuck = 0, steps = 0, hubSteps = 0, oracles = 0, doneQuests = [], endSeen = false;
const t0 = Date.now();
for (let i = 0; i < 12000; i++) {
  steps++;
  const st = await page.evaluate(() => {
    const vis = id => { const el = document.querySelector(id); return el && !el.classList.contains('hidden'); };
    const overlay = document.querySelector('.overlay .btn');
    return { battle: vis('#battle') && !!document.querySelector('#battle canvas'), hub: !!document.querySelector('#hub') && !document.querySelector('#hub').classList.contains('hidden'), overlay: !!overlay && !document.querySelector('#hub .overlay'),
      choices: document.querySelectorAll('.choice:not([disabled])').length, puzzle: !!document.querySelector('.puzzle select'), txt: document.querySelector('.dialog .txt')?.textContent ?? '', title: document.querySelector('.stage-title h1')?.textContent ?? '',
      endBtn: [...document.querySelectorAll('button')].some(b => b.textContent === 'Volver al mapa de Zaryab') };
  });
  if (st.overlay) { await page.click('.overlay .btn'); await page.waitForTimeout(250); continue; }
  if (st.endBtn) { endSeen = true; await page.screenshot({ path: `${dir}/story_end.png` }); await page.click('text=Volver al mapa de Zaryab'); await page.waitForTimeout(300); continue; }
  if (st.battle) {
    const key = await page.evaluate(() => { const b = window.__b, ui = window.__ui; if (!b || b.__auto) return null; b.__auto = true; for (const u of b.units) if (u.pcId) { u.ai = true; u.actions = u.weapons.filter(w => !w.bonusAction && w.id !== 'longbow_ss').map(w => ({ id: w.id, name: w.name, kind: w.ranged ? 'ranged' : 'melee', toHit: w.toHit, reach: w.range, dmg: w.dmg })); } ui.endTurn(); return b.grid.w + 'x' + b.grid.h + ':' + b.units.length; });
    if (key) { battles.add(key + '@' + i); if (shots < 4) { await page.waitForTimeout(1200); await page.screenshot({ path: `${dir}/story_battle${shots++}.png` }); } }
    await page.waitForTimeout(600); continue;
  }
  if (st.puzzle) { await page.evaluate((wrong) => { const ans = ['balanza', 'espejo', 'senda', 'fuego', 'cuchilla', 'eco']; const sels = [...document.querySelectorAll('.puzzle select')]; const order = ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi']; const A = { romain: 'balanza', zyrthar: 'cuchilla', rabb: 'espejo', joren: 'senda', pact: 'fuego', panchi: 'eco' }; sels.forEach((s, i) => { s.value = A[order[i]]; }); if (wrong) { sels[1].value = 'eco'; sels[5].value = 'fuego'; } }, pick === 'wrong'); await page.click('.puzzle .btn'); await page.waitForTimeout(300); continue; }
  if (st.choices) { const n = st.choices; const idx = pick === 'last' ? n - 1 : Math.min(+pick || 0, n - 1); const btn = (await page.$$('.choice:not([disabled])'))[idx]; await btn.click(); await page.waitForTimeout(120); continue; }
  if (st.hub) {
    hubSteps++;
    const act = await page.evaluate(() => { const app = window.__app, Q = window.__quests, hub = app.hub, c = app.camp; const av = Q.filter(q => hub.questStatus(q) === 'available'); const order = { main: 0, personal: 1, side: 2, faction: 3 }; av.sort((a, b) => order[a.kind] - order[b.kind]);
      return { q: av[0]?.id ?? null, day: c.day, alert: c.alert, done: Object.keys(c.quests), cap4: c.flags.includes('cap4_done') }; });
    if (act.q) { doneQuests = act.done; await page.evaluate(id => window.__app.hub.pick({ t: 'quest', id }), act.q); await page.waitForTimeout(200); continue; }
    if (act.cap4 && oracles >= 8) break;
    if (oracles < 8 || !act.cap4) { oracles++; const zones = ['bajo', 'zoco', 'plaza', 'pozo', 'acueductos', 'santuario', 'jardin']; await page.evaluate(z => window.__app.hub.pick({ t: 'oracle', district: z }), zones[oracles % zones.length]); await page.waitForTimeout(200); continue; }
    await page.evaluate(() => window.__app.hub.pick({ t: 'rest' })); continue;
  }
  if (st.txt === lastText) stuck++; else { stuck = 0; lastText = st.txt; }
  await page.keyboard.press(' '); await page.waitForTimeout(30);
  if (stuck > 250) { console.log('ATASCADO en:', st.txt.slice(0, 140)); await page.screenshot({ path: `${dir}/story_stuck.png` }); break; }
  if (maxMin && Date.now() - t0 > maxMin * 60000) break;
}
const fin = await page.evaluate(() => { const c = window.__app.camp; return { day: c.day, alert: c.alert, c: c.c, d: c.d, pf: c.pf, quests: c.quests, followers: c.followers, buildings: c.buildings, oracle: c.oracleSeen.length, battles: c.battlesWon }; });
console.log('pasos', steps, 'hub', hubSteps, 'oráculos', oracles, 'combates distintos', battles.size, 'final-v0.2', endSeen);
console.log(JSON.stringify(fin));
console.log(errs.slice(0, 10).join('\n') || 'sin errores de consola');
await page.screenshot({ path: `${dir}/story_final.png` });
await browser.close();
