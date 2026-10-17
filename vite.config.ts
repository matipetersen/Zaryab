import { defineConfig } from 'vite';
// base relativa: la build funciona en cualquier carpeta (GitHub Pages, un hosting estático o un servidor local).
// Los retratos se incrustan (assetsInlineLimit) para que `npm run build:single` genere un solo archivo.
export default defineConfig({ base: './', build: { target: 'es2022', assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 900 } });
