import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Rss,
  Clock,
  Zap,
  AlertTriangle,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Filter,
  X,
  ChevronRight,
  DollarSign,
  Megaphone,
  MenuSquare,
  XCircle,
} from 'lucide-react';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import { SignalDetailPanel } from '../../components/intelligence/SignalDetailPanel';
import { AIToolbar } from '../../components/intelligence/AIToolbar';
import type { IntelligenceSignal } from '../../lib/intelligence/types';

// ── Helpers ──────────────────────────────────────────────────────────

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

type SortField = 'title' | 'category' | 'source' | 'magnitude' | 'confidence_score' | 'updated_at';
type SortDir = 'asc' | 'desc';

function compareSignals(a: IntelligenceSignal, b: IntelligenceSignal, field: SortField, dir: SortDir): number {
  let cmp = 0;
  switch (field) {
    case 'title':
      cmp = a.title.localeCompare(b.title);
      break;
    case 'category':
      cmp = (a.category ?? '').localeCompare(b.category ?? '');
      break;
    case 'source':
      cmp = (a.source_name ?? a.source ?? '').localeCompare(b.source_name ?? b.source ?? '');
      break;
    case 'magnitude':
      cmp = a.magnitude - b.magnitude;
      break;
    case 'confidence_score':
      cmp = (a.confidence_score ?? 0) - (b.confidence_score ?? 0);
      break;
    case 'updated_at':
      cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      break;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function getConfidenceLabel(score: number | undefined): string {
  if (score === undefined) return '—';
  if (score >= 0.8) return 'HIGH';
  if (score >= 0.5) return 'MODERATE';
  return 'LOW';
}

function getConfidenceColor(score: number | undefined): string {
  if (score === undefined) return 'text-gray-400';
  if (score >= 0.8) return 'text-[#5F8A72]';
  if (score >= 0.5) return 'text-[#A97A4C]';
  return 'text-[#8E6464]';
}

function exportCSV(signals: IntelligenceSignal[]): void {
  const headers = ['Title', 'Category', 'Signal Type', 'Direction', 'Magnitude', 'Confidence', 'Source', 'Region', 'Updated At'];
  const rows = signals.map((s) => [
    `"${s.title.replace(/"/g, '""')}"`,
    s.category ?? '',
    s.signal_type,
    s.direction,
    s.magnitude.toString(),
    s.confidence_score !== undefined ? (s.confidence_score * 100).toFixed(0) + '%' : '',
    s.source_name ?? s.source ?? '',
    s.region ?? '',
    s.updated_at,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `socelle-signals-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Main Component ───────────────────────────────────────────────────

export default function IntelligenceHub() {
  const { signals, marketPulse, loading, isLive } = useIntelligence();
  const [selectedSignal, setSelectedSignal] = useState<IntelligenceSignal | null>(null);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Intelligence Hub | Socelle</title>
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
          {/* Skeleton shimmer */}
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-xl w-64" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Intelligence Hub | Socelle</title>
        <meta
          name="description"
          content="Professional beauty and medspa market intelligence. Live signals, trends, and AI-powered analysis."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#141418] flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#6E879B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-2xl font-bold text-[#141418]">Intelligence Hub</h1>
              {!isLive && (
                <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-sans">Market signals, trends, and opportunities</p>
          </div>
        </div>

        {/* DEMO Banner */}
        {!isLive && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#A97A4C]/10 rounded-lg border border-[#A97A4C]/20">
            <AlertTriangle className="w-4 h-4 text-[#A97A4C] flex-shrink-0" />
            <p className="text-xs font-sans text-[#A97A4C]">
              <span className="font-semibold">DEMO</span> — Showing sample signals. Live data activates when market_signals table is populated.
            </p>
          </div>
        )}

        {/* KPI Strip */}
        <KPIStrip signals={signals} isLive={isLive} />

        {/* Signal Table */}
        <SignalTable signals={signals} onSelectSignal={setSelectedSignal} />

        {/* Two-Column: What Changed + Opportunity Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WhatChangedTimeline signals={signals} />
          <OpportunitySignals signals={signals} />
        </div>
      </div>

      {/* AI Toolbar */}
      <AIToolbar />

      {/* Signal Detail Slide-out */}
      {selectedSignal && (
        <SignalDetailPanel
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}
    </>
  );
}

// ── KPI Strip ────────────────────────────────────────────────────────

function KPIStrip({ signals, isLive }: { signals: IntelligenceSignal[]; isLive: boolean }) {
  const signalCount = signals.length;

  const sourceCount = useMemo(() => {
    const sources = new Set<string>();
    signals.forEach((s) => {
      if (s.source_name) sources.add(s.source_name);
      else if (s.source) sources.add(s.source);
    });
    return sources.size;
  }, [signals]);

  const freshest = useMemo(() => {
    if (signals.length === 0) return null;
    return signals.reduce((latest, s) =>
      new Date(s.updated_at) > new Date(latest.updated_at) ? s : latest
    );
  }, [signals]);

  const trendingCount = useMemo(
    () => signals.filter((s) => s.direction === 'up').length,
    [signals]
  );

  const kpis = [
    {
      label: 'Signals',
      value: signalCount.toString(),
      icon: Activity,
      color: 'text-[#6E879B]',
      bg: 'bg-[#E8EDF1]',
    },
    {
      label: 'Sources',
      value: sourceCount.toString(),
      icon: Rss,
      color: 'text-[#6E879B]',
      bg: 'bg-[#E8EDF1]',
    },
    {
      label: 'Freshness',
      value: freshest ? formatTimeAgo(freshest.updated_at) : '—',
      icon: Clock,
      color: 'text-[#6E879B]',
      bg: 'bg-[#E8EDF1]',
    },
    {
      label: 'Trending',
      value: trendingCount.toString(),
      icon: TrendingUp,
      color: 'text-[#5F8A72]',
      bg: 'bg-[#5F8A72]/10',
    },
    {
      label: 'Alerts',
      value: '0',
      icon: Zap,
      color: 'text-[#A97A4C]',
      bg: 'bg-[#A97A4C]/10',
      demo: true,
    },
    {
      label: 'Credits',
      value: '2,500',
      icon: CreditCard,
      color: 'text-[#6E879B]',
      bg: 'bg-[#E8EDF1]',
      demo: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-[#6E879B]/10 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              {kpi.demo && (
                <span className="text-[9px] font-semibold bg-[#A97A4C]/20 text-[#A97A4C] px-1.5 py-0.5 rounded-full">
                  DEMO
                </span>
              )}
            </div>
            <div>
              <p className="text-xl font-sans font-bold text-[#141418]">{kpi.value}</p>
              <p className="text-[10px] font-sans font-medium text-gray-400 uppercase tracking-wider">
                {kpi.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Signal Table ─────────────────────────────────────────────────────

function SignalTable({
  signals,
  onSelectSignal,
}: {
  signals: IntelligenceSignal[];
  onSelectSignal: (signal: IntelligenceSignal) => void;
}) {
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    signals.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return ['all', ...Array.from(cats).sort()];
  }, [signals]);

  const filtered = useMemo(() => {
    let result = [...signals];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q) ||
          (s.category ?? '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((s) => s.category === filterCategory);
    }

    // Direction filter
    if (filterDirection !== 'all') {
      result = result.filter((s) => s.direction === filterDirection);
    }

    // Confidence filter
    if (filterConfidence !== 'all') {
      result = result.filter((s) => {
        const label = getConfidenceLabel(s.confidence_score);
        return label === filterConfidence;
      });
    }

    // Sort
    result.sort((a, b) => compareSignals(a, b, sortField, sortDir));

    return result;
  }, [signals, searchQuery, filterCategory, filterDirection, filterConfidence, sortField, sortDir]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    },
    [sortField]
  );

  const activeFilterCount = [filterCategory, filterDirection, filterConfidence].filter((f) => f !== 'all').length;

  const clearFilters = useCallback(() => {
    setFilterCategory('all');
    setFilterDirection('all');
    setFilterConfidence('all');
    setSearchQuery('');
  }, []);

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    const isActive = sortField === field;
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 text-[10px] font-sans font-semibold uppercase tracking-wider transition-colors ${
          isActive ? 'text-[#141418]' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {label}
        {isActive ? (
          sortDir === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#6E879B]/10 flex flex-wrap items-center gap-3">
        <h2 className="font-sans font-semibold text-[#141418] text-base mr-auto">Signal Table</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search signals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm font-sans rounded-lg border border-[#6E879B]/20 bg-[#F6F3EF] focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30 w-52"
          />
        </div>

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-sans font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-[#6E879B] text-white'
              : 'bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1]'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Export */}
        <button
          type="button"
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1] text-sm font-sans font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="px-5 py-3 bg-[#F6F3EF] border-b border-[#6E879B]/10 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm font-sans rounded-lg border border-[#6E879B]/20 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">
              Direction
            </label>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="text-sm font-sans rounded-lg border border-[#6E879B]/20 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30"
            >
              <option value="all">All</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">
              Confidence
            </label>
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="text-sm font-sans rounded-lg border border-[#6E879B]/20 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30"
            >
              <option value="all">All</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-sans font-medium text-[#8E6464] hover:text-[#8E6464]/80 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#6E879B]/10">
              <th className="text-left px-5 py-3">
                <SortHeader field="title" label="Signal" />
              </th>
              <th className="text-left px-3 py-3 hidden md:table-cell">
                <SortHeader field="category" label="Category" />
              </th>
              <th className="text-left px-3 py-3 hidden lg:table-cell">
                <SortHeader field="source" label="Source" />
              </th>
              <th className="text-right px-3 py-3">
                <SortHeader field="magnitude" label="Magnitude" />
              </th>
              <th className="text-center px-3 py-3 hidden md:table-cell">
                <SortHeader field="confidence_score" label="Confidence" />
              </th>
              <th className="text-right px-3 py-3 hidden lg:table-cell">
                <SortHeader field="updated_at" label="Updated" />
              </th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((signal) => {
              const dirConfig = {
                up: { icon: TrendingUp, cls: 'text-[#5F8A72]' },
                down: { icon: TrendingDown, cls: 'text-[#8E6464]' },
                stable: { icon: Minus, cls: 'text-gray-400' },
              };
              const dc = dirConfig[signal.direction];
              const DirIcon = dc.icon;

              return (
                <tr
                  key={signal.id}
                  onClick={() => onSelectSignal(signal)}
                  className="border-b border-[#6E879B]/5 hover:bg-[#F6F3EF] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <DirIcon className={`w-4 h-4 flex-shrink-0 ${dc.cls}`} />
                      <span className="text-sm font-sans font-medium text-[#141418] truncate max-w-[200px] lg:max-w-[300px]">
                        {signal.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <span className="text-xs font-sans text-gray-500">
                      {signal.category ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className="text-xs font-sans text-gray-500">
                      {signal.source_name ?? signal.source ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`text-sm font-sans font-semibold ${dc.cls}`}>
                      {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}
                      {signal.magnitude}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center hidden md:table-cell">
                    <span className={`text-xs font-sans font-semibold ${getConfidenceColor(signal.confidence_score)}`}>
                      {getConfidenceLabel(signal.confidence_score)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right hidden lg:table-cell">
                    <span className="text-xs font-sans text-gray-400">
                      {formatTimeAgo(signal.updated_at)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="px-5 py-16 text-center">
          <Activity className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-sans font-medium text-gray-500">No signals match your filters</p>
          <p className="text-xs font-sans text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6E879B] text-white text-sm font-sans font-medium hover:bg-[#5A7185] transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Row count */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-[#6E879B]/10 bg-[#F6F3EF]">
          <p className="text-xs font-sans text-gray-400">
            Showing {filtered.length} of {signals.length} signals
          </p>
        </div>
      )}
    </div>
  );
}

// ── What Changed Timeline ────────────────────────────────────────────

function WhatChangedTimeline({ signals }: { signals: IntelligenceSignal[] }) {
  const recent = useMemo(() => {
    return [...signals]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10);
  }, [signals]);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
        <h3 className="font-sans font-semibold text-[#141418] text-base mb-4">What Changed</h3>
        <div className="text-center py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-sans text-gray-500">No recent changes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
      <h3 className="font-sans font-semibold text-[#141418] text-base mb-4">What Changed</h3>
      <div className="space-y-0">
        {recent.map((signal, idx) => {
          const dirConfig = {
            up: { icon: TrendingUp, cls: 'text-[#5F8A72]', bg: 'bg-[#5F8A72]' },
            down: { icon: TrendingDown, cls: 'text-[#8E6464]', bg: 'bg-[#8E6464]' },
            stable: { icon: Minus, cls: 'text-gray-400', bg: 'bg-gray-400' },
          };
          const dc = dirConfig[signal.direction];
          const DirIcon = dc.icon;
          const isLast = idx === recent.length - 1;

          return (
            <div key={signal.id} className="flex gap-3">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${dc.bg} mt-1.5 flex-shrink-0`} />
                {!isLast && <div className="w-px flex-1 bg-gray-200" />}
              </div>
              {/* Content */}
              <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-sans text-gray-400">{formatTimeAgo(signal.updated_at)}</span>
                  <DirIcon className={`w-3 h-3 ${dc.cls}`} />
                  <span className={`text-xs font-sans font-semibold ${dc.cls}`}>
                    {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}
                    {signal.magnitude}%
                  </span>
                </div>
                <p className="text-sm font-sans font-medium text-[#141418] truncate">{signal.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Opportunity Signals ──────────────────────────────────────────────

function OpportunitySignals({ signals }: { signals: IntelligenceSignal[] }) {
  const opportunities = useMemo(() => {
    return [...signals]
      .filter((s) => s.direction === 'up' && s.magnitude >= 5)
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, 5);
  }, [signals]);

  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
        <h3 className="font-sans font-semibold text-[#141418] text-base mb-4">Opportunity Signals</h3>
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-sans text-gray-500">No high-magnitude opportunities right now</p>
          <p className="text-xs font-sans text-gray-400 mt-1">Opportunities appear when signals trend up with high magnitude</p>
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
          return (
            <div
              key={signal.id}
              className="rounded-xl border border-[#5F8A72]/20 bg-[#5F8A72]/5 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-[#141418] truncate">{signal.title}</p>
                  <p className="text-xs font-sans text-gray-500 mt-0.5">{signal.category ?? signal.signal_type.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-sans font-bold text-[#5F8A72]">+{signal.magnitude}%</p>
                  <div className="flex items-center gap-1 justify-end">
                    <DollarSign className="w-3 h-3 text-[#5F8A72]" />
                    <span className="text-xs font-sans font-semibold text-[#5F8A72]">
                      ~${revenueEstimate.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#6E879B]/20 text-xs font-sans font-medium text-[#141418] hover:bg-[#E8EDF1] transition-colors"
                >
                  <MenuSquare className="w-3 h-3" />
                  Add to Menu
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#6E879B]/20 text-xs font-sans font-medium text-[#141418] hover:bg-[#E8EDF1] transition-colors"
                >
                  <Megaphone className="w-3 h-3" />
                  Create Campaign
                </button>
                <button
                  type="button"
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
