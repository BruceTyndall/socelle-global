import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Megaphone,
  AlertCircle,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  MoreHorizontal,
  Pause,
  Archive,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useMarketingCampaigns } from '../../../lib/marketing/useMarketingCampaigns';
import type { CampaignStatus, MarketingCampaign } from '../../../lib/marketing/useMarketingCampaigns';

// ── V2-HUBS-08: Campaign List ──────────────────────────────────────
// Table with filter, search, sort, CSV export, row actions.
// Pearl Mineral V2 tokens. 3 states: skeleton, empty, error.

const ALL_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'];

type SortKey = 'name' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc';

/* ── Skeleton ─────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-40 bg-graphite/8 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-graphite/8 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-12 bg-graphite/8 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-graphite/8 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-8 bg-graphite/8 rounded ml-auto" /></td>
    </tr>
  );
}

/* ── Status Badge ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-graphite/8 text-graphite/60',
    scheduled: 'bg-accent/10 text-accent',
    active: 'bg-signal-up/10 text-signal-up',
    paused: 'bg-signal-warn/10 text-signal-warn',
    completed: 'bg-graphite/8 text-graphite/40',
    archived: 'bg-graphite/5 text-graphite/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans capitalize ${styles[status] ?? 'bg-graphite/8 text-graphite/40'}`}>
      {status}
    </span>
  );
}

/* ── CSV Export ────────────────────────────────────────────────────── */
function exportCsv(rows: MarketingCampaign[]) {
  const header = 'Name,Status,Type,Audience Segment,Scheduled At,Created At\n';
  const body = rows
    .map((c) =>
      [
        `"${c.name.replace(/"/g, '""')}"`,
        c.status,
        c.type,
        c.audience_segment_id ?? '',
        c.scheduled_at ?? '',
        c.created_at,
      ].join(','),
    )
    .join('\n');

  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `campaigns-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CampaignList() {
  const {
    campaigns,
    isLive,
    isLoading,
    error,
    updateCampaign,
    deleteCampaign,
    refetch,
  } = useMarketingCampaigns();

  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  const filtered = useMemo(() => {
    let result = campaigns;
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'status') return a.status.localeCompare(b.status) * dir;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });
    return result;
  }, [campaigns, statusFilter, searchQuery, sortKey, sortDir]);

  const handleAction = async (id: string, action: 'pause' | 'archive' | 'delete') => {
    setOpenMenuId(null);
    if (action === 'pause') await updateCampaign(id, { status: 'paused' });
    else if (action === 'archive') await updateCampaign(id, { status: 'archived' });
    else if (action === 'delete') await deleteCampaign(id);
  };

  const SortButton = ({ field, label }: { field: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-graphite/40 hover:text-graphite/60 transition-colors"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <>
      <Helmet>
        <title>Campaigns | Marketing | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">Campaigns</h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              Manage opt-in marketing campaigns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-graphite/10 text-sm font-sans font-medium text-graphite hover:bg-graphite/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <Link
              to="/portal/marketing/campaigns/new"
              className="inline-flex items-center gap-2 h-10 px-5 bg-accent text-white text-sm font-sans font-medium rounded-full hover:bg-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Link>
          </div>
        </div>

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-signal-down" />
              <p className="text-sm font-sans text-graphite">{error}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-graphite/10 text-sm font-sans font-medium text-graphite hover:bg-graphite/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm font-sans text-graphite bg-white border border-graphite/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-graphite/30" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
              className="h-9 px-3 text-xs font-sans text-graphite bg-white border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden">
          {isLoading ? (
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Created</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Megaphone className="w-10 h-10 text-graphite/15 mx-auto mb-3" />
              <p className="text-sm text-graphite/50 font-sans mb-3">
                {searchQuery || statusFilter ? 'No campaigns match your filters' : 'No campaigns yet'}
              </p>
              {!searchQuery && !statusFilter && (
                <Link
                  to="/portal/marketing/campaigns/new"
                  className="inline-flex items-center gap-2 text-sm font-sans font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Create your first campaign
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-graphite/8">
                    <th className="text-left px-6 py-3"><SortButton field="name" label="Name" /></th>
                    <th className="text-left px-6 py-3"><SortButton field="status" label="Status" /></th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Type</th>
                    <th className="text-left px-6 py-3"><SortButton field="created_at" label="Created" /></th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-accent-soft/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/portal/marketing/campaigns/${c.id}`}
                          className="font-medium text-graphite hover:text-accent transition-colors"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-4 text-graphite/60 capitalize">{c.type.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-graphite/40 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                            className="p-1.5 rounded-lg text-graphite/30 hover:text-graphite hover:bg-graphite/5 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === c.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-graphite/10 rounded-lg shadow-lg z-10 py-1">
                              <Link
                                to={`/portal/marketing/campaigns/${c.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-graphite hover:bg-accent-soft/50 transition-colors w-full"
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </Link>
                              {c.status === 'active' && (
                                <button
                                  onClick={() => handleAction(c.id, 'pause')}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-graphite hover:bg-accent-soft/50 transition-colors w-full text-left"
                                >
                                  <Pause className="w-3 h-3" /> Pause
                                </button>
                              )}
                              <button
                                onClick={() => handleAction(c.id, 'archive')}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-graphite hover:bg-accent-soft/50 transition-colors w-full text-left"
                              >
                                <Archive className="w-3 h-3" /> Archive
                              </button>
                              <button
                                onClick={() => handleAction(c.id, 'delete')}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-signal-down hover:bg-signal-down/5 transition-colors w-full text-left"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
