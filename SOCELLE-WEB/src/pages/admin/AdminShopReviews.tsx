// AdminShopReviews.tsx — /admin/shop/reviews — Review moderation (LIVE — reviews table)
import { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Review } from '../../lib/shop/types';

export default function AdminShopReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('is_approved', false);
    else if (filter === 'approved') query = query.eq('is_approved', true);
    const { data } = await query;
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleApproval = async (review: Review) => {
    await supabase.from('reviews').update({ is_approved: !review.is_approved }).eq('id', review.id);
    fetch();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-sans font-semibold text-graphite">Review Moderation</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-sans font-semibold rounded-lg transition-colors ${filter === f ? 'bg-graphite text-white' : 'bg-accent-soft text-graphite/60 hover:text-graphite'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-center text-graphite/60 py-8">Loading...</p>}

      {!loading && reviews.length === 0 && (
        <div className="text-center py-16 text-graphite/60">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-sans">No reviews found</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-xl border border-accent-soft p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-accent-soft'}`} />
                    ))}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${review.is_approved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Verified</span>
                  )}
                </div>
                {review.title && <p className="text-sm font-sans font-semibold text-graphite mb-1">{review.title}</p>}
                {review.body && <p className="text-sm font-sans text-graphite/60">{review.body}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs font-sans text-graphite/60/60">
                  <span>Product: <span className="font-mono">{review.product_id.slice(0, 8)}...</span></span>
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleApproval(review)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${review.is_approved ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  title={review.is_approved ? 'Unapprove' : 'Approve'}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
