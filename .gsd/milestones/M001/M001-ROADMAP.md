# M001: YTH WKND 2026 - Camp Registration Site Refresh

**Vision:** Refresh the YTH WKND site for 2026: upgrade the framework stack, apply new brand identity with updated content, polish animations with RSC conversion, then verify everything works end-to-end. Four slices, each building on the last, with the goal of a stable, branded, polished registration site ready to go live this week.

## Success Criteria

1. Site builds and runs on latest Next.js with no console errors or deprecation warnings
2. All framer-motion imports updated to motion package with no broken animations
3. Hardcoded color values replaced with CSS custom property tokens
4. Confirmed 2026 event details applied: dates (May 30 – June 1), venue (Peacehaven, Genting Highlands), pricing (RM130/RM160), class selection model, party naming, updated CG leaders
5. Landing page renders as a Server Component with client islands for interactivity
6. Animations feel polished with spring physics and purposeful micro-interactions
7. Full registration flow works end-to-end across Chrome, Safari, and mobile (select party → choose class → fill form → submit)

## Slices

- [x] **S01: Upgrade and Foundation** `risk:medium` `depends:[]`
  > After this: codebase runs on Next.js 16 with motion package and semantic color tokens — stable foundation for all visual work
- [x] **S02: Brand Identity and Content** `risk:medium` `depends:[S01]`
  > After this: the site looks and reads like a 2026 event — new brand fonts, logo, hero images, and all copy/dates/pricing updated
- [x] **S03: Content Override, Animation and RSC** `risk:high` `depends:[S02]`
  > After this: site shows confirmed 2026 event details (dates, venue, pricing, class selection, party naming, updated CG leaders), landing page loads faster via server rendering with client islands, and all animations feel polished with smooth physics
- [x] **S04: Verification** `risk:medium` `depends:[S03]`
  > After this: every registration path works flawlessly across browsers — ready to go live
