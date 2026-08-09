/**
 * Ilim Knowledge Base Parser
 * -------------------------------------------------------------
 * Converts the approved trilingual markdown into structured JSON.
 * This script ONLY restructures existing text into fields.
 * It never rewrites, paraphrases, or invents content.
 *
 * Output: content/ilim.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(__dirname, 'source.md');
const OUT = path.join(__dirname, '..', 'content', 'ilim.json');

const LOCALES = ['en', 'ru', 'kk'];

// Language section markers in the source file
const LANG_MARKERS = {
  en: '=== ENGLISH ===',
  ru: '=== РУССКИЙ ===',
  kk: '=== ҚАЗАҚША ===',
};

// Category heading patterns per language (in file order 1..8)
const CATEGORY_PREFIX = {
  en: /^# Category \d+:\s*(.+)$/,
  ru: /^# Категория \d+:\s*(.+)$/,
  kk: /^# \d+-санат:\s*(.+)$/,
};

// Section subheading labels per language, mapped to canonical keys
const SECTION_LABELS = {
  quran: { en: 'Quran', ru: 'Коран', kk: 'Құран' },
  hadith: { en: 'Hadith', ru: 'Хадис', kk: 'Хадис' },
  scholars: { en: 'Scholar Quotes', ru: 'Слова учёных', kk: 'Ғалымдар сөзі' },
  lessons: {
    en: 'Practical Lessons',
    ru: 'Практические уроки',
    kk: 'Практикалық сабақтар',
  },
};

// Canonical category ids (stable across languages, in file order)
const CATEGORY_IDS = [
  'family',
  'relationships',
  'personal-development',
  'work-success',
  'mental-wellbeing',
  'society',
  'health',
  'spirituality',
];

/** Slugify a topic name into a stable ascii id from the English name. */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[()'']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Strip surrounding markdown emphasis and quotes for clean text fields. */
function clean(str) {
  return str.trim();
}

