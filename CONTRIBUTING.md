# Contributing

Thanks for your interest in contributing to **OpenSCAD Assistive Forge**.

This project’s core goal is to make **one of the most accessible SCAD interfaces available**. Contributions that improve accessibility, clarity, and reliability are especially welcome.

## Quick start (local dev)

### Prerequisites

- Node.js **18+**

### Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## What to work on

- **Accessibility improvements** (keyboard navigation, focus management, ARIA, contrast, reduced motion)
- **Better error messages** for common OpenSCAD/CGAL failures
- **Examples**: add or improve models in `public/examples/`
- **Docs**: make onboarding and usage clearer
- **Tests**: improve unit/E2E coverage for new behavior

## Development workflow

**📖 For complete branching strategy and release process, see [DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md)**

### Branch Structure

- **`main`** - Production releases (protected, requires PR)
- **`develop`** - Active development (base for feature branches)
- **`feat/*`** - Feature branches (merge to `develop`)
- **`fix/*`** - Bug fix branches (merge to `develop`)
- **`hotfix/*`** - Critical fixes (merge to both `main` and `develop`)

### Quick Start for Contributors

```bash
# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of your changes"

# Push and create PR to develop
git push -u origin feat/your-feature-name
```

See [DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md) for detailed workflow, release process, and commit conventions.

### Code style

- Run formatting: `npm run format`
- Run linting: `npm run lint`

### Tests

```bash
# unit tests
npm run test:run

# e2e tests (safe wrapper)
npm run test:e2e
```

On Windows, see `docs/TROUBLESHOOTING.md#playwright-terminal-hangs-windows` if Playwright gets stuck.

### Asset setup (optional)

```bash
npm run setup-wasm
npm run setup-libraries
```

## Accessibility acceptance checklist (for UI changes)

When you change UI behavior or markup, please verify:

- [ ] **Keyboard-only**: feature is usable without a mouse
- [ ] **Visible focus**: focus order makes sense and focus rings are visible
- [ ] **Screen reader**: controls have names/labels; status changes are announced when needed
- [ ] **Reduced motion**: animations are not required for understanding/operation
- [ ] **High contrast**: content remains readable and controls remain discoverable
- [ ] **Touch targets**: tap targets remain usable at small viewports

If you add new interactive patterns, prefer semantic HTML (`button`, `details/summary`, `fieldset/legend`, etc.) before adding ARIA.

## UI consistency rules (for UI changes)

All UI work must follow our design system to maintain consistency across themes, viewports, and user preferences. **See the complete guide:**

- **[UI_STANDARDS.md](docs/guides/UI_STANDARDS.md)** - Comprehensive design system documentation

### Quick UI Rules

**Use Design Tokens (Required):**
- Always use tokens from `src/styles/variables.css` for colors, spacing, typography, and sizing
- Never hardcode colors (hex codes) or magic numbers (arbitrary pixel values)
- Example: Use `var(--space-sm)` instead of `8px`

**Follow Component Patterns:**
- **Drawers**: Side panels collapse outward, bottom drawers expand upward
- **Buttons**: Use existing button classes (`.btn`, `.btn-icon`, `.btn-primary`) — don't create new variants
- **Icons**: Always use `currentColor` for SVG icons so they adapt to themes

**Test All Themes:**
- Light mode
- Dark mode
- High contrast mode (toggle with HC button)
- Windows forced-colors mode (if possible)

**Test Mobile:**
- Portrait mode (≤480px): Title abbreviates, buttons right-aligned
- Landscape mode: Drawers and controls remain accessible
- Touch targets: Minimum 44×44px for all interactive elements

**Documentation Updates:**
- If you add a new component pattern, document it in `UI_STANDARDS.md`
- Update PR template checklist to verify your changes

## Submitting changes

- Keep PRs focused: one behavior change per PR when possible.
- Include a short test plan in your PR description (what you ran, what you clicked).
- If your change impacts accessibility, say **what you tested** (keyboard + at least one screen reader if available).

## License

By contributing, you agree that your contributions will be licensed under the project license: **GPL-3.0-or-later** (see `LICENSE`).

