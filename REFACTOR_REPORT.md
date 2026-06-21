# Refactor Report — dukesenior-tools-next

Generated: 2026-06-21 (autonomous session)

---

## What Was Done

### 1. Environment Variables — Hardcoded Values Removed

**`src/lib/firebase/client.ts`**
All hardcoded Firebase config values replaced with `NEXT_PUBLIC_FIREBASE_*` env vars. Previously the API key, projectId, etc. were committed in plain text.

**`src/lib/server/auth.ts`**
Admin email/UID sets now parsed from `ADMIN_EMAILS` and `ADMIN_UIDS` env vars (comma-separated). Previously hardcoded to specific addresses.

**`src/hooks/useAuth.tsx`**
Same pattern for `NEXT_PUBLIC_ADMIN_EMAILS` / `NEXT_PUBLIC_ADMIN_UIDS`.

**Action required:** Update `.env.local` to include both admin emails:
```
ADMIN_EMAILS="dukesenior22@proton.me,flareon@abv.bg"
NEXT_PUBLIC_ADMIN_EMAILS="dukesenior22@proton.me,flareon@abv.bg"
```
(same for ADMIN_UIDS if used)

---

### 2. CMS Service — Modularised (985 → 5 files)

`src/lib/services/cms/index.ts` was 985 lines. Split into:

| File | Responsibility |
|------|----------------|
| `constants.ts` | Collection name constants |
| `posts.ts` | Post CRUD, scheduling, views, analytics, seeding |
| `comments.ts` | Comments + reactions |
| `reactions.ts` | Post reaction logic (imports `getPost` from posts) |
| `approval.ts` | Approval workflow (imports `slugify` from posts) |
| `index.ts` | Re-exports from all modules |

No circular imports. No breaking changes to callers — all exports are identical.

---

### 3. API Utility — `src/lib/utils/api.ts` (new)

```ts
export function apiError(message: string, status = 500)
export function apiOk<T>(data: T, status = 200)
```

Applied to **12 API routes**:

- `api/cms/posts`
- `api/cms/analytics`
- `api/cron/publish-scheduled`
- `api/gamification/leaderboard`
- `api/gamification/stats/[uid]`
- `api/admin/gamification/award-xp`
- `api/admin/gamification/award-achievement`
- `api/admin/suggestions`
- `api/admin/suggestions/export`
- `api/users/search`
- `api/users/username` (error responses only; success kept as `{ ok: true }`)
- `api/suggestions/submit` (error responses only; success kept as `{ ok: true, id }`)
- `api/ai/query`

`NextResponse` import removed from routes where it was only used for `.json()`.

**Skipped (intentional):** The 7 `phasmoTourney5` admin routes — complex tournament logic, not touched.
**Skipped (intentional):** `api/admin/validate-banner` — uses a custom `{ ok: bool, error: '...' }` response shape throughout; changing it would require updating callers.

---

### 4. Unused Imports — Removed

**`src/lib/services/bookmarks.ts`** — `Timestamp`

**`src/lib/services/following.ts`** — `setDoc`, `deleteDoc`, `where`, `writeBatch`

**`src/lib/services/friends.ts`** — `Timestamp`

**`src/lib/services/notifications.ts`** — `Timestamp`, `NotificationDoc`, `UpdateNotificationInput`

**`src/lib/services/messages.ts`** — `Timestamp`, unused `currentUnreadCount` in `markThreadAsRead`

**`src/lib/services/gamification.ts`** — `updateDoc`, `increment`, `serverTimestamp`, `Timestamp`, `getLevelTitle`; dead `statMapping` object removed (was defined but never read after a previous refactor)

**`src/lib/services/index.ts`** — duplicate `export * from "./cms"` line

---

### 5. Player Hook Deduplication — Admin Round Pages

`src/components/admin/useAdminPlayers.tsx` — `Player` interface exported.

6 round management pages (`round1`–`round7` under `admin/phasmoTourney5/managerounds/`):
- Removed duplicate inline `Player` interface definitions
- Removed duplicate Firestore player fetch blocks inside `useEffect`
- Replaced with `const { players } = useAdminPlayers()`

Round5 additionally had its now-unused `useEffect` import cleaned up.
Round6 had a duplicate import of `computeRound5Marks` merged.

---

### 6. Twitch Embed Domain — Hardcoded Value Removed

`src/app/phasmotourney-series/phasmoTourney5/videos-and-stream-links/page.tsx`

Previous code: hardcoded `ALLOWED_DOMAINS = ['localhost', 'dukesenior-tools.web.app']`.

Now uses `window.location.hostname` directly as the Twitch `parent` parameter. Correct for all environments (localhost, production, Vercel preview URLs) without configuration.

---

### 7. `.claude/` Setup (from /init)

- `CLAUDE.md` — project commands, Firebase architecture, env vars, ESLint rules, dual MUI+Tailwind gotchas
- `.env.example` — all env var keys with format notes, safe to commit
- `.claude/skills/deploy-check/SKILL.md` — runs lint + build
- `.claude/skills/bundle-analyze/SKILL.md` — runs `ANALYZE=true npm run build`
- `.claude/settings.json` — PostToolUse hook: ESLint `--fix` on `.ts`/`.tsx` edits

---

## What Was NOT Touched

### Services skipped (too tightly coupled to split safely)

- **`gamification.ts`** (645 lines) — `awardXP` and `incrementStat` both have inline achievement logic inside Firestore transactions. Splitting requires careful transaction boundary management. Lint fixes only.
- **`friends.ts`** (484 lines) — single coherent domain, splitting would just shuffle the code
- **`messages.ts`** (465 lines) — same; DM thread + message logic belongs together

### Large UI components (not in scope for autonomous refactor)

These are large but untouched since UI extraction risks visual regressions:
- `posts/[slug]/page.tsx` — ~1393 lines
- `AppNavbar.tsx` — ~793 lines
- `MainNavbar.tsx` — ~765 lines

### phasmoTourney5 API routes (7 files)

Admin tournament management routes have complex state machine logic. Not touched to avoid breaking live tournament management.

---

## Open Questions / Actions for You

1. **Rotate `BLOB_READ_WRITE_TOKEN`** — this was shared in chat (live Vercel Blob token). Go to Vercel Dashboard → Storage → Blob → Tokens and rotate it.

2. **Admin email list** — your `.env.local` had only one email but the code expected two. Make sure both are in the comma-separated env vars (see section 1 above).

3. **`CRON_SECRET` env var** — `api/cron/publish-scheduled` checks for this but it's not in `.env.example`. Add it to Vercel environment variables if you want cron endpoint auth enforced.

4. **`api/admin/validate-banner`** — uses `{ ok: bool, error }` shape throughout. If you want it standardised, update its client callers at the same time.

5. **Tags routes** (`api/tags/*`) — 4 files not checked for error patterns. Quick win if you want consistent coverage.

6. **Tags routes** (`api/tags/*`) — 4 files not checked for error patterns. Minor win if you want full coverage.

---

## Lint Status

All modified files: **0 errors, 0 warnings** after fixes.
