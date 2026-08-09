export const locales = ['en', 'ru', 'kk'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  kk: 'Қазақша',
};

/** Short labels for the language switcher pills. */
export const localeShort: Record<Locale, string> = {
  en: 'EN',
  ru: 'RU',
  kk: 'KZ',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
