/**
 * rss-to-signals — Supabase Edge Function
 * W12-20: Promotes qualifying rss_items rows into market_signals.
 *
 * POST /functions/v1/rss-to-signals
 *   Body (optional JSON): { "limit": <n> }  — max items per run (default 100, max 500)
 *   Requires service-role key or admin JWT. Anonymous requests are rejected.
 *
 * Promotion threshold: rss_items.confidence_score >= 0.50
 *
 * signal_type heuristic (deterministic — owner approved 2026-03-06):
 *   brand_mentions.length > 0 AND ingredient_mentions.length === 0
 *     → 'brand_adoption'  (brand-only article, zero ingredient context)
 *   all other cases (ingredient, mixed, general news)
 *     → 'ingredient_momentum'  (default)
 *
 * Provenance fields (per SOCELLE_DATA_PROVENANCE_POLICY.md §2–3):
 *   source_type      = 'rss'
 *   external_id      = rss_items.guid           (dedup key)
 *   data_source      = rss_items.id             (linkable provenance)
 *   confidence_score = rss_items.confidence_score
 *   source           = rss_items.attribution_text || rss_sources.name
 *
 * INTEL-MEDSPA-01 enhancements:
 *   vertical   = derived from rss_sources.category via CATEGORY_VERTICAL map
 *   tier_min   = derived from rss_sources.category via CATEGORY_TIER_MIN map
 *   topic      = classifyTopic() — keyword NLP on title+description
 *   impact_score = computeImpactScore() — 0-100 composite
 *
 * MERCH-INTEL-02 v3 (OPEN-2):
 *   Atom feed support added to direct XML parsing path.
 *   detectFeedFormat() — inspects root element for <feed vs <rss/<channel
 *   parseAtomItems()   — extracts <entry> elements, maps to ParsedFeedItem
 *   parseRssItems()    — unchanged RSS 2.0 <item> parser (renamed for clarity)
 *   parseFeedItems()   — dispatcher: routes to Atom or RSS parser by format
 *   Atom field mapping:
 *     <title>          → title (same)
 *     <link href="..."/> → url (href attribute extraction)
 *     <summary> | <content> | <content:encoded> → description
 *     <updated> | <published> → published_at
 *     <id>             → guid/fingerprint source
 *
 * Data label: LIVE — rows derived from live rss_items table.
 * updated_at is a real DB column auto-updated on upsert (not simulated).
 *
 * Dedup: upsert on (source_type, external_id) via market_signals_source_dedup_idx.
 * Existing rows for the same guid are updated (title/description/confidence may change).
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected by Supabase)
 *
 * Allowed path: SOCELLE-WEB/supabase/functions/ (AGENT_SCOPE_REGISTRY §Backend Agent)
 * Authority: build_tracker.md WO W12-20, INTEL-MEDSPA-01, MERCH-INTEL-02
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ── Inline edgeControl (cannot use ../ imports in Supabase MCP deployment) ────

async function enforceEdgeFunctionEnabled(
  functionName: string,
  req: Request,
): Promise<Response | null> {
  if (req.method === 'OPTIONS') return null;
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
};

// Minimum confidence threshold per W12-20 scope
const CONFIDENCE_THRESHOLD = 0.50;

// Batch cap per invocation
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;
// Categories are dynamically mapped inside the process loop.
// This prevents naive starvation on complex RSS aggregates.

// ── INTEL-MEDSPA-01: Topic classifier ────────────────────────────────────────

/**
 * Keyword-based topic classifier. Safety/recall signals take highest priority.
 * Returns one of the topic values allowed by market_signals.topic CHECK constraint.
 */
