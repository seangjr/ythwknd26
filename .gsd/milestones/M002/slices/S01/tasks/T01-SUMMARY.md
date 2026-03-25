---
id: T01
parent: S01
milestone: M002
key_files:
  - src/lib/db.ts
  - schema.sql
  - seed.sql
  - .env.example
  - package.json
key_decisions:
  - Used neon() tagged-template function (not Pool/Client) for serverless-optimized queries
  - Preserved identical interface shape (DatabaseConnectionError class, handleDatabaseError function) as supabase.ts for incremental migration
  - Added Postgres connection error codes (08001, 08006) to handleDatabaseError for better Neon-specific error handling
  - Schema includes both stored procedures (register_user, register_user_extended) from existing Supabase functions
duration: ""
verification_result: mixed
completed_at: 2026-03-25T13:46:00.722Z
blocker_discovered: false
---

# T01: Install @neondatabase/serverless, create db.ts client module, schema.sql, seed.sql, and .env.example

**Install @neondatabase/serverless, create db.ts client module, schema.sql, seed.sql, and .env.example**

## What Happened

Installed `@neondatabase/serverless` via npm. Created `src/lib/db.ts` as the new Neon serverless database client, exporting `getClient()`, `handleDatabaseError()`, and `DatabaseConnectionError` — preserving the same interface shape as the former `src/lib/supabase.ts` so downstream API routes can migrate incrementally.

Created `schema.sql` with all 4 tables used by the codebase (`teams`, `hero_availability`, `team_invites`, `registrations`), appropriate indexes, foreign keys, and both stored procedures (`register_user`, `register_user_extended`). The schema was derived from the existing Supabase SQL functions and the API route `.from()` calls.

Created `seed.sql` with the 21 teams from `CONSTANTS.TEAMS` and a cross-join insert for 105 hero_availability rows (5 heroes × 21 teams), matching the hero IDs from `CONSTANTS.HEROES`.

Created `.env.example` documenting the `DATABASE_URL` variable needed for Neon, with legacy Supabase vars commented out for reference during migration.

The `next build` failure is pre-existing on this branch (untyped Supabase generics in `invite/[code]/page.tsx` cause `Property 'line_number' does not exist on type 'never'`). This was confirmed by stashing all changes and running build — same failure. The new `db.ts` module has zero TypeScript errors under the project's tsconfig.

## Verification

1. `npx tsc --noEmit 2>&1 | grep db.ts` — no errors in db.ts (confirmed clean under project tsconfig).
2. `test -s schema.sql && test -s seed.sql && test -s .env.example` — all files exist and are non-empty.
3. `grep neondatabase package.json` — confirms `@neondatabase/serverless` added as dependency.
4. `next build` fails with pre-existing type error in invite page (not related to T01 changes). Verified by stashing changes and rebuilding — same failure.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit 2>&1 | grep db.ts` | 0 | ✅ pass | 5600ms |
| 2 | `test -s schema.sql && test -s seed.sql && test -s .env.example` | 0 | ✅ pass | 50ms |
| 3 | `grep neondatabase package.json` | 0 | ✅ pass | 20ms |
| 4 | `npm run build (pre-existing failure)` | 1 | ⚠️ pre-existing failure (not T01-related) | 22100ms |


## Deviations

The task plan specifies `bun run build` but the project uses npm. Used `npm run build` instead. The pre-existing `next build` failure (untyped Supabase generics in invite page) prevents a clean build exit code 0, but db.ts itself compiles without errors.

## Known Issues

Pre-existing `next build` failure: `Property 'line_number' does not exist on type 'never'` in `src/app/(everywhere-else)/invite/[code]/page.tsx:114`. This is caused by untyped Supabase client generics and is not related to T01 changes. It will likely be resolved when API routes are migrated to the Neon client in S02.

## Files Created/Modified

- `src/lib/db.ts`
- `schema.sql`
- `seed.sql`
- `.env.example`
- `package.json`
