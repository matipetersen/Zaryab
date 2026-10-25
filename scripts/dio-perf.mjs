import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const vp of [{ width: 1280, height: 760 }, { width: 844, height: 390 }]) {
const ctx = await b.newContext({ viewport: vp, hasTouch: vp.width < 900, deviceScaleFactor: vp.width < 900 ? 2 : 1 }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.click('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done'] })); });
await p.reload(); await p.waitForTimeout(800); await p.click('text=Continuar'); await p.waitForTimeout(800);
await p.evaluate(() => { window.__p = window.__app.runBattle('recaudador'); });
for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy')) break; await p.keyboard.press('Space'); }
await p.evaluate(() => { window.__ui.coach?.close(true); });
await p.waitForTimeout(800);
const fps = () => p.evaluate(() => new Promise(res => { let n = 0, t0 = performance.now(); const f = t => { n++; if (t - t0 < 2500) requestAnimationFrame(f); else res(+(n * 1000 / (t - t0)).toFixed(1)); }; requestAnimationFrame(f); }));
console.log(vp.width, 'diorama fps', await fps(), 'pixel', await p.evaluate(() => window.__ui.r.pixel + ' ' + window.__ui.r.canvas.width + 'x' + window.__ui.r.canvas.height));
await p.screenshot({ path: `/tmp/dio_${vp.width}.png` });
await p.click('#rotbtns .dbtn:nth-child(2)'); await p.waitForTimeout(500);
console.log(vp.width, 'normal fps', await fps(), 'pixel', await p.evaluate(() => window.__ui.r.pixel));
await p.click('#rotbtns .dbtn:nth-child(2)'); await p.waitForTimeout(300);
console.log('errs', errs); await ctx.close();
}
await b.close();
