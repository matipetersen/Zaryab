import { chromium } from 'playwright-core';
const encs = (process.argv[2] || 'gusano').split(',');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.click('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done'] })); });
await p.reload(); await p.waitForTimeout(800); await p.click('text=Continuar'); await p.waitForTimeout(800);
for (const enc of encs) {
  await p.evaluate(e => { window.__b = null; window.__p = window.__app.runBattle(e); }, enc);
  for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy')) break; const d = await p.$('.dlg, #dlg'); if (d) await d.click().catch(() => {}); await p.keyboard.press('Space'); }
  await p.waitForTimeout(800);
  console.log(enc, await p.evaluate(() => { const u = window.__ui; return JSON.stringify({ mode: u.mode.k, tiles: u.deployTiles.map(t => t.x + ',' + t.y).join(' '), n: u.deployTiles.length, spawns: u.b.grid.spawns.pc.length }); }));
  await p.screenshot({ path: `/tmp/deploy_${enc}.png` });
  await p.evaluate(() => window.__ui.deployDone()); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__ui.b.over = true; });
  await p.reload(); await p.waitForTimeout(800); await p.click('text=Continuar'); await p.waitForTimeout(600);
}
console.log('errs', errs); await b.close();
