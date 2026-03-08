import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── CRM Companies Hook ──────────────────────────────────────────────────
// Data source: crm_companies (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

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
  const queryClient = useQueryClient();
  const queryKey = ['crm_companies', businessId];

  const { data: companies = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_companies')
        .select('*')
        .eq('business_id', businessId!)
        .order('updated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as CrmCompany[];
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (company: NewCompany) => {
      const { data, error } = await supabase.from('crm_companies').insert(company).select().single();
      if (error) throw new Error(error.message);
      return data as CrmCompany;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewCompany> }) => {
      const { error } = await supabase.from('crm_companies').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_companies').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createCompany = async (company: NewCompany) => createMut.mutateAsync(company);
  const updateCompany = async (id: string, updates: Partial<NewCompany>) => updateMut.mutateAsync({ id, updates });
  const deleteCompany = async (id: string) => deleteMut.mutateAsync(id);

  const isLive = companies.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { companies, loading, error, isLive, reload, createCompany, updateCompany, deleteCompany };
}

export function useCrmCompanyDetail(companyId?: string) {
  const { data: company = null, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['crm_company_detail', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_companies')
        .select('*')
        .eq('id', companyId!)
        .single();
      if (error) throw new Error(error.message);
      return data as CrmCompany;
    },
    enabled: !!companyId,
  });

  const isLive = company !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { company, loading, error, isLive, reload };
}
