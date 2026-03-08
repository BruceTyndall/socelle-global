> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# MONOREPO TOOLING — SOCELLE GLOBAL

**Authority:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V1 wins if conflicts exist)
**Created:** March 5, 2026 (Port Verification Release)
**Updated:** March 8, 2026 — V1 Master Alignment

---

## Tooling Choice: npm Workspaces + Turborepo

| Tool | Version | Role |
|---|---|---|
| npm workspaces | npm@10.8.1 | Dependency hoisting + workspace linking |
| Turborepo | ^2.3.3 | Build pipeline orchestration |
| Node | >=20.0.0 | Runtime requirement |

**Rationale:** npm workspaces is the default Node-native choice. Turborepo is already
configured in `turbo.json` and handles caching + parallel builds across apps.

---

## Workspace Layout

```json
"workspaces": [
  "apps/*",        // apps/marketing-site, apps/web-portal, apps/socelle-web (stub), apps/socelle-mobile (stub)
  "packages/*",    // packages/supabase-config, packages/ui
  "SOCELLE-WEB"    // Primary web app — root-level during Wave 1
]
```

**Note on SOCELLE-MOBILE-main:** Not included in npm workspaces — it is a separate
mobile-focused monorepo (Firebase + Flutter). It has its own workspace config and
is preserved at root level as `SOCELLE-MOBILE-main/`.

---

## Root Scripts

| Script | Command | Description |
|---|---|---|
| `npm run build` | `turbo run build` | Build all workspace packages |
| `npm run typecheck` | `turbo run typecheck` | TypeCheck all packages |
| `npm run lint` | `turbo run lint` | Lint all packages |
| `npm run dev:web` | `cd SOCELLE-WEB && npm run dev` | Start web app dev server |
| `npm run build:web` | `cd SOCELLE-WEB && npm ci && npm run build` | **Production build for deploy** |
| `npm run typecheck:web` | `cd SOCELLE-WEB && npx tsc --noEmit -p tsconfig.app.json` | TypeCheck web app only |
| `npm run build:marketing` | `turbo run build --filter=marketing-site` | Build marketing site |

---

## Deploy Target: SOCELLE-WEB

### Build Configuration

| Setting | Value |
|---|---|
| **Build command** | `cd SOCELLE-WEB && npm ci && npm run build` |
| **Output directory** | `SOCELLE-WEB/dist` |
| **Framework** | Vite 5.4 (custom) — surgical upgrade to Vite 6.x planned (~1 hour, Phase 3) |
| **Node version** | 20.x |

### Cloudflare Pages Configuration

```toml
# wrangler.toml (for reference — Cloudflare Pages dashboard settings)
name = "socelle-global-verify"
pages_build_output_dir = "SOCELLE-WEB/dist"

[build]
command = "cd SOCELLE-WEB && npm ci && npm run build"
```

### Required Environment Variables (set in Cloudflare Pages dashboard)

| Variable | Required | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | YES | `https://rumdmulxzmjtsplsjngi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | YES | Get from Supabase dashboard → Settings → API |
| `VITE_APP_URL` | Optional | Set to Cloudflare Pages URL |
| `VITE_SUPPORT_EMAIL` | Optional | `debvaihello@gmail.com` |
| `VITE_SUPABASE_BYPASS` | Optional | `true` for UI-only preview (no auth/data) |

**AI Keys:** Never expose in frontend. Set via Supabase secrets:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set GOOGLE_GEMINI_API_KEY=...
```

---

## TypeCheck Protocol

To verify the web app typechecks clean:

```bash
cd SOCELLE-WEB
npm install
npx tsc --noEmit -p tsconfig.app.json
```

Expected: zero errors before any deploy.

---

## Turbo Pipeline (turbo.json)

Pipeline is defined in root `turbo.json`. Key tasks:
- `build` — depends on upstream `^build`
- `typecheck` — isolated per workspace
- `dev` — persistent (no cache)

---

## V1 Tech Baseline — Surgical Upgrade (per V1 §E)

The current stack is working and shipping. V1 defines incremental upgrades (~1 working day total, zero rewrites):

| Package | Current | Target | Effort | Phase |
|---|---|---|---|---|
| React | 18.3 | 19.x | ~2 hours | Phase 3 |
| Vite | 5.4 | 6.x | ~1 hour | Phase 3 |
| TypeScript | 5.5 strict | strict + `noExplicitAny` | ~3-5 hours | Phase 3 |
| TanStack Query | not yet | v5 | Phase 3 | Phase 3 |
| Tailwind | 3.4 | **Stay on 3.4** | — | Tailwind 4 deferred |
| Sentry | not yet | Web + edge | Phase 3 | Phase 3 |

**Primary runtime:** React + Vite (SPA). Next.js (in `apps/marketing-site/`) is NOT the primary runtime — it is an optional SEO surface.

Agents MUST treat these as **surgical, incremental changes on a working app**, not multi-week migrations.

---

## V1 Multi-Platform Tooling (per V1 §H)

| Platform | Tooling | Monorepo Location | Shared Layer |
|---|---|---|---|
| Web | React + Vite | `SOCELLE-WEB/` | Primary implementation |
| Desktop | Tauri (wraps same React+Vite build) | Planned — Phase 6 | Same build + IPC plumbing |
| Mobile | Flutter + Riverpod | `SOCELLE-MOBILE-main/` | Supabase API contracts + edge functions |

Goal: 96%+ reuse of logic and contracts. No re-implementation of business logic in Rust or Dart.

---

## Wave 2 Migration Notes

1. Move `SOCELLE-WEB/` → `apps/socelle-web/` (update workspace glob to `apps/*` only)
2. Move `SOCELLE-MOBILE-main/` → `apps/socelle-mobile/` + rename package to `"socelle-mobile"`
3. Remove explicit `"SOCELLE-WEB"` workspace entry from root `package.json`
4. Update all Cloudflare build commands to `cd apps/socelle-web && ...`

---

*SOCELLE GLOBAL MONOREPO TOOLING v2.0 — V1 Master Alignment — March 2026*
