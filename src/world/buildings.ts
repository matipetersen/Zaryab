export interface Building { id: string; name: string; pf: number; effect: string; icon: string; blurb: string }
export const BUILDINGS: Building[] = [
  { id: 'lampara', name: 'Lámpara de Djinn', pf: 15, icon: '🏮', effect: 'Los tratos del Oráculo que mienten se marcan con un aviso.', blurb: 'Ilumina con llamas violetas que revelan mentiras.' },
  { id: 'altar', name: 'Altar de Huesos', pf: 20, icon: '☠', effect: '+1d6 PF cada vez que elegís una opción con Corrupción.', blurb: 'Hecho de los Huesos del Pacto. Late como un corazón.' },
  { id: 'alfombra', name: 'Alfombra Viviente', pf: 25, icon: '🧵', effect: 'Recorrer un distrito (Oráculo) no cuesta días.', blurb: 'Transporta a tres personas. Tiene opiniones.' },
  { id: 'espejo', name: 'Espejo del Alma', pf: 30, icon: '☽', effect: 'Muestra los efectos de Corrupción/Devoción de cada opción.', blurb: 'No refleja el rostro: muestra lo que habéis hecho con él.' },
  { id: 'biblioteca', name: 'Biblioteca Oculta', pf: 35, icon: '📚', effect: 'Muestra el Sello del Simurg en el santuario y revela lore.', blurb: 'Estantes sobre los huesos de un dios.' },
  { id: 'torre', name: 'Torre del Vigía', pf: 40, icon: '♜', effect: 'La Alerta baja 1 cada semana; evacuar el santuario no cuesta PF.', blurb: 'Detecta intrusos a una milla.' },
  { id: 'pozo_vis', name: 'Pozo de Visiones', pf: 50, icon: '◉', effect: 'El Oráculo deja de mentir: el augurio muestra el evento real.', blurb: 'Ver eventos futuros una vez por semana (70% preciso).' },
  { id: 'collar', name: 'Collar de Sumisión', pf: 45, icon: '⛓', effect: '+3 Corrupción. Declara Corrupción alta y atrae a la Cacería.', blurb: 'Controla a un humanoide. Oscuro.' },
];
export const FOLLOWER_INFO: Record<string, string> = {
  Aisha: 'Pan de arena. Teje y conoce los túneles. Madre de Farid.',
  Farid: 'Niño profético. Su sombra no coincide con sus movimientos.',
  Shib: 'Hijo del Simurg. Espía: conoce los túneles secretos.',
  'Al-Khush': 'Artesano sordomudo. Repara alfombras mágicas.',
  'Perro callejero': 'Un perro flaco. Duerme en la biblioteca.',
  'Los niños del barrio': 'Dibujan el ojo del Simurg en las paredes.',
  'Un nuevo adepto': 'Quería ser un latido más en el cristal.',
  'Un médico agradecido': 'Cura a los seguidores.',
};
export const RITOS = 'Ritos del culto: dabbing, casamientos con telas blancas en la mano y gritos de alegría.';
