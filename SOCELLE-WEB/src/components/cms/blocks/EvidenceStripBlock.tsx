// ── EvidenceStripBlock — WO-CMS-04 ─────────────────────────────────────
// Horizontal strip of icon + label + value items.

import React from 'react';

interface EvidenceItem {
  icon?: string;
  label: string;
  value: string;
}

interface EvidenceStripBlockProps {
  items?: EvidenceItem[];
  className?: string;
}

export const EvidenceStripBlock: React.FC<EvidenceStripBlockProps> = ({
  items = [],
  className = '',
}) => {
  if (items.length === 0) return null;

  return (
    <section
      className={`w-full bg-white border-y border-[#141418]/5 py-6 px-6 ${className}`}
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-center">
            {item.icon && (
              <span className="text-2xl" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <div>
              <p className="text-lg font-bold text-[#141418] font-sans">
                {item.value}
              </p>
              <p className="text-xs text-[#141418]/60 font-sans">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
