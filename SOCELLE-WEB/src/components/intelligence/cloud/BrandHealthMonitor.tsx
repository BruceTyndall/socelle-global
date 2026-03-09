// ── BrandHealthMonitor — V2-INTEL-01 (Module 9/10) ────────────────────
// Dashboard for a single brand's signal health. KPI strip showing
// signals mentioning the brand, sentiment proxy, market share proxy.
// DEMO-badged (needs brand health feed data).
// Pearl Mineral V2 tokens only.

import { useMemo } from 'react';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface BrandHealthMonitorProps {
  signals: IntelligenceSignal[];
  brandName?: string;
  loading?: boolean;
}

// ── Component ────────────────────────────────────────────────────────

export function BrandHealthMonitor({
  signals,
  brandName,
  loading = false,
}: BrandHealthMonitorProps) {
  // Filter signals mentioning selected brand
  const brandSignals = useMemo(() => {
    if (!brandName) return [];
    const nameLower = brandName.toLowerCase();
    return signals.filter(
      (s) =>
        s.related_brands?.some((b) => b.toLowerCase() === nameLower) ||
        s.title.toLowerCase().includes(nameLower),
    );
  }, [signals, brandName]);

  // Available brand names from signals
  const availableBrands = useMemo(() => {
    const brands = new Map<string, number>();
    for (const s of signals) {
      if (s.related_brands) {
        for (const b of s.related_brands) {
          brands.set(b, (brands.get(b) ?? 0) + 1);
        }
      }
    }
    return Array.from(brands.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [signals]);

  // KPIs
  const kpis = useMemo(() => {
    const total = brandSignals.length;
    const upCount = brandSignals.filter((s) => s.direction === 'up').length;
    const downCount = brandSignals.filter((s) => s.direction === 'down').length;

    // Sentiment proxy: ratio of up vs down signals
    const sentimentScore = total > 0 ? Math.round(((upCount - downCount) / total) * 100) : 0;

    // Market share proxy: % of total signals that mention this brand
    const shareProxy = signals.length > 0 ? Math.round((total / signals.length) * 100) : 0;

    // Avg confidence
    const scored = brandSignals.filter((s) => s.confidence_score !== undefined);
    const avgConf = scored.length > 0
      ? Math.round((scored.reduce((sum, s) => sum + (s.confidence_score ?? 0), 0) / scored.length) * 100)
      : 0;

    return { total, upCount, downCount, sentimentScore, shareProxy, avgConf };
  }, [brandSignals, signals]);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-44 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#6E879B]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#6E879B]" />
            <h3 className="font-sans font-semibold text-[#141418] text-base">
              Brand Health Monitor
            </h3>
          </div>
          <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
            DEMO
          </span>
        </div>
      </div>

      {/* DEMO notice */}
      <div className="px-6 py-2.5 bg-[#A97A4C]/5 border-b border-[#A97A4C]/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#A97A4C] flex-shrink-0" />
          <p className="text-[11px] font-sans text-[#A97A4C]">
            Brand health metrics are derived from signal mentions. Full brand health requires dedicated data feeds.
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* No brand selected */}
        {!brandName && (
          <div>
            <p className="text-sm font-sans text-gray-500 mb-3">Select a brand to view health metrics:</p>
            {availableBrands.length === 0 ? (
              <div className="text-center py-6">
                <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-sans text-gray-400">No brand references in current signals</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableBrands.map(([brand, count]) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8EDF1] text-xs font-sans font-medium text-[#141418]"
                  >
                    {brand}
                    <span className="text-gray-400">({count})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Brand selected */}
        {brandName && (
          <>
            <p className="text-sm font-sans font-medium text-[#141418] mb-4">{brandName}</p>

            {brandSignals.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-sans text-gray-500">No signals found for this brand</p>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="rounded-lg bg-[#E8EDF1] p-3">
                    <Activity className="w-4 h-4 text-[#6E879B] mb-1" />
                    <p className="text-lg font-sans font-bold text-[#141418]">{kpis.total}</p>
                    <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider">Mentions</p>
                  </div>
                  <div className="rounded-lg bg-[#5F8A72]/10 p-3">
                    <TrendingUp className="w-4 h-4 text-[#5F8A72] mb-1" />
                    <p className="text-lg font-sans font-bold text-[#141418]">
                      {kpis.sentimentScore > 0 ? '+' : ''}{kpis.sentimentScore}%
                    </p>
                    <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider">Sentiment</p>
                  </div>
                  <div className="rounded-lg bg-[#E8EDF1] p-3">
                    <BarChart3 className="w-4 h-4 text-[#6E879B] mb-1" />
                    <p className="text-lg font-sans font-bold text-[#141418]">{kpis.shareProxy}%</p>
                    <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider">Share Proxy</p>
                  </div>
                  <div className="rounded-lg bg-[#A97A4C]/10 p-3">
                    <ShieldCheck className="w-4 h-4 text-[#A97A4C] mb-1" />
                    <p className="text-lg font-sans font-bold text-[#141418]">{kpis.avgConf}%</p>
                    <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider">Avg Confidence</p>
                  </div>
                </div>

                {/* Recent signals */}
                <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Recent Signals
                </p>
                <div className="space-y-1.5">
                  {brandSignals.slice(0, 5).map((signal) => {
                    const dirConfig = {
                      up: { icon: TrendingUp, cls: 'text-[#5F8A72]' },
                      down: { icon: TrendingDown, cls: 'text-[#8E6464]' },
                      stable: { icon: Minus, cls: 'text-gray-400' },
                    };
                    const dc = dirConfig[signal.direction];
                    const DirIcon = dc.icon;

                    return (
                      <div
                        key={signal.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F6F3EF] transition-colors"
                      >
                        <DirIcon className={`w-3.5 h-3.5 flex-shrink-0 ${dc.cls}`} />
                        <span className="text-xs font-sans text-[#141418] flex-1 truncate">
                          {signal.title}
                        </span>
                        <span className={`text-xs font-sans font-semibold ${dc.cls}`}>
                          {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}
                          {signal.magnitude}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
