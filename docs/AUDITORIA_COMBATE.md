# Auditoría del combate (reglas 5e, habilidades, IA y sistemas)

Revisión hecha en tres frentes en paralelo, con pruebas ejecutadas sobre el motor (arneses y simulaciones de ~200 combates). **Nada de esto está corregido todavía.** Etiquetas: **C** = confirmado ejecutando código · **T** = trazado leyendo el código · **D** = simplificación de diseño.

## Prioridad 1 — rompen combates o el equilibrio

| # | Problema | Dónde | Ver. | Arreglo |
|---|---|---|---|---|
| 1 | Los combates duran 15–25 rondas (5e: 3–5): la calibración infló la vida de los monstruos (reflejo de Pact 843 PG, Varreth 1332, Marid 1377) para compensar una IA floja | `data/difficulty.cal.json`, `difficulty.ts:224` | C | Arreglar IA y reglas primero; recalibrar con tope de vida (×4) y pasar el resto a ataque/daño |
| 2 | Cada parte del daño de un golpe cuenta como un fallo de salvación de muerte: una garra de ghul (2 partes + crítico) mata a un PJ caído de un golpe en 399/400 | `battle.ts:451` | C | Sumar las partes de un ataque y aplicar fallo/concentración/muerte instantánea una vez |
| 3 | Contra paralizados o caídos el ataque es crítico **y acierto automático** (ignora la CA) | `battle.ts:422` | C | Primero comparar con la CA; crítico solo si acierta |
| 4 | Maniobras (Derribo, Amenazador) y Golpe Aturdidor son acciones libres repetibles que tiran ataques completos sin haber atacado | `abilities2.ts:30-33, 74` | C | Convertirlas en modificadores del próximo impacto; aturdidor solo tras impactar en melé |
| 5 | Un monstruo que muere por un ataque de oportunidad mientras se mueve igual ataca (a veces desde lejos) | `ai.ts:105-118` | C | Cortar si murió, cayó o no llegó a la casilla |
| 6 | Guardianes Espirituales, Inmovilizar Persona, Destierro y Golpe Enredador sobreviven a la pérdida de concentración; Inmovilizar paraliza 10 rondas sin salvación repetida y a cualquier criatura | `battle.ts:27`, `abilities2.ts:13-43` | C | Estados de concentración marcados por conjuro; salvación al final del turno; tipo de criatura |
| 7 | Las habilidades de área que solo aplican estados (Juicio Cegador, Canto de Dahhak, Grito, Canción de Huesos, Trompetas del Simurg) **nunca** las usa la IA | `ai.ts:26-31` | C | Puntuar el control también en área |
| 8 | `huida_mina` se gana sola en 2 rondas: el mapa no tiene casillas de oleada y el combate de «aguantar» termina al matar a todos | `maps.ts:339`, mapa `mina`, `checkEnd` | C | Casillas `w` y no ganar por eliminación en modo aguantar |
| 9 | Curar a un caído puede dejarlo por encima del máximo (Sanar: 70/21) | `battle.ts:515` | C | `Math.min(maxHp, amt)` |
| 10 | Moverse estando inmovilizado/agarrado (Correr y Esprintar recargan movimiento; estados aplicados a mitad de turno no cortan el movimiento) | `battle.ts:248, 274, 358`, `abilities.ts:48,52` | C | Velocidad 0 calculada en `reach`/`move` según estados |
| 11 | Golpe de Llamas no hace la parte de fuego a las criaturas (la mitad del daño) | `abilities2.ts:20` | C | Tirar fuego + radiante por objetivo |

## Prioridad 2 — reglas mal aplicadas (impacto medio)

