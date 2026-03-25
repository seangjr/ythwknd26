# S03: Animation and RSC

**Goal:** Site shows confirmed 2026 event details (dates May 30–June 1, Peacehaven venue, RM130/RM160 pricing, class selection model, party naming, updated CG leaders), heading font replaced with Jeju Hallasan, landing page loads faster via server rendering with client islands, and all animations feel polished with spring physics and scroll-triggered entrances.
**Demo:** landing page loads faster via server rendering with client islands, and all animations feel polished with smooth physics

## Must-Haves

- `constants.ts` exports CLASSES (5 generic classes) instead of HEROES, PARTIES instead of TEAMS (with PARTY 001–021 codes), updated CG_LEADERS list, and HERO_IMAGE_PATHS is removed
- Landing page shows "30 May to 1 June", "Peacehaven, Genting Highlands", 2-tier pricing (RM130/RM160), no double ticket, no "*non-Muslims only"
- All "hero" terminology replaced with "class" and "universe" with "party" across register page, invite page, character-selection, hero-details, hero-selection-grid, registration-modal, team-invite-modal, team-drawer, multi-step-registration-form
- Heading font is Jeju Hallasan (loaded from `/fonts/JejuHallasan-Regular.ttf`) applied via `font-rumble` CSS variable
- Landing page.tsx has NO `"use client"` directive — it's a Server Component
- Motion wrapper components exist at `src/components/motion/` (MotionDiv, MotionSection, FadeIn, StaggerContainer)
- Shared animation variants defined in `src/lib/animations.ts`
- Landing page uses motion wrapper components for animations
- Registration page team grid uses `whileInView` with `viewport={{ once: true }}` instead of mount-based animations
- Hover/tap interactions use spring physics (`type: "spring"`)
- Multi-step registration form has `AnimatePresence mode="wait"` wrapper for step transitions
- `bun run build` exits 0 with no TypeScript errors

## Proof Level

- This slice proves: Contract — build passes with correct content, RSC boundaries verified, animations structurally present

## Integration Closure

Upstream: consumes S01's motion/react imports, semantic color tokens, and S02's updated year references. New wiring: landing page becomes RSC with client island components; motion wrappers provide reusable animation primitives. What remains: S04 verification of full registration flow end-to-end across browsers.

## Verification

- None — all changes are frontend presentation layer. No new API routes, background processes, or error paths introduced.

## Tasks

- [x] **T01: Update constants, landing page content, and heading font for 2026** `est:45m`
  Update constants.ts to replace HEROES with CLASSES (5 generic classes: Warrior, Archer, Scout, Guardian, Scholar), TEAMS with PARTIES (PARTY 001–021 codes), remove HERO_IMAGE_PATHS, update CG_LEADERS. Update landing page content: dates to '30 May to 1 June', venue to 'Peacehaven, Genting Highlands', pricing to 2 tiers (RM130/RM160), remove double ticket tier and '*non-Muslims only' note. Replace heading font from Rumble Brave to Jeju Hallasan in fonts.css and globals.css. Copy the font file into the worktree. Build-verify.
  - Files: `src/lib/constants.ts`, `src/app/(landing)/page.tsx`, `src/components/time-restriction.tsx`, `src/styles/fonts.css`, `src/app/globals.css`, `public/fonts/JejuHallasan-Regular.ttf`
  - Verify: bun run build exits 0 && rg 'HEROES' src/lib/constants.ts returns 0 matches && rg 'CLASSES' src/lib/constants.ts returns matches && rg 'Rumble Brave' src/styles/fonts.css returns 0 matches && rg 'Jeju Hallasan' src/styles/fonts.css returns matches && rg 'Peacehaven' 'src/app/(landing)/page.tsx' returns matches

