// ── HeroBlock — WO-CMS-04 ─────────────────────────────────────────────
// Full-width hero with heading, subheading, optional background image + CTA.

import React from 'react';

interface HeroBlockProps {
  heading?: string;
  subheading?: string;
  backgroundImage?: string;
  cta?: { text?: string; url?: string };
  className?: string;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  heading,
  subheading,
  backgroundImage,
  cta,
  className = '',
}) => {
  const hasBg = !!backgroundImage;

  return (
    <section
      className={`relative w-full py-20 md:py-32 px-6 md:px-12 flex items-center justify-center text-center ${
        hasBg ? 'bg-cover bg-center' : 'bg-[#F6F3EF]'
      } ${className}`}
      style={hasBg ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {hasBg && (
        <div className="absolute inset-0 bg-[#141418]/50" aria-hidden="true" />
      )}
      <div className="relative z-10 max-w-3xl mx-auto">
        {heading && (
          <h1
            className={`text-3xl md:text-5xl font-bold leading-tight font-sans ${
              hasBg ? 'text-white' : 'text-[#141418]'
            }`}
          >
            {heading}
          </h1>
        )}
        {subheading && (
          <p
            className={`mt-4 text-lg md:text-xl font-sans ${
              hasBg ? 'text-white/90' : 'text-[#141418]/70'
            }`}
          >
            {subheading}
          </p>
        )}
        {cta?.text && cta?.url && (
          <a
            href={cta.url}
            className="mt-8 inline-block px-8 py-3 rounded-lg bg-[#6E879B] text-white font-semibold font-sans hover:bg-[#5A7185] transition-colors"
          >
            {cta.text}
          </a>
        )}
      </div>
    </section>
  );
};
