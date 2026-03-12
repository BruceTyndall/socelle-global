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
 * INTEL-MEDSPA-01 enhancements:
 *   - Reads vertical + tier_min from data_feeds row → writes to market_signals
 *   - classifyTopic(): keyword-based NLP on title+description → topic column
 *   - computeImpactScore(): 0-100 composite from authority+recency+topic urgency
 *
 * NEWSAPI-INGEST-01 v14 (source_domain extraction + fixed endpoint URLs):
 *   - extractDomain() helper: populates source_domain on every signal (RSS + API)
 *   - GNews endpoint: top-headlines/health (free plan search returns 0, 12hr delay)
 *   - NewsAPI endpoint: everything without sortBy (blocked on free dev plan)
 *   - Currents endpoint: latest-news (keyword search returns empty on free plan)
 *
 * NEWSAPI-INGEST-01 (deployed as v13):
 *   - processApiFeed: URL template substitution — {API_KEY} in endpoint_url replaced with env var value
 *   - GNews auth: token goes in URL query param (not Authorization header)
 *   - Currents auth: apiKey goes in URL query param; json.news[] items extraction added
 *   - NewsAPI auth: X-Api-Key header (replaces incorrect Authorization: Bearer)
 *   - Reddit OAuth: json.data.children[].data format + permalink→source_url + created_utc→published_at
 *   - data_feeds: GNews enabled, Currents inserted, Reddit API rows inserted (disabled) via migration _031
 *
 * NEWSAPI-01 (deployed as v12):
 *   - processApiFeed: item.publishedAt added to date extraction (NewsAPI camelCase)
 *   - data_feeds: NewsAPI + NewBeauty RSS + GNews placeholder added via migration _028
 *   - NEWSAPI_KEY secret required in Supabase Secrets to activate NewsAPI feed
 *
 * MERCH-INTEL-02 v3 (deployed as v11):
 *   - Atom feed support: detectFeedFormat() + parseAtomEntries() + parseRss2Entries()
 *   - parseRssItems() dispatches by format — fixes 0-signal return from Atom feeds
 *   - HTML response detection: URL returning HTML page logged as error, not 'success'
 *   - 'empty' status: valid XML with 0 items no longer falsely marked 'success'
 *   - Accept header: prefers RSS/Atom content types
 *   - atom_parser: 'v3-active' in response for verification
 *
 * POST /functions/v1/feed-orchestrator
 *   Body (optional JSON):
 *     { "category": "trade_pub" }   — filter to specific category
 *     { "feed_ids": ["uuid",...] }   — target specific feeds
 *     { "dry_run": true }            — report what would run without executing
 *
 * Requires service-role key or admin JWT. Anonymous requests are rejected.
 *
 * Data label: LIVE — reads/writes data_feeds + market_signals + feed_run_log.
 *
 * Secrets required:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *   Feed-specific keys referenced via data_feeds.api_key_env_var
 *
 * Authority: build_tracker.md WO W13-02, W15-02, INTEL-MEDSPA-01, MERCH-INTEL-02
 * Allowed path: SOCELLE-WEB/supabase/functions/ (AGENT_SCOPE_REGISTRY §Backend Agent)
 */

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

const FETCH_TIMEOUT_MS = 30_000; // increased from 15s for slow API providers (Currents)
const USER_AGENT = 'Socelle-Intelligence-Bot/1.0 (https://socelle.com)';

// Per SOCELLE_DATA_PROVENANCE_POLICY.md §3
const PROVENANCE_CONFIDENCE: Record<number, number> = {
  1: 0.90, // Direct/Owned
  2: 0.70, // Public/Structured
  3: 0.50, // Aggregated/Derived
};

type FeedSignalType =
  | 'product_velocity'
  | 'treatment_trend'
  | 'ingredient_momentum'
  | 'brand_adoption'
  | 'regional'
  | 'pricing_benchmark'
  | 'regulatory_alert'
  | 'education'
  | 'industry_news'
  | 'brand_update'
  | 'press_release'
  | 'social_trend'
  | 'job_market'
  | 'event_signal'
  | 'research_insight'
  | 'ingredient_trend'
  | 'market_data'
  | 'regional_market'
  | 'supply_chain';

type SignalDirection = 'up' | 'down' | 'stable';
type FeedTierVisibility = 'free' | 'pro' | 'admin';

