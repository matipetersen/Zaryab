import { portraitUrl } from './portraits';
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, any> = {}, ...kids: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v; else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids) if (k != null && k !== false) el.append(k as any);
  return el;
}
export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
export function avatar(glyph: string, color: string, img?: string, size = 30): HTMLElement {
  const a = h('span', { class: 'avatar', style: { width: size + 'px', height: size + 'px', background: img ? `url(${portraitUrl(img)}) center/cover` : color, fontSize: size * .5 + 'px' } }, img ? '' : glyph);
  return a;
}
