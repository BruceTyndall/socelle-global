// useCategories — list product categories
// Migrated to TanStack Query v5 (V2-TECH-04).
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { ProductCategory } from './types';

export function useCategories() {
  const { data: categories = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['product_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw new Error(error.message);
      return (data as ProductCategory[]) ?? [];
    },
  });

  const error = queryError instanceof Error ? queryError.message : null;
  return { categories, loading, error };
}
