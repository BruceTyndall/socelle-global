import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Landing Pages hook ──────────
// Table: landing_pages
// isLive flag drives DEMO badge.
// Migrated to TanStack Query v5 (V2-TECH-04).

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
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['landing_pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as LandingPage[];
    },
    enabled: isSupabaseConfigured,
  });

  const createMutation = useMutation({
    mutationFn: async (page: Omit<LandingPage, 'id' | 'created_at' | 'updated_at' | 'views' | 'conversions'>) => {
      const { data, error } = await supabase
        .from('landing_pages')
        .insert({ ...page, views: 0, conversions: 0 })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as LandingPage;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['landing_pages'] }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LandingPage> }) => {
      const { error } = await supabase
        .from('landing_pages')
        .update(updates)
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['landing_pages'] }); },
  });

  const createPage = async (page: Omit<LandingPage, 'id' | 'created_at' | 'updated_at' | 'views' | 'conversions'>): Promise<LandingPage | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      return await createMutation.mutateAsync(page);
    } catch {
      return null;
    }
  };

  const updatePage = async (id: string, updates: Partial<LandingPage>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      await updateMutation.mutateAsync({ id, updates });
      return true;
    } catch {
      return false;
    }
  };

  const isLive = pages.length > 0;
  const error = queryError instanceof Error ? queryError.message
    : createMutation.error instanceof Error ? createMutation.error.message
    : updateMutation.error instanceof Error ? updateMutation.error.message
    : null;

  return { pages, isLive, loading, error, createPage, updatePage, refetch };
}
