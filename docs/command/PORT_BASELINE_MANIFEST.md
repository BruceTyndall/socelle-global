# PORT BASELINE MANIFEST — SOCELLE GLOBAL copy

**Authority:** `/.claude/CLAUDE.md`
**Generated:** March 5, 2026
**Purpose:** Step 1 of Port Verification Release — proof of preservation BEFORE any changes.
**Source:** `/Users/brucetyndall/Documents/GitHub/SOCELLE GLOBAL copy`

> This manifest was captured at the start of the migration verification process.
> All file counts, sizes, and structure reflect the state of the baseline working tree.

---

## Summary Counts

| Metric | Value |
|---|---|
| **Total files** (excl. node_modules, .git, build, dist, .dart_tool, .next, .turbo) | **2,293** |
| **Total directories** (excl. same) | **294** |
| **Total disk size** (including node_modules) | **1.6 GB** |
| **SOCELLE-WEB** (1.3 GB — includes node_modules) | 1,931 files (excl. node_modules/dist/git) |
| **SOCELLE-MOBILE-main** | 296 MB |
| **Governance docs** (`/docs/command/`) | **10 files** (all present) |

---

## Top-Level Size Breakdown

| Path | Size |
|---|---|
| `SOCELLE-WEB/` | 1.3 GB |
| `SOCELLE-MOBILE-main/` | 296 MB |
| `docs/` | 128 KB |
| `supabase/` | 44 KB |
| `apps/` | 44 KB |
| `packages/` | 16 KB |
| `SEO_GUIDELINES.md` | 8 KB |
| `turbo.json` | 4 KB |
| `README.md` | 4 KB |
| `package.json` | 4 KB |

---

## Governance Files Confirmed Present

