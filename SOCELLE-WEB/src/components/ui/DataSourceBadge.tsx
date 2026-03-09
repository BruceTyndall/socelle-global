/**
 * DataSourceBadge — Component-level LIVE/DEMO enforcement.
 * FOUND-WO-13: Every data-displaying component must label its source.
 *
 * Usage:
 *   <DataSourceBadge isLive={isLive} />
 *   <DataSourceBadge isLive={isLive} size="sm" />
 *   <DataSourceBadge isLive={false} label="Preview data" />
 */

interface DataSourceBadgeProps {
  /** Whether the data comes from a real database query */
  isLive: boolean;
  /** Override the default label */
  label?: string;
  /** Badge size */
  size?: 'sm' | 'md';
  /** Optional className */
  className?: string;
}

export function DataSourceBadge({ isLive, label, size = 'sm', className = '' }: DataSourceBadgeProps) {
  if (isLive) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-up opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-up" />
        </span>
        <span
          className={`text-signal-up tracking-[0.25em] uppercase font-semibold ${
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {label ?? 'LIVE'}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`font-semibold rounded-full bg-signal-warn/10 text-signal-warn ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      {label ?? 'DEMO'}
    </span>
  );
}

/**
 * DataSourceBanner — Full-width banner for page-level DEMO surfaces.
 * Use on pages where the entire page is demo/preview data.
 */
export function DataSourceBanner({
  message = 'This data is for demonstration purposes. Sign in for live intelligence.',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center ${className}`}
    >
      PREVIEW — {message}
    </div>
  );
}
