// Recorre toda la campaña automáticamente (diálogos + combates con IA) para detectar errores.
import { chromium } from 'playwright-core';
const dir = process.argv[2] || '/tmp'; const pick = process.argv[3] || '0';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.addInitScript(() => { window.__fast = true; });
await page.goto('http://127.0.0.1:5173/'); await page.waitForTimeout(800);
await page.click('text=Nueva campaña');
let battles = 0, shots = 0, lastText = '', stuck = 0, steps = 0;
for (let i = 0; i < 4000; i++) {
  steps++;
  const st = await page.evaluate(() => {
    const battle = !document.querySelector('#battle')?.classList.contains('hidden') && document.querySelector('#battle canvas');
    const overlay = document.querySelector('.overlay .btn');
    const choices = [...document.querySelectorAll('.choice:not([disabled])')].length;
    const puzzle = !!document.querySelector('.puzzle select');
    const txt = document.querySelector('.dialog .txt')?.textContent ?? '';
    const title = document.querySelector('.stage-title h1')?.textContent ?? '';
    return { battle: !!battle, overlay: !!overlay, choices, puzzle, txt, title };
  });
  if (st.title === 'Continuará…') { console.log('FIN DE LA CAMPAÑA v0.1'); await page.screenshot({ path: `${dir}/story_end.png` }); break; }
  if (st.overlay) { await page.click('.overlay .btn'); await page.waitForTimeout(300); continue; }
  if (st.battle) {
    // toma el control con IA para los PJ
    await page.evaluate(() => { const b = window.__b, ui = window.__ui; if (!b || b.__auto) return; b.__auto = true; for (const u of b.units) if (u.pcId) { u.ai = true; u.actions = u.weapons.filter(w => !w.bonusAction && w.id !== 'longbow_ss').map(w => ({ id: w.id, name: w.name, kind: w.ranged ? 'ranged' : 'melee', toHit: w.toHit, reach: w.range, dmg: w.dmg })); } ui.endTurn(); });
    battles++; if (shots < 3) { await page.waitForTimeout(1500); await page.screenshot({ path: `${dir}/story_battle${shots++}.png` }); }
    await page.waitForTimeout(800); continue;
  }
  if (st.puzzle) { await page.evaluate(() => { const ans = { romain: 'balanza', zyrthar: 'cuchilla', rabb: 'espejo', joren: 'senda', pact: 'fuego', panchi: 'eco' }; const sels = [...document.querySelectorAll('.puzzle select')]; const keys = Object.keys(ans); sels.forEach((s, i) => { s.value = ans[keys[0]] && Object.values(ans)[['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi'].indexOf(['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi'][i])]; s.dispatchEvent(new Event('change')); }); const order = ['romain', 'pact', 'rabb', 'joren', 'zyrthar', 'panchi']; sels.forEach((s, i) => { s.value = ans[order[i]]; }); }); if (pick === 'wrong') await page.evaluate(() => { const s = document.querySelectorAll('.puzzle select'); s[1].value = 'eco'; s[5].value = 'fuego'; }); await page.click('.puzzle .btn'); await page.waitForTimeout(400); continue; }
  if (st.choices) { const n = st.choices; const idx = pick === 'last' ? n - 1 : Math.min(+pick || 0, n - 1); const btn = (await page.$$('.choice:not([disabled])'))[idx]; await btn.click(); await page.waitForTimeout(150); continue; }
  if (st.txt === lastText) stuck++; else { stuck = 0; lastText = st.txt; }
  await page.keyboard.press(' '); await page.waitForTimeout(40);
  if (stuck > 200) { console.log('ATASCADO en:', st.txt.slice(0, 120)); await page.screenshot({ path: `${dir}/story_stuck.png` }); break; }
}
console.log('pasos', steps, 'combates', battles); console.log(errs.slice(0, 10).join('\n') || 'sin errores de consola');
await browser.close();
