# Copilot Project Instructions

Practical, codebase-specific guidance so AI agents are productive immediately.

## Architecture & Tech Stack

- **Framework**: Next.js 16 App Router (TypeScript) under `src/app/*` with React 19.
- **UI Layer**: Tailwind CSS 3.4 as the sole styling framework. Custom utility classes in `src/styles/global.scss`. No MUI, no React-Bootstrap — those were fully removed. Shared UI primitives in `src/components/ui/` (Card, EmptyState, ErrorBoundary, ToastProvider, KeyboardShortcutsModal, Footer). `@base-ui/react` used for Dialog primitives; `react-icons` (Fi* prefix) for iconography.
- **Design Language**: Whiteboard (light) / Chalkboard (dark) theme using Permanent Marker font and hand-drawn aesthetics (dashed borders, offset shadows, marker accent colors, dot-grid/chalk-dust textures). See "Design System" section below.
- **State/Context**: Provider hierarchy: `ThemeProvider` → `AuthProvider` → `ToastProvider`. Theme provider (`components/ThemeProvider.tsx`) manages light/dark mode via `data-theme` attribute on `<html>` and font scaling via CSS var `--font-scale` (0.8–1.6). Auth via `hooks/useAuth.tsx` (Firebase client SDK; admin gating by email/UID allowlist).
- **Data Layer**: Firestore accessed exclusively through service modules in `src/lib/services/*` (never direct imports in components). Examples: `phasmoTourney4.ts`, `users.ts`, `tags.ts`, `cms.ts`. Services encapsulate CRUD, listeners, and data transformations.
- **Server Auth**: `src/lib/firebase/admin.ts` initializes firebase-admin with Application Default Credentials. `src/lib/server/auth.ts` provides `verifyIdToken()` and `verifyAdminFromRequest()` for API route authorization.
- **Tags System**: Static manifest in `src/lib/content/tags.ts` (array of `TaggedRouteMeta`) merged with Firestore overrides (`contentMeta` collection) via `src/lib/services/tags.ts`. API `/api/tags/effective` returns computed `EffectiveMeta[]` for navigation. Tag registry (`tagRegistry` collection) stores metadata like `color` for badge styling.
- **Navigation & Search**: `components/navigation/AppNavbar.tsx` (Tailwind, custom dropdowns) fetches `/api/tags/effective`, classifies routes via `lib/navigation/classify.ts`, and renders Events/Tools dropdowns. `components/navigation/SearchModal.tsx` performs local substring search on effective tags.

## Design System

### Theme Architecture

CSS custom properties in `:root` / `[data-theme="dark"]` power the entire color system. Tailwind semantic tokens (`text-foreground`, `bg-background`, `bg-card`, `border-border`) resolve to `rgb(var(--color-*-rgb) / <alpha-value>)` so they **auto-switch** with the theme and support Tailwind opacity modifiers (e.g. `text-foreground/80`). No need to pair `dark:` variants for semantic tokens — they adapt automatically.

### Colors

| Token | Light (Whiteboard) | Dark (Chalkboard) |
|---|---|---|
| `--color-bg` | `#f4f1ec` (warm off-white) | `#1a2721` (green-black) |
| `--color-fg` | `#2b2b2b` (warm dark) | `#e4dfd4` (chalky off-white) |
| `--color-card` | `#faf8f5` | `#223029` |
| `--color-border` | `#d6d0c4` | `#3a4f41` |
| Brand primary | `#e89374` (coral) | `#e89374` |
| Brand secondary | `#236fb4` (blue) | `#236fb4` |

### Marker / Chalk Accent Colors

Available via `text-marker-red`, `text-marker-blue`, `text-marker-green`, `text-marker-orange`, `text-marker-purple`, `text-marker-black`. These auto-switch between vivid marker colors (light) and pastel chalk colors (dark).

### Typography