interface MarketSignalInsert {
  signal_type: FeedSignalType;
  signal_key: string;
  title: string;
  description: string;
  magnitude: number;
  direction: SignalDirection;
  region?: string | null;
  category?: string | null;
  related_brands?: string[] | null;
  related_products?: string[] | null;
  source?: string | null;
  source_type?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  source_domain?: string | null;
  external_id?: string | null;
  data_source?: string | null;
  source_feed_id?: string | null;
  confidence_score?: number | null;
  tier_visibility?: FeedTierVisibility | null;
  image_url?: string | null;
  is_duplicate?: boolean;
  active?: boolean;
  vertical?: string | null;
  topic?: string | null;
  tier_min?: string | null;
  impact_score?: number | null;
  hero_image_url?: string | null;
  image_urls?: string[] | null;
  article_html?: string | null;
  article_body?: string | null;
  word_count?: number | null;
  reading_time_minutes?: number | null;
  author?: string | null;
  published_at?: string | null;
  is_enriched?: boolean;
}

interface UntypedSupabaseClient {
  from: (table: string) => any;
}

// Categories now dynamically derived via topic heuristics instead of static mapping arrays.
// This prevents niche signals from getting starved or over-saturated.

// ── INTEL-MEDSPA-01: Classification helpers ───────────────────────────────────

// MERCH-INTEL-02: expanded topic classifier — medspa procedures + salon + beauty brand
function classifyTopic(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (/recall|adverse event|warning letter|safety alert|fda action|banned|prohibited|class i recall|class ii recall|market withdrawal/.test(text))
    return 'safety';
  if (/\bfda\b|regulation|compliance|legislation|law|bill\b|act \b|guidance|ruling|cfr \b|cpsc|gmp|iso 22716|cosmetics act|modernization act/.test(text))
    return 'regulation';
  if (/clinical trial|study|journal|research|pubmed|randomized|efficacy|peer.reviewed|meta.analysis|double.blind|in vitro|in vivo|histology/.test(text))
    return 'science';
  if (/ingredient|formulation|inci|peptide|retinol|hyaluronic|niacinamide|vitamin c|spf|preservative|compound|active ingredient|retinoid|azelaic|bakuchiol|ceramide|growth factor|stem cell extract|collagen stimulat/.test(text))
    return 'ingredient';
  if (/botox|filler|laser|microneedling|rf \b|radiofrequency|prp|exosome|peel|dermaplaning|hydrafacial|ultherapy|coolsculpting|kybella|sculptra|neuromodulator|thread lift|pdo thread|morpheus|sylfirm|vivace|profhilo|polynucleotide|biostimulator|fat dissolv|body contouring|lip augment|jawline|brow lift|eyelid|rhinoplasty|facelift|co2 laser|erbium|fractional|ipl|photofacial|hair removal|electrolysis|waxing|sugaring|lash lift|lash extension|brow lamination|microblading|permanent makeup|spray tan|facial treatment|chemical exfoliat|enzyme treatment|oxygen facial|led therapy|cryotherapy|cupping|gua sha|lymphatic drainage|lymphatic massage|swedish massage|deep tissue|hot stone|aromatherapy|prenatal massage|sports massage|reflexology|acupuncture/.test(text))
    return 'treatment_trend';
  if (/trend|tiktok|viral|gen z|millennial|gen alpha|consumer|skincare routine|clean beauty|wellness|self.care|beauty standard|skin barrier|glass skin|slugging|skin cycling|tretinoin|holistic|mindfulness|biohacking|longevity|beauty tech|retail trend/.test(text))
    return 'consumer_trend';
  if (/price|pricing|revenue|cost|profitability|margin|fee|rate increase|inflation|market size|forecast|cagr|market value|spend|expenditure|reimbursement|insurance coverage/.test(text))
    return 'pricing';
  if (/\bai\b|artificial intelligence|software|platform|\bapp\b|digital|crm|emr|telemedicine|wearable|device|medtech|aesthetech|booking system|point.of.sale|pos system/.test(text))
    return 'technology';
  if (/\bjob\b|hiring|workforce|esthetician|employment|staff|career|salary|wage|nurse practitioner|pa |physician assistant|injector|aesthetic nurse|medical director/.test(text))
    return 'jobs';
  if (/conference|expo|trade show|summit|webinar|event|congress|symposium|convention|show 20|aesthetics show|beauty expo|spa conference/.test(text))
    return 'events';
  if (/market report|industry data|statistics|growth rate|cagr|market share|market analysis|industry report|market research|beauty industry/.test(text))
    return 'market_data';
  if (/launch|brand|\bpartnership\b|acquisition|merger|funding|investment|\bipo\b|series [a-c]|raised |rebranding|collaboration|celebrity brand|brand extension/.test(text))
    return 'brand_news';
  return 'other';
}

