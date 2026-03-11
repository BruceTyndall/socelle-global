/* ═══════════════════════════════════════════════════════════════
   SignalEmptyState — Empty state for signal feeds / lists
   Pearl Mineral V2 · Three variants:
     - 'no-signals' (default): no signals in DB at all
     - 'no-results': filter/search returned nothing
     - 'no-ai-results': AI tool returned no useful output
   ═══════════════════════════════════════════════════════════════ */

import { Link } from 'react-router-dom';
import { BarChart3, Search, Sparkles } from 'lucide-react';

type EmptyVariant = 'no-signals' | 'no-results' | 'no-ai-results';

interface SignalEmptyStateProps {
  variant?: EmptyVariant;
  /** Optional callback for clearing filters / retrying */
  onAction?: () => void;
}

const CONFIG: Record<EmptyVariant, {
  icon: typeof BarChart3;
  heading: string;
  message: string;
  actionLabel?: string;
  showAccessCta?: boolean;
}> = {
  'no-signals': {
    icon: BarChart3,
    heading: 'No signals available',
    message: 'Market signals are collected from 37+ professional beauty data sources. Check back when new signals are ingested.',
    showAccessCta: true,
  },
  'no-results': {
    icon: Search,
    heading: 'No matching signals',
    message: 'Adjust your search query or clear the filter to see all available signals.',
    actionLabel: 'Clear filters',
  },
  'no-ai-results': {
    icon: Sparkles,
    heading: 'No results generated',
    message: 'The intelligence engine did not produce results for this query. Try adjusting your input or selecting a different signal.',
    actionLabel: 'Try again',
  },
};

export default function SignalEmptyState({
  variant = 'no-signals',
  onAction,
}: SignalEmptyStateProps) {
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Mineral ring illustration */}
      <div className="relative w-16 h-16 mb-6 flex items-center justify-center" aria-hidden>
        <div className="absolute inset-0 rounded-full border border-graphite/10" />
        <div className="absolute inset-3 rounded-full border border-graphite/8" />
        <Icon className="w-5 h-5 text-graphite/20" />
      </div>

      <p className="text-sm font-semibold text-graphite/45 mb-1.5 tracking-wide uppercase">
        {cfg.heading}
      </p>
      <p className="text-sm text-graphite/30 max-w-xs leading-relaxed mb-6">
        {cfg.message}
      </p>

      <div className="flex items-center gap-3">
        {cfg.actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 text-sm font-medium text-accent border border-accent/20 rounded-lg hover:bg-accent/5 transition-colors"
          >
            {cfg.actionLabel}
          </button>
        )}
        {cfg.showAccessCta && (
          <Link
            to="/request-access"
            className="px-4 py-2 text-sm font-medium text-white bg-graphite rounded-lg hover:bg-graphite/85 transition-colors"
          >
            Request access
          </Link>
        )}
      </div>
    </div>
  );
}
