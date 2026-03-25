---
estimated_steps: 15
estimated_files: 9
skills_used: []
---

# T02: Migrate framer-motion to motion package and update all imports

Replace the `framer-motion` package with the `motion` package and update all import paths from `"framer-motion"` to `"motion/react"`. The API is identical — only the package name and import path change.

Files with framer-motion imports (8 files):
- `src/app/(landing)/page.tsx`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/countdown-timer.tsx`
- `src/components/loading-overlay.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/time-restriction.tsx`

Steps:
1. Run `bun remove framer-motion && bun add motion`
2. In each of the 8 source files listed above, replace `from 'framer-motion'` or `from "framer-motion"` with `from "motion/react"`
3. Verify no remaining framer-motion references in source files
4. Verify the build still compiles

## Inputs

- ``package.json` — upgraded to Next.js 16.x from T01`
- ``src/app/(landing)/page.tsx` — has `from 'framer-motion'` import`
- ``src/app/(everywhere-else)/register/page.tsx` — has `from 'framer-motion'` import`
- ``src/app/(everywhere-else)/invite/[code]/page.tsx` — has `from 'framer-motion'` import`
- ``src/components/character-selection-screen.tsx` — has `from 'framer-motion'` import`
- ``src/components/countdown-timer.tsx` — has `from 'framer-motion'` import`
- ``src/components/loading-overlay.tsx` — has `from 'framer-motion'` import`
- ``src/components/multi-step-registration-form.tsx` — has `from 'framer-motion'` import`
- ``src/components/time-restriction.tsx` — has `from 'framer-motion'` import`

## Expected Output

- ``package.json` — `motion` replaces `framer-motion` in dependencies`
- ``src/app/(landing)/page.tsx` — import changed to `motion/react``
- ``src/app/(everywhere-else)/register/page.tsx` — import changed to `motion/react``
- ``src/app/(everywhere-else)/invite/[code]/page.tsx` — import changed to `motion/react``
- ``src/components/character-selection-screen.tsx` — import changed to `motion/react``
- ``src/components/countdown-timer.tsx` — import changed to `motion/react``
- ``src/components/loading-overlay.tsx` — import changed to `motion/react``
- ``src/components/multi-step-registration-form.tsx` — import changed to `motion/react``
- ``src/components/time-restriction.tsx` — import changed to `motion/react``

## Verification

Run `rg 'framer-motion' --glob '*.tsx' --glob '*.ts' src/` — must return zero matches. Run `bun run build` — must exit 0.
