# Project Research Summary

**Project:** YTH WKND 2026 -- Camp Registration Site Refresh
**Domain:** Youth camp/event registration website (brand refresh)
**Researched:** 2026-03-25
**Confidence:** HIGH

## Executive Summary

This is a brand refresh of an existing, working camp registration site -- not a greenfield build. The registration mechanism (hero selection, team-based registration with 21 teams x 5 heroes = 105 slots, invite system) is proven and unchanged. The scope is: upgrade the framework stack (Next.js 15 to 16, framer-motion to motion), apply new 2026 brand identity (fonts, colors, imagery), update all copy/dates, and add animation polish. Experts build this type of refresh by establishing the theming foundation first, then layering visual improvements on top of stable infrastructure.

The recommended approach is a strict phase ordering: fix pre-existing bugs and upgrade dependencies first, then systematically replace 89 hardcoded color values with semantic CSS tokens, then build reusable animation primitives, then update content. This ordering prevents the most common pitfall in brand refreshes -- doing visual work on an unstable foundation and having to redo it after structural changes. The Next.js 15-to-16 upgrade is the highest-risk task because it enforces async request APIs and removes deprecated config options, but an official codemod handles most of the migration automatically.

The key risks are: (1) the 89 hardcoded color values scattered across 13 files that make brand changes error-prone, (2) dual root layouts that must be updated in lockstep or one route group shows stale branding, (3) the 1,771-line registration form that must NOT be refactored during the refresh (cosmetic changes only -- it has zero test coverage), and (4) a missing `nanoid` dependency that will break team invites on fresh deploy. All are addressable with disciplined execution order.

## Key Findings

### Recommended Stack

The existing stack is solid and needs version bumps, not replacements. The core upgrade path is Next.js 15.3.1 to 16.2.1 (Turbopack default, React 19.2, View Transitions), and `framer-motion` to `motion` (renamed package, identical API, import path changes only). Everything else -- Tailwind v4, Supabase, Radix UI, react-hook-form, zod -- stays as-is.

**Core upgrades:**
- **Next.js 16.2.1**: Turbopack default (400% faster dev startup), React Compiler support, View Transitions API. Official codemod available.
- **motion ^12.37.0**: Renamed from framer-motion. Same API, `motion/react` import path. Smaller bundle, OKLCH color support.
- **React Compiler** (new, optional): Auto-memoizes components with zero code changes. Especially valuable for animation-heavy client components.

**No changes needed:** Tailwind v4, Supabase JS, Radix UI, react-hook-form, zod, sonner, lucide-react, class-variance-authority.

### Expected Features

**Must have (table stakes):**
- Updated dates, copy, pricing for 2026 (stale info = site looks broken)
- New brand identity applied consistently across all surfaces (fonts, colors, hero images, masthead)
- Mobile-responsive registration flow verified with new brand assets
- Fast page load under 3 seconds (watch for unoptimized new brand assets)
- Clear registration CTA above the fold
- Working invite/share system with updated copy

**Should have (differentiators, low effort):**
- Staggered entrance animations on team grid (low effort, high visual impact)
- Animated form step transitions via AnimatePresence
- Hero card hover/tap micro-interactions upgrade (scale, glow, tilt)
- Loading skeleton states during data fetches
- Haptic-feeling button interactions (spring physics)
- Countdown timer digit flip animation

**Defer:**
- Dark mode ambient effects (medium complexity, mobile performance risk)
- Complex shared-element transitions (fragile, time-consuming)
- Auth, payments, admin dashboard, email notifications, i18n, PWA offline, SEO overhaul (all out of scope)

### Architecture Approach

The architecture improvement is threefold: push the client/server boundary down (landing page becomes a Server Component with client islands for interactivity), centralize theming through CSS custom properties instead of 89 hardcoded hex values, and formalize animation patterns into reusable variant objects and wrapper components. The registration page and invite page stay as client components -- converting them to RSC has negative ROI given their extensive interactive state.

**Major components:**
1. **Server Components** (landing page, layouts, navbar, footer) -- zero JS shipped for static content
2. **Client Islands** (CountdownSection, AnimatedHero, Registration page, RegistrationModal, MultiStepRegistrationForm) -- interactive, animated
3. **Motion Wrappers** (MotionDiv, FadeIn, StaggerContainer) -- thin `"use client"` wrappers enabling animation in Server Component trees
4. **API Routes** (register, sheets-sync, team-invite, hero-availability) -- unchanged, server-only
5. **Theming Layer** (globals.css with `@theme` tokens) -- single source of truth for all brand colors

### Critical Pitfalls

1. **89 hardcoded color values across 13 files** -- Grep for `[#` patterns and systematically replace with semantic theme tokens before any component work. Missing even one creates old/new color patchwork.
2. **Dual root layouts** -- Both `(landing)/layout.tsx` and `(everywhere-else)/layout.tsx` must receive identical font, metadata, and styling changes. Forgetting one is the most common brand refresh bug.
3. **Next.js 16 async API enforcement** -- All `cookies()`, `headers()`, `params`, `searchParams` calls must be awaited. The invite page `[code]/page.tsx` is highest risk. Run the codemod first.
4. **Font metrics mismatch** -- If the new brand font differs from Rumble Brave in metrics, all 30+ `font-rumble` usages will shift layout. Test font swap in isolation before applying globally.
5. **Missing `nanoid` dependency** -- Not in package.json but imported in team-invite route. Fix immediately or replace with `crypto.randomUUID()`.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Setup and Upgrade
**Rationale:** Infrastructure must be stable before any visual work. Pre-existing bugs and deprecated APIs will cause cascading failures if not addressed first.
**Delivers:** Working codebase on Next.js 16.2.1 with `motion` package, all pre-existing bugs fixed.
**Addresses:** Framework upgrade, framer-motion to motion migration, nanoid fix, images.domains deprecation fix.
**Avoids:** Pitfall 3 (async API breakage), Pitfall 5 (split framer-motion/motion imports), Pitfall 8 (missing nanoid), Pitfall 10 (deprecated images.domains).

### Phase 2: Theming Foundation
**Rationale:** Every subsequent phase touches component markup. Establishing semantic tokens first means all new code uses correct tokens from the start, avoiding double-refactoring.
**Delivers:** All 89 hardcoded colors replaced with CSS custom property tokens. Both layouts updated. Brand colors, fonts, and team colors defined in `globals.css`.
**Addresses:** Table stakes (consistent brand identity), date/copy consolidation.
**Avoids:** Pitfall 1 (hardcoded colors), Pitfall 2 (dual layouts), Pitfall 4 (font metrics), Pitfall 7 (scattered date values), Pitfall 9 (team color classes).

