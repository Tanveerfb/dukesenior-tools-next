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

✅ Run `npm run lint` - All linting checks pass
✅ Run `npm run build` - Build completes successfully
✅ Test your changes locally
✅ Update documentation if needed
✅ Write clear commit messages

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request**
   - Go to the repository on GitHub
   - Click "Pull requests" → "New pull request"
   - Select your branch
   - Fill in the PR template with:
     - Description of changes
     - Why the changes are needed
     - Any breaking changes
     - Screenshots (for UI changes)

3. **Wait for CI Checks** 🚦
   - GitHub Actions will automatically run build checks
   - Vercel will create a preview deployment
   - **All checks must pass** (green ✓) before merging
   - If checks fail, review the logs and fix issues

4. **Address Review Feedback**
   - Respond to reviewer comments
   - Make requested changes
   - Push updates - CI will re-run automatically

5. **Merge**
   - Once approved and all checks pass, your PR will be merged!

## CI/CD Quality Gates

All pull requests must pass these checks before merging:

### Required Checks

1. **Build Next.js Application** (GitHub Actions)
   - Installs dependencies
   - Runs linter
   - Builds the application
   - Must complete successfully

2. **Vercel Preview Deployment** (if configured)
   - Creates a preview deployment
   - Must deploy successfully
   - Provides a preview URL for testing

### What If Checks Fail?

**Build fails?**
- Click "Details" to view the error log
- Fix the errors in your branch
- Push the fix - checks re-run automatically

**Linting errors?**
- Run `npm run lint` locally to see errors
- Fix all issues
- Commit and push

**Need help?**
- Ask in the PR comments
- Review the [CI/CD documentation](docs/CI_QUALITY_ASSURANCE.md)

## Code Style Guidelines

### General Principles

- **Consistency**: Follow existing patterns in the codebase
- **Clarity**: Write self-documenting code with clear names
- **Comments**: Add comments for complex logic, not obvious code
- **TypeScript**: Use proper types, avoid `any` when possible

### React/Next.js Specific

- Use functional components with hooks
- Prefer server components over client components (use `'use client'` only when needed)
- Follow Next.js 16 App Router conventions
- Keep components focused and single-purpose

### Styling

- Use Bootstrap utilities from React-Bootstrap
- Follow existing SCSS variable patterns in `src/styles/global.scss`
- Use CSS custom properties for theme-aware styling
- Ensure dark mode compatibility

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── lib/              # Utilities, services, helpers
├── styles/           # Global styles and SCSS
└── types/            # TypeScript type definitions
```

## Testing

Currently, the project uses Vitest for testing:

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

Thank you for contributing to DukeSenior Tools! Your efforts help make this project better for everyone. 🎉

**Remember**: The green Vercel tick ✅ is your friend - it means your changes are production-ready!
