# AUTO TAGGING RULES

## Purpose

This document defines the baseline rule-driven RSS tagging layer for SOCELLE. It complements `INTEL_TAXONOMY_AND_SIGNALS.md` and maps article text to canonical `taxonomy_tags.tag_code` values.

## Inputs

- `public.taxonomy_tags(tag_code, display_label, level, category_group)`
- `public.rss_items(title, description, content, published_at, source_id, vertical_tags)`
- `public.rss_sources(name, category)`

## Output

- `public.rss_item_tags(rss_item_id, tag_code, confidence, source, rule_id, matched_keyword, matched_scope)`

`source` must be one of:

- `rule`
- `model`
- `manual`

## Rule Model

`public.rss_tag_rules` stores:

- `tag_code`
- `category_group`
- `match_type`
- `keywords`
- `context_required`
- `exclude_if_tag_codes`
- `confidence`

Matching strategy:

1. Normalize combined article text.
2. Evaluate rule keywords by `match_type`.
3. Prefer title matches over description and content.
4. Enforce optional context terms.
5. Suppress broad tags when a more specific exclusion tag also matches.
6. Upsert one canonical `(rss_item_id, tag_code)` row.

## Confidence Guidance

- Title hit: strongest confidence
- Description hit: baseline confidence
- Content-only hit: slightly reduced confidence
- Metadata-only hit: lowest confidence allowed for rule tagging

Recommended confidence band for rules: `0.40 - 0.98`

## First-Pass Coverage

The seeded rules currently emphasize the owner-priority categories:

- `pro_environment`
- `medspa_service`
- `body_device_service`
- `spa_wellness_service`
- `hair_service`
- `nail_lash_brow_service`
- `claim_regulation`
- `region`
- `market_trend`

## Quality Rules

- Never insert a tag code that does not exist in `public.taxonomy_tags`.
- Prefer precision for regulation and safety.
- Prefer broader recall for market trend classification.
- Keep manual tags authoritative over later rule-based updates.
- When a new concept appears that is not in `taxonomy_tags`, map to the closest current tag and log it for a future taxonomy revision.
