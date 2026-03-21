# MIXEL AI Operational Guardrails

## Non-Negotiable Rules
- Chat is strictly project-scoped. Never mix project context.
- Pipeline execution must never start from plain chat text.
- Build execution starts only after explicit `/approve`.
- If no project is selected, return a scoped error and stop.
- Never fall back to global chat/job history.

## Chat Flow (Required)
1. User sends request in a selected project thread.
2. Planning Agent (Sonnet) generates a Build Brief or asks up to 3 clarifying questions.
3. Designer Agent (Opus) generates full Build Plan.
4. User reviews output.
5. User runs `/approve` to queue the job.

## Supported Commands
- `/switch <project-name>`: switch active project in UI.
- `/status`: show project status.
- `/brief`: show latest Build Brief.
- `/plan`: show latest Build Plan.
- `/approve`: approve plan and queue pipeline job.
- `/reset confirm`: clear current thread conversation.

## Data Model
- `chat_threads` + `chat_messages`: per-thread project chat history.
- `project_memory`: project-scoped planning memory.
- `build_briefs`: stored brief/plan with status (`draft|approved|executing`).

## UX Foundation Rules
- Use fluid page widths across the app (avoid narrow centered containers on desktop).
- Keep chat and preview as a split workspace with the preview pane prioritized for width.
- Keep project context controls pinned at the top of the chat workspace.

## Preview Rules
- Use inline iframe preview first when the target app allows framing.
- Provide mirror preview fallback at `/api/preview/frame?url=...` for apps that block framing headers.
- Keep external "Open Live Preview" as backup, not the default path.
- Auto-refresh preview while runs are active.

## Repository-Aware Agent Rules
- Codebase verification questions (for example: "was X implemented?") must use Repository Agent mode.
- Repository Agent answers must cite concrete file paths when evidence exists.
- If evidence is missing, answer explicitly with "Not found in current repo context".
- `GITHUB_TOKEN` must be set in Convex production env for private repo lookup.

## Failure Prevention
- Never query chat messages/jobs without `projectId` or `threadId` filter.
- Never auto-detect target project from message content.
- Never create `CREATE_APP`/`IMPROVE_APP` jobs before `/approve`.


# Mixel AI

## Tech Stack
convex, apps, packages)",

## Tech Debt Priorities (Audit: March 2026)

This project has **40 tech debt items** identified. Scoring uses: Priority = (Impact + Risk) x (6 - Effort).

When working on this codebase, prioritize fixes in this order:

### CRITICAL (Fix Immediately)

- **[TEST-001] Only 4 test files in entire monorepo** (Score: 40)
  Only 4 .test.ts/.spec.ts files found across 268 TypeScript files (1.5% coverage). Most test files are in worktrees, not main codebase:
- apps/web/tests/smoke.spec.ts (playwright e2e)
- agent/src/core/
  Fix: Implement test framework: jest for unit, vitest for convex/backend. Establish minimum 70% coverage. Add tests for: convex mutations/queries, agent roles, backend endpoints.

- **[TEST-002] No unit tests for critical convex functions** (Score: 36)
  High-risk functions with no tests: claudeChat action (1649 lines, handles Claude API calls), projects mutations (schema changes, state transitions), pipeline state validators.
  Fix: Add unit tests for: claudeChat Claude API retry logic, projects.ts state transitions, validator edge cases. Mock Convex API for testing.

- **[DEP-006] Credentials potentially exposed in .env.local** (Score: 35)
  .env.local tracked in repo with real Cloudflare API token + Account ID visible in plaintext. Credentials need rotation immediately.
  Fix: URGENT: Rotate all credentials in .env.local immediately. Add .env.local to .gitignore. Use GitHub Secrets for CI/CD. Run secret scanner on git history.

- **[SEC-001] Real credentials exposed in version control** (Score: 35)
  .env.local contains plaintext Cloudflare API Token and Account ID (visible in audit output). This is a critical security issue.
  Fix: URGENT: 1) Rotate all Cloudflare credentials. 2) Add .env.local to .gitignore. 3) Run git-secrets or truffleHog to scan history. 4) Use GitHub Secrets for CI/CD.

### HIGH (Fix This Sprint)

- **[CODE-001] Massive worktree duplication and backups** (Score: 28)
  Fix: Delete all .worktrees/ and .env.bak.* files. If needed, use git worktree properly or create separate branches. Add .worktrees to .gitignore.

- **[ARCH-001] Unclear separation between convex and backend workspaces** (Score: 28)
  Fix: Document clear boundary: Convex = data model + server-side logic, Backend = HTTP API + auth gateway. Move API orchestration to backend. Consider merging into single 'server' workspace if overlap.

- **[CODE-001] Massive worktree duplication and backups (457MB+)** (Score: 28)

