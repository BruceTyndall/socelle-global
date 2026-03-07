import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Audience Segments hook ──────
// Table: audience_segments
// isLive flag drives DEMO badge.

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
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchSegments() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setSegments([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('audience_segments')
          .select('*')
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (queryError || !data) {
          setSegments([]);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setSegments(data as AudienceSegment[]);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setSegments([]);
          setIsLive(false);
          setError('Failed to fetch audience segments');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSegments();
    return () => { cancelled = true; };
  }, [tick]);

  const createSegment = useCallback(async (segment: Omit<AudienceSegment, 'id' | 'created_at' | 'updated_at'>): Promise<AudienceSegment | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error: insertError } = await supabase
      .from('audience_segments')
      .insert(segment)
      .select()
      .single();
    if (insertError) { setError(insertError.message); return null; }
    refetch();
    return data as AudienceSegment;
  }, [refetch]);

  return { segments, isLive, loading, error, createSegment, refetch };
}
