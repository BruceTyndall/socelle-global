import { HTMLAttributes } from 'react';

type DarkPanelVariant = 'default' | 'elevated';

interface DarkPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant controlling background and depth */
  variant?: DarkPanelVariant;
}

const variantClasses: Record<DarkPanelVariant, string> = {
  default:  'bg-pro-charcoal rounded-2xl p-6',
  elevated: 'bg-intel-dark border border-intel-border rounded-2xl p-6 shadow-signal',
};

/**
 * Dark-background container for intelligence sections.
 * Uses the warm pro-charcoal by default or the deeper intel-dark
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
