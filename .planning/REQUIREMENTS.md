# Requirements: YTH WKND 2026

**Defined:** 2026-03-25
**Core Value:** The registration flow must work flawlessly -- users pick a hero, join a team, and complete registration without friction.

## v1 Requirements

Requirements for the 2026 site refresh. Each maps to roadmap phases.

### Upgrade

- [ ] **UPGR-01**: Next.js upgraded to latest stable version (16.x)
- [ ] **UPGR-02**: framer-motion migrated to motion package (import paths updated, no API changes)
- [ ] **UPGR-03**: Landing page converted to RSC with client islands for interactive elements

### Brand Identity

- [ ] **BRND-01**: All hardcoded hex color values replaced with semantic CSS custom property tokens
- [ ] **BRND-02**: New brand fonts applied consistently across both root layouts
- [ ] **BRND-03**: Logo and brand assets updated for 2026
- [ ] **BRND-04**: Consistent brand identity applied across all pages (landing, register, invite)

### Content

- [ ] **CONT-01**: All copy updated for 2026 event (dates, venue, descriptions)
- [ ] **CONT-02**: Hero images and team data updated for 2026
- [ ] **CONT-03**: Registration open date updated for 2026 schedule
- [ ] **CONT-04**: Pricing details updated for 2026
- [ ] **CONT-05**: Meta tags and OG images updated for 2026

### Animation

- [ ] **ANIM-01**: Existing animations polished with spring physics and smoother easing
- [ ] **ANIM-02**: Staggered grid entrance animations using whileInView for team/hero grids
- [ ] **ANIM-03**: Form step transitions using AnimatePresence in registration flow
- [ ] **ANIM-04**: Micro-interactions on hero cards (hover/tap effects) and buttons

### Verification

- [ ] **VERF-01**: Full registration flow tested end-to-end (select hero, fill form, submit)
- [ ] **VERF-02**: Team invite flow tested end-to-end (generate code, share link, register via invite)
- [ ] **VERF-03**: Google Sheets sync verified after registration
- [ ] **VERF-04**: Cross-browser testing (Chrome, Safari, mobile)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancement

- **ENHN-01**: React Compiler enablement for automatic memoization
- **ENHN-02**: View Transitions API for page navigation animations
- **ENHN-03**: Dark mode token support

## Out of Scope

| Feature | Reason |
|---------|--------|
| Registration mechanism changes | Working well, no reason to change |
| New pages or sections | Copy/dates only refresh |
| Authentication/user accounts | Remains public registration |
| Admin dashboard | Not needed for 105-slot event |
| Real-time WebSockets | Polling/refresh sufficient for scale |
| Registration form refactoring | 1,771-line file -- cosmetic changes only on tight timeline |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPGR-01 | Phase 1 | Pending |
| UPGR-02 | Phase 1 | Pending |
| UPGR-03 | Phase 3 | Pending |
| BRND-01 | Phase 1 | Pending |
| BRND-02 | Phase 2 | Pending |
| BRND-03 | Phase 2 | Pending |
| BRND-04 | Phase 2 | Pending |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 2 | Pending |
| CONT-04 | Phase 2 | Pending |
| CONT-05 | Phase 2 | Pending |
| ANIM-01 | Phase 3 | Pending |
| ANIM-02 | Phase 3 | Pending |
| ANIM-03 | Phase 3 | Pending |
| ANIM-04 | Phase 3 | Pending |
| VERF-01 | Phase 4 | Pending |
| VERF-02 | Phase 4 | Pending |
| VERF-03 | Phase 4 | Pending |
| VERF-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
