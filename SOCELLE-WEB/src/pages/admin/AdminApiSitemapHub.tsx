// ── AdminApiSitemapHub — WO-OVERHAUL-04 ────────────────────────────
// API route map viewer. Read api_route_map joined with api_registry.
// Data label: LIVE — reads api_route_map with real created_at

import { useState, useMemo } from 'react';
import {
  Search,
  X,
  AlertCircle,
  RefreshCw,
  Map,
  Download,
  Shield,
  ShieldOff,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

interface ApiRouteRow {
  id: string;
  route: string;
  method: string;
  api_registry_id: string | null;
  edge_function_name: string | null;
  description: string | null;
  auth_required: boolean;
  rate_limit_rpm: number | null;
  is_active: boolean;
  created_at: string;
  // Joined from api_registry
  api_registry: {
    name: string;
    provider: string;
    category: string;
  } | null;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  PATCH: 'bg-orange-100 text-orange-800',
  DELETE: 'bg-red-100 text-red-800',
};

// ── Component ──────────────────────────────────────────────────────

export default function AdminApiSitemapHub() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [authFilter, setAuthFilter] = useState<string>('all');
  const [apiFilter, setApiFilter] = useState<string>('all');

  // ── Fetch (join api_registry for API name) ─────────────────────

  const { data: routes = [], isLoading: loading, error: queryError, refetch: fetchRoutes } = useQuery({
    queryKey: ['admin-api-route-map'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('api_route_map')
        .select('*, api_registry:api_registry_id(name, provider, category)')
        .order('route', { ascending: true });
      if (err) throw new Error(err.message);
      return (data as ApiRouteRow[]) || [];
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  // ── Unique API names for filter ────────────────────────────────

  const apiNames = useMemo(() => {
    const names = new Set<string>();
    routes.forEach((r) => {
      if (r.api_registry?.name) names.add(r.api_registry.name);
    });
    return Array.from(names).sort();
  }, [routes]);

  // ── Filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return routes.filter((r) => {
      const matchesSearch =
        !search ||
        r.route.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.edge_function_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.api_registry?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchesMethod = methodFilter === 'all' || r.method === methodFilter;
      const matchesAuth =
        authFilter === 'all' ||
        (authFilter === 'required' && r.auth_required) ||
        (authFilter === 'public' && !r.auth_required);
      const matchesApi = apiFilter === 'all' || r.api_registry?.name === apiFilter;
      return matchesSearch && matchesMethod && matchesAuth && matchesApi;
    });
  }, [routes, search, methodFilter, authFilter, apiFilter]);

  // ── CSV Export ─────────────────────────────────────────────────

  const exportCsv = () => {
    const header = 'Route,Method,API Name,Provider,Edge Function,Auth Required,Rate Limit,Active,Description\n';
    const rows = filtered
      .map((r) =>
        [
          r.route,
          r.method,
          r.api_registry?.name || '',
          r.api_registry?.provider || '',
          r.edge_function_name || '',
          r.auth_required ? 'Yes' : 'No',
          r.rate_limit_rpm != null ? String(r.rate_limit_rpm) : '',
          r.is_active ? 'Yes' : 'No',
          `"${(r.description || '').replace(/"/g, '""')}"`,
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-route-map-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Map className="w-6 h-6" />
            API Route Map
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {routes.length} routes mapped &mdash; {routes.filter((r) => r.is_active).length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void fetchRoutes()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

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
            placeholder="Search routes, functions, APIs..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select
          value={apiFilter}
          onChange={(e) => setApiFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All APIs</option>
          {apiNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select
          value={authFilter}
          onChange={(e) => setAuthFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Auth</option>
          <option value="required">Auth Required</option>
          <option value="public">Public</option>
        </select>
      </div>

      {/* Filter summary */}
      {(methodFilter !== 'all' || apiFilter !== 'all' || authFilter !== 'all') && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Filter className="w-3.5 h-3.5" />
          Showing {filtered.length} of {routes.length} routes
          <button
            onClick={() => {
              setMethodFilter('all');
              setApiFilter('all');
              setAuthFilter('all');
              setSearch('');
            }}
            className="text-blue-600 hover:underline ml-1"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading route map...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Map className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No routes found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Route</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">API</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Edge Function</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Auth</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{route.route}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold ${METHOD_COLORS[route.method] || 'bg-gray-100 text-gray-600'}`}>
                        {route.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {route.api_registry ? (
                        <div>
                          <Link
                            to="/admin/api-control"
                            className="font-medium text-blue-700 hover:text-blue-900 hover:underline text-xs"
                          >
                            {route.api_registry.name}
                          </Link>
                          <div className="text-gray-400 text-xs">{route.api_registry.provider}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">{'\u2014'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {route.edge_function_name || '\u2014'}
                    </td>
                    <td className="px-4 py-3">
                      {route.auth_required ? (
                        <Shield className="w-4 h-4 text-green-600" />
                      ) : (
                        <ShieldOff className="w-4 h-4 text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex w-2 h-2 rounded-full ${route.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate" title={route.description || ''}>
                      {route.description || '\u2014'}
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
