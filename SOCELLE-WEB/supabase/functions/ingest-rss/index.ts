/**
 * ingest-rss — Supabase Edge Function
 *
 * Fetches RSS 2.0 and Atom feeds registered in public.rss_sources,
 * parses items, deduplicates by (source_id, guid), and upserts into
 * public.rss_items.
 *
 * Each invocation processes up to `batch_size` sources ordered by
 * last_fetched_at ASC (least-recently-fetched first), ensuring all
 * active sources cycle evenly.
 *
 * Invocation:
 *   POST /functions/v1/ingest-rss
 *   Body (optional):
 *     { "batch_size": 10 }              — sources per run (default 10)
 *     { "source_ids": ["uuid", ...] }   — target specific sources
 *   Requires service-role key or admin JWT. Anonymous requests are rejected.
 *
 * Deployment:
 *   supabase functions deploy ingest-rss
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Scheduling:
 *   pg_cron using service-role Authorization headers
 *   select cron.schedule('ingest-rss', '0,30 * * * *',
 *     $$select net.http_post(url:='<SUPABASE_URL>/functions/v1/ingest-rss',
 *       headers:='{"Authorization":"Bearer <SERVICE_ROLE_KEY>"}')$$);
 *
 * W10-08 — SOCELLE GLOBAL RSS Ingestion Pipeline
 * Owner: Editorial/News Agent (Edge Fn) + Backend Agent (migration)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

async function verifyAdminOrServiceRole(
  req: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<{ authorized: boolean; reason?: string }> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { authorized: false, reason: 'Missing Authorization header' };
  }

  try {
    const serviceProbe = createClient(supabaseUrl, token, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: serviceError } = await serviceProbe.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!serviceError) {
      return { authorized: true };
    }
  } catch {
    // Fall through to user JWT validation.
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return { authorized: false, reason: 'Invalid or expired token' };
  }

  const { data: profile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { authorized: false, reason: 'Profile not found' };
  }

  if (!['admin', 'super_admin'].includes(profile.role)) {
    return { authorized: false, reason: 'Admin access required' };
  }

  return { authorized: true };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE     = 25;
const MAX_SOURCE_IDS     = 50;
const FETCH_TIMEOUT_MS   = 12_000;
const USER_AGENT         = 'Socelle-Intelligence-Bot/1.0 (https://socelle.com)';

// SOCELLE_DATA_PROVENANCE_POLICY.md §6:
// RSS news articles may only be stored as headline + excerpt + link.
// Full-text reproduction of copyrighted articles is prohibited.
const MAX_CONTENT_CHARS = 2000;  // ~3–4 sentences — excerpt only, not full article

// SOCELLE_DATA_PROVENANCE_POLICY.md §3:
// RSS = Tier 2 (base 0.70) × recency (fresh = 1.0) × corroboration (single = 0.85)
const RSS_CONFIDENCE_SCORE = 0.595;

// ── Types ─────────────────────────────────────────────────────────────────────

interface RssSource {
  id: string;
  name: string;
  feed_url: string;
  verticals: string[];
  error_count: number;
}

interface ParsedItem {
  guid: string;
  title: string;
  link: string | null;
  description: string | null;
  content: string | null;
  author: string | null;
  published_at: string | null;
  image_url: string | null;
}

interface SourceResult {
  source_id: string;
  name: string;
  fetched: number;
  new_items: number;
  error?: string;
}

// ── XML / Feed Parsing ────────────────────────────────────────────────────────

/**
 * Extract inner text of the first matching tag in a block of XML.
 * Handles CDATA sections and plain text content.
 */
function extractText(xml: string, tag: string): string | null {
  // CDATA variant
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdata);
  if (cdataMatch?.[1]) return cdataMatch[1].trim();

  // Plain text variant
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const plainMatch = xml.match(plain);
  if (plainMatch?.[1]) return plainMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

  return null;
}

/** Extract an attribute value from the first matching self-closing or opening tag. */
function extractAttr(xml: string, tag: string, attr: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  return xml.match(pattern)?.[1] ?? null;
}

/**
 * Parse all <item> (RSS 2.0) and <entry> (Atom) elements from a feed string.
 * Returns a flat array of ParsedItem objects.
 */
