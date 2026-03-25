# Domain Pitfalls

**Domain:** Camp registration website refresh (brand update, Next.js upgrade, animation polish)
**Researched:** 2026-03-25

## Critical Pitfalls

Mistakes that cause rewrites, broken production deployments, or missed deadlines.

### Pitfall 1: 89 Hardcoded Color Values Scattered Across 13 Files

**What goes wrong:** The codebase uses arbitrary Tailwind color values (`text-[#bababa]`, `bg-[#1a1a1a]`, etc.) in 89 places across 13 files instead of theme tokens. A brand refresh requires finding and replacing every single one. Missing even one produces a jarring visual inconsistency that is hard to spot in testing.

**Why it happens:** The original build used Tailwind's arbitrary value syntax (`[#hex]`) for quick iteration instead of defining semantic color tokens in the theme.

**Consequences:** Brand refresh takes 3-5x longer than expected. Missed instances create a patchwork of old and new brand colors. Regression is nearly guaranteed without systematic search-and-replace.

**Prevention:**
1. Before touching any component, grep for all `[#` arbitrary color values and catalog them
2. Define new brand colors as CSS custom properties in `globals.css` (e.g., `--brand-text`, `--brand-surface`, `--brand-accent`)
3. Map them to Tailwind theme tokens via `@theme inline` block
4. Do a systematic find-and-replace from hardcoded values to token classes
5. Verify with a full visual walkthrough of every page and modal state

**Detection:** Search for `bg-[#`, `text-[#`, `border-[#` patterns. If count > 0 after brand phase, the job is incomplete.

**Phase:** Must be addressed first in the brand/theme phase, before any component-level work.

### Pitfall 2: Dual Root Layouts Mean Brand Changes Applied Twice (or Missed Once)

**What goes wrong:** The app uses two separate root layouts -- `(landing)/layout.tsx` and `(everywhere-else)/layout.tsx` -- each with their own `<html>` and `<body>` tags. Font imports, metadata, analytics scripts, and global styling must be updated in both. It is extremely common to update one layout and forget the other, causing the landing page to look correct while registration pages have the old brand (or vice versa).

**Why it happens:** Next.js route groups with separate root layouts are architecturally correct but create a maintenance burden for cross-cutting concerns like fonts and meta tags.

**Consequences:** One set of pages has old branding. Often not caught until someone navigates between the two route groups in production.

**Prevention:**
1. Create a checklist of every change made to one layout, then mirror it in the other
2. Consider extracting shared layout logic (font declarations, metadata, analytics) into a shared module imported by both
3. Test by navigating from landing (`/`) to register (`/register`) and back -- visually verify both carry the new brand

**Detection:** Diff both layout files side-by-side after brand changes. Any font, color, or metadata mismatch is a bug.

**Phase:** Brand/theme phase. Address at the start, not the end.

### Pitfall 3: Next.js Upgrade May Target 16, Which Breaks All Route Handlers

**What goes wrong:** The PROJECT.md says "Upgrade Next.js to latest stable version." The current version is 15.3.1. Next.js 16 (released October 2025) removes synchronous access to `cookies()`, `headers()`, `params`, and `searchParams` -- all must be `await`ed. The codebase currently has zero `await` calls on these APIs. Every route handler and dynamic page component will break.

**Why it happens:** Next.js 15 introduced async request APIs with a temporary synchronous compatibility layer. Next.js 16 removes that compatibility layer entirely.

**Consequences:** Build failures or runtime errors across all API routes and dynamic pages. The `[code]` invite page uses `params` which becomes a Promise. Route handlers using `cookies()` or `headers()` break. On a tight timeline, this can consume an entire day of debugging.

**Prevention:**
1. Decide upfront: stay on Next.js 15.x (latest patch) or go to 16. Given the tight timeline, staying on 15.x latest is safer.
2. If going to 16, run the official codemod: `npx @next/codemod@latest upgrade`
3. Audit every file in `src/app/api/` and every `page.tsx` with dynamic params for async API usage
4. The invite page `src/app/(everywhere-else)/invite/[code]/page.tsx` is the most at-risk file (uses `params.code`)

**Detection:** After upgrade, run `next build`. Any "Dynamic API was called synchronously" errors indicate missed migrations.

**Phase:** Must be the FIRST task in the upgrade phase. Do not mix with brand or animation work.

### Pitfall 4: `font-rumble` Used 30+ Times -- Font Swap Breaks Layout if Metrics Differ

**What goes wrong:** The custom display font "Rumble Brave" is referenced via `font-rumble` class in 30+ places across components. If the new brand font has different metrics (x-height, cap height, character width), every heading and display text element will shift position, break overflow boundaries, or misalign with adjacent elements.

**Why it happens:** Display fonts have wildly different metrics. A font that looks similar in isolation can have 20-30% different character widths, which accumulates across headings and labels.

**Consequences:** Buttons overflow, headings wrap unexpectedly, countdown timer digits misalign, modal titles clip. Each instance needs individual adjustment.

