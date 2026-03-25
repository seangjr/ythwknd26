---
estimated_steps: 6
estimated_files: 1
skills_used: []
---

# T02: Refactor invite page to use fetch() instead of Supabase client

The invite page (src/app/(everywhere-else)/invite/[code]/page.tsx) has three Supabase queries in the fetchAvailableData function:

1. `supabase.from("registrations").select("line_number, nickname, hero_id, instagram_handle").eq("team_id", invite.teamId)` — replace with `fetch("/api/team-members?teamId=${invite.teamId}")`. Response is `{ members: [...] }` with snake_case fields.

2. `supabase.from("hero_availability").select("hero_id, is_available").eq("team_id", invite.teamId)` — replace with `fetch("/api/hero-availability?teamId=${invite.teamId}")`. Response is array of `{ heroId, isAvailable }` (camelCase).

3. `supabase.from("hero_availability").select("hero_id, is_available")` (ALL, no team filter) — replace with `fetch("/api/hero-availability")`. Same response shape, all teams. This works because T01 enhanced the route to return all rows when teamId omitted.

Key constraint: The page already uses fetch() for invite validation (line ~87, fetches /api/team-invite/check). Only the fetchAvailableData function needs refactoring. Preserve all existing state management, error handling, and UI logic — only change the data-fetching layer.

Field mapping: API returns camelCase (heroId, isAvailable). The invite page currently reads snake_case from Supabase (hero_id, is_available) and maps some fields. After refactor, read camelCase directly from API response and adjust field access accordingly.

## Inputs

- `src/app/(everywhere-else)/invite/[code]/page.tsx`
- `src/app/api/hero-availability/route.ts`
- `src/app/api/team-members/route.ts`

## Expected Output

- `src/app/(everywhere-else)/invite/[code]/page.tsx`

## Verification

rg 'supabase' src/app/\\(everywhere-else\\)/invite/\\[code\\]/page.tsx — must return zero matches. npx tsc --noEmit — must exit 0.
