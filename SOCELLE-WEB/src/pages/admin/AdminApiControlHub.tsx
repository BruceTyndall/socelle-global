// ── AdminApiControlHub — WO-OVERHAUL-04 ────────────────────────────
// API Control Center. Read/edit api_registry table.
// Data label: LIVE — reads/writes api_registry with real updated_at
//
// SECURITY: NEVER display api_key_encrypted field.
// Select specific columns to exclude it from network payloads.

import { useState, useMemo } from 'react';
import {
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Shield,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Play,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────
// SECURITY: api_key_encrypted is intentionally excluded from this interface.

interface ApiRegistryRow {
  id: string;
  name: string;
  provider: string;
  category: string;
  base_url: string | null;
  docs_url: string | null;
  environment: string;
  is_active: boolean;
  last_tested_at: string | null;
  last_test_status: 'pass' | 'fail' | 'timeout' | 'untested' | null;
  last_test_latency_ms: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Safe columns — excludes api_key_encrypted
const SAFE_COLUMNS = 'id,name,provider,category,base_url,docs_url,environment,is_active,last_tested_at,last_test_status,last_test_latency_ms,notes,created_at,updated_at';

const CATEGORIES = ['payments', 'ai', 'search', 'analytics', 'email', 'storage', 'auth', 'monitoring', 'other'] as const;

const STATUS_COLORS: Record<string, string> = {
  pass: 'bg-green-100 text-green-800',
  fail: 'bg-red-100 text-red-800',
  timeout: 'bg-yellow-100 text-yellow-800',
  untested: 'bg-gray-100 text-gray-600',
};

const CATEGORY_COLORS: Record<string, string> = {
  payments: 'bg-purple-100 text-purple-700',
  ai: 'bg-blue-100 text-blue-700',
  search: 'bg-cyan-100 text-cyan-700',
  analytics: 'bg-teal-100 text-teal-700',
  email: 'bg-orange-100 text-orange-700',
  storage: 'bg-amber-100 text-amber-700',
  auth: 'bg-rose-100 text-rose-700',
  monitoring: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-600',
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

// ── Component ──────────────────────────────────────────────────────

export default function AdminApiControlHub() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Fetch (SECURITY: select only safe columns) ─────────────────

  const { data: apis = [], isLoading: loading, refetch: fetchApis } = useQuery({
    queryKey: ['admin-api-registry'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('api_registry')
        .select(SAFE_COLUMNS)
        .order('name', { ascending: true });
      if (err) throw new Error(err.message);
      return (data as ApiRegistryRow[]) || [];
    },
  });

  // ── Filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return apis.filter((api) => {
      const matchesSearch =
        !search ||
        api.name.toLowerCase().includes(search.toLowerCase()) ||
        api.provider.toLowerCase().includes(search.toLowerCase()) ||
        (api.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || api.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && api.is_active) ||
        (statusFilter === 'inactive' && !api.is_active) ||
        api.last_test_status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [apis, search, categoryFilter, statusFilter]);

  // ── Actions ────────────────────────────────────────────────────

  const toggleActive = async (api: ApiRegistryRow) => {
    const { error: err } = await supabase
      .from('api_registry')
      .update({ is_active: !api.is_active, updated_at: new Date().toISOString() })
      .eq('id', api.id);
    if (err) setError(err.message);
    else fetchApis();
  };

  const testConnection = async (api: ApiRegistryRow) => {
    // Placeholder: Phase 6 will wire an edge function for real connection tests.
    // For now, mark as tested with "untested" to indicate test was requested.
    const { error: err } = await supabase
      .from('api_registry')
      .update({
        last_tested_at: new Date().toISOString(),
        last_test_status: 'untested',
        updated_at: new Date().toISOString(),
      })
      .eq('id', api.id);
    if (err) {
      setError(err.message);
    } else {
      setSuccessMsg(`Test queued for "${api.name}" (Phase 6 will wire live test)`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchApis();
    }
  };

  // ── Stats ──────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: apis.length,
    active: apis.filter((a) => a.is_active).length,
    passing: apis.filter((a) => a.last_test_status === 'pass').length,
    failing: apis.filter((a) => a.last_test_status === 'fail').length,
    untested: apis.filter((a) => !a.last_test_status || a.last_test_status === 'untested').length,
  }), [apis]);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            API Control Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total} APIs registered &mdash; {stats.active} active
          </p>
        </div>
        <button onClick={() => void fetchApis()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-semibold text-green-600">{stats.passing}</p>
          <p className="text-xs text-gray-500">Passing</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-semibold text-red-600">{stats.failing}</p>
          <p className="text-xs text-gray-500">Failing</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-semibold text-gray-400">{stats.untested}</p>
          <p className="text-xs text-gray-500">Untested</p>
        </div>
      </div>

      {/* Feedback */}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search APIs..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pass">Test: Pass</option>
          <option value="fail">Test: Fail</option>
          <option value="untested">Test: Untested</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading APIs...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No APIs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">API</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Env</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Test Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Last Tested</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((api) => (
                  <tr key={api.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{api.name}</div>
                      <div className="text-gray-400 text-xs">{api.provider}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[api.category] || CATEGORY_COLORS.other}`}>
                        {api.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{api.environment}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(api)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title={api.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {api.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[api.last_test_status || 'untested']}`}>
                          {api.last_test_status === 'pass' && <Wifi className="w-3 h-3 mr-1" />}
                          {api.last_test_status === 'fail' && <WifiOff className="w-3 h-3 mr-1" />}
                          {api.last_test_status || 'untested'}
                        </span>
                        {api.last_test_latency_ms != null && (
                          <span className="text-xs text-gray-400">{api.last_test_latency_ms}ms</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {api.last_tested_at ? formatDate(api.last_tested_at) : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => testConnection(api)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Test Connection"
                        >
                          <Play className="w-4 h-4 text-blue-600" />
                        </button>
                        {api.docs_url && (
                          <a
                            href={api.docs_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="API Docs"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                          </a>
                        )}
                        <span className="p-1.5" title="Key secured">
                          <Shield className="w-4 h-4 text-gray-300" />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
        <Shield className="w-4 h-4 shrink-0" />
        API keys are encrypted at rest and never displayed in admin UI. Connection tests execute server-side only.
      </div>
    </div>
  );
}
