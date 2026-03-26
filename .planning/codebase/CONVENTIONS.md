# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- Components use kebab-case: `character-selection-screen.tsx`, `multi-step-registration-form.tsx`, `team-drawer.tsx`
- UI primitives (shadcn/ui) use kebab-case in `src/components/ui/`: `button.tsx`, `dialog.tsx`, `radio-group.tsx`
- Lib utilities use kebab-case: `format-date.ts`, `google-sheets.ts`
- Hooks use kebab-case with `use-` prefix: `use-database-connection.ts`
- API routes use kebab-case directory names: `api/hero-availability/route.ts`, `api/team-invite/route.ts`
- Next.js page files follow App Router convention: `page.tsx`, `layout.tsx`, `route.ts`

**Functions:**
- Use camelCase for all functions: `createClient()`, `handleDatabaseError()`, `parseServiceAccountKey()`
- Prefix event handlers with `handle`: `handleConfirm()`, `handleHeroSelect()`, `handleJoinTeam()`
- Prefix boolean-returning helpers with `is` or `has`: `isHeroTaken()`, `isBase64()`
- Prefix data-fetching helpers with `get` or `fetch`: `getHeroDetails()`, `fetchTeamMembers()`

**Variables:**
- Use camelCase for variables and state: `selectedHero`, `teamMembers`, `isModalOpen`
- Use UPPER_SNAKE_CASE for module-level constants: `MAX_RETRIES`, `RETRY_DELAY`
- Boolean state variables use `is` or `has` prefix: `isOpen`, `isConnecting`, `isAllowed`, `isGeneratingLink`

**Types/Interfaces:**
- Use PascalCase for interfaces: `CharacterSelectionScreenProps`, `TeamMember`, `Registration`
- Props interfaces named `{ComponentName}Props`: `CharacterSelectionScreenProps`, `TeamDrawerProps`, `TimeRestrictionProps`
- No `I` prefix on interfaces
- Zod schemas use camelCase: `formSchema`
- Inferred types from Zod: `type FormValues = z.infer<typeof formSchema>`

**Constants:**
- All app constants live in a single `CONSTANTS` object exported from `src/lib/constants.ts`
- Access via `CONSTANTS.HEROES`, `CONSTANTS.TEAMS`, `CONSTANTS.HERO_IMAGE_PATHS`, `CONSTANTS.CG_LEADERS`

## Code Style

**Formatting:**
- No dedicated formatter config (no `.prettierrc` or `biome.json`)
- Default Next.js formatting conventions apply
- Double quotes for string imports and JSX attributes
- Semicolons at end of statements
- Trailing commas in multi-line objects and arrays
- 2-space indentation

**Linting:**
- Uses `next lint` (via `package.json` scripts): `npm run lint`
- No custom ESLint config file; relies on Next.js built-in ESLint rules

**TypeScript:**
- Strict mode enabled in `tsconfig.json` (`"strict": true`)
- Target ES2017, module resolution: bundler
- Path alias `@/*` maps to `./src/*`
- Explicit interface definitions for all component props
- Type assertions used sparingly: `(data as TeamMember[])`, `(error as { message?: string })`
- `Readonly<{ children: React.ReactNode }>` pattern for layout props
- Inline type annotations for `useState`: `useState<string>("")`, `useState<TeamMember[]>([])`

## Import Organization

**Order (observed in `src/components/multi-step-registration-form.tsx`):**
1. `"use client"` directive (always first line when present)
2. Internal `@/` imports alphabetically: `@/components/...`, `@/lib/...`, `@/hooks/...`
3. Third-party library imports: `@hookform/resolvers/zod`, `framer-motion`, `lucide-react`
4. Framework imports: `next/navigation`, `next/image`, `react`
5. Relative sibling imports: `./navbar`, `./footer`

Note: The order is not strictly enforced. Some files mix groupings. When adding imports, follow alphabetical order within `@/` imports, then third-party, then framework.

