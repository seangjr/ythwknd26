# S03 Research: Client Refactor & SSE Real-time

**Depth:** Targeted — known patterns (fetch API calls, EventSource), moderately complex due to 3 client components + new SSE endpoint.

## Requirements Targeted

- **NEON-02** — Client-side Supabase queries moved behind API routes (primary)
- **NEON-03** — Real-time team member updates via SSE replacing Supabase channels (primary)
- **NEON-01** — Remove remaining Supabase imports from source (supporting — `src/lib/supabase.ts` file and `@supabase/supabase-js` package removal)

## Summary

Three client components still import `createClient` from `@/lib/supabase` for direct DB queries. These must be refactored to use `fetch()` against the existing API routes (already migrated in S02). Additionally, `team-members-subscription.tsx` uses Supabase real-time channels and must be replaced with an SSE-based approach via a new `/api/team-updates` endpoint. Finally, `src/lib/supabase.ts` must be deleted and `@supabase/supabase-js` removed from `package.json`.

## Recommendation

Straightforward refactor. Each component's Supabase queries map 1:1 to existing API routes. The SSE endpoint is a simple polling-based implementation that checks for new registrations. Work divides cleanly into 4 independent units: 3 component refactors + 1 SSE endpoint/subscription rewrite.

## Implementation Landscape

### Files to Modify

| File | Current Supabase Usage | Replacement |
|------|----------------------|-------------|
| `src/components/character-selection-screen.tsx` | `supabase.from("registrations").select().eq("team_id", teamId)` | `fetch("/api/team-members?teamId=${teamId}")` — API returns `{ members: [...] }` |
| `src/app/(everywhere-else)/register/page.tsx` | Two queries: `supabase.from("registrations").select("*")` and `supabase.from("hero_availability").select()` | `fetch("/api/team-members?teamId=...")` per-team, and `fetch("/api/hero-availability?teamId=...")` per-team. **Important:** The register page fetches ALL registrations and ALL hero_availability across all teams. Current API routes require a `teamId` param. Options: (a) loop over 21 teams, (b) add a no-teamId path that returns all data. Option (b) is better — modify hero-availability and team-members routes to return all rows when `teamId` is omitted. |
| `src/app/(everywhere-else)/invite/[code]/page.tsx` | Three queries: registrations for team, hero_availability for team, all hero_availability. | First two map to existing APIs with `teamId`. Third query (all hero_availability) needs the same "no teamId = all" enhancement. |
| `src/components/team-members-subscription.tsx` | `supabase.channel("registrations-changes").on("postgres_changes", ...)` | Rewrite to use `EventSource("/api/team-updates?teamId=${teamId}")`. `onNewMember` callback stays the same. |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/team-updates/route.ts` | SSE endpoint. GET handler that streams keep-alive pings + change notifications. Implementation: poll `registrations` table on interval (e.g. 3s), compare count to last-known, send `data: {"type":"new_member"}` event when count changes. |

### Files to Delete

| File | Reason |
|------|--------|
| `src/lib/supabase.ts` | No longer imported anywhere after refactor |

### Package Changes

- Remove `@supabase/supabase-js` from `package.json` dependencies
- No new packages needed (`EventSource` is a browser API)

### API Route Enhancement Needed

The register page and invite page query ALL registrations and ALL hero_availability (not team-specific). The current S02 API routes **require** `teamId` and return 400 without it.

**Fix:** Update `hero-availability/route.ts` and `team-members/route.ts` to handle missing `teamId` — return all rows when omitted. This is a minor 5-line change per route (remove the early-return 400, adjust SQL to conditionally filter).

### SSE Endpoint Design

The `TeamMembersSubscription` component only does one thing: when a new registration happens for a team, it calls `onNewMember()` which triggers `fetchTeamMembers()` (a regular API fetch). So the SSE endpoint just needs to notify "something changed" — no payload needed.

Implementation pattern:
```
GET /api/team-updates?teamId=N
→ Response: text/event-stream
→ Every 3 seconds: check registration count for teamId
→ If count changed since last check: send event
→ Keep-alive ping every 15 seconds
→ Client reconnects automatically via EventSource
```

The interval-based polling is simple but adequate — the original Supabase real-time also had latency, and the `onNewMember` callback just re-fetches the full member list anyway.

### Data Shape Mapping

**character-selection-screen.tsx** currently expects:
```ts
{ instagram_handle?: string; hero_id: string; line_number: number }[]
```
The `/api/team-members` route returns `{ members: [...] }` with these fields plus extras. Needs `data.members` access and field mapping.

**register/page.tsx** currently expects:
- Registrations: `{ id, line_number, group_number, nickname, hero_id, team_id, full_name, age }[]`
- Hero availability: `{ hero_id, team_id, is_available }[]`

The API routes return camelCase (`heroId`, `teamId`, `isAvailable`) per the S02 pattern. The register page already maps to camelCase (`heroId`, `teamId`, `isAvailable`) internally, so this aligns well.

**invite/page.tsx** — same patterns as above. Already uses `fetch` for the invite validation (line ~87), but uses Supabase for `registrations` and `hero_availability` queries.

### Constants Issue

The constants file still has the old `HEROES`, `TEAMS`, `HERO_IMAGE_PATHS` arrays (not the M001 `CLASSES`/`PARTIES`). All three components reference these heavily. This is **not in scope** for S03 — the M001 merge will resolve it. S03 should refactor Supabase→fetch only, preserving all existing constant references.

### Natural Task Decomposition

1. **T01: Enhance API routes to support "all" queries** — Update `hero-availability/route.ts` and `team-members/route.ts` to return all rows when `teamId` is omitted. Small change, unblocks T02/T03.
2. **T02: Refactor register page and character-selection-screen** — Replace Supabase imports with fetch calls. These two are tightly coupled (register page renders character-selection-screen). Both query registrations + hero_availability.
3. **T03: Refactor invite page** — Replace Supabase imports with fetch calls. Independent from T02.
4. **T04: SSE endpoint + subscription rewrite** — Create `/api/team-updates/route.ts`, rewrite `team-members-subscription.tsx` to use EventSource. Delete `src/lib/supabase.ts`, remove `@supabase/supabase-js` from package.json. Run final zero-supabase verification.

T01 is a prerequisite for T02/T03. T02 and T03 are independent of each other. T04 depends on T01 (SSE endpoint imports from db.ts) but not on T02/T03. The cleanup (delete supabase.ts, remove package) should go in T04 as the final step since it's the last task.

### Verification Strategy

1. `rg 'supabase' src/ -g '*.ts' -g '*.tsx'` — zero matches (except possibly comments)
2. `rg '@supabase/supabase-js' package.json` — zero matches
3. `ls src/lib/supabase.ts` — file should not exist
4. `npx tsc --noEmit` — zero type errors
5. `bun run build` — clean build

### Risk Assessment

**Low risk overall.**
- The Supabase→fetch refactors are mechanical — each Supabase query maps to an existing API route.
- The SSE endpoint is new code but simple (poll + stream).
- The "all data" API enhancement is a small, safe change.
- Main risk: the register page and invite page have ~300+ lines each with complex UI state. The refactor must carefully preserve state management and error handling while only changing the data-fetching layer.
