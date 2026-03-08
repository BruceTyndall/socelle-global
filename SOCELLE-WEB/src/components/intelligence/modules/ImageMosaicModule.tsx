// ── ImageMosaicModule — V2-INTEL-01 ──────────────────────────────────
// Wrapper: renders asymmetric image mosaic.
// No data hook — static/CMS images passed as props.

import { ImageWithFallback } from './ImageWithFallback';

interface ImageMosaicModuleProps {
  images: string[];
  eyebrow?: string;
  headline?: string;
  dark?: boolean;
}

export function ImageMosaicModule({ images, eyebrow, headline, dark = false }: ImageMosaicModuleProps) {
  const bgClass = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const textClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';

  if (images.length === 0) return null;

  return (
    <section className={`${bgClass} py-14 lg:py-20 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow || headline) && (
          <div className="text-center mb-10">
            {eyebrow && <span className="eyebrow text-[#141418]/50 mb-4 block">{eyebrow}</span>}
            {headline && <h2 className={`${textClass} text-2xl lg:text-4xl`}>{headline}</h2>}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
          {images.slice(0, 6).map((img, i) => {
            const spanClasses = [
              'md:col-span-2 md:row-span-2',
              '',
              '',
              '',
              'md:col-span-2',
              '',
            ];
            const aspectClasses = [
              'aspect-[16/10]',
              'aspect-square',
              'aspect-[3/4]',
              'aspect-[4/3]',
              'aspect-[21/9]',
              'aspect-square',
            ];
            return (
              <div
                key={i}
                className={`${spanClasses[i] || ''} group relative rounded-2xl overflow-hidden`}
              >
                <div className={`${aspectClasses[i] || 'aspect-[4/3]'} w-full`}>
                  <ImageWithFallback
                    src={img}
                    alt={`Visual ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
