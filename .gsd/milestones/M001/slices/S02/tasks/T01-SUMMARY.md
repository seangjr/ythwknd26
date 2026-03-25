---
id: T01
parent: S02
milestone: M001
key_files:
  - src/app/(landing)/layout.tsx
  - src/app/(everywhere-else)/layout.tsx
  - public/manifest.json
  - src/components/navbar.tsx
key_decisions:
  - Both layout metadata objects kept structurally identical (differing only by the duck comment in landing layout) to ensure SEO/social metadata consistency across route groups
duration: ""
verification_result: passed
completed_at: 2026-03-25T06:58:06.857Z
blocker_discovered: false
---

# T01: Update all 2025→2026 year references in both root layouts, manifest.json, and navbar alt text

**Update all 2025→2026 year references in both root layouts, manifest.json, and navbar alt text**

## What Happened

Updated all year references from 2025 to 2026 across four files:

1. **`src/app/(landing)/layout.tsx`** — Updated title (1), keywords (1), openGraph title (1), siteName (1), openGraph image alt (1), twitter title (1) = 6 replacements in metadata object.
2. **`src/app/(everywhere-else)/layout.tsx`** — Identical 6 replacements to keep metadata objects in lockstep. Verified via `diff` that both metadata objects are structurally identical.
3. **`public/manifest.json`** — Updated `name` field from 'YTHWKND 2025' to 'YTHWKND 2026'.
4. **`src/components/navbar.tsx`** — Updated alt text from 'Logo for YTHWKND 2025' to 'Logo for YTHWKND 2026'.

Initial Edit tool calls reported success but didn't persist due to the worktree path resolution (real path is under `.gsd/projects/` while the symlink is under `Developer/`). Switched to `sed -i` which correctly resolved the paths. Description text and theme name ('The Multiverse of Mystery') were preserved unchanged.

Note: `src/app/(landing)/page.tsx` still contains `2025` references (registration date and countdown target) — these are landing page content, not metadata, and are scoped to a different task in this slice.

## Verification

1. `rg '2025'` across the four target files returns zero matches — PASS.
2. `diff` of metadata objects between both layouts confirms structural identity — PASS.
3. `bun run build` compiles all 12 routes successfully with TypeScript and Turbopack — PASS.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg '2025' src/app/(landing)/layout.tsx src/app/(everywhere-else)/layout.tsx public/manifest.json src/components/navbar.tsx` | 1 | ✅ pass | 50ms |
| 2 | `diff <(metadata from landing) <(metadata from everywhere-else)` | 0 | ✅ pass | 30ms |
| 3 | `bun run build` | 0 | ✅ pass | 35900ms |


## Deviations

Used `sed -i` instead of the Edit tool for file modifications due to worktree symlink path resolution issue — the Edit tool was writing to the symlink source path while rg/head read from the real path.

## Known Issues

None.

## Files Created/Modified

- `src/app/(landing)/layout.tsx`
- `src/app/(everywhere-else)/layout.tsx`
- `public/manifest.json`
- `src/components/navbar.tsx`
