'use client';

import { useCallback, useState } from 'react';
import type { Topic } from '@/content/schema';
import { getTopic } from '@/lib/content';

export type ViewState = 'home' | 'topic';

interface TopicSelection {
  view: ViewState;
  selectedTopic: Topic | null;
  selectTopic: (id: string) => void;
  clearSelection: () => void;
}

/**
 * Central single-page navigation state.
 * One selected topic drives the Home ↔ Topic transition; no routing.
 */
export function useTopicSelection(): TopicSelection {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectTopic = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  const selectedTopic = selectedId ? (getTopic(selectedId) ?? null) : null;

  return {
    view: selectedTopic ? 'topic' : 'home',
    selectedTopic,
    selectTopic,
    clearSelection,
  };
}
