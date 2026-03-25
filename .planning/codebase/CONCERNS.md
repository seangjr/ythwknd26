# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Excessive Console Logging in Production Code:**
- Issue: 48 instances of `console.log()` and `console.error()` scattered throughout codebase, especially in service account key parsing logic
- Files: `src/lib/google-sheets.ts`, `src/app/api/register/route.ts`, `src/app/api/sheets-sync/route.ts`, `src/components/multi-step-registration-form.tsx`, multiple page components
- Impact:
  - Credential information and sensitive data may be logged to production logs
  - Performance overhead from excessive logging
  - Cluttered error tracking and monitoring
- Fix approach:
  - Implement structured logging with log levels (debug, info, error)
  - Remove development-only logs from production code paths
  - Use a logging service (e.g., Pino, Winston) with environment-aware configurations
  - Sanitize sensitive data before logging

**Multiple Fallback Registration Methods (Fragile Design):**
- Issue: `src/app/api/register/route.ts` attempts registration using three different methods in sequence: direct insert, RPC function `register_user_simple`, then RPC function `register_user_params`
- Files: `src/app/api/register/route.ts` (lines 106-249)
- Impact:
  - Unclear which method should be used; suggests database schema or API mismatch
  - Hidden bugs if different methods produce different results
  - Difficult to debug failures; unclear which method succeeded
  - Maintenance burden if database schema changes
- Fix approach:
  - Determine correct registration strategy and remove unused methods
  - Document why multiple methods exist (temporary workaround vs. intended design)
  - Add database migrations to ensure consistency
  - Replace with single, well-tested path

**Loose Type Annotations:**
- Issue: Multiple `any[]` type annotations used instead of proper interfaces
- Files: `src/app/(everywhere-else)/invite/[code]/page.tsx` (line 60), `src/components/multi-step-registration-form.tsx` (line 197), `src/components/hero-selection-grid.tsx`
- Impact:
  - Type safety disabled in critical data handling
  - Difficult to catch data structure bugs at compile time
  - Reduces IDE autocomplete effectiveness
  - Makes refactoring risky
- Fix approach:
  - Create explicit TypeScript interfaces for team members, registrations, and heroes
  - Replace all `any[]` with proper types
  - Enable stricter TypeScript rules

**Type Ignore Comment in Form Logic:**
- Issue: `@ts-ignore` used at `src/components/multi-step-registration-form.tsx:391` to force assignment of `isChristian` field
- Files: `src/components/multi-step-registration-form.tsx` (line 391)
- Impact:
  - Type safety bypassed for critical form state
  - Indicates mismatch between form schema and assignment logic
  - Risk of runtime errors if field types change
- Fix approach:
  - Update form schema definition to allow dynamic field assignment for YM members
  - Create proper type guards or type narrowing instead of ignoring types
  - Document why this assignment is necessary

## Security Considerations

**Google Sheets Credentials Not Properly Validated:**
- Risk: Service account key parsing has multiple fallback strategies that may mask configuration errors; overly verbose debugging logs credential structure
- Files: `src/lib/google-sheets.ts` (lines 7-65), logs at lines 79-86
- Current mitigation:
  - Basic checks for key existence
  - Multiple parsing strategies allow flexibility
- Recommendations:
  - Validate credential structure more strictly before use
  - Remove credential structure logging (even without sensitive data, structure hints at auth mechanism)
  - Add validation of required credential fields (private_key, client_email, project_id)
  - Consider moving credentials to secure environment storage

**Partial Input Validation on Registration Endpoint:**
- Risk: Email and line number uniqueness checked, but no validation of NRIC/Passport format or phone number format before database insertion
- Files: `src/app/api/register/route.ts` (lines 42-78)
- Current mitigation:
  - Client-side validation with Zod schema in `src/components/multi-step-registration-form.tsx`
  - Database constraints (if any)
- Recommendations:
  - Add server-side validation for all user inputs
  - Validate NRIC/Passport format for Malaysia context
  - Add phone number format validation (expected format unclear)
  - Sanitize Instagram handle and school name to prevent injection

**No Rate Limiting on Registration Endpoint:**
- Risk: No rate limiting on `/api/register` could allow brute force or DoS attacks
- Files: `src/app/api/register/route.ts`
- Current mitigation: None observed
- Recommendations:
  - Add rate limiting middleware (consider next-rate-limit or similar)
  - Limit registrations per IP and per email address
  - Log suspicious patterns

