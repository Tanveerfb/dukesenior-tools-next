# Dynamic Users — Implementation Plan

Goal: introduce a full user system (unique usernames + display names, profile revamp, @mentions, friends, DMs, group threads) iteratively and safely.

Principles

- Incremental: deliver small, testable pieces (profile page → username reservation → mentions → friends → messages).
- Secure: validate & enforce actions server-side (Firestore transactions / API routes) and require Firebase ID token for writes.
- Backwards-compatible: existing posts/comments remain functional; we migrate/shim where needed.

Phases & Milestones

Phase 1 — Profile + usernames (MVP) — Completed

- Data model: `users/{uid}`, `usernames/{username}` (simple mapping for uniqueness)
- Services: `src/lib/services/users.ts` (get/update, setUsername with transaction)
- UI: `src/app/profile/[username]/page.tsx`, `src/components/profile/ProfileHeader.tsx`, `src/components/profile/AboutEditor.tsx`
- Tasks (first sprint):
  - Create `users` service with `getUserByUID`, `getUserByUsername`, `setUsername(uid, username)` using a transaction that writes `usernames/{username}` and updates `users/{uid}`. — Done (see `src/lib/services/users.ts`) — Aug 25, 2025
  - Add profile page route + header component with edit button for owner. — Done (`src/app/profile/[username]/page.tsx`, `src/components/profile/ProfileHeader.tsx`) — Aug 25, 2025
  - Add a small unit test for username reservation logic (optional but recommended). — Deferred / not yet added

Phase 2 — Mentions & Notifications (in progress / implemented)

- Client: `@username` autocomplete implemented for post/comment composers (main + nested replies) with suggestion scoping and keyboard navigation.
- Server: Secure mention notification API implemented; notifications are written to per-user `notifications_{uid}` collections and include `postSlug` when available.
- UI: Navbar bell shows recent notifications and unread count; `/notifications` inbox page lists all notifications with mark-as-read actions.

Next steps for Phase 2:

- Backfill: run a safe server-side backfill to populate `postSlug` on legacy notifications so older mentions link to slug-based URLs.
- UX: mark-as-read-on-click, inbox pagination, and improved timestamp formatting; consider adding avatars to notifications.

Phase 3 — Friend system

- Add `friendRequests` collection or `friends/{ownerUid}/list` subcollection.
- Services: send/accept/reject/remove; create notifications for requests.
- UI: friend button on profile, requests inbox, friends list.

Phase 4 — Direct Messages & Groups

- Conversations collection with `members[]` and `messages` subcollection.
- Real-time listeners for active conversations.
- UI: conversations list + message composer; create 1:1 DM on first message or on friend accept (configurable).

Phase 5 — Community Threads & Moderation

- `threads` collection for public community discussions, moderation tools, reports, and subscription model.

Security & Rules (high-level)

- Only allow users to edit their own `users/{uid}` doc.
- `setUsername` must be performed in a Firestore transaction (or server API) that ensures `usernames/{username}` does not already exist.
- Messages and friend writes must validate `auth.uid` matches the actor.

First-step concrete deliverables (I will implement these next if you say "Start")

1. `src/lib/services/users.ts` — service functions + inline transaction example for username reservation.
2. `src/app/profile/[username]/page.tsx` — dynamic profile route, server-side fetch of user by username (or client-side fallback), skeleton layout.
3. `src/components/profile/ProfileHeader.tsx` — header with avatar, displayName, @username, edit/send-friend/message actions (owner-aware).
4. Update `src/hooks/useAuth.tsx` or provide a helper `useUser()` to fetch profile doc easily.

Questions / decisions needed

- Username rules: allowed chars (letters, numbers, underscore?), min/max length, case-insensitive uniqueness? (recommend: alphanum + underscore, 3–32 chars, case-insensitive)
- DM policy: allow DMs from anyone or only friends? (recommend: configurable default = friends-only)
- Mentions behavior: create notifications for mentions by default; allow users to opt out in settings.

Notes

- I'll implement Phase 1 as a minimal, non-breaking change: service + profile route + header. Server-side reservation logic will be written as a transaction in the service (callable from API routes or direct client with caution). Production rollout should use a server-side API for username reservation to avoid accidental race conditions.

Next step

- Confirm the username rules and DM policy choice, or tell me to pick sensible defaults. Then say “Start with profile” and I will create the service and UI scaffold (files listed above) and run quick local checks.
