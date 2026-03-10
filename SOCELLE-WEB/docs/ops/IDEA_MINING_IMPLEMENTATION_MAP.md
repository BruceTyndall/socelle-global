# IDEA-MINING-01 — Implementation Map
**Authority:** docs/research/IDEA-MINING-01-comparables.md (45 patterns, 10 top patterns)
**Date:** 2026-03-13
**Status:** Living document — updated each session that touches Intelligence Hub

---

## Implementation Status by Pattern

### Pattern 1 — Impact Score Badge on Every Signal Card
**Status: PARTIAL**

`impact_score` is stored in DB (`market_signals.impact_score INTEGER`) and mapped through
`rowToSignal()` in `useIntelligence.ts`. The value is passed to every signal card component.

**What is implemented:**
- `IntelligenceSignalDetail.tsx:346-356` — detail page shows `impact_score` as a numeric badge
  with tier label (impact_score: 75, FREE tier badge visible in screenshot 07)
- `useIntelligence.ts` — `rankedScore` computed from `impact_score × freshness_decay × provenance_tier`
  (MERCH-REMEDIATION-01, commit 94875a2)

**What is NOT implemented:**
- No color-coded badge on `SignalCardFeatured` or `SignalCardStandard` in the list view
  (`src/components/intelligence/SignalCardEditorial.tsx` — no `impact_score` rendered, only `confidence_score`)
- No percentile indicator ("top 15% this week")

**Verify:** `/intelligence` → inspect any signal card → no color badge visible
**Screenshot:** `docs/ops/screens/2026-03-13/06_signal_card_grid_images.png` — cards show
confidence bar but no impact score badge

**Gap:** Missing `impact_score` badge on `SignalCardStandard` and `SignalCardFeatured`.
IDEA-MINING-01 Phase 1 item #1. Estimated: 1 day.

---

### Pattern 2 — Snapshot / Today View as Mandatory Entry Point
**Status: PARTIAL**

**What is implemented:**
- `/intelligence` page has: KPIStrip (4 KPIs), BigStatBanner (4 stats), SpotlightPanel (5 trending
  signals), NewsTicker (top 8 headlines), signal count in sidebar — these satisfy the "situational
  awareness at a glance" intent
- `IntelligenceHome.tsx` at `/home` — dedicated Snapshot page with KPI strip + featured signals +
  category nav + isLive guard (INTEL-WO-11, commit 97b55c4)
- Feed sidebar shows "Signal Index: 44 LIVE, Feed updated 10h ago" (screenshot 01)

**What is NOT implemented:**
- The public `/intelligence` page does NOT default to a "Today View" tab as the entry. It opens
  at the hero and requires scroll to reach the feed.
- No per-vertical Snapshot (medspa-specific KPIs vs global)
- No "emerging narrative count" metric
- `/portal/intelligence` (authenticated hub) still shows DEMO mock data — not live Snapshot

**Verify:** `/intelligence` → page load → must scroll past hero + KPI strip + BigStatBanner to
reach signal feed. Entry point is NOT the Snapshot.
**Screenshot:** `docs/ops/screens/2026-03-13/01_intelligence_all.png`

**Gap:** Authenticated portal intelligence hub still DEMO. Public page requires scroll.

---

### Pattern 3 — Similarity Deduplication with "N Similar" Collapse Badge
**Status: PARTIAL (DB only, no UI)**

**What is implemented:**
- `fingerprint` column on `market_signals` (FEED-WO-03)
- `is_duplicate` column — dedup logic in `rss-to-signals` marks near-identical signals
- Migration 000027: fingerprint backfill + dedup on existing signals (MERCH-INTEL-03-DB, 2f005fe)
- `useIntelligence.ts`: `.eq('is_duplicate', false)` filter — duplicates are EXCLUDED from the query

**What is NOT implemented:**
- No "N similar" collapse badge on signal cards in the UI
- No expand affordance to show all source URLs for a story
- Deduplication is hidden: duplicates are simply filtered out, not surfaced as a cluster

**Verify:** `/intelligence` → no collapse badge visible on any signal card
**Screenshot:** `docs/ops/screens/2026-03-13/06_signal_card_grid_images.png` — no cluster badge

**Gap:** UI deduplication grouping is NOT STARTED. DB foundation exists.

---

### Pattern 4 — Multi-Lens Signal View (List / Card toggle)
**Status: PARTIAL (state lifted, toggle UI not built)**

**What is implemented:**
- `activeFilter` state lifted to `Intelligence.tsx` page level (INTEL-UI-REMEDIATION-01, 6b330e4)
- `FEED_FILTERS` exported from `IntelligenceFeedSection.tsx` — filter state can be URL-synced
- This sets up the architectural foundation for view persistence

**What is NOT implemented:**
- No List / Card toggle button in the UI
- No localStorage persistence of view preference
- Only Card view exists — no dense List view
- INTEL-UI-REMEDIATION-01 explicitly deferred toggle UI: "Pattern 5 — List/Card view toggle
  (filter state lifted; toggle UI deferred)"

