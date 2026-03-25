---
estimated_steps: 34
estimated_files: 14
skills_used: []
---

# T03: Replace all hardcoded hex colors with semantic CSS custom property tokens

Define semantic CSS custom properties for the 3 distinct hardcoded hex values used across the codebase, then replace all 89 occurrences with the new tokens.

Color inventory:
- `#BABABA` / `#bababa` (69 occurrences) → muted text color → define as `--text-muted` token
- `#1A1A1A` / `#1a1a1a` (19 occurrences) → dark surface/card background → define as `--surface` token
- `#18181B` / `#18181b` (1 occurrence) → near-identical to #1A1A1A → share the surface token

Steps:
1. Add semantic CSS custom properties to `src/app/globals.css`:
   - In `:root` block: `--text-muted: #BABABA; --surface: #1A1A1A;` (these will be light-mode overridable later)
   - In `.dark` block: same values or appropriate dark variants
2. Add corresponding Tailwind theme mappings in the `@theme inline` block:
   - `--color-text-muted: var(--text-muted);`
   - `--color-surface: var(--surface);`
   This enables Tailwind classes `text-text-muted`, `bg-surface`, `border-text-muted`
3. Replace all `text-[#BABABA]` and `text-[#bababa]` with `text-text-muted` across all files
4. Replace all `bg-[#1A1A1A]` and `bg-[#1a1a1a]` with `bg-surface`
5. Replace `bg-[#18181b]` and `bg-[#18181B]` with `bg-surface`
6. Replace `border-[#BABABA]` with `border-text-muted`
7. Replace `!text-[#BABABA]` with `!text-text-muted` (note the important modifier in character-selection-screen.tsx)
8. Update the two root layouts that have `text-[#BABABA]` in their body className

Files to modify (14 files):
- `src/app/globals.css` (add tokens)
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

## Inputs

- ``src/app/globals.css` — existing CSS custom properties and Tailwind theme config`
- ``src/app/(landing)/layout.tsx` — has `text-[#BABABA]` in body className`
- ``src/app/(everywhere-else)/layout.tsx` — has `text-[#BABABA]` in body className`
- ``src/components/character-selection-screen.tsx` — has `text-[#BABABA]` and `bg-[#1A1A1A]``
- ``src/components/countdown-timer.tsx` — has `text-[#BABABA]` and `bg-[#1a1a1a]``
- ``src/components/footer.tsx` — has `text-[#BABABA]``
- ``src/components/hero-details.tsx` — has `text-[#bababa]` and `bg-[#1a1a1a]` and `bg-[#18181b]``
- ``src/components/multi-step-registration-form.tsx` — has `text-[#BABABA]` and `text-[#bababa]``
- ``src/components/navbar.tsx` — has `border-[#BABABA]``
- ``src/components/team-invite-modal.tsx` — has `text-[#bababa]``
- ``src/components/time-restriction.tsx` — has `text-[#BABABA]``
- ``src/app/(landing)/page.tsx` — may have hardcoded colors`
- ``src/app/(everywhere-else)/register/page.tsx` — may have hardcoded colors`
- ``src/app/(everywhere-else)/invite/[code]/page.tsx` — may have hardcoded colors`

## Expected Output

- ``src/app/globals.css` — new semantic CSS custom properties and Tailwind theme tokens added`
- ``src/app/(landing)/layout.tsx` — hardcoded hex replaced with token class`
- ``src/app/(everywhere-else)/layout.tsx` — hardcoded hex replaced with token class`
- ``src/components/character-selection-screen.tsx` — all hardcoded hex replaced`
- ``src/components/countdown-timer.tsx` — all hardcoded hex replaced`
- ``src/components/footer.tsx` — all hardcoded hex replaced`
- ``src/components/hero-details.tsx` — all hardcoded hex replaced`
- ``src/components/multi-step-registration-form.tsx` — all hardcoded hex replaced`
- ``src/components/navbar.tsx` — hardcoded hex replaced`
- ``src/components/team-invite-modal.tsx` — hardcoded hex replaced`
- ``src/components/time-restriction.tsx` — hardcoded hex replaced`

## Verification

Run `rg '#[0-9a-fA-F]{6}' --glob '*.tsx' --glob '*.ts' src/` — must return zero matches. Run `bun run build` — must exit 0.
