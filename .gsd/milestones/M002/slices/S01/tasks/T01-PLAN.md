---
estimated_steps: 3
estimated_files: 5
skills_used: []
---

# T01: Install Neon driver, create db.ts client, schema.sql, seed.sql, and .env.example

Install @neondatabase/serverless and create all local files for the Neon migration. No database connection is needed — this is all code and SQL authoring.

The db.ts module replaces src/lib/supabase.ts as the database client. It exports the same interface shape (handleDatabaseError, DatabaseConnectionError) so downstream API routes in S02 can migrate incrementally.

The schema.sql creates the exact 4 tables the existing codebase uses. The seed.sql populates initial data matching what the existing code expects (hero IDs: alex, suzzy, charlotte, charlie, kai — these match the HEROES array in constants.ts on this branch).

## Inputs

- `src/lib/supabase.ts`
- `src/supabase/functions/register_user.sql`
- `src/supabase/functions/register_user_extended.sql`
- `package.json`
- `src/lib/constants.ts`

## Expected Output

- `src/lib/db.ts`
- `schema.sql`
- `seed.sql`
- `.env.example`
- `package.json`

## Verification

`bun run build` exits 0 (TypeScript compiles with new db.ts module). `test -s schema.sql && test -s seed.sql && test -s .env.example` confirms all SQL and env files exist and are non-empty.
