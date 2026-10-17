# Auditoría v0.5: historia, sistemas y pulido

Lectura completa del guion (prólogo, 13 capítulos, 4 noches, Qadir-Kalmah, misiones), medición de palabras y simulaciones. No es una prueba jugada a mano.

## Hallazgos y qué se hizo
| Hallazgo | Estado |
|---|---|
| Capítulos del Acto II–III de 375–1.100 palabras (resúmenes) | **Hecho:** Cap. VII–XII reescritos a ≈ 2.300–3.500 palabras (`src/story/act2a.ts`, `act2b.ts`, `act3a.ts`) |
| Marid y Gul-Amarat sin vínculo con la compañía | **Hecho:** el Marid es el río represado del acueducto (Riyam, la sombra de Zyr'thar); Gul-Amarat son los mineros (Idris, hermano de Samira; el padre de Abril); Al-Mazhar guarda la voz del marido de Aisha; Dahhak, las voces que acosan a Farid |
| Sin razón narrativa para seguir juntando fragmentos tras el Cap. VIII | **Hecho:** `fragChoice` (`src/story/frag.ts`): ceder a Zahir, guardar o **romper**. Romperlo cuesta 6 PF, suma Devoción, deja un pedestal vacío en el Cap. XIII y debilita 8 % a Zahir por fragmento (máx. −40 %). Los finales cuentan fragmentos rotos como resueltos |
| Resurrecciones idénticas para los seis personajes | **Hecho:** texto propio por personaje (`arquetipos.ts`) |
| Zahir Caído acusaba por Dahhak antes de conocerlo | **Hecho:** se acusa por oír a las Si'lats nombrarlo; y se explica por qué es «el Caído» |
| Frase duplicada del Marid | **Hecho** |
| Prólogo sin consecuencias (cuerda/Pact/ración) | **Hecho:** flags y referencias en el Cap. I |
| Misiones secundarias de 60–250 palabras | **Hecho:** 6 personales + 4 secundarias a 600–990 palabras (`src/world/quests_deep.ts`); 8 stubs sin consecuencias retiradas (41 → 33 misiones) |
| Hub sin tutorial | **Hecho:** guía de 5 pasos (`?`), cartel «★ Siguiente paso» |
| Sin audio | **Hecho:** audio procedural (`src/ui/audio.ts`, `docs/SONIDO.md`) |
| Se llegaba al final con poca experiencia si se esquivaban combates | **Hecho:** XP de hito por capítulo (`MILESTONE_XP`); ver `docs/NIVELES.md` |
| Arte genérico | **Pendiente (externo):** el sistema de carga y la lista de encargo existen; faltan los archivos de arte (`docs/ARTE.md`) |
| Prosa con muletillas; el texto sigue siendo mío, no tu canon | **Pendiente:** requiere tu lectura |

## Lo que sigue sin verificarse
- Una partida jugada a mano de principio a fin (el bot solo clickea).
- Si el audio suena bien: se verificó que produce señal en todos los ambientes, no cómo suena.
- Calibración de los combates contra una persona (se calibró contra un bot).
- Los nuevos textos de los Cap. VII–XII no tienen aún lectura en voz alta ni corrección de tono.
