// El destino de cada fragmento del Simurg: ya no se junta «porque sí». Cada fragmento es una herida abierta en alguien que a la compañía le importa,
// y hay tres maneras de cerrarla (entregárselo a Zahir, guardarlo ellos, o romperlo). Romperlo cuesta ahora y debilita a Zahir al final.
import type { Node } from './types';

export type FragId = 'dahhak' | 'marid' | 'mazhar' | 'gusano' | 'razul';
interface FragText { name: string; give: string[]; keep: string[]; destroy: string[]; who: string }
const TXT: Record<FragId, FragText> = {
  dahhak: { name: 'el fragmento de Dahhak', who: 'Farid', give: ['Zahir lo toma con una dulzura que da escalofríos. «Gracias.» En la biblioteca, esa noche, Farid duerme sin hablar con los cuellos torcidos.'], keep: ['Lo guardan en un paño, en el fondo del santuario. Pesa lo que pesan las promesas que no se hicieron en voz alta.'], destroy: ['Pact lo parte contra el altar. Cien voces gritan a la vez y se callan. A lo lejos, en la biblioteca, Farid despierta llorando por primera vez sin saber por qué.'] },
  marid: { name: 'el fragmento del Marid', who: 'Zyr\'thar', give: ['Zahir lo recibe sin mirarlo. El estanque se seca despacio. La sombra de Zyr\'thar se le acerca, como pidiendo perdón.'], keep: ['Lo envuelven en tela mojada. Gotea sobre el suelo del santuario toda la noche, con un ritmo que parece de río.'], destroy: ['El fragmento se abre y el agua que sale es limpia. El Jardín huele a lluvia por un instante. La sombra de Zyr\'thar se queda quieta, y ella respira.'] },
  mazhar: { name: 'el fragmento de Al-Mazhar', who: 'Aisha', give: ['Zahir lo toma y canta, muy bajo, tres notas de la nana. «Qué bien suena», dice. Aisha, desde la puerta, no puede mirar.'], keep: ['Lo ponen en un estante, junto al pan. Cada tanto, por la noche, late: una nana a destiempo.'], destroy: ['Romain lo rompe con el dorso de la balanza. Las trece máscaras se apagan juntas. Aisha oye, por una última vez, una voz que creía perdida, y lo agradece sin decirlo.'] },
  gusano: { name: 'el fragmento de Gul-Amarat', who: 'Samira', give: ['Zahir lo recibe con las dos manos, como a algo vivo. El silencio de la mina se corta, y se oyen, por fin, los nombres de los que no volvieron.'], keep: ['Lo llevan envuelto en una lona. Pesa más cuanto más lo miran.'], destroy: ['El fragmento se desmorona como sal. La mina deja de callar y Samira, por primera vez, llora sin que nadie la vea.'] },
  razul: { name: 'el fragmento de Razul', who: 'Zaryab', give: ['Razul se lo entrega a Zahir con un gesto de cansancio. «Hacelo bien», dice, y no se sabe si le habla a él o a la ciudad.'], keep: ['Razul les deja el fragmento en la mano. «Si lo pierden, la ciudad lo paga. Si lo gastan, también.»'], destroy: ['Lo rompen. El Corazón Dormido se aquieta. Razul, por primera vez en tres mil años, se sienta.'] },
};

/** Nodo de elección sobre el destino del fragmento. Fija `frag_<id>` (cedido/guardado) o `frag_<id>_roto` (destruido). */
export function fragChoice(id: FragId): Node {
  const t = TXT[id];
  return { t: 'choice', prompt: `${t.name[0].toUpperCase()}${t.name.slice(1)}. Qué hacen con él. ${t.who} es quien más lo siente.`, options: [
    { label: 'Cedérselo a Zahir', hint: 'Zahir se acerca a su plan. Sombra +1. Sin costo ahora.', e: { c: 1, ruta: { sombra: 1 }, flags: [`frag_${id}`, `frag_${id}_zahir`] }, result: t.give },
    { label: 'Guardarlo ustedes', hint: '+PF. Queda en el santuario: Zahir lo va a querer, y lo sabe.', e: { pf: 6, flags: [`frag_${id}`, `frag_${id}_guardado`] }, result: t.keep },
    { label: 'Romperlo aquí', hint: 'Cuesta PF y deja un hueco en el ritual: Zahir llegará al final más débil.', e: { pf: -6, d: 1, ruta: { pueblo: 1 }, flags: [`frag_${id}_roto`] }, result: t.destroy },
  ] };
}
