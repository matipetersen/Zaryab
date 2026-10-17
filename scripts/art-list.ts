// Genera docs/ARTE_ENCARGO.md: lista de piezas de arte a encargar (con nombre de archivo, tamaño y descripción) a partir de los datos del juego.
import { writeFileSync } from 'node:fs';
import { MONSTERS } from '../src/data/monsters';
import { MAPS } from '../src/data/maps';
import { PARTY } from '../src/data/party';
import { SPEAKERS } from '../src/story/speakers';
const slug = (n: string) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); // igual que src/ui/portraits.ts

const BG: [string, string][] = [['dunas', 'Dunas blancas bajo la luna, el cráter del meteorito en el horizonte'], ['tormenta', 'Tormenta de arena ocre, siluetas de la compañía a contraluz'], ['prison', 'Mina/prisión de alabastro, antorchas, cadenas'], ['coliseo', 'Coliseo-arena de piedra rosada, multitud borrosa, luz violeta'], ['medinat', 'Medinat al-Rih al atardecer, plaza de los olvidados, arcos y telas'], ['limbo', 'Vacío blanco-violeta, escalera de luz, sin suelo'], ['bajo', 'Callejón del Bajo Zaryab de noche, faroles de aceite, humedad'], ['choza', 'Interior de choza de adobe, fuego bajo, estantes'], ['zoco', 'Mercado de las Sombras: toldos violetas, aceite, mercaderes encapuchados'], ['taller', 'Taller de herrero/artífice, yunque, brasas'], ['hammam', 'Baño turco subterráneo, vapor y azulejos turquesa'], ['espejos', 'Sala de espejos infinitos, reflejos distorsionados'], ['acueducto', 'Acueducto en ruinas, agua verde y luz de grieta'], ['cubo', 'Interior del Cubo: geometría luminosa blanco-azulada'], ['plaza', 'Plaza Central con el Capitolio de hierro, cielo rojizo'], ['oraculo', 'Cámara del oráculo: humo violeta, runas flotando']];
const out: string[] = ['# Lista de encargo de arte', '', 'Generada con `npx tsx scripts/art-list.ts`. Ver `docs/ARTE.md` para estilo, formatos y dónde dejar los archivos.', ''];
out.push('## 1. Retratos de diálogo (prioridad alta)', '', 'Busto con fondo oscuro o transparente, rostro legible a 120 px. `src/assets/portraits/<id>.jpg|png|webp`, cuadrado 512×512.', '', '| id | personaje | notas |', '|---|---|---|');
for (const p of PARTY) out.push(`| \`${p.portrait}\` | ${p.name} — ${p.race}, ${p.klass} | ${p.blurb} |`);
for (const [name, sp] of Object.entries(SPEAKERS)) if (sp.img && !PARTY.some(p => p.portrait === sp.img)) out.push(`| \`${sp.img}\` | ${name} | color de acento ${sp.color} |`);
for (const [name, sp] of Object.entries(SPEAKERS)) if (!sp.img) out.push(`| \`${slug(name)}\` | ${name} | color de acento ${sp.color} |`);
out.push('', '## 2. Fondos de historia (prioridad alta)', '', 'Ilustración apaisada **1920×1080**, composición con el tercio inferior despejado (ahí va el cuadro de diálogo). `src/assets/bg/<id>.jpg`.', '', '| id | escena |', '|---|---|');
for (const [id, d] of BG) out.push(`| \`${id}\` | ${d} |`);
out.push('', '## 3. Sprites de unidades en combate', '', 'PNG con transparencia, **pies centrados en el borde inferior**, mirando a la derecha-abajo (3/4), altura ≈ 128 px (se dibuja a ≈ 54 u). Opcional: tira horizontal de N cuadros de idle `<id>@N.png` (p. ej. `@4`). `src/assets/sprites/<id>.png`.', '', '### Compañía', '', '| id | personaje |', '|---|---|');
for (const p of PARTY) out.push(`| \`${p.id}\` | ${p.name} |`);
out.push('', '### Monstruos y enemigos', '', '| id | nombre | tamaño | notas |', '|---|---|---|---|');
for (const m of Object.values(MONSTERS) as any[]) out.push(`| \`${m.id}\` | ${m.name} | ${m.size ?? 1} | ${m.sprite ?? ''}${m.fly ? ' · vuela' : ''} |`);
out.push('', '## 4. Texturas de baldosas por tema', '', 'PNG **128×64** (rombo isométrico 2:1, sin costuras; se recorta al rombo). `src/assets/tiles/<tema>_<parte>.png` con parte = `floor`, `diff` (escombros), `water`, `high` (plataforma), `wall`, `cover` (cajas/rocas). Muros y plataformas: textura cuadrada 128×128 que se aplica a las tres caras (las laterales se oscurecen solas).', '', '| tema | mapas que lo usan |', '|---|---|');
const themes: Record<string, string[]> = {}; for (const m of Object.values(MAPS) as any[]) (themes[m.theme] ??= []).push(m.name);
for (const [t, ms] of Object.entries(themes)) out.push(`| \`${t}\` | ${ms.join('; ')} |`);
out.push('', '## 5. UI (opcional, más adelante)', '', '- Marco del cuadro de diálogo (9-slice), botones, barras de PG.', '- Íconos de habilidades y objetos (hoy son emojis y glifos).');
writeFileSync('docs/ARTE_ENCARGO.md', out.join('\n') + '\n'); console.log('ok', out.length);
