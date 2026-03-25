# Technology Stack

**Project:** YTH WKND 2026 — Camp Registration Site Refresh
**Researched:** 2026-03-25

## Current Stack (Baseline)

| Technology | Current Version | Status |
|------------|----------------|--------|
| Next.js | 15.3.1 | Two major versions behind (16.2.1 is latest) |
| React | 19.0.x | Needs bump to 19.2 (ships with Next.js 16) |
| Framer Motion | 12.10.0 | Package renamed to `motion`; v12.37+ is latest |
| Tailwind CSS | v4 | Current major; already using CSS-first config |
| Supabase JS | 2.49.4 | Current; no action needed |
| TypeScript | 5.x | Current; meets Next.js 16 minimum (5.1+) |

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 16.2.1 | App framework | Latest stable. Turbopack default (400% faster dev startup, 50% faster rendering). React 19.2 with View Transitions. Codemod available for automated migration. | HIGH |
| React | 19.2.x | UI library | Ships with Next.js 16. Adds View Transitions API, `useEffectEvent`, Activity component. React Compiler stable support. | HIGH |
| TypeScript | ~5.7 | Type safety | Already meets Next.js 16 minimum. `next typegen` generates PageProps/LayoutProps helpers for async params. | HIGH |

### Animation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| motion | ^12.37.0 | Animation library | Renamed from `framer-motion`. Same API, import path changes to `motion/react`. No breaking changes in v12. Smaller bundle, OKLCH color support, hardware-accelerated scroll animations. | HIGH |

**Migration from framer-motion to motion:**
```bash
npm uninstall framer-motion
npm install motion
```
Then update all imports:
```typescript
// Before
import { motion, AnimatePresence } from "framer-motion"

// After
import { motion, AnimatePresence } from "motion/react"
```
No other API changes required -- the React API surface is identical.

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4 | Utility CSS | Already on v4 with CSS-first `@theme` config. OKLCH color system in place. Brand refresh = update CSS variables only. | HIGH |
| tw-animate-css | ^1.2.8 | Animation utilities | Already in use. Provides Tailwind-compatible CSS animation classes. | HIGH |
| tailwind-merge | ^3.2.0 | Class merging | Already in use. No change needed. | HIGH |

### UI Components

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Radix UI | latest | Accessible primitives | Already using Dialog, Label, RadioGroup, Select, Slot, Tooltip. Keep current. | HIGH |
| lucide-react | ^0.503.0 | Icons | Already in use. No change needed. | HIGH |
| sonner | ^2.0.3 | Toast notifications | Already in use. No change needed. | HIGH |
| class-variance-authority | ^0.7.1 | Component variants | Already in use. No change needed. | HIGH |

### Forms & Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-hook-form | ^7.56.1 | Form state management | Already in use. Works with React 19. | HIGH |
| @hookform/resolvers | ^5.0.1 | Schema validation bridge | Already in use. No change needed. | HIGH |
| zod | ^3.24.3 | Schema validation | Already in use. No change needed. | HIGH |

### Backend & Data

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @supabase/supabase-js | ^2.49.4 | Database client | Already in use. No change needed. | HIGH |
| googleapis | ^148.0.0 | Google Sheets sync | Already in use. No change needed. | HIGH |

### Dev Dependencies

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @tailwindcss/postcss | ^4 | PostCSS plugin | Already in use. No change needed. | HIGH |
| babel-plugin-react-compiler | latest | React Compiler | NEW. Optional but recommended. Auto-memoizes components, zero manual code changes. Stable in Next.js 16. | MEDIUM |

## Upgrade Path: Next.js 15.3.1 to 16.2.1

### Automated (Recommended)

```bash
npx @next/codemod@canary upgrade latest
```

The codemod handles:
- Updating `next.config.ts` for new Turbopack config location
- Migrating `next lint` to ESLint CLI (if used)
- Removing `unstable_` prefix from stabilized APIs
- Renaming `middleware.ts` to `proxy.ts` (not applicable -- no middleware in this project)

### Manual Steps After Codemod

1. **Update package.json scripts** -- Remove `--turbopack` flag (now default):
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     }
   }
   ```

2. **Replace `images.domains` with `images.remotePatterns`** -- `domains` is deprecated in v16:
   ```typescript
   // Before (next.config.ts)
   images: {
     domains: ['ythwknd.ymfgakl.com'],
   }

   // After
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'ythwknd.ymfgakl.com',
       },
     ],
   }
   ```

3. **Update `imageSizes`** -- v16 removes `16` from default array. The current config explicitly sets `imageSizes` including `16`, so keep that if 16px images are needed, or remove it.

4. **Async Request APIs** -- v16 fully removes synchronous access to `cookies()`, `headers()`, `params`, `searchParams`. Since the site is mostly client-rendered with `"use client"`, this likely has minimal impact. Check any Server Components or route handlers that access these.

5. **`next lint` removed** -- The `lint` script uses `next lint`. Replace with direct ESLint:
   ```json
   {
     "scripts": {
       "lint": "eslint . --ext .ts,.tsx"
     }
   }
   ```
   Or run the codemod: `npx @next/codemod@canary next-lint-to-eslint-cli .`

### Breaking Changes Relevant to This Project

| Change | Impact | Action |
|--------|--------|--------|
| `images.domains` deprecated | Current config uses `domains` | Switch to `remotePatterns` |
| `imageSizes` default removes `16` | Config explicitly sets sizes | Review if 16px needed |
| `next lint` removed | `lint` script uses it | Migrate to ESLint CLI |
| Turbopack default for build | Already using `--turbopack` for dev | Remove flag, verify build works |
| Async Request APIs enforced | Depends on server-side code | Audit route handlers and server components |
| ESLint Flat Config default | May need eslint config update | Check eslint setup |

### Breaking Changes NOT Relevant

| Change | Why Not Applicable |
|--------|-------------------|
| `middleware` renamed to `proxy` | No middleware file exists |
| AMP removal | Not using AMP |
| `serverRuntimeConfig`/`publicRuntimeConfig` removed | Not using runtime config |
| Parallel routes `default.js` required | Check if using parallel routes; likely not |

## New Capabilities Worth Adopting

### React Compiler (Recommended)

Auto-memoizes components. Zero code changes needed. Enable in `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,
}
```
Install: `npm install -D babel-plugin-react-compiler`

Especially valuable for this project since pages are heavily client-rendered with Framer Motion animations -- automatic memoization prevents unnecessary re-renders during animations.

### View Transitions (Consider for Brand Refresh)

React 19.2 View Transitions + Next.js 16.2 `transitionTypes` prop on `<Link>`. Could add polished page transition effects between registration steps with minimal code:
```tsx
<Link href="/register" transitionTypes={['slide']}>
  Register Now
