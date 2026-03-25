# M001 Context

## Project Background

YTH WKND 2026 is a brand refresh of an existing, working camp registration site. The core mechanism — hero selection, team-based registration (21 teams × 5 heroes = 105 slots), invite system — is proven and unchanged. The scope is: upgrade the framework stack (Next.js 15→16, framer-motion→motion), apply new 2026 brand identity, update all copy/dates, and add animation polish.

## Architecture

- **Framework:** Next.js App Router with route groups: `(landing)` and `(everywhere-else)`
- **Rendering:** Currently almost entirely client-side (`"use client"` on all pages); RSC conversion planned for landing page
- **Styling:** Tailwind CSS v4 with CSS-first config; 89 hardcoded color values to be replaced with semantic tokens
- **Animation:** Framer Motion 12 (to be migrated to `motion` package)
- **Backend:** Supabase (auth-free, anon key), Google Sheets sync, API Route Handlers
- **Forms:** react-hook-form + zod validation
- **Domain data:** `src/lib/constants.ts` (heroes, teams, image paths, CG leaders)

## Key Constraints

- **Timeline:** Must be live this week — tight deadline, minimize scope creep
- **Mechanism:** Registration flow, team system, and invite system remain unchanged
- **Registration form:** 1,771 lines with zero test coverage — cosmetic changes ONLY, no refactoring
- **Dual layouts:** Both root layouts must be updated in lockstep

## Known Risks

1. 89 hardcoded color values across 13 files
2. Missing `nanoid` dependency (breaks team invites on fresh deploy)
3. Next.js 16 async API enforcement (all `cookies()`, `headers()`, `params` must be awaited)
4. Font metrics mismatch if new brand font differs from Rumble Brave

## Upstream Dependencies

None — this is the first (and only) milestone.