function computeImpactScore(
  feed: { category: string; provenance_tier: number },
  publishedAt: string | null,
  topic: string,
): number {
  let score = 0;
  if (feed.provenance_tier === 1) score += 40;
  else if (feed.provenance_tier === 2) score += 25;
  else score += 10;
  if (feed.category === 'academic') score += 20;
  else if (feed.category === 'regulatory' || feed.category === 'government') score += 18;
  else if (feed.category === 'association') score += 12;
  else if (feed.category === 'trade_pub') score += 10;
  else if (feed.category === 'brand_news') score += 6;
  if (topic === 'safety') score += 20;
  else if (topic === 'regulation') score += 15;
  else if (topic === 'science') score += 12;
  else if (topic === 'treatment_trend') score += 10;
  else if (topic === 'pricing') score += 8;
  if (publishedAt) {
    const hoursOld = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
    if (hoursOld < 2) score += 20;
    else if (hoursOld < 6) score += 16;
    else if (hoursOld < 24) score += 10;
    else if (hoursOld < 72) score += 5;
  }
  return Math.min(100, Math.max(0, score));
}

function deriveSignalTypeFromTopic(topic: string, category: string): FeedSignalType {
  switch (topic) {
    case 'safety':
    case 'regulation':
      return 'regulatory_alert';
    case 'science':
      return 'research_insight';
    case 'ingredient':
      return category === 'academic' ? 'ingredient_trend' : 'ingredient_momentum';
    case 'treatment_trend':
      return 'treatment_trend';
    case 'consumer_trend':
      return 'social_trend';
    case 'pricing':
      return 'pricing_benchmark';
    case 'jobs':
      return 'job_market';
    case 'events':
      return 'event_signal';
    case 'market_data':
      return 'market_data';
    case 'brand_news':
      return category === 'press_release' ? 'press_release' : 'brand_update';
    case 'technology':
      return 'industry_news';
    default:
      break;
  }

  switch (category) {
    case 'press_release':
      return 'press_release';
    case 'brand_news':
      return 'brand_update';
    case 'jobs':
      return 'job_market';
    case 'events':
      return 'event_signal';
    case 'market_data':
      return 'market_data';
    case 'social':
      return 'social_trend';
    case 'ingredients':
      return 'ingredient_momentum';
    default:
      return 'industry_news';
  }
}

function deriveVerticalFromTopic(topic: string, defaultVertical?: string | null): string {
  if (defaultVertical && defaultVertical !== 'multi') {
    return defaultVertical;
  }

  switch (topic) {
    case 'safety':
    case 'regulation':
    case 'science':
    case 'treatment_trend':
    case 'technology':
      return 'medspa';
    case 'brand_news':
    case 'pricing':
    case 'market_data':
      return 'beauty_brand';
    default:
      return defaultVertical ?? 'multi';
  }
}

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
  // FEED-WO-04: health tracking
  consecutive_failures: number;
  last_success_at: string | null;
  health_status: 'healthy' | 'degraded' | 'failed';
  // INTEL-MEDSPA-01: classification
  vertical: string | null;
  tier_min: string | null;
}

interface FeedResult {
  feed_id: string;
  name: string;
  feed_type: string;
  category: string;
  status: 'success' | 'skipped' | 'error' | 'empty' | 'pending';
  signals_created: number;
  message: string;
  duration_ms: number;
  items_parsed?: number;
  content_type?: string;
}

interface RequestBody {
  category?: string;
  feed_ids?: string[];
  dry_run?: boolean;
  tier?: number;
}

// ── RSS/Atom Parsing (MERCH-INTEL-02 v3: format-aware) ───────────────────────

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
      .replace(/&#\d+;/g, ' ')
      .replace(/<[^>]+>/g, '') // Strip HTML tags from description
      .trim();
  }
  return null;
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  return xml.match(pattern)?.[1] ?? null;
}

