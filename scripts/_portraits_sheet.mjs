import { chromium } from 'playwright-core';
import { writeFileSync } from 'fs';
const OUT = '/tmp/claude-0/-home-user-Zaryab/83133449-5700-5fbe-8f9a-69271bfa88c5/scratchpad/portraits/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto('http://127.0.0.1:5176/'); if (process.argv[3]) await p.evaluate(o => (window.__only = o.split(',')), process.argv[3]);
const scale = Number(process.argv[2] ?? 1);
const data = await p.evaluate(async (scale) => {
  const m = await import('/src/ui/pixPortraits.ts');
  const ids = (window.__only ?? m.PIX_IDS), E = m.EXPRS, S = 120 * scale, pad = 8, lab = 14;
  const c = document.createElement('canvas'); c.width = 110 + E.length * (S + pad); c.height = ids.length * (S + pad + lab) + 20;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#222'; x.fillRect(0, 0, c.width, c.height);
  x.font = '12px monospace'; x.fillStyle = '#ddd'; E.forEach((e, i) => x.fillText(e, 110 + i * (S + pad), 14));
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j], y = 20 + j * (S + pad + lab); x.fillStyle = '#ddd'; x.fillText(id, 4, y + S / 2);
    const have = m.exprsOf(id);
    for (let i = 0; i < E.length; i++) { if (!have.includes(E[i])) continue; const img = new Image(); img.src = m.pixPortraitUrl(id, E[i]); await img.decode(); x.drawImage(img, 110 + i * (S + pad), y, S, S); }
  }
  const tests = ['Zahir', 'Zahir (Caído)', 'Vizir Razul', 'Pact Risen', "Zyr'thar", 'Sifra (Ellie)', 'Capitana Samira', 'Samira', 'un minero con la lengua cortada', 'un acólito de las trece máscaras', 'Guardia', 'El Simurg', 'Inquisidor Kaelen', 'Nadir'].map(w => w + ' → ' + m.portraitIdFor(w));
  const tones = ['furioso', 'casi en un susurro', 'sin sonreír', 'derrumbado, sin dejar de sonreír', 'sin mirar a nadie', 'con una media sonrisa triste', 'sin dejar de secarse las manos', 'sorprendido', 'sin burla', 'cansado'].map(t => t + ' → ' + m.exprFor(t));
  return { png: c.toDataURL('image/png'), tests, tones };
}, scale);
writeFileSync(OUT + (process.argv[3] ? 'zoom.png' : 'sheet.png'), Buffer.from(data.png.split(',')[1], 'base64'));
console.log(data.tests.join('\n')); console.log(data.tones.join('\n'));
await b.close();
