import { chromium } from 'playwright-core';
const enc = process.argv[2] || 'dahhak_final';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.click('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done', 'i:al_mazhar:done', 'i:gusano:done', 'i:coloso:done', 'i:razul_final:done'] })); localStorage.setItem('zaryab.tut', '1'); });
await p.reload(); await p.waitForTimeout(800); await p.click('text=Continuar'); await p.waitForTimeout(800);
await p.evaluate(e => { window.__p = window.__app.runBattle(e); }, enc);
for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy' || (window.__ui?.cur && window.__ui.mode.k === 'idle'))) break; await p.keyboard.press('Space'); }
await p.evaluate(() => { window.__ui.coach?.close(true); window.__ui.deployDone?.(); });
await p.waitForTimeout(1500);
for (let r = 0; r < 4; r++) {
  await p.screenshot({ path: `/tmp/rot_${enc}_${r}.png` });
  await p.evaluate(() => window.__ui.r.rotate(1)); await p.waitForTimeout(80); await p.screenshot({ path: `/tmp/rot_${enc}_${r}_mid.png` }); await p.waitForTimeout(700);
}
console.log('errs', errs); await b.close();