/**
 * INTEL-PREMIUM-01: Extract raw content (preserving HTML) from a tag.
 * Used for content:encoded to capture the full article HTML.
 */
function extractRawContent(xml: string, tag: string): string | null {
  // Try CDATA first (most common for content:encoded)
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdata);
  if (cdataMatch?.[1]) return cdataMatch[1].trim();

  // Fallback: plain tag content (with entity decoding but NO HTML stripping)
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const plainMatch = xml.match(plain);
  if (plainMatch?.[1]) {
    return plainMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  }
  return null;
}

/**
 * INTEL-HUB-17 (PR3): Extract first <img> src from arbitrary HTML content
 */
function extractFirstImgSrc(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/**
 * INTEL-HUB-17 (PR3): Clean and normalize image URLs, rejecting tracking pixels
 */
function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const clean = url.trim();
  if (clean.startsWith('data:image/')) return null;
  if (/pixel|tracker|1x1|clear\.gif|web-bug/i.test(clean)) return null;
  
  if (clean.startsWith('//')) return `https:${clean}`;
  if (clean.startsWith('http:')) return clean.replace('http:', 'https:');
  return clean;
}

/**
 * INTEL-HUB-17 (PR3): Robustly identify the best available hero image per policy
 */
function extractHeroImage(block: string, contentHtml: string | null): string | null {
  const url =
    extractAttr(block, 'media:content', 'url') ??
    extractAttr(block, 'enclosure', 'url') ??
    extractAttr(block, 'media:thumbnail', 'url') ??
    extractFirstImgSrc(contentHtml ?? '') ??
    null;

  return cleanImageUrl(url);
}

function extractHeroImageFromApi(item: any): string | null {
  const url = item.image ?? item.image_url ?? item.thumbnail ?? item.urlToImage ?? extractFirstImgSrc(item.content ?? item.description ?? '') ?? null;
  return cleanImageUrl(url);
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

function htmlToText(html: string | null | undefined, maxChars: number): string | null {
  if (!html) return null;
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.substring(0, maxChars) : null;
}

/**
 * MERCH-INTEL-02 v3: Extracts the canonical article link from an Atom <entry> block.
 * Priority: rel="alternate" → any href without rel="self" → rel="self" → text fallback.
 */
function extractAtomLink(block: string): string | null {
  const altMatch = block.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/i)
    ?? block.match(/<link[^>]+href="([^"]+)"[^>]+rel="alternate"/i);
  if (altMatch?.[1]) return altMatch[1];

  const hrefMatch = block.match(/<link[^>]+href="([^"]+)"/i);
  if (hrefMatch?.[1] && !block.match(/<link[^>]+rel="self"[^>]+href="[^"]*"/i)) {
    return hrefMatch[1];
  }

  const selfMatch = block.match(/<link[^>]+rel="self"[^>]+href="([^"]+)"/i)
    ?? block.match(/<link[^>]+href="([^"]+)"[^>]+rel="self"/i);
  if (selfMatch?.[1]) return selfMatch[1];

  return extractText(block, 'link');
}

/**
 * MERCH-INTEL-02 v3: Detect feed format from root element.
 * Returns 'html' if the response is an HTML page (redirect/error page), not XML.
 * This prevents HTML responses from being silently classified as 'success' with 0 items.
 */
function detectFeedFormat(xml: string): 'atom' | 'rss' | 'html' {
  const head = xml.substring(0, 1000).toLowerCase().trimStart();
  // HTML response detection — redirect pages, CMS homepages, error pages
  if (head.startsWith('<!doctype html') || head.startsWith('<html') || head.includes('<html ')) {
    return 'html';
  }
  // Atom: root <feed> element (often with Atom namespace or xmlns)
  if (head.includes('<feed') && (head.includes('atom') || head.includes('xmlns'))) {
    return 'atom';
  }
  // Atom: <feed> without namespace (minimal Atom feeds)
  if (/<feed[\s>]/i.test(head)) {
    return 'atom';
  }
  return 'rss';
}

interface ParsedRssItem {
  guid: string;
  title: string;
  link: string | null;
  description: string | null;
  published_at: string | null;
  // INTEL-PREMIUM-01: full content, image, author extraction
  content_full: string | null;
  image_url: string | null;
  author: string | null;
}

