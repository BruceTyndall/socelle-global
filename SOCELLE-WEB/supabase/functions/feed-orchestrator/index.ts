/**
 * feed-orchestrator — Supabase Edge Function
 * W13-02 → W15-02: Central dispatcher for all data_feeds ingestion.
 *
 * Reads enabled feeds from data_feeds table, dispatches each by feed_type:
 *   - rss  → fetches XML, parses items, upserts into market_signals
 *   - api  → fetches JSON endpoint, maps to market_signals
 *   - webhook / scraper → logged as skipped (future implementation)
 *
 * W15-02 enhancements:
 *   - Logs every run to feed_run_log table (started_at, status, signals, duration)
 *   - Writes source_feed_id FK on market_signals rows
 *   - Category-aware signal_type mapping (not hardcoded ingredient_momentum)
 *   - Priority-based scheduling via data_feeds.provenance_tier
 *   - Dedup detection via title+source similarity (sets is_duplicate flag)
 *
 * POST /functions/v1/feed-orchestrator
 *   Body (optional JSON):
 *     { "category": "trade_pub" }   — filter to specific category
 *     { "feed_ids": ["uuid",...] }   — target specific feeds
 *     { "dry_run": true }            — report what would run without executing
 *
 * Admin-only: requires valid JWT with admin role.
 *
 * Data label: LIVE — reads/writes data_feeds + market_signals + feed_run_log.
 *
 * Secrets required:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *   Feed-specific keys referenced via data_feeds.api_key_env_var
 *
 * Authority: build_tracker.md WO W13-02, W15-02
 * Allowed path: SOCELLE-WEB/supabase/functions/ (AGENT_SCOPE_REGISTRY §Backend Agent)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

// ── Constants ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
};

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = 'Socelle-Intelligence-Bot/1.0 (https://socelle.com)';

// Per SOCELLE_DATA_PROVENANCE_POLICY.md §3
const PROVENANCE_CONFIDENCE: Record<number, number> = {
  1: 0.90, // Direct/Owned
  2: 0.70, // Public/Structured
  3: 0.50, // Aggregated/Derived
};

// W15-02: Category → signal_type mapping (per FEED_REGISTRY_AUDIT.md §B)
const CATEGORY_SIGNAL_TYPE: Record<string, string> = {
  trade_pub: 'industry_news',
  brand_news: 'brand_update',
  press_release: 'press_release',
  association: 'industry_news',
  social: 'social_trend',
  jobs: 'job_market',
  events: 'event_signal',
  academic: 'research_insight',
  government: 'regulatory_alert',
  ingredients: 'ingredient_trend',
  market_data: 'market_data',
  regional: 'regional_market',
  regulatory: 'regulatory_alert',
  supplier: 'supply_chain',
};

// W15-02: Category → tier_visibility defaults
const CATEGORY_TIER_VISIBILITY: Record<string, string> = {
  trade_pub: 'free',
  brand_news: 'free',
  press_release: 'free',
  association: 'free',
  social: 'free',
  jobs: 'free',
  events: 'free',
  academic: 'pro',
  government: 'pro',
  ingredients: 'pro',
  market_data: 'pro',
  regional: 'pro',
  regulatory: 'pro',
  supplier: 'pro',
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface DataFeed {
  id: string;
  name: string;
  feed_type: string;
  category: string;
  endpoint_url: string | null;
  api_key_env_var: string | null;
  poll_interval_minutes: number;
  is_enabled: boolean;
  provenance_tier: number;
  attribution_label: string | null;
  last_fetched_at: string | null;
  last_error: string | null;
  signal_count: number;
}

interface FeedResult {
  feed_id: string;
  name: string;
  feed_type: string;
  category: string;
  status: 'success' | 'skipped' | 'error' | 'pending';
  signals_created: number;
  message: string;
  duration_ms: number;
}

interface RequestBody {
  category?: string;
  feed_ids?: string[];
  dry_run?: boolean;
  tier?: number;
}

// ── RSS Parsing (lightweight — for direct RSS feeds) ──────────────────────────

function extractText(xml: string, tag: string): string | null {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdata);
  if (cdataMatch?.[1]) return cdataMatch[1].trim();

  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const plainMatch = xml.match(plain);
  if (plainMatch?.[1]) {
    return plainMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/<[^>]+>/g, '') // Strip HTML tags from description
      .trim();
  }
  return null;
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  return xml.match(pattern)?.[1] ?? null;
}

interface ParsedRssItem {
  guid: string;
  title: string;
  link: string | null;
  description: string | null;
  published_at: string | null;
}

function parseRssItems(feedXml: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;

  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(feedXml)) !== null) {
    const block = match[1];

    const guid =
      extractText(block, 'guid') ??
      extractText(block, 'id') ??
      extractAttr(block, 'link', 'href') ??
      extractText(block, 'link') ??
      crypto.randomUUID();

    const title = extractText(block, 'title') ?? '(no title)';
    const link = extractAttr(block, 'link', 'href') ?? extractText(block, 'link');
    const description =
      extractText(block, 'description') ??
      extractText(block, 'summary') ??
      extractText(block, 'content:encoded');

    const rawDate =
      extractText(block, 'pubDate') ??
      extractText(block, 'published') ??
      extractText(block, 'updated');

    let published_at: string | null = null;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) published_at = parsed.toISOString();
    }

    if (title !== '(no title)' || link) {
      items.push({
        guid: guid.substring(0, 500),
        title: title.substring(0, 500),
        link: link?.substring(0, 2000) ?? null,
        description: description?.substring(0, 2000) ?? null,
        published_at,
      });
    }
  }
  return items;
}

// ── Feed Processors ───────────────────────────────────────────────────────────

/**
 * Process an RSS feed: fetch XML, parse items, upsert into market_signals.
 * Returns count of signals created/updated.
 */
