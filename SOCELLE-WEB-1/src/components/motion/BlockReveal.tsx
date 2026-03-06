import { type ReactNode } from 'react';
import { useScrollReveal } from '../../lib/motion/useScrollReveal';

interface BlockRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  as?: 'div' | 'section' | 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function BlockReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  as: Tag = 'div',
}: BlockRevealProps) {
  const { ref, visible } = useScrollReveal({ threshold });

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={`transition-all duration-[800ms] ease-out ${
        visible
          ? 'opacity-100 translate-y-0 blur-0'
          : 'opacity-0 translate-y-6 blur-[12px]'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
