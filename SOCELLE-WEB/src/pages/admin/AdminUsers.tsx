// ── AdminUsers — V2-HUBS-05: User Management ─────────────────────────────
// Data source: user_profiles table (LIVE when table exists, DEMO fallback)
// Authority: build_tracker.md WO V2-HUBS-05

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Download,
  RefreshCw,
  ShieldAlert,
  UserX,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportToCsv } from '../../lib/csvExport';

// ── Types ─────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  status: string;
  last_sign_in_at: string | null;
  created_at: string;
}

type SortField = 'display_name' | 'email' | 'role' | 'status' | 'last_sign_in_at' | 'created_at';
type SortDir = 'asc' | 'desc';

const ROLE_OPTIONS = [
  'user',
  'business_user',
  'brand_admin',
  'admin',
  'platform_admin',
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  return code === '42P01' || message.includes('does not exist');
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function roleBadgeClasses(role: string): string {
  switch (role) {
    case 'platform_admin':
    case 'admin':
      return 'bg-[#8E6464]/10 text-[#8E6464]';
    case 'brand_admin':
      return 'bg-[#A97A4C]/10 text-[#A97A4C]';
    case 'business_user':
      return 'bg-[#5F8A72]/10 text-[#5F8A72]';
    default:
      return 'bg-[#6E879B]/10 text-[#6E879B]';
  }
}

function statusBadgeClasses(status: string): string {
  if (status === 'active') return 'bg-[#5F8A72]/10 text-[#5F8A72]';
  if (status === 'deactivated' || status === 'suspended') return 'bg-[#8E6464]/10 text-[#8E6464]';
  return 'bg-[#A97A4C]/10 text-[#A97A4C]';
}

// ── Data fetching ─────────────────────────────────────────────────────────

async function fetchUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, display_name, role, status, last_sign_in_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error && !isMissingTableError(error)) {
    throw error;
  }
  if (error && isMissingTableError(error)) {
    return [];
  }
  return (data ?? []) as UserProfile[];
}

async function updateUserRole(userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
}

async function updateUserStatus(userId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ status })
    .eq('id', userId);
  if (error) throw error;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
    error: errorObj,
    refetch,
  } = useQuery({ queryKey: ['admin', 'users'], queryFn: fetchUsers, staleTime: 30_000 });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditingRole(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  // ── Filtering + Sorting ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? users.filter(
          (u) =>
            (u.display_name ?? '').toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        )
      : users;

    return [...base].sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  // ── CSV Export ──────────────────────────────────────────────────────

  const handleExport = () => {
    exportToCsv(
      filtered.map((u) => ({
        name: u.display_name ?? '',
        email: u.email,
        role: u.role,
        status: u.status,
        last_login: u.last_sign_in_at ?? 'Never',
        created: u.created_at,
      })),
      'socelle_users',
      [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'last_login', label: 'Last Login' },
        { key: 'created', label: 'Created' },
      ]
    );
  };

  // ── Error state ─────────────────────────────────────────────────────

  if (isError) {
    const message =
      errorObj instanceof Error ? errorObj.message : 'Failed to load users.';
    return (
      <div className="py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Users Unavailable</h3>
        <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto font-sans">{message}</p>
        <button
          onClick={() => void refetch()}
          className="mt-4 px-4 py-2 border border-accent text-accent font-medium rounded-lg hover:bg-accent-soft transition-colors font-sans text-sm"
        >
          Retry
        </button>
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
        <div className="h-10 w-full bg-accent-soft rounded-lg" />
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-12 bg-accent-soft rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────

  if (users.length === 0) {
    return (
      <div className="py-16 text-center">
        <Users className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">No Users Found</h3>
        <p className="text-sm text-graphite/60 mt-2 max-w-md mx-auto font-sans">
          No user profiles exist yet. Users will appear here once they sign up or are invited to the platform.
        </p>
        <button
          onClick={() => void refetch()}
          className="mt-4 px-4 py-2 border border-accent text-accent font-medium rounded-lg hover:bg-accent-soft transition-colors font-sans text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-graphite font-sans">User Management</h1>
          <p className="text-graphite/60 font-sans mt-1 text-sm">
            {filtered.length} of {users.length} users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full pl-10 pr-4 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-soft bg-[#F6F3EF]">
                {([
                  ['display_name', 'Name'],
                  ['email', 'Email'],
                  ['role', 'Role'],
                  ['status', 'Status'],
                  ['last_sign_in_at', 'Last Login'],
                  ['created_at', 'Created'],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th key={field} className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">
                    <button
                      onClick={() => toggleSort(field)}
                      className="inline-flex items-center gap-1 hover:text-graphite transition-colors"
                    >
                      {label}
                      <SortIcon field={field} />
                    </button>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#F6F3EF]/50 transition-colors">
                  <td className="px-4 py-3 font-sans text-graphite">
                    {user.display_name || <span className="text-graphite/40 italic">No name</span>}
                  </td>
                  <td className="px-4 py-3 font-sans text-graphite/80 truncate max-w-[200px]">{user.email}</td>
                  <td className="px-4 py-3">
                    {editingRole === user.id ? (
                      <select
                        defaultValue={user.role}
                        onChange={(e) => {
                          roleMutation.mutate({ userId: user.id, role: e.target.value });
                        }}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        className="text-xs border border-accent-soft rounded px-2 py-1 bg-white font-sans focus:outline-none focus:ring-2 focus:ring-accent/30"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingRole(user.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity ${roleBadgeClasses(user.role)}`}
                        title="Click to change role"
                      >
                        {user.role}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusBadgeClasses(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite/60 font-sans text-xs whitespace-nowrap">
                    {timeAgo(user.last_sign_in_at)}
                  </td>
                  <td className="px-4 py-3 text-graphite/60 font-sans text-xs whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.status === 'active' ? (
                      <button
                        onClick={() =>
                          statusMutation.mutate({ userId: user.id, status: 'deactivated' })
                        }
                        disabled={statusMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs text-[#8E6464] hover:text-[#8E6464]/80 font-sans font-medium transition-colors disabled:opacity-50"
                        title="Deactivate user"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          statusMutation.mutate({ userId: user.id, status: 'active' })
                        }
                        disabled={statusMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs text-[#5F8A72] hover:text-[#5F8A72]/80 font-sans font-medium transition-colors disabled:opacity-50"
                        title="Reactivate user"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results from filter */}
        {filtered.length === 0 && users.length > 0 && (
          <div className="py-10 text-center">
            <Search className="w-8 h-8 text-graphite/30 mx-auto mb-2" />
            <p className="text-sm text-graphite/60 font-sans">
              No users match &ldquo;{search}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
