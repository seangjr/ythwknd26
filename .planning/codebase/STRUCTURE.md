# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
ythwknd25/
├── src/
│   ├── app/                           # Next.js App Router pages & API routes
│   │   ├── api/                       # Server API routes
│   │   │   ├── register/              # User registration endpoint (271 lines)
│   │   │   ├── team-invite/           # Team invite generation (122 lines)
│   │   │   │   └── check/            # Invite code validation (61 lines)
│   │   │   ├── team-members/          # Fetch team members list (45 lines)
│   │   │   ├── sheets-sync/           # Google Sheets sync endpoint (121 lines)
│   │   │   ├── hero-availability/     # Fetch hero availability status (92 lines)
│   │   │   └── health-check/          # Database connection test (29 lines)
│   │   ├── (landing)/                 # Route group: landing page
│   │   │   ├── layout.tsx             # Root layout: metadata + Footer only
│   │   │   └── page.tsx               # Home page with countdown/register CTA
│   │   ├── (everywhere-else)/         # Route group: all other pages
│   │   │   ├── layout.tsx             # Root layout: Navbar + TimeRestriction + Footer + SonnerProvider
│   │   │   ├── register/              # Registration form page
│   │   │   │   └── page.tsx
│   │   │   └── invite/                # Invite code handler
│   │   │       └── [code]/
│   │   │           └── page.tsx
│   │   ├── globals.css                # Global styles + Tailwind base
│   │   └── favicon.ico
│   │
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui primitives (generated)
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx               # react-hook-form integration
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx             # Toast component
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── multi-step-registration-form.tsx  # Main form (1771 lines, largest)
│   │   ├── character-selection-screen.tsx     # Hero/team selection UI (337 lines)
│   │   ├── registration-modal.tsx     # Modal wrapper for form (303 lines)
│   │   ├── team-drawer.tsx            # Team information panel (244 lines)
│   │   ├── team-invite-modal.tsx      # Invite generation UI (224 lines)
│   │   ├── hero-selection-grid.tsx    # Grid display of heroes (95 lines)
│   │   ├── hero-details.tsx           # Hero info card (76 lines)
│   │   ├── countdown-timer.tsx        # Event countdown display (70 lines)
│   │   ├── time-restriction.tsx       # Time-gated content wrapper (49 lines)
│   │   ├── loading-overlay.tsx        # Loading state overlay (47 lines)
│   │   ├── team-members-subscription.tsx # Real-time member updates (44 lines)
│   │   ├── navbar.tsx                 # Navigation header
│   │   ├── footer.tsx                 # Page footer (20 lines)
│   │   └── sonner-provider.tsx        # Toast provider wrapper
│   │
│   ├── lib/                           # Utilities and constants
│   │   ├── constants.ts               # Heroes, teams, image paths (~13KB)
│   │   ├── supabase.ts                # Supabase singleton client + error handling (82 lines)
│   │   ├── google-sheets.ts           # Google Sheets API authentication
│   │   ├── utils.ts                   # cn() Tailwind merge helper (7 lines)
│   │   └── format-date.ts             # Date formatting helpers (60 lines)
│   │
│   ├── hooks/                         # Custom React hooks
│   │   └── use-database-connection.ts # Connection retry logic + state
│   │
│   ├── styles/                        # Additional stylesheets
│   │   └── fonts.css                  # Custom font-face declarations (Rumble)
│   │
│   └── supabase/                      # Supabase database functions
│       └── functions/
│           ├── register_user.sql      # User registration SQL function
│           └── register_user_extended.sql # Extended registration SQL function
│
├── public/                            # Static assets served at /
│   ├── assets/
│   │   ├── masthead.svg               # YTHWKND logo (full)
│   │   └── sm-masthead.svg            # YTHWKND logo (small)
│   ├── fonts/
│   │   └── rumble-brave.otf           # Custom display font
│   ├── hundred/                       # Hero character art (105 images)
│   │   └── {NNN}_{Theme}-Five_{NN}-{Name}.png
│   ├── alex-huntington.png            # Individual hero portraits
│   ├── charlie-mayfield.png
│   ├── charlotte-mayfield.png
│   ├── kai.png
│   ├── suzzy-prasad.png
│   ├── landing.png                    # Landing page hero image
│   ├── favicon.png
│   └── manifest.json                  # PWA manifest
│
├── package.json                       # Dependencies + scripts
├── tsconfig.json                      # TypeScript config (path aliases)
├── next.config.ts                     # Next.js config (image domains)
├── postcss.config.mjs                 # PostCSS with Tailwind CSS v4
├── components.json                    # shadcn/ui configuration
└── bun.lock                           # Bun lockfile
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and API endpoints
- Contains: Route handlers, page components, layouts, API logic
- Key detail: Uses route groups `(landing)` and `(everywhere-else)` to apply different layouts to different pages
- Both route groups define their own root `<html>` and `<body>` tags (separate root layouts)

