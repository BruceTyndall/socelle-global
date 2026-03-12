// ── EmbedIntelligenceBlock — AUTH-CORE-04 ─────────────────────────────
// CMS block type that renders live market_signals inline.
// TanStack Query v5 | Pearl Mineral V2 | LIVE badge | no spinners.

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useIntelligence } from '../../../lib/intelligence/useIntelligence';

// ── Types ──────────────────────────────────────────────────────────────

interface MarketSignalRow {
  id: string;
  title: string | null;
  category: string | null;
  signal_type: string | null;
  direction: string | null;
  confidence_score: number | null;
  updated_at: string | null;
}

export interface EmbedIntelligenceBlockProps {
  block: {
    id: string;
    properties: {
      vertical?: string;
      limit?: number;
      show_confidence?: boolean;
    };
  };
}

// ── Helpers ────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Direction badge ────────────────────────────────────────────────────

function DirectionBadge({ direction }: { direction: string | null }) {
  if (direction === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal-up/10 text-signal-up">
        <TrendingUp className="w-3 h-3" />
        Rising
      </span>
    );
  }
  if (direction === 'down') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal-down/10 text-signal-down">
        <TrendingDown className="w-3 h-3" />
        Declining
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal-warn/10 text-signal-warn">
      <Minus className="w-3 h-3" />
      Stable
    </span>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────

function SignalSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-graphite/10 bg-white/60 p-4 space-y-2">
      <div className="h-3.5 w-3/4 rounded bg-graphite/10" />
      <div className="h-3 w-1/3 rounded bg-graphite/8" />
      <div className="h-5 w-16 rounded-full bg-graphite/10" />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export function EmbedIntelligenceBlock({ block }: EmbedIntelligenceBlockProps) {
  const { vertical, limit = 3, show_confidence = false } = block.properties;
  const clampedLimit = Math.max(1, Math.min(5, limit));

  const { signals, loading: isLoading } = useIntelligence({
    limit: clampedLimit,
    vertical: vertical as any,
  });

  // ── Loading ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: clampedLimit }).map((_, i) => (
          <SignalSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────
  if (signals.length === 0) {
    return (
      <div className="rounded-lg border border-graphite/10 bg-white/60 px-5 py-6 text-center">
        <p className="text-sm text-graphite/50">
          No signals available for this topic.
        </p>
      </div>
    );
  }

  // ── Signals list ───────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* LIVE badge header */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-signal-up">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-up animate-pulse" />
          LIVE
        </span>
        {vertical && (
          <span className="text-[11px] text-graphite/40 capitalize">{vertical} signals</span>
        )}
      </div>

      {signals.map((signal) => (
        <div
          key={signal.id}
          className="rounded-lg border border-graphite/10 bg-white/60 p-4 space-y-1.5"
        >
          <p className="text-sm font-medium text-graphite leading-snug">
            {signal.title ?? 'Untitled signal'}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {signal.category && (
              <span className="text-[10px] text-graphite/40 uppercase tracking-wide">
                {signal.category}
              </span>
            )}
            <DirectionBadge direction={signal.direction} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {show_confidence && signal.confidence_score != null && (
              <span className="text-[10px] text-graphite/50">
                Confidence: {Math.round(signal.confidence_score * 100)}%
              </span>
            )}
            {signal.updated_at && (
              <span className="text-[10px] text-graphite/40">
                {relativeTime(signal.updated_at)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
