'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageStarfield } from '@/components/layout/PageStarfield';
import { HomeView } from '@/components/sphere/HomeView';
import { useTopicSelection } from '@/hooks/useTopicSelection';

// Code-split the content panel: it's only needed once a topic is opened.
const ContentPanel = dynamic(
  () => import('@/components/content/ContentPanel').then((m) => m.ContentPanel),
  { ssr: false },
);

export default function Page() {
  const { view, selectedTopic, selectTopic, clearSelection } =
    useTopicSelection();
  const contentRef = useRef<HTMLDivElement>(null);

  // Select a topic, then smoothly scroll the content into view below the sphere.
  const handleSelect = useCallback(
    (id: string) => {
      selectTopic(id);
      // Wait for the content to mount, then scroll it into view. We retry a
      // couple of times because the panel is a dynamically-imported chunk and
      // may mount a tick later than the state update.
      let attempts = 0;
      const tryScroll = () => {
        attempts += 1;
        const el = contentRef.current;
        if (el && el.getBoundingClientRect().height > 0) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts < 12) {
          setTimeout(tryScroll, 60);
        }
      };
      requestAnimationFrame(() => setTimeout(tryScroll, 60));
    },
    [selectTopic],
  );

  const handleBack = useCallback(() => {
    clearSelection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [clearSelection]);

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #0d1a3d 0%, #060a1c 45%, #020308 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <PageStarfield />

      <Header view={view} onBack={handleBack} />

      <main className="relative z-10 flex-1">
        {/* Sphere stays mounted on top; content opens below it. */}
        <HomeView
          onSelect={handleSelect}
          activeId={selectedTopic?.id ?? null}
          compact={view === 'topic'}
        />

        <div ref={contentRef}>
          <AnimatePresence mode="wait" initial={false}>
            {selectedTopic && (
              <ContentPanel key={selectedTopic.id} topic={selectedTopic} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {view === 'topic' && <Footer />}
    </div>
  );
}
