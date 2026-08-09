import rawData from '@/content/ilim.json';
import type {
  KnowledgeBase,
  Topic,
  Category,
  TopicContent,
} from '@/content/schema';
import type { Locale } from '@/i18n/config';

const kb = rawData as unknown as KnowledgeBase;

export const knowledgeBase = kb;
export const categories: Category[] = kb.categories;
export const topics: Topic[] = kb.topics;

/** Look up a single topic by id. */
export function getTopic(id: string): Topic | undefined {
  return kb.topics.find((t) => t.id === id);
}

/** Get localized content for a topic. */
export function getTopicContent(
  topic: Topic,
  locale: Locale,
): TopicContent {
  return topic.translations[locale];
}

/** Get the localized display name for a category. */
export function getCategoryName(category: Category, locale: Locale): string {
  return category.name[locale];
}

/** All topics belonging to a category, in order. */
export function getTopicsByCategory(categoryId: string): Topic[] {
  return kb.topics
    .filter((t) => t.categoryId === categoryId)
    .sort((a, b) => a.order - b.order);
}

/** Map of categoryId -> ordered topics, for grouped rendering. */
export function getGroupedTopics(): { category: Category; topics: Topic[] }[] {
  return kb.categories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      topics: getTopicsByCategory(category.id),
    }));
}
