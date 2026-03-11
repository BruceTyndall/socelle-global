import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { ContentPlacement, ContentPlacementInsert, ContentPlacementUpdate, CmsPost } from './types';

const QUERY_KEY = 'content_placements';

export type ContentPlacementWithPost = ContentPlacement & {
  post: Pick<CmsPost, 'id' | 'title' | 'slug' | 'category' | 'hero_image' | 'status' | 'published_at'>;
};

interface UseContentPlacementsOptions {
  placementKey?: string;
  isActive?: boolean;
}

export function useContentPlacements(options: UseContentPlacementsOptions = {}) {
  const queryClient = useQueryClient();
  const { placementKey, isActive } = options;

  const { data: placements = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, placementKey, isActive],
    queryFn: async () => {
      let query = supabase.from('content_placements').select(`
        *,
        post:cms_posts(id, title, slug, category, hero_image, status, published_at)
      `);

      if (placementKey) query = query.eq('placement_key', placementKey);
      if (isActive !== undefined) query = query.eq('is_active', isActive);

      query = query.order('display_order', { ascending: true });

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }

      return (data ?? []) as ContentPlacementWithPost[];
    },
    enabled: isSupabaseConfigured,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  const createPlacement = useMutation({
    mutationFn: async (input: ContentPlacementInsert) => {
      const { data, error } = await supabase
        .from('content_placements')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ContentPlacement;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updatePlacement = useMutation({
    mutationFn: async ({ id, ...updates }: ContentPlacementUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('content_placements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ContentPlacement;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateDisplayOrder = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      // Supabase js lacks a direct bulk update by ID, so we do it individually via a single transaction or Promise.all
      const promises = updates.map((update) =>
        supabase
          .from('content_placements')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter((res) => res.error);
      if (errors.length > 0) throw new Error('Failed to update display order for all placements');
      
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deletePlacement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_placements').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { 
    placements, 
    isLoading, 
    error, 
    createPlacement, 
    updatePlacement, 
    updateDisplayOrder,
    deletePlacement 
  };
}
