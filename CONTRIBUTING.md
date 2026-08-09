# Contributing to Ilim

Thank you for your interest in improving Ilim. Because this project handles
religious source material, a few rules are strict — please read the
**Content integrity** section before proposing any change to the knowledge base.

## Development setup

Requires Node.js 18.17+ (or 20+).

```bash
npm install
npm run dev      # regenerates content/ilim.json, then starts the dev server
npm run lint     # ESLint
npm run format   # Prettier
npm run build    # production build (also regenerates the JSON)
```

## Project layout

- `scripts/source.md` — the approved trilingual knowledge base (**edit here**)
- `content/ilim.json` — generated output (**never hand-edit**)
- `scripts/parse.mjs` — deterministic markdown → JSON parser
- `app/`, `components/`, `lib/`, `hooks/`, `i18n/` — the Next.js application

## Content integrity (please read)

The knowledge base is the single source of truth, and its wording is sacred in
the literal sense. When contributing content:

1. **Edit `scripts/source.md`, never `content/ilim.json`.** The JSON is
   regenerated on `predev` / `prebuild`; hand edits will be overwritten.
2. **Never alter the wording** of a Quran verse translation, a hadith text, a
   grade (e.g. Sahih/Hasan), or a scholarly quotation. Fix only genuine
   transcription errors, and cite the correction in your pull request.
3. **Preserve references exactly** — surah:ayah numbers, collection names,
   hadith numbers, and attributions.
4. **Keep all three languages in sync.** Every topic must exist in English,
   Russian, and Kazakh, with the same sections in the same order.
5. **Do not invent or paraphrase.** If a source can't be verified, leave it out
   rather than approximate it. "Widely attributed" material should be labelled
   as such, not presented as a graded narration.

After editing the source, run `npm run parse` and confirm the counts and a few
topics look right before opening a PR.

## Code contributions

- TypeScript is `strict`; keep it that way.
- Match the existing style; run `npm run format` and `npm run lint` before
  committing.
- Keep components accessible: semantic HTML, keyboard support, ARIA labels,
  visible focus, and `prefers-reduced-motion` fallbacks where animation is used.
- The WebGL sphere is heavy — keep it dynamically imported and SSR-disabled.

## Pull requests

- Keep PRs focused and describe the change clearly.
- For content changes, state your sources.
- Screenshots or screen recordings are appreciated for UI changes.
