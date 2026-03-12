// ── funnelEvents — W15-08 + WO-TAXONOMY-03 ────────────────────────
// Intelligence + Editorial funnel event tracking.
// Provider-agnostic: logs to console in dev, dispatches CustomEvents,
// and now persists non-PII event rows into public.platform_events.

import { supabase, isSupabaseConfigured } from '../supabase';
import type { IntelligenceSignal } from '../intelligence/types';
import {
  applyUserTagPreferenceDelta,
  PREFERENCE_EVENT_WEIGHTS,
  type PreferenceEventName,
} from '../intelligence/personalization';
import { applyAnonymousPreferenceDelta } from '../intelligence/anonymousSignalMemory';
import {
  buildSignalAnalyticsProperties,
  type SignalAnalyticsProperties,
  type SignalAnalyticsValue,
} from '../intelligence/signalAnalytics';

export type FunnelEventName =
  | 'feed_activated'
  | 'signal_created'
  | 'signal_viewed'
  | 'signal_searched'
  | 'signal_clicked'
  | 'signal_saved'
  | 'signal_liked'
  | 'signal_hidden'
  | 'story_viewed'
  | 'story_clicked';

export type FunnelEventProperties = Record<string, SignalAnalyticsValue>;

export interface FunnelEventPayload {
  event: FunnelEventName;
  timestamp?: string;
  properties?: FunnelEventProperties;
}

interface SignalInteractionOptions {
  surface?: string | null;
  target?: string | null;
  orgId?: string | null;
}

const IS_DEV = import.meta.env.DEV;
const SESSION_STORAGE_KEY = 'socelle.analytics.session_id';

const EVENT_CATEGORY: Record<FunnelEventName, string> = {
  feed_activated: 'system',
  signal_created: 'system',
  signal_viewed: 'engagement',
  signal_searched: 'engagement',
  signal_clicked: 'engagement',
  signal_saved: 'conversion',
  signal_liked: 'conversion',
  signal_hidden: 'engagement',
  story_viewed: 'engagement',
  story_clicked: 'engagement',
};

function isPreferenceEvent(event: FunnelEventName): event is PreferenceEventName {
  return (
    event === 'signal_viewed' ||
    event === 'signal_clicked' ||
    event === 'signal_saved' ||
    event === 'signal_liked' ||
    event === 'signal_hidden'
  );
}

function getOrCreateSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function normalizeProperties(properties?: FunnelEventProperties): FunnelEventProperties {
  const normalized: FunnelEventProperties = {};

  for (const [key, value] of Object.entries(properties ?? {})) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      const compact = value.filter((entry) => entry !== undefined && entry !== null && entry !== '');
      if (compact.length > 0) {
        normalized[key] = compact as SignalAnalyticsValue;
      }
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

async function persistFunnelEvent(
  event: FunnelEventName,
  properties?: FunnelEventProperties,
): Promise<void> {
  if (!isSupabaseConfigured || typeof window === 'undefined') return;

  const sessionId = getOrCreateSessionId();
  const normalized = normalizeProperties(properties);
  const orgId = typeof normalized.org_id === 'string' ? normalized.org_id : null;

  if ('org_id' in normalized) {
    delete normalized.org_id;
  }

  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id ?? null;

    const { error } = await supabase
      .from('platform_events')
      .insert({
        session_id: sessionId,
        user_id: userId,
        org_id: orgId,
        event_type: event,
        event_category: EVENT_CATEGORY[event],
        properties: normalized,
        page_path: `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });

    if (error && IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[Socelle Funnel] persist failed for ${event}`, error.message);
      return;
    }

    const tagCodes = Array.isArray(normalized.tag_codes)
      ? normalized.tag_codes.filter((value): value is string => typeof value === 'string')
      : [];

    if (tagCodes.length > 0 && isPreferenceEvent(event)) {
      if (userId) {
        try {
          await applyUserTagPreferenceDelta({
            userId,
            tagCodes,
            delta: PREFERENCE_EVENT_WEIGHTS[event],
            source: 'behavior',
            eventAt: payloadTimestamp(normalized),
          });
        } catch (preferenceError) {
          if (IS_DEV) {
            // eslint-disable-next-line no-console
            console.warn(`[Socelle Funnel] preference sync failed for ${event}`, preferenceError);
          }
        }
      } else {
        applyAnonymousPreferenceDelta(tagCodes, PREFERENCE_EVENT_WEIGHTS[event]);
      }
    }
  } catch (error) {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[Socelle Funnel] persist exception for ${event}`, error);
    }
  }
}

function payloadTimestamp(properties: FunnelEventProperties): string {
  const value = properties.event_at;
  return typeof value === 'string' ? value : new Date().toISOString();
}

export function trackFunnelEvent(
  event: FunnelEventName,
  properties?: FunnelEventProperties,
): void {
  const payload: FunnelEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    properties: normalizeProperties(properties),
  };

  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Socelle Funnel] ${event}`, payload.properties);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('socelle:funnel', { detail: payload }),
    );
  }

  void persistFunnelEvent(event, payload.properties);
}

export function trackSignalViewed(signalCount: number, category?: string): void {
  trackFunnelEvent('signal_viewed', {
    signal_count: signalCount,
    ...(category ? { category } : {}),
  });
}

export function trackSignalSearched(query: string, resultCount: number): void {
  trackFunnelEvent('signal_searched', {
    query_length: query.length,
    result_count: resultCount,
  });
}

export function trackSignalClicked(
  signal: IntelligenceSignal,
  options?: SignalInteractionOptions,
): void {
  trackFunnelEvent('signal_clicked', buildSignalAnalyticsProperties(signal, {
    surface: options?.surface ?? null,
    target: options?.target ?? null,
    org_id: options?.orgId ?? null,
  }));
}

export function trackSignalDetailViewed(
  signal: IntelligenceSignal,
  options?: Omit<SignalInteractionOptions, 'target'>,
): void {
  trackFunnelEvent('signal_viewed', buildSignalAnalyticsProperties(signal, {
    surface: options?.surface ?? 'signal_detail',
    org_id: options?.orgId ?? null,
  }));
}

export function trackSignalSaved(
  signalOrId: IntelligenceSignal | string,
  options?: Omit<SignalInteractionOptions, 'target'>,
): void {
  if (typeof signalOrId === 'string') {
    trackFunnelEvent('signal_saved', {
      signal_id: signalOrId,
      org_id: options?.orgId ?? null,
    });
    return;
  }

  trackFunnelEvent('signal_saved', buildSignalAnalyticsProperties(signalOrId, {
    surface: options?.surface ?? null,
    org_id: options?.orgId ?? null,
  }));
}

export function trackSignalLiked(
  signal: IntelligenceSignal,
  options?: Omit<SignalInteractionOptions, 'target'>,
): void {
  trackFunnelEvent('signal_liked', buildSignalAnalyticsProperties(signal, {
    surface: options?.surface ?? null,
    org_id: options?.orgId ?? null,
  }));
}

export function trackStoryClicked(storyId: string, category: string | null): void {
  trackFunnelEvent('story_clicked', {
    story_id: storyId,
    category: category ?? 'uncategorized',
  });
}

export function trackStoryViewed(storyId: string, slug: string, category: string | null): void {
  trackFunnelEvent('story_viewed', {
    story_id: storyId,
    slug,
    category: category ?? 'uncategorized',
  });
}
