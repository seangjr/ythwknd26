---
estimated_steps: 18
estimated_files: 5
skills_used: []
---

# T01: Migrate hero-availability, team-members, team-invite, and team-invite/check routes to Neon SQL

Rewrite 4 API routes from Supabase fluent API to Neon parameterized SQL using db.ts from S01.

**Pattern for each route:**
1. Replace `import { createClient, handleDatabaseError } from "@/lib/supabase"` → `import { getClient, handleDatabaseError } from "@/lib/db"`
2. Replace `const supabase = createClient()` → `const sql = getClient()`
3. Replace `.from("table").select("cols").eq("col", val)` → `` sql`SELECT cols FROM table WHERE col = ${val}` ``
4. Neon returns arrays directly (not `{data, error}`) — remove destructuring, use `const rows = await sql\`...\``
5. For `.single()` results, use `rows[0]` with `rows.length === 0` check instead of PGRST116 error handling
6. Response shapes must be preserved exactly — downstream S03 client components depend on them

**Key translations:**
- Supabase `.from("hero_availability").select("hero_id, is_available").eq("team_id", teamId)` → `` sql`SELECT hero_id, is_available FROM hero_availability WHERE team_id = ${teamId}` ``
- Supabase `.update({is_available}).eq("team_id", teamId).eq("hero_id", heroId).select()` → `` sql`UPDATE hero_availability SET is_available = ${isAvailable} WHERE team_id = ${teamId} AND hero_id = ${heroId} RETURNING *` ``
- Supabase `.from("registrations").select("...").eq("team_id", teamId).order("line_number")` → `` sql`SELECT ... FROM registrations WHERE team_id = ${teamId} ORDER BY line_number` ``
- Supabase `.from("team_invites").insert({...}).select()` → `` sql`INSERT INTO team_invites (...) VALUES (...) RETURNING *` ``
- Supabase `.single()` on team_invites GET → `` sql`SELECT ... WHERE invite_code = ${inviteCode}` `` then check `rows.length === 0`
- Supabase two-query pattern (invite + team lookup) in team-invite GET → JOIN query: `` sql`SELECT ti.team_id, ti.expires_at, t.name, t.color FROM team_invites ti JOIN teams t ON t.id = ti.team_id WHERE ti.invite_code = ${inviteCode}` ``

**Neon result shape:** Each query returns an array of row objects. Column names are snake_case from Postgres. Map to camelCase in response to preserve API contract (e.g., `hero_id` → `heroId`).

**nanoid:** Currently imported but not in package.json — run `npm install nanoid` to add it as explicit dependency.

**team-invite/check special case:** Supabase PGRST116 (no rows) handling becomes `rows.length === 0` → return `NextResponse.json({})`. Expiry check logic stays the same.

## Inputs

- `src/lib/db.ts`
- `src/app/api/hero-availability/route.ts`
- `src/app/api/team-members/route.ts`
- `src/app/api/team-invite/route.ts`
- `src/app/api/team-invite/check/route.ts`
- `package.json`

## Expected Output

- `src/app/api/hero-availability/route.ts`
- `src/app/api/team-members/route.ts`
- `src/app/api/team-invite/route.ts`
- `src/app/api/team-invite/check/route.ts`
- `package.json`

## Verification

rg 'from.*@/lib/supabase' src/app/api/hero-availability/ src/app/api/team-members/ src/app/api/team-invite/ returns zero matches && rg 'from.*@/lib/db' src/app/api/hero-availability/ src/app/api/team-members/ src/app/api/team-invite/ returns 4 matches && npx tsc --noEmit 2>&1 | grep -E 'hero-availability|team-members|team-invite' shows zero errors
