# Zaryab — Diseño completo del RPG

Este documento fija cómo se juega y cómo evoluciona toda la historia. Está pensado como un *Tactics Ogre*: un mapa del mundo al que se vuelve entre batallas, capítulos con decisiones que bifurcan la trama, un ejército (la compañía y el culto) que crece, y finales que son consecuencias, no premios.

Todo lo que dice «canon» sale de las sesiones jugadas (resumen de campaña, Sesiones 1–3, fichas). Lo que dice «propuesta» es diseño nuevo para cerrar los huecos hasta el nivel 15.

---

## 1. Pilares

1. **Dos medidores morales, no uno.** *Corrupción* (poder rápido, con precio) y *Devoción* (aliados, con riesgo). Ambos de 0 a 10 y pueden subir a la vez. No es Ley/Caos de Tactics Ogre: aquí se puede ser devoto *y* corrupto, y eso tiene su propio final (Equilibrio).
2. **Puntos de Fe (PF) como moneda del culto.** Se ganan convirtiendo gente, completando misiones y sacrificando cosas; se gastan en el santuario (edificios) y en combate (Milagros). Trampa de Zahir (canon): *cada PF que se gana debilita el sello que contiene al Simurg verdadero*. El juego lleva la cuenta (`sello`) y el final lo lee.
3. **La mentira es el idioma de la ciudad.** El Oráculo de las Mil Lenguas miente siempre. Los NPC omiten. Zahir nunca miente pero omite. El jugador aprende a leer lo que *no* se dice.
4. **Los personajes no son clases.** Los seis PJ tienen su ficha de D&D y su arco personal; cada arco cambia habilidades y finales.
5. **El mundo avanza con el reloj.** Cada acción en el mapa cuesta días. La *Alerta del Conclave* sube con el tiempo y con los actos ruidosos; cuando se desborda, el Conclave ataca el santuario.

---

## 2. Estructura en tres actos

Nivel D&D entre paréntesis. «★» = capítulo principal (obligatorio, desbloquea el siguiente). Los capítulos 1–5 ya existen en el código o están especificados con su batalla.

### ACTO I — El Despertar del Culto (niveles 1–5)
| Cap. | Título | Qué pasa | Batalla / escenario | Decisión clave | Estado |
|---|---|---|---|---|---|
| I ★ | El Juicio | Cárcel, juicio de Razul, pacto de Zahir | — | Escapar / esperar / negociar; aceptar / preguntar / negarse | **Hecho** |
| II ★ | Las Ocho Casas | Bajo Zaryab, el Linyera, Aisha y Farid, primer santuario | Linyera + guardias | Cómo curar a Farid | **Hecho** |
| — | *El mapa se abre* | Tras el Cap. II aparece el **Mapa de Zaryab**: tiempo libre, misiones secundarias, oráculo, santuario | — | — | **Hecho (v0.2)** |
| III ★ | Los Pecados Bajo el Agua | EaNassr, Al-Khush, los tres djinns, acueducto, fragmento 2, Si'lats (Azuran) | Ghuls mutados; huida con alfombra | Estafar / matar al Efrit / (pelear) | **Hecho** |
| IV ★ | El Reflejo se Rompe | Zahir furioso, Cubo de los Mil Reflejos, fragmento 3, estatuas de dioses falsos | Reflejos corruptos | Seis marcas | **Hecho** |
| V ★ | La Caída del Capitolio | Dahhak ataca la plaza; el Vizir despierta a los Qilaat y al Coloso | **Jefe: Coloso corrupto + pilones + Dahhak (huye)** | **Primera bifurcación**: defender el Capitolio / proteger al pueblo / dejar caer al Vizir | **Hecho (v0.3)** |

**Fin del Acto I:** guerra civil. Dahhak escapa hacia la Iglesia del Simurg. El culto entra en crisis (Zahir ya no controla todo). La decisión del Cap. V marca la *Postura*: **Orden** (con Razul), **Pueblo** (con los Hijos del Simurg y los Nasnas), o **Sombra** (se deja que caiga y se negocia con lo que quede).

### ACTO II — Los Fragmentos del Simurg (niveles 6–10)
Zaryab está en guerra civil. El mapa tiene *frentes*: cada distrito cambia según quién lo controla.

