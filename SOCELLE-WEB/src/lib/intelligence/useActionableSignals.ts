import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../supabase';

export interface ActionableSignal {
  id: string;
  title: string;
  category: string;
  delta: number;
  confidence: number;
  source: string;
  updated_at: string;
}

interface SignalRow {
  id: string;
  title: string | null;
  category: string | null;
  magnitude: number | null;
  confidence_score: number | null;
  source: string | null;
  updated_at: string | null;
}

export function useActionableSignals(limit = 6) {
  const query = useQuery({
    queryKey: ['actionable_signals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_signals')
        .select('id, title, category, magnitude, confidence_score, source, updated_at')
        .eq('active', true)
        .order('magnitude', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);

      return ((data ?? []) as SignalRow[]).map((row) => ({
        id: row.id,
        title: row.title ?? 'Market signal',
        category: row.category ?? 'General',
        delta: typeof row.magnitude === 'number' ? row.magnitude : 0,
        confidence: typeof row.confidence_score === 'number' ? row.confidence_score : 0,
        source: row.source ?? 'market_signals',
        updated_at: row.updated_at ?? new Date().toISOString(),
      }));
    },
    enabled: isSupabaseConfigured,
    staleTime: 2 * 60 * 1000,
  });

  return {
    signals: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    isLive: (query.data?.length ?? 0) > 0,
    refetch: query.refetch,
  };
}
