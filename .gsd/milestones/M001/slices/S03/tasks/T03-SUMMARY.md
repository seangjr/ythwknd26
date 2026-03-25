---
id: T03
parent: S03
milestone: M001
key_files:
  - src/components/motion/motion-div.tsx
  - src/components/motion/motion-section.tsx
  - src/components/motion/fade-in.tsx
  - src/components/motion/stagger-container.tsx
  - src/components/motion/index.ts
  - src/lib/animations.ts
key_decisions:
  - Used forwardRef on MotionDiv and MotionSection to support ref forwarding from parent server components
  - Made FadeIn use whileInView with viewport.once by default (most common pattern) with animateOnMount boolean opt-in for immediate animation
  - Typed Transition imports from motion/react for springTransition and gentleSpring to ensure type safety
  - Created createStaggerContainer factory function alongside the static staggerContainer variant for cases needing custom timing
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:35:52.837Z
blocker_discovered: false
---

# T03: Create motion wrapper components (MotionDiv, MotionSection, FadeIn, StaggerContainer) and shared animation variants library

**Create motion wrapper components (MotionDiv, MotionSection, FadeIn, StaggerContainer) and shared animation variants library**

## What Happened

Created 6 new files to establish the motion component layer and animation variants library needed by T04 (RSC conversion) and T05 (animation polish).

**Motion wrapper components** (`src/components/motion/`):
- `motion-div.tsx` — Thin `"use client"` wrapper around `motion.div` using forwardRef, accepts all HTMLMotionProps.
- `motion-section.tsx` — Same pattern for `motion.section`.
- `fade-in.tsx` — Opinionated fade+slide wrapper with directional control (up/down/left/right), configurable delay/duration, `whileInView` by default with `animateOnMount` opt-in for immediate animation.
- `stagger-container.tsx` — Orchestration container for staggered children animations with configurable `staggerDelay` and `delayChildren`.
- `index.ts` — Barrel export for all motion components.

**Animation variants library** (`src/lib/animations.ts`):
- Directional fade variants: `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- Scale variant: `scaleIn`
- Stagger orchestration: `staggerContainer` preset + `createStaggerContainer()` factory
- Transition presets: `springTransition` (snappy, for interactions) and `gentleSpring` (soft, for entrances)
- Interaction helper: `hoverScale` combining whileHover/whileTap with spring physics

All imports use `motion/react` consistent with the existing codebase. The animations.ts file exports plain objects/functions (no "use client" needed) while all motion components carry the client directive.

## Verification

Build passes (`bun run build` exits 0 with Next.js 16.2.1 Turbopack). All 6 expected files exist. Content checks confirm `"use client"` directive in motion-div.tsx, `fadeInUp` and `springTransition` exports in animations.ts. Slice-level rename checks from T01/T02 still hold (0 matches for old hero/team terminology).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `bun run build` | 0 | ✅ pass | 15600ms |
| 2 | `test -f src/components/motion/motion-div.tsx` | 0 | ✅ pass | 10ms |
| 3 | `test -f src/components/motion/motion-section.tsx` | 0 | ✅ pass | 10ms |
| 4 | `test -f src/components/motion/fade-in.tsx` | 0 | ✅ pass | 10ms |
| 5 | `test -f src/components/motion/stagger-container.tsx` | 0 | ✅ pass | 10ms |
| 6 | `test -f src/components/motion/index.ts` | 0 | ✅ pass | 10ms |
| 7 | `test -f src/lib/animations.ts` | 0 | ✅ pass | 10ms |
| 8 | `grep -q 'use client' src/components/motion/motion-div.tsx` | 0 | ✅ pass | 10ms |
| 9 | `grep -q 'fadeInUp' src/lib/animations.ts` | 0 | ✅ pass | 10ms |
| 10 | `grep -q 'springTransition' src/lib/animations.ts` | 0 | ✅ pass | 10ms |
| 11 | `rg -ic 'choose your hero' src/ --glob '*.tsx' (0 matches)` | 0 | ✅ pass | 50ms |
| 12 | `rg -ic 'Heroes Available' src/ --glob '*.tsx' (0 matches)` | 0 | ✅ pass | 50ms |
| 13 | `rg -c 'CONSTANTS.HEROES' src/ --glob '*.tsx' (0 matches)` | 0 | ✅ pass | 50ms |
| 14 | `rg -c 'CONSTANTS.TEAMS' src/ --glob '*.tsx' (0 matches)` | 0 | ✅ pass | 50ms |
| 15 | `rg -c 'HERO_IMAGE_PATHS' src/ --glob '*.tsx' (0 matches)` | 0 | ✅ pass | 50ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/components/motion/motion-div.tsx`
- `src/components/motion/motion-section.tsx`
- `src/components/motion/fade-in.tsx`
- `src/components/motion/stagger-container.tsx`
- `src/components/motion/index.ts`
- `src/lib/animations.ts`