| Cap. | Título | Qué pasa | Batalla / escenario |
|---|---|---|---|
| VI ★ | Medinat al-Rih | Revolución de los Nasnas. Torneo de los Puños Cerrados (Panchi vs **Sifra la Silente = Ellie**). Manifiesto de Joren | Torneo (duelo), disturbios |
| VII ★ | La Iglesia del Simurg | Cubil de Dahhak. Las Si'lats guían. Prueba de Azuran (Pact) | **Jefe: Dahhak (formas de víbora)** |
| VIII ★ | La Visita del Vizir | Razul en persona (si Corrupción alta) o sus Inquisidores. Defender/evacuar/negociar el santuario | **Defensa del santuario** (oleadas) |
| IX ★ | El Jardín de los Suspiros | Fiesta de máscaras de Lady Nafisa; el Marid custodia el 4.º fragmento | Marid / infiltración |
| X ★ | El Hijo del Lago | Farid canta con el Lich. Romain debe *medir* su alma. Al-Mazhar al-Khalid y los ghuls | **Jefe: Al-Mazhar (Lich de las Trece Caras)** |

**Fork del Acto II (Tactics Ogre):** al terminar el Cap. VIII el juego calcula la **Ruta** (ver §3). Los capítulos IX–X cambian de aliados y enemigos según la ruta.

### ACTO III — El Eclipse (niveles 11–15)
| Cap. | Título | Qué pasa | Batalla / escenario |
|---|---|---|---|
| XI ★ | La Veta Maldita | Mina de Alabastro (4 niveles). Capitana Samira, Abril. **Gul-Amarat no se derrota: se esquiva** | Exploración + **huida de 12 rondas** |
| XII ★ | La Ciudadela de los Susurros | Infiltración. Razul = *Razul ibn Tameer*, arcanista que lleva tres milenios viendo repetirse la Espiral del Dios Caducado. Inquisidor Kaelen | Golems, Inquisidores, Razul |
| XIII ★ | El Ritual del Eclipse | Catacumbas del Simurg. Zahir revela que es un fragmento, no un dios. Reunir los fragmentos | **Jefe final** (varía por ruta) |

---

## 3. Rutas y finales

### Cómo se decide la ruta (fin del Cap. VIII)
```
si Corrupción ≥ 7 y Devoción ≤ 4      → Ruta SOMBRA   (Camino de Zahir)
si Devoción  ≥ 7 y Corrupción ≤ 4     → Ruta FE       (Camino del Simurg libre)
si ambos entre 4 y 6 o Postura=Orden  → Ruta BALANZA  (Camino del Juez)
si no (valores mezclados)             → se elige según la Postura del Cap. V
```
Además, tres **rutas ocultas** se abren con flags: *El Silencio* (Romain cumple la misión del Vizir + Pact recupera a Azuran), *El Sacrificio* (un PJ cierra la puerta a Gul-Amarat), *La Espiral* (todos los fragmentos entregados a Zahir sin preguntar).

### Quién está contigo en cada ruta
| | Ruta FE | Ruta SOMBRA | Ruta BALANZA |
|---|---|---|---|
| Aliados | Hijos del Simurg (Shib), Nómadas del Vacío, Si'lats, Samira, Al-Khush, Aisha | Zahir, Mercaderes (EaNassr), Dahhak *(alianza traicionera)*, Lady Nafisa | Razul y los Qilaat, Samira, Ellie, Romain como Juez |
| Enemigos | Conclave, Inquisidores, Dahhak | Hijos del Simurg, Nómadas, Razul | Dahhak, Lich, Zahir |
| Tono | Esperanza costosa | Poder con precio | Orden frágil |
| Final posible | Liberación · Sacrificio | Gobernar · La Espiral | Equilibrio · El Silencio |

