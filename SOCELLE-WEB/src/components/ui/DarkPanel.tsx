import { HTMLAttributes } from 'react';

type DarkPanelVariant = 'default' | 'elevated';

interface DarkPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant controlling background and depth */
  variant?: DarkPanelVariant;
}

const variantClasses: Record<DarkPanelVariant, string> = {
  default:  'bg-graphite rounded-2xl p-6',
  elevated: 'bg-graphite border border-graphite/20 rounded-2xl p-6 shadow-signal',
};

/**
 * Dark-background container for intelligence sections.
 * Uses the warm graphite by default or the deeper intel-dark
 * with signal shadow for elevated data panels.
 */
export function DarkPanel({
  variant = 'default',
  className = '',
  children,
  ...props
}: DarkPanelProps) {
  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
