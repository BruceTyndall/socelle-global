// ── AdminFeatureFlags — CTRL-WO-01: Feature Flags ───────────────────────────
// Data source: feature_flags + subscriptions tables (live)
// Authority: docs/operations/OPERATION_BREAKOUT.md → CTRL-WO-01

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ToggleLeft,
  ToggleRight,
  Flag,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../lib/auditLog';
import { evaluateFlag, type FeatureFlagRow } from '../../lib/useFeatureFlag';

// ── Types ─────────────────────────────────────────────────────────────────

const TIER_OPTIONS = ['free', 'starter', 'pro', 'enterprise'] as const;
const PREVIEW_TIERS = ['starter', 'pro', 'enterprise'] as const;
type PreviewTier = (typeof PREVIEW_TIERS)[number];

interface FeatureFlagData {
  flags: FeatureFlagRow[];
  tierUsers: Record<PreviewTier, string[]>;
}

interface TierCoverage {
  enabled: number;
  total: number;
  percent: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function normalizePlanTier(raw: string | null | undefined): PreviewTier | null {
  if (!raw) return null;
  const plan = raw.toLowerCase().trim();
  if (plan === 'starter') return 'starter';
  if (plan === 'pro' || plan === 'growth') return 'pro';
  if (plan === 'enterprise') return 'enterprise';
  return null;
}

// ── Data fetching ─────────────────────────────────────────────────────────

async function fetchFlags(): Promise<FeatureFlagData> {
  const { data: featureFlags, error: flagsError } = await supabase
    .from('feature_flags')
    .select('*')
    .order('created_at', { ascending: false });

  if (flagsError) {
    throw flagsError;
  }

  const tierUsers: Record<PreviewTier, string[]> = {
    starter: [],
    pro: [],
    enterprise: [],
  };

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('user_id, plan_id, status, created_at')
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false });

  if (subscriptionsError) {
    throw subscriptionsError;
  }

  const latestPlanByUser = new Map<string, string>();
  for (const row of subscriptions ?? []) {
    const userId = typeof row.user_id === 'string' ? row.user_id : '';
    const planId = typeof row.plan_id === 'string' ? row.plan_id : '';
    if (!userId || !planId || latestPlanByUser.has(userId)) continue;
    latestPlanByUser.set(userId, planId);
  }

  for (const [userId, planId] of latestPlanByUser.entries()) {
    const tier = normalizePlanTier(planId);
    if (tier) {
      tierUsers[tier].push(userId);
    }
  }

  return { flags: (featureFlags as FeatureFlagRow[]) ?? [], tierUsers };
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminFeatureFlags() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const {
    data,
    isLoading,
    isError,
    error: errorObj,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: fetchFlags,
    staleTime: 30_000,
  });

  const flags = data?.flags ?? [];
  const tierUsers = data?.tierUsers ?? { starter: [], pro: [], enterprise: [] };

  // ── Mutations ─────────────────────────────────────────────────────────

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
    // Also invalidate individual flag queries used by useFeatureFlag hook
    void queryClient.invalidateQueries({ queryKey: ['feature_flag'] });
  };

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      enabled,
      flagKey,
    }: {
      id: string;
      enabled: boolean;
      flagKey: string;
    }) => {
      const { error } = await supabase
        .from('feature_flags')
        .update({ default_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      await logAudit({
        action: 'feature_flag.update',
        resourceType: 'feature_flag',
        resourceId: id,
        details: {
          flag_key: flagKey,
          field: 'default_enabled',
          value: enabled,
        },
      });
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async (
      updates: Partial<FeatureFlagRow> & {
        id: string;
        auditContext?: string;
        flagKey?: string;
      }
    ) => {
      const { id, auditContext, flagKey, ...rest } = updates;
      const { error } = await supabase
        .from('feature_flags')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      await logAudit({
        action: 'feature_flag.update',
        resourceType: 'feature_flag',
        resourceId: id,
        details: {
          flag_key: flagKey ?? null,
          context: auditContext ?? 'generic_update',
          changed_fields: Object.keys(rest),
          patch: rest,
        },
      });
    },
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: async (flag: { flag_key: string; display_name: string; description: string }) => {
      const { data, error } = await supabase.from('feature_flags').insert({
        flag_key: flag.flag_key,
        display_name: flag.display_name,
        description: flag.description,
        default_enabled: false,
        enabled_tiers: [],
        enabled_user_ids: [],
        rollout_percentage: 0,
      }).select('id, flag_key').single();
      if (error) throw error;

      await logAudit({
        action: 'feature_flag.create',
        resourceType: 'feature_flag',
        resourceId: data?.id,
        details: {
          flag_key: data?.flag_key ?? flag.flag_key,
          display_name: flag.display_name,
        },
      });
    },
    onSuccess: () => {
      invalidate();
      setShowCreate(false);
      setNewKey('');
      setNewName('');
      setNewDesc('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, flagKey }: { id: string; flagKey: string }) => {
      const { error } = await supabase.from('feature_flags').delete().eq('id', id);
      if (error) throw error;

      await logAudit({
        action: 'feature_flag.delete',
        resourceType: 'feature_flag',
        resourceId: id,
        details: { flag_key: flagKey },
      });
    },
    onSuccess: invalidate,
  });

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleToggle = (flag: FeatureFlagRow) => {
    toggleMutation.mutate({
      id: flag.id,
      enabled: !flag.default_enabled,
      flagKey: flag.flag_key,
    });
  };

  const handleCreate = () => {
    if (!newKey.trim() || !newName.trim()) return;
    createMutation.mutate({
      flag_key: newKey.trim().toUpperCase().replace(/\s+/g, '_'),
      display_name: newName.trim(),
      description: newDesc.trim(),
    });
  };

  const handleDelete = (id: string) => {
    const flag = flags.find((f) => f.id === id);
    deleteMutation.mutate({ id, flagKey: flag?.flag_key ?? 'unknown' });
  };

  const handleTierToggle = (flag: FeatureFlagRow, tier: string) => {
    const tiers = flag.enabled_tiers.includes(tier)
      ? flag.enabled_tiers.filter((t) => t !== tier)
      : [...flag.enabled_tiers, tier];
    updateMutation.mutate({
      id: flag.id,
      enabled_tiers: tiers,
      auditContext: 'tier_toggle',
      flagKey: flag.flag_key,
    });
  };

  const handleRolloutChange = (flag: FeatureFlagRow, pct: number) => {
    updateMutation.mutate({
      id: flag.id,
      rollout_percentage: pct,
      auditContext: 'rollout_percentage',
      flagKey: flag.flag_key,
    });
  };

  const handleUserIdsChange = (flag: FeatureFlagRow, raw: string) => {
    const ids = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    updateMutation.mutate({
      id: flag.id,
      enabled_user_ids: ids,
      auditContext: 'user_override',
      flagKey: flag.flag_key,
    });
  };

  // ── KPI counts ────────────────────────────────────────────────────────

  const enabledCount = useMemo(
    () => flags.filter((f) => f.default_enabled).length,
    [flags]
  );

  const coverageByFlag = useMemo(() => {
    const result = new Map<string, Record<PreviewTier, TierCoverage>>();

    for (const flag of flags) {
      const coverage = {} as Record<PreviewTier, TierCoverage>;
      for (const tier of PREVIEW_TIERS) {
        const users = tierUsers[tier];
        const enabled = users.filter((userId) => evaluateFlag(flag, userId, tier)).length;
        const total = users.length;
        coverage[tier] = {
          enabled,
          total,
          percent: total > 0 ? Math.round((enabled / total) * 100) : 0,
        };
      }
      result.set(flag.id, coverage);
    }

    return result;
  }, [flags, tierUsers]);

  // ── Error state ───────────────────────────────────────────────────────

  if (isError) {
    const message =
      errorObj instanceof Error ? errorObj.message : 'Failed to load feature flags.';
    return (
      <div className="py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Feature Flags Unavailable</h3>
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

  // ── Loading state ─────────────────────────────────────────────────────

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
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-accent-soft rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-accent-soft rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-graphite font-sans">Feature Flags</h1>
            <p className="text-graphite/60 font-sans mt-1 text-sm">
              {enabledCount} enabled, {flags.length - enabledCount} disabled
            </p>
          </div>
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
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover font-sans text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Flag
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-accent-soft rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-graphite font-sans">Create New Flag</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-graphite/70 font-sans mb-1">
                Flag Key
              </label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="MY_NEW_FEATURE"
                className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/70 font-sans mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My New Feature"
                className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/70 font-sans mb-1">
              Description
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What this flag controls..."
              className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newKey.trim() || !newName.trim() || createMutation.isPending}
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover font-sans text-sm transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Flag'}
            </button>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Total Flags</p>
          <p className="text-3xl font-semibold text-graphite font-sans">{flags.length}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Enabled</p>
          <p className="text-3xl font-semibold text-[#5F8A72] font-sans">{enabledCount}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Disabled</p>
          <p className="text-3xl font-semibold text-graphite/60 font-sans">
            {flags.length - enabledCount}
          </p>
        </div>
      </div>

      {/* Flags list */}
      <div className="space-y-3">
        {flags.length === 0 && (
          <div className="py-10 text-center bg-white border border-accent-soft rounded-xl">
            <Flag className="w-8 h-8 text-graphite/30 mx-auto mb-2" />
            <p className="text-sm text-graphite/60 font-sans">
              No feature flags yet. Click &ldquo;New Flag&rdquo; to create one.
            </p>
          </div>
        )}

        {flags.map((flag) => {
          const isExpanded = expandedId === flag.id;
          const coverage = coverageByFlag.get(flag.id);
          const proCoverage = coverage?.pro;
          return (
            <div
              key={flag.id}
              className="bg-white border border-accent-soft rounded-xl hover:border-accent/30 transition-colors"
            >
              {/* Flag row */}
              <div className="p-5 flex items-start gap-4">
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(flag)}
                  className="mt-0.5 shrink-0 focus:outline-none"
                  title={flag.default_enabled ? 'Disable flag' : 'Enable flag'}
                >
                  {flag.default_enabled ? (
                    <ToggleRight className="w-8 h-8 text-[#5F8A72]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-graphite/30" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-graphite font-mono">
                      {flag.flag_key}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        flag.default_enabled
                          ? 'bg-[#5F8A72]/10 text-[#5F8A72]'
                          : 'bg-graphite/5 text-graphite/40'
                      }`}
                    >
                      {flag.default_enabled ? 'ON' : 'OFF'}
                    </span>
                    {flag.enabled_tiers.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6E879B]/10 text-[#6E879B]">
                        {flag.enabled_tiers.join(', ')}
                      </span>
                    )}
                    {flag.rollout_percentage > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A97A4C]/10 text-[#A97A4C]">
                        {flag.rollout_percentage}% rollout
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-graphite/60 font-sans mt-1">
                    {flag.display_name}
                    {flag.description ? ` — ${flag.description}` : ''}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-graphite/40 font-sans">
                    <span>Updated {timeAgo(flag.updated_at)}</span>
                    {proCoverage && proCoverage.total > 0 && (
                      <span>
                        ON for {proCoverage.percent}% of Pro users ({proCoverage.enabled}/
                        {proCoverage.total})
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand / Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : flag.id)}
                    className="p-1.5 rounded-lg hover:bg-accent-soft transition-colors text-graphite/50"
                    title="Expand details"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(flag.id)}
                    className="p-1.5 rounded-lg hover:bg-[#8E6464]/10 transition-colors text-graphite/30 hover:text-[#8E6464]"
                    title="Delete flag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="border-t border-accent-soft px-5 py-4 space-y-4 bg-[#F6F3EF]/50">
                  {/* Enabled tiers */}
                  <div>
                    <label className="block text-xs font-medium text-graphite/70 font-sans mb-2">
                      Enabled Tiers
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TIER_OPTIONS.map((tier) => {
                        const isActive = flag.enabled_tiers.includes(tier);
                        return (
                          <button
                            key={tier}
                            onClick={() => handleTierToggle(flag, tier)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-accent text-white'
                                : 'bg-white border border-accent-soft text-graphite/60 hover:border-accent/30'
                            }`}
                          >
                            {tier}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rollout percentage */}
                  <div>
                    <label className="block text-xs font-medium text-graphite/70 font-sans mb-2">
                      Rollout Percentage: {flag.rollout_percentage}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={flag.rollout_percentage}
                      onChange={(e) => handleRolloutChange(flag, Number(e.target.value))}
                      className="w-full max-w-sm accent-[#6E879B]"
                    />
                    <div className="flex justify-between text-[10px] text-graphite/40 font-sans max-w-sm">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* User IDs */}
                  <div>
                    <label className="block text-xs font-medium text-graphite/70 font-sans mb-2">
                      User ID Overrides (one per line or comma-separated)
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={flag.enabled_user_ids.join('\n')}
                      onBlur={(e) => handleUserIdsChange(flag, e.target.value)}
                      placeholder="Enter user UUIDs..."
                      className="w-full px-3 py-2 border border-accent-soft rounded-lg text-xs text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
                    />
                  </div>

                  <div>
                    <p className="block text-xs font-medium text-graphite/70 font-sans mb-2">
                      Rollout Preview
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {PREVIEW_TIERS.map((tier) => {
                        const tierCoverage = coverage?.[tier] ?? { enabled: 0, total: 0, percent: 0 };
                        return (
                          <div key={tier} className="rounded-lg border border-accent-soft bg-white p-3">
                            <p className="text-[10px] uppercase tracking-wide text-graphite/50 font-sans">
                              {tier}
                            </p>
                            <p className="text-lg font-semibold text-graphite font-sans mt-1">
                              {tierCoverage.percent}%
                            </p>
                            <p className="text-[11px] text-graphite/60 font-sans">
                              ON for {tierCoverage.enabled}/{tierCoverage.total} users
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 bg-accent-soft/50 rounded-xl p-4">
        <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <div className="text-xs text-graphite/60 font-sans">
          <p className="font-medium text-graphite/80 mb-1">About Feature Flags</p>
          <p>
            Feature flags control platform behavior at runtime. Check order:
            user override (highest priority), then tier match, then rollout percentage
            (deterministic hash of user ID), then default. Use the hook{' '}
            <code className="font-mono text-accent">useFeatureFlag(&apos;FLAG_KEY&apos;)</code>{' '}
            in components.
          </p>
        </div>
      </div>
    </div>
  );
}
