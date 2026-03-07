import { ImageWithFallback } from '../figma/ImageWithFallback';

interface SpotlightPanelProps {
  image: string;
  imagePosition?: 'left' | 'right';
  eyebrow: string;
  headline: string;
  metric?: { value: string; label: string };
  bullets?: string[];
  cta?: { label: string; href: string };
  dark?: boolean;
  id?: string;
}

export function SpotlightPanel({
  image,
  imagePosition = 'left',
  eyebrow,
  headline,
  metric,
  bullets,
  cta,
  dark = false,
  id,
}: SpotlightPanelProps) {
  const bgClass = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const textClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const subtextClass = dark ? 'text-[#F7F5F2]/60' : 'text-[#141418]/60';

  return (
    <section id={id} className={`${bgClass} py-14 lg:py-20 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${imagePosition === 'right' ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center`}>
          {/* Content */}
          <div className="flex-1 w-full">
            <span className="eyebrow text-[#141418]/50 mb-4 block">{eyebrow}</span>
            <h2 className={`${textClass} text-2xl lg:text-4xl mb-6`}>{headline}</h2>

            {metric && (
              <div className="mb-8 p-6 lg:p-8 rounded-2xl inline-block panel-mineral">
                <div className="text-[#141418] text-4xl lg:text-6xl mb-2 relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>
                  {metric.value}
                </div>
                <div className={`${subtextClass} text-xs tracking-widest uppercase`}>
                  {metric.label}
                </div>
              </div>
            )}

            {bullets && (
              <ul className="space-y-3 mb-8">
                {bullets.map((bullet, i) => (
                  <li key={i} className={`flex items-start gap-3 ${subtextClass}`}>
                    <span className="w-1 h-1 rounded-full bg-[#3F5465] mt-2.5 shrink-0" />
                    <span className="text-base lg:text-lg">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {cta && (
              <a href={cta.href} className={dark ? 'btn-liquid-dark' : 'btn-liquid-light'}>
                {cta.label}
              </a>
            )}
          </div>

          {/* Image */}
          <div className="flex-1 w-full">
            <div className="relative rounded-2xl overflow-hidden group aspect-[4/3] lg:aspect-[3/4]">
              <ImageWithFallback
                src={image}
                alt={headline}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}