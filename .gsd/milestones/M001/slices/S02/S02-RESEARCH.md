# S02 Research: Brand Identity and Content

**Slice:** S02 — Brand Identity and Content
**Milestone:** M001 — YTH WKND 2026 Camp Registration Site Refresh
**Depth:** Targeted — known technology, known codebase, moderate scope
**Researched:** 2026-03-25
**Confidence:** HIGH

## Summary

S02 is a systematic content and branding update — replacing all 2025 event references with 2026 values, updating brand fonts/assets, and ensuring consistency across dual layouts and all pages. The codebase is well-structured for this: almost all event-specific content lives in `src/lib/constants.ts` and the two root layouts, with only a handful of hardcoded strings scattered elsewhere. The work decomposes naturally into: (1) font swap, (2) metadata/layout updates, (3) constants + landing page content, and (4) date references in time-gating components.

**Key constraint:** The user must provide 2026 event details (dates, venue, pricing, theme name, new hero names/classes if changed, new brand font file, and new masthead/logo SVGs). Without these, the slice can establish infrastructure (font loading, token names) but must use placeholder values. The research identifies every location that needs updating so the planner can scope tasks precisely.

## Requirements Targeted

| Requirement | Role | Status |
|---|---|---|
| BRND-02 | Primary — new brand fonts applied consistently | Active |
| BRND-03 | Primary — logo and brand assets updated | Active |
| BRND-04 | Primary — consistent brand identity across all pages | Active |
| CONT-01 | Primary — all copy updated for 2026 | Active |
| CONT-02 | Primary — hero images and team data updated | Active |

## Recommendation

Execute in four sequential tasks:

1. **Font swap** — Replace `rumble-brave.otf` with 2026 brand font, update `fonts.css` and `globals.css` `@theme` declaration. Test that all 72 `font-rumble` usages render correctly.
2. **Metadata and layouts** — Update both root layouts' metadata objects (title, description, keywords, OG tags, Twitter cards) to 2026 content. Update `manifest.json`. Both layouts must be updated in lockstep (pitfall from research).
3. **Constants and landing page content** — Update `SITE_TITLE`, `SITE_MAIN_TITLE`, `SITE_DESCRIPTION`, event dates, pricing in landing page, venue details. Update hero names/classes/perks if changed. Update CG_LEADERS list. Replace masthead SVGs and landing image if new assets provided.
4. **Date references and time-gating** — Update registration open date in `landing/page.tsx` (May 11 2025 → 2026 date), `time-restriction.tsx` (May 11 2024 → 2026 date), and `multi-step-registration-form.tsx` (line 711: "Age as of 2025" → "Age as of 2026").

## Implementation Landscape

### Content Inventory — Every Location That Needs Updating

#### 1. Event Title/Theme (8 locations)
| File | Line(s) | Current Value | What to Update |
|---|---|---|---|
| `src/lib/constants.ts` | 1-4 | `SITE_TITLE: "YTHWKND"`, `SITE_SUBTITLE: "AND THE"`, `SITE_MAIN_TITLE: "MULTIVERSE OF MYSTERY"`, `SITE_DESCRIPTION: "A HIGHSCHOOL EVENT BY @YMFGAKL"` | Theme title, subtitle — if 2026 theme changes |
| `src/app/(landing)/layout.tsx` | 8, 22, 25, 31, 39 | `"YTHWKND 2025: The Multiverse of Mystery"` (5 occurrences) | Year + theme name |
| `src/app/(everywhere-else)/layout.tsx` | 11, 24, 27, 33, 41 | Same 5 occurrences | Must match landing layout exactly |
| `public/manifest.json` | 2 | `"YTHWKND 2025: The Multiverse of Mystery"` | Year + theme name |

#### 2. Event Description/Storyline (6 locations)
| File | Line(s) | Current Value |
|---|---|---|
| `src/app/(landing)/layout.tsx` | 9, 23, 40 | `"When Eric Veed mysteriously vanishes..."` (3 occurrences) |
| `src/app/(everywhere-else)/layout.tsx` | 12, 25, 42 | Same 3 occurrences |
| `public/manifest.json` | 4 | Same description |

