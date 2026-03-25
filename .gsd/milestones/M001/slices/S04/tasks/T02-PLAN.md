---
estimated_steps: 20
estimated_files: 7
skills_used: []
---

# T02: End-to-end browser verification of all registration flows and cross-browser checks

Start the dev server and exercise every user flow with browser automation to verify requirements VERF-01 through VERF-04. After verification, revert the time gate bypass from T01.

**Pre-requisites:**
- Collect Supabase env vars via `secure_env_collect` if `.env.local` doesn't exist. Required keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`. Optional (gracefully skipped): `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEET_ID`.
- Start the dev server with `bun run dev` using `bg_shell`.

**Verification flows:**

1. **Landing page (VERF-04 partial):** Navigate to `http://localhost:3000`. Verify: page loads, shows "30 May to 1 June", shows "Peacehaven, Genting Highlands", shows pricing RM130/RM160, Register button is visible and links to `/register`.

2. **Registration flow (VERF-01):** Navigate to `/register`. Verify: page loads (no countdown gate). Click a party from the 21-party grid. Choose a class from the 5 class options. Fill the multi-step registration form (name, email, age, contact, emergency contact, etc.). Submit. Verify the form submission completes (check network for POST to `/api/register` returning 200, or verify success UI).

3. **Invite flow (VERF-02):** From the register page, click the Share button for a party. Generate an invite code (POST to `/api/team-invite`). Capture the invite URL. Navigate to the invite URL (`/invite/{code}`). Verify: team info loads, class selection available. Select a class and proceed through registration via invite path.

4. **Google Sheets sync (VERF-03):** After a registration submission, check that the POST to `/api/sheets-sync` was made. If Google Sheets env vars are configured, verify it returns success. If not configured, verify it returns `{ success: true, sheetsSyncSkipped: true }` (graceful skip).

5. **Cross-browser / Mobile (VERF-04):** Set browser viewport to mobile (375x667). Navigate to landing page, register page. Verify: no horizontal scroll, layout adapts, text is readable, party grid wraps correctly, registration modal is usable.

**Post-verification:**
- Revert time gate bypass: change `new Date(2024, 4, 10, 12, 30, 0)` back to `new Date(2026, 4, 10, 12, 30, 0)` in `src/components/time-restriction.tsx` and `src/app/(landing)/page.tsx`. Update display string back to "May 10, 2026 at 12:30 PM" in `time-restriction.tsx`.
- Run `bun run build` to confirm the revert doesn't break anything.

**Important notes for executor:**
- The registration form is 1,802 lines (`src/components/multi-step-registration-form.tsx`). It has a multi-step wizard UI. Navigate through steps by filling required fields and clicking Next/Continue.
- The `heroId` parameter name is used internally for the class selection (kept from old naming). The form sends `hero_id` to the API.
- If Supabase is not reachable (no env vars or network issue), registration submission will fail with a 503. This is expected and still validates the UI flow — document the outcome.
- The `TimeRestriction` component wraps the register and invite layouts. With T01's bypass, these pages should load directly.
- Class images will show `placeholder.svg` (gray placeholder) — this is expected and correct since classes don't have per-party unique images anymore.
- **KNOWLEDGE: Worktree symlink causes Edit tool failures** — use `sed -i ''` for in-place edits, not the Edit tool. The worktree path is a symlink and Edit resolves the source path differently from `rg`/`head`.

## Inputs

- `public/placeholder.svg`
- `package.json`
- `src/components/time-restriction.tsx`
- `src/components/registration-cta.tsx`
- `src/app/(landing)/page.tsx`
- `src/app/(everywhere-else)/register/page.tsx`
- `src/app/(everywhere-else)/invite/[code]/page.tsx`
- `src/components/multi-step-registration-form.tsx`

## Expected Output

- `src/components/time-restriction.tsx`
- `src/components/registration-cta.tsx`
- `src/app/(landing)/page.tsx`

## Verification

1. Browser assertion: landing page text includes "30 May to 1 June" and "Peacehaven"
2. Browser assertion: /register loads without countdown gate (party grid visible)
3. Browser assertion: registration form is navigable through steps
4. Browser assertion: /invite/{code} loads team info (or graceful error if no Supabase)
5. Browser assertion: mobile viewport (375x667) — no horizontal overflow on landing and register pages
6. `grep '2026' src/components/time-restriction.tsx` — time gate reverted to 2026
7. `bun run build` — exits 0 after revert
