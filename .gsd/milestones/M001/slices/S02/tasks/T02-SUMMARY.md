---
id: T02
parent: S02
milestone: M001
key_files:
  - src/app/(landing)/page.tsx
  - src/components/time-restriction.tsx
  - src/components/multi-step-registration-form.tsx
key_decisions:
  - Registration date set to May 10, 2026 (Sunday) as placeholder — same relative position as 2025's May 11
  - Event dates set to June 26–28, 2026 (Friday–Sunday, last full weekend of June 2026)
  - time-restriction.tsx fixed directly from 2024→2026, skipping intermediate 2025 that was never applied
duration: ""
verification_result: passed
completed_at: 2026-03-25T06:59:39.253Z
blocker_discovered: false
---

# T02: Update landing page dates/venue/pricing, time-restriction dates, registration form year, and constants title for 2026

**Update landing page dates/venue/pricing, time-restriction dates, registration form year, and constants title for 2026**

## What Happened

Updated all event-specific content across three files to reflect 2026:

1. **`src/app/(landing)/page.tsx`** — Changed registration open date from `new Date(2025, 4, 11, ...)` to `new Date(2026, 4, 10, ...)`, updated event dates from "27 to 29 June" to "26 to 28 June" (last full weekend of June 2026), and updated the display string to "Registration opens on May 10, 2026 at 12:30 PM". Venue (Bayu Beach Resort, Port Dickson) and pricing (RM550/RM300/RM250) left unchanged per plan.

2. **`src/components/time-restriction.tsx`** — Fixed pre-existing 2024 date bug: updated Date constructor from `new Date(2024, 4, 11, ...)` to `new Date(2026, 4, 10, ...)` and display string from "May 11, 2024" to "May 10, 2026 at 12:30 PM".

3. **`src/components/multi-step-registration-form.tsx`** — Changed age label from "Age (as of 2025)" to "Age (as of 2026)" on line 711.

4. **`src/lib/constants.ts`** — Verified: SITE_MAIN_TITLE stays "MULTIVERSE OF MYSTERY", no year references present, no changes needed.

Initial edit attempts via the Edit tool failed silently because the source files use tab indentation while the Read tool displayed them as spaces. Switched to sed for the Date constructor replacements, which correctly handled the whitespace.

## Verification

1. `rg '2025|2024|May 11' --glob '*.tsx' --glob '*.ts' src/ | grep -v format-date.ts` — returned no matches, confirming all old year/date references eliminated.
2. `bun run build` — compiled successfully in 33s with zero TypeScript errors, all 12 pages generated.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg '2025|2024|May 11' --glob '*.tsx' --glob '*.ts' src/ | grep -v format-date.ts && echo FAIL || echo PASS` | 0 | ✅ pass | 150ms |
| 2 | `bun run build` | 0 | ✅ pass | 33400ms |


## Deviations

Used sed instead of the Edit tool for the Date constructor lines due to tab/space whitespace mismatch between how Read displays content and actual file bytes. The other four edits (event dates, display strings, age label) applied correctly via Edit since they matched inline text without leading whitespace sensitivity.

## Known Issues

None.

## Files Created/Modified

- `src/app/(landing)/page.tsx`
- `src/components/time-restriction.tsx`
- `src/components/multi-step-registration-form.tsx`