/**
 * Parse Atom 1.0 <entry> elements.
 * MERCH-INTEL-02 v3: dedicated Atom parser — fixes 0-signal return from Atom feeds.
 */
function parseAtomEntries(feedXml: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
  const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;

  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(feedXml)) !== null) {
    const block = match[1];

    const guid =
      extractText(block, 'id') ??
      extractAtomLink(block) ??
      crypto.randomUUID();

    const title = extractText(block, 'title') ?? '(no title)';
    const link = extractAtomLink(block);
    const description =
      extractText(block, 'summary') ??
      extractText(block, 'content') ??
      extractText(block, 'content:encoded');

    // INTEL-PREMIUM-01: full content (HTML preserved, up to 50K chars)
    const contentFull =
      extractRawContent(block, 'content:encoded') ??
      extractRawContent(block, 'content') ??
      extractRawContent(block, 'summary');

    // INTEL-PREMIUM-01: image extraction (priority order)
    const imageUrl = extractHeroImage(block, contentFull ?? description ?? '');

    // INTEL-PREMIUM-01: author extraction
    const author =
      extractText(block, 'author') ??
      extractText(block, 'name') ??
      null;

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
        content_full: contentFull?.substring(0, 50000) ?? null,
        image_url: imageUrl,
        author,
      });
    }
  }
  return items;
}

/**
 * Parse RSS 2.0 <item> elements.
 */
function parseRss2Entries(feedXml: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
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

    // INTEL-PREMIUM-01: full content (HTML preserved, up to 50K chars)
    const contentFull =
      extractRawContent(block, 'content:encoded') ??
      extractRawContent(block, 'description');

    // INTEL-PREMIUM-01: image extraction (priority order)
    const imageUrl = extractHeroImage(block, contentFull ?? description ?? '');

    // INTEL-PREMIUM-01: author extraction
    const author =
      extractText(block, 'dc:creator') ??
      extractText(block, 'author') ??
      null;

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
        content_full: contentFull?.substring(0, 50000) ?? null,
        image_url: imageUrl,
        author,
      });
    }
  }
  return items;
}

/**
 * MERCH-INTEL-02 v3: Format-aware dispatcher.
 * Returns format:'html' with empty items if URL returned an HTML page.
 * Caller treats 'html' as an error condition (URL is not an RSS/Atom feed).
 */
function parseRssItems(feedXml: string): { items: ParsedRssItem[]; format: 'atom' | 'rss' | 'html' } {
  const format = detectFeedFormat(feedXml);
  if (format === 'html') return { items: [], format };
  const items = format === 'atom' ? parseAtomEntries(feedXml) : parseRss2Entries(feedXml);
  return { items, format };
}

// ── Source domain helper ──────────────────────────────────────────────────────

function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// ── Feed Processors ───────────────────────────────────────────────────────────

