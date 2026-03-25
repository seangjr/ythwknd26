# S01: Neon DB Client & Schema — UAT

**Milestone:** M002
**Written:** 2026-03-25T14:07:17.658Z

# S01 UAT: Neon DB Client & Schema

## Preconditions
- DATABASE_URL is set in .env.local pointing to a live Neon instance
- Schema and seed data have been provisioned via schema.sql and seed.sql

## Test Cases

### TC1: Health-check endpoint returns healthy
1. Start the dev server: `npm run dev`
2. Run: `curl -s http://localhost:3000/api/health-check`
3. **Expected:** Response body is `{"status":"healthy"}` with HTTP 200

### TC2: Health-check fails gracefully with bad DATABASE_URL
1. Temporarily set DATABASE_URL to an invalid value in .env.local
2. Restart the dev server
3. Run: `curl -s http://localhost:3000/api/health-check`
4. **Expected:** Response body contains `{"error":"..."}` with HTTP 503
5. Restore DATABASE_URL and restart dev server

### TC3: Schema tables exist
1. Run: `psql $DATABASE_URL -c "\dt"`
2. **Expected:** Tables listed: teams, hero_availability, team_invites, registrations

### TC4: Seed data counts are correct
1. Run: `psql $DATABASE_URL -c "SELECT count(*) FROM teams"`
2. **Expected:** 21
3. Run: `psql $DATABASE_URL -c "SELECT count(*) FROM hero_availability"`
4. **Expected:** 105

### TC5: db.ts module exports are available
1. Run: `grep -c 'getClient\|handleDatabaseError\|DatabaseConnectionError' src/lib/db.ts`
2. **Expected:** Multiple matches confirming all 3 exports exist

### TC6: .env.example documents DATABASE_URL
1. Run: `grep DATABASE_URL .env.example`
2. **Expected:** Shows the DATABASE_URL template with Neon connection string format

### TC7: TypeScript compilation of new files
1. Run: `npx tsc --noEmit 2>&1 | grep -E 'db.ts|health-check'`
2. **Expected:** No errors referencing db.ts or health-check/route.ts
