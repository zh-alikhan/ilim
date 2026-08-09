# Ilim — Authentic Islamic Knowledge

A curated digital library of authentic Islamic guidance for everyday life,
presented as a fast, elegant single-page application.

Grounded in the Quran, authentic hadith, and the words of respected scholars —
**57 topics** across **8 categories**, in **English, Russian, and Kazakh**.

---

## Tech stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript** (strict)
- **Tailwind CSS** · **Framer Motion** · **Three.js** · **next-intl** · **Lucide React**
- **ESLint** + **Prettier**

## Getting started

Requires **Node.js 18.17+** (or 20+). Then:

```bash
npm install
npm run dev      # runs the parser, then starts the dev server
```

Open <http://localhost:3000>. The `predev` / `prebuild` hooks automatically run
`scripts/parse.mjs`, which regenerates `content/ilim.json` from the approved
source markdown.

To view it on a phone on the same Wi-Fi:

```bash
npm run dev -- -H 0.0.0.0
# then open http://<your-computer-ip>:3000 in the phone browser
```

## Deploy

The app deploys to [Vercel](https://vercel.com) with zero configuration — it
auto-detects Next.js. Push this repo to GitHub, import it in Vercel, and click
**Deploy**. Any static host that supports Next.js 14 works too.

## Standalone preview

`ilim-preview.html` is a single self-contained HTML file that mirrors the design
for quick sharing. It loads Three.js from a CDN, so it needs an internet
connection and is best opened in a real browser (e.g. Safari on iOS, not the
Files-app previewer). The production Next.js app bundles Three.js locally and
does not depend on any CDN.

## Content integrity

The knowledge base is the **single source of truth**. The parser only
*restructures* the approved markdown into typed JSON — it never rewrites,
paraphrases, or invents content. Every Quran verse, hadith number, grade,
citation, and editorial summary is preserved exactly as written.

- Source: `scripts/source.md` (the approved trilingual knowledge base)
- Generated: `content/ilim.json` (do not edit by hand)

## Architecture

```
app/            Next.js App Router entry, root layout, global styles
components/
  layout/       Header, Footer, LanguageSwitcher, LocaleProvider, PageStarfield
  sphere/       ThreeSphere (WebGL), SphereNavigation, HomeView, SphereFallback
  content/      ContentPanel + Quran/Hadith/Scholars/Lessons sections
  ui/           Primitives (RichText, Badge, …)
content/        ilim.json (source of truth) + schema.ts (types)
i18n/           Locale config, next-intl request, UI message catalogs
lib/            Typed content accessors, category metadata, motion variants
hooks/          useMediaQuery, usePrefersReducedMotion, useTopicSelection
scripts/        parse.mjs (markdown → JSON), source.md (approved KB)
```

### Key decisions

- **Single-page app.** One `selectedTopicId` state drives Home ↔ Topic views,
  animated with Framer Motion `AnimatePresence`. No route navigation.
- **Instant language switching.** A client `LocaleProvider` swaps both UI
  strings and knowledge-base content live, with no reload. Choice is persisted.
- **WebGL topic sphere (Three.js).** A rotating "constellation" of particles
  and nodes on a deep-space backdrop, with the 57 topics as projected,
  clickable, multilingual labels that fade by depth and hide on overlap. Drag to
  rotate. Under `prefers-reduced-motion` it swaps to an accessible grouped
  `SphereFallback` list (real focusable buttons, ARIA labels).
- **Full-page night-sky theme.** A single fixed `PageStarfield` canvas draws
  twinkling stars and drifting nebula glows behind the whole page; content sits
  on translucent "glass" cards over the space gradient.

## Design system

| Token        | Value                                    |
| ------------ | ---------------------------------------- |
| Background   | Deep space `#020308` → `#0d1a3d` gradient |
| Surfaces     | Translucent white glass over the gradient |
| Text         | Off-white `#F4F6FB` / muted `#8B93A7`    |
| Accent       | Gold `#C9A227` (`#D4AF37`, `#B8860B`)    |
| Display font | Manrope                                  |
| Body font    | Inter                                    |

Gold is reserved for Quran verses, the active topic, key headings, icons, and
hover states.

## Localization

The app ships **human-reviewed** translations in English, Russian, and Kazakh
(next-intl for UI strings; the knowledge base carries all three languages). The
standalone `ilim-preview.html` instead offers a Google Translate widget for
Russian and Kazakh — convenient, but machine translation is noticeably less
accurate for Quran, hadith, and scholarly terms, so the reviewed translations in
the app remain the reference.

## Accessibility & performance

Semantic HTML, keyboard navigation, ARIA labels, visible focus states,
reduced-motion support, code-splitting of the sphere and content panel.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short: never hand-edit
`content/ilim.json` — change `scripts/source.md` and let the parser regenerate
it, and never alter the wording of a Quran verse, hadith, grade, or citation.

## License

Code is released under the MIT License — see [LICENSE](./LICENSE).

The **religious content** in `scripts/source.md` / `content/ilim.json` (Quran
translations, hadith, and scholarly quotations) is compiled from third-party
sources and is **not** covered by the MIT License; it is included for
educational use, and its rights remain with the respective translators and
publishers.
