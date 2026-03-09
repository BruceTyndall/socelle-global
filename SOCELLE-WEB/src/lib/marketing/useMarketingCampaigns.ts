import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

// ── V2-HUBS-08: Marketing Hub — Campaign CRUD hook ──────────────────
// Table: campaigns (space='marketing')
// TanStack Query v5. isLive pattern drives DEMO badge.
// ZERO cold email — all campaigns opt-in only.

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'archived';

export interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  status: CampaignStatus;
  subject: string | null;
  preview_text: string | null;
  body: Record<string, unknown> | null;
  audience_segment_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignInsert = Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>;
export type CampaignUpdate = Partial<Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>>;

const QUERY_KEY = 'marketing_campaigns';

type CampaignRow = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isSchemaMismatch(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = (error as { message?: string }).message?.toLowerCase() ?? '';
  return (
    message.includes('column') ||
    message.includes('relationship') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
}

function mapCampaignRow(row: CampaignRow): MarketingCampaign {
  const metadata = asObject(row.metadata);
  const bodyFromRow = row.body;
  const body =
    bodyFromRow && typeof bodyFromRow === 'object' && !Array.isArray(bodyFromRow)
      ? (bodyFromRow as Record<string, unknown>)
      : asObject(metadata.body);

  return {
    id: asString(row.id),
    name: asString(row.name),
    type: asString(row.type),
    status: asString(row.status, 'draft') as CampaignStatus,
    subject: asNullableString(row.subject) ?? asNullableString(metadata.subject),
    preview_text: asNullableString(row.preview_text) ?? asNullableString(row.goal),
    body: Object.keys(body).length > 0 ? body : null,
    audience_segment_id: asNullableString(row.audience_segment_id),
    scheduled_at:
      asNullableString(row.scheduled_at) ??
      asNullableString(row.scheduled_start_at),
    sent_at: asNullableString(row.sent_at) ?? asNullableString(metadata.sent_at),
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
  };
}

function toNormalizedInsert(
  input: CampaignInsert,
  userId?: string | null,
  tenantId?: string | null,
): Record<string, unknown> {
  return {
    name: input.name,
    type: input.type,
    status: input.status,
    audience_segment_id: input.audience_segment_id ?? null,
    scheduled_start_at: input.scheduled_at ?? null,
    goal: input.preview_text ?? null,
    created_by: userId ?? null,
    tenant_id: tenantId ?? null,
    metadata: {
      subject: input.subject ?? null,
      preview_text: input.preview_text ?? null,
      body: input.body ?? null,
      sent_at: input.sent_at ?? null,
    },
  };
}

function toNormalizedUpdate(updates: CampaignUpdate): Record<string, unknown> {
  const normalized: Record<string, unknown> = {
    name: updates.name,
    type: updates.type,
    status: updates.status,
    audience_segment_id: updates.audience_segment_id,
  };
  if (Object.prototype.hasOwnProperty.call(updates, 'scheduled_at')) {
    normalized.scheduled_start_at = updates.scheduled_at ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'preview_text')) {
    normalized.goal = updates.preview_text ?? null;
  }
  const metadata: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(updates, 'subject')) {
    metadata.subject = updates.subject ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'preview_text')) {
    metadata.preview_text = updates.preview_text ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'body')) {
    metadata.body = updates.body ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'sent_at')) {
    metadata.sent_at = updates.sent_at ?? null;
  }
  if (Object.keys(metadata).length > 0) {
    normalized.metadata = metadata;
  }
  return normalized;
}

export function useMarketingCampaigns() {
  const queryClient = useQueryClient();
  const { user, profile, isAdmin, isPlatformAdmin } = useAuth();
  const isGlobalAdmin = isAdmin || isPlatformAdmin;

  // ── List ──────────────────────────────────────────────────────────
  const {
    data: campaigns = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const runQuery = async (scopeByCreator: boolean) => {
        let query = supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });
        if (scopeByCreator && user?.id) {
          query = query.eq('created_by', user.id);
        }
        return query;
      };

      const scoped = !isGlobalAdmin;
      const scopedResult = await runQuery(scoped);
      if (!scopedResult.error) {
        return ((scopedResult.data ?? []) as CampaignRow[]).map(mapCampaignRow);
      }
      if (!(scoped && isSchemaMismatch(scopedResult.error))) {
        throw new Error(scopedResult.error.message);
      }

      const fallback = await runQuery(false);
      if (fallback.error) throw new Error(fallback.error.message);
      return ((fallback.data ?? []) as CampaignRow[]).map(mapCampaignRow);
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = campaigns.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  // ── Create ────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (input: CampaignInsert) => {
      const legacyInsert = await supabase
        .from('campaigns')
        .insert(input)
        .select()
        .single();
      if (!legacyInsert.error && legacyInsert.data) {
        const created = mapCampaignRow(legacyInsert.data as CampaignRow);
        if (user?.id) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            business_id: profile?.business_id ?? null,
            type: 'campaign_launch',
            channel: 'in_app',
            title: `Campaign created: ${created.name}`,
            body: created.preview_text ?? 'Campaign draft created and ready for scheduling.',
            action_url: `/portal/marketing/campaigns/${created.id}`,
          });
        }
        return created;
      }
      if (legacyInsert.error && !isSchemaMismatch(legacyInsert.error)) {
        throw new Error(legacyInsert.error.message);
      }

      const normalizedInsert = await supabase
        .from('campaigns')
        .insert(toNormalizedInsert(input, user?.id, profile?.business_id ?? null))
        .select()
        .single();
      if (normalizedInsert.error) throw new Error(normalizedInsert.error.message);
      const created = mapCampaignRow(normalizedInsert.data as CampaignRow);

      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          business_id: profile?.business_id ?? null,
          type: 'campaign_launch',
          channel: 'in_app',
          title: `Campaign created: ${created.name}`,
          body: created.preview_text ?? 'Campaign draft created and ready for scheduling.',
          action_url: `/portal/marketing/campaigns/${created.id}`,
        });
      }

      return created;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  // ── Update ────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: CampaignUpdate & { id: string }) => {
      const legacyUpdate = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!legacyUpdate.error && legacyUpdate.data) {
        return mapCampaignRow(legacyUpdate.data as CampaignRow);
      }
      if (legacyUpdate.error && !isSchemaMismatch(legacyUpdate.error)) {
        throw new Error(legacyUpdate.error.message);
      }

      const normalizedUpdate = await supabase
        .from('campaigns')
        .update(toNormalizedUpdate(updates))
        .eq('id', id)
        .select()
        .single();
      if (normalizedUpdate.error) throw new Error(normalizedUpdate.error.message);
      return mapCampaignRow(normalizedUpdate.data as CampaignRow);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  // ── Delete ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  // ── Convenience wrappers ──────────────────────────────────────────
  const createCampaign = async (input: CampaignInsert): Promise<MarketingCampaign | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      return await createMutation.mutateAsync(input);
    } catch {
      return null;
    }
  };

  const updateCampaign = async (id: string, updates: CampaignUpdate): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      await updateMutation.mutateAsync({ id, ...updates });
      return true;
    } catch {
      return false;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    campaigns,
    isLive,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    refetch,
  };
}
