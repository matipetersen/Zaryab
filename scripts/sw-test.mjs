import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await b.newContext(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:8099/'); await p.waitForFunction(() => navigator.serviceWorker.ready.then(() => true)); await p.waitForTimeout(2000);
console.log('cached', await p.evaluate(async () => (await (await caches.open('zaryab-v1')).keys()).map(r => r.url.split('/').pop()).join(', ')));
await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1500);
console.log('offline title:', await p.title(), '| menú:', await p.evaluate(() => document.body.innerText.slice(0, 60).replace(/\n/g, ' ')), errs);
await b.close();