### Phase 3: Animation Architecture
**Rationale:** Reusable motion primitives must exist before the polish phase can use them efficiently. Also enables RSC conversion of the landing page.
**Delivers:** Motion wrapper components (`MotionDiv`, `FadeIn`, `StaggerContainer`), shared variant definitions in `animations.ts`, refactored inline animation props.
**Addresses:** Differentiators (staggered animations, form transitions, micro-interactions).
**Avoids:** Anti-pattern of inline animation props everywhere, Pitfall 6 (AnimatePresence + React 19 strict mode).

### Phase 4: Landing Page RSC Conversion
**Rationale:** Depends on motion wrappers from Phase 3. Converts landing page from monolithic client component to server-rendered HTML with client islands for interactivity.
**Delivers:** Faster FCP on landing page, server-side date check, reduced JS bundle.
**Addresses:** Architecture improvement (client/server boundary), performance.
**Avoids:** Anti-pattern of `"use client"` at page level for animation.

### Phase 5: Content Update and Polish
**Rationale:** Content changes are the most visible and should land on a stable, themed, animated foundation. This phase is pure content swap plus animation polish.
**Delivers:** 2026 heroes, teams, dates, pricing, imagery. Animation polish on countdown timer, team grid, form steps, hero cards, buttons. Registration success celebration.
**Addresses:** All remaining table stakes (dates, copy, pricing) and differentiators (digit flip, scroll reveals, skeleton states).
**Avoids:** Pitfall 11 (registration form refactor trap -- cosmetic changes only).

### Phase 6: Verification and Deploy
**Rationale:** The registration form has zero test coverage. Manual QA across all flows is mandatory before deploy.
**Delivers:** Verified working site across all registration paths (YM member, non-YM, invite flow, all 21 teams).
**Addresses:** Cross-browser testing, mobile verification, Google Sheets sync verification.
**Avoids:** Pitfall 12 (silent Sheets failure), Pitfall 13 (oklch cross-browser rendering).

### Phase Ordering Rationale

- Upgrade before theming because Next.js 16 changes config format and enforces async APIs -- doing it after theming risks breaking work already done.
- Theming before animation because animation components need correct brand tokens to implement glow effects, team-colored interactions, etc.
- Animation architecture before RSC conversion because the landing page needs motion wrappers to stay animated after removing `"use client"`.
- Content last because it is the most merge-conflict-prone work and should not compete with structural changes.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Upgrade):** The Next.js 15-to-16 async API migration needs careful auditing of all route handlers and dynamic pages. The codemod helps but may miss edge cases.
- **Phase 4 (RSC Conversion):** The landing page conversion needs validation that the CountdownSection client island pattern works correctly with the existing time-gating logic.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Theming):** Well-documented Tailwind v4 `@theme` pattern, already partially in use.
- **Phase 3 (Animation):** Motion wrapper pattern is documented by both the Motion library and Next.js teams.
- **Phase 5 (Content):** Pure content swap in constants and public assets.
- **Phase 6 (Verification):** Manual QA checklist, no research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations based on official docs (Next.js 16 upgrade guide, Motion migration guide). Existing stack is well-chosen. |
| Features | HIGH | Feature priorities grounded in existing codebase analysis and event registration best practices. Scope is well-bounded. |
| Architecture | HIGH | RSC + client island pattern is standard Next.js App Router. Motion wrapper pattern is documented. No exotic approaches. |
| Pitfalls | HIGH | Pitfalls identified from direct codebase analysis (89 hardcoded colors, dual layouts, missing nanoid) plus official breaking change docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **New brand assets not yet available:** The research assumes new brand fonts, colors, and hero images will be provided. If not ready, Phase 2 can define token infrastructure with placeholder values.
- **React Compiler adoption:** Recommended but marked MEDIUM confidence. Enable it and verify no regressions in animation-heavy components before committing to it.
- **View Transitions API:** Mentioned as a capability worth adopting, but actual implementation patterns for multi-step registration flow need validation during Phase 3.
- **Google Sheets credential validity:** Cannot be verified through code research. Must be confirmed operationally before deploy (Pitfall 12).

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- breaking changes, codemod, async API enforcement
- [Next.js 16.2 Blog Post](https://nextjs.org/blog/next-16-2) -- View Transitions, React Compiler, Turbopack
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) -- framer-motion to motion migration
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- `@theme` system, CSS custom properties
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) -- RSC boundary guidance

