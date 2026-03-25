---
id: T03
parent: S01
milestone: M001
key_files:
  - src/app/globals.css
  - src/app/(landing)/layout.tsx
  - src/app/(everywhere-else)/layout.tsx
  - src/components/character-selection-screen.tsx
  - src/components/countdown-timer.tsx
  - src/components/footer.tsx
  - src/components/hero-details.tsx
  - src/components/multi-step-registration-form.tsx
  - src/components/navbar.tsx
  - src/components/team-invite-modal.tsx
  - src/components/time-restriction.tsx
  - src/app/(landing)/page.tsx
  - src/app/(everywhere-else)/register/page.tsx
  - src/app/(everywhere-else)/invite/[code]/page.tsx
key_decisions:
  - Defined --text-muted and --surface as semantic CSS custom properties with identical values in :root and .dark blocks, making them trivially overridable for future light/dark theme differentiation
  - Mapped #18181B to the same --surface token as #1A1A1A since they're visually near-identical dark surface colors
duration: ""
verification_result: passed
completed_at: 2026-03-25T06:43:45.860Z
blocker_discovered: false
---

# T03: Replace all hardcoded hex colors with semantic CSS custom property tokens (--text-muted, --surface)

**Replace all hardcoded hex colors with semantic CSS custom property tokens (--text-muted, --surface)**

## What Happened

Defined two semantic CSS custom properties (`--text-muted: #BABABA` and `--surface: #1A1A1A`) in both `:root` and `.dark` blocks of `globals.css`, then added corresponding Tailwind theme mappings (`--color-text-muted` and `--color-surface`) in the `@theme inline` block. This enables Tailwind utility classes like `text-text-muted`, `bg-surface`, and `border-text-muted`.

Used case-insensitive sed replacements across all `.tsx`/`.ts` files to convert:
- `text-[#BABABA]` / `text-[#bababa]` → `text-text-muted` (across 12 files)
- `bg-[#1A1A1A]` / `bg-[#1a1a1a]` → `bg-surface` (across 5 files)
- `bg-[#18181b]` / `bg-[#18181B]` → `bg-surface` (1 occurrence in hero-details.tsx)
- `border-[#BABABA]` → `border-text-muted` (1 occurrence in navbar.tsx)
- `!text-[#BABABA]` → `!text-text-muted` (1 occurrence in character-selection-screen.tsx)
- Layout body classNames updated in both `(landing)/layout.tsx` and `(everywhere-else)/layout.tsx`

All 89+ hardcoded hex occurrences across 13 component/page files were replaced. The `rg` verification confirmed zero remaining hex color references in source files, and `bun run build` completed successfully.

## Verification

1. `rg '#[0-9a-fA-F]{6}' --glob '*.tsx' --glob '*.ts' src/` — exit code 1 (no matches found), confirming zero remaining hardcoded hex colors in source files.
2. `bun run build` — exit code 0, compiled successfully in 6.0s with Next.js 16.2.1, all 12 pages generated without errors.
3. Spot-checked critical files (layouts, navbar, character-selection-screen) to confirm correct token class names applied.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg '#[0-9a-fA-F]{6}' --glob '*.tsx' --glob '*.ts' src/` | 1 | ✅ pass | 50ms |
| 2 | `bun run build` | 0 | ✅ pass | 13200ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/app/globals.css`
- `src/app/(landing)/layout.tsx`
- `src/app/(everywhere-else)/layout.tsx`
- `src/components/character-selection-screen.tsx`
- `src/components/countdown-timer.tsx`
- `src/components/footer.tsx`
- `src/components/hero-details.tsx`
- `src/components/multi-step-registration-form.tsx`
- `src/components/navbar.tsx`
- `src/components/team-invite-modal.tsx`
- `src/components/time-restriction.tsx`
- `src/app/(landing)/page.tsx`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
