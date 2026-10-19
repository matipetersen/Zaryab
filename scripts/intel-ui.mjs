import { chromium } from 'playwright-core';
const dir = process.argv[2] || '/tmp';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.addInitScript(() => { window.__fast = true; });
await page.goto('http://127.0.0.1:5173/'); await page.waitForTimeout(800);
await page.click('text=Nueva campaña'); await page.waitForTimeout(500);
await page.evaluate(() => { const a = window.__app; const c = { ...a.camp, run: null, lvl: 8, main: 5, flags: [...a.camp.flags, 'cap0_done'] }; localStorage.setItem('zaryab.save.v3', JSON.stringify(c)); });
await page.reload(); await page.waitForTimeout(800); await page.click('text=Continuar'); await page.waitForTimeout(800);
await page.evaluate(() => { window.__p = window.__app.intelPhase('gusano'); });
const log = []; let shots = 0;
for (let i = 0; i < 80; i++) { if (i===2) await page.screenshot({ path: `${dir}/intel_dbg.png` });
  await page.waitForTimeout(250);
  const st = await page.evaluate(() => ({ choices: [...document.querySelectorAll('.choice:not([disabled])')].map(e => e.innerText.replace(/\n/g, ' | ')), txt: document.querySelector('.dlg, #dlg')?.innerText?.slice(0, 160) }));
  if (st.choices.length) { log.push('CHOICES: ' + st.choices.join(' // ')); if (shots < 3) await page.screenshot({ path: `${dir}/intel${shots++}.png` }); const pick = log.length % 3; const btns = await page.$$('.choice:not([disabled])'); await btns[Math.min(pick, btns.length - 1)].click(); continue; }
  const done = await page.evaluate(async () => { let r = false; await Promise.race([window.__p.then(() => { r = true; }), new Promise(x => setTimeout(x, 10))]); return r; });
  if (done) break;
  const adv = await page.$('.dlg, #dlg'); if (adv) await adv.click().catch(() => {}); await page.keyboard.press('Space');
}
console.log(log.join('\n')); console.log('flags', await page.evaluate(() => window.__app.camp.flags.filter(f => f.startsWith('i:')))); console.log('errs', errs);
await browser.close();
