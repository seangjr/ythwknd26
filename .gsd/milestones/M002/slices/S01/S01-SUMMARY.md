---
id: S01
parent: M002
milestone: M002
provides:
  - src/lib/db.ts — sql tagged-template client via getClient(), handleDatabaseError(), DatabaseConnectionError
  - schema.sql — DDL for 4 tables with indexes, constraints, and stored procedures
  - seed.sql — 21 teams and 105 hero_availability rows
  - DATABASE_URL configured in .env.local
  - .env.example documenting required env vars
requires:
  []
affects:
  - S02
  - S03
  - S04
key_files:
  - src/lib/db.ts
  - schema.sql
  - seed.sql
  - .env.example
  - src/app/api/health-check/route.ts
  - .env.local
key_decisions:
  - D007: Use neon() tagged-template function (not Pool/Client) for serverless-optimized queries — no persistent connection pool, HTTP-based
  - Preserved identical interface shape as supabase.ts (DatabaseConnectionError, handleDatabaseError) for incremental migration
  - Health-check uses SELECT 1 AS ok instead of querying data tables — simpler, no seed data dependency
  - Added Postgres connection error codes (08001, 08006) to handleDatabaseError for Neon-specific error handling
patterns_established:
  - db.ts client pattern: getClient() returns lazy singleton neon() tagged-template function — all API routes import from @/lib/db
  - Error handling pattern: handleDatabaseError maps Postgres error codes to HTTP status codes, DatabaseConnectionError for missing/invalid DATABASE_URL
  - Schema-as-code: schema.sql and seed.sql in repo root for reproducible provisioning
observability_surfaces:
  - /api/health-check returns {status:'healthy'} or {error:message} with appropriate HTTP codes (200/503/500)
  - DatabaseConnectionError surfaces missing DATABASE_URL with descriptive message
drill_down_paths:
  - .gsd/milestones/M002/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S01/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-03-25T14:07:17.658Z
blocker_discovered: false
---

# S01: Neon DB Client & Schema

**Installed @neondatabase/serverless, created db.ts client module, provisioned schema/seed data on live Neon DB, and verified health-check returns healthy.**

## What Happened

This slice established the Neon database foundation for the Supabase-to-Neon migration.

**T01** installed `@neondatabase/serverless` and created 4 artifacts: `src/lib/db.ts` (Neon tagged-template client with `getClient()`, `handleDatabaseError()`, `DatabaseConnectionError`), `schema.sql` (4 tables — teams, hero_availability, team_invites, registrations — with indexes, foreign keys, and 2 stored procedures), `seed.sql` (21 teams + 105 hero_availability rows via cross-join), and `.env.example` documenting DATABASE_URL. The db.ts interface deliberately mirrors the former supabase.ts shape so API routes can migrate incrementally in S02.

**T02** collected DATABASE_URL via secure_env_collect, ran schema.sql and seed.sql against the live Neon database, rewrote the health-check route to use the new db.ts client, and verified end-to-end: `curl /api/health-check` returns `{"status":"healthy"}`, `SELECT count(*) FROM teams` returns 21, `SELECT count(*) FROM hero_availability` returns 105.

A pre-existing build failure (untyped Supabase generics in invite/[code]/page.tsx) was confirmed to predate this slice — db.ts and health-check/route.ts compile cleanly under tsc. This will resolve naturally when S02 migrates the invite route away from Supabase.

## Verification

1. `src/lib/db.ts` exists and exports getClient, handleDatabaseError, DatabaseConnectionError — confirmed via grep (7 references).
2. `schema.sql` has 4 CREATE TABLE statements, `seed.sql` has 2 INSERT statements — confirmed.
3. `.env.example` documents DATABASE_URL format — confirmed.
4. `@neondatabase/serverless` in package.json — confirmed via grep.
5. Health-check endpoint returns `{"status":"healthy"}` from live Neon DB — confirmed via curl during T02.
6. Direct DB queries confirm seed data: teams=21, hero_availability=105 — confirmed via psql during T02.
7. `npx tsc --noEmit` shows zero errors in db.ts and health-check/route.ts (23 pre-existing errors in other files are unrelated).

## Requirements Advanced

- NEON-01 — Installed @neondatabase/serverless and created db.ts client module — first route (health-check) migrated from Supabase to Neon
- NEON-04 — Schema provisioned (4 tables, indexes, stored procedures), seed data loaded (21 teams, 105 hero_availability), DATABASE_URL configured

## Requirements Validated

- NEON-04 — schema.sql executed on live Neon DB creating 4 tables. seed.sql loaded 21 teams and 105 hero_availability rows. Health-check confirms connectivity. DATABASE_URL documented in .env.example.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

Build uses npm (not bun as plan stated). Pre-existing TypeScript errors in invite page prevent clean `npm run build` exit 0, but all S01 files compile without errors. Health-check uses `SELECT 1 AS ok` instead of querying a data table — simpler and faster connectivity probe.

## Known Limitations

23 pre-existing TypeScript errors from untyped Supabase generics in other route files. These will be resolved when S02 migrates those routes to Neon. The `next build` command does not exit 0 due to these pre-existing errors.

## Follow-ups

S02 should migrate all 6 API routes from Supabase to Neon using the db.ts client. The pre-existing TypeScript errors in invite/[code]/page.tsx will resolve when that route drops the Supabase client.

## Files Created/Modified

- `package.json` — Added @neondatabase/serverless dependency
- `src/lib/db.ts` — New Neon serverless client module — exports getClient(), handleDatabaseError(), DatabaseConnectionError
- `schema.sql` — New DDL for 4 tables (teams, hero_availability, team_invites, registrations) with indexes, constraints, and stored procedures
- `seed.sql` — New seed data — 21 teams and 105 hero_availability rows
- `.env.example` — New env template documenting DATABASE_URL format
- `src/app/api/health-check/route.ts` — Rewritten to use db.ts Neon client instead of Supabase
- `.env.local` — DATABASE_URL configured for live Neon instance
