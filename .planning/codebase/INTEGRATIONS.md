# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Supabase (PostgreSQL + Realtime):**
- Purpose: Primary database and realtime event bus for the registration system
- SDK/Client: `@supabase/supabase-js` 2.49.4
- Client wrapper: `src/lib/supabase.ts` (singleton pattern with `createClient()`)
- Auth: Supabase anon key (no user-level auth -- public anonymous access)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Google Sheets API (v4):**
- Purpose: Sync registration data to a shared spreadsheet for offline/admin tracking
- SDK/Client: `googleapis` 148.0.0
- Client wrapper: `src/lib/google-sheets.ts` (creates authenticated sheets client via `createSheetsClient()`)
- Auth: Google service account JSON key (supports Base64-encoded or raw JSON)
- Scopes: `https://www.googleapis.com/auth/spreadsheets` (read/write)
- Env vars: `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEET_ID`
- Failure mode: Non-blocking -- registration succeeds even if Sheets sync fails

**Google Analytics:**
- Purpose: Page-level analytics tracking
- SDK/Client: `@next/third-parties/google` (via `GoogleAnalytics` component)
- Measurement ID: `GTM-W5JTJM5Q`
- Included in both layout groups:
  - `src/app/(landing)/layout.tsx`
  - `src/app/(everywhere-else)/layout.tsx`

## Data Storage

**Database -- Supabase (PostgreSQL):**
- Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Client: `@supabase/supabase-js` singleton via `src/lib/supabase.ts`
- Tables accessed:
  - `registrations` -- User registration records (line_number, email, full_name, hero_id, team_id, emergency contacts, religious affiliation, etc.)
  - `hero_availability` -- Tracks which hero characters are available per team (hero_id, team_id, is_available)
  - `team_invites` -- Invite codes with expiration (invite_code, team_id, expires_at)
  - `teams` -- Team metadata (id, name, color)
- Stored procedures (SQL files in `src/supabase/functions/`):
  - `register_user` -- `src/supabase/functions/register_user.sql` -- Basic registration with hero availability update in a transaction
  - `register_user_extended` -- `src/supabase/functions/register_user_extended.sql` -- Extended registration with religious affiliation fields
  - `register_user_simple` -- Called via RPC in `src/app/api/register/route.ts` (defined in Supabase, no local SQL file)
  - `register_user_params` -- Called via RPC in `src/app/api/register/route.ts` (defined in Supabase, no local SQL file)

**Supabase Realtime:**
- Purpose: Live updates when new team members register
- Implementation: `src/components/team-members-subscription.tsx`
- Channel: `registrations-changes`
- Event: `postgres_changes` on `INSERT` to `registrations` table, filtered by `team_id`
- Pattern: Client-side subscription in a `useEffect` hook, triggers `onNewMember` callback

**External Image Hosting:**
- Domain: `ythwknd.ymfgakl.com` (configured in `next.config.ts`)
- Formats: WebP preferred
- Used for hero character images and event assets

**File Storage:**
- No Supabase Storage or S3 detected
- Static assets served from `/public` directory

**Caching:**
- None beyond Next.js built-in caching

## Authentication & Identity

**Auth Provider:**
- No user authentication system -- Supabase is accessed with the anonymous (anon) key
- No login/logout flow exists
- Registration is a one-time form submission, not tied to a user session
- Team access is controlled via invite codes (7-day expiry), not user accounts

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, Rollbar, or similar)

**Logging:**
- `console.log` / `console.error` throughout API routes
- Google Sheets credential parsing logs structure info (without sensitive data) in `src/lib/google-sheets.ts`
- Centralized database error handler in `src/lib/supabase.ts` via `handleDatabaseError()`

**Error Codes Handled (Supabase/PostgreSQL):**
- `PGRST116` -- No rows returned (mapped to 404)
- `23505` -- Unique constraint violation (mapped to 409)
- `23503` -- Foreign key violation (mapped to 400)

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js + Turbopack usage and project structure)
- Production URL: `https://ythwknd.ymfgakl.com`

