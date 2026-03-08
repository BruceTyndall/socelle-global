import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Audience Segments hook ──────
// Table: audience_segments
// isLive flag drives DEMO badge.
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface SegmentFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: string | number | string[];
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string | null;
  filters: SegmentFilter[];
  estimated_size: number;
  last_calculated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseAudienceSegmentsReturn {
  segments: AudienceSegment[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
  createSegment: (segment: Omit<AudienceSegment, 'id' | 'created_at' | 'updated_at'>) => Promise<AudienceSegment | null>;
  refetch: () => void;
}

export function useAudienceSegments(): UseAudienceSegmentsReturn {
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['audience_segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audience_segments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as AudienceSegment[];
    },
    enabled: isSupabaseConfigured,
  });

  const createMut = useMutation({
    mutationFn: async (segment: Omit<AudienceSegment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('audience_segments').insert(segment).select().single();
      if (error) throw new Error(error.message);
      return data as AudienceSegment;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['audience_segments'] }); },
  });

  const createSegment = async (segment: Omit<AudienceSegment, 'id' | 'created_at' | 'updated_at'>): Promise<AudienceSegment | null> => {
    if (!isSupabaseConfigured) return null;
    try { return await createMut.mutateAsync(segment); } catch { return null; }
  };

  const isLive = segments.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { segments, isLive, loading, error, createSegment, refetch };
}
