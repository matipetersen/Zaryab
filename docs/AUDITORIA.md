# Auditoría: game loop, historia y rango de niveles 1–9 (v0.4)

> **Actualización:** se decidió **empezar en el nivel 1 y llegar al 15** (no 1–9). Hecho: fichas de nivel 1 y 2, XP desde 1, topes por hito, rasgos de los niveles 2 y 3, y prólogo con subida automática. Las secciones 1 y 2 de abajo describen el análisis previo (rango 1–9) y quedan como referencia; lo vigente para niveles está en `docs/NIVELES.md`.

Estado: loop e historia funcionan, con las debilidades de abajo.

## 1. Niveles: lo que hay vs. lo que pediste (1–9)

| Qué | Hoy | Problema con 1–9 |
|---|---|---|
| Nivel inicial | Fijo en **3** (`newCampaign.lvl`, fichas reales a nivel 3) | Los niveles 1 y 2 no existen. Si de verdad arrancan en 1, hay que rehacer las seis fichas sin rasgos de subclase. |
| Techo | `levelCap`: Acto I ≤ 5 · tras Cap. V ≤ 10 · tras Cap. X ≤ **15** | Hay que bajarlo a 9. |
| Tabla de XP | 3→15 (`XP_TABLE`, `MAX_LEVEL = 15`) | Los niveles 10–15 sobran. |
| Evoluciones de arquetipo | Niveles **5, 9, 13** | La 3.ª (nv. 13) es inalcanzable. La 2.ª (nv. 9) coincidiría con el final: casi no se disfruta. |
| Rasgos por nivel | Hasta nv. 15 (ASI en 12, Sanar 11, Intervención Divina 10, ranuras de 6.º–8.º, Palma Vibrante 15…) | Todo lo de nv. 10+ es código muerto. |
| Escalado de enemigos (`levelScale`) | Crece hasta el nivel 15 | Calibrado para un grupo mucho más fuerte que uno de nv. 9. |

### Simulador a nivel 9 (bot, 12 partidas, sin aliados ni objetos)
| Encuentro | Victorias | Muertes/combate | Lectura |
|---|---|---|---|
| Coloso | 100 % | 0 | Fácil (Cap. V debería tocarse a nv. 4–5, no 9). |
| Dahhak | 92 % | 1,9 | Aceptable. |
| Marid | 100 % | 0,4 | Fácil. |
| Al-Mazhar | **42 %** | 2,7 | Demasiado duro para nv. 9 si es el Cap. X. |
| Gul-Amarat | 92 % | 1,3 | Aceptable. |
| Razul (final) | 75 % | 3,0 | Duro. |
| **Eclipse (jefe final)** | **0 %** | 4,7 | **Imposible a nv. 9 con el bot**; no se puede dar por jugable. |

Nota: el bot subestima a un humano (no usa todas las habilidades ni objetos), pero un 0 % es una alarma real. Los jefes de Acto II–III se diseñaron para 12–15.

### Experiencia
La suma de XP de los encuentros del camino principal ronda 49 000; llegar a nv. 9 requiere 20 500. Con tope en 9, **más de la mitad del XP del Acto III no sirve para nada**. Hay que reducir XP o redistribuir los umbrales.

## 2. Propuesta de ruta de niveles (necesita tu aprobación)
| Tramo | Nivel | Evolución |
|---|---|---|
| Prólogo–Cap. II | 3 (fichas reales) | — |
| Cap. III–V | 4 → 5 | **1.ª evolución** al terminar el Cap. V |
| Cap. VI–VII | 5 → 6 | — |
| Cap. VIII–X | 6 → 7 | — |
| Cap. XI–XII | 8 | **2.ª evolución** (nv. 8, no 9) |
| Cap. XIII | 9 | — |

Trabajo asociado: recalibrar `maps.ts` y `levelScale` contra el simulador con `LVL` por capítulo, quitar nv. 10–15 de `progression.ts` y bajar la 3.ª evolución. **Decisión previa:** ¿empiezan en nv. 1 (hay que rehacer fichas y el prólogo) o en nv. 3 como las fichas canónicas?

## 3. Game loop: veredicto
**Funciona:** hub → misión/lugar → escena → combate → botín/XP → santuario → subida → pasa el tiempo. Hay relojes para que el grupo no se quede (Eclipse a 80 días, plazo de Razul, Zahir, Alerta, frentes, errantes) y un final de abandono.

**Debilidades (ordenadas por gravedad):**
1. **Progresión incoherente** (sección 1): el escalado está pensado para otro techo.
2. **Cap. V y Cap. XI sin alivio** en el loop (ver `docs/RITMO.md`): la tensión es continua.
3. **Relojes que se pisan:** el castigo de Zahir (días sin capítulo principal) y el cobro de Razul pueden caer el mismo día; no hay prioridad entre eventos.
4. **Muchas capas en el hub** (misiones, lugares, frentes, errantes, vínculos) sin tutorial; el jugador nuevo no sabe qué hacer primero.
5. **Probabilidades y recompensas** de incidentes, POIs y frentes son estimaciones sin simular.
6. El Cubo de Maunator nunca se jugó a mano ni se balanceó con el simulador.
7. El Eclipse forzado solo se probó una vez (final «Destruir»).

## 4. Historia: veredicto
**Sólido:** acto I (muerte y pacto) con gancho claro; Razul como antagonista humano; arcos personales con inicio y cierre en capítulos distintos; interludios que dan respiro; siete finales con cierres de arco.

**Riesgos que debes revisar:**
1. Acto III más corto que el I y apoyado en mecánica (Cap. XI).
2. Razul es jefe, aliado posible y narrador de la «Espiral del Dios Caducado»: sus tres roles necesitan una lectura seguida para ver si el tono se sostiene.
3. Con el Eclipse forzado se saltan capítulos de Razul, Marid o Al-Mazhar: las huellas y arcos quedan sin cierre (los epílogos lo toleran, pero el texto no lo reconoce).
4. Los interludios 2 y 3 no tienen diálogo propio de Panchi, Pact ni Zyr'thar.
5. Textos de interludios y Razul escritos de una vez: faltan lectura en voz alta y corrección de tono.
6. Todo el material canónico es de las sesiones 1–2 y del resumen del Juicio de Arena; del resto de la campaña real, lo mío es **invención** y debe cotejarse con tus notas.

## 5. Qué necesito para cerrar la auditoría
- ¿Nivel inicial 1 o 3?
- ¿Apruebas la ruta de niveles de la sección 2?
- Tus notas canónicas para validar los puntos 3 y 6 de la historia.
