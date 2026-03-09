/**
 * sitemap-generator — Supabase Edge Function
 * W12-09: Dynamic sitemap generation from live Supabase tables.
 *
 * Routes (via ?type= query param):
 *   GET /functions/v1/sitemap-generator              → sitemap index XML
 *   GET /functions/v1/sitemap-generator?type=static    → static public route entries
 *   GET /functions/v1/sitemap-generator?type=brands    → /brands/:slug (status='active')
 *   GET /functions/v1/sitemap-generator?type=protocols → /protocols/:slug
 *   GET /functions/v1/sitemap-generator?type=jobs      → /jobs/:slug (status='active')
 *
 * Data label: LIVE — dynamic entries pulled from Supabase with real updated_at.
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected by Supabase)
 * Optional: APP_URL (defaults to https://socelle.com)
 *
 * Allowed path: SOCELLE-WEB/supabase/functions/ (AGENT_SCOPE_REGISTRY §Backend Agent)
 * Authority: build_tracker.md WO W12-09
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const XML_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toDate(val: string | null | undefined): string {
  if (!val) return new Date().toISOString().split('T')[0];
  try {
    return new Date(val).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function wrapUrlset(entries: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');
}

function buildSitemapIndex(supabaseUrl: string): string {
  const base = supabaseUrl.replace(/\/rest\/v1$/, '');
  const today = new Date().toISOString().split('T')[0];
  const types = ['static', 'brands', 'protocols', 'jobs', 'stories'];
  const sitemaps = types.map(
    (t) =>
      `  <sitemap>\n    <loc>${escapeXml(`${base}/functions/v1/sitemap-generator?type=${t}`)}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps,
    '</sitemapindex>',
  ].join('\n');
}

// Static public routes — canonical per SITE_MAP.md
const STATIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/',               changefreq: 'daily',   priority: '1.0' },
  { path: '/intelligence',   changefreq: 'daily',   priority: '0.9' },
  { path: '/brands',         changefreq: 'daily',   priority: '0.9' },
  { path: '/protocols',      changefreq: 'weekly',  priority: '0.8' },
  { path: '/education',      changefreq: 'weekly',  priority: '0.8' },
  { path: '/stories',         changefreq: 'daily',   priority: '0.85' },
  { path: '/events',         changefreq: 'daily',   priority: '0.8' },
  { path: '/jobs',           changefreq: 'daily',   priority: '0.8' },
  { path: '/for-buyers',     changefreq: 'monthly', priority: '0.7' },
  { path: '/for-brands',     changefreq: 'monthly', priority: '0.7' },
  { path: '/for-medspas',    changefreq: 'monthly', priority: '0.7' },
  { path: '/professionals',  changefreq: 'monthly', priority: '0.7' },
  { path: '/pricing',        changefreq: 'weekly',  priority: '0.7' },
  { path: '/request-access', changefreq: 'monthly', priority: '0.6' },
  { path: '/how-it-works',   changefreq: 'monthly', priority: '0.6' },
  { path: '/faq',            changefreq: 'monthly', priority: '0.6' },
  { path: '/about',          changefreq: 'monthly', priority: '0.5' },
  { path: '/contact',        changefreq: 'monthly', priority: '0.5' },
  { path: '/blog',           changefreq: 'daily',   priority: '0.8' },
  { path: '/help',           changefreq: 'monthly', priority: '0.5' },
  { path: '/ingredients',    changefreq: 'weekly',  priority: '0.7' },
  { path: '/plans',          changefreq: 'weekly',  priority: '0.7' },
  { path: '/for-salons',     changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy',        changefreq: 'yearly',  priority: '0.3' },
  { path: '/terms',          changefreq: 'yearly',  priority: '0.3' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const appUrl      = (Deno.env.get('APP_URL') || 'https://socelle.com').replace(/\/$/, '');

  if (!supabaseUrl || !serviceKey) {
    return new Response('Server configuration error', { status: 500 });
  }

  const type = new URL(req.url).searchParams.get('type');

  try {
    // No type param → sitemap index
    if (!type) {
      return new Response(buildSitemapIndex(supabaseUrl), { headers: XML_HEADERS });
    }

    // Static routes — no DB call needed
    if (type === 'static') {
      const today = new Date().toISOString().split('T')[0];
      const entries = STATIC_ROUTES.map((r) =>
        urlEntry(`${appUrl}${r.path}`, today, r.changefreq, r.priority)
      );
      return new Response(wrapUrlset(entries), { headers: XML_HEADERS });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Brands — LIVE from `brands` table
    if (type === 'brands') {
      const { data, error } = await supabase
        .from('brands')
        .select('slug, updated_at')
        .eq('status', 'active')
        .not('slug', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const entries = (data ?? []).map((row: { slug: string; updated_at: string }) =>
        urlEntry(`${appUrl}/brands/${row.slug}`, toDate(row.updated_at), 'weekly', '0.85')
      );
      return new Response(wrapUrlset(entries), { headers: XML_HEADERS });
    }

    // Protocols — LIVE from `canonical_protocols` table
    if (type === 'protocols') {
      const { data, error } = await supabase
        .from('canonical_protocols')
        .select('slug, updated_at')
        .not('slug', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const entries = (data ?? []).map((row: { slug: string; updated_at: string }) =>
        urlEntry(`${appUrl}/protocols/${row.slug}`, toDate(row.updated_at), 'weekly', '0.80')
      );
      return new Response(wrapUrlset(entries), { headers: XML_HEADERS });
    }

    // Jobs — LIVE from `job_postings` table (status='active', updated_at column)
    if (type === 'jobs') {
      const { data, error } = await supabase
        .from('job_postings')
        .select('slug, updated_at')
        .eq('status', 'active')
        .not('slug', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const entries = (data ?? []).map((row: { slug: string; updated_at: string }) =>
        urlEntry(`${appUrl}/jobs/${row.slug}`, toDate(row.updated_at), 'daily', '0.85')
      );
      return new Response(wrapUrlset(entries), { headers: XML_HEADERS });
    }

    // Stories — LIVE from `stories` table (status='published', W15-06)
    if (type === 'stories') {
      const { data, error } = await supabase
        .from('stories')
        .select('slug, updated_at, published_at')
        .eq('status', 'published')
        .not('slug', 'is', null)
        .order('published_at', { ascending: false });

      if (error) throw error;

      const entries = (data ?? []).map((row: { slug: string; updated_at: string; published_at: string }) =>
        urlEntry(`${appUrl}/stories/${row.slug}`, toDate(row.updated_at ?? row.published_at), 'weekly', '0.80')
      );
      return new Response(wrapUrlset(entries), { headers: XML_HEADERS });
    }

    return new Response(
      `Unknown type "${type}". Use: brands, protocols, jobs, stories, static, or omit for index.`,
      { status: 400, headers: { 'Content-Type': 'text/plain' } }
    );
  } catch (err: any) {
    console.error('[sitemap-generator]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
