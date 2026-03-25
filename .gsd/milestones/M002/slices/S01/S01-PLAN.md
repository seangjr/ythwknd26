# S01: Neon DB Client & Schema

**Goal:** Neon serverless DB client module, SQL schema, seed data, and health-check endpoint all working against a live Neon database.
**Demo:** After this: health-check endpoint returns 'healthy' from Neon DB, schema and seed data provisioned, new db.ts client module works

## Must-Haves

- ## Must-Haves
- `src/lib/db.ts` exports `sql` (neon tagged-template client), `withTransaction`, `handleDatabaseError`, `DatabaseConnectionError`
- `schema.sql` defines 4 tables (registrations, hero_availability, team_invites, teams) with indexes and constraints
- `seed.sql` inserts 21 teams and 105 hero_availability rows (21 teams × 5 hero IDs)
- `.env.example` documents `DATABASE_URL` format
- `@neondatabase/serverless` added to package.json
- Health-check endpoint (`/api/health-check`) returns `{"status":"healthy"}` from Neon DB
- `bun run build` passes with zero TypeScript errors
- ## Proof Level
- This slice proves: integration
- Real runtime required: yes (live Neon DB)
- Human/UAT required: no
- ## Verification
- `bun run build` exits 0 (TypeScript compiles with new db.ts)
- `curl http://localhost:3000/api/health-check` returns `{"status":"healthy"}`
- `SELECT count(*) FROM teams` returns 21
- `SELECT count(*) FROM hero_availability` returns 105
- ## Observability / Diagnostics
- Runtime signals: health-check returns structured JSON `{status}` or `{error}` with appropriate HTTP codes
- Inspection surfaces: `/api/health-check` endpoint, direct SQL queries against DATABASE_URL
- Failure visibility: `DatabaseConnectionError` with descriptive message when DATABASE_URL missing/invalid; Postgres error codes mapped to HTTP status codes
- Redaction constraints: DATABASE_URL contains credentials — never log or expose
- ## Integration Closure
- Upstream surfaces consumed: none (first slice)
- New wiring introduced: `src/lib/db.ts` provides `sql`, `withTransaction`, `handleDatabaseError` — consumed by all S02 API routes
- What remains: S02 migrates the 5 remaining API routes from Supabase to Neon using this client

## Proof Level

- This slice proves: integration

## Integration Closure

Upstream: none. Produces: src/lib/db.ts (sql client, withTransaction, handleDatabaseError), schema.sql, seed.sql, .env.example, DATABASE_URL configured. Consumed by S02 for all API route migrations.

## Verification

- Health-check endpoint returns structured JSON with status/error. DatabaseConnectionError surfaces missing config. Postgres error codes mapped to HTTP status codes in handleDatabaseError.

## Tasks

- [x] **T01: Install Neon driver, create db.ts client, schema.sql, seed.sql, and .env.example** `est:30m`
  Install @neondatabase/serverless, create the Neon DB client module replacing the Supabase client interface, write SQL schema and seed scripts, and create .env.example. All local files — no DB connection needed.
  - Files: `package.json`, `src/lib/db.ts`, `schema.sql`, `seed.sql`, `.env.example`
  - Verify: bun run build exits 0 with new db.ts; schema.sql and seed.sql exist and are non-empty

- [ ] **T02: Provision Neon schema, update health-check route, verify end-to-end** `est:20m`
  Collect DATABASE_URL, run schema.sql and seed.sql against Neon, update health-check route to use new db.ts, and verify the full chain works.
  - Files: `src/app/api/health-check/route.ts`, `.env.local`
  - Verify: curl http://localhost:3000/api/health-check returns {"status":"healthy"}

## Files Likely Touched

- package.json
- src/lib/db.ts
- schema.sql
- seed.sql
- .env.example
- src/app/api/health-check/route.ts
- .env.local
