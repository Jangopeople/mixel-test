# CLAUDE.md — Jango.ch iOS (Standalone Build Wrapper)
> This file is law. Read it fully before touching any code.

---

## 1. Project Purpose
`jango-ch-ios` is the standalone iOS native build container for the Jango.ch marketplace app. Like `jango-ch-android`, it is NOT the main application code — it is a thin Capacitor wrapper that shells the compiled web output from `mixel-jango-ch` into an iOS IPA for App Store / TestFlight distribution.

Bundle ID: `com.jango.bids`
Apple Team ID: `5277F8NDH4`
Target: App Store (TestFlight for beta)

---

## 2. Tech Stack
| Layer | Technology |
|---|---|
| Mobile framework | Capacitor 8.2 |
| iOS build | Xcode + xcodebuild |
| Plugins | camera, geolocation, push notifications |
| Code signing | Manual (Apple team `5277F8NDH4`) |
| API key | `AuthKey_N69HDSNB2W.p8` (stored in mixel-jango-ch) |
| Package manager | pnpm |

---

## 3. Architecture
```
jango-ch-ios/
  ios/
    App/
      App.xcodeproj        # Xcode project
      App/                 # Swift app source (mostly boilerplate)
        AppDelegate.swift
        App.entitlements         # Dev: aps-environment=development
        App.Release.entitlements # Prod: aps-environment=production
  dist/                    # Web assets (synced from mixel-jango-ch via rsync)
  capacitor.config.json    # Capacitor config
  package.json
```

### Build Dependency: mixel-jango-ch
Web assets must come from `mixel-jango-ch/dist/`. This repo uses rsync to sync them:
```bash
# sync:web script:
rsync -a --delete ../mixel-jango-ch/dist/ ./dist/
```
This assumes `jango-ch-ios` and `mixel-jango-ch` are sibling directories.

---

## 4. Build & Run
```bash
pnpm install

# Sync web assets from mixel-jango-ch (must run first)
pnpm sync:web        # rsync -a --delete ../mixel-jango-ch/dist/ ./dist/

# Sync to iOS project
pnpm ios:sync        # pnpm sync:web && cap sync ios

# Open in Xcode
pnpm ios:open

# Archive for distribution
pnpm ios:archive
# Output: ios/build/App.xcarchive

# Archive without code signing (for later signing)
pnpm ios:archive:unsigned
# Output: ios/build/App-unsigned.xcarchive
```

### TestFlight Upload (CURRENTLY BROKEN)
```bash
# Upload requires ASC_ISSUER_ID (currently unknown):
API_PRIVATE_KEYS_DIR=/Users/michaellascar/Projects/mixel-jango-ch \
xcrun altool --upload-app \
  -f ios/build/export/App.ipa \
  --api-key N69HDSNB2W \
  --api-issuer "$ASC_ISSUER_ID" \
  --verbose
```
Fix: Obtain `ASC_ISSUER_ID` from App Store Connect → Users and Access → Keys, or sign into Xcode with the Apple account for team `5277F8NDH4`.

---

## 5. Deployment
```
Xcode Archive → Export IPA → Upload to TestFlight → App Store review → Production
```
- No automated upload pipeline — all manual
- API key file (`AuthKey_N69HDSNB2W.p8`) lives in `mixel-jango-ch/` root (wrong place — must move)
- `ASC_ISSUER_ID` is missing — blocking automated uploads

---

## 6. Conventions
- **Never edit web app code here** — all JS/TS changes go in `mixel-jango-ch`
- **Sync before build**: Always run `pnpm sync:web` before building
- **Entitlements**: `App.entitlements` is dev (push: development). `App.Release.entitlements` is production (push: production). Use the right one for the right build.
- **Version bumps**: Bump CFBundleShortVersionString (version) and CFBundleVersion (build number) in Xcode for every release
- **Signing**: Must use Apple team `5277F8NDH4`. Code signing must use provisioning profiles from App Store Connect.

---

## 7. What We NEVER Do
- **Never** commit the `AuthKey_N69HDSNB2W.p8` private key to any repo — move it out of mixel-jango-ch root
- **Never** ship with dev entitlements to production (App.entitlements vs App.Release.entitlements)
- **Never** modify web app code in this repo
- **Never** hardcode `ASC_ISSUER_ID` in any script — use environment variable
- **Never** mix bundle IDs between jango-ch (`com.jango.bids`) and jango-mu
- **Never** release without verifying the correct signing certificate and provisioning profile

---

## 8. Inter-Project Relationships
- **mixel-jango-ch**: Source of all web assets. `rsync` syncs `mixel-jango-ch/dist/` → `jango-ch-ios/dist/`. Must be sibling directory.
- **jango-ch-android**: Sibling Android wrapper — same web source, different native project
- `AuthKey_N69HDSNB2W.p8` lives in `mixel-jango-ch/` and is shared by this project for TestFlight upload

---

## 9. Key Files to Know
| File | Why it matters |
|---|---|
| `ios/App/App.xcodeproj` | Xcode project — open in Xcode for signing config |
| `ios/App/App/App.entitlements` | Dev push notification environment |
| `ios/App/App/App.Release.entitlements` | Production push — use for release builds |
| `ios/App/App/AppDelegate.swift` | iOS app entry point |
| `capacitor.config.json` | Capacitor config — bundle ID, web dir |
| `package.json` | Build/sync scripts |

---

## 10. Open Issues / Known Gaps
- 🔴 **TestFlight upload broken** — `ASC_ISSUER_ID` missing, upload fails (see README)
- 🔴 **No CI/CD** — all builds are manual local Xcode
- 🔴 **No code signing automation** — relies on local Xcode account
- 🔴 **Zero tests** — no XCTest target configured
- 🔴 **No dependency vulnerability scanning**
- 🟡 Two entitlements files (dev vs release) — easy to use wrong one accidentally
- 🟡 rsync-based web sync is fragile (requires sibling directory structure)
- 🟡 Bundle ID mismatch: Xcode says `com.jango.bids` but Android is `com.jango.ch` — clarify official ID
- 🟡 `ios:archive` and `ios:archive:unsigned` commands rely on local Xcode paths
- 🟡 No version management or release tagging automation
- 🟡 Build artifacts (`ios/build/`) not versioned or archived

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
