# Testing

## Current State

**No testing infrastructure exists in this codebase.**

- No test files found (`.test.ts`, `.spec.ts`, `__tests__/`)
- No testing framework configured (no jest, vitest, mocha, cypress, or playwright)
- No test scripts in `package.json`
- No testing-related dependencies

## Recommendations

### Unit/Component Testing
- Add **Vitest** (pairs well with Next.js/Vite ecosystem)
- Add **React Testing Library** for component tests
- Priority targets: form validation logic, registration flows, utility functions

### E2E Testing
- Add **Playwright** or **Cypress** for end-to-end testing
- Priority targets: registration flow, payment flow, navigation

### Integration Testing
- API route handlers (`src/app/api/`)
- Sanity CMS data fetching
- Stripe payment integration

## Impact

The lack of tests means:
- No regression protection when making changes
- Manual verification required for all features
- Higher risk for payment and registration flows
- Refactoring is risky without test coverage
