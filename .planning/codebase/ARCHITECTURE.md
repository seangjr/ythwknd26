# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Next.js 15 full-stack application with client-side React components and server-side API routes

**Key Characteristics:**
- SSR/SSG hybrid with "use client" client components for interactivity
- Server-side API routes for data mutations and integrations
- Supabase as primary data layer with real-time subscriptions
- Google Sheets as secondary sync target for registrations
- Dual layout structure: landing page (separate layout) and authenticated/registration flows

## Layers

**Presentation Layer:**
- Purpose: UI rendering and user interaction
- Location: `src/components/`
- Contains: React components (both client and server), UI primitives from shadcn/ui
- Depends on: hooks, lib utilities, zod schemas for validation
- Used by: Page routes and other components

**Application/Page Layer:**
- Purpose: Page structure and data orchestration at route level
- Location: `src/app/` (includes layouts and pages)
- Contains: Route handlers, page components, layout definitions
- Depends on: Presentation layer, API layer, database utilities
- Used by: Next.js routing system

**Business Logic Layer:**
- Purpose: Form validation, state management, data transformation
- Location: `src/components/` (multi-step-registration-form.tsx), `src/hooks/`
- Contains: Zod schemas, form logic with react-hook-form, custom hooks
- Depends on: lib utilities, API layer
- Used by: Page and presentation layers

**API Layer:**
- Purpose: HTTP endpoints for client-server communication and external integrations
- Location: `src/app/api/`
- Contains: Route handlers (POST/GET) for registration, team invites, hero availability, sheets sync
- Depends on: Database layer, Google Sheets integration
- Used by: Client-side components, external systems

**Data Layer:**
- Purpose: Database connection management and queries
- Location: `src/lib/supabase.ts`, database tables in Supabase
- Contains: Supabase client initialization, error handling
- Depends on: Supabase SDK
- Used by: API routes, client subscriptions

**Integration Layer:**
- Purpose: External service integrations
- Location: `src/lib/google-sheets.ts`
- Contains: Google Sheets API client, service account authentication
- Depends on: Google APIs library
- Used by: sheets-sync API route

**Utilities/Shared:**
- Purpose: Reusable helpers and constants
- Location: `src/lib/` (constants.ts, utils.ts, format-date.ts)
- Contains: Team/hero definitions, styling utilities, date formatting
- Used by: All layers

## Data Flow

**User Registration Flow:**

1. User lands on `/` (landing page) → sees countdown or register button
2. Clicks "Register" → navigates to `/register` page
3. Registration page loads with team/hero data from constants
4. User fills multi-step form (personal details → character selection → emergency contact)
5. Form submits to `POST /api/register`
6. API validates, checks availability, inserts to Supabase `registrations` table
7. API updates `hero_availability` table to mark hero as taken
8. API calls `POST /api/sheets-sync` to sync to Google Sheets (async)
9. Client receives success, redirects to confirmation or displays modal
10. Real-time subscription via `TeamMembersSubscription` triggers on new registration

**Team Invite Flow:**

1. Team drawer component displays team info
2. User clicks "Share" → opens invite modal
3. Modal calls `POST /api/team-invite` with teamId
4. API generates nanoid invite code, stores in `team_invites` table with 7-day expiry
5. Returns invite URL to client
6. User shares code/URL
7. Invitee visits `/invite/[code]`
8. Page validates code with `GET /api/team-invite?code=...`
9. If valid, modal opens suggesting hero selection for that team

**Hero Availability Check:**

1. Client queries `GET /api/hero-availability` on component mount
2. API fetches from `hero_availability` table for all heroes across teams
3. Returns availability status for UI rendering (grayed out if unavailable)
4. Real-time subscription watches for changes to update UI

**State Management:**

- Local component state via `useState()` for UI interactions
- Server-side state in Supabase (registrations, hero_availability, team_invites)
- Real-time state via Supabase `postgres_changes` subscriptions
- No global state manager; data flows up from database to components

## Key Abstractions

**Hero System:**
- Purpose: Represents playable characters with unique perks
- Examples: `src/lib/constants.ts` (HEROES array), `src/components/hero-selection-grid.tsx`
- Pattern: Constant definitions with ID-based lookups, image path resolution in `multi-step-registration-form.tsx`

**Team System:**
- Purpose: Groups of heroes with themed identities
- Examples: `src/lib/constants.ts` (TEAMS array), 21 teams from "Original Five" to "Cars Five"
- Pattern: Team ID → hero availability per team (many-to-many via hero_availability table)

**Registration Entity:**
- Purpose: Captures user sign-up data
- Stored in: Supabase `registrations` table
- Contains: Personal info, emergency contact, hero/team selection, religious affiliation, event source
- Pattern: Multi-step form validates at each step, submits atomically with availability check

**Team Invite Code:**
- Purpose: Temporary link to invite users to specific team
- Stored in: Supabase `team_invites` table
- Fields: invite_code, team_id, expires_at (7 days)
- Pattern: nanoid-generated, short-lived, validates expiry on use

**Hero Availability:**
- Purpose: Track which heroes are still available for which teams
- Stored in: Supabase `hero_availability` table
- Pattern: Updated atomically when registration completes, queried before form submission

## Entry Points

**Landing Page:**
- Location: `src/app/(landing)/page.tsx`
- Triggers: User visits `/`
- Responsibilities: Display event info, show countdown until registration opens, link to register

**Registration Page:**
- Location: `src/app/(everywhere-else)/register/page.tsx`
- Triggers: User clicks "Register" or direct visit
- Responsibilities: Load registration form, manage character selection, handle submission

**Invite Page:**
- Location: `src/app/(everywhere-else)/invite/[code]/page.tsx`
- Triggers: User visits `/invite/[code]`
- Responsibilities: Validate invite code, pre-select team, route to registration

**API Endpoints:**
- `POST /api/register` - Create registration, check availability, sync to sheets
- `POST /api/team-invite` - Generate new invite code
- `GET /api/team-invite/check?code=...` - Validate invite code
- `GET /api/hero-availability` - Fetch hero availability across teams
- `POST /api/sheets-sync` - Sync registration to Google Sheets
- `GET /api/team-members` - Fetch team member list (supports filtering)
- `GET /api/health-check` - Database connection test

## Error Handling

**Strategy:** Layered error handling with typed error responses and fallbacks

**Patterns:**

- **Database Errors:** `handleDatabaseError()` in `src/lib/supabase.ts` maps Supabase error codes (PGRST116, 23505, 23503) to HTTP status codes and user-friendly messages
- **API Routes:** Wrapped in try-catch, return NextResponse with status codes and error objects
- **Form Validation:** Zod schemas in `multi-step-registration-form.tsx` validate on submit and per-field
- **Client Errors:** Toast notifications via Sonner for user feedback, connection retry logic in `use-database-connection` hook
- **External Integration Errors:** Google Sheets sync fails gracefully (logs error, continues with registration if sheets unavailable)

## Cross-Cutting Concerns

**Logging:**
- Console logging in API routes and auth setup (Google Sheets parsing)
- Errors logged with context (e.g., "Direct insert error:", error)

**Validation:**
- Zod schemas enforce type safety at form level
- API routes re-validate required fields before processing
- Availability checks prevent overbooking heroes

**Authentication:**
- No user authentication; public endpoints with team-based access control
- Invite codes serve as ephemeral access tokens for team assignment
- No session management; stateless API design

**Rate Limiting:**
- Not implemented; relies on Supabase row limits and database constraints
- Google Sheets append operations not throttled

---

*Architecture analysis: 2026-03-25*