- **[ARCH-003] Unclear state machine definition across convex and agent** (Score: 27)
  Fix: Extract state machine to @shared/state-machine package. Single source of truth exported to both convex and agent. Validate at convex boundary.

- **[DEP-004] No dependency security scanning in CI/CD** (Score: 26)
  Fix: Add 'pnpm audit' to CI. Enable Dependabot or Snyk for automated PRs. Document why overrides are needed; migrate off vulnerable packages.

- **[CODE-003] Multiple oversized source files** (Score: 24)
  Fix: Refactor claudeChat.ts into: claudeChat.handlers.ts (actions), claudeChat.types.ts (types), claudeChat.utils.ts (helpers). Similar split for projects.ts and useConvexData.ts. Target <800 lines per fil

- **[TEST-004] No contract tests between agent and Convex** (Score: 21)
  Fix: Add Pact contract tests for agent ↔ Convex calls. Test each action signature and return types. Run in CI.

- **[INFRA-002] Deploy scripts are complex shell scripts without error handling** (Score: 21)
  Fix: Migrate deployment logic to TypeScript using a tool like pkg-install/tsx. Add validation, error logging, dry-run mode, rollback safety. Create deployment.ts as single source of truth.

### Quick Wins (Effort 1-2)

- [DEP-006] Credentials potentially exposed in .env.local (Score: 35, Effort: 2)
- [CODE-001] Massive worktree duplication and backups (Score: 28, Effort: 2)
- [DEP-004] No dependency security scanning in CI/CD (Score: 26, Effort: 2)
- [TEST-003] test.sh script exists but test suite status unclear (Score: 18, Effort: 2)
- [SEC-003] Known vulnerabilities in overridden dependencies (Score: 18, Effort: 2)
- [ARCH-002] Inconsistent workspace paths cause confusion (Score: 16, Effort: 2)
- [INFRA-001] CI/CD pipeline lacks comprehensive checks (Score: 16, Effort: 2)
- [INFRA-003] Scattered .env files across workspaces with no central schema (Score: 16, Effort: 2)
- [SEC-002] No runtime validation of required environment variables (Score: 16, Effort: 2)
- [CODE-004] Hardcoded constants scattered throughout codebase (Score: 15, Effort: 2)

### Full Breakdown by Category

#### Code Debt (9 items)

- [CODE-001] Massive worktree duplication and backups — HIGH (28)
- [CODE-001] Massive worktree duplication and backups (457MB+) — HIGH (28)
- [CODE-003] Multiple oversized source files — HIGH (24)
- [CODE-005] Duplicated error handling and retry logic — MEDIUM (18)
- [CODE-004] Hardcoded constants scattered throughout codebase — MEDIUM (15)
- [CODE-006] Mixed module formats and import styles across workspaces — MEDIUM (15)
- [CODE-007] 738 console.log/error statements without structured logging — MEDIUM (15)
- [CODE-002] 18 unused function_spec*.json artifacts (102KB) — MEDIUM (10)
- [CODE-008] Backup artifacts and cleanup directories cluttering root — LOW (8)

#### Architecture Debt (6 items)

- [ARCH-001] Unclear separation between convex and backend workspaces — HIGH (28)
- [ARCH-003] Unclear state machine definition across convex and agent — HIGH (27)
- [ARCH-004] Packages workspace underutilized (only ui + shared, minimal content) — MEDIUM (18)
- [ARCH-005] Inconsistent type definitions across workspaces — MEDIUM (18)
- [ARCH-002] Inconsistent workspace paths cause confusion — MEDIUM (16)
- [ARCH-006] Minimal turbo.json pipeline - missing caching & dependencies — MEDIUM (12)

#### Test Debt (4 items)

- [TEST-001] Only 4 test files in entire monorepo — CRITICAL (40)
- [TEST-002] No unit tests for critical convex functions — CRITICAL (36)
- [TEST-004] No contract tests between agent and Convex — HIGH (21)
- [TEST-003] test.sh script exists but test suite status unclear — MEDIUM (18)

#### Dependency Debt (6 items)

- [DEP-006] Credentials potentially exposed in .env.local — CRITICAL (35)
- [DEP-004] No dependency security scanning in CI/CD — HIGH (26)
- [DEP-005] Large transitive dependency tree (pnpm-lock.yaml 436MB) — MEDIUM (14)
- [DEP-002] Convex version pinning inconsistency — MEDIUM (12)
- [DEP-001] Inconsistent TypeScript versions across workspaces — MEDIUM (10)
- [DEP-003] Claude SDK versions vary significantly — MEDIUM (10)

#### Documentation Debt (5 items)

- [DOC-001] Sparse workspace-level README files — MEDIUM (12)
- [DOC-003] Architecture docs incomplete and scattered — MEDIUM (12)
- [DOC-004] API.md is minimal (595 bytes), no endpoint documentation — MEDIUM (12)
- [DOC-005] Minimal inline code documentation for complex logic — MEDIUM (12)
- [DOC-002] CLAUDE.md contains product requirements, not dev guidelines — LOW (8)

