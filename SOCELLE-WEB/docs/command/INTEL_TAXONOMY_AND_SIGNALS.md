# INTEL TAXONOMY AND SIGNALS

## Purpose

This document defines how SOCELLE turns raw RSS/API beauty and wellness content into structured, pro-first intelligence using the 500+ row taxonomy.

## Source Of Truth

- Canonical taxonomy source: `public.taxonomy_tags`
- Import file: `/Users/brucetyndall/Downloads/socelle_taxonomy_full_500plus.csv`
- Canonical identifier: `tag_code`

Never invent new tag codes in code, rules, or manual tagging flows. New concepts must map to the closest existing `tag_code` until the taxonomy is revised.

## Core Tables

- `rss_items`
  - Raw feed ingest rows.
  - Current implementation uses `title`, `description`, `content`, `link`, `published_at`, plus source registry metadata.
- `rss_item_tags`
  - Canonical item-level tag assignments.
  - Primary key: `(rss_item_id, tag_code)`.
  - Assignment metadata: `confidence`, `source`, `rule_id`, `matched_keyword`, `matched_scope`.
- `market_signals`
  - Normalized intelligence objects shown in hub experiences.
  - Taxonomy-driven promotion fields now include:
    - `rss_item_id`
    - `primary_environment`
    - `primary_vertical`
    - `service_tags`
    - `product_tags`
    - `claim_tags`
    - `region_tags`
    - `trend_tags`
    - `brand_names`
    - `sentiment`
    - `score_importance`

## Tagging Behavior

Normalize incoming RSS text before matching:

- Lowercase
- Strip punctuation
- Collapse whitespace
- Normalize common beauty-domain variants such as `med spa -> medspa` and `micro-needling -> microneedling`

Use the following text sources in order of importance:

1. `title`
2. `description`
3. `content`
4. source metadata hints such as feed category, source name, and `vertical_tags`

Category group intent:

- `pro_environment`, `pro_role`
  - Assign only when the article clearly indicates the operating environment or role.
- `*_service`
  - High-value intelligence layer. Aggressively identify services and treatments when there is clear text support.
- product groups
  - Tag only when the article is clearly about a product format, line, or product family.
- `claim_regulation`
  - Prefer precision over recall.
- `market_trend`, `region`
  - Prefer recall when the article clearly fits broad market coverage.

## Signal Promotion Expectations

Taxonomy tagging exists to make downstream signal creation more useful and more queryable. Promotion logic should increasingly support:

- canonical provenance via `rss_item_id`
- primary environment selection
- primary vertical derivation
- service/product/claim/region/trend tag arrays
- stronger medspa/salon/spa merchandising
- brand and service co-occurrence analysis
- regional and claims dashboards
- channel ranking and personalization weights driven by tag performance

Minimum quality bar:

- no clearly pro-focused article should ship without an environment or service tag when the text supports one
- high-value medspa/salon/spa/nail content should carry environment, at least one service, and region when identifiable

## Governance

- `taxonomy_tags` remains the only allowed tag master.
- `rss_item_tags` stores all auto/model/manual tagging history at the item level.
- `market_signals` stores the canonical signal-level tag rollup used by live product surfaces.
- rule updates must remain source-aligned to actual `tag_code` values already present in the imported taxonomy.
