# Copilot Project Instructions

Concise, project-specific knowledge so an AI agent can work productively right away.

## 1. Architecture & Tech Stack

- Framework: Next.js App Router (TypeScript) in `src/app/*`.
- UI: React-Bootstrap; global import inside `Providers.tsx` plus custom SCSS vars in `src/styles/global.scss` (navbar custom styles intentionally removed: rely on Bootstrap defaults).
- State/Context: `ThemeProvider` (theme + font scaling via CSS var `--font-scale`), `AuthProvider` (Firebase auth, admin gating by allowlisted emails / UIDs).
- Firebase: Client config in `src/lib/firebase/client.ts` (not shown here but consumed by services). Firestore used for tournament data & tag overrides.
- Tag System: Static manifest `lib/content/tags.ts` + dynamic overrides via Firestore + API endpoints (in `/api/tags/...`, not yet inspected here but consumed by UI) producing: registry (tag metadata incl. color) and effective tags per route.
- Navigation: `components/navigation/MainNavbar.tsx` builds Events (current/past tournaments) + Tools dropdowns from effective tag data and minimal heuristics; collapses only on route change.
- Search: `components/navigation/SearchModal.tsx` fetches same tag endpoints; client-only fuzzy (substring) filter; dynamic route placeholders replaced (`[id]` -> `example-id`).
- Services: Firestore domain logic per tournament (e.g., `lib/services/phasmoTourney4.ts`) encapsulates reads/writes, derived stats (streak, avg), and batch operations.
- Pages: Primarily tournament views (bracket, standings, recorded runs, stats) + admin tag management (`/admin/tags`) + auth (`/login`) + profile.

## 2. Key Conventions & Patterns

- Tags drive navigation & search. Manifest entries contain: path, title, tags; runtime overrides can MERGE or REPLACE (`mode` in override doc). Exclude detail pages (with `[id]`) from Events dropdown display.
- Tournament grouping: Detect by tag pattern `PhasmoTourney\d+` (mapped to label `Tourney N`). If absent, fallback regex on path. Current vs Past decided by presence of `Current` or `Past` tag.
- Route placeholders: Always map `[id]` (and any `[param]`) to safe sample values before linking in global UI/search.
- Auth: Admin pages/components should check `useAuth().admin`; do not assume server-side session—client gate only at present.
- Accessibility: Font scaling range 0.8–1.6; update only through ThemeProvider functions (respect persistence). Theme toggled via `data-bs-theme` attribute (light/dark) for Bootstrap theming.
- Styling: Prefer Bootstrap utility classes and SCSS variable overrides; avoid reintroducing bespoke navbar/mobile SCSS.
- Firestore field updates: Use granular `setDoc` with `{ merge: true }`, atomic counters (`increment`), and `arrayUnion` for history fields.
- Standings / stats computations intentionally kept inside service functions (e.g., computing average before slicing top N) to keep pages lean.

## 3. Admin Tag Management Workflow (`/admin/tags`)

- Fetches each path listed in static manifest individually (`/api/tags/route?path=...`). Consider batching or adding discovery endpoint if optimizing.
- Override editing: Stores tags + mode; delete removes override. Registry CRUD manages tag metadata (color/description) used for badge styling.
- When adding new pages: Update `taggedManifest` OR create override entry so they surface in nav/search without redeploy.

## 4. Adding Features Safely

- New tournament: Add manifest entries for bracket, standings, recorded runs, stats; include tags: `PhasmoTourneyX`, specific role tags (`Bracket`, `Standings`, etc.), `Event`, and `Current` or `Past`.
- New tool page: Tag with `Tool` (+ domain tags e.g. `AI`, `ToDo`) so it appears under Tools dropdown with up to 2 domain badges.
- Dynamic route pages (`[id]`) should still get manifest tags but UI must guard against listing detail pages inside Events dropdown (follow existing regex filter for `rundetails|details`).
- To color a tag in search or events badges, upsert registry entry with `color` hex.

## 5. Typical Data Flows

