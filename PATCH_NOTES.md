# Patch Notes

## Version 1.1.0 – CMS, Realtime Interactions, Tournament Redirect Fixes (2025-08-25)

### Highlights

- Introduced a full CMS (create, edit, list posts) with unified new/edit page (`/admin/cms/new`).
- Added rich Markdown editor features: toolbar buttons, keyboard shortcuts, tag suggestions, live preview, image upload + client-side optimization (resize + JPEG quality control), YouTube & Twitch embed markers.
- Implemented comments system with one-level nested replies, real-time updates (listeners for posts & comments), and per-user like/dislike reactions (transaction-based to prevent duplicate reactions).
- Added reaction buttons to posts & comments with optimistic UI updates.
- Added sample fallback posts + seeding utilities and admin UI controls to seed Firestore content safely (skips existing).
- Replaced homepage with dynamic feed (pinned + latest posts using real data or fallback samples).
- Implemented public posts index and slug page with real-time updates and disabled interactions for sample (unseeded) content.
- Added recent comments admin feed for quick moderation (`/admin/cms/comments`).
- Navigation/search driven by updated tag endpoints; consistent tournament grouping logic retained.

### Tournament & Legacy Route Updates

- Unified Tourney 3 & 4 run detail routes; added legacy dynamic redirect handlers for old paths (`tourney3rundetails/[id]`, `tourney4rundetails/[id]`, `phasmoTourney3Group/t3/run/[id]`) to new unified paths using redirect.
- Fixed production build failures caused by PageProps type inference on dynamic redirect routes (params now treated as Promise to satisfy Next 15 typing quirks).

### Performance & UX

- Client-side image optimization before upload (max width 1600px, JPEG quality ~0.82) reducing bandwidth/storage.
- Uses `next/image` for post banner images to improve LCP and automatic optimization.
- Accessible font scaling + theme toggling preserved; toolbar actions insert markdown at caret.
- Embed transformation converts HTML comment markers into responsive iframes (YouTube/Twitch) with lazy loading.

### Firestore & Data Layer

- Service layer expanded (`cms` services) to encapsulate: CRUD, listeners (`listenPost`, `listenComments`), reactions (post & comment), seeding utilities, slug-based queries, and user reaction lookups.
- Reactions stored with per-user documents enabling idempotent writes and easy aggregation.
- Comment tree built on the client (root + one level of replies) from flat listener list for simplicity.

### Navigation & Tags

- Navbar consumes `/api/tags/effective` & registry for dynamic grouping; cleans up unused tag color helper.
- Legacy bracket/static routes excluded from Events dropdown per existing heuristics.

### Code Quality & Cleanup

- Removed unused imports across multiple files (admin comments page, tag effective route, firebase admin, genshin & tourney4 services, navbar, post view).
- Converted banner `<img>` to `<Image>` component.
- Adjusted dynamic redirect components to satisfy build (async + Promise params pattern) and removed earlier inconsistencies.
- Minimized unused lint warnings; remaining warnings are intentional (see below).

### Known Remaining Warnings (Non-blocking)

- Some `useEffect` exhaustive-deps warnings (profile, todo, bracket info) where adding deps could cause unwanted extra loads.
- Unused state variable `loading` in `/admin/cms/new` reserved for future spinner or skeleton.
- Regex capture group variables (`_vid`, `offset`, `str`) flagged as unused in post slug page transformation – can be refactored if desired.
- `registry` state still used for potential future tag color rendering (currently only stored).

### Future Ideas

- Refine dynamic route redirects to avoid Promise param workaround if Next.js updates typings.
- Add server-side auth checks for write APIs (currently client-gated only).
- Batch tag manifest fetching (single API) & introduce fuzzy ranking for search.
- Expand comment threading depth or implement pagination for large threads.
- Add image gallery / drag-drop ordering for post uploads.

### Upgrade Notes

- Ensure Firebase environment credentials available for production; admin token verification added defensively but still optional.
- Sass still emits deprecation warnings (`@import`) – migration to `@use` pending.

---

Generated automatically based on recent commits and build changes on 2025-08-25.

## Version 1.1.1 – Route cleanup, image & lint fixes, Discord patch publishing (2025-08-25)

### Changes & Improvements

