# socelle-mobile — Workspace Mapping Note

> **PORT-MAPPING:** The mobile app source lives at `../../SOCELLE-MOBILE-main/` (root level).
> This directory is a workspace mapping stub — no source code lives here.

## Structure

`SOCELLE-MOBILE-main/` contains a mobile-focused monorepo:
- `apps/mobile/` — Flutter app (Riverpod + Supabase)
- `packages/` — Shared mobile packages
- Firebase config (`firebase.json`, `firestore.rules`)

## Note on package name

`SOCELLE-MOBILE-main/package.json` currently uses `name: "slotforce"` — this is a
legacy template name artifact. Rename to `"socelle-mobile"` during Wave 2 cleanup.

## Wave 2 migration plan

Move `SOCELLE-MOBILE-main/` → `apps/socelle-mobile/` and rename package.
