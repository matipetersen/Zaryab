import type { Effect } from '../state';

/** Vínculos con personajes del mundo (0–5). Al llegar a 3 y a 5 dan una ventaja permanente de una sola vez. */
export const BOND_NAME: Record<string, string> = { ea: 'EaNassr', samira: 'Capitana Samira', nafisa: 'Lady Nafisa', abril: 'Abril', shub: 'Madam Shub', aisha: 'Aisha', farid: 'Farid' };
export const BOONS: Record<string, Record<number, { e: Effect; text: string }>> = {
  ea: { 3: { e: { gold: 80, rep: { mercaderes: 1 } }, text: 'os fía un cofre de monedas «para el viaje».' }, 5: { e: { alert: -3, flags: ['ea_cubre'] }, text: 'compra el silencio de todo el Zoco: la Alerta baja.' } },
  samira: { 3: { e: { alert: -2 }, text: 'pierde «por error» vuestro expediente.' }, 5: { e: { flags: ['samira_confia'], pf: 6 }, text: 'jura que, llegado el día, la Guardia no os apuntará.' } },
  nafisa: { 3: { e: { rumors: 3 }, text: 'os cuenta los secretos que la nobleza guarda bajo las máscaras.' }, 5: { e: { rep: { conclave: 1 }, flags: ['nafisa_aval'] }, text: 'avala vuestro nombre ante la corte.' } },
  abril: { 3: { e: { fe: 1 }, text: 'cuenta en Medinat que sois de fiar: crece la fe de vuestros seguidores.' }, 5: { e: { pf: 10 }, text: 'reúne a los suyos y deja una ofrenda ante vuestro altar.' } },
  shub: { 3: { e: { gold: 60 }, text: 'os paga un «adelanto» por mercancía que ni habéis visto.' }, 5: { e: { items: { pocion: 2 }, flags: ['shub_aliada'] }, text: 'os regala dos pociones de su reserva privada.' } },
  aisha: { 3: { e: { fe: 1 }, text: 'canta la nana en voz alta: la biblioteca parece menos fría.' }, 5: { e: { food: 6 }, text: 'llena la despensa con pan de arena de todo el mes.' } },
  farid: { 3: { e: { rumors: 2 }, text: 'toca para vosotros las canciones que oyó en el Lago.' }, 5: { e: { pf: 8, d: 1 }, text: 'os dedica una melodía que no es de nadie. Se os afloja algo en el pecho.' } },
};
