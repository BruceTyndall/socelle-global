-- INTEL-PREMIUM-01: Register article-enricher in edge_function_controls
-- Authority: PREMIUM_CONTENT_SPEC.md §Part C

INSERT INTO public.edge_function_controls (function_name, display_name, description, is_enabled)
VALUES (
  'article-enricher',
  'Article Enricher',
  'Enriches market signals with full article text, OG metadata, quality scores, and content segmentation',
  true
)
ON CONFLICT (function_name)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = now();
