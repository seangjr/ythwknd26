# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Duplicated Form Schema Definitions:**
- Issue: The Zod form schema for registration is defined in two separate files with divergent validation rules. The `multi-step-registration-form.tsx` version validates Instagram handles must start with `@`, while `registration-modal.tsx` does not. The modal version includes `churchName`/`pastorName`/`churchRole` fields; the form version has them commented out.
- Files: `src/components/multi-step-registration-form.tsx` (lines 44-146), `src/components/registration-modal.tsx` (lines 11-78)
- Impact: Schema drift causes inconsistent validation depending on which flow a user enters. Changes to one schema are easily missed in the other.
- Fix approach: Extract a single shared schema to `src/lib/schemas/registration.ts` and import it in both components.

**Duplicated `getHeroImagePath` Function:**
- Issue: The same hero image path lookup function is copy-pasted in two files.
- Files: `src/components/multi-step-registration-form.tsx` (lines 33-41), `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 38-46)
- Impact: Bug fixes or changes to image path logic must be applied in two places.
- Fix approach: Move to a shared utility in `src/lib/utils.ts` or a new `src/lib/hero-utils.ts`.

**Triple-Fallback Registration Strategy:**
- Issue: The register API tries three different insertion methods sequentially: direct insert, `register_user_simple` RPC, and `register_user_params` RPC. This is a band-aid for past Supabase function issues that was never cleaned up.
- Files: `src/app/api/register/route.ts` (lines 110-249)
- Impact: Obscures real errors, makes debugging harder, and triples code volume. The RPC functions (`register_user_simple`, `register_user_params`) may not exist in the current database -- their corresponding SQL files in `src/supabase/functions/` are `register_user.sql` and `register_user_extended.sql`, not matching the RPC names.
- Fix approach: Determine which method works, remove the other two. Keep a single insert path with clear error handling.

**Commented-Out Code Throughout:**
- Issue: Many commented-out fields and code blocks remain (`nickname`, `churchName`, `pastorName`, `churchRole`).
- Files: `src/app/api/register/route.ts` (lines 14, 36-38), `src/components/multi-step-registration-form.tsx` (lines 104, 134-146, 218-219, 225, 431), `src/app/api/sheets-sync/route.ts` (lines 14, 75, 94-96)
- Impact: Makes code harder to read and maintain. Unclear whether these fields will return or are permanently removed.
- Fix approach: Remove commented-out code. Use git history if the fields are needed later.

**Hardcoded Team Size of 5:**
- Issue: The magic number `5` (team size / lines per team) is scattered across multiple files without a constant.
- Files: `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 117-122), `src/app/(everywhere-else)/register/page.tsx` (lines 113-124), `src/components/registration-modal.tsx` (line 161)
- Impact: Changing team size requires finding and updating every instance.
- Fix approach: Add `TEAM_SIZE` to `CONSTANTS` in `src/lib/constants.ts` and reference it everywhere.

**Hardcoded Past Date in Time Restriction:**
- Issue: `TimeRestriction` component has a hardcoded date of May 11, 2024, which is nearly two years in the past.
- Files: `src/components/time-restriction.tsx` (line 13)
- Impact: The time gate is permanently open and the component does nothing useful. The "Coming Soon" UI will never display.
- Fix approach: Either remove the component or make the date configurable via props or environment variable.

**Missing `nanoid` in `package.json` Dependencies:**
- Issue: `nanoid` is imported in `src/app/api/team-invite/route.ts` but is not listed in `package.json` dependencies or devDependencies. It is also not found in `node_modules/nanoid`.
- Files: `src/app/api/team-invite/route.ts` (line 2), `package.json`
- Impact: Builds will fail in fresh environments. Team invite generation is broken without this dependency.
- Fix approach: Run `npm install nanoid` to add it as an explicit dependency.

