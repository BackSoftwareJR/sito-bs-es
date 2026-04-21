'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { locales, defaultLocale } from '../lib/i18n';

const localeLabels = {
  it: 'IT',
  en: 'EN',
  es: 'ES',
  fr: 'FR',
};

const localeNames = {
  it: 'Italiano',
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params.locale || defaultLocale;

  const handleLocaleChange = (newLocale) => {
    if (newLocale === currentLocale) return;
    
    // Replace current locale in pathname with new locale
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`px-2 py-1 text-[10px] lg:text-xs font-bold rounded-full transition-all ${
            currentLocale === locale
              ? 'bg-[#7c6f5b] text-[#f5f2ec]'
              : 'text-[#746a57] hover:text-[#3d3528] hover:bg-[#f1e9dc]'
          }`}
          title={localeNames[locale]}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
