# S02: Brand Identity and Content — UAT

**Milestone:** M001
**Written:** 2026-03-25T07:02:29.144Z

# S02: Brand Identity and Content — UAT

**Milestone:** M001
**Written:** 2026-03-25

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: This slice is pure content updates (year references, dates, metadata) with no runtime behavior changes. Grep verification + build confirmation proves all content was updated correctly.

## Preconditions

- Codebase at the S02 commit (all content updates applied)
- `bun run build` exits 0 (already verified)
- No dev server needed — this is artifact-level verification

## Smoke Test

Run `rg '2025|2024' --glob '*.tsx' --glob '*.ts' --glob '*.json' src/ public/ | grep -v format-date.ts` — should return zero matches.

## Test Cases

### 1. All year references updated in metadata

1. Open `src/app/(landing)/layout.tsx` and search for "2026"
2. Count occurrences in the metadata object
3. **Expected:** 5 occurrences of "2026" (title, keywords, openGraph title, siteName, image alt, twitter title)
4. Open `src/app/(everywhere-else)/layout.tsx` and repeat
5. **Expected:** Identical 5 occurrences, metadata objects structurally identical

### 2. Manifest and navbar updated

1. Open `public/manifest.json`
2. **Expected:** `"name": "YTHWKND 2026"`
3. Open `src/components/navbar.tsx` and search for alt text
4. **Expected:** `"Logo for YTHWKND 2026"`

### 3. Landing page event dates correct

1. Open `src/app/(landing)/page.tsx`
2. Find the registration date constant (line ~11)
3. **Expected:** `new Date(2026, 4, 10, 12, 30, 0)` with comment "May 10, 2026, 12:30 PM"
4. Find event dates display (line ~63)
5. **Expected:** "26 to 28 June"
6. Find registration opens display string (line ~147)
7. **Expected:** "Registration opens on May 10, 2026 at 12:30 PM"

### 4. Time restriction gate updated

1. Open `src/components/time-restriction.tsx`
2. Find the Date constructor (line ~13)
3. **Expected:** `new Date(2026, 4, 10, 12, 30, 0)`
4. Find the display string (line ~41)
5. **Expected:** "May 10, 2026 at 12:30 PM"

### 5. Registration form age label updated

1. Open `src/components/multi-step-registration-form.tsx`
2. Search for "Age (as of"
3. **Expected:** "Age (as of 2026)"

### 6. Build compiles all routes

1. Run `bun run build`
2. **Expected:** Exit code 0, all 12 routes listed (1 static landing, 1 static register, 1 404, 9 dynamic API/invite routes)

## Edge Cases

### format-date.ts exclusion

1. Run `rg '2025' src/lib/format-date.ts`
2. **Expected:** One match — the example comment `// Format: "May 6, 2025 at 4:24 PM"`. This is intentionally unchanged (format example, not event content).

### No stale 2024 references

1. Run `rg '2024' --glob '*.tsx' --glob '*.ts' src/`
2. **Expected:** Zero matches. The time-restriction.tsx 2024 bug has been fixed.

## Failure Signals

- `rg '2025'` (excluding format-date.ts) returns any matches in src/ or public/
- `rg '2024'` returns any matches in .tsx/.ts files
- `rg 'May 11'` returns any matches
- `bun run build` fails or shows TypeScript errors
- `diff` of metadata objects between layouts shows content differences (not just the duck comment)

## Not Proven By This UAT

- Visual rendering of updated content (no dev server or screenshot verification)
- New brand fonts, logo, or hero images (no new assets provided — BRND-02, BRND-03 remain active)
- Updated hero/team/CG leader data (CONT-02 — no 2026 data provided)
- Actual correctness of placeholder dates (May 10, June 26-28) against real 2026 event schedule
- Runtime behavior of registration flow with new dates (deferred to S04 verification)

## Notes for Tester

- The registration date (May 10, 2026) and event dates (June 26-28, 2026) are placeholders. Confirm with event organizers and update if different.
- Pricing, venue, theme, heroes, teams unchanged from 2025 — this is intentional until 2026 data is confirmed.
- The `format-date.ts` "2025" in a comment is intentionally left — it's a format example string, not event content.
