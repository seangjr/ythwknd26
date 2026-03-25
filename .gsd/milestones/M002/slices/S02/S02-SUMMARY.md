---
id: S02
parent: M002
milestone: M002
provides:
  - All 6 API routes rewritten to use Neon SQL via db.ts
  - nanoid added as explicit dependency
  - API response shapes preserved for downstream client components
  - Zero Supabase imports in src/app/api/
requires:
  - slice: S01
    provides: src/lib/db.ts (getClient, handleDatabaseError), schema.sql stored procedures (register_user_extended)
affects:
  - S03
  - S04
key_files:
  - src/app/api/hero-availability/route.ts
  - src/app/api/team-members/route.ts
  - src/app/api/team-invite/route.ts
  - src/app/api/team-invite/check/route.ts
  - src/app/api/register/route.ts
  - package.json
key_decisions:
  - Consolidated team-invite GET from two sequential Supabase queries into a single SQL JOIN for better performance
  - Replaced triple-fallback Supabase registration pattern with sequential pre-checks + single stored procedure call
  - Replaced PGRST116 error code handling with rows.length === 0 checks across all routes
patterns_established:
  - Neon route pattern: import getClient/handleDatabaseError from @/lib/db, const sql = getClient(), tagged-template queries, try/catch with handleDatabaseError
  - Empty result handling: rows.length === 0 replaces Supabase PGRST116 error checks
  - Response shape preservation: camelCase mapping from snake_case SQL columns maintains API contract for downstream clients
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M002/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S02/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-03-25T14:15:37.193Z
blocker_discovered: false
---

# S02: API Route Migration

**All 6 API routes migrated from Supabase fluent API to Neon parameterized SQL via db.ts — zero Supabase imports remain in src/app/api/.**

## What Happened

Migrated all 6 API route files from Supabase client to Neon serverless SQL. T01 handled the 4 simpler routes (hero-availability, team-members, team-invite, team-invite/check) and T02 handled the complex register route.\n\n**T01 (4 routes):** Each route was rewritten to import `getClient`/`handleDatabaseError` from `@/lib/db` instead of `@/lib/supabase`. Supabase fluent queries (`.from().select().eq()`) were replaced with Neon tagged-template parameterized SQL. Key pattern changes: Neon returns arrays directly (not `{data, error}` objects), empty results are `[]` not PGRST116 errors, and `.single()` becomes `rows[0]` with length check. The team-invite GET was optimized from two sequential queries into a single SQL JOIN. nanoid was added as an explicit dependency.\n\n**T02 (register route):** The complex triple-fallback Supabase pattern (direct insert → RPC simple → RPC params) was replaced with a clean flow: sequential pre-check queries (line taken, email unique, hero available) followed by a single `register_user_extended` stored procedure call for atomic insert + hero_availability update. Error handling preserved via `handleDatabaseError` which maps Postgres error codes to the same HTTP status codes the clients expect.\n\nAll response shapes were preserved exactly — no API contract changes for downstream client components in S03.

## Verification

Three verification gates passed:\n1. `rg 'from.*@/lib/supabase' src/app/api/` — exit code 1 (zero matches), confirming no Supabase imports remain in any API route\n2. `rg 'from.*@/lib/db' src/app/api/` — 6 matches (hero-availability, team-members, team-invite, team-invite/check, register, health-check), confirming all routes use db.ts\n3. `npx tsc --noEmit | grep -E 'hero-availability|team-members|team-invite|register/route|health-check'` — zero type errors in any migrated API route file

## Requirements Advanced

- NEON-01 — All 6 API routes now import from @/lib/db instead of @/lib/supabase. Parameterized SQL replaces fluent Supabase queries. Zero Supabase imports remain in src/app/api/. Full runtime validation deferred to S04.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

team-invite GET consolidated from two sequential Supabase queries into a single SQL JOIN query — minor optimization over the plan's 1:1 translation approach.

## Known Limitations

Runtime verification deferred to S04 E2E testing. Routes compile and type-check correctly but haven't been tested against a live Neon database in this slice.

## Follow-ups

S03 must migrate client components to use these API routes instead of direct Supabase client calls. S04 must verify all routes return correct data against live Neon DB.

## Files Created/Modified

- `src/app/api/hero-availability/route.ts` — Rewrote GET/POST from Supabase fluent API to Neon parameterized SQL
- `src/app/api/team-members/route.ts` — Rewrote GET from Supabase to Neon SQL with array return handling
- `src/app/api/team-invite/route.ts` — Rewrote GET (consolidated to JOIN) and POST to Neon SQL, added nanoid import
- `src/app/api/team-invite/check/route.ts` — Rewrote GET from Supabase to Neon SQL with rows.length check
- `src/app/api/register/route.ts` — Replaced triple-fallback Supabase pattern with sequential pre-checks + register_user_extended stored procedure
- `package.json` — Added nanoid as explicit dependency
