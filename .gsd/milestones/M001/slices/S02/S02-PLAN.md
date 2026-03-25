# S02: Brand Identity and Content

**Goal:** Site looks and reads like a 2026 event — all year references, metadata, dates, venue, and pricing updated across both layouts, landing page, registration form, and time-restriction component
**Demo:** the site looks and reads like a 2026 event — new brand fonts, logo, hero images, and all copy/dates/pricing updated

## Must-Haves

- `rg '2025' --glob '*.tsx' --glob '*.ts' --glob '*.json' src/ public/` returns zero matches (all year references updated)
- `rg 'May 11' --glob '*.tsx' --glob '*.ts' src/` returns zero matches (all old date references updated)
- Both root layout metadata objects contain "YTHWKND 2026" and are structurally identical
- `public/manifest.json` contains "YTHWKND 2026"
- Landing page shows 2026 event dates, venue, and pricing
- `bun run build` exits 0 with all 12 routes compiling

## Proof Level

- This slice proves: Operational — build passes and grep confirms all content updated

## Integration Closure

- Upstream surfaces consumed: S01's semantic color tokens (`--text-muted`, `--surface`), motion/react imports, Next.js 16.2.1 runtime — all stable, no changes needed
- New wiring introduced: none — pure content updates
- What remains: S03 (animation polish + RSC conversion), S04 (end-to-end verification)

## Verification

- none — pure content/metadata updates with no runtime boundary changes

## Tasks

- [x] **T01: Update metadata across both root layouts, manifest.json, and navbar for 2026** `est:20m`
  Both root layouts share identical metadata objects with 'YTHWKND 2025' in title (5 refs each), description (3 refs each), keywords (1 ref each), and siteName (1 ref each). These must be updated in lockstep. Also update manifest.json and navbar alt text. The 2026 theme stays as 'The Multiverse of Mystery' (no new theme confirmed), but all year references change from 2025 to 2026.

Steps:
1. In `src/app/(landing)/layout.tsx`, replace all occurrences of '2025' with '2026' in the metadata object (title, keywords, openGraph title/siteName/alt, twitter title). There are 5 title refs, 1 keyword ref, 1 siteName ref = ~7 replacements.
2. Copy the exact metadata object to `src/app/(everywhere-else)/layout.tsx` to ensure lockstep. The metadata objects must be structurally identical — the layouts differ only in body content.
3. Update `public/manifest.json` name field from 'YTHWKND 2025' to 'YTHWKND 2026'.
4. Update `src/components/navbar.tsx` alt text from 'Logo for YTHWKND 2025' to 'Logo for YTHWKND 2026'.
5. Run `bun run build` to confirm all routes compile.

Constraints:
- Do NOT change the description text or theme name — only the year '2025' → '2026'
- Both layouts MUST have identical metadata — copy one to the other, don't edit independently
- The format-date.ts comment with '2025' is just an example format string, not content — leave it alone
  - Files: `src/app/(landing)/layout.tsx`, `src/app/(everywhere-else)/layout.tsx`, `public/manifest.json`, `src/components/navbar.tsx`
  - Verify: rg '2025' --glob '*.tsx' --glob '*.json' src/app/ src/components/navbar.tsx public/manifest.json && echo 'FAIL: 2025 still found' || echo 'PASS: no 2025 references in layouts/manifest/navbar'

- [x] **T02: Update landing page dates/venue/pricing, time-restriction dates, registration form year, and constants title for 2026** `est:20m`
  Update all event-specific content: landing page registration open date, event dates, venue, pricing; time-restriction component dates (currently showing 2024!); registration form age year reference; and constants.ts site title.

Steps:
1. In `src/app/(landing)/page.tsx`:
   - Line 11: Change `new Date(2025, 4, 11, 12, 30, 0)` to `new Date(2026, 4, 10, 12, 30, 0)` and update comment to 'May 10, 2026, 12:30 PM'
   - Line 63: Change '27 to 29 June' to '26 to 28 June' (2026 event dates)
   - Lines 65-66: Keep 'Bayu Beach Resort<br />Port Dickson' (same venue)
   - Lines 79-81: Keep pricing as-is (RM550/RM300/RM250) unless 2026 pricing differs
   - Line 147: Change 'Registration opens on May 11, 2025 at 12:30 PM' to 'Registration opens on May 10, 2026 at 12:30 PM'
2. In `src/components/time-restriction.tsx`:
   - Line 13: Change `new Date(2024, 4, 11, 12, 30, 0)` to `new Date(2026, 4, 10, 12, 30, 0)` and update comment
   - Line 41: Change 'May 11, 2024 at 12:30 PM' to 'May 10, 2026 at 12:30 PM'
3. In `src/components/multi-step-registration-form.tsx`:
   - Line 711: Change 'Age (as of 2025)' to 'Age (as of 2026)'
4. In `src/lib/constants.ts`:
   - Line 3: Keep SITE_MAIN_TITLE as 'MULTIVERSE OF MYSTERY' (no confirmed theme change)
   - No other constants changes needed (heroes, teams, CG leaders stay as-is without confirmed 2026 data)
5. Run `bun run build` to confirm all routes compile.

Constraints:
- The registration date is being set to May 10, 2026 (a Sunday) as a reasonable placeholder. The user can adjust the exact date later.
- Do NOT refactor the 1,771-line multi-step-registration-form.tsx — only change the one age year reference
- Do NOT change hero names, team names, or CG leaders without confirmed 2026 data
- The time-restriction.tsx has a bug — it shows 2024 instead of 2025. Fix it to 2026 directly.
- Event dates changed from '27 to 29 June' to '26 to 28 June' (last weekend of June 2026)
  - Files: `src/app/(landing)/page.tsx`, `src/components/time-restriction.tsx`, `src/components/multi-step-registration-form.tsx`, `src/lib/constants.ts`
  - Verify: rg '2025|2024|May 11' --glob '*.tsx' --glob '*.ts' src/ && echo 'FAIL: old dates still found' || echo 'PASS: all dates updated to 2026'

## Files Likely Touched

- src/app/(landing)/layout.tsx
- src/app/(everywhere-else)/layout.tsx
- public/manifest.json
- src/components/navbar.tsx
- src/app/(landing)/page.tsx
- src/components/time-restriction.tsx
- src/components/multi-step-registration-form.tsx
- src/lib/constants.ts
