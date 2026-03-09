import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';
import { useAuth } from './auth';

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

type SegmentRow = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asFilters(value: unknown): SegmentFilter[] {
  if (Array.isArray(value)) return value as SegmentFilter[];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.rules)) return obj.rules as SegmentFilter[];
  }
  return [];
}

function isSchemaMismatch(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = (error as { message?: string }).message?.toLowerCase() ?? '';
  return (
    message.includes('column') ||
    message.includes('relationship') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
}

function mapSegmentRow(row: SegmentRow): AudienceSegment {
  return {
    id: asString(row.id),
    name: asString(row.name),
    description: asNullableString(row.description),
    filters: asFilters(row.filters ?? row.filter_rules),
    estimated_size: asNumber(row.estimated_size, 0),
    last_calculated_at: asNullableString(row.last_calculated_at),
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
  };
}

export function useAudienceSegments(): UseAudienceSegmentsReturn {
  const queryClient = useQueryClient();
  const { profile, isAdmin, isPlatformAdmin } = useAuth();
  const isGlobalAdmin = isAdmin || isPlatformAdmin;

  const { data: segments = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['audience_segments'],
    queryFn: async () => {
      const runQuery = async (scopeByTenant: boolean) => {
        let query = supabase
          .from('audience_segments')
          .select('*')
          .order('created_at', { ascending: false });
        if (scopeByTenant && profile?.business_id) {
          query = query.eq('tenant_id', profile.business_id);
        }
        return query;
      };

      const scoped = !isGlobalAdmin;
      const scopedResult = await runQuery(scoped);
      if (!scopedResult.error) {
        return ((scopedResult.data ?? []) as SegmentRow[]).map(mapSegmentRow);
      }
      if (!(scoped && isSchemaMismatch(scopedResult.error))) {
        throw new Error(scopedResult.error.message);
      }

      const fallback = await runQuery(false);
      if (fallback.error) throw new Error(fallback.error.message);
      return ((fallback.data ?? []) as SegmentRow[]).map(mapSegmentRow);
    },
    enabled: isSupabaseConfigured,
  });

  const createMut = useMutation({
    mutationFn: async (segment: Omit<AudienceSegment, 'id' | 'created_at' | 'updated_at'>) => {
      const legacyInsert = await supabase
        .from('audience_segments')
        .insert(segment)
        .select()
        .single();
      if (!legacyInsert.error && legacyInsert.data) {
        return mapSegmentRow(legacyInsert.data as SegmentRow);
      }
      if (legacyInsert.error && !isSchemaMismatch(legacyInsert.error)) {
        throw new Error(legacyInsert.error.message);
      }

      const normalizedInsert = await supabase
        .from('audience_segments')
        .insert({
          name: segment.name,
          description: segment.description ?? null,
          filter_rules: segment.filters ?? [],
          estimated_size: segment.estimated_size ?? 0,
          last_calculated_at: segment.last_calculated_at ?? null,
          tenant_id: profile?.business_id ?? null,
        })
        .select()
        .single();
      if (normalizedInsert.error) throw new Error(normalizedInsert.error.message);
      return mapSegmentRow(normalizedInsert.data as SegmentRow);
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
