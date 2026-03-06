import { useEffect, useRef, useState, type ReactNode } from 'react';

interface SplitPanelProps {
  children: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  bgColor?: string;
  className?: string;
  roundedOuter?: boolean;
}

export default function SplitPanel({
  children,
  imageSrc,
  imageAlt = '',
  imagePosition = 'right',
  bgColor = 'bg-mn-surface',
  className = '',
  roundedOuter = true,
}: SplitPanelProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const imageBlock = (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${bgColor} min-h-[400px] lg:min-h-[520px]`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[14000ms] ease-out ${
            inView ? 'scale-[1.08]' : 'scale-100'
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent/5" />
      )}
    </div>
  );

  const contentBlock = (
    <div className="flex items-center px-8 py-16 lg:px-16 lg:py-20">
      <div className="max-w-xl">
        {children}
      </div>
    </div>
  );

  return (
    <div className={`${roundedOuter ? 'rounded-section' : ''} overflow-hidden ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {imagePosition === 'left' ? (
          <>
            {imageBlock}
            {contentBlock}
          </>
        ) : (
          <>
            {contentBlock}
            {imageBlock}
          </>
        )}
      </div>
    </div>
  );
}