**`src/app/api/`:**
- Purpose: Server-side HTTP endpoints
- Contains: POST/GET handlers for data mutations and queries
- Access pattern: Called from client components via `fetch()`
- Each endpoint lives in its own directory with a `route.ts` file

**`src/components/`:**
- Purpose: All React components (feature-level at root, primitives in `ui/`)
- Contains: Form components, modals, cards, navigation, real-time subscriptions
- Organization: Flat structure at root level; `ui/` subdirectory for shadcn/ui primitives

**`src/components/ui/`:**
- Purpose: shadcn/ui generated primitive components
- Contains: Radix-based UI primitives styled with Tailwind
- Generated via: `npx shadcn@latest add {component}` (style: new-york, RSC enabled)
- Do NOT manually create files here; use the CLI

**`src/lib/`:**
- Purpose: Shared utilities, constants, and service client initialization
- Contains: Team/hero data definitions, database client, Google Sheets setup, formatting helpers
- Key file: `constants.ts` is the single source of truth for all hero, team, and pricing data
- Key file: `supabase.ts` provides singleton client via `createClient()` and `handleDatabaseError()` with Postgres error code mapping (PGRST116, 23505, 23503)

**`src/hooks/`:**
- Purpose: Custom React hooks for reusable logic
- Contains: Database connection management with retry logic (MAX_RETRIES=3, RETRY_DELAY=2000ms)
- Currently one hook; add new hooks here as needed

**`src/styles/`:**
- Purpose: Additional CSS files beyond `globals.css`
- Contains: Custom font-face declarations
- Imported in both layout files via `@/styles/fonts.css`

**`src/supabase/functions/`:**
- Purpose: SQL function definitions deployed to Supabase database
- Contains: Registration-related stored procedures
- Key files: `register_user.sql`, `register_user_extended.sql`

**`public/`:**
- Purpose: Static assets served at root URL path
- Contains: Hero images, logos, fonts, PWA manifest

**`public/hundred/`:**
- Purpose: Themed hero character portrait images (21 themes x 5 characters = 105 images)
- Naming pattern: `{NNN}_{Theme}-Five_{NN}-{Name}.png` (e.g., `001_Original-Five_01-Alex.png`)
- Mapped in: `src/lib/constants.ts`

## Key File Locations

**Entry Points:**
- `src/app/(landing)/page.tsx`: Landing page (route: `/`) - client component with countdown timer and registration CTA
- `src/app/(everywhere-else)/register/page.tsx`: Registration form (route: `/register`)
- `src/app/(everywhere-else)/invite/[code]/page.tsx`: Invite handler (route: `/invite/:code`)

**Layouts (both are root layouts with `<html>` tags):**
- `src/app/(landing)/layout.tsx`: Landing layout - metadata, OG tags, Google Analytics, Footer only
- `src/app/(everywhere-else)/layout.tsx`: App layout - Navbar, TimeRestriction wrapper, SonnerProvider, Footer, Google Analytics

**Configuration:**
- `next.config.ts`: Image domain config, image format optimization
- `tsconfig.json`: Path alias `@/*` -> `./src/*`
- `components.json`: shadcn/ui config (new-york style, RSC, Lucide icons)
- `postcss.config.mjs`: PostCSS with Tailwind CSS v4
- `package.json`: Node >= 20 required, npm 11.3.0 package manager

**Core Logic:**
- `src/components/multi-step-registration-form.tsx`: Main registration form (1771 lines, largest file)
- `src/lib/constants.ts`: All game entities - heroes, teams, image paths (~13KB)
- `src/lib/supabase.ts`: Supabase client initialization and error handling (82 lines)
- `src/lib/google-sheets.ts`: Google Sheets API authentication with Base64 service account key parsing
- `src/lib/format-date.ts`: `formatDate()` and `getRelativeTimeString()` utilities (60 lines)
- `src/app/api/register/route.ts`: Registration API handler (271 lines)

**API Endpoints:**
- `src/app/api/register/route.ts`: User registration (POST)
- `src/app/api/hero-availability/route.ts`: Check hero availability (GET)
- `src/app/api/team-invite/route.ts`: Generate team invites (POST)
- `src/app/api/team-invite/check/route.ts`: Validate invite codes (GET)
- `src/app/api/team-members/route.ts`: Fetch team members (GET)
- `src/app/api/sheets-sync/route.ts`: Google Sheets data sync (POST)
- `src/app/api/health-check/route.ts`: Database health check (GET)

**Testing:**
- No test files or test configuration found. Testing is not currently set up.

## Naming Conventions

