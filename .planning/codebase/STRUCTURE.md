# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
ythwknd25/
├── src/
│   ├── app/                           # Next.js app directory (routing + layouts)
│   │   ├── api/                       # Server API routes
│   │   │   ├── register/              # User registration endpoint
│   │   │   ├── team-invite/           # Team invite generation and validation
│   │   │   ├── team-members/          # Fetch team members list
│   │   │   ├── sheets-sync/           # Google Sheets sync endpoint
│   │   │   ├── hero-availability/     # Fetch hero availability status
│   │   │   └── health-check/          # Database connection test
│   │   ├── (landing)/                 # Landing page layout group
│   │   │   ├── layout.tsx             # Landing layout (no navbar/footer)
│   │   │   └── page.tsx               # Home page with countdown/register button
│   │   ├── (everywhere-else)/         # Authenticated flows layout group
│   │   │   ├── layout.tsx             # Main layout with navbar/footer
│   │   │   ├── register/              # Registration form page
│   │   │   │   └── page.tsx
│   │   │   └── invite/                # Invite code handler
│   │   │       └── [code]/
│   │   │           └── page.tsx
│   │   ├── globals.css                # Global styles
│   │   └── favicon.ico
│   │
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui components (primitives)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── form.tsx               # react-hook-form integration
│   │   │   └── sonner.tsx             # Toast provider
│   │   │
│   │   ├── multi-step-registration-form.tsx  # Main form (65KB, large component)
│   │   ├── registration-modal.tsx     # Modal wrapper for form
│   │   ├── character-selection-screen.tsx   # Hero/team selection UI
│   │   ├── hero-selection-grid.tsx    # Grid display of heroes
│   │   ├── hero-details.tsx           # Hero info card
│   │   ├── team-drawer.tsx            # Team information panel
│   │   ├── team-members-subscription.tsx # Real-time member updates
│   │   ├── team-invite-modal.tsx      # Invite generation UI
│   │   ├── navbar.tsx                 # Navigation header
│   │   ├── footer.tsx                 # Page footer
│   │   ├── countdown-timer.tsx        # Event countdown display
│   │   ├── time-restriction.tsx       # Page access restriction wrapper
│   │   ├── loading-overlay.tsx        # Loading state overlay
│   │   └── sonner-provider.tsx        # Toast provider wrapper
│   │
│   ├── lib/                           # Utilities and constants
│   │   ├── constants.ts               # Heroes, teams, image paths (~400 lines)
│   │   ├── supabase.ts                # Supabase client + error handling
│   │   ├── google-sheets.ts           # Google Sheets authentication
│   │   ├── utils.ts                   # Tailwind merge utilities (cn helper)
│   │   └── format-date.ts             # Date formatting helpers
│   │
│   ├── hooks/                         # Custom React hooks
│   │   └── use-database-connection.ts # Connection retry logic + state
│   │
│   ├── styles/                        # Additional stylesheets
│   │   └── fonts.css                  # Custom font imports (Rumble)
│   │
│   └── supabase/                      # Supabase functions (edge/DB)
│       └── functions/                 # Server-side functions (if any)
│
├── public/                            # Static assets
│   ├── landing.png                    # Hero image
│   ├── favicon.png
│   ├── manifest.json
│   ├── assets/
│   │   └── masthead.svg               # YTHWKND logo
│   ├── fonts/                         # Custom fonts
│   └── hundred/                       # Hero character art (100+ images)
│       └── 00X_[Team]_0X-[Hero].png
│
├── package.json                       # Dependencies + scripts
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── postcss.config.mjs                 # PostCSS setup
├── components.json                    # shadcn/ui configuration
└── bun.lock                           # Lock file (bun package manager)
```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router pages and API endpoints
- Contains: Route handlers, page components, layouts, API logic
- Key files: `(landing)` and `(everywhere-else)` use route groups to apply different layouts

**src/app/api:**
- Purpose: Server-side HTTP endpoints
- Contains: POST/GET handlers for data mutations and queries
- Access pattern: Called from client components via `fetch()`

**src/components:**
- Purpose: Reusable UI components
- Contains: Form components, modals, cards, navigation, state subscriptions
- Organization: `ui/` subdirectory contains unstyled primitive components from shadcn/ui

**src/lib:**
- Purpose: Shared utilities, constants, and integrations
- Contains: Team/hero data, database client, Google Sheets setup, formatting helpers
- Key file: `constants.ts` contains all game entities (heroes, teams, image mappings)

**src/hooks:**
- Purpose: Custom React hooks for reusable logic
- Contains: Database connection management with retry logic
- Size: Currently just one hook; grows here if more needed

**src/styles:**
- Purpose: Global and custom stylesheets
- Contains: Font imports (Rumble font used in landing page)
- Imported in: layouts and globals.css

**public/:**
- Purpose: Static assets served at root
- Contains: Images (hero art, logos), fonts, manifest
- Key subdirectory: `hundred/` has 100+ hero character variations

## Key File Locations

**Entry Points:**
- `src/app/(landing)/page.tsx`: Landing page (countdown + event info)
- `src/app/(everywhere-else)/register/page.tsx`: Registration form container
- `src/app/(everywhere-else)/invite/[code]/page.tsx`: Invite code handler

**Configuration:**
- `next.config.ts`: Image domain config (ythwknd.ymfgakl.com), image formats
- `tsconfig.json`: Path alias `@/*` maps to `./src/*`
- `components.json`: shadcn/ui configuration

**Core Logic:**
- `src/components/multi-step-registration-form.tsx`: Main form with validation (65KB)
- `src/lib/constants.ts`: Game entities - heroes, teams, image paths
- `src/lib/supabase.ts`: Database client initialization and error handling

**Testing:**
- No test files found; testing not currently configured

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `CountdownTimer.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`, `google-sheets.ts`)
- API routes: `route.ts` in directory matching endpoint (e.g., `/api/register/route.ts`)
- CSS/Styles: `kebab-case.css` (e.g., `fonts.css`)

**Directories:**
- Components: lowercase (e.g., `components/`, `ui/`)
- API routes: lowercase with hyphens (e.g., `hero-availability/`)
- Grouped routes: parentheses (e.g., `(landing)`, `(everywhere-else)`)

**Variables & Constants:**
- Global constants: SCREAMING_SNAKE_CASE (e.g., `CONSTANTS`, `MAX_RETRIES`)
- Object properties: camelCase (e.g., `teamId`, `heroId`, `isAvailable`)
- React state: camelCase (e.g., `isModalOpen`, `registrations`)
- Database columns: snake_case (e.g., `full_name`, `team_id`, `hero_id`)

**Types & Interfaces:**
- Interfaces: PascalCase, prefixed with `I` or contextual (e.g., `Registration`, `HeroAvailability`)
- Type aliases: PascalCase (e.g., `TeamInfo`)

## Where to Add New Code

**New Feature (e.g., admin dashboard):**
- Primary code: Create new route group `src/app/(admin)/` with layout.tsx and pages
- Components: Add components to `src/components/` or `src/components/admin/` if scoped
- Tests: Would go in `src/__tests__/` or co-located with components
- API endpoints: Add to `src/app/api/` with descriptive directory names
- Utilities: Add to `src/lib/` if shared, or co-locate if feature-specific

**New Component/Module:**
- Implementation: `src/components/[ComponentName].tsx` using "use client" directive if interactive
- UI Components: Use primitives from `src/components/ui/` and compose with Tailwind
- Styling: Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Import paths: Always use `@/` alias (e.g., `@/components/ui/button`)

**Utilities:**
- Shared helpers: `src/lib/[utility-name].ts`
- If for specific feature: co-locate in feature directory
- Export as named functions with clear naming
- Include JSDoc comments for public APIs

**Form/Validation Logic:**
- Schemas: Define Zod schemas inside component file or in `src/lib/schemas.ts` if reused
- Form components: Use `react-hook-form` with `useForm()` hook
- Integration: Wrap with shadcn's `<Form>` component for consistent styling
- Error display: Use Zod's message field for per-field errors

**API Routes:**
- Create directory: `src/app/api/[endpoint-name]/`
- Create file: `route.ts` inside that directory
- Methods: Export named functions `GET()`, `POST()`, `PUT()`, `DELETE()`
- Error handling: Use NextResponse with status codes, wrap in try-catch
- Database access: Import `createClient()` from `@/lib/supabase`

## Special Directories

**public/hundred/:**
- Purpose: Hero character variations for 21 teams × 5 heroes (100+ images)
- Generated: No (manually created/imported)
- Committed: Yes
- Pattern: `00X_[Team-Name]_0X-[Hero-Name].png` (e.g., `001_Original-Five_01-Alex.png`)
- Usage: Mapped in `src/lib/constants.ts` HERO_IMAGE_PATHS array

**.next/:**
- Purpose: Next.js build output
- Generated: Yes (during build)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: Package dependencies
- Generated: Yes (via npm/bun install)
- Committed: No (in .gitignore)

**src/supabase/:**
- Purpose: Supabase edge functions or database triggers
- Generated: No
- Status: Present but not currently used; ready for Supabase Functions deployment

---

*Structure analysis: 2026-03-25*
