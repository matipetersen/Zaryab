// Convierte dist/ en un único HTML autocontenido (dist/zaryab.html): JS y CSS inline, sin archivos sueltos.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const dist = new URL('../dist/', import.meta.url);
let html = readFileSync(new URL('index.html', dist), 'utf8');
const safe = s => s.replace(/<\/(script|style)/gi, '<\\/$1');
html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+\.css)"[^>]*>/g, (_, f) => `<style>${safe(readFileSync(new URL('assets/' + f, dist), 'utf8'))}</style>`);
html = html.replace(/<script type="module"[^>]*src="\.\/assets\/([^"]+\.js)"[^>]*><\/script>/g, (_, f) => `<script type="module">${safe(readFileSync(new URL('assets/' + f, dist), 'utf8'))}</script>`);
html = html.replace(/<link rel="(manifest|apple-touch-icon|icon)"[^>]*>\n?\s*/g, '');
writeFileSync(new URL('zaryab.html', dist), html);
console.log('dist/zaryab.html', (html.length / 1024).toFixed(0), 'kB', readdirSync(dist).join(' '));
