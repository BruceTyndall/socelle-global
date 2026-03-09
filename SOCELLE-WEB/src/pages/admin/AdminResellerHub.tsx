import { useState } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Palette,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAllResellerAccounts } from '../../lib/useReseller';
import type { ResellerAccount } from '../../lib/useReseller';

// ── Admin Reseller Hub — Reseller account management ────────────────────────
// Data source: reseller_accounts, white_label_config (LIVE when DB-connected)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: ResellerAccount['status'] }) {
  const config = {
    pending: { icon: Clock, className: 'bg-amber-100 text-amber-800' },
    approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
    rejected: { icon: XCircle, className: 'bg-red-100 text-red-800' },
    suspended: { icon: Shield, className: 'bg-gray-100 text-gray-800' },
  };
  const { icon: Icon, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-sans ${className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function AdminResellerHub() {
  const { accounts, loading, isLive, updateAccountStatus, updateCommissionRate } = useAllResellerAccounts();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | ResellerAccount['status']>('all');

  const filtered = statusFilter === 'all' ? accounts : accounts.filter(a => a.status === statusFilter);
  const pendingCount = accounts.filter(a => a.status === 'pending').length;

  const handleRateChange = async (accountId: string) => {
    const rate = parseFloat(rateInputs[accountId] ?? '');
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    try {
      await updateCommissionRate(accountId, rate);
    } catch {
      // handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Reseller Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Manage reseller accounts, commissions, and white-label configurations
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
            <Clock className="w-3 h-3" />
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-accent-soft rounded-xl p-4">
          <p className="text-[10px] font-sans font-medium text-graphite/60 uppercase tracking-wider">Total Resellers</p>
          <p className="text-xl font-sans font-semibold text-graphite mt-1">{accounts.length}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-4">
          <p className="text-[10px] font-sans font-medium text-graphite/60 uppercase tracking-wider">Approved</p>
          <p className="text-xl font-sans font-semibold text-green-700 mt-1">{accounts.filter(a => a.status === 'approved').length}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-4">
          <p className="text-[10px] font-sans font-medium text-graphite/60 uppercase tracking-wider">Pending</p>
          <p className="text-xl font-sans font-semibold text-amber-700 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-4">
          <p className="text-[10px] font-sans font-medium text-graphite/60 uppercase tracking-wider">Suspended</p>
          <p className="text-xl font-sans font-semibold text-gray-500 mt-1">{accounts.filter(a => a.status === 'suspended').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded-full transition-colors ${
              statusFilter === s
                ? 'bg-graphite text-white'
                : 'text-graphite/60 hover:text-graphite hover:bg-accent-soft/30'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Accounts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-accent-soft rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-accent-soft rounded w-1/3 mb-2" />
              <div className="h-3 bg-accent-soft rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-accent-soft mx-auto mb-3" />
          <p className="text-sm text-graphite/60 font-sans">
            {statusFilter === 'all' ? 'No reseller accounts yet.' : `No ${statusFilter} accounts.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(account => {
            const isExpanded = expandedId === account.id;
            return (
              <div key={account.id} className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : account.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent-soft/10 transition-colors"
                >
                  <div>
                    <p className="text-sm font-sans font-semibold text-graphite">{account.company_name}</p>
                    <p className="text-xs text-graphite/60 font-sans">{account.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-sans font-medium text-graphite/60">
                      {account.commission_rate}%
                    </span>
                    <StatusBadge status={account.status} />
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-accent-soft" /> : <ChevronDown className="w-4 h-4 text-accent-soft" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pt-2 border-t border-accent-soft/30 space-y-4">
                    {/* Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
                      <div>
                        <p className="text-graphite/60">Applied</p>
                        <p className="text-graphite font-medium">{formatDate(account.applied_at)}</p>
                      </div>
                      <div>
                        <p className="text-graphite/60">Approved</p>
                        <p className="text-graphite font-medium">{account.approved_at ? formatDate(account.approved_at) : '--'}</p>
                      </div>
                      <div>
                        <p className="text-graphite/60">Tier</p>
                        <p className="text-graphite font-medium">{account.tier ?? 'Standard'}</p>
                      </div>
                      <div>
                        <p className="text-graphite/60">User ID</p>
                        <p className="text-graphite font-mono text-[10px] truncate">{account.user_id}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Actions */}
                      {account.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateAccountStatus(account.id, 'approved')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateAccountStatus(account.id, 'rejected')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </>
                      )}
                      {account.status === 'approved' && (
                        <button
                          onClick={() => updateAccountStatus(account.id, 'suspended')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Shield className="w-3 h-3" />
                          Suspend
                        </button>
                      )}
                      {account.status === 'suspended' && (
                        <button
                          onClick={() => updateAccountStatus(account.id, 'approved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Reactivate
                        </button>
                      )}

                      {/* Commission Rate */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <DollarSign className="w-3.5 h-3.5 text-graphite/60" />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={rateInputs[account.id] ?? account.commission_rate}
                          onChange={e => setRateInputs(p => ({ ...p, [account.id]: e.target.value }))}
                          className="w-16 px-2 py-1 text-xs font-sans font-mono text-graphite border border-accent-soft rounded focus:outline-none focus:ring-1 focus:ring-graphite/30"
                        />
                        <span className="text-xs text-graphite/60 font-sans">%</span>
                        <button
                          onClick={() => handleRateChange(account.id)}
                          className="px-2 py-1 text-[10px] font-sans font-semibold text-graphite bg-accent-soft/30 rounded hover:bg-accent-soft/50 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
