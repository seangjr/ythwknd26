# Feature Landscape

**Domain:** Youth camp/event registration website (brand refresh)
**Researched:** 2026-03-25

## Context

This is a brand refresh of an existing, working camp registration site (YTH WKND 2025 to 2026). The registration mechanism is unchanged: hero selection, team-based registration (21 teams x 5 heroes = 105 slots), invite system. The scope is new brand identity, updated copy/dates, and polished animations. Features here are scoped to what makes a brand refresh feel premium, NOT new registration mechanics.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or the refresh feels half-baked.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Updated dates, copy, and pricing | Users will see stale 2025 info and think the site is broken | Low | Hardcoded in `constants.ts` and landing page. Multiple date references (time restriction, countdown, landing copy) |
| New brand identity applied consistently | Inconsistent branding screams "unfinished." Every surface must reflect 2026 identity | Medium | Fonts, colors, hero images, masthead SVGs, team colors. Tailwind theme tokens (`font-rumble`, `bg-team-*`, `#BABABA` text) need updating across all components |
| Mobile-responsive registration flow | 60%+ of youth traffic is mobile. Current site works but needs polish testing on small screens | Low | Already responsive. Verify nothing breaks with new brand assets (larger images, different font metrics) |
| Fast page load (<3s) | Users bounce after 3 seconds. Youth audience has zero patience | Low | Already performant with Next.js. Watch for new brand assets bloating bundle (unoptimized hero images, heavy fonts). Use `next/image` for all new assets |
| Clear registration CTA above the fold | 71% of event attendees say ease of check-in makes or breaks their experience. Register button must be unmissable | Low | Already exists. Ensure new brand does not bury it behind visual noise |
| Countdown timer with flip/tick animation | Pre-registration countdown is table stakes for event sites. Current timer is functional but plain (static numbers in boxes) | Low | Current `CountdownTimer` uses basic Framer Motion fade-in. Add number transition animations (AnimatePresence on digit change) for polish |
| Confirmation feedback after registration | Users need to know registration succeeded. Missing confirmation = support tickets | Low | Already handled via toast notifications (Sonner). Ensure success state is visually satisfying with new brand |
| Form validation with inline error feedback | Users expect real-time field validation, not submit-and-pray. Zod + react-hook-form already handles this | Low | Already implemented. Consider adding subtle shake animation on validation errors for polish |
| Hero availability indicators | Users must see which heroes are taken vs available at a glance | Low | Already exists in `CharacterSelectionScreen`. Verify visual treatment works with new brand colors |
| Working invite/share system | Team invite links are core to the registration model. Must work flawlessly | Low | Already implemented with nanoid codes and 7-day expiry. Update any invite page copy for 2026 |

## Differentiators

Features that elevate the refresh from "same site, new colors" to "this feels like a new experience." Not expected, but high perceived value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smooth page transitions between routes | Makes navigation feel app-like rather than page-reload-y. Youth audience expects mobile-app-level polish | Medium | Use `AnimatePresence` with `motion` layout animations on route changes. Next.js App Router supports this with `template.tsx` or layout-level AnimatePresence. Framer Motion 12 has improved layout animations |
| Staggered entrance animations on team grid | 21 teams loading all at once feels static. Staggered reveals (cards cascading in) feel intentional and premium | Low | Already using Framer Motion. Add `staggerChildren` to the team grid container with `variants` pattern. Low effort, high visual impact |
| Hero card hover/tap micro-interactions | Hero selection is the signature interaction. Scale, glow, or parallax tilt on hover makes selection feel game-like and on-brand | Low | Currently has basic `whileHover: { scale: 1.02 }`. Upgrade to layered effect: slight tilt (3D transform), shadow elevation, and subtle glow matching team color |
| Animated form step transitions | Multi-step form currently jumps between steps. Sliding/fading transitions between form sections reduce cognitive load and feel premium | Low | `MultiStepRegistrationForm` (1771 lines) already has step state. Wrap step content in `AnimatePresence` with directional slide (left/right based on step direction) |
| Scroll-triggered section reveals on landing | Landing page sections appearing on scroll rather than all at once creates a storytelling flow. Parallax on the hero image adds depth | Low-Med | Replace current static fade-in (all animate on mount) with `whileInView` triggers. Add parallax to hero image via `useScroll` + `useTransform` |
| Registration success celebration animation | A confetti burst, checkmark animation, or hero "power-up" effect on successful registration makes the moment memorable | Low | Use a lightweight confetti library (e.g., `canvas-confetti`, ~3KB) or a Framer Motion sequence. Fires once on success callback |
| Countdown timer digit flip animation | Numbers physically flip or morph when changing, like an airport departure board. Much more engaging than static number swap | Medium | Replace plain digit render with AnimatePresence per digit, animating Y-axis rotation or slide. Each digit gets its own exit/enter animation |
| Dark mode ambient effects | Subtle animated gradient background, floating particles, or aurora effect that gives the dark theme life without distracting | Medium | Use CSS `@keyframes` for gradient shifts or a lightweight canvas animation. Keep it subtle -- this is atmosphere, not content. Test performance on low-end mobile |
| Loading skeleton states | Show content-shaped skeletons while data loads rather than blank space or spinners. Feels faster even if load time is the same | Low | shadcn/ui already includes `skeleton.tsx`. Apply to team grid and hero cards during Supabase fetch |
| Haptic-feeling button interactions | Buttons that scale down on press (`whileTap`), have spring physics on release, and show ripple effects. Makes taps feel physical | Low | Already has `whileTap: { scale: 0.95 }` on register button. Extend to all interactive elements with spring transition (`type: "spring", stiffness: 400, damping: 15`) |

