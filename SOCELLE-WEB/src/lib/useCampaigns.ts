import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';
import { useAuth } from './auth';

// ── WO-OVERHAUL-15: Marketing Platform — Campaign hooks ──────────────
// Tables: campaigns, campaign_content
// isLive flag drives DEMO badge. ZERO cold email — all campaigns opt-in only.
// Migrated to TanStack Query v5 (V2-TECH-04).

export type CampaignType = 'email' | 'sms' | 'push' | 'in_app' | 'social';
export type CampaignStatusType = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';

export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatusType;
  subject: string | null;
  preview_text: string | null;
  body: Record<string, unknown> | null;
  audience_segment_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseCampaignsReturn {
  campaigns: MarketingCampaign[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
  createCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>) => Promise<MarketingCampaign | null>;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => Promise<boolean>;
  refetch: () => void;
}

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
    type: asString(row.type) as CampaignType,
    status: asString(row.status, 'draft') as CampaignStatusType,
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
  campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>,
  userId?: string | null,
  tenantId?: string | null,
): Record<string, unknown> {
  return {
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    audience_segment_id: campaign.audience_segment_id ?? null,
    scheduled_start_at: campaign.scheduled_at ?? null,
    goal: campaign.preview_text ?? null,
    created_by: userId ?? null,
    tenant_id: tenantId ?? null,
    metadata: {
      subject: campaign.subject ?? null,
      preview_text: campaign.preview_text ?? null,
      body: campaign.body ?? null,
      sent_at: campaign.sent_at ?? null,
    },
  };
}

function toNormalizedUpdate(updates: Partial<MarketingCampaign>): Record<string, unknown> {
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

export function useCampaigns(): UseCampaignsReturn {
  const queryClient = useQueryClient();
  const { user, profile, isAdmin, isPlatformAdmin } = useAuth();
  const isGlobalAdmin = isAdmin || isPlatformAdmin;

  const { data: campaigns = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['campaigns'],
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

  const createMut = useMutation({
    mutationFn: async (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>) => {
      const legacyInsert = await supabase
        .from('campaigns')
        .insert(campaign)
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
        .insert(toNormalizedInsert(campaign, user?.id, profile?.business_id ?? null))
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MarketingCampaign> }) => {
      const legacyUpdate = await supabase.from('campaigns').update(updates).eq('id', id);
      if (!legacyUpdate.error) return;
      if (!isSchemaMismatch(legacyUpdate.error)) throw new Error(legacyUpdate.error.message);

      const { error } = await supabase
        .from('campaigns')
        .update(toNormalizedUpdate(updates))
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); },
  });

  const createCampaign = async (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingCampaign | null> => {
    if (!isSupabaseConfigured) return null;
    try { return await createMut.mutateAsync(campaign); } catch { return null; }
  };

  const updateCampaign = async (id: string, updates: Partial<MarketingCampaign>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try { await updateMut.mutateAsync({ id, updates }); return true; } catch { return false; }
  };

  const isLive = campaigns.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { campaigns, isLive, loading, error, createCampaign, updateCampaign, refetch };
}
