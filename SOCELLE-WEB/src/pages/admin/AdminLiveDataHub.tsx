// ── AdminLiveDataHub — WO-OVERHAUL-04 ──────────────────────────────
// Live data feed manager. CRUD on live_data_feeds table.
// Data label: LIVE — reads/writes live_data_feeds with real updated_at
// NOTE: This manages the Phase 2 live_data_feeds table, separate from
// the Wave 13 data_feeds table managed by AdminFeedsHub.

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  ArrowLeft,
  Rss,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

interface LiveDataFeed {
  id: string;
  name: string;
  source_type: 'api' | 'rss' | 'webhook' | 'scrape' | 'manual';
  source_url: string | null;
  api_key_ref: string | null;
  refresh_interval_minutes: number;
  last_refreshed_at: string | null;
  last_status: 'pending' | 'success' | 'error' | 'disabled';
  last_error: string | null;
  data_snapshot: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type FeedStatus = LiveDataFeed['last_status'];

const SOURCE_TYPES = ['api', 'rss', 'webhook', 'scrape', 'manual'] as const;

const STATUS_COLORS: Record<FeedStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  disabled: 'bg-gray-100 text-gray-600',
};

// ── Helpers ────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeSince(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Component ──────────────────────────────────────────────────────

export default function AdminLiveDataHub() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editing, setEditing] = useState<LiveDataFeed | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    source_type: 'api' as LiveDataFeed['source_type'],
    source_url: '',
    api_key_ref: '',
    refresh_interval_minutes: '60',
    is_active: true,
  });

  // ── Fetch ──────────────────────────────────────────────────────

  const { data: feeds = [], isLoading: loading, refetch: fetchFeeds } = useQuery({
    queryKey: ['admin-live-data-feeds'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('live_data_feeds')
        .select('*')
        .order('updated_at', { ascending: false });
      if (err) throw new Error(err.message);
      return (data as LiveDataFeed[]) || [];
    },
  });

  // ── Filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return feeds.filter((f) => {
      const matchesSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        (f.source_url || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || f.last_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [feeds, search, statusFilter]);

  // ── CRUD ───────────────────────────────────────────────────────

  const resetForm = () => {
    setForm({
      name: '',
      source_type: 'api',
      source_url: '',
      api_key_ref: '',
      refresh_interval_minutes: '60',
      is_active: true,
    });
  };

  const openCreate = () => {
    resetForm();
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (feed: LiveDataFeed) => {
    setForm({
      name: feed.name,
      source_type: feed.source_type,
      source_url: feed.source_url || '',
      api_key_ref: feed.api_key_ref || '',
      refresh_interval_minutes: String(feed.refresh_interval_minutes),
      is_active: feed.is_active,
    });
    setEditing(feed);
    setCreating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const interval = parseInt(form.refresh_interval_minutes, 10);
    if (isNaN(interval) || interval < 1) {
      setError('Refresh interval must be a positive number');
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      source_type: form.source_type,
      source_url: form.source_url || null,
      api_key_ref: form.api_key_ref || null,
      refresh_interval_minutes: interval,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error: err } = await supabase
        .from('live_data_feeds')
        .update(payload)
        .eq('id', editing.id);
      if (err) setError(err.message);
      else {
        setSuccessMsg('Feed updated');
        setEditing(null);
      }
    } else {
      const { error: err } = await supabase.from('live_data_feeds').insert({
        ...payload,
        last_status: 'pending',
        data_snapshot: {},
      });
      if (err) setError(err.message);
      else {
        setSuccessMsg('Feed created');
        setCreating(false);
      }
    }
    setSaving(false);
    resetForm();
    queryClient.invalidateQueries({ queryKey: ['admin-live-data-feeds'] });
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feed?')) return;
    const { error: err } = await supabase.from('live_data_feeds').delete().eq('id', id);
    if (err) setError(err.message);
    else queryClient.invalidateQueries({ queryKey: ['admin-live-data-feeds'] });
  };

  const toggleActive = async (feed: LiveDataFeed) => {
    const newActive = !feed.is_active;
    const { error: err } = await supabase
      .from('live_data_feeds')
      .update({
        is_active: newActive,
        last_status: newActive ? 'pending' : 'disabled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', feed.id);
    if (err) setError(err.message);
    else queryClient.invalidateQueries({ queryKey: ['admin-live-data-feeds'] });
  };

  const manualRefresh = async (feed: LiveDataFeed) => {
    // Mark as pending — actual refresh happens via Edge Function (Phase 6)
    const { error: err } = await supabase
      .from('live_data_feeds')
      .update({
        last_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', feed.id);
    if (err) setError(err.message);
    else {
      setSuccessMsg(`Refresh queued for "${feed.name}" (Edge Function will process)`);
      setTimeout(() => setSuccessMsg(null), 3000);
      queryClient.invalidateQueries({ queryKey: ['admin-live-data-feeds'] });
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setCreating(false);
    resetForm();
  };

  // ── Editor view ────────────────────────────────────────────────

  if (editing || creating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {editing ? 'Edit Live Data Feed' : 'New Live Data Feed'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Market Data Feed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
              <select
                value={form.source_type}
                onChange={(e) => setForm({ ...form, source_type: e.target.value as LiveDataFeed['source_type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
            <input
              type="text"
              value={form.source_url}
              onChange={(e) => setForm({ ...form, source_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://api.example.com/data"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key Reference</label>
              <input
                type="text"
                value={form.api_key_ref}
                onChange={(e) => setForm({ ...form, api_key_ref: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ENV_VAR_NAME (not the key itself)"
              />
              <p className="text-xs text-gray-400 mt-1">Reference to env var, not the actual key</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval (minutes)</label>
              <input
                type="number"
                min="1"
                value={form.refresh_interval_minutes}
                onChange={(e) => setForm({ ...form, refresh_interval_minutes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editing ? 'Update Feed' : 'Create Feed'}
            </button>
            <button onClick={handleCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Rss className="w-6 h-6" />
            Live Data Feeds
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {feeds.length} feeds &mdash; {feeds.filter((f) => f.is_active).length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFeeds} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Feed
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feeds..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading feeds...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Rss className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No feeds found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Last Refresh</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Interval</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((feed) => (
                  <tr key={feed.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{feed.name}</div>
                      {feed.source_url && (
                        <div className="text-gray-400 text-xs truncate max-w-xs">{feed.source_url}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 uppercase">
                        {feed.source_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[feed.last_status]}`}>
                        {feed.last_status === 'success' && <Wifi className="w-3 h-3 mr-1" />}
                        {feed.last_status === 'error' && <WifiOff className="w-3 h-3 mr-1" />}
                        {feed.last_status}
                      </span>
                      {feed.last_error && (
                        <p className="text-xs text-red-500 mt-1 truncate max-w-xs" title={feed.last_error}>
                          {feed.last_error}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {timeSince(feed.last_refreshed_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {feed.refresh_interval_minutes}m
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => manualRefresh(feed)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Manual refresh"
                        >
                          <Play className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => toggleActive(feed)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title={feed.is_active ? 'Disable' : 'Enable'}
                        >
                          {feed.is_active ? (
                            <Pause className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Play className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(feed)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(feed.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