### Secondary (MEDIUM confidence)
- [Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) -- motion wrapper pattern
- [Advanced Animation Patterns with Framer Motion](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/) -- variants architecture
- [Bizzabo: Event Website Design Trends 2026](https://www.bizzabo.com/blog/beautiful-event-websites-design) -- feature expectations
- [KESQ: Camp Registration Key Features](https://kesq.com/stacker-money/2025/10/10/key-features-every-camp-or-program-should-offer-in-their-registration-experience/) -- table stakes validation

### Tertiary (LOW confidence)
- [oklch browser rendering differences](https://github.com/tailwindlabs/tailwindcss/discussions/16517) -- minor cross-browser variance, low impact

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*

# Architecture Patterns

**Domain:** Camp registration website refresh (Next.js 15 + React 19 + Framer Motion + Tailwind v4)
**Researched:** 2026-03-25

## Recommended Architecture

The refresh targets three architectural improvements without changing the registration mechanism:

1. **Push the client/server boundary down** -- move data fetching into Server Components, keep interactivity in thin Client Component islands
2. **Centralize theming through CSS custom properties** -- replace hardcoded hex values with semantic design tokens for easy brand swaps
3. **Formalize animation patterns** -- extract reusable motion variants and wrapper components instead of inline animation props everywhere

### Current State vs. Target

| Concern | Current | Target |
|---------|---------|--------|
| Page rendering | All pages `"use client"` | Landing + layouts as RSC; register/invite stay client |
| Data fetching | Client-side `useEffect` + Supabase | Server Component async fetch where possible; client fetch only for mutations and real-time |
| Theming | Hardcoded hex (`#BABABA`, `#1A1A1A`) + inline Tailwind | CSS variables via `@theme` + semantic token classes |
| Animations | Inline `initial/animate/transition` props on every element | Shared variant objects + `<Motion*>` wrapper components |
| Supabase client | Single singleton using `NEXT_PUBLIC_` anon key everywhere | Server client for RSC data fetching; browser client for mutations only |

---

## Component Boundaries

### Layer 1: Server Components (zero JS to client)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `(landing)/page.tsx` | Renders landing page HTML with event info, pricing, images | Layout (parent), `CountdownSection` (client child), `HeroSection` (static) |
| `(landing)/layout.tsx` | Root layout with metadata, fonts, analytics | `Footer` (server), page (child) |
| `(everywhere-else)/layout.tsx` | Root layout with Navbar, Footer, TimeRestriction, Toasts | `Navbar` (server), `Footer` (server), `TimeRestriction` (client child), page (child) |
| `Navbar` | Static navigation with logo link | None (pure presentational) |
| `Footer` | Static footer with social links | None (pure presentational) |

**Key insight:** The landing page is currently `"use client"` only because it uses `framer-motion` and a time check. The time check can move to the server (check date at render time), and animations can be isolated into client child components. The landing page itself -- hero image, event details, pricing cards -- is static content that benefits from server rendering (faster FCP, SEO).

### Layer 2: Client Islands (interactive, animated)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `CountdownSection` | Countdown timer + register CTA (needs `useState`/`useEffect` for timer) | Parent landing page via props |
| `AnimatedHero` | Landing hero section with entrance animation | Wraps static content with `motion.section` |
| `Registration` page | Team grid, hero selection, modal orchestration, real-time availability | Supabase (client reads), API routes (mutations), `RegistrationModal`, `TeamInviteModal` |
| `Invite/[code]` page | Single-team invite flow | API routes (validate invite), `RegistrationModal` |
| `RegistrationModal` | Two-phase flow: character selection then form | `CharacterSelectionScreen`, `MultiStepRegistrationForm`, API routes |
| `MultiStepRegistrationForm` | Multi-step form with validation | API routes (`/api/register`, `/api/sheets-sync`) |
| `TeamDrawer` | Team info panel | Parent component via props |
| `TeamInviteModal` | Invite link generation | API routes (`/api/team-invite`) |

**Key insight:** The register page and invite page MUST remain client components. They have extensive interactive state (hero selection, modal orchestration, form state, optimistic updates). The cost of `"use client"` here is acceptable because these pages are behind user navigation -- they are not landing pages that need fast FCP/SEO.

### Layer 3: Motion Wrappers (client, reusable)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `MotionDiv` | Reusable `motion.div` wrapper for Server Component contexts | Parent (accepts `HTMLMotionProps<"div">`) |
| `MotionSection` | Reusable `motion.section` wrapper | Parent (accepts `HTMLMotionProps<"section">`) |
| `FadeIn` | Opinionated wrapper: fade + slide up entrance | Children (wraps any content) |
| `StaggerContainer` | Parent container that staggers child animations | `FadeIn` or `MotionDiv` children |

### Layer 4: API Routes (server-only, unchanged)

| Route | Responsibility | Communicates With |
|-------|---------------|-------------------|
| `/api/register` | Registration mutation | Supabase, called by `RegistrationModal` |
| `/api/sheets-sync` | Google Sheets backup | Google Sheets API, called by `RegistrationModal` |
| `/api/team-invite` | Invite CRUD | Supabase, called by `TeamInviteModal` |
| `/api/team-invite/check` | Invite validation | Supabase, called by invite page |
| `/api/hero-availability` | Availability CRUD | Supabase, called by register page |
| `/api/team-members` | Team member list | Supabase, called by team components |
| `/api/health-check` | DB connectivity test | Supabase, called by `useDatabaseConnection` |

**No changes needed to API routes.** They are already server-only Route Handlers.

### Layer 5: Theming Layer (CSS, no runtime)

| File | Responsibility | Communicates With |
|------|---------------|-------------------|
| `globals.css` | Design tokens via `@theme` + `:root` variables | All components via Tailwind utility classes |
| `fonts.css` | Font-face declarations | `globals.css` (imported) |

---

## Data Flow

### Landing Page (Target: Server-Rendered)

```
Browser request
    |
    v
(landing)/layout.tsx [SERVER]
    |-- metadata, fonts, OG tags rendered server-side
    |
    v
(landing)/page.tsx [SERVER]
    |-- Check registration date server-side (new Date() >= targetDate)
    |-- Render static content: hero image, event details, pricing
    |-- Pass `isRegistrationOpen` as prop to client child
    |
    +---> <CountdownSection isOpen={isRegistrationOpen} /> [CLIENT]
    |        |-- If not open: render countdown timer (useEffect interval)
    |        |-- If open: render "Register Now" button
    |
    +---> <AnimatedHero /> [CLIENT]
             |-- motion.section with entrance animation
             |-- Wraps the hero image + masthead
```

### Registration Page (Stays Client-Rendered)

```
Browser navigates to /register
    |
    v
(everywhere-else)/layout.tsx [SERVER]
    |-- Navbar, Footer rendered server-side
    |-- TimeRestriction wraps children (client)
    |
    v
register/page.tsx [CLIENT - "use client"]
    |-- useEffect: fetch registrations + hero_availability from Supabase
    |-- Render 21 team sections with 5 hero tiles each
    |-- On hero click: open RegistrationModal
    |
    +---> RegistrationModal [CLIENT]
    |        |-- Step 1: CharacterSelectionScreen
    |        |-- Step 2: MultiStepRegistrationForm
    |        |-- On submit: POST /api/register
    |        |-- On success: POST /api/sheets-sync (fire-and-forget)
    |        |-- Update parent state optimistically
    |
    +---> TeamInviteModal [CLIENT]
             |-- POST /api/team-invite to generate code
             |-- Display shareable link
```

### Why Not RSC for Registration?

The registration page holds ~10 pieces of interactive state, performs client-side Supabase queries on mount, and orchestrates multiple modals with shared state. Converting this to RSC would require:
- Server Actions for every mutation (adds complexity with no benefit over existing API routes)
- Lifting all state management into URL params or server state (impractical for modal orchestration)
- Breaking the optimistic update pattern that currently gives instant feedback

The ROI is negative. Keep it as a client component.

---

## Patterns to Follow

### Pattern 1: Motion Wrapper Components

**What:** Create thin `"use client"` wrapper components that re-export `motion` elements. Use these inside Server Components for animations.

**When:** Any time a Server Component needs an animated child element.

**Confidence:** HIGH -- this is the documented pattern from both the Motion library and Next.js teams.

**Example:**

```typescript
// src/components/motion/motion-div.tsx
"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

export const MotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => <motion.div ref={ref} {...props} />
);
MotionDiv.displayName = "MotionDiv";
```

```typescript
// src/components/motion/fade-in.tsx
"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({ delay = 0, direction = "up", children, ...props }: FadeInProps) {
  const directionMap = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 2: Shared Animation Variants

**What:** Define variant objects in a central file instead of inline `initial`/`animate`/`transition` on every element. Use the variants cascade: parent defines timing, children define motion.

**When:** Any staggered list, any repeated entrance animation, any component with multiple animated children.

**Confidence:** HIGH -- core Framer Motion feature, well-documented.

**Example:**

```typescript
// src/lib/animations.ts (plain object, no "use client" needed)
export const stagger = {
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
} as const;

export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay },
  }),
} as const;

export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
} as const;
```

```typescript
// Usage in a client component
import { stagger } from "@/lib/animations";

<motion.div variants={stagger.container} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={stagger.item}>
      {/* content */}
    </motion.div>
  ))}
</motion.div>
```

### Pattern 3: CSS Custom Property Theming with Tailwind v4

**What:** Replace all hardcoded hex values (`#BABABA`, `#1A1A1A`, `#18181b`) with semantic CSS custom properties defined in `@theme`. This makes the brand refresh a single-file change.

