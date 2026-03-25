---
id: T02
parent: S01
milestone: M001
key_files:
  - package.json
  - bun.lock
  - src/app/(landing)/page.tsx
  - src/app/(everywhere-else)/register/page.tsx
  - src/app/(everywhere-else)/invite/[code]/page.tsx
  - src/components/character-selection-screen.tsx
  - src/components/countdown-timer.tsx
  - src/components/loading-overlay.tsx
  - src/components/multi-step-registration-form.tsx
  - src/components/time-restriction.tsx
key_decisions:
  - Accepted motion@12.38.0 (latest) as the replacement for framer-motion@^12.10.0 — same major version, API-compatible
duration: ""
verification_result: passed
completed_at: 2026-03-25T06:41:09.591Z
blocker_discovered: false
---

# T02: Migrate framer-motion to motion package and update all 8 import paths to motion/react

**Migrate framer-motion to motion package and update all 8 import paths to motion/react**

## What Happened

Replaced the `framer-motion` package with `motion` and updated all import paths across the codebase. The migration was straightforward — the API surface is identical, only the package name and import path changed.

Steps executed:
1. Ran `bun remove framer-motion && bun add motion` — installed motion@12.38.0
2. Updated all 8 source files to import from `"motion/react"` instead of `"framer-motion"` using sed
3. Verified zero remaining `framer-motion` references in source files (`rg` returned exit code 1 = no matches)
4. Verified build compiles successfully — `bun run build` exited 0, TypeScript passed, all 12 pages generated

## Verification

Ran `rg 'framer-motion' --glob '*.tsx' --glob '*.ts' src/` — returned exit code 1 (zero matches), confirming no remaining framer-motion references. Ran `bun run build` — exited 0, Next.js 16.2.1 compiled successfully with Turbopack, TypeScript checks passed, all 12 pages (static and dynamic) generated without errors.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg 'framer-motion' --glob '*.tsx' --glob '*.ts' src/` | 1 | ✅ pass | 50ms |
| 2 | `bun run build` | 0 | ✅ pass | 13600ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `package.json`
- `bun.lock`
- `src/app/(landing)/page.tsx`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/countdown-timer.tsx`
- `src/components/loading-overlay.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/time-restriction.tsx`
