import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EditorialItem {
  image: string;
  label: string;
  value?: string;
}

interface EditorialScrollProps {
  eyebrow?: string;
  headline?: string;
  items: EditorialItem[];
  dark?: boolean;
}

export function EditorialScroll({ eyebrow, headline, items, dark = false }: EditorialScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const bgClass = dark ? 'bg-mn-dark' : 'bg-mn-bg';
  const textClass = dark ? 'text-mn-bg' : 'text-graphite';
  const subtextClass = dark ? 'text-mn-bg/60' : 'text-graphite/60';
  const cardBg = dark ? 'bg-mn-dark border border-mn-bg/10' : 'bg-white border border-graphite/5';

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  return (
    <section className={`${bgClass} py-14 lg:py-20 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            {eyebrow && <span className="text-eyebrow text-accent mb-3 block">{eyebrow}</span>}
            {headline && <h2 className={`${textClass} text-subsection`}>{headline}</h2>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                canScrollLeft
                  ? 'border-graphite/20 text-graphite hover:bg-graphite/5 cursor-pointer'
                  : 'border-graphite/5 text-graphite/20 cursor-default'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                canScrollRight
                  ? 'border-graphite/20 text-graphite hover:bg-graphite/5 cursor-pointer'
                  : 'border-graphite/5 text-graphite/20 cursor-default'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="shrink-0 w-[max(0px,calc((100%-80rem)/2))]" />
        {items.map((item, i) => (
          <div
            key={i}
            className={`${cardBg} rounded-card overflow-hidden shrink-0 w-72 lg:w-80 group snap-start transition-shadow hover:shadow-panel`}
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {item.value && (
                <div className="absolute bottom-3 right-3 bg-mn-dark/80 backdrop-blur-sm rounded-xl px-3 py-1.5">
                  <span className="text-mn-bg font-mono text-sm font-semibold">{item.value}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className={`${subtextClass} text-sm leading-relaxed`}>{item.label}</p>
            </div>
          </div>
        ))}
        <div className="shrink-0 w-4" />
      </div>
    </section>
  );
}
