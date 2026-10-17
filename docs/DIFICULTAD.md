# Dificultad: 50 % de base y ventajas de campaña

**Regla:** cada combate de victoria/derrota se calibra para que, **al nivel de diseño del encuentro, sin ayudas y con el bot de pruebas**, el grupo gane ≈ 50 %. Todo lo que hagan en la campaña suma «puntos de ventaja» que debilitan a los enemigos y suben esa probabilidad.

## Cómo está hecho
- `src/data/difficulty.ts`: nivel de diseño de cada combate (`DESIGN_LVL`) y escala de enemigos (`foeScaleFor`). La calibración (`difficulty.cal.json`) guarda una «potencia» por encuentro: PG ×p^0,6, ataque +1,2·ln p, daño +1,5·ln p (así no son meras esponjas de PG).
- `scripts/calibrate.ts`: busca esa potencia por bisección con el simulador. `LVL` y `EDGE` del simulador permiten probar otros niveles y ventajas.
- Excluidos (no se miden por victoria): Torneo (duelo perdido), Cubo y túneles de Maunator (objetivos), Kethras, huida de la mina.

## Puntos de ventaja (`src/world/edge.ts`)
| Fuente | Puntos | Tope |
|---|---|---|
| Equipo mágico equipado (por rareza: común 1, poco 2, raro 3, único 4) | suma | 12 |
| Consumibles en el inventario | 1 por cada 2 | 8 |
| Aliados en el campo | 5 c/u | 15 |
| Edificios del santuario | 2 c/u | 10 |
| Seguidores sanos | 1 por cada 2 | 6 |
| PF en reserva | 1 por cada 8 | 6 |
| Milagros disponibles | 1 c/u | 4 |
| Vínculos con personajes de la ciudad | 1 por cada 2 puntos | 5 |
| Alerta ≥ 7 / ≥ 10 | −4 / −8 | |

Total limitado a −12…+45. Efecto: PG enemigos ÷(1 + 0,013·puntos) y −1 al ataque cada 20 puntos. El nivel del grupo no suma puntos: ya cambia las cifras reales (si superan el nivel de diseño, el combate es más fácil de verdad; si no llegan, más difícil).

## Probabilidad mostrada
Antes de cada combate calibrado el diario de batalla muestra «Probabilidad estimada de victoria» = logística centrada en 50 % (`K = 0,07` por punto; +4 puntos por nivel sobre el de diseño), con la lista de ventajas.

Medido con el bot (60 partidas por casilla, media de cinco jefes): 0 pts ≈ 43 % · 10 ≈ 61 % · 20 ≈ 84 % · 35 ≈ 94 %.

## Honestidad
- La base real del bot ronda 40–55 % según el encuentro (el ruido de 30–60 partidas es ±8 %).
- El bot no usa objetos ni todas las habilidades: un humano suele estar por encima.
- Los combates de defensa (patrulla, asalto, Coloso) no incluyen a los guardias seguidores en la simulación; en el juego sí, y cuentan como aliados.
