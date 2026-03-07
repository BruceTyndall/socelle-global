import { useEffect, useState, useCallback } from 'react';
import {
  Rss,
  RefreshCw,
  ShieldAlert,
  Plus,
  Trash2,
  Play,
  X,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── W13-03: Feeds Hub — Admin Control Center ───────────────────────────────
// Data source: data_feeds table (LIVE)
// isLive = true when DB-connected; false fallback shows DEMO badge

interface DataFeed {
  id: string;
  name: string;
  feed_type: string;
  category: string;
  endpoint_url: string | null;
  api_key_env_var: string | null;
  is_enabled: boolean;
  poll_interval_minutes: number;
  last_fetched_at: string | null;
  last_error: string | null;
  signal_count: number;
  provenance_tier: string | null;
  attribution_label: string | null;
  created_at: string;
}

interface NewFeedForm {
  name: string;
  feed_type: string;
  category: string;
  endpoint_url: string;
  api_key_env_var: string;
  poll_interval_minutes: number;
  provenance_tier: string;
  attribution_label: string;
}

const EMPTY_FORM: NewFeedForm = {
  name: '',
  feed_type: 'rss',
  category: 'industry_news',
  endpoint_url: '',
  api_key_env_var: '',
  poll_interval_minutes: 60,
  provenance_tier: 'tier_2',
  attribution_label: '',
};

const FEED_TYPES = ['rss', 'api', 'scraper', 'webhook', 'manual'] as const;
const CATEGORIES = [
  'industry_news',
  'regulatory',
  'ingredient_science',
  'market_data',
  'social_trends',
  'brand_intel',
  'clinical_research',
  'trade_events',
  'other',
] as const;

const PROVENANCE_TIERS = ['tier_1', 'tier_2', 'tier_3'] as const;

function getFreshnessStatus(lastFetchedAt: string | null, lastError: string | null): 'green' | 'yellow' | 'red' {
  if (lastError) return 'red';
  if (!lastFetchedAt) return 'red';
  const diff = Date.now() - new Date(lastFetchedAt).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 2) return 'green';
  if (hours < 24) return 'yellow';
  return 'red';
}

