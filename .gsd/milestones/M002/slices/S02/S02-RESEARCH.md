# S02 Research: API Route Migration

**Depth:** Targeted — known technology (Neon tagged-template SQL), moderate complexity (6 routes to rewrite), established pattern from S01 (db.ts client).

## Summary

Rewrite 5 API routes from Supabase fluent API to Neon parameterized SQL using the `sql` tagged-template client from `src/lib/db.ts` (established in S01). The 6th route (health-check) was already migrated in S01. After this slice, remove `@supabase/supabase-js` from package.json and delete `src/lib/supabase.ts`. The `src/supabase/` directory does not exist in the worktree — nothing to delete there.

**Requirements targeted:**
- **NEON-01** (primary) — All 6 API routes rewritten from Supabase to Neon SQL, no Supabase imports remain in source code.

**Note:** Three client-side files also import Supabase (`register/page.tsx`, `invite/[code]/page.tsx`, `character-selection-screen.tsx`) — these are **S03 scope** (NEON-02), not S02. S02 only covers the 5 server-side API routes.

## Recommendation

Straightforward mechanical migration. Each route follows the same pattern:
1. Replace `import { createClient } from "@/lib/supabase"` → `import { getClient, handleDatabaseError } from "@/lib/db"`
2. Replace `const supabase = createClient()` → `const sql = getClient()`
3. Replace Supabase fluent queries (`.from().select().eq()`) → SQL tagged templates (`sql\`SELECT ... WHERE ...\``)
4. Preserve existing response shapes exactly (no API contract changes)
5. After all routes are migrated, remove `@supabase/supabase-js` from package.json and delete `src/lib/supabase.ts`

The register route is the only complex one — it has a triple-fallback pattern (direct insert → RPC simple → RPC params) that simplifies to a single SQL transaction with Neon since we have direct SQL access.

## Implementation Landscape

### Route 1: hero-availability (GET + POST) — ~92 lines → ~70 lines
**Current:** `supabase.from("hero_availability").select().eq()` / `.update().eq().eq()`
**Target SQL:**
- GET: `SELECT hero_id, is_available FROM hero_availability WHERE team_id = ${teamId}`
- POST: `UPDATE hero_availability SET is_available = ${isAvailable} WHERE team_id = ${teamId} AND hero_id = ${heroId} RETURNING *`
**Already uses** `handleDatabaseError` from supabase.ts — switch import to db.ts (same interface per D007).

### Route 2: team-invite (POST + GET) — ~122 lines → ~100 lines
**Current:** `.from("team_invites").insert()`, `.from("team_invites").select().eq().single()`, `.from("teams").select().eq().single()`
**Target SQL:**
- POST: `INSERT INTO team_invites (team_id, invite_code, expires_at) VALUES (${teamId}, ${inviteCode}, ${expiresAt}) RETURNING *`
- GET: Two queries — lookup invite by code, then fetch team details. Could be a JOIN: `SELECT ti.team_id, ti.expires_at, t.name, t.color FROM team_invites ti JOIN teams t ON t.id = ti.team_id WHERE ti.invite_code = ${inviteCode}`
**Dependency:** `nanoid` — already available as transitive dep in node_modules. Needs explicit `npm install nanoid` since it's not in package.json dependencies, OR import from node_modules (fragile). **Recommendation: add nanoid to package.json.**

### Route 3: team-invite/check (GET) — ~61 lines → ~50 lines
**Current:** `.from("team_invites").select().eq().order().limit(1).single()`
**Target SQL:** `SELECT invite_code, expires_at FROM team_invites WHERE team_id = ${teamId} ORDER BY created_at DESC LIMIT 1`
**Note:** Supabase PGRST116 error code (no rows) handled specially — with raw SQL, empty result set returns `[]` (no error thrown). Check `rows.length === 0` instead.

### Route 4: team-members (GET) — ~45 lines → ~35 lines
**Current:** `.from("registrations").select("id, line_number, ...").eq("team_id", teamId).order("line_number")`
**Target SQL:** `SELECT id, line_number, nickname, instagram_handle, full_name, hero_id, created_at FROM registrations WHERE team_id = ${teamId} ORDER BY line_number`
**Already uses** `handleDatabaseError` — switch import source.

### Route 5: register (POST) — ~271 lines → ~120 lines (major simplification)
**Current:** Triple fallback: direct insert → `supabase.rpc("register_user_simple")` → `supabase.rpc("register_user_params")`. This complexity exists because Supabase RLS/permissions sometimes blocked direct inserts.
**Target:** Single SQL transaction — no need for stored procedure fallbacks since we have direct SQL access. Use the `register_user_extended` stored procedure (already provisioned in schema.sql) OR inline the transaction:
```
BEGIN;
INSERT INTO registrations (...) VALUES (...) RETURNING *;
UPDATE hero_availability SET is_available = false WHERE team_id = $1 AND hero_id = $2;
COMMIT;
```
**Recommendation:** Use inline SQL transaction via Neon's `sql.transaction()` or sequential queries. The stored procedures exist in the DB but calling them via tagged templates is `SELECT register_user_extended(...)` which works but is less readable. Inline SQL is clearer and avoids stored proc maintenance.

**Pre-registration checks** (line_number taken, email unique, hero available) become:
- `SELECT id FROM registrations WHERE line_number = ${lineNumber} LIMIT 1`
- `SELECT id FROM registrations WHERE email = ${email} LIMIT 1`
- `SELECT is_available FROM hero_availability WHERE team_id = ${teamId} AND hero_id = ${heroId}`

### Route 6: health-check — Already migrated in S01. No work needed.

## Key Differences: Supabase Fluent API vs Neon Tagged Templates

