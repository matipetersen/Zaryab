import type { Campaign } from '../state';
import { d } from '../engine/dice';

// ───────────────────────────────────────────────────────────────────────────
//  Seguidores del culto (inspirado en Cult of the Lamb).
//  Cada seguidor tiene un oficio, una fe (0–10), un rasgo y necesidades.
//  Cada 3 días ocurre un «ciclo»: producen, comen, enferman o desertan.
// ───────────────────────────────────────────────────────────────────────────
export type Role = 'predicador' | 'cocinero' | 'espia' | 'artesano' | 'curandero' | 'guardia' | 'mercader' | 'visionario' | 'descanso';
export type Trait = 'fanatico' | 'esceptico' | 'glotón' | 'soñador' | 'leal' | 'valiente' | '';
export interface Follower { id: string; name: string; role: Role; fe: number; trait: Trait; sick: boolean; since: number; apt: Role[]; blurb: string; prov?: boolean }

export const ROLES: Record<Role, { label: string; icon: string; out: string }> = {
  predicador: { label: 'Predicador', icon: '📣', out: '+1 PF por ciclo (+1 cada 4 de fe). Sube la fe de quien escucha.' },
  cocinero: { label: 'Cocinero', icon: '🥖', out: '+3 víveres por ciclo (+1 con fe ≥ 7).' },
  espia: { label: 'Espía', icon: '👁', out: '+2 rumores. Baja la Alerta 1 cada dos ciclos (cada ciclo con 3 espías).' },
  artesano: { label: 'Artesano', icon: '🧵', out: '+2 materiales por ciclo (+1 con fe ≥ 7). Los materiales abaratan edificios.' },
  curandero: { label: 'Curandero', icon: '⚕', out: 'Cura a los enfermos cada ciclo. Si un PJ cae, el cristal cobra 1 PF menos.' },
  guardia: { label: 'Guardia', icon: '🛡', out: 'Combate a vuestro lado en las defensas del santuario y patrullas (máx. 3).' },
  mercader: { label: 'Mercader', icon: '⚖', out: '+2 PF y +1 rumor por ciclo.' },
  visionario: { label: 'Visionario', icon: '☽', out: '+2 rumores. Sus sueños revelan la verdad tras el augurio del Oráculo.' },
  descanso: { label: 'Descansando', icon: '🌙', out: '+1 fe por ciclo. No produce.' },
};
export const TRAITS: Record<Exclude<Trait, ''>, { label: string; desc: string }> = {
  fanatico: { label: 'Fanático', desc: 'Los sermones le dan el doble de fe. Se alegra con la Corrupción.' },
  esceptico: { label: 'Escéptico', desc: 'Pierde fe cada ciclo si la Corrupción es alta (≥ 6).' },
  glotón: { label: 'Glotón', desc: 'Come el doble.' },
  soñador: { label: 'Soñador', desc: '+1 rumor si trabaja de espía o visionario.' },
  leal: { label: 'Leal', desc: 'Nunca deserta.' },
  valiente: { label: 'Valiente', desc: 'Como guardia, tiene +10 PG en combate.' },
};
// Seguidores con nombre (canon y misiones). Los marcados «prov» tienen oficio provisional (el canon sólo da el nombre).
export const CATALOG: Record<string, Omit<Follower, 'id' | 'name' | 'fe' | 'sick' | 'since'> & { fe: number }> = {
  Aisha: { role: 'cocinero', apt: ['cocinero', 'artesano', 'predicador'], trait: 'leal', fe: 6, blurb: 'Tejedora. Hace pan de arena (cura un poco, deja sabor a ceniza). Su esposo fue un Hijo del Simurg.' },
  Farid: { role: 'visionario', apt: ['visionario', 'descanso'], trait: 'soñador', fe: 5, blurb: 'Niño envenenado por el Lago. Su sombra no coincide con sus movimientos.' },
  Shib: { role: 'espia', apt: ['espia', 'guardia'], trait: 'valiente', fe: 6, blurb: 'Hijo del Simurg. Conoce los túneles secretos.' },
  'Al-Khush': { role: 'artesano', apt: ['artesano'], trait: 'leal', fe: 7, blurb: 'Sordomudo. Repara alfombras mágicas. No acepta pago, sólo respeto.' },
  'Perro callejero': { role: 'guardia', apt: ['guardia', 'descanso'], trait: 'leal', fe: 8, blurb: 'Flaco, fiel y poco exigente.' },
  'Los niños del barrio': { role: 'espia', apt: ['espia', 'descanso'], trait: 'soñador', fe: 6, blurb: 'Lo ven y lo oyen todo desde los tejados. Dibujan el ojo del Simurg.' },
  'Un médico agradecido': { role: 'curandero', apt: ['curandero', 'cocinero'], trait: 'leal', fe: 7, blurb: 'Curó a tres seguidores y ya no quiso irse.' },
  'Idris el albañil': { role: 'artesano', apt: ['artesano', 'guardia'], trait: 'valiente', fe: 7, blurb: 'Bajó a la biblioteca con su familia la noche de la plaza. Sabe levantar muros.' },
  'Layla la costurera': { role: 'cocinero', apt: ['cocinero', 'curandero', 'artesano'], trait: 'leal', fe: 7, blurb: 'Refugiada de la plaza. Cose telas blancas para los casamientos del culto.' },
  'Taj el aguador': { role: 'espia', apt: ['espia', 'mercader'], trait: 'soñador', fe: 6, blurb: 'Conoce cada pozo y cada chisme del Bajo Zaryab.' },
  Ranma: { role: 'predicador', apt: ['predicador', 'mercader'], trait: 'fanatico', fe: 6, blurb: 'Converso de la primera sesión. Lidera el dabbing ritual.', prov: true },
  Cabernet: { role: 'mercader', apt: ['mercader', 'cocinero'], trait: 'glotón', fe: 5, blurb: 'Converso de la primera sesión. Vende cualquier cosa, sobre todo vino.', prov: true },
  Apu: { role: 'guardia', apt: ['guardia', 'mercader'], trait: 'valiente', fe: 6, blurb: 'Converso de la primera sesión. Tiene tienda y mal genio.', prov: true },
};
const NOMBRES = ['Idris', 'Samira', 'Taj', 'Layla', 'Omar', 'Zaida', 'Hamid', 'Noor', 'Rashid', 'Yasmin', 'Karim', 'Dalia', 'Jamal', 'Amira', 'Bashir', 'Farah', 'Tariq', 'Hana', 'Nadir', 'Soraya'];
const GENERIC: { role: Role; apt: Role[]; trait: Trait }[] = [
  { role: 'predicador', apt: ['predicador', 'mercader', 'descanso'], trait: 'fanatico' }, { role: 'cocinero', apt: ['cocinero', 'artesano'], trait: '' }, { role: 'espia', apt: ['espia', 'visionario'], trait: 'soñador' },
  { role: 'artesano', apt: ['artesano', 'cocinero'], trait: '' }, { role: 'guardia', apt: ['guardia', 'descanso'], trait: 'valiente' }, { role: 'mercader', apt: ['mercader', 'espia'], trait: 'glotón' },
  { role: 'descanso', apt: ['descanso', 'predicador'], trait: 'esceptico' }, { role: 'curandero', apt: ['curandero', 'cocinero'], trait: '' },
];
let uid = 1;
export function makeFollower(name: string, day = 1): Follower {
  const c = CATALOG[name];
  if (c) return { id: 'f' + uid++, name, role: c.role, apt: c.apt, trait: c.trait, fe: c.fe, sick: false, since: day, blurb: c.blurb, prov: c.prov };
  const g = GENERIC[d(GENERIC.length) - 1];
  const nm = /^(Un|Una|Los|Las)\b/.test(name) ? name : name;
  return { id: 'f' + uid++, name: nm, role: g.role, apt: g.apt, trait: g.trait, fe: 4 + d(3) - 1, sick: false, since: day, blurb: 'Se unió al culto.' };
}
export function randomRecruit(day: number): Follower { const g = GENERIC[d(GENERIC.length) - 1]; const nm = NOMBRES[d(NOMBRES.length) - 1]; return { id: 'f' + uid++, name: nm, role: g.role, apt: g.apt, trait: g.trait, fe: 3 + d(3), sick: false, since: day, blurb: 'Llegó atraído por los rumores del santuario.' }; }
export function migrate(raw: any[]): Follower[] { return raw.map(x => typeof x === 'string' ? makeFollower(x) : x); }