#### 3. Year References (10 locations)
| File | Line | Current | Target |
|---|---|---|---|
| `src/app/(landing)/layout.tsx` | 11 | `"2025"` in keywords | `"2026"` |
| `src/app/(everywhere-else)/layout.tsx` | 13 | `"2025"` in keywords | `"2026"` |
| `src/app/(landing)/page.tsx` | 11 | `new Date(2025, 4, 11, 12, 30, 0)` | 2026 registration open date |
| `src/app/(landing)/page.tsx` | 147 | `"Registration opens on May 11, 2025 at 12:30 PM"` | 2026 date string |
| `src/components/time-restriction.tsx` | 13 | `new Date(2024, 4, 11, 12, 30, 0)` | 2026 registration open date |
| `src/components/time-restriction.tsx` | 41 | `"May 11, 2024 at 12:30 PM"` | 2026 date string |
| `src/components/multi-step-registration-form.tsx` | 711 | `"Age (as of 2025)"` | `"Age (as of 2026)"` |
| `src/components/navbar.tsx` | 10 | `alt="Logo for YTHWKND 2025"` | `alt="Logo for YTHWKND 2026"` |

#### 4. Event Details — Dates, Venue, Pricing (in landing page only)
| File | Line | Current | What to Update |
|---|---|---|---|
| `src/app/(landing)/page.tsx` | 63 | `"27 to 29 June"` | 2026 event dates |
| `src/app/(landing)/page.tsx` | 65-66 | `"Bayu Beach Resort<br />Port Dickson"` | 2026 venue |
| `src/app/(landing)/page.tsx` | 79-81 | Pricing: RM550 double, RM300 YM, RM250 new friends | 2026 pricing |
| `src/app/(landing)/page.tsx` | 115 | `*Must consist of one YM member...` | Update if pricing model changes |

#### 5. Brand Font (10 files with `font-rumble` usage, 72 total occurrences)
| File | Count | Notes |
|---|---|---|
| `src/components/multi-step-registration-form.tsx` | 36 | ⚠️ Heaviest user — cosmetic only, just font class name |
| `src/app/(everywhere-else)/invite/[code]/page.tsx` | 9 | |
| `src/components/character-selection-screen.tsx` | 6 | |
| `src/app/(landing)/page.tsx` | 5 | |
| `src/components/countdown-timer.tsx` | 4 | |
| `src/components/team-invite-modal.tsx` | 4 | |
| `src/components/hero-details.tsx` | 4 | |
| `src/app/(everywhere-else)/register/page.tsx` | 3 | |
| `src/components/time-restriction.tsx` | 1 | |

**Font swap strategy:** If the new brand font has the same Tailwind class name (`font-rumble`), no component changes needed — just replace the `.otf` file and update `@font-face` in `fonts.css`. If the font name changes, update the `@font-face` declaration, the `--font-rumble` CSS custom property in both `fonts.css` and `globals.css`, and optionally rename the Tailwind utility class (though keeping `font-rumble` as an alias is simpler).

#### 6. Brand Assets (4 files)
| File | Current | What to Update |
|---|---|---|
| `public/fonts/rumble-brave.otf` | Rumble Brave font | 2026 brand font file |
| `public/assets/masthead.svg` | Landing page masthead (700x700 reference) | 2026 masthead |
| `public/assets/sm-masthead.svg` | Navbar masthead (250x100 reference) | 2026 navbar logo |
| `public/landing.png` | Landing hero image / OG image | 2026 landing image |
| `public/favicon.png` | Favicon | Update if brand identity changes |

#### 7. Team Colors — Phantom Classes
The `bg-team-01` through `bg-team-21` classes in `constants.ts` have **no CSS definitions anywhere** — no `globals.css` entries, no Tailwind config, no utility classes. They're referenced via dynamic className in the register page but never resolve to actual styles. This is a pre-existing issue (not a regression risk for S02). The `teamColor` prop is passed to `TeamInviteModal` but the rendering is **commented out** (line 133 in team-invite-modal.tsx). No action required for S02 — these can be cleaned up in a follow-up slice or left as-is.

#### 8. Constants Data (may or may not change)
| Data | Current | Notes |
|---|---|---|
| `HEROES` array | 5 heroes: Alex, Suzzy, Charlotte, Charlie, Kai | Update names/classes/perks/descriptions if 2026 heroes differ |
| `TEAMS` array | 21 teams with themed names | Update team names/count if 2026 event restructures |
| `HERO_IMAGE_PATHS` | 105 paths (21 teams × 5 heroes) | Must stay in sync with `public/hundred/` directory |
| `CG_LEADERS` | 16 leaders | Update for 2026 leadership |
| `MOCK_AGES` | [13, 14, 15, 16, 17] | No change needed |

### File Dependency Map

