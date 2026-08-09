'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MousePointerClick } from 'lucide-react';
import { SphereNavigation } from '@/components/sphere/SphereNavigation';
import { useIsTouch } from '@/hooks/useMediaQuery';
import { premiumEase } from '@/lib/motion';

interface HomeViewProps {
  onSelect: (id: string) => void;
  activeId?: string | null;
  compact?: boolean;
}

/**
 * Hero section housing the WebGL topic sphere. The sphere is presented in a
 * dark, immersive "deep space" panel (matching the chosen design), while the
 * rest of the page stays light — an Apple/Stripe-style dark hero + light body.
 */
export function HomeView({
  onSelect,
  activeId = null,
  compact = false,
}: HomeViewProps) {
  const t = useTranslations();
  const isTouch = useIsTouch();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.section
      layout
      transition={{ duration: 0.6, ease: premiumEase }}
      className={`relative flex flex-col items-center ${
        compact
          ? 'pb-16 pt-8'
          : 'min-h-[calc(100dvh-4rem)] justify-start pb-24 pt-6 sm:pt-8'
      }`}
    >
      {/* Hero copy — pinned at the top center, near the logo. */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: premiumEase, delay: 0.1 }}
        className={`relative z-10 max-w-3xl px-5 text-center sm:px-8 ${
          compact ? 'mb-2' : 'mb-2'
        }`}
      >
        <p
          className={`font-semibold uppercase tracking-[0.2em] text-gold-light transition-all ${
            compact ? 'text-xs' : 'mb-3 text-xs sm:text-sm'
          }`}
        >
          {t('hero.eyebrow')}
        </p>
        {!compact && (
          <h1 className="font-display text-display-lg font-extrabold leading-[1.04] tracking-tight text-white text-balance">
            {t('hero.title')}
          </h1>
        )}
      </motion.div>

      {/* WebGL sphere — sits below the title, filling remaining space. */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: premiumEase, delay: 0.2 }}
        className={`relative z-10 flex items-center justify-center ${
          compact ? '' : 'flex-1'
        }`}
      >
        <SphereNavigation
          onSelect={onSelect}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          activeId={activeId}
          compact={compact}
        />
      </motion.div>

      {/* Hint — pinned near the bottom of the hero. */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-2 text-sm text-white/60"
        >
          <MousePointerClick className="h-4 w-4" aria-hidden />
          <span>{isTouch ? t('hero.hintTouch') : t('hero.hint')}</span>
        </motion.div>
      )}

    </motion.section>
  );
}
