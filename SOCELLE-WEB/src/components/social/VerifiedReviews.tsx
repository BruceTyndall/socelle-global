import React, { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import type { Review } from '../../lib/shop/types';

interface VerifiedReviewsProps {
  productId: string;
  reviews: Review[];
  avgRating: number;
  submitReview: (rating: number, title: string, body: string) => Promise<void>;
  submitting: boolean;
  className?: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? 'text-signal-warn fill-signal-warn' : 'text-graphite/15'}`}
        />
      ))}
    </div>
  );
}

export function VerifiedReviews({ reviews, avgRating, submitReview, submitting, className = '' }: VerifiedReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReview(form.rating, form.title, form.body);
    setForm({ rating: 5, title: '', body: '' });
    setShowForm(false);
  };

  return (
    <section className={`mt-16 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-subsection text-graphite mb-1 flex items-center gap-2">
            Verified Reviews
            <CheckCircle className="w-4 h-4 text-signal-up" />
          </h2>
          <p className="text-xs text-graphite/50 font-sans">
            Only verified operators who have purchased this item can leave reviews.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-sans font-semibold text-accent hover:underline"
        >
          Write a Review
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-mn-card rounded-card p-6 shadow-soft mb-8 space-y-4">
          <div>
            <label className="text-label text-graphite/60 block mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, rating: s }))}
                >
                  <Star className={`w-6 h-6 ${s <= form.rating ? 'text-signal-warn fill-signal-warn' : 'text-graphite/15'}`} />
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Review title (optional)"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <textarea
            placeholder="Your verified insight..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Verified Review'}
          </button>
        </form>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-10 bg-mn-surface rounded-2xl border border-graphite/5">
          <Star className="w-8 h-8 text-graphite/10 mx-auto mb-3" />
          <p className="text-sm font-sans text-graphite/40">No operator reviews yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-mn-card rounded-xl p-5 shadow-soft border border-graphite/5">
            <div className="flex items-center justify-between mb-2">
              <StarRating rating={review.rating} />
              <span className="text-xs font-mono text-graphite/30">
                {review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
            {review.title && <p className="text-sm font-sans font-semibold text-graphite mb-1">{review.title}</p>}
            {review.body && <p className="text-sm font-sans text-graphite/70">{review.body}</p>}
            {review.is_verified_purchase && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-graphite/5">
                <CheckCircle className="w-3.5 h-3.5 text-signal-up" />
                <span className="text-[11px] font-semibold tracking-wide uppercase text-signal-up">
                  Verified Operator Purchase
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
