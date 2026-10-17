# Arte: cómo reemplazar los dibujos procedurales

Hoy todo (sprites, baldosas, fondos, la mayoría de los retratos) se dibuja por código. El juego **detecta archivos de arte por nombre** y los usa en lugar del dibujo; si falta un archivo, usa el procedural. No hay que tocar código ni registrar nada: se sueltan los archivos y se recompila (`npm run build` / `npm run build:artifact`; los archivos quedan incrustados).

| Qué | Carpeta y nombre | Formato |
|---|---|---|
| Retratos de diálogo | `src/assets/portraits/<id>.jpg\|png\|webp` | cuadrado 512×512 |
| Fondos de historia | `src/assets/bg/<id>.jpg` | 1920×1080, tercio inferior despejado |
| Sprites de unidades | `src/assets/sprites/<id>.png` (`<id>@N.png` = tira horizontal de N cuadros) | PNG transparente, pies centrados abajo, ≈128 px de alto |
| Baldosas y bloques | `src/assets/tiles/<tema>_<parte>.png` | suelo 128×64 rombo; muros/plataformas 128×128 |

- Los ids de personajes, monstruos, fondos y temas están listados con descripción en **`docs/ARTE_ENCARGO.md`** (se regenera con `npx tsx scripts/art-list.ts`). Es la lista para mandarle a un artista o pegar en un generador.
- Los hablantes sin retrato asignado usan su nombre sin acentos (`viejo_linyera`).
- Un fondo con arte reemplaza también la escena sobre mapa de ese fondo; las escenas previas a cada combate siguen usando el mapa real.
- Las baldosas se aplican sobre la geometría del juego: la sombra lateral de los bloques se oscurece sola. Si un tema no tiene textura, usa los colores actuales.

## Cómo conseguirlo (resumen)
1. **Dirección de arte primero:** una sola referencia de estilo (recomendado: ilustración pintada oscura, paleta violeta/ámbar/arena). Sin eso, todo sale genérico.
2. **Prioridad por impacto/costo:** retratos → fondos de historia (16) → sprites de combate (6 + 62) → texturas de baldosas → UI.
3. **Vías:** artista por encargo (mejor coherencia), generación con IA a partir de una imagen de referencia (rápida y barata; revisar licencia comercial del servicio y cuidar la coherencia entre piezas) o un único pack con licencia para baldosas e íconos (revisar CC0/CC-BY y acreditar en `CREDITS.md`).
4. Todo arte nuevo con licencia que exija crédito va a `CREDITS.md`.
