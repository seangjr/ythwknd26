# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- PascalCase for React components (e.g., `multi-step-registration-form.tsx`, `countdown-timer.tsx`)
- camelCase for utility/library files (e.g., `format-date.ts`, `google-sheets.ts`, `supabase.ts`)
- kebab-case for directory names (e.g., `/api/team-invite`, `/components/ui`)

**Functions:**
- camelCase for all function names, both exported and internal (e.g., `createClient`, `handleDatabaseError`, `parseServiceAccountKey`, `getHeroImagePath`)
- Prefix hooks with `use` (e.g., `useDatabaseConnection`)
- Async functions named with present-tense verbs (e.g., `createSheetsClient`, `retryConnection`)

**Variables:**
- camelCase for variable names (e.g., `isConnecting`, `connectionError`, `retryCount`, `targetDate`)
- CONSTANT_CASE for module-level constants (e.g., `MAX_RETRIES`, `RETRY_DELAY`)
- CONSTANTS exported object for application-wide configuration (`src/lib/constants.ts`)

**Types:**
- PascalCase for interface and type names (e.g., `UseDatabaseConnectionReturn`, `CountdownTimerProps`, `HeroDetailsProps`)
- Suffix interface definitions with `Props` for component props (e.g., `CountdownTimerProps`, `HeroDetailsProps`)
- No prefix like `I` before interface names

## Code Style

**Formatting:**
- Using Next.js built-in lint (uses ESLint under the hood)
- Run via: `npm run lint` (configured in `package.json`)
- No Prettier config file detected; relies on Next.js default formatting
- 2-space indentation (implicit from codebase)

**Linting:**
- ESLint configured through Next.js
- Command: `next lint`
- Strict TypeScript mode enabled (tsconfig.json: `"strict": true`)

## Import Organization

**Order:**
1. React/Next.js imports (e.g., `import React from "react"`, `import { useEffect, useState } from "react"`)
2. Third-party library imports (e.g., `import { motion } from "framer-motion"`, `import { useForm } from "react-hook-form"`)
3. Local/relative imports from `@/` aliases
4. Type-only imports at the end if needed (e.g., `type VariantProps from "class-variance-authority"`)

Example from `src/components/multi-step-registration-form.tsx`:
```typescript
"use client";

import { TeamMembersSubscription } from "@/components/team-members-subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CONSTANTS } from "@/lib/constants";
import { getRelativeTimeString } from "@/lib/format-date";
import { cn } from "@/lib/utils";
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` prefix for imports within the project structure
- Never use relative imports (e.g., `../../../lib/utils`) - always use alias paths

## Error Handling

**Patterns:**
- Custom error classes that extend `Error` with explicit `name` property (e.g., `DatabaseConnectionError` in `src/lib/supabase.ts`)
- Error handling functions return structured objects with `{ error, message, status }` for API routes
- Try-catch blocks wrap async operations; nested try-catch for fallback approaches
- Graceful degradation when external services fail (e.g., multiple registration function attempts in `src/app/api/register/route.ts`)
- Database errors categorized by SQL error code (e.g., `PGRST116` for "Not found", `23505` for "Unique violation")

Example from `src/lib/supabase.ts`:
```typescript
export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export function handleDatabaseError(error: unknown) {
  if (error instanceof DatabaseConnectionError) {
    return {
      error: 'Database connection error',
      message: error.message,
      status: 503,
    };
  }
  // ... additional error type handling
}
```

## Logging

**Framework:** `console` (native browser/Node.js API)

**Patterns:**
- `console.error()` for error logging in API routes and services
- `console.log()` for informational logging (e.g., credential structure, sync status)
- Error logs include context: `console.error("Direct insert error:", insertError)`
- Debug logs include operational context: `console.log("Google Sheets integration not configured, skipping sync")`
- No structured logging framework in use; all logs go directly to stdout

Example from `src/app/api/register/route.ts`:
```typescript
catch (insertError) {
  console.error("Direct insert error:", insertError);
  // ... fallback logic
}
```

## Comments

**When to Comment:**
- JSDoc/TSDoc comments for public functions and utility functions
- Inline comments for complex logic or non-obvious algorithm choices
- Section comments for major blocks within large components (e.g., `// Hero Section`, `// Event Details`)

**JSDoc/TSDoc:**
- Used in utility functions (e.g., `src/lib/format-date.ts`, `src/lib/google-sheets.ts`)
- Standard format: `@param` and `@returns` tags
- Example from `src/lib/format-date.ts`:
```typescript
/**
 * Formats a date string into a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
```

## Function Design

**Size:** Functions range from 5-50 lines typically; large components (e.g., `multi-step-registration-form.tsx` at 1,771 lines) contain multiple internal functions and component logic

**Parameters:**
- Typed parameters via TypeScript interfaces
- Component props extracted into explicit interfaces suffixed with `Props`
- Optional parameters clearly marked with `?` in types and destructuring defaults (e.g., `className?: string; className = ""`)

**Return Values:**
- Explicit return types in function signatures (e.g., `: Promise<boolean>`, `: UseDatabaseConnectionReturn`)
- API routes return `NextResponse.json()` with status codes
- Utility functions return typed values (e.g., `string`, `{ days: number; hours: number; ... }`)

## Module Design

**Exports:**
- Named exports for utilities and components (e.g., `export function createClient()`, `export function CountdownTimer()`)
- Default exports for top-level page/layout components (e.g., `export default function Home()`)
- Multiple exports from single module when logically grouped (e.g., `supabase.ts` exports both `createClient` and `handleDatabaseError`)

**Barrel Files:**
- Not extensively used; components import directly from specific component files
- No index.ts barrel files detected in major directories

## Component-Specific Patterns

**Client Components:**
- Use `"use client"` directive at top of files (e.g., `src/components/multi-step-registration-form.tsx`)
- Props passed explicitly via interface definitions
- Hooks (useState, useEffect, useCallback) used for state management
- React Hook Form (`useForm`) for form state in registration components

**Server Components:**
- API routes in `src/app/api/` use async request handlers
- Direct database access via Supabase client in API routes
- POST/GET HTTP methods as named exports

**UI Components (shadcn/ui):**
- Located in `src/components/ui/`
- Export component and variants (e.g., `export { Button, buttonVariants }`)
- Use `class-variance-authority` (CVA) for variant management
- Integrate with Radix UI primitives (e.g., `@radix-ui/react-dialog`)

## Type Safety

**Configuration:**
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- Path aliases for clean imports: `"@/*": ["./src/*"]`
- Type checking runs before build and on file changes

**Pattern Usage:**
- Prefer type inference where clear; explicit types for function parameters and returns
- Use `unknown` then narrow types in error handling rather than `any`
- Component props always explicitly typed via interfaces

## Data Validation

**Schema Validation:**
- Zod schemas for form validation (e.g., `formSchema` in `multi-step-registration-form.tsx`)
- Zod resolver with React Hook Form: `zodResolver(formSchema)`
- Runtime validation of email, age, required fields at form submission

**API Validation:**
- Required field checks at API route entry (e.g., `if (!lineNumber || !email || !fullName || !heroId || !teamId)`)
- Unique constraints checked via database queries (e.g., checking email uniqueness in `register` route)

---

*Convention analysis: 2026-03-25*