## Anti-Features

Features to explicitly NOT build. These would add scope, complexity, or user friction without matching the project's constraints.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User authentication / accounts | Project is explicitly out of scope. Public registration with no sessions is the design. Adding auth adds complexity, maintenance, and friction for youth users | Keep anonymous registration. No login walls |
| Payment integration | Payment handling adds PCI compliance burden, error states, and support overhead. Current model handles payment offline/separately | Keep pricing info on landing page. Handle payment through existing offline process |
| Admin dashboard / CMS | Google Sheets sync already serves as admin view. Building a dashboard is a separate product | Keep Google Sheets as the admin interface. It works and organizers already know it |
| Email notification system | Confirmation emails add infrastructure (SMTP, templates, delivery monitoring) for a single-use registration event | Show clear on-screen confirmation. Optionally add a "screenshot your confirmation" prompt |
| Real-time WebSocket updates | Supabase supports real-time subscriptions, but polling/refetch on action is simpler and sufficient for the registration volume (105 max registrations) | Keep current fetch-on-mount + optimistic updates pattern. Real-time adds complexity for negligible UX gain at this scale |
| Complex page transitions with shared layout animations | Full shared-element transitions (hero image morphing from grid to detail view) are impressive but fragile, hard to maintain, and add significant complexity | Use simple cross-fade or slide transitions between routes. Save shared-element animations for the hero selection modal only |
| Internationalization (i18n) | Single-language event for a specific community. i18n infrastructure is pure overhead | Keep English-only. All copy is in constants and components |
| Progressive Web App (PWA) features | Manifest exists but offline support, push notifications, etc. add complexity for a site visited once during registration | Keep the manifest for mobile "add to home screen" but do not invest in service workers or offline mode |
| SEO optimization beyond basics | This is a direct-link registration site, not a content site competing for search rankings. Users arrive via social media links | Keep existing meta tags and OG image. Do not invest in structured data, sitemap, or SEO content |
| Accessibility audit / WCAG compliance overhaul | Important in general, but out of scope for a tight-deadline brand refresh of an existing working site | Maintain existing accessibility (semantic HTML, button labels). Do not introduce new accessibility regressions. Flag for future if the platform grows |

## Feature Dependencies

```
Updated dates/copy/pricing
  (no dependencies, do first)

New brand identity
  -> Hero card micro-interactions (need final brand colors for glow effects)
  -> Dark mode ambient effects (need final brand palette)
  -> Countdown timer digit flip (need final font for digit sizing)

Staggered entrance animations
  -> Loading skeleton states (skeletons should stagger too)

Animated form step transitions
  (independent, can be done alongside brand work)

Scroll-triggered section reveals
  -> Smooth page transitions (both touch layout animation, coordinate approach)

Registration success celebration
  (independent, fires after existing success callback)

Hero card hover/tap micro-interactions
  -> Character selection screen already exists, enhance in place
```

## MVP Recommendation

Given the constraint that this must be live this week, prioritize in this order:

**Must do (brand refresh is incomplete without these):**
1. Updated dates, copy, pricing, and event details for 2026
2. New brand identity applied consistently (fonts, colors, masthead, hero images)
3. Form validation shake animation on errors (tiny effort, big polish signal)

**Should do (makes the refresh feel premium, low effort):**
4. Staggered entrance animations on team grid
5. Animated form step transitions (AnimatePresence on multi-step form)
6. Hero card hover/tap micro-interactions upgrade
7. Loading skeleton states for data fetching
8. Haptic-feeling button interactions (spring physics on all buttons)

**Nice to have (if time permits):**
9. Countdown timer digit flip animation
10. Scroll-triggered section reveals on landing page
11. Registration success celebration animation
12. Smooth page transitions between routes

**Defer entirely:**
- Dark mode ambient effects (medium complexity, risk of performance issues on mobile)
- Complex shared-element transitions (fragile, time-consuming)

## Sources

- [Bizzabo: Beautiful Event Websites Design Trends 2026](https://www.bizzabo.com/blog/beautiful-event-websites-design)
- [KESQ: Key features every camp registration should offer](https://kesq.com/stacker-money/2025/10/10/key-features-every-camp-or-program-should-offer-in-their-registration-experience/)
- [iCampPro: Summer Camp Registration Best Practices](https://www.icamppro.com/blog/summer-camp-registration-camp-forms-best-practices-tips)
- [Beta Soft Technology: Motion UI Trends 2025 Micro-Interactions](https://www.betasofttechnology.com/motion-ui-trends-and-micro-interactions/)
- [Medium: Enhancing Form Usability with Framer Motion](https://medium.com/designly/enhancing-form-usability-with-framer-motion-a-guide-to-animated-chunked-form-transitions-dc20e18363d4)
- [Maxime Heckel: Advanced Animation Patterns with Framer Motion](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)
- [Figma: Web Design Trends 2026](https://www.figma.com/resource-library/web-design-trends/)
- [Justinmind: Micro-interaction Examples and Guidelines 2025](https://www.justinmind.com/web-design/micro-interactions)
