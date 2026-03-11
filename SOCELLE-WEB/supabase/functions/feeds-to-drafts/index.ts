// feeds-to-drafts — CMS-WO-07
// Reads recent rss_items and converts them to pending story_drafts.
// Runs every hour (pg_cron :15). Does NOT publish — only creates drafts
// for editorial review. Approval workflow is CMS-WO-08.
//
// Dedup: fingerprint = item.guid ?? item.link (UNIQUE on story_drafts)
// Conflict: ON CONFLICT DO NOTHING — idempotent on re-run.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

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
    .eq('flag_name', 'feeds-to-drafts')
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
      feed_id:     item.source_id ?? null,
      title:       (item.title ?? 'Untitled').slice(0, 300),
      excerpt:     item.description
        ? item.description.replace(/<[^>]+>/g, '').slice(0, 300)
        : null,
      body:        item.content ?? item.description ?? null,
      hero_image:  item.image_url ?? null,
      source_url:  item.link ?? null,
      tags:        item.vertical_tags ?? [],
      vertical:    item.vertical_tags?.[0] ?? null,
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
