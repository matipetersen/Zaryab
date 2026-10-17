# Capa de novela: escenas entre capítulos y entre actos

Archivo: `src/story/novel.ts`. Cada escena se reproduce **una sola vez** (bandera `nov_<clave>`) al cerrar el capítulo indicado, antes de volver al mapa. Muchas ocurren lejos de la compañía: el jugador sabe cosas que los personajes no.

| Cuándo | Clave | Escena |
|---|---|---|
| Inicio de la partida | `acto1` | **ACTO I · Muerte y pacto**: el Simurg y la ciudad construida sobre su ausencia |
| Tras el Prólogo | `cap0` | Lo que callan los pilares (el viento escucha; Razul anota la hora) |
| Tras el Juicio | `cap1` | El Vizir lee sus cuentas (los cristales anteriores) |
| Tras las Casas | `cap2` | Una ciudad llamada Zaryab (los Siete Vientos, el primer molino de djinn) |
| Tras Cap. III | `m_cap3` | El cuaderno de Al-Khush |
| Tras Cap. IV | `m_cap4` | Dahhak sueña en voz alta (el Coloso sin encender) |
| Tras Cap. V | `acto2` | **ACTO II · Los falsos dioses**: Merab, Hadir, el Profeta y los siete fragmentos |
| Tras Cap. VI | `m_cap6` | Sifra no olvida (la carta de Ellie) |
| Tras Cap. VII | `m_cap7` | Las plumas del Simurg |
| Tras Cap. VIII | `m_cap8` | El vaso de agua (Razul) |
| Tras Cap. IX | `m_cap9` | La máscara de Lady Nafisa |
| Tras Cap. X | `acto3` | **ACTO III · El Eclipse**: el sol mordido, Zahir cuenta los días |
| Tras Cap. XI | `m_cap11` | El libro de la Veta |
| Tras Cap. XII | `m_cap12` | La noche antes (Zahir ante los pedestales) |

Se suman a los interludios jugables ya existentes (`src/story/interludes.ts`): estos son sólo lectura, cortos y de tono literario.

## Aviso de canon
El material de las sesiones 1–2 y del Juicio de Arena es canónico. **Estas escenas son invención mía** (Al-Khush y las tres monedas, las 23 plumas, el vaso de Razul, la máscara de Nafisa, el libro de la Veta, etc.) y están escritas para encajar con lo ya establecido; cotéjenlas con sus notas antes de darlas por buenas.

## Escenas que reaccionan a la campaña (`src/story/novelReact.ts`)
Cada escena base lleva añadidos **fragmentos** según lo que hayan hecho:
- **Decisión del capítulo** (siempre se cuenta): por ejemplo Cap. VIII cambia con `razul_pacto`, `razul_tregua`, `razul_rechazo` o `razul_vaso`; Cap. IX con el destino del Marid (libre, atado, enemigo, diálogo); Cap. VII con Dahhak (muerto, vivo, devorado); Cap. XI con el sacrificio y el Gusano; Cap. XII con Razul (muerto, silencio, aliado); la portada del Acto II con vuestra Postura (Orden, Pueblo, Sombra).
- **Ambiente** (una sola vez cada uno): camino moral (Corrupción/Devoción), Alerta, número y salud de los seguidores, bajas de la compañía, Sello del Simurg, reputación con Conclave/Hijos/Mercaderes, vínculos con Aisha/Farid/Samira, Ruta (Sombra/Fe/Balanza), decisiones morales (el niño, el juicio), arcos de personaje (corona de Pact, memoria de Rabb, sombra de Zyr'thar, golem de Panchi) y las dudas o promesas con Zahir.
- **Profundidad:** cuantas más misiones secundarias, personales y morales completen, más fragmentos de ambiente se suman (1 hasta 4 misiones, 2 de 5 a 9, 3 desde 10). Una campaña “de paso” recibe novelas más cortas; una campaña implicada, más ricas.
- **Portadas de acto:** además llevan un **resumen vivo** de lo que la ciudad cuenta de ustedes (tono según Corrupción/Devoción, facciones con más peso y las últimas huellas morales).
