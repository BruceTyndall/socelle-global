interface ImageMosaicProps {
  images: string[];
  eyebrow?: string;
  headline?: string;
  dark?: boolean;
}

export function ImageMosaic({ images, eyebrow, headline, dark = false }: ImageMosaicProps) {
  const bgClass = dark ? 'bg-mn-dark' : 'bg-mn-bg';
  const textClass = dark ? 'text-mn-bg' : 'text-graphite';

  const spanClasses = [
    'md:col-span-2 md:row-span-2',
    '', '', '', '', '',
  ];
  const aspectClasses = [
    'aspect-square',
    'aspect-[4/3]',
    'aspect-[4/3]',
    'aspect-[4/3]',
    'aspect-[4/3]',
    'aspect-square',
  ];

  return (
    <section className={`${bgClass} py-14 lg:py-20 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow || headline) && (
          <div className="text-center mb-10">
            {eyebrow && <span className="text-eyebrow text-graphite/50 mb-4 block">{eyebrow}</span>}
            {headline && <h2 className={`${textClass} text-section`}>{headline}</h2>}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
          {images.slice(0, 6).map((img, i) => (
            <div
              key={i}
              className={`${spanClasses[i] || ''} group relative rounded-card overflow-hidden`}
            >
              <div className={`${aspectClasses[i] || 'aspect-[4/3]'} relative`}>
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-graphite/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
