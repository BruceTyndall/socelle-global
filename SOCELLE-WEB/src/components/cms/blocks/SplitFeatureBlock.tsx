// ── SplitFeatureBlock — WO-CMS-04 ──────────────────────────────────────
// Side-by-side heading + body + image block. Image position configurable.

import React from 'react';
import { getAssetPublicUrl } from '../../../lib/cms';

interface SplitFeatureBlockProps {
  heading?: string;
  body?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
  className?: string;
}

export const SplitFeatureBlock: React.FC<SplitFeatureBlockProps> = ({
  heading,
  body,
  image,
  imagePosition = 'right',
  className = '',
}) => {
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : getAssetPublicUrl(image)
    : null;

  const paragraphs = body?.split('\n').filter((p) => p.trim()) ?? [];

  return (
    <section className={`max-w-5xl mx-auto px-6 py-12 ${className}`}>
      <div
        className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
          imagePosition === 'left' ? 'md:flex-row-reverse' : ''
        }`}
      >
        <div className="flex-1">
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold text-[#141418] font-sans mb-4">
              {heading}
            </h2>
          )}
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[#141418]/70 font-sans text-base md:text-lg leading-relaxed mb-3 last:mb-0"
            >
              {p}
            </p>
          ))}
        </div>
        {imageUrl && (
          <div className="flex-1">
            <img
              src={imageUrl}
              alt={heading ?? ''}
              className="w-full rounded-lg object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
};
