# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Next.js 15 App Router with client-heavy pages, Supabase backend, and Google Sheets sync

**Key Characteristics:**
- Next.js App Router with route groups for layout separation (`(landing)` vs `(everywhere-else)`)
- Almost entirely client-side rendered pages (`"use client"` on all page components)
- API Routes serve as a thin backend layer between the client and Supabase/Google Sheets
- No authentication layer -- public registration system with no user sessions
- Domain model centered around Teams (21 teams), Heroes (5 per team), and Registrations
- Singleton Supabase client shared across API routes (server-side) and page components (client-side via public anon key)

## Layers

**Presentation Layer (Pages + Components):**
- Purpose: Renders the UI and manages all user interaction state
- Location: `src/app/` (pages), `src/components/` (shared components), `src/components/ui/` (primitives)
- Contains: Next.js page components, layout files, feature components, Radix-based UI primitives
- Depends on: `src/lib/constants.ts` for domain data, `src/lib/supabase.ts` for direct DB reads, API routes for mutations
- Used by: End users via browser

**API Layer (Route Handlers):**
- Purpose: Server-side endpoints for data mutations and external service integration
- Location: `src/app/api/`
- Contains: Next.js Route Handlers (POST/GET) for registration, team invites, hero availability, sheets sync, health check
- Depends on: `src/lib/supabase.ts`, `src/lib/google-sheets.ts`
- Used by: Client-side `fetch()` calls from components

**Data Access Layer:**
- Purpose: Database and external service clients
- Location: `src/lib/supabase.ts`, `src/lib/google-sheets.ts`
- Contains: Supabase singleton client with error handling, Google Sheets API client with credential parsing
- Depends on: Environment variables (Supabase URL/key, Google service account)
- Used by: API routes and directly by client-side page components (Supabase only)

**Domain Constants:**
- Purpose: Static application data (heroes, teams, image paths, CG leaders)
- Location: `src/lib/constants.ts`
- Contains: `CONSTANTS` object with `HEROES` (5), `TEAMS` (21), `HERO_IMAGE_PATHS` (105), `CG_LEADERS` (16)
- Depends on: Nothing
- Used by: All page components and some API logic indirectly

**Database Functions:**
- Purpose: Atomic registration operations in PostgreSQL
- Location: `src/supabase/functions/register_user.sql`, `src/supabase/functions/register_user_extended.sql`
- Contains: PL/pgSQL stored procedures that insert a registration and update hero availability in a single transaction
- Depends on: `registrations` and `hero_availability` Supabase tables
- Used by: API route `src/app/api/register/route.ts` as fallback RPC calls

**Custom Hooks:**
- Purpose: Reusable client-side logic
- Location: `src/hooks/`
- Contains: `use-database-connection.ts` -- connection health monitoring with retry logic (max 3 retries, 2s delay)
- Depends on: `/api/health-check` endpoint
- Used by: `src/components/registration-modal.tsx`

## Data Flow

**Registration Flow (Primary):**

1. User visits `/register` page (`src/app/(everywhere-else)/register/page.tsx`) -- fetches all registrations and hero availability directly from Supabase client-side
2. User clicks an available hero tile, which opens `RegistrationModal` (`src/components/registration-modal.tsx`)
3. Modal shows `CharacterSelectionScreen` (`src/components/character-selection-screen.tsx`) first, then `MultiStepRegistrationForm` (`src/components/multi-step-registration-form.tsx`)
4. Form submission POSTs to `/api/register` (`src/app/api/register/route.ts`)
5. API route validates fields, checks line availability, checks email uniqueness, checks hero availability -- all via Supabase
6. On success: inserts into `registrations` table and updates `hero_availability` to `false`
7. Client then fires a secondary POST to `/api/sheets-sync` (`src/app/api/sheets-sync/route.ts`) to append the row to Google Sheets (fire-and-forget; failure does not block registration)
8. Client updates local state optimistically

**Team Invite Flow:**