// MERCH-INTEL-02: expanded topic classifier — medspa procedures + salon + beauty brand
function classifyTopic(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  // Safety/recall — highest priority
  if (/recall|adverse event|warning letter|safety alert|fda action|banned|prohibited|class i recall|class ii recall|market withdrawal/.test(text))
    return 'safety';
  // Regulation
  if (/\bfda\b|regulation|compliance|legislation|law|bill\b|act \b|guidance|ruling|cfr \b|cpsc|gmp|iso 22716|cosmetics act|modernization act/.test(text))
    return 'regulation';
  // Science / research
  if (/clinical trial|study|journal|research|pubmed|randomized|efficacy|peer.reviewed|meta.analysis|double.blind|in vitro|in vivo|histology/.test(text))
    return 'science';
  // Ingredient — expanded for medspa + cosmetics
  if (/ingredient|formulation|inci|peptide|retinol|hyaluronic|niacinamide|vitamin c|spf|preservative|compound|active ingredient|retinoid|azelaic|bakuchiol|ceramide|growth factor|stem cell extract|collagen stimulat/.test(text))
    return 'ingredient';
  // Treatment trends — medspa procedures, salon treatments, aesthetic services
  if (/botox|filler|laser|microneedling|rf \b|radiofrequency|prp|exosome|peel|dermaplaning|hydrafacial|ultherapy|coolsculpting|kybella|sculptra|neuromodulator|thread lift|pdo thread|morpheus|sylfirm|vivace|profhilo|polynucleotide|biostimulator|fat dissolv|body contouring|lip augment|jawline|brow lift|co2 laser|erbium|fractional|ipl|photofacial|hair removal|lash lift|lash extension|brow lamination|microblading|permanent makeup|facial treatment|enzyme treatment|oxygen facial|led therapy|cryotherapy|lymphatic drainage|lymphatic massage|deep tissue|hot stone|aromatherapy|sports massage|reflexology|acupuncture/.test(text))
    return 'treatment_trend';
  // Consumer trend / social — extended for wellness + beauty
  if (/trend|tiktok|viral|gen z|millennial|gen alpha|consumer|skincare routine|clean beauty|wellness|self.care|skin barrier|glass skin|slugging|skin cycling|holistic|mindfulness|biohacking|longevity|beauty tech|retail trend/.test(text))
    return 'consumer_trend';
  // Pricing / market economics
  if (/price|pricing|revenue|cost|profitability|margin|fee|rate increase|inflation|market size|forecast|cagr|market value|spend|expenditure|reimbursement/.test(text))
    return 'pricing';
  // Technology
  if (/\bai\b|artificial intelligence|software|platform|\bapp\b|digital|crm|emr|telemedicine|wearable|device|medtech|aesthetech|booking system|point.of.sale/.test(text))
    return 'technology';
  // Jobs / workforce
  if (/\bjob\b|hiring|workforce|esthetician|employment|staff|career|salary|wage|nurse practitioner|injector|aesthetic nurse|medical director/.test(text))
    return 'jobs';
  // Events
  if (/conference|expo|trade show|summit|webinar|event|congress|symposium|aesthetics show|beauty expo|spa conference/.test(text))
    return 'events';
  // Market data
  if (/market report|industry data|statistics|growth rate|cagr|market share|market analysis|industry report|beauty industry/.test(text))
    return 'market_data';
  // Brand news
  if (/launch|brand|\bpartnership\b|acquisition|merger|funding|investment|\bipo\b|series [a-c]|raised |rebranding|collaboration|celebrity brand/.test(text))
    return 'brand_news';
  return 'other';
}

function deriveVerticalFromTopic(topic: string, defaultVertical?: string | null): string {
  if (defaultVertical && defaultVertical !== 'multi') return defaultVertical;
  
  switch (topic) {
    case 'safety':
    case 'regulation':
    case 'science':
    case 'treatment_trend':
    case 'technology':
      return 'medspa';
    case 'skincare':
    case 'consumer_trend':
      return 'salon';
    case 'brand_news':
    case 'retail':
    case 'pricing':
    case 'market_data':
      return 'beauty_brand';
    default:
      return 'multi';
  }
}

function deriveTierMinFromCategory(sourceCategory: string): 'free' | 'paid' {
  switch (sourceCategory) {
    case 'academic':
    case 'market_data':
    case 'association':
      return 'paid';
    default:
      return 'free';
  }
}

// ── INTEL-MEDSPA-01: Impact score calculator ─────────────────────────────────

// Category → provenance_tier equivalent for rss_sources (no direct provenance_tier column)
const CATEGORY_AUTHORITY: Record<string, number> = {
  academic:      1,  // Highest — peer-reviewed
  regulatory:    1,  // Highest — government/regulatory
  government:    1,
  association:   2,  // Mid — professional bodies
  trade_pub:     2,  // Mid — industry press
  ingredients:   2,
  market_data:   2,
  brand_news:    3,  // Lower — brand-sourced
  press_release: 3,
  social:        3,
  jobs:          3,
  events:        3,
  supplier:      3,
};

/**
 * 0-100 composite impact score: source authority (0-40) + category bonus (0-20)
 * + topic urgency (0-20) + recency (0-20).
 */
