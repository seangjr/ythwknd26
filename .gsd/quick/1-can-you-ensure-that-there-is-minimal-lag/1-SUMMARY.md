# Quick Task: Can you ensure that there is minimal lag for all users?

**Date:** 2026-04-02
**Branch:** gsd/quick/1-can-you-ensure-that-there-is-minimal-lag

## What Changed

### Image Optimization (biggest impact — 36MB → 2.9MB)
- Extracted base64-encoded PNGs from bloated SVG wrappers in `icons-alt/`, `card-bg/`, `icons/`
- Resized from 1536×1024 to actual display sizes (240×240 for icons, 800px for card backgrounds)
- Switched all references from `.svg` to `.png` (Next.js Image auto-serves WebP)
- Replaced raw `<img>` tags in `character-selection-screen.tsx` with `next/image` for automatic format/size optimization

### Network Optimization
- Parallelized API fetches with `Promise.all` (team-members + hero-availability loaded simultaneously instead of sequentially)
- Added `Cache-Control: s-maxage=10, stale-while-revalidate=30` headers to API routes
- Added 1-year immutable cache headers for all static assets (images, video, audio) via `next.config.ts`
- Removed external CDN dependency (`assets.codepen.io/sparkles.gif`) — replaced with CSS-only shimmer animation

### Render Performance
- Reduced animation stagger delays from ~6 seconds total to ~2 seconds (100 cards were waiting up to 6s to appear)
- Added `contain: layout style paint` and `will-change: transform` to HoloCard for GPU-accelerated compositing
- Added `transform: translateZ(0)` to holo pseudo-elements to force compositor layers

### Resource Loading
- Deferred background music preload (`none` instead of `auto`) — 6.6MB audio no longer blocks initial load
- Deferred background video preload (`none` for `bg.mp4`)
- Added `preload="metadata"` to landing page video for faster first frame
- Added `priority` to landing page masthead `<Image>` for faster LCP

## Files Modified
- `next.config.ts` — static asset cache headers
- `src/lib/constants.ts` — icon paths .svg → .png
- `src/app/(everywhere-else)/register/page.tsx` — parallel fetches, reduced animation delays, PNG paths
- `src/app/(landing)/page.tsx` — priority image, video preload
- `src/app/api/team-members/route.ts` — cache headers
- `src/app/api/hero-availability/route.ts` — cache headers
- `src/components/ui/holo-card.css` — GPU compositing, CSS-only sparkles
- `src/components/video-background.tsx` — deferred video preload
- `src/components/background-music.tsx` — deferred audio preload
- `src/components/character-selection-screen.tsx` — next/image instead of raw img
- `public/icons-alt/*.png` — new optimized images (108KB each, down from 2.7MB SVGs)
- `public/card-bg/*.png` — new optimized images (372KB each, down from 1.8MB SVGs)
- `public/icons/*.png` — new optimized images (100KB each, down from 2.7MB SVGs)

## Verification
- `npx tsc --noEmit` — zero type errors
- `npm run build` — clean production build, all routes compile
- `npm run lint` — no new lint errors introduced (all 63 issues are pre-existing)
- Image size reduction verified: 36MB total → 2.9MB total (92% reduction)
