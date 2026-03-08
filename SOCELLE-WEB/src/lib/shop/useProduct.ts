// useProduct — single product by slug with variants and reviews
// Migrated to TanStack Query v5 (V2-TECH-04).
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Product, ProductVariant, Review } from './types';

interface ProductDetail {
  product: Product;
  variants: ProductVariant[];
  reviews: Review[];
  avgRating: number;
  relatedProducts: Product[];
}

export function useProduct(slug: string | undefined) {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['product_detail', slug],
    queryFn: async (): Promise<ProductDetail> => {
      // Fetch product
      const { data: p, error: pErr } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single();
      if (pErr) throw new Error(pErr.message);

      // Fetch variants
      const { data: v } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', p.id)
        .eq('is_active', true)
        .order('created_at');

      // Fetch approved reviews
      const { data: r } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', p.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      const revs = (r as Review[]) ?? [];
      const avgRating = revs.length > 0
        ? revs.reduce((s, rv) => s + rv.rating, 0) / revs.length
        : 0;

      // Related products (same category)
      let relatedProducts: Product[] = [];
      if (p.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', p.category_id)
          .eq('is_active', true)
          .neq('id', p.id)
          .limit(4);
        relatedProducts = (rel as Product[]) ?? [];
      }

      return {
        product: p as Product,
        variants: (v as ProductVariant[]) ?? [],
        reviews: revs,
        avgRating,
        relatedProducts,
      };
    },
    enabled: !!slug,
  });

  const product = data?.product ?? null;
  const variants = data?.variants ?? [];
  const reviews = data?.reviews ?? [];
  const avgRating = data?.avgRating ?? 0;
  const relatedProducts = data?.relatedProducts ?? [];
  const error = queryError instanceof Error ? queryError.message : null;

  return { product, variants, reviews, avgRating, relatedProducts, loading, error };
}
