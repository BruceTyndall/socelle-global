import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const bgClass = dark ? 'bg-mn-dark' : 'bg-mn-bg';
  const textClass = dark ? 'text-mn-bg' : 'text-graphite';
  const subtextClass = dark ? 'text-mn-bg/60' : 'text-graphite/60';
  const cardBg = dark ? 'bg-mn-dark border border-mn-bg/10' : 'bg-white border border-graphite/5';
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <section className={`${bgClass} py-14 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow || headline) && (
          <div className="mb-10">
            {eyebrow && <span className="text-eyebrow text-graphite/50 mb-3 block">{eyebrow}</span>}
            {headline && <h2 className={`${textClass} text-subsection`}>{headline}</h2>}
          </div>
        )}
        <div className={`grid grid-cols-1 ${gridCols} gap-6 lg:gap-8`}>
          {cards.map((card) => {
            const inner = (
              <>
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {card.badge && (
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-signal-up/15 text-signal-up backdrop-blur-sm">
                        {card.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 lg:p-6">
                  <span className="text-eyebrow text-accent mb-2 block">{card.eyebrow}</span>
                  <h3 className={`${textClass} text-lg font-medium mb-2 group-hover:text-accent transition-colors`}>{card.title}</h3>
                  <p className={`${subtextClass} text-sm mb-4 line-clamp-2`}>{card.subtitle}</p>
                  {card.metric && (
                    <div className="flex items-center gap-2 pt-3 border-t border-graphite/5">
                      <TrendingUp className="w-3.5 h-3.5 text-signal-up" />
                      <span className="font-mono text-sm text-graphite">{card.metric.value}</span>
                      <span className="text-graphite/40 text-xs">{card.metric.label}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </>
            );

            const cardClasses = `${cardBg} rounded-card overflow-hidden group transition-all duration-500 hover:shadow-panel`;

            if (card.href?.startsWith('/')) {
              return <Link key={card.id} to={card.href} className={cardClasses}>{inner}</Link>;
            }
            return <a key={card.id} href={card.href || '#'} className={cardClasses}>{inner}</a>;
          })}
        </div>
      </div>
    </section>
  );
}