**Loose `any` Type Annotations:**
- Issue: Multiple `any[]` type annotations used instead of proper interfaces for team member data.
- Files: `src/components/hero-selection-grid.tsx` (line 9), `src/components/multi-step-registration-form.tsx` (line 197), `src/app/(everywhere-else)/invite/[code]/page.tsx` (line 60), `src/components/registration-modal.tsx` (line 89)
- Impact: Type safety disabled in critical data handling paths. IDE autocomplete is broken for these variables.
- Fix approach: Create a shared `TeamMember` interface and use it across all files.

**`@ts-ignore` Bypassing Type Safety:**
- Issue: A `@ts-ignore` is used to force-assign `isChristian` field for YM members, indicating a schema mismatch.
- Files: `src/components/multi-step-registration-form.tsx` (line 391)
- Impact: Runtime type errors possible if field types change.
- Fix approach: Update the form schema to properly handle the YM member case, or use a type-safe approach to set the field.

**`next.config.ts` Uses Deprecated `domains` Config:**
- Issue: Next.js 15 deprecates `images.domains` in favor of `images.remotePatterns`.
- Files: `next.config.ts` (line 4)
- Impact: May produce warnings or break in future Next.js versions.
- Fix approach: Replace `domains: ['ythwknd.ymfgakl.com']` with `remotePatterns: [{ protocol: 'https', hostname: 'ythwknd.ymfgakl.com' }]`.

## Known Bugs

**Recursive Retry Loop in Registration Modal:**
- Symptoms: When a non-200 response is received, `handleFetchError` is called with the parsed error data (which is a JSON object, not an Error). If it "recovers," the function recursively calls itself (`return handleFormSubmit(data)`), potentially causing infinite retries since there is no recursion depth limit.
- Files: `src/components/registration-modal.tsx` (lines 200-211)
- Trigger: Any API error response from `/api/register`.
- Workaround: None currently in place.

**`handleRegistrationSuccess` is a No-Op on Invite Page:**
- Symptoms: After successful registration via the invite page, the success handler is an empty function body with only a comment.
- Files: `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 208-210)
- Trigger: Complete a registration through the invite flow.
- Workaround: The `RegistrationModal` component internally handles success UI, so the user-facing impact is limited.

**Step 4 Navigation is Dead Code:**
- Symptoms: In the multi-step form, the step 4 branch in `handleNext` checks `isValid` but no `form.trigger()` call precedes it, so `isValid` is always `false` from the previous assignment.
- Files: `src/components/multi-step-registration-form.tsx` (lines 463-467)
- Trigger: Reaching step 4 (church details step, which is currently bypassed in the flow).
- Workaround: Step 4 appears unreachable in the current navigation flow.

## Security Considerations

**No Rate Limiting on Any API Endpoint:**
- Risk: All API routes (`/api/register`, `/api/team-invite`, `/api/hero-availability`, `/api/sheets-sync`, `/api/team-members`, `/api/health-check`) have zero rate limiting. An attacker could flood registration, generate unlimited invite codes, or exhaust Google Sheets API quotas.
- Files: All files in `src/app/api/`
- Current mitigation: None. No middleware file exists in the project.
- Recommendations: Add rate limiting middleware. At minimum, protect `/api/register` and `/api/team-invite` POST endpoints.

**No Authentication or Authorization on Write Endpoints:**
- Risk: All API endpoints are publicly accessible. Anyone can call `/api/hero-availability` POST to toggle hero availability to any value, create unlimited team invites, or read all team member data.
- Files: `src/app/api/hero-availability/route.ts` (POST handler at line 52), `src/app/api/team-invite/route.ts` (POST handler), `src/app/api/team-members/route.ts`
- Current mitigation: None.
- Recommendations: Add at minimum a shared secret or CSRF token for write operations. The hero availability POST endpoint is particularly dangerous since it allows arbitrary lock/unlock of heroes.

**Supabase Anon Key Used for All Server-Side Operations:**
- Risk: The anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is used for all database operations including inserts and updates in API routes. This key is inherently public (exposed to client via the `NEXT_PUBLIC_` prefix).
- Files: `src/lib/supabase.ts` (lines 23-25)
- Current mitigation: Relies entirely on Supabase Row Level Security (RLS) policies, which are not visible in this codebase.
- Recommendations: Use a server-side service role key for API route handlers. Keep the anon key only for client-side read operations.

**Client-Side Direct Supabase Access Bypasses API Layer:**
- Risk: Two page components create Supabase clients directly in client-side code and query the database, bypassing API routes and any server-side validation.
- Files: `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 103-155), `src/app/(everywhere-else)/register/page.tsx` (lines 57-97)
- Current mitigation: Supabase RLS (assumed).
- Recommendations: Route all data access through API endpoints for consistent access control and logging.

