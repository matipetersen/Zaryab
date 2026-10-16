// Arcos personales: cada personaje empieza y termina su historia en capítulos o interludios distintos.
import type { Campaign } from '../state';
import { has } from '../state';

export type BeatKind = 'inicio' | 'giro' | 'duda' | 'clímax' | 'cierre';
export interface Beat { label: string; where: string; kind: BeatKind; done: (c: Campaign) => boolean; outcome?: (c: Campaign) => string | null }
export interface Arc { pc: string; title: string; premise: string; beats: Beat[] }
const any = (...f: string[]) => (c: Campaign) => f.some(x => has(c, x));
const out = (m: [string, string][]) => (c: Campaign) => m.find(([f]) => has(c, f))?.[1] ?? null;

export const ARCS: Arc[] = [
  { pc: 'romain', title: 'La Balanza Vacía', premise: 'Un clérigo de Kelemvor que perdió la fe cuando su templo ardió. Termina pesando el alma de quien le quitó todo.', beats: [
    { label: 'Zahir cuestiona a Kelemvor', where: 'Cap. I · Limbo', kind: 'inicio', done: any('romain_fe', 'romain_duda'), outcome: out([['romain_fe', 'Se aferró a su fe.'], ['romain_duda', 'Dudó.']]) },
    { label: 'El Templo Quemado', where: 'Misión personal', kind: 'giro', done: any('q_p_romain'), outcome: out([['romain_perdon', 'Perdonó.'], ['romain_venganza', 'Eligió la venganza.'], ['romain_pruebas', 'Reunió pruebas.']]) },
    { label: 'Las dudas de Samira', where: 'Interludio · Lo que se dice a media voz', kind: 'duda', done: any('romain_consolado', 'ev_noche2_done'), outcome: out([['romain_consolado', 'Recuperó una frase de su maestra.']]) },
    { label: 'La voz de Farid', where: 'Cap. X · Hijo del Lago', kind: 'clímax', done: any('farid_sellado', 'romain_voz', 'farid_roto', 'mazhar_nana'), outcome: out([['romain_voz', 'Cambió su voz por el alma de Farid.'], ['farid_roto', 'Rompió la canción con Ellie.'], ['mazhar_nana', 'Cantó la nana.'], ['farid_sellado', 'Selló el alma del niño.']]) },
    { label: 'Pesar el alma de Razul', where: 'Cap. XII · Ciudadela', kind: 'clímax', done: any('romain_peso_santo', 'romain_peso_verdugo', 'romain_peso_duda'), outcome: out([['romain_peso_santo', 'La balanza se inclinó a favor de Razul.'], ['romain_peso_verdugo', 'La balanza se inclinó en su contra.'], ['romain_peso_duda', 'La balanza no se movió.']]) },
    { label: 'Epílogo', where: 'Final', kind: 'cierre', done: any('cap13_done') },
  ] },
  { pc: 'pact', title: 'El Segundo Aliento', premise: 'Un aasimar partido en dos: Pact, el hombre, y Azuran, el juez. Termina decidiendo cuál de los dos lleva la corona.', beats: [
    { label: 'Razul se burla de sus alas', where: 'Cap. I · Juicio', kind: 'inicio', done: any('cap1_done') },
    { label: 'La Corona Invertida', where: 'Misión personal', kind: 'giro', done: any('q_p_pact'), outcome: out([['pact_acepta_corona', 'Aceptó la corona.'], ['pact_sella_memoria', 'Selló su memoria.'], ['pact_juicio_romain', 'Dejó que Romain lo juzgara.']]) },
    { label: 'La Prueba de Azuran', where: 'Cap. VII · Iglesia', kind: 'giro', done: any('pact_recuerda', 'pact_niega', 'pact_corona'), outcome: out([['pact_recuerda', 'Recordó el juramento.'], ['pact_niega', 'Negó a Azuran.'], ['pact_corona', 'Tomó la corona.']]) },
    { label: 'Farid y las alas', where: 'Interludio · La Cena', kind: 'duda', done: any('ev_noche1_done'), outcome: out([['farid_vio_alas', 'Le enseñó las alas a Farid.']]) },
    { label: 'Mirabel', where: 'Interludio · La Cena', kind: 'clímax', done: any('zahir_regalo_1', 'zahir_rechazo_1'), outcome: out([['zahir_regalo_1', 'Zahir le devolvió un nombre.'], ['zahir_rechazo_1', 'Rechazó el regalo de Zahir.']]) },
    { label: 'Rendir o asumir la corona', where: 'Cap. XIII · Eclipse', kind: 'cierre', done: any('pact_rinde', 'pact_asume'), outcome: out([['pact_rinde', 'Rindió la corona: vive como humano.'], ['pact_asume', 'Asumió la corona: ángel de la verdad.']]) },
  ] },
  { pc: 'rabb', title: 'El Nombre en el Arma', premise: 'Un brujo sin memoria cuya espada recuerda lo que él olvidó. Termina decidiendo si reescribe su pacto.', beats: [
    { label: '«¿Quién soy?»', where: 'Cap. I · Limbo', kind: 'inicio', done: any('rabb_pregunta', 'rabb_rechaza'), outcome: out([['rabb_pregunta', 'Preguntó a Zahir quién era.'], ['rabb_rechaza', 'Rechazó la oferta.']]) },
    { label: 'El Nombre en el Arma', where: 'Misión personal', kind: 'giro', done: any('q_p_rabb'), outcome: out([['rabb_acepta', 'Aceptó al eco.'], ['rabb_libre', 'Se liberó del arma.'], ['rabb_memoria', 'Recuperó un fragmento de memoria.']]) },
    { label: 'El Pacto Original', where: 'Cap. X · Lago', kind: 'clímax', done: any('rabb_activado', 'rabb_rechaza_pacto'), outcome: out([['rabb_activado', 'No olvidó: fue activado.'], ['rabb_rechaza_pacto', 'Rechazó el pacto.']]) },
    { label: 'La espada que dejó de hablar', where: 'Interludio · La Nana', kind: 'duda', done: any('ev_noche3_done') },
    { label: 'Reescribir el contrato', where: 'Cap. XIII · Eclipse', kind: 'cierre', done: any('rabb_reescribe', 'rabb_rompe', 'rabb_firma'), outcome: out([['rabb_reescribe', 'Dejó que lo reescribieran.'], ['rabb_rompe', 'Rompió el pacto.'], ['rabb_firma', 'Firmó un contrato nuevo.']]) },
  ] },
  { pc: 'joren', title: 'El Muerto que Respira', premise: 'Un cazador con una familia perdida. Termina frente al hombre que lo traicionó.', beats: [
    { label: 'Razul lo llama presa', where: 'Cap. I · Juicio', kind: 'inicio', done: any('cap1_done') },
    { label: 'El Manifiesto de La Marca', where: 'Misión personal', kind: 'giro', done: any('q_p_joren', 'gancho_medinat') },
    { label: 'El reencuentro', where: 'Cap. VI · Medinat', kind: 'clímax', done: any('joren_perdon_ruta', 'joren_culpable_pista', 'joren_traicionado'), outcome: out([['joren_perdon_ruta', 'Le dio un lugar para hablar.'], ['joren_culpable_pista', 'Interrogó al muerto.'], ['joren_traicionado', 'Lo traicionó.']]) },
    { label: 'La cantimplora en el tejado', where: 'Interludio · La Cena', kind: 'duda', done: any('ev_noche1_done'), outcome: out([['joren_abierto', 'Abrió su corazón a Zyr\'thar.']]) },
    { label: 'El Verdadero Culpable', where: 'Cap. XII · Ciudadela', kind: 'cierre', done: any('joren_mata', 'joren_captura', 'joren_perdona'), outcome: out([['joren_mata', 'Mató a Kaelen.'], ['joren_captura', 'Capturó a Kaelen.'], ['joren_perdona', 'Perdonó a Kaelen.']]) },
  ] },
  { pc: 'zyrthar', title: 'La Sombra Perfecta', premise: 'Una asesina drow perseguida por su Casa y por su propia sombra. Termina ajustando cuentas con Vel\'Shara.', beats: [
    { label: 'Zahir la llama «sombra que corta»', where: 'Cap. IV · Reflejo', kind: 'inicio', done: any('cap4_done') },
    { label: 'Los Cuchillos de Vel\'Shara', where: 'Misión personal', kind: 'giro', done: any('q_p_zyr'), outcome: out([['zyr_eliminada', 'Eliminó a la espía.'], ['zyr_info', 'Obtuvo información.'], ['zyr_mensaje', 'Envió un mensaje.']]) },
    { label: 'La Sombra Perfecta', where: 'Cap. IX · Jardín', kind: 'clímax', done: any('zyr_sombra_acepta', 'zyr_sombra_resiste', 'zyr_sombra_fragmento'), outcome: out([['zyr_sombra_acepta', 'Aceptó a su sombra.'], ['zyr_sombra_resiste', 'La resistió.'], ['zyr_sombra_fragmento', 'Descubrió que era un fragmento.']]) },
    { label: 'La noche en el tejado', where: 'Interludio · La Cena', kind: 'duda', done: any('ev_noche1_done') },
    { label: 'La Casa Vel\'Shara', where: 'Cap. XII · Ciudadela', kind: 'cierre', done: any('velshara_mata', 'velshara_expone', 'velshara_perdona'), outcome: out([['velshara_mata', 'Ajustó cuentas.'], ['velshara_expone', 'Expuso a la Casa.'], ['velshara_perdona', 'Perdonó a su hermana.']]) },
  ] },
  { pc: 'panchi', title: 'La Ira del Monje', premise: 'Un monje enano de mal genio cuyo monasterio está en ruinas móviles. Termina decidiendo qué hacer con su rabia.', beats: [
    { label: 'Razul se burla de su furia', where: 'Cap. I · Juicio', kind: 'inicio', done: any('cap1_done') },
    { label: 'El Golem Defectuoso', where: 'Misión personal', kind: 'giro', done: any('q_p_panchi'), outcome: out([['nucleo_golem', 'Desmanteló al golem.'], ['golem_prestado', 'Redirigió su ira.'], ['golem_aliado', 'Lo controló.']]) },
    { label: 'El Torneo de los Puños Cerrados', where: 'Cap. VI · Medinat', kind: 'clímax', done: any('torneo_perdido'), outcome: out([['torneo_digno', 'Perdió con dignidad: Ellie lo reconoció.']]) },
    { label: 'El Monasterio que se Mueve', where: 'Interludio · Qadir-Kalmah', kind: 'duda', done: any('qadir_visto'), outcome: out([['qadir_golem', 'Llevó el golem a Qadir-Kalmah.'], ['qadir_solo', 'Fue solo.'], ['qadir_rechazo', 'No se atrevió.']]) },
    { label: 'La clave de Ellie', where: 'Interludio · La Víspera', kind: 'clímax', done: any('ellie_sabe') },
    { label: 'Tráelo o no vengas', where: 'Cap. XIII · Eclipse', kind: 'cierre', done: any('panchi_cierra', 'panchi_perdona', 'panchi_guarda'), outcome: out([['panchi_cierra', 'Cerró el puño.'], ['panchi_perdona', 'Abrió la mano.'], ['panchi_guarda', 'Guardó su rabia.']]) },
  ] },
];
export const ARC_BY_PC = Object.fromEntries(ARCS.map(a => [a.pc, a]));