```
src/lib/constants.ts  ←── Central data hub, imported by 8+ components
    ↓
    ├── register/page.tsx (HEROES, TEAMS, HERO_IMAGE_PATHS)
    ├── invite/[code]/page.tsx (HEROES, TEAMS, HERO_IMAGE_PATHS, CONSTANTS)
    ├── character-selection-screen.tsx (HEROES, TEAMS)
    ├── hero-details.tsx (HEROES, HERO_IMAGE_PATHS)
    ├── hero-selection-grid.tsx (HEROES, HERO_IMAGE_PATHS)
    ├── team-drawer.tsx (HEROES, TEAMS)
    ├── team-invite-modal.tsx (via teamColor prop)
    └── footer.tsx (SITE_DESCRIPTION)

src/styles/fonts.css  ←── @font-face for Rumble Brave
    ↓
    ├── (landing)/layout.tsx (imports fonts.css)
    └── (everywhere-else)/layout.tsx (imports fonts.css)

src/app/globals.css  ←── --font-rumble theme variable
    ↓
    └── All components using `font-rumble` utility class
```

### Dual Layout Lockstep Requirement

Both layout files must receive **identical** metadata updates. They share:
- `title` — 5 references each
- `description` — 3 references each
- `keywords` — 1 reference each
- `siteName` — 1 reference each
- `images` — OG and Twitter image references

The metadata objects are structurally identical. Best approach: update one, then copy the metadata object to the other. The layouts differ only in their body content (landing has just `<main>` + `<Footer>`, everywhere-else adds `<Navbar>`, `<TimeRestriction>`, `<SonnerProvider>`).

### Risks and Constraints

1. **Missing 2026 brand assets** — The biggest risk. If the user hasn't provided the new font file, masthead SVGs, landing image, or hero images, the font/asset tasks must use placeholder values. The infrastructure (font loading, token references) should be built regardless.

2. **Font metrics mismatch** — If the 2026 brand font has different metrics than Rumble Brave, the 72 `font-rumble` usages may shift layout. Especially risky in the multi-step-registration-form.tsx (36 usages). The form is 1,771 lines with zero test coverage — cosmetic changes only. Mitigation: visually check a few key screens after font swap.

3. **Registration form is cosmetic-only** — The 1,771-line `multi-step-registration-form.tsx` has one content reference: line 711 `"Age (as of 2025)"` → `"Age (as of 2026)"`. This is a safe one-line change. Do NOT refactor anything else in this file.

4. **time-restriction.tsx uses 2024 date** — The time restriction component has a hardcoded date of May 11, **2024** (not 2025). This is likely a bug from last year that was never updated. It must be set to the 2026 registration open date.

5. **Hero images in public/hundred/** — 105 PNG files. If the 2026 event has different heroes, teams, or art styles, all 105 images plus the 5 hero portrait PNGs in `public/` root need replacement. The `HERO_IMAGE_PATHS` array in constants.ts must stay in sync with actual filenames on disk.

### What the Planner Needs to Decide

The planner must decide whether this slice:
- **Has new brand assets** (font, masthead, landing image, hero images) — in which case tasks include placing assets and updating references
- **Uses existing assets** — in which case tasks focus on year/date/copy changes only, and asset replacement is deferred or done with placeholders

Since the S02 plan says "new brand fonts, logo, hero images," the planner should assume new assets are available. If they're not, tasks should establish the infrastructure (font-face declarations, file paths) with current assets, making future swaps trivial (drop new file, done).

## Verification Strategy

1. `bun run build` — exits 0, all 12 routes compile
2. `rg '2025' --glob '*.tsx' --glob '*.ts' --glob '*.json' src/ public/` — zero matches (all year references updated)
3. `rg 'Multiverse of Mystery' --glob '*.tsx' --glob '*.ts' --glob '*.json' src/ public/` — zero matches if theme changed, or expected count if theme stays
4. `rg 'May 11' --glob '*.tsx' --glob '*.ts' src/` — zero matches (all date references updated)
5. Visual check: landing page renders with 2026 content (dates, venue, pricing)
6. Visual check: navbar shows updated logo/masthead
7. Visual check: meta tags in page source show 2026 title and description

## Skill Discovery

No additional skills needed. This is pure content/configuration work — no new technology, no unfamiliar APIs. The existing codebase patterns (Tailwind font loading, Next.js metadata, `constants.ts` data structure) are well-established and unchanged.

---
*Research completed: 2026-03-25*
*Ready for planning: yes*
