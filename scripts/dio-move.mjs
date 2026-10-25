import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.click('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done'] })); });
await p.reload(); await p.waitForTimeout(800); await p.click('text=Continuar'); await p.waitForTimeout(800);
await p.evaluate(() => { window.__p = window.__app.runBattle('recaudador'); });
for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy')) break; await p.keyboard.press('Space'); }
await p.evaluate(() => { window.__ui.coach?.close(true); window.__ui.deployDone(); });
for (let i = 0; i < 80; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => !!window.__ui.cur && window.__ui.mode.k === 'idle')) break; }
await p.evaluate(() => window.__ui.setMode({ k: 'move' })); await p.waitForTimeout(500);
await p.screenshot({ path: '/tmp/dio_move.png' });
const w = await p.evaluate(() => { const u = window.__ui.cur; return u.weapons.find(x => !x.bonusAction); }); await p.evaluate(() => { const u = window.__ui.cur; window.__ui.setMode({ k: 'weapon', w: u.weapons.find(x => !x.bonusAction) }); }); await p.waitForTimeout(400);
await p.screenshot({ path: '/tmp/dio_atk.png' });
await b.close();
