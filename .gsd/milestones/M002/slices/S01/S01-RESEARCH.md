# S01 Research: Neon DB Client & Schema

**Slice:** M002/S01 — Neon DB Client & Schema
**Risk:** high
**Depth:** targeted
**Requirements owned:** NEON-04 (Neon database schema and seed data provisioned)
**Requirements supported:** NEON-01, VERF-01

## Summary

Replace `src/lib/supabase.ts` with a Neon serverless driver client (`src/lib/db.ts`), create SQL schema + seed scripts, configure `DATABASE_URL`, and verify via the health-check endpoint. The `@neondatabase/serverless` `neon()` function provides tagged-template SQL over HTTPS — no WebSocket config needed on Node v24. Transactions use `sql.transaction([...])`. This is a clean, contained slice with no client-component changes.

## Recommendation

Use `neon()` tagged-template function (HTTP mode) for all queries. Do NOT use the `Client`/`Pool` WebSocket mode — it's unnecessary overhead for this app's request-per-query pattern. The `sql.transaction()` API replaces the stored procedures cleanly. Create a single `src/lib/db.ts` exporting `sql`, a `withTransaction` helper, and an updated `handleDatabaseError` that maps Postgres error codes.

## Implementation Landscape

### What exists today

| File | Lines | Role |
|------|-------|------|
| `src/lib/supabase.ts` | 81 | Singleton Supabase client + `handleDatabaseError()` |
| `src/app/api/health-check/route.ts` | 29 | Simple connectivity test — queries `registrations` table |
| `src/supabase/functions/register_user.sql` | ~65 | Stored proc: INSERT registration + UPDATE hero_availability |
| `src/supabase/functions/register_user_extended.sql` | ~90 | Same but with additional fields (is_christian, event_source, etc.) |
| `.env.local` | missing | No env file exists in this worktree |
| `.env.example` | missing | No env example exists |
| `package.json` | — | Has `@supabase/supabase-js: ^2.49.4`, no `@neondatabase/serverless` |

### 11 files import supabase (S01 touches only the client + health-check)

- `src/lib/supabase.ts` — **replaced** in S01
- `src/app/api/health-check/route.ts` — **updated** in S01 (to verify Neon works)
- 5 more API routes — S02 scope
- 3 client components + 1 subscription — S03 scope

### Schema (inferred from stored procedures + API routes)

**4 tables:**

1. **`registrations`** — Main table. Columns: `id` (serial PK), `line_number` (int, unique), `group_number` (int), `email` (varchar, unique), `full_name`, `nickname`, `age` (int), `gender`, `nric_passport`, `contact_number`, `instagram_handle` (nullable), `school_name`, `ym_member` (boolean), `cg_leader`, `hero_id` (varchar), `team_id` (int, FK→teams), `invite_code` (nullable), `emergency_contact_name`, `emergency_contact_relationship`, `emergency_contact_phone`, `emergency_contact_email`, `is_christian` (nullable), `event_source` (nullable), `other_event_source` (nullable), `invited_by_friend` (nullable), `church_name` (nullable), `pastor_name` (nullable), `church_role` (nullable), `created_at` (timestamptz).

2. **`hero_availability`** — Tracks which class is available per team. Columns: `id` (serial PK), `team_id` (int, FK→teams), `hero_id` (varchar), `is_available` (boolean, default true). Composite unique on (team_id, hero_id).

3. **`team_invites`** — Invite codes. Columns: `id` (serial PK), `team_id` (int, FK→teams), `invite_code` (varchar, unique), `expires_at` (timestamptz), `created_at` (timestamptz, default now()).

4. **`teams`** — Team/party list. Columns: `id` (int PK), `name` (varchar), `color` (varchar).

### Seed data needed

- **teams**: 21 rows (PARTY 001–021 per D004, with colors `bg-team-01` through `bg-team-21`, codes `U001`–`U021`)
- **hero_availability**: 21 teams × 5 classes = 105 rows, all `is_available = true`. Hero IDs from the current schema are the old hero names (alex, suzzy, charlotte, charlie, kai). Per D004, these should map to the 5 classes (warrior, archer, scout, guardian, scholar). **Important:** The column is still called `hero_id` in the schema — don't rename it (that's out of scope for M002, schema must match current code).

### `@neondatabase/serverless` API (from docs)

```typescript
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

// Simple query
const rows = await sql`SELECT * FROM posts WHERE id = ${postId}`;

// Transaction (array syntax — auto rollback on error)
const [insertResult, selectResult] = await sql.transaction([
  sql`INSERT INTO users (name) VALUES (${'Alice'}) RETURNING id`,
  sql`SELECT COUNT(*) as total FROM users`
]);

// Transaction (function syntax for dependent queries)
const results = await sql.transaction(txn => [
  txn`UPDATE accounts SET balance = balance - ${100} WHERE id = ${1}`,
  txn`UPDATE accounts SET balance = balance + ${100} WHERE id = ${2}`,
]);
```

