'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

const TITLE_KEY = {
  privacy: 'legal.privacyTitle',
  cookies: 'legal.cookiesTitle',
  terms: 'legal.termsTitle',
};

export function LegalShell({ doc, children }) {
  const { locale, t } = useI18n();
  const title = t(TITLE_KEY[doc] || TITLE_KEY.privacy);

  const links = [
    { href: `/${locale}/privacy/`, label: t('legal.privacyTitle'), active: doc === 'privacy' },
    { href: `/${locale}/cookies/`, label: t('legal.cookiesTitle'), active: doc === 'cookies' },
    { href: `/${locale}/terms/`, label: t('legal.termsTitle'), active: doc === 'terms' },
  ];

  return (
    <div className="legal-page-root fixed inset-0 z-[200] overflow-y-auto bg-[#f5f2ec] text-[#2d2818] font-sans antialiased">
      <header className="sticky top-0 z-10 border-b border-[#d4cbb8]/80 bg-[#f5f2ec]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="text-sm font-bold tracking-tight text-[#4b4336]">{title}</p>
          <Link
            href={`/${locale}/`}
            className="text-xs font-semibold uppercase tracking-wide text-[#6b5f4a] underline-offset-4 hover:text-[#2d2818] hover:underline"
          >
            {t('legal.backHome')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {children}

        <nav
          className="mt-12 border-t border-[#d4cbb8] pt-8"
          aria-label={t('legal.relatedLabel')}
        >
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#8a7f6a]">
            {t('legal.relatedLabel')}
          </p>
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {links.map(({ href, label, active }) => (
              <li key={href}>
                {active ? (
                  <span className="text-sm font-semibold text-[#2d2818]" aria-current="page">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-sm font-semibold text-[#5e5444] underline-offset-4 hover:text-[#2d2818] hover:underline"
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-8 text-xs leading-relaxed text-[#7a705d]">{t('legal.disclaimer')}</p>
      </main>
    </div>
  );
}
