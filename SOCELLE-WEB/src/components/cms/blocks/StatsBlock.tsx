// ── StatsBlock — WO-CMS-04 ─────────────────────────────────────────────
// 3-4 column stats grid with label, value, and optional delta.

import React from 'react';

interface StatItem {
  label: string;
  value: string;
  delta?: string;
}

interface StatsBlockProps {
  items?: StatItem[];
  className?: string;
}

export const StatsBlock: React.FC<StatsBlockProps> = ({
  items = [],
  className = '',
}) => {
  if (items.length === 0) return null;

  return (
    <section className={`max-w-4xl mx-auto px-6 py-12 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-6 text-center shadow-sm border border-[#141418]/5"
          >
            <p className="text-2xl md:text-3xl font-bold text-[#141418] font-sans">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-[#141418]/60 font-sans">
              {item.label}
            </p>
            {item.delta && (
              <p className="mt-2 text-xs font-semibold font-sans text-[#5F8A72]">
                {item.delta}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
