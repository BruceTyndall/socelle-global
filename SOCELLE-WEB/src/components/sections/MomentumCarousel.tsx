import { type ReactNode, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MomentumCarouselProps {
  items: ReactNode[];
  className?: string;
  showArrows?: boolean;
}

export default function MomentumCarousel({
  items,
  className = '',
  showArrows = true,
}: MomentumCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className={`relative ${className}`}>
      {/* Carousel viewport */}
      <div
        ref={emblaRef}
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
        }}
      >
        <div className="flex gap-5">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[85vw] sm:w-[48%] lg:w-[32%]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && (
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full border border-graphite/10 bg-mn-card/80 flex items-center justify-center hover:bg-mn-card transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={18} className="text-graphite" />
          </button>
          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full border border-graphite/10 bg-mn-card/80 flex items-center justify-center hover:bg-mn-card transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={18} className="text-graphite" />
          </button>
        </div>
      )}
    </div>
  );
}
