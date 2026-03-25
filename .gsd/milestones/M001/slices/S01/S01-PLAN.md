# S01: Upgrade and Foundation

**Goal:** Codebase runs on Next.js 16.x with motion package and semantic color tokens — stable foundation for all visual work in S02–S04.
**Demo:** codebase runs on Next.js 16 with motion package and semantic color tokens — stable foundation for all visual work

## Must-Haves

- ## Must-Haves
- Next.js upgraded to 16.x (latest stable) with clean build and no deprecation warnings
- `framer-motion` package replaced with `motion` package; all imports changed from `"framer-motion"` to `"motion/react"`
- All 89 hardcoded hex color values (`#BABABA`, `#1A1A1A`, `#18181B`) replaced with semantic CSS custom property tokens
- `next dev` and `next build` both succeed with zero errors
- ## Verification
- `cd /Users/seangjr/Developer/Personal/ythwknd25/.gsd/worktrees/M001 && bun run build` succeeds with exit code 0
- `rg 'framer-motion' --glob '*.tsx' --glob '*.ts' src/` returns zero matches (all imports migrated)
- `rg '#[0-9a-fA-F]{6}' --glob '*.tsx' --glob '*.ts' src/` returns zero matches (all hardcoded hex values replaced)
- `grep -q '"motion"' package.json` confirms the motion package is installed
- `grep -q '"next": "' package.json` shows a 16.x version string

## Proof Level

- This slice proves: operational

## Integration Closure

- Upstream surfaces consumed: `package.json`, `src/app/globals.css`, all 7 component files with framer-motion imports, all 13 files with hardcoded hex colors
- New wiring introduced: semantic CSS custom properties in `globals.css` (`.dark` block), `motion` package replaces `framer-motion`
- What remains: S02 (brand identity), S03 (RSC/animation polish), S04 (verification)

## Verification

- none — this is a package upgrade and code-level token replacement with no runtime boundary changes

## Tasks

- [x] **T01: Upgrade Next.js 15.3 to 16.x and fix breaking changes** `est:30m`
  Upgrade Next.js and its companion packages from 15.x to 16.x. This includes upgrading `next`, `@next/third-parties`, and React packages. Clean up package.json scripts since Turbopack is now the default bundler in Next.js 16 (remove explicit `--turbopack` flags). Verify the build compiles successfully.

The project doesn't use `cookies()` or `headers()` directly, and the only `params` usage is via `useParams()` client hook, so async API enforcement should not be a concern. The `next.config.ts` is simple (images config only) with no custom webpack config, so Turbopack default should work fine.
  - Files: `package.json`, `bun.lock`, `next.config.ts`
  - Verify: Run `bun run build` — must exit with code 0 and produce a successful build. Run `grep '"next"' package.json` to confirm 16.x version.

- [x] **T02: Migrate framer-motion to motion package and update all imports** `est:20m`
  Replace the `framer-motion` package with the `motion` package and update all import paths from `"framer-motion"` to `"motion/react"`. The API is identical — only the package name and import path change.

Files with framer-motion imports (7 files):
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
2. In each of the 7 source files listed above, replace `from 'framer-motion'` or `from "framer-motion"` with `from "motion/react"`
3. Verify no remaining framer-motion references in source files
4. Verify the build still compiles
  - Files: `package.json`, `src/app/(landing)/page.tsx`, `src/app/(everywhere-else)/register/page.tsx`, `src/app/(everywhere-else)/invite/[code]/page.tsx`, `src/components/character-selection-screen.tsx`, `src/components/countdown-timer.tsx`, `src/components/loading-overlay.tsx`, `src/components/multi-step-registration-form.tsx`, `src/components/time-restriction.tsx`
  - Verify: Run `rg 'framer-motion' --glob '*.tsx' --glob '*.ts' src/` — must return zero matches. Run `bun run build` — must exit 0.

- [x] **T03: Replace all hardcoded hex colors with semantic CSS custom property tokens** `est:45m`
  Define semantic CSS custom properties for the 3 distinct hardcoded hex values used across the codebase, then replace all 89 occurrences with the new tokens.

Color inventory:
- `#BABABA` / `#bababa` (69 occurrences) → muted text color, maps to `--color-muted-foreground` or a new `--color-text-muted`
- `#1A1A1A` / `#1a1a1a` (19 occurrences) → dark surface/card background, maps to `--color-surface` or similar
- `#18181B` / `#18181b` (1 occurrence) → slightly different dark, near-identical to zinc-900, can share the surface token

Steps:
1. Add semantic CSS custom properties to the `.dark` (and optionally `:root`) block in `src/app/globals.css`. Since this is a dark-themed site, define tokens like:
   - `--color-text-muted: #BABABA;` (or oklch equivalent)
   - `--color-surface: #1A1A1A;` (or oklch equivalent)
2. Add corresponding Tailwind theme mappings in the `@theme inline` block so Tailwind classes like `text-text-muted` and `bg-surface` work
3. Replace all `text-[#BABABA]` / `text-[#bababa]` with `text-text-muted` (or chosen token name) across 13 files
4. Replace all `bg-[#1A1A1A]` / `bg-[#1a1a1a]` with `bg-surface` across files
5. Replace `bg-[#18181b]` / `bg-[#18181B]` with `bg-surface` (same token — colors are nearly identical)
6. Replace `border-[#BABABA]` with `border-text-muted`
7. Also update the two root layouts that have `text-[#BABABA]` in their body className
8. Verify zero hardcoded hex values remain in source files

Files with hardcoded colors (13 files):
- `src/app/globals.css` (add tokens here)
- `src/app/(landing)/layout.tsx`
- `src/app/(everywhere-else)/layout.tsx`
- `src/app/(landing)/page.tsx`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/countdown-timer.tsx`
- `src/components/footer.tsx`
- `src/components/hero-details.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/navbar.tsx`
- `src/components/team-invite-modal.tsx`
- `src/components/time-restriction.tsx`
  - Files: `src/app/globals.css`, `src/app/(landing)/layout.tsx`, `src/app/(everywhere-else)/layout.tsx`, `src/app/(landing)/page.tsx`, `src/app/(everywhere-else)/register/page.tsx`, `src/app/(everywhere-else)/invite/[code]/page.tsx`, `src/components/character-selection-screen.tsx`, `src/components/countdown-timer.tsx`, `src/components/footer.tsx`, `src/components/hero-details.tsx`, `src/components/multi-step-registration-form.tsx`, `src/components/navbar.tsx`, `src/components/team-invite-modal.tsx`, `src/components/time-restriction.tsx`
  - Verify: Run `rg '#[0-9a-fA-F]{6}' --glob '*.tsx' --glob '*.ts' src/` — must return zero matches. Run `bun run build` — must exit 0.

## Files Likely Touched

- package.json
- bun.lock
- next.config.ts
- src/app/(landing)/page.tsx
- src/app/(everywhere-else)/register/page.tsx
- src/app/(everywhere-else)/invite/[code]/page.tsx
- src/components/character-selection-screen.tsx
- src/components/countdown-timer.tsx
- src/components/loading-overlay.tsx
- src/components/multi-step-registration-form.tsx
- src/components/time-restriction.tsx
- src/app/globals.css
- src/app/(landing)/layout.tsx
- src/app/(everywhere-else)/layout.tsx
- src/components/footer.tsx
- src/components/hero-details.tsx
- src/components/navbar.tsx
- src/components/team-invite-modal.tsx
