// AffiliateBadge.tsx — FTC-compliant commission-linked disclosure badge
// V2-HUBS-10: Required on ALL affiliate/commission-linked product recommendations
// per CLAUDE.md §M and SOCELLE_CANONICAL_DOCTRINE.md.
import { Info } from 'lucide-react';
import { useState } from 'react';

interface AffiliateBadgeProps {
  /** Optional: override badge size */
  size?: 'sm' | 'md';
  /** Optional: additional CSS classes */
  className?: string;
}

/**
 * FTC-compliant "Commission-linked" badge.
 * Must appear on any product recommendation where SOCELLE earns affiliate commission.
 * Displays a tooltip with expanded disclosure on hover/click.
 */
export default function AffiliateBadge({ size = 'sm', className = '' }: AffiliateBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = size === 'md'
    ? 'text-xs px-2.5 py-1'
    : 'text-[10px] px-2 py-0.5';

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(v => !v)}
        className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full bg-signal-warn/10 text-signal-warn font-sans font-semibold border border-signal-warn/20 hover:bg-signal-warn/15 transition-colors cursor-help`}
        aria-label="Commission-linked product disclosure"
      >
        <Info className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        Commission-linked
      </button>

      {showTooltip && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-lg border border-graphite/10 p-3 text-xs font-sans text-graphite/70 leading-relaxed z-50"
        >
          SOCELLE may earn a commission when you purchase through this link.
          This does not affect the price you pay. Product recommendations are
          based on intelligence data and professional relevance, not commission rates.
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </span>
      )}
    </span>
  );
}

/**
 * Wraps a product link with affiliate tracking parameters.
 * If the product has an affiliate_url, use it; otherwise returns the original URL.
 */
export function buildAffiliateUrl(
  originalUrl: string,
  productId: string,
  userId?: string | null
): string {
  if (!originalUrl) return originalUrl;

  try {
    const url = new URL(originalUrl);
    url.searchParams.set('ref', 'socelle');
    url.searchParams.set('pid', productId);
    if (userId) {
      url.searchParams.set('uid', userId);
    }
    return url.toString();
  } catch {
    // If originalUrl is a relative path, append query params
    const separator = originalUrl.includes('?') ? '&' : '?';
    let tracked = `${originalUrl}${separator}ref=socelle&pid=${productId}`;
    if (userId) tracked += `&uid=${userId}`;
    return tracked;
  }
}
