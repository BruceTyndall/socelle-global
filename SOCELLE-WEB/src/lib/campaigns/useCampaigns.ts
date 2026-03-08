import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Campaign,
  CampaignStatus,
  DiscountType,
  AutomationRule,
  TierDiscount,
  VolumeDiscount,
  OperatorTier,
  AutomationType,
} from './types';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

// ── Migrated to TanStack Query v5 (V2-TECH-04). ─────────────────────────

interface CampaignRow {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  goal: string | null;
  goal_value: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface AutomationRow {
  id: string;
  name: string;
  rule_type: AutomationType;
  enabled: boolean;
  trigger_days: number | null;
  description: string;
  last_triggered_at: string | null;
  trigger_count: number;
}

interface TierDiscountRow {
  id: string;
  tier: OperatorTier;
  discount_percent: number;
  min_units: number | null;
  description: string;
}

interface VolumeDiscountRow {
  id: string;
  min_units: number;
  max_units: number | null;
  discount_percent: number;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

function normalizeDiscountType(value: unknown): DiscountType {
  return value === 'fixed' ? 'fixed' : 'percentage';
}

function normalizeTiers(value: unknown): OperatorTier[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tier): tier is OperatorTier => {
    return tier === 'active' || tier === 'elite' || tier === 'master';
  });
}

function normalizeProducts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string');
}

function mapDbStatus(
  status: CampaignStatus,
  metadata: Record<string, unknown>
): 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' {
  if (status === 'archived') {
    metadata.lifecycle_status = 'archived';
    return 'completed';
  }
  delete metadata.lifecycle_status;
  return status;
}

function mapUiStatus(
  status: CampaignRow['status'],
  metadata: Record<string, unknown>
): CampaignStatus {
  if (metadata.lifecycle_status === 'archived') return 'archived';
  if (status === 'paused') return 'active';
  return status;
}

function toDateInput(isoDate: string | null): string {
  if (!isoDate) return '';
  return isoDate.slice(0, 10);
}

function fromCampaignRow(row: CampaignRow): Campaign {
  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    name: row.name,
    description:
      typeof metadata.description === 'string'
        ? metadata.description
        : row.goal ?? '',
    startDate: toDateInput(row.scheduled_start_at),
    endDate: toDateInput(row.scheduled_end_at),
    discountType: normalizeDiscountType(metadata.discount_type),
    discountValue:
      typeof metadata.discount_value === 'number'
        ? metadata.discount_value
        : 0,
    eligibleProducts: normalizeProducts(metadata.eligible_products),
    eligibleTiers: normalizeTiers(metadata.eligible_tiers),
    status: mapUiStatus(row.status, metadata),
    targetOperatorCount:
      typeof metadata.target_operator_count === 'number'
        ? metadata.target_operator_count
        : row.goal_value ?? 0,
    createdAt: toDateInput(row.created_at),
  };
}

function toAutomationRule(row: AutomationRow): AutomationRule {
  return {
    id: row.id,
    name: row.name,
    type: row.rule_type,
    enabled: row.enabled,
    triggerDays: row.trigger_days ?? undefined,
    description: row.description,
    lastTriggered: row.last_triggered_at ? row.last_triggered_at.slice(0, 10) : undefined,
    triggerCount: row.trigger_count,
  };
}

function toTierDiscount(row: TierDiscountRow): TierDiscount {
  return {
    id: row.id,
    tier: row.tier,
    discountPercent: row.discount_percent,
    minUnits: row.min_units ?? undefined,
    description: row.description,
  };
}

function toVolumeDiscount(row: VolumeDiscountRow): VolumeDiscount {
  return {
    id: row.id,
    minUnits: row.min_units,
    maxUnits: row.max_units ?? undefined,
    discountPercent: row.discount_percent,
  };
}

// ── useCampaigns ──────────────────────────────────────────────────────────

