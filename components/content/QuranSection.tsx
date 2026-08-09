'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { QuranVerse } from '@/content/schema';
import { RichText } from '@/components/ui/RichText';
import { SectionHeader } from './SectionHeader';
import { fadeUp, staggerContainer, gentle } from '@/lib/motion';

export function QuranSection({ verses }: { verses: QuranVerse[] }) {
  const t = useTranslations();

  return (
    <section aria-labelledby="section-quran" className="scroll-mt-24">
      <SectionHeader
        icon={BookOpen}
        index="01"
        title={t('sections.quran')}
        subtitle={t('sectionsSub.quran')}
      />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {verses.map((verse, i) => (
          <motion.li
            key={`${verse.reference}-${i}`}
            variants={fadeUp}
            transition={gentle}
          >
            <figure className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gold-faint p-6 sm:p-7">
              {/* Gold accent bar */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold-light to-gold-deep"
              />
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold tabular-nums text-white">
                  {verse.reference}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-gold-deep">
                  {t('content.verse')}
                </span>
              </div>
              <blockquote className="kb-rich font-display text-lg leading-relaxed text-ink text-pretty sm:text-xl">
                <RichText text={verse.text} />
              </blockquote>
            </figure>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
