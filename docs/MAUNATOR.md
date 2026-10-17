# El Inventario de Maunator — adaptación a Zaryab (v0.4)

Fuente: «El Inventario de Maunator — Documento maestro para adaptación táctica» (oneshot D&D 5e para 2 PJs de nivel 9, Waterdeep/Skullport). Aquí se traslada a la campaña de Zaryab como una **operación opcional** con seis capítulos, una batalla por mapa rotante y una persecución.

## Traducción de setting
| Oneshot | Zaryab | Motivo |
|---|---|---|
| Zhentarim / Pelias | **Mercaderes del Zoco / EaNassr** | Ya es el contratista de los robos de la campaña |
| Embajada extraoficial de Thay en Waterdeep | **Consulado Cerrado de Thay** en el Zoco de los Mil Soplos | Hay gente de fuera con dinero: encaja con el Zoco |
| Waterdeep | Zaryab | — |
| Skullport | **Muelles Bajos de Medinat al-Rih** (barcaza por un río de ceniza) | Conecta con el Acto II y con los Nasnas |
| Arpistas / Seraphel | **Hijos del Simurg** / Seraphel, Hija del Simurg | Facción ya existente |
| Tyr, el Manco (justicia divina) | Sigue siendo **Tyr**; se alinea con la balanza de **Kelemvor** de Romain | El Sudario Silente ciega a «el Juez de la Balanza»; el sacerdote de Kelemvor es el testigo más afectado |
| Cyric / Eltabbar | Cyric / **Medinat al-Rih** (objeto sin nombre) | Decisión pendiente: puede ser el Oráculo de las Mil Lenguas (que siempre miente) |
| Ghaunadaur («El Que Acecha») | **Gul-Amarat**, el Gusano de las Cuevas | Los túneles pre-Simurg llevan su símbolo; el Pudin Negro es su sirviente |
| Loross / Netheril / Jergal / Maunator | Se mantienen: Maunator es una ciudad de escribas de los muertos hundida antes del Simurg; Jergal, el dios que precede a Kelemvor | Conecta con Romain y con Al-Mazhar (el Lich) |
| Aldric (sujeto y PJ) | **Sujeto 3** | Resuelve la colisión de nombres del §14 |

## Cuándo se juega
Se desbloquea tras el Cap. VIII (nivel ≈ 8) en el Zoco. Es opcional, pero afecta a Kethras como enemigo futuro, a EaNassr, a Seraphel (contacto) y al equipamiento (Sello de Helm).

## Estructura (§13.1 del documento)
0. **Briefing** (evento): EaNassr, elección de **escuadra de 4–5** y de cuánto saber.
1. **La Embajada** (evento con pruebas): Mordec, la nota de Sigmund, hallazgos-trampa (pociones malditas, anillo, llave maestra), pisos superiores (Varreth / páginas 7-114).
2. **El Cubo** (**mapa único rotante**, batalla larga con objetivos).
3. **D4** (defensa de 3 rondas).
4. **Los Túneles** (escape Z1→Z6 con Kethras y el Pudin: «el sándwich»).
5. **Negociación** con Kethras (rama de evento) y **Muelles Bajos** (finales).

## Mecánicas nuevas del motor
- **Bloques rotantes:** tablero 24×24 = 4×4 salas de 6×6. Cada rotación desplaza una fila/columna con **wraparound**; las salas llevan puertas, terreno, objetos y unidades. El pozo central (A0) es fijo.
- **Secuencia de 8 rotaciones:** B→, col 3↓, D←, col 1↑, A→, col 2↑, C←, col 4↓.
- **Medidor de alerta de 4 estados** (SILENCIO / SOSPECHA / ALARMA / EMERGENCIA) con el periodo de rotación del documento (3 / 2 / 1 / 1 rondas; en EMERGENCIA, dos rotaciones).
- **Kethras controla las rotaciones** en ALARMA (elige la que más separa al grupo).
- **Interacciones** con objetos (`OBJECTS` en `src/engine/cube.ts`): registro, glifo, altar, calaveras, espejo, tomo, jaula de Seraphel, compuerta, Sello de Helm…
- **Regla del Camino A (§12.2):** retirar el tomo despierta al Guardián Rúnico; la alarma no se evita sin costo.
- **Información como ventaja jugable (§13.4):** nota de Sigmund, cuadernos, tabla de B4 y el registro de A1 desbloquean avisos de rotación, el orden de medallones o la ubicación de Kethras.