### Finales (canon + propuesta)
1. **Liberación del Simurg** — unir los tres fragmentos + Devoción ≥ 7 + `sello` ≤ 30. Zaryab cae, los djinns son libres.
2. **Destrucción de Zaryab** — destruir los fragmentos para detener a Gul-Amarat. Supervivencia con culpa.
3. **Gobernar Zaryab** — Corrupción ≥ 7. Zahir de consejero. El Simurg sigue dividido y hambriento.
4. **Equilibrio** — Corrupción y Devoción entre 4 y 6. Zaryab sobrevive; el Gusano duerme.
5. **El Sacrificio Final** — un PJ se queda atrás. Cada PJ tiene su variante (Romain: el santo; Pact: el juez; etc.).
6. **El Silencio** *(propuesta, del canon de Razul)* — *«Zaryab no necesita un dios. Necesita silencio suficiente para decidir sola.»* Ningún dios gana. Los fragmentos se entierran; los djinns eligen quedarse o irse; Razul se apaga con su Corazón Dormido.
7. **La Espiral** *(final malo)* — `sello` ≥ 60: Zahir se libera como el Simurg… y no es misericordioso.

Cada final tiene un epílogo por PJ (ver §5).

---

## 4. Sistemas

### 4.1 Mapa del mundo (hub)
Pantalla entre capítulos. Cada **distrito** es un nodo con: descripción, peligro, misiones disponibles, y la acción *Recorrer* (tira el Oráculo). Desde el mapa se puede:
- Iniciar la **misión principal** (★ pulsante).
- Aceptar **secundarias** y **personales** de ese distrito.
- **Recorrer** el distrito (Oráculo de eventos).
- Ir al **Santuario** (gastar PF, ver seguidores, Milagros).
- **Descansar** (pasa el día; recupera todo; sube la Alerta un poco).

**Distritos** (canon): Bajo Zaryab, Zoco de los Mil Soplos, Ciudadela de los Susurros, Jardín de los Suspiros, Pozo/Lago de los Silencios, Mina de Alabastro, Acueductos del oeste, Plaza Central (Capitolio y Cubo), Catacumbas del Simurg, Medinat al-Rih (este), Iglesia del Simurg (oeste), Qadir-Kalmah (ciudad de ruinas móviles de Ellie) y el **Santuario** (la biblioteca).
En el Acto I sólo están abiertos Bajo Zaryab, Zoco, Acueductos, Pozo, Plaza y Jardín; el resto se abre por historia.

### 4.2 Tiempo y Alerta
- **Día:** cada misión o exploración cuesta 1 día (algunas 2). Empieza el día 1.
- **Alerta del Conclave (0–10):** sube con actos ruidosos (matar guardias, robar, misiones en la Ciudadela), +1 cada 3 días, y baja con acciones discretas (+Devoción, sobornos, Torre del Vigía).
- **Umbrales:**
  - 4 → *Patrulla*: el Conclave rastrea a un seguidor (combate corto o soborno).
  - 7 → *La Visita del Vizir* (Cap. VIII anticipado): asalto al santuario. Defender / evacuar / negociar (canon).
  - 10 → *Cacería*: cada distrito tiene patrullas; el santuario cae si no hay Torre del Vigía.
- **Presión principal:** si pasas 12 días sin avanzar la historia principal, Zahir te llama («No les di la segunda vida para que la gasten»).

### 4.3 Puntos de Fe, Santuario y Milagros
**Edificios** (canon, costes en PF) — cada uno tiene efecto de juego:
| Edificio | PF | Efecto |
|---|---|---|
| Altar de Huesos | 20 | +1d6 PF cada vez que eliges una opción con Corrupción |
| Biblioteca Oculta | 35 | Desbloquea opciones de «consultar los libros» en eventos y misiones |
| Torre del Vigía | 40 | Alerta −1 por semana; permite evacuar el santuario sin perder PF |
| Pozo de Visiones | 50 | Puedes repetir una tirada del Oráculo y ver el augurio verdadero |
| Lámpara de Djinn | 15 | Revela qué opción de una elección es una mentira |
| Alfombra Viviente | 25 | Viajar entre distritos no cuesta días |
| Espejo del Alma | 30 | Muestra los efectos de Corrupción/Devoción de cada opción |
| Collar de Sumisión | 45 | (+3 Corrupción) Controla a un enemigo humanoide una vez por combate |

