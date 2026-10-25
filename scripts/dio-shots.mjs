import { chromium } from 'playwright-core';
const encs = process.argv[2].split(',');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.click('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done', ...['al_mazhar','gusano','coloso','razul_final'].map(e => 'i:' + e + ':done')] })); });
for (const enc of encs) {
  await p.reload(); await p.waitForTimeout(700); await p.click('text=Continuar'); await p.waitForTimeout(500);
  await p.evaluate(e => { window.__ui = null; window.__p = window.__app.runBattle(e); }, enc);
  for (let i = 0; i < 70; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => window.__ui?.mode && (window.__ui.mode.k === 'deploy' || window.__ui.mode.k === 'idle' || window.__ui.mode.k === 'busy'))) break; await p.keyboard.press('Space'); }
  await p.evaluate(() => { window.__ui.coach?.close(true); window.__ui.deployDone?.(); });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `/tmp/ds_${enc}.png`, clip: { x: 232, y: 52, width: 760, height: 610 } });
}
console.log('errs', errs.slice(0, 5)); await b.close();
