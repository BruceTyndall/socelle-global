---
name: intelligence-hub-api-contract
description: "Enforces the Intelligence Hub API contract for SOCELLE. Use this skill whenever working on any file in src/pages/ or src/components/ that imports from src/lib/intelligence/ or references 'market_signals', 'useIntelligence', 'useActionableSignals', 'useBrandIntelligence', 'useDataFeedStats', or 'useSignalCategories'. Triggers on: 'intelligence hub', 'signal data', 'useIntelligence', 'market_signals', 'signal types', 'isLive', 'intelligence API', 'live badge', 'DEMO banner', 'intelligence hooks', 'edge function intelligence', 'intelligence briefing'. ALWAYS invoke before writing any new data-fetching code that touches intelligence signals or market data."
---

# Intelligence Hub API Contract

Enforces the canonical data-fetching contract for the Intelligence Hub. Any agent writing, modifying, or reviewing components that consume intelligence data must read this skill first and run the contract checks after.

The goal is simple: intelligence data flows through exactly one set of hooks and edge functions. When agents bypass these or invent new signal types, data integrity breaks, DEMO labels get skipped, and tier visibility leaks. This skill prevents that.

## Step 1 — Pre-write check (read before writing any code)

Before writing any new data-fetching code in the Intelligence Hub, verify the available hooks cover your use case:

| Hook | Return shape | Use for |
|------|-------------|---------|
| `useIntelligence(options)` | `{ signals, totalSignalCount, marketPulse, loading, isLive, activeFilter, setActiveFilter }` | Primary signal feed, KPI strip, all main intelligence surfaces |
| `useActionableSignals()` | Filtered signal subset with action recommendations | Opportunity panels, cross-hub action cards |
| `useBrandIntelligence()` | Brand-specific signal slice | Brand hub intelligence tab, brand advisor surfaces |
| `useDataFeedStats()` | Feed health metrics (row counts, freshness) | Admin feed health dashboard, provenance panels |
| `useSignalCategories()` | Available `signal_type` values | Filter UI dropdowns, category navigation |

**Locations:** All hooks live in `SOCELLE-WEB/src/lib/intelligence/`.

If none of these hooks cover your use case, raise a WO before writing a new hook — do not reach directly into `supabase.from('market_signals')`.

## Step 2 — Edge function call contract

Call edge functions via `supabase.functions.invoke()` only — never raw `fetch()`.

| Function | Method | Params |
|----------|--------|--------|
| `intelligence-briefing` | GET | `{ category?: SignalType, limit?: number }` — limit max 50 |
| `ai-orchestrator` | POST | Generates AI briefs from signal context |
| `feed-orchestrator` | POST | Triggers multi-source signal refresh |
| `refresh-live-data` | POST | Forces live data refresh for a hub |

Correct pattern:
```ts
const { data, error } = await supabase.functions.invoke('intelligence-briefing', {
  body: { category: 'product_velocity', limit: 20 }
});
```

Wrong pattern (banned):
```ts
const res = await fetch(`${SUPABASE_URL}/functions/v1/intelligence-briefing`, ...);
```

Do not call `intelligence-briefing` if you're already using `useIntelligence` — that hook already wraps the signal query. Duplicating the call creates race conditions and double billing.

## Step 3 — Valid signal types (20 values — use exactly these)

```
product_velocity    treatment_trend     ingredient_momentum  brand_adoption
regional            pricing_benchmark   regulatory_alert     education
industry_news       brand_update        press_release        social_trend
job_market          event_signal        research_insight     ingredient_trend
market_data         regional_market     supply_chain
```

If a signal type you need is not on this list, raise a WO to add it to the schema — do not invent a new string.

## Step 4 — isLive rule (mandatory for every component)

Every component that consumes intelligence data must surface the live/demo state to the user. This is a trust contract — unlabeled mock data is forbidden by CLAUDE.md §8.

Required implementation pattern:
```tsx
const { signals, isLive } = useIntelligence({ category: activeFilter });

// In JSX:
{isLive ? (
  <span className="px-2 py-0.5 text-xs font-medium bg-signal-up/10 text-signal-up rounded-full">
    LIVE
  </span>
) : (
  <div className="border border-signal-warn/30 bg-signal-warn/5 rounded-lg px-4 py-2 text-sm text-signal-warn">
    DEMO — Connect a live data source to see real signals
  </div>
)}
```

Rules:
1. Read `isLive` from `useIntelligence` — never derive it locally
2. Show a LIVE badge (green, `signal-up` token) when `isLive=true`
3. Show a clearly labelled DEMO/PREVIEW banner when `isLive=false`
4. Never hide the isLive state from the user
5. Apply the same `allowedTiers` filter to both live and mock signal paths (DEBT-6 fix)

## Step 5 — Scan for banned patterns

