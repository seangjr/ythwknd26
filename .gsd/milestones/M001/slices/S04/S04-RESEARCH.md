# S04 Research: Verification

**Slice:** S04 — Verification
**Milestone:** M001 — YTH WKND 2026 Camp Registration Site Refresh
**Depth:** Light research — this is a verification/QA slice with no new code patterns. The work is straightforward: run the app, exercise all flows, fix anything broken.

## Summary

S04 is the final quality gate before the site goes live. The build is clean (`bun run build` exits 0, TypeScript passes `tsc --noEmit` with zero errors, no deprecation warnings). The codebase is in good shape after S01–S03, but **manual verification against a running dev server with Supabase connected** is required because:

1. The registration form is 1,802 lines with zero test coverage
2. All 7 `getHeroImagePath()` call sites return `/placeholder.svg` — and **that file doesn't exist** in `public/`
3. `nanoid` is imported in `src/app/api/team-invite/route.ts` but not in `package.json` (works via transitive dep but fragile for fresh installs)
4. No `.env.local` exists in the worktree — Supabase and Google Sheets env vars are needed to test live flows

## Requirements This Slice Owns

| Requirement | Description | Verification Approach |
|---|---|---|
| VERF-01 | Full registration flow e2e (select party → choose class → fill form → submit) | Browser test against running dev server with Supabase |
| VERF-02 | Team invite flow e2e (generate code, share link, register via invite) | Browser test: generate invite on `/register`, open invite URL, complete registration |
| VERF-03 | Google Sheets sync verified after registration | Check env vars present, submit registration, verify Sheets row appears |
| VERF-04 | Cross-browser testing (Chrome, Safari, mobile) | Visual verification on Chrome + Safari + mobile viewport |

## Recommendation

This slice should be structured as two tasks:

**Task 1: Fix pre-verification blockers (code changes)**
Fix issues that would cause verification to fail before it starts:
- Add `/public/placeholder.svg` — 7 component files reference it for class images and it's missing. Without it, character-selection and team views will show broken images.
- Add `nanoid` to `package.json` as an explicit dependency — currently resolves via transitive dependency, but this will break on a clean `bun install` if the transitive chain changes.
- Verify `.env.local` has the required env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEET_ID`), or confirm they're set in the deployment environment.

**Task 2: End-to-end verification (browser testing)**
Start the dev server and exercise every flow:
1. **Landing page** — loads as RSC (no JS flash), shows correct dates/venue/pricing, countdown timer works, Register button links to `/register`
2. **Registration flow** — select a party from the 21-party grid → choose a class from 5 options → fill multi-step form → submit → verify Supabase row created → verify Google Sheets sync (or skip message if not configured)
3. **Invite flow** — from register page click Share for a party → generate invite code → open `/invite/{code}` → verify team info loads → select class → register through invite → verify submission
4. **Cross-browser** — repeat key visual checks on Safari and mobile viewport (at minimum, verify landing page, register grid, and registration modal render correctly)
5. **Edge cases** — try registering with an already-taken class, try using an expired/invalid invite code, verify error states render properly

## Implementation Landscape

### File Inventory

No major code changes expected. Files that may need minor fixes:

| File | Status | Notes |
|---|---|---|
| `public/placeholder.svg` | **MISSING** | Must be created — simple SVG placeholder for class images |
| `package.json` | Needs `nanoid` added | `import { nanoid } from "nanoid"` in team-invite route, not in package.json |
| `src/app/api/team-invite/route.ts` | Working but fragile | Uses `nanoid` from transitive dep |
| All 7 `getHeroImagePath` call sites | Return `/placeholder.svg` | Will show broken image until placeholder.svg exists |

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
NEXT_PUBLIC_BASE_URL=*** (used for invite URLs)
GOOGLE_SERVICE_ACCOUNT_KEY=*** (optional — sync skipped gracefully if missing)
GOOGLE_SHEET_ID=*** (optional — sync skipped gracefully if missing)
```

The Google Sheets env vars are optional — the `sheets-sync` route gracefully returns `{ success: true, sheetsSyncSkipped: true }` if they're not configured. Supabase env vars are **mandatory** for any registration to work.

### Known State After S01–S03

**Working:**
- Build clean, zero TypeScript errors, zero deprecation warnings
- All `framer-motion` → `motion/react` migration complete (zero residual imports)
- CLASSES (5) and PARTIES (21) correctly exported from constants.ts
- Landing page is RSC with `force-dynamic`, client islands for CTA/countdown
- Both layouts have matching metadata (YTHWKND 2026, Multiverse of Mystery)
- Font: Jeju Hallasan loaded via `--font-rumble` CSS variable
- Animation variants in `src/lib/animations.ts`, motion wrappers in `src/components/motion/`
- No hardcoded hex colors in TSX/TS files
- `oklch()` used in globals.css for Shadcn theme variables
- `next.config.ts` uses `remotePatterns` (not deprecated `domains`)

**Known cosmetic issues that are intentional (per S03 decisions):**
- `--font-rumble` CSS var name references old font name → intentionally kept (72 usages)
- File names `hero-details.tsx`, `hero-selection-grid.tsx` → kept to avoid import churn
- API param names `heroId` and DB column `hero_id` → intentionally unchanged
- `preselectedHero` prop name in RegistrationModal → internal, not user-facing

**Registration open date:** Set to May 10, 2026, 12:30 PM in both `registration-cta.tsx` and `time-restriction.tsx`. The TimeRestriction component blocks access to `/register` and `/invite/*` until this date. For testing purposes, this date needs to be temporarily bypassed or the tester must adjust system clock.

### Verification Approach

This is a **manual browser testing** slice. There are zero existing tests in the codebase. The verification must be done against a running dev server (`bun run dev`).

The primary tool is the browser automation tooling (browser_navigate, browser_click, browser_type, etc.) against `http://localhost:3000`. The TimeRestriction component will block access to `/register` unless the current date is past May 10, 2026 — the executor will need to either:
1. Temporarily modify the date check in `time-restriction.tsx` and `registration-cta.tsx` to allow testing
2. Or use browser date spoofing

Option 1 is simpler and more reliable. The modification is trivial: change the year from 2026 to 2024 in the two `new Date()` calls, test, then revert.

### Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Missing placeholder.svg causes broken images everywhere | HIGH | Create a simple SVG in Task 1 |
| nanoid not in package.json breaks fresh deploy | MEDIUM | Add explicit dependency in Task 1 |
| TimeRestriction blocks register/invite pages | HIGH | Temporarily bypass date for testing |
| No .env.local → Supabase calls fail | HIGH | Verify env vars are available or use secure_env_collect |
| Google Sheets credentials may be invalid/expired | LOW | Route handles this gracefully (sheetsSyncSkipped) |
| oklch cross-browser rendering differences | LOW | Minor color variance, not blocking |

## Don't Hand-Roll

- **Placeholder SVG** — use a minimal inline SVG (gray box with text). Don't pull in a library for this.
- **nanoid** — just `bun add nanoid`, don't replace with `crypto.randomUUID()` (the invite codes need to be URL-safe short strings, not full UUIDs).

## Sources

All findings from direct codebase analysis. No external research needed for this verification slice.
