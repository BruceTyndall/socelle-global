// ── FaqBlock — WO-CMS-04 ───────────────────────────────────────────────
// Collapsible accordion FAQ block.

import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlockProps {
  items?: FaqItem[];
  heading?: string;
  className?: string;
}

export const FaqBlock: React.FC<FaqBlockProps> = ({
  items = [],
  heading,
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className={`max-w-3xl mx-auto px-6 py-12 ${className}`}>
      {heading && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#141418] font-sans mb-8">
          {heading}
        </h2>
      )}
      <div className="divide-y divide-[#141418]/10">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left font-sans font-semibold text-[#141418] text-base md:text-lg"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#6E879B] flex-shrink-0 ml-4 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-3 text-[#141418]/70 font-sans text-base leading-relaxed">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
