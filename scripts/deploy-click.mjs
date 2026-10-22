import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.click('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done'] })); });
await p.reload(); await p.waitForTimeout(800); await p.click('text=Continuar'); await p.waitForTimeout(800);
await p.evaluate(() => { window.__p = window.__app.runBattle('marid'); });
for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy')) break; await p.keyboard.press('Space'); }
await p.waitForTimeout(500);
// cerrar la guía rápida
await p.evaluate(() => document.querySelectorAll('.coach button, [class*=coach] button').forEach(b => { if (/×|✕|x|Saltar|Cerrar/i.test(b.textContent)) b.click(); }));
const st = () => p.evaluate(() => { const u = window.__ui; return { sel: u.deploySel, pcs: u.b.units.filter(x => x.pcId).map(x => x.name.split(' ')[0] + '@' + x.x + ',' + x.y).join(' '), mode: u.mode.k }; });
console.log('inicio', JSON.stringify(await st()));
const scr = (x, y) => p.evaluate(([x, y]) => { const r = window.__ui.r, q = r.proj(x, y), rc = r.canvas.getBoundingClientRect(); return { x: rc.left + q.x, y: rc.top + q.y + 14 * r.scale() }; }, [x, y]);
const u0 = await p.evaluate(() => { const u = window.__ui.b.units.find(x => x.pcId); return { x: u.x, y: u.y }; });
let c = await scr(u0.x, u0.y); console.log('esperado', u0, 'tileFromMouse', JSON.stringify(await p.evaluate(([x,y]) => { const r = window.__ui.r, rc = r.canvas.getBoundingClientRect(); return r.tileFromMouse(x - rc.left, y - rc.top); }, [c.x, c.y])), 'click?', await p.evaluate(() => !!window.__ui.canvas)); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(300); console.log('tras elegir', JSON.stringify(await st()));
const tgt = await p.evaluate(() => window.__ui.deployTiles.find(t => !window.__ui.b.units.some(u => u.pcId && u.x === t.x && u.y === t.y)));
console.log('destino', JSON.stringify(tgt)); c = await scr(tgt.x, tgt.y); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(300); console.log('tras mover', JSON.stringify(await st()));
// intercambio: elegir a Pact y tocar a Rabb
const pos = n => p.evaluate(n => { const u = window.__ui.b.units.find(x => x.name.startsWith(n)); return { x: u.x, y: u.y }; }, n);
let a = await pos('Pact'), bb = await pos('Rabb'); c = await scr(a.x, a.y); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(200); c = await scr(bb.x, bb.y); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(300); console.log('swap', JSON.stringify(await st()));
await p.screenshot({ path: '/tmp/deploy_click.png' }); await b.close();
