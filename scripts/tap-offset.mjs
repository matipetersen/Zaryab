import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const vp of [{ width: 844, height: 390 }, { width: 390, height: 844 }]) {
const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }); const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.tap('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done'] })); });
await p.reload(); await p.waitForTimeout(800); await p.tap('text=Continuar'); await p.waitForTimeout(800);
await p.evaluate(() => { window.__p = window.__app.runBattle('marid'); });
for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy')) break; await p.keyboard.press('Space'); }
await p.evaluate(() => { window.__ui.coach?.close(true); window.__ui.deployDone(); });
for (let i = 0; i < 80; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => !!window.__ui.cur && window.__ui.mode.k === 'idle')) break; }
await p.waitForTimeout(600);
let bad = 0, n = 0;
for (const [x, y] of [[3, 3], [10, 7], [15, 10], [6, 12], [18, 2]]) {
  const c = await p.evaluate(([x, y]) => { const r = window.__ui.r, q = r.center(x, y), rc = r.canvas.getBoundingClientRect(); return { x: rc.left + q.x * rc.width / r.W, y: rc.top + q.y * rc.height / r.H, el: (() => { const e = document.elementFromPoint(rc.left + q.x * rc.width / r.W, rc.top + q.y * rc.height / r.H); return e?.id; })() }; }, [x, y]);
  if (c.el !== 'board') continue; n++;
  await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(250);
  const h = await p.evaluate(() => window.__ui.r.hover); if (!h || h.x !== x || h.y !== y) { bad++; console.log('  esperaba', x, y, 'obtuve', h); }
  await p.evaluate(() => window.__ui.closeSheet());
}
console.log(vp.width + 'x' + vp.height, 'toques probados', n, 'desfasados', bad, await p.evaluate(() => { const r = window.__ui.r, rc = r.canvas.getBoundingClientRect(); return `lienzo ${rc.width}x${rc.height} / renderer ${r.W}x${r.H}`; }));
await ctx.close(); }
await b.close();