**Verify:** `/intelligence#signal-feed` → no List/Card toggle visible anywhere
**Screenshot:** `docs/ops/screens/2026-03-13/01_intelligence_all.png` — card-only view

**Gap:** Toggle UI NOT STARTED. This is the next highest-impact Pattern 1 work item.

---

### Pattern 5 — Sentiment Aggregate Banner Above Signal List
**Status: NOT STARTED**

No sentiment aggregate is computed or displayed anywhere in the Intelligence Hub.
- No sentiment field on `market_signals` (no `direction`-based aggregate shown in feed header)
- `direction` (up/down/stable) exists per signal but no aggregate banner
- `marketPulse` object passed to `FeedSidebar` is not used for a sentiment bar

**Verify:** `/intelligence#signal-feed` → no sentiment bar above signal list
**Screenshot:** `docs/ops/screens/2026-03-13/01_intelligence_all.png` — no sentiment bar visible

**Gap:** NOT STARTED. IDEA-MINING-01 Phase 1 item #2. Estimated: 1 day.

---

### Pattern 6 — "Spot → Understand → Act" Action Arc on Every Signal
**Status: PARTIAL (detail page only, not on feed cards)**

**What is implemented:**
- `CrossHubActionDispatcher` exists and handles 9 action types (INTEL-WO-07, 97b55c4)
- Signal detail page (`IntelligenceSignalDetail.tsx`) — navigable from signal cards
- `SignalDetailPanel` inside portal (INTEL-WO-06) — has CrossHubActionDispatcher wired

**What is NOT implemented:**
- NO "What to do" row below signal summary on `SignalCardFeatured` or `SignalCardStandard`
- No inline cross-hub action link on feed cards
- IDEA-MINING-01 specifies: "every signal card includes... a 'Take action' affordance"
- The action arc is 2 clicks deep (card → detail → action), not in-card

**Verify:** `/intelligence#signal-feed` → inspect signal cards → no "Take action" link visible
**Screenshot:** `docs/ops/screens/2026-03-13/06_signal_card_grid_images.png` — no action row

**Gap:** In-card action arc NOT STARTED. Infrastructure exists; needs UI surfacing.

---

### Pattern 7 — Entity Recognition Chips on Signal Cards
**Status: NOT STARTED**

- `related_brands?: string[]` exists on `IntelligenceSignal` type
- `related_products?: string[]` exists
- These are NOT rendered as clickable chips on signal cards
- No `entity_tags` column in DB
- No NLP extraction pipeline

**Verify:** `/intelligence#signal-feed` → inspect signal cards → no brand/ingredient chips
**Screenshot:** `docs/ops/screens/2026-03-13/06_signal_card_grid_images.png` — no chips

**Gap:** NOT STARTED. Phase 2 item (requires NLP). `related_brands` foundation exists.

---

### Pattern 8 — Vertical-Scoped Benchmark KPI Strip with Peer Comparison
**Status: PARTIAL (platform-wide only, no peer comparison)**

**What is implemented:**
- `KPIStrip` on `/intelligence`: 4 KPIs (Signals Ingested, Verified Sources, Avg Confidence,
  Active Feeds) — these are platform-wide stats, not vertical-scoped
- `BigStatBanner` with signal infrastructure stats
- `useDataFeedStats()` hook provides live values from `data_feeds` + `market_signals`

**What is NOT implemented:**
- No per-vertical KPI (e.g., "Medspa signals this week vs. Salon signals this week")
- No peer comparison (Your value / Vertical median / Top quartile)
- KPIs don't change when Medspa/Salon/Brands tab is selected
- Feed sidebar shows aggregate Signal Index, not vertical-specific

**Verify:** `/intelligence` → click Medspa tab → KPI strip values remain identical to All
**Screenshot:** `docs/ops/screens/2026-03-13/02_intelligence_medspa.png` — KPI strip visible,
values are platform-wide

**Gap:** Vertical-scoped KPIs NOT STARTED. Peer comparison requires N≥20 operators.

---

### Pattern 9 — Filter Panel with Grouped Dimensions + "More Filters" Expansion
**Status: PARTIAL (server-side filter wired, flat tab bar only)**

**What is implemented:**
- Server-side `signal_type` filter via `signalTypes?: SignalType[]` in `useIntelligence`
  (INTEL-UI-REMEDIATION-01, 09e7161)
- 7-tab horizontal filter bar in feed section: All / Treatment / Ingredients / Regulatory /
  Pricing / Research / Market (`IntelligenceFeedSection.tsx:34-42`)
- Full-text search bar with `/` keyboard shortcut (`IntelligenceFeedSection.tsx:93-107`)
- Vertical filter tabs above feed: All / Medspa / Salon / Brands (`Intelligence.tsx:68-73`)
- Filter state lifted to page level with URL-sync capability

**What is NOT implemented:**
- No "More filters" expansion panel
- No saved filter sets
- No date range filter
- No impact threshold slider
- No source/tier/geo filter dimensions
- The current bar exposes 2 dimensions (vertical + category) only; IDEA-MINING-01 Phase 1
  target is 4-6 primary + advanced expansion

