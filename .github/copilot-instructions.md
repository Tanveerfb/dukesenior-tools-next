# Copilot Project Instructions

Practical, codebase-specific guidance so AI agents are productive immediately.

## Architecture & Tech Stack

- **Framework**: Next.js 16 App Router (TypeScript) under `src/app/*` with React 19.
- **UI Layer**: React-Bootstrap 2.10 loaded globally via `components/Providers.tsx`; SCSS variables defined in `src/styles/global.scss` (custom `$primary`, `$secondary`, theme colors). **Never** import Bootstrap CSS elsewhere.
- **State/Context**: Provider hierarchy: `ThemeProvider` → `AuthProvider` → `ToastProvider`. Theme provider (`components/ui/ThemeProvider.tsx`) manages light/dark mode via `data-bs-theme` attribute and font scaling via CSS var `--font-scale` (0.8–1.6). Auth via `hooks/useAuth.tsx` (Firebase client SDK; admin gating by email/UID allowlist).
- **Data Layer**: Firestore accessed exclusively through service modules in `src/lib/services/*` (never direct imports in components). Examples: `phasmoTourney4.ts`, `users.ts`, `tags.ts`, `cms.ts`. Services encapsulate CRUD, listeners, and data transformations.
- **Server Auth**: `src/lib/firebase/admin.ts` initializes firebase-admin with Application Default Credentials. `src/lib/server/auth.ts` provides `verifyIdToken()` and `verifyAdminFromRequest()` for API route authorization.
- **Tags System**: Static manifest in `src/lib/content/tags.ts` (array of `TaggedRouteMeta`) merged with Firestore overrides (`contentMeta` collection) via `src/lib/services/tags.ts`. API `/api/tags/effective` returns computed `EffectiveMeta[]` for navigation. Tag registry (`tagRegistry` collection) stores metadata like `color` for badge styling.
- **Navigation & Search**: `components/navigation/MainNavbar.tsx` fetches `/api/tags/effective`, classifies routes via `lib/navigation/classify.ts`, and renders Events/Tools dropdowns. `components/navigation/SearchModal.tsx` performs local substring search on effective tags.

## Core Conventions

- **Tag-driven pages**: Each route in `taggedManifest` has `path`, `title`, `tags[]`. Overrides can `merge` (default) or `replace` tags. Dynamic detail routes with `[id]`/`[param]` are excluded from Events dropdown but still tagged for search.
- **Tournament grouping**: Extract `PhasmoTourney\d+` tags to label as `Tourney N`. Classify via `Current`/`Past` tags; fallback to path regex (`/tourney4/i`) if missing. Helper: `lib/navigation/classify.ts::tournamentKey()`.
- **Placeholder routing**: Map dynamic segments (`[id]` → `sample`) in navbar/search links using `mapHref()` to prevent 404s in global navigation.
- **Admin gating**: Client-side: `useAuth().admin` checks email/UID allowlist. Server-side: API routes call `verifyIdToken()` or `verifyAdminFromRequest()` from `lib/server/auth.ts` and validate admin status before mutations.
- **Styling discipline**: Prefer Bootstrap utilities (`text-primary`, `mt-3`) and SCSS variables. Font-relative sizing: multiply by `var(--font-scale, 1)` for accessibility. Never add custom navbar/mobile CSS outside global styles.
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

## Data Flows

- **Navbar mount**: Fetch `/api/tags/effective` → merge static + overrides → classify routes → render dropdowns.
- **Search open**: Parallel fetch effective + registry → local substring filter → show up to first 3 tags per result.
- **Tourney T4 submission**: `tourney4ExportRun` writes a run; helpers like `setMatchRunIDs` compute winner/loser and update player stats via `processWinner`/`processLoser`/`processTied`.

## Guardrails

- Do not navigate directly to sample `[id]` links in production; they are UX placeholders. Consider safe 404/redirect if reached.
- Handle tag fetch failures: Navbar sets `loading=false` in `finally`; preserve this to avoid spinner locks.
- Respect font scaling: Multiply any custom sizing by `var(--font-scale,1)`.
- Bootstrap import policy: Keep global Bootstrap import only in `components/Providers.tsx`.

## Build, Run, Test

- Dev: `npm run dev` (Next.js). Build: `npm run build`.
- Tests: Vitest under `tests/*` (e.g., `tests/phasmoTourney4.stats.test.ts`). Run via `npm test`.
- Avoid `npm run build` or committing changes unless requested.

## Editing Guidelines

- Extend service layer for Firebase mutations and stats; keep components focused on presentation.
- Centralize tag logic in navigation/helpers; avoid scattering across pages.
- Ensure responsive design with Bootstrap breakpoints; verify in light/dark themes and font-scale 0.8–1.6.

## Quick References

- Manifest: `src/lib/content/tags.ts`
- Auth: `src/hooks/useAuth.tsx`
- Theme: `src/components/ui/ThemeProvider.tsx`
- Navbar: `src/components/navigation/MainNavbar.tsx`
- Search: `src/components/navigation/SearchModal.tsx`
- Admin Tags: `src/app/admin/tags/page.tsx`
- Services: `src/lib/services/phasmoTourney4.ts`
- Types: `src/types/*` (e.g., `tags.ts`, `tournament.ts`)

Brand constraints: Keep site names ‘The Lair of Evil’ and ‘Phasmo Tourney’; the user’s Twitch is ‘DukeSenior’. Do not rename without consent.

(End — keep updates concise and specific to actual code.)
