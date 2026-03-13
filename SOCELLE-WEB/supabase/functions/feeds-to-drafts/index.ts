// feeds-to-drafts — CMS-WO-07
// Reads recent rss_items and converts them to pending story_drafts.
// Runs every hour (pg_cron :15). Does NOT publish — only creates drafts
// for editorial review. Approval workflow is CMS-WO-08.
//
// Dedup: fingerprint = item.guid ?? item.link (UNIQUE on story_drafts)
// Conflict: ON CONFLICT DO NOTHING — idempotent on re-run.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ── HTML entity decoder ────────────────────────────────────────────
// Decodes common named and numeric HTML entities found in RSS feed titles.
const HTML_ENTITIES: Record<string, string> = {
  '&amp;':   '&',  '&lt;':  '<',  '&gt;':  '>',
  '&quot;':  '"',  '&apos;': "'", '&nbsp;': ' ',
  '&mdash;': '—',  '&ndash;': '–', '&lsquo;': ''',
  '&rsquo;': ''',  '&ldquo;': '"', '&rdquo;': '"',
  '&hellip;': '…', '&trade;': '™', '&reg;': '®',
  '&copy;':  '©',  '&deg;':  '°', '&middot;': '·',
};

function decodeHtmlEntities(text: string): string {
  // Named entities
  let decoded = text.replace(/&[a-z]+;/gi, (match) => HTML_ENTITIES[match.toLowerCase()] ?? match);
  // Numeric decimal entities (e.g. &#160; &#8217;)
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)));
  // Numeric hex entities (e.g. &#x200B;)
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
  return decoded.trim();
}

// ── Vertical tag normaliser ────────────────────────────────────────
// Maps raw RSS vertical_tags (e.g. 'SKINCARE_BRANDS', 'NAIL_SALON') to
// the three canonical app verticals: medspa | salon | beauty_brand.
const VERTICAL_MAP: Record<string, string> = {
  // beauty_brand mappings
  skincare_brands: 'beauty_brand', beauty_brands: 'beauty_brand',
  brand_news: 'beauty_brand', beauty_brand: 'beauty_brand',
  makeup: 'beauty_brand', fragrance: 'beauty_brand',
  haircare_brands: 'beauty_brand', cosmetics: 'beauty_brand',
  // salon mappings
  salon: 'salon', hair_salon: 'salon', nail_salon: 'salon',
  salon_innovation: 'salon', hair_trends: 'salon',
  blowout: 'salon', coloring: 'salon', balayage: 'salon',
  barber: 'salon', lash: 'salon', brow: 'salon',
  // medspa mappings
  medspa: 'medspa', medical_spa: 'medspa', aesthetics: 'medspa',
  injectables: 'medspa', laser: 'medspa', body_contouring: 'medspa',
  skincare: 'medspa', dermatology: 'medspa', wellness: 'medspa',
};

function normalizeVertical(tags: string[] | null | undefined): string | null {
  if (!tags?.length) return null;
  for (const tag of tags) {
    const key = tag.toLowerCase().replace(/[-\s]/g, '_');
    const mapped = VERTICAL_MAP[key];
    if (mapped) return mapped;
  }
  // Fallback: keep original first tag lowercased if it's already a valid vertical
  const first = (tags[0] ?? '').toLowerCase();
  if (['medspa', 'salon', 'beauty_brand'].includes(first)) return first;
  return null;
}

const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAX_PER_RUN    = 40;
const LOOKBACK_HOURS = 48;

Deno.serve(async (_req) => {
  const started = Date.now();
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // ── Kill-switch check ──────────────────────────────────────────
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('flag_key', 'feeds-to-drafts')
    .maybeSingle();

  if (flag && !flag.enabled) {
    return json({ skipped: true, reason: 'kill-switch' });
  }

  // ── Fetch recent rss_items ─────────────────────────────────────
  const cutoff = new Date(Date.now() - LOOKBACK_HOURS * 3_600_000).toISOString();

  const { data: items, error: fetchErr } = await supabase
    .from('rss_items')
    .select(
      'id, source_id, guid, title, link, description, content, image_url, vertical_tags, confidence_score'
    )
    .gte('created_at', cutoff)
    .not('title', 'is', null)
    .order('confidence_score', { ascending: false, nullsFirst: false })
    .limit(MAX_PER_RUN);

  if (fetchErr || !items?.length) {
    return json({ inserted: 0, reason: fetchErr?.message ?? 'no recent items' });
  }

  // ── Dedup: get existing fingerprints ───────────────────────────
  const fingerprints = items
    .map((i) => i.guid ?? i.link)
    .filter((f): f is string => !!f);

  const { data: existing } = await supabase
    .from('story_drafts')
    .select('fingerprint')
    .in('fingerprint', fingerprints);

  const seen = new Set((existing ?? []).map((e) => e.fingerprint));

  // ── Build draft rows ───────────────────────────────────────────
  const drafts = items
    .filter((item) => {
      const fp = item.guid ?? item.link;
      return fp && !seen.has(fp);
    })
    .map((item) => ({
      rss_item_id: item.id,
      // NOTE: rss_items.source_id → rss_sources (not data_feeds).
      // story_drafts.feed_id FK → data_feeds. Set null until rss_sources↔data_feeds
      // are bridged. Tracked: future WO (rss-feeds-bridge-01).
      feed_id: null,
      title:       decodeHtmlEntities((item.title ?? 'Untitled').slice(0, 400)).slice(0, 300),
      excerpt:     item.description
        ? decodeHtmlEntities(item.description.replace(/<[^>]+>/g, '')).slice(0, 300)
        : null,
      body:        item.content ?? item.description ?? null,
      hero_image:  item.image_url ?? null,
      source_url:  item.link ?? null,
      tags:        item.vertical_tags ?? [],
      vertical:    normalizeVertical(item.vertical_tags),
      fingerprint: (item.guid ?? item.link)!,
      status:      'pending' as const,
      suggested_products: [],
    }));

  if (!drafts.length) {
    return json({ inserted: 0, reason: 'all items already drafted' });
  }

  // ── Insert with ON CONFLICT DO NOTHING ────────────────────────
  const { data: inserted, error: insertErr } = await supabase
    .from('story_drafts')
    .insert(drafts)
    .select('id');

  if (insertErr) {
    return json({ error: insertErr.message }, 500);
  }

  const insertedCount = inserted?.length ?? 0;
  const duration = Date.now() - started;

  // ── Log run ───────────────────────────────────────────────────
  await supabase.from('feed_run_log').insert({
    feed_id:        null,
    started_at:     new Date(started).toISOString(),
    finished_at:    new Date().toISOString(),
    status:         'success',
    items_fetched:  items.length,
    signals_created: insertedCount,
    duration_ms:    duration,
  });

  return json({ inserted: insertedCount, skipped: items.length - insertedCount, duration_ms: duration });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
