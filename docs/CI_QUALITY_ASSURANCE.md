# CI/CD Quality Assurance Guidelines

This document outlines the CI/CD quality assurance process for the dukesenior-tools-next repository, ensuring production stability through automated build verification.

## Overview

All pull requests must pass a successful Vercel build check before merging to maintain production stability and visual quality. This is enforced through:

1. **Automated GitHub Actions workflow** - Validates builds on every PR
2. **Branch protection rules** - Requires status checks to pass before merging
3. **Vercel integration** - Provides deployment previews and production builds

## Automated Build Verification

### GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/vercel-build-check.yml`) that automatically:

- ✅ Runs on every pull request to `main` or `master` branches
- ✅ Installs dependencies with `npm ci`
- ✅ Runs the linter with `npm run lint`
- ✅ Builds the Next.js application with `npm run build`
- ✅ Reports build success or failure

This workflow ensures that code quality checks and builds succeed before any code is merged.

## Branch Protection Rules Setup

### Required Configuration

Repository administrators must configure branch protection rules to enforce build checks. Follow these steps:

#### 1. Access Repository Settings

1. Navigate to your repository on GitHub
2. Click **Settings** → **Branches**
3. Under "Branch protection rules", click **Add rule** or edit existing rule for `main`/`master`

#### 2. Configure Protection Rules

Enable the following settings:

- ✅ **Require a pull request before merging**
  - Recommended: Require approvals (at least 1)
  - Recommended: Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**
  - Check: "Require branches to be up to date before merging"
  - Add required status checks:
    - `Build Next.js Application` (from GitHub Actions)
    - `Vercel` or `vercel` (from Vercel integration, if using Vercel deployment)

- ✅ **Do not allow bypassing the above settings**
  - Ensures everyone, including administrators, follows the same rules

#### 3. Additional Recommended Settings

- ✅ **Require conversation resolution before merging**
- ✅ **Require linear history** (optional, keeps git history clean)
- ✅ **Include administrators** (enforces rules for all team members)

### Required Status Checks

The following status checks should be required:

1. **Build Next.js Application** - GitHub Actions workflow that validates the build
2. **Vercel** - If using Vercel for deployment (production or preview deployments)

## Vercel Integration Setup

### Connecting Vercel to GitHub

If not already connected, set up Vercel integration:

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Configure build settings (Next.js should be auto-detected)
   - Click "Deploy"

3. **Configure GitHub Integration**
   - Vercel automatically creates a GitHub App integration
   - This provides deployment previews for every PR
   - Status checks are automatically posted to GitHub

### Vercel Settings

Recommended Vercel project settings:

- **Production Branch**: `main` or `master`
- **Deployment Protection**: Enable for production deployments
- **Preview Deployments**: Enable for all branches
- **Automatic Deployments**: Enable for both production and preview

## PR Workflow

### For Contributors

When creating a pull request:

1. **Create your feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request**
   - Navigate to the repository on GitHub
   - Click "Pull requests" → "New pull request"
   - Select your branch and click "Create pull request"

4. **Wait for Status Checks**
   - GitHub Actions will automatically run the build check
   - Vercel will create a preview deployment (if integrated)
   - Both checks must pass (green ✓) before merging

5. **Address Any Failures**
   - If the build fails, click "Details" to view the error logs
   - Fix the issues in your branch
   - Push the fixes - checks will re-run automatically

6. **Merge After Approval**
   - Once all checks pass and reviewers approve, merge the PR
   - The merge button will be disabled until all requirements are met

### For Reviewers

Before approving a PR:

1. ✅ Verify all status checks are green
2. ✅ Review the Vercel preview deployment
3. ✅ Check the code changes for quality and correctness
4. ✅ Test the functionality if needed
5. ✅ Approve the PR only when satisfied

## Troubleshooting

### Build Fails in CI but Works Locally

Possible causes:

1. **Missing environment variables**
   - Add required secrets in GitHub repository settings
   - Go to Settings → Secrets and variables → Actions

2. **Dependency issues**
   - Ensure `package-lock.json` is committed
   - Run `npm ci` locally to test clean install

3. **Type errors or linting issues**
   - Run `npm run lint` locally before pushing
   - Fix all TypeScript errors

4. **Build configuration**
   - Verify `next.config.ts` is correct
   - Check for any dynamic imports or external dependencies

### Status Check Not Appearing

If the "Build Next.js Application" check doesn't appear:

1. Verify the workflow file exists at `.github/workflows/vercel-build-check.yml`
2. Check that the PR is targeting the `main` or `master` branch
3. Look for workflow run in the "Actions" tab
4. Ensure workflow has proper permissions in repository settings

### Vercel Check Missing

If the Vercel status check doesn't appear:

1. Verify Vercel is connected to your GitHub repository
2. Check Vercel project settings for GitHub integration
3. Ensure deployment protection settings allow preview deployments
4. Re-install the Vercel GitHub App if needed

## Testing the Setup

### Testing GitHub Actions

Create a test PR to verify the workflow:

```bash
# Create a test branch
git checkout -b test/verify-ci-setup

# Make a trivial change
echo "# CI Test" >> TEST.md
git add TEST.md
git commit -m "test: verify CI setup"
git push origin test/verify-ci-setup
```

Open a PR and verify:
- ✅ "Build Next.js Application" check appears
- ✅ Check completes successfully
- ✅ Merge button state reflects check status

### Testing Branch Protection

After configuring branch protection rules:

1. Attempt to merge a PR with failing checks - should be blocked
2. Verify the PR requires the specified status checks
3. Confirm administrators cannot bypass (if configured)

## Maintenance

### Updating the Workflow

If you need to modify the build process:

1. Edit `.github/workflows/vercel-build-check.yml`
2. Test changes in a separate branch/PR
3. Merge only after verifying the workflow succeeds

### Monitoring Build Health

Regularly check:

- GitHub Actions workflow run history
- Build success/failure rates
- Common failure patterns

Access via: Repository → Actions tab

## Benefits

This CI/CD setup provides:

- 🚦 **Quality Gates**: Prevents broken code from reaching production
- 🔒 **Stability**: Ensures all changes build successfully
- 👀 **Visibility**: Provides deployment previews for every PR
- 🔄 **Automation**: Reduces manual verification burden
- 📊 **Accountability**: Clear audit trail of what was tested

## Support

For issues or questions:

1. Check GitHub Actions logs for build failures
2. Review Vercel deployment logs for deployment issues
3. Consult Next.js documentation for build configuration
4. Contact repository maintainers for access/permission issues

---

**Remember**: The green Vercel tick is your friend! ✅ It means your changes are production-ready. 🚀
