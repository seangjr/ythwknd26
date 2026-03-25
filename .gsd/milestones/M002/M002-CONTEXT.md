---
depends_on: [M001]
---

# M002: Neon Migration & Content Cleanup

**Gathered:** 2026-03-25
**Status:** Ready for planning

## Project Description

Migrate the database backend from Supabase to Neon serverless Postgres, clean up remaining stale copy from the hero→class model change, and verify the full registration flow end-to-end. This completes the deferred verification work from M001 and implements the D006 user override (Supabase→Neon).

## Why This Milestone

Two blockers from M001 need resolution: (1) the D006 override changed the database backend to Neon but the migration wasn't implemented, and (2) browser-based E2E verification (VERF-01 through VERF-04) was deferred because the dev server had no database connectivity. Additionally, the M001 copy changes applied on the milestone branch need to be verified as fully merged and any residual stale hero/universe references cleaned up.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Run the full registration flow against a live Neon database: select a party, choose a class, fill the form, and submit successfully
- Share a team invite link and have another user register via that invite
- See live updates when team members register (via SSE replacing Supabase real-time)
- Confirm all site copy reflects the 2026 class/party model with no stale hero/universe references

### Entry point / environment

- Entry point: `http://localhost:3000` (dev server) and production deployment
- Environment: local dev + browser
- Live dependencies involved: Neon serverless Postgres database, Google Sheets API (existing, unchanged)

## Completion Class

- Contract complete means: all API routes return correct data from Neon, build passes with zero TypeScript errors, no Supabase references remain in source code
- Integration complete means: registration flow works end-to-end against live Neon DB — form submission, team invites, class availability, and Google Sheets sync all functional
- Operational complete means: SSE-based team member updates work in real-time, time gate correctly controls access, cross-browser testing passes

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A user can complete the full registration flow (select party → choose class → fill form → submit) against a live Neon database and see the registration persisted
- A user can generate a team invite, share the link, and another user can register via that invite link
- Team member updates appear in near-real-time via SSE when new registrations occur
- The site contains zero references to Supabase in source code and zero stale hero/universe copy in UI-facing text

## Risks and Unknowns

