---
id: T02
parent: S03
milestone: M001
key_files:
  - src/app/(everywhere-else)/register/page.tsx
  - src/components/character-selection-screen.tsx
  - src/components/hero-details.tsx
  - src/components/hero-selection-grid.tsx
  - src/components/registration-modal.tsx
  - src/components/multi-step-registration-form.tsx
  - src/components/team-invite-modal.tsx
  - src/app/(everywhere-else)/invite/[code]/page.tsx
key_decisions:
  - Kept preselectedHero prop name on RegistrationModal component interface since renaming it would cascade to all callers without functional benefit — internal state renamed to selectedClass
  - Kept heroId key in API request bodies (maps to hero_id DB column) while renaming all UI-facing variable names to use class terminology
  - Kept file names hero-details.tsx and hero-selection-grid.tsx unchanged to avoid import path churn across the codebase
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:33:47.693Z
blocker_discovered: false
---

# T02: Rename hero→class and universe→party across all 9 registration components with updated UI copy and variable names

**Rename hero→class and universe→party across all 9 registration components with updated UI copy and variable names**

## What Happened

Systematically renamed hero→class and universe→party terminology across all 9 registration-related components. This was a large but formulaic task — mostly find-and-replace with attention to keeping `heroId` as the API/DB key while renaming all UI-facing text, state variables, function names, interfaces, and display copy.

**Changes by file:**

1. **register/page.tsx** — Renamed `HeroAvailability→ClassAvailability`, `selectedHero→selectedClass`, `heroAvailability→classAvailability`, `availableHeroes→availableClasses`, `totalHeroes→totalClasses`, `clickedHeroData→clickedClassData`, `handleHeroSelect→handleClassSelect`, `getTeamHeroAvailability→getTeamClassAvailability`, `isHeroAvailable→isClassAvailable`, `getTeamAvailableHeroesCount→getTeamAvailableClassesCount`. Updated blocks text (hero→class, universe→party). Changed "Character selection"→"Class selection", "Choose your hero"→"Choose your class", "Heroes Available"→"Classes Available", "Heroes"→"Classes" in count display. Updated aria-labels.

2. **character-selection-screen.tsx** — Renamed `selectedHero→selectedClass`, `getHeroDetails→getClassDetails`, `isHeroTaken→isClassTaken`, `getHeroStatus→getClassStatus`, `getHeroStatusColor→getClassStatusColor`, `handleHeroSelect→handleClassSelect`, `selectedHeroDetails→selectedClassDetails`. Changed "CHARACTER SELECTION"→"CLASS SELECTION", "CONFIRM HERO"→"CONFIRM CLASS", "HERO AVAILABLE"→"CLASS AVAILABLE", "Confirm Hero"→"Confirm Class".

3. **hero-details.tsx** — Renamed `HeroDetailsProps→ClassDetailsProps`, `heroDetails→classDetails`. Changed "Select a hero to see details"→"Select a class to see details".

4. **hero-selection-grid.tsx** — Renamed `HeroSelectionGridProps→ClassSelectionGridProps`, `onSelectHero→onSelectClass`, `selectedHero→selectedClass`, `hoveredHero→hoveredClass`, `isHeroAvailable→isClassAvailable`.

5. **registration-modal.tsx** — Renamed `selectedHero→selectedClass`, `preselectedHeroHandled→preselectedClassHandled`. Kept `heroId` key in API body for DB compatibility. Updated all prop passing to use `selectedClass`.

6. **multi-step-registration-form.tsx** — Renamed `HeroStatus→ClassStatus`, `HeroWithStatus→ClassWithStatus`, `heroesWithStatus→classesWithStatus`, `sortedHeroes→sortedClasses`, `availableHeroesCount→availableClassesCount`, `getHeroDetails→getClassDetails`, `heroDetails→classDetails`. Changed "Your Hero"→"Your Class".

7. **team-invite-modal.tsx** — Changed "universe"→"party" in help text.

8. **team-drawer.tsx** — No additional changes needed (already using CONSTANTS.PARTIES from T01).

9. **invite/[code]/page.tsx** — Renamed `selectedHero→selectedClass`, `handleHeroSelect→handleClassSelect`, `isHeroAvailable→isClassAvailable`, `availableHeroesCount→availableClassesCount`. Updated all blocks text, heading copy, button text. Changed "ALL HEROES FOR THIS TEAM ARE TAKEN"→"ALL CLASSES FOR THIS PARTY ARE TAKEN".

## Verification

All 6 task-level verification checks pass:
1. `bun run build` exits 0 — TypeScript compilation and static page generation succeed
2. `rg -i 'choose your hero' src/ --glob '*.tsx'` — 0 matches ✅
3. `rg -i 'Heroes Available' src/ --glob '*.tsx'` — 0 matches ✅
4. `rg 'CONSTANTS.HEROES' src/ --glob '*.tsx'` — 0 matches ✅
5. `rg 'CONSTANTS.TEAMS' src/ --glob '*.tsx'` — 0 matches ✅
6. `rg 'HERO_IMAGE_PATHS' src/ --glob '*.tsx'` — 0 matches ✅

Slice-level checks (from T01) also continue passing:
- HEROES not in constants.ts, CLASSES present, PARTIES present
- HERO_IMAGE_PATHS removed from constants.ts
- Rumble Brave removed from fonts.css, Jeju Hallasan present
- Peacehaven present in landing page

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `bun run build` | 0 | ✅ pass | 19100ms |
| 2 | `rg -i 'choose your hero' src/ --glob '*.tsx'` | 1 | ✅ pass (0 matches) | 50ms |
| 3 | `rg -i 'Heroes Available' src/ --glob '*.tsx'` | 1 | ✅ pass (0 matches) | 50ms |
| 4 | `rg 'CONSTANTS.HEROES' src/ --glob '*.tsx'` | 1 | ✅ pass (0 matches) | 50ms |
| 5 | `rg 'CONSTANTS.TEAMS' src/ --glob '*.tsx'` | 1 | ✅ pass (0 matches) | 50ms |
| 6 | `rg 'HERO_IMAGE_PATHS' src/ --glob '*.tsx'` | 1 | ✅ pass (0 matches) | 50ms |


## Deviations

None. All renames followed the task plan exactly. The `preselectedHero` prop name on RegistrationModal was kept unchanged since it's the component's interface prop — only internal state variables were renamed to `selectedClass`.

## Known Issues

The file names hero-details.tsx and hero-selection-grid.tsx still use the old 'hero' naming convention. These could be renamed to class-details.tsx and class-selection-grid.tsx in a future task, but doing so would require updating all import paths across the codebase.

## Files Created/Modified

- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/hero-details.tsx`
- `src/components/hero-selection-grid.tsx`
- `src/components/registration-modal.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/team-invite-modal.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
