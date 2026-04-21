'use client';

import { useEffect } from 'react';

/**
 * Syncs the <html lang="..."> attribute with the current locale.
 * Necessary because the root layout at app/layout.jsx cannot access locale params
 * (the [locale] segment is below it), so we update lang client-side on mount.
 */
export default function LocaleLangUpdater({ locale }) {
  useEffect(() => {
    if (typeof document !== 'undefined' && locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}
