// Arte externo opcional: si existe un archivo con el nombre correcto, reemplaza al dibujo procedural. Ver docs/ARTE.md.
//   src/assets/bg/<fondo>.jpg            ilustración de fondo de historia (p. ej. dunas, medinat, prison…)
//   src/assets/sprites/<id>.png          sprite de unidad (id de personaje o monstruo); <id>@4.png = tira de 4 cuadros en horizontal
//   src/assets/tiles/<tema>_floor.png    baldosa de suelo (también _diff, _water, _high, _wall, _cover); <tema> = theme del mapa
const files = import.meta.glob('../assets/{bg,sprites,tiles}/*.{png,jpg,jpeg,webp}', { eager: true, query: '?inline', import: 'default' }) as Record<string, string>;
interface Entry { url: string; frames: number; img?: HTMLImageElement }
const index: Record<string, Entry> = {};
for (const [path, url] of Object.entries(files)) {
  const m = path.match(/assets\/(bg|sprites|tiles)\/(.+?)(?:@(\d+))?\.(?:png|jpe?g|webp)$/); if (!m) continue;
  index[`${m[1]}/${m[2]}`] = { url, frames: m[3] ? +m[3] : 1 };
}
export type AssetKind = 'bg' | 'sprites' | 'tiles';
export const assetUrl = (kind: AssetKind, name: string): string | undefined => index[`${kind}/${name}`]?.url;
/** Imagen ya cargada (o null si no existe o aún se está decodificando). */
export function assetImg(kind: AssetKind, name: string): { img: HTMLImageElement; frames: number } | null {
  const e = index[`${kind}/${name}`]; if (!e) return null;
  if (!e.img) { e.img = new Image(); e.img.src = e.url; }
  return e.img.complete && e.img.naturalWidth ? { img: e.img, frames: e.frames } : null;
}
export const hasAssets = Object.keys(index).length > 0;
