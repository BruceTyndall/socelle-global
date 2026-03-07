/* ═══════════════════════════════════════════════════════════════
   HeroMediaRail — W12-26 Section Primitive
   Full-bleed media hero with headline overlay + single CTA.
   Supports video (muted, loop, lazy) or static image.
   Pearl Mineral V2 tokens only.
   ═══════════════════════════════════════════════════════════════ */
import { type ReactNode } from 'react';

interface HeroMediaRailProps {
  /** Eyebrow chip text above headline */
  eyebrow?: ReactNode;
  /** Main headline */
  headline: string;
  /** Subtitle / supporting copy */
  subtitle?: string;
  /** CTA element(s) */
  cta?: ReactNode;
  /** Video source — muted autoplay loop */
  videoSrc?: string;
  /** Poster fallback for video */
  poster?: string;
  /** Static image fallback (used when no video) */
  imageSrc?: string;
  imageAlt?: string;
  /** Overlay intensity: 'light' fades to bg, 'dark' keeps dark */
  overlay?: 'light' | 'dark';
  /** Min height — defaults to 100svh */
  minHeight?: string;
  /** Extra className on outer wrapper */
  className?: string;
}

export default function HeroMediaRail({
  eyebrow,
  headline,
  subtitle,
  cta,
  videoSrc,
  poster,
  imageSrc,
  imageAlt = '',
  overlay = 'light',
  minHeight = '100svh',
  className = '',
}: HeroMediaRailProps) {
  const gradientClass = overlay === 'dark'
    ? 'bg-gradient-to-t from-mn-dark/90 via-mn-dark/50 to-transparent'
    : 'bg-gradient-to-t from-mn-bg via-mn-bg/80 to-transparent';

  const textColor = overlay === 'dark' ? 'text-white' : 'text-graphite';
  const subtitleColor = overlay === 'dark' ? 'text-white/70' : 'text-graphite/60';

  return (
    <section
      className={`relative flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight }}
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
        ) : imageSrc ? (
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
          />
        ) : null}
        <div className={`absolute inset-0 ${gradientClass}`} />
      </div>

      {/* ── Content Layer ── */}
      <div className="relative z-10 section-container w-full flex flex-col items-center text-center px-4 py-24">
        {eyebrow && <div className="mb-8">{eyebrow}</div>}

        <h1 className={`max-w-4xl font-sans font-light text-hero tracking-tight leading-[1.05] mb-6 ${textColor}`}>
          {headline}
        </h1>

        {subtitle && (
          <p className={`max-w-2xl text-xl md:text-2xl font-sans font-light leading-relaxed mb-12 ${subtitleColor}`}>
            {subtitle}
          </p>
        )}

        {cta && <div className="flex flex-col sm:flex-row items-center justify-center gap-4">{cta}</div>}
      </div>
    </section>
  );
}
