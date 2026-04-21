import { notFound } from 'next/navigation';
import { locales, isValidLocale } from '../../lib/i18n';
import { getLocaleMessages } from '../../lib/getLocaleMessages';
import { I18nProvider } from '../../lib/i18n-context';
import LocaleLangUpdater from '../../lib/LocaleLangUpdater';

const ogLocaleMap = {
  it: 'it_IT',
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const messages = await getLocaleMessages(locale);

  if (!messages) {
    return {
      title: 'Back Software',
      description: 'Digital Agency',
    };
  }

  const meta = messages.metadata;
  const seo = messages.seo || {};

  return {
    title: {
      default: meta.title,
      template: '%s | Back Software',
    },
    description: meta.description,
    keywords: seo.keywords || [],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'it': '/it',
        'en': '/en',
        'es': '/es',
        'fr': '/fr',
        'x-default': '/es',
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `https://backsoftware.it/${locale}`,
      siteName: 'Back Software',
      locale: ogLocaleMap[locale] || 'es_ES',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: meta.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getLocaleMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <LocaleLangUpdater locale={locale} />
      <JsonLd locale={locale} messages={messages} />
      {children}
    </I18nProvider>
  );
}

function JsonLd({ locale, messages }) {
  const jsonLd = messages.jsonLd;
  const breadcrumbs = messages.breadcrumbs || {};

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://backsoftware.it/#business',
        name: jsonLd.businessName,
        description: jsonLd.businessDesc,
        url: 'https://backsoftware.it',
        telephone: '+393513052627',
        email: 'info@backsoftware.it',
        address: {
          '@type': 'PostalAddress',
          streetAddress: jsonLd.address,
          addressLocality: jsonLd.city,
          addressRegion: jsonLd.region,
          postalCode: jsonLd.postalCode,
          addressCountry: jsonLd.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '45.4668',
          longitude: '7.8742',
        },
        sameAs: [
          'https://www.instagram.com/backsoftware/',
          'https://www.linkedin.com/company/backsoftware',
          'https://www.facebook.com/backsoftware',
        ],
        serviceType: jsonLd.services,
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: '45.4668',
            longitude: '7.8742',
          },
          geoRadius: '50000',
        },
        priceRange: '€€',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: jsonLd.offerCatalogName,
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: jsonLd.websiteOffer,
                description: jsonLd.websiteOfferDesc,
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: jsonLd.marketingOffer,
                description: jsonLd.marketingOfferDesc,
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: jsonLd.softwareOffer,
                description: jsonLd.softwareOfferDesc,
              },
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://backsoftware.it/#website',
        url: 'https://backsoftware.it',
        name: jsonLd.businessName,
        inLanguage: locale,
        publisher: {
          '@id': 'https://backsoftware.it/#business',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: breadcrumbs.home || jsonLd.businessName,
            item: `https://backsoftware.it/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: jsonLd.services[0],
            item: `https://backsoftware.it/${locale}#servizi`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: jsonLd.services[1],
            item: `https://backsoftware.it/${locale}#progetti`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: jsonLd.services[2],
            item: `https://backsoftware.it/${locale}#contatti`,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