**Path Aliases:**
- `@/*` resolves to `./src/*` (defined in `tsconfig.json`)
- Always use `@/` alias imports from any file; never use relative paths like `../../lib/utils`
- Relative imports (`./navbar`) used only for sibling files in the same directory
- shadcn/ui aliases in `components.json`: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`

## Component Patterns

**Client vs Server Components:**
- Client components use `"use client"` directive: `src/components/character-selection-screen.tsx`, `src/components/registration-modal.tsx`, `src/components/multi-step-registration-form.tsx`, `src/app/(landing)/page.tsx`
- Server components (no directive) for layouts and simple presentational components: `src/components/navbar.tsx`, `src/components/footer.tsx`
- API routes are always server-side: `src/app/api/*/route.ts`
- Layouts export metadata as server components: `src/app/(landing)/layout.tsx`, `src/app/(everywhere-else)/layout.tsx`

**Component Export Style:**
- Named exports for reusable components: `export function CharacterSelectionScreen()`, `export function Footer()`, `export function RegistrationModal()`
- Default exports for pages and simple shared components: `export default function Home()`, `export default function Navbar()`, `export default function Registration()`
- UI primitives export component and variants: `export { Button, buttonVariants }`

**Component Structure Pattern:**
```typescript
"use client";

// Imports
import { ... } from "...";

// Types/interfaces defined at module level
interface ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  preselectedHero?: string;
}

// Helper functions at module level (above component)
const getHeroImagePath = (heroId: string, teamId: number) => { ... };

// Zod schemas at module level (for form components)
const formSchema = z.object({ ... });

// Component function
export function ComponentName({ isOpen, onClose, teamId }: ComponentProps) {
  // 1. State declarations
  const [state, setState] = useState<Type>(initial);

  // 2. Effects
  useEffect(() => { ... }, [deps]);

  // 3. Derived values / memos
  const derived = useMemo(() => ..., [deps]);

  // 4. Event handlers
  const handleAction = () => { ... };

  // 5. Internal helper functions
  const getComputedValue = () => { ... };

  // 6. Early returns for loading/closed states
  if (!isOpen) return null;

  // 7. JSX return
  return ( ... );
}
```

**Props Conventions:**
- Destructure props in function signature: `({ isOpen, onClose, teamId }: ComponentProps)`
- Callback props use `on` prefix: `onClose`, `onConfirm`, `onSuccess`
- Optional props use `?` in interface: `preselectedHero?: string`, `onSuccess?: (registration: any) => void`

**Animation Pattern (Framer Motion):**
- Use `motion.div`, `motion.section` for animated wrappers
- Standard entrance: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}`
- Staggered list items: `transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}`
- Conditional render transitions: `<AnimatePresence mode="wait">` wrapping conditional JSX
- Interactive feedback: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`

**Styling:**
- Tailwind CSS v4 with `tw-animate-css` plugin, no CSS modules or styled-components
- Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional/merged classes:
  ```typescript
  className={cn(
    "base-classes",
    isActive && "active-classes",
    isDisabled && "disabled-classes",
  )}
  ```
- shadcn/ui components (new-york style) with CSS variables for theming
- Dark theme by default: `bg-black text-[#BABABA]` as base
- Custom font class: `font-rumble` for display headings (loaded from `src/styles/fonts.css`)
- Hardcoded hex values: `text-[#BABABA]`, `bg-[#1A1A1A]`, `bg-[#18181b]`
- Team colors via custom Tailwind classes: `bg-team-01` through `bg-team-21`
- Responsive: mobile-first with `sm:` and `md:` breakpoints
- Icons from `lucide-react` only (configured in `components.json`)

## Form Handling

**Framework:** react-hook-form + zod + @hookform/resolvers

**Pattern:**
```typescript
// 1. Define Zod schema at module level
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  age: z.string().refine((val) => ["13", "14", "15", "16", "17"].includes(val), {
    message: "Please select a valid age between 13-17",
  }),
  gender: z.enum(["Male", "Female"], {
    required_error: "Please select your gender",
  }),
  optionalField: z.string().optional(),
}).refine((data) => {
  // Cross-field validation
  if (data.ymMember === "Yes") return !!data.cgLeader;
  return true;
}, { message: "CG Leader is required for YM members", path: ["cgLeader"] });

// 2. Infer type from schema
type FormValues = z.infer<typeof formSchema>;

// 3. Use in component with zodResolver
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... },
});
```

**Toast Notifications:**
- Use `sonner` library: `import { toast } from "sonner"`
- Provider: `<SonnerProvider />` at `src/components/sonner-provider.tsx`, placed in layout
- Position: `top-right`

## Error Handling

**API Routes (Server-side) - `src/app/api/*/route.ts`:**
- Wrap entire handler in try/catch
- Return `NextResponse.json({ error: "message" }, { status: code })` for errors
- Return `NextResponse.json({ success: true, data: result })` for success
- Log errors: `console.error("Descriptive context:", error)` before returning
- Status codes: 400 (validation), 404 (not found), 409 (conflict), 410 (expired), 500 (server error), 503 (service unavailable)
- Use `handleDatabaseError()` from `src/lib/supabase.ts` for Supabase errors

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!requiredField) {
      return NextResponse.json({ error: "Field is required" }, { status: 400 });
    }
    // ... business logic
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Descriptive context:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Database Error Handling (`src/lib/supabase.ts`):**
- Custom `DatabaseConnectionError` class extends `Error`
- Centralized `handleDatabaseError()` maps PostgreSQL/Supabase error codes:
  - `PGRST116` -> 404 (no rows)
  - `23505` -> 409 (unique violation)
  - `23503` -> 400 (foreign key violation)
  - Default -> 500
- Singleton Supabase client via `createClient()` with env var validation

**Client-side:**
- try/catch in async operations within `useEffect` or event handlers
- Errors logged with `console.error()`
- User-facing errors via `toast()` (sonner) or `Alert` component (shadcn)
- `useDatabaseConnection` hook (`src/hooks/use-database-connection.ts`) provides retry logic: max 3 retries, 2-second delay
- Loading states tracked with boolean `useState`: `loading`, `isConnecting`, `isGeneratingLink`

**Graceful Degradation:**
- Google Sheets sync failure does not fail registration (`src/app/api/sheets-sync/route.ts`)
- Registration API tries multiple fallback methods in sequence (`src/app/api/register/route.ts`)

## Data Access Pattern

**Supabase Client:**
- Singleton in `src/lib/supabase.ts`: `createClient()` returns cached instance
- Server-side usage in API routes: `const supabase = createClient()`
- Client-side usage directly in components inside `useEffect` (e.g., `src/components/character-selection-screen.tsx`)
- Database columns use snake_case: `line_number`, `hero_id`, `team_id`
- JavaScript variables use camelCase: `lineNumber`, `heroId`, `teamId`
- Manual mapping between snake_case DB columns and camelCase JS in API request/response bodies

**API Route Pattern:**
```typescript
import { createClient, handleDatabaseError } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("paramName");
    if (!param) {
      return NextResponse.json({ error: "Param is required" }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase.from("table").select("...").eq("col", param);
    if (error) {
      const errorResponse = handleDatabaseError(error);
      console.error("Context:", error);
      return NextResponse.json({ error: errorResponse.message }, { status: errorResponse.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    return NextResponse.json({ error: errorResponse.message }, { status: errorResponse.status });
  }
}
```

## Logging

**Framework:** `console.log` / `console.error` (no structured logging library)

**Patterns:**
- `console.error("Descriptive context:", error)` for error logging in API routes
- `console.log()` for debug info in utilities (e.g., `src/lib/google-sheets.ts` logs parsing attempts)
- No log levels or structured logging framework

## Comments

**When to Comment:**
- Section comments in JSX: `{/* Header */}`, `{/* Main content */}`, `{/* Footer */}`
- Inline comments for non-obvious logic: `// 7 days from now`, `// Check if line is already taken`
- Commented-out code left in place for unused fields (e.g., `src/app/api/register/route.ts`)

**JSDoc:**
- Used sparingly in utility functions: `src/lib/format-date.ts`, `src/lib/google-sheets.ts`
- Format: `@param` and `@returns` tags
- Add JSDoc only for utility/library functions, not components

## Function Design

**Size:** No enforced limit. Components range from 20 lines (`src/components/footer.tsx`) to 500+ lines (`src/components/multi-step-registration-form.tsx`). Helper functions 5-30 lines.

**Parameters:** Component props destructured in signature. Non-component functions use positional parameters.

**Return Values:**
- API routes return `NextResponse.json()` with status
- Utility functions return explicitly typed values
- Components return JSX or `null`
- Hooks return typed objects

## Module Design

**Exports:**
- One primary export per component file
- Named exports for reusable components; default exports for pages/layouts
- Multiple exports from a single module when logically grouped (e.g., `src/lib/supabase.ts`)
- `src/lib/constants.ts` exports a single `CONSTANTS` object

**Barrel Files:**
- Not used. Import directly from individual files.

## Layout Pattern (Next.js App Router)

**Route Groups:**
- `(landing)` at `src/app/(landing)/`: Landing page with its own layout (no navbar, footer in layout)
- `(everywhere-else)` at `src/app/(everywhere-else)/`: Registration/invite pages with shared layout (navbar, footer, time restriction gate, toast provider)

**Layout Composition:**
```typescript
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-[#BABABA] min-h-screen flex flex-col">
        <TimeRestriction>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <SonnerProvider />
        </TimeRestriction>
      </body>
      <GoogleAnalytics gaId="GTM-W5JTJM5Q" />
    </html>
  );
}
```

**Metadata:**
- Exported `Metadata` object in layout files (not page files)
- Full SEO: OpenGraph, Twitter cards, robots, icons, manifest
- Duplicated across both layout files

## Custom Hooks Pattern

**Convention:**
- File: `src/hooks/use-{feature}.ts`
- Named `use{Feature}` in camelCase
- Return a typed interface: `Use{Feature}Return`
- Use `useCallback` for stable function references
- Manage internal state with cleanup in `useEffect`

```typescript
interface UseDatabaseConnectionReturn {
  isConnecting: boolean;
  connectionError: string | null;
  retryConnection: () => Promise<boolean>;
  handleFetchError: (error: unknown) => Promise<boolean>;
}

export function useDatabaseConnection(): UseDatabaseConnectionReturn {
  // state, callbacks, effects
  return { isConnecting, connectionError, retryConnection, handleFetchError };
}
```

## UI Components (shadcn/ui)

**Config:** `components.json` at project root, style: `new-york`, RSC: `true`

**CVA Variant Pattern:**
```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "...", outline: "..." },
    size: { default: "...", sm: "...", lg: "...", icon: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({ className, variant, size, asChild = false, ...props }:
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }
) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

---

*Convention analysis: 2026-03-25*
