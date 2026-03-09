import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users, Search, ChevronDown, Loader2, Plus, Save, X,
  Shield, ShieldOff, Calendar, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../lib/auditLog';
import { MODULE_KEYS } from '../../modules/_core/context/ModuleAccessContext';
import { getModuleMeta } from '../../modules/_core/components/UpgradePrompt';

// ── Types ───────────────────────────────────────────────────────────────────

interface AccountSub {
  id: string;
  account_id: string;
  account_name: string;
  plan_name: string;
  plan_id: string;
  status: string;
  billing_cycle: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  price_monthly: number;
}

interface ModuleOverride {
  id: string;
  module_key: string;
  access_type: string;
  expires_at: string | null;
  notes: string | null;
  granted_at: string;
  is_active: boolean;
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function AdminSubscriptionAccounts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [grantForm, setGrantForm] = useState<{ module_key: string; expires_at: string; notes: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: accounts = [], isLoading: loading } = useQuery({
    queryKey: ['account_subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_subscriptions')
        .select(`
          id, account_id, status, billing_cycle,
          current_period_start, current_period_end,
          plan:subscription_plans (id, name, price_monthly)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[AdminSubscriptionAccounts] fetch error:', error.message);
        return [];
      }

      // Fetch account names (businesses or brands)
      const accountIds = [...new Set((data ?? []).map((d: { account_id: string }) => d.account_id))];

      const nameMap: Record<string, string> = {};
      if (accountIds.length > 0) {
        const { data: businesses } = await supabase
          .from('businesses')
          .select('id, name')
          .in('id', accountIds);
        businesses?.forEach((b: { id: string; name: string }) => { nameMap[b.id] = b.name; });

        const { data: brands } = await supabase
          .from('brands')
          .select('id, name')
          .in('id', accountIds);
        brands?.forEach((b: { id: string; name: string }) => { nameMap[b.id] = b.name; });
      }

      return (data ?? []).map((d: Record<string, unknown>) => {
        const planObj = Array.isArray(d.plan) ? d.plan[0] : d.plan;
        return {
          id: d.id as string,
          account_id: d.account_id as string,
          account_name: nameMap[d.account_id as string] ?? (d.account_id as string).slice(0, 8) + '...',
          plan_name: (planObj as Record<string, unknown>)?.name as string ?? 'Unknown',
          plan_id: (planObj as Record<string, unknown>)?.id as string ?? '',
          status: d.status as string,
          billing_cycle: d.billing_cycle as string | null,
          current_period_start: d.current_period_start as string | null,
          current_period_end: d.current_period_end as string | null,
          price_monthly: (planObj as Record<string, unknown>)?.price_monthly as number ?? 0,
        };
      }) as AccountSub[];
    },
  });

  // Fetch module overrides for selected account
  const { data: overrides = [], isLoading: overrideLoading } = useQuery({
    queryKey: ['account_module_access', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return [];
      const { data } = await supabase
        .from('account_module_access')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('granted_at', { ascending: false });

      return (data as ModuleOverride[]) ?? [];
    },
    enabled: !!selectedAccount,
  });

  const handleGrantModule = async () => {
    if (!grantForm || !selectedAccount) return;
    setSaving(true);
    try {
      const { data: insertedOverride, error } = await supabase
        .from('account_module_access')
        .insert({
          account_id: selectedAccount,
          module_key: grantForm.module_key,
          access_type: 'override',
          expires_at: grantForm.expires_at || null,
          notes: grantForm.notes || null,
          is_active: true,
        })
        .select('id')
        .single();
      if (error) throw error;

      await logAudit({
        action: 'module.toggle',
        resourceType: 'account_module_access',
        resourceId: insertedOverride?.id,
        details: {
          operation: 'grant',
          account_id: selectedAccount,
          module_key: grantForm.module_key,
          expires_at: grantForm.expires_at || null,
        },
      });

      setGrantForm(null);
      void queryClient.invalidateQueries({ queryKey: ['account_module_access', selectedAccount] });
    } catch (e) {
      console.warn('Grant failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeModule = async (overrideId: string) => {
    if (!selectedAccount) return;
    const current = overrides.find((entry) => entry.id === overrideId);
    const { error } = await supabase
      .from('account_module_access')
      .update({ is_active: false })
      .eq('id', overrideId);
    if (error) {
      console.warn('Revoke failed:', error);
      return;
    }

    await logAudit({
      action: 'module.toggle',
      resourceType: 'account_module_access',
      resourceId: overrideId,
      details: {
        operation: 'revoke',
        account_id: selectedAccount,
        module_key: current?.module_key ?? null,
      },
    });

    void queryClient.invalidateQueries({ queryKey: ['account_module_access', selectedAccount] });
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.account_name.toLowerCase().includes(search.toLowerCase()) ||
      a.plan_name.toLowerCase().includes(search.toLowerCase()),
  );

  // MRR calc
  const totalMrr = accounts
    .filter((a) => a.status === 'active' || a.status === 'trialing')
    .reduce((sum, a) => sum + a.price_monthly, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Account Subscriptions</h1>
          <p className="text-sm text-graphite/50 mt-1">
            {accounts.length} subscriptions | MRR: ${totalMrr.toLocaleString()}
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          DEMO
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
        <input
          type="text"
          placeholder="Search accounts or plans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 text-sm border border-graphite/10 rounded-lg bg-white text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-graphite/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-graphite/30 animate-spin" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-16 text-sm text-graphite/40">
            No account subscriptions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider">Account</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider">Period End</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider text-right">MRR</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {filteredAccounts.map((a) => {
                  const statusColors: Record<string, string> = {
                    active: 'bg-green-50 text-green-700',
                    trialing: 'bg-blue-50 text-blue-700',
                    past_due: 'bg-red-50 text-red-700',
                    canceled: 'bg-graphite/5 text-graphite/40',
                  };
                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-mn-bg/50 transition-colors cursor-pointer ${
                        selectedAccount === a.account_id ? 'bg-accent/5' : ''
                      }`}
                      onClick={() => setSelectedAccount(a.account_id === selectedAccount ? null : a.account_id)}
                    >
                      <td className="px-6 py-3 font-medium text-graphite">{a.account_name}</td>
                      <td className="px-4 py-3 text-graphite/60">{a.plan_name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusColors[a.status] ?? 'bg-graphite/5 text-graphite/40'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-graphite/50 text-xs">
                        {a.current_period_end
                          ? new Date(a.current_period_end).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-graphite">${a.price_monthly}</td>
                      <td className="px-4 py-3 text-right">
                        <ChevronDown
                          className={`w-4 h-4 text-graphite/30 transition-transform ${
                            selectedAccount === a.account_id ? 'rotate-180' : ''
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected account detail */}
      {selectedAccount && (
        <div className="bg-white rounded-2xl border border-graphite/10 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-graphite">Module Access Overrides</h3>
            <button
              type="button"
              onClick={() => setGrantForm({ module_key: MODULE_KEYS[0], expires_at: '', notes: '' })}
              className="inline-flex items-center gap-2 h-8 px-3 bg-accent/10 text-accent text-xs font-semibold rounded-full hover:bg-accent/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Grant Module
            </button>
          </div>

          {overrideLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-4 h-4 text-graphite/30 animate-spin" />
            </div>
          ) : overrides.length === 0 ? (
            <p className="text-sm text-graphite/40 py-4">No module access records for this account.</p>
          ) : (
            <div className="space-y-2">
              {overrides.map((o) => {
                const meta = getModuleMeta(o.module_key);
                return (
                  <div
                    key={o.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      o.is_active ? 'border-green-200 bg-green-50/50' : 'border-graphite/5 bg-graphite/[0.02]'
                    }`}
                  >
                    {o.is_active ? (
                      <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <ShieldOff className="w-4 h-4 text-graphite/25 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-graphite">{meta.label}</p>
                      <p className="text-[10px] text-graphite/40">
                        {o.access_type} | granted {new Date(o.granted_at).toLocaleDateString()}
                        {o.expires_at && ` | expires ${new Date(o.expires_at).toLocaleDateString()}`}
                        {o.notes && ` | ${o.notes}`}
                      </p>
                    </div>
                    {o.is_active && (
                      <button
                        type="button"
                        onClick={() => handleRevokeModule(o.id)}
                        className="text-[10px] font-medium text-red-500 hover:text-red-700"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Grant form */}
          {grantForm && (
            <div className="bg-mn-bg rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-graphite/50 uppercase tracking-wider">Grant Module Access</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-graphite/40 mb-1">Module</label>
                  <select
                    value={grantForm.module_key}
                    onChange={(e) => setGrantForm({ ...grantForm, module_key: e.target.value })}
                    className="w-full h-9 px-2 text-sm border border-graphite/10 rounded-lg bg-white text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {MODULE_KEYS.map((k) => (
                      <option key={k} value={k}>{getModuleMeta(k).label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-graphite/40 mb-1">Expires (optional)</label>
                  <input
                    type="date"
                    value={grantForm.expires_at}
                    onChange={(e) => setGrantForm({ ...grantForm, expires_at: e.target.value })}
                    className="w-full h-9 px-2 text-sm border border-graphite/10 rounded-lg bg-white text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-graphite/40 mb-1">Notes</label>
                  <input
                    type="text"
                    value={grantForm.notes}
                    onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
                    className="w-full h-9 px-2 text-sm border border-graphite/10 rounded-lg bg-white text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
                    placeholder="Optional note"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGrantModule}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 h-8 px-4 bg-mn-dark text-white text-xs font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Grant
                </button>
                <button
                  type="button"
                  onClick={() => setGrantForm(null)}
                  className="h-8 px-3 text-xs text-graphite/50 hover:text-graphite"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
