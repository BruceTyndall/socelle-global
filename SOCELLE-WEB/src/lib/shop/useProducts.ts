// useProducts — list products with filters (category, price range, search, in-stock)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import type { Product, ProductFilters } from './types';

const PER_PAGE = 12;

export function useProducts(initialFilters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters ?? {});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = filters.page ?? 1;
      const perPage = filters.per_page ?? PER_PAGE;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters.min_price_cents != null) {
        query = query.gte('price_cents', filters.min_price_cents);
      }
      if (filters.max_price_cents != null) {
        query = query.lte('price_cents', filters.max_price_cents);
      }
      if (filters.in_stock) {
        query = query.gt('stock_quantity', 0);
      }

      // Sort
      switch (filters.sort) {
        case 'price_asc':
          query = query.order('price_cents', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price_cents', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'featured':
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
      }

      query = query.range(from, to);

      const { data, error: err, count } = await query;
      if (err) throw err;
      setProducts((data as Product[]) ?? []);
      setTotal(count ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, total, filters, setFilters, refetch: fetchProducts };
}
