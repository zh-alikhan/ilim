'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { premiumEase } from '@/lib/motion';
import type { ViewState } from '@/hooks/useTopicSelection';

interface HeaderProps {
  view: ViewState;
  onBack: () => void;
}

export function Header({ view, onBack }: HeaderProps) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060a1c]/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {view === 'topic' && (
              <motion.button
                key="back"
                type="button"
                onClick={onBack}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3, ease: premiumEase }}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:border-gold/50 hover:text-white"
                aria-label={t('nav.back')}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{t('nav.back')}</span>
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={onBack}
            className="flex items-baseline gap-2"
            aria-label={t('brand.name')}
          >
            <span className="font-display text-xl font-extrabold tracking-tight text-white">
              {t('brand.name')}
            </span>
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-gold"
              style={{ transform: 'translateY(-1px)' }}
            />
          </button>
        </div>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
