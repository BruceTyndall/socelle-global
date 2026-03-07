// ── funnelEvents — W15-08 ────────────────────────────────────────────
// Intelligence + Editorial funnel event tracking.
// 8 events covering the signal/story lifecycle. No PII.
//
// Provider-agnostic: logs to console in dev, dispatches CustomEvents
// for any analytics provider (GA4, Segment, PostHog) to consume.
// Wire a listener in your provider init:
//   window.addEventListener('socelle:funnel', (e) => provider.track(e.detail))
//
// Data label: LIVE — events fire on real user interactions

// ── Event Definitions ────────────────────────────────────────────────

export type FunnelEventName =
  | 'feed_activated'       // Feed run completes, signals ingested
  | 'signal_created'       // New signal written to market_signals
  | 'signal_viewed'        // User views Intelligence page (signal list loaded)
  | 'signal_searched'      // User filters/searches signals
  | 'signal_clicked'       // User clicks through to signal source or detail
  | 'signal_saved'         // User bookmarks/saves a signal (future)
  | 'story_viewed'         // User views a story detail page
  | 'story_clicked';       // User clicks a story from listings

export interface FunnelEventPayload {
  event: FunnelEventName;
  /** ISO timestamp — auto-filled if omitted */
  timestamp?: string;
  /** Non-PII properties */
  properties?: Record<string, string | number | boolean | null>;
}

// ── Tracking Function ────────────────────────────────────────────────

const IS_DEV = import.meta.env.DEV;

/**
 * Track a funnel event. No PII allowed in properties.
 *
 * In development: logs to console.
 * In all environments: dispatches a CustomEvent on window for
 * analytics providers to consume.
 *
 * @example
 * trackFunnelEvent('signal_viewed', { signal_count: 42, category: 'industry_news' });
 * trackFunnelEvent('story_clicked', { story_id: 'abc-123', category: 'Brand Watch' });
 */
export function trackFunnelEvent(
  event: FunnelEventName,
  properties?: Record<string, string | number | boolean | null>,
): void {
  const payload: FunnelEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    properties: properties ?? {},
  };

  // Dev console logging
  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Socelle Funnel] ${event}`, payload.properties);
  }

  // Dispatch CustomEvent for provider integration
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('socelle:funnel', { detail: payload }),
    );
  }
}

// ── Convenience Helpers ──────────────────────────────────────────────

/** Track Intelligence page load with signal count */
export function trackSignalViewed(signalCount: number, category?: string): void {
  trackFunnelEvent('signal_viewed', {
    signal_count: signalCount,
    ...(category ? { category } : {}),
  });
}

/** Track signal filter/search action */
export function trackSignalSearched(query: string, resultCount: number): void {
  trackFunnelEvent('signal_searched', {
    query_length: query.length,  // length only, not content (no PII)
    result_count: resultCount,
  });
}

/** Track signal click-through */
export function trackSignalClicked(signalId: string, signalType: string): void {
  trackFunnelEvent('signal_clicked', {
    signal_id: signalId,
    signal_type: signalType,
  });
}

/** Track signal save/bookmark */
export function trackSignalSaved(signalId: string): void {
  trackFunnelEvent('signal_saved', { signal_id: signalId });
}

/** Track story card click from listing */
export function trackStoryClicked(storyId: string, category: string | null): void {
  trackFunnelEvent('story_clicked', {
    story_id: storyId,
    category: category ?? 'uncategorized',
  });
}

/** Track story detail page view */
export function trackStoryViewed(storyId: string, slug: string, category: string | null): void {
  trackFunnelEvent('story_viewed', {
    story_id: storyId,
    slug,
    category: category ?? 'uncategorized',
  });
}
