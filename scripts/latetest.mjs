// Recorre los Actos II–III (desde el capítulo indicado hasta el final) con combates resueltos al instante,
// para encontrar escenas que se traban, errores de consola y ramas rotas. Uso:
//   node scripts/latetest.mjs <dir> <elección: 0|last|rand> [capítulo inicial=7] [minutos=20] [semilla=1]
import { chromium } from 'playwright-core';
const dir = process.argv[2] || '.'; const pick = process.argv[3] || '0'; const from = +(process.argv[4] || 7); const maxMin = +(process.argv[5] || 20); let seed = +(process.argv[6] || 1);
const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.addInitScript(() => { window.__fast = true; window.__autolevel = true; });
await page.goto('http://127.0.0.1:5173/'); await page.waitForTimeout(800);
await page.click('text=Nueva campaña'); await page.waitForTimeout(400);
// partida avanzada: capítulos anteriores hechos, nivel acorde, sin guion en curso
await page.evaluate(from => {
  const a = window.__app, c = a.camp; const lv = { 4: 4, 5: 5, 6: 6, 7: 7, 8: 7, 9: 8, 10: 9, 11: 10, 12: 12, 13: 13 }[from] ?? 7;
  const flags = []; for (let i = 0; i < from; i++) flags.push(`cap${i}_done`);
  flags.push('postura_pueblo', 'conoce_ellie', 'torneo_digno');
  const quests = {}; for (let i = 1; i < from; i++) quests[`m_cap${i}`] = 'done';
  const sv = { ...c, run: null, lvl: lv, xp: [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000][lv], day: 10 + from * 6, lastMainDay: 10 + from * 6, eclipseDay: 10 + from * 6 + 120, gold: 400, pf: 12, flags: [...c.flags, ...flags], quests: { ...c.quests, ...quests } };
  localStorage.setItem('zaryab.save.v3', JSON.stringify(sv));
}, from);
await page.reload(); await page.waitForTimeout(800); await page.click('text=Continuar'); await page.waitForTimeout(600);
const seen = new Set(), titles = []; let lastText = '', stuck = 0, steps = 0, ends = 0; const t0 = Date.now(); const battles = [];
for (let i = 0; i < 20000; i++) {
  steps++;
  if (Date.now() - t0 > maxMin * 60000) { console.log('TIEMPO agotado'); break; }
  const st = await page.evaluate(() => {
    const vis = id => { const el = document.querySelector(id); return el && !el.classList.contains('hidden'); };
    const overlay = document.querySelector('.overlay .btn');
    return { battle: vis('#battle') && !!document.querySelector('#battle canvas'), hub: !!document.querySelector('#hub') && !document.querySelector('#hub').classList.contains('hidden'), overlay: !!overlay && !document.querySelector('#hub .overlay'),
      choices: document.querySelectorAll('.choice:not([disabled])').length, puzzle: !!document.querySelector('.puzzle select'), squad: !!document.querySelector('.puzzle .box > .btn') && !document.querySelector('.puzzle select'),
      txt: document.querySelector('.dialog .txt')?.textContent ?? '', title: document.querySelector('.stage-title h1')?.textContent ?? '',
      endBtn: [...document.querySelectorAll('button')].some(b => b.textContent === 'Volver al mapa de Zaryab'), done: Object.keys(window.__app.camp.quests).filter(k => window.__app.camp.quests[k] === 'done') };
  });
  if (st.title && !titles.includes(st.title)) titles.push(st.title);
  if (st.done.includes('m_cap13') && st.hub) { console.log('FIN: Cap. XIII hecho'); break; }
  if (st.overlay) { await page.click('.overlay .btn').catch(() => {}); await page.waitForTimeout(150); continue; }
  if (st.endBtn) { ends++; await page.screenshot({ path: `${dir}/late_end_${pick}.png` }); await page.click('text=Volver al mapa de Zaryab').catch(() => {}); await page.waitForTimeout(300); continue; }
  if (st.battle) {
    const k = await page.evaluate(() => { const b = window.__b, ui = window.__ui; if (!b || b.__auto) return null; b.__auto = true; if (ui.mode?.k === 'deploy') ui.deployDone?.(); for (const k of ['tomo', 'calavera1', 'calavera2', 'calavera3']) if (b.carry) b.carry[k] = true; b.win('test'); ui.endTurn(); return ui.mapId; });
    if (k) battles.push(k); await page.waitForTimeout(300); continue;
  }
  if (st.squad) { await page.click('.puzzle .box > .btn').catch(() => {}); await page.waitForTimeout(150); continue; }
  if (st.puzzle) { await page.evaluate(() => { const A = ['balanza', 'fuego', 'espejo', 'senda', 'cuchilla', 'eco']; [...document.querySelectorAll('.puzzle select')].forEach((s, i) => { s.value = A[i] ?? s.value; }); }); await page.click('.puzzle .btn').catch(() => {}); await page.waitForTimeout(200); continue; }
  if (st.choices) { const n = st.choices; const idx = pick === 'last' ? n - 1 : pick === 'rand' ? Math.floor(rnd() * n) : Math.min(+pick || 0, n - 1); const btn = (await page.$$('.choice:not([disabled])'))[idx]; if (btn) await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(80); continue; }
  if (st.hub) {
    const q = await page.evaluate(() => { const app = window.__app, Q = window.__quests, hub = app.hub; const av = Q.filter(q => q.kind === 'main' && hub.questStatus(q) === 'available'); return av[0]?.id ?? null; });
    if (q) { seen.add(q); await page.evaluate(id => window.__app.hub.pick({ t: 'quest', id }), q); await page.waitForTimeout(150); continue; }
    await page.evaluate(() => window.__app.hub.pick({ t: 'rest' })); await page.waitForTimeout(100); continue;
  }
  if (st.txt === lastText) stuck++; else { stuck = 0; lastText = st.txt; }
  await page.keyboard.press(' '); await page.waitForTimeout(25);
  if (stuck > 300) { console.log('ATASCADO en:', st.txt.slice(0, 160)); await page.screenshot({ path: `${dir}/late_stuck_${pick}.png` }); break; }
}
const fin = await page.evaluate(() => { const c = window.__app.camp; return { day: c.day, lvl: c.lvl, c: c.c, d: c.d, done: Object.keys(c.quests).filter(k => c.quests[k] === 'done'), dead: c.dead, flags: c.flags.length, finales: c.flags.filter(f => f.startsWith('final_')) }; });
console.log(`elección=${pick} pasos=${steps} capítulos=${[...seen].join(',')} combates=${battles.length} finales vistos=${ends}`);
console.log('títulos:', titles.join(' | '));
console.log(JSON.stringify(fin));
console.log(errs.slice(0, 15).join('\n') || 'sin errores de consola');
await page.screenshot({ path: `${dir}/late_final_${pick}.png` });
await browser.close();
