# Jugar desde el teléfono

## Controles táctiles
- **Historia y mapa:** tocar para continuar y elegir.
- **Combate:** tocar *Mover/Atacar/Habilidades*, tocar una casilla para ver la previsualización y tocarla otra vez para confirmar. Un dedo arrastra el tablero; dos dedos hacen zoom. Los botones 👥 y 📖 abren la lista de unidades y la información de la unidad.
- **Mapa del mundo:** el mapa queda arriba y el panel del distrito abajo; la barra inferior se desliza lateralmente. En horizontal se vuelve a poner en dos columnas.

## Opciones para tenerlo en el teléfono
1. **Enlace publicado** (artefacto de claude.ai): se abre desde el navegador del teléfono. La partida se guarda en el navegador de ese dispositivo.
2. **Archivo único:** `npm run build:single` genera `dist/zaryab.html` (800 kB, sin dependencias salvo las fuentes de Google). Se puede alojar en cualquier lugar o abrir directamente.
3. **GitHub Pages:** el flujo `.github/workflows/pages.yml` compila y publica `dist/` en cada push. Hay que activar Pages (Origen: «GitHub Actions») en la configuración del repositorio.
4. **Instalarlo como app:** en un alojamiento propio (opciones 2 o 3) el navegador ofrece «Añadir a la pantalla de inicio»; hay manifiesto e icono.

## Sin probar
No se ha probado en un teléfono real, solo en Chromium con pantalla táctil emulada (390×844). La partida guardada no pasa de un dispositivo a otro.
