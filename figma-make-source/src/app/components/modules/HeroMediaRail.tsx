import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SocialProof } from './SocialProof';

interface HeroMediaRailProps {
  image: string;
  eyebrow: string;
  headline: string;
  subtitle: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  overlayMetric?: { value: string; label: string };
}

export function HeroMediaRail({
  image,
  eyebrow,
  headline,
  subtitle,
  primaryCTA,
  secondaryCTA,
  overlayMetric,
}: HeroMediaRailProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={image}
          alt={headline}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(31,36,40,0.88)] via-[rgba(31,36,40,0.5)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,36,40,0.6)] via-transparent to-[rgba(31,36,40,0.3)]" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Glass Panel */}
            <div className="glass-panel rounded-2xl p-8 lg:p-10">
              <span className="eyebrow text-[#F7F5F2]/60 mb-4 block">{eyebrow}</span>
              <h1 className="text-[clamp(2.5rem,5vw,5rem)] text-[#F7F5F2] mb-4 leading-[1.05] tracking-[-0.03em]">
                {headline}
              </h1>
              <p className="text-[#F7F5F2]/70 text-lg lg:text-xl mb-8 max-w-lg">
                {subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                {primaryCTA && (
                  primaryCTA.href.startsWith('/') ? (
                    <Link to={primaryCTA.href} className="btn-liquid-glass btn-liquid-lg">
                      {primaryCTA.label}
                    </Link>
                  ) : (
                    <a href={primaryCTA.href} className="btn-liquid-glass btn-liquid-lg">
                      {primaryCTA.label}
                    </a>
                  )
                )}
                {secondaryCTA && (
                  secondaryCTA.href.startsWith('/') ? (
                    <Link to={secondaryCTA.href} className="btn-liquid-ghost btn-liquid-lg">
                      {secondaryCTA.label}
                    </Link>
                  ) : (
                    <a href={secondaryCTA.href} className="btn-liquid-ghost btn-liquid-lg">
                      {secondaryCTA.label}
                    </a>
                  )
                )}
              </div>
              {/* Social proof — directly below CTAs */}
              <div className="mt-6 pt-6 border-t border-[#F7F5F2]/10">
                <SocialProof dark compact />
              </div>
            </div>
          </div>

          {/* Overlay Metric */}
          {overlayMetric && (
            <div className="absolute bottom-16 right-8 lg:bottom-24 lg:right-16 hidden lg:block">
              <div className="glass-panel rounded-2xl p-8 text-center">
                <div className="text-[#F7F5F2] font-mono text-5xl xl:text-6xl mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                  {overlayMetric.value}
                </div>
                <div className="text-[#F7F5F2]/60 text-xs tracking-widest uppercase">
                  {overlayMetric.label}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <span className="w-2 h-2 rounded-full bg-[#5F8A72] animate-pulse" />
                  <span className="text-[#5F8A72] text-[10px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>LIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}