**Exposed Invite Codes Not Validated for Access Control:**
- Risk: Invite codes are 10-character nanoid strings that may be guessable; no user authentication checks before registration
- Files: `src/app/api/team-invite/route.ts`, `src/app/api/team-invite/check/route.ts`
- Current mitigation:
  - 7-day expiration on invite codes
  - Checks if invite code is valid and not expired
- Recommendations:
  - Consider longer, more entropy-rich invite codes
  - Consider adding additional validation (email prefix in code, etc.)
  - Log invite code usage for audit trails

**Environment Variable Exposure Risk:**
- Risk: `NEXT_PUBLIC_BASE_URL` may contain environment-specific information; image domain hardcoded in `next.config.ts` to single CDN
- Files: `next.config.ts` (line 4), multiple API routes using `process.env.NEXT_PUBLIC_BASE_URL`
- Current mitigation: Uses `NEXT_PUBLIC_*` prefix appropriately
- Recommendations:
  - Document all required environment variables
  - Add validation that required env vars are present on startup
  - Consider using configuration schema validation (e.g., Zod for env vars)

## Performance Bottlenecks

**Multiple Supabase Queries Per Registration Request:**
- Problem: Registration page makes 3+ database queries on page load: get invite, get registrations, get hero availability, get all hero data
- Files: `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 98-161)
- Cause:
  - Separate queries for each data type
  - No query optimization or batch operations
  - Repeated hero availability queries
- Improvement path:
  - Batch hero availability query with registrations query
  - Use view or stored procedure to combine frequently accessed data
  - Implement caching for team data (TTL: 5-10 minutes)
  - Consider prefetching hero data globally rather than per-team

**Inline Function Redefinition in Render:**
- Problem: `getHeroImagePath()` defined inline in two different files; duplicated logic
- Files: `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 38-46), `src/components/multi-step-registration-form.tsx` (lines 33-41)
- Cause: Logic not extracted to shared utility
- Improvement path:
  - Extract to `src/lib/hero-utils.ts`
  - Reduce component bundle size
  - Enable better tree-shaking

