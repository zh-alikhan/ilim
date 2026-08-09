'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RichText } from '@/components/ui/RichText';
import { SectionHeader } from './SectionHeader';
import { fadeUp, staggerContainer, gentle } from '@/lib/motion';

export function LessonsSection({ items }: { items: string[] }) {
  const t = useTranslations();

  return (
    <section aria-labelledby="section-lessons" className="scroll-mt-24">
      <SectionHeader
        icon={Lightbulb}
        index="04"
        title={t('sections.lessons')}
        subtitle={t('sectionsSub.lessons')}
      />

      {/* Editorial disclaimer — required by content guidelines */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-line bg-mist/50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 flex-none text-ink-muted" aria-hidden />
        <p className="text-xs leading-relaxed text-ink-muted">
          {t('content.editorialNote')}
        </p>
      </div>

      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {items.map((lesson, i) => (
          <motion.li
            key={i}
            variants={fadeUp}
            transition={gentle}
            className="flex items-start gap-4 rounded-2xl border border-line bg-card p-5 shadow-soft"
          >
            <span
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gold-wash font-display text-sm font-bold tabular-nums text-gold-deep"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="kb-rich pt-0.5 text-base leading-relaxed text-ink-soft text-pretty">
              <RichText text={lesson} />
            </p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
