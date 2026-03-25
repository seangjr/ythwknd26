---
estimated_steps: 2
estimated_files: 3
skills_used: []
---

# T01: Upgrade Next.js 15.3 to 16.x and fix breaking changes

Upgrade Next.js and its companion packages from 15.x to 16.x. This includes upgrading `next`, `@next/third-parties`, and React packages. Clean up package.json scripts since Turbopack is now the default bundler in Next.js 16 (remove explicit `--turbopack` flags). Verify the build compiles successfully.

The project doesn't use `cookies()` or `headers()` directly, and the only `params` usage is via `useParams()` client hook, so async API enforcement should not be a concern. The `next.config.ts` is simple (images config only) with no custom webpack config, so Turbopack default should work fine.

## Inputs

- ``package.json` — current dependencies with next@15.3.1 and @next/third-parties@15.3.2`

## Expected Output

- ``package.json` — updated with next@16.x, @next/third-parties@16.x, react@latest, react-dom@latest`
- ``bun.lock` — regenerated lockfile`

## Verification

Run `bun run build` — must exit with code 0 and produce a successful build. Run `grep '"next"' package.json` to confirm 16.x version.
