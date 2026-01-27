# This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **UI Library**: Material-UI (MUI) v6 + Tailwind CSS
- **Styling**: SCSS with CSS variables, Tailwind utilities
- **State Management**: React Query (TanStack Query)
- **Authentication**: Firebase Auth with admin gating
- **Database**: Firestore
- **Animations**: Framer Motion
- **Analytics**: Vercel Analytics & Speed Insights

## Design System

This project uses a **unified MUI + Tailwind design system**:
- **MUI Components**: Primary component library for consistent UI
- **Tailwind CSS**: Utility classes for rapid styling
- **Theme**: Custom theme with light/dark mode support
- **Colors**: Brand colors defined in MUI theme (`primary`, `secondary`, `tertiary`)
- **Typography**: Fluid type scale with font scaling (0.8x-1.6x)
- **Spacing**: 8px base unit system

See `BOOTSTRAP_MIGRATION.md` for migration patterns from legacy Bootstrap code.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── admin/             # Admin-only components
│   ├── layout/            # PageLayout, AppChrome
│   ├── navigation/        # Navbar, Breadcrumbs, Search
│   ├── ui/                # Shared UI components
│   ├── home/              # Homepage sections
│   ├── tourney/           # Tournament components
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/
│   ├── services/          # Firestore service modules
│   ├── navigation/        # Navigation utilities
│   └── firebase/          # Firebase config
├── styles/                # Global styles
├── theme/                 # MUI theme configuration
└── types/                 # TypeScript types
```

## Key Features

- **Responsive Design**: Mobile-first with MUI breakpoints
- **Dark Mode**: Automatic theme switching with persistence
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation
- **Font Scaling**: User-controlled font size (0.8x-1.6x)
- **Search**: Global fuzzy search (⌘K/Ctrl+K)
- **Keyboard Shortcuts**: ⌘K (search), ⌘/ (theme toggle)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CI/CD Quality Assurance

This repository enforces quality gates to ensure production stability:

- ✅ **Automated Build Checks**: GitHub Actions verifies all builds on PRs
- ✅ **Branch Protection**: Requires green status checks before merging
- ✅ **Vercel Integration**: Provides deployment previews for every PR

### For Contributors

All pull requests must pass build checks before merging. See [CI/CD Quality Assurance Guidelines](docs/CI_QUALITY_ASSURANCE.md) for the complete workflow.

### For Administrators

To set up branch protection rules, follow the [Branch Protection Setup Guide](docs/BRANCH_PROTECTION_SETUP.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and code standards.