- **Ataque furtivo con desventaja** se aplica igual cuando hay un aliado adyacente (`battle.ts:575`) — C.
- **Invisible**: si el atacante tiene cualquier ventaja, la desventaja por invisibilidad desaparece en vez de cancelarse (`battle.ts:411`) — C.
- **Sin desventaja a largo alcance** (la lógica falta; afecta a la ballesta de mano de Zyr'thar) (`battle.ts:549, 560`) — C.
- **Concentración**: una tirada por parte de daño, usa CON sin competencia, Bendecir +2 fijo en vez de 1d4, no se pierde al quedar aturdido (`battle.ts:476`) — C.
- **Artes Marciales y Ráfaga** sin haber usado la acción de Atacar (`battle.ts:550`, `abilities.ts:148`) — C.
- **Asesinar**: ventaja según «no atacó» en vez de «no jugó turno», y falta el crítico contra sorprendidos (`battle.ts:408`) — C.
- **Sendero a la Tumba** solo duplica la primera parte del daño; **Esquiva Asombrosa** se activa con cualquier daño (fuego, auras), no gasta la reacción y solo divide la primera parte (`battle.ts:446, 457`) — C.
- **Golpe Enredador** no funciona con arco (Joren es arquero) (`battle.ts:579`) — C.
- **Escalados mal**: Maldición del Hexblade cura CAR+3 en vez de nivel+CAR; Alma Radiante +3 fijo en vez de +nivel; Palabra de Resplandor no escala; dado de artes marciales un escalón alto; Palma Vibrante 2 ki y usable sin ki (`battle.ts:494, 572`, `abilities.ts:99`, `progression.ts:459`, `abilities2.ts:78`) — C.
- **Emboscador Terrible** cambia DES por SAB en la iniciativa en vez de sumarla (`battle.ts:197`) — C.
- **Curar Heridas en Masa** no levanta caídos; **Auxilio** se apila; perder concentración borra también bendiciones de objetos (Perla, Elixir) — C.
- **Esprintar**: la penalización «hasta tu próximo turno» se borra al terminar tu propio turno (`battle.ts:254`) — C.
- **Estable que recibe daño** sigue estable y ya no tira salvaciones; **zafarse de un agarre** deja velocidad 0; **inconsciente** no falla automáticamente FUE/DES; inmovilizado sin desventaja en DES — C.

## Prioridad 2 — IA y sistemas

- El **multiataque con ataque a distancia** (Al-Mazhar, Razul) solo dispara el rayo trabado en melé, con desventaja (113/123 casos) (`ai.ts:101`) — C.
- **Curanderos enemigos** (Letanía del ghul cantor) nunca curan, y curar no afecta a no-muertos (`ai.ts:54, 86`, `battle.ts:512`) — C.
- **Seraphel aliada** nunca levanta a un PJ caído (`ai.ts:144`) — C.
- La IA **remata caídos** teniendo enemigos en pie al alcance (`ai.ts:44`) — C. Cruza zonas de amenaza con demasiada facilidad (`ai.ts:60`) — C. No mira resistencias/inmunidades (`battle.ts:657`) — T.
- **Objetivos de giro imposibles o regalados**: el golem enemigo completa «romper dos estantes» (Panchi); «derribar al Jann» es imposible porque huye; «enemigo caído por el terreno» imposible en Acueducto y Lago — C.
- **Oleadas sin escalar** (sombras de 18 PG junto a esqueletos de 75) (`setup.ts`) — C.
- **Furia doble** en jefes (rasgo + giro) — T. Trampas del Cubo que disparan con enemigos — C.
- El retraso de refuerzos de la **fase de inteligencia** atrasa también el terreno vivo y los avisos del giro (`intel.ts:163`) — T.

## Prioridad 3 — menores

Tile sin línea de visión (Fuego Feérico a través de muros); ataques de oportunidad contra invisibles; agarrado y derribado se levanta igual; empates en tiradas enfrentadas a favor del que actúa; la sorpresa se saltea el daño por turno y la regeneración; estados duplicados pierden la fuente o convierten permanentes en temporales; salvación de muerte el mismo turno en que caés por quemadura; espacio de 8.º nivel de Romain inutilizable; descripciones que no coinciden con lo que hace el código (Tomar Aliento, Hoja Envenenada, r5, bl5, jl5); aleatoriedad fuera de la semilla en giros y scripts; `useAbility` no valida alcance ni si la unidad tiene la habilidad (hoy lo protege la interfaz); datos sueltos (`deafened` inexistente en el pudín, rasgo `capture` sin implementar en Kethras, `gusano_caza` sin calibrar).

## Simplificaciones de diseño (no son errores; decidir si se mantienen)

Criaturas grandes ocupan una sola casilla; solo cobertura +2; ataques de oportunidad solo a 1 casilla; recursos completos en cada combate; levantarse del derribo es automático; diagonales cuestan 1; la IA conoce la posición de la compañía a través de la niebla; un aterrado siempre huye; el área no daña aliados; se pueden lanzar dos conjuros de nivel en un turno; Maleficio y Marca del Cazador no se pueden mover.

## Orden recomendado

1. Reglas núcleo (2, 3, 9, 10, concentración, furtivo, invisibles, largo alcance, muerte y estabilidad).
2. Habilidades (4, 6, 11 y escalados).
3. IA (5, 7, multiataque, curanderos, rematar caídos, ataques de oportunidad) y objetivos/oleadas (8, giros imposibles, escalado de oleadas).
4. **Recalibrar** todos los combates con un tope de vida: los números actuales están inflados para compensar los puntos 1–3.

---

## Estado: corregido (todas las prioridades 1 y 2, y la mayoría de las 3)

- **Reglas núcleo** (`battle.ts`): un impacto = un evento de daño (`damageHit`); crítico solo si acierta; curación con tope; velocidad 0 con inmovilizado/agarrado/incapacitado; concentración (una prueba por impacto, competencia, Bendecir 1d4, se rompe al quedar incapacitado); furtivo sin desventaja y una vez por turno (también en turno ajeno); invisibles y largo alcance; estable que recibe daño; salvaciones (inconsciente falla FUE/DES, inmovilizado con desventaja, esquivando con ventaja); Emboscador Terrible; sorpresa sin saltearse el inicio de turno; estados por fuente y «recién puestos»; empates; objetivos validados; casillas con línea de visión; espacios hasta 9.º.
- **Habilidades**: maniobras y Golpe Aturdidor preparan el próximo impacto (devuelven el dado o el ki si no se usan); concentración marcada por conjuro (Guardianes, Inmovilizar con salvación repetida y solo humanoides, Destierro fuera del campo, Miedo, Fuego Feérico, Enredador también con arco); Golpe de Llamas completo; escalados (Alma Radiante, Hexblade, Palabra de Resplandor, artes marciales, Palma Vibrante); Auxilio no se apila; Curar en Masa levanta caídos; artes marciales y Ráfaga después de Atacar; Asesinar; bendiciones de objetos fuera de la concentración.
- **IA y sistemas**: muertos que no atacan; control en área; multiataque a distancia; curanderos de cualquier bando que levantan caídos; no remata caídos; respeta ataques de oportunidad y resistencias; zafarse gasta la acción; huida de la mina con oleadas y sin victoria por eliminación; objetivos imposibles/regalados corregidos (estantes, Jann, «caído por el terreno» con corriente que arrastra); oleadas escaladas; sin furia doble; trampas del Cubo solo para la compañía; retraso de inteligencia solo en oleadas; aleatoriedad con semilla.
- **Escenas de historia** (`stage.ts`, `storyUI.ts`): sin deambular, sin rearmar el mapa en el mismo lugar, enemigos solo cuando la escena los presenta.
- **Dificultad**: la vida total enemiga tiene tope (`HP_RATIO` 1,3× la de la compañía; ×1,35 para jefes solos y ×1,15 para grupos de 2–3) y la calibración sube ataque (+1,4·ln p) y daño (+2,6·ln p). 36 combates recalibrados a ≈ 50 % con el bot (N = 40): la mayoría dura 6–11 rondas; los jefes con oleadas (Al-Mazhar, Eclipse, Dahhak) 14–22 con el bot. Cinco combates llegan al tope de potencia (×300) y quedan más fáciles que 50 %: Coloso, Gul-Amarat, Varreth, Reflejo de Pact y la revuelta del Orden.
