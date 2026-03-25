---
id: S03
parent: M001
milestone: M001
provides:
  - Landing page is an RSC with client islands — no 'use client' at page level
  - Motion wrapper components available at src/components/motion/ for any future RSC pages
  - Shared animation variants at src/lib/animations.ts for consistent motion across the app
  - All content reflects confirmed 2026 event details (dates, venue, pricing, class/party model)
  - All hero→class and universe→party terminology updated across registration UI
requires:
  - slice: S01
    provides: motion/react imports, semantic color tokens, Next.js 16 foundation
  - slice: S02
    provides: 2026 year references in layouts and metadata, brand identity baseline
affects:
  - S04
key_files:
  - src/lib/constants.ts
  - src/app/(landing)/page.tsx
  - src/components/registration-cta.tsx
  - src/components/motion/motion-div.tsx
  - src/components/motion/motion-section.tsx
  - src/components/motion/fade-in.tsx
  - src/components/motion/stagger-container.tsx
  - src/components/motion/index.ts
  - src/lib/animations.ts
  - src/styles/fonts.css
  - src/app/globals.css
  - src/app/(everywhere-else)/register/page.tsx
  - src/components/multi-step-registration-form.tsx
  - src/components/character-selection-screen.tsx
  - src/app/(everywhere-else)/invite/[code]/page.tsx
key_decisions:
  - Kept --font-rumble CSS variable name pointing to Jeju Hallasan to avoid breaking 72 class references (D005)
  - Kept API route parameter names (heroId) and DB column names (hero_id) unchanged — only UI text renamed to class terminology
  - Kept file names hero-details.tsx and hero-selection-grid.tsx to avoid import path churn
  - Passed targetDate as ISO string across RSC boundary since Date objects are not serializable in React Server Components
  - Used forwardRef on MotionDiv/MotionSection to support ref forwarding from server components
  - Used inline spring transitions in gesture props when element also has entrance transition to prevent override
patterns_established:
  - Motion wrapper pattern: thin 'use client' components in src/components/motion/ wrap motion elements for RSC import
  - Animation variants library: src/lib/animations.ts exports plain objects (no use client needed) for reuse across components
  - RSC client island pattern: RegistrationCTA demonstrates extracting interactive logic into a client component with serializable props
  - Spring physics convention: stiffness 400, damping 17 for hover/tap micro-interactions
  - whileInView + staggerContainer pattern for scroll-triggered grid entrance animations with viewport={{ once: true }}
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T04-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T05-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:46:38.377Z
blocker_discovered: false
---

# S03: Content Override, Animation and RSC

**Updated all 2026 event content (dates, venue, pricing, class/party model), converted landing page to RSC with client islands, and polished animations with spring physics, whileInView scroll triggers, and AnimatePresence step transitions.**

## What Happened

S03 delivered three major workstreams across 5 tasks:

**Content Override (T01–T02):** Applied confirmed 2026 event details per user override D004, replacing all S02 placeholder values. Constants rewritten: HEROES→CLASSES (5 generic classes), TEAMS→PARTIES (PARTY 001–021), HERO_IMAGE_PATHS removed, CG_LEADERS updated. Landing page updated with correct dates (30 May to 1 June), venue (Peacehaven, Genting Highlands), and 2-tier pricing (RM130/RM160). Heading font replaced from Rumble Brave to Jeju Hallasan. T02 mechanically renamed all hero→class and universe→party terminology across 8 registration components, keeping API/DB field names unchanged (heroId maps to hero_id DB column).

**Animation Infrastructure (T03):** Created reusable motion wrapper components (MotionDiv, MotionSection, FadeIn, StaggerContainer) in src/components/motion/ — all "use client" components that can be imported from server components. Created shared animation variants library (src/lib/animations.ts) with directional fades, scale-in, stagger orchestration, spring transitions, and hover scale helpers.

**RSC Conversion (T04):** Removed "use client" from landing page, making it a Server Component. Time check moved server-side with force-dynamic to prevent stale caching. Created RegistrationCTA client island for countdown/button logic. All inline motion elements replaced with T03 wrapper imports. Build confirms / route is ƒ (Dynamic).

**Animation Polish (T05):** Register page party grid converted from mount-based delay stacking to whileInView with stagger variants. Spring physics added to hover/tap on class cards, buttons, and social icons across register, character-selection, and invite pages. AnimatePresence mode="wait" wraps form step transitions — no form logic touched.

## Verification

All slice-level verification checks pass:

1. `bun run build` exits 0 — full production build succeeds with no TypeScript errors
2. Landing page has no "use client" directive — confirmed RSC
3. `export const dynamic = "force-dynamic"` present in landing page
4. All motion wrapper files exist (motion-div.tsx, motion-section.tsx, fade-in.tsx, stagger-container.tsx, animations.ts)
5. RegistrationCTA client component exists with "use client" directive
6. `whileInView` present in register/page.tsx and invite/[code]/page.tsx
7. `spring` present in register/page.tsx and character-selection-screen.tsx
8. `AnimatePresence` present in multi-step-registration-form.tsx
9. CLASSES and PARTIES exported from constants.ts; HEROES, HERO_IMAGE_PATHS absent
10. "Peacehaven" in landing page; "Jeju Hallasan" in fonts.css
11. Zero matches for "choose your hero", "Heroes Available" across src/