function parseFeedItems(feedXml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;

  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(feedXml)) !== null) {
    const block = match[1];

    // GUID — prefer <guid> (RSS) > <id> (Atom) > <link> > random UUID
    const guid =
      extractText(block, 'guid') ??
      extractText(block, 'id') ??
      extractAttr(block, 'link', 'href') ??
      extractText(block, 'link') ??
      crypto.randomUUID();

    const title = extractText(block, 'title') ?? '(no title)';

    // Link — RSS <link> is text content; Atom <link href="...">
    const link =
      extractAttr(block, 'link', 'href') ??
      extractText(block, 'link');

    // Description — prefer full content over summary
    const description =
      extractText(block, 'description') ??
      extractText(block, 'summary') ??
      extractText(block, 'content:encoded');

    const content =
      extractText(block, 'content:encoded') ??
      extractText(block, 'content');

    const author =
      extractText(block, 'author') ??
      extractText(block, 'dc:creator');

    const rawDate =
      extractText(block, 'pubDate') ??
      extractText(block, 'published') ??
      extractText(block, 'updated') ??
      extractText(block, 'dc:date');

    let published_at: string | null = null;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) published_at = parsed.toISOString();
    }

    // Image — media:thumbnail > media:content > enclosure (images only)
    const image_url =
      extractAttr(block, 'media:thumbnail', 'url') ??
      extractAttr(block, 'media:content', 'url') ??
      (extractAttr(block, 'enclosure', 'type')?.startsWith('image/')
        ? extractAttr(block, 'enclosure', 'url')
        : null);

    // Skip items with no identifying content
    if (title !== '(no title)' || link) {
      items.push({
        guid: guid.substring(0, 500),
        title: title.substring(0, 500),
        link: link?.substring(0, 2000) ?? null,
        description: description?.substring(0, 5000) ?? null,
        content: content?.substring(0, 20000) ?? null,
        author: author?.substring(0, 200) ?? null,
        published_at,
        image_url: image_url?.substring(0, 2000) ?? null,
      });
    }
  }

  return items;
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ingest-rss', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    // Parse request body
    const body: { batch_size?: number; source_ids?: string[] } =
      req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};
    const auth = await verifyAdminOrServiceRole(req, supabaseUrl, serviceRoleKey);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: auth.reason ?? 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      { auth: { persistSession: false } },
    );

    const requestedBatchSize = typeof body.batch_size === 'number'
      ? Math.trunc(body.batch_size)
      : DEFAULT_BATCH_SIZE;
    const batchSize = Math.min(Math.max(requestedBatchSize, 1), MAX_BATCH_SIZE);
    const specificIds = Array.isArray(body.source_ids)
      ? body.source_ids.slice(0, MAX_SOURCE_IDS)
      : undefined;

      // Fetch sources to process
      let query = supabase
        .from('rss_sources')
        .select('id, name, feed_url, verticals, error_count')
        .eq('status', 'active')
        .order('last_fetched_at', { ascending: true, nullsFirst: true })
        .limit(batchSize);

      if (specificIds?.length) {
        query = query.in('id', specificIds);
      }

      const { data: sources, error: sourcesError } = await query;
      if (sourcesError) throw new Error(`rss_sources fetch failed: ${sourcesError.message}`);
      if (!sources?.length) {
        return new Response(
          JSON.stringify({ ok: true, message: 'No active sources to process' }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        );
      }

      const results: SourceResult[] = [];

      for (const source of sources as RssSource[]) {
        const result: SourceResult = {
          source_id: source.id,
          name: source.name,
          fetched: 0,
          new_items: 0,
        };

        try {
          // Fetch feed
          const response = await fetch(source.feed_url, {
            headers: { 'User-Agent': USER_AGENT },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status} from ${source.feed_url}`);

          const xml = await response.text();
          const items = parseFeedItems(xml);
          result.fetched = items.length;

          if (items.length > 0) {
              const rows = items.map(item => ({
              source_id: source.id,
              guid: item.guid,
              title: item.title,
              link: item.link,
              description: item.description,
              // Truncate to MAX_CONTENT_CHARS per SOCELLE_DATA_PROVENANCE_POLICY.md §6
              // (excerpt only — full-text reproduction of copyrighted articles is prohibited)
              content: item.content ? item.content.substring(0, MAX_CONTENT_CHARS) : null,
              author: item.author,
              published_at: item.published_at,
              image_url: item.image_url,
              vertical_tags: source.verticals,
              is_new: true,
              // Provenance per SOCELLE_DATA_PROVENANCE_POLICY.md §2–3
              confidence_score: RSS_CONFIDENCE_SCORE,
              attribution_text: item.link
                ? `${source.name} — ${item.link}`
                : `${source.name} — ${source.feed_url}`,
            }));

            // Upsert — UNIQUE(source_id, guid) ensures deduplication
            const { error: upsertError } = await supabase
              .from('rss_items')
              .upsert(rows, { onConflict: 'source_id,guid', ignoreDuplicates: true });

            if (upsertError) throw new Error(`rss_items upsert failed: ${upsertError.message}`);

            // Count net-new items (those that weren't duplicates)
            // Proxy: query for items from this source created in last 30s
            const since = new Date(Date.now() - 30_000).toISOString();
            const { count } = await supabase
              .from('rss_items')
              .select('id', { count: 'exact', head: true })
              .eq('source_id', source.id)
              .gte('created_at', since);

            result.new_items = count ?? 0;
          }

          // Update source: clear error count, record fetch timestamp and item count
          await supabase
            .from('rss_sources')
            .update({
              last_fetched_at: new Date().toISOString(),
              last_item_count: result.fetched,
              error_count: 0,
            })
            .eq('id', source.id);

        } catch (err) {
          result.error = err instanceof Error ? err.message : String(err);

          // Increment error count (best-effort, non-blocking)
          await supabase
            .from('rss_sources')
            .update({ error_count: (source.error_count ?? 0) + 1 })
            .eq('id', source.id)
            .then(() => null, () => null);
        }

        results.push(result);
      }

      const totalFetched  = results.reduce((s, r) => s + r.fetched, 0);
      const totalNew      = results.reduce((s, r) => s + r.new_items, 0);
      const errorCount    = results.filter(r => r.error).length;

      return new Response(
        JSON.stringify({
          ok: true,
          sources_processed: sources.length,
          total_fetched: totalFetched,
          total_new_items: totalNew,
          errors: errorCount,
          results,
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ingest-rss] Fatal error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
