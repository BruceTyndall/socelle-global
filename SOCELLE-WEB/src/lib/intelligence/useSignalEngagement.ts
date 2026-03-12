import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth';
import { supabase, isSupabaseConfigured } from '../supabase';
import { trackSignalLiked, trackSignalSaved } from '../analytics/funnelEvents';
import type { IntelligenceSignal, TierVisibility } from './types';
import {
  getAnonymousSignalEngagement,
  upsertAnonymousSignalEngagement,
} from './anonymousSignalMemory';
import { useAnonymousSignalEngagement } from './useAnonymousSignalMemory';

interface UserSignalEngagementRow {
  user_id: string;
  signal_id: string;
  is_saved: boolean;
  is_liked: boolean;
  saved_at: string | null;
  liked_at: string | null;
  updated_at?: string | null;
}

interface SignalLibraryRow {
  id: string;
  rss_item_id?: string | null;
  signal_type: string | null;
  signal_key?: string | null;
  title: string | null;
  description?: string | null;
  summary?: string | null;
  magnitude?: number | null;
  direction?: string | null;
  region?: string | null;
  category?: string | null;
  related_brands?: string[] | null;
  related_products?: string[] | null;
  updated_at: string | null;
  source?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  confidence_score?: number | null;
  image_url?: string | null;
  hero_image_url?: string | null;
  content_segment?: string | null;
  reading_time_minutes?: number | null;
  quality_score?: number | null;
  impact_score?: number | null;
  vertical?: string | null;
  topic?: string | null;
  tier_min?: string | null;
  tier_visibility?: string | null;
  published_at?: string | null;
  author?: string | null;
}

export interface SignalLibraryItem {
  signal: IntelligenceSignal;
  isLiked: boolean;
  savedAt: string | null;
  likedAt: string | null;
}

interface UseSignalEngagementOptions {
  surface?: string;
}

function isRecoverableEngagementError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.includes('42P01') ||
    message.includes('42703') ||
    message.includes('PGRST202') ||
    message.toLowerCase().includes('does not exist') ||
    message.toLowerCase().includes('not found')
  );
}

function normalizeDirection(value: string | null | undefined): 'up' | 'down' | 'stable' {
  if (value === 'up' || value === 'down' || value === 'stable') return value;
  return 'stable';
}

function normalizeTier(value: string | null | undefined, tierMin: string | null | undefined): TierVisibility | undefined {
  if (value === 'free' || value === 'pro' || value === 'admin') return value;
  if (tierMin === 'paid') return 'pro';
  if (tierMin === 'free') return 'free';
  return undefined;
}

function mapSignalRowToSignal(row: SignalLibraryRow): IntelligenceSignal {
  return {
    id: row.id,
    rss_item_id: row.rss_item_id ?? undefined,
    signal_type: (row.signal_type ?? 'market_data') as IntelligenceSignal['signal_type'],
    signal_key: row.signal_key ?? row.id,
    title: row.title ?? 'Market signal',
    description: row.summary ?? row.description ?? '',
    magnitude: row.magnitude ?? 0,
    direction: normalizeDirection(row.direction),
    region: row.region ?? undefined,
    category: row.category ?? undefined,
    related_brands: row.related_brands ?? undefined,
    related_products: row.related_products ?? undefined,
    updated_at: row.updated_at ?? new Date().toISOString(),
    source: row.source ?? undefined,
    source_name: row.source_name ?? undefined,
    source_url: row.source_url ?? undefined,
    confidence_score: row.confidence_score ?? undefined,
    tier_visibility: normalizeTier(row.tier_visibility, row.tier_min),
    image_url: row.image_url ?? undefined,
    hero_image_url: row.hero_image_url ?? undefined,
    content_segment: row.content_segment ?? undefined,
    reading_time_minutes: row.reading_time_minutes ?? undefined,
    quality_score: row.quality_score ?? undefined,
    impact_score: row.impact_score ?? undefined,
    vertical: row.vertical ?? undefined,
    topic: row.topic ?? undefined,
    tier_min: row.tier_min ?? undefined,
    published_at: row.published_at ?? undefined,
    author: row.author ?? undefined,
  };
}

