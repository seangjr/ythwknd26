---
id: T01
parent: S03
milestone: M001
key_files:
  - src/lib/constants.ts
  - src/app/(landing)/page.tsx
  - src/styles/fonts.css
  - src/app/globals.css
  - public/fonts/JejuHallasan-Regular.ttf
  - src/components/hero-details.tsx
  - src/components/hero-selection-grid.tsx
  - src/components/team-drawer.tsx
  - src/components/character-selection-screen.tsx
  - src/components/multi-step-registration-form.tsx
  - src/app/(everywhere-else)/register/page.tsx
  - src/app/(everywhere-else)/invite/[code]/page.tsx
key_decisions:
  - Kept --font-rumble CSS variable name pointing to Jeju Hallasan to avoid breaking 72 class references across the codebase
  - Applied mechanical HEROES→CLASSES and TEAMS→PARTIES renames in 7 downstream files to maintain build integrity, even though those files will be further reworked in later tasks
  - Simplified all getHeroImagePath functions to return placeholder.svg since per-party hero images no longer exist in the class-based model
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:24:52.179Z
blocker_discovered: false
---

# T01: Update constants (HEROES→CLASSES, TEAMS→PARTIES, remove HERO_IMAGE_PATHS, update CG_LEADERS), landing page (dates, venue, pricing), and heading font (Rumble Brave→Jeju Hallasan) for 2026

**Update constants (HEROES→CLASSES, TEAMS→PARTIES, remove HERO_IMAGE_PATHS, update CG_LEADERS), landing page (dates, venue, pricing), and heading font (Rumble Brave→Jeju Hallasan) for 2026**

## What Happened

Executed three main changes per the task plan:

**1. Constants rewrite (`src/lib/constants.ts`):**
- Replaced `HEROES` array (5 named heroes with icon/class/perk) with `CLASSES` array (5 generic classes: Warrior, Archer, Scout, Guardian, Scholar — each with id, name, description only).
- Replaced `TEAMS` array with `PARTIES` array — same 21 entries with same IDs and colors, but generic names ("Party 001" through "Party 021") and codes ("PARTY 001" etc.).
- Removed `HERO_IMAGE_PATHS` array entirely (was 105 entries for per-party hero images; classes don't have unique images).
- Updated `CG_LEADERS`: added "Daniel Loo", "Jenisha Kong", "NOT SURE"; removed "Clarice Low", "May Jee"; changed "Christopher & Oscar" → "Christopher + Oscar" and "Yae-Ber Neo" → "Yae-ber NEO"; kept alphabetical order.

**2. Landing page content (`src/app/(landing)/page.tsx`):**
- Changed dates: "27 to 29 June" → "30 May to 1 June"
- Changed venue: "Bayu Beach Resort / Port Dickson" → "Peacehaven / Genting Highlands"
- Replaced 3-tier pricing (RM550/RM300/RM250) with 2-tier: RM130 NEW FRIENDS, RM160 YM MEMBER — no strikethrough pricing.
- Removed both disclaimers ("Must consist of one YM member and one new friend" and "For non-Muslims only").

**3. Heading font replacement:**
- Copied `JejuHallasan-Regular.ttf` from main repo to worktree `public/fonts/`.
- Updated `src/styles/fonts.css`: font-family "Rumble Brave" → "Jeju Hallasan", format opentype → truetype, .otf → .ttf.
- Updated `src/app/globals.css`: `--font-rumble` value changed to "Jeju Hallasan" (variable name preserved to avoid breaking 72 class references).

**Downstream fixes required for build:** Renaming HEROES/TEAMS/HERO_IMAGE_PATHS in constants caused TypeScript errors in 7 downstream files that referenced these old property names. Applied mechanical renames (HEROES→CLASSES, TEAMS→PARTIES) and simplified `getHeroImagePath` functions to return placeholder since per-party images no longer exist. This was necessary for `bun run build` to pass.

## Verification

All 9 verification checks from the task plan pass:
1. `rg 'HEROES' src/lib/constants.ts` → 0 matches ✅
2. `rg 'CLASSES' src/lib/constants.ts` → matches found ✅
3. `rg 'PARTIES' src/lib/constants.ts` → matches found ✅
4. `rg 'HERO_IMAGE_PATHS' src/lib/constants.ts` → 0 matches ✅
5. `rg 'Rumble Brave' src/styles/fonts.css` → 0 matches ✅
6. `rg 'Jeju Hallasan' src/styles/fonts.css` → matches found ✅
7. `rg 'Peacehaven' page.tsx` → matches found ✅
8. `rg 'RM550|RM300|RM250' page.tsx` → 0 matches ✅
9. `test -f public/fonts/JejuHallasan-Regular.ttf` → exists ✅
10. `bun run build` exits 0 ✅
11. `time-restriction.tsx` date verified correct (May 10, 2026) ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `bun run build` | 0 | ✅ pass | 16500ms |
| 2 | `rg 'HEROES' src/lib/constants.ts | wc -l` | 0 | ✅ pass (0 matches) | 50ms |
| 3 | `rg 'CLASSES' src/lib/constants.ts` | 0 | ✅ pass (matches found) | 50ms |
| 4 | `rg 'PARTIES' src/lib/constants.ts` | 0 | ✅ pass (matches found) | 50ms |
| 5 | `rg 'HERO_IMAGE_PATHS' src/lib/constants.ts | wc -l` | 0 | ✅ pass (0 matches) | 50ms |
| 6 | `rg 'Rumble Brave' src/styles/fonts.css | wc -l` | 0 | ✅ pass (0 matches) | 50ms |
| 7 | `rg 'Jeju Hallasan' src/styles/fonts.css` | 0 | ✅ pass (matches found) | 50ms |
| 8 | `rg 'Peacehaven' src/app/(landing)/page.tsx` | 0 | ✅ pass (matches found) | 50ms |
| 9 | `rg 'RM550|RM300|RM250' src/app/(landing)/page.tsx | wc -l` | 0 | ✅ pass (0 matches) | 50ms |
| 10 | `test -f public/fonts/JejuHallasan-Regular.ttf` | 0 | ✅ pass (file exists) | 10ms |


## Deviations

Updated 7 downstream files (hero-details, hero-selection-grid, team-drawer, character-selection-screen, multi-step-registration-form, register/page, invite/page) to rename HEROES→CLASSES, TEAMS→PARTIES, and replace HERO_IMAGE_PATHS references with placeholder returns. This was not in the task plan but was required for `bun run build` to pass — the type checker rejects references to properties that no longer exist on CONSTANTS.

## Known Issues

All getHeroImagePath functions now return "/placeholder.svg" since HERO_IMAGE_PATHS was removed. The character-selection-screen.tsx still references class/perk section which was replaced with a description-only section. These are expected to be reworked when the class selection model is implemented in later tasks.

## Files Created/Modified

- `src/lib/constants.ts`
- `src/app/(landing)/page.tsx`
- `src/styles/fonts.css`
- `src/app/globals.css`
- `public/fonts/JejuHallasan-Regular.ttf`
- `src/components/hero-details.tsx`
- `src/components/hero-selection-grid.tsx`
- `src/components/team-drawer.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