**PII Stored Without Encryption:**
- Risk: NRIC/Passport numbers, contact numbers, email addresses, and emergency contact details are stored as plain text in Supabase and synced to Google Sheets.
- Files: `src/app/api/register/route.ts` (line 127), `src/app/api/sheets-sync/route.ts` (lines 63-101)
- Current mitigation: None.
- Recommendations: Encrypt PII at rest. Consider whether NRIC/Passport data is truly needed, or if a partial hash would suffice. Ensure the Google Sheet has restricted sharing.

**Google Sheets Formula Injection:**
- Risk: User-supplied text (names, school names, Instagram handles) is written directly to Google Sheets cells without sanitization. Values starting with `=`, `+`, `-`, or `@` could execute as formulas.
- Files: `src/app/api/sheets-sync/route.ts` (lines 69-98)
- Current mitigation: None.
- Recommendations: Prefix all text values with a single quote (`'`) when writing to Sheets, or use the `USER_ENTERED` value input option with sanitization.

**Verbose Credential Logging:**
- Risk: The Google Sheets client creation logs credential structure information to the console, including whether private key and client email exist.
- Files: `src/lib/google-sheets.ts` (lines 80-86)
- Current mitigation: None.
- Recommendations: Remove credential structure logging entirely. Use structured logging with sensitive field redaction.

## Performance Bottlenecks

**Registration Page Fetches All Records with `select("*")`:**
- Problem: The register page fetches ALL registration records with `select("*")` on mount, including potentially sensitive fields like NRIC and emergency contacts.
- Files: `src/app/(everywhere-else)/register/page.tsx` (line 63)
- Cause: No field selection or pagination.
- Improvement path: Select only needed fields (`id`, `line_number`, `hero_id`, `team_id`). This also reduces data exposure.

**No Caching on Read Endpoints:**
- Problem: Every page load triggers fresh database queries for hero availability, team members, and registration data. Multiple users viewing the registration page simultaneously cause redundant queries.
- Files: `src/app/api/hero-availability/route.ts`, `src/app/api/team-members/route.ts`
- Cause: No `Cache-Control` headers or client-side caching.
- Improvement path: Add `Cache-Control` headers with short TTL (5-10s) on GET endpoints. Use SWR or React Query on the client.

**Supabase Client Singleton May Share State Across Requests:**
- Problem: The Supabase client is a module-level singleton. In serverless environments (Vercel), module state can persist between requests within the same function instance.
- Files: `src/lib/supabase.ts` (lines 4, 14)
- Cause: `let supabase` variable cached at module scope.
- Improvement path: Create a new client per request in API routes, or use Supabase's recommended `@supabase/ssr` package for Next.js.

