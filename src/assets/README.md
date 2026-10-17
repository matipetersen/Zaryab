# Arte externo

Soltá archivos acá y el juego los usa en lugar de los dibujos procedurales (sin tocar código). Detalle y lista de encargo en `docs/ARTE.md` y `docs/ARTE_ENCARGO.md`.

- `portraits/<id>.jpg|png|webp` — retratos de diálogo (ids en `src/story/speakers.ts` y `src/data/party.ts`)
- `bg/<fondo>.jpg` — fondos de historia (`dunas`, `prison`, `coliseo`, `medinat`, `limbo`, `bajo`, `choza`, `zoco`, `taller`, `hammam`, `espejos`, `acueducto`, `cubo`, `plaza`, `oraculo`, `tormenta`)
- `sprites/<id>.png` — unidad en combate, pies centrados abajo; `<id>@4.png` = tira horizontal de 4 cuadros de animación
- `tiles/<tema>_<parte>.png` — texturas (`floor`, `diff`, `water`, `high`, `wall`, `cover`); temas: alley, aqueduct, mirror, plaza, crater, market, sanctum, ruins, mine, garden