| File | Status |
|---|---|
| `/.claude/CLAUDE.md` | PRESENT |
| `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md` | PRESENT |
| `/docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` | PRESENT |
| `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` | PRESENT |
| `/docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | PRESENT |
| `/docs/command/SOCELLE_RELEASE_GATES.md` | PRESENT |
| `/docs/command/ASSET_MANIFEST.md` | PRESENT |
| `/docs/command/DRIFT_PATCHLIST.md` | PRESENT |
| `/docs/command/HARD_CODED_SURFACES.md` | PRESENT |
| `/docs/command/MODULE_MAP.md` | PRESENT |
| `/docs/command/SITE_MAP.md` | PRESENT |

---

## Directory Tree Snapshot (depth 5, excl. build artifacts)

```
SOCELLE GLOBAL copy/
├── .agents/
│   └── workflows/
│       ├── backend_agent.md
│       ├── mobile_agent.md
│       └── web_agent.md
├── .claude/
│   └── CLAUDE.md
├── .gitignore
├── apps/
│   ├── marketing-site/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   ├── src/app/
│   │   │   ├── intelligence/
│   │   │   ├── layout.tsx
│   │   │   ├── robots.ts
│   │   │   └── sitemap.ts
│   │   └── tsconfig.json
│   ├── socelle-mobile/
│   │   └── README.md  [PORT-MAPPING stub]
│   ├── socelle-web/
│   │   └── README.md  [PORT-MAPPING stub]
│   └── web-portal/
│       └── package.json
├── docs/
│   └── command/
│       ├── ASSET_MANIFEST.md
│       ├── DRIFT_PATCHLIST.md
│       ├── HARD_CODED_SURFACES.md
│       ├── MODULE_MAP.md
│       ├── MONOREPO_TOOLING.md  [added: port verification]
│       ├── PORT_BASELINE_MANIFEST.md  [this file]
│       ├── SITE_MAP.md
│       ├── SOCELLE_CANONICAL_DOCTRINE.md
│       ├── SOCELLE_DATA_PROVENANCE_POLICY.md
│       ├── SOCELLE_ENTITLEMENTS_PACKAGING.md
│       ├── SOCELLE_FIGMA_TO_CODE_HANDOFF.md
│       └── SOCELLE_RELEASE_GATES.md
├── package.json
├── packages/
│   ├── supabase-config/
│   │   ├── package.json
│   │   └── src/index.ts
│   └── ui/
│       ├── package.json
│       └── src/index.ts
├── README.md
├── SEO_GUIDELINES.md
├── SOCELLE-MOBILE-main/          [296 MB — mobile monorepo, Firebase + Flutter]
│   ├── .artifacts/               [5 PNG artifacts]
│   ├── apps/mobile/              [Flutter app — lib/, ios/, test/]
│   ├── docs/                     [audit/, slotforce/, build_tracker.md]
│   ├── packages/
│   │   ├── functions/            [Firebase Cloud Functions — TypeScript]
│   │   ├── gap_engine/
│   │   └── shared/
│   ├── Images Skincare Ingredient Swatches Square/  [23 SVGs]
│   ├── Photo Skincare Swatches/
│   ├── firebase.json
│   ├── firestore.rules
│   └── package.json              [name: "slotforce" — legacy artifact, rename in Wave 2]
├── SOCELLE-WEB/                  [1.3 GB — primary web app, DEPLOY TARGET]
│   ├── .bolt/                    [Bolt config]
│   ├── .claude/                  [app-level CLAUDE.md + commands]
│   ├── .env                      [local only — gitignored]
│   ├── .env.example              [template — committed]
│   ├── .github/workflows/ci.yml
│   ├── .netlify/                 [legacy Netlify config — preserved]
│   ├── archive/                  [legacy work orders — preserved]
│   ├── dist/                     [build output — gitignored]
│   ├── docs/                     [app-level docs, codex, audit]
│   ├── public/
│   │   ├── _headers              [Cloudflare security headers]
│   │   ├── _redirects            [/* /index.html 200 — SPA routing]
│   │   ├── favicon.ico / favicon.svg
│   │   ├── images/               [product images]
│   │   ├── og-image.svg
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── videos/               [product videos]
│   ├── src/
│   │   ├── components/           [UI components]
│   │   ├── contexts/             [React contexts]
│   │   ├── hooks/                [custom hooks]
│   │   ├── lib/                  [utilities, Supabase client]
│   │   ├── pages/                [route pages — public/, admin/, portal/, brand/, business/]
│   │   └── App.tsx               [React Router v7 routing]
│   ├── supabase/                 [app-level edge functions + migrations]
│   ├── package.json              [name updated: "socelle-web"]
│   ├── vite.config.ts
│   ├── tsconfig.app.json
│   └── [151 root-level files — audit docs, completion reports, architecture notes]
├── supabase/                     [root-level Supabase backend]
└── turbo.json
```

---

## Critical Notes

### Nested Git Repositories
Both `SOCELLE-WEB/.git` and `SOCELLE-MOBILE-main/.git` exist as standalone git repos
inside the monorepo. During the GitHub push (Step 4), these are temporarily renamed to
`.git_original` to allow their contents to be tracked in the monorepo repo, then restored.
This is a reversible rename — no history is destroyed.

### SOCELLE-MOBILE-main Identity
`SOCELLE-MOBILE-main/package.json` has `"name": "slotforce"` — a legacy template artifact.
This is a different project embedded in the monorepo. Marked for rename to `"socelle-mobile"`
in Wave 2. Not included in npm workspaces due to incompatible package name and structure.

### Missing Routes (from spec)
The following routes from the verification spec are NOT in `SOCELLE-WEB/src/App.tsx`:
- `/for-buyers` — **MISSING** (no route defined)
- `/pricing` — **MISSING** (closest: `/plans` and `/api/pricing`)
These are documented as FAIL items in `MONOREPO_PORT_VERIFICATION.md`.

### Changes Made During Port (minimal, preserve-first)
| File | Change |
|---|---|
| `SOCELLE-WEB/package.json` | `name` updated: `"vite-react-typescript-starter"` → `"socelle-web"` |
| `package.json` (root) | `workspaces` extended: added `"SOCELLE-WEB"`; scripts added: `dev:web`, `build:web`, `typecheck:web` |
| `.gitignore` (root) | Added: build/, .dart_tool/, .flutter-*, .env patterns |
| `README.md` (root) | Created: VERIFY-labeled monorepo README |
| `apps/socelle-web/README.md` | Created: workspace mapping stub |
| `apps/socelle-mobile/README.md` | Created: workspace mapping stub |
| `docs/command/MONOREPO_TOOLING.md` | Created: tooling reference doc |
| `docs/command/PORT_BASELINE_MANIFEST.md` | Created: this file |

---

*SOCELLE GLOBAL — PORT BASELINE MANIFEST v1.0 — March 5, 2026*
