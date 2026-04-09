# 🧠 MIXEL MASTER CONTEXT — AI Handoff Protocol
> **READ THIS FIRST before touching any project.**
> Last updated: 2026-04-09 (evening: added mixel-agent to registry) | Owner: Michael Lascar | Company: Mixel IT and Corporate Services GmbH (CHE-184.355.981)

---

## ⚠️ CRITICAL RULES FOR ALL AI AGENTS

1. **NEVER expose API keys, credentials, or user data** in code, logs, or frontend
2. **ALWAYS create a git backup branch before making changes**: `git checkout -b backup/YYYY-MM-DD`
3. **NEVER break a working feature** — test before committing
4. **ALWAYS read `PROJECT_CONTEXT.md`** in each repo before starting work
5. **ALWAYS update `PROJECT_CONTEXT.md`** at the end of your session
6. **NEVER delete files** without checking git history first
7. **Use `.env` files** for all secrets — never hardcode them
8. **Every repo must have a `.env.example`** with placeholder values only

---

## 👤 Owner Profile

| Field | Value |
|-------|-------|
| Name | Michael Lascar |
| Company | Mixel IT GmbH |
| Location | Furtbachstrasse 14, 8107 Buchs, Switzerland |
| Email | michael.lascar@toitoi.ch / support@mixel.ch |
| Hardware | Mac Mini M4 (primary dev), MacBook Air, Custom PC (dual GPU) |
| Local AI | Ollama + Qwen 14B / Qwen2.5-Coder 32B |
| Infra | Cloudflare Pages + Convex backend + GitHub repos |
| Dev Style | AI-directed PM — describes requirements, AI builds |

---

## 🗂️ Project Registry

### 📱 Mobile Apps (Compile Locally → Export to App Stores)

| Repo | Platform | Deployment | Status |
|------|----------|------------|--------|
| `jango-ch-android` | Android | Google Play Store (compile on Mac Mini) | Save copy on GitHub |
| `jango-ch-ios` | iOS | Apple App Store Connect (compile on Mac Mini) | Save copy on GitHub |

> ⚠️ These are NOT deployed to Cloudflare. They are compiled locally and submitted to app stores.

---

### 🌐 Web Applications (Cloudflare Pages + Convex)

| Repo | Domain | Product Description |
|------|--------|---------------------|
| `mixel-ch` | mixel.ch | **Main corporate website** — lists all Mixel IT products & services |
| `mixel-acc` | acc.mixel.ch (primary) + accounting.mixel.ch + acc.mixel.mu (Mauritius alias) | Full Swiss accounting SaaS — invoicing, expenses, payroll, banking, VAT, P&L/BS, multi-country COA, multi-org RBAC. Cloudflare Pages project name: `mixel-accounting`. Backend: Convex (`friendly-seahorse-961.convex.cloud`). CI auto-deploys on push to main (confirmed 2026-04-09). |
| `mixel-ai` | ai.mixel.ch or chat.mixel.ch | AI chat platform (verify active domain) |
| `mixel-ai-clean` | ai.mixel.ch or chat.mixel.ch | Clean version of AI platform (verify vs mixel-ai) |
| `mixel-flight` | flight.mixel.ch | Flight search & ticket sales app (Kiwi.com/Tequila API) |
| `mixel-ism` | ism.mixel.ch | IT Service Management — ticketing + remote desktop |
| `mixel-jango-ch` | jangobids.ch | Swiss marketplace platform |
| `mixel-jango-mu` | jango.mu | Mauritius marketplace platform |
| `mixel-kyc` | kyc.mixel.ch | KYC lookup — search companies & individuals on demand |
| `mixel-lu` | mixel.lu | Mixel Corporate Services for Luxembourg |
| `mixel-marketing` | marketing.mixel.ch | Marketing & branding tool for Mixel + corporate clients |
| `mixel-mu` | mixel.mu | Mixel IT & Corporate Services for Mauritius |
| `mixel-olivia` | olivia.mixel.ch | Dedication/hommage to Olivia village, Mauritius |
| `mixel-pbx` | pbx.mixel.ch | PBX telephone system built by Mixel |
| `mixel-store` | store.mixel.ch | PWA download store for all Mixel apps |
| `mixel-test` | test.mixel.ch | **QA testing hub** — see special rules below |
| `mixel-agent` | agent.mixel.ch + api.agent.mixel.ch | **AI factory orchestrator** — wraps Claude Agent SDK + Ollama with sub-agents (developer, deployment, security, uiux, translator, filesave, it-support, research). **Deployment is NOT Cloudflare Pages**: agent.mixel.ch is a Vite + Tauri PWA (`desktop/dist/`) served as static files by the FastAPI `api.py` running as `uvicorn` on this Mac, fronted by a Cloudflare tunnel. `api.agent.mixel.ch` is the same FastAPI under a different subdomain (Caddy/nginx reverse-proxy in `vps-mixel/configs`). Git repo: `Jangopeople/mixel-agent` (private, initialized 2026-04-09). One-shot deploy: `./scripts/deploy.sh` (bumps PWA SW, builds, smoke-tests, purges CF cache, commits + pushes). The Next.js app in `src/app/` is dormant but retained. |
| `mixelai-agent` | TBD (possibly Proxmox-hosted) | AI agent runner — verify deployment target. **NOT the same as `mixel-agent`** above. |
| `vps-mixel` | chat.mixel.ch + others | VPS services — verify all running services |
| `security` | internal | Security scripts — verify contents before touching |

