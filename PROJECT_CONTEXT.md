# PROJECT_CONTEXT.md — mixel-test
> AI Handoff File | Last updated: 2026-04-04 | Read MIXEL_MASTER_CONTEXT.md first

---

## 🎯 What This Project Is
`mixel-test` powers `test.mixel.ch`, the internal guided QA portal used to validate MIXEL apps (including `acc.mixel.ch`) with structured test cases, evidence capture, and PDF reporting.

## 🌐 Live URL
- `https://test.mixel.ch`

## 🏗️ Stack
- Frontend: Single-page static HTML/CSS/JS (`index.html`)
- Data source: embedded JSON-like app/test definitions + `apps.json`
- Integrations:
  - QA runner API: `https://api.agent.mixel.ch` (fallback `https://agent.mixel.ch`)
  - jsPDF for report export

## ✅ Current Status
- Working:
  - Multi-language guided test portal
  - QA runner integration for `acc.mixel.ch` via `/v1/qa-run` + `/v1/qa-status/{job_id}`
  - Evidence capture + PDF export
- In progress:
  - Continuous sync/verification against real app features

## 🔄 Last Session
- Date: 2026-04-04
- AI Used: Codex (GPT-5)
- Done:
  - Verified live QA runner connectivity from `test.mixel.ch` origin to agent API.
  - Hardened QA runner endpoint usage in `index.html`:
    - Added endpoint fallback (`api.agent.mixel.ch` → `agent.mixel.ch`).
    - Added connection health check when opening runner panel.
    - Added request timeouts and better polling/start error reporting.
    - Ensured polling timers are cleared on modal close/new run.
  - Added this missing `PROJECT_CONTEXT.md` for protocol compliance.
- Committed: no | Branch: `backup/2026-04-04-mixel-test-ai-runner-fix`

## 📋 Next Steps (Priority Order)
1. Deploy updated `mixel-test` portal and verify runner panel behavior on production.
2. Execute a real `acc` test run from `test.mixel.ch` UI (limit 1 then full run) and confirm report delivery.
3. Optional: migrate Mixail chat endpoint from LAN-only host to a public secured endpoint.

## ⚠️ Known Issues / Blockers
- Mixail chat widget currently points to LAN Ollama API (`10.124.1.33`), not internet-reachable for all testers.
- Feature validity depends on frequent alignment with target app deployments.

## 🔑 Key Decisions
- Keep QA runner decoupled from a single backend hostname by using endpoint fallback.
- Keep test portal static and lightweight; push orchestration complexity to `mixel-agent`.

## 📁 Important Files
| File | Purpose |
|------|---------|
| `index.html` | Main portal UI, test logic, QA runner integration |
| `apps.json` | App catalog + test cases by language |
| `sync_to_html.py` | Sync helper for injecting test data |

## 🔐 Environment Variables Required
No local env required for static portal itself. API origins and auth are managed on backend services.

---
*Update this file at the end of every AI session.*
