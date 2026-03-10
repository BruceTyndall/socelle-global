import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── CRM Contacts + Tags + Interactions Hook ─────────────────────────────
// Data source: crm_contacts, crm_contact_tags, crm_interactions (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface CrmContact {
  id: string;
  business_id: string;
  company_id: string | null;
  type: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  lifecycle_stage: string;
  source: string | null;
  notes: string | null;
  skin_type: string | null;
  hair_type: string | null;
  allergies: string[] | null;
  sensitivities: string[] | null;
  preferred_contact_method: string | null;
  gdpr_consent: boolean;
  gdpr_consent_date: string | null;
  last_visit_date: string | null;
  total_visits: number;
  total_spend: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // CRM-WO-09: rebooking risk columns (added by migration 20260310000021)
  churn_risk_score?: number | null;
  last_visit_at?: string | null;
}

export interface CrmContactTag {
  id: string;
  contact_id: string;
  tag: string;
  created_at: string;
}

export interface CrmInteraction {
  id: string;
  contact_id: string;
  business_id: string;
  type: string;
  subject: string | null;
  notes: string | null;
  occurred_at: string;
  staff_id: string | null;
  created_at: string;
}

export interface NewContact {
  business_id: string;
  company_id?: string;
  type: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  lifecycle_stage?: string;
  source?: string;
  notes?: string;
  skin_type?: string;
  hair_type?: string;
  allergies?: string[];
  sensitivities?: string[];
  preferred_contact_method?: string;
  gdpr_consent?: boolean;
  metadata?: Record<string, unknown>;
}

export interface NewInteraction {
  contact_id: string;
  business_id: string;
  type: string;
  subject?: string;
  notes?: string;
  occurred_at?: string;
  staff_id?: string;
}

export function useCrmContacts(businessId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['crm_contacts', businessId];

  const { data: contacts = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('business_id', businessId!)
        .order('updated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as CrmContact[];
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (contact: NewContact) => {
      const { data, error } = await supabase.from('crm_contacts').insert(contact).select().single();
      if (error) throw new Error(error.message);
      return data as CrmContact;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewContact> }) => {
      const { error } = await supabase.from('crm_contacts').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_contacts').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createContact = async (contact: NewContact) => createMut.mutateAsync(contact);
  const updateContact = async (id: string, updates: Partial<NewContact>) => updateMut.mutateAsync({ id, updates });
  const deleteContact = async (id: string) => deleteMut.mutateAsync(id);

  const isLive = contacts.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { contacts, loading, error, isLive, reload, createContact, updateContact, deleteContact };
}

export function useCrmContactDetail(contactId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['crm_contact_detail', contactId];

  const { data, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const [contactRes, tagsRes] = await Promise.all([
        supabase.from('crm_contacts').select('*').eq('id', contactId!).single(),
        supabase.from('crm_contact_tags').select('*').eq('contact_id', contactId!).order('created_at', { ascending: false }),
      ]);
      if (contactRes.error) throw new Error(contactRes.error.message);
      return {
        contact: contactRes.data as CrmContact,
        tags: (tagsRes.data ?? []) as CrmContactTag[],
      };
    },
    enabled: !!contactId,
  });

  const addTagMut = useMutation({
    mutationFn: async (tag: string) => {
      const { error } = await supabase.from('crm_contact_tags').insert({ contact_id: contactId!, tag });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const removeTagMut = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase.from('crm_contact_tags').delete().eq('id', tagId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const addTag = async (tag: string) => addTagMut.mutateAsync(tag);
  const removeTag = async (tagId: string) => removeTagMut.mutateAsync(tagId);

  const contact = data?.contact ?? null;
  const tags = data?.tags ?? [];
  const isLive = contact !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { contact, tags, loading, error, isLive, reload, addTag, removeTag };
}

export function useCrmInteractions(contactId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['crm_interactions', contactId];

  const { data: interactions = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_interactions')
        .select('*')
        .eq('contact_id', contactId!)
        .order('occurred_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as CrmInteraction[];
    },
    enabled: !!contactId,
  });

  const addMut = useMutation({
    mutationFn: async (interaction: NewInteraction) => {
      const { error } = await supabase.from('crm_interactions').insert(interaction);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const addInteraction = async (interaction: NewInteraction) => addMut.mutateAsync(interaction);

  const isLive = interactions.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { interactions, loading, error, isLive, reload, addInteraction };
}

export function useRecentInteractions(businessId?: string | null, limit = 10) {
  const { data: interactions = [], isLoading: loading, refetch: reload } = useQuery({
    queryKey: ['crm_recent_interactions', businessId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_interactions')
        .select('*, crm_contacts(first_name, last_name)')
        .eq('business_id', businessId!)
        .order('occurred_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row: Record<string, unknown>) => {
        const contact = row.crm_contacts as { first_name?: string; last_name?: string } | null;
        return {
          ...(row as unknown as CrmInteraction),
          contact_first_name: contact?.first_name,
          contact_last_name: contact?.last_name,
        };
      });
    },
    enabled: !!businessId,
  });

  const isLive = interactions.length > 0;

  return { interactions, loading, isLive, reload };
}
