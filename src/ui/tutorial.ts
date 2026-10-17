import { h } from './dom';

export interface CoachStep { title: string; body: string }
/** Guía rápida de la primera batalla: tarjetas cortas, sin bloquear el juego. Se reabre con el botón «?». */
export const STEPS: CoachStep[] = [
  { title: 'Despliegue', body: 'Antes de empezar, ubicá a tu equipo en las casillas azules (tocá un personaje y después una casilla). Los frágiles, atrás; los resistentes, adelante. Las líneas doradas que unen a dos personajes son **sinergias**.' },
  { title: 'Tu turno', body: 'Cada turno tenés **Movimiento**, **Acción**, **Acción adicional** y una **Reacción** por ronda. Mové primero, atacá después, y terminá el turno cuando quieras.' },
  { title: 'Moverse con cuidado', body: 'Salir del alcance de un enemigo provoca un **ataque de oportunidad**. Al elegir *Mover* el cartel te avisa. Si querés retirarte, usá **Desengancharse**.' },
  { title: 'Atacar con ventaja', body: '**Flanqueo:** atacar con un aliado justo del lado opuesto da ventaja. **Cobertura** y **terreno elevado** cambian la defensa y el ataque. Señalá a un enemigo y se marca el **alcance de amenaza** en rojo.' },
  { title: 'Sinergias y formaciones', body: 'Los personajes con buena relación (Pact y Romain, Rabb y Zyr\'thar, Joren y Panchi al empezar) pelean mejor a **≤ 2 casillas**: bonos de CA y de ataque. Tres en línea forman una **falange** (+1 CA); rodeado por tres aliados, un **núcleo** (+2 CA). Pelear juntos fortalece la relación.' },
  { title: 'El terreno cuenta', body: 'Parado en terreno elevado: +1 CA y +2 a distancia. Escombros: +1 CA. Al abrigo de un muro o una caja: +1 CA. En el agua: −1 CA y −1 al ataque. El panel derecho lista tus bonos de posición.' },
  { title: 'Preparar y agarrar', body: '**Preparar acción** te deja en guardia: el primer enemigo que entre en tu alcance recibe un ataque como reacción. **Agarrar** deja a un enemigo sin movimiento; **Zafarse** lo suelta. **Ayudar** y **Derribar** completan tus opciones.' },
];
const KEY = 'zaryab.coach.v1';
export const coachSeen = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch { /* sin storage */ } };

const md = (t: string) => t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
export class Coach {
  el: HTMLElement; i = 0;
  constructor(parent: HTMLElement, public startAt = 0) { this.el = h('div', { id: 'coach', class: 'hidden' }); parent.append(this.el); this.i = startAt; }
  open(i = this.i) { this.i = Math.max(0, Math.min(STEPS.length - 1, i)); this.draw(); this.el.classList.remove('hidden'); }
  close(done = false) { this.el.classList.add('hidden'); if (done) markSeen(); }
  draw() {
    const s = STEPS[this.i]; const last = this.i === STEPS.length - 1; this.el.innerHTML = '';
    const body = h('div', { class: 'cbody' }); body.innerHTML = md(s.body);
    this.el.append(h('div', { class: 'ctitle' }, h('span', {}, `Guía rápida · ${this.i + 1}/${STEPS.length}`), h('button', { class: 'cx', title: 'Cerrar', onClick: () => this.close(true) }, '✕')), h('h4', {}, s.title), body,
      h('div', { class: 'cnav' }, this.i > 0 ? h('button', { class: 'tb-btn', onClick: () => this.open(this.i - 1) }, '‹ Anterior') : h('span', {}), h('button', { class: 'tb-btn on', onClick: () => (last ? this.close(true) : this.open(this.i + 1)) }, last ? '¡Entendido!' : 'Siguiente ›')));
  }
}