function computeImpactScore(
  sourceCategory: string,
  publishedAt: string | null,
  topic: string,
): number {
  let score = 0;
  const provenanceTier = CATEGORY_AUTHORITY[sourceCategory] ?? 2;
  // Source authority (0-40 points)
  if (provenanceTier === 1) score += 40;
  else if (provenanceTier === 2) score += 25;
  else score += 10;
  // Category authority bonus (0-20 points)
  if (sourceCategory === 'academic') score += 20;
  else if (sourceCategory === 'regulatory' || sourceCategory === 'government') score += 18;
  else if (sourceCategory === 'association') score += 12;
  else if (sourceCategory === 'trade_pub') score += 10;
  else if (sourceCategory === 'brand_news') score += 6;
  // Topic urgency bonus (0-20 points)
  if (topic === 'safety') score += 20;
  else if (topic === 'regulation') score += 15;
  else if (topic === 'science') score += 12;
  else if (topic === 'treatment_trend') score += 10;
  else if (topic === 'pricing') score += 8;
  // Recency bonus (0-20 points)
  if (publishedAt) {
    const hoursOld = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
    if (hoursOld < 2) score += 20;
    else if (hoursOld < 6) score += 16;
    else if (hoursOld < 24) score += 10;
    else if (hoursOld < 72) score += 5;
  }
  return Math.min(100, Math.max(0, score));
}

// ── MERCH-INTEL-02 v3: Feed format detection + Atom parser ───────────────────

/**
 * Detects feed format by inspecting the raw XML string.
 * Atom feeds have a root <feed> element (often with xmlns="http://www.w3.org/2005/Atom").
 * RSS 2.0 feeds have a root <rss> or <channel> element.
 * Returns 'atom' | 'rss'.
 */
function detectFeedFormat(xml: string): 'atom' | 'rss' {
  // Check first 500 chars for the root element to avoid scanning entire feed
  const head = xml.substring(0, 500).toLowerCase();
  if (head.includes('<feed') && (head.includes('atom') || head.includes('<feed>'))) {
    return 'atom';
  }
  return 'rss';
}

/**
 * Extracts text content from within a specific XML tag (CDATA-aware).
 * Used for both RSS and Atom text nodes.
 */
function extractText(xml: string, tag: string): string | null {
  // CDATA-wrapped content
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdata);
  if (cdataMatch?.[1]) return cdataMatch[1].trim();

  // Plain text content
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const plainMatch = xml.match(plain);
  if (plainMatch?.[1]) {
    return plainMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
  return null;
}

/**
 * Extracts an attribute value from a self-closing or opening XML tag.
 * Critical for Atom <link href="..."/> where the URL is in an attribute, not text content.
 * Also handles rel="alternate" vs rel="self" disambiguation.
 */
function extractAttr(xml: string, tag: string, attr: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  return xml.match(pattern)?.[1] ?? null;
}

/**
 * Extracts the alternate link from an Atom <entry> block.
 * Atom feeds use <link href="URL"/> (self-closing) or <link rel="alternate" href="URL"/>.
 * RSS feeds use <link>URL</link> (text content).
 *
 * Priority order:
 * 1. <link rel="alternate" href="..."/> — canonical article link
 * 2. <link href="..."/> without rel or with rel="self" — still usable
 * 3. <link>URL</link> — RSS fallback
 */
function extractAtomLink(block: string): string | null {
  // Try rel="alternate" first (most reliable for article URL)
  const altMatch = block.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/i)
    ?? block.match(/<link[^>]+href="([^"]+)"[^>]+rel="alternate"/i);
  if (altMatch?.[1]) return altMatch[1];

  // Fall back to any <link href="..."/> that isn't rel="self"
  const hrefMatch = block.match(/<link[^>]+href="([^"]+)"/i);
  if (hrefMatch?.[1] && !block.match(/<link[^>]+rel="self"[^>]+href="[^"]*"/i)) {
    return hrefMatch[1];
  }

  // Last resort: rel="self" href (at least gives us a URL)
  const selfMatch = block.match(/<link[^>]+rel="self"[^>]+href="([^"]+)"/i)
    ?? block.match(/<link[^>]+href="([^"]+)"[^>]+rel="self"/i);
  if (selfMatch?.[1]) return selfMatch[1];

  // RSS 2.0 fallback: <link>URL</link>
  return extractText(block, 'link');
}

