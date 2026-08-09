'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import { locales, localeShort, localeNames } from '@/i18n/config';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations('language');

  return (
    <div
      role="group"
      aria-label={t('select')}
      className="inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/5 p-0.5 backdrop-blur"
    >
      {locales.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            aria-label={localeNames[l]}
            className={`relative rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors duration-300 ${
              active
                ? 'bg-gold text-white shadow-soft'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            {localeShort[l]}
          </button>
        );
      })}
    </div>
  );
}
