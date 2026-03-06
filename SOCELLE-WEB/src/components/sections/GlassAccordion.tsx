import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

interface GlassAccordionProps {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
}

export default function GlassAccordion({
  items,
  className = '',
  allowMultiple = false,
}: GlassAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-white/30 bg-white/60 backdrop-blur-[12px] overflow-hidden transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(19,24,29,0.06)]"
            style={{
              boxShadow: isOpen
                ? '0 4px 24px rgba(19, 24, 29, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
                : '0 2px 12px rgba(19, 24, 29, 0.03)',
            }}
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-sans font-medium text-[1.0625rem] text-graphite leading-snug">
                {item.question}
              </span>
              <ChevronDown
                size={20}
                className={`flex-shrink-0 text-[rgba(30,37,43,0.42)] transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5 text-[rgba(30,37,43,0.62)] font-sans text-[0.9375rem] leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