**Prevention:**
1. Test the new brand font in a single component first (e.g., the countdown timer) before applying globally
2. Compare metrics between old and new font using a font metrics comparison tool
3. If metrics differ significantly, plan for padding/sizing adjustments in every `font-rumble` usage
4. Consider using `size-adjust` in the `@font-face` declaration to normalize metrics

**Detection:** After font swap, visually inspect: countdown timer, registration page headings, modal titles, team invite dialog, hero details card. These are the densest `font-rumble` areas.

**Phase:** Brand/theme phase. Do font swap early, then fix layout issues as they surface.

## Moderate Pitfalls

### Pitfall 5: Framer Motion Still on `framer-motion` Package (Deprecated)

**What goes wrong:** The project imports from `"framer-motion"` (8 files). The package was renamed to `motion` in 2025. While `framer-motion` still works, it is no longer actively developed. Mixing the old import with any new code using `motion/react` causes duplicate bundles and potential version conflicts.

**Prevention:**
1. If upgrading, change all imports from `"framer-motion"` to `"motion/react"` in a single pass
2. Update `package.json`: remove `framer-motion`, add `motion`
3. For RSC-compatible components, use `"motion/react-client"` instead
4. This is a low-risk, high-value change -- the API is identical, only the import path changes

**Detection:** Grep for `from "framer-motion"`. If any remain after migration, you have split imports.

**Phase:** Upgrade phase, can be done as a quick find-and-replace.

### Pitfall 6: AnimatePresence Exit Animations Break with React 19 Strict Mode

**What goes wrong:** `AnimatePresence` is used in 4 components (register page, invite page, loading overlay, character selection). React 19 strict mode double-renders in development, which can cause exit animations to fire prematurely or not at all. Components appear to "flash" or skip their exit transition.

**Prevention:**
1. Do not debug animation "bugs" in strict mode -- test in production build (`next build && next start`)
2. Ensure every child of `AnimatePresence` has a stable, unique `key` prop
3. Use `mode="wait"` on `AnimatePresence` if transitions should be sequential (old exits before new enters)
4. Avoid `mode="sync"` for modal/dialog transitions -- it causes content to overlap during transition

**Detection:** If animations look broken in `next dev` but work in `next build`, it is a strict mode artifact, not a real bug.

**Phase:** Animation polish phase. Be aware of this before spending time debugging phantom issues.

### Pitfall 7: Registration Date Hardcoded in Multiple Places with Different Values

**What goes wrong:** The time-gating logic has dates hardcoded in at least two places with DIFFERENT values: `TimeRestriction` component uses May 11, 2024 (past), and the landing page uses May 11, 2025. Updating for 2026 requires finding every hardcoded date. Missing one means registration either opens too early (no time gate) or never opens (future date with wrong year).

**Prevention:**
1. Grep for `new Date("` and `new Date(2` across all files
2. Define the registration open date as a single constant in `src/lib/constants.ts`
3. Import it everywhere instead of hardcoding
4. Test both states: before and after the open date

**Detection:** Search for `2024`, `2025` year strings in source files. Any remaining old year references are potential bugs.

**Phase:** Copy/dates update phase. Consolidate dates into constants before updating values.

### Pitfall 8: `nanoid` Missing from Dependencies -- Team Invites Broken on Fresh Deploy

**What goes wrong:** `nanoid` is imported in `src/app/api/team-invite/route.ts` but is NOT in `package.json`. If you do a fresh `npm install` (which happens on every deployment), the build fails or team invite generation throws a runtime error.

**Prevention:**
1. Run `npm install nanoid` before any other work
2. Alternatively, replace with `crypto.randomUUID()` which requires zero dependencies
3. Test the team invite flow end-to-end after any dependency changes

**Detection:** Run `npm ls nanoid`. If it shows "missing," the dependency is not declared.

**Phase:** Address immediately in setup/upgrade phase. This is a pre-existing bug.

### Pitfall 9: Tailwind v4 Custom Team Colors May Break with Theme Changes

**What goes wrong:** Team colors (`bg-team-01` through `bg-team-21`) are defined in constants and likely referenced as dynamic Tailwind classes. Tailwind v4 uses CSS-first configuration; if these custom colors are not properly defined in the `@theme` block, they will silently fail to generate. The classes will exist in the HTML but produce no visual output.

**Prevention:**
1. Verify all 21 team color classes are defined in the theme configuration
2. After any theme changes, visually inspect the registration page to confirm all 21 team cards have their correct colors
3. Remember that Tailwind v4 does NOT scan `.ts` constant files for class names by default -- dynamic class construction (string interpolation like `bg-team-${id}`) will not work. Classes must appear as complete strings somewhere in the source.

**Detection:** Inspect a team card in browser DevTools. If the `bg-team-XX` class exists but has no CSS rule, the class was purged or not generated.

**Phase:** Brand/theme phase. Verify after any theme token changes.

### Pitfall 10: `images.domains` Config is Deprecated -- Breaks on Next.js 16

**What goes wrong:** `next.config.ts` uses `images: { domains: ['ythwknd.ymfgakl.com'] }` which is deprecated in Next.js 15 and removed in Next.js 16. Images from external domains will fail to load.

