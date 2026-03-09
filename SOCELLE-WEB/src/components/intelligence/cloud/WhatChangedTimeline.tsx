// ── WhatChangedTimeline — V2-INTEL-01 (Module 4/10) ───────────────────
// Vertical timeline of recent signal changes. Each entry: signal name,
// what changed (direction/magnitude/confidence), when, source.
// Filter by timeframe (24h/7d/30d). Pearl Mineral V2 tokens only.

import { useState, useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface WhatChangedTimelineProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
  maxItems?: number;
}

type TimeFilter = '24h' | '7d' | '30d';

// ── Helpers ──────────────────────────────────────────────────────────

const TIMEFRAME_MS: Record<TimeFilter, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Component ────────────────────────────────────────────────────────

export function WhatChangedTimeline({ signals, loading = false, maxItems = 15 }: WhatChangedTimelineProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');

  const filteredRecent = useMemo(() => {
    const cutoff = Date.now() - TIMEFRAME_MS[timeFilter];
    return [...signals]
      .filter((s) => new Date(s.updated_at).getTime() > cutoff)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, maxItems);
  }, [signals, timeFilter, maxItems]);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-200 mt-1.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans font-semibold text-[#141418] text-base">What Changed</h3>
        <div className="flex items-center gap-1 bg-[#F6F3EF] rounded-lg p-0.5">
          {(['24h', '7d', '30d'] as TimeFilter[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeFilter(tf)}
              className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors ${
                timeFilter === tf
                  ? 'bg-white text-[#141418] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filteredRecent.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-sans text-gray-500">No changes in the last {timeFilter}</p>
        </div>
      )}

      {/* Timeline */}
      {filteredRecent.length > 0 && (
        <div className="space-y-0">
          {filteredRecent.map((signal, idx) => {
            const dirConfig = {
              up: { icon: TrendingUp, cls: 'text-[#5F8A72]', bg: 'bg-[#5F8A72]' },
              down: { icon: TrendingDown, cls: 'text-[#8E6464]', bg: 'bg-[#8E6464]' },
              stable: { icon: Minus, cls: 'text-gray-400', bg: 'bg-gray-400' },
            };
            const dc = dirConfig[signal.direction];
            const DirIcon = dc.icon;
            const isLast = idx === filteredRecent.length - 1;

            return (
              <div key={signal.id} className="flex gap-3">
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${dc.bg} mt-1.5 flex-shrink-0`} />
                  {!isLast && <div className="w-px flex-1 bg-gray-200" />}
                </div>
                {/* Content */}
                <div className={`pb-4 flex-1 min-w-0`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-sans text-gray-400">
                      {formatTimeAgo(signal.updated_at)}
                    </span>
                    <DirIcon className={`w-3 h-3 ${dc.cls}`} />
                    <span className={`text-xs font-sans font-semibold ${dc.cls}`}>
                      {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}
                      {signal.magnitude}%
                    </span>
                  </div>
                  <p className="text-sm font-sans font-medium text-[#141418] truncate">
                    {signal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {signal.source_name && (
                      <span className="text-[10px] font-sans text-gray-400">
                        via {signal.source_name}
                      </span>
                    )}
                    {signal.confidence_score !== undefined && (
                      <span className="text-[10px] font-sans text-gray-400">
                        {Math.round(signal.confidence_score * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
