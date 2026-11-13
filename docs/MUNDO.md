# Zaryab · Mundo vivo y salvaguardas de avance

## Para que el grupo no se quede paseando

| Salvaguarda | Cuándo actúa | Qué hace |
|---|---|---|
| **Cuenta atrás del Eclipse** | Al caer el Capitolio (Cap. V): 80 días | Avisos a −30 y −10 días; HUD «🌑 Eclipse en N d». A 0, los capítulos sin hacer se saltan (`skipped_capN`) y se lanza el Cap. XIII con lo que tengan. |
| **Plazo de Razul** | Tras rechazar su trato (25 d) o negociar la tregua (14 d) | Razul «cobra»: −8 PF, +3 Alerta, −1 rep. Conclave. |
| **Zahir insiste** | Siempre tras el Cap. II mientras no avance la trama principal | Cada 12 d (10 tras Cap. VII, 8 tras Cap. XI) sin capítulo principal: −3 PF y −1 fe de los seguidores. |
| **Alerta del Conclave** | Cada 3 días +1 | Patrulla (4), asalto (7), cacería (10). |
| **Frentes de guerra** | Cada 6 días tras el Cap. V | Un distrito cambia de manos (Conclave +1 Alerta · Culto −2 PF · Nasnas · Libre). |
| **Errantes** | Cada 4 días tras el Cap. V | Enemigos sueltos en un distrito; si pasan 8 días sin enfrentarlos, +1 Alerta cada uno. |
| **Abandonar Zaryab** | Botón del mapa | Final «El Desierto». Confirmación y se borra la partida. |

## Ciudad y exploración
- **Fases del día**: 🌅 amanecer → ☀ día → 🌙 noche. Visitar un lugar, enfrentar un errante o reforzar un frente consume una fase; la tercera pasa el día. Misiones, Oráculo y descansos pasan días enteros.
- **Lugares (POIs)** en `src/world/pois.ts`: cada distrito tiene escenas cortas con coste de fase, horario (algunos sólo de noche), enfriamiento y consecuencias.
- **Lugares ocultos**: se descubren con rumores, siguiendo guardias o por confianza de un personaje (`Effect.found`).
- **Vínculos 0–5** con Aisha, Farid, EaNassr, Madam Shub, Samira, Nafisa y Abril (`src/world/bonds.ts`): a 3 y a 5 dan una ventaja única.
- **Frentes**: el color del nodo en el mapa indica quién manda en el distrito. Si lo domina el Conclave o el Culto, los puestos de personajes cierran (salvo vínculo ≥ 3). «Reforzar el frente» (−3 PF, una fase) lo devuelve a Libre.

## La carrera por los fragmentos

Desde la caída del Capitolio (Cap. V) hasta Razul (Cap. XII), otras tres facciones buscan el mismo fragmento que la compañía (`src/world/rivals.ts`):

| Rival | Sale de | Lo acelera | Lo frena |
|---|---|---|---|
| ♛ Conclave | Plaza | barrios que domina, Alerta alta | abatir recaudadores, reforzar sus barrios, bajar la Alerta |
| 🐍 Culto de Dahhak | Acueductos | barrios que domina; se desespera tras la muerte de Dahhak | abatir infiltrados, reforzar sus barrios |
| ✶ Thay (Kethras) | Zoco | el desorden: barrios en manos de alguien | espiar (sus informantes le venden un mapa falso) |

- **Fragmentos en disputa:** Dahhak (Iglesia, sin el Culto), Marid (Jardín), Al-Mazhar (Bajo), Gul-Amarat (Mina), Razul (Ciudadela, sin el Conclave).
- **Movimiento:** cada rival avanza un barrio por día por los caminos del mapa hasta el lugar del fragmento.
- **Excavación:** empieza recién cuando la compañía ya puede jugar ese capítulo; cada día avanza su velocidad × (0,3–1,7) al azar.
- **Llegar primero:** si un rival llega a 100 antes de que la compañía empiece el capítulo, gana fuerza (+15 % de velocidad), toma un barrio del frente y cobra: Conclave +2 Alerta; Culto −4 PF; Thay −2 rumores y −20 PO. Queda la marca `rival_<frag>` y `rival_<frag>_<facción>`. **El fragmento y el capítulo no cambian** (las variantes de capítulo serían la siguiente etapa).
- **En el mapa:** fichas de cada rival, su ruta punteada, el ◆ del fragmento en disputa y una franja con el avance (aproximado; exacto por dos días si se espía por 2 rumores).

### Simulación (`npm run sim:rivales`)

Juega campañas día por día con el mundo real (frentes, errantes, Alerta) y cinco ritmos de jugador. Resultado de referencia (600 partidas por ritmo):

| Ritmo | Días libres entre capítulos | Llegadas rivales por partida | Partidas sin ninguna |
|---|---|---|---|
| directo | ~1 | 0,00 | 100 % |
| normal | ~4 | 0,06 | 95 % |
| explorador | ~7 | 1,49 | 25 % |
| atento (como explorador, pero caza, refuerza y espía) | ~7 | 0,83 | 45 % |
| lento | ~11 | 4,7 | 0 % |

Reparto entre facciones (explorador): Conclave ~10 %, Culto ~50 %, Thay ~40 %. El Culto es el más difícil de frenar porque domina pocos barrios y deja pocos errantes.

## Archivos
`src/world/{pois,bonds,world,events}.ts`, `src/state.ts` (campos `phase, eclipseDay, found, bond, poiCd, front, roamers`; efectos `eclipse, fe, rumors, bond, found`), `src/ui/hubUI.ts`, `src/main.ts` (`passPhase`, `forceEclipse`).
