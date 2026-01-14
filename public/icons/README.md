# PWA Icons

This directory should contain app icons in various sizes for Progressive Web App support.

## Required Icons

The following icon sizes are needed:

- `icon-16x16.png` - Favicon
- `icon-32x32.png` - Favicon
- `icon-72x72.png` - iOS/Android
- `icon-96x96.png` - Android
- `icon-128x128.png` - Android/Chrome
- `icon-144x144.png` - Windows tile
- `icon-152x152.png` - iOS
- `icon-192x192.png` - Android/Chrome (standard)
- `icon-384x384.png` - Android splash screen
- `icon-512x512.png` - Android/Chrome (high-res)

## Icon Design Guidelines

- **Background**: Use the app's primary color (#0066cc) or white
- **Logo**: Simple, recognizable OpenSCAD-related symbol
- **Format**: PNG with transparency where appropriate
- **Maskable**: Icons should work with Android's masked icon format (safe zone in center 80%)

## Generating Icons

You can use tools like:
- **Favicon.io**: https://favicon.io/
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **PWA Asset Generator**: `npx @pwa/asset-generator`

Example command:
```bash
npx @pwa/asset-generator logo.svg ./public/icons --icon-only --path-override /icons
```

## Temporary Placeholder

For development, you can create simple placeholder icons using ImageMagick:

```bash
# Create a simple colored square (requires ImageMagick)
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:#0066cc \
    -gravity center -pointsize $((size/3)) -fill white \
    -annotate +0+0 "OS" \
    public/icons/icon-${size}x${size}.png
done
```

Or use a single color PNG:
```bash
# Create solid color placeholders
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:#0066cc \
    public/icons/icon-${size}x${size}.png
done
```

## Screenshots

The manifest also references screenshots in `/screenshots/`:
- `desktop.png` (1280x720) - Desktop view
- `mobile.png` (750x1334) - Mobile view

These can be captured from the running app using browser dev tools.
