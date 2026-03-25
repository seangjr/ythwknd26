---
id: T04
parent: S03
milestone: M001
key_files:
  - src/app/(landing)/page.tsx
  - src/components/registration-cta.tsx
key_decisions:
  - Passed targetDate as ISO string (not Date object) across the RSC boundary since Date objects are not serializable in React Server Components
  - Used FadeIn with direction='left' and animateOnMount for pricing cards to preserve the original x:-20 slide animation while using the T03 abstraction
  - Added export const dynamic = 'force-dynamic' to prevent static generation of the time-dependent registration check
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:38:25.485Z
blocker_discovered: false
---

# T04: Convert landing page to Server Component with client islands (RegistrationCTA + motion wrappers)

**Convert landing page to Server Component with client islands (RegistrationCTA + motion wrappers)**

## What Happened

Converted the landing page from a full client component (`"use client"` + useState/useEffect) to a React Server Component with surgical client islands.

**What was done:**

1. **Removed `"use client"` directive** from `src/app/(landing)/page.tsx` — the page is now a Server Component.

2. **Removed React hook imports** — `useState` and `useEffect` are gone from the page file.

3. **Moved time check to server-side** — the registration-open check is now a simple server-side computation (`new Date() >= targetDate`), with `export const dynamic = "force-dynamic"` to prevent Next.js from statically generating the page with a stale time check.

4. **Created `src/components/registration-cta.tsx`** — a `"use client"` component that encapsulates the registration button + countdown timer conditional. It receives `isRegistrationOpen` (boolean) and `targetDate` (ISO string, since Date objects can't cross the server→client boundary) as props. It also runs its own `useEffect`/`setInterval` as a client-side fallback for real-time accuracy near the opening time.

5. **Replaced all `<motion.section>` / `<motion.div>` elements** with the wrapper components from T03:
   - Hero section → `<MotionSection>`
   - Masthead logo wrapper → `<MotionDiv>`
   - Event details section → `<MotionSection>`
   - Date/venue text → `<MotionDiv>`
   - Pricing container → `<MotionDiv>`
   - Individual pricing cards → `<FadeIn direction="left" animateOnMount>` (preserves the left-slide entrance from the original `x: -20` animation)

6. **Removed the `motion` import** — no direct `motion/react` import exists in the page file. All motion usage goes through the thin client wrappers.

**Architecture result:** The build output confirms the landing page (`/`) is now `ƒ (Dynamic)` — server-rendered on demand. ~80% of the page (images, text, pricing cards, structure) is server-rendered HTML. The client islands are:
- `MotionSection`, `MotionDiv`, `FadeIn` — thin animation wrappers (~5 lines each)
- `RegistrationCTA` — countdown timer + register button conditional
- `CountdownTimer` — already a client component, unchanged

**Key design decision:** Passed `targetDate` as an ISO string rather than a Date object to `RegistrationCTA`, since Date objects cannot be serialized across the server→client component boundary in RSC.

## Verification

All 9 verification checks pass:
1. `bun run build` exits 0 — build succeeds with no TypeScript or compilation errors
2. No `"use client"` directive in `src/app/(landing)/page.tsx`
3. `export const dynamic = "force-dynamic"` present in page
4. No `useState` import in page
5. No `useEffect` import in page
6. `src/components/registration-cta.tsx` exists
7. `registration-cta.tsx` has `"use client"` directive
8. Page imports and uses `RegistrationCTA` component
9. No direct `from "motion/react"` import in page — all motion usage through wrappers

Build output confirms `/` route is `ƒ (Dynamic)` — server-rendered on demand, not statically generated.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `bun run build` | 0 | ✅ pass | 14000ms |
| 2 | `! grep -q 'use client' src/app/(landing)/page.tsx` | 0 | ✅ pass | 10ms |
| 3 | `grep -q 'force-dynamic' src/app/(landing)/page.tsx` | 0 | ✅ pass | 10ms |
| 4 | `! grep -q 'useState' src/app/(landing)/page.tsx` | 0 | ✅ pass | 10ms |
| 5 | `! grep -q 'useEffect' src/app/(landing)/page.tsx` | 0 | ✅ pass | 10ms |
| 6 | `test -f src/components/registration-cta.tsx` | 0 | ✅ pass | 10ms |
| 7 | `grep -q 'use client' src/components/registration-cta.tsx` | 0 | ✅ pass | 10ms |
| 8 | `grep -q 'RegistrationCTA' src/app/(landing)/page.tsx` | 0 | ✅ pass | 10ms |
| 9 | `! grep -q 'from.*motion/react' src/app/(landing)/page.tsx` | 0 | ✅ pass | 10ms |


## Deviations

Passed `targetDate` as an ISO string instead of a Date object to RegistrationCTA. Date objects cannot be serialized across the RSC server→client boundary. The component reconstructs the Date on the client side. Used FadeIn with `direction="left"` and `animateOnMount` for pricing cards instead of raw MotionDiv — this preserves the original `x: -20` slide animation while using the higher-level abstraction from T03.

## Known Issues

None.

## Files Created/Modified

- `src/app/(landing)/page.tsx`
- `src/components/registration-cta.tsx`
