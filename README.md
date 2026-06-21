# The Lair of Evil — DukeSenior Tools

A [Next.js](https://nextjs.org) project for DukeSenior's Twitch community — tournament brackets, community tools, and more.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 3.4 (sole styling framework) with CSS custom properties
- **UI Primitives**: `@base-ui/react` (Dialog), `react-icons` (Fi* Feather icons)
- **Authentication**: Firebase Auth with admin gating (email/UID allowlist)
- **Database**: Firestore (accessed via service modules in `src/lib/services/`)
- **Animations**: Framer Motion, canvas-confetti
- **Analytics**: Vercel Analytics & Speed Insights
- **Fonts**: Kalam (body), Permanent Marker (headings/display), Geist (sans), Geist Mono (mono) via `next/font/google`

## Design System — Whiteboard / Chalkboard

The site uses a **hand-drawn aesthetic** that switches between two themes:

| | Light (Whiteboard) | Dark (Chalkboard) |
|---|---|---|
| **Background** | `#f4f1ec` warm off-white | `#1a2721` green-black |
| **Text** | `#2b2b2b` warm dark | `#e4dfd4` chalky off-white |
| **Card** | `#faf8f5` | `#223029` |
| **Border** | `#d6d0c4` | `#3a4f41` |
| **Texture** | Faint dot-grid | Chalk-dust grain |

### Token System

CSS custom properties with RGB channels power the color system. Tailwind semantic tokens (`text-foreground`, `bg-background`, `bg-card`, `border-border`) resolve to `rgb(var(--color-*-rgb) / <alpha-value>)` and **auto-switch** with the `data-theme` attribute — no `dark:` prefix needed.

### Marker / Chalk Accent Colors

`text-marker-red`, `text-marker-blue`, `text-marker-green`, `text-marker-orange`, `text-marker-purple`, `text-marker-black` — vivid markers in light mode, pastel chalk in dark mode.

### Utility Classes

| Class | Effect |
|---|---|
| `chalk-underline` | Squiggly SVG underline |
| `marker-highlight` | Marker swoosh background |
| `card-board` | Dashed-border card with hover tilt |
| `chalk-dust` | Chalk texture overlay |
| `tilt-sm/md/lg` | Slight rotation effects |
| `border-dashed-marker` | Themed dashed border |

### Visual Patterns

- **Dashed borders** (`border-2 border-dashed`) on cards, navbar, footer, hero sections
- **Offset shadows** (`shadow-soft`) for a pinned-card feel
- **Kalam** body font + **Permanent Marker** display font — chalkboard handwriting pairing
- **Font scaling**: User-controlled `--font-scale` (0.8x–1.6x)

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages auto-update as you edit.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── admin/             # Admin-only components
│   ├── layout/            # PageLayout
│   ├── navigation/        # AppNavbar, SearchModal
│   ├── ui/                # Card, EmptyState, ErrorBoundary, Footer, Toast
│   ├── home/              # HeroSection, homepage content
│   └── ...
├── hooks/                 # useAuth, useNotifications, useCmsUploads
├── lib/
│   ├── services/          # Firestore service modules
│   ├── navigation/        # classify.ts, route helpers
│   ├── content/           # tags.ts (taggedManifest)
│   ├── firebase/          # Firebase client + admin config
│   ├── server/            # verifyIdToken, verifyAdminFromRequest
│   └── utils/             # Shared utilities
├── styles/
│   └── global.scss        # All CSS custom properties + utility classes
└── types/                 # TypeScript interfaces
```

## Key Features

- **Whiteboard/Chalkboard Themes**: Hand-drawn aesthetic with automatic dark mode
- **Tag-Driven Navigation**: Routes tagged in manifest; navbar auto-builds from `/api/tags/effective`
- **Accessibility**: Keyboard navigation, font scaling (0.8x–1.6x), semantic HTML
- **Global Search**: `⌘K` / `Ctrl+K` opens search modal with tag-based filtering
- **Keyboard Shortcuts**: `⌘K` (search), `⌘/` (theme toggle)
- **Community CMS**: Blog posts with draft/schedule/publish flow, comments, reactions, analytics
- **Gamification**: XP, levels, achievements, leaderboard
- **Social Features**: Profiles, friends, DMs, following, notifications

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |

## CI/CD Quality Assurance

- **Automated Build Checks**: GitHub Actions verifies all builds on PRs
- **Branch Protection**: Requires green status checks before merging
- **Vercel Integration**: Deployment previews for every PR

See [CI/CD Quality Assurance Guidelines](docs/CI_QUALITY_ASSURANCE.md) and [Branch Protection Setup](docs/BRANCH_PROTECTION_SETUP.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and code standards.

## Deploy

Deployed on [Vercel](https://vercel.com). See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
