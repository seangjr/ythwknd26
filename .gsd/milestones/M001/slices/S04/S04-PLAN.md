# S04: Verification

**Goal:** Every registration path works flawlessly across browsers — the site is ready to go live.
**Demo:** every registration path works flawlessly across browsers — ready to go live

## Must-Haves

- placeholder.svg exists in public/ and all class image references resolve without broken images
- nanoid is an explicit dependency in package.json
- Full registration flow works end-to-end: select party → choose class → fill form → submit (VERF-01)
- Team invite flow works end-to-end: generate code → share link → register via invite (VERF-02)
- Google Sheets sync verified: env vars present and sync route called after registration (VERF-03)
- Landing page, register page, and registration modal render correctly on Chrome, Safari, and mobile viewport (VERF-04)
- Build passes with zero TypeScript errors

## Proof Level

- This slice proves: Final-assembly — real runtime required against running dev server with Neon (serverless Postgres). Browser verification exercises real user flows.

## Integration Closure

- Upstream surfaces consumed: S03's RSC landing page, motion wrappers, class/party constants, animation variants
- New wiring introduced: placeholder.svg for class images, nanoid explicit dep, time restriction bypass for testing
- What remains before milestone is truly usable end-to-end: nothing — this is the final verification slice

## Verification

- None — this is a verification slice that tests existing functionality, not a feature slice.

## Tasks

- [x] **T01: Fix pre-verification blockers (placeholder.svg, nanoid dep, time gate bypass)** `est:20m`
  Fix three issues that would cause verification to fail before it starts: (1) Create /public/placeholder.svg — 7 component files reference it for class images and it's missing, (2) Add nanoid to package.json as an explicit dependency — currently resolves via transitive dep but fragile for fresh installs, (3) Temporarily bypass the TimeRestriction date gate and RegistrationCTA date check so /register and /invite/* pages are accessible for testing (current date March 25 is before May 10, 2026 gate).
  - Files: `public/placeholder.svg`, `package.json`, `src/components/time-restriction.tsx`, `src/components/registration-cta.tsx`
  - Verify: Test: `ls public/placeholder.svg` confirms file exists. `grep nanoid package.json` shows dependency. `bun run build` exits 0. Manual: loading /register in dev server shows the registration page (not the countdown gate).

- [x] **T02: End-to-end browser verification of all registration flows and cross-browser checks** `est:1h`
  Start the dev server and exercise every user flow with browser automation: (1) Landing page — loads correctly, shows 2026 dates/venue/pricing, Register button visible, (2) Registration flow — navigate to /register, select a party, choose a class, fill multi-step form, submit (VERF-01), (3) Invite flow — generate invite code for a party, open /invite/{code}, verify team info, select class, register (VERF-02), (4) Google Sheets sync — verify env vars are configured and sync route is called during registration (VERF-03), (5) Cross-browser — verify key pages render correctly on mobile viewport and check for layout issues (VERF-04). Collect Supabase env vars via secure_env_collect if not already present.
  - Files: `src/app/(landing)/page.tsx`, `src/app/(everywhere-else)/register/page.tsx`, `src/app/(everywhere-else)/invite/[code]/page.tsx`, `src/components/multi-step-registration-form.tsx`, `src/components/character-selection-screen.tsx`, `src/components/time-restriction.tsx`, `src/components/registration-cta.tsx`
  - Verify: Browser assertions: landing page shows '30 May to 1 June' and 'Peacehaven'. Register page loads without countdown gate. Registration form steps are navigable. Invite URL loads team info. Mobile viewport renders without horizontal scroll or broken layout.

## Files Likely Touched

- public/placeholder.svg
- package.json
- src/components/time-restriction.tsx
- src/components/registration-cta.tsx
- src/app/(landing)/page.tsx
- src/app/(everywhere-else)/register/page.tsx
- src/app/(everywhere-else)/invite/[code]/page.tsx
- src/components/multi-step-registration-form.tsx
- src/components/character-selection-screen.tsx
