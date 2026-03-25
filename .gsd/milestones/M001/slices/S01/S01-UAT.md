# S01: Upgrade and Foundation — UAT

**Milestone:** M001
**Written:** 2026-03-25T06:46:55.734Z

# S01: Upgrade and Foundation — UAT

**Milestone:** M001
**Written:** 2026-03-25

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: This slice is a package upgrade and code-level token replacement with no new UI behavior — verification is confirming build output, import paths, and token usage through static analysis

## Preconditions

- Repository checked out at the M001 worktree
- `bun` package manager available
- No running dev server needed (build-only verification)

## Smoke Test

Run `bun run build` — should exit 0 with Next.js 16.2.1 compiling all 12 routes via Turbopack

## Test Cases

### 1. Next.js 16.x is installed and builds successfully

1. Run `grep '"next"' package.json`
2. **Expected:** Output contains `"next": "^16.2.1"` (or higher 16.x)
3. Run `bun run build`
4. **Expected:** Exit code 0, output shows "Next.js 16.x.x (Turbopack)", all 12 routes generated

### 2. motion package replaces framer-motion

1. Run `grep '"motion"' package.json`
2. **Expected:** `"motion"` appears as a dependency
3. Run `rg 'framer-motion' --glob '*.tsx' --glob '*.ts' src/`
4. **Expected:** Zero matches (exit code 1) — no remaining framer-motion imports
5. Run `rg 'from "motion/react"' --glob '*.tsx' --glob '*.ts' src/`
6. **Expected:** 8 matches across page and component files

### 3. All hardcoded hex colors replaced with semantic tokens

1. Run `rg '#[0-9a-fA-F]{6}' --glob '*.tsx' --glob '*.ts' src/`
2. **Expected:** Zero matches (exit code 1) — no remaining hardcoded hex values
3. Run `rg 'text-text-muted' --glob '*.tsx' src/`
4. **Expected:** Multiple matches across layout and component files
5. Run `rg 'bg-surface' --glob '*.tsx' src/`
6. **Expected:** Multiple matches in component files

### 4. Semantic tokens defined in globals.css

1. Run `rg -- '--text-muted' src/app/globals.css`
2. **Expected:** Token defined with value `#BABABA` in both `:root` and `.dark` blocks
3. Run `rg -- '--surface' src/app/globals.css`
4. **Expected:** Token defined with value `#1A1A1A` in both `:root` and `.dark` blocks
5. Run `rg -- '--color-text-muted' src/app/globals.css`
6. **Expected:** Tailwind theme mapping exists in `@theme inline` block

### 5. Turbopack flag removed from dev script

1. Run `grep 'turbopack' package.json`
2. **Expected:** Zero matches — `--turbopack` flag removed since it's the default in Next.js 16

## Edge Cases

### images.remotePatterns migration

1. Run `grep -A5 'remotePatterns' next.config.ts`
2. **Expected:** `remotePatterns` array with `{protocol, hostname}` objects replacing the old `domains` array

## Failure Signals

- `bun run build` fails or shows deprecation warnings
- Any `framer-motion` string found in source files
- Any 6-character hex color (e.g. `#BABABA`) found in .tsx/.ts source files
- Missing `--text-muted` or `--surface` custom properties in globals.css
- TypeScript errors related to motion imports

## Not Proven By This UAT

- Visual rendering correctness (no runtime/browser verification — deferred to S04)
- Animation behavior after motion migration (functional equivalence assumed by API compatibility)
- Color token visual appearance (tokens match original hex values by definition)
- Dev server hot reload behavior

## Notes for Tester

- The motion package is API-compatible with framer-motion at the same major version (12.x). If any animation breaks at runtime, it would be a motion package bug, not a migration issue.
- The semantic tokens use the exact same hex values as before — visual output should be pixel-identical. The value of this change is for the S02 brand refresh where token values can be updated in one place.
- Next.js 16.2.1 was chosen over 16.0.x for security patches. The build output may show slightly different route counts if API routes change in later slices.
