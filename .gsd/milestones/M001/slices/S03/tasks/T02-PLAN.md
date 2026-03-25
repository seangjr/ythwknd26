---
estimated_steps: 95
estimated_files: 9
skills_used: []
---

# T02: Rename hero→class and universe→party across all registration components

Mechanical rename of hero→class and universe→party terminology across all registration-related components. This is the largest task by file count but the changes are formulaic — mostly find-and-replace with careful attention to what stays unchanged.

**What changes (UI text, labels, variables, props, display):**

1. `src/app/(everywhere-else)/register/page.tsx` (~312 lines):
   - "Character selection" → "Class selection" in header
   - "Choose your hero" → "Choose your class"
   - Replace `blocks` array text with override copy (party/class wording)
   - "Heroes Available" → "Classes Available"
   - `selectedHero` → `selectedClass` (state variable)
   - `handleHeroSelect` → `handleClassSelect` (function)
   - `heroAvailability` → `classAvailability` (state/types)
   - `HeroAvailability` → `ClassAvailability` (interface)
   - "Heroes" → "Classes" in availability count display
   - `getHeroImagePath` → remove (no per-party class images). For class display, use text/icon-based display or a single shared icon per class. Use a placeholder or the class name initial as fallback.
   - `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`
   - `CONSTANTS.TEAMS` → `CONSTANTS.PARTIES`
   - `team.code` display stays (now shows "PARTY 001" etc.)
   - "universe" → "party" in comments and copy
   - Keep `hero_id` in Supabase queries — this is the DB column name
   - `aria-label` text: update hero→class, team→party

2. `src/components/character-selection-screen.tsx` (~220 lines):
   - "CHARACTER SELECTION" → "CLASS SELECTION"
   - "CONFIRM HERO" → "CONFIRM CLASS"
   - "HERO AVAILABLE" → "CLASS AVAILABLE"
   - "YOUR SELECTION" stays (it's generic)
   - `selectedHero` → `selectedClass` (internal state)
   - `preselectedHero` prop stays (registration-modal passes it — rename there too)
   - Remove `getHeroImagePath` usage — use placeholder/class-icon
   - `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`
   - `heroDetails` → `classDetails` (variable)
   - "Confirm Hero" button text → "Confirm Class"

3. `src/components/hero-details.tsx` (~80 lines):
   - `HeroDetailsProps` → `ClassDetailsProps`
   - `heroId` prop → `classId`
   - `heroDetails` → `classDetails`
   - "Select a hero to see details" → "Select a class to see details"
   - Remove `getHeroImagePath` — use a shared class icon or text-based display
   - `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`
   - The `class` and `perk` fields from old HEROES don't exist in new CLASSES. New CLASSES have: `id`, `name`, `description`. Update the detail card to show class name and description.

4. `src/components/hero-selection-grid.tsx` (~100 lines):
   - `HeroSelectionGridProps` → `ClassSelectionGridProps`
   - `onSelectHero` → `onSelectClass`
   - `selectedHero` → `selectedClass`
   - `hoveredHero` → `hoveredClass`
   - `isHeroAvailable` → `isClassAvailable`
   - Remove hero image display — use text/initial-based class cards
   - `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`

5. `src/components/registration-modal.tsx` (~180 lines):
   - `selectedHero` → `selectedClass`
   - `preselectedHero` prop → `preselectedClass`
   - `preselectedHeroHandled` → `preselectedClassHandled`
   - `handleCharacterConfirm` takes classId
   - API body still sends `heroId: selectedClass` — keep `heroId` key for DB compatibility

6. `src/components/multi-step-registration-form.tsx` (~1771 lines, COSMETIC ONLY):
   - `selectedHero` prop → `selectedClass`
   - `heroDetails` → `classDetails`
   - `getHeroImagePath` → remove, use placeholder
   - "Your Hero" heading → "Your Class"
   - `heroesWithStatus` → `classesWithStatus`
   - `HeroStatus` type → `ClassStatus`
   - `HeroWithStatus` → `ClassWithStatus`
   - `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`
   - Display class name instead of hero name in team member list
   - **DO NOT modify form logic, validation, step transitions, or data submission**

7. `src/components/team-invite-modal.tsx` (~170 lines):
   - "universe" → "party" in the help text ("register for an available line in this universe" → "...in this party")

8. `src/components/team-drawer.tsx` (~160 lines):
   - `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`
   - `CONSTANTS.TEAMS` → `CONSTANTS.PARTIES`
   - `reg.hero` → adapt to new field structure
   - Remove hero icon image lookup

9. `src/app/(everywhere-else)/invite/[code]/page.tsx` (~580 lines):
   - "Choose your hero" → "Choose your class"
   - "Heroes Available" → "Classes Available"
   - Replace `blocks` array with override party/class copy
   - "Select Your Hero" → "Select Your Class"
   - "Hero Details" → "Class Details"
   - "Register With Selected Hero" → "Register With Selected Class"
   - "ALL HEROES FOR THIS TEAM ARE TAKEN" → "ALL CLASSES FOR THIS PARTY ARE TAKEN"
   - `selectedHero` → `selectedClass`
   - `getHeroImagePath` → remove, use placeholder
   - `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`
   - `CONSTANTS.TEAMS` → `CONSTANTS.PARTIES`
   - `availableHeroes` → `availableClasses` (state)
   - "No Team Members Yet" → stays (generic enough)

**What stays unchanged:**
- `heroId` parameter in API fetch calls (maps to DB `hero_id` column)
- `hero_id` in Supabase `.select()` and `.eq()` queries
- API route files (`/api/register/route.ts`, `/api/hero-availability/route.ts`, `/api/sheets-sync/route.ts`, `/api/team-members/route.ts`)
- Form validation schema and logic in multi-step-registration-form.tsx
- `hero_availability` Supabase table name references

**Image handling strategy:** Since generic classes (Warrior, Archer, etc.) don't have 105 per-party unique images, remove all `getHeroImagePath` calls. Replace with either:
- A simple colored initial/icon for each class (e.g., first letter in a colored circle)
- A text-based card with class name and description
- A `/placeholder.svg` fallback
The registration grid changes from an image-heavy portrait grid to a text/card-based class selection grid.

## Inputs

- `src/lib/constants.ts`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/hero-details.tsx`
- `src/components/hero-selection-grid.tsx`
- `src/components/registration-modal.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/team-invite-modal.tsx`
- `src/components/team-drawer.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`

## Expected Output

- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/hero-details.tsx`
- `src/components/hero-selection-grid.tsx`
- `src/components/registration-modal.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/team-invite-modal.tsx`
- `src/components/team-drawer.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`

## Verification

bun run build exits 0 && rg -i 'choose your hero' src/ --glob '*.tsx' returns 0 matches && rg -i 'Heroes Available' src/ --glob '*.tsx' returns 0 matches && rg 'CONSTANTS.HEROES' src/ --glob '*.tsx' returns 0 matches && rg 'CONSTANTS.TEAMS' src/ --glob '*.tsx' returns 0 matches && rg 'HERO_IMAGE_PATHS' src/ --glob '*.tsx' returns 0 matches
