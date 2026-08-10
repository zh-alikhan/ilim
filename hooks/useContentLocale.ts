import { useLocale } from '@/components/layout/LocaleProvider';
import type { Locale } from '@/i18n/config';

/**
 * Kazakh is delivered via Google Translate rather than a verified in-app
 * translation, so when the UI locale is `kk` we render the English verified
 * content and let the Google Translate layer convert the visible page.
 * English and Russian render their verified content directly.
 */
export function contentLocaleFor(locale: Locale): Locale {
  return locale === 'kk' ? 'en' : locale;
}

/** Convenience hook returning the locale that content components should read. */
export function useContentLocale(): Locale {
  const { locale } = useLocale();
  return contentLocaleFor(locale);
}
