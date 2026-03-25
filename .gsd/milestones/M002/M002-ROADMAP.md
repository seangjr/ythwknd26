# M002: Neon Migration & Content Cleanup

**Vision:** Migrate the database backend from Supabase to Neon serverless Postgres, refactor client components to use API routes instead of direct DB access, replace real-time subscriptions with SSE, and verify the full registration flow end-to-end. This completes the deferred M001 verification work and implements D006.

## Success Criteria

- All API routes return correct data from Neon — registration, hero-availability, team-invite, team-members, health-check all functional
- Zero Supabase references remain in source code (no @supabase/supabase-js import, no NEXT_PUBLIC_SUPABASE_ env vars)
- Client components (character-selection, register page, invite page) fetch data via API routes, not direct DB calls
- SSE endpoint delivers near-real-time team member updates when new registrations occur
- Full registration flow works end-to-end: select party → choose class → fill form → submit → data persisted in Neon
- Team invite flow works: generate code → share link → register via invite
- Build passes with zero TypeScript errors and no console warnings

## Slices

- [ ] **S01: Neon DB Client & Schema** `risk:high` `depends:[]`
  > After this: After this: health-check endpoint returns 'healthy' from Neon DB, schema and seed data provisioned, new db.ts client module works

- [ ] **S02: API Route Migration** `risk:medium` `depends:[S01]`
  > After this: After this: all 6 API routes use Neon SQL instead of Supabase — curl tests confirm correct responses for registration, hero-availability, team-invite, team-members

- [ ] **S03: Client Refactor & SSE Real-time** `risk:medium` `depends:[S02]`
  > After this: After this: register page, character selection, and invite page all work without Supabase client — team member updates arrive via SSE within seconds of registration

- [ ] **S04: E2E Verification** `risk:low` `depends:[S03]`
  > After this: After this: every registration path verified in browser — ready to go live with Neon backend

## Boundary Map

### S01 → S02
Produces:
- `src/lib/db.ts` — `sql` tagged template client from neon(), `withTransaction()` helper, `handleDatabaseError()` utility
- `schema.sql` — DDL for registrations, hero_availability, team_invites, teams tables with indexes and constraints
- `seed.sql` — Initial data for 21 parties × 5 classes in hero_availability, 21 teams
- `DATABASE_URL` configured in .env.local
- `.env.example` with all required env vars documented

Consumes: nothing (first slice)

### S02 → S03
Produces:
- All 6 API routes rewritten: register, hero-availability, team-invite, team-invite/check, team-members, health-check
- Each route uses `sql` from `src/lib/db.ts` with parameterized queries
- `@supabase/supabase-js` removed from package.json
- `src/supabase/` directory removed

Consumes from S01:
- `src/lib/db.ts` — sql client and error handling

### S03 → S04
Produces:
- `src/app/api/team-updates/route.ts` — SSE endpoint for team member change notifications
- `src/components/team-members-subscription.tsx` — rewritten to use EventSource instead of Supabase channels
- character-selection-screen.tsx, register/page.tsx, invite/page.tsx — refactored to use fetch() to API routes
- Zero client-side Supabase imports remaining

Consumes from S02:
- All API routes functional with Neon backend

### S04
Produces:
- Browser-verified registration flow
- Browser-verified invite flow
- Cross-browser testing evidence

Consumes from S01, S02, S03:
- Full working system with Neon backend, API routes, client components, and SSE
