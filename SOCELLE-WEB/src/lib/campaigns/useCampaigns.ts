import { useState, useCallback, useEffect } from 'react';
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

export function useCampaigns() {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    if (!isSupabaseConfigured || !profile?.brand_id) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('campaigns')
      .select('id,name,status,scheduled_start_at,scheduled_end_at,goal,goal_value,metadata,created_at')
      .eq('tenant_id', profile.brand_id)
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setCampaigns([]);
      setLoading(false);
      return;
    }

    const rows = (data as CampaignRow[] | null) ?? [];
    setCampaigns(rows.map(fromCampaignRow));
    setLoading(false);
  }, [profile?.brand_id]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const addCampaign = useCallback(
    async (campaign: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign | null> => {
      if (!isSupabaseConfigured || !profile?.brand_id || !user?.id) {
        setError('Campaign storage is not configured');
        return null;
      }

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

      const { data, error: insertError } = await supabase
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

      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to create campaign');
        return null;
      }

      const created = fromCampaignRow(data as CampaignRow);
      setCampaigns((prev) => [created, ...prev]);
      return created;
    },
    [profile?.brand_id, user?.id]
  );

  const updateCampaign = useCallback(
    async (id: string, updates: Partial<Campaign>): Promise<boolean> => {
      if (!isSupabaseConfigured) {
        setError('Campaign storage is not configured');
        return false;
      }

      const current = campaigns.find((campaign) => campaign.id === id);
      if (!current) return false;

      const merged: Campaign = {
        ...current,
        ...updates,
      };

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

      const { error: updateError } = await supabase
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

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setCampaigns((prev) =>
        prev.map((campaign) => (campaign.id === id ? merged : campaign))
      );
      return true;
    },
    [campaigns]
  );

  const deleteCampaign = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setError('Campaign storage is not configured');
      return false;
    }

    const { error: deleteError } = await supabase.from('campaigns').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    return true;
  }, []);

  return {
    campaigns,
    loading,
    error,
    isLive: isSupabaseConfigured,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    refetch: loadCampaigns,
  };
}

export function useAutomations() {
  const { profile } = useAuth();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAutomations = useCallback(async () => {
    if (!isSupabaseConfigured || !profile?.brand_id) {
      setAutomations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('brand_automation_rules')
      .select('id,name,rule_type,enabled,trigger_days,description,last_triggered_at,trigger_count')
      .eq('brand_id', profile.brand_id)
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setAutomations([]);
      setLoading(false);
      return;
    }

    setAutomations(((data as AutomationRow[] | null) ?? []).map(toAutomationRule));
    setLoading(false);
  }, [profile?.brand_id]);

  useEffect(() => {
    void loadAutomations();
  }, [loadAutomations]);

  const toggleAutomation = useCallback(
    async (id: string): Promise<boolean> => {
      const existing = automations.find((rule) => rule.id === id);
      if (!existing) return false;

      const { error: updateError } = await supabase
        .from('brand_automation_rules')
        .update({ enabled: !existing.enabled, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setAutomations((prev) =>
        prev.map((rule) =>
          rule.id === id
            ? { ...rule, enabled: !rule.enabled }
            : rule
        )
      );
      return true;
    },
    [automations]
  );

  const addAutomation = useCallback(
    async (rule: Omit<AutomationRule, 'id' | 'triggerCount'>): Promise<AutomationRule | null> => {
      if (!profile?.brand_id) {
        setError('Brand context is missing');
        return null;
      }

      const { data, error: insertError } = await supabase
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

      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to create automation rule');
        return null;
      }

      const created = toAutomationRule(data as AutomationRow);
      setAutomations((prev) => [created, ...prev]);
      return created;
    },
    [profile?.brand_id]
  );

  const deleteAutomation = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('brand_automation_rules')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setAutomations((prev) => prev.filter((rule) => rule.id !== id));
    return true;
  }, []);

  return {
    automations,
    loading,
    error,
    isLive: isSupabaseConfigured,
    toggleAutomation,
    addAutomation,
    deleteAutomation,
    refetch: loadAutomations,
  };
}

