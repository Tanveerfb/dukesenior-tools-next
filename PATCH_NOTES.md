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