interface ParsedFeedItem {
  guid: string;
  title: string;
  link: string | null;
  description: string | null;
  published_at: string | null;
}

/**
 * Parse Atom feed <entry> elements into a normalized structure.
 * Atom fields differ from RSS 2.0:
 *   RSS <item>    → Atom <entry>
 *   <link>URL</link>  → <link href="URL"/> (self-closing, attribute-based)
 *   <description> → <summary> or <content>
 *   <pubDate>     → <updated> or <published>
 *   <guid>        → <id>
 *
 * MERCH-INTEL-02 v3: handles all Atom field variants.
 */
function parseAtomItems(feedXml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  // Match <entry>...</entry> blocks (Atom 1.0 spec)
  const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;

  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(feedXml)) !== null) {
    const block = match[1];

    // guid: Atom uses <id> as the permanent identifier
    const guid =
      extractText(block, 'id') ??
      extractAtomLink(block) ??
      crypto.randomUUID();

    const title = extractText(block, 'title') ?? '(no title)';

    // link: Atom uses <link href="..."/> (self-closing attribute)
    const link = extractAtomLink(block);

    // description: Atom uses <summary> or <content> (prefer summary for brevity)
    const description =
      extractText(block, 'summary') ??
      extractText(block, 'content') ??
      extractText(block, 'content:encoded');

    // published_at: Atom uses <updated> (most recent edit) or <published> (original post)
    const rawDate =
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

/**
 * Parse RSS 2.0 feed <item> elements into a normalized structure.
 * Maintained intact from prior versions — no behavioral changes.
 */
function parseRss2Items(feedXml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;

  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(feedXml)) !== null) {
    const block = match[1];

    const guid =
      extractText(block, 'guid') ??
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

/**
 * MERCH-INTEL-02 v3: Format-aware feed item dispatcher.
 * Detects Atom vs RSS 2.0, routes to the correct parser.
 * Returns 0 items only if the feed is truly empty — not because of a format mismatch.
 */
function parseFeedItems(feedXml: string): { items: ParsedFeedItem[]; format: 'atom' | 'rss' } {
  const format = detectFeedFormat(feedXml);
  const items = format === 'atom' ? parseAtomItems(feedXml) : parseRss2Items(feedXml);
  return { items, format };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface RssItemRow {
  id: string;
  guid: string;
  title: string;
  description: string | null;
  content: string | null;
  link: string | null;
  published_at: string | null;
  confidence_score: number;
  relevance_score: number | null;
  brand_mentions: string[];
  ingredient_mentions: string[];
  treatment_mentions: string[];
  vertical_tags: string[];
  attribution_text: string | null;
  source_id: string;
  // extras:
  image_url?: string | null;
  source_feed_id?: string;
  // joined from rss_sources:
  source_name: string | null;
  source_category: string | null;
}

type SignalType = 'product_velocity' | 'treatment_trend' | 'ingredient_momentum' | 'brand_adoption' | 'regional' | 'pricing_benchmark' | 'regulatory_alert' | 'education';
type SignalDirection = 'up' | 'down' | 'stable';

interface MarketSignalUpsert {
  signal_type:      SignalType;
  signal_key:       string;
  title:            string;
  description:      string;
  magnitude:        number;
  direction:        SignalDirection;
  region:           string | null;
  category:         string | null;
  related_brands:   string[];
  related_products: string[];
  source:           string | null;
  source_type:      string;
  external_id:      string;
  data_source:      string;
  confidence_score: number;
  active:           boolean;
  // FEED-WO-03: dedup fingerprint
  fingerprint:      string | null;
  is_duplicate:     boolean;
  // INTEL-MEDSPA-01: classification fields
  vertical:         string;
  topic:            string;
  tier_min:         string;
  impact_score:     number;
  // INTEL-HUB-17 (PR3): Content+Media attributes
  source_url?:      string;
  source_name?:     string | null;
  source_domain?:   string | null;
  published_at?:    string | null;
  article_html?:    string | null;
  article_body?:    string | null;
  hero_image_url?:  string | null;
  image_url?:       string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * INTEL-HUB-17 (PR3): Extract first <img> src from arbitrary HTML content
 */
function extractFirstImgSrc(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * INTEL-HUB-17 (PR3): Robustly identify the best available hero image per policy
 */
function extractHeroImage(item: RssItemRow): string | null {
  // 1) Explicit field overrides fallbacks
  let url = item.image_url ?? extractFirstImgSrc(item.content ?? '') ?? extractFirstImgSrc(item.description ?? '');
  
  if (!url) return null;
  const clean = url.trim();
  if (clean.startsWith('data:image/')) return null;
  if (/pixel|tracker|1x1/i.test(clean)) return null;
  
  if (clean.startsWith('//')) return `https:${clean}`;
  if (clean.startsWith('http:')) return clean.replace('http:', 'https:');
  return clean;
}

/**
 * INTEL-HUB-17 (PR3): Strip <script> and <iframe> tags to prevent XSS.
 */
function sanitizeHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+=(["'])(.*?)\1/gi, '')
    .replace(/\s+(href|src)=(["'])javascript:[^"']*\2/gi, '')
    .replace(/\s+style=(["'])(.*?)\1/gi, '');
}

/**
 * Deterministic signal_type mapping (owner approved 2026-03-06):
 * brand_mentions > 0 AND ingredient_mentions = 0 → brand_adoption
 * all other cases → ingredient_momentum
 */
function resolveSignalType(item: RssItemRow): SignalType {
  if (item.brand_mentions.length > 0 && item.ingredient_mentions.length === 0) {
    return 'brand_adoption';
  }
  return 'ingredient_momentum';
}

/**
 * Derive a stable, namespaced signal_key from rss_items.id.
 * Uses first 16 hex chars of the UUID (no dashes) prefixed with 'rss_'.
 * Guaranteed unique (derived from UUID primary key).
 */
function signalKey(id: string): string {
  return `rss_${id.replace(/-/g, '').substring(0, 16)}`;
}

/**
 * Build description: prefer rss_items.description, fall back to content prefix.
 * Truncated to 500 chars to keep market_signals readable.
 */
function buildDescription(item: RssItemRow): string {
  const raw = item.description || item.content || item.title;
  return raw.substring(0, 500);
}

/**
 * Build magnitude from relevance_score (preferred) or confidence_score.
 * Both are 0–1 numeric. Clamp to [0, 1].
 */
function buildMagnitude(item: RssItemRow): number {
  const raw = item.relevance_score ?? item.confidence_score;
  return Math.min(Math.max(raw, 0), 1);
}

/**
 * FEED-WO-03: Build a content fingerprint for dedup.
 * Hash = btoa(title|source|published_at) truncated to 64 chars.
 * Used as a unique key to detect duplicate ingestion across pipeline runs.
 * Falls back to null if btoa is unavailable (should never happen in Deno).
 */
function buildFingerprint(item: RssItemRow): string | null {
  try {
    const raw = `${item.title}|${item.attribution_text ?? item.source_name ?? ''}|${item.published_at ?? ''}`;
    return btoa(encodeURIComponent(raw)).substring(0, 64);
  } catch {
    return null;
  }
}

/**
 * Build source attribution string.
 * Priority: attribution_text (if non-empty) → source_name → link
 */
function buildSource(item: RssItemRow): string | null {
  if (item.attribution_text && item.attribution_text.trim().length > 0) {
    return item.attribution_text.trim();
  }
  if (item.source_name) {
    return item.source_name;
  }
  return item.link ?? null;
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('rss-to-signals', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
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

  // Parse optional limit from POST body
  let limit = DEFAULT_LIMIT;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body.limit === 'number') {
      limit = Math.min(Math.max(body.limit, 1), MAX_LIMIT);
    }
  } catch {
    // Ignore parse errors — use default limit
  }

  const auth = await verifyAdminOrServiceRole(req, supabaseUrl, serviceKey);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: auth.reason ?? 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const startedAt = new Date().toISOString();

  try {
    // ── 1. Fetch qualifying rss_items joined with rss_sources ─────────────────
    //
    // Qualification: confidence_score >= threshold
    // Join: rss_sources for source_name and category (provenance + signal category)
    // Order: newest published_at first, then by confidence_score desc
    // Limit: capped per invocation to prevent runaway promotions

    const { data: items, error: fetchErr } = await supabase
      .from('rss_items')
      .select(`
        id, guid, title, description, content, link, published_at,
        confidence_score, relevance_score,
        brand_mentions, ingredient_mentions, treatment_mentions, vertical_tags,
        attribution_text,
        source_id,
        rss_sources!inner (
          name,
          category
        )
      `)
      .gte('confidence_score', CONFIDENCE_THRESHOLD)
      .order('published_at', { ascending: false })
      .order('confidence_score', { ascending: false })
      .limit(limit);

    if (fetchErr) throw fetchErr;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          promoted: 0,
          skipped: 0,
          message: 'No qualifying rss_items found above confidence threshold',
          threshold: CONFIDENCE_THRESHOLD,
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          isLive: true,
        }),
        { headers: JSON_HEADERS }
      );
    }

    // ── 2. Build market_signals upsert payload ────────────────────────────────

    const upsertRows: MarketSignalUpsert[] = (items as any[]).map((row) => {
      // Flatten joined rss_sources
      const item: RssItemRow = {
        ...row,
        source_name:     row.rss_sources?.name     ?? null,
        source_category: row.rss_sources?.category ?? null,
      };

      const sourceCategory = item.source_category ?? 'trade_pub';

      // INTEL-MEDSPA-01: derive vertical, tier_min, topic, impact_score
      const topic          = classifyTopic(item.title, item.description ?? '');
      const signalVertical = deriveVerticalFromTopic(topic, null);
      const signalTierMin  = deriveTierMinFromCategory(sourceCategory);
      const impactScore    = computeImpactScore(sourceCategory, item.published_at, topic);

      return {
        signal_type:      resolveSignalType(item),
        signal_key:       signalKey(item.id),
        title:            item.title,
        description:      buildDescription(item),
        magnitude:        buildMagnitude(item),
        direction:        'stable' as SignalDirection, // RSS articles don't convey trend direction
        region:           null,                         // Not derivable from RSS without NLP
        category:         item.source_category,
        related_brands:   item.brand_mentions,
        related_products: [],                           // RSS has no product-level data
        source:           buildSource(item),
        source_url:       item.link ?? undefined, // Ensure click target
        // Provenance (W12-20 requirements):
        source_type:      'rss',
        source_name:      item.source_name,
        source_domain:    item.link ? new URL(item.link).hostname.replace(/^www\./, '') : null,
        external_id:      item.guid,
        data_source:      item.source_feed_id ?? item.source_id,
        confidence_score: item.confidence_score,
        active:           true,
        // FEED-WO-03: dedup fingerprint
        fingerprint:      buildFingerprint(item),
        is_duplicate:     false,
        // INTEL-MEDSPA-01: classification
        vertical:         signalVertical,
        topic,
        tier_min:         signalTierMin,
        impact_score:     impactScore,
        // INTEL-HUB-17 (PR3): Open article mapping requirements
        published_at:     item.published_at,
        article_html:     sanitizeHtml(item.content?.substring(0, 50000)),
        article_body:     item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 20000) : null,
        hero_image_url:   extractHeroImage(item),
        image_url:        item.image_url ?? null,
      };
    });

    // ── 3. Upsert into market_signals ─────────────────────────────────────────
    //
    // onConflict: 'source_type,external_id' maps to market_signals_source_dedup_idx
    // ignoreDuplicates: false → UPDATE existing rows (title/confidence may change)
    // updated_at is auto-updated by DB trigger on any row change

    const { data: upserted, error: upsertErr } = await supabase
      .from('market_signals')
      .upsert(upsertRows, {
        onConflict: 'source_type,external_id',
        ignoreDuplicates: false,
      })
      .select('id, signal_key, signal_type, confidence_score, source_type, external_id');

    if (upsertErr) throw upsertErr;

    const promotedCount  = upserted?.length ?? 0;
    const skippedCount   = items.length - promotedCount;

    return new Response(
      JSON.stringify({
        promoted:    promotedCount,
        skipped:     skippedCount,
        threshold:   CONFIDENCE_THRESHOLD,
        limit_used:  limit,
        atom_parser: 'active',  // MERCH-INTEL-02 v3: Atom + RSS format dispatcher loaded
        sample:      (upserted ?? []).slice(0, 5).map((r: any) => ({
          id:               r.id,
          signal_key:       r.signal_key,
          signal_type:      r.signal_type,
          confidence_score: r.confidence_score,
          source_type:      r.source_type,
          external_id:      r.external_id,
        })),
        started_at:  startedAt,
        finished_at: new Date().toISOString(),
        isLive:      true,
      }),
      { headers: JSON_HEADERS }
    );

  } catch (err: any) {
    console.error('[rss-to-signals]', err);
    return new Response(
      JSON.stringify({ error: err.message, isLive: true }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
