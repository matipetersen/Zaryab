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

## Agarrar, acción preparada, terreno y sinergias
- **Agarrar (Grapple).** Prueba de Atletismo contra Atletismo/Acrobacia del objetivo: si gana, queda **agarrado** (velocidad 0) mientras el agarrador siga adyacente y en pie. **Escapar** (acción): el agarrado repite la prueba. La IA se zafa sola.
- **Acción preparada (Ready).** Se gasta la acción y se espera un disparador (un enemigo entra en alcance): ataca con la **reacción** durante el turno rival, también a mitad de su movimiento.
- **Terreno (`terrainMods`).** Elevado: +1 CA y +2 a distancia · escombros: +1 CA · agua: −1 CA y −1 ataque · pegado a un muro o caja: +1 CA. El panel de la unidad muestra qué bonos tiene.
- **Sinergias («química», estilo FIFA, `src/engine/synergy.ts`).** Cada par de personajes acumula puntos de relación (parten con ventaja Pact+Romain, Rabb+Zyr'thar, Joren+Panchi). Niveles: Compañeros ≥ 3, Aliados ≥ 7, Hermanos de armas ≥ 12. Un aliado adyacente suma su nivel (a 2 casillas, la mitad): 1 punto = +1 CA, 2 = +1 ataque, 4 = +2 CA, 5 = +2 ataque. Pelear en formación (≤ 2 casillas la mitad de las rondas) sube la relación +1 por combate; algunas decisiones de las vigilias también. Se ven como líneas luminosas entre los personajes.
- **Formaciones.** *Falange* (aliados a ambos lados en línea): +1 CA. *Núcleo protegido* (3 aliados adyacentes): +2 CA.

## Efectos visuales
`src/ui/fx.ts`: clima por mapa (arena, lluvia, brasas, niebla…) e iluminación dinámica (cada impacto, proyectil y fuego ilumina el entorno), hit-stop, chispas, tajos y flechas. Se probaron PixiJS, Phaser y GSAP: se descartaron para no sumar 300 KB+ a una build que debe ser un solo HTML para el teléfono; el Canvas 2D propio alcanza.

## Escenas sobre el mapa
`src/ui/stage.ts` (`StageView`): los fondos de la historia que corresponden a un mapa jugable (`BG_MAP`) se muestran con el mismo renderer isométrico: la compañía entra caminando, deambula, y quien habla se ilumina y salta; los NPC que hablan aparecen junto al grupo. Las escenas previas a cada combate usan el nodo `{ t: 'stage', map, foes }` con el mapa real y los enemigos en su posición.

## Primer combate
`src/ui/tutorial.ts`: guía rápida de 7 pasos (despliegue, movimiento, ataques, ataques de oportunidad, posición y sinergias, objetivo). Se abre sola la primera vez y vuelve con el botón «?».

## Giros de objetivo y terreno vivo (`src/engine/twists.ts`, `src/data/twists.ts`)
Cada combate calibrado (36) tiene **un giro** y **un objetivo opcional con premio**; los combates con reglas propias (Cubo, Túneles, Defensa del D4, Torneo, Kethras a quemarropa) conservan las suyas.
- **Giros (eventos):** por ronda (`round`, `every`), cuando cae un tipo de enemigo (`down`) o cuando baja de cierta vida (`hp`). Efectos: refuerzos enemigos, **aliados que acuden**, curación y **furia** (+2 ataque/daño, +1 velocidad) de un jefe, bendición a la compañía, peligros del terreno, y **desbandada** (si cae el jefe o los mayores, el resto suelta las armas: victoria con XP y botín).
- **Objetivo opcional (bonus):** que nadie caiga · acabar antes de la ronda N · derribar a X antes de la ronda N · mantener con vida a los aliados · romper N estructuras · **que el terreno mate a N enemigos**. Premios: PF, oro o +1 sinergia entre los presentes. El panel superior izquierdo muestra el estado (◇ abierto, ✔ cumplido, ✘ fallado).
- **Terreno vivo (`LAND`):** cada mapa hace algo cada pocas rondas, **avisando una ronda antes** con casillas marcadas, y golpea a ambos bandos (salvación de DES, 2d6 a nivel bajo, 3d6 desde nv 7, 4d6 desde nv 11): tormenta de arena (−2 a distancia; dunas y nido) · derrumbe (callejones, zoco, mina, cripta; deja escombros: +1 CA) · inundación (acueducto, lago; agua: −1 CA y −1 ataque, 3 rondas) · fuego (plaza, Medinat, iglesia, eclipse) · pinches (arena, ciudadela). La IA esquiva las casillas marcadas.
- **Altares:** en pozo, iglesia, cementerio, jardín, templo, santuario, plaza y Medinat hay un altar equidistante de ambos bandos: quien empiece su turno encima se cura 1d6+1. Es un punto a conquistar.
- El briefing previo avisa del terreno y del objetivo opcional (no del giro).

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

## Cámara, luz y tipografía (v0.5)
- **Rotación del mapa** (estilo Tactics Ogre): pasos de 90° con los botones ⟲ ⟳ (a la derecha del tablero), las teclas **Q / R** o las flechas ← →. `Renderer.rot` (0–3) con transformación lógica↔vista (`rv` / `rinv`); el suelo, los muros y las unidades se ordenan por profundidad vista, y el clic se resuelve con la misma transformación (probado en las 4 orientaciones). Una brújula marca el norte original. Un breve fundido tapa el cambio.
- **Luz y sombra siempre presentes:** todos los mapas tienen oscuridad ambiente mínima (0,26), la compañía lleva farol, hay luz direccional cálida desde arriba a la izquierda y penumbra del lado opuesto, y tanto unidades como muros/cajas proyectan sombra hacia el mismo lado de la pantalla (`SHADOW_DIR`, `drawBlockShadows`). Los tonos siguen siendo los de cada mapa (violeta, ámbar, turquesa…).
- **Tipografía:** *Lemonada* (títulos, botones: trazo redondeado y caligráfico), *Cairo* (texto) y *Reem Kufi* (números, brújula y la marca árabe «زرياب» del menú). Van incrustadas (`src/assets/fonts`, licencia SIL OFL) en lugar de cargarse desde Google Fonts, así funcionan sin conexión y en el Artifact.

## Niebla de guerra, puertas y aspecto (v0.5)
- **Niebla de guerra:** la compañía solo ve las casillas dentro de ≈ 10 de alcance con línea de visión libre (`Battle.visibleTiles`, con caché). Lo ya explorado queda en penumbra; lo desconocido, oscuro. Los enemigos fuera de la vista no se dibujan, no se pueden seleccionar y aparecen como «?» en la lista y el orden de iniciativa. Es **solo de presentación**: las reglas, la IA y la calibración no cambian. Botón 👁 para apagarla (se recuerda); durante el despliegue está apagada.
- **Puertas** (`D` cerrada / `d` abierta): tapan la línea de visión (de ambos bandos, también para los ataques a distancia), se pueden cruzar con costo normal y **se abren al pasar** (la IA también las abre). Hoy hay puertas en la **cripta** (Al-Mazhar), la **iglesia** (Dahhak) y **Medinat** (las tres revueltas). Los combates afectados se recalibraron.
- **Texturas procedurales** (`src/ui/textures.ts`): suelo de losas, adoquines, mampostería, madera con herrajes, portones, con incrustaciones de estrella de ocho puntas en los temas sagrados y comerciales; cada tema usa su paleta. El arte externo (`src/assets/tiles`) las reemplaza.
- **Sprites de la compañía** (`src/ui/pcSprites.ts`): siluetas propias para los seis (cuernos y balanza de Romain, alas plegadas y halo de Pact, espadón y capucha de Rabb, arco y carcaj de Joren, cabello blanco y dagas enfundadas de Zyr'thar, el enano de barba trenzada y puños vendados de Panchi).

## Explorar dentro del mapa (v0.5)
Acciones de la compañía: **Buscar** (revela trampas y objetos ocultos), **Esprintar**, **Interactuar (F)** (objetos, desarmar trampas), abrir puertas al cruzarlas y romper terreno. Detalle y origen de las ideas en `docs/ORCHOUMA.md`.
