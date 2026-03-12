# TAG PERFORMANCE GUIDE

## Purpose

This guide defines how SOCELLE measures tag performance so the taxonomy behaves like a living product surface, not static metadata.

Use this guide with:

- `public.taxonomy_tags`
- `public.rss_item_tags`
- `public.market_signals`
- `public.platform_events`

## KPI Model

SOCELLE tracks tag performance across two layers:

- Reach
  - `signal_count`
  - `source_diversity`
  - `avg_tag_confidence`
  - `avg_score_importance`
- Engagement
  - `click_count`
  - `detail_view_count`
  - `save_count`
  - `unique_actor_count`
  - `engagement_per_signal`

Current implementation focuses on the measurable primitives we already capture reliably. True per-tag impression CTR, dwell time, and downstream conversion attribution can be layered on top of the same model later.

## Source Views

### `public.v_signal_tag_assignments`

One row per `market_signals.id` x `tag_code`.

Use this for:

- tag reach
- source diversity
- signal-to-tag explainability

### `public.v_tag_signal_metrics_30d`

30-day reach metrics per `tag_code`.

Fields:

- `signal_count`
- `source_diversity`
- `avg_tag_confidence`
- `avg_score_importance`
- `last_published_at`

### `public.v_tag_event_metrics_30d`

30-day engagement metrics per `tag_code`, derived from `platform_events.properties.tag_codes`.

Fields:

- `click_count`
- `detail_view_count`
- `save_count`
- `unique_actor_count`
- `unique_signals_engaged`
- `last_event_at`

### `public.v_tag_performance_30d`

Unified 30-day KPI view.

Use this as the default source for:

- channel ranking
- personalization weights
- dashboard tiles
- premium merchandising decisions

### `public.v_tag_orphans`

Active taxonomy tags with zero assignments in `rss_item_tags`.

Use this monthly to identify:

- dead tags
- missing rules
- taxonomy drift

### `public.v_tag_cooccurrence_30d`

Bidirectional 30-day tag co-occurrence matrix.

Use this to:

- identify natural channel clusters
- design “related channels”
- detect collisions and merge candidates

## Event Contract

Signal interaction events must persist canonical tag payloads in `platform_events.properties`.

Example `signal_clicked` payload:

```json
{
  "signal_id": "uuid",
  "signal_type": "treatment_trend",
  "primary_environment": "medspa",
  "primary_vertical": "medspa_service",
  "primary_service_tag": "rf_microneedling",
  "tag_codes": ["medspa", "medspa_service", "rf_microneedling", "us_beauty_market"],
  "tag_count": 4,
  "tier_min": "paid",
  "surface": "public_feed_featured",
  "target": "detail"
}
```

## Query Patterns

Top-performing tags in the last 30 days:

```sql
select *
from public.v_tag_performance_30d
where signal_count > 0
order by engagement_per_signal desc, click_count desc, signal_count desc
limit 50;
```

Strongest tags by reach:

```sql
select *
from public.v_tag_performance_30d
order by signal_count desc, source_diversity desc
limit 50;
```

Bottom tags to review:

```sql
select *
from public.v_tag_performance_30d
where signal_count <= 2
  and click_count = 0
  and detail_view_count = 0
order by category_group, tag_code;
```

Orphan tags:

```sql
select *
from public.v_tag_orphans
order by category_group, display_label;
```

Top secondary tags for a channel seed:

```sql
select related_tag_code, cooccurrence_count
from public.v_tag_cooccurrence_30d
where tag_code = 'rf_microneedling'
order by related_rank
limit 10;
```

## Product Use

Use tag performance for:

- channel subscriptions
- premium vs free channel packaging
- locale-weighted defaults
- recommendation ranking
- taxonomy cleanup

This is the foundation for “Pro Intelligence Channels” such as medspa growth, cut-and-color innovation, regulation and safety, and region-specific strategy feeds.
