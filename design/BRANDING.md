# CheckAPI Branding Assets

All branding assets for CheckAPI.

## Logo

**Main Logo:** `logos/checkapi-logo.jpg`
- Green upward trend line in a square frame
- Represents growth, monitoring, and uptime
- Format: JPG (300x300)

## Favicons & App Icons

All generated from the main logo:

### Browser Favicons
- `favicon.ico` (32x32) - IE/Legacy browsers
- `favicon-16x16.png` - Small browser tab
- `favicon-32x32.png` - Standard browser tab
- `favicon-96x96.png` - High-DPI displays

### Mobile App Icons
- `apple-touch-icon.png` (180x180) - iOS Safari, PWA
- `android-chrome-192x192.png` - Android home screen
- `android-chrome-512x512.png` - Android splash screen

### PWA Manifest
- `frontend/public/site.webmanifest` - Progressive Web App config

## Logo Concepts

Alternative logo designs (SVG format):
- `logos/logo-concept-1-checkmark.svg` - Checkmark + Pulse
- `logos/logo-concept-2-shield.svg` - Shield + API Bracket
- `logos/logo-concept-3-minimal.svg` - Minimal Round Square
- `logos/logo-concept-4-modern.svg` - Modern Gradient
- `logos/logo-concept-5-heartbeat.svg` - Heartbeat Monitor
- `logos/logo-concept-6-simple.svg` - Simple Wordmark

Preview: `logos/preview.html`

## Color Palette

```css
Primary Green:    #10B981
Success Green:    #10B981
Primary Blue:     #3B82F6
Purple:           #8B5CF6
Indigo:           #6366F1
Dark:             #1F2937
Gray:             #6B7280
Background:       #FFFFFF
```

## Screenshots

Product screenshots for marketing:
- `screenshots/01-dashboard-empty.png`
- `screenshots/02-landing-page.png`
- `screenshots/03-monitor-detail.png`
- `screenshots/04-analytics.png`
- `screenshots/05-alert-channels.png`

## SEO & Meta

Configured in `frontend/app/layout.tsx`:
- **Title:** CheckAPI - API Health Monitor | 24/7 Uptime Tracking
- **Description:** Monitor your APIs and websites with real-time alerts
- **Keywords:** API monitoring, uptime monitoring, website monitoring
- **Open Graph:** Configured for social sharing
- **Twitter Card:** summary_large_image

## Usage Guidelines

### Logo
- Maintain aspect ratio (square)
- Minimum size: 32x32px
- Don't distort or rotate
- Use on white or light backgrounds

### Colors
- Primary: Green (#10B981) for success, uptime
- Use consistently across all platforms
- Maintain contrast for accessibility

### Typography
- Primary: Inter (via Google Fonts)
- Headings: Bold (700)
- Body: Regular (400)

## Regenerating Favicons

If logo changes:
```bash
cd design/logos
npm install
node generate-favicons.js
```

This will regenerate all favicon sizes automatically.

## Files Inventory

```
design/
├── logos/
│   ├── checkapi-logo.jpg           (Main logo - original)
│   ├── logo-concept-*.svg          (Alternative concepts)
│   ├── preview.html                (Logo preview page)
│   ├── generate-favicons.js        (Favicon generator script)
│   └── README.md                   (Logo documentation)
├── screenshots/
│   ├── *.png                       (Product screenshots)
│   └── README.md                   (Screenshot documentation)
└── BRANDING.md                     (This file)

frontend/public/
├── logo.jpg                        (Main logo - public)
├── favicon.ico
├── favicon-*.png
├── apple-touch-icon.png
├── android-chrome-*.png
└── site.webmanifest
```

## Quick Reference

- **Logo:** Green trend chart in square
- **Primary Color:** #10B981 (Green)
- **Font:** Inter
- **Tagline:** "Monitor Your APIs 24/7 Uptime Tracking"
- **Domain:** checkapi.io
