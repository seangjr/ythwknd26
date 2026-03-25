---
estimated_steps: 22
estimated_files: 4
skills_used: []
---

# T02: Update landing page dates/venue/pricing, time-restriction dates, registration form year, and constants title for 2026

Update all event-specific content: landing page registration open date, event dates, venue, pricing; time-restriction component dates (currently showing 2024!); registration form age year reference; and verify constants.ts.

Steps:
1. In `src/app/(landing)/page.tsx`:
   - Line 11: Change `new Date(2025, 4, 11, 12, 30, 0)` to `new Date(2026, 4, 10, 12, 30, 0)` and update comment to 'May 10, 2026, 12:30 PM'
   - Line 63: Change '27 to 29 June' to '26 to 28 June' (2026 event dates — last full weekend of June 2026)
   - Lines 65-66: Keep 'Bayu Beach Resort<br />Port Dickson' (same venue)
   - Lines 79-81: Keep pricing as-is (RM550/RM300/RM250) — no confirmed 2026 pricing changes
   - Line 147: Change 'Registration opens on May 11, 2025 at 12:30 PM' to 'Registration opens on May 10, 2026 at 12:30 PM'
2. In `src/components/time-restriction.tsx`:
   - Line 13: Change `new Date(2024, 4, 11, 12, 30, 0)` to `new Date(2026, 4, 10, 12, 30, 0)` and update comment to 'May 10, 2026, 12:30 PM'
   - Line 41: Change 'May 11, 2024 at 12:30 PM' to 'May 10, 2026 at 12:30 PM'
3. In `src/components/multi-step-registration-form.tsx`:
   - Line 711: Change 'Age (as of 2025)' to 'Age (as of 2026)'
4. Verify `src/lib/constants.ts` — SITE_MAIN_TITLE stays 'MULTIVERSE OF MYSTERY' (no confirmed theme change). No other constants changes needed.
5. Run `bun run build` to confirm all routes compile.
6. Run final verification: `rg '2025|2024|May 11' --glob '*.tsx' --glob '*.ts' src/` should return only the format-date.ts comment (which is just an example format string, not content).

Constraints:
- Registration date is set to May 10, 2026 (a Sunday) as a reasonable placeholder
- Do NOT refactor the 1,771-line multi-step-registration-form.tsx — only change the one age year reference on line 711
- Do NOT change hero names, team names, or CG leaders without confirmed 2026 data
- The time-restriction.tsx currently shows 2024 (a pre-existing bug) — fix to 2026 directly
- Event dates: '27 to 29 June' → '26 to 28 June' (Friday-Sunday, last weekend of June 2026)

## Inputs

- ``src/app/(landing)/page.tsx` — landing page with 2025 registration date (line 11, 147), event dates (line 63), venue (lines 65-66), pricing (lines 79-81)`
- ``src/components/time-restriction.tsx` — time gate with 2024 date bug (lines 13, 41)`
- ``src/components/multi-step-registration-form.tsx` — registration form with 'Age (as of 2025)' on line 711`
- ``src/lib/constants.ts` — central data hub with site title/theme/heroes/teams`

## Expected Output

- ``src/app/(landing)/page.tsx` — registration date updated to May 10, 2026; event dates updated to '26 to 28 June'; display string updated`
- ``src/components/time-restriction.tsx` — date updated from 2024 to May 10, 2026 in both Date constructor and display string`
- ``src/components/multi-step-registration-form.tsx` — age reference updated to 'Age (as of 2026)'`

## Verification

rg '2025|2024|May 11' --glob '*.tsx' --glob '*.ts' src/ | grep -v format-date.ts && echo 'FAIL: old dates still found' || echo 'PASS: all dates updated to 2026'
