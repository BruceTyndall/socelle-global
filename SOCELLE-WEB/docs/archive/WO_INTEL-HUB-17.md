# Work Order: INTEL-HUB-17 (Intelligence Merchandising & API Dispersion)

## 1. Goal Description
The Intelligence Hub currently suffers from severe dispersion imbalances. Data sourced from the `api_registry` and `data_feeds` are ingested by `feed-orchestrator` and `rss-to-signals` edge functions. Because these functions use rigid mappings mapped to the outer category (e.g., all `category = aesthetics` forced into `vertical = multi`, or all `market_data` forced into `signal_type = product_velocity`), niche signals are starved on the frontend. The `useIntelligence.ts` UI component uses explicit filters on `vertical` and `signalTypes`, which misses misassigned signals. 

This WO decouples ingestion from rigid categories by integrating dynamic assignments using the existing `classifyTopic` NLP function to accurately pinpoint vertical, tier_min, and signal type. 

## 2. Boundaries and Scope Changes
- `supabase/functions/feed-orchestrator/index.ts`: Replace `CATEGORY_SIGNAL_TYPE` with dynamic derivation (using `classifyTopic`).
- `supabase/functions/rss-to-signals/index.ts`: Replace `CATEGORY_VERTICAL` overrides with proper mapping from `data_feeds.vertical` and `classifyTopic` keyword matching.
- `src/lib/intelligence/useIntelligence.ts`: Implement fault-tolerant UI fallback filtering so narrow filters automatically broaden appropriately when starved for content.

### Dependencies
- None: Decoupled from CMS work tracks. No new database tables or frontend routing required.

## 3. Repro Steps (What "Bad Dispersion" Looks Like)
1. Go to `/portal/intelligence`. 
2. Change the Intelligence Hub filter to Vertical: "Salon". 
3. Observe that fewer than 5 signals load, despite dozens of salon-related feeds actively running every hour.
4. Reason: `rss-to-signals` forces all category `business` signals into `vertical: 'multi'`, rendering them invisible to the `vertical: 'salon'` filter.

## 4. Acceptance Criteria
1. **Dynamic Edge Classification**: `feed-orchestrator` and `rss-to-signals` correctly assign `vertical` and `signal_type` via the `classifyTopic()` heuristics function instead of outer source categories.
2. **Metadata Flow-Through**: Properties like `tier_min`, `vertical`, and classification mappings correctly flow undisturbed to `market_signals`.
3. **UI Resiliency**: The frontend uses widened queries or logical OR patterns to display intelligence when strict verticals are highly filtered context starvation.
4. **Validation Check**: Compile and type-check edge functions via `deno check`. 

## 5. Implementation Plan
- **PR 1**: Data Pipeline Update
  - Refactor `rss-to-signals` and `feed-orchestrator` functions. Remove static NLP mapping anti-patterns; delegate strictly to the internal `classifyTopic` engine heuristics.
- **PR 2**: UI/Frontend Stabilization
  - Overhaul `useIntelligence.ts` query constraints to prevent empty-board scenarios by allowing "related" broader topologies (like mapping "medspa" into related broader signals if strict matching fails).
