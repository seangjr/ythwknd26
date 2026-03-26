# S03: Client Refactor & SSE Real-time

**Goal:** Register page, character selection, and invite page all fetch data via API routes instead of direct Supabase client. Team member updates arrive via SSE. Zero Supabase imports remain in source code.
**Demo:** After this: register page, character selection, and invite page all work without Supabase client — team member updates arrive via SSE within seconds of registration

## Must-Haves

- `rg 'supabase' src/ -g '*.ts' -g '*.tsx'` returns zero matches (excluding db.ts comments if any)
- `rg '@supabase/supabase-js' package.json` returns zero matches
- `test ! -f src/lib/supabase.ts` passes
- `npx tsc --noEmit` exits 0
- `bun run build` exits 0
- SSE endpoint at /api/team-updates responds with text/event-stream content type
- All three client components use fetch() to API routes, not createClient()

## Proof Level

- This slice proves: Contract — TypeScript compilation + build pass + zero Supabase import verification. Runtime verification deferred to S04 E2E.

## Integration Closure

Upstream: All 6 API routes from S02 (hero-availability, team-members, team-invite, team-invite/check, register, health-check) via `src/lib/db.ts`. New wiring: SSE endpoint `/api/team-updates/route.ts` polls registrations table, `team-members-subscription.tsx` uses EventSource instead of Supabase channels. Client components use fetch() to existing API routes. What remains: S04 browser-based E2E verification of full registration and invite flows.

## Verification

- SSE endpoint logs connection open/close and polling errors to console. EventSource client auto-reconnects on disconnect.

## Tasks

- [x] **T01: Enhance API routes for all-data queries and refactor register page + character-selection-screen** `est:45m`
  Update hero-availability and team-members API routes to return all rows when teamId is omitted (currently returns 400). Then refactor register/page.tsx and character-selection-screen.tsx to use fetch() against API routes instead of importing createClient from @/lib/supabase.
  - Files: `src/app/api/hero-availability/route.ts`, `src/app/api/team-members/route.ts`, `src/app/(everywhere-else)/register/page.tsx`, `src/components/character-selection-screen.tsx`
  - Verify: rg 'supabase' src/app/\(everywhere-else\)/register/page.tsx src/components/character-selection-screen.tsx returns zero matches && npx tsc --noEmit exits 0

- [x] **T02: Refactor invite page to use fetch() instead of Supabase client** `est:30m`
  Replace all three Supabase queries in invite/[code]/page.tsx with fetch() calls to /api/team-members and /api/hero-availability. The page queries: (1) registrations for team, (2) hero_availability for team, (3) all hero_availability. All three now map to existing API routes (with the teamId-optional enhancement from T01).
  - Files: `src/app/(everywhere-else)/invite/[code]/page.tsx`
  - Verify: rg 'supabase' src/app/\(everywhere-else\)/invite/\[code\]/page.tsx returns zero matches && npx tsc --noEmit exits 0

- [x] **T03: Create SSE endpoint, rewrite subscription component, and remove all Supabase remnants** `est:40m`
  Create /api/team-updates/route.ts SSE endpoint that polls registrations count and streams change notifications. Rewrite team-members-subscription.tsx to use EventSource. Delete src/lib/supabase.ts. Remove @supabase/supabase-js from package.json. Verify zero Supabase references remain anywhere in source.
  - Files: `src/app/api/team-updates/route.ts`, `src/components/team-members-subscription.tsx`, `src/lib/supabase.ts`, `package.json`
  - Verify: rg 'supabase' src/ -g '*.ts' -g '*.tsx' returns zero matches && rg '@supabase/supabase-js' package.json returns zero matches && test ! -f src/lib/supabase.ts && npx tsc --noEmit exits 0 && bun run build exits 0

## Files Likely Touched

- src/app/api/hero-availability/route.ts
- src/app/api/team-members/route.ts
- src/app/(everywhere-else)/register/page.tsx
- src/components/character-selection-screen.tsx
- src/app/(everywhere-else)/invite/[code]/page.tsx
- src/app/api/team-updates/route.ts
- src/components/team-members-subscription.tsx
- src/lib/supabase.ts
- package.json