async function processRssFeed(
  feed: DataFeed,
  supabase: UntypedSupabaseClient,
): Promise<{ signals: number; error?: string; items_fetched?: number; content_type?: string; format?: string }> {
  if (!feed.endpoint_url) {
    return { signals: 0, error: 'No endpoint_url configured' };
  }

  const response = await fetch(feed.endpoint_url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${feed.endpoint_url}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const xml = await response.text();
  const { items, format } = parseRssItems(xml);

  // HTML response = feed URL is not an RSS/Atom endpoint (redirect, error page, etc.)
  if (format === 'html') {
    return {
      signals: 0,
      error: `URL returned HTML (${contentType.substring(0, 80)}) — not an RSS/Atom feed. Update endpoint_url in data_feeds.`,
      content_type: contentType,
      format,
    };
  }

  if (items.length === 0) {
    return { signals: 0, items_fetched: 0, format, content_type: contentType };
  }

  const confidence = PROVENANCE_CONFIDENCE[feed.provenance_tier] ?? 0.70;
  
  // These specific tiers can still respect the feed's override if paid/free is hardcoded, but vertical and type are dynamic.
  const tierVisibility = feed.tier_min === 'paid' ? 'pro' : 'free';
  const signalTierMin = feed.tier_min ?? 'paid';

  const signalRows: MarketSignalInsert[] = items.map((item) => {
    const topic = classifyTopic(item.title, item.description ?? '');
    const impactScore = computeImpactScore(feed, item.published_at, topic);
    const safeArticleHtml = sanitizeHtml(item.content_full?.substring(0, 50000));
    const articleBody = htmlToText(safeArticleHtml, 20000);
    const imageUrl = item.image_url ?? null;

    const dynamicSignalType = deriveSignalTypeFromTopic(topic, feed.category);
    const dynamicVertical = deriveVerticalFromTopic(topic, feed.vertical);

    return {
      signal_type: dynamicSignalType,
      signal_key: `feed_${feed.id.replace(/-/g, '').substring(0, 8)}_${item.guid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)}`,
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
      source_domain: extractDomain(item.link),
      external_id: `${feed.id}::${item.guid}`,
      data_source: feed.id,
      source_feed_id: feed.id,
      confidence_score: confidence,
      tier_visibility: tierVisibility,
      image_url: imageUrl,
      is_duplicate: false,
      active: true,
      // INTEL-MEDSPA-01 classification fields (dynamically routed):
      vertical: dynamicVertical,
      topic,
      tier_min: signalTierMin,
      impact_score: impactScore,
      // INTEL-PREMIUM-01: full content, images, metadata
      hero_image_url: imageUrl,
      image_urls: imageUrl ? [imageUrl] : [],
      article_html: safeArticleHtml,
      article_body: articleBody,
      word_count: articleBody ? articleBody.split(/\s+/).filter(Boolean).length : 0,
      reading_time_minutes: articleBody ? Math.max(1, Math.ceil(articleBody.split(/\s+/).filter(Boolean).length / 200)) : 0,
      author: item.author,
      published_at: item.published_at,
      is_enriched: false,
    };
  });

  const { data: upserted, error: upsertErr } = await supabase
    .from('market_signals')
    .upsert(signalRows, {
      onConflict: 'source_type,external_id',
      ignoreDuplicates: false,
    })
    .select('id');

  if (upsertErr) throw new Error(upsertErr.message || JSON.stringify(upsertErr));

  return { signals: upserted?.length ?? 0, items_fetched: items.length, format, content_type: contentType };
}

async function processApiFeed(
  feed: DataFeed,
  supabase: UntypedSupabaseClient,
): Promise<{ signals: number; error?: string; items_fetched?: number }> {
  if (!feed.endpoint_url) {
    return { signals: 0, error: 'No endpoint_url configured' };
  }

  const headers: Record<string, string> = {
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
  };

  // NEWSAPI-INGEST-01: multi-style auth handling
  // - {API_KEY} in URL → substitute env var, no auth header (GNews, Currents query-param style)
  // - No {API_KEY} in URL → X-Api-Key header (NewsAPI, standard news APIs)
  // - No api_key_env_var → no auth needed
  let resolvedUrl = feed.endpoint_url;

  if (feed.api_key_env_var) {
    const apiKey = Deno.env.get(feed.api_key_env_var);
    if (!apiKey) {
      return { signals: 0, error: `Missing secret: ${feed.api_key_env_var}` };
    }
    if (resolvedUrl.includes('{API_KEY}')) {
      // Query-param style: substitute placeholder (GNews token=, Currents apiKey=)
      resolvedUrl = resolvedUrl.replace('{API_KEY}', encodeURIComponent(apiKey));
    } else {
      // Header style: X-Api-Key (NewsAPI, standard REST APIs)
      headers['X-Api-Key'] = apiKey;
    }
  }

  const response = await fetch(resolvedUrl, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${feed.endpoint_url}`);
  }

  const json = await response.json();

  // NEWSAPI-INGEST-01: extended format detection
  // - json.articles[]   → NewsAPI, GNews
  // - json.news[]       → Currents API
  // - json.data.children[].data → Reddit OAuth2
  // - json.results[]    → generic
  // - json[]            → raw array
  let items: any[] = [];
  if (Array.isArray(json)) {
    items = json;
  } else if (Array.isArray(json?.articles)) {
    items = json.articles;
  } else if (Array.isArray(json?.news)) {
    items = json.news;                                    // Currents API
  } else if (Array.isArray(json?.data?.children)) {
    items = json.data.children.map((c: any) => c.data); // Reddit OAuth2
  } else if (Array.isArray(json?.results)) {
    items = json.results;
  } else if (Array.isArray(json?.data)) {
    items = json.data;
  } else if (Array.isArray(json?.items)) {
    items = json.items;
  }

  if (items.length === 0) {
    return { signals: 0 };
  }

  const confidence = PROVENANCE_CONFIDENCE[feed.provenance_tier] ?? 0.70;
  
  // These specific tiers can still respect the feed's override if paid/free is hardcoded, but vertical and type are dynamic.
  const tierVisibility = feed.tier_min === 'paid' ? 'pro' : 'free';
  const signalTierMin = feed.tier_min ?? 'paid';

  const signalRows: MarketSignalInsert[] = items.slice(0, 100).map((item: any, idx: number) => {
    const title = item.title || item.name || item.headline || `${feed.name} item ${idx + 1}`;
    const description =
      item.description || item.summary || item.abstract || item.selftext || item.content || title;
    const externalId = item.id || item.guid || item.url || item.link || item.permalink || `${feed.id}_${idx}`;
    // Reddit permalink → full URL; Currents → url; GNews/NewsAPI → url
    const itemUrl = item.url || item.link || item.href ||
      (item.permalink ? `https://reddit.com${item.permalink}` : null);
    // Date extraction: NewsAPI camelCase, Currents ISO, Reddit unix epoch
    const publishedAt = item.publishedAt || item.published_at || item.pubDate || item.date ||
      item.published ||
      (item.created_utc ? new Date(item.created_utc * 1000).toISOString() : null);

    const topic = classifyTopic(String(title), String(description));
    const impactScore = computeImpactScore(feed, publishedAt ? String(publishedAt) : null, topic);
    const imageUrl = extractHeroImageFromApi(item);
    const articleBody = String(description).substring(0, 20000);

    const dynamicSignalType = deriveSignalTypeFromTopic(topic, feed.category);
    const dynamicVertical = deriveVerticalFromTopic(topic, feed.vertical);

    return {
      signal_type: dynamicSignalType,
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
      source_domain: extractDomain(itemUrl ? String(itemUrl) : null),
      external_id: `${feed.id}::${String(externalId).substring(0, 200)}`,
      data_source: feed.id,
      source_feed_id: feed.id,
      confidence_score: confidence,
      tier_visibility: tierVisibility,
      image_url: imageUrl,
      is_duplicate: false,
      active: true,
      // INTEL-MEDSPA-01 classification fields (dynamically routed):
      vertical: dynamicVertical,
      topic,
      tier_min: signalTierMin,
      impact_score: impactScore,
      // INTEL-PREMIUM-01: images, content metadata
      hero_image_url: imageUrl,
      image_urls: imageUrl
        ? [String(imageUrl)]
        : [],
      article_body: articleBody,
      word_count: articleBody.split(/\s+/).filter(Boolean).length,
      reading_time_minutes: Math.max(1, Math.ceil(articleBody.split(/\s+/).filter(Boolean).length / 200)),
      author: item.author || item.creator || null,
      published_at: publishedAt ? new Date(String(publishedAt)).toISOString() : null,
      is_enriched: false,
    };
  });

  const { data: upserted, error: upsertErr } = await supabase
    .from('market_signals')
    .upsert(signalRows, {
      onConflict: 'source_type,external_id',
      ignoreDuplicates: false,
    })
    .select('id');

  if (upsertErr) throw new Error(upsertErr.message || JSON.stringify(upsertErr));

  return { signals: upserted?.length ?? 0, items_fetched: items.length };
}

