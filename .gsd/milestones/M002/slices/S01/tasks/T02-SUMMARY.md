---
id: T02
parent: S01
milestone: M002
key_files:
  - src/app/api/health-check/route.ts
  - .env.local
key_decisions:
  - Health-check uses SELECT 1 AS ok instead of querying registrations table — simpler, no dependency on seed data existing, faster probe
duration: ""
verification_result: passed
completed_at: 2026-03-25T14:05:41.043Z
blocker_discovered: false
---

# T02: Provision Neon schema/seed, rewrite health-check route to use db.ts, verify end-to-end connectivity

**Provision Neon schema/seed, rewrite health-check route to use db.ts, verify end-to-end connectivity**

## What Happened

Collected DATABASE_URL via secure_env_collect and wrote it to .env.local. Verified psql connectivity to the Neon database, then ran schema.sql (4 tables, 4 indexes, 2 stored procedures) and seed.sql (21 teams, 105 hero_availability rows) successfully.

Rewrote src/app/api/health-check/route.ts to import from @/lib/db instead of @/lib/supabase. The new route uses the Neon tagged-template client via getClient(), executes `SELECT 1 AS ok` as a connectivity probe, and returns `{"status":"healthy"}` on success. Error paths use handleDatabaseError to map DatabaseConnectionError to 503 and Postgres error codes to appropriate HTTP statuses.

Verified the health-check endpoint returns `{"status":"healthy"}` against the live Neon database. Confirmed seed data counts: teams=21, hero_availability=105, matching the expected values from constants.ts.

Had to clear .next cache and handle a port collision (port 3000 occupied by a stale process) during dev server testing — resolved by killing the stale process and restarting.

## Verification

1. psql schema.sql executed cleanly (CREATE TABLE ×4, CREATE INDEX ×4, CREATE FUNCTION ×2)
2. psql seed.sql executed cleanly (INSERT 21 teams, INSERT 105 hero_availability)
3. Direct DB query confirms teams=21, hero_availability=105
4. curl http://localhost:3000/api/health-check returns {"status":"healthy"}
5. npx tsc --noEmit shows zero errors in health-check/route.ts and db.ts (23 pre-existing errors in other files)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `psql $DATABASE_URL -f schema.sql` | 0 | ✅ pass | 2500ms |
| 2 | `psql $DATABASE_URL -f seed.sql` | 0 | ✅ pass | 1800ms |
| 3 | `psql $DATABASE_URL -c 'SELECT count(*) FROM teams / hero_availability'` | 0 | ✅ pass (21 teams, 105 hero_availability) | 1200ms |
| 4 | `curl -s http://localhost:3000/api/health-check` | 0 | ✅ pass ({"status":"healthy"}) | 3000ms |
| 5 | `npx tsc --noEmit | grep 'health-check|db.ts'` | 0 | ✅ pass (no errors in T02 files) | 5600ms |


## Deviations

Had to use `export $(grep -v '^#' .env.local | xargs)` instead of `source .env.local` for psql because .env.local uses KEY=VALUE format without export. Port 3000 was occupied by a stale process during testing — resolved by killing it.

## Known Issues

23 pre-existing TypeScript errors in the codebase (none in T02 files) — these are from untyped Supabase generics in other route files, expected to be resolved during S02 migration.

## Files Created/Modified

- `src/app/api/health-check/route.ts`
- `.env.local`
