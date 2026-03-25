---
id: T01
parent: S04
milestone: M001
key_files:
  - public/placeholder.svg
  - package.json
  - src/components/time-restriction.tsx
  - src/components/registration-cta.tsx
  - src/app/(landing)/page.tsx
key_decisions:
  - Time gate bypass uses year 2024 (past) rather than removing the gate entirely — preserves the component structure for easy revert in T02
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:58:35.266Z
blocker_discovered: false
---

# T01: Fix pre-verification blockers: create placeholder.svg, add nanoid dependency, bypass time gate for testing

**Fix pre-verification blockers: create placeholder.svg, add nanoid dependency, bypass time gate for testing**

## What Happened

Fixed three issues that would have blocked the verification slice before it could start:

1. **Created `/public/placeholder.svg`** — A minimal 200x200 SVG with a gray rounded rect and centered "Class" text. Seven components reference `getHeroImagePath()` which falls back to `/placeholder.svg`, and the file was missing from `public/`.

2. **Added `nanoid` to `package.json`** — `src/app/api/team-invite/route.ts` imports `nanoid` but it was only available as a transitive dependency. Ran `bun add nanoid` which installed v5.1.7 as an explicit dependency.

3. **Temporarily bypassed the TimeRestriction date gate** — Changed `new Date(2026, 4, 10, 12, 30, 0)` to `new Date(2024, 4, 10, 12, 30, 0)` in three locations:
   - `src/components/time-restriction.tsx` — the date gate constructor and display string
   - `src/app/(landing)/page.tsx` — the server-side date that feeds `RegistrationCTA`
   - `src/components/registration-cta.tsx` — the display string for the countdown message
   
   These changes ensure the current date (March 2026) evaluates as after the gate, allowing access to registration and invite pages during verification. Will be reverted in T02.

During the build verification, encountered a syntax error caused by duplicate trailing lines in `time-restriction.tsx` (the original file had a trailing ` return <>{children}</>;\n} ` with whitespace that caused the edit tool to create duplicates). Fixed by removing the duplicate lines, then the build passed cleanly with no TypeScript errors.

## Verification

All five verification checks from the task plan passed:
1. `ls public/placeholder.svg` — file exists ✅
2. `grep '"nanoid"' package.json` — shows `"nanoid": "^5.1.7"` ✅
3. `bun run build` — exits 0, compiled in 7.2s, TypeScript in 6.2s, all 11 pages generated ✅
4. `grep '2024' src/components/time-restriction.tsx` — shows bypassed date ✅
5. `grep '2024' src/app/(landing)/page.tsx` — shows bypassed date ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `ls public/placeholder.svg` | 0 | ✅ pass | 50ms |
| 2 | `grep '"nanoid"' package.json` | 0 | ✅ pass | 30ms |
| 3 | `bun run build` | 0 | ✅ pass | 15600ms |
| 4 | `grep '2024' src/components/time-restriction.tsx` | 0 | ✅ pass | 30ms |
| 5 | `grep '2024' src/app/(landing)/page.tsx` | 0 | ✅ pass | 30ms |


## Deviations

The original file `time-restriction.tsx` had trailing whitespace on the last line (`} ` instead of `}`), which caused the edit tool to produce duplicate return statements. Required an extra fix to remove the duplicates before the build could pass.

## Known Issues

None.

## Files Created/Modified

- `public/placeholder.svg`
- `package.json`
- `src/components/time-restriction.tsx`
- `src/components/registration-cta.tsx`
- `src/app/(landing)/page.tsx`
