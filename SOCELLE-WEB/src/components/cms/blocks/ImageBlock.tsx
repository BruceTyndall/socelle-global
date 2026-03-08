// ── ImageBlock — WO-CMS-04 ─────────────────────────────────────────────
// Renders an image from a storage path (via getAssetPublicUrl) or direct URL.

import React from 'react';
import { getAssetPublicUrl } from '../../../lib/cms';

interface ImageBlockProps {
  src?: string;
  alt?: string;
  caption?: string;
  className?: string;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  src,
  alt = '',
  caption,
  className = '',
}) => {
  if (!src) return null;

  // If src starts with http, use as-is; otherwise treat as storage path
  const imageUrl = src.startsWith('http') ? src : getAssetPublicUrl(src);

  return (
    <figure className={`max-w-4xl mx-auto px-6 py-8 ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full rounded-lg object-cover"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-3 text-sm text-[#141418]/60 font-sans text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
