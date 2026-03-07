import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface FeaturedCard {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  metric?: { value: string; label: string };
  badge?: string;
  href?: string;
}

interface FeaturedCardGridProps {
  cards: FeaturedCard[];
  eyebrow?: string;
  headline?: string;
  dark?: boolean;
  columns?: 2 | 3;
}

export function FeaturedCardGrid({ cards, eyebrow, headline, dark = false, columns = 3 }: FeaturedCardGridProps) {
  const bgClass = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const textClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const subtextClass = dark ? 'text-[#F7F5F2]/60' : 'text-[#141418]/60';
  const cardBg = dark ? 'bg-[#F7F5F2]/[0.04]' : 'bg-white';
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className={`${bgClass} py-14 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow || headline) && (
          <div className="mb-12">
            {eyebrow && <span className="eyebrow text-[#141418]/50 mb-3 block">{eyebrow}</span>}
            {headline && <h2 className={`${textClass} text-2xl lg:text-4xl`}>{headline}</h2>}
          </div>
        )}
        <div className={`grid grid-cols-1 ${gridCols} gap-6 lg:gap-8`}>
          {cards.map((card) => (
            <a
              key={card.id}
              href={card.href || '#'}
              className={`${cardBg} rounded-2xl overflow-hidden group ${dark ? 'card-mineral-dark' : 'card-mineral'} transition-all duration-500`}
            >
              {/* Image */}
              <div className="aspect-[16/10] relative overflow-hidden">
                <ImageWithFallback
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428]/60 via-transparent to-transparent" />
                {card.badge && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#3F5465]/90 text-[#F7F5F2] text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    {card.badge}
                  </div>
                )}
                {card.metric && (
                  <div className="absolute bottom-4 left-4">
                    <div className="glass-panel rounded-xl px-4 py-3">
                      <div className="text-[#F7F5F2] text-2xl" style={{ fontFamily: 'var(--font-mono)' }}>
                        {card.metric.value}
                      </div>
                      <div className="text-[#F7F5F2]/60 text-[10px] tracking-widest uppercase">
                        {card.metric.label}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Content */}
              <div className="p-6">
                <span className="eyebrow text-[#141418]/40 mb-2 block text-[10px]">{card.eyebrow}</span>
                <h3 className={`${textClass} text-lg mb-2 group-hover:text-[#141418]/70 transition-colors`}>
                  {card.title}
                </h3>
                <p className={`${subtextClass} text-sm mb-4 line-clamp-2`}>{card.subtitle}</p>
                <div className="flex items-center gap-2 text-[#141418]/50 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}