import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Locale-agnostic root metadata. Per-locale metadata is generated in app/[locale]/layout.jsx.
export const metadata = {
  metadataBase: new URL('https://backsoftware.it'),
  authors: [{ name: 'Back Software', url: 'https://backsoftware.it' }],
  creator: 'Back Software',
  publisher: 'Back Software',
  category: 'business',
  classification: 'Web Agency, Digital Marketing, Software Development',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Inline script run BEFORE hydration to set <html lang> from the pathname.
// With `output: 'export'`, the root layout cannot know the locale at SSG time
// (the [locale] segment is below it), so the static HTML ships a neutral default lang.
// This script corrects lang the instant the page loads, well before React hydrates.
const SYNC_LANG_SCRIPT = `(function(){try{var m=location.pathname.match(/^\\/(it|en|es|fr)(?:\\/|$)/);if(m){document.documentElement.lang=m[1];}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SYNC_LANG_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=VT323&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
