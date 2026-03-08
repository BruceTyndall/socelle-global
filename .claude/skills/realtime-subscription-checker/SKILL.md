---
name: realtime-subscription-checker
description: "Validates Supabase Realtime subscription usage: active subscriptions, channel management, cleanup patterns, and live update wiring. Triggers on: 'realtime check', 'Supabase realtime', 'live updates', 'subscription audit', 'channel management', 'websocket check'."
---

# Realtime Subscription Checker

Validates Supabase Realtime integration.

## Realtime usage

```bash
echo "=== REALTIME USAGE ==="
cd SOCELLE-WEB
grep -rn "supabase.*channel\|\.on(\|realtime\|Realtime\|subscribe()" src/ 2>/dev/null | grep -v node_modules | head -20
echo "---"
echo "Files using Realtime:"
grep -rl "channel\|realtime\|subscribe()" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | wc -l
```

## Channel management

```bash
echo "=== CHANNEL MANAGEMENT ==="
cd SOCELLE-WEB
echo "Channel creation:"
grep -rn "\.channel(" src/ 2>/dev/null | grep -v node_modules | head -10
echo "---"
echo "Unsubscribe/cleanup:"
grep -rn "unsubscribe\|removeChannel\|removeAllChannels" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Realtime config

```bash
echo "=== REALTIME CONFIG ==="
cd SOCELLE-WEB
grep -rn "realtime" supabase/config.toml 2>/dev/null
echo "---"
echo "Realtime in migrations (publication):"
grep -rn "supabase_realtime\|publication" supabase/migrations/ 2>/dev/null | head -10
```

## Output
Write `docs/qa/realtime_subscription_check.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "subscribe\|channel\|realtime" SOCELLE-WEB/src/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/realtime-subscription-checker-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance


## Fade Protocol
- **Retest trigger:** Run quarterly or after any major refactor, migration, or dependency upgrade
- **Deprecation trigger:** Skill references files/patterns that no longer exist in codebase for 2+ consecutive quarters
- **Replacement path:** If deprecated, merge functionality into the relevant suite or rebuild via `skill-creator`
- **Last recertified:** 2026-03-08