export function useCampaigns() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['brand_campaigns', profile?.brand_id];

  const { data: campaigns = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id,name,status,scheduled_start_at,scheduled_end_at,goal,goal_value,metadata,created_at')
        .eq('tenant_id', profile!.brand_id!)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return ((data as CampaignRow[] | null) ?? []).map(fromCampaignRow);
    },
    enabled: isSupabaseConfigured && !!profile?.brand_id,
  });

  const addMut = useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
      if (!profile?.brand_id || !user?.id) throw new Error('Campaign storage is not configured');

      const metadata: Record<string, unknown> = {
        scope: 'brand_campaign',
        description: campaign.description,
        discount_type: campaign.discountType,
        discount_value: campaign.discountValue,
        eligible_products: campaign.eligibleProducts,
        eligible_tiers: campaign.eligibleTiers,
        target_operator_count: campaign.targetOperatorCount,
      };

      const dbStatus = mapDbStatus(campaign.status, metadata);

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: campaign.name,
          type: 'in_app',
          status: dbStatus,
          scheduled_start_at: campaign.startDate || null,
          scheduled_end_at: campaign.endDate || null,
          goal: campaign.description || null,
          goal_value: campaign.targetOperatorCount,
          created_by: user.id,
          tenant_id: profile.brand_id,
          metadata,
        })
        .select('id,name,status,scheduled_start_at,scheduled_end_at,goal,goal_value,metadata,created_at')
        .single();

      if (error || !data) throw new Error(error?.message ?? 'Failed to create campaign');
      return fromCampaignRow(data as CampaignRow);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Campaign> }) => {
      const current = campaigns.find((c) => c.id === id);
      if (!current) throw new Error('Campaign not found');

      const merged: Campaign = { ...current, ...updates };
      const metadata: Record<string, unknown> = {
        scope: 'brand_campaign',
        description: merged.description,
        discount_type: merged.discountType,
        discount_value: merged.discountValue,
        eligible_products: merged.eligibleProducts,
        eligible_tiers: merged.eligibleTiers,
        target_operator_count: merged.targetOperatorCount,
      };

      const dbStatus = mapDbStatus(merged.status, metadata);

      const { error } = await supabase
        .from('campaigns')
        .update({
          name: merged.name,
          status: dbStatus,
          scheduled_start_at: merged.startDate || null,
          scheduled_end_at: merged.endDate || null,
          goal: merged.description || null,
          goal_value: merged.targetOperatorCount,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const error = queryError instanceof Error ? queryError.message : null;
  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign | null> => {
    try { return await addMut.mutateAsync(campaign); } catch { return null; }
  };
  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>): Promise<boolean> => {
    try { await updateMut.mutateAsync({ id, updates }); return true; } catch { return false; }
  }, [updateMut]);
  const deleteCampaign = async (id: string): Promise<boolean> => {
    try { await deleteMut.mutateAsync(id); return true; } catch { return false; }
  };

  return { campaigns, loading, error, isLive: isSupabaseConfigured, addCampaign, updateCampaign, deleteCampaign, refetch: () => queryClient.invalidateQueries({ queryKey }) };
}

// ── useAutomations ────────────────────────────────────────────────────────

