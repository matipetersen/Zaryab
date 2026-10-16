// Prueba de humo del UI: juega un combate completo con clics reales sobre el canvas.
import { chromium } from 'playwright-core';
const enc = process.argv[2] || 'linyera'; const shotDir = process.argv[3] || '/tmp';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.goto(`http://127.0.0.1:5173/?battle=${enc}`); await page.waitForTimeout(1500);
const tilePos = (x, y) => page.evaluate(([x, y]) => { const ui = window.__ui; const c = ui.r.center(x, y, 0); const rc = ui.canvas.getBoundingClientRect(); return { x: rc.left + c.x, y: rc.top + c.y - 6 }; }, [x, y]);
let actions = 0, turns = 0;
for (let guard = 0; guard < 600; guard++) {
  const st = await page.evaluate(() => { const ui = window.__ui, b = window.__b; const u = ui.cur; return { over: b.over, result: b.result, round: b.round, cur: u ? { x: u.x, y: u.y, name: u.name, down: u.down } : null, mode: ui.mode.k }; });
  if (st.over) { console.log('FIN', st.result, 'ronda', st.round, 'acciones', actions); break; }
  if (!st.cur) { await page.waitForTimeout(250); continue; }
  if (st.mode === 'busy') { await page.waitForTimeout(150); continue; }
  turns++;
  // elegir enemigo más cercano
  const info = await page.evaluate(() => { const b = window.__b; const u = b.cur; const foes = b.foesOf(u).filter(f => !f.dead); foes.sort((a, c) => Math.max(Math.abs(a.x - u.x), Math.abs(a.y - u.y)) - Math.max(Math.abs(c.x - u.x), Math.abs(c.y - u.y))); const f = foes[0]; const w = u.weapons.find(w => !w.bonusAction && w.id !== 'longbow_ss'); return { f: f ? { x: f.x, y: f.y, name: f.name } : null, range: w ? (w.longRange ?? w.range) : 1, me: { x: u.x, y: u.y } }; });
  if (info.f) {
    const dist = Math.max(Math.abs(info.f.x - info.me.x), Math.abs(info.f.y - info.me.y));
    if (dist > info.range) {
      await page.keyboard.press('m'); await page.waitForTimeout(100);
      const tile = await page.evaluate(([fx, fy]) => { const ui = window.__ui, b = window.__b; const u = b.cur; let best = null, bd = 1e9; for (const v of b.reach(u).values()) { if (v.occ) continue; const d = Math.max(Math.abs(v.x - fx), Math.abs(v.y - fy)); if (d < bd) { bd = d; best = v; } } return best ? { x: best.x, y: best.y } : null; }, [info.f.x, info.f.y]);
      if (tile && (tile.x !== info.me.x || tile.y !== info.me.y)) { const p = await tilePos(tile.x, tile.y); await page.mouse.click(p.x, p.y); actions++; await page.waitForTimeout(900); }
    }
    const d2 = await page.evaluate(() => { const b = window.__b; const u = b.cur; const f = b.foesOf(u).filter(f => !f.dead).sort((a, c) => Math.max(Math.abs(a.x - u.x), Math.abs(a.y - u.y)) - Math.max(Math.abs(c.x - u.x), Math.abs(c.y - u.y)))[0]; return f ? { d: Math.max(Math.abs(f.x - u.x), Math.abs(f.y - u.y)), x: f.x, y: f.y } : null; });
    if (d2) {
      await page.keyboard.press('a'); await page.waitForTimeout(100);
      const items = await page.$$('.menu .mi:not([disabled])'); if (items.length) { await items[0].click(); await page.waitForTimeout(100); const p = await tilePos(d2.x, d2.y); await page.mouse.click(p.x, p.y); actions++; await page.waitForTimeout(1200); }
    }
  }
  if (turns === 3) await page.screenshot({ path: `${shotDir}/play_mid.png` });
  await page.keyboard.press('Escape'); await page.keyboard.press(' '); await page.waitForTimeout(400);
  // esperar a que terminen los turnos de IA
  for (let i = 0; i < 80; i++) { const s = await page.evaluate(() => ({ over: window.__b.over, ai: !!window.__b.cur?.ai, mode: window.__ui.mode.k })); if (s.over || (!s.ai && s.mode !== 'busy')) break; await page.waitForTimeout(250); }
}
await page.screenshot({ path: `${shotDir}/play_end.png` });
console.log(errs.join('\n') || 'sin errores de consola');
await browser.close();
