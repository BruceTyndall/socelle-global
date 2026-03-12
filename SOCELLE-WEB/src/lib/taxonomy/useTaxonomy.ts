import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../supabase';
import type { TaxonomyTag } from './types';

interface UseTaxonomyTagsOptions {
  categoryGroup?: string;
  level?: number;
  isActive?: boolean;
}

export function useTaxonomyTags(options: UseTaxonomyTagsOptions = {}) {
  const { categoryGroup, level, isActive = true } = options;

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['taxonomy_tags', categoryGroup ?? null, level ?? null, isActive],
    queryFn: async () => {
      let query = supabase
        .from('taxonomy_tags')
        .select('*')
        .order('level', { ascending: true })
        .order('display_label', { ascending: true });

      if (categoryGroup) query = query.eq('category_group', categoryGroup);
      if (level != null) query = query.eq('level', level);
      query = query.eq('is_active', isActive);

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }

      return (data ?? []) as TaxonomyTag[];
    },
    enabled: isSupabaseConfigured,
  });

  return { tags: data, isLoading, error: error instanceof Error ? error.message : null };
}
