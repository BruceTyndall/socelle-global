# Intelligence Dataset Audit — 2026-03-14

## 1. Implemented / Partial / Missing

### 1.1 Feed and Ingestion Layer

- **Implemented**
  - `feed-orchestrator` edge function orchestrates `data_feeds` for RSS/API inputs with:
    - source authority tiers and `provenance_tier` mapping (`Tier 1` regulatory, `Tier 2` academic/structured, `Tier 3` trade/derived).
    - `signal_type`, `vertical`, `tier_min`, `topic`, `impact_score`, `fingerprint`, and `display_order` written into `market_signals` (per MERCH-INTEL-02/03 migrations).
  - `rss-to-signals` edge function promotes `rss_items` into `market_signals` with:
    - Atom + RSS2 parsing (`detectFeedFormat`, `parseAtomEntries`, `parseRss2Entries`).
    - topic classification and impact scoring.
    - safety/regulatory topic enrichment and boost rules.
  - `ingest-openfda` feeds Regulatory/Safety signals with device-level fingerprints and deduplication (MERCH-INTEL-03-DB acceptance tests show `0` duplicate titles and `17` high-impact regulatory signals ≥70).
  - `pg_cron` schedule exists for `feed-orchestrator-hourly` (see API runtime inventory and prior merch verify JSONs).

- **Partial**
  - Medspa coverage now meets the ≥30 enabled-feeds requirement on paper (`MERCH-INTEL-02_v3`), but historic audits (v2) showed:
    - `feed-orchestrator` producing `0` signals from the `data_feeds` path at the time of that run.
    - 10 “healthy” feeds (HTTP 200) returning 0 parseable items, awaiting XML/Atom inspection.
  - Several feeds remain in `degraded` state (intermittent 4xx/5xx/timeout), creating noisy `feed_run_log` but not breaking the UI contract.

- **Missing / Risky**
  - No single consolidated JSON for `data-integrity-suite` has yet been written in `SOCELLE-WEB/docs/qa/` (suite is defined and member skills have been exercised individually via MERCH-INTEL-02/03 and API_RUNTIME_INVENTORY, but not re-run as a 7-skill suite post-latest INTEL/MONETIZATION work).
  - `feeds-to-drafts` is not deployed; CMS story drafts are therefore not yet wired into an automated “feeds → drafts” path.

### 1.2 Taxonomy and RSS Tagging

- **Implemented**
  - `taxonomy_tags` table live with ~584 tags and 17 `category_group`s (`WO-TAXONOMY-01` verify JSON confirms CSV import + Supabase `gen types`).
  - `rss_tag_rules`, `rss_item_tags`, `normalize_tag_match_text`, and `auto_tag_rss_items` exist and implement rule-driven tagging from article text → canonical `tag_code` (AUTO_TAGGING_RULES.md + migrations `20260313000043` + `20260313000044`).
  - Backfill migration attaches taxonomy-derived fields to `market_signals`:
    - `primary_environment`, `primary_vertical`, `service_tags`, `product_tags`, `claim_tags`, `region_tags`, `trend_tags`, `brand_names`.
  - Tag performance aggregates exist in views such as `v_tag_performance_30d` and `v_tag_orphans` (per INTEL monetization playbook and migrations).

- **Partial**
  - Rule coverage leans heavily toward `pro_environment`, `medspa_service`, `body_device_service`, `claim_regulation`, and `region` groups; consumer-layer trend tags and some product/brand micro-categories are underrepresented.
  - Confidence banding follows AUTO_TAGGING_RULES guidance, but there is no automated thresholds report in `docs/qa/` for how many RSS items are untagged or only carry extremely low-confidence tags.

- **Missing / Risky**
  - No deterministic `rss_item_tags` coverage report (e.g. “% of recent RSS items with ≥1 taxonomy tag, per category_group”) is currently checked in as a QA artifact.

### 1.3 Signals and Scoring

