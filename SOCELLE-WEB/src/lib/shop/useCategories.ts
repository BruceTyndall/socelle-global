// useCategories — list product categories
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { ProductCategory } from './types';

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from('product_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (err) throw err;
        if (!cancelled) setCategories((data as ProductCategory[]) ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load categories');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}
