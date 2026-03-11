// ── AdminAuditLog — CTRL-WO-03: Audit Log System ────────────────────────────
// Data source: audit_logs table (empty fallback if table missing — 42P01)
// Authority: build_tracker.md WO CTRL-WO-03

import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Download,
  RefreshCw,
  ShieldAlert,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAuditLogs } from '../../lib/useAuditLogs';
import type { AuditLogEntry } from '../../lib/useAuditLogs';
import { exportToCsv } from '../../lib/csvExport';

// ── Constants ─────────────────────────────────────────────────────────────

const ACTION_TYPES = [
  'All',
  'feature_flag.create',
  'feature_flag.update',
  'feature_flag.delete',
  'entitlement.change',
  'module.toggle',
  'ai.request',
  'ai.blocked',
  'ai.rate_limited',
  'admin.login',
  'admin.action',
  'content.publish',
  'content.unpublish',
  'user.role_change',
  'user.tier_change',
  'credit.deduct',
  'credit.purchase',
] as const;

const RESOURCE_TYPES = [
  'All',
  'feature_flag',
  'entitlement',
  'module',
  'ai_tool',
  'user',
  'content',
  'credit',
] as const;

const PAGE_SIZE = 50;

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function actionBadgeClasses(action: string): string {
  if (action.includes('delete') || action.includes('blocked'))
    return 'bg-[#8E6464]/10 text-[#8E6464]';
  if (action.includes('create') || action.includes('publish') || action.includes('login') || action.includes('purchase'))
    return 'bg-[#5F8A72]/10 text-[#5F8A72]';
  if (action.includes('update') || action.includes('change') || action.includes('toggle') || action.includes('deduct'))
    return 'bg-[#A97A4C]/10 text-[#A97A4C]';
  return 'bg-[#6E879B]/10 text-[#6E879B]';
}

// ── Expandable Details Cell ───────────────────────────────────────────────

function DetailsCell({ details }: { details: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const keys = Object.keys(details);

  if (keys.length === 0) {
    return <span className="text-graphite/40 text-xs font-sans">--</span>;
  }

  const preview = JSON.stringify(details).slice(0, 60);

  return (
    <div className="text-xs font-sans">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-accent hover:text-accent-hover transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {expanded ? 'Collapse' : preview.length >= 60 ? `${preview}...` : preview}
      </button>
      {expanded && (
        <pre className="mt-1 p-2 bg-[#F6F3EF] rounded text-[11px] text-graphite/80 overflow-x-auto max-w-[400px] whitespace-pre-wrap font-mono">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminAuditLog({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);

  const dateFromIso = fromDate ? new Date(`${fromDate}T00:00:00.000Z`).toISOString() : undefined;
  const dateToIso = toDate ? new Date(`${toDate}T23:59:59.999Z`).toISOString() : undefined;

  const {
    logs,
    isLive,
    isLoading,
    error: errorObj,
    total,
  } = useAuditLogs({
    action: actionFilter !== 'All' ? actionFilter : undefined,
    resourceType: resourceTypeFilter !== 'All' ? resourceTypeFilter : undefined,
    userId: userFilter.trim() || undefined,
    from: dateFromIso,
    to: dateToIso,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const isError = !!errorObj;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Local text search (within current page) ───────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter(
      (e: AuditLogEntry) =>
        e.action.toLowerCase().includes(q) ||
        e.resource_type.toLowerCase().includes(q) ||
        (e.resource_id ?? '').toLowerCase().includes(q) ||
        JSON.stringify(e.details).toLowerCase().includes(q)
    );
  }, [logs, search]);

  // ── CSV Export ──────────────────────────────────────────────────────

  const handleExport = () => {
    exportToCsv(
      filtered.map((e: AuditLogEntry) => ({
        created_at: e.created_at,
        user_id: e.user_id,
        action: e.action,
        resource_type: e.resource_type,
        resource_id: e.resource_id ?? '',
        details: JSON.stringify(e.details),
      })),
      'socelle_audit_log',
      [
        { key: 'created_at', label: 'Timestamp' },
        { key: 'user_id', label: 'User ID' },
        { key: 'action', label: 'Action' },
        { key: 'resource_type', label: 'Resource Type' },
        { key: 'resource_id', label: 'Resource ID' },
        { key: 'details', label: 'Details' },
      ]
    );
  };

  // ── Error state ─────────────────────────────────────────────────────

  if (isError) {
    const message =
      errorObj instanceof Error ? errorObj.message : 'Failed to load audit log.';
    return (
      <div className="py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Audit Log Unavailable</h3>
        <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto font-sans">{message}</p>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-48 bg-accent-soft rounded" />
            <div className="h-4 w-64 bg-accent-soft rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-accent-soft rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-accent-soft rounded-lg" />
          <div className="h-10 w-48 bg-accent-soft rounded-lg" />
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-14 bg-accent-soft rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-graphite font-sans">Audit Log</h1>
              <p className="text-graphite/60 font-sans mt-1 text-sm">
                {total} event{total !== 1 ? 's' : ''} total
                {filtered.length !== logs.length ? ` (${filtered.length} matching)` : ''}
              </p>
            </div>
            {!isLive && (
              <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* DEMO banner */}
      {!isLive && (
        <div className="bg-[#A97A4C]/10 text-[#A97A4C] text-xs font-medium px-4 py-2 rounded-lg text-center font-sans">
          DEMO -- audit_logs table is empty or not yet created. Events will appear once actions are logged.
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by resource ID or keyword..."
            className="w-full pl-10 pr-4 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
          />
        </div>
        <input
          type="text"
          value={userFilter}
          onChange={(e) => { setUserFilter(e.target.value); setPage(0); }}
          placeholder="Filter by user UUID..."
          className="px-4 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono min-w-[220px]"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
          className="px-3 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
          aria-label="From date"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(0); }}
          className="px-3 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
          aria-label="To date"
        />
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="pl-10 pr-8 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
          >
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All actions' : t}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={resourceTypeFilter}
            onChange={(e) => { setResourceTypeFilter(e.target.value); setPage(0); }}
            className="px-4 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All resource types' : t}
              </option>
            ))}
          </select>
        </div>
        {(userFilter || fromDate || toDate || actionFilter !== 'All' || resourceTypeFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setUserFilter('');
              setFromDate('');
              setToDate('');
              setActionFilter('All');
              setResourceTypeFilter('All');
              setPage(0);
            }}
            className="px-3 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite hover:bg-accent-soft font-sans transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-soft bg-[#F6F3EF]">
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">User ID</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Action</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Resource Type</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Resource ID</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {filtered.map((event: AuditLogEntry) => (
                <tr key={event.id} className="hover:bg-[#F6F3EF]/50 transition-colors">
                  <td className="px-4 py-3 font-sans text-graphite/60 text-xs whitespace-nowrap">
                    <span title={event.created_at}>{timeAgo(event.created_at)}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-graphite text-xs truncate max-w-[180px] font-mono">
                    {event.user_id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${actionBadgeClasses(event.action)}`}
                    >
                      {event.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-graphite/70 text-xs">
                    {event.resource_type}
                  </td>
                  <td className="px-4 py-3 font-sans text-graphite/70 text-xs font-mono truncate max-w-[160px]">
                    {event.resource_id ?? '--'}
                  </td>
                  <td className="px-4 py-3">
                    <DetailsCell details={event.details} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <ClipboardList className="w-8 h-8 text-graphite/30 mx-auto mb-2" />
            <p className="text-sm text-graphite/60 font-sans">
              No audit events match your filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-graphite/60 font-sans">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