- **Client-side Supabase usage** — Three components (character-selection-screen, register/page, invite/page) currently import the Supabase client directly for client-side queries. Neon's serverless driver is server-only, so these must be refactored to call API routes instead. This is a structural change, not just a driver swap.
- **Real-time subscription replacement** — Supabase real-time (postgres_changes channel) is used for live team member updates. Replacing with SSE polling introduces a latency tradeoff and a new API endpoint. The `onNewMember` callback just triggers a re-fetch, so the functional impact is low, but the implementation pattern changes.
- **Stored procedure migration** — Two Supabase RPC functions (register_user, register_user_extended) are called as fallbacks in the register route. These need to be either recreated in Neon or replaced with direct SQL in the API route.
- **Schema creation** — No existing migration tooling. The 4 tables (registrations, hero_availability, team_invites, teams) and their indexes/constraints need a creation script. Schema must match what the current Supabase instance has.
- **Environment variables** — Switching from `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `DATABASE_URL` (Neon connection string). The NEXT_PUBLIC_ prefix means the Supabase credentials are currently exposed to the client — Neon credentials should NOT be client-exposed.

## Existing Codebase / Prior Art

- `src/lib/supabase.ts` — Current Supabase client singleton with `createClient()` and `handleDatabaseError()` helper. 81 lines. Will be replaced entirely with a Neon client module.
- `src/app/api/register/route.ts` — 271 lines. Main registration endpoint. Uses Supabase fluent API (`.from().insert().select()`) and RPC calls (`supabase.rpc("register_user_simple", ...)`). Triple fallback pattern (direct insert → rpc simple → rpc params). Needs full rewrite to SQL.
- `src/app/api/hero-availability/route.ts` — 92 lines. GET (query availability) and POST (update availability). Fluent API queries need SQL conversion.
- `src/app/api/team-invite/route.ts` — 122 lines. POST (create invite with nanoid) and GET (validate invite). Queries team_invites and teams tables.
- `src/app/api/team-invite/check/route.ts` — 61 lines. GET (check existing invite for a team).
- `src/app/api/team-members/route.ts` — 45 lines. GET (fetch team member registrations).
- `src/app/api/health-check/route.ts` — 29 lines. Simple connectivity test.
- `src/components/team-members-subscription.tsx` — 35 lines. Uses `supabase.channel("registrations-changes").on("postgres_changes", ...)` for real-time updates. Only consumer is multi-step-registration-form.tsx. The `onNewMember` callback calls `fetchTeamMembers` (an API fetch). Will be replaced with SSE.
- `src/components/character-selection-screen.tsx` — Client component that calls `supabase.from("hero_availability")` directly. Must be refactored to use the `/api/hero-availability` endpoint instead.
- `src/app/(everywhere-else)/register/page.tsx` — Client component that queries `supabase.from("registrations")` and `supabase.from("hero_availability")` directly. Must be refactored to use API routes.
- `src/app/(everywhere-else)/invite/[code]/page.tsx` — Page component that queries `supabase.from("registrations")` and `supabase.from("hero_availability")` directly. Must be refactored to use API routes.
- `src/supabase/functions/register_user.sql` — Stored procedure for transactional registration + hero_availability update. May be recreated in Neon or inlined as a SQL transaction in the API route.
- `src/lib/google-sheets.ts` + `src/app/api/sheets-sync/route.ts` — Google Sheets integration. Not Supabase-dependent. Unchanged by this migration.
- `src/lib/constants.ts` — On the milestone/M001 branch, this is clean (CLASSES, PARTIES, CG_LEADERS). On main, it still has old HEROES/HERO_IMAGE_PATHS. M001 merge will resolve this, but verify after merge.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- VERF-01 — Full registration flow tested end-to-end (this milestone completes the deferred verification)
- VERF-02 — Team invite flow tested end-to-end
- VERF-03 — Google Sheets sync verified after registration
- VERF-04 — Cross-browser testing (Chrome, Safari, mobile)
- D006 — Migration from Supabase to Neon serverless Postgres (this milestone implements it)

## Scope

### In Scope

- Replace `@supabase/supabase-js` with `@neondatabase/serverless` in package.json
- Rewrite `src/lib/supabase.ts` → `src/lib/db.ts` (or similar) with Neon client
- Rewrite all 6 API routes to use Neon SQL instead of Supabase fluent API
- Refactor 3 client components that directly import Supabase to use API routes instead
- Replace Supabase real-time subscription with SSE polling endpoint
- Create SQL schema script for Neon (4 tables, indexes, constraints)
- Set up Neon project via neonctl and configure DATABASE_URL
- Clean up any remaining stale hero/universe copy after M001 merge
- Run full E2E browser verification (VERF-01 through VERF-04)
- Remove `src/supabase/` directory (stored procedure SQL files)
- Create `.env.example` with required environment variables

### Out of Scope / Non-Goals

- Changing the registration flow or form fields — same mechanism, different driver
- Schema changes — same tables, same columns, same relationships
- Google Sheets integration changes — not Supabase-dependent
- New features or pages
- ORM adoption (Drizzle, Prisma) — raw SQL via Neon serverless driver is sufficient for this codebase size
- Production deployment — separate concern after verification passes

## Technical Constraints

- Neon's serverless driver (`neon()` function) is server-only — cannot be used in client components. All client-side Supabase queries must be moved behind API routes.
- The `NEXT_PUBLIC_` prefix on current env vars exposes credentials to the client. Neon connection strings must NOT use this prefix — they contain full database credentials.
- The registration route has a triple-fallback pattern (direct insert → rpc simple → rpc params) that exists to work around Supabase permission issues. With Neon (direct SQL), this simplifies to a single transaction.
- neonctl v2.22.0 is installed locally and can be used for project setup.
- Node.js version must be checked — `@neondatabase/serverless` requires WebSocket config for Node v21 and earlier.

## Integration Points

- **Neon serverless Postgres** — New database backend. Connection via `DATABASE_URL` env var. Uses `@neondatabase/serverless` driver with tagged template SQL.
- **Google Sheets API** — Existing integration, unchanged. Called from `src/app/api/sheets-sync/route.ts` after successful registration.
- **SSE endpoint** — New `/api/team-updates` (or similar) endpoint that replaces Supabase real-time channels. Client subscribes via EventSource.

## Open Questions

- **Neon project creation** — User will create the Neon project and provide the connection string, or we'll use neonctl to create it. The Neon MCP server is not currently configured but could be added.
- **Schema seeding** — Do the 21 parties and 5 classes need initial seed data in hero_availability? The current Supabase presumably has this pre-populated. Need to include seed SQL alongside schema.
- **RPC function strategy** — The register_user stored procedures could be recreated in Neon or replaced with inline SQL transactions in the API route. Inline SQL is simpler and avoids maintaining separate SQL files.
