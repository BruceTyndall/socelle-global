// ── TextBlock — WO-CMS-04 ──────────────────────────────────────────────
// Renders a heading + body text block. Body is plain text (paragraphs split by newlines).

import React from 'react';

interface TextBlockProps {
  heading?: string;
  body?: string;
  className?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  heading,
  body,
  className = '',
}) => {
  const paragraphs = body?.split('\n').filter((p) => p.trim()) ?? [];

  return (
    <section className={`max-w-3xl mx-auto px-6 py-12 ${className}`}>
      {heading && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#141418] font-sans mb-4">
          {heading}
        </h2>
      )}
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[#141418]/80 font-sans text-base md:text-lg leading-relaxed mb-4 last:mb-0"
        >
          {p}
        </p>
      ))}
    </section>
  );
};
