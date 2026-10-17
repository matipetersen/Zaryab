# El Gusano de Cabeza de Martillo: el enemigo que no muere

**Idea original:** como el gusano real (una especie invasora que rebrota de sus propios trozos), no se puede matar. Persigue a quien lleva fragmentos del meteorito y crece con lo que devora.

## Reglas (implementadas)
- **Empieza a cazar** tras el Cap. III y mientras lleven al menos un fragmento (`fragmento_2`, `fragmento_3`, Dahhak, Marid, Al-Mazhar, Gul-Amarat, Razul). Se cuentan fragmentos distintos (`fragments()` en `src/world/gusano.ts`).
- **Frecuencia:** ataca cada `16 − 2·fragmentos − ⌊poder/4⌋` días (mínimo 5). Dos días antes, el diario avisa («la tierra tiembla bajo el barrio») y el HUD muestra «🪱 Etapa · cerca».
- **Poder 0–14:** +1 cada 14 días y +1 cada vez que devora. Etapas: Cría (0–2) · Adulto (3–5) · Colosal (6–9) · Abismal (10+).
- **Cada ataque** (evento `gusano_caza`, se dispara en el mapa, nunca en medio de un capítulo):
  1. *Huir por los túneles* — Sigilo CD 12 + poder. Si falla, los alcanza y devora algo.
  2. *Plantarle cara* — combate de supervivencia de 6 rondas. No se puede matar: se hunde herido. Más poder = más PG, ataque y daño; con poder ≥ 6 sale una segunda cabeza, y otra con ≥ 11.
  3. *Dejar que coma* — devora algo y crece, pero los deja en paz ~8 días.
- **Devorar:** 40 % un seguidor (nunca un guardia), si no 4 víveres, si no 40 PO y 6 PF.
- **Epílogo:** lo que escarba bajo la ciudad cierra los finales con cuatro versiones según su poder (`gusano_cria/adulto/colosal/abismal`).

## Balance (bot, 20 partidas, nivel de la fase)
| Poder | Nivel | Muertes/combate | PG restantes |
|---|---|---|---|
| 0 | 5 | 0,25 | 73 % |
| 5 | 7 | 0,30 | 79 % |
| 6 (2 cabezas) | 8 | 1,0 | 58 % |
| 12 (3 cabezas) | 10 | 2,7 | 37 % |

Se pensó para que hasta el nivel de la mitad de la campaña sea un susto y de ahí en adelante un impuesto caro. Sin probar con humanos.

## Pendiente
- Un clímax propio (p. ej. una escena en el Cap. XII o XIII donde el Gusano aparezca como obstáculo o como arma).
- Que los edificios y vínculos también puedan ser «devorados».
- Distinguir en el texto a este gusano del Gul-Amarat (Cap. XI) si hay confusión de nombres.
