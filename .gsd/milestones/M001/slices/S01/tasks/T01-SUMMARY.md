---
id: T01
parent: S01
milestone: M001
key_files:
  - package.json
  - bun.lock
  - next.config.ts
key_decisions:
  - Targeted Next.js 16.2.1 (latest stable) instead of 16.0.x for security patches
  - Migrated images.domains to images.remotePatterns for forward compatibility
  - Added proper TypeScript NextConfig type import to next.config.ts
duration: ""
verification_result: passed
completed_at: 2026-03-25T06:39:55.182Z
blocker_discovered: false
---

# T01: Upgrade Next.js from 15.3.1 to 16.2.1, remove --turbopack flag, and migrate images.domains to remotePatterns

**Upgrade Next.js from 15.3.1 to 16.2.1, remove --turbopack flag, and migrate images.domains to remotePatterns**

## What Happened

Upgraded all Next.js ecosystem packages from v15 to v16:
- `next`: 15.3.1 → 16.2.1
- `@next/third-parties`: 15.3.2 → 16.2.1
- `react`: 19.0.0 → 19.2.4
- `react-dom`: 19.0.0 → 19.2.4
- `@types/react`: 19.x → 19.2.14
- `@types/react-dom`: 19.x → 19.2.3

Cleaned up `package.json` scripts by removing the `--turbopack` flag from the dev script since Turbopack is now the default bundler in Next.js 16.

Also migrated `next.config.ts` from the deprecated `images.domains` array to the recommended `images.remotePatterns` format, and added proper TypeScript typing with `import type { NextConfig } from 'next'` instead of the JSDoc comment.

Build completed successfully with Turbopack — all 12 routes (3 static, 9 dynamic) compiled and generated without errors.

## Verification

1. `grep '"next"' package.json` → confirmed `"next": "^16.2.1"` (16.x version).
2. `bun run build` → exited with code 0, compiled in 7.0s with Turbopack, all 12 routes generated successfully.
3. Verified `--turbopack` flag removed from dev script.
4. Verified `images.domains` replaced with `images.remotePatterns`.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep '"next"' package.json` | 0 | ✅ pass | 50ms |
| 2 | `bun run build` | 0 | ✅ pass | 17400ms |


## Deviations

Migrated `next.config.ts` from `images.domains` to `images.remotePatterns` and added proper TypeScript imports — not in the original task plan but necessary for Next.js 16 best practices (domains is deprecated). Also upgraded to 16.2.1 (latest stable) rather than 16.0.x since 16.2.1 includes critical security patches (CVE-2025-55183, CVE-2025-55184).

## Known Issues

None.

## Files Created/Modified

- `package.json`
- `bun.lock`
- `next.config.ts`
