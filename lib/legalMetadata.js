import { locales, defaultLocale } from './i18n';

const DOC_PATH = {
  privacy: 'privacy',
  cookies: 'cookies',
  terms: 'terms',
};

export function buildLegalMetadata(doc, locale, messages) {
  const legal = messages?.legal || {};
  const map = {
    privacy: { title: legal.privacyTitle || 'Privacy', description: legal.privacyDescription || '' },
    cookies: { title: legal.cookiesTitle || 'Cookies', description: legal.cookiesDescription || '' },
    terms: { title: legal.termsTitle || 'Terms', description: legal.termsDescription || '' },
  };
  const { title, description } = map[doc] || map.privacy;
  const pathSeg = DOC_PATH[doc] || 'privacy';
  const languages = Object.fromEntries(
    locales.map((l) => [l, `https://backsoftware.it/${l}/${pathSeg}/`])
  );
  languages['x-default'] = `https://backsoftware.it/${defaultLocale}/${pathSeg}/`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://backsoftware.it/${locale}/${pathSeg}/`,
      languages,
    },
    openGraph: {
      title: `${title} | Back Software`,
      description,
      url: `https://backsoftware.it/${locale}/${pathSeg}/`,
      siteName: 'Back Software',
      locale: locale === 'it' ? 'it_IT' : locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : 'fr_FR',
      type: 'website',
    },
  };
}
