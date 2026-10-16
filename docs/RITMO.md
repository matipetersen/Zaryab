# Ritmo narrativo: tensión · relajación · clímax (v0.4)

Cada capítulo se diseña con tres piezas: **tensión** (amenaza o duda), **alivio** (escena sin combate donde los personajes respiran) y **clímax** (decisión o jefe que cambia algo).

| Cap. | Tensión | Alivio | Clímax | Hilo de Zahir |
|---|---|---|---|---|
| 0 Prólogo | Tormenta, pilares, captura | Marcha y camaradería con Nadir | Los ibis negros | — |
| I Juicio | Tortura de Razul | Limbo blanco | Pacto con Zahir | Promesa amable |
| II Casas | El Linyera, las 8 casas | La casa de Aisha | Curar a Farid | Primer favor |
| III Agua | Hammam, tres djinns | Taller de Al-Khush | Estafar a EaNassr o matar al Efrit | Fragmento 2 |
| IV Reflejo | Zahir Caído acusa a cada PJ | Cubo de espejos | Elegir cómo responder; seis marcas | Furia |
| V Capitolio | Los Qilaat, el Coloso | — | Jefe + Postura | Se asusta |
| VI Medinat | Revuelta | Torneo | Panchi pierde; Joren y el muerto que respira | Distante |
| VII Iglesia | Dahhak | Prueba de Azuran | Jefe + sentencia | Pregunta sin respuesta |
| **noche 1** | — | **La Cena de la Biblioteca** | Regalo de Zahir | Generoso |
| VIII Vizir | Razul en la mesa | Un vaso de agua | Entregar, negociar o rechazar el trato | «Os lo dije» |
| IX Jardín | Fiesta de máscaras | Zyr'thar y su sombra | Marid: hablar o pelear | Confiesa que os eligió por vuestras heridas |
| **noche 2** | — | **Lo que se dice a media voz** (Samira, Romain) | Confiar en Samira | — |
| X Lago | Cripta, Al-Mazhar | Cena con la nana | **Cantar la nana (sin combate) o combatir** | Dice «gracias» |
| **noche 3** | — | **La Nana** | Decir la verdad a Farid | Dolido |
| XI Mina | Huida de 8 rondas | — | Sacrificio o jefe | **Ruega** los fragmentos |
| **noche 4** | — | **La Víspera** (despedidas, Ellie) | Promesa de Zahir | Su mejor oferta |
| XII Ciudadela | Infiltración | **Sala de las Voces** (lore: Merab, el Simurg, Farid) | Razul: Silencio, alianza o combate | Confiesa que vio morir a Yasmin |
| XIII Eclipse | Revelación | Aliados que reaparecen | **Seis destinos + Pacto Roto** | Se cae la máscara |

## Cambios de v0.4 sobre esta estructura
- **Cuatro interludios** (`src/story/interludes.ts`) se disparan solos entre jefes: no hay combate, hay mesa, nana, confidencias y despedidas. Cada uno deja huellas (`cena_cocina`, `samira_confia`, `farid_sabe`, `vispera_*`) que ahora se usan en el final.
- **Razul** (Cap. VIII y XII) deja de ser un jefe silencioso: se sienta a la mesa, pide un vaso de agua, cuenta a Merab, Hadir y al Profeta de los Vientos, y su historia con Yasmin (la niña que murió de sed). Puede aliarse con el grupo contra Zahir.
- **Zahir** tiene un arco visible: promesa amable → regalo → confesión → agradecimiento → ruego → mejor oferta → revelación. Cada oferta aceptada empuja la Ruta Sombra.
- **Variación de jefes:** Al-Mazhar puede caer sin combate con la nana de Farid (Religión CD 16 de Romain); el Marid puede resolverse hablando (Persuasión CD 14 con Nafisa o 17 sin ella).
- **Hilos recuperados en el Eclipse:** Ellie (Pacto Roto), Seraphel, Samira, Razul aliado, el Marid liberado, Grethak. Con la venda de Ellie, Zahir queda sin su máscara y el jefe final pierde un 35 % de PG.
- **Cap. IV** gana la elección de responder a Zahir Caído.
- Aceptar el trato de Razul (Cap. VIII) **quita los Milagros** del culto.

## Lo que sigue flojo (honesto)
- Los capítulos del Acto III siguen siendo más cortos que los del Acto I; el Cap. XI en particular se apoya en la mecánica (huida) más que en la escena.
- El texto de los interludios y de Razul está escrito de una vez: necesita lectura en voz alta y ajustes de tono.
- No hay una pasada de diálogo para Panchi, Pact o Zyr'thar en los interludios 2 y 3.
