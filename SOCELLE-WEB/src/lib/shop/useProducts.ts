// useProducts — list products with filters (category, price range, search, in-stock)
// Migrated to TanStack Query v5 (V2-TECH-04).
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Product, ProductFilters } from './types';

const PER_PAGE = 12;

export function useProducts(initialFilters?: ProductFilters) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters ?? {});

  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
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

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);
      return { products: (data as Product[]) ?? [], total: count ?? 0 };
    },
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { products, loading, error, total, filters, setFilters, refetch };
}
