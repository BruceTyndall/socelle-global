# SOCELLE INTELLIGENCE MONETIZATION PLAYBOOK

## Purpose

This document defines how SOCELLE should monetize Intelligence for brands and professional beauty operators using live `market_signals`, taxonomy tags, and engagement telemetry.

The product is not raw feed access. The product is aggregated, anonymized intelligence that helps brands place budget and helps operators decide what to offer, carry, learn, and promote next.

## Core Product Rule

- Sell intelligence views, not feed volume.
- Use `taxonomy_tags` as the canonical language for environments, services, claims, trends, regions, and roles.
- Use `market_signals` as the canonical market object.
- Use `platform_events` as the behavioral layer that turns content interaction into demand insight.
- Use CMS and Studio as the merchandising layer so editors can override imagery, placements, and featured stories without code deploys.
- Do not hardcode market stats into paid surfaces. Every KPI should resolve from live aggregates or be clearly labeled editorial context.

## Shared Data Foundation

### Existing Foundation

- `taxonomy_tags`
- `rss_item_tags`
- `market_signals`
- `platform_events`
- `v_tag_performance_30d`
- `v_tag_orphans`
- `story_drafts`
- `cms_posts`
- `content_placements`

### Recommended Additive Models

- `user_tag_preferences`
  - `user_id`, `tag_code`, `score`, `last_event_at`
- `org_tag_preferences`
  - `org_id`, `tag_code`, `score`, `source`
- `intelligence_channels`
  - `slug`, `name`, `audience`, `tier_min`, `region_scope`, `status`
- `intelligence_channel_tags`
  - maps channel definitions to weighted tag sets

## Paid Intelligence For Brands

### Brand Intelligence Dashboard

- Overview
  - `Pro Engagement Score`
  - rising service, claim, and region tags
  - category mood using `sentiment` and `score_importance`
- Service and Claim Demand
  - service demand heatmap by `service_tags`, region, and persona cohort
  - claims radar across `claim_tags` such as `clean_beauty`, `microbiome_friendly_claim`, and `mocra_compliance`
- Brand Versus Category Benchmark
  - share of engagement by category, region, and tag family
  - positioning map showing claim and topic gaps versus peers
- Early Trend Detector
  - small but fast-growing tags with base volume, growth rate, and sample headlines
- Voice of the Pro Personas
  - persona cards built from clustered tag engagement, role, environment, and region
- Recommended Brand Moves
  - tiles driven by tag gaps, accelerating claims, and regional performance shifts

### Brand Paid Products

- Always-on Brand Intelligence Dashboard
- Quarterly Pro Intelligence Dossier
- Launch and Campaign Evaluation
- Persona and Territory Strategy Workshop
- Early Trend Alerting Pack

## Paid Intelligence For Professional Providers

### Provider Intelligence Dashboard

- Local Service and Trend Pulse
  - top services by local and global interest index
- Brand Fit and Performance
  - best-fit brands by region, service mix, and tier
- Consumer Interest Overlay
  - consumer-facing attention mapped back to professional service tags
- Menu and Pricing Opportunities
  - peer service adoption gaps and future pricing layer
- Education and Support Gaps
  - partner education visibility and recommended next actions

### Provider Paid Products

- Provider Intelligence Dashboard
- Local Trend Pulse
- Brand Match and Menu Builder
- Partner Evaluation Reports
- Regional Benchmark Briefs

## Personalization Engine

### Onboarding To Initial Preference Graph

Use onboarding answers to seed a first-pass preference graph:

- role -> `pro_role`
- environment -> `pro_environment`
- focus areas -> `*_service`
- goals -> `market_trend` and `claim_regulation`
- market -> `region`

This should write positive weights into `user_tag_preferences`. It should rank the experience, not hard-hide the broader market.

### Event-Driven Preference Scoring

Each event should carry the signal tag context:

- `signal_viewed`
- `signal_clicked`
- `signal_saved`
- `signal_shared`
- `signal_hidden`

These events update tag scores with positive or negative deltas and decay over time so current behavior outranks stale behavior.

### What Personalization Drives

- `For You` feed ordering
- channel rail ordering
- premium upsell timing around repeated premium-topic engagement
- brief and recommendation targeting for brands and providers

## Pro Intelligence Channels

Channels should be product objects, not filter presets. Each channel can drive a live rail, a dashboard slice, a brief, and alerting.

- Medspa Core Services
- Medspa Body and Weight
- Injectables and Contouring Strategy
- Aesthetic Devices and Capital Equipment
- Haircut and Styling Innovation
- Color and Blonding
- Texture, Smoothing, and Treatments
- Salon Business and Pricing
- Pro Nails and Enhancements
- Lash and Brow Studio
- Waxing and Tanning
- Spa Rituals and Body Treatments
- Corporate and Retreat Wellness
- Pro and Medical-Grade Skincare
- Clean, Microbiome, and Sensitive Skin
- Color Cosmetics and Pro Makeup
- Global Beauty Market and Strategy
- Regulatory and Safety
- Pro Education and Careers

Regional variants should reuse the same canonical tags with different default weights for US, EU, APAC, LATAM, and hospitality-heavy markets.

## CMS And Merchandising Rules

- Prefer real source media first.
- Allow CMS hero-image and placement overrides for weak or missing source media.
- Use premade asset packs only as editor-managed fallbacks, not default stock replacements.
- Merchandise paid channel pages from the same live corpus as free surfaces, but with more depth, more history, and benchmark context.
- Keep dashboard modules and channel placements configurable through `content_placements`.

## Monetization Tiers

### Free

- core channels
- basic feed personalization
- short history window

### Provider Pro

- provider dashboard
- local trend pulse
- menu and partner recommendations
- deeper benchmark and brief access

### Brand Enterprise

- brand dashboard
- dossiers and category benchmarks
- persona and region insights
- early trend alerts

## Build Sequence

### Phase 1 - Foundation

- complete `WO-TAXONOMY-01`, `WO-TAXONOMY-02`, and `WO-TAXONOMY-03` deployment
- keep `INTEL-HUB-17` stable
- ensure live signal cards use source media or CMS overrides

### Phase 2 - Personalization And Channels

- add `user_tag_preferences`
- add `org_tag_preferences`
- add channel definition tables
- rank rails and feeds with tag overlap plus `score_importance`

### Phase 3 - Paid Dashboards

- ship Provider Intelligence first
- ship Brand Intelligence second
- add benchmark exports and recurring briefs after dashboard reads stabilize

### Phase 4 - Premium Analyst Layer

- add tag-grounded analyst Q&A and custom briefs
- keep outputs tied to actual tags, signals, and aggregate views

## Taxonomy Expansion Path

The current 500+ file should act as the cross-hub core. Future packs should be added for:

- brand taxonomy
- ingredient taxonomy
- retailer and channel taxonomy
- localized synonym packs