**Prevention:**
1. Replace `domains` with `remotePatterns`:
   ```ts
   images: {
     remotePatterns: [{ protocol: 'https', hostname: 'ythwknd.ymfgakl.com' }],
   }
   ```
2. This is a one-line fix but easy to miss

**Detection:** Deprecation warning in `next dev` console output. Hard error on Next.js 16 build.

**Phase:** Upgrade phase. Fix alongside the Next.js version bump.

## Minor Pitfalls

### Pitfall 11: 1,771-Line Registration Form is a Refactor Trap

**What goes wrong:** The multi-step registration form is 1,771 lines with 15+ useState hooks. On a tight timeline, it is tempting to "clean it up while we're in there." Any refactoring of this file risks breaking the registration flow, which is the core product functionality.

**Prevention:**
1. Do NOT refactor the registration form during the refresh
2. Limit changes to: copy updates, color/font class swaps, animation tweaks
3. If a change requires understanding the step navigation logic, test ALL paths: YM member flow, non-YM member flow, back navigation at every step
4. The form has zero test coverage -- every change is manual QA

**Detection:** If a diff of `multi-step-registration-form.tsx` shows structural changes (moved functions, renamed state, reorganized JSX), scope has crept.

**Phase:** All phases. Keep changes minimal and cosmetic only.

### Pitfall 12: Google Sheets Sync is Silent-Fail -- May Be Broken Without Anyone Knowing

**What goes wrong:** The sheets-sync endpoint is fire-and-forget. If the Google service account credentials have expired, the spreadsheet was deleted, or the API quota is exceeded, registrations still succeed but no data appears in Google Sheets. After a deployment, the admin may not notice data is missing until they check the spreadsheet days later.

**Prevention:**
1. After deployment, register a test entry and immediately verify it appears in Google Sheets
2. Check that `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable is still valid for the new deployment
3. Do not change the sheets-sync code during the refresh unless necessary

**Detection:** Register one test user. Check Google Sheets within 60 seconds. If the row is missing, investigate the sheets-sync endpoint.

**Phase:** Post-deployment verification. Not a code change -- an operational check.

### Pitfall 13: CSS Custom Properties Use oklch() -- Not All Browsers Render Identically

**What goes wrong:** The theme in `globals.css` uses `oklch()` color values. While browser support is now broad, slight rendering differences between Chrome/Safari/Firefox can make the brand colors appear subtly different. On a brand refresh where exact color fidelity matters, this can cause stakeholder feedback like "the colors look wrong on my phone."

**Prevention:**
1. Test the new brand colors on Chrome, Safari, and at least one mobile browser
2. If exact fidelity is critical, provide fallback hex values using `@supports` or use hex values directly
3. oklch is fine for most cases -- just be aware that perceptual color spaces render slightly differently across engines

**Detection:** Visual comparison across browsers. Only matters if brand guidelines specify exact hex values.

**Phase:** Brand/theme phase. Low priority unless stakeholders are color-sensitive.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Next.js Upgrade | Async API breakage if targeting v16 (Pitfall 3) | Stay on 15.x latest OR allocate a full day for async migration |
| Next.js Upgrade | Deprecated `images.domains` config (Pitfall 10) | One-line fix, do it alongside version bump |
| Next.js Upgrade | Missing `nanoid` dependency (Pitfall 8) | Install before anything else |
| Brand/Theme | 89 hardcoded color values (Pitfall 1) | Systematic grep-and-replace with theme tokens |
| Brand/Theme | Dual root layouts (Pitfall 2) | Mirror every change in both layout files |
| Brand/Theme | Font metrics mismatch (Pitfall 4) | Test font swap in isolation first |
| Brand/Theme | Team color classes (Pitfall 9) | Verify all 21 colors render after theme changes |
| Animation Polish | framer-motion rename (Pitfall 5) | Import path find-and-replace |
| Animation Polish | React 19 strict mode false alarms (Pitfall 6) | Test in production build, not dev |
| Copy/Dates | Hardcoded dates in multiple places (Pitfall 7) | Consolidate into single constant |
| All Phases | Registration form refactor trap (Pitfall 11) | Cosmetic changes only, no structural edits |
| Post-Deploy | Google Sheets silent failure (Pitfall 12) | Manual verification after deploy |

## Sources

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15) - Official upgrade documentation
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Async API removal details
- [Next.js Security Update December 2025](https://nextjs.org/blog/security-update-2025-12-11) - CVE patches for 15.x
- [Tailwind v4 Migration Issues Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/16517) - Community-reported upgrade problems
- [Tailwind v4 Migration Guide](https://medium.com/better-dev-nextjs-react/tailwind-v4-migration-from-javascript-config-to-css-first-in-2025-ff3f59b215ca) - CSS-first config migration
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) - framer-motion to motion migration
- [Motion Performance Tips](https://tillitsdone.com/blogs/framer-motion-performance-tips/) - Animation performance best practices
- [Framer Motion 12 vs React Spring 10](https://hookedonui.com/animating-react-uis-in-2025-framer-motion-12-vs-react-spring-10/) - Animation library comparison and pitfalls

---

*Pitfalls research: 2026-03-25*
