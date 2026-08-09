'use client';

import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RichText } from '@/components/ui/RichText';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from './SectionHeader';
import { parseHadith } from '@/lib/parseEntries';
import { fadeUp, staggerContainer, gentle } from '@/lib/motion';

export function HadithSection({ items }: { items: string[] }) {
  const t = useTranslations();

  return (
    <section aria-labelledby="section-hadith" className="scroll-mt-24">
      <SectionHeader
        icon={ScrollText}
        index="02"
        title={t('sections.hadith')}
        subtitle={t('sectionsSub.hadith')}
      />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {items.map((raw, i) => {
          const h = parseHadith(raw);
          return (
            <motion.li key={i} variants={fadeUp} transition={gentle}>
              <figure className="rounded-2xl border border-line bg-card p-6 shadow-soft transition-shadow duration-300 hover:shadow-card sm:p-7">
                <blockquote className="kb-rich text-base leading-relaxed text-ink text-pretty sm:text-lg">
                  <RichText text={h.quote} />
                </blockquote>

                {(h.source || h.grade || h.note) && (
                  <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line-soft pt-4">
                    {h.source && (
                      <cite className="not-italic text-sm font-medium text-ink-soft">
                        <RichText text={h.source} />
                      </cite>
                    )}
                    {h.grade && <Badge variant="gold">{h.grade}</Badge>}
                    {h.note && (
                      <span className="text-xs text-ink-muted">
                        <RichText text={h.note} />
                      </span>
                    )}
                  </figcaption>
                )}
              </figure>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
