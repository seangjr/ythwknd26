# Requirements

## Active

### BRND-03 — Logo and brand assets updated for 2026

- Status: active
- Class: core-capability
- Source: inferred
- Primary Slice: none yet

Logo and brand assets updated for 2026. No new assets provided yet.

### BRND-04 — Consistent brand identity applied across all pages (landing, register, invite)

- Status: active
- Class: core-capability
- Source: inferred
- Primary Slice: none yet

Consistent brand identity applied across all pages (landing, register, invite)

### VERF-01 — Full registration flow tested end-to-end (select class, choose party, fill form, submit)

- Status: active
- Class: core-capability
- Source: inferred
- Primary Slice: M002/S04
- Supporting slices: M002/S01, M002/S02, M002/S03

Full registration flow tested end-to-end. Updated for new model: select a party, choose a class, fill form, submit (was: select hero, fill form, submit)

### VERF-02 — Team invite flow tested end-to-end (generate code, share link, register via invite)

- Status: active
- Class: core-capability
- Source: inferred
- Primary Slice: M002/S04

Team invite flow tested end-to-end (generate code, share link, register via invite)

### VERF-03 — Google Sheets sync verified after registration

- Status: active
- Class: core-capability
- Source: inferred
- Primary Slice: M002/S04

Google Sheets sync verified after registration

### VERF-04 — Cross-browser testing (Chrome, Safari, mobile)

- Status: active
- Class: core-capability
- Source: inferred
- Primary Slice: M002/S04

Cross-browser testing (Chrome, Safari, mobile)

### NEON-01 — Supabase client replaced with Neon serverless driver across all API routes

- Status: active
- Class: core-capability
- Source: user (D006)
- Primary Slice: M002/S02

Replace @supabase/supabase-js with @neondatabase/serverless. All 6 API routes rewritten from Supabase fluent API to parameterized SQL. No Supabase imports remain in source code.

### NEON-02 — Client-side Supabase queries moved behind API routes

- Status: active
- Class: integration
- Source: inferred
- Primary Slice: M002/S03

Three components (character-selection-screen, register/page, invite/page) currently import Supabase client directly for client-side queries. These must be refactored to call API routes instead since Neon's driver is server-only.

### NEON-03 — Real-time team member updates via SSE replacing Supabase channels

- Status: active
- Class: core-capability
- Source: user
- Primary Slice: M002/S03

Replace Supabase real-time subscription (postgres_changes channel) with SSE polling endpoint. Team member updates appear in near-real-time when new registrations occur.

### NEON-04 — Neon database schema and seed data provisioned

- Status: active
- Class: integration
- Source: inferred
- Primary Slice: M002/S01

SQL schema script for 4 tables (registrations, hero_availability, team_invites, teams) with indexes, constraints, and seed data for 21 parties × 5 classes. DATABASE_URL configured.

## Validated

### UPGR-01 — Next.js upgraded to latest stable version (16.x)

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S01
- Validation: next@16.2.1 installed, `bun run build` exits 0, all 12 routes compile with Turbopack

Next.js upgraded to latest stable version (16.x)

### UPGR-02 — framer-motion migrated to motion package (import paths updated, no API changes)

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S01
- Validation: motion@12.38.0 installed, all 8 import paths updated from "framer-motion" to "motion/react", `rg framer-motion` returns zero matches, build passes

framer-motion migrated to motion package (import paths updated, no API changes)

### UPGR-03 — Landing page converted to RSC with client islands for interactive elements

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S03
- Validation: Landing page has no "use client" directive. Uses MotionDiv/MotionSection/FadeIn client wrappers and RegistrationCTA client island. Build output confirms / route is ƒ (Dynamic). export const dynamic = "force-dynamic" prevents stale caching.

Landing page converted to RSC with client islands for interactive elements

### BRND-01 — All hardcoded hex color values replaced with semantic CSS custom property tokens

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S01
- Validation: 89+ hardcoded hex values replaced across 14 files with semantic tokens (text-text-muted, bg-surface, border-text-muted). `rg '#[0-9a-fA-F]{6}' src/` returns zero matches, build passes

All hardcoded hex color values replaced with semantic CSS custom property tokens

