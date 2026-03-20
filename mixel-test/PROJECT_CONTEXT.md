# PROJECT_CONTEXT.md — mixel-test
> AI Handoff File | Last updated: 2026-03-20 | Read MIXEL_MASTER_CONTEXT.md first

---

## 🎯 What This Project Is
CRITICAL QA HUB — Test users use this to test all Mixel apps and report bugs. Every feature listed MUST exist in the real app. No hallucinated features allowed. Deploy verification agents before adding test cases.

## 🌐 Live URL / Deployment Target
test.mixel.ch

## 🏗️ Stack
- Frontend: Single-file static HTML app with inline CSS and vanilla JavaScript in `index.html`
- Backend: None in this repo; browser-only workflow
- Database: None; tester progress and session state are stored in browser `localStorage`
- Hosting: Cloudflare Pages (`npx wrangler pages deploy . --project-name mixel-test`)
- Auth: Browser-side test-user gate using SHA-256 password hash comparison against an inline allowlist in `index.html`
- Key APIs: Web Crypto API, `localStorage`, jsPDF CDN, jsPDF AutoTable CDN

## ✅ Current Status
- **Working:** Static login screen, multi-app QA catalog, local autosave, evidence image upload/compression, PDF incident export, and test-case filtering/sorting; EN/DE/FR now share the same canonical case inventory; Jango CH now points to `jangobids.ch`
- **Broken:** Live feature verification across all listed target apps is still incomplete; several target repos still have placeholder `PROJECT_CONTEXT.md` files; `mixel.lu` is currently blocked by registrar suspension instead of app failure; `deploy.sh` is a plain text instruction file rather than an executable deployment script
- **In Progress:** Rule-compliance audit of every test inventory versus target repo/live app reality, plus follow-up cleanup for unverified cases

## 🔄 Last Session
- Date: 2026-03-20
- AI Used: Codex
- Done: Read `MIXEL_MASTER_CONTEXT.md`, reviewed repo `PROJECT_CONTEXT.md`, created backup branch `backup/2026-03-20`, inspected repo structure, replaced placeholder handoff details with verified stack/runtime notes, audited `test.mixel.ch` against QA Hub rules, patched localized app loading so DE/FR cannot invent extra test cases or crash on mismatched IDs, corrected Jango CH references from `jango.ch` to `jangobids.ch`, and deployed the update live to `test.mixel.ch`
- Committed: no | Branch: backup/2026-03-20

## 📋 Next Steps (Priority Order)
1. Verify each portal app against both its repo and live URL, then mark anything not confirmed as `[PENDING VERIFICATION]`
2. Decide which Mixel apps from the master registry must appear in `test.mixel.ch` and add missing coverage only after verification
3. Deploy and smoke-test the localized inventory fix, then continue reducing the single-file `index.html` maintenance risk

## ⚠️ Known Issues / Blockers
- The git root is `/Users/michaellascar/Projects`, so branch operations and status output include sibling project folders, not only `mixel-test`
- This repo currently relies on a very large single-file `index.html` (~10k lines), which makes safe edits and verification slower
- `.env.example` suggests Convex/Clerk variables, but the current portal implementation is static and does not visibly consume them in `index.html`
- Per `MIXEL_MASTER_CONTEXT.md`, test instructions must be verified against live apps; that verification has not yet been completed for the full portal dataset
- The portal currently covers 12 app buckets, while the wider Mixel project registry contains additional repos/products that may need explicit QA coverage decisions (`mixel-ch`, `mixel-flight`, `mixel-ai-clean`, `mixel-olivia`, etc.)
- Before the local patch in `index.html`, DE/FR inventories diverged from EN and could throw runtime errors on apps like `mixel-lu` because translated case IDs did not match initialized state
- `mixel.lu` is presently suspended at the registrar layer for incomplete ICANN contact verification, so live verification of that domain is externally blocked until reactivated

## 🔑 Key Decisions Made
- Keep secrets out of this repo and out of AI handoff notes; reference `.env.example` only for placeholders
- Treat `mixel-test` as a static QA control center deployed to Cloudflare Pages unless the codebase is intentionally replatformed
- Preserve the requirement that no new test case content should be trusted without live-app verification
- Use English `APPS` as the canonical test inventory and only merge translated app content where case IDs align, so localization cannot create phantom test suites

## 📁 Important Files
| File | Purpose |
|------|---------|
| `index.html` | Primary application file containing UI, login gate, localization, test data, local persistence, and PDF export logic |
| `out/index.html` | Output copy/build artifact currently present in repo |
| `deploy.sh` | Deployment note for Cloudflare Pages Wrangler publish command |
| `.env.example` | Placeholder environment variable template; do not place real values here |
| `PROJECT_CONTEXT.md` | AI handoff and repo status summary |

## 🔐 Environment Variables Required
> See .env.example — NEVER put real values in this file or commit .env

```
# Copy to .env and fill in real values
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
CF_PAGES_URL=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

## 🔗 Related Projects
- Part of the Mixel ecosystem — see MIXEL_MASTER_CONTEXT.md for full map

---
*Update this file at the end of every AI session.*
