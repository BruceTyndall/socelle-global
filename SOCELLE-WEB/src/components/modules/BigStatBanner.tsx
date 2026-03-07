import { useEffect, useRef, useState } from 'react';

interface BigStat {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface BigStatBannerProps {
  stats: BigStat[];
  backgroundImage?: string;
  eyebrow?: string;
  title?: string;
}

export function BigStatBanner({ stats, backgroundImage, eyebrow, title }: BigStatBannerProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-16 lg:py-24 overflow-hidden">
      {backgroundImage ? (
        <div className="absolute inset-0">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-mn-dark/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-mn-dark/95 via-mn-dark/80 to-mn-dark/95" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-mn-dark" />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-up animate-pulse" />
              <span className="text-eyebrow text-mn-bg/50">{eyebrow}</span>
            </div>
            {title && <h2 className="text-section text-mn-bg">{title}</h2>}
          </div>
        )}

        <div className={`grid grid-cols-2 ${stats.length >= 4 ? 'lg:grid-cols-4' : `lg:grid-cols-${stats.length}`} gap-8 lg:gap-12`}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="text-metric-xl text-mn-bg font-mono mb-2">
                {stat.prefix}{stat.value}{stat.suffix}
              </div>
              <div className="text-mn-bg/40 text-xs tracking-widest uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
