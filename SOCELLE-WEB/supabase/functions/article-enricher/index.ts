/**
 * article-enricher — Supabase Edge Function
 * INTEL-PREMIUM-01 Part C: Enriches market_signals with full article text,
 * OG metadata, quality scores, content segmentation, and topic tags.
 *
 * Runs as a scheduled job or on-demand POST. Processes signals that have
 * source_url but haven't been enriched yet (is_enriched = false).
 *
 * Does NOT duplicate feed-orchestrator logic — only enriches EXISTING signals.
 *
 * POST /functions/v1/article-enricher
 *   Body (optional JSON):
 *     { "limit": 20 }  — override batch size (max 50)
 *
 * Data label: LIVE — reads/writes market_signals.
 *
 * Secrets required:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *
 * Authority: PREMIUM_CONTENT_SPEC.md §Part C
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// ── Inline edgeControl (cannot use ../ imports in Supabase MCP deployment) ────

async function enforceEdgeFunctionEnabled(
  functionName: string,
  req: Request,
): Promise<Response | null> {
  if (req.method === 'OPTIONS') return null;
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) return null;
    const client = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client
      .from('edge_function_controls')
      .select('is_enabled')
      .eq('function_name', functionName)
      .maybeSingle();
    if (error || data === null) return null;
    if (data.is_enabled === false) {
      return new Response(
        JSON.stringify({ error: `Edge function '${functionName}' is disabled via kill-switch.` }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return null;
  } catch {
    return null;
  }
}

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
const MAX_BATCH_SIZE = 50;
const DEFAULT_BATCH_SIZE = 20;

// ── OG Metadata Extraction ───────────────────────────────────────────────────

function extractOGMeta(html: string): {
  og_title?: string;
  og_description?: string;
  og_image?: string;
} {
  const ogTitle =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];
  const ogDesc =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1];
  const ogImage =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
  return { og_title: ogTitle, og_description: ogDesc, og_image: ogImage };
}

// ── Article Content Extraction ───────────────────────────────────────────────

function extractArticleContent(html: string): {
  text: string;
  html_content: string;
  images: string[];
} {
  // Try to find <article> tag first
  let articleHtml = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  // Fallback: look for main content area
  if (!articleHtml) {
    articleHtml = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  }
  // Fallback: look for common content class names
  if (!articleHtml) {
    articleHtml = html.match(
      /<div[^>]+class=["'][^"']*(?:article|post|entry|content-body|story)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    )?.[1];
  }
  // Last resort: body
  if (!articleHtml) {
    articleHtml = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  }

  // Extract all image URLs from the article HTML
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(articleHtml)) !== null) {
    if (
      imgMatch[1] &&
      !imgMatch[1].includes('data:') &&
      !imgMatch[1].includes('pixel') &&
      !imgMatch[1].includes('tracker')
    ) {
      images.push(imgMatch[1]);
    }
  }

  // Strip HTML for plain text
  const text = articleHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    text: text.substring(0, 20000),
    html_content: articleHtml.substring(0, 50000),
    images: images.slice(0, 10),
  };
}

// ── Author Extraction ────────────────────────────────────────────────────────

function extractAuthor(html: string): string | null {
  return (
    html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+property=["']article:author["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<span[^>]+class=["'][^"']*author[^"']*["'][^>]*>([^<]+)/i)?.[1]?.trim() ??
    null
  );
}

// ── Content Segment Classification ───────────────────────────────────────────

function classifySegment(title: string, text: string, wordCount: number): string {
  const combined = `${title} ${text}`.toLowerCase();
  if (/\b(fda|recall|warning|alert|urgent|breaking)\b/.test(combined)) return 'breaking';
  if (/\b(regulation|compliance|sccs|eu\s+regulation|legislation)\b/.test(combined))
    return 'regulatory_update';
  if (/\b(study|clinical|pubmed|journal|arxiv|peer.?review|research)\b/.test(combined))
    return 'research';
  if (/\b(launch|new\s+product|debut|release|unveil|introduce)\b/.test(combined))
    return 'product_launch';
  if (/\b(trend|forecast|prediction|outlook|market\s+report)\b/.test(combined))
    return 'trend_report';
  if (wordCount > 1500) return 'deep_dive';
  if (/\b(tutorial|guide|how\s+to|step.?by.?step|tips)\b/.test(combined)) return 'how_to';
  if (/\b(event|conference|expo|summit|cosmoprof|in-cosmetics)\b/.test(combined))
    return 'event_coverage';
  if (/\b(market\s+size|revenue|growth|valuation|billion|million)\b/.test(combined))
    return 'market_data';
  if (/\b(reddit|social|trending|viral|tiktok)\b/.test(combined)) return 'social_pulse';
  if (/\b(editorial|opinion|perspective|commentary|column)\b/.test(combined)) return 'opinion';
  return 'deep_dive';
}

// ── Topic Tag Generation ─────────────────────────────────────────────────────

function generateTopicTags(title: string, text: string): string[] {
  const combined = `${title} ${text}`.toLowerCase();
  const tags: string[] = [];
  const tagMap: Record<string, RegExp> = {
    skincare:
      /\b(skincare|skin\s+care|moisturiz|serum|cleanser|retinol|vitamin\s+c|spf|sunscreen)\b/,
    injectables:
      /\b(botox|botulinum|filler|juvederm|restylane|dysport|injectable|hyaluronic\s+acid\s+filler)\b/,
    laser:
      /\b(laser|ipl|rf\s+microneedling|radiofrequency|light\s+therapy|led\s+therapy)\b/,
    'ai-beauty':
      /\b(artificial\s+intelligence|machine\s+learning|ai\s+skin|computer\s+vision|virtual\s+try.?on|ai\s+diagnos)\b/,
    'k-beauty': /\b(k.?beauty|korean\s+beauty|korean\s+skincare|seoul|k.?skincare)\b/,
    'j-beauty': /\b(j.?beauty|japanese\s+beauty|japanese\s+skincare|shiseido)\b/,
    'clean-beauty':
      /\b(clean\s+beauty|organic|natural\s+ingredients|sustainable|vegan\s+beauty|cruelty.?free)\b/,
    medspa:
      /\b(medspa|med\s+spa|aesthetic\s+clinic|aesthetics\s+practice|cosmetic\s+dermatology)\b/,
    nails: /\b(nail|manicure|gel\s+polish|nail\s+art|pedicure|nail\s+tech)\b/,
    fragrance: /\b(fragrance|perfume|cologne|scent|oud|niche\s+fragrance)\b/,
    hair: /\b(hair\s+care|hair\s+treatment|keratin|balayage|hair\s+color|scalp)\b/,
    makeup: /\b(makeup|cosmetics|foundation|lipstick|concealer|eyeshadow|mascara)\b/,
    ingredients:
      /\b(ingredient|formulation|niacinamide|peptide|ceramide|hyaluronic|salicylic|glycolic)\b/,
    regulatory:
      /\b(fda|regulation|compliance|eu\s+regulation|mfds|tga|health\s+canada)\b/,
    business:
      /\b(revenue|acquisition|ipo|funding|venture\s+capital|market\s+share|valuation)\b/,
    wellness:
      /\b(wellness|holistic|meditation|mindfulness|self.?care|mental\s+health)\b/,
  };
  for (const [tag, regex] of Object.entries(tagMap)) {
    if (regex.test(combined)) tags.push(tag);
  }
  return tags.slice(0, 8);
}

// ── Quality Score Calculator ─────────────────────────────────────────────────

function calculateQuality(
  wordCount: number,
  hasImages: boolean,
  hasAuthor: boolean,
  provenanceTier: number,
  createdAt: string,
): number {
  let score = 20; // Base score
  // Word count (max +25)
  if (wordCount > 2000) score += 25;
  else if (wordCount > 1000) score += 20;
  else if (wordCount > 500) score += 15;
  else if (wordCount > 200) score += 10;
  else score += 5;
  // Images
  if (hasImages) score += 15;
  // Author
  if (hasAuthor) score += 10;
  // Provenance
  if (provenanceTier === 1) score += 20;
  else if (provenanceTier === 2) score += 10;
  // Freshness
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  if (ageHours < 24) score += 15;
  else if (ageHours < 72) score += 10;
  else if (ageHours < 168) score += 5;
  return Math.min(100, score);
}

// ── Geo Source Detection ─────────────────────────────────────────────────────

function detectGeoSource(url: string, text: string): string | null {
  // TLD detection
  if (url.includes('.co.uk') || url.includes('.uk/')) return 'UK';
  if (url.includes('.fr/') || url.includes('.fr')) return 'FR';
  if (url.includes('.de/') || url.includes('.de')) return 'DE';
  if (url.includes('.co.kr') || url.includes('.kr/')) return 'KR';
  if (url.includes('.co.jp') || url.includes('.jp/')) return 'JP';
  if (url.includes('.com.au') || url.includes('.au/')) return 'AU';
  if (url.includes('.sg/')) return 'SG';
  if (url.includes('.in/')) return 'IN';
  if (url.includes('.eu/') || url.includes('europa.eu')) return 'EU';
  // Content-based
  const lower = text.substring(0, 5000).toLowerCase();
  if (/\bk.?beauty|korean\b/.test(lower)) return 'KR';
  if (/\bj.?beauty|japanese|japan\b/.test(lower)) return 'JP';
  if (/\beuropean\s+union|eu\s+regulation\b/.test(lower)) return 'EU';
  return 'US'; // Default
}

// ── Single Signal Enrichment ─────────────────────────────────────────────────

interface SignalRow {
  id: string;
  title: string;
  description: string | null;
  source_url: string;
  source_domain: string | null;
  provenance_tier: number;
  created_at: string;
}

interface EnrichmentResult {
  signal_id: string;
  status: 'enriched' | 'failed';
  word_count?: number;
  quality_score?: number;
  content_segment?: string;
  error?: string;
}

async function enrichSignal(
  signal: SignalRow,
  supabase: ReturnType<typeof createClient>,
): Promise<EnrichmentResult> {
  let html: string;

  try {
    const response = await fetch(signal.source_url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
    });

    if (!response.ok) {
      // Mark as enriched with low quality to avoid re-processing
      await supabase
        .from('market_signals')
        .update({
          is_enriched: true,
          enriched_at: new Date().toISOString(),
          quality_score: 10,
        })
        .eq('id', signal.id);

      return {
        signal_id: signal.id,
        status: 'failed',
        quality_score: 10,
        error: `HTTP ${response.status}`,
      };
    }

    html = await response.text();
  } catch (err) {
    // Timeout, network error, etc — mark as enriched with low quality
    await supabase
      .from('market_signals')
      .update({
        is_enriched: true,
        enriched_at: new Date().toISOString(),
        quality_score: 10,
      })
      .eq('id', signal.id);

    return {
      signal_id: signal.id,
      status: 'failed',
      quality_score: 10,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // Extract all metadata
  const ogMeta = extractOGMeta(html);
  const articleContent = extractArticleContent(html);
  const extractedAuthor = extractAuthor(html);
  const wordCount = articleContent.text.split(/\s+/).filter(Boolean).length;
  const segment = classifySegment(signal.title, articleContent.text, wordCount);
  const topicTags = generateTopicTags(signal.title, articleContent.text);
  const qualityScore = calculateQuality(
    wordCount,
    articleContent.images.length > 0,
    extractedAuthor !== null,
    signal.provenance_tier ?? 3,
    signal.created_at,
  );
  const geoSource = detectGeoSource(signal.source_url, articleContent.text);

  const { error } = await supabase
    .from('market_signals')
    .update({
      article_body: articleContent.text || null,
      article_html: articleContent.html_content || null,
      hero_image_url: ogMeta.og_image || articleContent.images[0] || null,
      image_urls: articleContent.images,
      og_title: ogMeta.og_title || null,
      og_description: ogMeta.og_description || null,
      og_image: ogMeta.og_image || null,
      author: extractedAuthor,
      content_segment: segment,
      topic_tags: topicTags,
      word_count: wordCount,
      reading_time_minutes: Math.max(1, Math.ceil(wordCount / 200)),
      quality_score: qualityScore,
      geo_source: geoSource,
      is_enriched: true,
      enriched_at: new Date().toISOString(),
    })
    .eq('id', signal.id);

  if (error) {
    console.error(`[article-enricher] Update failed for signal ${signal.id}:`, error.message);
    return {
      signal_id: signal.id,
      status: 'failed',
      error: error.message,
    };
  }

  return {
    signal_id: signal.id,
    status: 'enriched',
    word_count: wordCount,
    quality_score: qualityScore,
    content_segment: segment,
  };
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('article-enricher', req);
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
    // Parse optional body for batch size override
    let batchSize = DEFAULT_BATCH_SIZE;
    if (req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (typeof body.limit === 'number' && body.limit > 0) {
        batchSize = Math.min(body.limit, MAX_BATCH_SIZE);
      }
    }

    // Query unenriched signals
    const { data: signals, error: queryError } = await supabase
      .from('market_signals')
      .select('id, title, description, source_url, source_domain, provenance_tier, created_at')
      .eq('is_enriched', false)
      .not('source_url', 'is', null)
      .neq('source_url', '')
      .order('created_at', { ascending: false })
      .limit(batchSize);

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }

    if (!signals?.length) {
      return new Response(
        JSON.stringify({
          ok: true,
          enriched: 0,
          failed: 0,
          message: 'No unenriched signals to process',
        }),
        { headers: JSON_HEADERS },
      );
    }

    // Process each signal sequentially to avoid overwhelming target servers
    const results: EnrichmentResult[] = [];
    const startTime = Date.now();

    for (const signal of signals as SignalRow[]) {
      const result = await enrichSignal(signal, supabase);
      results.push(result);
    }

    const enrichedCount = results.filter((r) => r.status === 'enriched').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;
    const totalDuration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        ok: true,
        enriched: enrichedCount,
        failed: failedCount,
        total: signals.length,
        duration_ms: totalDuration,
        avg_quality: enrichedCount > 0
          ? Math.round(
              results
                .filter((r) => r.status === 'enriched')
                .reduce((sum, r) => sum + (r.quality_score ?? 0), 0) / enrichedCount,
            )
          : 0,
        results,
      }),
      { headers: JSON_HEADERS },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[article-enricher] Fatal error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