export function useTierDiscounts() {
  const { profile } = useAuth();
  const [tierDiscounts, setTierDiscounts] = useState<TierDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTierDiscounts = useCallback(async () => {
    if (!isSupabaseConfigured || !profile?.brand_id) {
      setTierDiscounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('brand_tier_discounts')
      .select('id,tier,discount_percent,min_units,description')
      .eq('brand_id', profile.brand_id)
      .order('tier', { ascending: true });

    if (queryError) {
      setError(queryError.message);
      setTierDiscounts([]);
      setLoading(false);
      return;
    }

    setTierDiscounts(((data as TierDiscountRow[] | null) ?? []).map(toTierDiscount));
    setLoading(false);
  }, [profile?.brand_id]);

  useEffect(() => {
    void loadTierDiscounts();
  }, [loadTierDiscounts]);

  const addTierDiscount = useCallback(
    async (discount: Omit<TierDiscount, 'id'>): Promise<TierDiscount | null> => {
      if (!profile?.brand_id) {
        setError('Brand context is missing');
        return null;
      }

      const { data, error: insertError } = await supabase
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

      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to create tier discount');
        return null;
      }

      const created = toTierDiscount(data as TierDiscountRow);
      setTierDiscounts((prev) => [...prev, created]);
      return created;
    },
    [profile?.brand_id]
  );

  const updateTierDiscount = useCallback(
    async (id: string, updates: Partial<TierDiscount>): Promise<boolean> => {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.tier) payload.tier = updates.tier;
      if (typeof updates.discountPercent === 'number') payload.discount_percent = updates.discountPercent;
      if ('minUnits' in updates) payload.min_units = updates.minUnits ?? null;
      if (typeof updates.description === 'string') payload.description = updates.description;

      const { error: updateError } = await supabase
        .from('brand_tier_discounts')
        .update(payload)
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setTierDiscounts((prev) =>
        prev.map((discount) =>
          discount.id === id
            ? {
                ...discount,
                ...updates,
              }
            : discount
        )
      );
      return true;
    },
    []
  );

  const deleteTierDiscount = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('brand_tier_discounts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setTierDiscounts((prev) => prev.filter((discount) => discount.id !== id));
    return true;
  }, []);

  return {
    tierDiscounts,
    loading,
    error,
    isLive: isSupabaseConfigured,
    addTierDiscount,
    updateTierDiscount,
    deleteTierDiscount,
    refetch: loadTierDiscounts,
  };
}

export function useVolumeDiscounts() {
  const { profile } = useAuth();
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVolumeDiscounts = useCallback(async () => {
    if (!isSupabaseConfigured || !profile?.brand_id) {
      setVolumeDiscounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('brand_volume_discounts')
      .select('id,min_units,max_units,discount_percent')
      .eq('brand_id', profile.brand_id)
      .order('min_units', { ascending: true });

    if (queryError) {
      setError(queryError.message);
      setVolumeDiscounts([]);
      setLoading(false);
      return;
    }

    setVolumeDiscounts(((data as VolumeDiscountRow[] | null) ?? []).map(toVolumeDiscount));
    setLoading(false);
  }, [profile?.brand_id]);

  useEffect(() => {
    void loadVolumeDiscounts();
  }, [loadVolumeDiscounts]);

  const addVolumeDiscount = useCallback(
    async (discount: Omit<VolumeDiscount, 'id'>): Promise<VolumeDiscount | null> => {
      if (!profile?.brand_id) {
        setError('Brand context is missing');
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('brand_volume_discounts')
        .insert({
          brand_id: profile.brand_id,
          min_units: discount.minUnits,
          max_units: discount.maxUnits ?? null,
          discount_percent: discount.discountPercent,
        })
        .select('id,min_units,max_units,discount_percent')
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to create volume discount');
        return null;
      }

      const created = toVolumeDiscount(data as VolumeDiscountRow);
      setVolumeDiscounts((prev) => [...prev, created]);
      return created;
    },
    [profile?.brand_id]
  );

  const updateVolumeDiscount = useCallback(
    async (id: string, updates: Partial<VolumeDiscount>): Promise<boolean> => {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (typeof updates.minUnits === 'number') payload.min_units = updates.minUnits;
      if ('maxUnits' in updates) payload.max_units = updates.maxUnits ?? null;
      if (typeof updates.discountPercent === 'number') payload.discount_percent = updates.discountPercent;

      const { error: updateError } = await supabase
        .from('brand_volume_discounts')
        .update(payload)
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setVolumeDiscounts((prev) =>
        prev.map((discount) =>
          discount.id === id
            ? {
                ...discount,
                ...updates,
              }
            : discount
        )
      );
      return true;
    },
    []
  );

  const deleteVolumeDiscount = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('brand_volume_discounts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setVolumeDiscounts((prev) => prev.filter((discount) => discount.id !== id));
    return true;
  }, []);

  return {
    volumeDiscounts,
    loading,
    error,
    isLive: isSupabaseConfigured,
    addVolumeDiscount,
    updateVolumeDiscount,
    deleteVolumeDiscount,
    refetch: loadVolumeDiscounts,
  };
}

// Utility export retained for backwards compatibility with legacy callers.
export const createClientSideId = generateId;
