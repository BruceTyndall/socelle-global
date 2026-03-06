/**
 * jobs-search — Supabase Edge Function
 * W12-16: Serving function for the Jobs board — filtered, paginated job search.
 *
 * GET /functions/v1/jobs-search
 *   ?vertical=<spa|medspa|salon|clinic>   filter by vertical (optional)
 *   &type=<full-time|part-time|contract|per-diem>  filter by employment_type (optional)
 *   &q=<search term>                      full-text search on title, company, location (optional)
 *   &featured=true                        return featured jobs only (optional)
 *   &page=<n>                             1-based page number (default: 1)
 *   &limit=<n>                            results per page (default: 20, max: 50)
 *
 * Response shape matches DbJobPosting from src/pages/public/Jobs.tsx.
 *
 * Data label: LIVE — sourced from public.job_postings (status='active').
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *
 * Allowed path: SOCELLE-WEB/supabase/functions/ (AGENT_SCOPE_REGISTRY §Backend Agent)
 * Authority: build_tracker.md WO W12-16
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=120', // jobs cache 2 min
};

// Valid filter values — mirrors job_postings schema constraints
const VALID_VERTICALS  = new Set(['spa', 'medspa', 'salon', 'clinic']);
const VALID_TYPES      = new Set(['full-time', 'part-time', 'contract', 'per-diem']);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const params   = new URL(req.url).searchParams;
  const vertical = params.get('vertical') ?? null;
  const jobType  = params.get('type') ?? null;
  const query    = params.get('q')?.trim() ?? null;
  const featured = params.get('featured') === 'true';
  const rawPage  = parseInt(params.get('page') ?? '1', 10);
  const rawLimit = parseInt(params.get('limit') ?? '20', 10);
  const page     = Math.max(rawPage, 1);
  const limit    = Math.min(Math.max(rawLimit, 1), 50);
  const offset   = (page - 1) * limit;

  // Validate enum params
  if (vertical && !VALID_VERTICALS.has(vertical)) {
    return new Response(
      JSON.stringify({ error: `Invalid vertical. Use: ${[...VALID_VERTICALS].join(', ')}` }),
      { status: 400, headers: JSON_HEADERS }
    );
  }
  if (jobType && !VALID_TYPES.has(jobType)) {
    return new Response(
      JSON.stringify({ error: `Invalid type. Use: ${[...VALID_TYPES].join(', ')}` }),
      { status: 400, headers: JSON_HEADERS }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // ── Build query ────────────────────────────────────────────────────────
    // Select all columns that DbJobPosting in Jobs.tsx expects
    let jobQuery = supabase
      .from('job_postings')
      .select(
        'slug, title, company, location, vertical, employment_type, salary_min, salary_max, salary_period, description, requirements, featured, created_at',
        { count: 'exact' }
      )
      .eq('status', 'active')
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (vertical) jobQuery = jobQuery.eq('vertical', vertical);
    if (jobType)  jobQuery = jobQuery.eq('employment_type', jobType);
    if (featured) jobQuery = jobQuery.eq('featured', true);

    // Full-text search: ilike against title, company, location
    // (tsvector index not yet defined on job_postings — safe ilike for now)
    if (query) {
      const escaped = query.replace(/[%_]/g, '\\$&');
      jobQuery = jobQuery.or(
        `title.ilike.%${escaped}%,company.ilike.%${escaped}%,location.ilike.%${escaped}%`
      );
    }

    // Featured jobs first, then newest
    jobQuery = jobQuery
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: jobs, count, error } = await jobQuery;
    if (error) throw error;

    return new Response(
      JSON.stringify({
        jobs: jobs ?? [],
        total:    count ?? 0,
        page,
        limit,
        pages:    Math.ceil((count ?? 0) / limit),
        isLive:   true,
        fetched_at: new Date().toISOString(),
      }),
      { headers: JSON_HEADERS }
    );
  } catch (err: any) {
    console.error('[jobs-search]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