1. On `/register` page, user clicks "Invite" button on a team
2. `TeamInviteModal` (`src/components/team-invite-modal.tsx`) calls POST `/api/team-invite` to generate a `nanoid(10)` invite code stored in `team_invites` table with 7-day expiry
3. Invite link is shareable: `/invite/{code}`
4. Recipient visits `/invite/[code]` (`src/app/(everywhere-else)/invite/[code]/page.tsx`)
5. Page calls GET `/api/team-invite?code=...` to validate the code and retrieve team details
6. Invite page shows only the invited team's heroes, user selects one and registers via the same `RegistrationModal`

**State Management:**
- No global state management library -- all state is local component state via `useState`/`useEffect`
- Registration page holds the master state for `registrations[]` and `heroAvailability[]`
- Hero availability and team member counts are derived from these arrays in-component
- Supabase client is used directly in page components for initial data fetching (read operations)
- Mutations go through API routes exclusively

## Key Abstractions

**Hero:**
- Purpose: A selectable character archetype that a registrant picks
- Examples: Defined in `src/lib/constants.ts` as `CONSTANTS.HEROES` (5 heroes: alex, suzzy, charlotte, charlie, kai)
- Pattern: Each hero has `id`, `name`, `icon`, `class`, `perk`, `description`

**Team (Universe):**
- Purpose: A group of 5 slots, each mapped to one hero. 21 teams total = 105 registrations max
- Examples: Defined in `src/lib/constants.ts` as `CONSTANTS.TEAMS` (id 1-21)
- Pattern: Each team has `id`, `name`, `color` (Tailwind class), `code` (e.g., "U001")

**Hero Availability:**
- Purpose: Tracks which hero+team combinations are still open for registration
- Examples: Supabase `hero_availability` table with `hero_id`, `team_id`, `is_available` columns
- Pattern: Boolean flag per hero-team pair; set to `false` on registration

**Registration:**
- Purpose: A single participant's signup record
- Examples: Supabase `registrations` table
- Pattern: Contains personal info (name, email, age, NRIC, contact, school), team assignment (team_id, hero_id, line_number, group_number), emergency contact details, and optional survey fields (is_christian, event_source)

**Line Number:**
- Purpose: Sequential slot identifier. Teams of 5 map to lines: team 1 = lines 1-5, team 2 = lines 6-10, etc.
- Examples: `getNextAvailableLineForTeam()` in `src/app/(everywhere-else)/register/page.tsx`
- Pattern: `startLine = (teamId - 1) * 5 + 1`, `groupNumber = Math.ceil(lineNumber / 5)`

**RegistrationModal:**
- Purpose: Two-phase registration flow controller (character selection then form)
- Examples: `src/components/registration-modal.tsx`
- Pattern: Orchestrates `CharacterSelectionScreen` and `MultiStepRegistrationForm` as sequential steps; handles form submission, API calls, and Google Sheets sync

## Entry Points

**Landing Page:**
- Location: `src/app/(landing)/page.tsx`
- Triggers: User visits `/`
- Responsibilities: Displays event poster, date/venue info, pricing tiers, and a countdown timer or register button depending on whether registration has opened (hardcoded date: May 11, 2025 12:30 PM)

**Registration Page:**
- Location: `src/app/(everywhere-else)/register/page.tsx`
- Triggers: User navigates to `/register`
- Responsibilities: Fetches all registrations and hero availability from Supabase, renders 21 team sections with 5 hero tiles each, handles hero selection and opens registration modal

**Invite Page:**
- Location: `src/app/(everywhere-else)/invite/[code]/page.tsx`
- Triggers: User visits `/invite/{inviteCode}`
- Responsibilities: Validates invite code via API, shows single-team hero selection, handles registration for that specific team

**API: Register:**
- Location: `src/app/api/register/route.ts`
- Triggers: POST from `RegistrationModal`
- Responsibilities: Validates fields, checks uniqueness (line, email), checks hero availability, inserts registration, updates hero availability. Uses cascading fallback strategy: direct insert first, then `register_user_simple` RPC, then `register_user_params` RPC