**Verify:** `/intelligence#signal-feed` → filter bar shows 7 tabs; no "More filters" button
**Screenshot:** `docs/ops/screens/2026-03-13/05_category_filter_regulatory.png` — Regulatory
tab active, flat tab bar visible, no expansion panel

**Proof (server-side code):** `src/lib/intelligence/useIntelligence.ts:~80` (signalTypes filter)
and `src/components/intelligence/IntelligenceFeedSection.tsx:34-42` (FEED_FILTERS array)

---

### Pattern 10 — AI Brief Builder (Bulk Select → Prompt → Synthetic Signal)
**Status: NOT STARTED**

No multi-select, no bulk action, no brief generation on the signal feed.
- `AIToolbar` exists in portal with 6 tools (INTEL-WO-05) but requires per-signal, not bulk
- No `signal_type='ai_brief'` row type in schema
- No `source_signal_ids` column on `market_signals`

**Verify:** `/intelligence#signal-feed` → no checkboxes on signal cards, no "Generate Brief" button
**Screenshot:** `docs/ops/screens/2026-03-13/06_signal_card_grid_images.png` — no checkboxes

**Gap:** NOT STARTED. Requires INTEL-WO-07 / OpenAI edge function. Phase 3.

---

## Implementation Summary

| Pattern | Name | Status | Phase |
|---------|------|--------|-------|
| 1 | Impact Score Badge | PARTIAL — DB + detail page; NOT on list cards | Phase 1 |
| 2 | Snapshot / Today View | PARTIAL — public KPI strip exists; portal still DEMO | Phase 1 |
| 3 | Similarity Dedup Collapse | PARTIAL — DB dedup works; no UI cluster badge | Phase 2 |
| 4 | List / Card View Toggle | PARTIAL — state architecture done; toggle UI NOT BUILT | Phase 1 |
| 5 | Sentiment Aggregate Banner | NOT STARTED | Phase 1 |
| 6 | Spot→Understand→Act Arc | PARTIAL — detail page + portal; NOT on feed cards | Phase 1 |
| 7 | Entity Recognition Chips | NOT STARTED | Phase 2 |
| 8 | Vertical Benchmark KPI Strip | PARTIAL — platform-wide; no per-vertical / peer comparison | Phase 2 |
| 9 | Filter Panel Grouped Dims | PARTIAL — 2 filter dimensions; no More Filters expansion | Phase 1 |
| 10 | AI Brief Builder | NOT STARTED | Phase 3 |

**Phase 1 gaps remaining (can ship without new infrastructure):**
1. Impact score badge on signal cards (1 day)
2. Sentiment aggregate banner (1 day)
3. List / Card view toggle with localStorage (0.5 days)
4. "What to do" action row on signal cards (2 days)
5. "More filters" panel (Impact threshold + Date range) (1 day)

**Total Phase 1 remaining: ~5.5 days of work**

---

## Screenshot Evidence

All screenshots captured 2026-03-13 from `http://localhost:5173` (dev server, live DB connection).

| # | Screenshot | What it proves |
|---|-----------|----------------|
| 01 | `screens/2026-03-13/01_intelligence_all.png` | Feed section live with 44 signals, sidebar Signal Index LIVE |
| 02 | `screens/2026-03-13/02_intelligence_medspa.png` | Medspa vertical tab selected (underlined active state) |
| 03 | `screens/2026-03-13/03_intelligence_salon.png` | Salon vertical tab selected — server-side filter wired |
| 04 | `screens/2026-03-13/04_intelligence_brands.png` | Brands vertical tab selected |
| 05 | `screens/2026-03-13/05_category_filter_regulatory.png` | Regulatory category filter active — server-side signalTypes filter firing |
| 06 | `screens/2026-03-13/06_signal_card_grid_images.png` | 2-col card grid with distinct per-signal images (ID-hash pool) |
| 07 | `screens/2026-03-13/07_signal_detail_page.png` | Signal detail page: title + full description + "View source" external link |
| 08 | `screens/2026-03-13/08_admin_feeds_hub.png` | NOTE: Headless admin auth fails (Supabase role lookup blocks). Code proof: `AdminFeedsHub.tsx:163` → `.order('display_order', { ascending: true })` |

### Full Article Reading (Pattern 4 / Pattern 6 sub-question)

**Status: EXTERNAL LINK ONLY**

The signal detail page (`/intelligence/signals/:id`) shows:
- Full signal description (the text stored in `market_signals.description`)
- Source attribution: "FDA OpenFDA MDR → View source ↗" (external link)
- Metadata: confidence score, impact score, topic, tier
- The `description` column typically contains the RSS excerpt (100-500 chars) — NOT the full article
- Full article text is at the source URL; clicking "View source" opens the external page

**Verdict:** Full-text in-app reading is NOT implemented. Current state is: excerpt in app + external link for full article. This is acceptable for the current phase (signals are metadata objects, not CMS articles). Full in-app reading would require a content scraper + storage pipeline (future WO).

**Screenshot:** `docs/ops/screens/2026-03-13/07_signal_detail_page.png` — shows "View source" link
