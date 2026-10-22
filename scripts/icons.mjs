import { chromium } from 'playwright-core'; import fs from 'fs';
const svg = fs.readFileSync('public/icon.svg', 'utf8');
// versión «maskable»: sin esquinas redondeadas y con el dibujo dentro de la zona segura (80 %)
const mask = svg.replace(' rx="96"', '').replace(/<path/, '<g transform="translate(256 256) scale(1.12) translate(-256 -256)"><path').replace('</text>', '</text></g>');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await b.newPage();
for (const [name, src, size] of [['icon-192.png', svg, 192], ['icon-512.png', svg, 512], ['icon-maskable-512.png', mask, 512], ['apple-touch-icon.png', mask, 180]]) {
  await pg.setViewportSize({ width: size, height: size });
  await pg.setContent(`<body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(src).toString('base64')}" width="${size}" height="${size}" style="display:block">`);
  await pg.screenshot({ path: 'public/' + name, omitBackground: true });
}
await b.close();
