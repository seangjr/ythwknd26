# S03: Content Override, Animation and RSC — UAT

**Milestone:** M001
**Written:** 2026-03-25T07:46:38.377Z

## UAT: S03 — Content Override, Animation and RSC

### Preconditions
- Worktree at `.gsd/worktrees/M001` with all S03 changes applied
- `bun run build` passes with exit code 0
- Node.js and bun available

---

### Test 1: 2026 Event Content on Landing Page
**Steps:**
1. Run `bun run dev` and open `http://localhost:3000`
2. Verify event dates show "30 May to 1 June" (not "26 to 28 June" or "27 to 29 June")
3. Verify venue shows "Peacehaven" and "Genting Highlands" (not "Bayu Beach Resort" or "Port Dickson")
4. Verify pricing section shows exactly 2 tiers: RM130 (NEW FRIENDS) and RM160 (YM MEMBER)
5. Confirm no "double ticket" tier, no strikethrough pricing, no "*non-Muslims only" disclaimer

**Expected:** All 2026 confirmed event details displayed correctly per D004.

---

### Test 2: Constants Data Model
**Steps:**
1. Run `rg 'CLASSES' src/lib/constants.ts` — should match (5 classes: Warrior, Archer, Scout, Guardian, Scholar)
2. Run `rg 'PARTIES' src/lib/constants.ts` — should match (PARTY 001–021)
3. Run `rg 'HEROES' src/lib/constants.ts` — should return 0 matches
4. Run `rg 'HERO_IMAGE_PATHS' src/lib/constants.ts` — should return 0 matches
5. Verify CG_LEADERS includes "Daniel Loo", "Jenisha Kong", "NOT SURE" and excludes "Clarice Low", "May Jee"

**Expected:** New class/party model fully replaces hero/team model in constants.

---

### Test 3: Hero→Class Terminology Rename
**Steps:**
1. Run `rg -i 'choose your hero' src/ --glob '*.tsx'` — should return 0 matches
2. Run `rg -i 'Heroes Available' src/ --glob '*.tsx'` — should return 0 matches
3. Open register page — headings should say "class" not "hero"
4. Open character selection — should show "Choose your class" or similar, not "Choose your hero"
5. Open invite page — party terminology used, not "universe" or "team"

**Expected:** All user-facing text uses class/party terminology. API parameter names (heroId) unchanged.

---

### Test 4: Heading Font (Jeju Hallasan)
**Steps:**
1. Run `rg 'Jeju Hallasan' src/styles/fonts.css` — should match
2. Run `rg 'Rumble Brave' src/styles/fonts.css` — should return 0 matches
3. Verify `public/fonts/JejuHallasan-Regular.ttf` exists
4. Open the site — headings should render in Jeju Hallasan font (visually distinct from Rumble Brave)

**Expected:** Heading font is Jeju Hallasan loaded from local TTF file.

---

### Test 5: Landing Page is Server Component
**Steps:**
1. Run `grep 'use client' 'src/app/(landing)/page.tsx'` — should return no matches
2. Run `grep 'force-dynamic' 'src/app/(landing)/page.tsx'` — should match
3. Run `bun run build` and check output — `/` route should show `ƒ (Dynamic)` not `○ (Static)`
4. Verify `src/components/registration-cta.tsx` exists and has `"use client"` directive

**Expected:** Landing page renders as RSC with RegistrationCTA as client island.

---

### Test 6: Motion Wrapper Components
**Steps:**
1. Verify all files exist: `src/components/motion/motion-div.tsx`, `motion-section.tsx`, `fade-in.tsx`, `stagger-container.tsx`, `index.ts`
2. Verify `src/lib/animations.ts` exists with exports: `fadeInUp`, `springTransition`, `staggerContainer`, `scaleIn`
3. Verify landing page imports from `@/components/motion/` not from `motion/react`
4. Run `grep 'from.*motion/react' 'src/app/(landing)/page.tsx'` — should return 0 matches

**Expected:** Motion wrappers provide RSC-compatible animation primitives.

---

### Test 7: whileInView Scroll Animations
**Steps:**
1. Open `/register` page
2. Scroll down to the party grid section
3. Verify party cards animate in on scroll (not on page mount)
4. Scroll back up and down — animations should NOT replay (viewport once: true)
5. Run `rg 'whileInView' 'src/app/(everywhere-else)/register/page.tsx'` — should match

**Expected:** Party grid uses scroll-triggered stagger animation that plays once.

---

### Test 8: Spring Physics on Interactions
**Steps:**
1. On register page, hover over a class card — should have bouncy spring scale effect
2. Click/tap a class card — should have spring press-down effect
3. Run `rg 'spring' 'src/app/(everywhere-else)/register/page.tsx'` — should match
4. On character selection screen, hover class items — should have spring effect
5. Run `rg 'spring' src/components/character-selection-screen.tsx` — should match

**Expected:** Hover/tap interactions feel bouncy with spring physics, not linear.

---

### Test 9: AnimatePresence Form Transitions
**Steps:**
1. Start registration flow on `/register`
2. Select a party, then a class
3. Step through the multi-step form (personal info → contact → etc.)
4. Verify each step transition has a smooth slide animation (not instant swap)
5. Run `rg 'AnimatePresence' src/components/multi-step-registration-form.tsx` — should match

**Expected:** Form steps animate with slide-in/slide-out transitions via AnimatePresence.

---

### Test 10: Build Integrity
**Steps:**
1. Run `bun run build` — should exit 0
2. Check for any TypeScript errors in output — should be none
3. Verify all 11 routes compile successfully

**Expected:** Clean production build with no errors or warnings.