**Milagros** (canon: habilidades de culto, cuestan PF en combate; los lanza cualquier portador del cristal):
| Milagro | Rama | Requisito | Coste | Efecto |
|---|---|---|---|---|
| Bendición de las Arenas | Devoción | Dev ≥ 2 | 5 PF | Aliados a 2 casillas recuperan 1d8+2 |
| Renacimiento Puro | Devoción | Dev ≥ 6 | 20 PF | Levanta a un aliado caído con la mitad de PG |
| Grito de la Tormenta | Corrupción | Corr ≥ 2 | 5 PF | 2d6 trueno en cono, salvación CON 13 |
| Pacto con el Abismo | Corrupción | Corr ≥ 4 | 10 PF | Invoca un ghul aliado (25 PG) |
| Eclipse de Zahir | Corrupción | Corr ≥ 6 | 15 PF | Ciega a todos a 6 casillas (VOL 15) |
Los PF gastados en combate se descuentan al terminar. Mantienen la relación *poder rápido ↔ precio* del canon.

### 4.4 Seguidores (estilo Cult of the Lamb)

Cada seguidor es una persona con **oficio**, **fe (0–10)**, **rasgo** y necesidades. Cada 3 días ocurre un *ciclo*: producen, comen, enferman, discuten o desertan.

| Oficio | Qué hace |
|---|---|
| Predicador | +PF por ciclo (más con más fe) y sube la fe de los demás |
| Cocinero | Víveres (el culto come ⌈n/2⌉ por ciclo; sin comida baja la fe) |
| Espía | Rumores; baja la Alerta (cada 2 ciclos, cada ciclo con 3 espías); permite «preguntar a los espías» qué evento espera en un distrito |
| Artesano | Materiales: abaratan edificios (hasta la mitad del coste) |
| Curandero | Cura enfermos; la muerte de un PJ cuesta 1 PF menos |
| Guardia | **Combate a su lado** en defensas (patrulla, asalto, Coloso), máx. 3 |
| Mercader | PF y rumores |
| Visionario | Rumores; revela la verdad tras el augurio del Oráculo |

**Rasgos:** Fanático (el doble de fe con sermones; sube con la Corrupción), Escéptico (pierde fe si la Corrupción es alta), Glotón (come el doble), Soñador (+rumores), Leal (nunca deserta), Valiente (guardia con +10 PG).
**Acciones del santuario:** Sermón de Fe / Sermón de Hierro (+Corrupción), *predicar y reclutar*, y **rituales**: el Dab de Zaryab, banquete de pan de arena, casamiento de telas blancas (canon), Ofrenda de Huesos (sacrificio) y Ascensión (fe 10: ascender o convertir en reliquia).
**Deserción:** con fe ≤ 2 un seguidor puede irse; con fe 0 los denuncia (+1 Alerta).
**Seguidores canon:** Aisha, Farid, Shib, Al-Khush, y los conversos Ranma, Cabernet y Apu (el canon sólo da el nombre: su oficio es **provisional**).

### 4.4b Reputación

**Facciones** (canon): Conclave de los Siete Vientos, Hijos del Simurg, Mercaderes del Zoco, Inquisidores de la Arena, Nómadas del Vacío; y desde el Acto I también **Culto de Dahhak** y **Qilaat** (la guardia de bronce, que sólo obedece a Razul). La reputación va de −5 a +5 y abre/cierra misiones, precios y la ruta.
**Seguidores:** los NPC convertidos (canon: Aisha, Shib, Ranma, Cabernet, Apu) y los que se suman por misiones. Cada uno da un beneficio pasivo y reacciona a las decisiones del culto (rituales incluidos: *dabbing* y casamientos con telas blancas, canon).

### 4.5 Oráculo de eventos
Fuente: la tabla de **100 encuentros aleatorios** del resumen de campaña y las tablas **d10 por zona**. Se usa así:
1. Al *Recorrer* un distrito se tira 1d6: 1–3 = tabla de zona (1d10), 4–6 = tabla general (1d100).
2. El **Oráculo de las Mil Lenguas** da un *augurio*. Por canon, todo lo que dice es falso, así que el augurio se muestra y luego se revela el evento real.
3. Los eventos son de cinco tipos: **color** (ambientación con un detalle), **trato** (ofrece algo a cambio de algo), **dilema** (dos caminos morales), **combate** y **gancho** (abre una misión secundaria).
4. Con **Pozo de Visiones** se puede repetir la tirada; con **Lámpara de Djinn** se ve cuál opción miente.

