# Niveles y evolución de arquetipos (v0.4)

Sistema de progresión 1 → 15 basado en D&D 5e. Datos en `src/data/progression.ts`; habilidades nuevas en `src/engine/abilities2.ts`; pantalla en `src/ui/levelUI.ts`.

## Cómo se sube de nivel
- **XP del grupo** (compartido). Umbrales propios de la campaña (no los de la tabla 5e, porque el XP de los monstruos aquí es distinto): 2: 120 · 3: 400 · 4: 1 100 · 5: 2 500 · 6: 8 000 · 7: 12 000 · 8: 16 000 · 9: 20 500 · 10: 25 000 · 11: 29 000 · 12: 33 000 · 13: 37 500 · 14: 42 000 · 15: 47 000.
- **Se empieza en el nivel 1.** Las fichas canónicas son de nivel 3, así que los niveles 1 y 2 se obtienen *recortando* la ficha (PG, espacios y recursos, rasgos de subclase): Romain 9 PG, Pact 12, Rabb 11, Joren 11, Zyr'thar 9, Panchi 11 a nivel 1. Los niveles 2 y 3 del prólogo se ganan solos (no hay elecciones); a partir del 4 se eligen en el mapa.
- **Tope por hito:** nivel 1 hasta la emboscada del prólogo · 2 hasta el Juicio · 3 hasta las Casas · Acto I ≤ 5 · tras el Cap. V ≤ 10 · tras el Cap. X ≤ 15.
- El botón **⬆ Subir a nivel N** aparece en el mapa. «Automático» elige por ti (atributo principal y camino según Devoción/Corrupción).

## Qué te da cada nivel
- **PG** (dado de golpe medio + CON), **bono de competencia** (+3 a nv 5, +4 a nv 9, +5 a nv 13), CD y ataques de conjuro.
- **Rasgos de clase automáticos** (Ataque Extra, espacios de conjuro, recursos, conjuros nuevos…). Ver tabla abajo.
- **Mejora de característica o dote** en los niveles de ASI (nv 4, 8, 12; el Guerrero también 6 y 14; el Pícaro también 10). Una mejora es «+2» a una puntuación ≈ +1 al modificador. Dotes: Duro, Alerta, Móvil, Lanzador de Guerra, Resistente.
- **Evolución de arquetipo** en los niveles 5, 9 y 13.

## Evolución de arquetipo (el sistema propio de Zaryab)
En cada una de las tres evoluciones eliges entre tres caminos:
- **Camino de la Luz** — requiere Devoción (2 / 4 / 6).
- **Camino de la Sombra** — requiere Corrupción (2 / 4 / 6).
- **Camino del Equilibrio** — siempre disponible, más modesto.

Las decisiones morales de la campaña deciden qué caminos podés tomar. Se puede mezclar (Luz en la 1.ª, Sombra en la 2.ª…).

| Personaje | Luz | Sombra |
|---|---|---|
| Romain (Clérigo de la Tumba) | Guardián de Almas: Luz del Simurg → **Aura de Vida** → Santo de Zaryab | Verdugo de la Balanza: Toque Mortal → **Aura de Sombra** → Juez de Almas |
| Pact (Maestro de Batalla) | Caballero de Azuran: Golpe Radiante → **Aura de Valor** → Alas de Azuran | Caballero de Obsidiana: Filo Caído → Corona Invertida → Alas de Obsidiana |
| Rabb (Hexblade) | Pactario Libre: Voluntad Propia → Armadura de Voluntad → Pacto Roto | Eco del Pacto: Eco del Pacto → Sed del Hexblade → Mil Voces |
| Joren (Acechador de la Penumbra) | Centinela del Pueblo: Ojo de Cazador → Paso Ligero → Aura de Valor | Cazador de la Penumbra: Penumbra → Acechador Letal → Sombra Absoluta |
| Zyr'thar (Asesino) | Guardián del Alba: … → Sombra Protectora → Ángel de las Sombras | Cuchillo de Vel'Shara: Veneno Lento → Mano de Sombra → Cuchillos de Vel'Shara |
| Panchi (Monje) | Puño Abierto: … → Palma Sanadora → Corazón de Piedra | Puño Cerrado: … → Ira Rígida → Llama Estancada |

