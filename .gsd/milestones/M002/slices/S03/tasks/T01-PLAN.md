---
estimated_steps: 3
estimated_files: 4
skills_used: []
---

# T01: Enhance API routes for all-data queries and refactor register page + character-selection-screen

Two API routes (hero-availability, team-members) currently return 400 when teamId is omitted. The register page needs ALL registrations and ALL hero_availability across all teams. This task enhances both routes to return all rows when teamId is missing, then refactors the two tightly-coupled client components (register/page.tsx and character-selection-screen.tsx) to use fetch() instead of Supabase createClient().

The character-selection-screen queries `registrations` filtered by teamId — maps to `fetch("/api/team-members?teamId=${teamId}")`. Response shape is `{ members: [...] }` with snake_case fields (line_number, hero_id, instagram_handle).

The register page queries: (1) ALL registrations unfiltered — maps to `fetch("/api/team-members")`, (2) ALL hero_availability unfiltered — maps to `fetch("/api/hero-availability")`. Response shapes: team-members returns `{ members: [...] }`, hero-availability returns array of `{ heroId, isAvailable }` (camelCase). The register page already maps to camelCase internally.

## Inputs

- `src/app/api/hero-availability/route.ts`
- `src/app/api/team-members/route.ts`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/character-selection-screen.tsx`

## Expected Output

- `src/app/api/hero-availability/route.ts`
- `src/app/api/team-members/route.ts`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/components/character-selection-screen.tsx`

## Verification

rg 'supabase' src/app/\\(everywhere-else\\)/register/page.tsx src/components/character-selection-screen.tsx — must return zero matches. npx tsc --noEmit — must exit 0 with no errors in modified files.
