# YTH WKND 2026

## What This Is

A camp registration website for YTH WKND 2026 — a youth event with team-based hero selection and registration. This is a refresh of the existing YTH WKND 2025 site: same core mechanism (hero selection, team registration, invite system) with a new brand identity, updated copy/dates, smoother animations, and a Next.js upgrade to leverage React 19 and RSC.

## Core Value

The registration flow must work flawlessly — users pick a hero, join a team, and complete registration without friction.

## Requirements

### Validated

- ✓ Hero-based team registration system (5 heroes, 21 teams, 105 slots) — existing
- ✓ Multi-step registration form with validation — existing
- ✓ Hero availability tracking (real-time slot management) — existing
- ✓ Team invite system with shareable codes — existing
- ✓ Google Sheets sync for registration data — existing
- ✓ Supabase backend with atomic registration transactions — existing
- ✓ Landing page with event info, pricing, and countdown — existing
- ✓ Database health monitoring with retry logic — existing

### Active

- [ ] Apply new brand identity (colors, fonts, assets) across all pages
- [ ] Update all copy, dates, and event details for 2026
- [ ] Upgrade Next.js to latest stable version
- [ ] Leverage React 19 features and RSC where beneficial
- [ ] Polish and smooth out existing Framer Motion animations
- [ ] Improve interaction feedback and micro-interactions

### Out of Scope

- New features or mechanism changes — same registration flow
- Layout restructuring — same page structure
- New pages or sections — copy/dates only
- Authentication system — remains public registration
- Migration away from Supabase or Google Sheets

## Context

- Currently on Next.js 15.3.1, React 19, Framer Motion 12.10.0
- App uses Next.js App Router with route groups: `(landing)` and `(everywhere-else)`
- Almost entirely client-side rendered with `"use client"` on all pages
- RSC adoption is an opportunity — some pages could benefit from server rendering
- Domain data lives in `src/lib/constants.ts` (heroes, teams, image paths, CG leaders)
- Registration opens on a hardcoded date — this will need updating for 2026
- Codebase map available at `.planning/codebase/`

## Constraints

- **Timeline**: Must be live this week — tight deadline, minimize scope creep
- **Tech stack**: Next.js + React 19 + Framer Motion + Supabase + Tailwind — no stack changes
- **Mechanism**: Registration flow, team system, and invite system remain unchanged
- **Brand**: New brand assets (fonts, colors, logo) are ready to apply

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep same registration mechanism | Working well, no reason to change | — Pending |
| Upgrade Next.js to latest | Leverage React 19/RSC, stay current | — Pending |
| Polish animations rather than rebuild | Current Framer Motion approach is fine, just needs refinement | — Pending |
| Evaluate RSC for appropriate pages | Some pages are purely presentational and could benefit from server rendering | — Pending |

---
*Last updated: 2026-03-25 after initialization*