**When:** Every color reference in the codebase.

**Confidence:** HIGH -- Tailwind v4's `@theme` is the official mechanism, already partially in use via shadcn/ui variables.

**Example:**

```css
/* globals.css -- add brand tokens alongside existing shadcn tokens */
@theme inline {
  /* ... existing shadcn tokens ... */

  /* Brand tokens */
  --color-brand-bg: var(--brand-bg);
  --color-brand-surface: var(--brand-surface);
  --color-brand-text: var(--brand-text);
  --color-brand-text-muted: var(--brand-text-muted);
  --color-brand-accent: var(--brand-accent);
  --color-brand-accent-hover: var(--brand-accent-hover);
}

:root {
  /* ... existing shadcn variables ... */

  /* 2026 Brand */
  --brand-bg: oklch(0.145 0 0);         /* replaces bg-black */
  --brand-surface: oklch(0.2 0 0);      /* replaces bg-[#1A1A1A] */
  --brand-text: oklch(0.78 0 0);        /* replaces text-[#BABABA] */
  --brand-text-muted: oklch(0.55 0 0);  /* dimmer text */
  --brand-accent: oklch(0.7 0.15 250);  /* primary CTA color -- update for 2026 */
  --brand-accent-hover: oklch(0.75 0.15 250);
}
```

Then replace throughout:
- `bg-black` -> `bg-brand-bg`
- `text-[#BABABA]` -> `text-brand-text`
- `bg-[#1A1A1A]` -> `bg-brand-surface`

**Team colors** (`bg-team-01` through `bg-team-21`) should also move into `@theme` as CSS custom properties if they are changing for 2026. If not changing, leave them as-is.

### Pattern 4: Server Component Landing Page with Client Islands

**What:** Convert the landing page from a monolithic `"use client"` component to a Server Component that renders static HTML and embeds small client islands for interactivity.

**When:** The landing page refresh.

**Confidence:** HIGH -- standard Next.js App Router pattern.

**Example:**

