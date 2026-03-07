// useProductReviews — list reviews for product, submit review
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import type { Review } from './types';

export function useProductReviews(productId: string | undefined) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (err) throw err;
      const revs = (data as Review[]) ?? [];
      setReviews(revs);
      if (revs.length > 0) {
        setAvgRating(revs.reduce((s, r) => s + r.rating, 0) / revs.length);
      } else {
        setAvgRating(0);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const submitReview = useCallback(async (rating: number, title: string, body: string) => {
    if (!user?.id || !productId) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title: title || null,
        body: body || null,
        is_approved: false,
        is_verified_purchase: false,
      });
      if (err) throw err;
      await fetchReviews();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, productId, fetchReviews]);

  return { reviews, avgRating, loading, submitting, error, submitReview, refetch: fetchReviews };
}