</Link>
```
This is native browser API, not a library -- lighter than JS-only animation approaches.

### Turbopack FS Cache (Development Speed)

Enable for faster dev restarts:
```typescript
const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
}
```

## Animation Polish Techniques (Motion v12)

### Performance-First Principles
- **Animate only `transform` and `opacity`** -- these are compositor-thread properties, guaranteed 60fps
- **Avoid animating `width`, `height`, `top`, `left`** -- triggers layout recalculation
- **Use `layout` prop** for layout animations instead of explicit position changes
- **Use `layoutId`** for shared element transitions (e.g., hero card selection)

### Spring-Based Transitions
Springs feel more natural than duration-based easing. Use for interactive elements:
```typescript
const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}
```

### Staggered Children with Variants
For lists (team grids, hero selection):
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}
```

### Accessibility
Use `useReducedMotion()` hook to respect OS-level motion preferences:
```typescript
import { useReducedMotion } from "motion/react"

const shouldReduce = useReducedMotion()
const transition = shouldReduce ? { duration: 0 } : springTransition
```

### Exit Animations
Wrap conditionally rendered content in `<AnimatePresence>` with unique `key` props. Use `mode="wait"` for sequential enter/exit (registration step transitions).

## Brand Theming Approach (Tailwind v4)

The project already uses the ideal Tailwind v4 theming pattern: CSS custom properties in `:root` mapped to `@theme inline` tokens. For the brand refresh:

### What to Change
1. **Update `:root` CSS variables** in `globals.css` with new brand OKLCH colors
2. **Update `.dark` variables** if dark mode is relevant
3. **Add brand-specific custom properties** if new colors beyond the shadcn/ui semantic set are needed

### What NOT to Change
- The `@theme inline` block structure -- it correctly maps CSS vars to Tailwind utilities
- The existing semantic color names (`--primary`, `--secondary`, etc.) -- these are used throughout components
- Component markup -- changing CSS variables automatically propagates everywhere

### Adding Brand Colors
```css
:root {
  /* Update existing semantic colors */
  --primary: oklch(0.55 0.22 265);        /* New brand primary */
  --primary-foreground: oklch(0.98 0 0);

  /* Add brand-specific colors if needed */
  --brand-hero-red: oklch(0.55 0.24 25);
  --brand-hero-blue: oklch(0.50 0.20 250);
}

@theme inline {
  --color-brand-hero-red: var(--brand-hero-red);
  --color-brand-hero-blue: var(--brand-hero-blue);
}
```

### Custom Font
The project already has a custom font (`Rumble Brave`) correctly set up with `@font-face` and Tailwind theme integration (`--font-rumble`). For the 2026 refresh, follow the same pattern for any new brand fonts.

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| framer-motion (package name) | Renamed to `motion`. Old package still works but is maintenance-only. Switch now. |
| CSS Modules for theming | Tailwind v4 CSS variables are already the correct approach. CSS Modules add unnecessary complexity. |
| styled-components / Emotion | Wrong paradigm for this Tailwind-based project. |
| next-intl / i18n libraries | Out of scope -- single-language site. |
| Prisma / Drizzle | Out of scope -- Supabase client is the data layer. |
| React Query / SWR | Current Supabase integration works. Adding a caching layer adds complexity for a registration site with tight deadlines. |
| @next/font | Deprecated. Use `next/font` (already available). |
| Tailwind v4 JS config | Project correctly uses CSS-first config. Do not add `tailwind.config.ts`. |

## Installation

```bash
# Upgrade Next.js + React (via codemod)
npx @next/codemod@canary upgrade latest

# Replace framer-motion with motion
npm uninstall framer-motion
npm install motion

# Optional: React Compiler
npm install -D babel-plugin-react-compiler

# Verify
npm run build
```

## Sources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- HIGH confidence, official docs
- [Next.js 16.2 Blog Post](https://nextjs.org/blog/next-16-2) -- HIGH confidence, official blog
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) -- HIGH confidence, official docs
- [motion on npm](https://www.npmjs.com/package/framer-motion) -- HIGH confidence, v12.38.0 latest
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- HIGH confidence, official docs
- [Next.js GitHub Releases](https://github.com/vercel/next.js/releases) -- HIGH confidence, official source
