// Lo que el jugador no ve: cuánto suma cada decisión a Corrupción o Devoción, y la CD de las pruebas.
const SOUL = /\s*[,;·]?\s*[+−-]\s?\d*\s*(Corrupción|Devoción)\b(\s*\([^)]*\))?/gi;
/** Quita de un texto de ayuda las menciones a Corrupción/Devoción y a la CD («Sigilo CD 14» → «Sigilo»). */
export function scrubSoul(t: string): string {
  return t.replace(SOUL, '').replace(/(^|[:.,;·]\s*)(Devoción|Corrupción)\s*(,\s*(y\s+)?|(?=[.;·]|$))/g, '$1').replace(/\s*\(?\bCD\s*\d+\)?/g, '').replace(/\(\s*[,;]\s*/g, '(').replace(/\s+(y|o|e)\s*(?=[.;,)]|$)/g, '').replace(/\s+y\s+por\b/g, ' por').replace(/\(\s*\)/g, '')
    .replace(/\s*:\s*([.;,]|$)/g, '$1').replace(/([.;,])\s*[.;,]+/g, '$1').replace(/(^|[.·]\s*)(Devoción|Corrupción)\.?\s*$/, '$1').replace(/^[\s.;,·]+/, '').replace(/^(y|e|o)\s+/i, '').replace(/\s{2,}/g, ' ').trim()
    .replace(/^./, c => c.toUpperCase()).replace(/^[.;,]$/, '');
}
