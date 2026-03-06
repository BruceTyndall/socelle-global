# socelle-web — Workspace Mapping Note

> **PORT-MAPPING:** The primary web app source lives at `../../SOCELLE-WEB/` (root level).
> This directory is a workspace mapping stub — no source code lives here.

## Why this exists

The monorepo's workspace glob is `apps/*`. SOCELLE-WEB was the original standalone web repo
and is mapped here for workspace visibility while remaining at the root during Wave 1.

**Wave 2 migration plan:** Move `SOCELLE-WEB/` → `apps/socelle-web/` once all
integration tests pass post-verification.

## To work on the web app

```bash
cd ../../SOCELLE-WEB
npm install
npm run dev
```

## Build (from monorepo root)

```bash
npm run build:web
# or directly:
cd SOCELLE-WEB && npm ci && npm run build
# Output: SOCELLE-WEB/dist/
```
