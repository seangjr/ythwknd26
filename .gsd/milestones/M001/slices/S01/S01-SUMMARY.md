---
id: S01
parent: M001
milestone: M001
provides:
  - Next.js 16.2.1 + React 19.2.4 runtime
  - motion@12.38.0 animation library with motion/react imports
  - Semantic color tokens --text-muted and --surface with Tailwind utility classes
  - Clean build baseline — all 12 routes compile with zero errors
requires:
  []
affects:
  - S02
  - S03
  - S04
key_files:
  - package.json
  - bun.lock
  - next.config.ts
  - src/app/globals.css
  - src/app/(landing)/layout.tsx
  - src/app/(everywhere-else)/layout.tsx
  - src/app/(landing)/page.tsx
  - src/app/(everywhere-else)/register/page.tsx
  - src/app/(everywhere-else)/invite/[code]/page.tsx
  - src/components/character-selection-screen.tsx
  - src/components/countdown-timer.tsx
  - src/components/loading-overlay.tsx
  - src/components/multi-step-registration-form.tsx
  - src/components/time-restriction.tsx
  - src/components/footer.tsx
  - src/components/hero-details.tsx
  - src/components/navbar.tsx
  - src/components/team-invite-modal.tsx
key_decisions:
  - Targeted Next.js 16.2.1 (latest stable) for security patches CVE-2025-55183/55184 rather than 16.0.x
  - Migrated images.domains to images.remotePatterns for forward compatibility
  - Accepted motion@12.38.0 as framer-motion replacement — same major version, API-compatible
  - Named semantic tokens --text-muted (#BABABA) and --surface (#1A1A1A) — semantic intent over color description
  - Collapsed #1A1A1A and #18181B into single --surface token since they're visually indistinguishable
patterns_established:
  - Semantic CSS custom properties in :root/.dark with Tailwind @theme inline mappings for token-based theming
  - motion/react import path as standard for all animation imports
  - Turbopack as default bundler (no explicit flag needed)
  - images.remotePatterns as the standard for external image domains in next.config.ts
observability_surfaces:
  - none — infrastructure/package upgrade slice with no runtime boundary changes
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T03-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-03-25T06:46:55.734Z
blocker_discovered: false
---

# S01: Upgrade and Foundation

**Codebase upgraded to Next.js 16.2.1 with motion package and semantic color tokens — stable foundation for brand refresh and animation polish**

## What Happened

Three tasks executed sequentially to establish the technical foundation for the 2026 site refresh.

**T01 — Next.js Upgrade:** Upgraded from Next.js 15.3.1 to 16.2.1 (latest stable with security patches). Companion packages updated: React 19.0.0→19.2.4, react-dom 19.0.0→19.2.4, @next/third-parties 15.3.2→16.2.1. Removed the `--turbopack` flag from dev scripts since Turbopack is now the default in 16.x. Migrated `next.config.ts` from deprecated `images.domains` to `images.remotePatterns` and added proper TypeScript typing. Build compiles all 12 routes (3 static, 9 dynamic) cleanly.

**T02 — Motion Migration:** Replaced `framer-motion` with `motion@12.38.0` — the official successor with identical API. Updated all 8 import paths from `"framer-motion"` to `"motion/react"` across page and component files. Zero API changes needed — pure package rename.

**T03 — Semantic Color Tokens:** Defined two CSS custom properties (`--text-muted: #BABABA`, `--surface: #1A1A1A`) in both `:root` and `.dark` blocks of globals.css, with Tailwind theme mappings (`--color-text-muted`, `--color-surface`) in the `@theme inline` block. Replaced all 89+ hardcoded hex values across 14 files. Three distinct colors collapsed to two semantic tokens (the near-identical #1A1A1A and #18181B share the `--surface` token). Utility classes `text-text-muted`, `bg-surface`, `border-text-muted` now work everywhere.

## Verification

All five slice-level verification checks passed:

1. `grep '"next"' package.json` → `"next": "^16.2.1"` — confirms 16.x ✅
2. `rg 'framer-motion' --glob '*.tsx' --glob '*.ts' src/` → exit code 1 (zero matches) — all imports migrated ✅
3. `rg '#[0-9a-fA-F]{6}' --glob '*.tsx' --glob '*.ts' src/` → exit code 1 (zero matches) — all hex colors replaced ✅
4. `grep -q '"motion"' package.json` → motion package installed ✅
5. `bun run build` → exit code 0, Next.js 16.2.1 compiled in 6.1s with Turbopack, all 12 routes generated ✅

## Requirements Advanced

- UPGR-01 — Next.js upgraded from 15.3.1 to 16.2.1 — latest stable with Turbopack default
- UPGR-02 — framer-motion replaced with motion@12.38.0, all 8 import paths updated to motion/react
- BRND-01 — All 89+ hardcoded hex values replaced with semantic CSS custom property tokens across 14 files

## Requirements Validated

- UPGR-01 — next@16.2.1 in package.json, bun run build exits 0, all 12 routes compile with Turbopack
- UPGR-02 — motion@12.38.0 installed, rg framer-motion returns zero matches across all .tsx/.ts files, build passes
- BRND-01 — rg '#[0-9a-fA-F]{6}' returns zero matches across all .tsx/.ts source files, semantic tokens defined in globals.css, build passes

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

T01 went beyond the plan: migrated `images.domains` to `images.remotePatterns` (deprecated in 16.x) and added TypeScript `NextConfig` import. Targeted 16.2.1 instead of 16.0.x for security patches (CVE-2025-55183, CVE-2025-55184). These were minor forward-compatibility improvements, not scope changes.

## Known Limitations

None. All three tasks completed successfully with no residual issues.

## Follow-ups

None.

## Files Created/Modified

- `package.json` — Upgraded next to 16.2.1, react/react-dom to 19.2.4, @next/third-parties to 16.2.1; replaced framer-motion with motion@12.38.0; removed --turbopack flag from dev script
- `bun.lock` — Regenerated lockfile for package upgrades
- `next.config.ts` — Migrated images.domains to images.remotePatterns, added TypeScript NextConfig import
- `src/app/globals.css` — Added --text-muted and --surface CSS custom properties in :root and .dark blocks; added Tailwind theme mappings --color-text-muted and --color-surface
- `src/app/(landing)/layout.tsx` — Replaced text-[#BABABA] with text-text-muted in body className
- `src/app/(everywhere-else)/layout.tsx` — Replaced text-[#BABABA] with text-text-muted in body className
- `src/app/(landing)/page.tsx` — Updated framer-motion import to motion/react; replaced hardcoded hex colors with semantic tokens
- `src/app/(everywhere-else)/register/page.tsx` — Updated framer-motion import to motion/react; replaced hardcoded hex colors with semantic tokens
- `src/app/(everywhere-else)/invite/[code]/page.tsx` — Updated framer-motion import to motion/react; replaced hardcoded hex colors with semantic tokens
- `src/components/character-selection-screen.tsx` — Updated framer-motion import to motion/react; replaced hardcoded hex colors with semantic tokens
- `src/components/countdown-timer.tsx` — Updated framer-motion import to motion/react; replaced hardcoded hex colors with semantic tokens
- `src/components/loading-overlay.tsx` — Updated framer-motion import to motion/react
- `src/components/multi-step-registration-form.tsx` — Updated framer-motion import to motion/react; replaced hardcoded hex colors with semantic tokens
- `src/components/time-restriction.tsx` — Updated framer-motion import to motion/react; replaced hardcoded hex colors with semantic tokens
- `src/components/footer.tsx` — Replaced hardcoded hex colors with semantic tokens
- `src/components/hero-details.tsx` — Replaced hardcoded hex colors with semantic tokens
- `src/components/navbar.tsx` — Replaced hardcoded hex colors with semantic tokens (including border-text-muted)
- `src/components/team-invite-modal.tsx` — Replaced hardcoded hex colors with semantic tokens
