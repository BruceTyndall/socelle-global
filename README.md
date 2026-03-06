# SOCELLE GLOBAL — MONOREPO [VERIFY]

> **STATUS: VERIFICATION RELEASE** — This is the `SOCELLE-GLOBAL-MONOREPO-VERIFY` port confirmation repo.
> Do not use this repo as the canonical production source until audit completion is confirmed.
> See `/docs/command/MONOREPO_PORT_VERIFICATION.md` for deploy status.

---

## Purpose

This repository is a clean port of the SOCELLE GLOBAL monorepo, published to verify:
- The monorepo is complete and structurally intact
- The primary web app (`SOCELLE-WEB`) builds and deploys to Cloudflare Pages
- All governance documents are present
- All required public routes render

This is a **port verification**, not a product release.

---

## Monorepo Structure

```
/
├── SOCELLE-WEB/          ← Primary web app (Vite + React + Supabase) — DEPLOY TARGET
├── SOCELLE-MOBILE-main/  ← Mobile monorepo (Firebase + Flutter) — preserved, not deployed here
├── apps/
│   ├── marketing-site/   ← Next.js marketing site (planned)
│   ├── web-portal/       ← Operator portal stub (mapped to SOCELLE-WEB in Wave 1)
│   ├── socelle-web/      ← Workspace mapping note (source: SOCELLE-WEB/)
│   └── socelle-mobile/   ← Workspace mapping note (source: SOCELLE-MOBILE-main/)
├── packages/
│   ├── supabase-config/  ← Shared Supabase client config
│   └── ui/               ← Shared UI primitives
├── supabase/             ← Supabase backend (migrations + edge functions)
├── docs/command/         ← Canonical governance docs (source of truth)
└── .claude/CLAUDE.md     ← Global governance
```

---

## Deploy Target: SOCELLE-WEB

| Setting | Value |
|---|---|
| **Build command** | `cd SOCELLE-WEB && npm ci && npm run build` |
| **Output directory** | `SOCELLE-WEB/dist` |
| **Node version** | `>=20.0.0` |
| **Framework** | Vite + React 18 + TypeScript |

### Required Environment Variables (Cloudflare Pages)

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://rumdmulxzmjtsplsjngi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(set in Cloudflare Pages dashboard — never commit)* |
| `VITE_APP_URL` | `https://<your-pages-domain>.pages.dev` |
| `VITE_SUPPORT_EMAIL` | `debvaihello@gmail.com` |

---

## Governance

All platform decisions governed by `/docs/command/`:
- `SOCELLE_CANONICAL_DOCTRINE.md`
- `SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- `SOCELLE_RELEASE_GATES.md`

See `/.claude/CLAUDE.md` for global operating rules.

---

*SOCELLE GLOBAL — VERIFY RELEASE — March 2026*
