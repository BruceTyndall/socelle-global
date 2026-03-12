import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../supabase';
import { buildPreferenceScoreMap } from './personalization';
import { getSignalAnalyticsTagCodes } from './signalAnalytics';
import { useAnonymousTagPreferences } from './useAnonymousSignalMemory';
import { useUserTagPreferences } from './useUserTagPreferences';
import type {
  IntelligenceChannel,
  IntelligenceChannelAudience,
  IntelligenceChannelTag,
  IntelligenceSignal,
  SignalType,
} from './types';

interface UseIntelligenceChannelsOptions {
  audience?: IntelligenceChannelAudience;
  viewerTier?: 'free' | 'paid';
  includeLocked?: boolean;
  limit?: number;
  signals?: IntelligenceSignal[];
}

interface ChannelPerformanceRow {
  channel_id: string;
  slug: string;
  name: string;
  eyebrow: string | null;
  summary: string;
  audience: IntelligenceChannelAudience;
  tier_min: 'free' | 'paid';
  icon_key: string;
  accent_token: string;
  region_scope: string[] | null;
  vertical_scope: string[] | null;
  signal_type_scope: string[] | null;
  sort_order: number;
  configured_tag_count: number | string | null;
  required_tag_count: number | string | null;
  weighted_signal_count: number | string | null;
  weighted_engagement_score: number | string | null;
  weighted_unique_actor_count: number | string | null;
  last_published_at: string | null;
  last_event_at: string | null;
}

interface ChannelTagMetricRow {
  channel_id: string;
  tag_code: string;
  display_label: string;
  category_group: string;
  weight: number | string | null;
  required: boolean | null;
  signal_count: number | string | null;
  engagement_per_signal: number | string | null;
  unique_actor_count: number | string | null;
  tag_rank: number | null;
}

interface ChannelTagMapRow {
  channel_id: string;
  tag_code: string;
  weight: number | string | null;
  required: boolean | null;
}