## Requirements Advanced

- BRND-02 — Heading font replaced from Rumble Brave to Jeju Hallasan in fonts.css and globals.css — font applied via --font-rumble CSS variable

## Requirements Validated

- UPGR-03 — Landing page has no 'use client' directive, uses motion wrapper client islands and RegistrationCTA. Build output confirms / is ƒ (Dynamic) with force-dynamic.
- CONT-01 — Landing page shows '30 May to 1 June', 'Peacehaven, Genting Highlands', RM130/RM160 pricing. No double ticket or disclaimers.
- CONT-02 — CLASSES array (5 classes) replaces HEROES. PARTIES (001-021) replaces TEAMS. HERO_IMAGE_PATHS removed. CG_LEADERS updated. All downstream components updated.
- CONT-04 — RM130 (new friends) / RM160 (YM member) displayed. Old 3-tier pricing removed.
- ANIM-01 — springTransition used across register, character-selection, invite pages. Spring physics (stiffness 400, damping 17) on cards and buttons.
- ANIM-02 — Register page party grid and invite page team section use whileInView='visible' with staggerContainer/fadeInLeft/scaleIn and viewport={{ once: true }}.
- ANIM-03 — AnimatePresence mode='wait' wraps step conditionals in multi-step-registration-form.tsx with keyed motion.div and initial/animate/exit props.
- ANIM-04 — Class cards have whileHover/whileTap spring scaling. Social icons have hover spring. Register page class tiles have spring interactions.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

T01 had to update 7 downstream component files (hero-details, hero-selection-grid, team-drawer, character-selection-screen, multi-step-registration-form, register/page, invite/page) beyond its planned scope because renaming HEROES→CLASSES and TEAMS→PARTIES in constants.ts caused immediate TypeScript build failures. This work overlapped with T02's planned scope but was required for incremental build verification. T02 then did deeper content renaming (UI text, instructional copy) on the same files.

T04 used FadeIn with direction="left" and animateOnMount for pricing cards instead of raw MotionDiv — a higher-level abstraction that preserved the original x:-20 slide animation.

T05 used inline spring transitions in gesture props instead of the shared springTransition constant when elements had both entrance and gesture transitions, to avoid the gesture spring overriding entrance timing.

## Known Limitations

1. All getHeroImagePath functions return "/placeholder.svg" since HERO_IMAGE_PATHS was removed — classes don't have per-party unique images. The character selection screen shows text-based class descriptions instead of hero images.

2. File names hero-details.tsx and hero-selection-grid.tsx were kept unchanged to avoid import path churn — their internal content uses class terminology.

3. API route parameter names (heroId) and DB column names (hero_id) were intentionally kept unchanged to avoid backend migration complexity. Only UI-facing text was renamed.

4. The --font-rumble CSS variable name still references "Rumble" despite now pointing to Jeju Hallasan — 72 class usages made renaming impractical.

## Follow-ups

None.

## Files Created/Modified

- `src/lib/constants.ts` — HEROES→CLASSES (5 generic classes), TEAMS→PARTIES (PARTY 001-021), HERO_IMAGE_PATHS removed, CG_LEADERS updated
- `src/app/(landing)/page.tsx` — RSC conversion (removed use client), updated dates/venue/pricing, replaced motion elements with wrapper components, added force-dynamic
- `src/components/registration-cta.tsx` — New client island for countdown timer and registration button conditional
- `src/components/motion/motion-div.tsx` — New use client wrapper around motion.div with forwardRef
- `src/components/motion/motion-section.tsx` — New use client wrapper around motion.section with forwardRef
- `src/components/motion/fade-in.tsx` — New opinionated fade+slide wrapper with directional control and whileInView default
- `src/components/motion/stagger-container.tsx` — New stagger orchestration container for children animations
- `src/components/motion/index.ts` — Barrel export for motion wrapper components
- `src/lib/animations.ts` — New shared animation variants library (fades, scale, stagger, spring transitions, hover helpers)
- `src/styles/fonts.css` — Font face changed from Rumble Brave to Jeju Hallasan
- `src/app/globals.css` — --font-rumble value updated to Jeju Hallasan
- `src/app/(everywhere-else)/register/page.tsx` — hero→class rename, whileInView stagger animations, spring hover/tap on class cards
- `src/components/character-selection-screen.tsx` — hero→class rename, spring physics on hover/tap interactions
- `src/components/hero-details.tsx` — hero→class terminology in UI text, getHeroImagePath returns placeholder
- `src/components/hero-selection-grid.tsx` — hero→class terminology in UI text
- `src/components/registration-modal.tsx` — hero→class terminology, internal state renamed to selectedClass
- `src/components/multi-step-registration-form.tsx` — hero→class/universe→party rename, AnimatePresence mode=wait for step transitions
- `src/components/team-invite-modal.tsx` — hero→class rename in UI text
- `src/components/team-drawer.tsx` — hero→class rename, TEAMS→PARTIES reference
- `src/app/(everywhere-else)/invite/[code]/page.tsx` — hero→class rename, whileInView stagger animations, spring on buttons
- `public/fonts/JejuHallasan-Regular.ttf` — New heading font file copied to worktree
