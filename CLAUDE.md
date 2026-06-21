# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint check (flat config, ESLint 9)
- `npm test` — Vitest single-run
- `npm run analyze` — bundle analysis (`ANALYZE=true npm run build`)

## Styling

**MUI is primary; Tailwind is supplementary.** Do not use Tailwind for component structure or layout — use MUI components and `sx` props. Tailwind utility classes are acceptable for one-off spacing/typography tweaks only.

Tailwind's preflight is **disabled** (set in `tailwind.config.js`) to avoid conflicts with MUI's CSS reset. Do not re-enable it.

Bootstrap is present but used sparingly — prefer MUI equivalents for new components.

## Path aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json` and `next.config.ts`).

## TypeScript / ESLint

Relaxed rules intentionally configured:
- `@typescript-eslint/no-explicit-any: off` — `any` is allowed
- `prefer-const: off` — `let` is acceptable
- `react/no-unescaped-entities: off`

Do not add `// eslint-disable` comments to work around stricter rules — the config already relaxes them.

## Firebase

Both client SDK (`src/lib/firebase/`) and Admin SDK (server-side) are used. Client config comes from `NEXT_PUBLIC_FIREBASE_*` env vars. Admin credentials are Vercel-managed secrets. Do not expose Admin SDK references in client-side code.

## Environment variables

See `.env.example` for the full list. Key ones:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config (all required)
- `ADMIN_EMAILS` / `ADMIN_UIDS` — comma-separated server-side admin list
- `NEXT_PUBLIC_ADMIN_EMAILS` / `NEXT_PUBLIC_ADMIN_UIDS` — same values, client-side
- `FIREBASE_PROJECT_ID` + `GOOGLE_APPLICATION_CREDENTIALS` — Firebase Admin SDK (Vercel only, empty locally)
- `CRON_SECRET` — cron job auth (can be empty locally)
- `VERCEL_OIDC_TOKEN` — auto-injected by Vercel CLI, do not set manually

Pull from Vercel: `vercel env pull .env.local`

## Pre-commit

Husky runs `lint-staged` on commit: ESLint `--fix` runs automatically on staged `.ts/.tsx` files. No manual step needed.
