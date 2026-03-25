# S03 Research: Animation and RSC

**Slice:** S03 — Animation and RSC
**Depth:** Targeted
**Researched:** 2026-03-25

## ⚠️ ACTIVE OVERRIDE

A user override was registered during this research that changes event content significantly. This override affects S03 because the RSC-converted landing page must display new content, and the animation/registration components reference terminology ("hero", "universe") that changes to "class" and "party". The override details:

- **Event dates:** 30 May – 1 June 2026 (was 26–28 June)
- **Venue:** Peacehaven, Genting Highlands (was Bayu Beach Resort, Port Dickson)
- **Pricing:** RM130 New Friends, RM160 YM Member (was RM250/RM300/RM550 three-tier)
- **Selection model:** "Choose Your Class" replaces "Choose Your Hero" — 5 generic classes (Warrior, Archer, Scout, Guardian, Scholar) replace 5 named character heroes (Alex, Suzzy, Charlotte, Charlie, Kai)
- **Group naming:** "PARTY 001" replaces "U001" universe codes
- **CG Leaders list:** Updated with additions (Daniel Loo, Jenisha Kong), removals (Clarice Low, May Jee), and the addition of "NOT SURE" option
- **Double ticket tier removed:** Only two price tiers now (New Friends RM130, YM Member RM160)

