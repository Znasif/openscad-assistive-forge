<p align="center">
  <img src="OpenSCAD Assistive Web Forge Logo.png" alt="OpenSCAD Assistive Web Forge Logo" width="200">
</p>

# OpenSCAD Assistive Forge

> **Customize parametric 3D models directly in your browser.** Upload a Customizer-enabled `.scad`, adjust parameters through an accessibility-first UI, preview the result, and download printable outputs — no installation, no account, no server.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![OpenSCAD](https://img.shields.io/badge/OpenSCAD-WASM-orange.svg)](https://openscad.org/)
[![Accessibility](https://img.shields.io/badge/WCAG-2.2%20AA-green.svg)](https://www.w3.org/WAI/WCAG22/quickref/)
[![Version](https://img.shields.io/badge/version-4.0.0-brightgreen.svg)](CHANGELOG.md)
[![PWA](https://img.shields.io/badge/PWA-enabled-blue.svg)](https://web.dev/progressive-web-apps/)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020.svg)](https://openscad-assistive-forge.pages.dev/)

---

## Project Intent

**OpenSCAD Assistive Forge exists to make parametric 3D design accessible to everyone.**

OpenSCAD is a powerful parametric CAD tool used to create 3D-printable objects like assistive devices, organizational tools, and custom parts. However, its traditional workflow requires installing desktop software and writing code — barriers that exclude many potential users:

- People who rely on screen readers or other assistive technologies
- Clinicians and caregivers customizing assistive devices for clients
- Makers who aren't comfortable with programming
- Anyone who prefers visual, browser-based tools

**This project removes those barriers.** It brings the full power of OpenSCAD's parametric Customizer to the browser with an interface designed from the ground up to be accessible to users with disabilities, usable by non-technical professionals, and private by default.

### Who This Is For

| User Group | How This Helps |
|------------|----------------|
| **Screen reader users** | Full keyboard navigation, ARIA announcements, semantic HTML |
| **Clinicians and occupational therapists** | Customize AAC keyguards and assistive devices without learning code |
| **Low vision users** | High contrast mode with WCAG AAA (7:1) contrast ratios |
| **Motor-impaired users** | Large touch targets (44×44px), voice input compatible |
| **Privacy-conscious users** | 100% client-side processing; your models never leave your device |
| **Novice makers** | Visual controls replace code editing; presets save configurations |

---

## Accessibility Features

Accessibility is not an afterthought — it's the core design principle. **Accessibility issues are treated as bugs.**

### Standards Compliance

| Standard | Status |
|----------|--------|
| **WCAG 2.2 Level AA** | Full compliance |
| **WCAG 2.2 Level AAA** | High Contrast mode meets AAA contrast (7:1) |
| **Section 508** | Compliant with U.S. federal requirements |
| **EN 301 549** | Aligned with European accessibility standard |

### Keyboard Navigation

Everything works without a mouse:

| Shortcut | Action |
|----------|--------|
| `Tab` / `Shift+Tab` | Navigate between controls |
| `Arrow Keys` | Rotate 3D preview, adjust sliders |
| `Shift + Arrow Keys` | Pan 3D preview |
| `+` / `-` | Zoom 3D preview |
| `Ctrl/Cmd + Enter` | Generate output (render) |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo parameter changes |
| `R` | Reset parameters to defaults |
| `D` | Download output (when available) |
| `F` | Toggle focus mode (maximize preview) |
| `Escape` | Close modals and dialogs |

### Screen Reader Support

- **Live announcements**: Parameter changes, render status, and errors are announced automatically
- **Semantic HTML**: Proper headings, landmarks, and ARIA roles throughout
- **Form labels**: Every input has an accessible name
- **Status regions**: `aria-live` regions provide non-intrusive updates
- **Tested configurations**: NVDA + Firefox, JAWS + Chrome/Edge, VoiceOver + Safari, TalkBack + Chrome

### Visual Accessibility

- **High Contrast mode**: Toggle via the "HC" button for WCAG AAA (7:1) contrast ratios
- **Dark/Light/Auto themes**: Respects `prefers-color-scheme` system setting
- **Forced colors support**: Full compatibility with Windows High Contrast and OS-enforced color schemes
- **Reduced motion**: Animations disabled when `prefers-reduced-motion` is enabled
- **Larger text**: High Contrast mode increases font sizes by 12-17%
- **Focus indicators**: 3-4px visible outlines on all interactive elements (WCAG 2.4.13 compliant)

### Motor Accessibility

- **Touch targets**: All interactive elements are at least 44×44px
- **Voice input compatible**: All buttons and controls have speakable labels
- **Undo/Redo**: Easily reverse mistakes with keyboard shortcuts
- **Presets**: Save and recall configurations to avoid repetitive adjustments

### Cognitive Accessibility

- **Progressive disclosure**: Advanced options are hidden by default
- **Guided tutorials**: Built-in "Getting Started" tutorial walks through the interface
- **Error messages**: Clear, actionable feedback when something goes wrong
- **Parameter groups**: Related controls are organized into collapsible sections
- **Help tooltips**: Context-sensitive help explains each parameter

---

## Try It

### Live Demo

**https://openscad-assistive-forge.pages.dev/**

No installation required. Works in Chrome, Firefox, Safari, and Edge.

### Install as App (PWA)

The app can be installed for offline use:

- **Chrome/Edge**: Click the install icon (⊕) in the address bar
- **Safari/iOS**: Tap Share → "Add to Home Screen"
- **Firefox**: Use the address bar menu → "Install"

### Run Locally

```bash
git clone https://github.com/BrennenJohnston/openscad-assistive-forge.git
cd openscad-assistive-forge
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How It Works

1. **Upload** a `.scad` file (or `.zip` for multi-file projects)
2. **Customize** parameters using visual controls (sliders, dropdowns, toggles)
3. **Preview** the 3D model in real-time
4. **Download** the output in STL, OBJ, OFF, AMF, or 3MF format

All processing happens in your browser using OpenSCAD compiled to WebAssembly. Your files are never uploaded to a server.

---

## Features

### Core Functionality

- **100% client-side** — OpenSCAD runs in a Web Worker via WebAssembly
- **Auto-generated parameter UI** — Sliders, dropdowns, toggles, and text inputs based on Customizer annotations
- **Real-time 3D preview** — Interactive Three.js preview with orbit controls
- **Multiple output formats** — STL, OBJ, OFF, AMF, 3MF export
- **Auto-preview** — Model updates automatically as you adjust parameters

### Organization and Workflow

- **Presets** — Save, load, import, and export parameter configurations
- **Parameter groups** — Collapsible sections organize related controls
- **URL parameters** — Share configurations via link
- **Undo/Redo** — Full history of parameter changes
- **Comparison view** — Compare up to 4 parameter variants side-by-side

### Advanced Features

- **ZIP multi-file support** — Upload projects with `include` / `use` statements
- **Library bundles** — MCAD, BOSL2, NopSCADlib, and dotSCAD included with auto-detection
- **Dimension measurements** — View bounding box and volume
- **Override limits** — Unlock parameters to exceed defined ranges
- **Focus mode** — Maximize the preview area

### Offline and Performance

- **Progressive Web App** — Install and use offline
- **Automatic updates** — Service worker updates in the background
- **Memory monitoring** — Warnings when approaching WASM memory limits
- **Lazy loading** — Three.js loads on demand to reduce initial bundle size

For detailed release history, see [CHANGELOG.md](CHANGELOG.md).

---

## Supported Inputs

### Customizer-enabled `.scad`

Your `.scad` should include **OpenSCAD Customizer annotations**, for example:

```scad
/*[Dimensions]*/
width = 50;       // [10:100]
height = 30;      // [10:80]
shape = "round";  // [round, square, hexagon]

/*[Options]*/
hollow = "yes";        // [yes, no]
wall_thickness = 2;    // [1:0.5:5]

/*[Hidden]*/
$fn = 100;
```

For detailed annotation syntax, see:
- [Parameter Schema Spec](docs/specs/PARAMETER_SCHEMA_SPEC.md) — JSON Schema format used by the toolchain

### `.zip` Multi-file Projects

Upload `.zip` files containing multiple `.scad` files with `include` / `use`:

```
my-project.zip
├── main.scad
├── utils/
│   └── helpers.scad
└── modules/
    └── parts.scad
```

---

## CLI (Developer Toolchain)

This repo includes `openscad-forge`, a CLI for extracting parameters and scaffolding standalone customizers.

```bash
# Install globally from GitHub
npm install -g git+https://github.com/BrennenJohnston/openscad-assistive-forge.git

# Or from a local clone
npm install -g .

openscad-forge --help
```

### Key Commands

| Command | Description |
|---------|-------------|
| `openscad-forge extract <file>` | Extract Customizer params into JSON Schema (or YAML) |
| `openscad-forge scaffold` | Generate a deployable web app from a schema + `.scad` |
| `openscad-forge validate <webapp>` | Check schema/UI expectations (template-aware) |
| `openscad-forge sync <webapp>` | Apply safe consistency fixes |
| `openscad-forge theme` | Generate custom color themes |
| `openscad-forge ci` | Generate CI/CD configurations |

### Scaffold Templates

Generate standalone customizer apps using:

- `vanilla` — Plain JavaScript (no framework)
- `react` — React with component architecture
- `vue` — Vue 3 with Composition API
- `svelte` — Svelte with reactive programming
- `angular` — Angular with TypeScript
- `preact` — Preact for smaller bundle size

---

## Development

### Prerequisites

- Node.js **18+**

### Common Commands

```bash
# Development server
npm run dev

# Production build
npm run build
npm run preview

# Code quality
npm run lint
npm run format

# Testing
npm run test          # Unit tests (watch mode)
npm run test:run      # Unit tests (single run)
npm run test:coverage # With coverage report
npm run test:e2e      # End-to-end tests
```

### Asset Setup (Optional)

If you need to (re)download OpenSCAD WASM assets or set up bundled libraries:

```bash
npm run setup-wasm
npm run setup-libraries
```

### Contributing

We welcome contributions! Please follow our development workflow:

**Branch Structure:**
- `main` - Production releases (protected)
- `develop` - Active development (base for feature branches)
- `feat/*` - Feature branches
- `fix/*` - Bug fix branches

**Quick Start:**

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/openscad-assistive-forge.git
cd openscad-assistive-forge

# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name

# Make changes, commit using conventional commits
git add .
git commit -m "feat: add your feature"

# Push and create PR to develop
git push -u origin feat/your-feature-name
```

**Documentation:**
- 📖 [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) - Complete branching strategy and release process
- 📋 [Contributing Guidelines](CONTRIBUTING.md) - Code style, accessibility checklist, and UI standards
- 🔒 [Branch Protection Setup](.github/BRANCH_PROTECTION.md) - Recommended GitHub settings

### Windows Note (Playwright)

On Windows, use the provided wrapper for E2E tests to avoid terminal hangs:
- See [Troubleshooting](docs/TROUBLESHOOTING.md#playwright-terminal-hangs-windows)

---

## Deployment

**Cloudflare Pages** is the recommended hosting platform (free tier with unlimited bandwidth):

- [Cloudflare Pages Deployment Guide](docs/guides/CLOUDFLARE_PAGES_DEPLOYMENT.md)

Alternative platforms:
- [Vercel Deployment Guide](docs/guides/DEPLOYMENT_GUIDE.md)
- [PWA Deployment Guide](docs/guides/PWA_DEPLOYMENT_GUIDE.md)

---

## Documentation

### Getting Started

- [Documentation Index](docs/README.md)
- [Build Plan / Architecture](docs/BUILD_PLAN_NEW.md)
- [Testing Instructions](TESTING_INSTRUCTIONS.md)
- [Test Report](TEST_REPORT.md)

### Accessibility Guides

- **[Accessibility Guide](docs/guides/ACCESSIBILITY_GUIDE.md)** — Comprehensive guide for users with disabilities, including screen reader users, low vision users, keyboard-only navigation, and voice input users
- **[AAC Keyguard Workflow Guide](docs/guides/KEYGUARD_WORKFLOW_GUIDE.md)** — Step-by-step instructions for clinicians and caregivers customizing assistive communication devices

### Technical Guides

- [Parameter Schema Specification](docs/specs/PARAMETER_SCHEMA_SPEC.md)
- [UI Standards Guide](docs/guides/UI_STANDARDS.md)
- [Color System Guide](docs/guides/COLOR_SYSTEM_GUIDE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Examples

Example models are included in `public/examples/`:
- Universal Cuff (assistive device)
- Simple Box
- Parametric Cylinder
- Phone Stand
- Honeycomb Grid
- Cable Organizer
- Wall Hook
- And more

---

## Project Status

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current release status and roadmap.

**Current Status**: Production Ready (v4.0.0 Stable Release)

---

## Contributing

Contributions are welcome — especially those that improve accessibility, usability, and documentation.

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## Security

Please report security issues responsibly:

- [SECURITY.md](SECURITY.md)

---

## Support

- **Issue Tracker**: https://github.com/BrennenJohnston/openscad-assistive-forge/issues
- **Discussions**: https://github.com/BrennenJohnston/openscad-assistive-forge/discussions

---

## Changelog

Release notes and version history:

- [CHANGELOG.md](CHANGELOG.md)
- [Version Changelogs](docs/changelogs/)

---

## License

- **Project License**: GPL-3.0-or-later (see [LICENSE](LICENSE))
- **Author**: [Brennen Johnston](https://github.com/BrennenJohnston) (see [AUTHORS](AUTHORS))
- **Third-Party Notices**: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

---

## Acknowledgments

Built on:

- [OpenSCAD](https://openscad.org/) (GPL-2.0+) — The parametric CAD engine
- [openscad-wasm-prebuilt](https://www.npmjs.com/package/openscad-wasm-prebuilt) — WebAssembly build
- [Three.js](https://threejs.org/) (MIT) — 3D rendering
- [Vite](https://vitejs.dev/) (MIT) — Build tooling
- [JSZip](https://stuk.github.io/jszip/) (MIT) — ZIP file handling
- [Radix Colors](https://www.radix-ui.com/colors) (MIT) — Accessible color system
- [Split.js](https://split.js.org/) (MIT) — Resizable panels

---

<p align="center">
  <strong>Built for accessibility. Open source forever.</strong>
</p>
