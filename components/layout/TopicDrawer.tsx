'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import { contentLocaleFor } from '@/hooks/useContentLocale';
import { getGroupedTopics } from '@/lib/content';
import { getCategoryVisual } from '@/lib/categories';
import { premiumEase } from '@/lib/motion';

interface TopicDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeId?: string | null;
}

/**
 * Left slide-in drawer listing every topic grouped by category, for quick
 * navigation. Opened from the header burger button. Selecting a topic opens
 * it and closes the drawer.
 */
export function TopicDrawer({
  open,
  onClose,
  onSelect,
  activeId = null,
}: TopicDrawerProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const cl = contentLocaleFor(locale);
  const groups = getGroupedTopics();

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: premiumEase }}
            className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col border-r border-white/10 bg-[#080d20]/95 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.topics')}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-extrabold tracking-tight text-white">
                  {t('brand.name')}
                </span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-gold" />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('nav.close')}
                className="rounded-full border border-white/15 bg-white/5 p-1.5 text-white/70 transition-colors hover:border-gold/50 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Scrollable topic list */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
              {groups.map(({ category, topics }) => {
                const { icon: Icon } = getCategoryVisual(category.id);
                return (
                  <section key={category.id} className="mb-5">
                    <h2 className="mb-1.5 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-gold-deep">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {category.name[cl]}
                    </h2>
                    <ul>
                      {topics.map((topic) => {
                        const isActive = topic.id === activeId;
                        return (
                          <li key={topic.id}>
                            <button
                              type="button"
                              onClick={() => handleSelect(topic.id)}
                              aria-current={isActive ? 'true' : undefined}
                              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                isActive
                                  ? 'bg-gold/15 font-semibold text-gold-light'
                                  : 'text-white/75 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {topic.translations[cl].name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </nav>

            {/* Disclaimer + contact */}
            <div className="border-t border-white/10 px-5 py-4">
              <p className="mb-3 text-xs leading-relaxed text-white/45">
                {t('drawer.disclaimer')}
              </p>
              <a
                href="mailto:zh.alikhan@gmail.com?subject=Ilim%20—%20Feedback"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold-light transition-colors hover:border-gold/70 hover:bg-gold/15"
              >
                <Mail className="h-4 w-4" aria-hidden />
                {t('drawer.contact')}
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