| Supabase | Neon |
|----------|------|
| `.from("table").select("cols").eq("col", val).single()` | `` sql`SELECT cols FROM table WHERE col = ${val}` `` — returns array, `[0]` for single |
| `.from("table").insert({...}).select()` | `` sql`INSERT INTO table (...) VALUES (...) RETURNING *` `` |
| `.from("table").update({...}).eq().select()` | `` sql`UPDATE table SET ... WHERE ... RETURNING *` `` |
| Error: `{ code: "PGRST116" }` (no rows) | Empty array `[]` — check `.length === 0` |
| `.order("col", { ascending: false })` | `ORDER BY col DESC` |
| `.limit(1)` | `LIMIT 1` |
| `.rpc("fn_name", params)` | `` sql`SELECT fn_name(${p1}, ${p2}, ...)` `` |

## Neon Transaction Pattern

The `@neondatabase/serverless` neon() function does NOT have a built-in `.transaction()` method. For transactions, you need to use the `transaction()` helper from the package, or execute raw `BEGIN`/`COMMIT`/`ROLLBACK` statements. However, since neon() uses HTTP (stateless), **multi-statement transactions via BEGIN/COMMIT don't work with the HTTP driver**.

**Options for the register route's atomic insert+update:**
1. **Use the stored procedure** already in the DB: `` sql`SELECT register_user_extended(...)` `` — this is atomic at the DB level.
2. **Use `neon()` with `{ fullResults: true }` and sequential queries** — acceptable if atomicity isn't critical (the hero_availability update failing after insert is a minor consistency issue, not a data loss issue).
3. **Use the Pool/Client from @neondatabase/serverless** for real transactions — but D007 chose neon() tagged-template specifically.

**Recommendation:** Use the stored procedure `register_user_extended` for the register route (it's already provisioned in schema.sql). This keeps atomicity without needing to change the client pattern. For the pre-checks (line taken, email unique, hero available), use sequential queries — they're read-only and don't need transactional guarantees.

## Natural Task Decomposition

### T01: Migrate hero-availability + team-members + team-invite/check (3 simple routes)
- These are the simplest routes — single-method or simple CRUD
- All follow identical pattern: swap import, swap query syntax
- Can verify independently with curl

### T02: Migrate team-invite (POST + GET)
- Slightly more complex: POST creates invite with nanoid, GET does a JOIN query
- Needs nanoid dependency added to package.json
- Can verify independently with curl

### T03: Migrate register route (the big one)
- Most complex: pre-checks + insert + hero_availability update
- Simplify triple-fallback to stored procedure call or sequential SQL
- Verify with curl (POST with full payload)

### T04: Remove Supabase — delete supabase.ts, uninstall @supabase/supabase-js, verify no server-side imports remain
- Final cleanup task
- `npm uninstall @supabase/supabase-js`
- Delete `src/lib/supabase.ts`
- Verify: `rg "@supabase/supabase-js" src/` should only show client components (S03 scope) — wait, actually all API routes will be migrated. The remaining Supabase imports will be in:
  - `src/app/(everywhere-else)/register/page.tsx` (client — S03)
  - `src/app/(everywhere-else)/invite/[code]/page.tsx` (client — S03)
  - `src/components/character-selection-screen.tsx` (client — S03)
  - `src/components/team-members-subscription.tsx` (client — S03)
- **Cannot remove `@supabase/supabase-js` from package.json yet** — client components still import it. Defer removal to S03.
- **Can and should** remove `src/lib/supabase.ts` only if no client components import from it. Let me check:
  - Client components import `createClient` from `@/lib/supabase` — so `src/lib/supabase.ts` CANNOT be deleted in S02.
  - **Revised plan:** T04 should verify all 5 API routes use db.ts, and that `src/lib/supabase.ts` is no longer imported by any API route. Actual file deletion and package removal happens in S03.

## Verification Strategy

For each migrated route, curl tests against the running dev server:
- `curl http://localhost:3000/api/hero-availability?teamId=1` → returns array of {heroId, isAvailable}
- `curl http://localhost:3000/api/team-members?teamId=1` → returns {members: [...]}
- `curl http://localhost:3000/api/team-invite/check?teamId=1` → returns {} or {inviteCode, inviteUrl}
- `curl -X POST http://localhost:3000/api/team-invite -d '{"teamId":1}'` → returns {inviteCode, inviteUrl}
- `curl http://localhost:3000/api/team-invite?code=<code>` → returns team details
- `curl -X POST http://localhost:3000/api/register -d '{...}'` → returns {success: true, data: [...]}

Final check: `rg "from.*@/lib/supabase" src/app/api/` returns zero matches (all API routes use db.ts).
TypeScript check: `npx tsc --noEmit` — S02 files should have zero errors (pre-existing client-side errors from S01 persist until S03).

## Constraints & Pitfalls

1. **Neon HTTP driver can't do multi-statement transactions** — use stored procedures for atomicity in the register route.
2. **Empty result vs error** — Supabase throws PGRST116 for no rows; Neon returns empty array. Every `.single()` usage must become `rows[0]` with a length check.
3. **nanoid not in package.json** — needs explicit install for team-invite route.
4. **Cannot remove supabase.ts or @supabase/supabase-js in S02** — client components still depend on them. Only API routes are migrated in this slice.
5. **Response shape must not change** — client components in S03 depend on the exact JSON shapes these routes return. No renames, no restructuring.
6. **The `PGRST116` error code in db.ts's handleDatabaseError** — this is a Supabase-specific code (PostgREST). After migration, this case will never trigger from Neon. It can stay for now (harmless dead code) and be cleaned up in S03/S04.

## Skill Suggestions

No additional skills needed. The work is mechanical SQL migration using established patterns from S01 (db.ts). The `@neondatabase/serverless` library is already documented via D007 and the db.ts implementation.
