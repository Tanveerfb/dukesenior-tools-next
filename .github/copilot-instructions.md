# Copilot Project Instructions

Concise, codebase-specific guidance so AI agents are productive immediately.

## 1) Architecture & Tech Stack

- Framework: Next.js App Router (TypeScript) under `src/app/*`.
- UI: React-Bootstrap imported once in `components/Providers.tsx`; project SCSS in `src/styles/global.scss` and brand helpers in `styles/brand-from-image.scss`.
- Context: `components/ThemeProvider.tsx` (light/dark via `data-bs-theme`, font scaling via CSS var `--font-scale`) and `hooks/useAuth.tsx` (Firebase auth; client-only admin gating by allowlist).
- Data: Firebase Firestore via service modules under `src/lib/services/*` (e.g., `phasmoTourney4.ts`); avoid direct Firestore calls inside components.
- Tags: Static manifest `src/lib/content/tags.ts` + Firestore overrides via `/api/tags/*` produce a registry (metadata like color) and effective tags per route.
- Navigation & Search: `components/navigation/MainNavbar.tsx` and `components/navigation/SearchModal.tsx` consume effective tags to build Events/Tools and search results.

## 2) Core Conventions & Patterns

- Tag-driven UI: Pages define `path`, `title`, `tags`. Overrides can MERGE or REPLACE (`mode` field). Detail pages (`[id]`) are excluded from Events dropdown.
- Tournament grouping: Detect `PhasmoTourney\d+` → label `Tourney N`. Current vs Past based on `Current`/`Past` tags. Fallback regex on path if tag missing.
- Route placeholders: Map `[id]`/`[param]` to safe sample values when linking globally (navbar/search) to avoid broken navigation.
- Admin gating: Use `useAuth().admin` on client for admin pages; server-side endpoints must validate Firebase token.
- Styling: Prefer Bootstrap utilities and SCSS variables; do not reintroduce bespoke navbar/mobile CSS.
- Stats logic: Keep standings/derived metrics in services (e.g., average before slicing top N) to keep pages lean.

## 3) Tag Management (`/admin/tags`)

- Fetch one route at a time from the static manifest via `/api/tags/route?path=...` (known inefficiency; batching is a future improvement).
- Overrides: Store `tags` + `mode`; delete removes override. Registry CRUD manages tag metadata (`color`, `description`) used for badge styling.
- New pages: Update `taggedManifest` or add an override so they surface in nav/search without redeploy.

## 4) Adding Features Safely

- New tournament: Add manifest entries for bracket, standings, recorded runs, stats with tags `PhasmoTourneyX`, role tags (`Bracket`, `Standings`, etc.), `Event`, and `Current`/`Past`.
- New tool page: Tag with `Tool` plus up to two domain tags (e.g., `AI`, `ToDo`) so it appears in Tools.
- Dynamic routes: Tag pages but ensure navbar/search filters out detail routes (`rundetails|details`).
- Tag colors: Upsert registry entries with a `color` hex to style badges.

## 5) Typical Data Flows

- Navbar mount: Fetch `/api/tags/effective` → merge static + overrides → classify routes → render dropdown.
- Search modal open: Parallel fetch effective + registry → local substring filter → show up to first 3 tags per result.
- Tourney T4 submission: `tourney4ExportRun` writes a run; match helpers (e.g., `setMatchRunIDs`) compute winner/loser and update player stats via `processWinner/Loser/Tied`.

## 6) Guardrails & Edge Cases

- Do not navigate directly to sample `[id]` links in production; they are UX placeholders. Consider safe 404/redirect if visited.
- Handle tag fetch failures: Navbar sets `loading=false` in `finally`; maintain this to avoid spinner lock.
- Respect font scaling: Multiply any custom sizing by `var(--font-scale,1)`.
- Bootstrap import: Keep global Bootstrap CSS import only in `components/Providers.tsx`.

## 7) Build, Run, Test

- Dev: `npm run dev` (standard Next.js). Build: `npm run build`.
- Tests: Jest tests live in `tests/*` (e.g., `tests/phasmoTourney4.stats.test.ts`). Run with `npm test` if script present; otherwise add one before running.
- Do not run `npm run build` or commit changes unless requested by the user.

## 8) Editing Guidelines

- Extend service layer for Firebase mutations and stats; keep components focused on presentation/orchestration.
- Consolidate tag-driven logic in navigation or helpers; avoid scattering across pages.
- Ensure responsive design with Bootstrap breakpoints and test in light/dark themes and font-scale range 0.8–1.6.

## 9) Quick References

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
