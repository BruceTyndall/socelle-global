// ── Freshness Helpers — V2-INTEL-01 ──────────────────────────────────
// Time-ago formatting and freshness color utilities.
// All freshness is derived from real DB `updated_at` values — never synthetic.

export function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getFreshnessColor(date: Date): string {
  const minutes = (Date.now() - date.getTime()) / 60000;
  if (minutes < 60) return 'text-[#5F8A72]';
  if (minutes < 1440) return 'text-[#A97A4C]';
  return 'text-[#8E6464]';
}

export function getFreshnessDot(date: Date): string {
  const minutes = (Date.now() - date.getTime()) / 60000;
  if (minutes < 60) return 'bg-[#5F8A72]';
  if (minutes < 1440) return 'bg-[#A97A4C]';
  return 'bg-[#8E6464]';
}
