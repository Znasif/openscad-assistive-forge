# Development Workflow

This document outlines the branching strategy and development process for OpenSCAD Assistive Forge.

## Branching Strategy

We use a modified **Git Flow** strategy with the following branch structure:

### Main Branches

- **`main`** - Production-ready code. Direct commits are not allowed.
  - Contains stable, released versions
  - Protected branch requiring PR approval
  - Tagged with semantic versions (e.g., `v4.0.0`)

- **`develop`** - Integration branch for features
  - Next release development happens here
  - Base branch for all feature branches
  - Should always be in a working state

### Supporting Branches

#### Feature Branches
- **Naming**: `feat/feature-name` or `feature/feature-name`
- **Base**: `develop`
- **Merge into**: `develop`
- **Purpose**: New features, enhancements

```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name

# Work on your feature
git add .
git commit -m "feat: add your feature"

# Push and create PR to develop
git push -u origin feat/your-feature-name
```

#### Fix Branches
- **Naming**: `fix/bug-description`
- **Base**: `develop` (or `main` for hotfixes)
- **Merge into**: `develop` (or both `main` and `develop` for hotfixes)
- **Purpose**: Bug fixes

```bash
# Create fix branch
git checkout develop
git checkout -b fix/bug-description

# Fix the bug
git add .
git commit -m "fix: resolve bug description"

# Push and create PR
git push -u origin fix/bug-description
```

#### Hotfix Branches
- **Naming**: `hotfix/critical-issue`
- **Base**: `main`
- **Merge into**: Both `main` AND `develop`
- **Purpose**: Critical production fixes that can't wait for next release

```bash
# Create hotfix branch
git checkout main
git checkout -b hotfix/critical-issue

# Fix the issue
git add .
git commit -m "fix: critical issue description"

# Push and create PRs to both main and develop
git push -u origin hotfix/critical-issue
```

#### Release Branches
- **Naming**: `release/vX.Y.Z`
- **Base**: `develop`
- **Merge into**: Both `main` AND `develop`
- **Purpose**: Prepare for production release

```bash
# Create release branch
git checkout develop
git checkout -b release/v4.1.0

# Finalize release (update version, changelog, etc.)
git add .
git commit -m "chore: prepare v4.1.0 release"

# Merge to main and tag
git checkout main
git merge --no-ff release/v4.1.0
git tag -a v4.1.0 -m "Release v4.1.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v4.1.0
git push origin develop

# Delete release branch
git branch -d release/v4.1.0
git push origin --delete release/v4.1.0
```

#### Chore/Refactor Branches
- **Naming**: `chore/task-name` or `refactor/component-name`
- **Base**: `develop`
- **Merge into**: `develop`
- **Purpose**: Maintenance, refactoring, dependency updates

## Commit Message Convention

We follow **Conventional Commits** specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feature or bug fix)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **ci**: CI/CD changes

### Examples
```bash
feat: add camera preset system
fix: resolve focus trap in modal manager
docs: update setup instructions for Windows
refactor: extract theme constants to design tokens
test: add unit tests for preset manager
chore: update dependencies to patch vulnerabilities
```

### Scope (Optional)
Use scope to specify component/area:
```bash
feat(ui): add responsive drawer animation
fix(wasm): handle memory allocation errors
test(e2e): add mobile viewport tests
```

## Pull Request Process

### 1. Before Creating PR

- [ ] Ensure your branch is up to date with base branch
  ```bash
  git checkout develop
  git pull origin develop
  git checkout your-branch
  git merge develop
  ```
- [ ] Run tests locally
  ```bash
  npm run test:run
  npm run test:e2e
  ```
- [ ] Run linting and formatting
  ```bash
  npm run lint
  npm run format
  ```
- [ ] Update documentation if needed

### 2. Creating PR

**Title Format**: Use conventional commit format
```
feat: add feature name
fix: resolve bug description
```

**PR Description Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Test Plan
1. Steps to test
2. What to verify
3. Expected behavior

## Accessibility Checklist (for UI changes)
- [ ] Keyboard-only navigation works
- [ ] Visible focus indicators
- [ ] Screen reader compatible
- [ ] Reduced motion respected
- [ ] High contrast mode works
- [ ] Touch targets ≥44×44px

## UI Consistency (for UI changes)
- [ ] Uses design tokens (no hardcoded values)
- [ ] Tested in light/dark/high-contrast modes
- [ ] Mobile responsive (portrait & landscape)
- [ ] Follows component patterns

## Screenshots/Videos
If applicable

## Related Issues
Closes #issue_number
```

### 3. PR Review Requirements

- At least **1 approval** required
- All CI checks must pass
- No merge conflicts
- Branch must be up to date with base

### 4. Merging

- Use **Squash and Merge** for feature branches (keeps history clean)
- Use **Merge Commit** for release/hotfix branches (preserves history)
- Delete branch after merge

## Release Process

### Semantic Versioning

We follow [SemVer](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Steps

1. **Prepare Release Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/vX.Y.Z
   ```

2. **Update Version & Changelog**
   - Update `package.json` version
   - Update `CHANGELOG.md` with changes
   - Update any version references in docs

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "chore: prepare vX.Y.Z release"
   git push -u origin release/vX.Y.Z
   ```

4. **Create PR to Main**
   - Create PR from `release/vX.Y.Z` to `main`
   - Get approval and merge

5. **Tag Release**
   ```bash
   git checkout main
   git pull origin main
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```

6. **Merge Back to Develop**
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

7. **Clean Up**
   ```bash
   git branch -d release/vX.Y.Z
   git push origin --delete release/vX.Y.Z
   ```

8. **Create GitHub Release**
   - Go to GitHub Releases
   - Create new release from tag
   - Copy changelog entries
   - Publish release

## Quick Reference

### Daily Development
```bash
# Start new feature
git checkout develop && git pull
git checkout -b feat/my-feature

# Regular commits
git add .
git commit -m "feat: description"

# Push and create PR
git push -u origin feat/my-feature
```

### Keeping Branch Updated
```bash
# Update from develop
git checkout develop && git pull
git checkout your-branch
git merge develop

# Or rebase (cleaner history)
git rebase develop
```

### Viewing Branch Structure
```bash
# See all branches
git branch -a

# See branch history graph
git log --oneline --graph --all --decorate
```

## Branch Protection Rules (Recommended)

Configure these on GitHub for `main` and `develop`:

### Main Branch
- Require pull request reviews (1+ approvals)
- Require status checks to pass
- Require branches to be up to date
- Do not allow force pushes
- Do not allow deletions

### Develop Branch
- Require status checks to pass
- Require branches to be up to date
- Allow force pushes (only for maintainers)

## CI/CD Integration

All PRs should trigger:
- Linting (`npm run lint`)
- Unit tests (`npm run test:run`)
- E2E tests (`npm run test:e2e`)
- Build verification (`npm run build`)
- Accessibility checks (Lighthouse CI)

## Getting Help

- Check existing issues and PRs
- Review `CONTRIBUTING.md` for code standards
- Ask in discussions for clarification
- Tag maintainers in PR for specific questions

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
