// ── SignalTable — V2-INTEL-01 (Module 2/10) ───────────────────────────
// Sortable, filterable, searchable table of market_signals.
// Columns: name, category, direction, magnitude, confidence, updated_at.
// CSV export. Pagination. Click row → onSelect callback.
// Pearl Mineral V2 tokens only.

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ChevronLeft,
  X,
  XCircle,
  Activity,
} from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface SignalTableProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
  onSelect?: (signal: IntelligenceSignal) => void;
  pageSize?: number;
  defaultSortField?: SortField;
  defaultSortDir?: SortDir;
}

type SortField = 'title' | 'category' | 'direction' | 'magnitude' | 'impact_score' | 'confidence_score' | 'updated_at';
type SortDir = 'asc' | 'desc';

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

function getConfidenceLabel(score: number | undefined): string {
  if (score === undefined) return '\u2014';
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

function compareSignals(a: IntelligenceSignal, b: IntelligenceSignal, field: SortField, dir: SortDir): number {
  let cmp = 0;
  switch (field) {
    case 'title':
      cmp = a.title.localeCompare(b.title);
      break;
    case 'category':
      cmp = (a.category ?? '').localeCompare(b.category ?? '');
      break;
    case 'direction':
      cmp = a.direction.localeCompare(b.direction);
      break;
    case 'magnitude':
      cmp = a.magnitude - b.magnitude;
      break;
    case 'impact_score':
      cmp = (a.impact_score ?? 0) - (b.impact_score ?? 0);
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

function exportCSV(signals: IntelligenceSignal[]): void {
  const headers = ['Title', 'Category', 'Direction', 'Magnitude', 'Confidence', 'Source', 'Updated At'];
  const rows = signals.map((s) => [
    `"${s.title.replace(/"/g, '""')}"`,
    s.category ?? '',
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
  link.download = `socelle-signals-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Component ────────────────────────────────────────────────────────

export function SignalTable({
  signals,
  loading = false,
  onSelect,
  pageSize = 20,
  defaultSortField = 'updated_at',
  defaultSortDir = 'desc',
}: SignalTableProps) {
  const [sortField, setSortField] = useState<SortField>(defaultSortField);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setSortField(defaultSortField);
    setSortDir(defaultSortDir);
  }, [defaultSortField, defaultSortDir]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    signals.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return ['all', ...Array.from(cats).sort()];
  }, [signals]);

  const filtered = useMemo(() => {
    let result = [...signals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q) ||
          (s.category ?? '').toLowerCase().includes(q),
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter((s) => s.category === filterCategory);
    }
    if (filterDirection !== 'all') {
      result = result.filter((s) => s.direction === filterDirection);
    }
    if (filterConfidence !== 'all') {
      result = result.filter((s) => getConfidenceLabel(s.confidence_score) === filterConfidence);
    }

    result.sort((a, b) => compareSignals(a, b, sortField, sortDir));
    return result;
  }, [signals, searchQuery, filterCategory, filterDirection, filterConfidence, sortField, sortDir]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, filterCategory, filterDirection, filterConfidence]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    },
    [sortField],
  );

  const activeFilterCount = [filterCategory, filterDirection, filterConfidence].filter((f) => f !== 'all').length;

  const clearFilters = useCallback(() => {
    setFilterCategory('all');
    setFilterDirection('all');
    setFilterConfidence('all');
    setSearchQuery('');
  }, []);

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 animate-pulse">
        <div className="px-5 py-4 border-b border-[#6E879B]/10">
          <div className="h-5 bg-gray-200 rounded w-28" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

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
          sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
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
              <th className="text-left px-5 py-3"><SortHeader field="title" label="Signal" /></th>
              <th className="text-left px-3 py-3 hidden md:table-cell"><SortHeader field="category" label="Category" /></th>
              <th className="text-right px-3 py-3"><SortHeader field="magnitude" label="Magnitude" /></th>
              <th className="text-center px-3 py-3 hidden md:table-cell"><SortHeader field="confidence_score" label="Confidence" /></th>
              <th className="text-right px-3 py-3 hidden lg:table-cell"><SortHeader field="updated_at" label="Updated" /></th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((signal) => {
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
                  onClick={() => onSelect?.(signal)}
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
                    <span className="text-xs font-sans text-gray-500">{signal.category ?? '\u2014'}</span>
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
                    <span className="text-xs font-sans text-gray-400">{formatTimeAgo(signal.updated_at)}</span>
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

      {/* Footer: row count + pagination */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-[#6E879B]/10 bg-[#F6F3EF] flex items-center justify-between">
          <p className="text-xs font-sans text-gray-400">
            Showing {page * pageSize + 1}\u2013{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length} signals
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#141418] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-sans text-gray-500 px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#141418] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
