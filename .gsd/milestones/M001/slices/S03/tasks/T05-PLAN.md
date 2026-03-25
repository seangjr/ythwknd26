---
estimated_steps: 48
estimated_files: 5
skills_used: []
---

# T05: Polish animations with spring physics, whileInView, and AnimatePresence

Upgrade animation quality across the registration flow. Three targeted improvements that make the site feel polished without modifying any business logic.

**1. whileInView for team/party grid on register page (`register/page.tsx`):**

Currently, all 21 party sections × 5 class tiles = 105 animated elements trigger simultaneously on mount with artificial delay stacking (`delay: 1.4 + teamIndex * 0.2 + heroIndex * 0.1`, resulting in 6+ seconds of delayed animations). Convert to scroll-triggered:

- Replace `initial/animate` with `initial/whileInView` on team card `<motion.div>` elements
- Add `viewport={{ once: true, margin: "-100px" }}` so elements animate slightly before entering the viewport
- Use stagger variants from `src/lib/animations.ts` instead of manual `delay` calculations:
  - Party header: `fadeInLeft` variant
  - Class tiles within each party: `scaleIn` variant with staggered children
- Import `staggerContainer` variant from `src/lib/animations.ts` for the parent container
- Remove all the `delay: 1.4 + teamIndex * 0.2 + heroIndex * 0.1` manual delay calculations

**2. Spring physics for hover/tap interactions:**

Replace duration-based transitions on interactive elements with spring physics:

- Class card `whileHover`/`whileTap`: use `springTransition` from `animations.ts`
  - `whileHover={{ scale: 1.05 }}` + `transition={{ type: "spring", stiffness: 400, damping: 17 }}`
  - `whileTap={{ scale: 0.95 }}` with same spring
- Button hover/tap interactions on register page, invite page, character-selection-screen
- Invite button on party headers
- "Confirm Class" button on character-selection-screen

Apply in these files:
- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/character-selection-screen.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`

**3. AnimatePresence for form step transitions (`multi-step-registration-form.tsx`):**

The multi-step form uses state-based step rendering (`currentStep === 1 ? <Step1> : ...`) without exit animations. Add AnimatePresence at the WRAPPER level only:

- Find the step rendering section (look for `currentStep` conditionals)
- Wrap the step content with `<AnimatePresence mode="wait">`
- Add `key={currentStep}` to the rendered step content div
- Add `initial`, `animate`, and `exit` props to the step container:
  ```tsx
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
  ```
- **DO NOT modify form logic, validation, submission handlers, or step navigation**
- If `AnimatePresence` is already imported, just use it. If not, add to the existing `motion` import.

**4. Invite page (`invite/[code]/page.tsx`) — apply same whileInView + spring patterns:**
- Convert the team card section from mount-based animation to `whileInView`
- Apply spring physics to class selection hover/tap
- Update the class selection grid animations to use stagger variants

**Important constraints:**
- All animation changes are additive/cosmetic — no logic changes
- Test build after each file to catch issues early
- The `motion` import is already present in all target files — just change how it's used
- Import shared variants from `@/lib/animations` where useful

## Inputs

- `src/lib/animations.ts`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/character-selection-screen.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`

## Expected Output

- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/character-selection-screen.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`

## Verification

bun run build exits 0 && rg 'whileInView' 'src/app/(everywhere-else)/register/page.tsx' returns matches && rg 'spring' 'src/app/(everywhere-else)/register/page.tsx' returns matches && rg 'AnimatePresence' src/components/multi-step-registration-form.tsx returns matches && rg 'whileInView' 'src/app/(everywhere-else)/invite/[code]/page.tsx' returns matches && rg 'spring' src/components/character-selection-screen.tsx returns matches
