# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Database & Backend:**
- Supabase (PostgreSQL + Backend-as-a-Service)
  - What it's used for: User registration data, team management, hero availability tracking
  - SDK/Client: @supabase/supabase-js 2.49.4
  - Auth method: Anonymous key + service account key (if applicable)
  - Location: `src/lib/supabase.ts`

**Spreadsheet Sync:**
- Google Sheets API (v4)
  - What it's used for: Automatic registration data synchronization to a shared spreadsheet for offline tracking
  - SDK/Client: googleapis 148.0.0
  - Auth: Service account JSON key (Base64 or raw JSON)
  - Location: `src/lib/google-sheets.ts`
  - Scopes: `https://www.googleapis.com/auth/spreadsheets`

**Analytics & Monitoring:**
- Google Analytics integration (via @next/third-parties)
  - Configured but not directly used in visible code

## Data Storage

**Databases:**
- Supabase (PostgreSQL-backed)
  - Connection: Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: @supabase/supabase-js
  - Tables accessed:
    - `registrations` - User registration records with comprehensive personal and event data
    - `hero_availability` - Tracks hero character availability per team
  - Query pattern: Supabase client with `.from().select()`, `.insert()`, `.update()` methods
  - RPC functions: Attempts fallback to `register_user_simple` and `register_user_params` functions for registration

**File Storage:**
- Local filesystem only for development
- Image domain configured: `ythwknd.ymfgakl.com` (hosted images, likely CDN or external storage)
- Image formats: WebP (primary), fallback to other formats

**Caching:**
- None detected - relies on Next.js built-in caching

## Authentication & Identity

**Auth Provider:**
- Custom implementation via Supabase anonymous authentication
  - Implementation: Client-side authentication using Supabase anon key
  - No traditional user login system detected; uses registration workflow instead
  - Session management: Handled by Supabase client

**Authorization:**
- Registration-based access control
- Team-based hero availability checks before allowing registrations

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Rollbar, etc.)

**Logs:**
- Console logging for debugging (development environment)
  - Google Sheets integration logs credential structure and parsing attempts
  - Database errors logged via Supabase error handler
- Error handling centralized in `src/lib/supabase.ts` with `handleDatabaseError()` function

**Error Codes Handled:**
- `PGRST116` - No rows returned (404)
- `23505` - Unique constraint violation (409 Conflict)
- `23503` - Foreign key violation (400 Bad Request)

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js configuration and Turbopack usage)
- Alternative: Any Node.js 20+ hosting platform compatible with Next.js

**CI Pipeline:**
- Not detected - no GitHub Actions, GitLab CI, or similar configuration found

**Environment Configuration:**
- Vercel Environment Variables (or equivalent on chosen platform)
- `.env.local` for local development (not committed to git)

## Environment Configuration

**Required env vars:**

Client-side (exposed to browser):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

Server-side (kept secret):
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google service account JSON (Base64 or raw)
- `GOOGLE_SHEET_ID` - Target spreadsheet ID for registration sync

**Secrets location:**
- Development: `.env.local` (git-ignored)
- Production: Deployment platform environment variables (Vercel/hosting provider secrets)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- Google Sheets - Registration data appended on each successful registration
  - Endpoint: `https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Registrations!A:V:append`
  - Triggered by: POST `/api/register`
  - Data appended: 21 columns including registration timestamp

## API Routes & Endpoints

**Registration Pipeline:**
- `POST /api/register` - Main registration endpoint
  - Writes to Supabase `registrations` table
  - Updates `hero_availability` to mark hero as unavailable
  - Attempts to sync data to Google Sheets (non-blocking failure)
  - File: `src/app/api/register/route.ts`

- `POST /api/sheets-sync` - Standalone Google Sheets sync endpoint
  - Appends registration data to Sheets without Supabase insertion
  - Used as fallback or independent tracking
  - File: `src/app/api/sheets-sync/route.ts`

- `GET/POST /api/team-invite/check` - Check team invitation validity
  - File: `src/app/api/team-invite/check/route.ts`

- `GET/POST /api/team-invite` - Create or validate team invitations
  - File: `src/app/api/team-invite/route.ts`

- `GET /api/team-members` - Fetch team member data
  - File: `src/app/api/team-members/route.ts`

- `GET /api/hero-availability` - Check hero availability per team
  - File: `src/app/api/hero-availability/route.ts`

- `GET /api/health-check` - Service health status
  - File: `src/app/api/health-check/route.ts`

## Data Flow

**Registration Flow:**
1. User submits registration form (frontend) → `POST /api/register`
2. API validates required fields (lineNumber, email, fullName, heroId, teamId)
3. Check Supabase for duplicate line/email
4. Verify hero availability for selected team
5. Insert into `registrations` table
6. Update `hero_availability` to mark hero unavailable
7. (Optional) Append data to Google Sheets if configured
8. Return success response

**Error Handling:**
- Missing required fields → 400 Bad Request
- Duplicate line/email → 409 Conflict
- Hero unavailable → 409 Conflict
- Database errors → 500 Internal Server Error
- Google Sheets sync failures non-blocking (success still returned)

## Integration-Specific Notes

**Google Sheets Credentials Handling:**
- Supports multiple formats: Base64 encoded, raw JSON, escaped newlines
- Automatic detection and parsing in `parseServiceAccountKey()` function
- Location: `src/lib/google-sheets.ts`
- Can be Base64 encoded to avoid newline escaping issues in environment variables

**Supabase Error Handling:**
- Custom `DatabaseConnectionError` exception class
- Centralized error mapping in `handleDatabaseError()` function
- Graceful fallback for registration with multiple RPC function attempts
- Location: `src/lib/supabase.ts`

**Google Sheets Integration Tolerance:**
- Gracefully handles missing Google Sheets configuration
- Registration succeeds even if Sheets sync fails
- Logs failure but returns `sheetsSyncFailed: true` flag

---

*Integration audit: 2026-03-25*