const STATUS_DOT_COLORS: Record<string, string> = {
  green: 'text-green-500',
  yellow: 'text-amber-500',
  red: 'text-red-500',
};

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminFeedsHub() {
  const [rows, setRows] = useState<DataFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeed, setNewFeed] = useState<NewFeedForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [orchestratorRunning, setOrchestratorRunning] = useState(false);
  const [orchestratorResult, setOrchestratorResult] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('data_feeds')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (dbError) throw dbError;
      setRows(data ?? []);
      setIsLive(true);
    } catch (err: any) {
      console.error('AdminFeedsHub: load error', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('does not exist') || err?.code === '42P01') {
        setIsLive(false);
        setRows([]);
      } else {
        setError('Failed to load feeds data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Toggle is_enabled ──────────────────────────────────────────────────
  const handleToggle = async (feed: DataFeed) => {
    setTogglingId(feed.id);
    try {
      const { error: updateError } = await supabase
        .from('data_feeds')
        .update({ is_enabled: !feed.is_enabled })
        .eq('id', feed.id);

      if (updateError) throw updateError;
      setRows((prev) =>
        prev.map((r) => (r.id === feed.id ? { ...r, is_enabled: !r.is_enabled } : r))
      );
    } catch (err: any) {
      console.error('Toggle error:', err);
      setError('Failed to toggle feed status.');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Add Feed ───────────────────────────────────────────────────────────
  const handleAddFeed = async () => {
    if (!newFeed.name.trim() || !newFeed.endpoint_url.trim()) return;
    setSaving(true);
    try {
      const insertPayload: Record<string, unknown> = {
        name: newFeed.name.trim(),
        feed_type: newFeed.feed_type,
        category: newFeed.category,
        endpoint_url: newFeed.endpoint_url.trim(),
        poll_interval_minutes: newFeed.poll_interval_minutes,
        provenance_tier: newFeed.provenance_tier,
        attribution_label: newFeed.attribution_label.trim() || null,
        is_enabled: true,
        signal_count: 0,
      };
      if (newFeed.api_key_env_var.trim()) {
        insertPayload.api_key_env_var = newFeed.api_key_env_var.trim();
      }

      const { error: insertError } = await supabase
        .from('data_feeds')
        .insert(insertPayload);

      if (insertError) throw insertError;
      setNewFeed(EMPTY_FORM);
      setShowAddForm(false);
      await loadData();
    } catch (err: any) {
      console.error('Add feed error:', err);
      setError('Failed to add feed.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Feed ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error: deleteError } = await supabase
        .from('data_feeds')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setRows((prev) => prev.filter((r) => r.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Failed to delete feed.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Run Orchestrator ───────────────────────────────────────────────────
  const handleRunOrchestrator = async () => {
    setOrchestratorRunning(true);
    setOrchestratorResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/feed-orchestrator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Orchestrator returned ${res.status}: ${text}`);
      }

      const result = await res.json();
      setOrchestratorResult(
        `Orchestrator complete: ${result.processed ?? 0} feeds processed, ${result.signals ?? 0} signals generated.`
      );
      await loadData();
    } catch (err: any) {
      console.error('Orchestrator error:', err);
      setOrchestratorResult(`Orchestrator error: ${err.message}`);
    } finally {
      setOrchestratorRunning(false);
    }
  };

  // ── Error state ────────────────────────────────────────────────────────
  if (error && !isLive) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Feeds Hub Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: loadData }}
      />
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────
  const enabledCount = rows.filter((r) => r.is_enabled).length;
  const totalSignals = rows.reduce((sum, r) => sum + (r.signal_count || 0), 0);
  const categories = ['all', ...Array.from(new Set(rows.map((r) => r.category))).sort()];
  const filteredRows = categoryFilter === 'all' ? rows : rows.filter((r) => r.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-pro-navy">
              Feeds Hub<span className="text-pro-gold">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-pro-warm-gray font-sans mt-1">
            Manage data sources and ingestion feeds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunOrchestrator}
            disabled={orchestratorRunning || !isLive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pro-navy text-white hover:bg-pro-navy/90 disabled:opacity-60 font-sans text-sm transition-colors"
          >
            <Play className={`w-4 h-4 ${orchestratorRunning ? 'animate-pulse' : ''}`} />
            Run Orchestrator
          </button>
          <button
            type="button"
            onClick={() => { setShowAddForm(true); setError(null); }}
            disabled={!isLive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-pro-navy text-pro-navy hover:bg-pro-cream disabled:opacity-60 font-sans text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feed
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-pro-stone text-pro-charcoal hover:bg-pro-cream disabled:opacity-60 font-sans text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner (non-fatal) */}
      {error && isLive && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-800 font-sans">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Orchestrator result */}
      {orchestratorResult && (
        <div className={`border rounded-xl px-5 py-4 flex items-center justify-between ${
          orchestratorResult.includes('error') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-sm font-sans ${
            orchestratorResult.includes('error') ? 'text-red-800' : 'text-green-800'
          }`}>{orchestratorResult}</p>
          <button type="button" onClick={() => setOrchestratorResult(null)} className="text-pro-warm-gray hover:text-pro-charcoal">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary strip */}
      {isLive && !loading && (
        <div className="bg-pro-cream/60 border border-pro-stone rounded-xl px-5 py-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Rss className="w-4 h-4 text-pro-navy flex-shrink-0" />
            <p className="text-sm text-pro-charcoal font-sans font-medium">
              {enabledCount} feed{enabledCount !== 1 ? 's' : ''} enabled / {rows.length} total
            </p>
          </div>
          <div className="w-px h-4 bg-pro-stone" />
          <p className="text-sm text-pro-charcoal font-sans">
            {totalSignals.toLocaleString()} signals generated
          </p>
        </div>
      )}

      {/* Category filter tabs */}
      {isLive && categories.length > 1 && (
        <div className="flex gap-1 bg-pro-stone/40 rounded-xl p-1 w-fit flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white text-pro-navy shadow-sm'
                  : 'text-pro-warm-gray hover:text-pro-charcoal'
              }`}
            >
              {cat === 'all' ? 'All' : cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {/* Add Feed modal/form */}
      {showAddForm && (
        <div className="bg-white border border-pro-stone rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif text-pro-navy">Add New Feed</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-pro-warm-gray hover:text-pro-charcoal">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">Name *</label>
              <input
                type="text"
                value={newFeed.name}
                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
                placeholder="e.g., Cosmetics Design RSS"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">Feed Type *</label>
              <select
                value={newFeed.feed_type}
                onChange={(e) => setNewFeed({ ...newFeed, feed_type: e.target.value })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
              >
                {FEED_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">Category *</label>
              <select
                value={newFeed.category}
                onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">Endpoint URL *</label>
              <input
                type="url"
                value={newFeed.endpoint_url}
                onChange={(e) => setNewFeed({ ...newFeed, endpoint_url: e.target.value })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">API Key Env Var</label>
              <input
                type="text"
                value={newFeed.api_key_env_var}
                onChange={(e) => setNewFeed({ ...newFeed, api_key_env_var: e.target.value })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
                placeholder="e.g., COSDESIGN_API_KEY"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">Poll Interval (minutes)</label>
              <input
                type="number"
                min={1}
                value={newFeed.poll_interval_minutes}
                onChange={(e) => setNewFeed({ ...newFeed, poll_interval_minutes: parseInt(e.target.value) || 60 })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">Provenance Tier</label>
              <select
                value={newFeed.provenance_tier}
                onChange={(e) => setNewFeed({ ...newFeed, provenance_tier: e.target.value })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
              >
                {PROVENANCE_TIERS.map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-charcoal font-sans mb-1">Attribution Label</label>
              <input
                type="text"
                value={newFeed.attribution_label}
                onChange={(e) => setNewFeed({ ...newFeed, attribution_label: e.target.value })}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
                placeholder="e.g., Cosmetics Design"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border border-pro-stone text-pro-charcoal hover:bg-pro-cream font-sans text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddFeed}
              disabled={saving || !newFeed.name.trim() || !newFeed.endpoint_url.trim()}
              className="px-4 py-2 rounded-lg bg-pro-navy text-white hover:bg-pro-navy/90 disabled:opacity-60 font-sans text-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Add Feed'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : !isLive ? (
        <ComingSoonCard
          title="Feeds Hub"
          description="data_feeds table not available in this environment. Connect Supabase to activate live feed management."
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState label={categoryFilter === 'all' ? 'No feeds configured yet.' : `No feeds in category "${categoryFilter.replace(/_/g, ' ')}".`} />
      ) : (
        <div className="bg-white border border-pro-stone rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-pro-stone bg-pro-cream/50">
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Enabled</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Interval</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Last Fetched</th>
                  <th className="text-right px-4 py-3 font-medium text-pro-charcoal">Signals</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Error</th>
                  <th className="text-right px-4 py-3 font-medium text-pro-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pro-stone/50">
                {filteredRows.map((feed) => {
                  const freshness = getFreshnessStatus(feed.last_fetched_at, feed.last_error);
                  return (
                    <tr key={feed.id} className="hover:bg-pro-cream/30 transition-colors">
                      {/* Status dot */}
                      <td className="px-4 py-3">
                        <Circle
                          className={`w-3 h-3 fill-current ${STATUS_DOT_COLORS[freshness]}`}
                        />
                      </td>
                      {/* Name */}
                      <td className="px-4 py-3 text-pro-navy font-medium">
                        {feed.name}
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pro-stone text-pro-charcoal">
                          {feed.feed_type}
                        </span>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 text-pro-charcoal text-xs">
                        {feed.category.replace(/_/g, ' ')}
                      </td>
                      {/* Toggle */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(feed)}
                          disabled={togglingId === feed.id}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            feed.is_enabled ? 'bg-green-500' : 'bg-pro-stone'
                          } ${togglingId === feed.id ? 'opacity-60' : ''}`}
                          aria-label={feed.is_enabled ? 'Disable feed' : 'Enable feed'}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              feed.is_enabled ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      {/* Interval */}
                      <td className="px-4 py-3 text-pro-warm-gray text-xs">
                        {feed.poll_interval_minutes}m
                      </td>
                      {/* Last Fetched */}
                      <td className="px-4 py-3 text-pro-warm-gray text-xs">
                        {formatRelativeTime(feed.last_fetched_at)}
                      </td>
                      {/* Signal count */}
                      <td className="px-4 py-3 text-right text-pro-charcoal tabular-nums">
                        {(feed.signal_count || 0).toLocaleString()}
                      </td>
                      {/* Error */}
                      <td className="px-4 py-3">
                        {feed.last_error ? (
                          <span className="text-xs text-red-600 max-w-[200px] truncate block" title={feed.last_error}>
                            {feed.last_error}
                          </span>
                        ) : (
                          <span className="text-xs text-pro-warm-gray">—</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {confirmDeleteId === feed.id ? (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => handleDelete(feed.id)}
                              disabled={deletingId === feed.id}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 transition-colors"
                            >
                              {deletingId === feed.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs border border-pro-stone text-pro-charcoal rounded hover:bg-pro-cream transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(feed.id)}
                            className="text-pro-warm-gray hover:text-red-600 transition-colors"
                            aria-label="Delete feed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="bg-white border border-pro-stone rounded-xl p-5 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-3 h-3 rounded-full bg-pro-stone flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-pro-stone rounded w-1/3" />
            <div className="h-3 bg-pro-stone rounded w-1/2" />
          </div>
          <div className="w-9 h-5 bg-pro-stone rounded-full" />
          <div className="w-16 h-5 bg-pro-stone rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white border border-pro-stone rounded-xl p-12 text-center">
      <Rss className="w-12 h-12 text-pro-stone mx-auto mb-4" />
      <p className="text-pro-warm-gray font-sans text-sm">{label}</p>
    </div>
  );
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-pro-stone rounded-xl p-12 text-center">
      <Rss className="w-12 h-12 text-pro-stone mx-auto mb-4" />
      <h3 className="text-lg font-serif text-pro-navy mb-2">{title}</h3>
      <p className="text-pro-warm-gray font-sans text-sm max-w-md mx-auto">{description}</p>
      <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
        <AlertCircle className="w-3 h-3" />
        DEMO
      </span>
    </div>
  );
}
