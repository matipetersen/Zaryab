// Prepara dist/zaryab.artifact.html: el juego como fragmento para publicar (sin <html>/<head>/<body>), título corto y modo pantalla completa.
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(new URL('../dist/zaryab.html', import.meta.url), 'utf8');
const css = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const js = src.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const fonts = src.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)?.[0] ?? '';
const extra = `:root{color-scheme:dark}html,body{height:100%;margin:0;overflow:hidden;background:#0a0714}#app{height:100%}`;
const out = `<title>Zaryab Piedra Viva</title>\n${fonts}\n<style>${css}\n${extra}</style>\n<div id="app"></div>\n<script type="module">${js}</script>\n`;
writeFileSync(new URL('../dist/zaryab.artifact.html', import.meta.url), out);
console.log('dist/zaryab.artifact.html', (out.length / 1024).toFixed(0), 'kB');
