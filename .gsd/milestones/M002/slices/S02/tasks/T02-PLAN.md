---
estimated_steps: 20
estimated_files: 1
skills_used: []
---

# T02: Migrate register route to Neon SQL with stored procedure and verify all API routes

Rewrite the register route from the Supabase triple-fallback pattern (direct insert → RPC register_user_simple → RPC register_user_params) to a clean Neon implementation. This is the most complex route — 271 lines that simplify to ~120 lines.

**Approach:** Use the `register_user_extended` stored procedure already provisioned in schema.sql for atomic registration (INSERT into registrations + UPDATE hero_availability in one transaction). Pre-validation checks use sequential SQL queries.

**Steps:**

1. Replace import: `import { createClient } from "@/lib/supabase"` → `import { getClient, handleDatabaseError } from "@/lib/db"`
2. Replace `const supabase = createClient()` → `const sql = getClient()`
3. Rewrite pre-validation checks as direct SQL:
   - Line taken: `` const lineCheck = await sql`SELECT id FROM registrations WHERE line_number = ${lineNumber} LIMIT 1` ``
   - Email unique: `` const emailCheck = await sql`SELECT id FROM registrations WHERE email = ${email} LIMIT 1` ``
   - Hero available: `` const heroCheck = await sql`SELECT is_available FROM hero_availability WHERE team_id = ${teamId} AND hero_id = ${heroId}` ``
   - Check `lineCheck.length > 0`, `emailCheck.length > 0`, `heroCheck.length === 0 || !heroCheck[0].is_available`
4. Replace the triple-fallback insert with a single stored procedure call:
   `` const result = await sql`SELECT register_user_extended(${lineNumber}::integer, ${groupNumber}::integer, ${email}, ${fullName}, ${fullName}, ${Number(age)}::integer, ${gender}, ${nricPassport}, ${contactNumber}, ${instagramHandle || null}, ${schoolName}, ${ymMember === true || ymMember === 'Yes'}, ${cgLeader}, ${heroId}, ${teamId}::integer, ${inviteCode || null}, ${emergencyContactName}, ${emergencyContactRelationship}, ${emergencyContactPhone}, ${emergencyContactEmail}, ${isChristian || null}, ${eventSource || null}, ${otherEventSource || null}, ${invitedByFriend || null}, ${null}, ${null}, ${null})` ``
5. The stored procedure returns JSONB — parse `result[0].register_user_extended` to get the registration data
6. Preserve the exact response shape: `{ success: true, data: result }` for success, `{ error: "..." }` for failures with same status codes (400, 409, 500)
7. Wrap the entire handler in try/catch using `handleDatabaseError` for consistent error mapping

**Important:** The stored procedure handles both the INSERT and the hero_availability UPDATE atomically in a single database transaction — no need for multi-statement transactions via the HTTP driver (which don't work with neon() anyway, per D007).

**After completing this route:** Run final verification that ALL API routes now use db.ts:
- `rg "from.*@/lib/supabase" src/app/api/` → zero matches
- `rg "from.*@/lib/db" src/app/api/` → 5+ matches (health-check from S01 + 4 from T01 + register)
- `npx tsc --noEmit` → no new errors in any API route file

## Inputs

- `src/lib/db.ts`
- `src/app/api/register/route.ts`
- `schema.sql`

## Expected Output

- `src/app/api/register/route.ts`

## Verification

rg 'from.*@/lib/supabase' src/app/api/ returns zero matches && rg 'from.*@/lib/db' src/app/api/ returns 5+ matches (health-check, hero-availability, team-members, team-invite, team-invite/check, register) && npx tsc --noEmit 2>&1 | grep 'register/route' shows zero errors
