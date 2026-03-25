---
id: S02
parent: M001
milestone: M001
provides:
  - All event copy, dates, and metadata updated for 2026 — downstream slices (S03, S04) can work with current content
  - Stable content baseline for RSC conversion (S03) — no more content changes expected unless new 2026 data arrives
requires:
  - slice: S01
    provides: Stable Next.js 16.2.1 runtime with motion/react imports and semantic color tokens — all consumed without changes
affects:
  - S03
  - S04
key_files:
  - src/app/(landing)/layout.tsx
  - src/app/(everywhere-else)/layout.tsx
  - public/manifest.json
  - src/components/navbar.tsx
  - src/app/(landing)/page.tsx
  - src/components/time-restriction.tsx
  - src/components/multi-step-registration-form.tsx
key_decisions:
  - Both root layout metadata objects kept structurally identical (differing only by duck comment) to ensure SEO/social metadata consistency across route groups
  - Registration date set to May 10, 2026 (Sunday) as placeholder — same relative position in the month as 2025's May 11
  - Event dates set to June 26-28, 2026 (Friday-Sunday, last full weekend of June 2026)
  - time-restriction.tsx fixed directly from 2024→2026, skipping intermediate 2025 that was never applied
  - Pricing, venue, theme, heroes, teams, and CG leaders all kept unchanged — no confirmed 2026 data provided
patterns_established:
  - Content-only updates with no runtime boundary changes — pure sed/edit replacements verified by grep + build
  - Two-layout lockstep pattern: both root layouts must have identical metadata objects, verified by diff
  - Use sed -i in worktree environments instead of Edit tool to avoid symlink path resolution issues
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-03-25T07:02:29.144Z
blocker_discovered: false
---

# S02: Brand Identity and Content

**All event copy, dates, metadata, and year references updated from 2025 to 2026 across both layouts, landing page, registration form, time-restriction gate, manifest, and navbar — build passes with all 12 routes compiling.**

## What Happened

This slice performed a comprehensive content sweep to update the site from a 2025 event to 2026. The work split cleanly into two tasks:

**T01 — Metadata and structural year references:** Updated all 2025→2026 year references in both root layout metadata objects (title, keywords, openGraph, twitter), manifest.json name field, and navbar alt text. Both layout metadata objects were verified structurally identical via diff (differing only by a duck comment in the landing layout). 6 replacements per layout + 1 manifest + 1 navbar = 14 total replacements.

**T02 — Event content and dates:** Updated the landing page registration open date from May 11, 2025 to May 10, 2026 (both the Date constructor and display string), event dates from "27 to 29 June" to "26 to 28 June" (last full weekend of June 2026), the time-restriction component gate date (fixing a pre-existing bug where it showed 2024 instead of 2025 — corrected directly to 2026), and the registration form age label from "as of 2025" to "as of 2026". Venue (Bayu Beach Resort, Port Dickson) and pricing (RM550/RM300/RM250) were confirmed unchanged. The theme name "Multiverse of Mystery" was also kept.

Both tasks encountered a worktree symlink issue where the Edit tool resolved paths differently than rg/head, causing edits to appear to succeed but not persist. Both resolved this by using `sed -i` for the affected replacements. This is now documented in KNOWLEDGE.md for future slices.

## Verification

1. **Year reference grep:** `rg '2025' --glob '*.tsx' --glob '*.ts' --glob '*.json' src/ public/` returns only the format-date.ts example comment (explicitly excluded by plan) — PASS.
2. **Old date grep:** `rg 'May 11' --glob '*.tsx' --glob '*.ts' src/` returns zero matches — PASS.
3. **Stale year/date grep:** `rg '2025|2024|May 11' --glob '*.tsx' --glob '*.ts' src/ | grep -v format-date.ts` returns zero matches — PASS.
4. **Metadata lockstep:** `diff` of metadata objects between both root layouts shows only the duck comment difference — PASS.
5. **YTHWKND 2026 presence:** `grep -c 'YTHWKND 2026'` confirms 5 refs in each layout + 1 in manifest — PASS.
6. **Build:** `bun run build` exits 0, all 12 routes compile with Next.js 16.2.1 Turbopack — PASS.

## Requirements Advanced

- CONT-01 — All copy updated for 2026 — event dates, registration date, age reference, metadata year references all changed from 2025 to 2026
- CONT-03 — Registration open date updated to May 10, 2026 at 12:30 PM in landing page and time-restriction gate
- CONT-05 — Both root layout metadata objects updated with YTHWKND 2026 in title, keywords, openGraph, and twitter; manifest.json updated

## Requirements Validated

- CONT-01 — rg '2025|2024' across all .tsx/.ts files (excluding format-date.ts example comment) returns zero matches; all event dates, year refs, and copy confirmed updated to 2026
- CONT-03 — Registration open date set to May 10, 2026 in Date constructor and display string; rg 'May 11' returns zero matches; time-restriction gate also updated
- CONT-05 — grep -c 'YTHWKND 2026' confirms 5 refs per layout + 1 in manifest; diff of metadata objects confirms structural identity between both layouts

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

Both tasks used `sed -i` instead of the Edit tool for several file modifications due to a worktree symlink path resolution issue — the Edit tool writes to the symlink source path while rg/head read from the real path under `.gsd/projects/`. Additionally, tab-indented lines in source files displayed as spaces in Read output, causing Edit oldText mismatches. These are tooling workarounds, not plan deviations.

## Known Limitations

- Registration date (May 10, 2026) and event dates (June 26-28, 2026) are reasonable placeholders — no confirmed 2026 event details were provided. Easy to update in clearly documented locations.
- Pricing (RM550/RM300/RM250), venue (Bayu Beach Resort, Port Dickson), theme ("Multiverse of Mystery"), hero names, team names, and CG leaders are all unchanged from 2025 — no new data was provided. These are content-only changes when real 2026 data arrives.
- Brand fonts and logo assets were not updated — no new font files or logo images were provided. BRND-02 and BRND-03 remain active.
- `format-date.ts` still contains a "2025" in an example comment — this is intentional (it's a format example, not event content).

## Follow-ups

- Update registration date, event dates, pricing, venue, and theme when actual 2026 event details are confirmed.
- New brand fonts (BRND-02) and logo/brand assets (BRND-03) need to be applied when provided — separate from content updates.
- Hero images and team data (CONT-02) need updating when 2026 data is available.

## Files Created/Modified

- `src/app/(landing)/layout.tsx` — Updated 6 year references (2025→2026) in metadata object: title, keywords, openGraph title/siteName/image alt, twitter title
- `src/app/(everywhere-else)/layout.tsx` — Updated identical 6 year references in metadata object to stay in lockstep with landing layout
- `public/manifest.json` — Updated name field from 'YTHWKND 2025' to 'YTHWKND 2026'
- `src/components/navbar.tsx` — Updated alt text from 'Logo for YTHWKND 2025' to 'Logo for YTHWKND 2026'
- `src/app/(landing)/page.tsx` — Updated registration open date to May 10, 2026; event dates to '26 to 28 June'; display string to match
- `src/components/time-restriction.tsx` — Fixed 2024→2026 date bug in gate Date constructor and display string
- `src/components/multi-step-registration-form.tsx` — Updated age label from 'Age (as of 2025)' to 'Age (as of 2026)'
