import { useState } from 'react';
import {
  Plus, Save, X, ToggleLeft, ToggleRight, Loader2,
  ChevronDown, ChevronUp, Pencil,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../lib/auditLog';
import { MODULE_KEYS } from '../../modules/_core/context/ModuleAccessContext';
import { getModuleMeta } from '../../modules/_core/components/UpgradePrompt';

// ── Types ───────────────────────────────────────────────────────────────────

interface PlanRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  modules_included: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  trial_days: number;
  features: Record<string, boolean | string> | null;
  created_at: string;
  _account_count?: number;
}

const EMPTY_PLAN: Omit<PlanRow, 'id' | 'created_at' | '_account_count'> = {
  name: '',
  slug: '',
  description: '',
  price_monthly: 0,
  price_annual: 0,
  modules_included: [],
  is_featured: false,
  is_active: true,
  sort_order: 10,
  trial_days: 0,
  features: null,
};

// ── Page ────────────────────────────────────────────────────────────────────

export default function AdminSubscriptionPlans() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<PlanRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: plans = [], isLoading: loading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (err) throw new Error(err.message);

      // Try to get account counts per plan
      const { data: subCounts } = await supabase
        .from('account_subscriptions')
        .select('plan_id')
        .in('status', ['active', 'trialing']);

      const countMap: Record<string, number> = {};
      subCounts?.forEach((s: { plan_id: string }) => {
        countMap[s.plan_id] = (countMap[s.plan_id] ?? 0) + 1;
      });

      return (data as PlanRow[]).map((p) => ({
        ...p,
        _account_count: countMap[p.id] ?? 0,
      }));
    },
  });

  const handleToggleActive = async (plan: PlanRow) => {
    const { error: err } = await supabase
      .from('subscription_plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id);

    if (!err) {
      await logAudit({
        action: 'entitlement.change',
        resourceType: 'subscription_plan',
        resourceId: plan.id,
        details: {
          plan_slug: plan.slug,
          field: 'is_active',
          value: !plan.is_active,
        },
      });
      void queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: editing.name ?? '',
        slug: editing.slug ?? '',
        description: editing.description ?? null,
        price_monthly: editing.price_monthly ?? 0,
        price_annual: editing.price_annual ?? 0,
        modules_included: editing.modules_included ?? [],
        is_featured: editing.is_featured ?? false,
        is_active: editing.is_active ?? true,
        sort_order: editing.sort_order ?? 10,
        trial_days: editing.trial_days ?? 0,
        features: editing.features ?? null,
      };

      if (editing.id) {
        const { error: err } = await supabase
          .from('subscription_plans')
          .update(payload)
          .eq('id', editing.id);
        if (err) throw err;

        await logAudit({
          action: 'entitlement.change',
          resourceType: 'subscription_plan',
          resourceId: editing.id,
          details: {
            operation: 'update',
            plan_slug: payload.slug,
            modules_included: payload.modules_included,
            is_active: payload.is_active,
            is_featured: payload.is_featured,
            price_monthly: payload.price_monthly,
            price_annual: payload.price_annual,
          },
        });
      } else {
        const { data: insertedPlan, error: err } = await supabase
          .from('subscription_plans')
          .insert(payload)
          .select('id')
          .single();
        if (err) throw err;

        await logAudit({
          action: 'entitlement.change',
          resourceType: 'subscription_plan',
          resourceId: insertedPlan?.id,
          details: {
            operation: 'create',
            plan_slug: payload.slug,
            modules_included: payload.modules_included,
            is_active: payload.is_active,
            is_featured: payload.is_featured,
            price_monthly: payload.price_monthly,
            price_annual: payload.price_annual,
          },
        });
      }

      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (moduleKey: string) => {
    if (!editing) return;
    const current = editing.modules_included ?? [];
    const next = current.includes(moduleKey)
      ? current.filter((k) => k !== moduleKey)
      : [...current, moduleKey];
    setEditing({ ...editing, modules_included: next });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Subscription Plans</h1>
          <p className="text-sm text-graphite/50 mt-1">Manage plans and module packaging</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            DEMO
          </span>
          <button
            type="button"
            onClick={() => setEditing({ ...EMPTY_PLAN })}
            className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Plans table */}
      <div className="bg-white rounded-2xl border border-graphite/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-graphite/30 animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-sm text-graphite/40">
            No plans found. Create your first plan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider text-right">Monthly</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider text-right">Annual</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider text-center">Modules</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider text-center">Accounts</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider text-center">Order</th>
                  <th className="px-4 py-3 text-xs font-medium text-graphite/40 uppercase tracking-wider text-center">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-mn-bg/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-graphite">
                      <div className="flex items-center gap-2">
                        {plan.name}
                        {plan.is_featured && (
                          <span className="text-[9px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                            FEATURED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-graphite/50 font-mono text-xs">{plan.slug}</td>
                    <td className="px-4 py-3 text-right text-graphite">${plan.price_monthly}</td>
                    <td className="px-4 py-3 text-right text-graphite">${plan.price_annual}</td>
                    <td className="px-4 py-3 text-center text-graphite/50">{plan.modules_included?.length ?? 0}</td>
                    <td className="px-4 py-3 text-center text-graphite/50">{plan._account_count ?? 0}</td>
                    <td className="px-4 py-3 text-center text-graphite/40">{plan.sort_order}</td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => handleToggleActive(plan)}>
                        {plan.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-graphite/25" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing({ ...plan })}
                        className="text-accent hover:text-accent/80 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-graphite/10 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-graphite">
              {editing.id ? 'Edit Plan' : 'New Plan'}
            </h2>
            <button type="button" onClick={() => setEditing(null)}>
              <X className="w-5 h-5 text-graphite/30 hover:text-graphite/60" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-graphite/50 mb-1">Name</label>
              <input
                type="text"
                value={editing.name ?? ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-graphite/10 rounded-lg bg-mn-bg text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/50 mb-1">Slug</label>
              <input
                type="text"
                value={editing.slug ?? ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-graphite/10 rounded-lg bg-mn-bg text-graphite font-mono focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-graphite/50 mb-1">Description</label>
              <textarea
                value={editing.description ?? ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-graphite/10 rounded-lg bg-mn-bg text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/50 mb-1">Monthly Price ($)</label>
              <input
                type="number"
                min={0}
                value={editing.price_monthly ?? 0}
                onChange={(e) => setEditing({ ...editing, price_monthly: Number(e.target.value) })}
                className="w-full h-10 px-3 text-sm border border-graphite/10 rounded-lg bg-mn-bg text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/50 mb-1">Annual Price ($)</label>
              <input
                type="number"
                min={0}
                value={editing.price_annual ?? 0}
                onChange={(e) => setEditing({ ...editing, price_annual: Number(e.target.value) })}
                className="w-full h-10 px-3 text-sm border border-graphite/10 rounded-lg bg-mn-bg text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/50 mb-1">Trial Days</label>
              <input
                type="number"
                min={0}
                value={editing.trial_days ?? 0}
                onChange={(e) => setEditing({ ...editing, trial_days: Number(e.target.value) })}
                className="w-full h-10 px-3 text-sm border border-graphite/10 rounded-lg bg-mn-bg text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/50 mb-1">Sort Order</label>
              <input
                type="number"
                value={editing.sort_order ?? 10}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                className="w-full h-10 px-3 text-sm border border-graphite/10 rounded-lg bg-mn-bg text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_featured ?? false}
                onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-graphite/20 text-accent focus:ring-accent/30"
              />
              <span className="text-sm text-graphite">Featured plan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_active ?? true}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-graphite/20 text-accent focus:ring-accent/30"
              />
              <span className="text-sm text-graphite">Active</span>
            </label>
          </div>

          {/* Module checkboxes */}
          <div className="mb-6">
            <p className="text-xs font-medium text-graphite/50 mb-3">Modules Included</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {MODULE_KEYS.map((key) => {
                const meta = getModuleMeta(key);
                const checked = editing.modules_included?.includes(key) ?? false;
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-mn-bg transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModule(key)}
                      className="w-4 h-4 rounded border-graphite/20 text-accent focus:ring-accent/30"
                    />
                    <span className="text-sm text-graphite">{meta.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !editing.name || !editing.slug}
              className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Plan
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="h-10 px-5 text-sm font-medium text-graphite/60 hover:text-graphite transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