- **Primary font**: Permanent Marker (loaded via `next/font/google`, CSS var `--font-permanent-marker`). Applied site-wide via `body { font-family }`.
- **Font families**: `font-display` (Permanent Marker), `font-sans` (Geist), `font-mono` (Geist Mono).
- Font scaling: `--font-scale` (0.8–1.6) multiplied in `html { font-size }`.

### Board Textures & Effects

- **Background texture**: Faint dot-grid (light) / chalk-dust grain (dark) via `--board-texture` CSS var applied on `body`.
- **Dashed borders**: Borders use `border-dashed` + `border-2` for a hand-drawn feel (navbar, footer, cards, hero sections).
- **Offset shadows**: `shadow-soft` produces a directional 2px 3px shadow like a pinned card.

### Utility Classes

| Class | Effect |
|---|---|
| `chalk-underline` | Squiggly SVG underline (coral → pastel in dark) |
| `marker-highlight` | Marker swoosh background behind text |
| `card-board` | Dashed-border card with hover tilt + shadow |
| `chalk-dust` | Chalk texture overlay (requires `relative` parent) |
| `tilt-sm/md/lg` | Slight rotation (-0.5° to -1.5°) |
| `-tilt-sm/md/lg` | Opposite rotation (0.5° to 1.5°) |
| `border-dashed-marker` | Dashed border with theme border color |

### Card Component

`src/components/ui/Card.tsx` — variants: `default`, `elevated`, `outlined`, `glass`. All use dashed borders and rounded-md.

## Core Conventions

- **Tag-driven pages**: Each route in `taggedManifest` has `path`, `title`, `tags[]`. Overrides can `merge` (default) or `replace` tags. Dynamic detail routes with `[id]`/`[param]` are excluded from Events dropdown but still tagged for search.
- **Tournament grouping**: Extract `PhasmoTourney\d+` tags to label as `Tourney N`. Classify via `Current`/`Past` tags; fallback to path regex (`/tourney4/i`) if missing. Helper: `lib/navigation/classify.ts::tournamentKey()`.
- **Placeholder routing**: Map dynamic segments (`[id]` → `sample`) in navbar/search links using `mapHref()` to prevent 404s in global navigation.
- **Admin gating**: Client-side: `useAuth().admin` checks email/UID allowlist. Server-side: API routes call `verifyIdToken()` or `verifyAdminFromRequest()` from `lib/server/auth.ts` and validate admin status before mutations.
- **Styling discipline**: Use Tailwind utility classes and the semantic token system for all new features. Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional class composition. No MUI, no Bootstrap — those are fully removed.
- **Stats placement**: Compute derived metrics (averages, best streaks, rankings) in services before returning to components. Example: `phasmoTourney4.stats.ts::computeTopAveragePlayers()` calculates `avgScore` before slicing top N.

## Tag Management (`/admin/tags`)

- **Fetch inefficiency by design**: `/api/tags/route?path=...` fetches one route at a time (not batched). To view all, iterate manifest entries client-side. Batching is deferred future work.
- **Override CRUD**: `upsertRouteOverride()` saves `tags[]` + `mode` (`merge`|`replace`) + optional `title`/`description`. Delete via `deleteRouteOverride()`. Changes reflect immediately via `/api/tags/effective`.
- **Registry metadata**: `tagRegistry` collection stores per-tag `color` (hex), `description` for badge styling. Upsert via `upsertTagRegistryEntry()`, list via `listTagRegistry()`.
- **Surfacing new pages**: Add entries to `lib/content/tags.ts::taggedManifest` or create Firestore override. Without either, pages won't appear in navbar/search. No redeployment needed for overrides.

## Feature Additions

- **New tournament**: Add manifest entries for bracket, standings, recorded runs, stats with tags `PhasmoTourneyX`, role tags (`Bracket`, `Standings`, etc.), `Event`, and `Current`/`Past`.
- **New tool page**: Tag with `Tool` plus up to two domain tags (e.g., `AI`, `ToDo`) to appear in Tools.
- **Dynamic routes**: Tag pages but ensure navbar/search filter out detail routes (`rundetails|details`).
- **Tag colors**: Upsert registry entries with a hex `color` to style badges.
- **New UI component**: Place in `src/components/ui/`. Use `cn()` for class merging. Use semantic tokens (`text-foreground`, `bg-card`, `border-border`). They auto-switch themes — no `dark:` prefix needed for these tokens.

