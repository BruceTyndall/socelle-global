import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  RefreshCw,
  ShieldAlert,
  Clock,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── W12-11: CRM Hub — Admin Control Center ────────────────────────────────
// Data source: access_requests table (LIVE)
// isLive = true when DB-connected; false fallback shows DEMO badge

interface AccessRequest {
  id: string;
  created_at: string;
  email: string;
  business_name: string | null;
  contact_name: string | null;
  business_type: string | null;
  referral_source: string | null;
  status: string;
  notes: string | null;
  reviewed_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  duplicate: 'bg-accent-soft text-graphite',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CrmHub() {
  const [rows, setRows] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('access_requests')
        .select('id, created_at, email, business_name, contact_name, business_type, referral_source, status, notes, reviewed_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;
      setRows(data ?? []);
      setIsLive(true);
    } catch (err: any) {
      console.error('CrmHub: load error', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('does not exist') || err?.code === '42P01') {
        setIsLive(false);
        setRows([]);
      } else {
        setError('Failed to load CRM data.');
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="CRM Hub Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: loadData }}
      />
    );
  }

  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              CRM Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Access requests and lead pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary strip */}
      {isLive && !loading && pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-sans font-medium">
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-accent-soft/40 rounded-xl p-1 w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
              filter === f
                ? 'bg-white text-graphite shadow-sm'
                : 'text-graphite/60 hover:text-graphite'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : !isLive ? (
        <ComingSoonCard
          title="CRM Hub"
          description="Access requests table not available in this environment. Connect Supabase to activate live CRM data."
        />
      ) : rows.length === 0 ? (
        <EmptyState label={filter === 'all' ? 'No access requests yet.' : `No ${filter} requests.`} />
      ) : (
        <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-accent-soft bg-accent-soft/50">
                  <th className="text-left px-4 py-3 font-medium text-graphite">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-graphite">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-graphite">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-graphite">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-graphite">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft/50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-accent-soft/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-graphite/60 flex-shrink-0" />
                        <div>
                          {row.contact_name && (
                            <p className="text-graphite font-medium">{row.contact_name}</p>
                          )}
                          <p className="text-graphite/60 text-xs">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-graphite">
                      {row.business_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {row.business_type ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-graphite">
                          {row.business_type}
                        </span>
                      ) : (
                        <span className="text-graphite/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || 'bg-accent-soft text-graphite'}`}>
                        {row.status === 'pending' && <Clock className="w-3 h-3" />}
                        {row.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {row.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-graphite/60 text-xs">
                      {formatDate(row.created_at)}
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

// ── Shared sub-components ──────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-5 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-accent-soft flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-accent-soft rounded w-1/3" />
            <div className="h-3 bg-accent-soft rounded w-1/2" />
          </div>
          <div className="w-16 h-5 bg-accent-soft rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
      <Users className="w-12 h-12 text-accent-soft mx-auto mb-4" />
      <p className="text-graphite/60 font-sans text-sm">{label}</p>
    </div>
  );
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
      <Building2 className="w-12 h-12 text-accent-soft mx-auto mb-4" />
      <h3 className="text-lg font-sans text-graphite mb-2">{title}</h3>
      <p className="text-graphite/60 font-sans text-sm max-w-md mx-auto">{description}</p>
      <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
        <AlertCircle className="w-3 h-3" />
        DEMO
      </span>
    </div>
  );
}
