# Arquetipos y viaje del héroe aplicados a Zaryab (propuesta, nada implementado)

Marco: el viaje del héroe de Campbell/Vogler (mundo ordinario → llamada → rechazo → mentor → umbral → pruebas → calvario → recompensa → regreso → resurrección → elixir) y los arquetipos de personaje (héroe, mentor, guardián del umbral, heraldo, cambiaformas, sombra, embaucador, aliado).

## Quién es quién hoy
| Arquetipo | En Zaryab ya está | Falta explotarlo |
|---|---|---|
| Mentor (falso) | **Zahir** | Un mentor *verdadero* que muera o falle |
| Heraldo | Ellie / Sifra | Un heraldo del Conclave |
| Guardián del umbral | Linyera, Coloso | Un guardián que se vuelva aliado |
| Sombra | Razul | Una «sombra» propia de cada PC |
| Embaucador | EaNassr, Madam Shub | Un embaucador que ayude *a costa de* alguien |
| Cambiaformas | Nafisa, Seraphel, Kethras | Alguien cuyo bando cambie según vuestras decisiones |
| Aliado | Aisha, Farid, Samira | Un aliado que se pierde |

## Mapa de etapas por acto
- **Acto I (mundo ordinario → umbral):** Llamada = Zahir. Rechazo = dudar del pacto. Umbral = las Casas. Pruebas = Cap. III–V.
- **Acto II (pruebas, aliados, enemigos → calvario):** cada falso dios es una prueba que refleja una herida de un PC. Calvario = Cap. VIII (Razul en la mesa).
- **Acto III (camino de regreso → resurrección → elixir):** la Mina es el descenso; el Eclipse, la resurrección; el final, el elixir (qué le llevan a Zaryab).

## Historias nuevas propuestas (una por capítulo, sin tocar la trama principal)
1. **Cap. 0–II · El mentor que no era (Mentor).** Nadir, el guía del prólogo, reaparece en el Bajo: sabe más de los pilares de lo que dijo. Si le salvan, es mentor; si le dejan, es heraldo del Conclave.
2. **Cap. III · El guardián amigo (Guardián del umbral).** Shul-Avar, el efrit, pide que lo acompañéis a un último encargo antes de ser libre. Prueba de lealtad, no de combate.
3. **Cap. IV · La sombra de cada uno (Sombra).** En el Cubo de espejos cada PC se ve una vez a sí mismo; elegir cómo responder fija su arquetipo (héroe, caído, vengador).
4. **Cap. V · El primer ritual (Calvario).** Antes del Coloso, una noche de vigilia donde cada PC cuenta de qué huye.
5. **Cap. VI · El heraldo que viene de lejos (Heraldo).** Un mensajero de Qadir-Kalmah trae la primera carta de Ellie para Panchi; elegir si leerla antes o no.
6. **Cap. VII · El mentor falso (Mentor falso).** Dahhak intenta convertir a Pact en su aprendiz; el reflejo del mentor corrupto.
7. **Cap. VIII · El embaucador generoso (Embaucador).** EaNassr os ofrece vender a Razul su silencio por un precio; si aceptáis, el Conclave os cobra el doble.
8. **Cap. IX · El cambiaformas (Cambiaformas).** Seraphel o Nafisa «cambian de rostro» según vuestro trato con ellas: aliadas, rivales o reclutas.
9. **Cap. X · El viaje al fondo (Descenso).** Farid, que canta con el lich, es el *niño divino*: arquetipo inocente que ve lo que los adultos no ven.
10. **Cap. XI · El aliado que se pierde (Aliado).** Un personaje que os acompañó desde el Acto I muere o se queda atrás en la Mina; peso emocional antes del final.
11. **Cap. XII · La sombra que habla (Sombra).** Razul no es sólo antagonista: es lo que el héroe puede volverse. Cada PC debe poder decir qué comparte con él.
12. **Cap. XIII · La resurrección (Resurrección).** Un último rito donde cada PC deja atrás su arquetipo viejo (el caído, el amnésico, el vengador…) por el que elige ser.

## Arquetipos de los PC (para dar «sabor» propio)
| PC | Arquetipo base | Evolución natural |
|---|---|---|
| Romain | El Sabio huérfano | El Juez compasivo ↔ el Verdugo |
| Pact | El Caído que busca redención | El Redentor ↔ el Tirano |
| Rabb | El Amnésico buscador | El Autor de sí mismo ↔ la Herramienta |
| Joren | El Forajido vengador | El Protector ↔ el Cazador |
| Zyr'thar | La Traidora embaucadora | La Guardiana ↔ la Sombra |
| Panchi | El Guerrero furioso | El Maestro ↔ la Llama |

Ya existen caminos Luz/Sombra/Equilibrio al subir de nivel; esto los vincularía a escenas.

## Cómo implementarlo sin reescribir
- Las historias 1–11 caben como **misiones secundarias** o **entreactos reactivos** (`src/story/novelReact.ts`) disparadas por el arquetipo dominante de cada PC.
- Un marcador por PC (`arq_romain = caido|redentor|…`) que cambia con elecciones puntuales y alimenta el epílogo.
