// ── TestimonialBlock — WO-CMS-04 ───────────────────────────────────────
// Quote with author attribution and optional avatar.

import React from 'react';

interface TestimonialBlockProps {
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  avatar?: string;
  className?: string;
}

export const TestimonialBlock: React.FC<TestimonialBlockProps> = ({
  quote,
  author,
  role,
  company,
  avatar,
  className = '',
}) => {
  if (!quote) return null;

  return (
    <section className={`max-w-3xl mx-auto px-6 py-12 ${className}`}>
      <blockquote className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-[#141418]/5">
        <p className="text-lg md:text-xl text-[#141418] font-sans leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>
        <footer className="mt-6 flex items-center gap-4">
          {avatar && (
            <img
              src={avatar}
              alt={author ?? ''}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            {author && (
              <p className="font-semibold text-[#141418] font-sans text-sm">
                {author}
              </p>
            )}
            {(role || company) && (
              <p className="text-[#141418]/60 font-sans text-sm">
                {[role, company].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </footer>
      </blockquote>
    </section>
  );
};
