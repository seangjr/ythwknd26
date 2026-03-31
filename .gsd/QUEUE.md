# Queue

## Queued Milestones

### M002 — Neon Migration & Content Cleanup
- **Queued:** 2026-03-25
- **Depends on:** M001
- **Context:** `.gsd/milestones/M002/M002-CONTEXT.md`
- **Scope:** Migrate Supabase→Neon serverless Postgres (D006), clean up stale hero/universe copy, replace real-time with SSE, E2E verification (VERF-01–VERF-04)

### M003 — Performance Audit & Production Readiness
- **Queued:** 2026-03-26
- **Depends on:** M002
- **Context:** `.gsd/milestones/M003/M003-CONTEXT.md`
- **Scope:** Delete ~230MB dead assets, optimize images/videos/fonts, replace googleapis with @googleapis/sheets, remove duplicate deps, audit client components, improve Core Web Vitals for mobile

### M004 — Registration UX Fixes & Animation Reduction
- **Queued:** 2026-03-31
- **Depends on:** M003
- **Context:** `.gsd/milestones/M004/M004-CONTEXT.md`
- **Scope:** Strip excessive registration form animations (72→essentials), fix duplicate "Not Sure" CG leader, success page routing/conditional Payment button for YM members, button overflow fix, Payment form URL update
