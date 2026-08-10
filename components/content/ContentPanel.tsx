'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Topic } from '@/content/schema';
import { useLocale } from '@/components/layout/LocaleProvider';
import { contentLocaleFor } from '@/hooks/useContentLocale';
import { getCategoryName, categories } from '@/lib/content';
import { getCategoryVisual } from '@/lib/categories';
import { QuranSection } from './QuranSection';
import { HadithSection } from './HadithSection';
import { ScholarsSection } from './ScholarsSection';
import { LessonsSection } from './LessonsSection';
import { premiumEase } from '@/lib/motion';

export function ContentPanel({ topic }: { topic: Topic }) {
  const { locale } = useLocale();
  const cl = contentLocaleFor(locale);
  const t = useTranslations();
  const content = topic.translations[cl];
  const headingRef = useRef<HTMLHeadingElement>(null);

  const category = categories.find((c) => c.id === topic.categoryId);
  const { icon: CategoryIcon } = getCategoryVisual(topic.categoryId);

  // Move focus to the topic title when it opens (screen-reader UX).
  useEffect(() => {
    headingRef.current?.focus();
  }, [topic.id]);

  return (
    <motion.article
      key={topic.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.5, ease: premiumEase }}
      className="dark-content mx-auto mt-8 max-w-content scroll-mt-24 border-t border-white/10 px-5 pb-16 pt-10 sm:mt-12 sm:px-8"
    >
      {/* Topic hero */}
      <header className="mb-10">
        {category && (
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gold-deep">
            <CategoryIcon className="h-4 w-4" aria-hidden />
            <span className="uppercase tracking-wider">
              {getCategoryName(category, cl)}
            </span>
          </div>
        )}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-display-md font-extrabold tracking-tight text-ink text-balance outline-none"
        >
          {content.name}
        </h1>
        <div className="rule-gold mt-6" aria-hidden />
      </header>

      {/* Sections — exact order: Quran → Hadith → Scholars → Lessons */}
      <div className="space-y-14">
        <QuranSection verses={content.quran} />
        <HadithSection items={content.hadith} />
        <ScholarsSection items={content.scholars} />
        <LessonsSection items={content.lessons} />
      </div>
    </motion.article>
  );
}
