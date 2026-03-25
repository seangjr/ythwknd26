---
estimated_steps: 23
estimated_files: 6
skills_used: []
---

# T01: Update constants, landing page content, and heading font for 2026

This task applies the confirmed 2026 event details from the user override (D004) and replaces the heading font per D005. Three distinct changes:

**1. Constants rewrite (`src/lib/constants.ts`):**
- Replace `HEROES` array with `CLASSES` array containing 5 classes: Warrior, Archer, Scout, Guardian, Scholar. Each with id, name, description. No `icon`, `perk` fields. Example: `{ id: "warrior", name: "Warrior", description: "Frontline Breaker. Smashes through obstacles, absorbs the hardest hits, and charges first when the mission turns brutal." }`
- Replace `TEAMS` array with `PARTIES` array. Keep same 21 entries with same IDs and colors, but change `name` to generic "Party 001", "Party 002" etc., and `code` from "U001" to "PARTY 001" etc.
- Remove `HERO_IMAGE_PATHS` array entirely (105 entries — classes don't have per-party unique images)
- Update `CG_LEADERS`: add "Daniel Loo", "Jenisha Kong", "NOT SURE"; remove "Clarice Low", "May Jee"; keep alphabetical order; update "Christopher & Oscar" to "Christopher + Oscar" and "Yae-Ber Neo" to "Yae-ber NEO"

**2. Landing page content (`src/app/(landing)/page.tsx`):**
- Change dates from "27 to 29 June" → "30 May to 1 June"
- Change venue from "Bayu Beach Resort\nPort Dickson" → "Peacehaven\nGenting Highlands"
- Replace 3-tier pricing array with 2-tier: `[{ price: "RM130", label1: "NEW", label2: "FRIENDS" }, { price: "RM160", label1: "YM", label2: "MEMBER" }]` — no `originalPrice`, no strikethrough
- Remove the "Must consist of one YM member and one new friend" disclaimer
- Remove the "**For non-Muslims only" disclaimer

**3. Heading font replacement:**
- Copy `JejuHallasan-Regular.ttf` from main repo `public/fonts/` into worktree `public/fonts/`
- In `src/styles/fonts.css`: change `font-family: "Rumble Brave"` to `font-family: "Jeju Hallasan"`, change `src: url("/fonts/rumble-brave.otf") format("opentype")` to `src: url("/fonts/JejuHallasan-Regular.ttf") format("truetype")`
- In `src/app/globals.css`: change `--font-rumble: "Rumble Brave"` to `--font-rumble: "Jeju Hallasan"` (keep the variable name `--font-rumble` for now to avoid breaking 72 class references — it just points to the new font)
- Update the `@layer base` block in `fonts.css` similarly

**Important constraints:**
- Do NOT rename the `font-rumble` CSS variable/Tailwind class — all 72 usages across the codebase reference it. Just change what font it points to.
- The `CONSTANTS` export name stays the same. Only `CONSTANTS.HEROES` → `CONSTANTS.CLASSES`, `CONSTANTS.TEAMS` → `CONSTANTS.PARTIES`.
- Keep the `CONSTANTS.SITE_TITLE`, `SITE_SUBTITLE`, `SITE_MAIN_TITLE`, `SITE_DESCRIPTION`, and `MOCK_AGES` unchanged.
- The `time-restriction.tsx` date is already correct (May 10, 2026) from S02 — verify but don't change unless wrong.

**Worktree symlink note from S02:** The Edit tool may have path resolution issues in worktree environments. If edits fail silently, fall back to `sed -i` as documented in S02 summary.

## Inputs

- `src/lib/constants.ts`
- `src/app/(landing)/page.tsx`
- `src/components/time-restriction.tsx`
- `src/styles/fonts.css`
- `src/app/globals.css`

## Expected Output

- `src/lib/constants.ts`
- `src/app/(landing)/page.tsx`
- `src/styles/fonts.css`
- `src/app/globals.css`
- `public/fonts/JejuHallasan-Regular.ttf`

## Verification

bun run build exits 0 && rg 'HEROES' src/lib/constants.ts returns 0 matches && rg 'CLASSES' src/lib/constants.ts returns matches && rg 'PARTIES' src/lib/constants.ts returns matches && rg 'HERO_IMAGE_PATHS' src/lib/constants.ts returns 0 matches && rg 'Rumble Brave' src/styles/fonts.css returns 0 matches && rg 'Jeju Hallasan' src/styles/fonts.css returns matches && rg 'Peacehaven' 'src/app/(landing)/page.tsx' returns matches && rg 'RM550\|RM300\|RM250' 'src/app/(landing)/page.tsx' returns 0 matches && test -f public/fonts/JejuHallasan-Regular.ttf
