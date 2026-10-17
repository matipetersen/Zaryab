import { PC_PORTRAITS } from './pcPortraits';
// Retratos incrustados como data URI: la build es autocontenida y funciona en cualquier carpeta o alojamiento.
const files = import.meta.glob('../assets/portraits/*.{jpg,jpeg,png,webp}', { eager: true, query: '?inline', import: 'default' }) as Record<string, string>;
const byName: Record<string, string> = { ...PC_PORTRAITS };
for (const [path, uri] of Object.entries(files)) byName[path.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/, '')] = uri;
export const portraitUrl = (img: string): string => byName[img] ?? '';
