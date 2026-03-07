import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── Client Records Hook ─────────────────────────────────────────────────
// Data source: client_treatment_records, client_product_history, client_visit_summary (LIVE when DB-connected)

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
  const [records, setRecords] = useState<ClientTreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('client_treatment_records')
        .select('*')
        .eq('contact_id', contactId)
        .order('performed_at', { ascending: false });
      if (dbErr) throw dbErr;
      setRecords(data ?? []);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load treatment records');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => { load(); }, [load]);

  const createRecord = useCallback(async (record: NewTreatmentRecord) => {
    const { data, error: dbErr } = await supabase
      .from('client_treatment_records')
      .insert(record)
      .select()
      .single();
    if (dbErr) throw dbErr;
    await load();
    return data as ClientTreatmentRecord;
  }, [load]);

  const updateRecord = useCallback(async (id: string, updates: Partial<NewTreatmentRecord>) => {
    const { error: dbErr } = await supabase
      .from('client_treatment_records')
      .update(updates)
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { records, loading, error, isLive, reload: load, createRecord, updateRecord };
}

export function useClientProductHistory(contactId?: string) {
  const [products, setProducts] = useState<ClientProductHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data, error: dbErr } = await supabase
        .from('client_product_history')
        .select('*')
        .eq('contact_id', contactId)
        .order('purchased_at', { ascending: false });
      if (dbErr) throw dbErr;
      setProducts(data ?? []);
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => { load(); }, [load]);

  return { products, loading, isLive, reload: load };
}

export function useClientVisitSummary(contactId?: string) {
  const [visits, setVisits] = useState<ClientVisitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data, error: dbErr } = await supabase
        .from('client_visit_summary')
        .select('*')
        .eq('contact_id', contactId)
        .order('visit_date', { ascending: false });
      if (dbErr) throw dbErr;
      setVisits(data ?? []);
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => { load(); }, [load]);

  return { visits, loading, isLive, reload: load };
}
