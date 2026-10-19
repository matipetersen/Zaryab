import { chromium } from 'playwright-core';
const dir = process.argv[2] || '/tmp';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.addInitScript(() => { window.__fast = true; });
await page.goto('http://127.0.0.1:5173/'); await page.waitForTimeout(800);
await page.click('text=Nueva campaña'); await page.waitForTimeout(500);
await page.evaluate(() => { const a = window.__app; const c = { ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done', 'i:gusano:done', 'i:gusano:r0', 'i:gusano:r1', 'i:gusano:r2', 'i:gusano:of_jefe'] }; localStorage.setItem('zaryab.save.v3', JSON.stringify(c)); });
await page.reload(); await page.waitForTimeout(800); await page.click('text=Continuar'); await page.waitForTimeout(800);
await page.evaluate(() => { window.__p = window.__app.runBattle('gusano'); });
for (let i = 0; i < 40; i++) { await page.waitForTimeout(300); const b = await page.$$('.choice:not([disabled]), .overlay .btn'); if (await page.evaluate(() => !!window.__b)) break; const d = await page.$('.dlg, #dlg'); if (d) await d.click().catch(() => {}); await page.keyboard.press('Space'); }
await page.waitForTimeout(1500); await page.screenshot({ path: `${dir}/intel_battle.png` });
console.log(await page.evaluate(() => document.body.innerText.match(/Inteligencia[\s\S]{0,400}/)?.[0]));
console.log('errs', errs); await browser.close();
