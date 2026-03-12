import type { IntelligenceSignal } from './types';

export type SignalAnalyticsValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[];

export type SignalAnalyticsProperties = Record<string, SignalAnalyticsValue>;

function dedupeOrdered(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    if (!value) continue;
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
  }

  return output;
}

export function getSignalAnalyticsTagCodes(signal: IntelligenceSignal): string[] {
  return dedupeOrdered([
    signal.primary_environment,
    signal.primary_vertical,
    ...(signal.service_tags ?? []),
    ...(signal.product_tags ?? []),
    ...(signal.claim_tags ?? []),
    ...(signal.region_tags ?? []),
    ...(signal.trend_tags ?? []),
    ...(signal.topic_tags ?? []),
  ]);
}

export function getPrimaryServiceTag(signal: IntelligenceSignal): string | null {
  return signal.service_tags?.[0] ?? null;
}

export function buildSignalAnalyticsProperties(
  signal: IntelligenceSignal,
  extras?: SignalAnalyticsProperties,
): SignalAnalyticsProperties {
  const tagCodes = getSignalAnalyticsTagCodes(signal);

  return {
    signal_id: signal.id,
    signal_type: signal.signal_type,
    primary_environment: signal.primary_environment ?? null,
    primary_vertical: signal.primary_vertical ?? signal.vertical ?? null,
    primary_service_tag: getPrimaryServiceTag(signal),
    tag_codes: tagCodes,
    tag_count: tagCodes.length,
    tier_min: signal.tier_min ?? null,
    source_name: signal.source_name ?? signal.source ?? null,
    region_tag: signal.region_tags?.[0] ?? signal.region ?? null,
    sentiment: signal.sentiment ?? null,
    score_importance: signal.score_importance ?? signal.impact_score ?? null,
    is_paid_signal: signal.tier_min === 'paid',
    ...extras,
  };
}
