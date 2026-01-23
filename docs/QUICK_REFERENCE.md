# Development Quick Reference

Quick reference card for common development tasks.

## Branch Workflow

### Starting Work

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feat/feature-name    # New feature
git checkout -b fix/bug-name         # Bug fix
git checkout -b chore/task-name      # Maintenance
```

### Daily Work

```bash
# Make changes
git add .
git commit -m "feat: description"    # See commit types below

# Push branch
git push -u origin feat/feature-name
```

### Keeping Up to Date

```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout your-branch
git merge develop

# Or use rebase for cleaner history
git rebase develop
```

## Commit Types

Use conventional commits format: `<type>: <description>`

| Type | Use For | Example |
|------|---------|---------|
| `feat` | New features | `feat: add camera presets` |
| `fix` | Bug fixes | `fix: resolve modal focus trap` |
| `docs` | Documentation | `docs: update setup guide` |
| `style` | Code formatting | `style: apply prettier` |
| `refactor` | Code restructuring | `refactor: extract theme logic` |
| `perf` | Performance | `perf: optimize render loop` |
| `test` | Tests | `test: add preset manager tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add build step` |

## Testing

```bash
# Unit tests
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage

# E2E tests
npm run test:e2e          # Safe wrapper (recommended)

# Linting
npm run lint              # Check for issues
npm run format            # Auto-fix formatting
```

## Before Creating PR

```bash
# 1. Update from develop
git checkout develop && git pull
git checkout your-branch
git merge develop

# 2. Run tests
npm run test:run
npm run test:e2e
npm run lint
npm run format

# 3. Build check
npm run build

# 4. Push
git push origin your-branch
```

## PR Checklist

- [ ] Branch is up to date with `develop`
- [ ] All tests pass locally
- [ ] Linting/formatting applied
- [ ] Commit messages follow convention
- [ ] PR title uses conventional format
- [ ] PR description filled out
- [ ] Accessibility checklist completed (UI changes)
- [ ] Screenshots added (visual changes)

## Common Tasks

### View Branch Graph

```bash
git log --oneline --graph --all --decorate
```

### Check Current Status

```bash
git status
git branch -a                 # All branches
git remote -v                 # Remote URLs
```

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Discard All Local Changes

```bash
git checkout .                # Unstaged changes
git reset --hard develop      # All changes (dangerous!)
```

### Clean Up Old Branches

```bash
# Delete local branch
git branch -d feat/old-feature

# Delete remote branch
git push origin --delete feat/old-feature

# Prune deleted remote branches
git fetch --prune
```

## Release Process (Maintainers)

### Preparing Release

```bash
# 1. Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v4.1.0

# 2. Update version
# - Update package.json
# - Update CHANGELOG.md
# - Update README.md badges

# 3. Commit
git add .
git commit -m "chore: prepare v4.1.0 release"
git push -u origin release/v4.1.0

# 4. Create PR to main
```

### After Release PR Merges

```bash
# 1. Tag release
git checkout main
git pull origin main
git tag -a v4.1.0 -m "Release v4.1.0"
git push origin v4.1.0

# 2. Merge back to develop
git checkout develop
git merge main
git push origin develop

# 3. Create GitHub Release
# Go to GitHub > Releases > New Release
# Select tag v4.1.0
# Add release notes
```

## Hotfix Process (Maintainers)

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. Fix and commit
git add .
git commit -m "fix: critical issue"

# 3. PR to main AND develop
git push -u origin hotfix/critical-fix
# Create PR to main
# Create PR to develop
```

## CI/CD

All PRs automatically run:
- ✅ Unit tests
- ✅ E2E tests
- ✅ Linting
- ✅ Build check
- ✅ Lighthouse (accessibility & performance)

Check **Actions** tab on GitHub for results.

## Useful Commands

### Run Specific Test File

```bash
# Unit test
npm run test -- auto-preview-controller.test.js

# E2E test
npx playwright test basic-workflow.spec.js
```

### Watch Specific Test

```bash
npm run test -- --watch auto-preview-controller.test.js
```

### Run E2E in Debug Mode

```bash
npx playwright test --debug
```

### Check Bundle Size

```bash
npm run build
du -sh dist/
```

### Update All Dependencies

```bash
# Check outdated
npm outdated

# Update to latest (careful!)
npm update

# Update specific package
npm install package-name@latest
```

## Troubleshooting

### Merge Conflicts

```bash
# 1. Update your branch
git checkout develop && git pull
git checkout your-branch
git merge develop

# 2. Resolve conflicts in files
# Edit files marked with <<<<<<< HEAD

# 3. Complete merge
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

### Failed Tests in CI But Pass Locally

1. Check Node version matches CI (20.x)
2. Try clean install: `rm -rf node_modules package-lock.json && npm install`
3. Check for environment-specific issues
4. Review CI logs for specific errors

### Playwright Hangs on Windows

Use the safe wrapper:

```bash
npm run test:e2e
```

Or kill processes manually:

```powershell
Stop-Process -Name "pwsh" -Force
Stop-Process -Name "node" -Force
```

### Can't Push to Main/Develop

Expected! These branches are protected. Create a PR instead.

## Resources

- [Full Development Workflow](DEVELOPMENT_WORKFLOW.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Branch Protection Setup](../.github/BRANCH_PROTECTION.md)
- [UI Standards](UI_STANDARDS.md)
- [Accessibility Guide](guides/ACCESSIBILITY_GUIDE.md)
- [Testing Guide](guides/TESTING_QUICK_START.md)

## Getting Help

- 💬 Check [GitHub Discussions](https://github.com/BrennenJohnston/openscad-assistive-forge/discussions)
- 🐛 Search [existing issues](https://github.com/BrennenJohnston/openscad-assistive-forge/issues)
- 📖 Review documentation in `docs/`
- 🏷️ Tag maintainers in PR comments

---

**Remember:**
- Always branch from `develop`
- Use conventional commit messages
- Test before pushing
- Keep PRs focused and small
- Document UI changes
