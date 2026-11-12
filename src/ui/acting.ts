// Actuación de las figuras: cada personaje está quieto a su manera y habla con su propio gesto.
// Todo se expresa en celdas del pixel art (lean, bob) y desplazamientos en pantalla (dx, dy en unidades de escena).

export interface Pose { bob: number; lean: number; flip: boolean; dx: number; dy: number; glow: number }
export type Gesture = 'bow' | 'rise' | 'lunge' | 'turn' | 'flourish' | 'stomp' | 'hop' | 'droop' | 'shout' | 'laugh';

const frac = (x: number) => x - Math.floor(x);
/** Un pulso de 0→1→0 que dura `len` segundos cada `every` segundos (desfasado por personaje). */
const pulse = (t: number, every: number, len: number, ph: number) => { const k = frac((t + ph * every) / every) * every; return k < len ? Math.sin(Math.PI * k / len) : 0; };

/** Cómo está quieto cada uno. `ph` desfasa a los personajes para que no respiren al unísono. */
export function idlePose(pcId: string | undefined, t: number, ph: number): Pose {
  const p: Pose = { bob: 0, lean: 0, flip: false, dx: 0, dy: 0, glow: 0 };
  switch (pcId) {
    case 'romain': // calmo: respira despacio y cada tanto inclina la cabeza, como quien reza
      p.bob = Math.sin(t * 1.5 + ph) > .35 ? 1 : 0; p.lean = Math.round(pulse(t, 9, 1.6, ph) * 1.4); break;
    case 'pact': // solemne: no se mueve, flota apenas con las alas
      p.dy = -Math.sin(t * 1.1 + ph) * 1.6 - 1.6; p.glow = pulse(t, 7, 1.2, ph) * .5; break;
    case 'rabb': // inquieto: pasa el peso de un pie al otro y a veces se le va la mano a la espada
      p.bob = Math.floor(t * 3.1 + ph) % 3 === 0 ? 1 : 0; { const w = Math.sin(t * .9 + ph * 2); p.lean = Math.abs(w) > .55 ? Math.sign(w) : 0; }
      if (pulse(t, 5.5, .25, ph) > 0) p.dx = (Math.floor(t * 30) % 2 ? 1 : -1) * 1.2; break;
    case 'joren': // vigila: casi quieto, mira para un lado y para el otro
      p.bob = Math.sin(t * 1.1 + ph) > .8 ? 1 : 0; p.flip = Math.floor((t + ph * 3) / 3.4) % 3 === 1; break;
    case 'zyrthar': // elegante: se mece con desgano
      p.lean = Math.round(Math.sin(t * 1.25 + ph) * 1.3); p.bob = Math.floor(t * 1.8 + ph) % 2; break;
    case 'panchi': // pesado: respira hondo y cada tanto da un pisotón
      p.bob = Math.sin(t * 1.3 + ph) > 0 ? 1 : 0; p.dy = -pulse(t, 6.5, .35, ph) * 5; break;
    default: // el resto: respiración común, pero cada uno a su ritmo
      p.bob = Math.floor(t * 2.2 + ph * 3) % 2;
  }
  return p;
}

/** El gesto con el que habla cada uno; el tono de la línea lo puede cambiar. */
export function gestureFor(pcId: string | undefined, tone = ''): Gesture {
  const t = tone.toLowerCase();
  if (/grit|furi|rugi|golpe|ladr|ruge|exig/.test(t)) return pcId === 'panchi' ? 'stomp' : 'shout';
  if (/llor|triste|baj[oa] |sin mirar|apenas|en voz baja|susurr|quebr|cansad|mirando el suelo/.test(t)) return 'droop';
  if (/r[ií]e|sonr|burl|divertid|carcaj/.test(t)) return 'laugh';
  return ({ romain: 'bow', pact: 'rise', rabb: 'lunge', joren: 'turn', zyrthar: 'flourish', panchi: 'stomp' } as Record<string, Gesture>)[pcId ?? ''] ?? 'hop';
}
/** Duración de cada gesto (segundos). */
export const GEST_LEN: Record<Gesture, number> = { bow: 1.1, rise: 1.4, lunge: .7, turn: .9, flourish: 1.0, stomp: .6, hop: .5, droop: 1.6, shout: .8, laugh: 1.0 };

/** Pose que agrega el gesto en curso (t = segundos desde que empezó). */
export function gesturePose(g: Gesture, t: number): Pose {
  const p: Pose = { bob: 0, lean: 0, flip: false, dx: 0, dy: 0, glow: 0 }; const L = GEST_LEN[g]; const k = Math.min(1, t / L); const arc = Math.sin(Math.PI * k);
  switch (g) {
    case 'bow': p.lean = Math.round(arc * 2.4); p.dy = arc * 1.5; break;                       // inclina el torso
    case 'rise': p.dy = -arc * 9; p.glow = arc; break;                                          // se eleva y brilla
    case 'lunge': p.dx = arc * 6; p.lean = Math.round(arc * 2); break;                          // un paso al frente
    case 'turn': p.flip = k > .15 && k < .7; p.dy = -Math.max(0, Math.sin(Math.PI * k * 2)) * 3; break; // se da vuelta a mirar
    case 'flourish': p.flip = Math.floor(k * 4) % 2 === 1; p.lean = Math.round(Math.sin(k * 12) * 1.2); break; // un giro con floritura
    case 'stomp': p.dy = -Math.max(0, Math.sin(Math.PI * k * 1.4)) * 8; break;                  // salta y cae pesado
    case 'hop': p.dy = -arc * 6; break;
    case 'droop': p.lean = -Math.round(arc * 1.6); p.dy = arc * 2; p.bob = 0; break;            // baja la cabeza
    case 'shout': p.dx = (Math.floor(t * 28) % 2 ? 1 : -1) * 1.5 * arc; p.lean = Math.round(arc * 1.5); p.dy = -arc * 3; break; // tiembla de bronca
    case 'laugh': p.dy = -Math.abs(Math.sin(k * Math.PI * 4)) * 3; break;                       // se sacude de risa
  }
  return p;
}
