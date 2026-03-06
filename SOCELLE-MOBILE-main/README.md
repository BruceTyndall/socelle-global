# SLOTFORCE Monorepo

Pure Flutter + Firebase foundation for SLOTFORCE.

## Workspace Layout

- `apps/mobile`: Flutter app (UI + client orchestration)
- `packages/shared`: Shared schemas and API contracts
- `packages/gap_engine`: Pure gap detection/value functions
- `packages/functions`: Firebase Cloud Functions (TypeScript)

## Root Commands (Node workspaces)

- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run typecheck`

## Mobile Setup

1. Install Flutter SDK and add it to PATH.
2. From `apps/mobile`, run `flutter pub get`.
3. Run `flutter run` (or `flutter test`).
