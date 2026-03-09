// ── OpportunitySignals — V2-INTEL-01 (Module 5/10) ────────────────────
// Cards showing high-confidence upward signals with revenue estimates.
// Each card: signal name, opportunity type, estimated revenue impact,
// confidence, action buttons (Create Deal, Add to Plan).
// Pearl Mineral V2 tokens only.

import { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  PlusCircle,
  ClipboardList,
  X,
} from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface OpportunitySignalsProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
  onCreateDeal?: (signal: IntelligenceSignal) => void;
  onAddToPlan?: (signal: IntelligenceSignal) => void;
  onDismiss?: (signal: IntelligenceSignal) => void;
  maxItems?: number;
}

// ── Component ────────────────────────────────────────────────────────

export function OpportunitySignals({
  signals,
  loading = false,
  onCreateDeal,
  onAddToPlan,
  onDismiss,
  maxItems = 5,
}: OpportunitySignalsProps) {
  const opportunities = useMemo(() => {
    return [...signals]
      .filter((s) => s.direction === 'up' && s.magnitude >= 5)
      .sort((a, b) => {
        // Sort by confidence first (if available), then magnitude
        const confA = a.confidence_score ?? 0;
        const confB = b.confidence_score ?? 0;
        if (confA !== confB) return confB - confA;
        return b.magnitude - a.magnitude;
      })
      .slice(0, maxItems);
  }, [signals, maxItems]);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
        <h3 className="font-sans font-semibold text-[#141418] text-base mb-4">Opportunity Signals</h3>
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-sans text-gray-500">No high-magnitude opportunities right now</p>
          <p className="text-xs font-sans text-gray-400 mt-1">
            Opportunities appear when signals trend up with high magnitude
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
      <h3 className="font-sans font-semibold text-[#141418] text-base mb-4">Opportunity Signals</h3>
      <div className="space-y-4">
        {opportunities.map((signal) => {
          const revenueEstimate = signal.magnitude * 50;
          const confidencePct =
            signal.confidence_score !== undefined
              ? Math.round(signal.confidence_score * 100)
              : null;

          return (
            <div
              key={signal.id}
              className="rounded-xl border border-[#5F8A72]/20 bg-[#5F8A72]/5 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-[#141418] truncate">
                    {signal.title}
                  </p>
                  <p className="text-xs font-sans text-gray-500 mt-0.5">
                    {signal.category ?? signal.signal_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-sans font-bold text-[#5F8A72]">
                    +{signal.magnitude}%
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <DollarSign className="w-3 h-3 text-[#5F8A72]" />
                    <span className="text-xs font-sans font-semibold text-[#5F8A72]">
                      ~${revenueEstimate.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence indicator */}
              {confidencePct !== null && (
                <div className="flex items-center gap-1.5 mb-3">
                  <ShieldCheck className="w-3 h-3 text-[#5F8A72]" />
                  <span className="text-[10px] font-sans text-gray-500">
                    {confidencePct}% confidence
                  </span>
                  {signal.source_name && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-[10px] font-sans text-gray-400">
                        {signal.source_name}
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onCreateDeal?.(signal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#6E879B]/20 text-xs font-sans font-medium text-[#141418] hover:bg-[#E8EDF1] transition-colors"
                >
                  <PlusCircle className="w-3 h-3" />
                  Create Deal
                </button>
                <button
                  type="button"
                  onClick={() => onAddToPlan?.(signal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#6E879B]/20 text-xs font-sans font-medium text-[#141418] hover:bg-[#E8EDF1] transition-colors"
                >
                  <ClipboardList className="w-3 h-3" />
                  Add to Plan
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss?.(signal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