- Node v24 — no WebSocket polyfill needed (that's only for v21 and earlier)
- Tagged templates are SQL-injection safe (values are parameterized)
- `neon()` is HTTP-only — each call is a single round-trip, no persistent connection
- `sql.transaction()` wraps multiple statements in a single HTTP request with auto-rollback

### What `src/lib/db.ts` should export

1. **`sql`** — The `neon()` tagged-template client, initialized from `DATABASE_URL`
2. **`withTransaction`** — Thin wrapper around `sql.transaction()` for the registration flow (INSERT + UPDATE hero_availability in one atomic op)
3. **`handleDatabaseError(error)`** — Updated error mapper. The current one already handles Postgres error codes (`23505` unique violation, `23503` FK violation). Keep the same interface but remove the Supabase-specific `PGRST116` code (that's PostgREST, not raw Postgres — use empty result checks instead).
4. **`DatabaseConnectionError`** — Keep the custom error class

### Environment setup

- `DATABASE_URL` — Neon connection string (format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
- neonctl 2.22.0 is installed locally at `/opt/homebrew/bin/neonctl`
- `.env.local` needs creating with `DATABASE_URL`
- `.env.example` needs creating documenting required vars

### Constants branch discrepancy (note for planner)

The worktree's `src/lib/constants.ts` still has old HEROES/TEAMS arrays (not the M001 CLASSES/PARTIES update). The seed data should use the **hero_id values that the current codebase actually references** — which on this branch are the old hero IDs (alex, suzzy, charlotte, charlie, kai). When M001 merges, the hero_ids in the DB will need to match whatever the merged code uses. For S01, seed with the IDs the current code expects. This is a data concern, not a schema concern.

## Natural Seams for Task Decomposition

1. **Install `@neondatabase/serverless` + create `src/lib/db.ts`** — Pure code, no DB needed. Write the module, export `sql`, `withTransaction`, `handleDatabaseError`, `DatabaseConnectionError`. Can be verified with a type check (`bun run build` or `tsc --noEmit`).

2. **Write `schema.sql` + `seed.sql`** — Pure SQL files. `schema.sql` creates the 4 tables with indexes/constraints. `seed.sql` inserts 21 teams + 105 hero_availability rows. Can be verified by reviewing SQL syntax (or running against a test DB).

3. **Create `.env.example` + collect `DATABASE_URL` via `secure_env_collect` + provision schema** — Run `schema.sql` and `seed.sql` against the Neon DB. Verify with a SELECT query.

4. **Update health-check route + verify** — Change `src/app/api/health-check/route.ts` to import from `src/lib/db.ts` instead of `src/lib/supabase.ts`. Start dev server, curl the endpoint, confirm `{"status":"healthy"}`.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| No DATABASE_URL configured | Blocks all DB verification | Use `secure_env_collect` early; neonctl can create project if needed |
| Schema mismatch with actual Supabase schema | API routes break in S02 | Schema is inferred from stored procs + API routes — covers all columns. Verify column names match what API routes INSERT/SELECT. |
| hero_id values mismatch between seed and code | Class availability queries return empty | Seed with IDs matching current branch constants. Document this for S02/S03 reconciliation. |

## Verification Strategy

1. `bun add @neondatabase/serverless` succeeds
2. `bun run build` passes with new `db.ts` (type check)
3. `psql $DATABASE_URL -f schema.sql` creates tables without error
4. `psql $DATABASE_URL -f seed.sql` inserts seed data without error
5. `SELECT count(*) FROM teams` returns 21; `SELECT count(*) FROM hero_availability` returns 105
6. Dev server starts, `curl http://localhost:3000/api/health-check` returns `{"status":"healthy"}`

## Skill Suggestions

No additional skills needed. The work uses `@neondatabase/serverless` (docs fetched via Context7) and standard SQL. neonctl is already installed locally.

## Forward Intelligence for S02

- `handleDatabaseError` return shape stays the same `{ error, message, status }` — S02 routes can import it unchanged
- The `PGRST116` (PostgREST "no rows") code is gone — S02 routes that check for `.single()` no-rows must use empty result checks instead (e.g., `rows.length === 0`)
- `sql` tagged template returns `NeonQueryResult` (array of row objects) — NOT `{ data, error }` like Supabase. S02 must restructure all query handling from `const { data, error } = await supabase.from()...` to `const rows = await sql\`...\`` with try/catch
- `sql.transaction()` replaces the RPC stored procedures — the triple-fallback pattern in register/route.ts collapses to a single transaction call
