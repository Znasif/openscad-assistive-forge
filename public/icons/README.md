# PWA Icons

This directory contains app icons for Progressive Web App support.

## Current Logo

The project uses the custom **OpenSCAD Assistive Web Forge Logo**:

- `logo.svg` - SVG version (scalable, used for favicons and PWA icons)
- `logo.png` - PNG version (used for Apple touch icons and Windows tiles)

The logo features the accessibility symbol overlaid on a 3D model sphere, representing the project's focus on making OpenSCAD accessible to all users.

## Icon Usage

| File | Used For |
|------|----------|
| `logo.svg` | Favicon, PWA icons (all sizes), shortcuts |
| `logo.png` | Apple touch icon, Windows tile, maskable icon |

## Generating Additional Sizes (Optional)

If specific PNG sizes are needed for certain platforms, you can generate them from the SVG:

```bash
# Using ImageMagick to create specific sizes from the logo
npx @pwa/asset-generator logo.svg ./public/icons --icon-only --path-override /icons
```

Or use online tools:
- **Favicon.io**: https://favicon.io/
- **RealFaviconGenerator**: https://realfavicongenerator.net/

## Screenshots

The manifest also references screenshots in `/screenshots/`:
- `desktop.png` (1280x720) - Desktop view
- `mobile.png` (750x1334) - Mobile view

These can be captured from the running app using browser dev tools.