## Data Flows

- **Navbar mount**: Fetch `/api/tags/effective` → merge static + overrides → classify routes → render dropdowns.
- **Search open**: Parallel fetch effective + registry → local substring filter → show up to first 3 tags per result.
- **Tourney T4 submission**: `tourney4ExportRun` writes a run; helpers like `setMatchRunIDs` compute winner/loser and update player stats via `processWinner`/`processLoser`/`processTied`.

## Guardrails

- Do not navigate directly to sample `[id]` links in production; they are UX placeholders. Consider safe 404/redirect if reached.
- Handle tag fetch failures: Navbar sets `loading=false` in `finally`; preserve this to avoid spinner locks.
- Respect font scaling: Multiply any custom sizing by `var(--font-scale,1)`.
- No MUI or Bootstrap: These packages are fully uninstalled. Do not re-introduce them.
- Semantic tokens auto-switch: `text-foreground`, `bg-background`, `bg-card`, `border-border`, and `text-foreground-muted` use CSS variables that resolve differently in light/dark mode. You do NOT need `dark:text-foreground-dark` — it exists for back-compat only.

## Build, Run, Test

- Dev: `npm run dev` (Next.js). Build: `npm run build`.
- Tests: Vitest under `tests/*` (e.g., `tests/phasmoTourney4.stats.test.ts`). Run via `npm test`.
- Avoid `npm run build` or committing changes unless requested.

## Editing Guidelines

- Extend service layer for Firebase mutations and stats; keep components focused on presentation.
- Centralize tag logic in navigation/helpers; avoid scattering across pages.
- Ensure responsive design; verify in light/dark themes and font-scale 0.8–1.6.
- Use dashed borders (`border-2 border-dashed`) and rounded-md to match the board aesthetic.
- Use `marker-*` colors and utility classes (`chalk-underline`, `marker-highlight`, `card-board`, tilt classes) to reinforce the handwritten theme where appropriate.

## Quick References

- Manifest: `src/lib/content/tags.ts`
- Auth: `src/hooks/useAuth.tsx`
- Theme: `src/components/ThemeProvider.tsx`
- Navbar: `src/components/navigation/AppNavbar.tsx`
- Search: `src/components/navigation/SearchModal.tsx`
- Admin Tags: `src/app/admin/tags/page.tsx`
- Services: `src/lib/services/phasmoTourney4.ts`
- Types: `src/types/*` (e.g., `tags.ts`, `tournament.ts`)
- Global Styles: `src/styles/global.scss`
- Tailwind Config: `tailwind.config.js`
- Card Component: `src/components/ui/Card.tsx`
- Layout: `src/components/layout/PageLayout.tsx`
- Utility: `src/lib/utils.ts` (`cn()` — clsx + tailwind-merge)

## Dependencies

| Package | Purpose |
|---|---|
| `tailwindcss` 3.4 | Utility-first CSS framework |
| `@tailwindcss/typography` | Prose styling for markdown content |
| `@base-ui/react` | Headless UI primitives (Dialog) |
| `react-icons` | Icon library (Fi* prefix for Feather icons) |
| `framer-motion` | Animation library |
| `clsx` + `tailwind-merge` | Class name composition (`cn()`) |
| `canvas-confetti` | Celebration effects (LevelUpAnimation) |
| `next/font/google` | Permanent Marker, Geist, Geist Mono fonts |

Brand constraints: Keep site names 'The Lair of Evil' and 'Phasmo Tourney'; the user's Twitch is 'DukeSenior'. Do not rename without consent.

(End — keep updates concise and specific to actual code.)
