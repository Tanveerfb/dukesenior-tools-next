# Contributing to DukeSenior Tools

Thank you for your interest in contributing to DukeSenior Tools! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)
- Git

### Local Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dukesenior-tools-next.git
   cd dukesenior-tools-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write code** following the existing code style
2. **Test locally** - Ensure your changes work as expected
3. **Run linter** before committing:
   ```bash
   npm run lint
   ```
4. **Build the project** to ensure no build errors:
   ```bash
   npm run build
   ```

### Committing Changes

This project uses [Husky](https://typicode.github.io/husky/) for pre-commit hooks:

- Linting runs automatically on staged files
- Fix any linting errors before committing
- Write clear, descriptive commit messages

```bash
git add .
git commit -m "feat: add your feature description"
```

## Pull Request Process

### Before Submitting

- Run `npm run lint` — all linting checks pass
- Run `npm run build` — build completes successfully
- Test your changes locally in both light and dark themes
- Update documentation if needed
- Write clear commit messages

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Description of changes
   - Why the changes are needed
   - Any breaking changes
   - Screenshots (for UI changes — include both light & dark theme)

3. **Wait for CI Checks** — GitHub Actions builds and Vercel deploys a preview. All checks must pass.

4. **Address Review Feedback** — make changes and push; CI re-runs automatically.

5. **Merge** — once approved and green, your PR will be merged.

## CI/CD Quality Gates

All pull requests must pass these checks before merging:

1. **Build Next.js Application** (GitHub Actions) — install, lint, build
2. **Vercel Preview Deployment** — creates a preview URL for testing

See [CI/CD documentation](docs/CI_QUALITY_ASSURANCE.md) if checks fail.

## Code Style Guidelines

### General Principles

- **Consistency**: Follow existing patterns in the codebase
- **Clarity**: Write self-documenting code with clear names
- **Comments**: Add comments for complex logic, not obvious code
- **TypeScript**: Use proper types, avoid `any` when possible

### React / Next.js

- Use functional components with hooks
- Prefer server components; use `'use client'` only when needed
- Follow Next.js 16 App Router conventions
- Keep components focused and single-purpose

### Styling

This project uses **Tailwind CSS 3.4** as the sole styling framework. **No MUI, no Bootstrap** — those are fully removed.

- **Tailwind utilities** for all layout and styling
- **Semantic tokens** (`text-foreground`, `bg-background`, `bg-card`, `border-border`) auto-switch between light/dark themes — no `dark:` prefix needed
- **`cn()`** from `@/lib/utils` (clsx + tailwind-merge) for conditional class composition
- **CSS custom properties** defined in `src/styles/global.scss` for theme colors
- **Marker colors**: `text-marker-red`, `text-marker-blue`, `text-marker-green`, `text-marker-orange`, `text-marker-purple`
- **Board aesthetic**: Use `border-2 border-dashed` and `rounded-md` on cards and sections
- **Utility classes**: `chalk-underline`, `marker-highlight`, `card-board`, `chalk-dust`, `tilt-sm/md/lg`
- **Dark mode**: Verify all changes in both themes — the whiteboard (light) and chalkboard (dark)
- **Font scaling**: Respect `var(--font-scale,1)` for user-controlled sizing (0.8x–1.6x)

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/           # Card, EmptyState, ErrorBoundary, Footer, Toast
│   ├── layout/       # PageLayout
│   ├── navigation/   # AppNavbar, SearchModal
│   └── ...           # Feature-specific components
├── hooks/            # useAuth, useNotifications, etc.
├── lib/
│   ├── services/     # Firestore CRUD modules
│   ├── navigation/   # Route classification helpers
│   ├── content/      # Tag manifest (tags.ts)
│   └── utils/        # Shared utilities
├── styles/           # global.scss (all CSS custom properties)
└── types/            # TypeScript interfaces
```

## Testing

The project uses Vitest:

```bash
npm test
```

When adding new features, consider adding tests if applicable.

## Documentation

Update documentation when:

- Adding new features
- Changing existing behavior
- Adding new configuration options
- Updating dependencies with breaking changes

## Getting Help

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Questions**: Use GitHub Discussions for questions
- **Urgent**: Contact repository maintainers

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Focus on constructive feedback
- Accept gracefully when your contributions need changes
- Prioritize the project's success over individual preferences

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that creates an uncomfortable environment

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors are valued! Your contributions will be recognized through:

- GitHub's contribution graph
- Release notes (for significant contributions)
- Credit in documentation (where applicable)

---

Thank you for contributing to DukeSenior Tools! Your efforts help make this project better for everyone.