- Consolidated Phasmo tournament routes under `src/app/phasmotourney-series/*` and removed duplicate legacy stubs after verification.
- Restored and stabilized Phasmo Tourney 2 bracket page with explicit winners displayed (matches now render bold winners as in the original site).
- Converted post images and markdown-rendered images to `next/image` for better LCP and automatic optimization (keeps click-to-open lightbox behavior).
- Fixed runtime "Element type is invalid" errors by replacing fragile react-bootstrap subcomponent usage and switching a few components to plain Bootstrap markup.
- Added a simple CLI (`scripts/postPatchNotes.js`) and an API route (`/api/patch-notes`) to append patch notes to `PATCH_NOTES.md` and optionally post them to a Discord webhook.

### Code Quality & Build

- Addressed several top ESLint/TypeScript warnings (removed unused imports, surfaced previously-unused state, converted images) and reduced runtime errors; a few non-blocking warnings remain (useEffect deps, Sass @import deprecation).

---

## Version 1.1.2 – Mentions & Notifications Inbox, comment anchors (2025-08-25)

### Highlights 1.1.2

- Implemented client-side @-mention autocomplete inside post and comment composers with scoped suggestion dropdowns and keyboard navigation (works for main composer and nested replies).
- Server-side mention notifications: secure API endpoint verifies ID tokens and writes per-user notification documents. Notifications now persist a friendly `postSlug` (when available) so links point to human-readable post URLs.
- Added a Notifications inbox page (`/notifications`) that lists a user's notifications with quick mark-as-read actions and links to the related post and comment anchor.
- Added comment DOM anchors (`id="comment-<id>"`) and a robust scroll-to-hash effect (retry interval + hashchange listener) so SPA navigation reliably scrolls to the target comment after async loading.
- Navbar notification dropdown updated to prefer slug-based links and includes a "View all notifications" link to the inbox.

## Version 1.1.3 – Navbar & Mobile UX: Offcanvas mobile menu, Accordion nav (2025-08-26)

### Mobile & Navbar Highlights

- Reworked the main navigation mobile experience to use a right-side Offcanvas menu opened via the hamburger toggle. The Offcanvas mirrors desktop sections (Admin, Community, Events, Tools) but uses Accordion items for reliable mobile interaction.
- Desktop navigation remains centered with dropdown mega-panels; Offcanvas no longer renders inline on large screens to avoid duplication.
- Accessibility controls, search button, and profile/login actions are available inside the Offcanvas and close the menu after selection.
- Fixed mobile-specific dropdown issues (Admin/Community/Events/Tools) by replacing nested dropdowns with Accordion items for predictable touch behavior.
- Minor TypeScript + lint cleanups related to unused refs/state during the refactor.

Build: production build completed successfully (warnings present; none blocking).

### Notes & Follow-ups

- Legacy notifications created before `postSlug` was recorded will need a backfill to provide slug-based links — a safe server-side backfill script is recommended (not executed automatically).
- UX polish ideas: mark-as-read-on-click (atomic), inbox pagination/grouping, avatars & timestamps formatting improvements.

## Version 1.1.4 – UI polish, admin CMS refactor & link standardization (2025-08-29)

### Highlights 1.1.4

- Reworked internal link handling across the UI: introduced a shared `InlineLink` usage pattern and replaced several raw `Link` elements that used bootstrap `btn` classes with `React-Bootstrap` `Button` using `InlineLink` as the `as` prop for consistent behavior and better accessibility.
- Admin CMS list UI refactor: the posts table was replaced with a card-based listing and an actions `DropdownButton` for Edit / Pin / Delete flows to improve mobile layout and match the rest of the site's card-driven listing styles.
- Navbar improvements: replaced several `next/link` usages in the Navbar with the shared `InlineLink`, and the Profile menu now resolves a public `/profile/[username]` route (falls back to `/profile`) by reading the current user's public username when available.
- Post list and home feed tweaks: `PostsFeed` and posts index updated to use `Button as={InlineLink}` for the Read actions; featured/list layout spacing and Read button behavior improved.
- Removed several legacy/empty route stubs and small unused pages to reduce surface area (legacy tourney redirect stubs removed).
- Developer tooling: minor changes to `page` bootstrapping and the `style-check` page received content and component additions for more comprehensive UI testing (components like Breadcrumb, Modal, Toast, Tabs were added in the style-check playground).

### Developer notes & migration

- The shared `InlineLink` is a client component and is used with a narrow `as={InlineLink as any}` cast in places to avoid brittle typing with React-Bootstrap's `as` prop; we can remove the `as any` cast later by tightening types or adding a small type shim.
- Admin API/behavior unchanged — the CMS list refactor is purely presentational and keeps the same CRUD calls under `src/lib/services/cms`.
- A few ESLint/TS warnings remain after the refactor (unused imports, missing hook deps). They are non-blocking but recommended for a follow-up cleanup pass.

---
