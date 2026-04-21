import fs from 'node:fs';
import path from 'node:path';
import { defaultLocale } from './i18n';

/**
 * Loads HTML legal content from content/legal/{slug}-{locale}.html
 * Falls back to default locale, then Italian, then to a minimal notice.
 */
export function readLegalHtml(slug, locale) {
  // Scope filesystem read to content/legal for Turbopack static analysis (next build).
  const base = path.join(/*turbopackIgnore: true*/ process.cwd(), 'content', 'legal');
  const candidates = [
    ...new Set([
      path.join(base, `${slug}-${locale}.html`),
      path.join(base, `${slug}-${defaultLocale}.html`),
      path.join(base, `${slug}-it.html`),
    ]),
  ];
  for (const filePath of candidates) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      // try next
    }
  }
  return `<p>Documento non disponibile per la lingua richiesta.</p>`;
}
