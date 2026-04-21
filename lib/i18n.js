export const locales = ['it', 'en', 'es', 'fr'];
export const defaultLocale = 'es';

export function isValidLocale(locale) {
  return locales.includes(locale);
}
