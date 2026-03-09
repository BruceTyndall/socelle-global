// ── TrendStacks — V2-INTEL-01 (Module 3/10) ───────────────────────────
// Visual stacked bar chart showing signal distribution by category.
// CSS-only bars (no chart library). Top 5 categories with signal counts
// and directional breakdown (up/down/stable).
// Pearl Mineral V2 tokens only.

import { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface TrendStacksProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
  maxCategories?: number;
}

interface CategoryStack {
  category: string;
  total: number;
  up: number;
  down: number;
  stable: number;
}

// ── Component ────────────────────────────────────────────────────────

export function TrendStacks({ signals, loading = false, maxCategories = 5 }: TrendStacksProps) {
  const stacks = useMemo((): CategoryStack[] => {
    const map = new Map<string, CategoryStack>();

    for (const s of signals) {
      const cat = s.category ?? 'Uncategorized';
      let entry = map.get(cat);
      if (!entry) {
        entry = { category: cat, total: 0, up: 0, down: 0, stable: 0 };
        map.set(cat, entry);
      }
      entry.total += 1;
      entry[s.direction] += 1;
    }

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, maxCategories);
  }, [signals, maxCategories]);

  const maxTotal = useMemo(() => Math.max(...stacks.map((s) => s.total), 1), [stacks]);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="h-6 bg-gray-100 rounded" style={{ width: `${100 - i * 15}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (signals.length === 0 || stacks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
        <h3 className="font-sans font-semibold text-[#141418] text-base mb-4">Trend Stacks</h3>
        <div className="text-center py-8">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-sans text-gray-500">No category data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
      <h3 className="font-sans font-semibold text-[#141418] text-base mb-6">Trend Stacks</h3>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-1.5 text-xs font-sans text-gray-500">
          <TrendingUp className="w-3 h-3 text-[#5F8A72]" />
          Up
        </div>
        <div className="flex items-center gap-1.5 text-xs font-sans text-gray-500">
          <Minus className="w-3 h-3 text-gray-400" />
          Stable
        </div>
        <div className="flex items-center gap-1.5 text-xs font-sans text-gray-500">
          <TrendingDown className="w-3 h-3 text-[#8E6464]" />
          Down
        </div>
      </div>

      <div className="space-y-4">
        {stacks.map((stack) => {
          const pctUp = (stack.up / maxTotal) * 100;
          const pctStable = (stack.stable / maxTotal) * 100;
          const pctDown = (stack.down / maxTotal) * 100;

          return (
            <div key={stack.category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-sans font-medium text-[#141418] truncate max-w-[200px]">
                  {stack.category}
                </span>
                <span className="text-xs font-sans text-gray-400 flex-shrink-0 ml-2">
                  {stack.total} signal{stack.total !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex h-6 rounded-lg overflow-hidden bg-gray-100">
                {stack.up > 0 && (
                  <div
                    className="bg-[#5F8A72] transition-all duration-500"
                    style={{ width: `${pctUp}%` }}
                    title={`${stack.up} up`}
                  />
                )}
                {stack.stable > 0 && (
                  <div
                    className="bg-gray-300 transition-all duration-500"
                    style={{ width: `${pctStable}%` }}
                    title={`${stack.stable} stable`}
                  />
                )}
                {stack.down > 0 && (
                  <div
                    className="bg-[#8E6464] transition-all duration-500"
                    style={{ width: `${pctDown}%` }}
                    title={`${stack.down} down`}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {stack.up > 0 && (
                  <span className="text-[10px] font-sans text-[#5F8A72]">{stack.up} up</span>
                )}
                {stack.stable > 0 && (
                  <span className="text-[10px] font-sans text-gray-400">{stack.stable} stable</span>
                )}
                {stack.down > 0 && (
                  <span className="text-[10px] font-sans text-[#8E6464]">{stack.down} down</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