function isRecoverableChannelError(error: { code?: string; message?: string } | null | undefined): boolean {
  const message = (error?.message ?? '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === '42703' ||
    error?.code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('not found') ||
    message.includes('intelligence_channel')
  );
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function matchesAudience(
  audience: IntelligenceChannelAudience,
  requestedAudience: IntelligenceChannelAudience,
): boolean {
  if (requestedAudience === 'all') return true;
  return audience === 'all' || audience === requestedAudience;
}

function getSignalScopeTokens(signal: IntelligenceSignal): string[] {
  return [
    signal.vertical,
    signal.primary_environment,
    signal.primary_vertical,
    signal.geo_source,
    signal.region,
    ...(signal.region_tags ?? []),
  ].filter((value): value is string => Boolean(value));
}

function scoreSignalForChannel(
  signal: IntelligenceSignal,
  channel: ChannelPerformanceRow,
  mappings: ChannelTagMapRow[],
): number {
  const signalTagCodes = new Set(getSignalAnalyticsTagCodes(signal));
  const scopeTokens = getSignalScopeTokens(signal);

  let tagScore = 0;
  let matchedTags = 0;
  let requiredCount = 0;
  let requiredMatches = 0;

  for (const mapping of mappings) {
    const weight = toNumber(mapping.weight);
    const isRequired = Boolean(mapping.required);
    if (isRequired) requiredCount += 1;

    if (signalTagCodes.has(mapping.tag_code)) {
      tagScore += weight * 14;
      matchedTags += 1;
      if (isRequired) requiredMatches += 1;
    }
  }

  const signalTypeScope = (channel.signal_type_scope ?? []) as SignalType[];
  const verticalScope = channel.vertical_scope ?? [];
  const regionScope = channel.region_scope ?? [];

  const signalTypeScore = signalTypeScope.includes(signal.signal_type) ? 10 : 0;
  const verticalScore = verticalScope.some((token) => scopeTokens.includes(token)) ? 8 : 0;
  const regionScore = regionScope.some((token) => scopeTokens.includes(token)) ? 5 : 0;

  if (matchedTags === 0 && signalTypeScore === 0 && verticalScore === 0 && regionScore === 0) {
    return 0;
  }

  const importance = (signal.score_importance ?? signal.impact_score ?? 0) * 0.45;
  const enrichmentScore = signal.is_enriched ? 4 : 0;
  const mediaScore = signal.hero_image_url || signal.image_url ? 2 : 0;
  const requiredPenalty = requiredCount > 0 && requiredMatches === 0 ? 6 : 0;

  return tagScore + signalTypeScore + verticalScore + regionScore + importance + enrichmentScore + mediaScore - requiredPenalty;
}

export function useIntelligenceChannels(options?: UseIntelligenceChannelsOptions) {
  const requestedAudience = options?.audience ?? 'all';
  const viewerTier = options?.viewerTier ?? 'free';
  const includeLocked = options?.includeLocked ?? false;
  const limit = options?.limit ?? 6;
  const inputSignals = options?.signals ?? [];

  const { data: userTagPreferences = [] } = useUserTagPreferences();
  const anonymousTagPreferences = useAnonymousTagPreferences();

  const preferenceScoreMap = useMemo(
    () =>
      buildPreferenceScoreMap([
        ...anonymousTagPreferences,
        ...userTagPreferences,
      ]),
    [anonymousTagPreferences, userTagPreferences],
  );

  const { data: channelRows = [], isLoading: channelLoading } = useQuery({
    queryKey: ['intelligence_channel_performance', requestedAudience, viewerTier, includeLocked],
    queryFn: async (): Promise<ChannelPerformanceRow[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from('v_intelligence_channel_performance_30d' as any)
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });

      if (error) {
        if (isRecoverableChannelError(error)) return [];
        throw error;
      }

      return ((data ?? []) as ChannelPerformanceRow[])
        .filter((row) => matchesAudience(row.audience, requestedAudience))
        .filter((row) => includeLocked || viewerTier !== 'free' || row.tier_min === 'free');
    },
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  });

  const channelIds = useMemo(() => channelRows.map((row) => row.channel_id), [channelRows]);

  const { data: channelTagMetrics = [], isLoading: tagMetricLoading } = useQuery({
    queryKey: ['intelligence_channel_top_tags', channelIds],
    queryFn: async (): Promise<ChannelTagMetricRow[]> => {
      if (!isSupabaseConfigured || channelIds.length === 0) return [];

      const { data, error } = await supabase
        .from('v_intelligence_channel_top_tags_30d' as any)
        .select('channel_id, tag_code, display_label, category_group, weight, required, signal_count, engagement_per_signal, unique_actor_count, tag_rank')
        .in('channel_id', channelIds)
        .lte('tag_rank', 4)
        .order('tag_rank', { ascending: true });

      if (error) {
        if (isRecoverableChannelError(error)) return [];
        throw error;
      }

      return (data ?? []) as ChannelTagMetricRow[];
    },
    enabled: isSupabaseConfigured && channelIds.length > 0,
    staleTime: 60_000,
  });

  const { data: channelTagMap = [], isLoading: tagMapLoading } = useQuery({
    queryKey: ['intelligence_channel_tags', channelIds],
    queryFn: async (): Promise<ChannelTagMapRow[]> => {
      if (!isSupabaseConfigured || channelIds.length === 0) return [];

      const { data, error } = await supabase
        .from('intelligence_channel_tags' as any)
        .select('channel_id, tag_code, weight, required')
        .in('channel_id', channelIds);

      if (error) {
        if (isRecoverableChannelError(error)) return [];
        throw error;
      }

      return (data ?? []) as ChannelTagMapRow[];
    },
    enabled: isSupabaseConfigured && channelIds.length > 0,
    staleTime: 60_000,
  });

  const channels = useMemo<IntelligenceChannel[]>(() => {
    if (channelRows.length === 0) return [];

    const metricsByChannel = new Map<string, IntelligenceChannelTag[]>();
    for (const row of channelTagMetrics) {
      const existing = metricsByChannel.get(row.channel_id) ?? [];
      existing.push({
        tag_code: row.tag_code,
        display_label: row.display_label,
        category_group: row.category_group,
        weight: toNumber(row.weight),
        required: Boolean(row.required),
        signal_count: toNumber(row.signal_count),
        engagement_per_signal: toNumber(row.engagement_per_signal),
        unique_actor_count: toNumber(row.unique_actor_count),
        tag_rank: row.tag_rank ?? existing.length + 1,
      });
      metricsByChannel.set(row.channel_id, existing);
    }

    const mappingsByChannel = new Map<string, ChannelTagMapRow[]>();
    for (const row of channelTagMap) {
      const existing = mappingsByChannel.get(row.channel_id) ?? [];
      existing.push(row);
      mappingsByChannel.set(row.channel_id, existing);
    }

    return channelRows
      .map((row) => {
        const mappings = mappingsByChannel.get(row.channel_id) ?? [];
        const topSignals = inputSignals
          .map((signal) => ({
            signal,
            score: scoreSignalForChannel(signal, row, mappings),
          }))
          .filter((entry) => entry.score > 8)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((entry) => entry.signal);

        const personalizationScore = mappings.reduce((total, mapping) => {
          const preference = preferenceScoreMap.get(mapping.tag_code) ?? 0;
          if (preference <= 0) return total;
          return total + preference * toNumber(mapping.weight);
        }, 0);

        const rankScore =
          toNumber(row.weighted_engagement_score) * 8 +
          toNumber(row.weighted_signal_count) +
          Math.min(personalizationScore, 120);

        return {
          channel_id: row.channel_id,
          slug: row.slug,
          name: row.name,
          eyebrow: row.eyebrow ?? undefined,
          summary: row.summary,
          audience: row.audience,
          tier_min: row.tier_min,
          icon_key: row.icon_key,
          accent_token: row.accent_token,
          region_scope: row.region_scope ?? [],
          vertical_scope: row.vertical_scope ?? [],
          signal_type_scope: ((row.signal_type_scope ?? []) as string[]).filter(Boolean) as SignalType[],
          sort_order: row.sort_order,
          configured_tag_count: toNumber(row.configured_tag_count),
          required_tag_count: toNumber(row.required_tag_count),
          weighted_signal_count: toNumber(row.weighted_signal_count),
          weighted_engagement_score: toNumber(row.weighted_engagement_score),
          weighted_unique_actor_count: toNumber(row.weighted_unique_actor_count),
          last_published_at: row.last_published_at,
          last_event_at: row.last_event_at,
          top_tags: (metricsByChannel.get(row.channel_id) ?? []).sort((a, b) => a.tag_rank - b.tag_rank),
          top_signals: topSignals,
          personalization_score: personalizationScore,
          rank_score: rankScore,
          is_locked: viewerTier === 'free' && row.tier_min === 'paid',
        } satisfies IntelligenceChannel;
      })
      .sort((a, b) => {
        if (a.is_locked !== b.is_locked) return a.is_locked ? 1 : -1;
        if (b.rank_score !== a.rank_score) return b.rank_score - a.rank_score;
        return a.sort_order - b.sort_order;
      })
      .slice(0, limit);
  }, [channelRows, channelTagMap, channelTagMetrics, inputSignals, limit, preferenceScoreMap, viewerTier]);

  return {
    channels,
    loading: channelLoading || tagMetricLoading || tagMapLoading,
    isLive: channelRows.length > 0,
  };
}
