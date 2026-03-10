import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Download, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { exportToCsv } from '../../lib/csvExport';

// ── CRM Consent Audit Log (/portal/crm/consent) ─────────────────────────
// WO: CRM-WO-08
// Data source: crm_consent_log (LIVE when DB-connected)
// TanStack Query v5 — no raw useEffect

interface ConsentRecord {
  id: string;
  contact_id: string;
  consent_type: 'marketing' | 'data' | 'transactional';
  status: 'opted_in' | 'opted_out' | 'pending';
  channel: string;
  recorded_by: string | null;
  recorded_at: string;
  notes: string | null;
  crm_contacts: {
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
}

const CONSENT_TYPE_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  data: 'Data Processing',
  transactional: 'Transactional',
};

const STATUS_COLORS: Record<string, string> = {
  opted_in: 'bg-signal-up/10 text-signal-up',
  opted_out: 'bg-signal-down/10 text-signal-down',
  pending: 'bg-signal-warn/10 text-signal-warn',
};

const STATUS_LABELS: Record<string, string> = {
  opted_in: 'Opted In',
  opted_out: 'Opted Out',
  pending: 'Pending',
};

export default function CrmConsent() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'opted_in' | 'opted_out' | 'pending'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: records = [], isLoading, error, refetch } = useQuery({
    queryKey: ['crm_consent_log', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_consent_log')
        .select(`
          id,
          contact_id,
          consent_type,
          status,
          channel,
          recorded_by,
          recorded_at,
          notes,
          crm_contacts (
            first_name,
            last_name,
            email
          )
        `)
        .order('recorded_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ConsentRecord[];
    },
    enabled: !!businessId,
  });

  const filtered = useMemo(() => {
    let result = records;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter(r => new Date(r.recorded_at).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).setHours(23, 59, 59, 999);
      result = result.filter(r => new Date(r.recorded_at).getTime() <= to);
    }

    // Contact search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => {
        const name = `${r.crm_contacts?.first_name ?? ''} ${r.crm_contacts?.last_name ?? ''}`.toLowerCase();
        const email = (r.crm_contacts?.email ?? '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    return result;
  }, [records, statusFilter, dateFrom, dateTo, searchQuery]);

  const handleExport = () => {
    exportToCsv(
      filtered.map(r => ({
        contact: r.crm_contacts
          ? `${r.crm_contacts.first_name} ${r.crm_contacts.last_name}`
          : r.contact_id,
        email: r.crm_contacts?.email ?? '',
        consent_type: CONSENT_TYPE_LABELS[r.consent_type] ?? r.consent_type,
        status: STATUS_LABELS[r.status] ?? r.status,
        channel: r.channel,
        recorded_at: new Date(r.recorded_at).toLocaleString(),
        notes: r.notes ?? '',
      })),
      'crm_consent_log',
    );
  };

  const isLive = records.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-graphite flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Consent Audit Log
          </h1>
          <p className="text-sm text-graphite/60 mt-0.5">
            Track marketing, data, and transactional consent records for all contacts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}
          <button
            onClick={handleExport}
            className="h-9 px-4 rounded-full border border-accent-soft/30 text-graphite/70 text-sm font-medium hover:border-accent/30 inline-flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-accent-soft/30 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Contact search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
            <input
              type="text"
              placeholder="Search contact name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full border border-accent-soft/30 text-sm text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-accent/40 bg-background"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-9 px-3 rounded-full border border-accent-soft/30 text-sm text-graphite focus:outline-none focus:border-accent/40 bg-background"
          >
            <option value="all">All Statuses</option>
            <option value="opted_in">Opted In</option>
            <option value="opted_out">Opted Out</option>
            <option value="pending">Pending</option>
          </select>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-9 px-3 rounded-full border border-accent-soft/30 text-sm text-graphite focus:outline-none focus:border-accent/40 bg-background"
          />

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-9 px-3 rounded-full border border-accent-soft/30 text-sm text-graphite focus:outline-none focus:border-accent/40 bg-background"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-accent-soft/30 overflow-hidden">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-4 bg-graphite/10 rounded w-1/4" />
                <div className="h-4 bg-graphite/10 rounded w-1/6" />
                <div className="h-4 bg-graphite/10 rounded w-1/6" />
                <div className="h-4 bg-graphite/10 rounded w-1/6" />
                <div className="h-4 bg-graphite/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-signal-down/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5 text-signal-down" />
            </div>
            <p className="text-sm font-medium text-graphite mb-1">Failed to load consent records</p>
            <p className="text-xs text-graphite/50 mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <button
              onClick={() => refetch()}
              className="h-9 px-4 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-accent" />
            </div>
            <p className="text-base font-semibold text-graphite mb-1">No consent records found</p>
            <p className="text-sm text-graphite/50">
              {searchQuery || statusFilter !== 'all' || dateFrom || dateTo
                ? 'Try adjusting your filters to see more records.'
                : 'Consent records will appear here as contacts opt in or out of communications.'}
            </p>
          </div>
        )}

        {/* Records table */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent-soft/20 bg-accent-soft/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wider">
                    Consent Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wider">
                    Recorded
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft/10">
                {filtered.map(record => (
                  <tr key={record.id} className="hover:bg-accent-soft/10 transition-colors">
                    <td className="px-5 py-3.5">
                      {record.crm_contacts ? (
                        <div>
                          <p className="font-medium text-graphite">
                            {record.crm_contacts.first_name} {record.crm_contacts.last_name}
                          </p>
                          {record.crm_contacts.email && (
                            <p className="text-xs text-graphite/50 mt-0.5">
                              {record.crm_contacts.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-graphite/40 text-xs">{record.contact_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-graphite">
                        {CONSENT_TYPE_LABELS[record.consent_type] ?? record.consent_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[record.status] ?? 'bg-graphite/10 text-graphite/60'}`}
                      >
                        {STATUS_LABELS[record.status] ?? record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-graphite/70 capitalize">{record.channel}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-graphite/60 text-xs">
                        {new Date(record.recorded_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-graphite/50 text-xs line-clamp-1">
                        {record.notes ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-accent-soft/20 flex items-center justify-between">
            <p className="text-xs text-graphite/50">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              {filtered.length !== records.length ? ` (${records.length} total)` : ''}
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
