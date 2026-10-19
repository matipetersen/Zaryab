# «Asalto a Orchouma»: qué sirve para Zaryab

Notas recibidas: una operación militar (Coalición de la Luz contra el Imperio del Hierro), con 4–6 PJ de nivel 4 no mágicos, rangos al azar, tres playas (Orchouma/«Omaha», Undowrs/«Sword», Unoj/«Juno»), una fase de inteligencia previa, estrés, nado y esprint, desafíos por playa, un dilema de camiones y tres jefes finales (Golem, Troll, Brujo orco).

**Es otra campaña** (otro mundo, otra tonalidad, otros personajes). Integrarla tal cual en Zaryab rompería su historia; conviene tratarla como **módulo aparte** o aprovechar sus *mecánicas*. Veredicto por pieza:

| Pieza de las notas | ¿Sirve? | Dónde encaja / estado |
|---|---|---|
| Buscar trampas, minas ocultas, «campo minado» con patrón | **Sí, muy bien** | Hecho: acción **Buscar**, trampas ocultas (mina, red, foso), Percepción pasiva, desarmar con Interactuar, glifos del Cubo ocultos |
| Esprint (4× velocidad, ventaja contra vos) | **Sí** | Hecho: acción **Esprintar** |
| Reconocimiento previo con hasta 4 pruebas (cada acierto revela algo; −3 = nada; peor = consecuencia negativa) | **Sí, la mejor idea** | Pendiente: «Fase de inteligencia» antes de un combate clave (Mina, Ciudadela, Coloso): revela trampas, debilita al jefe, avisa de refuerzos |
| Interrogatorio (violencia/intimidación 19–20, persuasión 16; dos intentos y muere) | **Sí** | Pendiente: escena con riesgo; encaja con Kaelen, Nythra o los Inquisidores capturados |
| Espía sospechosamente fácil (Percepción 16 → miente; <12 = trampa, 12–16 = falso, >16 = intel) | **Sí** | Pendiente: encaja con EaNassr, Samira o Madam Shub |
| Dilema del convoy (dos camiones, un solo ataque) | **Sí** | Pendiente: misión moral nueva; ya hay estructura para decisiones con eco |
| Talassar, el cabo arrogante que sabotea al grupo | **Sí, con adaptación** | Se parece a un NPC acompañante problemático; en Zaryab lo cubriría un personaje nuevo (p. ej. un hijo del Vizir) |
| Estrés (5/10/20 puntos, efectos por tirada) | Parcial | Se solapa con Corrupción/Devoción; ofrecería otro eje de desgaste para misiones largas (la Mina, la huida) |
| Peso al nadar/correr, ahogarse | Parcial | Solo tiene sentido en mapas con agua profunda (lago, acueducto) |
| Jefes (Golem RocaFerro, Troll Zuljin, Brujo) con debilidades (humo, aceite/fuego) | **Sí, parcial** | El troll que se regenera salvo con fuego/ácido y el golem confundido cada 2 turnos son mecánicas de jefe nuevas, no se parecen a las existentes |
| Trapdoor Spider, Mimic, Goblin bomba suicida, Ballista (fuego de supresión) | **Sí** | Se agregan al bestiario; la ballista de supresión y el goblin bomba encajan en cualquier mapa |
| Estadísticas de 5e en inglés pegadas (Orco, Francotirador, Chamán…) | Neutral | Ya hay motor de monstruos; hay que convertir, no reescribir |
| Texto de ambientación (Arthas, Grommash, Thalamir), poema, discursos | No para Zaryab | Solo si se hace un módulo aparte |

## Hecho en esta pasada
- **Buscar** (acción): tirada de Percepción; revela trampas y objetos ocultos a 4 casillas con línea de visión.
- **Percepción pasiva:** al terminar de moverse, se nota lo oculto en una casilla de distancia si 10 + Percepción alcanza la CD.
- **Trampas** (`src/engine/traps.ts`, `MapDef.traps`): mina mágica (explosión 3d6, salvación de DES), red de pegamento (inmoviliza) y foso (daño y derribo). Solo disparan a la compañía y a sus aliados. Se desarman con Interactuar (Destreza; competencia en Joren y Zyr'thar; fallar por 5 o más la dispara).
- **Esprintar:** movimiento ×4, y los ataques contra quien esprinta tienen ventaja hasta su próximo turno.
- **Glifos del Cubo** ocultos (CD 14) y borrables con Arcanos.
- **Sin colocar aún en mapas del juego:** los datos y el motor están listos, pero no puse trampas en los combates calibrados (cambiarían el balance). Se pueden sembrar en cualquier mapa nuevo con `traps: [{ x, y, kind }]`.

---

## Fase de inteligencia (implementada)

Código: `src/story/intel.ts` (guion + efectos), enganchada en `Game.runBattle` (`src/main.ts`) antes del briefing. Test: `npx tsx scripts/intel-test.ts`.

**Dónde:** `coloso` (Cap. V), `al_mazhar` (Cap. X), `gusano` (Cap. XI) y `razul_final` (Cap. XII). Se juega una sola vez por encuentro (bandera `i:<enc>:done`); un reintento tras una derrota no la repite.

**Regla central (del «estrés» de Orchouma):** la noche alcanza para **dos de tres** esfuerzos.

| Fuente | Tiradas | Qué da | Riesgo |
|---|---|---|---|
| Reconocer el terreno | 4 pruebas de habilidades distintas (CD 13–15) | 1 acierto: ven las trampas · 2: refuerzos se retrasan 1 ronda · 3: los enemigos pierden su primer turno y el jefe −10 % · 4: jefe −20 % | 3 fallos y 0 aciertos: «los vieron», enemigos +15 % de vida |
| Interrogar al cautivo | Intimidar CD 19 (da todo, +1 Corrupción) o Persuasión CD 16 (da una cosa) | Jefe −12 % y/o cuándo llegan los refuerzos (−2 rondas) | Dos fallos y muere sin hablar |
| Escuchar al informante | Percepción CD 16, hasta 3 lecturas, para saber si miente | Verdadero: elegir noche (enemigos sorprendidos), ruta (trampas visibles) o punto débil (jefe −12 %) | 30 % trampa (la compañía pierde su primer turno; si lo detectan, se la devuelven) · 30 % dato falso · 40 % cierto, y no se sabe cuál |

**Trampas:** en estos cuatro combates el enemigo siembra 3 trampas (mina, red, foso) en posiciones fijas por encuentro; sin reconocimiento ni ruta están ocultas y hay que usar **Buscar** o la Percepción pasiva.

**Tope:** el jefe nunca pierde más de 30 % de vida por inteligencia.

**Balance:** la calibración (N=40, sin inteligencia) sigue valiendo como línea base; el estimador de victoria del briefing no incluye estos bonus. Quien no hace inteligencia enfrenta las trampas ocultas, una dificultad un poco mayor que la calibrada.
