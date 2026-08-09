import type { Locale } from '@/i18n/config';

/** A single Quran verse: reference + preserved translation text. */
export interface QuranVerse {
  reference: string;
  text: string;
}

/**
 * Hadith and Scholar entries are preserved as raw markdown-ish strings
 * (they contain **bold** and *italic* emphasis that the UI renders).
 * Lessons are likewise preserved strings.
 */
export interface TopicContent {
  name: string;
  quran: QuranVerse[];
  hadith: string[];
  scholars: string[];
  lessons: string[];
}

export interface Topic {
  id: string;
  categoryId: string;
  order: number;
  translations: Record<Locale, TopicContent>;
}

export interface Category {
  id: string;
  order: number;
  name: Record<Locale, string>;
}

export interface KnowledgeBase {
  meta: {
    topicCount: number;
    categoryCount: number;
    locales: Locale[];
    generatedFrom: string;
  };
  categories: Category[];
  topics: Topic[];
}

/** Section identifiers used throughout the UI, in display order. */
export const SECTION_ORDER = ['quran', 'hadith', 'scholars', 'lessons'] as const;
export type SectionKey = (typeof SECTION_ORDER)[number];
