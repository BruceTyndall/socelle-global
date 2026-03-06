import { Clock } from 'lucide-react';

interface FreshnessLabelProps {
  updatedAt: string;
}

function getRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `Updated ${diffMin}m ago`;
  if (diffHr < 24) return `Updated ${diffHr}h ago`;
  if (diffDay < 2) return 'Updated yesterday';
  if (diffDay < 7) return `Updated ${diffDay}d ago`;
  if (diffDay < 30) return 'This month';
  return 'Last month';
}

export default function FreshnessLabel({ updatedAt }: FreshnessLabelProps) {
  return (
    <span className="inline-flex items-center gap-1 text-white/40 text-xs font-sans">
      <Clock className="w-3 h-3" />
      {getRelativeTime(updatedAt)}
    </span>
  );
}