### BRND-02 — New brand fonts applied consistently across both root layouts

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S03
- Validation: Heading font replaced from Rumble Brave to Jeju Hallasan in fonts.css and globals.css. --font-rumble CSS variable points to new font. 72 class usages work unchanged. Build passes.
- Notes: Font file at public/fonts/JejuHallasan-Regular.ttf. Variable name --font-rumble preserved per D005.

New brand fonts applied consistently across both root layouts

### CONT-01 — All copy updated for 2026 event (dates, venue, descriptions)

- Status: validated
- Class: core-capability
- Source: inferred → confirmed via user override (D004)
- Primary Slice: M001/S03
- Validation: Landing page updated with dates "30 May to 1 June", venue "Peacehaven, Genting Highlands", pricing RM130/RM160, no double ticket tier. Build passes.

All copy updated for 2026 event. Confirmed details: event dates May 30 – June 1, 2026; venue Peacehaven, Genting Highlands; registration instructional copy updated for party/class selection model.

### CONT-02 — Class data and party naming updated for 2026 (was: hero images and team data)

- Status: validated
- Class: core-capability
- Source: inferred → confirmed via user override (D004)
- Primary Slice: M001/S03
- Validation: CLASSES array (5 classes: Warrior, Archer, Scout, Guardian, Scholar) replaces HEROES. PARTIES array (PARTY 001–021) replaces TEAMS. CG_LEADERS updated. HERO_IMAGE_PATHS removed. All downstream components updated. Build passes.

Hero selection model replaced with Class selection: 5 classes (Warrior, Archer, Scout, Guardian, Scholar) with descriptions. Teams renamed from themed names to party format (PARTY 001 – PARTY 021). CG leaders list updated.

### CONT-03 — Registration open date updated for 2026 schedule

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S03
- Validation: Registration open date set to May 10, 2026 at 12:30 PM in landing page Date constructor and display string. Time-restriction gate also updated. rg 'May 11' returns zero matches.
- Notes: May 10, 2026 is a placeholder — update when confirmed registration open date is provided.

Registration open date updated for 2026 schedule

### CONT-04 — Pricing details updated for 2026

- Status: validated
- Class: core-capability
- Source: inferred → confirmed via user override (D004)
- Primary Slice: M001/S03
- Validation: Landing page shows RM130 (new friends) / RM160 (YM member). Old 3-tier pricing (RM550/RM300/RM250) removed. No disclaimers. Build passes.

Pricing updated for 2026: RM130 (new friends) / RM160 (YM member). Replaces 2025 pricing structure (RM550/RM300/RM250) which used three tiers.

### CONT-05 — Meta tags and OG images updated for 2026

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S02
- Validation: Both root layout metadata objects updated with YTHWKND 2026 in title, keywords, openGraph, twitter. manifest.json updated. grep -c 'YTHWKND 2026' confirms 5 refs per layout + 1 in manifest.
- Notes: OG images still reference 2025 assets — update when new brand assets arrive (BRND-03).

Meta tags and OG images updated for 2026

### ANIM-01 — Existing animations polished with spring physics and smoother easing

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S03
- Validation: springTransition used for hover/tap interactions across register page, character-selection-screen, invite page. Spring physics (stiffness: 400, damping: 17) applied to class cards and buttons.

Existing animations polished with spring physics and smoother easing

### ANIM-02 — Staggered grid entrance animations using whileInView for team/class grids

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S03
- Validation: Register page party grid uses whileInView="visible" with staggerContainer/fadeInLeft/scaleIn variants and viewport={{ once: true }}. Invite page team section also uses whileInView with stagger variants.

Staggered grid entrance animations using whileInView for team/party and class grids

### ANIM-03 — Form step transitions using AnimatePresence in registration flow

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S03
- Validation: AnimatePresence mode="wait" wraps step conditionals in multi-step-registration-form.tsx. Each step has motion.div with key, initial/animate/exit props. No form logic modified.

Form step transitions using AnimatePresence in registration flow

### ANIM-04 — Micro-interactions on class cards (hover/tap effects) and buttons

- Status: validated
- Class: core-capability
- Source: inferred
- Primary Slice: M001/S03
- Validation: Class cards in character-selection-screen.tsx have whileHover/whileTap spring interactions. Register page class tiles have spring hover/tap. Social icons have hover spring scaling.

Micro-interactions on class cards (hover/tap effects) and buttons

## Deferred

## Out of Scope
