import { chromium } from 'playwright-core';
const [,, url, out, ...steps] = process.argv;
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: process.env.CHROME || exe, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.goto(url); await page.waitForTimeout(1200);
for (const s of steps) { const [k, v] = s.split('='); if (k === 'wait') await page.waitForTimeout(+v); else if (k === 'click') await page.click(v); else if (k === 'key') await page.keyboard.press(v); else if (k === 'eval') await page.evaluate(v); else if (k === 'shot') await page.screenshot({ path: v }); }
await page.screenshot({ path: out });
console.log(errs.join('\n') || 'sin errores de consola');
await browser.close();