**Files:**
- Components: kebab-case `.tsx` (e.g., `character-selection-screen.tsx`, `countdown-timer.tsx`)
- Utilities: kebab-case `.ts` (e.g., `format-date.ts`, `google-sheets.ts`)
- Hooks: kebab-case with `use-` prefix (e.g., `use-database-connection.ts`)
- API routes: always `route.ts` inside a descriptively named directory
- SQL functions: snake_case `.sql` (e.g., `register_user.sql`)
- CSS: kebab-case `.css` (e.g., `fonts.css`)

**Directories:**
- API routes: kebab-case (e.g., `hero-availability/`, `team-invite/`)
- Route groups: parentheses (e.g., `(landing)`, `(everywhere-else)`)
- Dynamic segments: brackets (e.g., `[code]`)
- All lowercase

**Exports:**
- Page components: default export with PascalCase (e.g., `export default function Home()`)
- Non-page components: named exports with PascalCase (e.g., `export function CountdownTimer()`)
- Utilities: named exports with camelCase (e.g., `export function formatDate()`, `export function cn()`)
- Classes: named exports with PascalCase (e.g., `export class DatabaseConnectionError`)
- Constants: UPPER_SNAKE_CASE for top-level (e.g., `export const CONSTANTS`), camelCase for object properties

**Variables:**
- React state: camelCase (e.g., `isModalOpen`, `isRegistrationOpen`, `retryCount`)
- Database columns: snake_case (e.g., `full_name`, `team_id`, `hero_id`)

## Path Aliases

Use `@/` to reference anything under `src/`:
- `@/components` -> `src/components`
- `@/components/ui` -> `src/components/ui`
- `@/lib` -> `src/lib`
- `@/lib/utils` -> `src/lib/utils`
- `@/hooks` -> `src/hooks`

Always use the `@/` alias in imports. Never use relative paths like `../../lib/utils`.

## Where to Add New Code

**New Page:**
- Landing-related: `src/app/(landing)/` route group (gets minimal layout)
- All other pages: `src/app/(everywhere-else)/{route-name}/page.tsx` (gets navbar, footer, time restriction)
- Dynamic route: `src/app/(everywhere-else)/{route-name}/[param]/page.tsx`
- Create layout if needed: `src/app/(everywhere-else)/{route-name}/layout.tsx`

**New API Endpoint:**
- Create directory: `src/app/api/{endpoint-name}/`
- Add handler: `src/app/api/{endpoint-name}/route.ts`
- Nested endpoints: `src/app/api/{endpoint-name}/{sub-endpoint}/route.ts`
- Export named functions: `GET()`, `POST()`, `PUT()`, `DELETE()`
- Use `NextResponse` for responses, wrap in try-catch
- Import Supabase client: `import { createClient } from "@/lib/supabase"`
- Use `handleDatabaseError()` from `@/lib/supabase` for consistent error responses

**New Feature Component:**
- Place at: `src/components/{component-name}.tsx`
- Use kebab-case filename, PascalCase export
- Add `"use client"` directive if the component is interactive (uses hooks, event handlers, browser APIs)
- Compose with shadcn/ui primitives from `src/components/ui/`
- Use `cn()` from `@/lib/utils` for conditional class merging

**New UI Primitive:**
- Use CLI: `npx shadcn@latest add {component}`
- Auto-generates to: `src/components/ui/{component}.tsx`
- Do NOT manually create files in `src/components/ui/`

**New Custom Hook:**
- Place at: `src/hooks/use-{hook-name}.ts`
- Prefix filename and export with `use`
- Define return type interface

**New Utility/Helper:**
- Shared utilities: `src/lib/{utility-name}.ts`
- Constants/data: Add to `src/lib/constants.ts`
- Use named exports with JSDoc comments

**New SQL Function:**
- Place at: `src/supabase/functions/{function_name}.sql`
- Use snake_case naming

**New Static Asset:**
- Images/SVGs: `public/` or `public/assets/`
- Fonts: `public/fonts/` (register in `src/styles/fonts.css`)
- Hero character images: `public/hundred/` following `{NNN}_{Theme}-Five_{NN}-{Name}.png`

**Form/Validation Logic:**
- Define Zod schemas inside the component file or in `src/lib/schemas.ts` if reused
- Use `react-hook-form` with `@hookform/resolvers/zod`
- Wrap with shadcn's `<Form>` component from `@/components/ui/form`

## Special Directories

**`public/hundred/`:**
- Purpose: Themed hero character portrait images (21 themes x 5 characters = 105 images)
- Generated: No (manually created art assets)
- Committed: Yes
- Referenced by: `src/lib/constants.ts`

**`src/components/ui/`:**
- Purpose: shadcn/ui generated components
- Generated: Yes (via shadcn CLI)
- Committed: Yes
- Do not manually edit unless customizing a specific primitive

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (during `next build` or `next dev`)
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: Package dependencies
- Generated: Yes (via npm/bun install)
- Committed: No (in .gitignore)

**`.cursor/rules/`:**
- Purpose: Cursor IDE AI assistant rules
- Committed: Yes

---

*Structure analysis: 2026-03-25*
