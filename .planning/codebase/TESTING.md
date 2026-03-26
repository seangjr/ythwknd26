# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework

**Status:** No test framework currently configured

- No test runner installed (Jest, Vitest, Playwright, etc.)
- No test files present in codebase (no `.test.ts`, `.spec.ts`, etc.)
- No test configuration files (`jest.config.js`, `vitest.config.ts`, etc.)
- No testing dependencies in `package.json`

**Current State:**
The codebase relies on:
- TypeScript strict mode for static type checking (`"strict": true` in `tsconfig.json`)
- Next.js built-in linting (`npm run lint` via ESLint)
- Manual/QA testing only

## Recommended Testing Setup

If testing is to be added to this project, the following are recommendations based on the tech stack:

**Unit Testing:**
- Framework: Vitest (lightweight, fast, TypeScript-native alternative to Jest)
- Assertion library: Vitest built-in (uses Node's assert) or Chai
- Setup: `npm install -D vitest @vitest/ui`

**Component Testing:**
- Framework: Vitest + React Testing Library
- Setup: `npm install -D @testing-library/react @testing-library/jest-dom`

**API Route Testing:**
- Framework: Vitest with MSW (Mock Service Worker) for mocking Supabase
- Approach: Test API route handlers directly or via `http` supertest

**E2E Testing:**
- Framework: Playwright (recommended for Next.js)
- Setup: `npm install -D @playwright/test`

## Current Test Structure (None)

The codebase has no existing test files or test structure to document.

## Test File Organization

If tests were to be added, recommended structure:

**Location:** Co-located with source (preferred for Next.js)
```
src/
├── lib/
│   ├── supabase.ts
│   └── supabase.test.ts          # Test file next to source
├── components/
│   ├── button.tsx
│   └── button.test.tsx            # Component tests
├── app/
│   └── api/
│       ├── register/
│       │   ├── route.ts
│       │   └── route.test.ts      # API route tests
```

**Alternative Structure:** Separate test directory
```
src/ (source)
tests/ (tests)
├── unit/
│   ├── lib/
│   ├── utils/
├── integration/
│   └── api/
├── e2e/
```

## Mocking Patterns

Based on codebase dependencies and usage patterns, mocking would follow these approaches:

**Database Mocking:**
- Mock Supabase client (`@supabase/supabase-js`)
- Mock calls to `.from("table").select()`, `.insert()`, `.update()`, `.rpc()`
- Example for testing `src/lib/supabase.ts`:
```typescript
import { vi, describe, it, expect } from 'vitest';
import { createClient, handleDatabaseError } from '@/lib/supabase';

describe('createClient', () => {
  it('should return a Supabase client', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');

    const client = createClient();
    expect(client).toBeDefined();
  });
});
```

**External API Mocking:**
- Mock Google Sheets API (`googleapis` package)
- Use MSW (Mock Service Worker) for intercepting HTTP calls
- Mock `fetch()` calls in hook tests (e.g., `/api/health-check` in `useDatabaseConnection`)

**Form Testing:**
- Mock React Hook Form behavior
- Mock Zod validation schemas
- Test form submission and validation messages

**What to Mock:**
- External service calls (Supabase, Google Sheets, APIs)
- Environment variables
- Browser APIs (localStorage, sessionStorage if used)
- Timers and intervals (`setTimeout`, `setInterval`)

**What NOT to Mock:**
- React Hook Form core logic (test with real form)
- Zod schema validation (use real schemas to test parsing)
- React Router and navigation (test navigation flow)
- Component rendering (test DOM output)

## Fixtures and Factories

No test fixtures currently exist. If added, recommended patterns:

**Test Data Factories (Example for registrations):**
```typescript
// tests/fixtures/registration.factory.ts
export const createMockRegistration = (overrides = {}) => ({
  email: 'test@example.com',
  fullName: 'Test User',
  age: 16,
  gender: 'Male',
  nricPassport: '123456789',
  contactNumber: '0123456789',
  schoolName: 'Test School',
  ymMember: true,
  heroId: 'alex',
  teamId: 1,
  ...overrides,
});
```

**Test Fixtures Location:**
- `tests/fixtures/` for factory functions
- `tests/mocks/` for mock data and MSW handlers
- `tests/helpers/` for test utilities

## Coverage

**Current Coverage:** No coverage reporting configured

**Recommendations if testing is added:**
- Target: 70-80% coverage minimum
- Focus on critical paths: registration flow, database operations, API routes
- Run: `vitest --coverage`
- Report format: Use `v8` or `c8` coverage reporter

## Test Types

### Unit Tests (If Implemented)

**Scope:** Individual functions and utilities
- Test pure functions in `src/lib/` (e.g., `formatDate`, `getRelativeTimeString`, `cn`)
- Test error handling functions (e.g., `handleDatabaseError`, `parseServiceAccountKey`)
- Test hooks in isolation (e.g., `useDatabaseConnection`)

**Example for `src/lib/format-date.ts`:**
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, getRelativeTimeString } from '@/lib/format-date';

