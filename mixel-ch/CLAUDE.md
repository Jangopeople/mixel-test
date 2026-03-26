# Mixel.ch

## Tech Stack
DOC-002

Web Application (Vite + React + Convex + Cloudflare)

## Tech Debt Priorities (Audit: March 2026)

This project has **37 tech debt items** identified. Scoring uses: Priority = (Impact + Risk) x (6 - Effort).

When working on this codebase, prioritize fixes in this order:

### HIGH (Fix This Sprint)

- **[TEST-001] Zero Test Coverage** (Score: 25)
  Fix: Implement Vitest + @testing-library/react. Target 60%+ coverage on Convex functions and critical components. Start with offer calculation and auth logic.

- **[INFRA-001] No CI/CD Pipeline (Manual Deploys)** (Score: 25)
  Fix: Create .github/workflows/ci.yml and deploy.yml. Run on PRs: lint, type check, build, test. Deploy on main merge automatically.

- **[INFRA-006] No Rollback Strategy** (Score: 22)
  Fix: Create separate staging deployment. Add manual approval step in CI/CD before prod deploy. Document rollback process.

- **[CODE-001] Duplicated Auth Lookup Logic in Convex Functions** (Score: 21)
  Fix: Extract requireAccountingAccess() to a shared utility module (/convex/utils/auth.ts). Reduces duplication, improves maintainability, and ensures consistency across all accounting operations.

- **[ARCH-005] No Service/Business Logic Layer** (Score: 21)
  Fix: Create /convex/services/ with OfferService, ClientService, UserService. Move business logic there, leave functions as thin API endpoints.

- **[TEST-002] No Integration Tests** (Score: 21)
  Fix: Create integration tests for complete workflows using Convex test helpers.

- **[ARCH-001] No Separation Between Auth Concerns** (Score: 20)
  Fix: Refactor users.ts to focus on user data mutations. Create /convex/auth-utils.ts for permission checking. Move getPortalAccessMap() and requireAccountingAccess() there.

- **[TEST-003] No Component Tests** (Score: 20)
  Fix: Add @testing-library/react and write tests for form dialogs, accounting pages, and critical UI flows.

### Quick Wins (Effort 1-2)

- [CODE-001] Duplicated Auth Lookup Logic in Convex Functions (Score: 21, Effort: 2)
- [INFRA-003] No Monitoring or Error Tracking (Score: 19, Effort: 2)
- [DOC-001] No README.md or Project Documentation (Score: 17, Effort: 2)
- [DEP-003] Missing Dev Dependencies for Testing (Score: 16, Effort: 1)
- [INFRA-002] No Environment Configuration Management (Score: 16, Effort: 2)
- [DOC-002] No API Documentation (Score: 14, Effort: 2)
- [DOC-004] No Deployment Documentation (Score: 14, Effort: 2)
- [CODE-002] Duplicated Portal Access Map Construction (Score: 13, Effort: 2)
- [INFRA-007] No Performance Monitoring (Score: 13, Effort: 2)
- [ARCH-003] No Shared Error Handling Strategy (Score: 12, Effort: 2)

### Full Breakdown by Category

#### Code Debt (8 items)

- [CODE-001] Duplicated Auth Lookup Logic in Convex Functions — HIGH (21)
- [CODE-002] Duplicated Portal Access Map Construction — MEDIUM (13)
- [CODE-003] Duplicated Item Calculation Logic (Offers) — MEDIUM (11)
- [CODE-004] Hardcoded Validation Strings and Status Literals — MEDIUM (10)
- [CODE-005] Missing Form Validation Abstraction — LOW (8)
- [CODE-006] Duplicated Error Handling Pattern — LOW (7)
- [CODE-007] Magic Numbers in Date Formatting and Calculations — LOW (5)
- [CODE-008] Weak Type Safety in Convex Query Filters — LOW (5)

#### Architecture Debt (8 items)

- [ARCH-005] No Service/Business Logic Layer — HIGH (21)
- [ARCH-001] No Separation Between Auth Concerns — HIGH (20)
- [ARCH-002] No Dedicated Data Access Layer (DAL) — MEDIUM (18)
- [ARCH-008] No Pagination in List Queries — MEDIUM (17)
- [ARCH-006] No Frontend State Management Pattern — MEDIUM (15)
- [ARCH-004] Missing API Input Validation Layer — MEDIUM (14)
- [ARCH-003] No Shared Error Handling Strategy — MEDIUM (12)
- [ARCH-007] Inconsistent Import Paths — LOW (5)

#### Test Debt (4 items)

- [TEST-001] Zero Test Coverage — HIGH (25)
- [TEST-002] No Integration Tests — HIGH (21)
- [TEST-003] No Component Tests — HIGH (20)
- [TEST-004] No Error Scenario Tests — MEDIUM (18)

#### Dependency Debt (5 items)

- [DEP-003] Missing Dev Dependencies for Testing — MEDIUM (16)
- [DEP-001] High Volume of Radix UI Components Bundled — MEDIUM (12)
- [DEP-004] No Type Safety for Convex Generated Code — MEDIUM (12)
- [DEP-005] Outdated Convex Version (1.31.3) — LOW (7)
- [DEP-002] Large i18n Setup with Unused Locales — LOW (5)

#### Documentation Debt (5 items)

- [DOC-001] No README.md or Project Documentation — MEDIUM (17)
- [DOC-002] No API Documentation — MEDIUM (14)
- [DOC-004] No Deployment Documentation — MEDIUM (14)
- [DOC-003] No Architecture Documentation — MEDIUM (13)
- [DOC-005] No Contributing Guidelines — LOW (7)

#### Infrastructure Debt (7 items)

- [INFRA-001] No CI/CD Pipeline (Manual Deploys) — HIGH (25)
- [INFRA-006] No Rollback Strategy — HIGH (22)
- [INFRA-003] No Monitoring or Error Tracking — MEDIUM (19)
- [INFRA-002] No Environment Configuration Management — MEDIUM (16)
- [INFRA-007] No Performance Monitoring — MEDIUM (13)
- [INFRA-004] No Infrastructure as Code — MEDIUM (12)
- [INFRA-005] No Build Optimization — MEDIUM (10)

### Remediation Phases

1. **Immediate (Week 1-2):** 0 critical items — security, data integrity, compliance
2. **Short-term (Week 3-6):** 8 high-priority items — architecture, test coverage
3. **Medium-term (Week 7-12):** 21 medium items — refactoring, dependency updates
4. **Long-term (Week 13+):** 8 low items — polish, documentation

## Rules

- Before refactoring any file, check if it has related tech debt items above
- When fixing a tech debt item, mark it with a comment: `// TECHDEBT-FIXED: [ID]`
- Always add or update tests when fixing code debt or architecture debt
- Never introduce new `any` types, `@ts-ignore`, or `@ts-nocheck`
- Run the linter and type checker after every change
- Prefer small, focused commits — one tech debt item per commit
