// ── External Enrichment Pipeline — Service Stubs ──────────────────
// WO-16: Stubbed enrichment functions that return mock data
// DEFERRAL: No actual API calls — all external data is mocked

import type {
  OperatorEnrichment,
  GoogleReviewData,
  WebsiteAnalysis,
  SocialPresence,
  ReviewPlatformData,
} from './types';
import { getOperatorEnrichment } from './mockEnrichment';

// ── Google Reviews Scraper (Stubbed) ───────────────────────────────

/**
 * Scrape Google Business Profile for rating, review count, and themes.
 * STUB: Returns mock data. V2 will use Google Places API or scraping proxy.
 */
export async function scrapeGoogleReviews(
  businessName: string,
  city: string
): Promise<GoogleReviewData> {
  console.log(
    `[Enrichment] scrapeGoogleReviews called for "${businessName}" in ${city} — returning mock data`
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    rating: 4.6,
    reviewCount: 187,
    themes: [
      'relaxing facials',
      'clean skincare',
      'knowledgeable estheticians',
      'calming atmosphere',
    ],
  };
}

// ── Website Scraper (Stubbed) ──────────────────────────────────────

/**
 * Analyze operator website for brand mentions, treatments, booking, and digital score.
 * STUB: Returns mock data. V2 will use headless browser or scraping service.
 */
export async function scrapeWebsite(url: string): Promise<WebsiteAnalysis> {
  console.log(
    `[Enrichment] scrapeWebsite called for "${url}" — returning mock data`
  );

  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    mentionsBrands: ['SkinCeuticals', 'Hydrafacial', 'Dermalogica'],
    treatments: [
      'HydraFacial',
      'chemical peels',
      'microneedling',
      'LED therapy',
    ],
    hasBooking: true,
    hasRetailPage: false,
    digitalScore: 72,
  };
}

// ── Social Presence Checker (Stubbed) ──────────────────────────────

/**
 * Check social media presence for activity level, followers, and brand mentions.
 * STUB: Returns mock data. V2 will use social API integrations.
 */
export async function checkSocialPresence(
  handle: string
): Promise<SocialPresence> {
  console.log(
    `[Enrichment] checkSocialPresence called for "@${handle}" — returning mock data`
  );

  await new Promise((resolve) => setTimeout(resolve, 150));

  return {
    active: true,
    followers: 3_450,
    postFrequency: 3.2,
    brandMentions: ['SkinCeuticals', 'Eminence Organic'],
  };
}

// ── Review Platforms Scraper (Stubbed) ──────────────────────────────

/**
 * Scrape Yelp and TripAdvisor for ratings and recent review themes.
 * STUB: Returns mock data. V2 will use Yelp Fusion API + TripAdvisor scraping.
 */
export async function scrapeReviewPlatforms(
  businessName: string
): Promise<ReviewPlatformData> {
  console.log(
    `[Enrichment] scrapeReviewPlatforms called for "${businessName}" — returning mock data`
  );

  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    yelpRating: 4.5,
    tripadvisorRating: null,
    recentThemes: [
      'professional service',
      'clean facility',
      'great results',
    ],
  };
}

// ── Full Enrichment Profile Builder (Stubbed) ──────────────────────

/**
 * Build a complete enrichment profile for an operator by aggregating all sources.
 * STUB: Returns mock enrichment data from mockEnrichment.ts.
 * V2: Will orchestrate all scraper calls and merge into unified profile.
 */
export async function buildEnrichmentProfile(
  operatorId: string
): Promise<OperatorEnrichment> {
  console.log(
    `[Enrichment] buildEnrichmentProfile called for operator "${operatorId}" — returning mock profile`
  );
  console.log(
    `[Enrichment] In production, this will call: scrapeGoogleReviews, scrapeWebsite, checkSocialPresence, scrapeReviewPlatforms`
  );

  await new Promise((resolve) => setTimeout(resolve, 100));

  return getOperatorEnrichment(operatorId);
}

// ── Enrichment Scheduler (Stubbed) ─────────────────────────────────

/**
 * Configure the enrichment refresh cycle.
 * STUB: Logs intent only. V2: Supabase cron job or Edge Function scheduler.
 */
export function scheduleEnrichment(): void {
  console.log('[Enrichment] Enrichment scheduler configured for 7-day cycle');
  console.log('[Enrichment] Schedule: Google Reviews (daily), Website (weekly), Social (weekly), Review Platforms (weekly)');
  console.log('[Enrichment] Priority queue: high-value operators enriched first');
}
