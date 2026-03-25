# S02: API Route Migration

**Goal:** All 5 remaining API routes (hero-availability, team-members, team-invite, team-invite/check, register) use Neon SQL via db.ts instead of Supabase — no Supabase imports remain in any API route file.
**Demo:** After this: all 6 API routes use Neon SQL instead of Supabase — curl tests confirm correct responses for registration, hero-availability, team-invite, team-members

## Must-Haves

- ## Must-Haves
- All 5 API route files import from `@/lib/db` instead of `@/lib/supabase`
- All Supabase fluent queries replaced with Neon `sql` tagged-template parameterized queries
- Response shapes preserved exactly (no API contract changes for downstream client components)
- `nanoid` added to package.json dependencies (was only a transitive dep)
- Register route simplified from triple-fallback to stored procedure call (`register_user_extended`)
- `rg "from.*@/lib/supabase" src/app/api/` returns zero matches
- `npx tsc --noEmit 2>&1 | grep -c "error TS"` shows no new errors in API route files (pre-existing client errors acceptable)
- ## Verification
- `rg "from.*@/lib/supabase" src/app/api/` returns zero matches — all API routes use db.ts
- `rg "from.*@/lib/db" src/app/api/` returns 5 matches (hero-availability, team-members, team-invite, team-invite/check, register)
- `npx tsc --noEmit` — no new TypeScript errors introduced in API route files
- Each route compiles and exports the expected HTTP methods

## Proof Level

- This slice proves: Contract — all routes compile with correct imports and parameterized SQL; full runtime verification deferred to S04 E2E testing

## Integration Closure

- Upstream surfaces consumed: `src/lib/db.ts` (getClient, handleDatabaseError from S01), `schema.sql` stored procedures (register_user_extended)
- New wiring: all 5 API route files rewired from supabase.ts → db.ts
- What remains: S03 migrates client components, S04 does E2E verification

## Verification

- Error handling preserved via handleDatabaseError from db.ts — same HTTP status codes for same failure modes. Empty-result handling changed from PGRST116 error to rows.length === 0 check.

## Tasks

- [x] **T01: Migrate hero-availability, team-members, team-invite, and team-invite/check routes to Neon SQL** `est:45m`
  Rewrite 4 simpler API routes from Supabase fluent API to Neon parameterized SQL using the db.ts client from S01. Add nanoid as an explicit dependency. Each route follows the same pattern: swap import from @/lib/supabase to @/lib/db, replace createClient() with getClient(), replace .from().select().eq() chains with sql tagged-template queries. Key differences: Neon returns arrays (not {data, error}), empty results are [] not PGRST116 errors, and .single() becomes rows[0] with length check.
  - Files: `src/app/api/hero-availability/route.ts`, `src/app/api/team-members/route.ts`, `src/app/api/team-invite/route.ts`, `src/app/api/team-invite/check/route.ts`, `package.json`
  - Verify: rg 'from.*@/lib/supabase' src/app/api/hero-availability/ src/app/api/team-members/ src/app/api/team-invite/ returns zero matches && rg 'from.*@/lib/db' src/app/api/hero-availability/ src/app/api/team-members/ src/app/api/team-invite/ returns 4 matches && npx tsc --noEmit 2>&1 | grep -E 'hero-availability|team-members|team-invite' shows zero errors

- [x] **T02: Migrate register route to Neon SQL with stored procedure and verify all API routes** `est:45m`
  Rewrite the register route from Supabase triple-fallback (direct insert → RPC simple → RPC params) to a clean Neon implementation using the register_user_extended stored procedure for atomic insert+hero_availability update. Pre-checks (line taken, email unique, hero available) become sequential SQL queries. Then verify all 5 migrated routes compile and no API route files import from @/lib/supabase.
  - Files: `src/app/api/register/route.ts`
  - Verify: rg 'from.*@/lib/supabase' src/app/api/ returns zero matches && rg 'from.*@/lib/db' src/app/api/ returns 5+ matches && npx tsc --noEmit 2>&1 | grep 'register/route' shows zero errors

## Files Likely Touched

- src/app/api/hero-availability/route.ts
- src/app/api/team-members/route.ts
- src/app/api/team-invite/route.ts
- src/app/api/team-invite/check/route.ts
- package.json
- src/app/api/register/route.ts
