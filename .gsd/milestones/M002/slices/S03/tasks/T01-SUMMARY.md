---
id: T01
parent: S03
milestone: M002
key_files:
  - src/app/api/hero-availability/route.ts
  - src/app/api/team-members/route.ts
  - src/app/(everywhere-else)/register/page.tsx
  - src/components/character-selection-screen.tsx
key_decisions:
  - hero-availability API returns teamId in response for all queries (filtered and unfiltered) to support register page's HeroAvailability interface
  - team-members API selects team_id column in both query paths to support register page's Registration interface
duration: ""
verification_result: passed
completed_at: 2026-03-25T14:23:07.875Z
blocker_discovered: false
---

# T01: Enhance API routes for optional teamId and refactor register page + character-selection-screen to use fetch() instead of Supabase client

**Enhance API routes for optional teamId and refactor register page + character-selection-screen to use fetch() instead of Supabase client**

## What Happened

Enhanced both API routes (hero-availability, team-members) to return all rows when teamId query param is omitted, instead of returning 400. The hero-availability route now also includes teamId in its response for the unfiltered case. The team-members route now selects team_id in both filtered and unfiltered queries.

Refactored register/page.tsx to fetch data via `/api/team-members` (all registrations) and `/api/hero-availability` (all hero availability) instead of directly calling Supabase createClient(). The API response shapes align: team-members returns `{ members: [...] }` with snake_case DB fields, hero-availability returns camelCase `{ heroId, teamId, isAvailable }` array.

Refactored character-selection-screen.tsx to fetch team members via `/api/team-members?teamId=${teamId}` instead of Supabase client. Mapped the response to the existing TeamMember interface shape.

Removed all `createClient` imports from both files. Pre-existing type errors in invite/[code]/page.tsx remain (out of scope for this task, will be addressed in a later task in this slice).

## Verification

1. `rg 'supabase' src/app/(everywhere-else)/register/page.tsx src/components/character-selection-screen.tsx` — exit code 1 (zero matches), confirming no Supabase imports remain.
2. `npx tsc --noEmit` — only errors are pre-existing in invite/[code]/page.tsx (not modified by this task). Zero errors in the four modified files.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg 'supabase' src/app/(everywhere-else)/register/page.tsx src/components/character-selection-screen.tsx` | 1 | ✅ pass | 4400ms |
| 2 | `npx tsc --noEmit (errors only in invite/[code]/page.tsx, not modified files)` | 2 | ✅ pass (no errors in modified files) | 4400ms |


## Deviations

hero-availability API route now returns teamId in the response object even for filtered queries (was previously omitted). This is additive and doesn't break existing consumers. The team-members route now also selects team_id for both filtered and unfiltered paths to support the register page which uses r.team_id.

## Known Issues

Pre-existing type errors in src/app/(everywhere-else)/invite/[code]/page.tsx (5 errors about 'never' type) — these are out of scope and will be fixed when that file is refactored in a later task.

## Files Created/Modified

- `src/app/api/hero-availability/route.ts`
- `src/app/api/team-members/route.ts`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/character-selection-screen.tsx`