**CI Pipeline:**
- Not detected -- no `.github/workflows/`, no `vercel.json`, no CI config files

## Environment Configuration

**Required env vars (client-side, exposed to browser):**
- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anonymous/public key
- `NEXT_PUBLIC_BASE_URL` -- App base URL for generating invite links (used in `src/app/api/team-invite/route.ts` and `src/app/api/team-invite/check/route.ts`)

**Required env vars (server-side, keep secret):**
- `GOOGLE_SERVICE_ACCOUNT_KEY` -- Google service account JSON (Base64 or raw)
- `GOOGLE_SHEET_ID` -- Target spreadsheet ID for registration data sync

**Secrets location:**
- Development: `.env.local` (git-ignored; no `.env` file present in repo)
- Production: Deployment platform environment variables

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- Google Sheets append on registration sync
  - Target: `Registrations!A:V` sheet range (22 columns including timestamp)
  - Triggered by: `POST /api/sheets-sync`
  - Method: `sheets.spreadsheets.values.append` with `INSERT_ROWS`

## API Routes

| Method | Route | Purpose | File |
|--------|-------|---------|------|
| POST | `/api/register` | Main registration -- writes to Supabase, updates hero availability | `src/app/api/register/route.ts` |
| POST | `/api/sheets-sync` | Sync registration data to Google Sheets | `src/app/api/sheets-sync/route.ts` |
| GET | `/api/hero-availability?teamId=` | Get hero availability for a team | `src/app/api/hero-availability/route.ts` |
| POST | `/api/hero-availability` | Update hero availability | `src/app/api/hero-availability/route.ts` |
| GET | `/api/team-invite?code=` | Validate invite code, return team info | `src/app/api/team-invite/route.ts` |
| POST | `/api/team-invite` | Generate new invite code (7-day expiry, uses `nanoid`) | `src/app/api/team-invite/route.ts` |
| GET | `/api/team-invite/check?teamId=` | Check for existing valid invite for a team | `src/app/api/team-invite/check/route.ts` |
| GET | `/api/team-members?teamId=` | Fetch registered members for a team | `src/app/api/team-members/route.ts` |
| GET | `/api/health-check` | Test Supabase connectivity | `src/app/api/health-check/route.ts` |

## Registration Data Flow

1. User submits form on frontend
2. `POST /api/register` validates required fields (lineNumber, email, fullName, heroId, teamId)
3. Checks Supabase for duplicate line number and email
4. Verifies hero availability for selected team
5. Attempts direct insert into `registrations` table
6. On failure, falls back to `register_user_simple` RPC, then `register_user_params` RPC
7. Updates `hero_availability` to mark hero as unavailable
8. Client separately calls `POST /api/sheets-sync` to append data to Google Sheets
9. Supabase Realtime pushes INSERT event to subscribed team members via `src/components/team-members-subscription.tsx`

## Integration-Specific Notes

**Google Sheets Credential Parsing:**
- `parseServiceAccountKey()` in `src/lib/google-sheets.ts` handles three formats:
  1. Base64-encoded JSON string
  2. Raw JSON string
  3. JSON with escaped newlines or surrounding quotes
- Recommended: Base64 encode the service account key to avoid escaping issues in env vars

**Supabase Registration Fallback Chain:**
- The register API in `src/app/api/register/route.ts` tries three methods sequentially:
  1. Direct table insert via `.from("registrations").insert()`
  2. RPC call to `register_user_simple`
  3. RPC call to `register_user_params`
- This cascade pattern exists as a resilience mechanism but adds complexity

**nanoid Usage:**
- `nanoid` is imported in `src/app/api/team-invite/route.ts` but is NOT listed in `package.json` dependencies
- It may be a transitive dependency (bundled with another package) -- this is fragile

---

*Integration audit: 2026-03-25*
