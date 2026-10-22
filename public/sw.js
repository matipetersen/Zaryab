// Service worker: guarda el juego para que funcione sin conexión. Al subir una versión nueva basta con cambiar VERSION.
const VERSION = 'zaryab-v1';
const base = new URL('./', self.location).href;
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL.map(p => new Request(new URL(p, base), { cache: 'reload' })));
    // los archivos con hash (JS, CSS, fuentes) salen del propio index.html
    const html = await (await cache.match(new URL('index.html', base))).text();
    const urls = [...html.matchAll(/(?:src|href)="(\.?\/?assets\/[^"]+)"/g)].map(m => new URL(m[1], base).href);
    await Promise.all(urls.map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('zaryab-') && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || !req.url.startsWith(base)) return;
  if (req.mode === 'navigate') { // la página: red primero (versión nueva), caché si no hay conexión
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(new URL('index.html', base), c)); return r; }).catch(async () => (await caches.match(new URL('index.html', base))) || Response.error()));
    return;
  }
  e.respondWith((async () => { // el resto: caché primero; lo que falte se baja y se guarda
    const hit = await caches.match(req); if (hit) return hit;
    try { const r = await fetch(req); if (r.ok) { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; } catch { return Response.error(); }
  })());
});
