import { useMemo } from 'react';
import { useScrollReveal } from '../../lib/motion/useScrollReveal';

interface WordRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  staggerMs?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export default function WordReveal({
  text,
  className = '',
  wordClassName = '',
  staggerMs = 60,
  as: Tag = 'p',
}: WordRevealProps) {
  const { ref, visible } = useScrollReveal({ threshold: 0.15 });
  const words = useMemo(() => text.split(/\s+/), [text]);

  return (
    <Tag ref={ref as React.RefObject<never>} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={`inline-block mr-[0.3em] transition-all duration-[600ms] ease-out ${
            visible
              ? 'opacity-100 translate-y-0 blur-0'
              : 'opacity-0 translate-y-3 blur-[8px]'
          } ${wordClassName}`}
          style={{ transitionDelay: `${i * staggerMs}ms` }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