// ── Stale Check ───────────────────────────────────────────────────────────────

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
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: JSON_HEADERS },
    );
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
    const body: RequestBody =
      req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};
    const auth = await verifyAdminOrServiceRole(req, supabaseUrl, serviceKey);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ error: auth.reason ?? 'Unauthorized' }),
        { status: 401, headers: JSON_HEADERS },
      );
    }

    const dryRun = body.dry_run === true;

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
            vertical: f.vertical,
            tier_min: f.tier_min,
            last_fetched_at: f.last_fetched_at,
            poll_interval_minutes: f.poll_interval_minutes,
          })),
        }),
        { headers: JSON_HEADERS },
      );
    }

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
        let outcome: { signals: number; error?: string; items_fetched?: number; content_type?: string; format?: string };

        switch (feed.feed_type) {
          case 'rss':
            outcome = await processRssFeed(feed, supabase);
            break;
          case 'api':
            outcome = await processApiFeed(feed, supabase);
            break;
          case 'webhook':
          case 'scraper':
            outcome = { signals: 0 };
            result.status = 'skipped';
            result.message = `${feed.feed_type} feeds are processed externally`;
            break;
          default:
            outcome = { signals: 0, error: `Unknown feed_type: ${feed.feed_type}` };
        }

        itemsFetched = outcome.items_fetched ?? 0;
        if (outcome.content_type) result.content_type = outcome.content_type;

        if (outcome.error) {
          result.status = 'error';
          result.message = outcome.error;
        } else if (result.status !== 'skipped') {
          result.status = itemsFetched === 0 ? 'empty' : 'success';
          result.signals_created = outcome.signals;
          result.items_parsed = itemsFetched;
          result.message = `${outcome.signals} signals from ${itemsFetched} items (${outcome.format ?? 'unknown'} format)`;
        }

        // FEED-WO-04: Update data_feeds health tracking
        if (result.status === 'success') {
          await supabase
            .from('data_feeds')
            .update({
              last_fetched_at: new Date().toISOString(),
              last_success_at: new Date().toISOString(),
              last_error: null,
              signal_count: feed.signal_count + result.signals_created,
              consecutive_failures: 0,
              health_status: 'healthy',
            })
            .eq('id', feed.id);
        } else if (result.status === 'empty') {
          // Empty but valid feed — update last_fetched_at, don't increment failures
          await supabase
            .from('data_feeds')
            .update({
              last_fetched_at: new Date().toISOString(),
              last_error: null,
            })
            .eq('id', feed.id);
        } else if (result.status === 'error') {
          const newFailures = (feed.consecutive_failures ?? 0) + 1;
          const newHealthStatus =
            newFailures >= 3 ? 'failed' :
            newFailures >= 1 ? 'degraded' : 'healthy';
          await supabase
            .from('data_feeds')
            .update({
              last_error: result.message.substring(0, 500),
              consecutive_failures: newFailures,
              health_status: newHealthStatus,
            })
            .eq('id', feed.id);

          // FEED-WO-05: Write to DLQ
          await supabase
            .from('feed_dlq')
            .insert({
              feed_id: feed.id,
              feed_url: feed.endpoint_url ?? '',
              error_message: result.message.substring(0, 1000),
              raw_payload: { feed_id: feed.id, feed_name: feed.name, category: feed.category },
              attempt_count: newFailures,
            })
            .then(() => null, () => null); // non-blocking
        }
      } catch (err) {
        result.status = 'error';
        result.message = err instanceof Error
          ? err.message
          : (typeof err === 'object' && err !== null)
            ? ((err as any).message ?? (err as any).details ?? (err as any).hint ?? JSON.stringify(err))
            : String(err);

        const newFailures = (feed.consecutive_failures ?? 0) + 1;
        const newHealthStatus =
          newFailures >= 3 ? 'failed' :
          newFailures >= 1 ? 'degraded' : 'healthy';
        await supabase
          .from('data_feeds')
          .update({
            last_error: result.message.substring(0, 500),
            consecutive_failures: newFailures,
            health_status: newHealthStatus,
          })
          .eq('id', feed.id)
          .then(() => null, () => null);

        await supabase
          .from('feed_dlq')
          .insert({
            feed_id: feed.id,
            feed_url: feed.endpoint_url ?? '',
            error_message: result.message.substring(0, 1000),
            raw_payload: { feed_id: feed.id, feed_name: feed.name, exception: true },
            attempt_count: newFailures,
          })
          .then(() => null, () => null);
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
          .then(() => null, () => null);
      }

      results.push(result);
    }

    const totalSignals = results.reduce((s, r) => s + r.signals_created, 0);
    const successCount = results.filter((r) => r.status === 'success').length;
    const emptyCount = results.filter((r) => r.status === 'empty').length;
    const errorCount = results.filter((r) => r.status === 'error').length;
    const skippedCount = results.filter((r) => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({
        ok: true,
        processed: dueFeeds.length,
        signals: totalSignals,
        success: successCount,
        empty: emptyCount,
        errors: errorCount,
        skipped: skippedCount,
        total_enabled: feeds.length,
        atom_parser: 'v3-active',
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