- **Implemented**
  - `market_signals` schema includes:
    - `signal_type`, `vertical`, `topic`, `tier_min`, `tier_visibility`, `impact_score`, `provenance_tier`, `quality_score`, `sentiment`, `status`, `requires_credit`, `content_segment`, `reading_time_minutes`, `word_count`, `hero_image_url`, `article_html`, and tag arrays.
  - MERCH-INTEL-03-DB verify JSON confirms:
    - `fingerprint` present for all active signals in the audited window (`has_fingerprint=47`).
    - `impact_score` boosted for regulatory alerts (≥70) and no duplicates by normalized title.
  - `useIntelligence` hook:
    - selects the full merchandising surface from `market_signals` (including provenance + premium fields).
    - enforces `tier_min` and `tier_visibility` via `effectiveTierMin` and `TIER_ACCESS`.
    - implements a multi-column sort: `quality_score` DESC → `impact_score` DESC → `provenance_tier` ASC → `display_order` ASC → `published_at` DESC → `updated_at` DESC.
    - applies 14-day freshness gating for free tier and timeline-specific eligibility for “What Changed” (≥60 impact, ≤72h, non-generic topics).

- **Partial**
  - Confidence scoring and `provenance_tier` values are present on the schema and are surfaced in the UI (SignalCard, SignalDetailPanel), but there is no consolidated `confidence-scorer` / `signal-data-validator` JSON in `docs/qa/` measuring:
    - % of signals missing `confidence_score` or `provenance_tier`.
    - distribution of impact × provenance across verticals.
  - Some signal types (e.g., `market_data`, `regional_market`, certain brand/press signals) rely more heavily on heuristics than on fully-documented scoring methodology.

- **Missing / Risky**
  - No up-to-date `data-integrity-suite-*.json` exists tying together feed source audit, pipeline trace, signal freshness, confidence tiers, provenance display, and merchandising rules **after** the INTEL-MONETIZATION and INTEL-POWER slices.

### 1.4 Channels, Personalization, and Engagement

- **Implemented**
  - `user_tag_preferences` and `user_signal_engagements` tables plus RPCs (`apply_user_tag_preference_delta`, `merge_user_tag_preference_scores`, `merge_user_signal_engagements`) are live with RLS (INTEL-MONETIZATION-01 verify JSON and WO-TAXONOMY-01/INTEL-MONETIZATION migrations).
  - `useUserTagPreferences`, `useSignalEngagement`, `useAnonymousSignalMemory`, and `personalization.ts` implement a 2-layer preference system:
    - anonymous event-based memory for logged-out sessions.
    - user-scoped tag preference graph for authenticated users.
  - `useIntelligenceChannels` combines:
    - `v_intelligence_channel_performance_30d`, `v_intelligence_channel_top_tags_30d`, and `intelligence_channel_tags` mapping.
    - tag-based and scope-based scoring (`scoreSignalForChannel`) that respects `signal_type_scope`, `vertical_scope`, `region_scope`, and tag weights.
  - Funnel events (`funnelEvents.ts`) persist non-PII `platform_events` with `tag_codes` and apply preference deltas based on `signal_viewed`, `signal_clicked`, `signal_saved`, `signal_liked`, `signal_hidden`.

- **Partial**
  - The personalized rail (`IntelligenceChannelRail` + `useIntelligenceChannels`) is live and Pearl Mineral compliant, but there is no JSON artifact validating:
    - free vs paid channel visibility ratios.
    - whether channel `top_signals` consistently reflect tag + scope rules rather than incidental matches.

- **Missing / Risky**
  - No suite-level audit proves that `user_tag_preferences`/`user_signal_engagements` → `preferenceScoreMap` → `useIntelligence` ordering is free of regressions after INTEL-POWER and INTEL-UX work.

### 1.5 UI Readiness and Provenance Display

- **Implemented**
  - Public `/intelligence`, portal `IntelligenceHub`, `SignalCard`, `SignalDetailPanel`, and `IntelligenceSignalDetail` all:
    - display source name and, where available, linkified `source_url`.
    - show provenance tier labels (Regulatory / Academic / Trade) when `provenance_tier` is present.
    - render confidence values (`confidence_score`) as percentages or tier labels.
    - label LIVE vs DEMO states via `isLive` pattern on Intelligence surfaces and on IntelligenceCommerce.
  - `IntelligenceBriefDetail` uses `sanitizeArticleHtml` for CMS-backed briefs and includes structured data (schema.org Article) plus category/tags.

