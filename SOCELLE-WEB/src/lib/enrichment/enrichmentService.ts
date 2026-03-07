import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  OperatorEnrichment,
  GoogleReviewData,
  WebsiteAnalysis,
  SocialPresence,
  ReviewPlatformData,
  EnrichmentConfidence,
  EnrichmentProvenanceEntry,
} from './types';

interface BusinessContext {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  website_url: string | null;
  instagram_handle: string | null;
}

interface AdapterResult<T> {
  data: T;
  provenance: EnrichmentProvenanceEntry;
}

let enrichmentScheduleTimer: ReturnType<typeof setInterval> | null = null;

const ENRICHMENT_PROXY_URL = import.meta.env.VITE_ENRICHMENT_PROXY_URL as string | undefined;

function nowIso(): string {
  return new Date().toISOString();
}

function classifyConfidence(okSources: number): EnrichmentConfidence {
  if (okSources >= 4) return 'high';
  if (okSources >= 2) return 'medium';
  return 'low';
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function degradedProfile(reason: string): OperatorEnrichment {
  const fetchedAt = nowIso();

  const provenance: EnrichmentProvenanceEntry[] = [
    {
      source: 'google_reviews',
      provider: reason,
      fetched_at: fetchedAt,
      endpoint: null,
      confidence: 'low',
      status: 'degraded',
    },
    {
      source: 'website',
      provider: reason,
      fetched_at: fetchedAt,
      endpoint: null,
      confidence: 'low',
      status: 'degraded',
    },
    {
      source: 'social',
      provider: reason,
      fetched_at: fetchedAt,
      endpoint: null,
      confidence: 'low',
      status: 'degraded',
    },
    {
      source: 'yelp',
      provider: reason,
      fetched_at: fetchedAt,
      endpoint: null,
      confidence: 'low',
      status: 'degraded',
    },
  ];

  return {
    google_rating: null,
    google_review_count: null,
    review_themes: [],
    review_concerns: [],
    social_active: false,
    social_brand_mentions: [],
    website_url: null,
    website_mentions_brands: [],
    has_online_booking: false,
    service_menu_themes: [],
    digital_presence_score: 0,
    yelp_rating: null,
    tripadvisor_rating: null,
    enrichment_date: fetchedAt,
    enrichment_confidence: 'low',
    provenance,
  };
}

async function resolveBusinessContext(operatorId: string): Promise<BusinessContext | null> {
  if (!isSupabaseConfigured) return null;

  const byId = await supabase
    .from('businesses')
    .select('id,name,city,state,website_url,instagram_handle')
    .eq('id', operatorId)
    .maybeSingle();

  if (byId.data) {
    return byId.data as BusinessContext;
  }

  const bySlug = await supabase
    .from('businesses')
    .select('id,name,city,state,website_url,instagram_handle')
    .eq('slug', operatorId)
    .maybeSingle();

  if (bySlug.data) {
    return bySlug.data as BusinessContext;
  }

  return null;
}

async function callProxy<T>(path: string, payload: Record<string, unknown>): Promise<T | null> {
  if (!ENRICHMENT_PROXY_URL) return null;

  try {
    const response = await fetch(`${ENRICHMENT_PROXY_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchRegionalThemes(city: string | null, state: string | null): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  const { data } = await supabase
    .from('market_signals')
    .select('title,description,region')
    .eq('active', true)
    .eq('is_duplicate', false)
    .order('updated_at', { ascending: false })
    .limit(120);

  if (!data) return [];

  const cityNeedle = city?.toLowerCase() ?? '';
  const stateNeedle = state?.toLowerCase() ?? '';

  const candidates = (data as Array<{ title: string; description: string; region: string | null }>)
    .filter((row) => {
      if (!row.region) return false;
      const haystack = row.region.toLowerCase();
      return (cityNeedle && haystack.includes(cityNeedle)) || (stateNeedle && haystack.includes(stateNeedle));
    })
    .slice(0, 20)
    .flatMap((row) => {
      return `${row.title}. ${row.description}`
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter((token) => token.length >= 5);
    });

  return unique(candidates).slice(0, 8);
}

export async function scrapeGoogleReviews(
  businessName: string,
  city: string
): Promise<GoogleReviewData> {
  const proxied = await callProxy<{ rating?: number; reviewCount?: number; themes?: string[] }>('google-reviews', {
    businessName,
    city,
  });

  if (proxied) {
    return {
      rating: proxied.rating ?? 0,
      reviewCount: proxied.reviewCount ?? 0,
      themes: proxied.themes ?? [],
    };
  }

  return {
    rating: 0,
    reviewCount: 0,
    themes: [],
  };
}

export async function scrapeWebsite(url: string): Promise<WebsiteAnalysis> {
  const proxied = await callProxy<{
    mentionsBrands?: string[];
    treatments?: string[];
    hasBooking?: boolean;
    hasRetailPage?: boolean;
    digitalScore?: number;
  }>('website-analysis', { url });

  if (proxied) {
    return {
      mentionsBrands: proxied.mentionsBrands ?? [],
      treatments: proxied.treatments ?? [],
      hasBooking: proxied.hasBooking ?? false,
      hasRetailPage: proxied.hasRetailPage ?? false,
      digitalScore: proxied.digitalScore ?? 0,
    };
  }

  return {
    mentionsBrands: [],
    treatments: [],
    hasBooking: false,
    hasRetailPage: false,
    digitalScore: 0,
  };
}

export async function checkSocialPresence(
  handle: string
): Promise<SocialPresence> {
  const proxied = await callProxy<{
    active?: boolean;
    followers?: number;
    postFrequency?: number;
    brandMentions?: string[];
  }>('social-presence', { handle });

  if (proxied) {
    return {
      active: proxied.active ?? false,
      followers: proxied.followers ?? 0,
      postFrequency: proxied.postFrequency ?? 0,
      brandMentions: proxied.brandMentions ?? [],
    };
  }

  return {
    active: false,
    followers: 0,
    postFrequency: 0,
    brandMentions: [],
  };
}

export async function scrapeReviewPlatforms(
  businessName: string
): Promise<ReviewPlatformData> {
  const proxied = await callProxy<{
    yelpRating?: number | null;
    tripadvisorRating?: number | null;
    recentThemes?: string[];
  }>('review-platforms', { businessName });

  if (proxied) {
    return {
      yelpRating: proxied.yelpRating ?? null,
      tripadvisorRating: proxied.tripadvisorRating ?? null,
      recentThemes: proxied.recentThemes ?? [],
    };
  }

  return {
    yelpRating: null,
    tripadvisorRating: null,
    recentThemes: [],
  };
}

async function collectProviderData(context: BusinessContext): Promise<
  [
    AdapterResult<GoogleReviewData>,
    AdapterResult<WebsiteAnalysis>,
    AdapterResult<SocialPresence>,
    AdapterResult<ReviewPlatformData>
  ]
> {
  const [google, website, social, reviews] = await Promise.all([
    scrapeGoogleReviews(context.name, context.city ?? context.state ?? ''),
    context.website_url ? scrapeWebsite(context.website_url) : Promise.resolve<WebsiteAnalysis>({
      mentionsBrands: [],
      treatments: [],
      hasBooking: false,
      hasRetailPage: false,
      digitalScore: 0,
    }),
    checkSocialPresence(context.instagram_handle ?? ''),
    scrapeReviewPlatforms(context.name),
  ]);

  const fetchedAt = nowIso();

  const googleOk = google.rating > 0 || google.reviewCount > 0;
  const websiteOk = website.digitalScore > 0 || website.mentionsBrands.length > 0;
  const socialOk = social.followers > 0 || social.brandMentions.length > 0;
  const reviewsOk = reviews.yelpRating !== null || reviews.tripadvisorRating !== null;

  return [
    {
      data: google,
      provenance: {
        source: 'google_reviews',
        provider: ENRICHMENT_PROXY_URL ? 'proxy/google' : 'unconfigured',
        fetched_at: fetchedAt,
        endpoint: ENRICHMENT_PROXY_URL ? `${ENRICHMENT_PROXY_URL}/google-reviews` : null,
        confidence: googleOk ? 'medium' : 'low',
        status: googleOk ? 'ok' : 'missing',
      },
    },
    {
      data: website,
      provenance: {
        source: 'website',
        provider: ENRICHMENT_PROXY_URL ? 'proxy/website' : 'unconfigured',
        fetched_at: fetchedAt,
        endpoint: ENRICHMENT_PROXY_URL ? `${ENRICHMENT_PROXY_URL}/website-analysis` : null,
        confidence: websiteOk ? 'medium' : 'low',
        status: websiteOk ? 'ok' : 'missing',
      },
    },
    {
      data: social,
      provenance: {
        source: 'social',
        provider: ENRICHMENT_PROXY_URL ? 'proxy/social' : 'unconfigured',
        fetched_at: fetchedAt,
        endpoint: ENRICHMENT_PROXY_URL ? `${ENRICHMENT_PROXY_URL}/social-presence` : null,
        confidence: socialOk ? 'medium' : 'low',
        status: socialOk ? 'ok' : 'missing',
      },
    },
    {
      data: reviews,
      provenance: {
        source: 'yelp',
        provider: ENRICHMENT_PROXY_URL ? 'proxy/reviews' : 'unconfigured',
        fetched_at: fetchedAt,
        endpoint: ENRICHMENT_PROXY_URL ? `${ENRICHMENT_PROXY_URL}/review-platforms` : null,
        confidence: reviewsOk ? 'medium' : 'low',
        status: reviewsOk ? 'ok' : 'missing',
      },
    },
  ];
}

export async function buildEnrichmentProfile(
  operatorId: string
): Promise<OperatorEnrichment> {
  const context = await resolveBusinessContext(operatorId);

  if (!context) {
    return degradedProfile('business_context_missing');
  }

  const [google, website, social, reviewPlatforms] = await collectProviderData(context);
  const regionalThemes = await fetchRegionalThemes(context.city, context.state);

  const okSources = [google, website, social, reviewPlatforms].filter(
    (entry) => entry.provenance.status === 'ok'
  ).length;

  const reviewThemes = unique([
    ...google.data.themes,
    ...reviewPlatforms.data.recentThemes,
    ...regionalThemes,
  ]).slice(0, 10);

  const socialBrandMentions = unique([
    ...social.data.brandMentions,
    ...website.data.mentionsBrands,
  ]);

  const digitalScoreParts = [
    website.data.digitalScore,
    social.data.active ? 70 : 35,
    context.website_url ? 75 : 20,
    context.instagram_handle ? 70 : 25,
  ];

  const digitalPresenceScore = Math.round(
    digitalScoreParts.reduce((total, value) => total + value, 0) / digitalScoreParts.length
  );

  return {
    google_rating: google.data.rating > 0 ? google.data.rating : null,
    google_review_count: google.data.reviewCount > 0 ? google.data.reviewCount : null,
    review_themes: reviewThemes,
    review_concerns: [],
    social_active: social.data.active,
    social_brand_mentions: socialBrandMentions,
    website_url: context.website_url,
    website_mentions_brands: website.data.mentionsBrands,
    has_online_booking: website.data.hasBooking,
    service_menu_themes: website.data.treatments,
    digital_presence_score: digitalPresenceScore,
    yelp_rating: reviewPlatforms.data.yelpRating,
    tripadvisor_rating: reviewPlatforms.data.tripadvisorRating,
    enrichment_date: nowIso(),
    enrichment_confidence: classifyConfidence(okSources),
    provenance: [
      google.provenance,
      website.provenance,
      social.provenance,
      reviewPlatforms.provenance,
    ],
  };
}

interface EnrichmentScheduleOptions {
  operatorIds: string[];
  intervalMs?: number;
  onProfile?: (operatorId: string, profile: OperatorEnrichment) => void;
}

export function scheduleEnrichment(options?: EnrichmentScheduleOptions): void {
  if (enrichmentScheduleTimer) {
    clearInterval(enrichmentScheduleTimer);
    enrichmentScheduleTimer = null;
  }

  if (!options || options.operatorIds.length === 0) {
    return;
  }

  const intervalMs = Math.max(options.intervalMs ?? 6 * 60 * 60 * 1000, 60 * 1000);

  const run = async () => {
    for (const operatorId of options.operatorIds) {
      try {
        const profile = await buildEnrichmentProfile(operatorId);
        options.onProfile?.(operatorId, profile);
      } catch (error) {
        console.error('[enrichment] scheduled run failed', { operatorId, error });
      }
    }
  };

  void run();
  enrichmentScheduleTimer = setInterval(() => {
    void run();
  }, intervalMs);
}

export function stopEnrichmentSchedule(): void {
  if (!enrichmentScheduleTimer) return;
  clearInterval(enrichmentScheduleTimer);
  enrichmentScheduleTimer = null;
}