### 4.6 Combate (ya implementado, 5e)
Se mantiene tal cual. Añadidos previstos: *escenarios* con objetivo (huida de 12 rondas, defensa por oleadas, duelo, escolta) y **jefes con fases** (Coloso, Dahhak, Al-Mazhar).

### 4.7 Progresión
- Los PJ suben de nivel por **hitos** (no por XP): fin de capítulo ★ y misiones personales. Tabla propuesta: Cap. IV→nivel 4, V→5, VIII→7, X→9, XI→11, XII→13, XIII→15.
- Cada subida da las mejoras de su clase 5e (ya están en las fichas hasta nivel 3) más el *regalo de culto* según PF acumulados (canon: 15/35/60/90… PF).
- Las habilidades **cruzadas** (p. ej. Romain obtiene «Garras del Efrit» si elige venganza) vienen de los arcos personales (§5).

---

## 5. Arcos personales (uno por PJ, tres beats cada uno)

Cada arco es una **misión personal** en el mapa. El tercer beat decide el epílogo.

### Romain — *La Fe Rota* (Clérigo de Kelemvor)
1. **El Templo Quemado** (Acto I, *implementado*): símbolos del Conclave entre las cenizas. *Venganza / Pruebas / Perdón* → Corrupción +3 (Garras del Efrit) / Devoción +3 (Luz mejorada) / mixto (Eclipse Personal).
2. **La Voz del Vizir** (Acto II): el oráculo de bronce le encarga *sellar la canción del Lich*. Debe decidir: sellar el alma de Farid, ofrecer su voz, o romper la conexión con Ellie.
3. **La Balanza** (Acto III): medir el alma de Razul. Epílogo: santo de Zaryab / el verdugo que juró destruir / sobreviviente con dudas.

### Pact Risen — *El Nombre Sellado* (Azuran, Portador del Segundo Aliento)
1. **La Corona Invertida** (Acto I, *implementado*): las Si'lats le dicen su nombre. Habilidad *Declarar una Verdad*.
2. **La Prueba de Azuran** (Acto II, Iglesia del Simurg): enfrentar a Dahhak como juez; recordar su juramento («ni dioses ni djinns merecen fe ciega»).
3. **El Segundo Aliento** (Acto III): *rendir* su corona (vive como humano) o *asumirla* (ángel de la verdad). Epílogo: recupera sus alas / alas de obsidiana / encuentra una familia.

### Rabb Locke — *La Memoria Robada* (el Eco de la Tercera Palabra)
1. **El Nombre en el Arma** (Acto I, *implementado*): el arma susurra otro nombre. *Investigar / Aceptar / Destruir*.
2. **El Pacto Original** (Acto II): el contrato con Zahir y la verdad: Rabb **no olvidó, fue activado**. El Eco quiere *reescribir*.
3. **Reescribir** (Acto III): firmar un contrato nuevo con el Simurg, dejarse reescribir, o romperlo con ayuda de Ellie. Epílogo: guardián de los que olvidaron / un nombre que da miedo / un comienzo.

### Joren Hell — *El Crimen que No Cometió* (La Marca)
1. **El Manifiesto de La Marca** (Acto I, *implementado*): el sello de su célula de contrabandistas en el Zoco; el cargamento fue a Medinat al-Rih.
2. **Medinat al-Rih** (Acto II): el «muerto que respira». Reencuentro con quien creía perdido; Ellie y su red.
3. **El Verdadero Culpable** (Acto III, Ciudadela): matar / capturar / perdonar. Epílogo: la casa al borde de Zaryab / el espectro de venganza / seguir buscando.

### Zyr'thar — *La Traición de la Casa* (Vel'Shara)
1. **Los Cuchillos de Vel'Shara** (Acto I, *implementado*): el espía drow en el Zoco. *Eliminar / Interrogar / Dejar vivir con un mensaje*.
2. **La Sombra Perfecta** (Acto II): su sombra ya no coincide con sus movimientos. Aceptar (Corrupción), resistir (Devoción) o investigar (es un fragmento del Simurg → fragmento extra).
3. **La Casa Vel'Shara** (Acto III): ajustar cuentas. Epílogo: vuelve como justiciero / la sombra que temía / desaparece dejando una marca.

