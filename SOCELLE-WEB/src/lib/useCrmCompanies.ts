import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── CRM Companies Hook ──────────────────────────────────────────────────
// Data source: crm_companies (LIVE when DB-connected)

export interface CrmCompany {
  id: string;
  business_id: string;
  name: string;
  type: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
  annual_revenue: number | null;
  employee_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface NewCompany {
  business_id: string;
  name: string;
  type: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  annual_revenue?: number;
  employee_count?: number;
}

export function useCrmCompanies(businessId?: string | null) {
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('crm_companies')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      if (dbErr) throw dbErr;
      setCompanies(data ?? []);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load companies');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const createCompany = useCallback(async (company: NewCompany) => {
    const { data, error: dbErr } = await supabase
      .from('crm_companies')
      .insert(company)
      .select()
      .single();
    if (dbErr) throw dbErr;
    await load();
    return data as CrmCompany;
  }, [load]);

  const updateCompany = useCallback(async (id: string, updates: Partial<NewCompany>) => {
    const { error: dbErr } = await supabase
      .from('crm_companies')
      .update(updates)
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const deleteCompany = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('crm_companies')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { companies, loading, error, isLive, reload: load, createCompany, updateCompany, deleteCompany };
}

export function useCrmCompanyDetail(companyId?: string) {
  const [company, setCompany] = useState<CrmCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('crm_companies')
        .select('*')
        .eq('id', companyId)
        .single();
      if (dbErr) throw dbErr;
      setCompany(data as CrmCompany);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load company');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  return { company, loading, error, isLive, reload: load };
}