async function persistSignalEngagement(input: {
  userId: string;
  signalId: string;
  isSaved: boolean;
  isLiked: boolean;
  savedAt: string | null;
  likedAt: string | null;
}): Promise<void> {
  if (!input.isSaved && !input.isLiked) {
    const { error } = await supabase
      .from('user_signal_engagements' as any)
      .delete()
      .eq('user_id', input.userId)
      .eq('signal_id', input.signalId);

    if (error) throw error;
    return;
  }

  const payload = {
    user_id: input.userId,
    signal_id: input.signalId,
    is_saved: input.isSaved,
    is_liked: input.isLiked,
    saved_at: input.savedAt,
    liked_at: input.likedAt,
  };

  const { error } = await supabase
    .from('user_signal_engagements' as any)
    .upsert(payload, { onConflict: 'user_id,signal_id' });

  if (error) throw error;
}

export function useSignalEngagement(
  signal: IntelligenceSignal | null | undefined,
  options?: UseSignalEngagementOptions,
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const anonymousEngagement = useAnonymousSignalEngagement(signal?.id);

  const { data: storedEngagement } = useQuery({
    queryKey: ['user_signal_engagement', user?.id ?? null, signal?.id ?? null],
    queryFn: async (): Promise<UserSignalEngagementRow | null> => {
      try {
        const { data, error } = await supabase
          .from('user_signal_engagements' as any)
          .select('user_id, signal_id, is_saved, is_liked, saved_at, liked_at, updated_at')
          .eq('user_id', user!.id)
          .eq('signal_id', signal!.id)
          .maybeSingle();

        if (error) throw error;
        return (data as UserSignalEngagementRow | null) ?? null;
      } catch (error) {
        if (isRecoverableEngagementError(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled: isSupabaseConfigured && !!user?.id && !!signal?.id,
    retry: false,
  });

  const effectiveEngagement = useMemo(() => {
    if (!user?.id) {
      return anonymousEngagement;
    }

    if (storedEngagement) {
      return {
        signal_id: storedEngagement.signal_id,
        is_saved: storedEngagement.is_saved || Boolean(anonymousEngagement?.is_saved),
        is_liked: storedEngagement.is_liked || Boolean(anonymousEngagement?.is_liked),
        saved_at: storedEngagement.saved_at ?? anonymousEngagement?.saved_at ?? null,
        liked_at: storedEngagement.liked_at ?? anonymousEngagement?.liked_at ?? null,
        updated_at: storedEngagement.updated_at ?? anonymousEngagement?.updated_at ?? new Date().toISOString(),
      };
    }

    return anonymousEngagement;
  }, [anonymousEngagement, storedEngagement, user?.id]);

  const mutation = useMutation({
    mutationFn: async (nextState: { isSaved: boolean; isLiked: boolean }) => {
      if (!signal?.id) return;

      if (!user?.id || !isSupabaseConfigured) {
        upsertAnonymousSignalEngagement(signal.id, {
          is_saved: nextState.isSaved,
          is_liked: nextState.isLiked,
          saved_at: nextState.isSaved ? (effectiveEngagement?.saved_at ?? new Date().toISOString()) : null,
          liked_at: nextState.isLiked ? (effectiveEngagement?.liked_at ?? new Date().toISOString()) : null,
        });
        return;
      }

      try {
        const nextSavedAt = nextState.isSaved
          ? (effectiveEngagement?.saved_at ?? new Date().toISOString())
          : null;
        const nextLikedAt = nextState.isLiked
          ? (effectiveEngagement?.liked_at ?? new Date().toISOString())
          : null;

        await persistSignalEngagement({
          userId: user.id,
          signalId: signal.id,
          isSaved: nextState.isSaved,
          isLiked: nextState.isLiked,
          savedAt: nextSavedAt,
          likedAt: nextLikedAt,
        });
      } catch (error) {
        if (!isRecoverableEngagementError(error)) {
          throw error;
        }

        upsertAnonymousSignalEngagement(signal.id, {
          is_saved: nextState.isSaved,
          is_liked: nextState.isLiked,
          saved_at: nextState.isSaved ? (effectiveEngagement?.saved_at ?? new Date().toISOString()) : null,
          liked_at: nextState.isLiked ? (effectiveEngagement?.liked_at ?? new Date().toISOString()) : null,
        });
      }
    },
    onSuccess: () => {
      if (user?.id && signal?.id) {
        queryClient.invalidateQueries({ queryKey: ['user_signal_engagement', user.id, signal.id] });
        queryClient.invalidateQueries({ queryKey: ['signal_library', user.id] });
      }
    },
  });

  const isSaved = Boolean(effectiveEngagement?.is_saved);
  const isLiked = Boolean(effectiveEngagement?.is_liked);

  async function setSaved(nextValue: boolean): Promise<void> {
    if (!signal) return;
    await mutation.mutateAsync({ isSaved: nextValue, isLiked });

    if (nextValue) {
      trackSignalSaved(signal, {
        surface: options?.surface ?? (user?.id ? 'account_linked_signal' : 'anonymous_signal'),
      });
    }
  }

  async function setLiked(nextValue: boolean): Promise<void> {
    if (!signal) return;
    await mutation.mutateAsync({ isSaved, isLiked: nextValue });

    if (nextValue) {
      trackSignalLiked(signal, {
        surface: options?.surface ?? (user?.id ? 'account_linked_signal' : 'anonymous_signal'),
      });
    }
  }

  return {
    isSaved,
    isLiked,
    isPending: mutation.isPending,
    toggleSaved: () => setSaved(!isSaved),
    toggleLiked: () => setLiked(!isLiked),
    setSaved,
    setLiked,
  };
}

export function useSignalLibrary(limit = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['signal_library', user?.id ?? null, limit],
    queryFn: async (): Promise<{
      savedSignals: SignalLibraryItem[];
      savedCount: number;
      likedCount: number;
    }> => {
      let engagementRows: UserSignalEngagementRow[] | null = null;
      try {
        const result = await supabase
          .from('user_signal_engagements' as any)
          .select('signal_id, is_saved, is_liked, saved_at, liked_at, updated_at')
          .eq('user_id', user!.id)
          .or('is_saved.eq.true,is_liked.eq.true')
          .order('updated_at', { ascending: false });

        if (result.error) throw result.error;
        engagementRows = (result.data as UserSignalEngagementRow[] | null) ?? [];
      } catch (error) {
        if (isRecoverableEngagementError(error)) {
          return { savedSignals: [], savedCount: 0, likedCount: 0 };
        }
        throw error;
      }

      const rows = engagementRows ?? [];
      const savedRows = rows.filter((row) => row.is_saved);
      const likedCount = rows.filter((row) => row.is_liked).length;

      if (savedRows.length === 0) {
        return { savedSignals: [], savedCount: 0, likedCount };
      }

      const signalIds = savedRows.map((row) => row.signal_id);
      const { data: signalRows, error: signalError } = await supabase
        .from('market_signals')
        .select('id, rss_item_id, signal_type, signal_key, title, description, summary, magnitude, direction, region, category, related_brands, related_products, updated_at, source, source_name, source_url, confidence_score, image_url, hero_image_url, content_segment, reading_time_minutes, quality_score, impact_score, vertical, topic, tier_min, tier_visibility, published_at, author')
        .in('id', signalIds);

      if (signalError) throw signalError;

      const signalMap = new Map(
        ((signalRows as SignalLibraryRow[] | null) ?? []).map((row) => [row.id, mapSignalRowToSignal(row)]),
      );

      const savedSignals = savedRows
        .map((row) => {
          const signal = signalMap.get(row.signal_id);
          if (!signal) return null;
          return {
            signal,
            isLiked: row.is_liked,
            savedAt: row.saved_at,
            likedAt: row.liked_at,
          } satisfies SignalLibraryItem;
        })
        .filter((item): item is SignalLibraryItem => Boolean(item))
        .slice(0, limit);

      return {
        savedSignals,
        savedCount: savedRows.length,
        likedCount,
      };
    },
    enabled: isSupabaseConfigured && !!user?.id,
    retry: false,
  });
}

export function getAnonymousSignalEngagementState(signalId: string) {
  return getAnonymousSignalEngagement(signalId);
}
