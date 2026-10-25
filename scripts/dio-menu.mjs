import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(1500); await p.screenshot({ path: '/tmp/dm_menu.png' });
await p.click('text=Nueva campaña'); await p.waitForTimeout(7600); await p.screenshot({ path: '/tmp/dm_intro.png' });
await p.waitForTimeout(9000); await p.keyboard.press('Space'); await p.waitForTimeout(2500); await p.screenshot({ path: '/tmp/dm_story.png' });
console.log(errs); await b.close();
