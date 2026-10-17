# Reglas de combate (5e) en Zaryab

## Reacciones y movimiento
- **Ataque de oportunidad.** Cuando una criatura sale del alcance (5 pies) de un enemigo que puede actuar y todavía tiene su reacción, ese enemigo le hace un ataque cuerpo a cuerpo. Se mueve casilla a casilla: si el ataque la deja a 0 PG, el movimiento se corta ahí. Vale para jugadores y monstruos. Cada criatura tiene **una reacción por ronda** (se recupera al empezar su turno; el panel muestra el indicador «Reacción»).
- **No provoca:** pasar de una casilla a otra dentro del alcance del mismo enemigo, estar **desenganchado**, o que el enemigo esté caído, aturdido o paralizado.
- **Aviso al jugador:** al elegir *Mover*, el cartel de cada casilla dice «⚠ Provoca N ataques de oportunidad». En el teléfono, el primer toque muestra el aviso y el segundo confirma.
- **Desengancharse** (acción, todos). Además: *Acción Astuta* de Zyr'thar (adicional), *Paso del Viento* de Panchi (1 ki, adicional) y *Golpe de Céfiro* de Joren.
- **Levantarse** de estar derribado cuesta la mitad del movimiento (ya existía).

## Acciones nuevas para todos los personajes
| Acción | Qué hace |
|---|---|
| **Desengancharse** | Tu movimiento este turno no provoca ataques de oportunidad |
| **Ayudar** | Un enemigo adyacente: el siguiente ataque de un aliado contra él tiene ventaja (hasta tu próximo turno) |
| **Derribar** | Atletismo (FUE) contra FUE o DES del enemigo adyacente (no más de un tamaño mayor): si ganás, cae derribado |
| **Primeros auxilios** | Aliado caído adyacente: Medicina CD 10 para estabilizarlo |

## Más táctica (despliegue, posición y lectura del campo)
- **Despliegue previo.** Antes del primer turno se puede reubicar a cada personaje entre las casillas azules de inicio (tocar un personaje y después una casilla; si hay otro, se intercambian). Los frágiles atrás, los resistentes adelante. Botón «¡Comenzar!».
- **Sorpresa.** Algunos combates son emboscadas (hoy: la noche del desierto y el Linyera): el bando sorprendido **pierde su primer turno** y no puede reaccionar hasta entonces.
- **Flanqueo.** Un ataque cuerpo a cuerpo contra un enemigo que tiene a un aliado tuyo justo del lado opuesto tiene **ventaja**. Vale también para los enemigos contra ustedes.
- **Terreno elevado.** Disparar o lanzar desde una casilla más alta que la del objetivo da **+2 al ataque**.
- **Alcance de amenaza.** Al señalar a un enemigo (ratón o primer toque) se marcan en rojo las casillas que podría atacar en su próximo turno.
- **Escena previa a cada combate** (`src/story/briefings.ts`): título del lugar, qué está pasando, quiénes son los enemigos, cómo lo ven los personajes (con retrato) y una pista táctica según el terreno. Los combates con más historia (la emboscada de la noche, el Linyera, el Acueducto, el Coloso, Dahhak, el Eclipse…) tienen texto propio.

## Distancia y melé
- **Atacar a distancia con un enemigo adyacente que pueda actuar tiene desventaja** (armas y conjuros). La IA lo tiene en cuenta: los arqueros y lanzadores intentan no quedarse pegados.
- La IA también **penaliza provocar ataques de oportunidad**; solo sale del alcance si compensa.

## Ya existían
Cobertura (media y tres cuartos), terreno difícil, ventaja y desventaja, derribado, concentración, salvaciones de muerte, ataque furtivo con flanqueo/ventaja, objetos y terreno destruible.

## Dificultad
Las reglas nuevas movieron la victoria del bot unos pocos puntos; los 36 combates se volvieron a calibrar (media 49 %, rango 42–62 %) (`scripts/calibrate.ts`) para que la base siga en ≈ 50 % (ver `docs/DIFICULTAD.md`).

## Resurrección
- **Antes del Cap. III la muerte no es definitiva:** el cristal de Zahir devuelve a los caídos solo (también en partidas guardadas viejas).
- **Desde el Cap. III**, con *Muerte permanente* activada, los caídos quedan fuera hasta que se los resucite: **Santuario → Rituales → Resurrección del cristal** (12 PF y +1 Corrupción por personaje, 1 día). Los PF se consiguen con seguidores, sermones y ofrendas.
- **En combate**, Romain (nivel 5) tiene *Revivir*.
- Con *Muerte permanente* desactivada, los caídos se recuperan solos tras el combate (+1 Corrupción, −3 PF).
