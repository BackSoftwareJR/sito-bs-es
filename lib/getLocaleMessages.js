export async function getLocaleMessages(locale) {
  try {
    return (await import(`../messages/${locale}.json`)).default;
  } catch {
    return null;
  }
}
