---
estimated_steps: 11
estimated_files: 4
skills_used: []
---

# T01: Update metadata across both root layouts, manifest.json, and navbar for 2026

Both root layouts share identical metadata objects with 'YTHWKND 2025' in title (5 refs each), description (3 refs each), keywords (1 ref each), and siteName (1 ref each). These must be updated in lockstep. Also update manifest.json and navbar alt text. The 2026 theme stays as 'The Multiverse of Mystery' (no new theme confirmed), but all year references change from 2025 to 2026.

Steps:
1. In `src/app/(landing)/layout.tsx`, replace all occurrences of '2025' with '2026' in the metadata object (title, keywords, openGraph title/siteName/alt, twitter title). There are 5 title refs, 1 keyword ref, 1 siteName ref = ~7 replacements.
2. Copy the exact metadata object to `src/app/(everywhere-else)/layout.tsx` to ensure lockstep. The metadata objects must be structurally identical — the layouts differ only in body content.
3. Update `public/manifest.json` name field from 'YTHWKND 2025' to 'YTHWKND 2026'.
4. Update `src/components/navbar.tsx` alt text from 'Logo for YTHWKND 2025' to 'Logo for YTHWKND 2026'.
5. Run `bun run build` to confirm all routes compile.

Constraints:
- Do NOT change the description text or theme name — only the year '2025' → '2026'
- Both layouts MUST have identical metadata — copy one to the other, don't edit independently
- The format-date.ts comment with '2025' is just an example format string, not content — leave it alone

## Inputs

- ``src/app/(landing)/layout.tsx` — current layout with 2025 metadata (7 year references in metadata object)`
- ``src/app/(everywhere-else)/layout.tsx` — current layout with 2025 metadata (must match landing layout exactly)`
- ``public/manifest.json` — current manifest with 'YTHWKND 2025' in name field`
- ``src/components/navbar.tsx` — current navbar with 'Logo for YTHWKND 2025' alt text`

## Expected Output

- ``src/app/(landing)/layout.tsx` — metadata updated: all 'YTHWKND 2025' → 'YTHWKND 2026', keywords '2025' → '2026'`
- ``src/app/(everywhere-else)/layout.tsx` — metadata updated identically to landing layout`
- ``public/manifest.json` — name field updated to 'YTHWKND 2026: The Multiverse of Mystery'`
- ``src/components/navbar.tsx` — alt text updated to 'Logo for YTHWKND 2026'`

## Verification

rg '2025' --glob '*.tsx' --glob '*.json' src/app/ src/components/navbar.tsx public/manifest.json && echo 'FAIL: 2025 still found' || echo 'PASS: no 2025 references in layouts/manifest/navbar'
