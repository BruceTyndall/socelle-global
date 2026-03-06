import { type ReactNode } from 'react';
import { useScrollReveal } from '../../lib/motion/useScrollReveal';

interface GradientMarkProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export default function GradientMark({
  children,
  className = '',
  color = 'rgba(110, 135, 155, 0.15)',
}: GradientMarkProps) {
  const { ref, visible } = useScrollReveal({ threshold: 0.3 });

  return (
    <mark
      ref={ref as React.RefObject<never>}
      className={`relative inline bg-transparent text-inherit no-underline ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${color}, ${color})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left bottom',
        backgroundSize: visible ? '100% 40%' : '0% 40%',
        transition: 'background-size 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </mark>
  );
}
