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
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  CheckSquare,
  Square,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── W13-03 → W15-03: Feeds Hub — Admin Control Center ──────────────────────
// Data source: data_feeds + feed_run_log tables (LIVE)
// isLive = true when DB-connected; false fallback shows DEMO badge
// Authority: build_tracker.md WO W13-03, W15-03

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
  provenance_tier: number | null;
  attribution_label: string | null;
  created_at: string;
}

interface FeedRunLog {
  id: string;
  feed_id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  signals_created: number;
  signals_updated: number;
  items_fetched: number;
  duration_ms: number | null;
  error_message: string | null;
}

interface NewFeedForm {
  name: string;
  feed_type: string;
  category: string;
  endpoint_url: string;
  api_key_env_var: string;
  poll_interval_minutes: number;
  provenance_tier: number;
  attribution_label: string;
}

const EMPTY_FORM: NewFeedForm = {
  name: '',
  feed_type: 'rss',
  category: 'trade_pub',
  endpoint_url: '',
  api_key_env_var: '',
  poll_interval_minutes: 60,
  provenance_tier: 2,
  attribution_label: '',
};

const FEED_TYPES = ['rss', 'api', 'scraper', 'webhook'] as const;

// Matches data_feeds CHECK constraint exactly
const CATEGORIES = [
  'trade_pub', 'brand_news', 'press_release', 'association',
  'social', 'jobs', 'events', 'academic', 'government',
  'ingredients', 'market_data', 'regional', 'regulatory', 'supplier',
] as const;

// Category → signal_type display (matches feed-orchestrator mapping)
const CATEGORY_SIGNAL_TYPE: Record<string, string> = {
  trade_pub: 'industry_news', brand_news: 'brand_update',
  press_release: 'press_release', association: 'industry_news',
  social: 'social_trend', jobs: 'job_market', events: 'event_signal',
  academic: 'research_insight', government: 'regulatory_alert',
  ingredients: 'ingredient_trend', market_data: 'market_data',
  regional: 'regional_market', regulatory: 'regulatory_alert',
  supplier: 'supply_chain',
};

const CATEGORY_TIER: Record<string, string> = {
  trade_pub: 'free', brand_news: 'free', press_release: 'free',
  association: 'free', social: 'free', jobs: 'free', events: 'free',
  academic: 'pro', government: 'pro', ingredients: 'pro',
  market_data: 'pro', regional: 'pro', regulatory: 'pro', supplier: 'pro',
};

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