#### Infrastructure Debt (10 items)

- [SEC-001] Real credentials exposed in version control — CRITICAL (35)
- [INFRA-002] Deploy scripts are complex shell scripts without error handling — HIGH (21)
- [INFRA-004] No structured logging or observability infrastructure — MEDIUM (18)
- [SEC-003] Known vulnerabilities in overridden dependencies — MEDIUM (18)
- [INFRA-001] CI/CD pipeline lacks comprehensive checks — MEDIUM (16)
- [INFRA-003] Scattered .env files across workspaces with no central schema — MEDIUM (16)
- [SEC-002] No runtime validation of required environment variables — MEDIUM (16)
- [INFRA-006] Docker setup exists but underutilized — MEDIUM (14)
- [SEC-004] No API authentication documentation — MEDIUM (14)
- [INFRA-005] Unclear local dev setup; docs missing prerequisites — MEDIUM (10)

### Remediation Phases

1. **Immediate (Week 1-2):** 4 critical items — security, data integrity, compliance
2. **Short-term (Week 3-6):** 8 high-priority items — architecture, test coverage
3. **Medium-term (Week 7-12):** 26 medium items — refactoring, dependency updates
4. **Long-term (Week 13+):** 2 low items — polish, documentation

## Rules

- Before refactoring any file, check if it has related tech debt items above
- When fixing a tech debt item, mark it with a comment: `// TECHDEBT-FIXED: [ID]`
- Always add or update tests when fixing code debt or architecture debt
- Never introduce new `any` types, `@ts-ignore`, or `@ts-nocheck`
- Run the linter and type checker after every change
- Prefer small, focused commits — one tech debt item per commit

## Security Rules — Never Break These

These rules exist because a full security audit (2026-03-21) found critical vulnerabilities that have since been fixed. Do NOT reintroduce them.

### 🔴 Secrets — Absolute Rules
- **NEVER commit .env, .env.local, .env.production, or any file containing API keys, tokens, or passwords to git.** These are excluded in .gitignore — keep them excluded.
- **NEVER hardcode API keys, tokens, or credentials in source files.** Use environment variables only.
- **NEVER add `*.p8`, `*.pem`, `*.key`, or other private key files to git.**
- If you accidentally commit a secret: immediately run `git filter-repo --invert-paths --path <file> --force` and force-push, then rotate the exposed credential.
- Use `.env.example` (with placeholder values) to document required variables — this file IS committed.

### 🔴 Convex Backend — Auth Requirements
- **Every `query` and `mutation` that touches user data MUST call `ctx.auth.getUserIdentity()` and throw if null.**
- **Never return unscoped table data.** Every `.collect()` or `.take()` must be preceded by a filter scoped to the authenticated user's ID, tenant ID, or org ID.
- **Never expose internal Convex functions as public actions.** Use `internalQuery` / `internalMutation` / `internalAction` for server-only logic.
- **New users must default to the lowest-privilege role** (`viewer` or `member`). Only the first user in a new tenant gets `admin` as a bootstrap exception.

### 🔴 Multi-Tenancy — Isolation Rules
- When writing any query that aggregates data (stats, lists, exports), always ask: "Could user A see user B's data through this?" If yes, add a tenant/org filter.
- Never build a `getAll*` function that returns records across all tenants to an authenticated user — scope it to their org.

### 🔴 Dependency Security
- Run `pnpm audit` before every release. Fix CRITICAL and HIGH vulnerabilities before deploying.
- Never suppress TypeScript errors with `// @ts-ignore` or `typescript.ignoreBuildErrors: true` — fix the types properly.
- Float arithmetic involving money MUST use `decimal.js` helpers from `src/lib/money.ts` — never use native JS `+`, `-`, `*`, `/` for monetary calculations.

### What was fixed on 2026-03-21
- `mixel-pbx`: `getAllTenants()` scoped to authenticated user's own tenant
- `mixel-ai`: `getSubscriptions()` converted to internal-only; `users.list`/`users.create` now require auth
- `mixel-kyc`: `users.list`, `dashboard.getStats`, `dashboard.getRecentActivity` all require valid session; auto-admin on new user creation removed
- `mixel-store`: `.env.production` purged from git history (had been committed)
- All repos: `.gitignore` hardened to exclude `.env*` files
- Previously fixed: Apple private key `AuthKey_N69HDSNB2W.p8` scrubbed from `mixel-jango-ch` history; `.env.local` scrubbed from `mixel-ism` and `mixel-ai`; `LOCAL_SECRETS.md` scrubbed from `VPS-Mixel`

### Convex Auth Pattern for This Repo
Always use this pattern at the start of any query/mutation that reads or writes user data:
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthenticated");
const userId = identity.subject;
// then filter all queries by userId or tenantId
```
