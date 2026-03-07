-- W14-01: Add zip_code and quiz_answers to access_requests
-- Pre-launch quiz captures metro intel + 8-question professional profile
-- ADD ONLY — never edit existing migrations

alter table public.access_requests
  add column if not exists zip_code    text,
  add column if not exists quiz_answers jsonb;

comment on column public.access_requests.zip_code is
  'US zip code from pre-launch quiz identity capture. Used for metro-level benchmarking.';

comment on column public.access_requests.quiz_answers is
  'JSONB blob of all 8 professional quiz responses keyed by question id. '
  'Keys: practice_type, team_size, monthly_spend, top_category, discovery_method, '
  'pain_point, brand_lines, intelligence_priority.';
