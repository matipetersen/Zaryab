# Zaryab · Mundo vivo y salvaguardas de avance

## Para que el grupo no se quede paseando

| Salvaguarda | Cuándo actúa | Qué hace |
|---|---|---|
| **Cuenta atrás del Eclipse** | Al caer el Capitolio (Cap. V): 80 días | Avisos a −30 y −10 días; HUD «🌑 Eclipse en N d». A 0, los capítulos sin hacer se saltan (`skipped_capN`) y se lanza el Cap. XIII con lo que tengáis. |
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

## Archivos
`src/world/{pois,bonds,world,events}.ts`, `src/state.ts` (campos `phase, eclipseDay, found, bond, poiCd, front, roamers`; efectos `eclipse, fe, rumors, bond, found`), `src/ui/hubUI.ts`, `src/main.ts` (`passPhase`, `forceEclipse`).
