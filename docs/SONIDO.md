# Sonido (procedural)

Todo el audio se sintetiza con WebAudio en `src/ui/audio.ts`: no hay archivos ni licencias. Se activa con el primer clic o tecla (política de autoplay). Botón 🔊/🔇 en la barra superior (se recuerda).

- **Ambientes** (`setMood`): `menu` (viento, brasas), `desert`, `city` (percusión y punteo frigio), `tense`, `sacred`, `battle` y `boss` (bajo, tambores, ritmo más rápido). Escala: re frigio dominante.
- **Cambia solo:** menú → `menu`; mapa → `city`; escenas según el fondo de la historia; combate → `battle` o `boss` si hay un jefe.
- **Efectos** (`sfx`): golpe, crítico, fallo, tajo, flecha, conjuro, explosión, curación, muerte, pasos, clic de interfaz, elección.
- **Pendiente:** música compuesta real (esta es generativa y simple) y efectos grabados. Si se agregan archivos, conviene un cargador análogo al de arte.

## Temas (leitmotivs)
Melodías escritas dentro del motor (`THEMES` en `src/ui/audio.ts`), en bucle sobre el clima del momento, que deja de improvisar mientras suenan:
- **nana**: la nana de Farid, en re menor y caja de música (3/4). Suena en el desagüe (VIII), la noche de la fiebre (IX), la cripta de Al-Mazhar (X) y el final del Silencio.
- **nana_lich**: la misma nana, rápida y en sierra: el tema de combate de Al-Mazhar.
- **zahir**: cálido, casi mayor; suena cuando Zahir habla. **zahir_roto**: el mismo tema bajado al frigio y arrastrado; desde el Cap. XII y en el combate final.
- **razul**: lamento grave; el trono del Cap. XII y su combate.
- **final_luz**: la nana resuelta en mayor (Liberar, Equilibrio). **final_sombra**: Zahir roto en grave (Gobernar, Espiral).
