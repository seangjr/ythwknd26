# S04: Verification — UAT

**Milestone:** M001
**Written:** 2026-03-25T09:40:46.505Z

# S04: Verification — UAT

**Milestone:** M001
**Written:** 2026-03-25

## UAT Type

- UAT mode: mixed (artifact-driven for structural checks, live-runtime for flow verification)
- Why this mode is sufficient: Structural checks confirm build integrity and file correctness. Live-runtime checks (deferred) require a running dev server with Neon database connectivity.

## Preconditions

1. Neon database is provisioned and env vars configured (`DATABASE_URL` or equivalent Neon connection string)
2. Google Sheets env vars configured (`GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`) — optional for VERF-03
3. `bun install` completed successfully
4. Dev server started with `bun dev` and accessible at `http://localhost:3000`
5. Time gate bypass applied (change `new Date(2026, ...)` to `new Date(2024, ...)` in `time-restriction.tsx`, `page.tsx`, `registration-cta.tsx`) to access registration pages before May 10, 2026

## Smoke Test

Run `bun run build` — should exit 0 with all 11 pages generated and zero TypeScript errors. Confirm `public/placeholder.svg` exists and `nanoid` appears in `package.json` dependencies.

## Test Cases

### 1. VERF-STRUCT-01: Build passes with zero errors

1. Run `bun run build`
2. **Expected:** Exit code 0, all 11 pages generated, no TypeScript errors

### 2. VERF-STRUCT-02: Placeholder SVG exists

1. Run `ls public/placeholder.svg`
2. **Expected:** File exists and is a valid SVG

### 3. VERF-STRUCT-03: nanoid is an explicit dependency

1. Run `grep '\"nanoid\"' package.json`
2. **Expected:** Shows `"nanoid": "^5.1.7"` (or later)

### 4. VERF-STRUCT-04: Time gate dates are correct for production

1. Run `grep '2026' src/components/time-restriction.tsx`
2. Run `grep '2026' src/app/(landing)/page.tsx`
3. Run `grep '2026' src/components/registration-cta.tsx`
4. **Expected:** All three files show `new Date(2026, 4, 10, 12, 30, 0)` and display strings reference "May 10, 2026"

### 5. VERF-01: Full registration flow (DEFERRED — requires Neon)

1. Apply time gate bypass (change 2026 → 2024 in three files)
2. Start dev server: `bun dev`
3. Navigate to `http://localhost:3000`
4. Verify landing page shows "30 May to 1 June", "Peacehaven", and pricing (RM130/RM160)
5. Click "Register" button
6. On `/register`, select a party from the grid
7. Choose a class (Warrior, Archer, Scout, Guardian, or Scholar)
8. Fill multi-step registration form: name, email, phone, age, church, dietary restrictions
9. Submit the form
10. **Expected:** Registration completes without errors, confirmation shown

### 6. VERF-02: Team invite flow (DEFERRED — requires Neon)

1. Start dev server with database connected
2. Generate a team invite code (via API or previous registration)
3. Navigate to `/invite/{code}`
4. Verify team/party info is displayed
5. Select a class
6. Fill registration form
7. Submit
8. **Expected:** Registration completes, user added to the team

### 7. VERF-03: Google Sheets sync (DEFERRED — requires Neon + Sheets env vars)

1. Configure Google Sheets env vars
2. Complete a registration (from VERF-01)
3. Check dev server logs for Sheets sync API call
4. **Expected:** POST to `/api/sheets-sync` returns 200, data appears in Google Sheet

### 8. VERF-04: Cross-browser and mobile (DEFERRED — requires running server)

1. Start dev server
2. Open landing page in Chrome — verify layout, fonts, animations
3. Open landing page in Safari — verify same
4. Set viewport to 375x812 (iPhone) — verify no horizontal scroll, no broken layout
5. Navigate to `/register` on mobile viewport — verify party grid and form are usable
6. **Expected:** Consistent rendering across browsers, no layout breaks on mobile

## Edge Cases

### Time gate behavior

1. With dates set to 2026, navigate to `/register` before May 10, 2026
2. **Expected:** Countdown timer shown, registration form not accessible
3. Change system date to after May 10, 2026 (or bypass gate)
4. **Expected:** Registration form loads normally

### Missing class images

1. Navigate to class selection screen
2. **Expected:** All class cards render with placeholder.svg fallback — no broken image icons

## Deferred Items

Tests 5-8 (VERF-01 through VERF-04) are deferred until the Supabase→Neon migration (D006) is complete and Neon env vars are configured. Structural tests 1-4 are immediately executable and should all pass.