**API: Sheets Sync:**
- Location: `src/app/api/sheets-sync/route.ts`
- Triggers: POST from `RegistrationModal` after successful Supabase registration
- Responsibilities: Appends registration data to a Google Sheets spreadsheet as a backup/admin view. Non-blocking -- failure does not affect registration

**API: Team Invite:**
- Location: `src/app/api/team-invite/route.ts`
- Triggers: POST to create invite, GET to validate invite code
- Responsibilities: Generates nanoid invite codes, stores in `team_invites` table with 7-day expiry, validates codes on retrieval

**API: Team Invite Check:**
- Location: `src/app/api/team-invite/check/route.ts`
- Triggers: GET with `teamId` query param
- Responsibilities: Returns the most recent non-expired invite for a team (used to check if an invite already exists before creating a new one)

**API: Hero Availability:**
- Location: `src/app/api/hero-availability/route.ts`
- Triggers: GET with `teamId`, POST to update availability
- Responsibilities: Reads and updates `hero_availability` table

**API: Team Members:**
- Location: `src/app/api/team-members/route.ts`
- Triggers: GET with `teamId`
- Responsibilities: Returns all registered members for a team

**API: Health Check:**
- Location: `src/app/api/health-check/route.ts`
- Triggers: GET from `useDatabaseConnection` hook
- Responsibilities: Tests Supabase connectivity by querying `registrations` table

## Error Handling

**Strategy:** Mixed -- API routes use structured error responses; client components use try/catch with toast notifications

**Patterns:**
- `src/lib/supabase.ts` exports `handleDatabaseError()` which maps Supabase error codes (PGRST116, 23505, 23503) to HTTP status codes and user-friendly messages
- API routes use `handleDatabaseError()` in `hero-availability`, `team-members`, and `health-check` routes
- The `/api/register` route uses a cascading fallback pattern: tries direct insert, then two different RPC functions, only failing if all three methods fail
- Client-side `useDatabaseConnection` hook (`src/hooks/use-database-connection.ts`) provides retry logic with max 3 retries and 2-second delay between attempts
- `LoadingOverlay` component (`src/components/loading-overlay.tsx`) shows connection status during retries
- Google Sheets sync failures are silently logged -- they do not prevent successful registration
- Form validation uses Zod schemas (`src/components/registration-modal.tsx`) with `react-hook-form` for field-level validation before submission

## Cross-Cutting Concerns

**Logging:** `console.log` and `console.error` throughout. No structured logging framework. API routes log errors before returning HTTP error responses.

**Validation:** Zod schemas in `src/components/registration-modal.tsx` validate form data client-side. Server-side validation in `/api/register` is minimal (checks required fields exist, checks uniqueness constraints via DB queries). No shared validation schema between client and server.

**Authentication:** None. The application is fully public. Supabase uses the anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) for all database access. Row-level security policies (if any) are managed in Supabase dashboard, not in codebase.

**Animation:** Framer Motion (`framer-motion`) is used extensively across all page components and many sub-components for entrance animations, hover effects, and exit transitions.

**Styling:** Tailwind CSS v4 with custom font (`font-rumble`), custom team color classes (`bg-team-01` through `bg-team-21`), and dark theme (black background, `#BABABA` text). Component library based on Radix UI primitives styled with `class-variance-authority` (shadcn/ui pattern).

**Route Groups:** Two layout groups separate the landing page (`(landing)`) from the registration/invite pages (`(everywhere-else)`). The `(everywhere-else)` layout includes `Navbar`, `Footer`, `SonnerProvider` (toast notifications), and `TimeRestriction` wrapper. The `(landing)` layout has only `Footer`.

**Time Gating:** Registration access is time-gated via `TimeRestriction` component (`src/components/time-restriction.tsx`) which checks against a hardcoded date (May 11, 2024 12:30 PM -- note: this date is in the past, so the gate is always open). The landing page has its own separate time check (May 11, 2025 12:30 PM) for showing the register button vs countdown timer.

---

*Architecture analysis: 2026-03-25*