Run these checks after writing or modifying any intelligence-related component:

```bash
cd SOCELLE-WEB

echo "=== BANNED: mockSignals import in user-facing components ==="
grep -rn "import.*mockSignals\|from.*mockSignals" src/pages/ src/components/ 2>/dev/null | grep -v node_modules

echo ""
echo "=== BANNED: raw supabase.from('market_signals') outside useIntelligence ==="
grep -rn "from('market_signals')\|from(\"market_signals\")" src/ 2>/dev/null \
  | grep -v "src/lib/intelligence/useIntelligence" \
  | grep -v node_modules

echo ""
echo "=== BANNED: supabase.functions.invoke('intelligence-briefing') duplicating useIntelligence ==="
# Flag any component that calls intelligence-briefing AND also uses useIntelligence
for f in $(grep -rl "intelligence-briefing" src/pages/ src/components/ 2>/dev/null); do
  if grep -q "useIntelligence" "$f"; then
    echo "DUPLICATE CALL: $f"
  fi
done

echo ""
echo "=== BANNED: hardcoded signal arrays in JSX ==="
grep -rn "const.*signals.*=.*\[{" src/pages/ src/components/ 2>/dev/null \
  | grep -v node_modules \
  | grep -v "\.test\." \
  | head -20

echo ""
echo "=== BANNED: invented signal_type values ==="
VALID_TYPES="product_velocity|treatment_trend|ingredient_momentum|brand_adoption|regional|pricing_benchmark|regulatory_alert|education|industry_news|brand_update|press_release|social_trend|job_market|event_signal|research_insight|ingredient_trend|market_data|regional_market|supply_chain"
grep -rn "signal_type\s*[:=]" src/pages/ src/components/ 2>/dev/null \
  | grep -v node_modules \
  | grep -Ev "$VALID_TYPES" \
  | head -20

echo ""
echo "=== isLive usage check ==="
echo "Components using useIntelligence WITHOUT isLive:"
for f in $(grep -rl "useIntelligence" src/pages/ src/components/ 2>/dev/null); do
  if ! grep -q "isLive" "$f"; then
    echo "MISSING isLive: $f"
  fi
done
```

## Step 6 — Output

Write `SOCELLE-WEB/docs/qa/intelligence_hub_contract_<timestamp>.json`:

```json
{
  "scan_date": "ISO-8601",
  "files_scanned": 0,
  "violations": {
    "mock_signals_import": [],
    "raw_market_signals_query": [],
    "duplicate_briefing_calls": [],
    "hardcoded_signal_arrays": [],
    "invented_signal_types": [],
    "missing_isLive": []
  },
  "total_violations": 0,
  "compliance": "PASS|FAIL"
}
```

## Step 7 — Post-change verification

After any Intelligence Hub UI change, run the `live-demo-detector` skill:

```bash
# Quick isLive coverage sanity check
cd SOCELLE-WEB
echo "Components with useIntelligence:"
grep -rl "useIntelligence" src/pages/ src/components/ 2>/dev/null | wc -l
echo "Of those, with isLive:"
grep -rl "useIntelligence" src/pages/ src/components/ 2>/dev/null \
  | xargs grep -l "isLive" 2>/dev/null | wc -l
```

Both counts must match before marking any intelligence WO complete.

## Inputs
- **Required:** Target path (default: `SOCELLE-WEB/src/pages/` and `SOCELLE-WEB/src/components/`)
- **Optional:** Specific component file(s) to narrow the scan
- **Assumptions:** Codebase compiled (`npx tsc --noEmit` passes)

## Verification (Deterministic)
- **Command:** `grep -rn "from('market_signals')" SOCELLE-WEB/src/ | grep -v useIntelligence | wc -l  # expect 0`
- **Pass criteria:** 0 banned patterns found; JSON report written to `docs/qa/`; all `useIntelligence` callers expose `isLive`
- **Fail criteria:** Any banned pattern present; any `useIntelligence` caller missing `isLive` display; invented signal type found

## Stop Conditions
- **Hard stop:** `npx tsc --noEmit` fails — fix build before running this skill
- **Hard stop:** `useIntelligence.ts` itself is missing — escalate immediately, do not proceed
- **Soft stop (owner decision):** More than 10 violations across different files — present a prioritized list rather than auto-fixing everything at once
- **Soft stop (owner decision):** A component needs a signal type not on the valid list — raise a WO, do not invent new values

## Fade Protocol
- **Retest trigger:** Run after any Intelligence Hub WO, after any new hook added to `src/lib/intelligence/`, or after any edge function deployment
- **Deprecation trigger:** Intelligence data architecture is replaced (e.g., signals table renamed or replaced with a new schema)
- **Replacement path:** If deprecated, merge into `data-integrity-suite` or rebuild via `skill-creator`
- **Last recertified:** 2026-03-09
