import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Landing Pages hook ──────────
// Table: landing_pages
// isLive flag drives DEMO badge.

export type LandingPageStatus = 'draft' | 'published' | 'archived';

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  campaign_id: string | null;
  body: Record<string, unknown>;
  status: LandingPageStatus;
  views: number;
  conversions: number;
  created_at: string;
  updated_at: string;
}

export interface UseLandingPagesReturn {
  pages: LandingPage[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
  createPage: (page: Omit<LandingPage, 'id' | 'created_at' | 'updated_at' | 'views' | 'conversions'>) => Promise<LandingPage | null>;
  updatePage: (id: string, updates: Partial<LandingPage>) => Promise<boolean>;
  refetch: () => void;
}

export function useLandingPages(): UseLandingPagesReturn {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPages() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setPages([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('landing_pages')
          .select('*')
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (queryError || !data) {
          setPages([]);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setPages(data as LandingPage[]);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setPages([]);
          setIsLive(false);
          setError('Failed to fetch landing pages');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPages();
    return () => { cancelled = true; };
  }, [tick]);

  const createPage = useCallback(async (page: Omit<LandingPage, 'id' | 'created_at' | 'updated_at' | 'views' | 'conversions'>): Promise<LandingPage | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error: insertError } = await supabase
      .from('landing_pages')
      .insert({ ...page, views: 0, conversions: 0 })
      .select()
      .single();
    if (insertError) { setError(insertError.message); return null; }
    refetch();
    return data as LandingPage;
  }, [refetch]);

  const updatePage = useCallback(async (id: string, updates: Partial<LandingPage>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { error: updateError } = await supabase
      .from('landing_pages')
      .update(updates)
      .eq('id', id);
    if (updateError) { setError(updateError.message); return false; }
    refetch();
    return true;
  }, [refetch]);

  return { pages, isLive, loading, error, createPage, updatePage, refetch };
}
