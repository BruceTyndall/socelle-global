// ── SignalTableModule — V2-INTEL-01 ──────────────────────────────────
// Wrapper: renders sortable signal table with live market_signals data.
// Data source: useModuleAdapters().tableSignals (from useSignalModules)

import { useState } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useModuleAdapters } from './useModuleAdapters';
import { ModuleLoading, ModuleEmpty, DemoBadge, LiveBadge } from './ModuleStates';
import { formatTimeAgo, getFreshnessColor, getFreshnessDot } from './freshness';
import type { ModuleSignal } from './types';

function MiniSparkline({ data, trend }: { data: number[]; trend: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 24;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const color = trend === 'up' ? '#5F8A72' : trend === 'down' ? '#8E6464' : '#9ca3af';

  return (
    <svg width={width} height={height} className="inline-block">
      <polygon points={areaPoints} fill={color} fillOpacity="0.15" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

type SortKey = 'name' | 'category' | 'trendValue' | 'confidence' | 'updatedAt';

interface SignalTableModuleProps {
  title?: string;
  showViewAll?: boolean;
  dark?: boolean;
}

export function SignalTableModule({ title, showViewAll, dark = false }: SignalTableModuleProps) {
  const { tableSignals, loading, isLive } = useModuleAdapters();
  const [sortKey, setSortKey] = useState<SortKey>('trendValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  if (loading) return <ModuleLoading label="Loading signals..." dark={dark} />;
  if (tableSignals.length === 0) return <ModuleEmpty label="No signals available." dark={dark} />;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...tableSignals].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (sortKey === 'updatedAt') {
      const aTime = (aVal as Date).getTime();
      const bTime = (bVal as Date).getTime();
      return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const bgClass = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const textClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const subtextClass = dark ? 'text-[#F7F5F2]/40' : 'text-[#141418]/40';
  const headerColor = dark ? 'text-[#F7F5F2]/40 hover:text-[#F7F5F2]/70' : 'text-[#141418]/40 hover:text-[#141418]/70';
  const rowBorder = dark ? 'border-[#F7F5F2]/5' : 'border-[#141418]/8';
  const rowHover = dark ? 'hover:bg-[#F7F5F2]/[0.03]' : 'hover:bg-[#141418]/[0.03]';
  const headerBorder = dark ? 'border-[#F7F5F2]/10' : 'border-[#141418]/10';
  const badgeBg = dark ? 'border-[#F7F5F2]/10' : 'border-[#141418]/10';
  const confBg = dark ? 'text-[#F7F5F2]/50 border-[#F7F5F2]/10' : 'text-[#141418]/50 border-[#141418]/10';

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className={`flex items-center gap-1 ${headerColor} transition-colors text-xs tracking-widest uppercase cursor-pointer`}
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <section className={`${bgClass} py-14 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="flex items-center gap-2 mb-3">
                <span className="eyebrow text-[#141418]/50">Signal Feed</span>
                {isLive ? <LiveBadge dark={dark} /> : <DemoBadge dark={dark} />}
              </span>
              <h2 className={`${textClass} text-2xl lg:text-3xl`}>{title}</h2>
            </div>
            {showViewAll && (
              <a href="/intelligence" className={dark ? 'btn-liquid-ghost btn-liquid-sm' : 'btn-liquid-light btn-liquid-sm'}>
                View All <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${headerBorder}`}>
                <th className="text-left pb-4 pr-4"><SortHeader label="Signal Name" sortKeyName="name" /></th>
                <th className="text-left pb-4 pr-4 hidden md:table-cell"><SortHeader label="Category" sortKeyName="category" /></th>
                <th className="text-left pb-4 pr-4"><span className={`${subtextClass} text-xs tracking-widest uppercase`}>Trend</span></th>
                <th className="text-right pb-4 pr-4"><SortHeader label="Delta 30d" sortKeyName="trendValue" /></th>
                <th className="text-right pb-4 pr-4 hidden lg:table-cell"><SortHeader label="Conf." sortKeyName="confidence" /></th>
                <th className="text-right pb-4 hidden sm:table-cell"><SortHeader label="Last Seen" sortKeyName="updatedAt" /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((signal) => (
                <tr key={signal.id} className={`border-b ${rowBorder} ${rowHover} transition-colors group cursor-pointer`}>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${getFreshnessDot(signal.updatedAt)}`} />
                      <span className={`${textClass} text-sm`}>{signal.name}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 hidden md:table-cell">
                    <span className={`${subtextClass} text-xs px-2.5 py-1 rounded-full border ${badgeBg}`}>
                      {signal.category}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <MiniSparkline data={signal.sparkline} trend={signal.trend} />
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <span
                      className={`flex items-center justify-end gap-1 text-sm ${
                        signal.trend === 'up' ? 'text-[#5F8A72]' : signal.trend === 'down' ? 'text-[#8E6464]' : 'text-gray-400'
                      }`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {signal.trend === 'up' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : signal.trend === 'down' ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      {signal.trendValue > 0 ? '+' : ''}{signal.trendValue}%
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right hidden lg:table-cell">
                    <span className={`${confBg} text-xs px-2 py-0.5 rounded-full border`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {signal.confidence}%
                    </span>
                  </td>
                  <td
                    className={`py-4 text-right hidden sm:table-cell text-xs ${getFreshnessColor(signal.updatedAt)}`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatTimeAgo(signal.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