```typescript
// src/app/(landing)/page.tsx -- NO "use client"
import Image from "next/image";
import { FadeIn } from "@/components/motion/fade-in";
import { CountdownSection } from "@/components/countdown-section";

export default function Home() {
  const targetDate = new Date(2026, 4, 11, 12, 30, 0); // May 11, 2026
  const isRegistrationOpen = new Date() >= targetDate;

  return (
    <main className="min-h-screen bg-brand-bg flex flex-col items-center justify-between text-white font-sans">
      {/* Hero -- server-rendered image, client-animated wrapper */}
      <FadeIn className="w-full relative h-[420px] sm:h-[620px] flex items-end justify-center">
        <Image
          src="/landing.png"
          alt="YTHWKND 2026 Poster"
          fill
          className="object-cover object-top opacity-90"
          quality={100}
          priority
        />
      </FadeIn>

      {/* Static event details -- fully server-rendered */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="font-rumble text-4xl text-white">Event Details</h2>
        {/* ... static content ... */}
      </section>

      {/* Interactive countdown/CTA -- client island */}
      <CountdownSection targetDate={targetDate} isOpen={isRegistrationOpen} />
    </main>
  );
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: `"use client"` at the Page Level for Animation

**What:** Marking an entire page as `"use client"` just because one child needs `motion.div`.

**Why bad:** Forces the entire page's JS to ship to the browser. Prevents the page from being server-rendered. Blocks streaming and Suspense benefits.

**Instead:** Keep the page as a Server Component. Import a client `<FadeIn>` or `<MotionDiv>` wrapper and use it as a child.

### Anti-Pattern 2: Inline Animation Props Everywhere

**What:** Writing `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}` on every single `motion.div` across the codebase.

**Why bad:** Duplicated magic numbers. Inconsistent timing when values drift. Hard to update globally for brand refresh.

**Instead:** Define shared variant objects in `src/lib/animations.ts`. Components reference variants by name, not by value.

### Anti-Pattern 3: Hardcoded Color Hex Values

**What:** Using `text-[#BABABA]`, `bg-[#1A1A1A]` directly in component JSX.

**Why bad:** Brand refresh requires find-and-replace across dozens of files. Easy to miss instances. No semantic meaning (what IS `#BABABA`?).

**Instead:** Define semantic tokens in `globals.css` via `@theme`. Use `text-brand-text`, `bg-brand-surface`. Change colors in one place.

### Anti-Pattern 4: Client-Side Data Fetching for Static Content

**What:** Using `useEffect` + `fetch` on the landing page to get data that is known at build/request time (event dates, pricing, hero names).

**Why bad:** Adds a loading state, delays content visibility, hurts SEO, wastes a network round-trip for data that is literally in `constants.ts`.

**Instead:** Import constants directly in Server Components. They are available at render time with zero client-side cost.

---

## Scalability Considerations

Not a primary concern for this project (105 max registrations, single event), but relevant patterns:

| Concern | Current (105 users) | If Scaled (1000+ users) |
|---------|---------------------|------------------------|
| Landing page load | Client-rendered, fine at low traffic | Server-render for faster TTFB under load |
| Registration reads | Client-side Supabase query | Could add RSC async fetch with Suspense |
| Animation bundle | ~45KB Framer Motion shipped to all pages | Tree-shake with dynamic imports; only load on pages that need it |
| Team color CSS | 21 custom classes, inline in build | Stays small, no concern |

---

## Suggested Build Order

Based on dependency analysis, the refresh should proceed in this order:

### Phase 1: Theming Foundation (no functional changes)

1. Define brand tokens in `globals.css` (CSS custom properties)
2. Replace hardcoded hex values with token classes across all components
3. Update font declarations if new brand font is different from Rumble Brave
4. Update team colors if they change for 2026

**Why first:** Every subsequent phase touches component markup. Doing theming first means you write new code with the correct tokens from the start, rather than refactoring twice.

**Dependencies:** None. Pure CSS/class changes.

### Phase 2: Animation Architecture (no functional changes)

1. Create `src/components/motion/` directory with wrapper components (`MotionDiv`, `MotionSection`, `FadeIn`, `StaggerContainer`)
2. Create `src/lib/animations.ts` with shared variant definitions
3. Refactor existing inline animation props to use variants and wrappers
4. Ensure `AnimatePresence` usage is correct for modal transitions

**Why second:** Establishes the motion primitives that Phase 3 uses when converting components.

**Dependencies:** Phase 1 (so refactored components use correct brand tokens).

### Phase 3: RSC Conversion (landing page only)

1. Remove `"use client"` from `(landing)/page.tsx`
2. Extract `CountdownSection` as a client island (already mostly isolated)
3. Extract animated sections into `FadeIn` / `MotionSection` client wrappers (from Phase 2)
4. Move date check to server-side (simple `new Date()` comparison at render time)
5. Verify `Navbar` and `Footer` remain server components (they already are)

**Why third:** Requires motion wrappers from Phase 2 to exist.

**Dependencies:** Phase 2 (motion wrappers), Phase 1 (brand tokens).

### Phase 4: Content Update (copy, dates, assets)

1. Update `src/lib/constants.ts` with 2026 heroes, teams, CG leaders, dates
2. Update metadata in both layout files (title, description, OG tags)
3. Replace `landing.png`, masthead SVGs, hero portraits in `public/`
4. Update hardcoded dates (registration open date, event date)

**Why fourth:** Content changes are the most visible and should happen after the structural foundation is in place. Otherwise you risk merge conflicts with structural refactors.

**Dependencies:** Phase 1 (brand tokens applied so content renders with correct styling).

---

## Sources

- [Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) -- motion wrapper pattern
- [Tailwind CSS v4 @theme documentation](https://tailwindcss.com/docs/theme) -- official theming reference
- [Tailwind CSS v4 Custom Theme Styling](https://www.beflagrant.com/blog/tailwindcss-v4-custom-theme-styling-2025-08-21) -- practical theming examples
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) -- official boundary guidance
- [Advanced animation patterns with Framer Motion](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/) -- variants architecture
- [Stagger function documentation](https://www.framer.com/motion/stagger/) -- official stagger API
- [Tailwind CSS v4 theming discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15600) -- community patterns for multi-theme setups
- [Crafting Reusable Animations with React and framer-motion](https://www.emoosavi.com/blog/crafting-reusable-animations-with-react-and-framer-motion) -- reusable component patterns
- [Next.js + Supabase: what I'd do differently](https://catjam.fi/articles/next-supabase-what-do-differently) -- RSC data fetching lessons

---

*Architecture analysis: 2026-03-25*

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

# Feature Landscape

**Domain:** Youth camp/event registration website (brand refresh)
**Researched:** 2026-03-25

## Context

This is a brand refresh of an existing, working camp registration site (YTH WKND 2025 to 2026). The registration mechanism is unchanged: hero selection, team-based registration (21 teams x 5 heroes = 105 slots), invite system. The scope is new brand identity, updated copy/dates, and polished animations. Features here are scoped to what makes a brand refresh feel premium, NOT new registration mechanics.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or the refresh feels half-baked.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Updated dates, copy, and pricing | Users will see stale 2025 info and think the site is broken | Low | Hardcoded in `constants.ts` and landing page. Multiple date references (time restriction, countdown, landing copy) |
| New brand identity applied consistently | Inconsistent branding screams "unfinished." Every surface must reflect 2026 identity | Medium | Fonts, colors, hero images, masthead SVGs, team colors. Tailwind theme tokens (`font-rumble`, `bg-team-*`, `#BABABA` text) need updating across all components |
| Mobile-responsive registration flow | 60%+ of youth traffic is mobile. Current site works but needs polish testing on small screens | Low | Already responsive. Verify nothing breaks with new brand assets (larger images, different font metrics) |
| Fast page load (<3s) | Users bounce after 3 seconds. Youth audience has zero patience | Low | Already performant with Next.js. Watch for new brand assets bloating bundle (unoptimized hero images, heavy fonts). Use `next/image` for all new assets |
| Clear registration CTA above the fold | 71% of event attendees say ease of check-in makes or breaks their experience. Register button must be unmissable | Low | Already exists. Ensure new brand does not bury it behind visual noise |
| Countdown timer with flip/tick animation | Pre-registration countdown is table stakes for event sites. Current timer is functional but plain (static numbers in boxes) | Low | Current `CountdownTimer` uses basic Framer Motion fade-in. Add number transition animations (AnimatePresence on digit change) for polish |
| Confirmation feedback after registration | Users need to know registration succeeded. Missing confirmation = support tickets | Low | Already handled via toast notifications (Sonner). Ensure success state is visually satisfying with new brand |
| Form validation with inline error feedback | Users expect real-time field validation, not submit-and-pray. Zod + react-hook-form already handles this | Low | Already implemented. Consider adding subtle shake animation on validation errors for polish |
| Hero availability indicators | Users must see which heroes are taken vs available at a glance | Low | Already exists in `CharacterSelectionScreen`. Verify visual treatment works with new brand colors |
| Working invite/share system | Team invite links are core to the registration model. Must work flawlessly | Low | Already implemented with nanoid codes and 7-day expiry. Update any invite page copy for 2026 |

## Differentiators

Features that elevate the refresh from "same site, new colors" to "this feels like a new experience." Not expected, but high perceived value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smooth page transitions between routes | Makes navigation feel app-like rather than page-reload-y. Youth audience expects mobile-app-level polish | Medium | Use `AnimatePresence` with `motion` layout animations on route changes. Next.js App Router supports this with `template.tsx` or layout-level AnimatePresence. Framer Motion 12 has improved layout animations |
| Staggered entrance animations on team grid | 21 teams loading all at once feels static. Staggered reveals (cards cascading in) feel intentional and premium | Low | Already using Framer Motion. Add `staggerChildren` to the team grid container with `variants` pattern. Low effort, high visual impact |
| Hero card hover/tap micro-interactions | Hero selection is the signature interaction. Scale, glow, or parallax tilt on hover makes selection feel game-like and on-brand | Low | Currently has basic `whileHover: { scale: 1.02 }`. Upgrade to layered effect: slight tilt (3D transform), shadow elevation, and subtle glow matching team color |
| Animated form step transitions | Multi-step form currently jumps between steps. Sliding/fading transitions between form sections reduce cognitive load and feel premium | Low | `MultiStepRegistrationForm` (1771 lines) already has step state. Wrap step content in `AnimatePresence` with directional slide (left/right based on step direction) |
| Scroll-triggered section reveals on landing | Landing page sections appearing on scroll rather than all at once creates a storytelling flow. Parallax on the hero image adds depth | Low-Med | Replace current static fade-in (all animate on mount) with `whileInView` triggers. Add parallax to hero image via `useScroll` + `useTransform` |
| Registration success celebration animation | A confetti burst, checkmark animation, or hero "power-up" effect on successful registration makes the moment memorable | Low | Use a lightweight confetti library (e.g., `canvas-confetti`, ~3KB) or a Framer Motion sequence. Fires once on success callback |
| Countdown timer digit flip animation | Numbers physically flip or morph when changing, like an airport departure board. Much more engaging than static number swap | Medium | Replace plain digit render with AnimatePresence per digit, animating Y-axis rotation or slide. Each digit gets its own exit/enter animation |
| Dark mode ambient effects | Subtle animated gradient background, floating particles, or aurora effect that gives the dark theme life without distracting | Medium | Use CSS `@keyframes` for gradient shifts or a lightweight canvas animation. Keep it subtle -- this is atmosphere, not content. Test performance on low-end mobile |
| Loading skeleton states | Show content-shaped skeletons while data loads rather than blank space or spinners. Feels faster even if load time is the same | Low | shadcn/ui already includes `skeleton.tsx`. Apply to team grid and hero cards during Supabase fetch |
| Haptic-feeling button interactions | Buttons that scale down on press (`whileTap`), have spring physics on release, and show ripple effects. Makes taps feel physical | Low | Already has `whileTap: { scale: 0.95 }` on register button. Extend to all interactive elements with spring transition (`type: "spring", stiffness: 400, damping: 15`) |

## Anti-Features

Features to explicitly NOT build. These would add scope, complexity, or user friction without matching the project's constraints.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User authentication / accounts | Project is explicitly out of scope. Public registration with no sessions is the design. Adding auth adds complexity, maintenance, and friction for youth users | Keep anonymous registration. No login walls |
| Payment integration | Payment handling adds PCI compliance burden, error states, and support overhead. Current model handles payment offline/separately | Keep pricing info on landing page. Handle payment through existing offline process |
| Admin dashboard / CMS | Google Sheets sync already serves as admin view. Building a dashboard is a separate product | Keep Google Sheets as the admin interface. It works and organizers already know it |
| Email notification system | Confirmation emails add infrastructure (SMTP, templates, delivery monitoring) for a single-use registration event | Show clear on-screen confirmation. Optionally add a "screenshot your confirmation" prompt |
| Real-time WebSocket updates | Supabase supports real-time subscriptions, but polling/refetch on action is simpler and sufficient for the registration volume (105 max registrations) | Keep current fetch-on-mount + optimistic updates pattern. Real-time adds complexity for negligible UX gain at this scale |
| Complex page transitions with shared layout animations | Full shared-element transitions (hero image morphing from grid to detail view) are impressive but fragile, hard to maintain, and add significant complexity | Use simple cross-fade or slide transitions between routes. Save shared-element animations for the hero selection modal only |
| Internationalization (i18n) | Single-language event for a specific community. i18n infrastructure is pure overhead | Keep English-only. All copy is in constants and components |
| Progressive Web App (PWA) features | Manifest exists but offline support, push notifications, etc. add complexity for a site visited once during registration | Keep the manifest for mobile "add to home screen" but do not invest in service workers or offline mode |
| SEO optimization beyond basics | This is a direct-link registration site, not a content site competing for search rankings. Users arrive via social media links | Keep existing meta tags and OG image. Do not invest in structured data, sitemap, or SEO content |
| Accessibility audit / WCAG compliance overhaul | Important in general, but out of scope for a tight-deadline brand refresh of an existing working site | Maintain existing accessibility (semantic HTML, button labels). Do not introduce new accessibility regressions. Flag for future if the platform grows |

## Feature Dependencies

```
Updated dates/copy/pricing
  (no dependencies, do first)

New brand identity
  -> Hero card micro-interactions (need final brand colors for glow effects)
  -> Dark mode ambient effects (need final brand palette)
  -> Countdown timer digit flip (need final font for digit sizing)

Staggered entrance animations
  -> Loading skeleton states (skeletons should stagger too)

Animated form step transitions
  (independent, can be done alongside brand work)

Scroll-triggered section reveals
  -> Smooth page transitions (both touch layout animation, coordinate approach)

Registration success celebration
  (independent, fires after existing success callback)

Hero card hover/tap micro-interactions
  -> Character selection screen already exists, enhance in place
```

## MVP Recommendation

Given the constraint that this must be live this week, prioritize in this order:

**Must do (brand refresh is incomplete without these):**
1. Updated dates, copy, pricing, and event details for 2026
2. New brand identity applied consistently (fonts, colors, masthead, hero images)
3. Form validation shake animation on errors (tiny effort, big polish signal)

**Should do (makes the refresh feel premium, low effort):**
4. Staggered entrance animations on team grid
5. Animated form step transitions (AnimatePresence on multi-step form)
6. Hero card hover/tap micro-interactions upgrade
7. Loading skeleton states for data fetching
8. Haptic-feeling button interactions (spring physics on all buttons)

**Nice to have (if time permits):**
9. Countdown timer digit flip animation
10. Scroll-triggered section reveals on landing page
11. Registration success celebration animation
12. Smooth page transitions between routes

**Defer entirely:**
- Dark mode ambient effects (medium complexity, risk of performance issues on mobile)
- Complex shared-element transitions (fragile, time-consuming)

## Sources

- [Bizzabo: Beautiful Event Websites Design Trends 2026](https://www.bizzabo.com/blog/beautiful-event-websites-design)
- [KESQ: Key features every camp registration should offer](https://kesq.com/stacker-money/2025/10/10/key-features-every-camp-or-program-should-offer-in-their-registration-experience/)
- [iCampPro: Summer Camp Registration Best Practices](https://www.icamppro.com/blog/summer-camp-registration-camp-forms-best-practices-tips)
- [Beta Soft Technology: Motion UI Trends 2025 Micro-Interactions](https://www.betasofttechnology.com/motion-ui-trends-and-micro-interactions/)
- [Medium: Enhancing Form Usability with Framer Motion](https://medium.com/designly/enhancing-form-usability-with-framer-motion-a-guide-to-animated-chunked-form-transitions-dc20e18363d4)
- [Maxime Heckel: Advanced Animation Patterns with Framer Motion](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)
- [Figma: Web Design Trends 2026](https://www.figma.com/resource-library/web-design-trends/)
- [Justinmind: Micro-interaction Examples and Guidelines 2025](https://www.justinmind.com/web-design/micro-interactions)

# Domain Pitfalls

**Domain:** Camp registration website refresh (brand update, Next.js upgrade, animation polish)
**Researched:** 2026-03-25

## Critical Pitfalls

Mistakes that cause rewrites, broken production deployments, or missed deadlines.

### Pitfall 1: 89 Hardcoded Color Values Scattered Across 13 Files

**What goes wrong:** The codebase uses arbitrary Tailwind color values (`text-[#bababa]`, `bg-[#1a1a1a]`, etc.) in 89 places across 13 files instead of theme tokens. A brand refresh requires finding and replacing every single one. Missing even one produces a jarring visual inconsistency that is hard to spot in testing.

**Why it happens:** The original build used Tailwind's arbitrary value syntax (`[#hex]`) for quick iteration instead of defining semantic color tokens in the theme.

**Consequences:** Brand refresh takes 3-5x longer than expected. Missed instances create a patchwork of old and new brand colors. Regression is nearly guaranteed without systematic search-and-replace.

**Prevention:**
1. Before touching any component, grep for all `[#` arbitrary color values and catalog them
2. Define new brand colors as CSS custom properties in `globals.css` (e.g., `--brand-text`, `--brand-surface`, `--brand-accent`)
3. Map them to Tailwind theme tokens via `@theme inline` block
4. Do a systematic find-and-replace from hardcoded values to token classes
5. Verify with a full visual walkthrough of every page and modal state

**Detection:** Search for `bg-[#`, `text-[#`, `border-[#` patterns. If count > 0 after brand phase, the job is incomplete.

**Phase:** Must be addressed first in the brand/theme phase, before any component-level work.

### Pitfall 2: Dual Root Layouts Mean Brand Changes Applied Twice (or Missed Once)

**What goes wrong:** The app uses two separate root layouts -- `(landing)/layout.tsx` and `(everywhere-else)/layout.tsx` -- each with their own `<html>` and `<body>` tags. Font imports, metadata, analytics scripts, and global styling must be updated in both. It is extremely common to update one layout and forget the other, causing the landing page to look correct while registration pages have the old brand (or vice versa).

**Why it happens:** Next.js route groups with separate root layouts are architecturally correct but create a maintenance burden for cross-cutting concerns like fonts and meta tags.

**Consequences:** One set of pages has old branding. Often not caught until someone navigates between the two route groups in production.

**Prevention:**
1. Create a checklist of every change made to one layout, then mirror it in the other
2. Consider extracting shared layout logic (font declarations, metadata, analytics) into a shared module imported by both
3. Test by navigating from landing (`/`) to register (`/register`) and back -- visually verify both carry the new brand

**Detection:** Diff both layout files side-by-side after brand changes. Any font, color, or metadata mismatch is a bug.

**Phase:** Brand/theme phase. Address at the start, not the end.

### Pitfall 3: Next.js Upgrade May Target 16, Which Breaks All Route Handlers

**What goes wrong:** The PROJECT.md says "Upgrade Next.js to latest stable version." The current version is 15.3.1. Next.js 16 (released October 2025) removes synchronous access to `cookies()`, `headers()`, `params`, and `searchParams` -- all must be `await`ed. The codebase currently has zero `await` calls on these APIs. Every route handler and dynamic page component will break.

**Why it happens:** Next.js 15 introduced async request APIs with a temporary synchronous compatibility layer. Next.js 16 removes that compatibility layer entirely.

**Consequences:** Build failures or runtime errors across all API routes and dynamic pages. The `[code]` invite page uses `params` which becomes a Promise. Route handlers using `cookies()` or `headers()` break. On a tight timeline, this can consume an entire day of debugging.

**Prevention:**
1. Decide upfront: stay on Next.js 15.x (latest patch) or go to 16. Given the tight timeline, staying on 15.x latest is safer.
2. If going to 16, run the official codemod: `npx @next/codemod@latest upgrade`
3. Audit every file in `src/app/api/` and every `page.tsx` with dynamic params for async API usage
4. The invite page `src/app/(everywhere-else)/invite/[code]/page.tsx` is the most at-risk file (uses `params.code`)

**Detection:** After upgrade, run `next build`. Any "Dynamic API was called synchronously" errors indicate missed migrations.

**Phase:** Must be the FIRST task in the upgrade phase. Do not mix with brand or animation work.

### Pitfall 4: `font-rumble` Used 30+ Times -- Font Swap Breaks Layout if Metrics Differ

**What goes wrong:** The custom display font "Rumble Brave" is referenced via `font-rumble` class in 30+ places across components. If the new brand font has different metrics (x-height, cap height, character width), every heading and display text element will shift position, break overflow boundaries, or misalign with adjacent elements.

**Why it happens:** Display fonts have wildly different metrics. A font that looks similar in isolation can have 20-30% different character widths, which accumulates across headings and labels.

**Consequences:** Buttons overflow, headings wrap unexpectedly, countdown timer digits misalign, modal titles clip. Each instance needs individual adjustment.

**Prevention:**
1. Test the new brand font in a single component first (e.g., the countdown timer) before applying globally
2. Compare metrics between old and new font using a font metrics comparison tool
3. If metrics differ significantly, plan for padding/sizing adjustments in every `font-rumble` usage
4. Consider using `size-adjust` in the `@font-face` declaration to normalize metrics

**Detection:** After font swap, visually inspect: countdown timer, registration page headings, modal titles, team invite dialog, hero details card. These are the densest `font-rumble` areas.

**Phase:** Brand/theme phase. Do font swap early, then fix layout issues as they surface.

## Moderate Pitfalls

### Pitfall 5: Framer Motion Still on `framer-motion` Package (Deprecated)

**What goes wrong:** The project imports from `"framer-motion"` (8 files). The package was renamed to `motion` in 2025. While `framer-motion` still works, it is no longer actively developed. Mixing the old import with any new code using `motion/react` causes duplicate bundles and potential version conflicts.

**Prevention:**
1. If upgrading, change all imports from `"framer-motion"` to `"motion/react"` in a single pass
2. Update `package.json`: remove `framer-motion`, add `motion`
3. For RSC-compatible components, use `"motion/react-client"` instead
4. This is a low-risk, high-value change -- the API is identical, only the import path changes

**Detection:** Grep for `from "framer-motion"`. If any remain after migration, you have split imports.

**Phase:** Upgrade phase, can be done as a quick find-and-replace.

### Pitfall 6: AnimatePresence Exit Animations Break with React 19 Strict Mode

**What goes wrong:** `AnimatePresence` is used in 4 components (register page, invite page, loading overlay, character selection). React 19 strict mode double-renders in development, which can cause exit animations to fire prematurely or not at all. Components appear to "flash" or skip their exit transition.

**Prevention:**
1. Do not debug animation "bugs" in strict mode -- test in production build (`next build && next start`)
2. Ensure every child of `AnimatePresence` has a stable, unique `key` prop
3. Use `mode="wait"` on `AnimatePresence` if transitions should be sequential (old exits before new enters)
4. Avoid `mode="sync"` for modal/dialog transitions -- it causes content to overlap during transition

**Detection:** If animations look broken in `next dev` but work in `next build`, it is a strict mode artifact, not a real bug.

**Phase:** Animation polish phase. Be aware of this before spending time debugging phantom issues.

### Pitfall 7: Registration Date Hardcoded in Multiple Places with Different Values

**What goes wrong:** The time-gating logic has dates hardcoded in at least two places with DIFFERENT values: `TimeRestriction` component uses May 11, 2024 (past), and the landing page uses May 11, 2025. Updating for 2026 requires finding every hardcoded date. Missing one means registration either opens too early (no time gate) or never opens (future date with wrong year).

**Prevention:**
1. Grep for `new Date("` and `new Date(2` across all files
2. Define the registration open date as a single constant in `src/lib/constants.ts`
3. Import it everywhere instead of hardcoding
4. Test both states: before and after the open date

**Detection:** Search for `2024`, `2025` year strings in source files. Any remaining old year references are potential bugs.

**Phase:** Copy/dates update phase. Consolidate dates into constants before updating values.

### Pitfall 8: `nanoid` Missing from Dependencies -- Team Invites Broken on Fresh Deploy

**What goes wrong:** `nanoid` is imported in `src/app/api/team-invite/route.ts` but is NOT in `package.json`. If you do a fresh `npm install` (which happens on every deployment), the build fails or team invite generation throws a runtime error.

**Prevention:**
1. Run `npm install nanoid` before any other work
2. Alternatively, replace with `crypto.randomUUID()` which requires zero dependencies
3. Test the team invite flow end-to-end after any dependency changes

**Detection:** Run `npm ls nanoid`. If it shows "missing," the dependency is not declared.

**Phase:** Address immediately in setup/upgrade phase. This is a pre-existing bug.

### Pitfall 9: Tailwind v4 Custom Team Colors May Break with Theme Changes

**What goes wrong:** Team colors (`bg-team-01` through `bg-team-21`) are defined in constants and likely referenced as dynamic Tailwind classes. Tailwind v4 uses CSS-first configuration; if these custom colors are not properly defined in the `@theme` block, they will silently fail to generate. The classes will exist in the HTML but produce no visual output.

**Prevention:**
1. Verify all 21 team color classes are defined in the theme configuration
2. After any theme changes, visually inspect the registration page to confirm all 21 team cards have their correct colors
3. Remember that Tailwind v4 does NOT scan `.ts` constant files for class names by default -- dynamic class construction (string interpolation like `bg-team-${id}`) will not work. Classes must appear as complete strings somewhere in the source.

**Detection:** Inspect a team card in browser DevTools. If the `bg-team-XX` class exists but has no CSS rule, the class was purged or not generated.

**Phase:** Brand/theme phase. Verify after any theme token changes.

### Pitfall 10: `images.domains` Config is Deprecated -- Breaks on Next.js 16

**What goes wrong:** `next.config.ts` uses `images: { domains: ['ythwknd.ymfgakl.com'] }` which is deprecated in Next.js 15 and removed in Next.js 16. Images from external domains will fail to load.

**Prevention:**
1. Replace `domains` with `remotePatterns`:
   ```ts
   images: {
     remotePatterns: [{ protocol: 'https', hostname: 'ythwknd.ymfgakl.com' }],
   }
   ```
2. This is a one-line fix but easy to miss

**Detection:** Deprecation warning in `next dev` console output. Hard error on Next.js 16 build.

**Phase:** Upgrade phase. Fix alongside the Next.js version bump.

## Minor Pitfalls

### Pitfall 11: 1,771-Line Registration Form is a Refactor Trap

**What goes wrong:** The multi-step registration form is 1,771 lines with 15+ useState hooks. On a tight timeline, it is tempting to "clean it up while we're in there." Any refactoring of this file risks breaking the registration flow, which is the core product functionality.

**Prevention:**
1. Do NOT refactor the registration form during the refresh
2. Limit changes to: copy updates, color/font class swaps, animation tweaks
3. If a change requires understanding the step navigation logic, test ALL paths: YM member flow, non-YM member flow, back navigation at every step
4. The form has zero test coverage -- every change is manual QA

**Detection:** If a diff of `multi-step-registration-form.tsx` shows structural changes (moved functions, renamed state, reorganized JSX), scope has crept.

**Phase:** All phases. Keep changes minimal and cosmetic only.

### Pitfall 12: Google Sheets Sync is Silent-Fail -- May Be Broken Without Anyone Knowing

**What goes wrong:** The sheets-sync endpoint is fire-and-forget. If the Google service account credentials have expired, the spreadsheet was deleted, or the API quota is exceeded, registrations still succeed but no data appears in Google Sheets. After a deployment, the admin may not notice data is missing until they check the spreadsheet days later.

**Prevention:**
1. After deployment, register a test entry and immediately verify it appears in Google Sheets
2. Check that `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable is still valid for the new deployment
3. Do not change the sheets-sync code during the refresh unless necessary

**Detection:** Register one test user. Check Google Sheets within 60 seconds. If the row is missing, investigate the sheets-sync endpoint.

**Phase:** Post-deployment verification. Not a code change -- an operational check.

### Pitfall 13: CSS Custom Properties Use oklch() -- Not All Browsers Render Identically

**What goes wrong:** The theme in `globals.css` uses `oklch()` color values. While browser support is now broad, slight rendering differences between Chrome/Safari/Firefox can make the brand colors appear subtly different. On a brand refresh where exact color fidelity matters, this can cause stakeholder feedback like "the colors look wrong on my phone."

**Prevention:**
1. Test the new brand colors on Chrome, Safari, and at least one mobile browser
2. If exact fidelity is critical, provide fallback hex values using `@supports` or use hex values directly
3. oklch is fine for most cases -- just be aware that perceptual color spaces render slightly differently across engines

**Detection:** Visual comparison across browsers. Only matters if brand guidelines specify exact hex values.

**Phase:** Brand/theme phase. Low priority unless stakeholders are color-sensitive.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Next.js Upgrade | Async API breakage if targeting v16 (Pitfall 3) | Stay on 15.x latest OR allocate a full day for async migration |
| Next.js Upgrade | Deprecated `images.domains` config (Pitfall 10) | One-line fix, do it alongside version bump |
| Next.js Upgrade | Missing `nanoid` dependency (Pitfall 8) | Install before anything else |
| Brand/Theme | 89 hardcoded color values (Pitfall 1) | Systematic grep-and-replace with theme tokens |
| Brand/Theme | Dual root layouts (Pitfall 2) | Mirror every change in both layout files |
| Brand/Theme | Font metrics mismatch (Pitfall 4) | Test font swap in isolation first |
| Brand/Theme | Team color classes (Pitfall 9) | Verify all 21 colors render after theme changes |
| Animation Polish | framer-motion rename (Pitfall 5) | Import path find-and-replace |
| Animation Polish | React 19 strict mode false alarms (Pitfall 6) | Test in production build, not dev |
| Copy/Dates | Hardcoded dates in multiple places (Pitfall 7) | Consolidate into single constant |
| All Phases | Registration form refactor trap (Pitfall 11) | Cosmetic changes only, no structural edits |
| Post-Deploy | Google Sheets silent failure (Pitfall 12) | Manual verification after deploy |

## Sources

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15) - Official upgrade documentation
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Async API removal details
- [Next.js Security Update December 2025](https://nextjs.org/blog/security-update-2025-12-11) - CVE patches for 15.x
- [Tailwind v4 Migration Issues Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/16517) - Community-reported upgrade problems
- [Tailwind v4 Migration Guide](https://medium.com/better-dev-nextjs-react/tailwind-v4-migration-from-javascript-config-to-css-first-in-2025-ff3f59b215ca) - CSS-first config migration
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) - framer-motion to motion migration
- [Motion Performance Tips](https://tillitsdone.com/blogs/framer-motion-performance-tips/) - Animation performance best practices
- [Framer Motion 12 vs React Spring 10](https://hookedonui.com/animating-react-uis-in-2025-framer-motion-12-vs-react-spring-10/) - Animation library comparison and pitfalls

---

*Pitfalls research: 2026-03-25*