## Rasgos automáticos principales
- **Romain:** Llama Sagrada (4), Guardianes Espirituales y Revivir (5), Destierro y Protección contra la Muerte (7), Golpe Divino (8), Curar en Masa y Golpe de Llamas (9), Intervención Divina → Juicio Final (10), Sanar (11), Canalizar ×2 (6).
- **Pact:** Ataque Extra (5) y ×3 (11), maniobras Derribo/Amenaza (5), Indómito (9, 13), dados d10 (10), 5–6 dados de superioridad.
- **Rabb:** Estallido Agónico (4), Ataque Extra y 2 rayos (5), Espectro Maldito (6), espacios de brujo hasta 5.º nivel, Arcano Místico 6.º/7.º (11/13), Bebedor de Vida (12), 3 rayos (11).
- **Joren:** Golpe Enredador (4), Ataque Extra (5), Mente de Hierro (7), Lluvia de Flechas (9), Descarga (11), Esquiva Asombrosa (15).
- **Zyr'thar:** Ataque furtivo escalado (⌈nivel/2⌉d6), Esquiva Asombrosa (5), Evasión (7), Hoja Envenenada (9), Bomba de Humo (11).
- **Panchi:** ki = nivel, Ataque Extra y Golpe Aturdidor (5), Plenitud Corporal (6), Evasión (7), Pureza Corporal (10), dado marcial d8/d10 (5/11), Alma de Diamante (14), Palma Vibrante (15).

## Escalado de encuentros por nivel
Las escalas de `maps.ts` están calibradas para nivel 3; en niveles 1 y 2 los enemigos usan un factor fijo (×1,2 y ×1,4 sobre su escala; variables `LOW1`/`LOW2` del simulador). En `levelScale()` (progression.ts) los enemigos crecen con el nivel del grupo (PG ×(nivel/3)^2.2, ataque +1/nivel, daño +0,9/nivel). Resultados del simulador con el bot, **en el nivel de diseño de cada capítulo** (sin aliados ni objetos): jefes ≈ 63–100 %, combates normales ≈ 100 % con 0,1–0,9 muertes. Es una primera calibración: hay que revisarla jugando.

## Aproximaciones (honestas)
- Armadura de Maleficios (Rabb) se reduce a +1 CA; Mente de Hierro y Alma de Diamante dan competencia de salvación, no repetición.
- El bot de balance no usa todas las habilidades nuevas, así que subestima el poder de un jugador humano.
- Las puntuaciones de característica no existen en las fichas (sólo modificadores): +2 a una puntuación = +1 al modificador.

## XP de hito y esquivar combates (v0.5)
Resolver un jefe hablando, con sigilo o con un sacrificio no daba XP, así que quien esquivaba llegaba muy por debajo del nivel de diseño. Ahora, al cerrar ciertos capítulos, la XP sube al mínimo garantizado (`MILESTONE_XP` en `progression.ts`): Cap. IV 1.100 · V 2.500 · VI 8.000 · VII 16.000 · IX 20.500 · X 25.000 · XI 33.000 · XII 37.500. Es el nivel de diseño del próximo jefe menos uno.

`npx tsx scripts/campaign-xp.ts` compara el nivel de llegada a cada jefe contra su nivel de diseño. Modelo burdo (XP base de los monstruos, sin escalado ni misiones fuera de la lista): quien **pelea todo** llega 1–2 niveles por encima del diseño en el medio del juego; quien **esquiva todo** llega **−1 nivel** a cada jefe (≈ 43 % para el bot, antes llegaba a −7 en la Ciudadela, ≈ 12 %).