- [x] **T02: Rename hero→class and universe→party across all registration components** `est:60m`
  Mechanical rename across all registration-related components. Replace 'hero' with 'class', 'Hero' with 'Class', 'HERO' with 'CLASS' in UI text/labels/headings. Replace 'universe' with 'party' in copy text. Update instructional blocks text to match the override copy. Remove per-hero image lookup (getHeroImagePath) from components — replace with generic class icon/placeholder or text-based display since classes don't have per-party unique images. Keep API route parameter names unchanged (heroId maps to DB hero_id column). Keep DB column names as-is. Update component file names if needed (hero-details → class-details etc.) or update just the content. Cosmetic-only changes in multi-step-registration-form.tsx — do NOT modify form logic.
  - Files: `src/app/(everywhere-else)/register/page.tsx`, `src/components/character-selection-screen.tsx`, `src/components/hero-details.tsx`, `src/components/hero-selection-grid.tsx`, `src/components/registration-modal.tsx`, `src/components/multi-step-registration-form.tsx`, `src/components/team-invite-modal.tsx`, `src/components/team-drawer.tsx`, `src/app/(everywhere-else)/invite/[code]/page.tsx`
  - Verify: bun run build exits 0 && rg -i 'choose your hero' src/ --glob '*.tsx' returns 0 matches && rg -i 'Heroes Available' src/ --glob '*.tsx' returns 0 matches && rg 'universe' src/ --glob '*.tsx' | grep -v 'Multiverse\|parallel universe\|klingon' returns 0 matches

- [x] **T03: Create motion wrapper components and shared animation variants** `est:30m`
  Create reusable 'use client' motion wrapper components and a shared animation variants file. This provides the animation infrastructure needed for RSC conversion (T04) and animation polish (T05).
  - Files: `src/components/motion/motion-div.tsx`, `src/components/motion/motion-section.tsx`, `src/components/motion/fade-in.tsx`, `src/components/motion/stagger-container.tsx`, `src/components/motion/index.ts`, `src/lib/animations.ts`
  - Verify: bun run build exits 0 && test -f src/components/motion/motion-div.tsx && test -f src/components/motion/motion-section.tsx && test -f src/components/motion/fade-in.tsx && test -f src/components/motion/stagger-container.tsx && test -f src/lib/animations.ts

- [x] **T04: Convert landing page to Server Component with client islands** `est:45m`
  Remove 'use client' from landing page. Move time check to server-side (plain Date comparison). Create RegistrationCTA client component for countdown/button conditional. Replace inline motion elements with motion wrapper imports from T03. Add export const dynamic = 'force-dynamic' to prevent stale time check caching. The page content should already reflect T01's 2026 updates.
  - Files: `src/app/(landing)/page.tsx`, `src/components/registration-cta.tsx`
  - Verify: bun run build exits 0 && ! grep -q 'use client' 'src/app/(landing)/page.tsx' && grep -q 'force-dynamic' 'src/app/(landing)/page.tsx' && test -f src/components/registration-cta.tsx && grep -q 'use client' src/components/registration-cta.tsx

- [x] **T05: Polish animations with spring physics, whileInView, and AnimatePresence** `est:45m`
  Upgrade animation quality across the registration flow. Convert team grid on register page to use whileInView with viewport={{ once: true }} and stagger variants from animations.ts instead of mount-based delay-stacked animations. Add spring physics to hover/tap interactions on class cards and buttons. Add AnimatePresence mode='wait' wrapper around form step transitions in multi-step-registration-form.tsx (wrapper-level only — do NOT modify form logic). Apply same polish to invite page team card animations.
  - Files: `src/app/(everywhere-else)/register/page.tsx`, `src/components/multi-step-registration-form.tsx`, `src/components/character-selection-screen.tsx`, `src/app/(everywhere-else)/invite/[code]/page.tsx`
  - Verify: bun run build exits 0 && rg 'whileInView' 'src/app/(everywhere-else)/register/page.tsx' returns matches && rg 'spring' 'src/app/(everywhere-else)/register/page.tsx' returns matches && rg 'AnimatePresence' src/components/multi-step-registration-form.tsx returns matches

## Files Likely Touched

- src/lib/constants.ts
- src/app/(landing)/page.tsx
- src/components/time-restriction.tsx
- src/styles/fonts.css
- src/app/globals.css
- public/fonts/JejuHallasan-Regular.ttf
- src/app/(everywhere-else)/register/page.tsx
- src/components/character-selection-screen.tsx
- src/components/hero-details.tsx
- src/components/hero-selection-grid.tsx
- src/components/registration-modal.tsx
- src/components/multi-step-registration-form.tsx
- src/components/team-invite-modal.tsx
- src/components/team-drawer.tsx
- src/app/(everywhere-else)/invite/[code]/page.tsx
- src/components/motion/motion-div.tsx
- src/components/motion/motion-section.tsx
- src/components/motion/fade-in.tsx
- src/components/motion/stagger-container.tsx
- src/components/motion/index.ts
- src/lib/animations.ts
- src/components/registration-cta.tsx
