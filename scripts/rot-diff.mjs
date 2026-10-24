import { chromium } from 'playwright-core';
const enc = process.argv[2] || 'al_mazhar';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(800);
await p.click('text=Nueva campaña'); await p.waitForTimeout(500);
await p.evaluate(() => { const a = window.__app; localStorage.setItem('zaryab.save.v3', JSON.stringify({ ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done', 'i:al_mazhar:done', 'i:gusano:done', 'i:coloso:done', 'i:razul_final:done'] })); });
await p.reload(); await p.waitForTimeout(800); await p.click('text=Continuar'); await p.waitForTimeout(800);
await p.evaluate(e => { window.__p = window.__app.runBattle(e); }, enc);
for (let i = 0; i < 60; i++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.__ui?.mode?.k === 'deploy' || (window.__ui?.cur && window.__ui.mode.k === 'idle'))) break; await p.keyboard.press('Space'); }
await p.evaluate(() => { window.__ui.coach?.close(true); window.__ui.deployDone?.(); });
await p.waitForTimeout(1000);
for (let r = 0; r < 4; r++) {
  const d = await p.evaluate(() => { const R = window.__ui.r; R.running = false; R.time = 0; R.weather.draw = () => {}; R.lighting.draw = () => {}; R.dust = []; R.parts = []; R.floats = [];
    const grab = () => { R.draw(); return R.ctx.getImageData(0, 0, R.canvas.width, R.canvas.height).data; };
    const a = grab(); R.gcache = undefined; const save = R.drawGround; R.drawGround = function (s) { this.drawGroundLive(s); }; const bb = grab(); R.drawGround = save;
    let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - bb[i]) + Math.abs(a[i + 1] - bb[i + 1]) + Math.abs(a[i + 2] - bb[i + 2]) > 30) n++; R.running = true; return n; });
  console.log('rot', r, 'pixeles distintos cache vs vivo:', d);
  await p.evaluate(() => { const R = window.__ui.r; R.rot = (R.rot + 1) % 4; });
}
await b.close();
