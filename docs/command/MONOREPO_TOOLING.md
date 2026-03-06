# MONOREPO TOOLING — SOCELLE GLOBAL

**Authority:** `/.claude/CLAUDE.md`
**Created:** March 5, 2026 (Port Verification Release)

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
| **Framework** | Vite 5 (custom) |
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

## Wave 2 Migration Notes

1. Move `SOCELLE-WEB/` → `apps/socelle-web/` (update workspace glob to `apps/*` only)
2. Move `SOCELLE-MOBILE-main/` → `apps/socelle-mobile/` + rename package to `"socelle-mobile"`
3. Remove explicit `"SOCELLE-WEB"` workspace entry from root `package.json`
4. Update all Cloudflare build commands to `cd apps/socelle-web && ...`

---

*SOCELLE GLOBAL MONOREPO TOOLING v1.0 — Port Verification Release — March 2026*
