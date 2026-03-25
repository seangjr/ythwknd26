---
id: T05
parent: S03
milestone: M001
key_files:
  - src/app/(everywhere-else)/register/page.tsx
  - src/components/multi-step-registration-form.tsx
  - src/components/character-selection-screen.tsx
  - src/app/(everywhere-else)/invite/[code]/page.tsx
key_decisions:
  - Used inline spring transition objects in whileHover/whileTap props rather than a shared constant when the element also has an entrance transition prop — this prevents the gesture spring from overriding the entrance duration-based animation
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:42:51.342Z
blocker_discovered: false
---

# T05: Polish animations with spring physics, whileInView scroll-triggered entrances, and AnimatePresence step transitions

**Polish animations with spring physics, whileInView scroll-triggered entrances, and AnimatePresence step transitions**

## What Happened

Implemented four targeted animation improvements across the registration flow:

1. **Register page (`register/page.tsx`)**: Replaced mount-based `initial/animate` with `whileInView` using stagger variants from `animations.ts`. The party grid now uses `staggerContainer` as the parent variant with `whileInView="visible"` and `viewport={{ once: true, margin: "-100px" }}`, with party headers using `fadeInLeft` and class tiles using `scaleIn` children variants. Removed all manual `delay: 1.4 + teamIndex * 0.2 + classIndex * 0.1` calculations. Added `springTransition` to invite button and class card hover/tap interactions.

2. **Multi-step registration form (`multi-step-registration-form.tsx`)**: Added `AnimatePresence mode="wait"` wrapper around the step conditionals. Each step div was converted to `motion.div` with `key="step-N"`, `initial={{ opacity: 0, x: 20 }}`, `animate={{ opacity: 1, x: 0 }}`, `exit={{ opacity: 0, x: -20 }}`, and `transition={{ duration: 0.3 }}`. No form logic, validation, or submission handlers were modified.

3. **Character selection screen (`character-selection-screen.tsx`)**: Added spring physics (`type: "spring", stiffness: 400, damping: 17`) to class list item hover/tap, confirm button hover/tap, and footer social icon hover interactions. Imported `springTransition` from animations library.

4. **Invite page (`invite/[code]/page.tsx`)**: Converted the team card section to `whileInView` with `staggerContainer`/`fadeInLeft`/`scaleIn` variants. Added spring physics to the error page return button. Imported shared variants from animations library.

## Verification

Build passes (`bun run build` exits 0). All five grep checks confirm pattern presence:
- `whileInView` in register/page.tsx ✓
- `spring` in register/page.tsx ✓
- `AnimatePresence` in multi-step-registration-form.tsx ✓
- `whileInView` in invite/[code]/page.tsx ✓
- `spring` in character-selection-screen.tsx ✓

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `bun run build` | 0 | ✅ pass | 15000ms |
| 2 | `rg 'whileInView' 'src/app/(everywhere-else)/register/page.tsx'` | 0 | ✅ pass | 50ms |
| 3 | `rg 'spring' 'src/app/(everywhere-else)/register/page.tsx'` | 0 | ✅ pass | 50ms |
| 4 | `rg 'AnimatePresence' src/components/multi-step-registration-form.tsx` | 0 | ✅ pass | 50ms |
| 5 | `rg 'whileInView' 'src/app/(everywhere-else)/invite/[code]/page.tsx'` | 0 | ✅ pass | 50ms |
| 6 | `rg 'spring' src/components/character-selection-screen.tsx` | 0 | ✅ pass | 50ms |


## Deviations

Used inline spring transition objects `{ type: "spring", stiffness: 400, damping: 17 }` inside whileHover/whileTap props in character-selection-screen.tsx instead of the imported `springTransition` constant, because motion elements with both an entrance `transition` and gesture `transition` need the gesture transition embedded in the gesture prop itself to avoid overriding the entrance animation timing.

## Known Issues

None.

## Files Created/Modified

- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/character-selection-screen.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
