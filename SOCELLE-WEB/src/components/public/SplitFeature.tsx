/* ═══════════════════════════════════════════════════════════════
   SplitFeature — W12-26 Section Primitive
   50/50 narrative + proof block. Supports video or image media.
   Alternates layout direction via `mediaPosition`.
   Pearl Mineral V2 tokens only.
   ═══════════════════════════════════════════════════════════════ */
import { type ReactNode } from 'react';

interface SplitFeatureProps {
  /** Narrative side content — headline, body, CTA */
  children: ReactNode;
  /** Video source for media side */
  videoSrc?: string;
  poster?: string;
  /** Static image for media side */
  imageSrc?: string;
  imageAlt?: string;
  /** Which side the media goes on */
  mediaPosition?: 'left' | 'right';
  /** Background tone */
  bg?: 'default' | 'surface' | 'dark';
  /** Extra className */
  className?: string;
}

export default function SplitFeature({
  children,
  videoSrc,
  poster,
  imageSrc,
  imageAlt = '',
  mediaPosition = 'left',
  bg = 'default',
  className = '',
}: SplitFeatureProps) {
  const bgClass = bg === 'dark'
    ? 'bg-mn-dark text-white'
    : bg === 'surface'
      ? 'bg-mn-surface text-graphite'
      : 'bg-mn-bg text-graphite';

  const mediaOrder = mediaPosition === 'left' ? 'order-1' : 'order-1 lg:order-2';
  const contentOrder = mediaPosition === 'left' ? 'order-2' : 'order-2 lg:order-1';

  return (
    <section className={`py-24 lg:py-32 ${bgClass} ${className}`}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* ── Media Column ── */}
          <div className={`${mediaOrder}`}>
            <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-panel group">
              {videoSrc ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-cinematic"
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
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-cinematic"
                  src={imageSrc}
                  alt={imageAlt}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-mn-surface" />
              )}
              {/* Subtle grading overlay */}
              <div className="absolute inset-0 bg-graphite/5 mix-blend-multiply pointer-events-none" />
            </div>
          </div>

          {/* ── Content Column ── */}
          <div className={`${contentOrder}`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
