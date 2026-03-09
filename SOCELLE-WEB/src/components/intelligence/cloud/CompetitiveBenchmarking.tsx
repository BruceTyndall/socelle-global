// ── CompetitiveBenchmarking — V2-INTEL-01 (Module 8/10) ───────────────
// Compare signals across brands. Comparison matrix: rows=signals,
// columns=brands, cells=direction+magnitude.
// DEMO-badged (needs competitive data feed).
// Pearl Mineral V2 tokens only.

import { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface CompetitiveBenchmarkingProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
  maxBrands?: number;
  maxSignals?: number;
}

interface BrandSignalCell {
  direction: 'up' | 'down' | 'stable' | null;
  magnitude: number | null;
}

// ── Component ────────────────────────────────────────────────────────

export function CompetitiveBenchmarking({
  signals,
  loading = false,
  maxBrands = 5,
  maxSignals = 10,
}: CompetitiveBenchmarkingProps) {
  // Extract unique brands and build comparison matrix
  const { brands, signalRows, matrix } = useMemo(() => {
    // Collect all brands mentioned across signals
    const brandCount = new Map<string, number>();
    for (const s of signals) {
      if (s.related_brands) {
        for (const brand of s.related_brands) {
          brandCount.set(brand, (brandCount.get(brand) ?? 0) + 1);
        }
      }
    }

    const topBrands = Array.from(brandCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxBrands)
      .map(([name]) => name);

    // Select signals that mention at least one top brand
    const relevantSignals = signals
      .filter((s) => s.related_brands?.some((b) => topBrands.includes(b)))
      .slice(0, maxSignals);

    // Build matrix: signal -> brand -> cell
    const matrixData = new Map<string, Map<string, BrandSignalCell>>();
    for (const s of relevantSignals) {
      const row = new Map<string, BrandSignalCell>();
      for (const brand of topBrands) {
        const isMentioned = s.related_brands?.includes(brand) ?? false;
        row.set(brand, isMentioned ? { direction: s.direction, magnitude: s.magnitude } : { direction: null, magnitude: null });
      }
      matrixData.set(s.id, row);
    }

    return { brands: topBrands, signalRows: relevantSignals, matrix: matrixData };
  }, [signals, maxBrands, maxSignals]);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48 mb-6" />
        <div className="h-40 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#6E879B]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#6E879B]" />
            <h3 className="font-sans font-semibold text-[#141418] text-base">
              Competitive Benchmarking
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
            Competitive benchmarking requires active competitive data feeds. Showing available brand-signal associations.
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Empty */}
        {(brands.length === 0 || signalRows.length === 0) && (
          <div className="text-center py-8">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-sans text-gray-500">No brand associations in current signals</p>
            <p className="text-xs font-sans text-gray-400 mt-1">
              Competitive data appears when signals include related brand references
            </p>
          </div>
        )}

        {/* Matrix */}
        {brands.length > 0 && signalRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#6E879B]/10">
                  <th className="text-left px-3 py-2">
                    <span className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">
                      Signal
                    </span>
                  </th>
                  {brands.map((brand) => (
                    <th key={brand} className="text-center px-3 py-2">
                      <span className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider truncate block max-w-[80px]">
                        {brand}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signalRows.map((signal) => {
                  const row = matrix.get(signal.id);
                  return (
                    <tr key={signal.id} className="border-b border-[#6E879B]/5">
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-sans font-medium text-[#141418] truncate block max-w-[160px]">
                          {signal.title}
                        </span>
                      </td>
                      {brands.map((brand) => {
                        const cell = row?.get(brand);
                        if (!cell || cell.direction === null) {
                          return (
                            <td key={brand} className="text-center px-3 py-2.5">
                              <span className="text-gray-200">&mdash;</span>
                            </td>
                          );
                        }

                        const dirConfig = {
                          up: { icon: TrendingUp, cls: 'text-[#5F8A72]' },
                          down: { icon: TrendingDown, cls: 'text-[#8E6464]' },
                          stable: { icon: Minus, cls: 'text-gray-400' },
                        };
                        const dc = dirConfig[cell.direction];
                        const DirIcon = dc.icon;

                        return (
                          <td key={brand} className="text-center px-3 py-2.5">
                            <div className="inline-flex items-center gap-1">
                              <DirIcon className={`w-3 h-3 ${dc.cls}`} />
                              <span className={`text-xs font-sans font-semibold ${dc.cls}`}>
                                {cell.magnitude !== null ? `${cell.magnitude}%` : ''}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
