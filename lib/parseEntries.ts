/**
 * Display-time parsers for the preserved hadith and scholar strings.
 *
 * These split a preserved string into presentational parts (quote,
 * source, grade). They never alter the text — every character is still
 * shown; we only decide *where* to place each part in the layout.
 *
 * If a string doesn't match the expected shape, we fall back to showing
 * the whole thing as the quote, so nothing is ever dropped.
 */

export interface ParsedHadith {
  /** The hadith text (still contains any inner emphasis). */
  quote: string;
  /** Collection + number attribution, e.g. "Sahih al-Bukhari 5971, Sahih Muslim 2548". */
  source: string | null;
  /** Authenticity grade text found in the trailing (**...**) group. */
  grade: string | null;
  /** Any parenthetical note that isn't purely the grade. */
  note: string | null;
}

export interface ParsedScholar {
  /** Scholar name (from leading **bold**). */
  name: string | null;
  /** The quotation text. */
  quote: string;
  /** Trailing source / book, e.g. "Madarij as-Salikin" or an attribution note. */
  source: string | null;
}

/** Strip a single layer of wrapping *italic* / **bold** / quotes for a field. */
function unwrapEmphasis(s: string): string {
  let out = s.trim();
  // Remove leading/trailing * or ** used as wrappers
  out = out.replace(/^\*{1,2}/, '').replace(/\*{1,2}$/, '');
  return out.trim();
}

/**
 * Hadith shape:
 *   *"<quote>"* — <source> (**<grade>** [per ...])
 * The em dash (—) separates quote from attribution. The final
 * parenthetical carries the grade in bold.
 */
export function parseHadith(raw: string): ParsedHadith {
  const text = raw.trim();

  // Find the em-dash that separates quote from source. Handle both the
  // normal " — " and the tight "*—" variant (no leading space).
  let dashIndex = text.indexOf(' — ');
  let dashLen = 3;
  if (dashIndex === -1) {
    const tight = text.indexOf('—');
    if (tight === -1) {
      return {
        quote: unwrapEmphasis(text),
        source: null,
        grade: null,
        note: null,
      };
    }
    dashIndex = tight;
    dashLen = 1;
  }

  const quotePart = text.slice(0, dashIndex).trim();
  let rest = text.slice(dashIndex + dashLen).trim();

  // Extract a trailing parenthetical group as grade/note.
  let grade: string | null = null;
  let note: string | null = null;
  const parenMatch = rest.match(/\(([^)]*)\)\s*$/);
  if (parenMatch) {
    const inner = parenMatch[1].trim();
    rest = rest.slice(0, parenMatch.index).trim();
    // Grade is the bolded part; note is any remainder.
    const boldMatch = inner.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      grade = boldMatch[1].trim();
      const remainder = inner.replace(/\*\*.+?\*\*/, '').trim();
      note = remainder.length > 0 ? remainder : null;
    } else {
      note = inner;
    }
  }

  return {
    quote: unwrapEmphasis(quotePart),
    source: rest.length > 0 ? rest : null,
    grade,
    note,
  };
}

/**
 * Scholar shape:
 *   **<name>** — *"<quote>"* — *<source>*
 * or with a plain-text trailing attribution instead of a book.
 */
export function parseScholar(raw: string): ParsedScholar {
  const text = raw.trim();

  // Leading bold name
  let name: string | null = null;
  let rest = text;
  const nameMatch = text.match(/^\*\*(.+?)\*\*\s*—\s*/);
  if (nameMatch) {
    name = nameMatch[1].trim();
    rest = text.slice(nameMatch[0].length).trim();
  }

  // Split remaining into quote and trailing source on the last ' — '
  const lastDash = rest.lastIndexOf(' — ');
  if (lastDash !== -1) {
    const quotePart = rest.slice(0, lastDash).trim();
    const sourcePart = rest.slice(lastDash + 3).trim();
    return {
      name,
      quote: unwrapEmphasis(quotePart),
      source: unwrapEmphasis(sourcePart),
    };
  }

  return { name, quote: unwrapEmphasis(rest), source: null };
}
