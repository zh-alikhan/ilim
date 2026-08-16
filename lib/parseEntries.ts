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

  // The quote is wrapped in *...* emphasis; the attribution dash comes AFTER
  // the closing '*'. Splitting on the first " — " breaks quotes that contain
  // an em-dash themselves (e.g. «Taqwa — here»). So we anchor the split to the
  // closing emphasis marker when present.
  let dashIndex = -1;
  let dashLen = 3;

  if (text.startsWith('*')) {
    // Find the closing '*' that ends the quote wrapper (skip a leading '**').
    const searchFrom = text.startsWith('**') ? 2 : 1;
    const closeStar = text.indexOf('*', searchFrom);
    if (closeStar !== -1) {
      // Look for the separator dash after the closing star.
      const afterStar = text.slice(closeStar + 1);
      const rel = afterStar.indexOf(' — ');
      if (rel !== -1) {
        dashIndex = closeStar + 1 + rel;
        dashLen = 3;
      } else {
        const relTight = afterStar.indexOf('—');
        if (relTight !== -1) {
          dashIndex = closeStar + 1 + relTight;
          dashLen = 1;
        }
      }
    }
  }

  // Fallback: original behaviour for entries without the *...* wrapper.
  if (dashIndex === -1) {
    dashIndex = text.indexOf(' — ');
    dashLen = 3;
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
  }

  const quotePart = text.slice(0, dashIndex).trim();
  let rest = text.slice(dashIndex + dashLen).trim();

  // Extract trailing parenthetical groups as grade/note. Some entries carry
  // BOTH a grade "(**Sahih**)" and a following italic note "*(explanation)*".
  // Pull every trailing "(...)" (optionally wrapped in * *), then classify:
  // the group containing bold is the grade; any other is the note.
  let grade: string | null = null;
  let note: string | null = null;
  const trailingParens: string[] = [];
  // Repeatedly strip a trailing "(...)" or "*(...)*" from the end.
  let matched = true;
  while (matched) {
    matched = false;
    const m2 = rest.match(/\*?\(([^)]*)\)\*?\s*$/);
    if (m2) {
      trailingParens.unshift(m2[1].trim());
      rest = rest.slice(0, m2.index).trim();
      matched = true;
    }
  }
  for (const group of trailingParens) {
    const boldMatch = group.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      grade = boldMatch[1].trim();
      const remainder = group.replace(/\*\*.+?\*\*/, '').trim();
      if (remainder.length > 0 && !note) note = remainder;
    } else if (!note) {
      note = group;
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
