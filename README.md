# Zaryab: Las Entrañas de Piedra Viva

RPG táctico (SRPG) por turnos en navegador, sobre la campaña de D&D 5e «Zaryab». Cuadrícula isométrica en Canvas 2D, reglas de combate de 5.ª edición y una historia ramificada con medidores de **Corrupción**, **Devoción** y **Puntos de Fe**.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción
npm run sim        # simulación headless de los combates (60 partidas por encuentro)
npx tsx scripts/validate.ts   # valida encuentros, hablantes, tabla del oráculo y mapas
```

Atajos de depuración: `/?battle=linyera|acueducto|cubo` abre un combate directamente.

## Novedades de la v0.3

- **Cap. V · La Caída del Capitolio:** jefe con tres pilones que alimentan al Coloso, Dahhak que huye al llegar al 50 % de PG, oleadas de refuerzos, y la primera gran decisión (Orden / Pueblo / Sombra). Cierra el Acto I.
- **Seguidores estilo Cult of the Lamb:** oficios, fe, rasgos, víveres/materiales/rumores, sermones, rituales (Dab, banquete, casamiento de telas blancas, ofrenda, ascensión), deserción y guardias que combaten a vuestro lado.
- **Balance** con un bot competente: tabla de objetivos por nivel de dificultad en [`docs/DISENO.md`](docs/DISENO.md#9-balance-v03). `npx tsx scripts/sim.ts all 100` y `scripts/tune.ts`.

## Novedades de la v0.2

- **Mapa del mundo** (estilo Tactics Ogre) entre capítulos: 13 distritos, tiempo en días, *Alerta del Conclave* y eventos del reloj (patrulla, asalto al santuario, llamada de Zahir, cacería).
- **15 misiones**: principales (III, IV, y el Cap. V marcado como próximo), **10 secundarias/personales** (un arco inicial por cada PJ) con elecciones, combates y habilidades nuevas.
- **Oráculo de las Mil Lenguas**: tabla d100 (los 100 encuentros del resumen de campaña) + tablas d10 por zona. El Oráculo siempre miente: muestra un augurio falso y luego ocurre el evento real.
- **Santuario**: 8 edificios con efecto de juego (se compran con PF), seguidores, y **Milagros** de Devoción/Corrupción que se lanzan en combate gastando PF.
- **Reputación** de 7 facciones, habilidades cruzadas ganadas en los arcos, aliados (golem, escorpiones) y 5 mapas y 13 monstruos nuevos.
- Diseño completo de los tres actos, rutas y finales en [`docs/DISENO.md`](docs/DISENO.md).

## Qué incluye la v0.1

| Capítulo | Contenido | Fuente (canon) |
|---|---|---|
| I · El Juicio | Celda, juicio de Razul (frases por PJ), elección de escape/espera/negociación, pacto de Zahir | Sesión 1 |
| II · Las Ocho Casas | Distrito de las mentiras, **combate: Linyera de Dientes Blancos + guardias**, casa de Aisha y Farid, visión de Zahir | Sesión 1 |
| III · Los Pecados Bajo el Agua | EaNassr, taller de Al-Khush, hammam con Shul-Avar/Riyam/Tadhem, oráculo embustero, **combate: ghuls mutados del acueducto**, sacrificio de la alfombra, Si'lats y Azuran | Sesión 3 (extendida) |
| IV · El Reflejo se Rompe | Ira de Zahir, **puzzle de las seis marcas**, **combate: reflejos corruptos** (uno por cada alma mal colocada), estatuas de dioses falsos, Dahhak y el Coloso (cliffhanger) | Sesión 3 |

## Reglas implementadas (5e)

- Iniciativa d20+DES, casillas de 5 ft (diagonal = 1), movimiento con terreno difícil, muros, coberturas (+2 CA), peligros y plataformas.
- Ataques d20 con ventaja/desventaja, críticos, 20/1 naturales, bendición/perdición, flanqueo de Ataque Furtivo.
- Salvaciones, resistencias/inmunidades/vulnerabilidades, concentración (CON CD 10 o ½ daño), **salvaciones de muerte**, daño en 0 PG, muerte instantánea.
- Espacios de conjuro y recursos por descanso (ki, dados de superioridad, Canalizar Divinidad, Oleada de Acción…).
- Condiciones: derribado, cegado, envenenado, aterrado, hechizado, paralizado, aturdido, inmovilizado, invisible, ardiendo…
- Monstruos con multiataque, recarga 5-6, explosiones al morir, ventaja de enjambre; IA que puntúa acción × casilla × objetivo.
- Los PJ caídos: o bien el cristal de Zahir los devuelve (+1 Corrupción, −3 PF) o muerte permanente (opción del menú).

## Fichas de personaje

Romain, Pact Risen, Rabb Locke y Joren Hell salen de los PDF. **Zyr'thar y Panchi no tenían ficha** en los archivos: usan stats estimados de un Pícaro (Asesino) y un Monje enano de nivel 3 (`src/data/party.ts`, `sheet: 'estimada'`). Discrepancias a revisar:

- Romain: la ficha dice CA 10 (sin armadura) con 21 PG.
- Pact: la ficha muestra CA 11, pero su inventario trae cota de mallas; se usa CA 16.
- Joren: la ficha no muestra PG; se estimaron 25. Se escribe «Hell» (ficha y esqueleto); los resúmenes dicen «Jell» y «Jorem».
- Panchi/Punchi: se usa «Panchi» (resúmenes del DM).

## Estructura

```
src/engine   dice · grid (LOS) · battle (reglas) · abilities · ai · setup
src/data     party (fichas) · monsters (statblocks) · maps (+ encuentros)
src/story    script (guion por capítulos) · speakers · types
src/ui       render (isométrico) · battleUI · storyUI · dom
scripts      sim.ts (headless) · playtest.mjs / storytest.mjs (Playwright)
```

## Hoja de ruta

- Coloso de Dahhak (jefe; los Qilaat ya están definidos), plaza central y guerra civil.
- Pelea contra los tres djinns (Shul-Avar es CR 8: necesita balance o una versión de huida).
- Medinat al-Rih: torneo de Panchi contra Ellie/Sifra, manifiesto de Joren, misión del Vizir a Romain.
- Subida de nivel ligada a PF, mejoras del santuario, inventario, finales múltiples (Liberación, Destrucción, Gobierno, Equilibrio, Sacrificio).
- Gusano de Brazos (Gul-Amarat) como escenario de huida, no como combate.

## v0.4 · Inventario, terreno y decisiones morales
- **Terreno destruible**: barriles que explotan, fuego que se propaga, muros frágiles, cobertura que se rompe y muros de piedra que se alzan.
- **Inventario**: equipo (arma, armadura, talismán) por personaje, consumibles en combate («🎒 Objeto», tecla I), tienda de EaNassr, taller y botín.
- **Decisiones morales**: 13 misiones nuevas (`docs/MISIONES.md`), pruebas de habilidad con CD, ecos diferidos y huellas.
