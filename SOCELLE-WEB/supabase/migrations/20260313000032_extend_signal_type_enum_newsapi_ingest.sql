-- NEWSAPI-INGEST-01: Extend signal_type_enum to support feed-sourced signal types
-- Authority: build_tracker.md NEWSAPI-INGEST-01

ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'industry_news';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'brand_update';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'press_release';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'social_trend';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'job_market';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'event_signal';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'research_insight';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'ingredient_trend';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'market_data';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'regional_market';
ALTER TYPE signal_type_enum ADD VALUE IF NOT EXISTS 'supply_chain';