---

## 🧪 SPECIAL: test.mixel.ch — QA Hub Rules

> **This is a CRITICAL application. It must work 100% at all times.**

**Purpose:** Test users visit test.mixel.ch to test all listed Mixel apps and report bugs.

**Strict Rules for AI working on `mixel-test`:**
- ✅ Every feature listed for testing MUST actually exist in the target app
- ✅ Deploy verification agents to each app before adding test cases
- ✅ Never write test instructions for features that don't exist
- ❌ No hallucinated features or placeholder test cases
- ❌ Do not guess — verify via the live URL or the repo code

**Workflow:**
1. Read the target app's `PROJECT_CONTEXT.md`
2. Check the live URL for actual deployed features
3. Only then write test instructions in `mixel-test`
4. Mark unverified features as `[PENDING VERIFICATION]`

---

## 🏗️ Standard Tech Stack (All Web Projects)

```
Frontend:   React / Next.js or Vite
Backend:    Convex (real-time database + serverless functions)
Hosting:    Cloudflare Pages
DNS:        Cloudflare (all mixel.ch subdomains)
Auth:       Convex Auth or Clerk
Secrets:    .env files (NEVER committed to git)
Version:    GitHub (one repo per project)
```

### ⚠️ Convex Hard Limits — learned the hard way (2026-04-09)
Any `.ts` file under `convex/` is parsed by the push evaluator during `convex deploy`. Evaluator has a **64 MB V8 heap**. Single-query reads have a **16 MB limit**. Total bundled code has a **32 MiB limit**. Bulk reference data MUST NOT live as inline constants in `convex/*.ts` — the evaluator will OOM on push and prod becomes un-deployable silently.

**Recipe for bulk reference data:**
1. Keep the source-of-truth data file in `scripts/data/` (outside `convex/`)
2. Write a `scripts/extract-*.mjs` script that emits small metadata constants + an indexed table seed file (JSONL)
3. Load metadata constants into a small `convex/*.generated.ts` (bundle-safe, < 500 KB)
4. Load the full dataset into a schema-backed table via `npx convex import --prod --table <name> --replace --format jsonLines -y path/to/file.jsonl`
5. Query the table via a `by_<key>` index so a single row lookup stays under 16 MB
6. CI guardrail: `find convex -name '*.ts' -size +500k | grep -q . && exit 1`

Concrete reference implementation: `mixel-acc` commit `821fd29` — 20 MB `countryCoa.generated.ts` migrated to `country_coa_source_templates` table with 111 rows, INTL bootstrap fallback inline, `by_templateKey` index.

---

## 🔗 Infrastructure Map

