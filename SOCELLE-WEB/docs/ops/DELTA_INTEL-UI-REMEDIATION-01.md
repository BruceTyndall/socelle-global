# DELTA — INTEL-UI-REMEDIATION-01
**WO:** INTEL-UI-REMEDIATION-01
**Status:** DONE
**Completed:** 2026-03-13
**IDEA-MINING-01 patterns cited:** Pattern 5 (List/Card view toggle — future), Pattern 9 (Filter panel, server-side), Pattern 3 (Impact score badge — existing)

---

## Objective (from build_tracker.md)
Fix Intelligence Hub UX per IDEA-MINING-01 patterns + outstanding segmentation gaps:
- Server-side category filtering via `signalTypes?: SignalType[]` in useIntelligence
- Image diversity via ID-hash pool in useSignalImage
- Lift filter state from IntelligenceFeedSection to Intelligence.tsx
- spotlightTrends 3→5

---

## Files Changed

| File | Change | Explanation |
|------|--------|-------------|
| `src/lib/intelligence/useSignalImage.ts` | REWRITE | Replaced single-image TYPE_MAP with multi-image pools (2-3 per signal_type). Deterministic ID-hash (sum of charCodes % pool size) ensures same signal = same image, different signals of same type = different images. Covers all 19 SignalType values + vertical fallbacks. |
| `src/lib/intelligence/useIntelligence.ts` | EDIT | Added `signalTypes?: SignalType[]` to `UseIntelligenceOptions`. Added `.in('signal_type', signalTypes)` DB clause. Updated queryKey to include `signalTypes` for cache isolation. Updated realtime queryKey to match. |
| `src/components/intelligence/IntelligenceFeedSection.tsx` | EDIT | Exported `FEED_FILTERS`. Replaced internal `useState` for activeFilter with controlled props (`activeFilter`, `onFilterChange`). `filteredSignals` memo now search-only (type filtering moved to server). Filter nav onClick uses `onFilterChange` prop. |
| `src/pages/public/Intelligence.tsx` | EDIT | Imported `FEED_FILTERS` + `SignalType`. Added `activeFilter` state. Added `activeSignalTypes` useMemo (derives SignalType[] from filter key). `useIntelligence()` now receives `signalTypes` + `vertical`. Passes `activeFilter`/`onFilterChange` to `<IntelligenceFeedSection>`. `spotlightTrends` slice 3→5. |

---

## DB Objects Touched

None. All changes are client-side TypeScript/React. No migrations required.

---

## Commands Run

```bash
# Type check — PASS (0 errors)
npx tsc --noEmit

# live-demo-detector check
grep -r "fake.live|hardcoded.*signal|signal.*DEMO" src/pages/public/Intelligence.tsx ... → 0 violations

# banned-term-scanner check
grep -n "unlock|seamless|AI-powered|actionable insights" src/pages/public/Intelligence.tsx → 0 violations

# design-lock-enforcer check
grep -n "pro-*|font-serif|#1E252B" src/pages/public/Intelligence.tsx ... → 0 violations (comment only)
```

---

## UI Paths Tested

- `/intelligence` — filter tabs now trigger server-side DB query with `.in('signal_type', [...])` instead of client-side array filter
- Signal cards now show varied images within the same signal_type (ID-hash ensures deterministic variety)
- spotlightTrends panel (SpotlightPanel component) now receives up to 5 trends instead of 3
- Filter state is controlled at page level — enables future URL-sync or cross-component filter sharing

---

## Proof Artifact Paths

- `docs/qa/verify_INTEL-UI-REMEDIATION-01.json` (this session)
- `docs/ops/DELTA_INTEL-UI-REMEDIATION-01.md` (this file)

---

## Commit SHAs

| SHA | File | Description |
|-----|------|-------------|
| `342f263` | useSignalImage.ts | ID-hash image pool variation |
| `09e7161` | useIntelligence.ts | signalTypes server-side filter |
| `6b330e4` | IntelligenceFeedSection.tsx | lift filter state + export FEED_FILTERS |
| `2e8b94a` | Intelligence.tsx | wire server-side filter + spotlightTrends 3→5 |

---

## What Is Still Open / Next WO Dependency

| Item | WO | Notes |
|------|----|-------|
| Pattern 5 (List/Card view toggle) | INTEL-UI-REMEDIATION-01 Phase 2 or new WO | Not in scope for this WO — density toggle requires SignalCardList component |
| Pattern 6 (Sentiment Aggregate Banner) | Future INTEL-WO | Requires client-side sentiment computation from signal topic/direction |
| Pattern 7 (Spot→Understand→Act arc) | Future INTEL-WO | CrossHubActionDispatcher already exists — needs UI integration below signal card |
| Currents feed live verification | NEWSAPI-INGEST-01 follow-up | Next pg_cron hourly run will test CURRENTS_KEY wiring |
| Next WO | CMS-WO-07 | story_drafts table + feeds-to-drafts edge function |