- **Partial**
  - Some secondary surfaces (e.g., small signal summaries on IntelligenceCommerce, channel cards) reference signals without always repeating full provenance + confidence UI; this is likely acceptable for secondary context but reduces at-a-glance trust in some places.

- **Missing / Risky**
  - No dedicated `provenance-checker-*.json` is present in `docs/qa/` for the current code state; the last formal provenance checks were embedded in merch / governance audits instead of a dedicated suite run.

## 2. Evidence (skills + artifacts)

- **Existing skills and artifacts leveraged**
  - `intelligence-merchandiser` + `MERCH-INTEL-02_v2/v3` verify JSONs (feed coverage, safety dominance, deduplication, medspa feed count, Atom parser, display_order and priority columns).
  - `MERCH-INTEL-03-DB` verify JSON (deduplication, impact_score boosting, free-tier high-impact count, no null fingerprints).
  - `INTEL-MONETIZATION-01` verify JSON (taxonomy + user preference schema deployed, RLS and REST proof for `taxonomy_tags`, `user_tag_preferences`, `user_signal_engagements`).
  - `AGENT_ACTIVATION` + `API_RUNTIME_INVENTORY` audit (edge functions list, external API inventory, `feed-orchestrator` and `rss-to-signals` status, pg_cron schedule).
  - Code-level review of `useIntelligence`, `useIntelligenceChannels`, `useSignalEngagement`, `useUserTagPreferences`, `funnelEvents.ts`, `SignalCard`, `SignalDetailPanel`, `Intelligence`, `IntelligenceHub`, `IntelligenceSignalDetail`, `IntelligenceCommerce`.
  - TAXONOMY and AUTO TAGGING docs (`INTEL_BRAND_PROVIDER_MONETIZATION.md`, `AUTO_TAGGING_RULES.md`).

- **Skills conceptually exercised by AGENT-17 in this pass**
  - `data-integrity-suite` (by cross-referencing its member expectations against the artifacts listed above).
  - `provenance-checker` (schema and UI checks via direct code inspection of signal-rendering components and intelligence hooks).

## 3. Top 10 Risks That Break Trust

1. **No fresh `data-integrity-suite` report after INTEL-MONETIZATION + INTEL-POWER + INTEL-UX work.**
   - *Why it matters*: Without a suite-level PASS, we are relying on older merch and governance artifacts that predate the latest UX/channel changes.
   - *Impact*: Hidden regressions in freshness, confidence, or provenance display could slip through.

2. **Medspa feed coverage and `data_feeds` health remain fragile.**
   - *Why*: Historic audits showed `feed-orchestrator` producing 0 signals from the `data_feeds` path despite ≥30 enabled medspa feeds.
   - *Impact*: The system can appear “live” while actually being driven primarily by FDA/OpenFDA signals, skewing topic distribution and user perception.

3. **Topic and vertical balance heavily skewed toward safety/regulatory.**
   - *Why*: openFDA signals still dominate the active corpus in most snapshots.
   - *Impact*: Professionals may see an over-representation of adverse event signals versus opportunity or trend signals, distorting decision-making.

4. **No JSON proof that confidence tiers and provenance are complete across all current signals.**
   - *Why*: Schema supports them, but we lack a current `confidence-scorer` / `provenance-checker` output measuring coverage.
   - *Impact*: Missing or inconsistent confidence/provenance on a portion of signals damages trust in the whole table.

5. **User preference graph and channel personalization lack regression-proof coverage.**
   - *Why*: `user_tag_preferences`, `user_signal_engagements`, and derived `preferenceScoreMap` are central to ranking and channels, but only INTEL-MONETIZATION-01 covered their live deploy, not ongoing quality.
   - *Impact*: Subtle bugs could cause irrational channel ordering or “For You” drift without immediate visibility.

6. **No explicit SLA check on `updated_at` and freshness windows post-monetization.**
   - *Why*: Free tier now gates on 14-day window and timeline caps to 72h, but we lack a suite artifact that confirms all surfaces respect these rules.
   - *Impact*: Stale signals could sneak into Today/Timeline views and undercut the “live” promise.

7. **Channel rails do not yet have a topic-distribution guardrail artifact.**
   - *Why*: `topic-distribution-checker` is specified but not recently run to confirm that no topic exceeds the 40% cap on live rails.
   - *Impact*: Users may see repetitive channel content dominated by a single topic family.

