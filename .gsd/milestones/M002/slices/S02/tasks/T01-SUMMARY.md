---
id: T01
parent: S02
milestone: M002
key_files:
  - src/app/api/hero-availability/route.ts
  - src/app/api/team-members/route.ts
  - src/app/api/team-invite/route.ts
  - src/app/api/team-invite/check/route.ts
  - package.json
key_decisions:
  - Consolidated team-invite GET from two sequential Supabase queries into a single SQL JOIN query for better performance
  - Replaced PGRST116 error code handling with rows.length === 0 checks across all routes that used .single()
duration: ""
verification_result: passed
completed_at: 2026-03-25T14:12:59.650Z
blocker_discovered: false
---

# T01: Migrate hero-availability, team-members, team-invite, and team-invite/check API routes from Supabase to Neon SQL via db.ts

**Migrate hero-availability, team-members, team-invite, and team-invite/check API routes from Supabase to Neon SQL via db.ts**

## What Happened

Rewrote all 4 API route files to import `getClient`/`handleDatabaseError` from `@/lib/db` instead of `@/lib/supabase`, replacing Supabase fluent queries with Neon tagged-template SQL.

Key changes per route:
- **hero-availability**: GET uses `SELECT hero_id, is_available FROM hero_availability WHERE team_id = ${teamId}`, POST uses `UPDATE ... RETURNING *`. Response shape preserved (camelCase mapping).
- **team-members**: GET uses `SELECT ... FROM registrations WHERE team_id = ${teamId} ORDER BY line_number`. Returns `{ members: rows }` — same shape as before (Neon returns arrays, so `rows` replaces `data || []`).
- **team-invite**: POST uses `INSERT INTO team_invites ... VALUES (...)`. GET consolidated the two-query pattern (invite lookup + team lookup) into a single JOIN query. Empty-result check uses `rows.length === 0` instead of Supabase error handling.
- **team-invite/check**: GET uses `SELECT ... ORDER BY created_at DESC LIMIT 1`. PGRST116 error handling replaced with `rows.length === 0` → return `NextResponse.json({})`.

Also installed `nanoid` as an explicit dependency (was imported but missing from package.json).

## Verification

Ran three verification commands: (1) `rg 'from.*@/lib/supabase'` across all 4 route directories — zero matches confirms no Supabase imports remain. (2) `rg 'from.*@/lib/db'` — 4 matches confirms all routes import from db.ts. (3) `npx tsc --noEmit` filtered for route filenames — zero type errors in migrated files.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg 'from.*@/lib/supabase' src/app/api/hero-availability/ src/app/api/team-members/ src/app/api/team-invite/` | 1 | ✅ pass (exit 1 = no matches, confirming zero Supabase imports) | 50ms |
| 2 | `rg 'from.*@/lib/db' src/app/api/hero-availability/ src/app/api/team-members/ src/app/api/team-invite/ | wc -l` | 0 | ✅ pass (4 matches = all 4 routes import from db.ts) | 50ms |
| 3 | `npx tsc --noEmit 2>&1 | grep -E 'hero-availability|team-members|team-invite'` | 1 | ✅ pass (exit 1 = no type errors in migrated routes) | 15000ms |


## Deviations

team-invite GET: consolidated the two-query Supabase pattern (invite lookup then team lookup) into a single JOIN query as suggested by the plan, rather than keeping two separate SQL calls.

## Known Issues

None.

## Files Created/Modified

- `src/app/api/hero-availability/route.ts`
- `src/app/api/team-members/route.ts`
- `src/app/api/team-invite/route.ts`
- `src/app/api/team-invite/check/route.ts`
- `package.json`