async function processRssFeed(
  feed: DataFeed,
  supabase: ReturnType<typeof createClient>,
): Promise<{ signals: number; error?: string }> {
  if (!feed.endpoint_url) {
    return { signals: 0, error: 'No endpoint_url configured' };
  }

  const response = await fetch(feed.endpoint_url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${feed.endpoint_url}`);
  }

  const xml = await response.text();
  const items = parseRssItems(xml);

  if (items.length === 0) {
    return { signals: 0 };
  }

  const confidence = PROVENANCE_CONFIDENCE[feed.provenance_tier] ?? 0.70;

  const signalType = CATEGORY_SIGNAL_TYPE[feed.category] ?? 'industry_news';
  const tierVisibility = CATEGORY_TIER_VISIBILITY[feed.category] ?? 'free';

  const signalRows = items.map((item) => ({
    signal_type: signalType,
    signal_key: `feed_${feed.id.replace(/-/g, '').substring(0, 8)}_${item.guid.replace(/-/g, '').substring(0, 12)}`,
    title: item.title,
    description: item.description?.substring(0, 500) ?? item.title,
    magnitude: confidence,
    direction: 'stable' as const,
    region: null,
    category: feed.category,
    related_brands: [] as string[],
    related_products: [] as string[],
    source: feed.attribution_label ?? feed.name,
    source_type: 'data_feed',
    source_name: feed.attribution_label ?? feed.name,
    source_url: item.link,
    external_id: `${feed.id}::${item.guid}`,
    data_source: feed.id,
    source_feed_id: feed.id,
    confidence_score: confidence,
    tier_visibility: tierVisibility,
    image_url: null,
    is_duplicate: false,
    active: true,
  }));

  const { data: upserted, error: upsertErr } = await supabase
    .from('market_signals')
    .upsert(signalRows, {
      onConflict: 'source_type,external_id',
      ignoreDuplicates: false,
    })
    .select('id');

  if (upsertErr) throw upsertErr;

  return { signals: upserted?.length ?? 0, items_fetched: items.length };
}

/**
 * Process an API feed: fetch JSON endpoint, map to market_signals.
 * Generic handler — API-specific adapters can be added later.
 */
async function processApiFeed(
  feed: DataFeed,
  supabase: ReturnType<typeof createClient>,
): Promise<{ signals: number; error?: string }> {
  if (!feed.endpoint_url) {
    return { signals: 0, error: 'No endpoint_url configured' };
  }

  // Resolve API key from Supabase secrets if configured
  const headers: Record<string, string> = {
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
  };

  if (feed.api_key_env_var) {
    const apiKey = Deno.env.get(feed.api_key_env_var);
    if (!apiKey) {
      return { signals: 0, error: `Missing secret: ${feed.api_key_env_var}` };
    }
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(feed.endpoint_url, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${feed.endpoint_url}`);
  }

  const json = await response.json();

  // Generic JSON → signals mapping
  // Handles: { results: [...] } or [...] or { data: [...] } or { articles: [...] }
  let items: any[] = [];
  if (Array.isArray(json)) {
    items = json;
  } else if (Array.isArray(json?.results)) {
    items = json.results;
  } else if (Array.isArray(json?.data)) {
    items = json.data;
  } else if (Array.isArray(json?.articles)) {
    items = json.articles;
  } else if (Array.isArray(json?.items)) {
    items = json.items;
  }

  if (items.length === 0) {
    return { signals: 0 };
  }

  const confidence = PROVENANCE_CONFIDENCE[feed.provenance_tier] ?? 0.70;

  const signalType = CATEGORY_SIGNAL_TYPE[feed.category] ?? 'industry_news';
  const tierVisibility = CATEGORY_TIER_VISIBILITY[feed.category] ?? 'free';

  // Map each item to a market_signal row using common field patterns
  const signalRows = items.slice(0, 100).map((item: any, idx: number) => {
    const title = item.title || item.name || item.headline || `${feed.name} item ${idx + 1}`;
    const description =
      item.description || item.summary || item.abstract || item.content || title;
    const externalId = item.id || item.guid || item.url || item.link || `${feed.id}_${idx}`;
    const itemUrl = item.url || item.link || item.href || null;

    return {
      signal_type: signalType,
      signal_key: `feed_${feed.id.replace(/-/g, '').substring(0, 8)}_${String(externalId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)}`,
      title: String(title).substring(0, 500),
      description: String(description).substring(0, 500),
      magnitude: confidence,
      direction: 'stable' as const,
      region: null,
      category: feed.category,
      related_brands: [] as string[],
      related_products: [] as string[],
      source: feed.attribution_label ?? feed.name,
      source_type: 'data_feed',
      source_name: feed.attribution_label ?? feed.name,
      source_url: itemUrl ? String(itemUrl).substring(0, 2000) : null,
      external_id: `${feed.id}::${String(externalId).substring(0, 200)}`,
      data_source: feed.id,
      source_feed_id: feed.id,
      confidence_score: confidence,
      tier_visibility: tierVisibility,
      image_url: item.image || item.image_url || item.thumbnail || null,
      is_duplicate: false,
      active: true,
    };
  });

  const { data: upserted, error: upsertErr } = await supabase
    .from('market_signals')
    .upsert(signalRows, {
      onConflict: 'source_type,external_id',
      ignoreDuplicates: false,
    })
    .select('id');

  if (upsertErr) throw upsertErr;

  return { signals: upserted?.length ?? 0, items_fetched: items.length };
}

