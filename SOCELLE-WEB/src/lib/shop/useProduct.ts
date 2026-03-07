// useProduct — single product by slug with variants and reviews
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Product, ProductVariant, Review } from './types';

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch product
        const { data: p, error: pErr } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();
        if (pErr) throw pErr;
        if (cancelled) return;
        setProduct(p as Product);

        // Fetch variants
        const { data: v } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', p.id)
          .eq('is_active', true)
          .order('created_at');
        if (!cancelled) setVariants((v as ProductVariant[]) ?? []);

        // Fetch approved reviews
        const { data: r } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', p.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        if (!cancelled) {
          const revs = (r as Review[]) ?? [];
          setReviews(revs);
          if (revs.length > 0) {
            setAvgRating(revs.reduce((s, rv) => s + rv.rating, 0) / revs.length);
          }
        }

        // Related products (same category)
        if (p.category_id) {
          const { data: rel } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', p.category_id)
            .eq('is_active', true)
            .neq('id', p.id)
            .limit(4);
          if (!cancelled) setRelatedProducts((rel as Product[]) ?? []);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  return { product, variants, reviews, avgRating, relatedProducts, loading, error };
}
