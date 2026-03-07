// ── AdminSeoHub — WO-OVERHAUL-04 ───────────────────────────────────
// SEO manager. CRUD on sitemap_entries table + page-level meta from cms_pages.
// Data label: LIVE — reads/writes sitemap_entries with real lastmod

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  ArrowLeft,
  Globe,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Map,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

interface SitemapEntry {
  id: string;
  loc: string;
  changefreq: string;
  priority: number;
  lastmod: string;
  is_active: boolean;
  source: string;
  created_at: string;
}

const CHANGEFREQ_OPTIONS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] as const;
const SOURCE_OPTIONS = ['manual', 'auto', 'cms', 'blog'] as const;

// ── Helpers ────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Component ──────────────────────────────────────────────────────

export default function AdminSeoHub() {
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [editing, setEditing] = useState<SitemapEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    loc: '',
    changefreq: 'weekly',
    priority: '0.5',
    is_active: true,
    source: 'manual',
  });

  // ── Fetch ──────────────────────────────────────────────────────

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('sitemap_entries')
      .select('*')
      .order('loc', { ascending: true });

    if (err) {
      setError(err.message);
      setEntries([]);
    } else {
      setEntries((data as SitemapEntry[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ── Filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch = !search || e.loc.toLowerCase().includes(search.toLowerCase());
      const matchesSource = sourceFilter === 'all' || e.source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [entries, search, sourceFilter]);

  // ── CRUD ───────────────────────────────────────────────────────

  const resetForm = () => {
    setForm({ loc: '', changefreq: 'weekly', priority: '0.5', is_active: true, source: 'manual' });
  };

  const openCreate = () => {
    resetForm();
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (entry: SitemapEntry) => {
    setForm({
      loc: entry.loc,
      changefreq: entry.changefreq,
      priority: String(entry.priority),
      is_active: entry.is_active,
      source: entry.source,
    });
    setEditing(entry);
    setCreating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const priority = parseFloat(form.priority);
    if (isNaN(priority) || priority < 0 || priority > 1) {
      setError('Priority must be between 0 and 1');
      setSaving(false);
      return;
    }

    const payload = {
      loc: form.loc,
      changefreq: form.changefreq,
      priority,
      is_active: form.is_active,
      source: form.source,
      lastmod: new Date().toISOString(),
    };

    if (editing) {
      const { error: err } = await supabase
        .from('sitemap_entries')
        .update(payload)
        .eq('id', editing.id);
      if (err) setError(err.message);
      else {
        setSuccessMsg('Entry updated');
        setEditing(null);
      }
    } else {
      const { error: err } = await supabase.from('sitemap_entries').insert(payload);
      if (err) setError(err.message);
      else {
        setSuccessMsg('Entry created');
        setCreating(false);
      }
    }
    setSaving(false);
    resetForm();
    fetchEntries();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this sitemap entry?')) return;
    const { error: err } = await supabase.from('sitemap_entries').delete().eq('id', id);
    if (err) setError(err.message);
    else fetchEntries();
  };

  const toggleActive = async (entry: SitemapEntry) => {
    const { error: err } = await supabase
      .from('sitemap_entries')
      .update({ is_active: !entry.is_active, lastmod: new Date().toISOString() })
      .eq('id', entry.id);
    if (err) setError(err.message);
    else fetchEntries();
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
              {editing ? 'Edit Sitemap Entry' : 'New Sitemap Entry'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route / URL *</label>
            <input
              type="text"
              value={form.loc}
              onChange={(e) => setForm({ ...form, loc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="/intelligence"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Change Frequency</label>
              <select
                value={form.changefreq}
                onChange={(e) => setForm({ ...form, changefreq: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CHANGEFREQ_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (0-1)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active in sitemap</span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.loc}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editing ? 'Update Entry' : 'Create Entry'}
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
            <Map className="w-6 h-6" />
            SEO &amp; Sitemap Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length} entries &mdash; {entries.filter((e) => e.is_active).length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchEntries} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Entry
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
            placeholder="Search routes..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Sources</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading entries...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No sitemap entries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Route</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Freq</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Last Mod</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{entry.loc}</td>
                    <td className="px-4 py-3 text-gray-500">{entry.changefreq}</td>
                    <td className="px-4 py-3 text-gray-500">{entry.priority}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(entry)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                        {entry.is_active ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(entry.lastmod)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(entry)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