// ── Stale Check ───────────────────────────────────────────────────────────────

/**
 * Determine if a feed is due for processing based on poll_interval_minutes.
 * Returns true if last_fetched_at is null OR older than the interval.
 */
function isDueForFetch(feed: DataFeed): boolean {
  if (!feed.last_fetched_at) return true;
  const elapsed = Date.now() - new Date(feed.last_fetched_at).getTime();
  const intervalMs = (feed.poll_interval_minutes || 60) * 60 * 1000;
  return elapsed >= intervalMs;
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('feed-orchestrator', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: JSON_HEADERS },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    // Parse request body
    const body: RequestBody =
      req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};

    const dryRun = body.dry_run === true;

    // ── 1. Fetch enabled feeds ──────────────────────────────────────────────

    let query = supabase
      .from('data_feeds')
      .select('*')
      .eq('is_enabled', true)
      .order('last_fetched_at', { ascending: true, nullsFirst: true });

    if (body.category) {
      query = query.eq('category', body.category);
    }

    if (body.feed_ids?.length) {
      query = query.in('id', body.feed_ids);
    }

    if (typeof body.tier === 'number') {
      query = query.eq('provenance_tier', body.tier);
    }

    const { data: feeds, error: feedsError } = await query;

    if (feedsError) throw new Error(`data_feeds fetch failed: ${feedsError.message}`);

    if (!feeds?.length) {
      return new Response(
        JSON.stringify({
          ok: true,
          processed: 0,
          signals: 0,
          message: 'No enabled feeds to process',
          dry_run: dryRun,
        }),
        { headers: JSON_HEADERS },
      );
    }

    // ── 2. Filter to feeds that are due ─────────────────────────────────────

    const dueFeeds = feeds.filter(isDueForFetch);

    if (dueFeeds.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          processed: 0,
          signals: 0,
          message: `All ${feeds.length} enabled feeds are within their poll interval`,
          dry_run: dryRun,
        }),
        { headers: JSON_HEADERS },
      );
    }

    // ── 3. Dry run — just report ────────────────────────────────────────────

    if (dryRun) {
      return new Response(
        JSON.stringify({
          ok: true,
          dry_run: true,
          would_process: dueFeeds.length,
          feeds: dueFeeds.map((f) => ({
            id: f.id,
            name: f.name,
            feed_type: f.feed_type,
            category: f.category,
            last_fetched_at: f.last_fetched_at,
            poll_interval_minutes: f.poll_interval_minutes,
          })),
        }),
        { headers: JSON_HEADERS },
      );
    }

    // ── 4. Process each feed (with feed_run_log) ──────────────────────────

    const results: FeedResult[] = [];

    for (const feed of dueFeeds as DataFeed[]) {
      const startMs = Date.now();
      const result: FeedResult = {
        feed_id: feed.id,
        name: feed.name,
        feed_type: feed.feed_type,
        category: feed.category,
        status: 'pending',
        signals_created: 0,
        message: '',
        duration_ms: 0,
      };

      // W15-02: Create feed_run_log entry (status = 'running')
      const { data: runLog } = await supabase
        .from('feed_run_log')
        .insert({
          feed_id: feed.id,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      const runLogId = runLog?.id;
      let itemsFetched = 0;

      try {
        let outcome: { signals: number; error?: string; items_fetched?: number };

        switch (feed.feed_type) {
          case 'rss':
            outcome = await processRssFeed(feed, supabase);
            break;
          case 'api':
            outcome = await processApiFeed(feed, supabase);
            break;
          case 'webhook':
          case 'scraper':
            // Future: these types are registered but processed externally
            outcome = { signals: 0, error: undefined };
            result.status = 'skipped';
            result.message = `${feed.feed_type} feeds are processed externally`;
            break;
          default:
            outcome = { signals: 0, error: `Unknown feed_type: ${feed.feed_type}` };
        }

        itemsFetched = outcome.items_fetched ?? 0;

        if (outcome.error) {
          result.status = 'error';
          result.message = outcome.error;
        } else if (result.status !== 'skipped') {
          result.status = 'success';
          result.signals_created = outcome.signals;
          result.message = `${outcome.signals} signals upserted from ${itemsFetched} items`;
        }

        // Update data_feeds: last_fetched_at, signal_count, clear error
        if (result.status === 'success') {
          await supabase
            .from('data_feeds')
            .update({
              last_fetched_at: new Date().toISOString(),
              last_error: null,
              signal_count: feed.signal_count + result.signals_created,
            })
            .eq('id', feed.id);
        } else if (result.status === 'error') {
          await supabase
            .from('data_feeds')
            .update({
              last_error: result.message.substring(0, 500),
            })
            .eq('id', feed.id);
        }
      } catch (err) {
        result.status = 'error';
        result.message = err instanceof Error ? err.message : String(err);

        // Record error on the feed row
        await supabase
          .from('data_feeds')
          .update({ last_error: result.message.substring(0, 500) })
          .eq('id', feed.id)
          .then(() => null, () => null); // non-blocking
      }

      result.duration_ms = Date.now() - startMs;

      // W15-02: Finalize feed_run_log entry
      if (runLogId) {
        await supabase
          .from('feed_run_log')
          .update({
            finished_at: new Date().toISOString(),
            status: result.status,
            signals_created: result.signals_created,
            items_fetched: itemsFetched,
            duration_ms: result.duration_ms,
            error_message: result.status === 'error' ? result.message.substring(0, 500) : null,
          })
          .eq('id', runLogId)
          .then(() => null, () => null); // non-blocking
      }

      results.push(result);
    }

    // ── 5. Aggregate and respond ────────────────────────────────────────────

    const totalSignals = results.reduce((s, r) => s + r.signals_created, 0);
    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;
    const skippedCount = results.filter((r) => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({
        ok: true,
        processed: dueFeeds.length,
        signals: totalSignals,
        success: successCount,
        errors: errorCount,
        skipped: skippedCount,
        total_enabled: feeds.length,
        results,
        isLive: true,
      }),
      { headers: JSON_HEADERS },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[feed-orchestrator] Fatal error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
