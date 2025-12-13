# Copilot Project Instructions

Practical, codebase-specific guidance so AI agents are productive immediately.

## Architecture & Tech Stack

- Framework: Next.js App Router (TypeScript) under `src/app/*`.
- UI: React-Bootstrap loaded once via `components/Providers.tsx`; global styles in `src/styles/global.scss` and brand helpers in `styles/brand-from-image.scss`.
- State/Context: `components/ThemeProvider.tsx` controls light/dark via `data-bs-theme` and font scaling via CSS var `--font-scale`. Auth via `hooks/useAuth.tsx` (Firebase; client-only admin gating by allowlist).
- Data/Services: Firestore accessed through modules in `src/lib/services/*` (e.g., `phasmoTourney4.ts`). Do not call Firestore directly in React components.
- Tags System: Static manifest in `src/lib/content/tags.ts` merged with Firestore overrides via `/api/tags/*` to produce a tag registry (includes `color`) and effective tags per route.
- Navigation & Search: `components/navigation/MainNavbar.tsx` and `components/navigation/SearchModal.tsx` consume effective tags to render Events/Tools and search results.

## Core Conventions

- Tag-driven pages: Each page defines `path`, `title`, `tags`. Overrides can MERGE or REPLACE via `mode`. Dynamic detail routes like `[id]` are excluded from Events dropdown.
- Tournament grouping: Detect `PhasmoTourney\d+` to label `Tourney N`. Use `Current`/`Past` tags to place in sections; fallback to path regex if missing.
- Placeholder routing: Map `[id]`/`[param]` to safe sample values when linking globally (navbar/search) to prevent broken links.
- Admin gating: Use `useAuth().admin` on client for admin pages; server endpoints must validate Firebase tokens.
- Styling discipline: Prefer Bootstrap utilities and SCSS variables; do not add bespoke navbar/mobile CSS.
- Stats placement: Compute standings/derived metrics in services (e.g., average before slicing top N) to keep pages lean.

## Tag Management (`/admin/tags`)

- Fetch: Use `/api/tags/route?path=...` to pull one route at a time from static manifest (inefficient by design; batching is future work).
- Overrides: Store `tags` and `mode`; deletion removes override. Registry CRUD manages tag metadata (`color`, `description`) used for badge styles.
- Surfacing new pages: Update `taggedManifest` or add an override so pages appear in nav/search without redeploy.

## Feature Additions

- New tournament: Add manifest entries for bracket, standings, recorded runs, stats with tags `PhasmoTourneyX`, role tags (`Bracket`, `Standings`, etc.), `Event`, and `Current`/`Past`.
- New tool page: Tag with `Tool` plus up to two domain tags (e.g., `AI`, `ToDo`) to appear in Tools.
- Dynamic routes: Tag pages but ensure navbar/search filter out detail routes (`rundetails|details`).
- Tag colors: Upsert registry entries with a hex `color` to style badges.

## Data Flows

- Navbar mount: Fetch `/api/tags/effective` → merge static + overrides → classify routes → render dropdowns.
- Search open: Parallel fetch effective + registry → local substring filter → show up to first 3 tags per result.
- Tourney T4 submission: `tourney4ExportRun` writes a run; helpers like `setMatchRunIDs` compute winner/loser and update player stats via `processWinner`/`processLoser`/`processTied`.

## Guardrails

- Do not navigate directly to sample `[id]` links in production; they are UX placeholders. Consider safe 404/redirect if reached.
- Handle tag fetch failures: Navbar sets `loading=false` in `finally`; preserve this to avoid spinner locks.
- Respect font scaling: Multiply any custom sizing by `var(--font-scale,1)`.
- Bootstrap import policy: Keep global Bootstrap import only in `components/Providers.tsx`.

## Build, Run, Test

- Dev: `npm run dev` (Next.js). Build: `npm run build`.
- Tests: Jest under `tests/*` (e.g., `tests/phasmoTourney4.stats.test.ts`). Use `npm test` if present; add scripts before running if missing.
- Avoid `npm run build` or committing changes unless requested.

## Editing Guidelines

- Extend service layer for Firebase mutations and stats; keep components focused on presentation.
- Centralize tag logic in navigation/helpers; avoid scattering across pages.
- Ensure responsive design with Bootstrap breakpoints; verify in light/dark themes and font-scale 0.8–1.6.

## Quick References

- Manifest: `src/lib/content/tags.ts`
- Auth: `src/hooks/useAuth.tsx`
- Theme: `src/components/ThemeProvider.tsx`
- Navbar: `src/components/navigation/MainNavbar.tsx`
- Search: `src/components/navigation/SearchModal.tsx`
- Admin Tags: `src/app/admin/tags/page.tsx`
- Services: `src/lib/services/phasmoTourney4.ts`
- Types: `src/types/*` (e.g., `tags.ts`, `tournament.ts`)

Brand constraints: Keep site names ‘The Lair of Evil’ and ‘Phasmo Tourney’; the user’s Twitch is ‘DukeSenior’. Do not rename without consent.

(End — keep updates concise and specific to actual code.)