**Invite Page Makes 4 Sequential Database Queries:**
- Problem: The invite page's `fetchAvailableData` function makes 3 separate Supabase queries sequentially (registrations, hero availability per team, all hero data), plus the initial invite fetch.
- Files: `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 98-161)
- Cause: No query batching or parallel execution.
- Improvement path: Use `Promise.all` for independent queries. Consider a single RPC function that returns all needed data.

## Fragile Areas

**Registration Flow (1771-Line Monolith):**
- Files: `src/components/multi-step-registration-form.tsx` (1771 lines)
- Why fragile: The multi-step form is a massive single component with complex conditional navigation (YM member vs non-member paths, skip logic for steps 2-4, back navigation). It manages 15+ `useState` hooks and multiple `useEffect` hooks with interdependent state. The step navigation logic (lines 417-500) has multiple branching paths that are difficult to reason about.
- Safe modification: Test all paths manually: (1) YM member flow (steps 1 -> 2 -> 5), (2) non-YM member flow (steps 1 -> 3 -> 5), (3) "attending other church" blocking flow. Verify back navigation at each step.
- Test coverage: Zero.

**Race Condition in Hero Selection:**
- Files: `src/app/api/register/route.ts` (lines 53-64, 81-93, 150-155)
- Why fragile: Hero availability is checked (line 81-93) and then updated (lines 150-155) in separate, non-atomic operations. Two users could check availability simultaneously, both see the hero as available, and both register with it.
- Safe modification: Use a database transaction or Supabase RPC function that checks and updates atomically. The existing SQL files in `src/supabase/functions/` may already handle this but the API code does not use them consistently.
- Test coverage: None.

**Line Number / Group Number Calculation:**
- Files: `src/app/(everywhere-else)/register/page.tsx` (lines 112-127), `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 117-122), `src/components/registration-modal.tsx` (line 161)
- Why fragile: Line and group number calculation is duplicated across files with the formula `(teamId - 1) * 5 + 1`. If team structure changes, every instance must be updated independently.
- Safe modification: Extract to a utility function in `src/lib/utils.ts`. Verify against existing database records.
- Test coverage: None.

**Invite URL Construction Split Between Server and Client:**
- Files: `src/app/api/team-invite/route.ts` (line 45), `src/app/api/team-invite/check/route.ts` (line 49), `src/components/multi-step-registration-form.tsx` (line 300)
- Why fragile: Invite URLs are constructed on the server using `NEXT_PUBLIC_BASE_URL` env var (with empty string fallback), but the form component constructs its own URL using `window.location.origin`. These could produce different results.
- Safe modification: Always construct full URLs on the server side. Return the complete URL from the API.
- Test coverage: None.

## Scaling Limits

**5 Members Per Team, Hardcoded:**
- Current capacity: 5 members per team.
- Limit: Cannot change without updating at least 3 files.
- Scaling path: Extract to `CONSTANTS.TEAM_SIZE` and reference everywhere.

**Google Sheets API Quota:**
- Current capacity: Google Sheets API allows 60 write requests per minute per project.
- Limit: High registration volume during peak times could exhaust the quota.
- Scaling path: Batch writes or use a queue. Currently, each registration makes a synchronous Sheets API call from the client after the main registration succeeds.

## Dependencies at Risk

**`nanoid` (Undeclared):**
- Risk: Used in production code but not in `package.json`. Not found in `node_modules`.
- Impact: Team invite generation is broken on fresh installs.
- Migration plan: Add to `package.json` as explicit dependency, or replace with `crypto.randomUUID()`.

## Missing Critical Features

**No Test Suite:**
- Problem: There are zero test files, no test configuration, and no testing framework installed.
- Blocks: Cannot verify correctness of registration logic, form validation, or API behavior after changes. Any refactoring is high-risk.

**No Server-Side Input Validation:**
- Problem: API routes accept raw JSON bodies and only check for field presence, not format. The `/api/register` route checks that `email`, `fullName`, `heroId`, and `teamId` exist but does not validate email format, age range, phone format, or NRIC format on the server.
- Files: `src/app/api/register/route.ts` (lines 42-47)
- Blocks: Malformed data can enter the database if client-side validation is bypassed.

**No Error Monitoring:**
- Problem: All errors go to `console.error` with no external error tracking service.
- Blocks: Visibility into production errors. Issues only surface when users report them.

**No Email Verification:**
- Problem: Registrations accepted with any email address. No confirmation email sent.
- Blocks: Cannot contact registrants reliably. Fake registrations cannot be distinguished from real ones.

## Test Coverage Gaps

**Entire Codebase is Untested:**
- What's not tested: All API routes, all components, all utility functions, all form validation logic, all database interactions.
- Files: Every file in `src/`
- Risk: Any change could introduce regressions undetected. The complex multi-step registration flow (1771 lines) is particularly vulnerable.
- Priority: High -- at minimum, add integration tests for `/api/register` and unit tests for the shared form schema validation.

---

*Concerns audit: 2026-03-25*
