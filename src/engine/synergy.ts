// Sinergias de equipo (como la «química» de un juego de fútbol): cuanto más relación tienen dos personajes, mejor pelean juntos.
export const pairKey = (a: string, b: string) => [a, b].sort().join('+');
/** Relación de partida entre cada par (puntos). Crece peleando cerca y con ciertas decisiones de la historia. */
export const BASE_CHEM: Record<string, number> = {
  'pact+romain': 3,    // el caído que busca redención y el clérigo que pesa almas
  'rabb+zyrthar': 3,   // dos que viven de secretos
  'joren+panchi': 3,   // dos exiliados que no confían en nadie… salvo en el otro
};
export const chemLevel = (pts: number) => pts >= 12 ? 3 : pts >= 7 ? 2 : pts >= 3 ? 1 : 0;
export const CHEM_LABEL = ['Desconocidos', 'Compañeros', 'Aliados', 'Hermanos de armas'];
export const NAMES: Record<string, string> = { romain: 'Romain', pact: 'Pact', rabb: 'Rabb', joren: 'Joren', zyrthar: "Zyr'thar", panchi: 'Panchi' };
export const chemOf = (chem: Record<string, number> | undefined, a: string, b: string) => (chem ?? {})[pairKey(a, b)] ?? BASE_CHEM[pairKey(a, b)] ?? 0;
export const chemPoints = (chem: Record<string, number> | undefined, key: string) => (chem ?? {})[key] ?? BASE_CHEM[key] ?? 0;
