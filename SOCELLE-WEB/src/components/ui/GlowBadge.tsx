import { HTMLAttributes } from 'react';

type GlowBadgeVariant = 'up' | 'down' | 'stable' | 'new' | 'ce';

interface GlowBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant controlling color and glow */
  variant: GlowBadgeVariant;
}

const variantClasses: Record<GlowBadgeVariant, string> = {
  up:     'text-signal-up   bg-signal-up/10   shadow-[0_0_8px_rgba(95,138,114,0.2)]',
  down:   'text-signal-down bg-signal-down/10 shadow-[0_0_8px_rgba(142,100,100,0.2)]',
  stable: 'text-graphite/60 bg-graphite/10',
  new:    'text-accent bg-accent/10 shadow-[0_0_8px_rgba(110,135,155,0.2)]',
  ce:     'text-edu-primary  bg-edu-primary/10  shadow-[0_0_8px_rgba(124,58,237,0.2)]',
};

/**
 * Small badge with a subtle glow effect for intelligence and
 * education contexts. Variants map to trend direction (up/down/stable),
 * new-item indicators, and continuing-education (ce) markers.
 */
export function GlowBadge({
  variant,
  className = '',
  children,
  ...props
}: GlowBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-sans transition-shadow duration-200 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
