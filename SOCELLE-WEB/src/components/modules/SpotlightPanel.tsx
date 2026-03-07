import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface TrendingItem {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

interface SpotlightPanelProps {
  image: string;
  imagePosition?: 'left' | 'right';
  eyebrow?: string;
  headline: string;
  metric?: { value: string; label: string };
  bullets?: string[];
  cta?: { label: string; href: string };
  trending?: TrendingItem[];
  dark?: boolean;
}

export function SpotlightPanel({
  image,
  imagePosition = 'left',
  eyebrow,
  headline,
  metric,
  bullets,
  cta,
  trending,
  dark = false,
}: SpotlightPanelProps) {
  const bgClass = dark ? 'bg-mn-dark' : 'bg-mn-bg';
  const textClass = dark ? 'text-mn-bg' : 'text-graphite';
  const subtextClass = dark ? 'text-mn-bg/60' : 'text-graphite/60';

  const imageBlock = (
    <div className="relative rounded-card overflow-hidden aspect-[4/3]">
      <img src={image} alt={headline} className="w-full h-full object-cover" loading="lazy" />
      {metric && (
        <div className="absolute bottom-4 left-4 bg-mn-dark/80 backdrop-blur-sm rounded-2xl px-4 py-3">
          <div className="text-metric-md text-mn-bg font-mono leading-none">{metric.value}</div>
          <div className="text-mn-bg/50 text-xs tracking-widest uppercase mt-1">{metric.label}</div>
        </div>
      )}
    </div>
  );

  const contentBlock = (
    <div className="flex flex-col justify-center">
      {eyebrow && <span className="text-eyebrow text-accent mb-4 block">{eyebrow}</span>}
      <h2 className={`text-subsection ${textClass} mb-6`}>{headline}</h2>

      {bullets && (
        <ul className="space-y-4 mb-8">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span className={`${subtextClass} text-sm leading-relaxed`}>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {cta && (
        <div>
          {cta.href.startsWith('/') ? (
            <Link to={cta.href} className="inline-flex items-center gap-2 text-accent hover:text-accent-hover text-sm font-medium transition-colors">
              {cta.label} <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <a href={cta.href} className="inline-flex items-center gap-2 text-accent hover:text-accent-hover text-sm font-medium transition-colors">
              {cta.label} <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {trending && trending.length > 0 && (
        <div className="mt-8 pt-6 border-t border-graphite/10">
          <h4 className="text-eyebrow text-graphite/40 mb-4">Trending Now</h4>
          <div className="space-y-3">
            {trending.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className={`text-sm ${textClass}`}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-accent">{item.value}</span>
                  {item.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-signal-up" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className={`${bgClass} py-14 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${imagePosition === 'right' ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          {imageBlock}
          {contentBlock}
        </div>
      </div>
    </section>
  );
}
