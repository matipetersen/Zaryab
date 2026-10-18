// Sprites vectoriales de la compañía: siluetas distintas y legibles (pies en el origen, ≈ 50 u de alto), con trazo oscuro y luz desde la izquierda.
type C = CanvasRenderingContext2D;
const INK = 'rgba(14,6,26,.75)';
const path = (c: C, pts: [number, number][], close = true) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); if (close) c.closePath(); };
const fillStroke = (c: C, fill: string | CanvasGradient, lw = 1) => { c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.stroke(); };
const grad = (c: C, x0: number, x1: number, a: string, b: string) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
const eyes = (c: C, y: number, col: string, dx = 2.6, r = 1.1) => { c.fillStyle = col; c.beginPath(); c.arc(-dx, y, r, 0, 6.28); c.arc(dx, y, r, 0, 6.28); c.fill(); };
const boots = (c: C, col: string, w = 4.6) => { for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 4.6, -0.8, w, 2.6, 0, 0, 6.28); fillStroke(c, col); } };

export function drawPC(c: C, id: string, t: number): boolean {
  const br = Math.sin(t * 2.1) * .7; // respiración
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  switch (id) {
    case 'romain': { // tiefling clérigo de Kelemvor: túnica dorada, cuernos, báculo con balanza
      // cola
      c.strokeStyle = '#8f2f2a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-6, -4); c.quadraticCurveTo(-18, -2, -15, -12 + Math.sin(t * 3) * 1.5); c.stroke();
      boots(c, '#2a1a22');
      path(c, [[-10, -1], [10, -1], [8, -26 + br], [-8, -26 + br]]); fillStroke(c, grad(c, -10, 10, '#e2cf78', '#8c7a2c'));
      c.fillStyle = '#5a2a6a'; c.fillRect(-9.4, -18, 18.8, 3.2); // faja violeta
      c.fillStyle = '#f3e3a0'; c.fillRect(-1, -26 + br, 2, 25); // borde de la túnica
      // brazo izquierdo y mano
      c.strokeStyle = '#b8453a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, -23 + br); c.lineTo(-12, -14); c.stroke(); c.beginPath(); c.arc(-12, -13, 2.2, 0, 6.28); c.fillStyle = '#b8453a'; c.fill();
      // báculo con balanza (a la derecha)
      c.strokeStyle = '#6b4a2a'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(14, 1); c.lineTo(14, -44); c.stroke();
      c.strokeStyle = '#e8c872'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(8, -43); c.lineTo(20, -43); c.moveTo(8, -43); c.lineTo(6, -37); c.moveTo(8, -43); c.lineTo(10, -37); c.moveTo(20, -43); c.lineTo(18, -37); c.moveTo(20, -43); c.lineTo(22, -37); c.stroke();
      for (const px of [8, 20]) { c.beginPath(); c.ellipse(px, -36.5, 3.2, 1.4, 0, 0, 6.28); fillStroke(c, '#e8c872', .8); }
      c.strokeStyle = '#b8453a'; c.lineWidth = 3; c.beginPath(); c.moveTo(8, -23 + br); c.lineTo(13, -18); c.stroke();
      // cabeza
      c.beginPath(); c.arc(0, -31 + br, 7.2, 0, 6.28); fillStroke(c, '#c24c40');
      c.beginPath(); c.moveTo(-5, -36 + br); c.quadraticCurveTo(-11, -42 + br, -9, -49 + br); c.quadraticCurveTo(-5, -43 + br, -2, -38 + br); c.moveTo(5, -36 + br); c.quadraticCurveTo(11, -42 + br, 9, -49 + br); c.quadraticCurveTo(5, -43 + br, 2, -38 + br); fillStroke(c, '#2a1a1a', .8);
      eyes(c, -31 + br, '#ffe27a'); c.strokeStyle = '#7a2a24'; c.lineWidth = 1; c.beginPath(); c.arc(0, -28.5 + br, 2, .2, Math.PI - .2); c.stroke();
      break; }
    case 'pact': { // aasimar caído: alas plegadas, halo, armadura blanca y dorada
      // alas (detrás), plegadas hacia arriba
      for (const s of [-1, 1]) { for (let i = 0; i < 4; i++) { c.save(); c.translate(s * 6, -26 + br); c.rotate(s * (.35 + i * .2)); path(c, [[0, 0], [s * 3.2, -9 - i * 1.5], [s * 7 + s * i, -22 - i * 2.2], [s * 1.6, -22 - i * 2]]); fillStroke(c, i % 2 ? '#f6efd6' : '#e6dcb8', .7); c.restore(); } }
      boots(c, '#6a5a3a', 4.8);
      path(c, [[-9, -1], [9, -1], [7, -25 + br], [-7, -25 + br]]); fillStroke(c, grad(c, -9, 9, '#f4eed0', '#a89a68')); // coraza
      c.fillStyle = '#d4a574'; c.fillRect(-8.6, -17, 17.2, 2.6); c.strokeStyle = INK; c.lineWidth = .6; c.strokeRect(-8.6, -17, 17.2, 2.6);
      c.beginPath(); c.arc(-9, -24 + br, 4.4, 0, 6.28); fillStroke(c, '#e8c872'); c.beginPath(); c.arc(9, -24 + br, 4.4, 0, 6.28); fillStroke(c, '#c9a458'); // hombreras
      // espada al costado
      c.strokeStyle = '#e8eef8'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(13, -6); c.lineTo(13, -30); c.stroke(); c.strokeStyle = '#d4a574'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(10, -7); c.lineTo(16, -7); c.stroke();
      c.beginPath(); c.arc(0, -31 + br, 6.8, 0, 6.28); fillStroke(c, '#f1e8cc');
      c.fillStyle = '#d8c690'; c.beginPath(); c.arc(0, -34 + br, 7, Math.PI, 0); c.fill(); // pelo claro
      eyes(c, -31 + br, '#5aa0e0');
      c.strokeStyle = `rgba(255,236,150,${.75 + .2 * Math.sin(t * 3)})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, -43 + br, 7, 2.2, 0, 0, 6.28); c.stroke(); // halo
      break; }
    case 'rabb': { // brujo hexblade: capa violeta con capucha, espadón de pacto
      boots(c, '#1c1230');
      path(c, [[-11, -1], [11, -1], [8, -27 + br], [-8, -27 + br]]); fillStroke(c, grad(c, -11, 11, '#8a6ad8', '#3f2a78'));
      c.fillStyle = 'rgba(0,0,0,.28)'; path(c, [[0, -27 + br], [8, -27 + br], [11, -1], [0, -1]]); c.fill();
      // capucha
      path(c, [[-8.5, -29 + br], [0, -43 + br], [8.5, -29 + br], [5, -22 + br], [-5, -22 + br]]); fillStroke(c, grad(c, -9, 9, '#7a5cc9', '#34226a'));
      c.fillStyle = '#0c0616'; c.beginPath(); c.ellipse(0, -30 + br, 5, 5.6, 0, 0, 6.28); c.fill();
      c.fillStyle = '#c9b4ff'; c.shadowColor = '#b69cff'; c.shadowBlur = 5; c.beginPath(); c.arc(-2.3, -30.5 + br, 1.1, 0, 6.28); c.arc(2.3, -30.5 + br, 1.1, 0, 6.28); c.fill(); c.shadowBlur = 0;
      // espadón
      c.save(); c.translate(15, -10); c.rotate(.12); path(c, [[-2, 8], [2, 8], [2.6, -30], [0, -36], [-2.6, -30]]); fillStroke(c, grad(c, -3, 3, '#e8e0ff', '#7c70c0'), .8); c.strokeStyle = '#b69cff'; c.lineWidth = .8; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, -26); c.stroke(); c.fillStyle = '#4a2a8a'; c.fillRect(-5, 6, 10, 2.4); c.restore();
      c.strokeStyle = '#3f2a78'; c.lineWidth = 3; c.beginPath(); c.moveTo(8, -23 + br); c.lineTo(14, -9); c.stroke();
      break; }
    case 'joren': { // explorador: capa verde, capucha baja, arco y carcaj
      boots(c, '#3a2a1c');
      path(c, [[-10, -1], [10, -1], [8, -25 + br], [-8, -25 + br]]); fillStroke(c, grad(c, -10, 10, '#6aae78', '#2f5a3a'));
      c.fillStyle = '#6b4a2a'; c.fillRect(-9.4, -15, 18.8, 2.6); c.fillStyle = '#d4a574'; c.fillRect(-1.4, -15.4, 2.8, 3.4); // cinto
      // carcaj
      path(c, [[-11, -24 + br], [-7, -27 + br], [-3, -9], [-7, -8]]); fillStroke(c, '#6b4a2a', .8); c.strokeStyle = '#e8d8a8'; c.lineWidth = 1; for (const ax of [-9.5, -7.8]) { c.beginPath(); c.moveTo(ax, -24 + br); c.lineTo(ax - 1, -31 + br); c.stroke(); }
      // capa con capucha
      path(c, [[-8, -27 + br], [0, -41 + br], [8, -27 + br], [5, -23 + br], [-5, -23 + br]]); fillStroke(c, grad(c, -8, 8, '#5f9a6c', '#2a4f34'));
      c.beginPath(); c.arc(0, -31 + br, 5.6, 0, 6.28); fillStroke(c, '#d2a679', .8); c.fillStyle = '#2a4f34'; c.beginPath(); c.moveTo(-6.6, -33 + br); c.quadraticCurveTo(0, -42 + br, 6.6, -33 + br); c.lineTo(0, -35 + br); c.fill();
      c.fillStyle = '#3a2a1c'; c.fillRect(-4.2, -29.5 + br, 8.4, 2.2); // bufanda
      eyes(c, -31.5 + br, '#1c120a', 2.2, 1);
      // arco
      c.strokeStyle = '#7a5230'; c.lineWidth = 2.4; c.beginPath(); c.arc(14, -20, 17, -1.1, 1.1); c.stroke(); c.strokeStyle = '#e8e0c8'; c.lineWidth = .8; c.beginPath(); c.moveTo(14 + 17 * Math.cos(-1.1), -20 + 17 * Math.sin(-1.1)); c.lineTo(14 + 17 * Math.cos(1.1), -20 + 17 * Math.sin(1.1)); c.stroke();
      c.strokeStyle = '#d2a679'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(8, -22 + br); c.lineTo(14, -20); c.stroke();
      break; }
    case 'zyrthar': { // asesina drow: cuero oscuro, cabello blanco, dagas cruzadas
      boots(c, '#14101c', 4.2);
      path(c, [[-8.5, -1], [8.5, -1], [6.5, -25 + br], [-6.5, -25 + br]]); fillStroke(c, grad(c, -9, 9, '#4a3a7a', '#1c1430'));
      c.strokeStyle = '#8a6ad8'; c.lineWidth = 1; c.beginPath(); c.moveTo(-7, -14); c.lineTo(7, -17); c.stroke(); // correa
      // dagas enfundadas a los costados de la cintura (apuntan hacia abajo, no parecen brazos)
      for (const s of [-1, 1]) { c.save(); c.translate(s * 8.5, -14); c.rotate(-s * .35); path(c, [[-1.2, 0], [1.2, 0], [1, 12], [0, 15], [-1, 12]]); fillStroke(c, '#d8dcec', .7); c.fillStyle = '#6a4a2a'; c.fillRect(-2, -3.2, 4, 3.4); c.strokeStyle = INK; c.lineWidth = .6; c.strokeRect(-2, -3.2, 4, 3.4); c.restore(); }
      for (const s of [-1, 1]) { c.strokeStyle = '#2a1f44'; c.lineWidth = 3; c.beginPath(); c.moveTo(s * 6.5, -22 + br); c.lineTo(s * 8, -15); c.stroke(); c.beginPath(); c.arc(s * 8.4, -14, 1.9, 0, 6.28); c.fillStyle = '#5a5680'; c.fill(); }
      // cabeza: piel azul-violeta, pelo blanco
      c.fillStyle = '#e8e4f4'; c.beginPath(); c.arc(0, -34 + br, 7.2, Math.PI * .95, Math.PI * .05, false); c.lineTo(5.5, -22 + br); c.lineTo(-5.5, -22 + br); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
      c.beginPath(); c.arc(0, -31 + br, 5.8, 0, 6.28); fillStroke(c, '#5a5680', .8);
      c.fillStyle = '#0c0818'; c.beginPath(); c.moveTo(-6, -31 + br); c.lineTo(6, -31 + br); c.lineTo(5, -27 + br); c.lineTo(-5, -27 + br); c.fill(); // antifaz
      eyes(c, -31.5 + br, '#ff8ac8', 2.3, 1);
      break; }
    case 'panchi': { // monje enano: bajo y ancho, torso desnudo, fajas en las manos, barba trenzada
      c.scale(1.08, .9);
      boots(c, '#3a2a22', 5.4);
      path(c, [[-11, -1], [11, -1], [9, -24 + br], [-9, -24 + br]]); fillStroke(c, grad(c, -11, 11, '#e0904a', '#9a4a22'));
      c.fillStyle = '#7a3a1a'; c.fillRect(-10.4, -14, 20.8, 3.4); c.fillStyle = '#e8c872'; c.beginPath(); c.arc(0, -12.3, 1.7, 0, 6.28); c.fill();
      // torso abierto
      c.fillStyle = '#c98a5a'; path(c, [[-3, -24 + br], [3, -24 + br], [1.5, -14], [-1.5, -14]]); c.fill();
      // brazos fuertes y puños vendados
      for (const s of [-1, 1]) { c.strokeStyle = '#c98a5a'; c.lineWidth = 5; c.beginPath(); c.moveTo(s * 9, -22 + br); c.lineTo(s * 14, -13); c.stroke(); c.beginPath(); c.arc(s * 14.5, -11.5, 3.6, 0, 6.28); fillStroke(c, '#efe6d0', .8); }
      // cabeza + barba
      c.beginPath(); c.arc(0, -30 + br, 7.4, 0, 6.28); fillStroke(c, '#d09468');
      c.fillStyle = '#7a3a1a'; c.beginPath(); c.moveTo(-6.6, -28 + br); c.quadraticCurveTo(-8, -17 + br, -2, -15 + br); c.lineTo(0, -19 + br); c.lineTo(2, -15 + br); c.quadraticCurveTo(8, -17 + br, 6.6, -28 + br); c.quadraticCurveTo(0, -24 + br, -6.6, -28 + br); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
      c.fillStyle = '#e8d8c0'; c.fillRect(-7.4, -34 + br, 14.8, 2.6); c.fillStyle = '#b02a2a'; c.fillRect(-7.4, -34 + br, 14.8, 1.2); // cinta
      eyes(c, -30.5 + br, '#1c0e08', 2.8, 1.1); c.strokeStyle = '#1c0e08'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4.4, -33 + br); c.lineTo(-1.2, -32 + br); c.moveTo(4.4, -33 + br); c.lineTo(1.2, -32 + br); c.stroke();
      break; }
    default: c.restore(); return false;
  }
  c.restore(); return true;
}