8. **Feeds-to-drafts pipeline is not deployed.**
   - *Why*: CMS story drafts still depend on manual editors rather than a verified “feeds → drafts” engine.
   - *Impact*: Intel surfaces can get out of sync with editorial rails and briefs when manual coverage falls behind the data.

9. **No dedicated, recent `provenance-checker` JSON.**
   - *Why*: Source and provenance UI appears correct in main surfaces, but edge cases (secondary lists, legacy components) may still omit attribution.
   - *Impact*: Any unlabeled signals erode trust in the rest of the surface.

10. **Historic `live-demo-detector` WARN status persists.**
    - *Why*: Baseline issues outside this slice (e.g., older test fixtures and non-intelligence pages) keep the suite from a clean PASS.
    - *Impact*: Makes it harder to claim global LIVE/DEMO discipline is fully enforced even if Intelligence itself is in good shape.

## 4. Fix Plan (Minimal, Ordered)

1. **Produce a fresh `data-integrity-suite` + `provenance-checker` run for current HEAD.**
   - *Target*: `SOCELLE-WEB` root; skills `data-integrity-suite`, `provenance-checker`.
   - *Artifacts*: `docs/qa/data-integrity-suite_2026-03-14.json`, `docs/qa/provenance-checker_2026-03-14.json`.
   - *Goal*: Confirm freshness, confidence, provenance, and merchandising rules all pass together.

2. **Add explicit freshness and coverage checks for `market_signals` into an automated audit.**
   - *Target modules*: a small script or skill extension that computes:
     - % of active signals with `updated_at` < 14 days and ≥60 impact.
     - topic and vertical distribution across the active window.
   - *Artifacts*: `docs/qa/signal_freshness_coverage_2026-03-14.json`.

3. **Run `topic-distribution-checker` and pipe results into the merchandising suite.**
   - *Target*: live Intelligence and channel rails.
   - *Artifacts*: `docs/qa/topic_distribution_2026-03-14.json` referenced from the Merch QA.
   - *Goal*: enforce FEED-MERCH-09 (no topic >40% of displayed signals per vertical).

4. **Add a thin reporting wrapper for `user_tag_preferences` and `user_signal_engagements`.**
   - *Target*: new audit script or skill snippet that reports:
     - # of users with non-empty preferences.
     - average tag-count per user, distribution of scores.
     - correlation between engagement types and tag deltas.
   - *Artifacts*: `docs/qa/user_preference_audit_2026-03-14.json`.

5. **Validate provenance and confidence coverage across all signal-rendering components.**
   - *Target components*: `SignalCard`, `SignalDetailPanel`, `IntelligenceSignalDetail`, Intelligence preview components, channel detail cards, IntelligenceCommerce cardlets.
   - *Action*: extend `provenance-checker` skill to emit a list of any components that render signals without showing source or provenance.

6. **Reconfirm medspa/salon/brand feed health via a targeted health script.**
   - *Target*: `data_feeds`, `feed_run_log`.
   - *Action*: sample last N runs and report:
     - # of feeds per vertical with ≥1 successful item in last 72h.
     - # of feeds with 5+ consecutive failures.
   - *Artifacts*: `docs/qa/feed_health_intel_verticals_2026-03-14.json`.

7. **Document current “safety dominance” and set explicit target bands.**
   - *Target*: `market_signals` over last 30 days.
   - *Action*: compute the topic share for safety vs other topics and set a target (e.g., ≤40% safety for general-intelligence views while preserving pinning in safety-focused views).

8. **Wire the future `feeds-to-drafts` deployment into the dataset audit.**
   - *Target*: once CMS-WO-07 is executed.
   - *Action*: extend this audit doc to include coverage from `story_drafts` and `cms_posts` surfaces linked back to signals.

9. **Attach all future dataset changes to a WO + verify JSON.**
   - *Target*: any INTEL/FEED/MERCH WOs going forward.
   - *Action*: treat this audit as a baseline; any new change must regenerate or extend the suite artifacts listed above.

10. **Re-run `live-demo-detector` once non-intel baseline issues are addressed.**
    - *Target*: global app.
    - *Goal*: move `overall` from WARN to PASS so Intelligence can claim “verified LIVE/DEMO discipline” without caveats.

