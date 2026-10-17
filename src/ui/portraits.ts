import { PC_PORTRAITS } from './pcPortraits';
// Retratos incrustados como data URI: la build es autocontenida y funciona en cualquier carpeta o alojamiento.
const files = import.meta.glob('../assets/portraits/*.{jpg,jpeg,png,webp}', { eager: true, query: '?inline', import: 'default' }) as Record<string, string>;
const byName: Record<string, string> = { ...PC_PORTRAITS };
for (const [path, uri] of Object.entries(files)) byName[path.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/, '')] = uri;
export const portraitUrl = (img: string): string => byName[img] ?? '';
/** id de archivo sugerido para un hablante sin retrato asignado: «Viejo Linyera» → viejo_linyera. */
export const slug = (n: string) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
