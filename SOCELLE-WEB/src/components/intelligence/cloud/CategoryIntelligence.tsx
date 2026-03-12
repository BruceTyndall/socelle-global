// ── CategoryIntelligence — V2-INTEL-01 (Module 7/10) ──────────────────
// Category drill-down: select a category, see all signals, trends,
// top brands, market share indicators. CSV export.
// Uses TanStack Query to filter market_signals by category.
// Pearl Mineral V2 tokens only.

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';
import { useIntelligence } from '../../../lib/intelligence/useIntelligence';

// ── Types ────────────────────────────────────────────────────────────

export interface CategoryIntelligenceProps {
  /** Initial signals to derive categories from. If provided, skips TanStack fetch for category list. */
  signals?: IntelligenceSignal[];
  loading?: boolean;
  onSelectSignal?: (signal: IntelligenceSignal) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────

function exportCategoryCSV(signals: IntelligenceSignal[], category: string): void {
  const headers = ['Title', 'Direction', 'Magnitude', 'Confidence', 'Source', 'Updated At'];
  const rows = signals.map((s) => [
    `"${s.title.replace(/"/g, '""')}"`,
    s.direction,
    s.magnitude.toString(),
    s.confidence_score !== undefined ? (s.confidence_score * 100).toFixed(0) + '%' : '',
    s.source_name ?? s.source ?? '',
    s.updated_at,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `socelle-${category.toLowerCase().replace(/\s+/g, '-')}-signals-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Component ────────────────────────────────────────────────────────

export function CategoryIntelligence({
  signals: propSignals,
  loading: propLoading = false,
  onSelectSignal,
}: CategoryIntelligenceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch category-specific signals from useIntelligence hook
  const { signals: categorySignals, loading: categoryLoading } = useIntelligence({
    category: selectedCategory || undefined
  });

  // Derive categories from prop signals
  const categories = useMemo(() => {
    if (!propSignals) return [];
    const catMap = new Map<string, { count: number; up: number; down: number; stable: number }>();
    for (const s of propSignals) {
      const cat = s.category ?? 'Uncategorized';
      const entry = catMap.get(cat) ?? { count: 0, up: 0, down: 0, stable: 0 };
      entry.count += 1;
      entry[s.direction] += 1;
      catMap.set(cat, entry);
    }
    return Array.from(catMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [propSignals]);

  // Use category-specific query data, or filter from prop signals
  const activeSignals = useMemo(() => {
    if (categorySignals && categorySignals.length > 0) return categorySignals;
    if (!propSignals || !selectedCategory) return [];
    return propSignals.filter((s) => (s.category ?? 'Uncategorized') === selectedCategory);
  }, [categorySignals, propSignals, selectedCategory]);

  // Top brands in selected category
  const topBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    for (const s of activeSignals) {
      if (s.related_brands) {
        for (const brand of s.related_brands) {
          brandMap.set(brand, (brandMap.get(brand) ?? 0) + 1);
        }
      }
    }
    return Array.from(brandMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [activeSignals]);

  const handleExport = useCallback(() => {
    if (selectedCategory && activeSignals.length > 0) {
      exportCategoryCSV(activeSignals, selectedCategory);
    }
  }, [selectedCategory, activeSignals]);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (propLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 overflow-hidden">
      <div className="px-6 py-5 border-b border-[#6E879B]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#6E879B]" />
          <h3 className="font-sans font-semibold text-[#141418] text-base">Category Intelligence</h3>
        </div>
        {selectedCategory && activeSignals.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1] text-xs font-sans font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Category empty */}
        {categories.length === 0 && !selectedCategory && (
          <div className="text-center py-8">
            <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-sans text-gray-500">No categories available</p>
          </div>
        )}

        {/* Category selector */}
        {!selectedCategory && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className="text-left p-3 rounded-lg border border-[#6E879B]/10 hover:border-[#6E879B]/30 hover:bg-[#F6F3EF] transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-sans font-medium text-[#141418] truncate">
                    {cat.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6E879B] transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans text-gray-400">{cat.count} signals</span>
                  {cat.up > 0 && <span className="text-[10px] font-sans text-[#5F8A72]">{cat.up} up</span>}
                  {cat.down > 0 && <span className="text-[10px] font-sans text-[#8E6464]">{cat.down} down</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected category detail */}
        {selectedCategory && (
          <div>
            {/* Back + header */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="-ml-2 px-2 py-2 text-xs font-sans font-medium text-[#6E879B] hover:text-[#5A7185] transition-colors"
              >
                All Categories
              </button>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-xs font-sans font-semibold text-[#141418]">{selectedCategory}</span>
            </div>

            {/* Loading */}
            {categoryLoading && (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                ))}
              </div>
            )}

            {/* Signals list */}
            {!categoryLoading && activeSignals.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm font-sans text-gray-500">No signals in this category</p>
              </div>
            )}

            {!categoryLoading && activeSignals.length > 0 && (
              <>
                {/* Top brands */}
                {topBrands.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Top Brands
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topBrands.map(([brand, count]) => (
                        <span
                          key={brand}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8EDF1] text-xs font-sans text-[#141418]"
                        >
                          <Tag className="w-3 h-3 text-[#6E879B]" />
                          {brand}
                          <span className="text-gray-400">({count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signal rows */}
                <div className="space-y-2">
                  {activeSignals.map((signal) => {
                    const dirConfig = {
                      up: { icon: TrendingUp, cls: 'text-[#5F8A72]' },
                      down: { icon: TrendingDown, cls: 'text-[#8E6464]' },
                      stable: { icon: Minus, cls: 'text-gray-400' },
                    };
                    const dc = dirConfig[signal.direction];
                    const DirIcon = dc.icon;

                    return (
                      <button
                        key={signal.id}
                        type="button"
                        onClick={() => onSelectSignal?.(signal)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-[#F6F3EF] transition-colors"
                      >
                        <DirIcon className={`w-4 h-4 flex-shrink-0 ${dc.cls}`} />
                        <span className="text-sm font-sans font-medium text-[#141418] flex-1 truncate">
                          {signal.title}
                        </span>
                        <span className={`text-sm font-sans font-semibold ${dc.cls}`}>
                          {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}
                          {signal.magnitude}%
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
