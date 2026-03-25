# Roadmap: YTH WKND 2026

## Overview

Refresh the YTH WKND site for 2026: upgrade the framework stack, apply new brand identity with updated content, polish animations with RSC conversion, then verify everything works end-to-end. Four phases, each building on the last, with the goal of a stable, branded, polished registration site ready to go live this week.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Upgrade and Foundation** - Next.js 16 upgrade, motion migration, and color token infrastructure
- [ ] **Phase 2: Brand Identity and Content** - New brand assets, fonts, and all 2026 content updates
- [ ] **Phase 3: Animation and RSC** - Landing page RSC conversion, animation polish, and micro-interactions
- [ ] **Phase 4: Verification** - End-to-end testing of all registration flows across browsers

## Phase Details

### Phase 1: Upgrade and Foundation
**Goal**: Codebase runs on Next.js 16 with motion package and semantic color tokens, providing a stable foundation for all visual work
**Depends on**: Nothing (first phase)
**Requirements**: UPGR-01, UPGR-02, BRND-01
**Success Criteria** (what must be TRUE):
  1. Site builds and runs on Next.js 16 with no console errors or deprecation warnings
  2. All framer-motion imports updated to motion package with no broken animations
  3. All 89 hardcoded color values replaced with CSS custom property tokens in globals.css
  4. Both root layouts (landing and everywhere-else) reference the same token system
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Brand Identity and Content
**Goal**: The site looks and reads like a 2026 event -- new brand fonts, logo, hero images, and all copy/dates/pricing updated
**Depends on**: Phase 1
**Requirements**: BRND-02, BRND-03, BRND-04, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. New brand fonts render consistently across both layouts and all pages
  2. 2026 logo and brand assets appear on landing, register, and invite pages
  3. All dates, venue details, pricing, and event descriptions reflect 2026 information
  4. Hero images and team data in constants.ts are updated for 2026
  5. Meta tags and OG images show correct 2026 branding when shared on social media
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Animation and RSC
**Goal**: Landing page loads faster via server rendering with client islands, and all animations feel polished with smooth physics and purposeful micro-interactions
**Depends on**: Phase 2
**Requirements**: UPGR-03, ANIM-01, ANIM-02, ANIM-03, ANIM-04
**Success Criteria** (what must be TRUE):
  1. Landing page renders as a Server Component with interactive sections (countdown, hero selection) as client islands
  2. Team and hero grids animate in with staggered entrance animations on scroll
  3. Registration form steps transition smoothly with AnimatePresence (no layout jumps)
  4. Hero cards respond to hover/tap with visible micro-interactions (scale, glow, or tilt)
  5. Existing animations use spring physics and feel smoother than the 2025 version
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Verification
**Goal**: Every registration path works flawlessly across browsers before the site goes live
**Depends on**: Phase 3
**Requirements**: VERF-01, VERF-02, VERF-03, VERF-04
**Success Criteria** (what must be TRUE):
  1. A user can select a hero, fill out the registration form, and submit successfully
  2. A user can generate an invite code, share the link, and another user can register through it
  3. Completed registrations appear in the connected Google Sheet within 30 seconds
  4. All flows work correctly on Chrome, Safari, and mobile Safari (iOS)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Upgrade and Foundation | 0/2 | Not started | - |
| 2. Brand Identity and Content | 0/2 | Not started | - |
| 3. Animation and RSC | 0/2 | Not started | - |
| 4. Verification | 0/1 | Not started | - |
