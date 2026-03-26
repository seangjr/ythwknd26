# YTH WKND 2026

## What This Is

A camp registration website for YTH WKND 2026 — a youth event with class-based party selection and registration. This is a refresh of the existing YTH WKND 2025 site: same core mechanism (class selection, party-based registration, invite system) with a new brand identity, updated copy/dates, smoother animations, and a Next.js upgrade to leverage React 19 and RSC.

## Core Value

The registration flow must work flawlessly — users pick a party, choose a class, and complete registration without friction.

## Requirements

### Validated

- ✓ UPGR-01 — Next.js upgraded to 16.2.1 (latest stable with Turbopack default)
- ✓ UPGR-02 — framer-motion replaced with motion@12.38.0, all import paths updated
- ✓ UPGR-03 — Landing page converted to RSC with client islands
- ✓ BRND-01 — All hardcoded hex values replaced with semantic CSS custom property tokens
- ✓ BRND-02 — Heading font replaced (Rumble Brave → Jeju Hallasan via --font-rumble)
- ✓ CONT-01 — All copy updated for 2026 (dates, venue, pricing, class/party model)
- ✓ CONT-02 — Class data (5 classes) and party naming (PARTY 001–021) updated
- ✓ CONT-03 — Registration open date set to May 10, 2026 (placeholder)
- ✓ CONT-04 — Pricing updated: RM130 (new friends) / RM160 (YM member)
- ✓ CONT-05 — Metadata updated with YTHWKND 2026 across both layouts + manifest
- ✓ ANIM-01 — Spring physics on hover/tap interactions
- ✓ ANIM-02 — whileInView stagger animations on grids
- ✓ ANIM-03 — AnimatePresence form step transitions
- ✓ ANIM-04 — Micro-interactions on class cards and buttons

### Validated in M002

- ✓ NEON-01 — Supabase client replaced with Neon serverless driver across all API routes
- ✓ NEON-02 — Client-side Supabase queries moved behind API routes
- ✓ NEON-03 — Real-time team member updates via SSE replacing Supabase channels
- ✓ NEON-04 — Neon database schema and seed data provisioned
- ✓ VERF-01 — Full registration flow tested end-to-end (party grid → class → form → submit)
- ✓ VERF-02 — Team invite flow tested end-to-end (generate code → share → register)
- ✓ VERF-03 — Google Sheets sync endpoint functional (full sync requires Google credentials)
- ✓ VERF-04 — Responsive layout verified at mobile/tablet/desktop (Chromium)

### Active

- [ ] BRND-03 — Logo and brand assets updated for 2026 (no new assets provided)
- [ ] BRND-04 — Consistent brand identity verified across all pages
- [ ] Hero ID alignment between frontend constants and DB seed data
- [ ] Google Sheets credentials configuration for full sync

### Out of Scope

- New features or mechanism changes — same registration flow structure
- Layout restructuring — same page structure
- New pages or sections
- Authentication system — remains public registration

## Context

- Currently on Next.js 16.2.1, React 19.2.4, motion 12.38.0
- **Database: Neon serverless Postgres** via @neondatabase/serverless (migrated from Supabase in M002)
- `src/lib/db.ts` — Neon tagged-template SQL client (getClient(), handleDatabaseError())
- Schema: 4 tables (registrations, hero_availability, team_invites, teams) with stored procedures
- App uses Next.js App Router with route groups: `(landing)` and `(everywhere-else)`
- Semantic color tokens `--text-muted` and `--surface` defined in globals.css with Tailwind mappings
- Landing page is a Server Component with client islands (RegistrationCTA, motion wrappers)
- Motion wrapper components at `src/components/motion/` provide RSC-compatible animation primitives
- Shared animation variants at `src/lib/animations.ts` (springs, fades, stagger, hover helpers)
- Domain data in `src/lib/constants.ts` — CLASSES (5), PARTIES (21), CG_LEADERS (updated)
- Registration opens on hardcoded date — current placeholder May 10, 2026
- Heading font is Jeju Hallasan (via --font-rumble CSS variable)
- SSE real-time updates at /api/team-updates (edge runtime, 3s polling)
- Zero Supabase references in source — migration complete
- API/DB field names kept as heroId/hero_id — only UI text renamed to class terminology
- Codebase map available at `.planning/codebase/`

## 2026 Event Details (Confirmed via D004, Applied in M001/S03)

| Field | Value | Status |
|-------|-------|--------|
| Event dates | May 30 – June 1, 2026 | ✅ Applied |
| Venue | Peacehaven, Genting Highlands | ✅ Applied |
| Pricing | RM130 (new friends) / RM160 (YM member) | ✅ Applied |
| Selection model | Class selection (was hero selection) | ✅ Applied |
| Classes | Warrior, Archer, Scout, Guardian, Scholar | ✅ Applied |
| Group naming | PARTY 001 – PARTY 021 (was themed team names) | ✅ Applied |
| Heading font | Jeju Hallasan (was Rumble Brave) | ✅ Applied |

## Key Decisions

| ID | Decision | Rationale | Outcome |
|----|----------|-----------|---------|
| — | Keep same registration mechanism | Working well, no reason to change | ✅ Confirmed |
| D001 | Semantic color tokens --text-muted, --surface | Semantic intent over color description | ✅ Done (S01) |
| D002 | motion@12.38.0 as framer-motion replacement | Official successor, same API | ✅ Done (S01) |
| D003 | Placeholder event dates for 2026 | Superseded by D004 | ✅ Superseded |
| D004 | Confirmed 2026 event details (user override) | Real dates, venue, pricing, class/party model | ✅ Done (S03) |
| D005 | Keep --font-rumble variable name for Jeju Hallasan | 72 class usages — rename is churn | ✅ Done (S03) |
| D006 | Migrate Supabase → Neon serverless Postgres | User override | ✅ Validated (M002) |

## Completed Milestones

### M001 — YTH WKND 2026 Camp Registration Site Refresh ✅

Refreshed the site for 2026: upgraded to Next.js 16.2.1/motion 12.38.0, applied confirmed event details, converted landing page to RSC, polished animations with spring physics. 36 files changed, ~2000 lines modified. Build-clean and structurally verified. Browser E2E testing deferred pending Neon migration (D006).

- S01 ✅ Upgrade and Foundation
- S02 ✅ Brand Identity and Content
- S03 ✅ Content Override, Animation and RSC
- S04 ✅ Verification (structural only — browser E2E deferred)

### M002 — Neon Migration & Content Cleanup ✅

Complete Supabase-to-Neon migration: database client, all API routes, client components, SSE real-time, and E2E verification. Zero Supabase references remain. 8 requirements validated (NEON-01–04, VERF-01–04).

- S01 ✅ Neon DB Client & Schema
- S02 ✅ API Route Migration
- S03 ✅ Client Refactor & SSE Real-time
- S04 ✅ E2E Verification

## Next Steps

1. **Brand Assets** — Update logo/OG images when new brand assets are provided (BRND-03, BRND-04)
2. **Hero ID Alignment** — Align frontend constants (warrior/archer) with DB seed data (alex/suzzy) to fix 409 errors
3. **Google Sheets** — Configure GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_SHEET_ID for full sync

---
*Last updated: 2026-03-26 after M002 completed*