## Decisiones tomadas en los huecos del §14
| Hueco | Decisión |
|---|---|
| Orden de medallones | **Altar → carne → mente** (B1 → C3 → C1), pista en el registro de A1 y en el diagrama de B2 |
| Temporizador de Mordec | Traducido a **rondas del Cubo** (rotación cada 3 rondas en SILENCIO) |
| Ritmo de rotación | Versión por turnos (3/2/1/1) |
| Colisión de nombres | «Sujeto 3» (el C1) |
| Brennan | Enviado del Conclave que vende información a Kethras (hilo abierto) |
| Seraphel | Dato accionable: **el plan de cegar al Juez de la Balanza** |
| Objeto de Cyric | Un artefacto en Medinat al-Rih capaz de proyectar ilusiones masivas (probablemente el Oráculo) |
| Stat blocks incompletos | Reconstruidos por CR (guardia 75 PG, Guardián Rúnico 85 PG, golem 93, Pudin 85, Kethras 99 PG…) |

## Finales (Muelles Bajos)
Completo · Incompleto · Señuelo · Fuga sola · Captura · Hilos abiertos, según tomo, páginas, trato con Kethras y supervivientes.

## Pendiente / sin balancear
- **No hay simulación del Cubo**: el bot del simulador no sabe jugar por objetivos. Lo único comprobado es que las rotaciones no rompen el motor.
- El objetivo del documento es ≈ 60 % de éxito sin bajas totales en la primera partida: hay que testearlo con jugadores.
- Los pisos 2.º/3.º de la Embajada están resueltos como eventos (el layout nunca existió: [FALTA] en el original).

## Pruebas realizadas (v0.4)
- `scripts/cube-smoke.mts`: rotaciones (16 seguidas, sin unidades en muros, composición del layout válida) y simulación de 18 rondas con alerta y entrada de Kethras.
- `scripts/cube-objects.mts`: las 20 interacciones se ejecutan sin errores.
- Recorrido completo de la quest en el navegador (dos caminos de elecciones) con las batallas por objetivo resueltas por script: llega a los finales «fuga» sin errores de consola.
- **No probado:** los finales «completo» e «incompleto», «señuelo» y «captura» (se comprueban por lectura del guion), ni la jugabilidad real del Cubo por una persona.

## Integración con la historia principal (v0.4+)
La misión ya no es una isla: sus finales y objetos cambian cinco puntos de la trama.
| Dónde | Qué cambia | Condición |
|---|---|---|
| **Cap. X · Al-Mazhar** | Nueva opción: **leer el Tomo de Maunator** (Romain nombra al Lich con las trece palabras). Se apaga sin combate; da Devoción y el fragmento. Además Romain reconoce el tono del Lich | Final «completo» o «incompleto» del Cubo (`mz_tomo_conserva`) |
| **Cap. XI · Mina** | El símbolo de Gul-Amarat de los túneles de Maunator aparece en la pared: se reconoce y se sabe cómo respira (`gusano_patron`, +3 PF) | Haber hecho el Cubo (`q_o_maunator`) |
| **Cap. XII · Ciudadela** | **Kethras reaparece como lugarteniente de Razul**. Con «trato limpio» os deja pasar y baja la Alerta; si no, hay que convencerlo (Persuasión CD 17), pelear (combate corto) o, con Seraphel libre, que ella lo distraiga | `q_o_maunator` |
| **Cap. XII · Romain** | Opción de pesar a Razul con los ojos abiertos: Seraphel ya le avisó del plan de cegar al Juez de la Balanza | Seraphel liberada (`mz_seraphel_libre`) |
| **Cap. XIII · Eclipse** | Los aliados liberados (Seraphel, Grethak, esclavos) siguen apareciendo y cuentan como ventaja de campaña | Ya existía |
| **Medinat · nueva misión «La Herencia de Cyric»** | El artefacto bajo el Oráculo: silenciarlo (el Oráculo dice siempre la verdad), quedárselo (+PF, +Corrupción) o entregarlo al Conclave (−Alerta) | Tras el Cubo y el Cap. VI |
| **Entreactos** | Escenas de novela propias para «El sótano que se mueve» y «La mentira que sostenía la ciudad», con una versión por cada final del Cubo | Siempre |

Además, el captura («final captura») ahora también cierra el hilo (antes se podía repetir la misión sin consecuencias).
