// ── useSignalImage — signal → image mapping ──────────────────────────
// INTEL-UI-REMEDIATION-01: Deterministic ID-hash pool selection breaks
// repeated SVGs per signal_type. Each type maps to a pool of 2-3 images;
// the pool index is derived from a hash of signal.id so the same signal
// always gets the same image (stable), but different signals of the same
// type get different images (variety).
//
// Phase 2 (IMAGE-INTEL-01): upgrade to query `images` table using
//   signal.image_url (direct) or fallback to images.vertical + domain lookup.

import type { IntelligenceSignal, SignalType } from './types';

export interface SignalImage {
  url: string;
  alt: string;
}

// ── Deterministic hash: sum of charCodes → stable positive integer ────
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickFromPool(pool: readonly SignalImage[], id: string): SignalImage {
  return pool[hashId(id) % pool.length];
}

// ── Per signal_type image pools (2–3 images each) ────────────────────
// Images: /images/brand/photos/1.svg through 23.svg
const TYPE_POOL: Partial<Record<SignalType, readonly SignalImage[]>> = {
  regulatory_alert: [
    { url: '/images/brand/photos/11.svg', alt: 'Regulatory update' },
    { url: '/images/brand/photos/12.svg', alt: 'Regulatory update' },
    { url: '/images/brand/photos/14.svg', alt: 'Regulatory update' },
  ],
  ingredient_momentum: [
    { url: '/images/brand/photos/13.svg', alt: 'Ingredient science' },
    { url: '/images/brand/photos/15.svg', alt: 'Ingredient science' },
    { url: '/images/brand/photos/16.svg', alt: 'Ingredient science' },
  ],
  ingredient_trend: [
    { url: '/images/brand/photos/13.svg', alt: 'Ingredient science' },
    { url: '/images/brand/photos/16.svg', alt: 'Ingredient science' },
    { url: '/images/brand/photos/18.svg', alt: 'Ingredient science' },
  ],
  research_insight: [
    { url: '/images/brand/photos/15.svg', alt: 'Research insight' },
    { url: '/images/brand/photos/19.svg', alt: 'Research insight' },
    { url: '/images/brand/photos/20.svg', alt: 'Research insight' },
  ],
  pricing_benchmark: [
    { url: '/images/brand/photos/17.svg', alt: 'Pricing intelligence' },
    { url: '/images/brand/photos/21.svg', alt: 'Pricing intelligence' },
  ],
  treatment_trend: [
    { url: '/images/brand/photos/3.svg', alt: 'Treatment trend' },
    { url: '/images/brand/photos/4.svg', alt: 'Treatment trend' },
    { url: '/images/brand/photos/5.svg', alt: 'Treatment trend' },
  ],
  product_velocity: [
    { url: '/images/brand/photos/7.svg', alt: 'Product velocity' },
    { url: '/images/brand/photos/8.svg', alt: 'Product velocity' },
    { url: '/images/brand/photos/9.svg', alt: 'Product velocity' },
  ],
  brand_adoption: [
    { url: '/images/brand/photos/9.svg',  alt: 'Brand adoption' },
    { url: '/images/brand/photos/10.svg', alt: 'Brand adoption' },
    { url: '/images/brand/photos/22.svg', alt: 'Brand adoption' },
  ],
  industry_news: [
    { url: '/images/brand/photos/1.svg', alt: 'Industry news' },
    { url: '/images/brand/photos/2.svg', alt: 'Industry news' },
    { url: '/images/brand/photos/6.svg', alt: 'Industry news' },
  ],
  market_data: [
    { url: '/images/brand/photos/2.svg',  alt: 'Market data' },
    { url: '/images/brand/photos/6.svg',  alt: 'Market data' },
    { url: '/images/brand/photos/23.svg', alt: 'Market data' },
  ],
  press_release: [
    { url: '/images/brand/photos/1.svg', alt: 'Press release' },
    { url: '/images/brand/photos/6.svg', alt: 'Press release' },
    { url: '/images/brand/photos/22.svg', alt: 'Press release' },
  ],
  brand_update: [
    { url: '/images/brand/photos/9.svg',  alt: 'Brand update' },
    { url: '/images/brand/photos/10.svg', alt: 'Brand update' },
  ],
  social_trend: [
    { url: '/images/brand/photos/2.svg', alt: 'Social trend' },
    { url: '/images/brand/photos/6.svg', alt: 'Social trend' },
    { url: '/images/brand/photos/23.svg', alt: 'Social trend' },
  ],
  regional: [
    { url: '/images/brand/photos/1.svg', alt: 'Regional signal' },
    { url: '/images/brand/photos/5.svg', alt: 'Regional signal' },
  ],
  regional_market: [
    { url: '/images/brand/photos/1.svg', alt: 'Regional market' },
    { url: '/images/brand/photos/5.svg', alt: 'Regional market' },
    { url: '/images/brand/photos/23.svg', alt: 'Regional market' },
  ],
};

// ── Per vertical fallback pools ───────────────────────────────────────
const VERTICAL_POOL: Record<string, readonly SignalImage[]> = {
  medspa:       [
    { url: '/images/brand/photos/3.svg', alt: 'Medspa intelligence' },
    { url: '/images/brand/photos/4.svg', alt: 'Medspa intelligence' },
  ],
  salon:        [
    { url: '/images/brand/photos/5.svg', alt: 'Salon intelligence' },
    { url: '/images/brand/photos/8.svg', alt: 'Salon intelligence' },
  ],
  beauty_brand: [
    { url: '/images/brand/photos/7.svg',  alt: 'Beauty brand intelligence' },
    { url: '/images/brand/photos/10.svg', alt: 'Beauty brand intelligence' },
  ],
  multi:        [
    { url: '/images/brand/photos/9.svg',  alt: 'Market intelligence' },
    { url: '/images/brand/photos/11.svg', alt: 'Market intelligence' },
  ],
};

const DEFAULT_POOL: readonly SignalImage[] = [
  { url: '/images/brand/photos/1.svg',  alt: 'Market signal' },
  { url: '/images/brand/photos/2.svg',  alt: 'Market signal' },
  { url: '/images/brand/photos/6.svg',  alt: 'Market signal' },
  { url: '/images/brand/photos/20.svg', alt: 'Market signal' },
];

/**
 * Pure function — no hooks.
 * Returns the best available image for a signal, with deterministic pool
 * variation so signals of the same type show different images.
 *
 * Priority: signal.image_url → type pool (hashed) → vertical pool (hashed) → default pool (hashed).
 */
export function getSignalImage(signal: IntelligenceSignal): SignalImage {
  // Direct image_url from DB (set when IMAGE-INTEL-01 wires image_id)
  if (signal.image_url) {
    return { url: signal.image_url, alt: signal.title };
  }
  // signal_type pool — deterministic by signal ID
  const typePool = TYPE_POOL[signal.signal_type];
  if (typePool) return pickFromPool(typePool, signal.id);
  // vertical fallback pool
  const vertPool = signal.vertical ? VERTICAL_POOL[signal.vertical] : undefined;
  if (vertPool) return pickFromPool(vertPool, signal.id);
  // default pool
  return pickFromPool(DEFAULT_POOL, signal.id);
}

/**
 * Hook wrapper — synchronous (no async/DB yet).
 * Returns SignalImage | null (null only if signal is undefined).
 */
export function useSignalImage(signal: IntelligenceSignal | null | undefined): SignalImage | null {
  if (!signal) return null;
  return getSignalImage(signal);
}