/** Split the file into the three language blocks. */
function splitLanguages(raw) {
  const lines = raw.split('\n');
  const blocks = {};
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current) blocks[current] = buffer.join('\n');
  };

  for (const line of lines) {
    const marker = Object.entries(LANG_MARKERS).find(
      ([, m]) => line.trim() === m,
    );
    if (marker) {
      flush();
      current = marker[0];
      buffer = [];
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();
  return blocks;
}

/**
 * Parse one language block into an ordered list of topics.
 * Returns: [{ categoryIndex, categoryName, topicName, sections }]
 */
function parseLanguageBlock(block, locale) {
  const lines = block.split('\n');
  const topics = [];

  let categoryIndex = -1;
  let categoryName = '';
  let currentTopic = null;
  let currentSection = null; // canonical key
  let sectionBuffer = [];

  const catRe = CATEGORY_PREFIX[locale];

  const labelToKey = (label) => {
    for (const [key, map] of Object.entries(SECTION_LABELS)) {
      if (map[locale] === label) return key;
    }
    return null;
  };

  const flushSection = () => {
    if (currentTopic && currentSection) {
      currentTopic.sections[currentSection] = parseSectionBody(
        currentSection,
        sectionBuffer,
      );
    }
    sectionBuffer = [];
  };

  const flushTopic = () => {
    flushSection();
    if (currentTopic) topics.push(currentTopic);
    currentTopic = null;
    currentSection = null;
  };

  for (const line of lines) {
    // Category heading
    const catMatch = line.match(catRe);
    if (catMatch) {
      flushTopic();
      categoryIndex += 1;
      categoryName = clean(catMatch[1]);
      continue;
    }

    // Topic heading (## Xxx) — but skip the "Complete Reference" subtitle
    if (/^## /.test(line)) {
      const name = clean(line.replace(/^## /, ''));
      if (/^Complete Reference/i.test(name)) continue;
      flushTopic();
      currentTopic = {
        categoryIndex,
        categoryName,
        topicName: name,
        sections: {},
      };
      currentSection = null;
      continue;
    }

    // Section heading (### Xxx)
    if (/^### /.test(line)) {
      flushSection();
      const label = clean(line.replace(/^### /, ''));
      currentSection = labelToKey(label);
      continue;
    }

    // Accumulate section body
    if (currentTopic && currentSection) {
      sectionBuffer.push(line);
    }
  }

  flushTopic();
  return topics;
}

/** Parse Quran verses: "- **17:23** — *"text"*" */
function parseQuran(lines) {
  const items = [];
  for (const line of lines) {
    const m = line.match(/^-\s*\*\*(.+?)\*\*\s*[—-]\s*(.+)$/);
    if (m) {
      const reference = clean(m[1]);
      // Remove wrapping *"..."* / *«...»* emphasis but keep inner text intact
      let text = clean(m[2]);
      text = text.replace(/^\*+/, '').replace(/\*+$/, '').trim();
      items.push({ reference, text });
    }
  }
  return items;
}

/** Parse Hadith or Scholar items — keep the full original line as `text`. */
function parseListItems(lines) {
  const items = [];
  let buffer = null;

  for (const line of lines) {
    if (/^-\s+/.test(line)) {
      if (buffer !== null) items.push(clean(buffer));
      buffer = line.replace(/^-\s+/, '');
    } else if (buffer !== null && line.trim() !== '') {
      buffer += '\n' + line;
    }
  }
  if (buffer !== null) items.push(clean(buffer));
  return items;
}

/** Parse numbered practical lessons: "1. text" */
function parseLessons(lines) {
  const items = [];
  let buffer = null;

  for (const line of lines) {
    if (/^\d+\.\s+/.test(line)) {
      if (buffer !== null) items.push(clean(buffer));
      buffer = line.replace(/^\d+\.\s+/, '');
    } else if (buffer !== null && line.trim() !== '') {
      buffer += '\n' + line;
    }
  }
  if (buffer !== null) items.push(clean(buffer));
  return items;
}

function parseSectionBody(sectionKey, lines) {
  switch (sectionKey) {
    case 'quran':
      return parseQuran(lines);
    case 'hadith':
    case 'scholars':
      return parseListItems(lines);
    case 'lessons':
      return parseLessons(lines);
    default:
      return [];
  }
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
function main() {
  const raw = fs.readFileSync(SOURCE, 'utf8');
  const langBlocks = splitLanguages(raw);

  const perLang = {};
  for (const locale of LOCALES) {
    if (!langBlocks[locale]) {
      throw new Error(`Missing language block: ${locale}`);
    }
    perLang[locale] = parseLanguageBlock(langBlocks[locale], locale);
  }

  // Sanity: all languages must have the same number of topics
  const counts = LOCALES.map((l) => perLang[l].length);
  if (new Set(counts).size !== 1) {
    console.warn('⚠️  Topic count mismatch:', Object.fromEntries(
      LOCALES.map((l, i) => [l, counts[i]]),
    ));
  }

  const topicCount = perLang.en.length;
  const topics = [];
  const categoriesMeta = {};

  for (let i = 0; i < topicCount; i++) {
    const en = perLang.en[i];
    const ru = perLang.ru[i];
    const kk = perLang.kk[i];

    const categoryId = CATEGORY_IDS[en.categoryIndex] ?? `cat-${en.categoryIndex}`;
    const id = slugify(en.topicName);

    // Record category display names per locale (once)
    if (!categoriesMeta[categoryId]) {
      categoriesMeta[categoryId] = {
        id: categoryId,
        order: en.categoryIndex,
        name: {
          en: en.categoryName,
          ru: ru.categoryName,
          kk: kk.categoryName,
        },
      };
    }

    topics.push({
      id,
      categoryId,
      order: i,
      translations: {
        en: {
          name: en.topicName,
          quran: en.sections.quran ?? [],
          hadith: en.sections.hadith ?? [],
          scholars: en.sections.scholars ?? [],
          lessons: en.sections.lessons ?? [],
        },
        ru: {
          name: ru.topicName,
          quran: ru.sections.quran ?? [],
          hadith: ru.sections.hadith ?? [],
          scholars: ru.sections.scholars ?? [],
          lessons: ru.sections.lessons ?? [],
        },
        kk: {
          name: kk.topicName,
          quran: kk.sections.quran ?? [],
          hadith: kk.sections.hadith ?? [],
          scholars: kk.sections.scholars ?? [],
          lessons: kk.sections.lessons ?? [],
        },
      },
    });
  }

  const output = {
    meta: {
      topicCount: topics.length,
      categoryCount: Object.keys(categoriesMeta).length,
      locales: LOCALES,
      generatedFrom: 'ilim_knowledge_base_TRILINGUAL.md',
    },
    categories: Object.values(categoriesMeta).sort((a, b) => a.order - b.order),
    topics,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');

  console.log(`✓ Parsed ${topics.length} topics × ${LOCALES.length} languages`);
  console.log(`✓ ${output.categories.length} categories`);
  console.log(`✓ Written to ${OUT}`);

  // Quick integrity report
  let issues = 0;
  for (const t of topics) {
    for (const l of LOCALES) {
      const tr = t.translations[l];
      if (!tr.name || tr.quran.length === 0) {
        console.warn(`  ⚠️  ${t.id} [${l}] missing name or quran`);
        issues++;
      }
    }
  }
  console.log(issues === 0 ? '✓ Integrity check passed' : `⚠️  ${issues} issues`);
}

main();
