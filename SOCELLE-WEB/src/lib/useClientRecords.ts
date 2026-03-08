import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── Client Records Hook ─────────────────────────────────────────────────
// Data source: client_treatment_records, client_product_history, client_visit_summary (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface ClientTreatmentRecord {
  id: string;
  contact_id: string;
  business_id: string;
  appointment_id: string | null;
  service_name: string;
  products_used: string[] | null;
  formula: string | null;
  notes: string | null;
  before_photo_url: string | null;
  after_photo_url: string | null;
  follow_up_date: string | null;
  performed_by: string | null;
  performed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ClientProductHistory {
  id: string;
  contact_id: string;
  business_id: string;
  product_name: string;
  brand_name: string | null;
  purchased_at: string;
  repurchased: boolean;
  notes: string | null;
  created_at: string;
}

export interface ClientVisitSummary {
  id: string;
  contact_id: string;
  business_id: string;
  visit_date: string;
  services: string[];
  total_spent: number;
  notes: string | null;
  created_at: string;
}

export interface NewTreatmentRecord {
  contact_id: string;
  business_id: string;
  appointment_id?: string;
  service_name: string;
  products_used?: string[];
  formula?: string;
  notes?: string;
  before_photo_url?: string;
  after_photo_url?: string;
  follow_up_date?: string;
  performed_by?: string;
  performed_at?: string;
}

export function useClientTreatmentRecords(contactId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['client_treatment_records', contactId];

  const { data: records = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_treatment_records')
        .select('*')
        .eq('contact_id', contactId!)
        .order('performed_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ClientTreatmentRecord[];
    },
    enabled: !!contactId,
  });

  const createMut = useMutation({
    mutationFn: async (record: NewTreatmentRecord) => {
      const { data, error } = await supabase
        .from('client_treatment_records')
        .insert(record)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ClientTreatmentRecord;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewTreatmentRecord> }) => {
      const { error } = await supabase
        .from('client_treatment_records')
        .update(updates)
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createRecord = async (record: NewTreatmentRecord) => createMut.mutateAsync(record);
  const updateRecord = async (id: string, updates: Partial<NewTreatmentRecord>) => updateMut.mutateAsync({ id, updates });

  const isLive = records.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { records, loading, error, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), createRecord, updateRecord };
}

export function useClientProductHistory(contactId?: string) {
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['client_product_history', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_product_history')
        .select('*')
        .eq('contact_id', contactId!)
        .order('purchased_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientProductHistory[];
    },
    enabled: !!contactId,
  });

  const isLive = products.length > 0;

  return { products, loading, isLive, reload: () => {} };
}

export function useClientVisitSummary(contactId?: string) {
  const { data: visits = [], isLoading: loading } = useQuery({
    queryKey: ['client_visit_summary', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_visit_summary')
        .select('*')
        .eq('contact_id', contactId!)
        .order('visit_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientVisitSummary[];
    },
    enabled: !!contactId,
  });

  const isLive = visits.length > 0;

  return { visits, loading, isLive, reload: () => {} };
}
