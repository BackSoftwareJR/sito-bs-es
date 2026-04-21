import { notFound } from 'next/navigation';
import { LegalShell } from '@/components/legal/LegalShell';
import { readLegalHtml } from '@/lib/readLegalHtml';
import { getLocaleMessages } from '@/lib/getLocaleMessages';
import { buildLegalMetadata } from '@/lib/legalMetadata';
import { isValidLocale } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }
  const messages = await getLocaleMessages(locale);
  if (!messages) {
    return {};
  }
  return buildLegalMetadata('terms', locale, messages);
}

export default async function TermsPage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  const html = readLegalHtml('terms', locale);
  return (
    <LegalShell doc="terms">
      <article className="legal-doc" dangerouslySetInnerHTML={{ __html: html }} />
    </LegalShell>
  );
}
