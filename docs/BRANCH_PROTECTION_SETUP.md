# Branch Protection Setup - Quick Reference

This is a quick reference for repository administrators to set up branch protection rules that require Vercel build checks before merging PRs.

## Prerequisites

✅ GitHub Actions workflow is in place (`.github/workflows/vercel-build-check.yml`)
✅ Vercel is connected to your GitHub repository (optional but recommended)
✅ You have admin access to the repository

## Step-by-Step Setup

### 1. Navigate to Branch Protection Settings

1. Go to your repository on GitHub
2. Click **Settings** (repository settings, not user settings)
3. Click **Branches** in the left sidebar
4. Under "Branch protection rules", click **Add rule**

### 2. Configure Rule for Main Branch

In the "Branch name pattern" field, enter: `main` (or `master` if that's your primary branch)

### 3. Enable Required Settings

Check these boxes:

#### ☑️ Require a pull request before merging
- ☑️ Require approvals: 1 (recommended)
- ☑️ Dismiss stale pull request approvals when new commits are pushed (recommended)

#### ☑️ Require status checks to pass before merging
- ☑️ Require branches to be up to date before merging

**IMPORTANT**: In the search box that appears, add these status checks:
- Type: `Build Next.js Application` and select it
- Type: `Vercel` or `vercel` (if Vercel is connected) and select it

> **Note**: Status checks only appear in the list after they've run at least once. You may need to create a test PR first to make them appear.

#### ☑️ Require conversation resolution before merging (recommended)

#### ☑️ Include administrators (recommended)
- This ensures even admins must follow the rules

### 4. Save Changes

Click **Create** or **Save changes** at the bottom

## Verification

To verify your setup works:

1. Create a test branch and PR
2. Check that the "Build Next.js Application" status check appears
3. Try to merge - the button should be disabled until checks pass
4. Verify that passing checks enable the merge button

## What This Achieves

✅ **No broken builds in main**: All PRs must build successfully
✅ **Code quality**: Linting must pass before merge
✅ **Review process**: Changes require approval
✅ **Deployment safety**: Vercel preview builds must succeed

## Troubleshooting

**Status check doesn't appear in the list?**
- Create a test PR first - status checks appear after running once
- Check the Actions tab to ensure the workflow ran

**Can't find the status check name?**
- Look at a recent PR's "Checks" tab
- The exact name is shown there

**Vercel check missing?**
- Verify Vercel is connected to your repository
- Check Vercel project settings for GitHub integration

## Need Help?

See the full documentation: `docs/CI_QUALITY_ASSURANCE.md`

---

**Result**: After setup, PRs will show the green Vercel tick ✅ when they're ready to merge!