export function useAutomations() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['brand_automation_rules', profile?.brand_id];

  const { data: automations = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_automation_rules')
        .select('id,name,rule_type,enabled,trigger_days,description,last_triggered_at,trigger_count')
        .eq('brand_id', profile!.brand_id!)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return ((data as AutomationRow[] | null) ?? []).map(toAutomationRule);
    },
    enabled: isSupabaseConfigured && !!profile?.brand_id,
  });

  const toggleMut = useMutation({
    mutationFn: async (id: string) => {
      const existing = automations.find((r) => r.id === id);
      if (!existing) throw new Error('Rule not found');
      const { error } = await supabase
        .from('brand_automation_rules')
        .update({ enabled: !existing.enabled, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const addMut = useMutation({
    mutationFn: async (rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => {
      if (!profile?.brand_id) throw new Error('Brand context is missing');
      const { data, error } = await supabase
        .from('brand_automation_rules')
        .insert({
          brand_id: profile.brand_id,
          name: rule.name,
          rule_type: rule.type,
          enabled: rule.enabled,
          trigger_days: rule.triggerDays ?? null,
          description: rule.description,
          trigger_count: 0,
        })
        .select('id,name,rule_type,enabled,trigger_days,description,last_triggered_at,trigger_count')
        .single();
      if (error || !data) throw new Error(error?.message ?? 'Failed to create rule');
      return toAutomationRule(data as AutomationRow);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brand_automation_rules').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const error = queryError instanceof Error ? queryError.message : null;
  const toggleAutomation = async (id: string): Promise<boolean> => {
    try { await toggleMut.mutateAsync(id); return true; } catch { return false; }
  };
  const addAutomation = async (rule: Omit<AutomationRule, 'id' | 'triggerCount'>): Promise<AutomationRule | null> => {
    try { return await addMut.mutateAsync(rule); } catch { return null; }
  };
  const deleteAutomation = async (id: string): Promise<boolean> => {
    try { await deleteMut.mutateAsync(id); return true; } catch { return false; }
  };

  return { automations, loading, error, isLive: isSupabaseConfigured, toggleAutomation, addAutomation, deleteAutomation, refetch: () => queryClient.invalidateQueries({ queryKey }) };
}

// ── useTierDiscounts ──────────────────────────────────────────────────────

export function useTierDiscounts() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['brand_tier_discounts', profile?.brand_id];

  const { data: tierDiscounts = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_tier_discounts')
        .select('id,tier,discount_percent,min_units,description')
        .eq('brand_id', profile!.brand_id!)
        .order('tier', { ascending: true });
      if (error) throw new Error(error.message);
      return ((data as TierDiscountRow[] | null) ?? []).map(toTierDiscount);
    },
    enabled: isSupabaseConfigured && !!profile?.brand_id,
  });

  const addMut = useMutation({
    mutationFn: async (discount: Omit<TierDiscount, 'id'>) => {
      if (!profile?.brand_id) throw new Error('Brand context is missing');
      const { data, error } = await supabase
        .from('brand_tier_discounts')
        .insert({
          brand_id: profile.brand_id,
          tier: discount.tier,
          discount_percent: discount.discountPercent,
          min_units: discount.minUnits ?? null,
          description: discount.description,
        })
        .select('id,tier,discount_percent,min_units,description')
        .single();
      if (error || !data) throw new Error(error?.message ?? 'Failed to create tier discount');
      return toTierDiscount(data as TierDiscountRow);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TierDiscount> }) => {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.tier) payload.tier = updates.tier;
      if (typeof updates.discountPercent === 'number') payload.discount_percent = updates.discountPercent;
      if ('minUnits' in updates) payload.min_units = updates.minUnits ?? null;
      if (typeof updates.description === 'string') payload.description = updates.description;
      const { error } = await supabase.from('brand_tier_discounts').update(payload).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brand_tier_discounts').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const error = queryError instanceof Error ? queryError.message : null;
  const addTierDiscount = async (discount: Omit<TierDiscount, 'id'>): Promise<TierDiscount | null> => {
    try { return await addMut.mutateAsync(discount); } catch { return null; }
  };
  const updateTierDiscount = async (id: string, updates: Partial<TierDiscount>): Promise<boolean> => {
    try { await updateMut.mutateAsync({ id, updates }); return true; } catch { return false; }
  };
  const deleteTierDiscount = async (id: string): Promise<boolean> => {
    try { await deleteMut.mutateAsync(id); return true; } catch { return false; }
  };

  return { tierDiscounts, loading, error, isLive: isSupabaseConfigured, addTierDiscount, updateTierDiscount, deleteTierDiscount, refetch: () => queryClient.invalidateQueries({ queryKey }) };
}

// ── useVolumeDiscounts ────────────────────────────────────────────────────

export function useVolumeDiscounts() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['brand_volume_discounts', profile?.brand_id];

  const { data: volumeDiscounts = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_volume_discounts')
        .select('id,min_units,max_units,discount_percent')
        .eq('brand_id', profile!.brand_id!)
        .order('min_units', { ascending: true });
      if (error) throw new Error(error.message);
      return ((data as VolumeDiscountRow[] | null) ?? []).map(toVolumeDiscount);
    },
    enabled: isSupabaseConfigured && !!profile?.brand_id,
  });

  const addMut = useMutation({
    mutationFn: async (discount: Omit<VolumeDiscount, 'id'>) => {
      if (!profile?.brand_id) throw new Error('Brand context is missing');
      const { data, error } = await supabase
        .from('brand_volume_discounts')
        .insert({
          brand_id: profile.brand_id,
          min_units: discount.minUnits,
          max_units: discount.maxUnits ?? null,
          discount_percent: discount.discountPercent,
        })
        .select('id,min_units,max_units,discount_percent')
        .single();
      if (error || !data) throw new Error(error?.message ?? 'Failed to create volume discount');
      return toVolumeDiscount(data as VolumeDiscountRow);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VolumeDiscount> }) => {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof updates.minUnits === 'number') payload.min_units = updates.minUnits;
      if ('maxUnits' in updates) payload.max_units = updates.maxUnits ?? null;
      if (typeof updates.discountPercent === 'number') payload.discount_percent = updates.discountPercent;
      const { error } = await supabase.from('brand_volume_discounts').update(payload).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brand_volume_discounts').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const error = queryError instanceof Error ? queryError.message : null;
  const addVolumeDiscount = async (discount: Omit<VolumeDiscount, 'id'>): Promise<VolumeDiscount | null> => {
    try { return await addMut.mutateAsync(discount); } catch { return null; }
  };
  const updateVolumeDiscount = async (id: string, updates: Partial<VolumeDiscount>): Promise<boolean> => {
    try { await updateMut.mutateAsync({ id, updates }); return true; } catch { return false; }
  };
  const deleteVolumeDiscount = async (id: string): Promise<boolean> => {
    try { await deleteMut.mutateAsync(id); return true; } catch { return false; }
  };

  return { volumeDiscounts, loading, error, isLive: isSupabaseConfigured, addVolumeDiscount, updateVolumeDiscount, deleteVolumeDiscount, refetch: () => queryClient.invalidateQueries({ queryKey }) };
}

// Utility export retained for backwards compatibility with legacy callers.
export const createClientSideId = generateId;
