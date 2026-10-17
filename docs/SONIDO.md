# Sonido (procedural)

Todo el audio se sintetiza con WebAudio en `src/ui/audio.ts`: no hay archivos ni licencias. Se activa con el primer clic o tecla (política de autoplay). Botón 🔊/🔇 en la barra superior (se recuerda).

- **Ambientes** (`setMood`): `menu` (viento, brasas), `desert`, `city` (percusión y punteo frigio), `tense`, `sacred`, `battle` y `boss` (bajo, tambores, ritmo más rápido). Escala: re frigio dominante.
- **Cambia solo:** menú → `menu`; mapa → `city`; escenas según el fondo de la historia; combate → `battle` o `boss` si hay un jefe.
- **Efectos** (`sfx`): golpe, crítico, fallo, tajo, flecha, conjuro, explosión, curación, muerte, pasos, clic de interfaz, elección.
- **Pendiente:** música compuesta real (esta es generativa y simple) y efectos grabados. Si se agregan archivos, conviene un cargador análogo al de arte.