**Expensive Memo Operations:**
- Problem: `useMemo` in form component recomputes hero status for all heroes on every team member fetch
- Files: `src/components/multi-step-registration-form.tsx` (lines 344-384)
- Cause:
  - No pagination on hero lists (only 5 heroes, but pattern doesn't scale)
  - Full array re-sort on every render
- Improvement path:
  - For current scale (5 heroes), avoid memoization overhead unless performance issues manifest
  - If heroes list grows, implement virtualization or pagination

## Fragile Areas

**Hero Availability Desynchronization Risk:**
- Files: `src/app/api/register/route.ts` (lines 150-155), `src/app/(everywhere-else)/invite/[code]/page.tsx` (lines 127-130)
- Why fragile:
  - Hero availability marked as unavailable AFTER registration insert succeeds
  - If update fails, registration exists but hero still shows as available
  - No atomic transaction ensures both operations succeed
  - Race condition if two registrations happen simultaneously with same hero
- Safe modification:
  - Wrap both insert and update in database transaction
  - Or handle hero availability update in database trigger/stored procedure
  - Add pre-check: verify hero still available before insert
- Test coverage: No tests found to verify this behavior

**Team Invite URL Generation Depends on Environment Variable:**
- Files: `src/components/multi-step-registration-form.tsx` (line 300), `src/app/api/team-invite/route.ts` (line 45), `src/app/api/team-invite/check/route.ts` (line 49)
- Why fragile:
  - If `NEXT_PUBLIC_BASE_URL` is missing or wrong, invite links point to wrong domain
  - No validation that generated URL is valid
  - Client may have different base URL than server expects
- Safe modification:
  - Add URL validation/construction on server side only
  - Return full URL from API instead of constructing on client
  - Add runtime validation of URLs
- Test coverage: No tests for URL construction

**Undefined Error Fallback Handling:**
- Files: Throughout codebase - all error handling uses generic fallback messages
- Why fragile:
  - Type assertions like `(error as { message?: string })?.message` assume error structure
  - If error is unexpected type, will silently fail to message
  - Hard to debug in production
- Safe modification:
  - Create error handler utility function
  - Add stricter error type checking
  - Log actual error objects for debugging
- Test coverage: No error handling tests found

**Form State Management Complexity:**
- Files: `src/components/multi-step-registration-form.tsx` (186-200+)
- Why fragile:
  - 15+ useState hooks managing form state, modals, loading states
  - Complex conditional logic for step navigation (lines 417-468)
  - State synchronization between parent and child components unclear
  - Back navigation logic has multiple branching paths that could have edge cases
- Safe modification:
  - Consider useReducer for complex state transitions
  - Extract step navigation logic to separate hook
  - Add integration tests for step flow navigation
- Test coverage: No tests found

## Missing Critical Features

**No Input Sanitization on Text Fields:**
- Problem: Instagram handle, school name, emergency contact name not sanitized before database insert
- Blocks: Prevents XSS or injection attacks if data displayed without escaping
- Impact: Medium risk if data is user-facing without HTML escaping

**No Audit Logging for Registrations:**
- Problem: No record of who created registrations, when, or from where
- Blocks: Cannot track suspicious registration patterns or answer "who registered this person?"
- Impact: Important for event management and dispute resolution

**No Email Verification:**
- Problem: Registrations accepted with any email address, no confirmation required
- Blocks: Cannot contact registrants, invalid emails accepted, potential for fake registrations
- Impact: High - critical for event communication

**No Duplicate Registration Prevention (Beyond Email):**
- Problem: Only email uniqueness checked; one person could register multiple lines with different emails
- Blocks: Cannot prevent one person taking multiple hero slots
- Impact: Medium - affects team balance

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: API endpoints, utility functions, component logic
- Files: Entire `src/app/api`, `src/lib` directories
- Risk: Breaking changes go unnoticed; refactoring is risky
- Priority: High

**No Integration Tests:**
- What's not tested: Registration flow end-to-end, invite validation, hero availability sync
- Files: All API routes and page flows
- Risk: Critical bugs in multi-step workflows
- Priority: High

**No E2E Tests:**
- What's not tested: Complete user registration journey from landing page to success
- Risk: Production regressions, user experience breaks
- Priority: Medium

**No Component Tests:**
- What's not tested: Form validation display, error states, loading states
- Files: `src/components/multi-step-registration-form.tsx`, `src/components/registration-modal.tsx`
- Risk: UI bugs missed; state management errors
- Priority: Medium

## Scaling Limits

**Hero Availability Model:**
- Current capacity: 5 heroes per team, 21 teams = 105 hero slots
- Limit: Model breaks if:
  - Hero can be used by multiple teams (unclear from code)
  - More than 105 total registrations needed
  - Heroes need different availability per team
- Scaling path:
  - Clarify hero-team relationship (one-to-one vs. many-to-many)
  - Add configuration for max registrations per team
  - Consider hero pool vs. team-specific heroes

**Line Number System:**
- Current capacity: 5 lines per team × 21 teams = 105 lines
- Limit: If event grows beyond 105 attendees or team structure changes
- Scaling path:
  - Make line count configurable per team
  - Add line number sequencing logic to database
  - Consider removing artificial line number constraint if not needed

**Image CDN Domain Whitelist:**
- Current capacity: One hardcoded domain `ythwknd.ymfgakl.com`
- Limit: Cannot use other image sources; if domain goes down, all images broken
- Scaling path:
  - Add multiple CDN domains to whitelist
  - Use environment-based domain selection
  - Consider image optimization service (Cloudinary, Imgix)

## Dependencies at Risk

**Google Sheets API Dependency:**
- Risk: Google Sheets sync is optional but when enabled, registration API changes could be required if Google API changes
- Impact: Registration flow breaks if API contract changes
- Migration plan:
  - Google Sheets integration should be completely optional
  - Add feature flag to disable gracefully
  - Current code already handles missing credentials (lines 51-57) but returns success anyway - this hides failures

**Supabase Dependency:**
- Risk: Locked into Supabase-specific APIs and patterns; migration difficult if needed
- Impact: High switching cost if need to migrate databases
- Migration plan:
  - Extract database queries into repository/data access layer
  - Use generic database interfaces instead of Supabase-specific calls
  - Easier to add database abstraction layer now than later

**nanoid Dependency for Invite Codes:**
- Risk: Dependency on external library for simple ID generation
- Impact: Low risk, but adds dependency for simple feature
- Migration plan:
  - Could use Node's built-in crypto.randomUUID() instead
  - Consider more cryptographically secure alternatives if security becomes concern

---

*Concerns audit: 2026-03-25*