### Panchi — *La Ira del Monje* (Guanteletes de la Ira Rígida)
1. **El Golem Defectuoso** (Acto I, *implementado*): un golem roto en el santuario. *Desmantelar / Redirigir / Controlar*.
2. **El Torneo de los Puños Cerrados** (Acto II, Medinat): Sifra la Silente (Ellie) lo vence y le deja una venda: «Traelo o no vengas».
3. **Qadir-Kalmah** (Acto III): el monasterio en ruinas móviles. Epílogo: maestro de un nuevo monasterio / leyenda de violencia / ya no está solo.

---

## 6. Personajes que evolucionan (NPC)

| NPC | Acto I | Acto II | Acto III |
|---|---|---|---|
| **Zahir** | Mensajero amable; nunca miente, omite | Se muestra furioso; su cristal duele cuando dudan | Revela que es un fragmento del Simurg, hermano de Gul-Amarat. ¿Libera o reemplaza? |
| **Razul** | Tirano teatral | Muestra su rostro de máscara; contacta a Romain; ofrece pactos | Razul ibn Tameer, la Espiral del Dios Caducado; aliado o enemigo según ruta |
| **Aisha** | Madre rota; se une según cómo se cura a Farid | Cocina *pan de arena*; sabe de los túneles | Puede morir (dispara el arco de Romain) o liderar el culto |
| **Farid** | Niño envenenado por el Lago; sueña con un pájaro | «Te encontré, papá»: el Lich lo reclama | Heraldo de Al-Mazhar, o cantor del Simurg, según Romain |
| **EaNassr** | Mercader traicionero; contratos imposibles | Aliado condicional o enemigo | Vende a todos; su traición decide una batalla |
| **Al-Khush** | Repara alfombras; su alfombra se sacrifica | Quiere vengar a la alfombra; teje para djinns libres | Construye el Gran Tapiz que cruza la grieta (ruta FE) |
| **Shib** | Casi muere; guía por los túneles | Líder de los Hijos del Simurg | Puede traicionar si la Corrupción es alta |
| **Dahhak** | Aparece en la torre; «devora historia» | Guerra civil; seducción a Pact y Rabb | Jefe, aliado traicionero, o ritual final |
| **Ellie / Sifra** | Pista | Torneo de Panchi; sabe romper pactos | Rompe el pacto de Rabb, de Pact o de Zahir |
| **Samira** | — | — | Aliada en la mina; sobrevivió a Gul-Amarat hace 20 años |
| **Si'lats** | Advierten a Pact | Guían a la Iglesia del Simurg | Reaparecen como coro del final |

---

## 7. Misiones secundarias y personales (catálogo)

Tipos: **S** secundaria · **P** personal (arco) · **F** de facción. Estado: ✔ implementada (v0.2) · ○ especificada.