function formatCat(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminFeedsHub() {
  const [rows, setRows] = useState<DataFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeed, setNewFeed] = useState<NewFeedForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [orchestratorRunning, setOrchestratorRunning] = useState(false);
  const [orchestratorResult, setOrchestratorResult] = useState<string | null>(null);
  const [testingFeedId, setTestingFeedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [expandedFeedId, setExpandedFeedId] = useState<string | null>(null);
  const [runLogs, setRunLogs] = useState<FeedRunLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

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

  // ── Load run logs for expanded feed ─────────────────────────────────────
  const loadRunLogs = useCallback(async (feedId: string) => {
    setLoadingLogs(true);
    try {
      const { data, error: logErr } = await supabase
        .from('feed_run_log')
        .select('*')
        .eq('feed_id', feedId)
        .order('started_at', { ascending: false })
        .limit(5);

      if (logErr) throw logErr;
      setRunLogs(data ?? []);
    } catch {
      setRunLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const handleExpandToggle = (feedId: string) => {
    if (expandedFeedId === feedId) {
      setExpandedFeedId(null);
      setRunLogs([]);
    } else {
      setExpandedFeedId(feedId);
      loadRunLogs(feedId);
    }
  };

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

  // ── Test single feed ───────────────────────────────────────────────────
  const handleTestFeed = async (feedId: string) => {
    setTestingFeedId(feedId);
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
          body: JSON.stringify({ feed_ids: [feedId] }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Test returned ${res.status}: ${text}`);
      }

      const result = await res.json();
      const feedResult = result.results?.[0];
      setOrchestratorResult(
        feedResult
          ? `Test complete: ${feedResult.status} — ${feedResult.signals_created} signals, ${feedResult.duration_ms}ms`
          : `Test complete: ${result.signals ?? 0} signals`
      );
      await loadData();
      if (expandedFeedId === feedId) loadRunLogs(feedId);
    } catch (err: any) {
      console.error('Test feed error:', err);
      setOrchestratorResult(`Test error: ${err.message}`);
    } finally {
      setTestingFeedId(null);
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
        is_enabled: false,
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
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Failed to delete feed.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Bulk Operations ────────────────────────────────────────────────────
  const handleBulkAction = async (action: 'enable' | 'disable') => {
    if (selectedIds.size === 0) return;
    setBulkAction(action);
    try {
      const ids = Array.from(selectedIds);
      const { error: bulkErr } = await supabase
        .from('data_feeds')
        .update({ is_enabled: action === 'enable' })
        .in('id', ids);

      if (bulkErr) throw bulkErr;
      setRows((prev) =>
        prev.map((r) => selectedIds.has(r.id) ? { ...r, is_enabled: action === 'enable' } : r)
      );
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Bulk action error:', err);
      setError(`Failed to ${action} feeds.`);
    } finally {
      setBulkAction(null);
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
        `Orchestrator complete: ${result.processed ?? 0} feeds processed, ${result.signals ?? 0} signals, ${result.errors ?? 0} errors.`
      );
      await loadData();
    } catch (err: any) {
      console.error('Orchestrator error:', err);
      setOrchestratorResult(`Orchestrator error: ${err.message}`);
    } finally {
      setOrchestratorRunning(false);
    }
  };

  // ── Selection helpers ──────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.id)));
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
  const errorCount = rows.filter((r) => r.last_error).length;
  const categories = ['all', ...Array.from(new Set(rows.map((r) => r.category))).sort()];
  const feedTypes = ['all', ...Array.from(new Set(rows.map((r) => r.feed_type))).sort()];

  const filteredRows = rows.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (typeFilter !== 'all' && r.feed_type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.attribution_label?.toLowerCase().includes(q) ?? false) ||
        (r.endpoint_url?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Feeds Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Manage data sources, test feeds, and monitor ingestion health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunOrchestrator}
            disabled={orchestratorRunning || !isLive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-graphite text-white hover:bg-graphite/90 disabled:opacity-60 font-sans text-sm transition-colors"
          >
            <Play className={`w-4 h-4 ${orchestratorRunning ? 'animate-pulse' : ''}`} />
            Run All
          </button>
          <button
            type="button"
            onClick={() => { setShowAddForm(true); setError(null); }}
            disabled={!isLive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-graphite text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feed
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
          orchestratorResult.includes('error') || orchestratorResult.includes('Error')
            ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-sm font-sans ${
            orchestratorResult.includes('error') || orchestratorResult.includes('Error')
              ? 'text-red-800' : 'text-green-800'
          }`}>{orchestratorResult}</p>
          <button type="button" onClick={() => setOrchestratorResult(null)} className="text-graphite/60 hover:text-graphite">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary strip */}
      {isLive && !loading && (
        <div className="bg-accent-soft/60 border border-accent-soft rounded-xl px-5 py-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Rss className="w-4 h-4 text-graphite flex-shrink-0" />
            <p className="text-sm text-graphite font-sans font-medium">
              {enabledCount}/{rows.length} enabled
            </p>
          </div>
          <div className="w-px h-4 bg-accent-soft" />
          <p className="text-sm text-graphite font-sans">
            {totalSignals.toLocaleString()} signals
          </p>
          <div className="w-px h-4 bg-accent-soft" />
          <p className={`text-sm font-sans ${errorCount > 0 ? 'text-red-600 font-medium' : 'text-graphite'}`}>
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Search + Filters */}
      {isLive && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feeds..."
              className="w-full pl-9 pr-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : formatCat(cat)}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
          >
            {feedTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-graphite/60 font-sans">{selectedIds.size} selected</span>
              <button
                type="button"
                onClick={() => handleBulkAction('enable')}
                disabled={!!bulkAction}
                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-sans hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                {bulkAction === 'enable' ? 'Enabling...' : 'Enable'}
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('disable')}
                disabled={!!bulkAction}
                className="px-3 py-1.5 rounded-lg bg-accent-soft text-graphite text-xs font-sans hover:bg-accent-soft/80 disabled:opacity-60 transition-colors"
              >
                {bulkAction === 'disable' ? 'Disabling...' : 'Disable'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-graphite/60 hover:text-graphite font-sans"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Feed modal/form */}
      {showAddForm && (
        <div className="bg-white border border-accent-soft rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sans text-graphite">Add New Feed</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-graphite/60 hover:text-graphite">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">Name *</label>
              <input
                type="text"
                value={newFeed.name}
                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
                placeholder="e.g., Cosmetics Design RSS"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">Feed Type *</label>
              <select
                value={newFeed.feed_type}
                onChange={(e) => setNewFeed({ ...newFeed, feed_type: e.target.value })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
              >
                {FEED_TYPES.map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">Category *</label>
              <select
                value={newFeed.category}
                onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{formatCat(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">Endpoint URL *</label>
              <input
                type="url"
                value={newFeed.endpoint_url}
                onChange={(e) => setNewFeed({ ...newFeed, endpoint_url: e.target.value })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">API Key Env Var</label>
              <input
                type="text"
                value={newFeed.api_key_env_var}
                onChange={(e) => setNewFeed({ ...newFeed, api_key_env_var: e.target.value })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
                placeholder="e.g., COSDESIGN_API_KEY"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">Poll Interval (min)</label>
              <input
                type="number"
                min={1}
                value={newFeed.poll_interval_minutes}
                onChange={(e) => setNewFeed({ ...newFeed, poll_interval_minutes: parseInt(e.target.value) || 60 })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">Provenance Tier</label>
              <select
                value={newFeed.provenance_tier}
                onChange={(e) => setNewFeed({ ...newFeed, provenance_tier: parseInt(e.target.value) })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
              >
                <option value={1}>Tier 1 — Direct/Owned</option>
                <option value={2}>Tier 2 — Public/Structured</option>
                <option value={3}>Tier 3 — Aggregated/Derived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite font-sans mb-1">Attribution Label</label>
              <input
                type="text"
                value={newFeed.attribution_label}
                onChange={(e) => setNewFeed({ ...newFeed, attribution_label: e.target.value })}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20"
                placeholder="e.g., Cosmetics Design"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddFeed}
              disabled={saving || !newFeed.name.trim() || !newFeed.endpoint_url.trim()}
              className="px-4 py-2 rounded-lg bg-graphite text-white hover:bg-graphite/90 disabled:opacity-60 font-sans text-sm transition-colors"
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
        <EmptyState label={
          searchQuery.trim()
            ? `No feeds matching "${searchQuery}".`
            : categoryFilter === 'all' ? 'No feeds configured yet.' : `No feeds in category "${formatCat(categoryFilter)}".`
        } />
      ) : (
        <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-accent-soft bg-accent-soft/50">
                  <th className="px-3 py-3 w-8">
                    <button type="button" onClick={toggleSelectAll} className="text-graphite/60 hover:text-graphite">
                      {selectedIds.size === filteredRows.length && filteredRows.length > 0
                        ? <CheckSquare className="w-4 h-4" />
                        : <Square className="w-4 h-4" />
                      }
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-graphite w-6" />
                  <th className="text-left px-3 py-3 font-medium text-graphite">Name</th>
                  <th className="text-left px-3 py-3 font-medium text-graphite">Type</th>
                  <th className="text-left px-3 py-3 font-medium text-graphite">Category</th>
                  <th className="text-left px-3 py-3 font-medium text-graphite">Signal Type</th>
                  <th className="text-left px-3 py-3 font-medium text-graphite">Tier</th>
                  <th className="text-left px-3 py-3 font-medium text-graphite">Enabled</th>
                  <th className="text-left px-3 py-3 font-medium text-graphite">Last Run</th>
                  <th className="text-right px-3 py-3 font-medium text-graphite">Signals</th>
                  <th className="text-right px-3 py-3 font-medium text-graphite">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft/50">
                {filteredRows.map((feed) => {
                  const freshness = getFreshnessStatus(feed.last_fetched_at, feed.last_error);
                  const signalType = CATEGORY_SIGNAL_TYPE[feed.category] ?? 'industry_news';
                  const tier = CATEGORY_TIER[feed.category] ?? 'free';
                  const isExpanded = expandedFeedId === feed.id;

                  return (
                    <FeedRow
                      key={feed.id}
                      feed={feed}
                      freshness={freshness}
                      signalType={signalType}
                      tier={tier}
                      isSelected={selectedIds.has(feed.id)}
                      isExpanded={isExpanded}
                      isTesting={testingFeedId === feed.id}
                      isToggling={togglingId === feed.id}
                      confirmingDelete={confirmDeleteId === feed.id}
                      isDeletingFeed={deletingId === feed.id}
                      runLogs={isExpanded ? runLogs : []}
                      loadingLogs={isExpanded && loadingLogs}
                      onSelect={() => toggleSelect(feed.id)}
                      onExpand={() => handleExpandToggle(feed.id)}
                      onToggle={() => handleToggle(feed)}
                      onTest={() => handleTestFeed(feed.id)}
                      onConfirmDelete={() => setConfirmDeleteId(feed.id)}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                      onDelete={() => handleDelete(feed.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-accent-soft bg-accent-soft/30 px-4 py-2">
            <p className="text-xs text-graphite/60 font-sans">
              Showing {filteredRows.length} of {rows.length} feeds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Feed Row ────────────────────────────────────────────────────────────────

interface FeedRowProps {
  feed: DataFeed;
  freshness: 'green' | 'yellow' | 'red';
  signalType: string;
  tier: string;
  isSelected: boolean;
  isExpanded: boolean;
  isTesting: boolean;
  isToggling: boolean;
  confirmingDelete: boolean;
  isDeletingFeed: boolean;
  runLogs: FeedRunLog[];
  loadingLogs: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onToggle: () => void;
  onTest: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

function FeedRow({
  feed, freshness, signalType, tier, isSelected, isExpanded,
  isTesting, isToggling, confirmingDelete, isDeletingFeed,
  runLogs, loadingLogs,
  onSelect, onExpand, onToggle, onTest, onConfirmDelete, onCancelDelete, onDelete,
}: FeedRowProps) {
  return (
    <>
      <tr className={`hover:bg-accent-soft/30 transition-colors ${isSelected ? 'bg-accent-soft/40' : ''}`}>
        {/* Checkbox */}
        <td className="px-3 py-3">
          <button type="button" onClick={onSelect} className="text-graphite/60 hover:text-graphite">
            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
        </td>
        {/* Expand + status */}
        <td className="px-3 py-3">
          <button type="button" onClick={onExpand} className="flex items-center gap-1 text-graphite/60 hover:text-graphite">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Circle className={`w-2.5 h-2.5 fill-current ${STATUS_DOT_COLORS[freshness]}`} />
          </button>
        </td>
        {/* Name */}
        <td className="px-3 py-3 text-graphite font-medium max-w-[200px] truncate" title={feed.name}>
          {feed.name}
          {feed.api_key_env_var && (
            <span className="ml-1.5 text-[10px] text-amber-600 font-normal">KEY</span>
          )}
        </td>
        {/* Type */}
        <td className="px-3 py-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-graphite">
            {feed.feed_type}
          </span>
        </td>
        {/* Category */}
        <td className="px-3 py-3 text-graphite text-xs">
          {formatCat(feed.category)}
        </td>
        {/* Signal Type */}
        <td className="px-3 py-3 text-xs text-graphite/60">
          {signalType.replace(/_/g, ' ')}
        </td>
        {/* Tier */}
        <td className="px-3 py-3">
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
            tier === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
          }`}>
            {tier}
          </span>
        </td>
        {/* Toggle */}
        <td className="px-3 py-3">
          <button
            type="button"
            onClick={onToggle}
            disabled={isToggling}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              feed.is_enabled ? 'bg-green-500' : 'bg-accent-soft'
            } ${isToggling ? 'opacity-60' : ''}`}
            aria-label={feed.is_enabled ? 'Disable feed' : 'Enable feed'}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                feed.is_enabled ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </td>
        {/* Last Fetched */}
        <td className="px-3 py-3 text-graphite/60 text-xs">
          {formatRelativeTime(feed.last_fetched_at)}
          {feed.last_error && (
            <span className="block text-[10px] text-red-500 truncate max-w-[120px]" title={feed.last_error}>
              {feed.last_error}
            </span>
          )}
        </td>
        {/* Signal count */}
        <td className="px-3 py-3 text-right text-graphite tabular-nums">
          {(feed.signal_count || 0).toLocaleString()}
        </td>
        {/* Actions */}
        <td className="px-3 py-3 text-right">
          <div className="flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={onTest}
              disabled={isTesting}
              className="p-1 text-graphite/60 hover:text-graphite transition-colors disabled:opacity-60"
              title="Test this feed"
            >
              <Zap className={`w-4 h-4 ${isTesting ? 'animate-pulse text-amber-500' : ''}`} />
            </button>
            {confirmingDelete ? (
              <>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeletingFeed}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {isDeletingFeed ? '...' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="px-2 py-1 text-xs border border-accent-soft text-graphite rounded hover:bg-accent-soft transition-colors"
                >
                  No
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onConfirmDelete}
                className="p-1 text-graphite/60 hover:text-red-600 transition-colors"
                title="Delete feed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
      {/* Expanded: Run History */}
      {isExpanded && (
        <tr>
          <td colSpan={11} className="bg-accent-soft/20 px-6 py-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-graphite font-sans uppercase tracking-wider">
                Recent Runs
              </h4>
              {loadingLogs ? (
                <p className="text-xs text-graphite/60 font-sans">Loading...</p>
              ) : runLogs.length === 0 ? (
                <p className="text-xs text-graphite/60 font-sans">No runs recorded yet.</p>
              ) : (
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="text-left text-graphite/60">
                      <th className="pr-4 py-1 font-medium">Started</th>
                      <th className="pr-4 py-1 font-medium">Status</th>
                      <th className="pr-4 py-1 font-medium">Items</th>
                      <th className="pr-4 py-1 font-medium">Signals</th>
                      <th className="pr-4 py-1 font-medium">Duration</th>
                      <th className="py-1 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/30">
                    {runLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="pr-4 py-1.5 text-graphite">
                          {formatRelativeTime(log.started_at)}
                        </td>
                        <td className="pr-4 py-1.5">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            log.status === 'success' ? 'bg-green-100 text-green-700' :
                            log.status === 'error' ? 'bg-red-100 text-red-700' :
                            log.status === 'running' ? 'bg-blue-100 text-blue-700' :
                            'bg-accent-soft text-graphite'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="pr-4 py-1.5 text-graphite tabular-nums">{log.items_fetched}</td>
                        <td className="pr-4 py-1.5 text-graphite tabular-nums">{log.signals_created}</td>
                        <td className="pr-4 py-1.5 text-graphite tabular-nums">
                          {log.duration_ms != null ? `${log.duration_ms}ms` : '—'}
                        </td>
                        <td className="py-1.5 text-red-500 truncate max-w-[200px]" title={log.error_message ?? ''}>
                          {log.error_message ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {feed.endpoint_url && (
                <p className="text-[10px] text-graphite/60 mt-2 truncate" title={feed.endpoint_url}>
                  URL: {feed.endpoint_url}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-5 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-3 h-3 rounded-full bg-accent-soft flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-accent-soft rounded w-1/3" />
            <div className="h-3 bg-accent-soft rounded w-1/2" />
          </div>
          <div className="w-9 h-5 bg-accent-soft rounded-full" />
          <div className="w-16 h-5 bg-accent-soft rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
      <Rss className="w-12 h-12 text-accent-soft mx-auto mb-4" />
      <p className="text-graphite/60 font-sans text-sm">{label}</p>
    </div>
  );
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
      <Rss className="w-12 h-12 text-accent-soft mx-auto mb-4" />
      <h3 className="text-lg font-sans text-graphite mb-2">{title}</h3>
      <p className="text-graphite/60 font-sans text-sm max-w-md mx-auto">{description}</p>
      <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
        <AlertCircle className="w-3 h-3" />
        DEMO
      </span>
    </div>
  );
}
