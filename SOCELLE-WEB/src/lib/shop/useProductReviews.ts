// useProductReviews — list reviews for product, submit review
// Migrated to TanStack Query v5 (V2-TECH-04).
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import type { Review } from './types';

export function useProductReviews(productId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['product_reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId!)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      const revs = (data as Review[]) ?? [];
      const avgRating = revs.length > 0
        ? revs.reduce((s, r) => s + r.rating, 0) / revs.length
        : 0;
      return { reviews: revs, avgRating };
    },
    enabled: !!productId,
  });

  const submitMutation = useMutation({
    mutationFn: async ({ rating, title, body }: { rating: number; title: string; body: string }) => {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId!,
        user_id: user!.id,
        rating,
        title: title || null,
        body: body || null,
        is_approved: false,
        is_verified_purchase: false,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product_reviews', productId] }); },
  });

  const submitReview = async (rating: number, title: string, body: string) => {
    if (!user?.id || !productId) return;
    await submitMutation.mutateAsync({ rating, title, body });
  };

  const reviews = data?.reviews ?? [];
  const avgRating = data?.avgRating ?? 0;
  const submitting = submitMutation.isPending;
  const error = queryError instanceof Error ? queryError.message
    : submitMutation.error instanceof Error ? submitMutation.error.message
    : null;

  return { reviews, avgRating, loading, submitting, error, submitReview, refetch };
}
