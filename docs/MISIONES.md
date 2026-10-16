# Mapa de misiones: documento de expansión → juego (v0.4)

Estado de las 31 misiones secundarias del documento «Expansión: misiones secundarias y Actos 2–3».
**Importes en PO:** el botín del juego es pequeño (≈ 35 % del XP por enemigo), así que los importes del documento se redujeron a la mitad en los sumideros (−1000 → −500, −500 → −250) y a ~50 % en las recompensas (+300 → +150).

## Discrepancias con el canon (se mantiene el canon de las sesiones)
| Documento | Juego | Motivo |
|---|---|---|
| Pact — «El Crimen Olvidado» | «La Corona Invertida» (Azuran, Si'lats) | Canon de la sesión 3 |
| Al-Khush / Khalil | Al-Khush (alfombra) · Khalil sólo mencionado | Canon: Al-Khush teje; Khalil no aparece en el Zoco |
| Punchi | Panchi | Canon |
| EaNasir | EaNassr | Canon |
| #7 y #30 (esclavos de la Ciudadela) | Una sola misión (`f_motin`) | Son la misma operación: liberar djinns de las mazmorras |

## Estado
| # | Misión | Estado | Id |
|---|---|---|---|
| 1 | El Templo Quemado | ✔ v0.2 | `p_romain` |
| 2 | El Crimen Olvidado | ✔ (versión canon) | `p_pact` |
| 3 | La Casa Vel'Shara | ✔ | `p_zyr` |
| 4 | El Monasterio en Ruinas | ✔ (golem defectuoso, versión canon) | `p_panchi` |
| 5 | La Familia Perdida | ◐ (Manifiesto de La Marca; el Plano de Arena llega en el Acto II) | `p_joren` |
| 6 | El Nombre en el Arma | ✔ | `p_rabb` |
| 7 | El Motín de los Esclavos | ✔ v0.4 (Sigilo CD 16 · soborno · asalto) | `f_motin` |
| 8 | La Caravana Perdida | ✔ v0.4 | `f_caravana` |
| 9 | El Impuesto de Sangre | ✔ v0.4 (+ eco «Ellos vuelven») | `f_impuesto` |
| 10 | La Caza del Hereje | ✔ v0.4 | `f_hereje` |
| 11–14 | Roc Ciego, Guardia, Djinns, Cementerio | ✗ Acto II (requieren Medinat al-Rih / Catacumbas) | — |
| 15 | El Pozo del Silencio | ≈ `s_lago` | `s_lago` |
| 16–20 | Exploración | ✗ Actos II–III | — |
| 21 | El Niño y el Escorpión | ✔ v0.4 (Medicina CD 14, eco a 3–4 días) | `m_nino` |
| 22 | El Ladrón Arrepentido | ✔ | `m_ladron` |
| 23 | El Djinn Esclavizado | ✔ | `m_djinn` |
| 24 | El Inquisidor Arrepentido | ✔ (dos ecos: información / traición) | `m_inq` |
| 25 | El Pacto con el Marid | ✔ (irreversible, Persuasión CD 18) | `m_marid` |
| 26 | El Juicio del Pueblo | ✔ (Intimidar CD 14 para el juicio justo) | `m_juicio` |
| 27 | Los Padres Enfermos | ✔ | `r_padres` |
| 28 | Los Monjes de Kelemvor | ✔ (Persuasión CD 18 de Romain) | `r_monjes` |
| 29 | Los Ladrones del Zoco | ✔ | `r_ladrones` |
| 30 | Los Djinns Libres | ≈ fusionada con 7 | — |
| 31 | El Ejército de los Muertos | ✗ Acto II (Catacumbas) | — |
| Actos 2.1–2.5, 3.1–3.5 | | Guion de diseño en `DISENO.md` §3; sólo el Acto I está jugable | — |

## Sistemas nuevos de v0.4
- **Pruebas de habilidad** (`Opt.check` / `Opt.fail`): el mejor modificador de la compañía tira d20 + mod; la interfaz muestra «mejor: Pact Risen +5». Las competencias de Zyr'thar y Panchi son estimadas, como sus fichas (`src/world/checks.ts`).
- **Ecos** (`Effect.echo`): una decisión programa un evento para dentro de N días (`eco_*` en `src/world/morales.ts`). Aparecen en el hub antes que los eventos del reloj.
- **Huellas** (`Effect.huella`): frases de legado que acumula la campaña y que se muestran en el Diario; base del epílogo.
- **Irreversibles**: Marid (pierdes un recuerdo), djinn usado, niño muerto, guardia colgado, niños enfermos: no hay vuelta atrás ni «recargar» en el juego.
- **Economía**: `gold` (PO), tienda de EaNassr (−15 % con Mercaderes ≥ 2, +25 % con ≤ −2), taller de Aisha (materiales), botín por enemigo.

## Acto II · Capítulo VI (v0.4): La Guerra Civil — Medinat al-Rih
Se abre al terminar el Cap. V. Guion en `src/story/cap6.ts`.

| Escena | Qué hace |
|---|---|
| Llegada | Tres entradas según la **Postura** del Cap. V (Orden con escolta de Qilaat; Pueblo con los refugiados; Sombra solo y comprado) |
| La revuelta | Un combate distinto por Postura: `revuelta_orden` (Nasnas), `revuelta_pueblo` (Qilaat y guardias), `revuelta_sombra` (mercenarios de Dahhak). Existe una cuarta opción que cambia de bando y tiene un precio |
| Joren | Reencuentro con «el Muerto que Respira»: dejarlo hablar, interrogarlo (Intimidar CD 14) o matarlo (huella) |
| Torneo | Panchi contra Sifra la Silente (Ellie). **Panchi pierde siempre** (duelo de 6 rondas; 0 victorias en 60 simulaciones). Si deja a Sifra por debajo del 55 % de PG, Ellie la reconoce |
| Cierre | Venda de Ellie (objeto clave), `conoce_ellie`, pista de que Ellie sabe romper pactos. Pact queda para el Cap. VII (Prueba de Azuran) |

**Sistemas nuevos:** contador de **Ruta** (`orden`/`pueblo`/`sombra`, `Campaign.ruta`) que suma cada decisión del Acto II y se calculará al final del Cap. VIII; regla de **duelo** (`Encounter.duel`: límite de rondas, grupo restringido, derrota sin penalización); combate «blando» (`battle.soft`) que no se reintenta.