describe('formatDate', () => {
  it('should format ISO date string to readable format', () => {
    const result = formatDate('2025-05-11T12:30:00Z');
    expect(result).toBe('May 11, 2025 at 12:30 PM');
  });

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid')).toBe('');
    expect(formatDate('')).toBe('');
  });
});

describe('getRelativeTimeString', () => {
  it('should return "just now" for recent timestamps', () => {
    const now = new Date();
    const result = getRelativeTimeString(now.toISOString());
    expect(result).toBe('just now');
  });
});
```

### Component Tests (If Implemented)

**Scope:** React component rendering and interaction
- Test UI components in `src/components/ui/` for proper rendering
- Test form components for submission and validation
- Test interactive components (e.g., `CountdownTimer`, `HeroDetails`)

**Example for `src/components/countdown-timer.tsx`:**
```typescript
import { render, screen } from '@testing-library/react';
import { CountdownTimer } from '@/components/countdown-timer';

describe('CountdownTimer', () => {
  it('should render countdown time', () => {
    const futureDate = new Date(Date.now() + 86400000); // 1 day from now
    render(<CountdownTimer targetDate={futureDate} />);

    expect(screen.getByText(/day/i)).toBeInTheDocument();
  });
});
```

### Integration Tests (If Implemented)

**Scope:** API routes and database interactions
- Test `src/app/api/register/route.ts` with mocked Supabase
- Test email uniqueness check and line number assignment
- Test hero availability validation

**Example for `/api/register`:**
```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/register/route';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    })),
  })),
}));

describe('POST /api/register', () => {
  it('should return 400 for missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 409 if email already registered', async () => {
    // ... test with mocked duplicate email
  });
});
```

### E2E Tests (If Implemented)

**Scope:** Full user flows
- Test registration flow from form submission to success page
- Test team invite acceptance and joining
- Test hero selection and availability

**Recommended Framework:** Playwright

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('should complete registration flow', async ({ page }) => {
  await page.goto('http://localhost:3000/register');

  // Fill form
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="fullName"]', 'Test User');

  // Submit
  await page.click('button:has-text("Register")');

  // Verify success
  await expect(page).toHaveURL('/success');
});
```

## Common Testing Patterns

### Async Testing

If implemented, patterns for testing async operations:

```typescript
describe('async operations', () => {
  it('should handle async API calls', async () => {
    const { retryConnection } = useDatabaseConnection();
    const result = await retryConnection();
    expect(result).toBe(true);
  });

  it('should handle promise rejection', async () => {
    const rejected = Promise.reject(new Error('Network error'));
    await expect(rejected).rejects.toThrow('Network error');
  });
});
```

### Error Testing

Patterns for testing error handling (based on current code structure):

```typescript
describe('error handling', () => {
  it('should handle DatabaseConnectionError', () => {
    const error = new DatabaseConnectionError('Connection failed');
    const result = handleDatabaseError(error);

    expect(result.status).toBe(503);
    expect(result.error).toBe('Database connection error');
  });

  it('should handle Supabase unique violation error', () => {
    const supabaseError = { code: '23505', message: 'Duplicate key' };
    const result = handleDatabaseError(supabaseError);

    expect(result.status).toBe(409);
    expect(result.error).toBe('Conflict');
  });

  it('should handle unknown errors gracefully', () => {
    const result = handleDatabaseError(new Error('Unknown'));
    expect(result.status).toBe(500);
  });
});
```

### Form Testing Pattern

Based on `multi-step-registration-form.tsx` usage:

```typescript
describe('form validation', () => {
  it('should validate email format', async () => {
    // Form would use Zod schema
    const schema = z.object({
      email: z.string().email(),
    });

    const validEmail = { email: 'test@example.com' };
    const result = schema.safeParse(validEmail);
    expect(result.success).toBe(true);

    const invalidEmail = { email: 'invalid' };
    const result2 = schema.safeParse(invalidEmail);
    expect(result2.success).toBe(false);
  });
});
```

---

*Testing analysis: 2026-03-25*
