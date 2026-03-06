import { useEffect, useRef, useState } from 'react';

interface ParallaxOptions {
  speed?: number; // 0.0 – 1.0, default 0.3
  direction?: 'up' | 'down';
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.3, direction = 'up' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let rafId: number;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Only calculate when element is near viewport
      if (rect.bottom < -200 || rect.top > windowH + 200) {
        rafId = requestAnimationFrame(update);
        return;
      }
      const progress = (windowH - rect.top) / (windowH + rect.height);
      const translate = (progress - 0.5) * speed * 100;
      setOffset(direction === 'up' ? -translate : translate);
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [speed, direction]);

  return { ref, offset, style: { transform: `translateY(${offset}px)` } };
}
