/* ═══════════════════════════════════════════════════════════════
   HeroMediaRail — W12-26 / W14-01 Section Primitive
   Full-bleed media hero with headline overlay.
   Supports: video (muted, loop) or static image.
   V2 API: primaryCTA/secondaryCTA objects + overlayMetric.
   Legacy API: cta ReactNode (backward compat).
   Pearl Mineral V2 tokens only.
   ═══════════════════════════════════════════════════════════════ */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CTALink {
  label: string;
  href: string;
}

interface OverlayMetric {
  value: string;
  label: string;
}

interface HeroMediaRailProps {
  eyebrow?: ReactNode;
  headline: string;
  subtitle?: string;
  /** V1 API — pass any ReactNode for CTAs */
  cta?: ReactNode;
  /** V2 API — structured CTA objects */
  primaryCTA?: CTALink;
  secondaryCTA?: CTALink;
  /** Floating metric badge (bottom-right on image heroes) */
  overlayMetric?: OverlayMetric;
  /** Hero image URL (V2 shorthand — equivalent to imageSrc) */
  image?: string;
  videoSrc?: string;
  poster?: string;
  imageSrc?: string;
  imageAlt?: string;
  overlay?: 'light' | 'dark';
  minHeight?: string;
  className?: string;
}

export default function HeroMediaRail({
  eyebrow,
  headline,
  subtitle,
  cta,
  primaryCTA,
  secondaryCTA,
  overlayMetric,
  image,
  videoSrc,
  poster,
  imageSrc,
  imageAlt = '',
  overlay,
  minHeight,
  className = '',
}: HeroMediaRailProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const resolvedImage = image || imageSrc;
  const hasImage = !!resolvedImage && !videoSrc;

  // Auto-detect overlay: image heroes default to 'dark', video to 'dark', no media to 'light'
  const resolvedOverlay = overlay ?? (resolvedImage || videoSrc ? 'dark' : 'light');
  const resolvedMinHeight = minHeight ?? (hasImage ? '90vh' : '100svh');

  const textColor = resolvedOverlay === 'dark' ? 'text-white' : 'text-graphite';
  const subtitleColor = resolvedOverlay === 'dark' ? 'text-white/70' : 'text-graphite/60';

  // Render a CTA link — internal paths use Link, external use <a>
  const renderCTA = (cta: CTALink, variant: 'primary' | 'secondary') => {
    const cls = variant === 'primary'
      ? 'inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white/25 transition-all duration-300'
      : 'inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/15 text-white/70 text-sm font-medium tracking-wide hover:text-white hover:border-white/30 transition-all duration-300';

    if (cta.href.startsWith('/')) {
      return <Link key={cta.label} to={cta.href} className={cls}>{cta.label}</Link>;
    }
    return <a key={cta.label} href={cta.href} className={cls}>{cta.label}</a>;
  };

  return (
    <section
      className={`relative flex flex-col justify-end overflow-hidden ${className}`}
      style={{ minHeight: resolvedMinHeight }}
    >
      {/* ── Media Layer ── */}
      <div className="absolute inset-0 w-full h-full bg-mn-dark">
        {videoSrc ? (
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ) : resolvedImage ? (
          <img
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={resolvedImage}
            alt={imageAlt || headline}
            loading="eager"
            onLoad={() => setImgLoaded(true)}
          />
        ) : null}
        {/* Gradient overlays */}
        {hasImage ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-mn-dark/90 via-mn-dark/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-mn-dark/60 via-transparent to-mn-dark/30" />
          </>
        ) : (
          <div className={`absolute inset-0 ${
            resolvedOverlay === 'dark'
              ? 'bg-gradient-to-t from-mn-dark/90 via-mn-dark/50 to-transparent'
              : 'bg-gradient-to-t from-mn-bg via-mn-bg/80 to-transparent'
          }`} />
        )}
      </div>

      {/* ── Content Layer ── */}
      <div className={`relative z-10 w-full px-4 sm:px-6 lg:px-8 ${hasImage ? 'max-w-7xl mx-auto pb-16 lg:pb-24 pt-32' : 'section-container flex flex-col items-center text-center py-24'}`}>
        <div className={hasImage ? 'max-w-2xl' : ''}>
          {eyebrow && (
            <div className={`mb-6 ${!hasImage ? 'mb-8' : ''}`}>
              {typeof eyebrow === 'string' ? (
                <span className="text-eyebrow text-white/50">{eyebrow}</span>
              ) : eyebrow}
            </div>
          )}

          <h1 className={`font-sans font-light text-hero tracking-tight leading-[1.05] mb-6 ${hasImage ? 'text-white' : textColor} ${!hasImage ? 'max-w-4xl' : ''}`}>
            {headline}
          </h1>

          {subtitle && (
            <p className={`text-lg lg:text-xl font-sans font-light leading-relaxed mb-8 ${hasImage ? 'text-white/70 max-w-lg' : `max-w-2xl text-xl md:text-2xl mb-12 ${subtitleColor}`}`}>
              {subtitle}
            </p>
          )}

          {/* V2 structured CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-wrap gap-4 justify-center">
              {primaryCTA && renderCTA(primaryCTA, 'primary')}
              {secondaryCTA && renderCTA(secondaryCTA, 'secondary')}
            </div>
          )}

          {/* V1 legacy CTA slot */}
          {cta && !primaryCTA && !secondaryCTA && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">{cta}</div>
          )}
        </div>
      </div>

      {/* ── Overlay Metric Badge ── */}
      {overlayMetric && hasImage && (
        <div className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12 z-10 hidden md:block">
          <div className="bg-mn-dark/70 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10">
            <div className="text-white font-mono text-3xl lg:text-4xl font-bold tracking-tight">{overlayMetric.value}</div>
            <div className="text-white/50 text-xs tracking-widest uppercase mt-1">{overlayMetric.label}</div>
          </div>
        </div>
      )}
    </section>
  );
}
