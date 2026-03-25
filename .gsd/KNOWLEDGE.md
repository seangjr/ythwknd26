# Knowledge

## framer-motion → motion migration is a pure rename

The `motion` package is the official successor to `framer-motion`. Same API, same major version (12.x). The only change is the import path: `from "framer-motion"` → `from "motion/react"`. No component or prop changes needed. Sed replacement works perfectly across all files.

## Next.js 16 makes Turbopack the default bundler

In Next.js 16, Turbopack is the default — remove `--turbopack` flags from dev scripts. The `images.domains` config is deprecated in favor of `images.remotePatterns` (array of `{protocol, hostname}` objects). Simple configs with no custom webpack just work.

## Semantic color tokens for this codebase

The site uses only 3 distinct hardcoded hex colors:
- `#BABABA` → `--text-muted` (muted text, 69 occurrences) → Tailwind: `text-text-muted`, `border-text-muted`
- `#1A1A1A` → `--surface` (dark card/surface backgrounds, 19 occurrences) → Tailwind: `bg-surface`
- `#18181B` → same `--surface` token (visually indistinguishable from #1A1A1A, 1 occurrence)

Defined in `globals.css` under both `:root` and `.dark` blocks with Tailwind mappings in `@theme inline`. To rebrand for 2026 (S02), just change the token values.

## Case-insensitive sed needed for hex replacements

Some files use uppercase hex (#BABABA) and others lowercase (#bababa). Always use case-insensitive matching when replacing hex colors. The `sed -i '' 's/pattern/replacement/gI'` flag handles this on macOS.

## Worktree symlink causes Edit tool failures — use sed instead

The `.gsd/worktrees/M001` path is a symlink to `.gsd/projects/<hash>/worktrees/M001`. The Edit tool resolves the symlink source path while `rg`/`head` read from the real path, causing edits to appear to succeed but not persist. Use `sed -i ''` for reliable in-place edits in worktrees. This also affects lines with tab indentation — Read displays tabs as spaces, so the Edit tool's `oldText` won't match. `sed` handles both issues.

## format-date.ts has a 2025 example comment — leave it alone

`src/lib/format-date.ts` contains a comment `// Format: "May 6, 2025 at 4:24 PM"` which is an example format string, not event content. Grep checks for year references should exclude this file: `rg '2025' --glob '*.tsx' --glob '*.ts' src/ | grep -v format-date.ts`

## 2026 content locations for future updates

All year-sensitive content is in clearly identified locations:
- **Metadata (SEO/OG):** Both root layouts (`src/app/(landing)/layout.tsx`, `src/app/(everywhere-else)/layout.tsx`) — must stay in lockstep
- **Registration open date:** `src/app/(landing)/page.tsx` line ~11 (Date constructor) and line ~147 (display string)
- **Event dates:** `src/app/(landing)/page.tsx` line ~63 ("26 to 28 June")
- **Time restriction gate:** `src/components/time-restriction.tsx` line ~13 (Date constructor) and line ~41 (display string)
- **Age reference:** `src/components/multi-step-registration-form.tsx` line ~711 ("Age (as of 2026)")
- **Manifest:** `public/manifest.json` name field
- **Navbar:** `src/components/navbar.tsx` alt text

## RSC boundary: Date objects are not serializable

React Server Components cannot pass Date objects as props to client components. Pass ISO strings (`date.toISOString()`) and reconstruct the Date on the client side. This applies to any server→client prop boundary.

## Motion wrapper pattern for RSC pages

Server Components can't import `motion/react` directly. Create thin `"use client"` wrapper components (`MotionDiv`, `MotionSection`, `FadeIn`, `StaggerContainer`) in `src/components/motion/` that re-export motion elements. The server component page imports these wrappers instead. Animation variant objects (plain JS) live in `src/lib/animations.ts` without a "use client" directive since they're serializable data.

## Inline spring transitions for gesture props

When a motion element has both an entrance `transition` prop and gesture props (`whileHover`/`whileTap`), the gesture transition must be inlined inside the gesture prop: `whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}`. Using a shared `transition` prop on the element would override the entrance animation timing.

## --font-rumble CSS variable preserved despite font change

The CSS variable `--font-rumble` now points to "Jeju Hallasan" instead of "Rumble Brave". The variable name was kept unchanged because 72 class references use `font-rumble` across the codebase. Renaming would be churn with no functional benefit.

## Time gate bypass/revert pattern for testing

To test registration and invite pages before the gate date (May 10, 2026), change the year in `new Date(2026, 4, 10, 12, 30, 0)` to `new Date(2024, 4, 10, 12, 30, 0)` in three files:
- `src/components/time-restriction.tsx` (gate constructor + display string)
- `src/app/(landing)/page.tsx` (server-side date for RegistrationCTA)
- `src/components/registration-cta.tsx` (display string)

Change the year rather than removing conditionals — preserves component structure and makes revert trivial (just change back to 2026).

## Placeholder SVG needed for class image fallbacks

`/public/placeholder.svg` is required — seven components reference `getHeroImagePath()` which falls back to `/placeholder.svg`. Without it, class selection screens show broken images. The file is a minimal 200x200 gray rounded rect with centered "Class" text.

## nanoid is used in team-invite but was transitive-only

`src/app/api/team-invite/route.ts` imports `nanoid` directly, but it was only available as a transitive dependency. Added as explicit dep (`nanoid@^5.1.7`) in S04/T01 to prevent breakage on fresh installs.

## Pre-existing TypeScript errors from untyped Supabase generics

The `next build` fails with 23 TypeScript errors before any M002 changes. Root cause: Supabase client returns untyped generics (type `never`) in several route files, especially `invite/[code]/page.tsx` (`Property 'line_number' does not exist on type 'never'`). These errors will resolve naturally as S02 migrates each route from Supabase to Neon with properly typed queries. To verify new code compiles cleanly, use `npx tsc --noEmit 2>&1 | grep <your-file>` instead of relying on full build exit code.

## Neon client pattern: getClient() lazy singleton

`src/lib/db.ts` provides `getClient()` which returns a lazy singleton `neon()` tagged-template function. All API routes should import from `@/lib/db` and use `const sql = getClient()` followed by tagged template queries: `sql\`SELECT * FROM teams WHERE id = ${id}\``. The client is HTTP-based (no persistent connection pool), optimized for serverless. Error handling: wrap queries in try/catch with `handleDatabaseError(error)` which maps Postgres error codes to HTTP status codes.

## Neon migration: Supabase → Neon query translation patterns

When migrating Supabase fluent API to Neon tagged-template SQL:
- `.from('table').select('*').eq('col', val)` → `` sql`SELECT * FROM table WHERE col = ${val}` ``
- `.single()` → `rows[0]` with `rows.length === 0` check (no PGRST116 error in Neon)
- `{ data, error }` destructuring → direct array result (`const rows = await sql\`...\``)
- `.insert({...})` → `` sql`INSERT INTO table (...) VALUES (...)` ``
- `.update({...}).eq()` → `` sql`UPDATE table SET ... WHERE ... RETURNING *` ``
- Error handling: wrap in try/catch with `handleDatabaseError(error)` from db.ts

## team-invite GET uses a JOIN instead of two queries

The original Supabase code did two sequential queries: first lookup invite by code, then lookup team by team_id. The Neon version uses a single `SELECT i.*, t.name as team_name FROM team_invites i JOIN teams t ON i.team_id = t.id WHERE i.code = ${code}` query. This is more efficient and avoids a race condition.