| ID | Título | Tipo | Lugar | Se abre con | Resumen | Recompensa | Estado |
|---|---|---|---|---|---|---|---|
| s_lago | El Precio de la Salvación | S | Pozo/Lago | Cap. II | Los túneles de los Hijos del Simurg, Shib moribundo, la rama del Conclave en el Lago. Purificar, quemar o llevar como prueba | +seguidores, remedio, Hijos del Simurg | ✔ |
| s_espejo | El Espejo de Almas | S | Zoco | Cap. III | Robar el Espejo de Madam Shub para EaNassr | Mercaderes, Espejo del Alma | ✔ |
| s_te | El Té Envenenado | S | Jardín | Cap. III | Nafisa será envenenada (o es ella la envenenadora). Infiltrar, sustituir, exponer | Nobles aliados, información de Razul | ✔ |
| s_khush | Hilos de un Djinn Libre | S | Zoco | Alfombra sacrificada | Reconstruir la alfombra con esencia de djinn | Alfombra Viviente barata | ✔ |
| p_romain | El Templo Quemado | P | Bajo Zaryab | Cap. II | Arco de Romain (beat 1) | Habilidad cruzada | ✔ |
| p_pact | La Corona Invertida | P | Zoco | Cap. III (Si'lats) | Arco de Pact (beat 1) | *Declarar una Verdad* | ✔ |
| p_rabb | El Nombre en el Arma | P | Santuario | Cap. III | Arco de Rabb (beat 1) | Fragmento de memoria | ✔ |
| p_joren | El Manifiesto de La Marca | P | Zoco | Cap. III | Arco de Joren (beat 1) | Gancho a Medinat | ✔ |
| p_zyr | Los Cuchillos de Vel'Shara | P | Zoco | Cap. III | Arco de Zyr'thar (beat 1) | Información; tiempo | ✔ |
| p_panchi | El Golem Defectuoso | P | Santuario | Cap. II | Arco de Panchi (beat 1) | Golem aliado / arma | ✔ |
| s_ninos | Niños y Escorpiones | S | Bajo Zaryab | Oráculo | Los niños del barrio y sus escorpiones domesticados | +Devoción, seguidores | ○ |
| s_libro | El Libro del Sabio | S | Zoco | Oráculo | Un anciano pide su libro de hechizos perdido | Conocimiento | ○ |
| s_djinns | Los Tres Djinns | F | Hammam | Cap. III opción 3 | Pelea contra Shul-Avar, Riyam y Tadhem (necesita balance) | Esencias elementales | ○ |
| s_nomadas | El Pacto del Vacío | F | Pozo | Dev ≥ 5 | Prueba de los Nómadas para aliarse | Mapas de planos | ○ |
| s_inquis | La Cacería | F | Plaza | Alerta ≥ 7 | Escapar de Kaelen | Reputación | ○ |

---

## 8. Estado de implementación

| Sistema | v0.1 | v0.2 (esta entrega) | Siguiente |
|---|---|---|---|
| Combate 5e | ✔ | + Milagros con PF, invocaciones | Jefes con fases, escenarios con objetivo |
| Jefes, oleadas, regla de victoria por jefe, Coloso | — | v0.3 ✔ (Cap. V) | Dahhak (Iglesia), Al-Mazhar |
| Seguidores con oficios, fe y rituales | — | v0.3 ✔ | Eventos del culto, disidencia, Ascensión con efectos de combate |
| Historia Cap. I–IV | ✔ | Reorganizada alrededor del mapa | Cap. V (Coloso) |
| Mapa del mundo / tiempo / Alerta | — | ✔ | Frentes de guerra civil |
| Misiones secundarias y personales | — | ✔ 10 | El resto del catálogo |
| Oráculo (d100 + zonales) | — | ✔ | Pozo de Visiones y Lámpara afinados |
| Santuario, edificios, seguidores | — | ✔ | Eventos del culto (rituales) |
| Reputación de facciones | — | ✔ | Efectos de ruta |
| Rutas y finales | — | Especificados | Implementación del Acto II–III |


---

## 9. Balance (v0.3)

Metodología: `scripts/sim.ts` juega cada encuentro N veces con un **bot de jugador competente** (`scripts/bot.ts`: usa curaciones, Bendecir, Rayo Guía, Maleficio, Marca del Cazador, Oleada de Acción, Ráfaga de Golpes, Ocultarse…). Se mide *victorias*, *caídos* (PJ que llegan a 0 PG) y *muertes* (fallan las tres salvaciones). Cada encuentro tiene una `scale` (PG y bono de ataque de los enemigos) ajustada a su nivel de dificultad.

| Nivel | Objetivo (bot) | Encuentros |
|---|---|---|
| Escaramuza | ≥ 99 % · ≤ 0,2 muertes | Linyera, Niños y Escorpiones, Ghul vendedor, Reflejo de Azuran, Golem de Panchi |
| Normal | ≥ 98 % · 0,2–0,45 muertes | Acueducto, Cubo, Lago, Té, Espejo, Zyr, Joren, Romain, Infiltrado, Patrulla |
| Difícil | ≈ 100 % · ≈ 1,5 muertes (con 0 guardias) | Asalto al santuario |
| Jefe | 62 % sin guardias · 90 % con 2 · 98 % con 3 | Coloso + Dahhak |

Los **guardias del culto** (seguidores) son el principal modificador de dificultad: invertir en seguidores reduce las muertes en el asalto y en el jefe.
