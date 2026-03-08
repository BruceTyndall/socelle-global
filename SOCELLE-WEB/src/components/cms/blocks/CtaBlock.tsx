// ── CtaBlock — WO-CMS-04 ───────────────────────────────────────────────
// Call-to-action block with heading, body, and styled button.

import React from 'react';

interface CtaBlockProps {
  heading?: string;
  body?: string;
  buttonText?: string;
  buttonUrl?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const CtaBlock: React.FC<CtaBlockProps> = ({
  heading,
  body,
  buttonText,
  buttonUrl,
  variant = 'primary',
  className = '',
}) => {
  const isPrimary = variant === 'primary';

  return (
    <section
      className={`max-w-3xl mx-auto px-6 py-12 text-center ${className}`}
    >
      {heading && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#141418] font-sans mb-3">
          {heading}
        </h2>
      )}
      {body && (
        <p className="text-[#141418]/70 font-sans text-base md:text-lg mb-6">
          {body}
        </p>
      )}
      {buttonText && buttonUrl && (
        <a
          href={buttonUrl}
          className={`inline-block px-8 py-3 rounded-lg font-semibold font-sans transition-colors ${
            isPrimary
              ? 'bg-[#6E879B] text-white hover:bg-[#5A7185]'
              : 'border-2 border-[#6E879B] text-[#6E879B] hover:bg-[#6E879B]/10'
          }`}
        >
          {buttonText}
        </a>
      )}
    </section>
  );
};
