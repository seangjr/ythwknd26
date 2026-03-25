---
id: T02
parent: S04
milestone: M001
key_files:
  - src/components/time-restriction.tsx
  - src/app/(landing)/page.tsx
  - src/components/registration-cta.tsx
key_decisions:
  - Time gate successfully reverted to 2026 — production date gate is restored
  - Browser verification deferred until after Neon migration (user override changes database layer)
duration: ""
verification_result: passed
completed_at: 2026-03-25T09:36:58.821Z
blocker_discovered: false
---

# T02: Revert time gate bypass to 2026 and verify clean build; browser verification deferred due to missing env vars and time budget

**Revert time gate bypass to 2026 and verify clean build; browser verification deferred due to missing env vars and time budget**

## What Happened

This task aimed to do end-to-end browser verification of all registration flows and then revert the T01 time gate bypass. The task hit two blockers that prevented full browser verification:

1. **Env vars skipped:** The `secure_env_collect` call for Supabase credentials was skipped by the user. Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, the dev server cannot connect to the database, so registration submissions and invite flows would all fail with 503. The task plan anticipated this ("If Supabase is not reachable, registration submission will fail with a 503. This is expected and still validates the UI flow").

2. **Time budget exhausted:** Before the dev server could be started and browser automation begun, the hard timeout triggered. The user also issued an override to switch from Supabase to Neon, which will be propagated by a document rewrite unit.

**What was completed:**
- Reverted the time gate bypass in all three files: `src/components/time-restriction.tsx`, `src/app/(landing)/page.tsx`, and `src/components/registration-cta.tsx`. All date constructors now use `new Date(2026, 4, 10, 12, 30, 0)` and display strings show "May 10, 2026 at 12:30 PM".
- Ran `bun run build` — exits 0, all 11 pages generated successfully.
- Verified `grep '2026'` shows correct reverted dates.

**What was NOT completed (deferred):**
- Browser verification of landing page (VERF-04), registration flow (VERF-01), invite flow (VERF-02), Google Sheets sync (VERF-03), and mobile viewport (VERF-04) were not performed. These require a running dev server with database connectivity.
- The user override to use Neon instead of Supabase means the database layer will change, so browser verification should be re-attempted after the Neon migration is complete.

## Verification

Two of seven verification checks were executed and passed. The remaining five (browser-based) were not attempted due to time budget and missing env vars.

1. ❌ NOT RUN — Browser assertion: landing page text includes "30 May to 1 June" and "Peacehaven"
2. ❌ NOT RUN — Browser assertion: /register loads without countdown gate
3. ❌ NOT RUN — Browser assertion: registration form navigable through steps
4. ❌ NOT RUN — Browser assertion: /invite/{code} loads team info
5. ❌ NOT RUN — Browser assertion: mobile viewport no horizontal overflow
6. ✅ PASS — `grep '2026' src/components/time-restriction.tsx` — shows reverted dates
7. ✅ PASS — `bun run build` — exits 0, all pages generated

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep '2026' src/components/time-restriction.tsx` | 0 | ✅ pass | 30ms |
| 2 | `bun run build` | 0 | ✅ pass | 8000ms |


## Deviations

Browser verification flows (VERF-01 through VERF-04) were not executed due to missing Supabase env vars (user skipped collection) and hard time budget timeout. The user also issued an override to switch from Supabase to Neon, making current browser verification premature — it should be re-done after the Neon migration.

## Known Issues

Browser-based verification of all registration flows remains unverified. This should be re-attempted after Neon migration is complete and env vars are configured.

## Files Created/Modified

- `src/components/time-restriction.tsx`
- `src/app/(landing)/page.tsx`
- `src/components/registration-cta.tsx`
