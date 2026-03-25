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