export const count = (c: Campaign, role: Role) => c.followers.filter(f => f.role === role && !f.sick).length;
/** Producción esperada por ciclo (para mostrarla en la interfaz). */
export function projection(c: Campaign) {
  let pf = 0, food = 0, mats = 0, rumors = 0;
  for (const f of c.followers) {
    if (f.sick) continue; const hi = f.fe >= 7 ? 1 : 0;
    switch (f.role) {
      case 'predicador': pf += 1 + Math.floor(f.fe / 4); break; case 'cocinero': food += 3 + hi; break; case 'artesano': mats += 2 + hi; break;
      case 'mercader': pf += 2; rumors += 1; break; case 'espia': rumors += 2 + (f.trait === 'soñador' ? 1 : 0); break; case 'visionario': rumors += 2 + (f.trait === 'soñador' ? 1 : 0); break;
    }
  }
  const need = Math.ceil(c.followers.reduce((s, f) => s + (f.trait === 'glotón' ? 2 : 1), 0) / 2);
  return { pf, food, mats, rumors, need };
}
/** Un ciclo (cada 3 días). Devuelve líneas para el diario. */
export function tick(c: Campaign): string[] {
  const out: string[] = []; if (!c.followers.length) return out;
  c.ticks = (c.ticks ?? 0) + 1;
  const p = projection(c);
  c.pf += p.pf; c.seal += p.pf; c.food += p.food; c.mats += p.mats; c.rumors += p.rumors;
  if (p.pf || p.food || p.mats || p.rumors) out.push(`El culto trabaja: ${[p.pf && `+${p.pf} PF`, p.food && `+${p.food} víveres`, p.mats && `+${p.mats} materiales`, p.rumors && `+${p.rumors} rumores`].filter(Boolean).join(', ')}.`);
  // Predicadores dan fe a los que escuchan
  const preach = count(c, 'predicador'); if (preach) for (const f of c.followers) if (f.role !== 'predicador' && !f.sick) f.fe = Math.min(10, f.fe + (preach >= 2 ? 1 : (c.ticks % 2 ? 1 : 0)));
  // Comida
  if (c.food >= p.need) c.food -= p.need;
  else { c.food = 0; for (const f of c.followers) f.fe = Math.max(0, f.fe - 1); out.push('Hay hambre en el santuario: todos pierden 1 de fe. Hacen falta víveres.'); }
  // Enfermedad / curación
  const healers = count(c, 'curandero');
  const hungry = c.food === 0;
  for (const f of c.followers) {
    if (f.sick) { if (healers || d(10) <= 4) { f.sick = false; out.push(`${f.name} se cura.`); } else f.fe = Math.max(0, f.fe - 1); }
    else if (!healers && d(100) <= (hungry ? 12 : 4)) { f.sick = true; out.push(`${f.name} enferma.`); }
  }
  // Fe
  for (const f of c.followers) {
    if (f.role === 'descanso') f.fe = Math.min(10, f.fe + 1);
    if (f.trait === 'esceptico' && c.c >= 6) f.fe = Math.max(0, f.fe - 1);
    if (f.trait === 'fanatico' && c.c >= 4) f.fe = Math.min(10, f.fe + 1);
  }
  // Espías bajan la Alerta
  const spies = count(c, 'espia'); if (spies >= 3 || (spies >= 1 && c.ticks % 2 === 0)) { if (c.alert > 0) { c.alert--; out.push('Los espías desvían a una patrulla: la Alerta baja.'); } }
  // Deserción
  for (const f of [...c.followers]) if (f.fe <= 2 && f.trait !== 'leal' && d(10) <= (f.fe === 0 ? 6 : 3)) {
    c.followers = c.followers.filter(x => x !== f);
    if (f.fe === 0) { c.alert = Math.min(10, c.alert + 1); out.push(`${f.name} pierde la fe y os denuncia al Conclave. +1 Alerta.`); } else out.push(`${f.name} abandona el culto en silencio.`);
  }
  return out;
}
export function guardAllies(c: Campaign): { n: number; brave: number } {
  const g = c.followers.filter(f => f.role === 'guardia' && !f.sick).slice(0, 3); return { n: g.length, brave: g.filter(f => f.trait === 'valiente').length };
}

