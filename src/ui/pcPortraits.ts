// Retratos de los seis personajes: bustos vectoriales hechos a mano (SVG), incrustados como data URI.
const wrap = (bg1: string, bg2: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></radialGradient></defs><rect width="100" height="100" fill="url(#g)"/>${body}</svg>`;
const eyes = (iris: string, y = 46, glow = false) => `<g>${glow ? `<ellipse cx="42" cy="${y}" rx="5" ry="3.6" fill="${iris}" opacity=".35"/><ellipse cx="58" cy="${y}" rx="5" ry="3.6" fill="${iris}" opacity=".35"/>` : ''}<ellipse cx="42.5" cy="${y}" rx="3.2" ry="2.2" fill="#f4efe6"/><ellipse cx="57.5" cy="${y}" rx="3.2" ry="2.2" fill="#f4efe6"/><circle cx="42.8" cy="${y}" r="1.5" fill="${iris}"/><circle cx="57.2" cy="${y}" r="1.5" fill="${iris}"/><circle cx="42.8" cy="${y}" r=".6" fill="#111"/><circle cx="57.2" cy="${y}" r=".6" fill="#111"/></g>`;
const brows = (c: string, y = 41, thick = 1.6, tilt = 0) => `<path d="M37 ${y + tilt} Q42 ${y - 2} 47 ${y}" stroke="${c}" stroke-width="${thick}" fill="none" stroke-linecap="round"/><path d="M53 ${y} Q58 ${y - 2} 63 ${y + tilt}" stroke="${c}" stroke-width="${thick}" fill="none" stroke-linecap="round"/>`;
const face = (skin: string, shade: string, rx = 17, ry = 20) => `<rect x="43" y="58" width="14" height="16" fill="${shade}"/><ellipse cx="50" cy="45" rx="${rx}" ry="${ry}" fill="${skin}"/><ellipse cx="${50 - rx}" cy="47" rx="3" ry="4.5" fill="${skin}"/><ellipse cx="${50 + rx}" cy="47" rx="3" ry="4.5" fill="${skin}"/><path d="M50 47 L48.5 54 Q50 55 52 54" fill="none" stroke="${shade}" stroke-width="1.2" stroke-linecap="round"/>`;
const mouth = (c = '#5a2a2a', w = 5, curve = 1) => `<path d="M${50 - w} 60 Q50 ${60 + curve * 2.2} ${50 + w} 60" stroke="${c}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
const shoulders = (c: string, trim: string) => `<path d="M6 100 Q10 72 50 68 Q90 72 94 100Z" fill="${c}"/><path d="M38 70 L50 82 L62 70" fill="none" stroke="${trim}" stroke-width="2"/>`;

export const PC_SVG: Record<string, string> = {
  // Romain · tiefling, clérigo de Kelemvor (Dominio de la Tumba)
  romain: wrap('#6b4a2a', '#150d1a', `${shoulders('#2a2236', '#c9b458')}
    <path d="M32 30 Q24 14 30 6 Q30 20 38 28Z" fill="#2c1b24"/><path d="M68 30 Q76 14 70 6 Q70 20 62 28Z" fill="#2c1b24"/>
    ${face('#8b4a6b', '#6d3a55')}<path d="M33 40 Q50 20 67 40 Q60 30 50 30 Q40 30 33 40Z" fill="#1c1118"/>
    ${brows('#1c1118', 41, 1.8, 1)}${eyes('#e8c240', 46, true)}${mouth('#3a1a2a', 4, .2)}
    <path d="M50 74 L50 86" stroke="#c9b458" stroke-width="1.4"/><circle cx="50" cy="90" r="4.5" fill="none" stroke="#c9b458" stroke-width="1.4"/><path d="M46 90 L54 90" stroke="#c9b458" stroke-width="1.2"/><path d="M62 53 Q68 50 66 58" stroke="#3a1a2a" stroke-width="1" fill="none"/>`),
  // Pact Risen · aasimar, maestro de batalla
  pact: wrap('#fff3b0', '#3a3550', `<circle cx="50" cy="26" r="19" fill="none" stroke="#fff0a0" stroke-width="2.4" opacity=".85"/>
    <path d="M6 100 Q10 70 50 66 Q90 70 94 100Z" fill="#8a93a6"/><path d="M6 100 Q8 80 24 74 L28 100Z" fill="#a5aec0"/><path d="M94 100 Q92 80 76 74 L72 100Z" fill="#a5aec0"/><path d="M38 68 L50 80 L62 68" fill="none" stroke="#e8e0b0" stroke-width="2"/>
    ${face('#f2d9b0', '#d8bb92')}<path d="M32 42 Q34 22 50 21 Q66 22 68 42 Q62 30 50 30 Q40 30 32 42Z" fill="#e8d9a0"/>
    ${brows('#b49a5a', 41, 1.6, 0)}${eyes('#e8c240', 46, true)}${mouth('#8a4a3a', 4, .8)}<path d="M44 62 Q50 66 56 62" stroke="#c9a870" stroke-width="1" fill="none"/>`),
  // Rabb Locke · humano, brujo hexblade
  rabb: wrap('#4b2c7a', '#0d0a1c', `<path d="M4 100 Q6 66 50 62 Q94 66 96 100Z" fill="#2a2040"/><path d="M22 100 Q26 74 50 70 Q74 74 78 100Z" fill="#3a2d58"/>
    ${face('#c9a07c', '#a78260', 16.5, 20)}<path d="M31 44 Q30 22 50 19 Q70 22 69 44 Q64 30 56 28 Q44 34 38 30 Q34 36 31 44Z" fill="#1b1424"/><path d="M36 36 L30 48 L40 40Z" fill="#1b1424"/>
    ${brows('#1b1424', 41, 1.8, 1)}${eyes('#b894ff', 46, true)}<circle cx="57.5" cy="46" r="5.4" fill="none" stroke="#b894ff" stroke-width=".9" opacity=".8"/>${mouth('#6a3a3a', 3.6, -.2)}
    <path d="M30 56 Q36 62 40 58" stroke="#5a4a2a" stroke-width=".8" fill="none" opacity=".6"/><path d="M50 84 L50 100" stroke="#b894ff" stroke-width="2.6"/><path d="M45 88 L55 88" stroke="#b894ff" stroke-width="2"/>`),
  // Joren Hell · humano, explorador acechador de la penumbra
  joren: wrap('#2d5a3a', '#0c140f', `<path d="M4 100 Q8 68 50 64 Q92 68 96 100Z" fill="#2f4a36"/><path d="M20 100 L30 72 M80 100 L70 72" stroke="#1c2a20" stroke-width="3"/>
    ${face('#c79a76', '#a47a58')}<path d="M26 46 Q22 14 50 12 Q78 14 74 46 Q70 28 62 24 Q50 20 38 24 Q30 28 26 46Z" fill="#37533d"/><path d="M26 46 Q24 62 32 66 L36 54Z" fill="#2f4a36"/><path d="M74 46 Q76 62 68 66 L64 54Z" fill="#2f4a36"/>
    ${brows('#2a1e16', 41.5, 1.9, .5)}${eyes('#6fb36a', 46.5)}<path d="M36 56 Q50 70 64 56 L62 60 Q50 66 38 60Z" fill="#6b5a46" opacity=".55"/>${mouth('#5a3a30', 3.8, .1)}
    <path d="M62 38 L60 54" stroke="#e8d8c0" stroke-width="1" opacity=".8"/><path d="M82 62 Q96 84 82 100" fill="none" stroke="#c9b48a" stroke-width="1.4"/>`),
  // Zyr'thar · drow, asesina
  zyrthar: wrap('#5a4a88', '#0d0a18', `<path d="M4 100 Q8 68 50 64 Q92 68 96 100Z" fill="#1d1a2a"/>
    ${face('#5d5870', '#47435a', 15.5, 19.5)}<path d="M28 46 Q24 12 50 11 Q76 12 72 46 Q70 26 60 22 Q50 18 40 22 Q30 26 28 46Z" fill="#ece6f2"/><path d="M28 46 Q22 70 30 84 L36 56Z" fill="#ece6f2"/><path d="M72 46 Q78 70 70 84 L64 56Z" fill="#ece6f2"/>
    <path d="M36 52 Q50 62 64 52 L64 62 Q50 72 36 62Z" fill="#1d1a2a"/>${brows('#cfc8dc', 41, 1.4, 1)}${eyes('#e0405a', 46.5, true)}<path d="M33 25 Q30 18 36 14" stroke="#ece6f2" stroke-width="2" fill="none"/>
    <path d="M70 80 L86 62" stroke="#c9c9d6" stroke-width="2.2"/><path d="M84 60 L90 56" stroke="#8a8a9a" stroke-width="2.4"/>`),
  // Panchi · enano, monje
  panchi: wrap('#c9783a', '#2a140a', `<path d="M4 100 Q8 70 50 66 Q92 70 96 100Z" fill="#b5532a"/><path d="M36 68 L50 100 L64 68" fill="#e6c9a0" opacity=".85"/>
    ${face('#d99c76', '#b97c58', 19, 17.5)}<path d="M31 38 Q50 30 69 38 L69 42 Q50 36 31 42Z" fill="#d8d2c4"/><circle cx="50" cy="32" r="2.2" fill="#c26b3a"/>
    <path d="M30 54 Q26 82 40 88 Q50 94 60 88 Q74 82 70 54 Q62 66 50 66 Q38 66 30 54Z" fill="#b5531f"/><path d="M38 76 L36 90 M50 80 L50 94 M62 76 L64 90" stroke="#7a3410" stroke-width="1.5"/>
    ${brows('#7a3410', 40.5, 2.6, 1.5)}${eyes('#3a2a1a', 45.5)}<path d="M44 58 Q50 60 56 58" stroke="#7a3410" stroke-width="1.6" fill="none"/><path d="M60 50 L64 53" stroke="#9a5a3a" stroke-width="1.2" opacity=".7"/>`),
};

const toUri = (svg: string) => 'data:image/svg+xml;base64,' + btoa(svg);
export const PC_PORTRAITS: Record<string, string> = Object.fromEntries(Object.entries(PC_SVG).map(([k, v]) => [k, toUri(v)]));
