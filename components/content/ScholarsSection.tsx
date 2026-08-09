'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RichText } from '@/components/ui/RichText';
import { SectionHeader } from './SectionHeader';
import { parseScholar } from '@/lib/parseEntries';
import { fadeUp, staggerContainer, gentle } from '@/lib/motion';

export function ScholarsSection({ items }: { items: string[] }) {
  const t = useTranslations();

  return (
    <section aria-labelledby="section-scholars" className="scroll-mt-24">
      <SectionHeader
        icon={Quote}
        index="03"
        title={t('sections.scholars')}
        subtitle={t('sectionsSub.scholars')}
      />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2"
      >
        {items.map((raw, i) => {
          const s = parseScholar(raw);
          return (
            <motion.li
              key={i}
              variants={fadeUp}
              transition={gentle}
              className="h-full"
            >
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-card p-6 shadow-soft transition-shadow duration-300 hover:shadow-card">
                <Quote
                  className="mb-3 h-5 w-5 flex-none text-gold/50"
                  aria-hidden
                />
                <blockquote className="kb-rich flex-1 text-base leading-relaxed text-ink text-pretty">
                  <RichText text={s.quote} />
                </blockquote>
                <figcaption className="mt-4 border-t border-line-soft pt-3">
                  {s.name && (
                    <div className="font-display text-sm font-bold text-gold-deep">
                      {s.name}
                    </div>
                  )}
                  {s.source && (
                    <cite className="mt-0.5 block text-xs not-italic text-ink-muted">
                      <RichText text={s.source} />
                    </cite>
                  )}
                </figcaption>
              </figure>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
