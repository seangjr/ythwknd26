---
estimated_steps: 10
estimated_files: 2
skills_used: []
---

# T02: Provision Neon schema, update health-check route, verify end-to-end

Collect DATABASE_URL via secure_env_collect, provision the Neon database by running schema.sql and seed.sql, rewrite the health-check API route to use the new db.ts client instead of Supabase, and verify the full integration chain works.

This task proves the Neon connection is live and the schema/seed are correct by running an actual query through the health-check endpoint.

**Important context for executor:**
- `src/lib/db.ts` was created in T01 — it exports `sql` (neon tagged-template client), `handleDatabaseError`, and `DatabaseConnectionError`
- The neon `sql` tagged template returns an array of row objects directly (NOT `{ data, error }` like Supabase)
- Use `sql` like: `const rows = await sql\`SELECT id FROM registrations LIMIT 1\``
- The health-check route should try/catch around the query and use handleDatabaseError for error responses
- Use `secure_env_collect` to collect DATABASE_URL (format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
- Run schema: `npx @neondatabase/serverless` is NOT a CLI tool. Use `psql $DATABASE_URL -f schema.sql` or pipe through node. Check if psql is available, otherwise use a small node script that reads the SQL file and executes via the neon driver.
- After provisioning, verify: teams count = 21, hero_availability count = 105

## Inputs

- `src/lib/db.ts`
- `schema.sql`
- `seed.sql`
- `src/app/api/health-check/route.ts`

## Expected Output

- `src/app/api/health-check/route.ts`
- `.env.local`

## Verification

`curl http://localhost:3000/api/health-check` returns `{"status":"healthy"}`. Verify seed data: query teams (expect 21 rows) and hero_availability (expect 105 rows).

## Observability Impact

Health-check endpoint becomes the primary DB connectivity signal. Returns `{status: "healthy"}` (200) on success, `{error: "..."}` with appropriate HTTP status on failure. DatabaseConnectionError surfaces as 503 when DATABASE_URL is missing or connection fails.
