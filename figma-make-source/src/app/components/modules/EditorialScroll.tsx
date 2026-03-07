import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EditorialItem {
  image: string;
  label: string;
  value?: string;
}

interface EditorialScrollProps {
  items: EditorialItem[];
  eyebrow?: string;
  headline?: string;
  dark?: boolean;
}

export function EditorialScroll({ items, eyebrow, headline, dark = false }: EditorialScrollProps) {
  const bgClass = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const textClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const subtextClass = dark ? 'text-[#F7F5F2]/50' : 'text-[#141418]/50';

  return (
    <section className={`${bgClass} py-14 lg:py-20 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow || headline) && (
          <div className="mb-12">
            {eyebrow && <span className="eyebrow text-[#141418]/50 mb-3 block">{eyebrow}</span>}
            {headline && <h2 className={`${textClass} text-2xl lg:text-4xl`}>{headline}</h2>}
          </div>
        )}
      </div>
      {/* Horizontal scroll */}
      <div className="flex gap-5 overflow-x-auto pb-6 px-4 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory">
        <div className="shrink-0 w-[calc(50vw-max(50vw-600px,0px)-2rem)] max-w-[calc(50vw-2rem)] hidden lg:block" />
        {items.map((item, i) => (
          <div key={i} className="shrink-0 w-[280px] lg:w-[340px] snap-start group cursor-pointer">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative">
              <ImageWithFallback
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428]/70 via-transparent to-transparent" />
              {item.value && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[#F7F5F2] text-3xl mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    {item.value}
                  </div>
                </div>
              )}
            </div>
            <div className={`${subtextClass} text-sm tracking-wide`}>
              {item.label}
            </div>
          </div>
        ))}
        <div className="shrink-0 w-8" />
      </div>
    </section>
  );
}