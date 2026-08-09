'use client';

import { useLocale } from '@/components/layout/LocaleProvider';
import { getGroupedTopics } from '@/lib/content';
import { getCategoryVisual } from '@/lib/categories';

/**
 * Static, calm fallback shown when the user prefers reduced motion.
 * Topics are grouped by category as a clean constellation of pills —
 * fully keyboard navigable, no animation.
 */
export function SphereFallback({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const { locale } = useLocale();
  const grouped = getGroupedTopics();

  return (
    <div className="dark-content mx-auto max-w-4xl px-2">
      <div className="grid gap-8 sm:grid-cols-2">
        {grouped.map(({ category, topics }) => {
          const { icon: Icon } = getCategoryVisual(category.id);
          return (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <h3
                id={`cat-${category.id}`}
                className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-deep"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {category.name[locale]}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(topic.id)}
                      className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-ink-soft shadow-soft transition-colors hover:border-gold/50 hover:text-ink"
                    >
                      {topic.translations[locale].name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
