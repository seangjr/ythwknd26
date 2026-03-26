# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YTHWKND 2025/2026 — a Next.js event registration app for a youth high school weekend event by YMFGAKL. Users register by choosing a hero class (Warrior, Archer, Scout, Guardian, Scholar) and joining one of 20 color-named teams (5 slots each). Registration syncs to Google Sheets.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- `npx tsc --noEmit` — type check without emitting

## Architecture

**Next.js 16 App Router** with two route groups sharing separate root layouts:

- `(landing)` — marketing/landing page at `/`, minimal layout (no navbar, no time restriction)
- `(everywhere-else)` — registration flows (`/register`, `/invite/[code]`), wrapped in `<TimeRestriction>`, `<Navbar>`, and `<SonnerProvider>`

Both layouts render full `<html>` tags (parallel root layouts pattern).

**Database — dual client setup (migration in progress):**
- `src/lib/db.ts` — **primary**, Neon serverless SQL via `@neondatabase/serverless` (uses `DATABASE_URL`)
- `src/lib/supabase.ts` — legacy Supabase client (uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- API routes use `getClient()` from `db.ts` with raw SQL tagged templates, not an ORM
- Registration uses a Postgres stored procedure `register_user_extended()` for atomic insert + hero availability update

**API routes** (`src/app/api/`):
- `register/` — multi-field registration with line/email uniqueness + hero availability checks
- `hero-availability/` — check/manage hero slot availability per team
- `team-invite/` and `team-invite/check/` — invite code generation and validation
- `team-members/` — fetch team roster
- `sheets-sync/` — sync registrations to Google Sheets via service account
- `health-check/` — basic health endpoint

**Key integrations:**
- Google Sheets sync (`src/lib/google-sheets.ts`) — service account auth, base64-encoded key support
- Google Analytics via `@next/third-parties`

## Environment Variables

- `DATABASE_URL` — Neon Postgres connection string (primary DB)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — legacy Supabase (being phased out)
- `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON or base64-encoded Google service account for Sheets sync
- `GOOGLE_SHEET_ID` — target spreadsheet ID

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Styling: Tailwind CSS v4 with `tw-animate-css`, dark theme default (bg-black, text-[#BABABA])
- UI primitives: Radix UI (Dialog, Label, RadioGroup, Select, Tooltip)
- Forms: react-hook-form + zod validation
- Animation: framer-motion
- Custom fonts loaded via `src/styles/fonts.css`
- Constants (heroes, teams, CG leaders) defined in `src/lib/constants.ts`
- Team colors use custom classes `bg-team-01` through `bg-team-20`
- Prefer interfaces over types; avoid enums, use const maps
- Favor React Server Components; minimize `'use client'`
- Use named exports for components