// ───────── Acciones del santuario ─────────
export interface ActResult { ok: boolean; text: string; days: number }
const spend = (c: Campaign, pf: number) => c.pf >= pf;
export function sermon(c: Campaign, kind: 'fe' | 'hierro'): ActResult {
  if (!c.followers.length) return { ok: false, text: 'No hay nadie que escuche.', days: 0 };
  if (c.sermonDay === c.day) return { ok: false, text: 'Hoy ya habéis predicado.', days: 0 };
  c.sermonDay = c.day; let up = 0, down = 0;
  for (const f of c.followers) {
    if (kind === 'fe') { const g = f.trait === 'fanatico' ? 2 : 1; f.fe = Math.min(10, f.fe + g); up++; }
    else { if (f.trait === 'esceptico') { f.fe = Math.max(0, f.fe - 1); down++; } else { f.fe = Math.min(10, f.fe + (f.trait === 'fanatico' ? 3 : 2)); up++; } }
  }
  c.pf += kind === 'hierro' ? 2 : 1; c.seal += kind === 'hierro' ? 2 : 1; if (kind === 'hierro') c.c = Math.min(10, c.c + 1);
  return { ok: true, days: 1, text: kind === 'fe' ? `Predicáis sobre el Simurg que perdona. ${up} seguidores ganan fe.` : `Predicáis sobre el hierro y la sangre. ${up} se enardecen${down ? `; ${down} escépticos se alejan` : ''}. +1 Corrupción.` };
}
export function recruit(c: Campaign): ActResult {
  const chance = Math.max(0.35, 0.9 - c.alert * 0.06 - (c.followers.length > 12 ? 0.2 : 0));
  if (Math.random() > chance) return { ok: true, days: 1, text: 'Predicáis en el Bajo Zaryab. Las puertas se cierran: el barrio tiene miedo. Nadie se une hoy.' };
  const n = 1 + (Math.random() < 0.3 ? 1 : 0); const names: string[] = [];
  for (let i = 0; i < n; i++) { const f = randomRecruit(c.day); c.followers.push(f); names.push(`${f.name} (${ROLES[f.role].label})`); }
  c.pf += n; c.seal += n; return { ok: true, days: 1, text: `Se unen: ${names.join(' y ')}. Cada creyente es un latido más en el cristal (+${n} PF).` };
}
export const RITUALS = [
  { id: 'dab', name: 'El Dab de Zaryab', cost: 'Gratis · 1 día · cada 3 días', desc: 'Ritual canónico del culto: todos levantan un brazo y agachan la cabeza. Sube la fe y regala 1 PF.' },
  { id: 'banquete', name: 'Banquete de pan de arena', cost: '6 víveres · 1 día', desc: 'Una comida común. +2 fe a todos y se curan los enfermos.' },
  { id: 'boda', name: 'Casamiento de telas blancas', cost: '2 víveres · 2 días', desc: 'Dos seguidores se casan con telas blancas en la mano, gritando. +3 fe a la pareja, +1 al resto, +4 PF.' },
  { id: 'ofrenda', name: 'Ofrenda de Huesos', cost: 'Un seguidor · 1 día', desc: 'Sacrificar al seguidor con menos fe en el altar: +10 PF y +3 Corrupción, el resto pierde 2 de fe.' },
  { id: 'ascension', name: 'Ascensión', cost: 'Un seguidor con fe 10 · 1 día', desc: 'Un devoto alcanza la plenitud. Elegís: ascender (+1 Devoción, +5 PF) o convertirlo en reliquia (+1 Corrupción, +8 PF).' },
] as const;
export function ritual(c: Campaign, id: string, opt?: string): ActResult {
  const cd = (c.ritualCd ??= {});
  const F = c.followers;
  if (id === 'dab') { if ((cd.dab ?? -9) > c.day - 3) return { ok: false, days: 0, text: 'Los brazos aún están cansados (cada 3 días).' }; if (!F.length) return { ok: false, days: 0, text: 'No hay a quién.' }; cd.dab = c.day; for (const f of F) f.fe = Math.min(10, f.fe + 1); c.pf++; c.seal++; return { ok: true, days: 1, text: 'Ranma da la señal. Todos levantan un brazo y agachan la cabeza. Hay risas. Hay fe. (+1 fe a todos, +1 PF)' }; }
  if (id === 'banquete') { if (c.food < 6) return { ok: false, days: 0, text: 'Faltan víveres (6).' }; c.food -= 6; for (const f of F) { f.fe = Math.min(10, f.fe + 2); f.sick = false; } return { ok: true, days: 1, text: 'Pan de arena para todos. Alguien llora de alegría. Los enfermos se levantan.' }; }
  if (id === 'boda') { if (F.length < 2) return { ok: false, days: 0, text: 'Hacen falta dos seguidores.' }; if (c.food < 2) return { ok: false, days: 0, text: 'Faltan víveres (2).' }; c.food -= 2; const s = [...F].sort((a, b) => b.fe - a.fe); const [a, b] = [s[0], s[1]]; a.fe = Math.min(10, a.fe + 3); b.fe = Math.min(10, b.fe + 3); for (const f of F) if (f !== a && f !== b) f.fe = Math.min(10, f.fe + 1); c.pf += 4; c.seal += 4; return { ok: true, days: 2, text: `${a.name} y ${b.name} se casan con telas blancas en la mano, gritando. El santuario entero grita con ellos. (+4 PF)` }; }
  if (id === 'ofrenda') { if (F.length < 2) return { ok: false, days: 0, text: 'Quedaría un culto sin seguidores.' }; const v = [...F].sort((a, b) => a.fe - b.fe)[0]; c.followers = F.filter(f => f !== v); for (const f of c.followers) f.fe = Math.max(0, f.fe - 2); c.pf += 10; c.seal += 10; c.c = Math.min(10, c.c + 3); return { ok: true, days: 1, text: `${v.name} sube al altar de huesos sin entender. El cristal late con placer. (+10 PF, +3 Corrupción)` }; }
  if (id === 'ascension') { const v = F.find(f => f.fe >= 10); if (!v) return { ok: false, days: 0, text: 'Nadie ha alcanzado la fe 10.' }; c.followers = F.filter(f => f !== v); if (opt === 'reliquia') { c.pf += 8; c.seal += 8; c.c = Math.min(10, c.c + 1); return { ok: true, days: 1, text: `${v.name} se convierte en reliquia: un hueso dorado que murmura. (+8 PF, +1 Corrupción)` }; } c.pf += 5; c.seal += 5; c.d = Math.min(10, c.d + 1); return { ok: true, days: 1, text: `${v.name} asciende en una columna de luz. Nadie vuelve a verlo. (+5 PF, +1 Devoción)` }; }
  return { ok: false, days: 0, text: '…' };
}
export function setRole(c: Campaign, id: string, role: Role) { const f = c.followers.find(x => x.id === id); if (f && f.apt.includes(role)) f.role = role; }
void spend;
