'use client';

import { useEffect } from 'react';
import { defaultLocale, locales } from '../lib/i18n';

/**
 * Landing at `/`. With `output: 'export'` there is no middleware,
 * so we rely on:
 *  1. A <meta http-equiv="refresh"> for no-JS crawlers and users.
 *  2. A visible <a> fallback for accessibility.
 *  3. Client-side Accept-Language sniffing to jump to the best locale.
 */
export default function RootPage() {
  useEffect(() => {
    try {
      const preferred = (navigator.languages || [navigator.language || ''])
        .map((l) => l.toLowerCase().split('-')[0])
        .find((l) => locales.includes(l));
      const target = preferred || defaultLocale;
      window.location.replace(`/${target}/`);
    } catch {
      window.location.replace(`/${defaultLocale}/`);
    }
  }, []);

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=/${defaultLocale}/`} />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#f5f2ec',
          color: '#3d3828',
        }}
      >
        <a
          href={`/${defaultLocale}/`}
          style={{ textDecoration: 'underline', fontWeight: 600 }}
        >
          Back Software — Continue to site
        </a>
      </div>
    </>
  );
}
