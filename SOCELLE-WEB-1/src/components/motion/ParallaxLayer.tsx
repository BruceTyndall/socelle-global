import { type ReactNode } from 'react';
import { useParallax } from '../../lib/motion/useParallax';

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}

export default function ParallaxLayer({
  children,
  speed = 0.3,
  direction = 'up',
  className = '',
}: ParallaxLayerProps) {
  const { ref, style } = useParallax({ speed, direction });

  return (
    <div ref={ref} className={`will-change-transform ${className}`} style={style}>
      {children}
    </div>
  );
}
