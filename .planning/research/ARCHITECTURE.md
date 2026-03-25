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