- Navbar Mount: Fetch `/api/tags/effective` -> array of routes (title, static+override merged) -> classify into groups -> render dropdown.
- Search Modal Open: Parallel fetch effective + registry; local filter on query; show up to first 3 tags per result.
- Tournament Run Submission (T4 example): `tourney4ExportRun` writes run; then match functions (e.g., `setMatchRunIDs`) read run docs, compute winner/loser, update player stats via helper functions (`processWinner/Loser/Tied`).

## 6. Edge Cases & Guardrails

- Avoid direct navigation to `[id]` placeholder pages in production; placeholder links are for UX only. Consider adding safe 404 or redirect if visited with sample id.
- Tag fetch failures: Navbar sets `loading=false` in finally; ensure additions keep this pattern to prevent spinner lock.
- Admin gating: Currently client-side only; sensitive write endpoints must also validate Firebase token server-side (verify in API route before allowing mutations).
- Font scaling CSS var: Ensure any new global styles multiply by `var(--font-scale,1)` if custom sizing is added.

## 7. Build & Run

- Dev: `npm run dev` (standard Next.js). Build: `npm run build`. No custom scripts presently.
- Bootstrap CSS must remain imported exactly once (in `Providers.tsx`). Do not duplicate or move into individual components.

## 8. When Editing

- Keep navbar minimal; do not add bespoke animations or mobile-only duplicated markup—expand within existing dropdown if needed.
- Prefer extending service layer (`lib/services/*`) for Firestore logic; keep React components focused on presentation + orchestration.
- Consolidate new tag-driven UI logic in navigation or dedicated helper, not scattered in pages.

## 9. Quick Reference

- Tag manifest: `src/lib/content/tags.ts`
- Auth context: `src/hooks/useAuth.tsx`
- Theme & a11y: `src/components/ThemeProvider.tsx`
- Navbar: `src/components/navigation/MainNavbar.tsx`
- Search modal: `src/components/navigation/SearchModal.tsx`
- Admin tags page: `src/app/admin/tags/page.tsx`
- Tourney 4 service example: `src/lib/services/phasmoTourney4.ts`

## 10. Future Improvement Targets (Documented, Not Implemented Yet)

- Batch effective tag fetch, fuzzy search ranking, server-side auth checks for tag APIs, discover routes dynamically instead of static manifest iteration.

---

## 11. Copilot Coding Guidelines

1. **Use React-Bootstrap components primarily.**

   - Extend with custom wrappers only if project-specific UI is required.
   - Stick to Bootstrap’s grid system and responsive utilities.

2. **Practice modularization and componentization aggressively.**

   - Extract reusable UI into `components/ui/`, and feature-level logic into `components/features/`.
   - Keep components single-responsibility. Pages should mostly compose components, not raw markup.

3. **Always verify intent before altering existing code.**

   - Add block-level comments explaining logic when introducing new functionality.
   - Respect existing hooks, services, SCSS, and types before adding new ones.

4. **Ensure all pages are responsive.**

   - Mobile-first design with Bootstrap breakpoints (`sm`, `md`, `lg`, `xl`).
   - Test components in both light/dark themes and font-scale ranges.

5. **Prioritize UI/UX quality.**

   - Avoid a generic Bootstrap look—use SCSS variables and Bootstrap theming for brand identity.
   - Maintain consistency in spacing, typography, and color usage.
   - When designing new components, make sure both light and dark themes are considered.

6. **Accessibility & Contrast.**

   - Ensure all components pass WCAG AA contrast requirements.
   - Provide visible focus rings and keyboard navigation support.
   - Use icons plus color for semantic meaning (alerts, badges, buttons).

7. **Firebase & Data.**

   - Follow established Firebase integration patterns (auth, firestore, storage).
   - All mutations must go through service functions—never inline Firestore calls in components.

8. **Performance.**

   - Use `next/image` for optimized images.
   - Apply dynamic imports for heavy or client-only modules.
   - Keep React components lean; move business logic into services.

9. **Naming**
   - Keep the existing brand names on the website. Do not change without consent.
   - 'The Lair of Evil' is the website brand name. It is also the user's discord server name and hence, the use of the website is for the user and his community.
   - 'Phasmo Tourney' is also a brand name.
   * User's twitch username is 'DukeSenior'
10. Don't run 'npm run build' or commit git changes unless user specifies. 
---

(End of instructions – keep updates concise and specific to actual code.)
