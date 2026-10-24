import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.tap('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done'] })); });
await p.reload(); await p.waitForTimeout(800); await p.tap('text=Continuar'); await p.waitForTimeout(800);
await p.evaluate(() => { window.__p = window.__app.runBattle('cementerio'); });
for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy')) break; await p.tap('body', { position: { x: 400, y: 200 }, force: true }).catch(() => {}); }
await p.evaluate(() => { window.__ui.coach.close(true); window.__ui.deployDone(); });
for (let i = 0; i < 80; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => !!window.__ui.cur && window.__ui.mode.k === 'idle')) break; }
const scr = (x, y) => p.evaluate(([x, y]) => { const r = window.__ui.r, q = r.center(x, y), rc = r.canvas.getBoundingClientRect(); return { x: rc.left + q.x, y: rc.top + q.y - 14 }; }, [x, y]);
const info = () => p.evaluate(() => { const u = window.__ui, c = u.cur; const foe = u.b.units.filter(x => x.side === 'foe' && !x.dead).map(f => f.name + ' ' + f.hp + '/' + f.maxHp + '@' + f.x + ',' + f.y).slice(0, 3); return JSON.stringify({ cur: c?.name, at: c && c.x + ',' + c.y, mode: u.mode.k, sheet: u.sheetEl?.innerText.replace(/\n/g, ' | '), foe }); });
console.log('inicio', await info());
await p.evaluate(() => { const u = window.__ui, c = u.cur; const f = u.b.units.find(x => x.side === 'foe' && !x.dead); window.__tgt = f.uid; u.b.foesOf(c).forEach(x => { x.seen = true; }); u.b.seen && [...Array(u.b.grid.h).keys()].forEach(y => [...Array(u.b.grid.w).keys()].forEach(x => u.b.seen.add(x + ',' + y))); u.r.fogActive = false; });
const foe = await p.evaluate(() => { const u = window.__ui, c = u.cur; return u.b.units.filter(x => x.side === 'foe' && !x.dead && u.seen(x) && Math.hypot(x.x - c.x, x.y - c.y) < 9).sort((a, z) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(z.x - c.x, z.y - c.y))[0] ?? null; });
console.log('foe cercano', foe && foe.name); if (foe) { const c0 = await scr(foe.x, foe.y); console.log('elemento en el punto', JSON.stringify(c0), await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.tagName + '#' + e.id + '.' + e.className); }, [c0.x, c0.y])); await p.screenshot({ path: '/tmp/touch_before.png' }); }
await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown', 'click', 'touchstart']) window.__ui.canvas.addEventListener(t, e => window.__ev.push(t + ':' + (e.pointerType ?? ''))); });
if (foe) { let c = await scr(foe.x, foe.y); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(400); console.log('tras tocar enemigo', await info(), await p.evaluate(() => JSON.stringify({ touch: window.__ui.isTouch, hover: window.__ui.r.hover, sel: window.__ui.selUid })), JSON.stringify(c), await p.evaluate(() => window.__ev.join(','))); await p.screenshot({ path: '/tmp/touch_attack.png' }); await p.tap('.sheet .go'); await p.waitForTimeout(3500); console.log('tras confirmar', await info(), await p.evaluate(() => [...document.querySelectorAll('#log div')].slice(-5).map(d => d.innerText).join(' // '))); }
// mover
const tile = await p.evaluate(() => { const u = window.__ui, c = u.cur; if (!c || u.mode.k !== 'idle') return null; for (const v of u.b.reach(c).values()) if (!v.occ && v.cost >= 2) return { x: v.x, y: v.y }; return null; });
if (tile) { const c = await scr(tile.x, tile.y); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(400); console.log('mover sheet', await info()); await p.screenshot({ path: '/tmp/touch_move.png' }); await p.tap('.sheet .go'); await p.waitForTimeout(2500); console.log('tras mover', await info()); }
console.log('errs', errs); await b.close();
