---
estimated_steps: 4
estimated_files: 5
skills_used: []
---

# T01: Fix pre-verification blockers (placeholder.svg, nanoid dep, time gate bypass)

Fix three issues that would cause verification to fail before it starts:

1. **Create `/public/placeholder.svg`** — 7 component files reference `getHeroImagePath()` which returns `/placeholder.svg`, but the file doesn't exist in `public/`. Without it, class selection images show as broken. Create a minimal SVG placeholder (gray box with "Class" text centered, ~200x200).

2. **Add `nanoid` to `package.json`** — `src/app/api/team-invite/route.ts` imports `nanoid` but it's not in package.json. It currently resolves via a transitive dependency, but this will break on a clean install if the transitive chain changes. Run `bun add nanoid`.

3. **Temporarily bypass the TimeRestriction date gate** — The `TimeRestriction` component in `src/components/time-restriction.tsx` blocks access to `/register` and `/invite/*` until May 10, 2026 at 12:30 PM. Current date (March 25, 2026) is before that gate. Change the year in the `new Date(2026, 4, 10, 12, 30, 0)` to `new Date(2024, 4, 10, 12, 30, 0)` so the gate evaluates as already passed. Do the same for the `RegistrationCTA` component in `src/components/registration-cta.tsx` which has a similar date check on the landing page (the `targetDate` is passed as an ISO string from the server component in `src/app/(landing)/page.tsx` — change the Date constructor there from `new Date(2026, 4, 10, 12, 30, 0)` to `new Date(2024, 4, 10, 12, 30, 0)`). The display string "May 10, 2026 at 12:30 PM" in `time-restriction.tsx` should also be updated to match. **These changes will be reverted in T02 after verification is complete.**

## Inputs

- `src/components/time-restriction.tsx`
- `src/components/registration-cta.tsx`
- `src/app/(landing)/page.tsx`
- `package.json`

## Expected Output

- `public/placeholder.svg`
- `package.json`
- `src/components/time-restriction.tsx`
- `src/components/registration-cta.tsx`
- `src/app/(landing)/page.tsx`

## Verification

1. `ls public/placeholder.svg` — file exists
2. `grep '"nanoid"' package.json` — nanoid listed as a dependency
3. `bun run build` — exits 0 with no TypeScript errors
4. `grep '2024' src/components/time-restriction.tsx` — date year changed to 2024 for bypass
5. `grep '2024' src/app/\\(landing\\)/page.tsx` — landing page date also bypassed
