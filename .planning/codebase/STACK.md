# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.x - Application source code, type safety across all components
- JSX/TSX - React components using TypeScript

**Secondary:**
- JavaScript (ES2017 target) - Build tooling and configuration files

## Runtime

**Environment:**
- Node.js >=20.0.0 (minimum requirement)

**Package Manager:**
- npm 11.3.0
- Lockfile: `bun.lock` present (Bun used for development/packaging)

## Frameworks

**Core:**
- Next.js 15.3.1 - React meta-framework with Server Components, API routes, Image optimization
- React 19.0.0 - UI library
- React DOM 19.0.0 - React rendering

**Testing:**
- Not detected in dependencies

**Build/Dev:**
- TypeScript 5 - Type checking
- Tailwind CSS 4 (via @tailwindcss/postcss) - Utility-first CSS framework
- PostCSS 4 - CSS processing with Tailwind
- Next.js built-in development server with Turbopack (`--turbopack` flag in dev script)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.49.4 - PostgreSQL database client and backend-as-a-service
- googleapis 148.0.0 - Google Sheets API integration for data synchronization
- zod 3.24.3 - Schema validation library for runtime type validation

**UI/Forms:**
- react-hook-form 7.56.1 - Form state management and validation
- @hookform/resolvers 5.0.1 - Resolver adapters for form validation with Zod
- @radix-ui/react-dialog 1.1.11 - Accessible dialog components
- @radix-ui/react-label 2.1.4 - Accessible label components
- @radix-ui/react-radio-group 1.3.4 - Radio button group components
- @radix-ui/react-select 2.2.2 - Accessible select/dropdown components
- @radix-ui/react-tooltip 1.2.4 - Tooltip components
- @radix-ui/react-slot 1.2.0 - Slot primitive for component composition
- class-variance-authority 0.7.1 - Type-safe component variant management
- clsx 2.1.1 - Conditional CSS class utility
- tailwind-merge 3.2.0 - Merge Tailwind class names safely

**Animation & UI Enhancement:**
- framer-motion 12.10.0 - Animation and motion library
- sonner 2.0.3 - Toast notification library
- lucide-react 0.503.0 - Icon library
- next-themes 0.4.6 - Dark mode and theme management

**Third-party Services:**
- @next/third-parties 15.3.2 - Next.js integration for Google Analytics and other third-party services

## Configuration

**Environment:**
Environment variables required (configured via `.env.local` not tracked in git):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public client key)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public API key
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google service account credentials (JSON, may be Base64 encoded)
- `GOOGLE_SHEET_ID` - Google Sheets spreadsheet ID for registration sync

**Build:**
- `next.config.ts` - Next.js configuration with image optimization settings
- `tsconfig.json` - TypeScript compiler options with `@/*` path alias
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS
- `tailwind.config` (implicit) - Tailwind CSS configuration

**Image Optimization:**
- Allowed domain: `ythwknd.ymfgakl.com`
- Format: WebP (preferred)
- Device sizes: 640, 750, 828, 1080, 1200, 1920, 2048, 3840px
- Image sizes: 16, 32, 48, 64, 96, 128, 256, 384px

## Platform Requirements

**Development:**
- Node.js 20.0.0 or higher
- npm 11.3.0 or compatible package manager
- Code editor with TypeScript support recommended

**Production:**
- Node.js runtime environment (Vercel recommended for Next.js deployment)
- Environment variables configured at deployment platform
- Outbound HTTPS connectivity to:
  - Supabase API endpoints
  - Google Sheets API
  - ythwknd.ymfgakl.com (image domain)

**Development Scripts:**
```bash
npm run dev        # Start development server with Turbopack
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run Next.js linting
```

---

*Stack analysis: 2026-03-25*
