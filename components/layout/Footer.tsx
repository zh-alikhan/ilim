'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            {t('brand.name')}
          </span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-gold" />
        </div>
        <p className="mt-3 max-w-reading text-sm leading-relaxed text-white/50 text-pretty">
          {t('footer.disclaimer')}
        </p>
        <p className="mt-4 text-xs text-white/40">{t('footer.rights')}</p>
      </div>
    </footer>
  );
}
