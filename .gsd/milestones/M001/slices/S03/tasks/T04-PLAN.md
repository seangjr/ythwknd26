---
estimated_steps: 49
estimated_files: 2
skills_used: []
---

# T04: Convert landing page to Server Component with client islands

Convert the landing page from a client component to a React Server Component with client islands. This is the RSC architectural work that makes the page load faster — ~80% of the page becomes server-rendered static HTML.

**Steps:**

1. **Remove `"use client"` directive** from `src/app/(landing)/page.tsx`

2. **Remove React hook imports** — `useState`, `useEffect` are no longer needed in this file

3. **Move time check to server-side:** Replace the `useState`/`useEffect`/`setInterval` time check with a simple server-side computation:
   ```tsx
   const targetDate = new Date(2026, 4, 10, 12, 30, 0);
   const isRegistrationOpen = new Date() >= targetDate;
   ```

4. **Add `export const dynamic = "force-dynamic"`** at the top of the file to prevent static caching of the time check result. Without this, the page could be statically generated at build time and the registration-open check would be stale.

5. **Create `src/components/registration-cta.tsx`** — a `"use client"` component that handles the registration button / countdown timer conditional:
   ```tsx
   "use client";
   // Props: isRegistrationOpen (boolean from server), targetDate (Date)
   // If isRegistrationOpen: render the Register button with motion wrapper + hover/tap
   // If not: render countdown text + CountdownTimer component
   // Also runs its own useEffect/setInterval as a fallback for real-time accuracy
   ```
   This client island encapsulates all the interactivity the landing page needs.

6. **Replace inline `<motion.section>` / `<motion.div>` elements** with the wrapper components from T03:
   - `<motion.section initial={...} animate={...}>` → `<MotionSection initial={...} animate={...}>` (import from `@/components/motion`)
   - `<motion.div initial={...} animate={...}>` → `<MotionDiv initial={...} animate={...}>` or `<FadeIn>` where appropriate
   - The hero section image wrapper → MotionSection
   - The masthead logo → MotionDiv
   - Event details section → MotionSection
   - Date/venue text → MotionDiv or FadeIn
   - Pricing cards → MotionDiv with stagger
   - Disclaimers → MotionDiv

7. **Remove the `motion` import** from the page — all motion usage now goes through wrapper components

8. **Wire the RegistrationCTA component:**
   ```tsx
   <RegistrationCTA 
     isRegistrationOpen={isRegistrationOpen} 
     targetDate={targetDate} 
   />
   ```

**What stays server-rendered (no client boundary):**
- Hero background Image
- Masthead SVG Image
- Event dates text
- Venue text
- Pricing cards (the motion wrappers are client, but the content is passed as children)
- The overall page structure

**What becomes client islands:**
- `<MotionSection>`, `<MotionDiv>`, `<FadeIn>` — thin animation wrappers (each ~5 lines, "use client")
- `<RegistrationCTA>` — countdown timer + register button conditional
- `<CountdownTimer>` — already a client component, no changes needed

**Key constraint:** The `import { motion } from "motion/react"` line MUST be removed from the page. All motion usage must go through the wrapper components. Direct `motion.*` usage in a Server Component file will cause a build error.

**Landing page content note:** T01 should have already updated the content (dates, venue, pricing). This task just changes the rendering architecture — the content should already be correct. Verify the content is right after conversion.

## Inputs

- `src/app/(landing)/page.tsx`
- `src/components/motion/motion-div.tsx`
- `src/components/motion/motion-section.tsx`
- `src/components/motion/fade-in.tsx`
- `src/components/countdown-timer.tsx`

## Expected Output

- `src/app/(landing)/page.tsx`
- `src/components/registration-cta.tsx`

## Verification

bun run build exits 0 && ! grep -q 'use client' 'src/app/(landing)/page.tsx' && grep -q 'force-dynamic' 'src/app/(landing)/page.tsx' && ! grep -q 'useState' 'src/app/(landing)/page.tsx' && ! grep -q 'useEffect' 'src/app/(landing)/page.tsx' && test -f src/components/registration-cta.tsx && grep -q 'use client' src/components/registration-cta.tsx && grep -q 'RegistrationCTA' 'src/app/(landing)/page.tsx'
