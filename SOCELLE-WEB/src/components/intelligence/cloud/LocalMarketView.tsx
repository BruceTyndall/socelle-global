// ── LocalMarketView — V2-INTEL-01 (Module 10/10) ──────────────────────
// Geographic signal view. Select a region, see local signals, operators,
// demand indicators. DEMO-badged (needs geo data feeds).
// Pearl Mineral V2 tokens only.

import { useState, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ChevronRight,
  Activity,
} from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface LocalMarketViewProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
  onSelectSignal?: (signal: IntelligenceSignal) => void;
}

interface RegionSummary {
  region: string;
  count: number;
  up: number;
  down: number;
  stable: number;
  avgMagnitude: number;
}

// ── Component ────────────────────────────────────────────────────────

export function LocalMarketView({
  signals,
  loading = false,
  onSelectSignal,
}: LocalMarketViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Derive regions
  const regions = useMemo((): RegionSummary[] => {
    const map = new Map<string, RegionSummary>();
    for (const s of signals) {
      const region = s.region ?? 'National';
      let entry = map.get(region);
      if (!entry) {
        entry = { region, count: 0, up: 0, down: 0, stable: 0, avgMagnitude: 0 };
        map.set(region, entry);
      }
      entry.count += 1;
      entry[s.direction] += 1;
      entry.avgMagnitude += s.magnitude;
    }
    // Finalize averages
    for (const entry of map.values()) {
      entry.avgMagnitude = entry.count > 0 ? Math.round(entry.avgMagnitude / entry.count) : 0;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [signals]);

  // Signals for selected region
  const regionSignals = useMemo(() => {
    if (!selectedRegion) return [];
    return signals
      .filter((s) => (s.region ?? 'National') === selectedRegion)
      .sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude));
  }, [signals, selectedRegion]);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-36 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg" />
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
            <MapPin className="w-5 h-5 text-[#6E879B]" />
            <h3 className="font-sans font-semibold text-[#141418] text-base">
              Local Market View
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
            Local market data requires geo-tagged signal feeds. Showing available regional breakdowns.
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Empty */}
        {regions.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-sans text-gray-500">No geographic data available</p>
            <p className="text-xs font-sans text-gray-400 mt-1">
              Regional signals appear when market_signals include region data
            </p>
          </div>
        )}

        {/* Region selector */}
        {!selectedRegion && regions.length > 0 && (
          <div className="space-y-2">
            {regions.map((r) => (
              <button
                key={r.region}
                type="button"
                onClick={() => setSelectedRegion(r.region)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-[#6E879B]/10 hover:border-[#6E879B]/30 hover:bg-[#F6F3EF] transition-colors group"
              >
                <MapPin className="w-4 h-4 text-[#6E879B] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-sans font-medium text-[#141418]">
                      {r.region}
                    </span>
                    <span className="text-xs font-sans text-gray-400">
                      {r.count} signal{r.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.up > 0 && (
                      <span className="text-[10px] font-sans text-[#5F8A72]">{r.up} up</span>
                    )}
                    {r.stable > 0 && (
                      <span className="text-[10px] font-sans text-gray-400">{r.stable} stable</span>
                    )}
                    {r.down > 0 && (
                      <span className="text-[10px] font-sans text-[#8E6464]">{r.down} down</span>
                    )}
                    <span className="text-[10px] font-sans text-gray-400">
                      avg {r.avgMagnitude}%
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6E879B] transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Selected region detail */}
        {selectedRegion && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedRegion(null)}
                className="text-xs font-sans font-medium text-[#6E879B] hover:text-[#5A7185] transition-colors"
              >
                All Regions
              </button>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-xs font-sans font-semibold text-[#141418]">{selectedRegion}</span>
            </div>

            {/* Region KPIs */}
            {(() => {
              const r = regions.find((reg) => reg.region === selectedRegion);
              if (!r) return null;
              return (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg bg-[#5F8A72]/10 p-3 text-center">
                    <p className="text-lg font-sans font-bold text-[#141418]">{r.up}</p>
                    <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider">Trending Up</p>
                  </div>
                  <div className="rounded-lg bg-[#E8EDF1] p-3 text-center">
                    <p className="text-lg font-sans font-bold text-[#141418]">{r.stable}</p>
                    <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider">Stable</p>
                  </div>
                  <div className="rounded-lg bg-[#8E6464]/10 p-3 text-center">
                    <p className="text-lg font-sans font-bold text-[#141418]">{r.down}</p>
                    <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider">Declining</p>
                  </div>
                </div>
              );
            })()}

            {/* Signal list */}
            {regionSignals.length === 0 ? (
              <div className="text-center py-6">
                <Activity className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-sans text-gray-500">No signals for this region</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {regionSignals.map((signal) => {
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
                      className="w-full text-left flex items-center gap-2 p-2.5 rounded-lg hover:bg-[#F6F3EF] transition-colors"
                    >
                      <DirIcon className={`w-3.5 h-3.5 flex-shrink-0 ${dc.cls}`} />
                      <span className="text-xs font-sans font-medium text-[#141418] flex-1 truncate">
                        {signal.title}
                      </span>
                      <span className={`text-xs font-sans font-semibold ${dc.cls}`}>
                        {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}
                        {signal.magnitude}%
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