**Impact on S03:** The content override is orthogonal to the animation/RSC architecture work but must be applied to the landing page during RSC conversion (since we're rewriting it anyway). The hero→class rename affects `constants.ts`, the register page, character selection screen, invite page, hero-details, hero-selection-grid, registration modal, multi-step form, and several API routes. This is a significant scope expansion.

## Summary

S03 has two distinct workstreams that are largely independent:

**Workstream A — Landing Page RSC Conversion:** Convert `(landing)/page.tsx` from a monolithic `"use client"` component to a Server Component with client islands. The page currently uses `"use client"` for two reasons: (1) `motion` animations on every section, and (2) a `useState`/`useEffect` time check for registration open date. Both are solvable: time check moves to server-side date comparison, and animations get pushed into thin client wrapper components.

**Workstream B — Animation Architecture & Polish:** Create reusable motion wrapper components (`MotionDiv`, `MotionSection`, `FadeIn`, `StaggerContainer`), extract shared variant definitions into `src/lib/animations.ts`, upgrade all existing inline `initial`/`animate` to use `whileInView` for scroll-triggered entrances on the team grid, add spring physics to transitions, and add micro-interactions (hover/tap) to hero/class cards and buttons.

**Workstream C (from Override) — Content & Terminology Update:** Apply the override's content changes (dates, venue, pricing, hero→class rename, party numbering, CG leaders). This is a large but mechanical find-and-replace + data restructure in `constants.ts`, affecting 13+ files.

## Recommendation

Workstream C (content override) should be executed FIRST — before RSC conversion — because:
1. The landing page rewrite during RSC conversion should use the correct 2026 content from the start, not require a second pass
2. The hero→class/party rename touches the same files as animation polish (register page, character selection, invite page)
3. Constants.ts changes cascade to every component that imports from it — better to make these changes once and verify the build before adding animation complexity

Workstream A (RSC) should come second because it's the riskiest work (changing render boundaries).

Workstream B (animation polish) should come last because it's purely additive — it enhances what already works.

## Implementation Landscape

### Landing Page RSC Conversion (Workstream A)

**Current state of `(landing)/page.tsx`:**
- 1 file, ~130 lines, `"use client"` at top
- Uses `motion` from `motion/react` (motion.section, motion.div) — 10 motion elements
- Uses `useState` for `isRegistrationOpen` boolean
- Uses `useEffect` with `setInterval` for 1-second time checks
- Imports `CountdownTimer` (already a client component)
- Imports `Button` (no `"use client"` — it's a Radix-based component)
- Renders: hero image, masthead SVG, event details (dates, venue), pricing cards, register button OR countdown timer

**RSC conversion plan:**
1. Remove `"use client"` from page.tsx
2. Move time check to server: `const isRegistrationOpen = new Date() >= new Date(2026, 4, 30, 12, 30, 0)` (plain JS, no hooks)
3. Create `src/components/motion/motion-section.tsx` — thin `"use client"` wrapper for `motion.section`
4. Create `src/components/motion/motion-div.tsx` — thin `"use client"` wrapper for `motion.div`
5. Create `src/components/motion/fade-in.tsx` — opinionated `"use client"` wrapper for common fade+slide pattern
6. Replace inline `<motion.section>` / `<motion.div>` with `<MotionSection>` / `<MotionDiv>` / `<FadeIn>` imports
7. Pass `isRegistrationOpen` as a prop to a new `<RegistrationCTA>` client component that handles the conditional rendering of CountdownTimer vs Button

**Key constraint:** The `CountdownTimer` component needs `useState`/`useEffect` and must remain a client component. The conditional rendering (`{isRegistrationOpen ? button : countdown}`) can happen in a client wrapper that receives `isRegistrationOpen` as a server-computed prop.

**What stays server-rendered:** Hero image, masthead SVG, event dates, venue, pricing cards, disclaimer text — all static content. This is ~80% of the page.

**What becomes client islands:**
- `<MotionSection>` / `<MotionDiv>` / `<FadeIn>` — thin animation wrappers (~5 lines each)
- `<RegistrationCTA isOpen={boolean}>` — countdown timer + register button conditional
- `<CountdownTimer>` — already a client component, no changes needed

**Risk:** LOW. The pattern is well-documented (Motion docs, Next.js RSC docs). The landing layout is already a Server Component. The page just needs its `"use client"` removed and animations pushed into wrapper children.

### Animation Architecture (Workstream B)

**Current animation patterns (277 inline animation props across 8 files):**

| File | `initial/animate/transition` count | Pattern |
|------|----------------------------------|---------|
| `multi-step-registration-form.tsx` | 89 | Inline props on every section/heading |
| `invite/[code]/page.tsx` | 68 | Inline props everywhere |
| `register/page.tsx` | 40 | Inline per team section + hero card |
| `character-selection-screen.tsx` | 38 | Inline per hero row |
| `(landing)/page.tsx` | 32 | Inline per section |
| `loading-overlay.tsx` | 4 | AnimatePresence enter/exit |
| `time-restriction.tsx` | 3 | Simple fade-in |
| `countdown-timer.tsx` | 3 | Simple fade-in |

**Common patterns to extract:**
1. **Fade-in-up** (`opacity: 0, y: 20` → `opacity: 1, y: 0`) — used ~60 times
2. **Fade-in-left** (`opacity: 0, x: -20` → `opacity: 1, x: 0`) — used ~10 times
3. **Scale-in** (`scale: 0.8` → `scale: 1`) — used ~5 times
4. **Stagger children** (incrementing `delay` by 0.1–0.2 per index) — used in team lists, pricing, hero lists
5. **Hover scale** (`whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }`) — used on buttons, hero cards
6. **AnimatePresence modal** (enter/exit with opacity + scale) — used in loading-overlay, register page

**What to create:**
- `src/lib/animations.ts` — shared variant objects (stagger, fadeIn, fadeInLeft, scaleIn, hoverScale)
- `src/components/motion/motion-div.tsx` — `"use client"` wrapper for `motion.div`
- `src/components/motion/motion-section.tsx` — `"use client"` wrapper for `motion.section`
- `src/components/motion/fade-in.tsx` — opinionated fade+slide wrapper
- `src/components/motion/stagger-container.tsx` — parent container for staggered children

**Key upgrade — `whileInView` for scroll-triggered animations:**
Currently ALL animations trigger on mount (every team section animates simultaneously on page load). The team grid on the register page has 21 sections × 5 hero tiles = 105 animated elements all triggering at once. Converting to `whileInView` with `viewport={{ once: true }}` will:
- Reduce initial paint overhead (only visible elements animate)
- Create a natural scroll-reveal effect
- Eliminate the artificial `delay: 1.4 + teamIndex * 0.2 + heroIndex * 0.1` stacking that currently results in ~6+ seconds of delayed animations

**Spring physics upgrade:**
Current transitions use duration-based easing (`duration: 0.5, ease: "easeOut"`). Converting to spring physics (`type: "spring", stiffness: 400, damping: 17`) gives more natural, physics-based motion. Apply to:
- Hero/class card hover/tap (the `whileHover`/`whileTap` interactions)
- Button presses
- Modal enter/exit transitions

**AnimatePresence for form steps:**
The multi-step registration form (1,771 lines) already uses `motion` elements but does NOT use `AnimatePresence` for step transitions. The form uses state-based conditional rendering (`currentStep === 1 ? <Step1 /> : ...`). Wrapping with `AnimatePresence mode="wait"` and adding `exit` animations would create smooth step-to-step transitions. However, given the 1,771-line form with zero test coverage, this should be cosmetic-only — add AnimatePresence at the step level without modifying form logic.

### Content & Terminology Update (Workstream C — from Override)

**Files that need content changes:**

| File | Changes |
|------|---------|
| `src/lib/constants.ts` | Complete rewrite of HEROES→CLASSES, TEAMS→PARTIES (code U→PARTY), HERO_IMAGE_PATHS removal (no per-class-per-party images), CG_LEADERS update, pricing data if stored here |
| `src/app/(landing)/page.tsx` | Dates: "30 May to 1 June", Venue: "Peacehaven, Genting Highlands", Pricing: 2 tiers (RM130/RM160), remove double-ticket tier, remove "*non-Muslims only" |
| `src/app/(everywhere-else)/register/page.tsx` | "Choose your hero"→"Choose your class", `blocks` array text replacement, "Heroes Available"→"Classes Available", hero→class throughout, universe→party, team code display |
| `src/components/character-selection-screen.tsx` | "CHARACTER SELECTION"→"CLASS SELECTION", "CONFIRM HERO"→"CONFIRM CLASS", hero→class terminology throughout, remove per-hero images (classes don't have unique per-party images) |
| `src/components/hero-details.tsx` | Rename to class-details or update hero→class terminology, remove hero-specific image paths, show class description |
| `src/components/hero-selection-grid.tsx` | Rename to class-selection-grid or update hero→class terminology, remove per-party hero images |
| `src/components/registration-modal.tsx` | hero→class props, selectedHero→selectedClass |
| `src/components/multi-step-registration-form.tsx` | hero references (54 occurrences), hero_id→class_id semantically |
| `src/components/team-invite-modal.tsx` | "universe"→"party" in copy text |
| `src/components/team-drawer.tsx` | hero references, team→party copy |
| `src/components/time-restriction.tsx` | Date update: May 30 instead of May 10 |
| `src/components/countdown-timer.tsx` | No content changes, just receives props |
| `src/app/(everywhere-else)/invite/[code]/page.tsx` | "Choose your hero"→"Choose your class", blocks text, hero→class throughout |

**Critical constraint — Database columns:**
The Supabase database has columns named `hero_id`, `hero_availability` table, etc. The API routes reference these columns directly. We have two options:
1. **Rename DB columns** (requires Supabase migration) — cleanest but requires DB access
2. **Keep DB columns as-is, map at the application layer** — `hero_id` in DB stores class IDs, frontend uses "class" terminology while API routes still send/receive `heroId`

**Recommended approach:** Option 2 — keep DB schema unchanged, rename only in the frontend/constants layer. The `hero_id` column stores a string ID (`"warrior"`, `"archer"`, etc. instead of `"alex"`, `"suzzy"`) and the `hero_availability` table tracks class availability per party. This avoids any DB migration risk.

**HERO_IMAGE_PATHS:** The current system has 105 unique per-hero-per-team images (21 teams × 5 heroes). With generic classes (Warrior, Archer, etc.), there likely aren't per-party images. The image path system needs to be simplified — either 5 class icons shared across all parties, or removed entirely if no class images are provided. This is a significant UI change for the register page and invite page, which currently show image grids.

## Pitfalls

### 1. The 1,771-line form is a minefield
The `multi-step-registration-form.tsx` has 89 animation props and 54 hero references. The plan says "cosmetic changes only." Adding AnimatePresence for step transitions is safe (wrapper-level change). But the hero→class rename touches internal variables, props, and display text throughout. This MUST be done carefully — ideally with targeted sed replacements verified by build, not wholesale rewrites.

### 2. Image system collapse
The current registration UI is image-heavy — each "hero" tile is a unique character illustration specific to that team (e.g., Spider-Man-themed Alex for Spider Five). With generic classes (Warrior, Archer, etc.), there won't be 105 unique images. The entire registration grid UI changes from "click a character portrait" to "click a class icon/card." This is a UI redesign, not just a text swap. The planner must decide: use placeholder class icons, or redesign the grid to be text/icon based?

### 3. RSC time check has a caching edge case
Moving `new Date() >= targetDate` to the server means the result is computed at render time. If the page is statically cached (ISR/SSG), the registration-open check could be stale. The current setup with `useEffect` + `setInterval` is real-time. The fix: ensure the landing page uses `dynamic = "force-dynamic"` or pass the server-computed value to a client component that also runs its own time check as a fallback.

### 4. Pricing tier simplification
The current landing page renders 3 pricing tiers with a `map()` over an array that includes `originalPrice` (strikethrough) logic. The new pricing is simpler (2 tiers, no strikethrough), but the structure needs updating, not just the values.

### 5. AnimatePresence + React 19 strict mode
React 19's strict mode double-mounts components, which can cause AnimatePresence to fire enter animations twice. The existing usage in `loading-overlay.tsx` and `register/page.tsx` hasn't been reported as broken, so this is likely already handled by Motion 12. But test the form step transitions carefully after adding AnimatePresence.

## Files to Read (for planner)

**Must read before planning tasks:**
- `src/app/(landing)/page.tsx` — primary RSC conversion target (130 lines)
- `src/lib/constants.ts` — HEROES, TEAMS, HERO_IMAGE_PATHS, CG_LEADERS data that needs override updates
- `src/app/(everywhere-else)/register/page.tsx` — hero→class rename, animation polish target (312 lines)

**Should read for context:**
- `src/components/character-selection-screen.tsx` — hero→class rename, animation target (220 lines)
- `src/components/hero-details.tsx` — hero→class rename (80 lines)
- `src/components/hero-selection-grid.tsx` — hero→class rename (100 lines)
- `src/components/registration-modal.tsx` — hero→class prop threading (180 lines)

**Reference only (do not modify logic):**
- `src/components/multi-step-registration-form.tsx` — 1,771 lines, cosmetic hero→class only, ADD AnimatePresence wrapper for step transitions only
- `src/app/api/register/route.ts` — keep `heroId` param name (maps to DB column), update only if adding class-specific validation
- `src/app/api/hero-availability/route.ts` — keep as-is (DB table name unchanged)

## Natural Task Decomposition

The work splits into 5 independent tasks:

1. **Content Override in Constants + Landing Page** (~45 min) — Update `constants.ts` (classes, parties, CG leaders), update landing page content (dates, venue, pricing), update `time-restriction.tsx` date. Build-verify.

2. **Hero→Class Rename Across Registration Components** (~60 min) — Rename hero→class in register page, character-selection-screen, hero-details, hero-selection-grid, invite page, registration-modal, team-invite-modal, team-drawer, multi-step-registration-form (cosmetic only). Universe→party rename. Build-verify.

3. **Motion Wrapper Components + Shared Variants** (~30 min) — Create `src/components/motion/` directory with MotionDiv, MotionSection, FadeIn, StaggerContainer. Create `src/lib/animations.ts` with shared variant definitions. No existing code changes yet.

4. **Landing Page RSC Conversion** (~45 min) — Remove `"use client"`, create RegistrationCTA client island, use motion wrappers for animations, server-side time check. Add `dynamic = "force-dynamic"` for correctness. Build-verify.

5. **Animation Polish (spring physics, whileInView, AnimatePresence)** (~45 min) — Upgrade register page team grid to `whileInView` + stagger variants. Add spring physics to hover/tap interactions. Add AnimatePresence to form step transitions (wrapper only). Build-verify.

Tasks 1→2 must be sequential (constants change before components that reference them). Task 3 is independent. Task 4 depends on Task 1 (landing page content) and Task 3 (motion wrappers). Task 5 depends on Task 2 (class rename done) and Task 3 (variants file).

## Skill Discovery

**motion (animation library):** Already in the codebase as `motion@12.38.0`. Import path is `motion/react`. No additional skill needed — the M001-RESEARCH.md already documents the wrapper pattern and spring physics approach thoroughly.

**Next.js RSC patterns:** Core framework knowledge, well-documented in M001-CONTEXT.md architecture section. The `react-best-practices` skill is already available and covers RSC patterns.

No external skills needed for this slice.
