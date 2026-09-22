# Dr. Abhijit Bora — Academic Website (Frontend)

A React + TypeScript single-page application for the personal academic website of Dr. Abhijit Bora, Professor, Department of Mass Communication & Journalism, Tezpur University. It presents his profile, biography, career timeline, and publication record, and consumes the companion [FastAPI backend](#backend-integration) for live publication data, watermarked PDF downloads, and site statistics.

The site is built as a restrained, editorial-style, animation-forward experience — staged text reveals, scroll-triggered entrances, a custom page-transition system, and a sliding-underline filter bar — implemented with hand-rolled hooks rather than an animation library.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Component Library](#component-library)
- [Custom Hooks](#custom-hooks)
- [Backend Integration](#backend-integration)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Build & Preview](#build--preview)
- [Linting](#linting)
- [Known Constraints & Design Notes](#known-constraints--design-notes)

---

## Tech Stack

| Concern | Library / Tool |
|---|---|
| UI framework | React 19 |
| Language | TypeScript ~6.0 |
| Build tool / dev server | Vite 8 (`@vitejs/plugin-react`) |
| Routing | React Router DOM 7 |
| Styling | Plain CSS, one stylesheet per component/page (no CSS-in-JS, no utility framework) |
| Animation | No animation library — custom hooks driving CSS custom properties / data attributes |
| Linting | ESLint 10 with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |

No state-management library, CSS framework, or animation library is used; all interactivity is built from React's own primitives plus small, purpose-built hooks.

## Project Structure

```
.
├── index.html                   # Vite entry HTML
├── vite.config.ts               # Vite + React plugin config
├── tsconfig.json / .app.json / .node.json
├── eslint.config.js             # Flat ESLint config
├── package.json
├── src/
│   ├── main.tsx                 # ReactDOM root, wraps <App /> in a Router
│   ├── App.tsx                  # Route table, Navbar/Footer shell, page-transition wiring
│   ├── App.css / index.css      # Global styles, design tokens
│   ├── assets/                  # Local images (portrait, book covers, favicons)
│   ├── lib/
│   │   ├── api.ts               # API_BASE_URL resolution
│   │   └── papers.ts            # Paper type, usePapers() data hook, paper-matching/sorting helpers
│   ├── hooks/                   # Reusable animation/behaviour hooks (see below)
│   ├── components/              # Presentational + structural building blocks (see below)
│   └── pages/
│       ├── Home.tsx / Home.css
│       ├── About.tsx / About.css
│       ├── Research.tsx / Research.css
│       ├── Contact.tsx / Contact.css
│       └── Block_Actions.tsx    # useBlockActions() — disables right-click/devtools shortcuts site-wide
```

## Pages

### `Home`
Landing page. A staged hero (institution → name → role → bio → tags), a featured-publication card plus a sidebar of recent conference papers, and a "Recent Research Papers" list. Each of these sections is **wired to live data** from `usePapers()`: the featured book, sidebar items, and recent list are matched against the API's publication records by title (via `findPaper`) or filtered by recency (via `latestPapers`), so a genuine PDF link and abstract are used whenever the API has them. If the API is unreachable, each section falls back to hardcoded placeholder content (`heroCard`, `sidebarCards`, `recentPapers`) written directly in the file, so the page never renders empty.

### `About`
Static content: bio, teaching philosophy, research focus, an education/experience career timeline (rendered by the shared `Timeline` component), achievements, PhD supervision counts (with one visual mark per scholar), publication-count stats, international fellowships/exposure, authored books, and a grid of linked video lectures (E-Resources). All content here is hardcoded in the file — this page does not call the backend.

### `Research`
The full publication index, backed live by `GET /papers/` from the backend. Features:
- A filter bar (`All`, scope filters, category filters) with a sliding underline indicator (`useSlidingIndicator`) and per-filter counts.
- Publications grouped by year (newest first; non-numeric/undated years sorted last) via `groupByYear`.
- A smooth height transition between filter states (`useSmoothHeight`) so the list doesn't jump-cut when the filtered set changes size.
- Loading, error (with retry), and empty states.
- Each entry rendered by `PublicationItem`, including a PDF-open action for publications that have one.
- A static "Ongoing Research" placeholder section at the bottom for work-in-progress items (not backend-driven).

### `Contact`
A contact form (name/email/subject/message) plus office details and an embedded Google Map of the department. **The form is not wired to the backend's `POST /contact/` endpoint** — submission is currently a no-op (`e.preventDefault()` only, so the page just doesn't reload). Static contact details (phone, email, office hours, address) are hardcoded.

### `Block_Actions` (not a page)
A hook, `useBlockActions()`, invoked once from `App.tsx`. It suppresses the context menu and blocks `Ctrl+C` / `Ctrl+S` / `Ctrl+U` / `F12`, as a deterrent against casual right-click-save or view-source use — this is a UX deterrent only and provides no real content protection (the source and page content remain fully accessible through the browser's normal DOM/network inspection either way).

## Component Library

All components live in `src/components/`, each paired with its own CSS file.

| Component | Purpose |
|---|---|
| `Navbar` | Sticky masthead that compresses on scroll |
| `Footer` | Site footer |
| `PageHeader` | Shared title + description header used at the top of Research/Contact |
| `SectionHeader` | Section title, optional description and trailing action link (e.g. "All publications →") |
| `Card` | Generic bordered/interactive content container |
| `Button` | Shared button styles (`ghost` and default variants) |
| `Tag` | Small pill label (e.g. research-interest tags) |
| `Signal` | Small animated glyph used as a decorative/loading indicator (`tune`, `loading` animation variants) |
| `Portrait` | Framed profile photo with optional caption |
| `PageTransition` | Owns `<main>`; lets the outgoing route play a 150ms exit before mounting the next one, then scrolls to top and stages the new page's entrance |
| `Reveal` | Scroll-reveal primitive — marks a block (or staggers its children) as in-view via `useReveal`, with all animation left to CSS |
| `MaskText` | Line-masked text reveal used for headings/large numbers |
| `Timeline` | Renders a chronological list (used for Education and Experience on About) with a progress-driven rail (`useTimelineProgress`) |
| `PublicationItem` | The publication row/card used on both Home (`compact` variant) and Research (full variant with kinds, byline, identifiers, co-author, abstract, PDF action) |
| `VideoTile` | Linked video-lecture thumbnail/tile for the E-Resources section |

## Custom Hooks

All in `src/hooks/`, each scoped to one concern and written to avoid unnecessary re-renders (most write directly to CSS custom properties or `data-*` attributes rather than React state):

| Hook | Purpose |
|---|---|
| `useReveal` | Marks an element `data-inview="true"` on first intersection via `IntersectionObserver`; no re-render triggered |
| `usePhasedValue` | Lets an outgoing value play an exit animation (`exitMs`) before being swapped for a new one; drives both route transitions and Research's filter transitions |
| `useSmoothHeight` | Animates a container's height between two content states instead of a hard snap |
| `useSlidingIndicator` | Positions a sliding underline beneath whichever element has `data-active="true"`, via CSS custom properties |
| `useTimelineProgress` | Drives the About-page timeline: fills the rail and reveals entries as a reading line crosses them, using only CSS/data-attribute writes |
| `useParallax` | A restrained scroll-parallax effect (±`maxPx`), gated to desktop widths and `prefers-reduced-motion: no-preference` |
| `useFontsReady` | Sets `<html data-fonts="ready">` once web fonts have loaded (or a timeout elapses), so staged entrances never animate against fallback-font metrics |
| `useReducedMotion` | Live-reactive read of the user's `prefers-reduced-motion` setting via `useSyncExternalStore` |

## Backend Integration

The frontend is a pure client for the companion FastAPI backend (see that project's own README for full API details). Integration lives entirely in `src/lib/`:

- **`api.ts`** — resolves `API_BASE_URL` from `VITE_API_BASE_URL`, falling back to `http://localhost:8000` for local development against the backend's dev server.
- **`papers.ts`** — the `Paper` type (mirroring the backend's `PaperResponse` schema), plus:
  - `usePapers()` — fetches `GET /papers/` once on mount; failures are swallowed so pages degrade to their static placeholder content rather than breaking.
  - `paperPdfUrl(id)` / `openPaperPdf(id)` — build/open the watermarked-PDF endpoint (`GET /papers/{id}/pdf`).
  - `findPaper(papers, title, paperId?)` — matches a hardcoded piece of on-page content (e.g. the Home hero book) to its live database record, by exact `id`, exact normalized title, or fuzzy word-overlap scoring — so minor punctuation differences (`"Radio - A True…"` vs `"Radio – A True…"`) still resolve.
  - `recency(year)` / `latestPapers(...)` — parse the backend's free-text `year` field (e.g. `"January–June, 2023"`) into a sortable value, and select the *n* most recent papers matching a predicate.
  - `isConferencePaper`, `isJournalPaper`, `hasReadableFiles` — classification/display helpers.

No other backend endpoints (`/auth`, `/contact`, `/stats`) are currently called from the frontend — the Contact form and the About-page statistics are static/unwired at this stage.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Base URL of the backend API. Set for production builds, e.g. `VITE_API_BASE_URL=https://api.abhijitbora.com`. |

Create a `.env` file in the project root for local overrides:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. (Optional) point at a non-default backend
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 3. Start the dev server
npm run dev
```

The app will be available at the URL Vite prints (default `http://localhost:5173`). Run the companion backend locally (default `http://localhost:8000`) for live publication data — see that project's README for setup; without it, pages fall back to their static placeholder content.

## Build & Preview

```bash
npm run build      # tsc -b && vite build — type-checks, then produces a production build in dist/
npm run preview    # serves the production build locally for a final check
```

## Linting

```bash
npm run lint
```

Uses ESLint's flat-config format with `@eslint/js` recommended rules, `typescript-eslint` recommended rules, React Hooks' recommended rule set, and `eslint-plugin-react-refresh`'s Vite-oriented rules. `dist/` is excluded from linting.

## Known Constraints & Design Notes

- **Contact form is not connected to the backend.** Submission currently just prevents the default page reload; wiring it to `POST /contact/` is outstanding.
- **About-page statistics and career/achievement content are hardcoded**, not sourced from the backend's `GET /stats/` endpoint, so they must be updated manually in `About.tsx` if the underlying numbers change.
- **Right-click and common devtools shortcuts are suppressed** (`Block_Actions.tsx`) as a soft deterrent; this is not, and cannot be, real content protection.
- **No test suite** is currently included.
- **Static fallback content is duplicated with the database.** The Home page's hardcoded `heroCard`, `sidebarCards`, and `recentPapers` are meant to mirror what's actually in the backend and are only shown when the API call fails — if the underlying publication data changes, these fallbacks should be updated to match, or they will show stale content during an outage.
- **Routing uses capitalized paths** (`/Home`, `/About`, `/Research`, `/Contact`); the root path `/` redirects to `/Home`.