```
Mac Mini M4 (Local Dev)
    ↓ git push
GitHub Repos (source of truth)
    ↓ auto-deploy (Cloudflare Pages CI/CD)
Cloudflare Pages (frontend hosting)
    ↓ API calls
Convex (backend / database)
    ↓
Cloudflare DNS (domain routing)
```

---

## 🔒 Security Checklist (Run Before Every Commit)

- [ ] No API keys in source code
- [ ] No hardcoded passwords or tokens
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` exists with dummy values
- [ ] No user PII in logs or error messages
- [ ] CORS settings are correct
- [ ] Auth routes are protected

---

## 📋 Per-Repo PROJECT_CONTEXT.md Template

Each repo must contain this file at its root:

```markdown
# PROJECT_CONTEXT.md — [repo-name]

## 🎯 What This Project Is
[One paragraph description]

## 🌐 Live URL
[domain]

## 🏗️ Stack
- Frontend: 
- Backend: 
- Database: 
- Hosting: 
- Auth: 

## ✅ Current Status
- Working: 
- Broken: 
- In Progress: 

## 🔄 Last Session
- Date: 
- AI Used: [Claude Code / Codex / Antigravity]
- Done: 
- Committed: [yes/no] Branch: 

## 📋 Next Steps (Priority Order)
1. 
2. 
3. 

## ⚠️ Known Issues / Blockers

## 🔑 Key Decisions

## 📁 Important Files
| File | Purpose |
|------|---------|

## 🔐 Environment Variables Required
See .env.example — NEVER put real values here
```

---

## 🤝 AI Agent Handoff Protocol

### When Starting a Session:
```
1. Read MIXEL_MASTER_CONTEXT.md (this file)
2. cd into the target repo
3. Read PROJECT_CONTEXT.md in that repo
4. Run: git status && git log --oneline -10
5. Check for any .env.example to understand required vars
6. Create backup branch: git checkout -b backup/$(date +%Y-%m-%d)
7. Begin work
```

### When Ending a Session:
```
1. Update PROJECT_CONTEXT.md — Last Session section
2. Update Next Steps
3. git add . && git commit -m "Session summary: [what was done]"
4. git push origin main
5. Note any blockers for next AI
```

### When Switching AI:
```
Tell the next AI: "Read MIXEL_MASTER_CONTEXT.md and then 
PROJECT_CONTEXT.md in [repo-name] before doing anything."
```

---

## 🚨 Projects Needing Verification

| Repo | Question | Since |
|------|----------|-------|
| `mixel-ai` vs `mixel-ai-clean` | Which is the active one at ai.mixel.ch? | 2025-03 — **open for 13+ months, must be resolved** |
| `mixelai-agent` | Is this deployed on Proxmox or Cloudflare? | 2025-03 |
| `vps-mixel` | What services are running? Full inventory needed | 2025-03 |
| `security` | What scripts are here? Audit before running anything | 2025-03 |
| `mixel-agent` | ~~Git remote~~ ✅ `Jangopeople/mixel-agent` private. ~~CF purge token~~ ✅ `CLOUDFLARE_PURGE_TOKEN` in `.env`. ~~Dormant Pages project `agent-mixel`~~ ✅ deleted 2026-04-09. `src/app/` Next.js kept as-is per owner decision. Fully resolved. | 2026-04-09 |

## 📜 Protocol Compliance Notes

The *When Starting a Session* and *When Ending a Session* protocols above are frequently skipped (observed: no `backup/2026-04-04`, `backup/2026-04-07`, `backup/2026-04-09-pre-session` in `mixel-acc`). When an AI agent skips step 1 (read this file) or step 4 (create backup branch), all downstream assumptions may be wrong. If you are an AI reading this mid-session and realize you skipped these steps: (a) stop, (b) acknowledge the violation to the user, (c) retroactively cut a `backup/YYYY-MM-DD` branch at the current HEAD as a safety pointer, (d) read the per-repo `PROJECT_CONTEXT.md` before continuing.

---

*This file is the single source of truth for the Mixel project ecosystem.*
*Update it whenever the architecture, domains, or project status changes.*
