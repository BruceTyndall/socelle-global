import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── CRM Contacts + Tags + Interactions Hook ─────────────────────────────
// Data source: crm_contacts, crm_contact_tags, crm_interactions (LIVE when DB-connected)

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
  created_at: string;
  updated_at: string;
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
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      if (dbErr) throw dbErr;
      setContacts(data ?? []);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load contacts');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const createContact = useCallback(async (contact: NewContact) => {
    const { data, error: dbErr } = await supabase
      .from('crm_contacts')
      .insert(contact)
      .select()
      .single();
    if (dbErr) throw dbErr;
    await load();
    return data as CrmContact;
  }, [load]);

  const updateContact = useCallback(async (id: string, updates: Partial<NewContact>) => {
    const { error: dbErr } = await supabase
      .from('crm_contacts')
      .update(updates)
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const deleteContact = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('crm_contacts')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { contacts, loading, error, isLive, reload: load, createContact, updateContact, deleteContact };
}

export function useCrmContactDetail(contactId?: string) {
  const [contact, setContact] = useState<CrmContact | null>(null);
  const [tags, setTags] = useState<CrmContactTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    setError(null);
    try {
      const [contactRes, tagsRes] = await Promise.all([
        supabase.from('crm_contacts').select('*').eq('id', contactId).single(),
        supabase.from('crm_contact_tags').select('*').eq('contact_id', contactId).order('created_at', { ascending: false }),
      ]);
      if (contactRes.error) throw contactRes.error;
      setContact(contactRes.data as CrmContact);
      setTags((tagsRes.data ?? []) as CrmContactTag[]);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load contact');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => { load(); }, [load]);

  const addTag = useCallback(async (tag: string) => {
    if (!contactId) return;
    const { error: dbErr } = await supabase
      .from('crm_contact_tags')
      .insert({ contact_id: contactId, tag });
    if (dbErr) throw dbErr;
    await load();
  }, [contactId, load]);

  const removeTag = useCallback(async (tagId: string) => {
    const { error: dbErr } = await supabase
      .from('crm_contact_tags')
      .delete()
      .eq('id', tagId);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { contact, tags, loading, error, isLive, reload: load, addTag, removeTag };
}

export function useCrmInteractions(contactId?: string) {
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('crm_interactions')
        .select('*')
        .eq('contact_id', contactId)
        .order('occurred_at', { ascending: false });
      if (dbErr) throw dbErr;
      setInteractions(data ?? []);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load interactions');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => { load(); }, [load]);

  const addInteraction = useCallback(async (interaction: NewInteraction) => {
    const { error: dbErr } = await supabase
      .from('crm_interactions')
      .insert(interaction);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { interactions, loading, error, isLive, reload: load, addInteraction };
}

export function useRecentInteractions(businessId?: string | null, limit = 10) {
  const [interactions, setInteractions] = useState<(CrmInteraction & { contact_first_name?: string; contact_last_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const { data, error: dbErr } = await supabase
        .from('crm_interactions')
        .select('*, crm_contacts(first_name, last_name)')
        .eq('business_id', businessId)
        .order('occurred_at', { ascending: false })
        .limit(limit);
      if (dbErr) throw dbErr;
      const mapped = (data ?? []).map((row: Record<string, unknown>) => {
        const contact = row.crm_contacts as { first_name?: string; last_name?: string } | null;
        return {
          ...(row as unknown as CrmInteraction),
          contact_first_name: contact?.first_name,
          contact_last_name: contact?.last_name,
        };
      });
      setInteractions(mapped);
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [businessId, limit]);

  useEffect(() => { load(); }, [load]);

  return { interactions, loading, isLive, reload: load };
}
