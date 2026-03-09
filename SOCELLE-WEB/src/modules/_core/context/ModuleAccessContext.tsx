import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';

// ── Module keys ─────────────────────────────────────────────────────────────
export const MODULE_KEYS = [
  'MODULE_SHOP',
  'MODULE_INGREDIENTS',
  'MODULE_EDUCATION',
  'MODULE_SALES',
  'MODULE_MARKETING',
  'MODULE_RESELLER',
  'MODULE_CRM',
  'MODULE_MOBILE',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export interface ModuleAccessRecord {
  module_key: string;
  access_type: string;       // 'plan' | 'trial' | 'override' | 'free'
  expires_at: string | null;
  granted_at: string;
}

interface ModuleAccessContextType {
  /** Check if current user's account has access to a specific module */
  checkAccess: (moduleKey: string) => boolean;
  /** Get full access record for a module (null if no access) */
  getAccessRecord: (moduleKey: string) => ModuleAccessRecord | null;
  /** Whether the initial fetch is still loading */
  isLoading: boolean;
  /** Force-refresh all module access from DB */
  refreshAccess: () => Promise<void>;
}

const ModuleAccessContext = createContext<ModuleAccessContextType | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────────────────

export function ModuleAccessProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const accountId = profile?.business_id ?? profile?.brand_id ?? user?.id ?? null;

  const queryKey = ['account_module_access', accountId] as const;

  const { data: records = [], isLoading } = useQuery<ModuleAccessRecord[]>({
    queryKey,
    queryFn: async () => {
      if (!accountId) return [];
      const { data, error } = await supabase
        .from('account_module_access')
        .select('module_key, access_type, expires_at, granted_at')
        .eq('account_id', accountId)
        .eq('is_active', true);
      if (error) {
        console.warn('[ModuleAccess] fetch error:', error.message);
        return [];
      }
      return (data as ModuleAccessRecord[]) ?? [];
    },
    enabled: !!accountId,
  });

  const refreshAccess = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Realtime subscription for live updates
  useEffect(() => {
    if (!accountId) return;

    const channel = supabase
      .channel(`module_access_${accountId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_module_access',
          filter: `account_id=eq.${accountId}`,
        },
        () => {
          // Re-fetch on any change to this account's module access
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, queryClient, queryKey]);

  const checkAccess = useCallback(
    (moduleKey: string): boolean => {
      const record = records.find((r) => r.module_key === moduleKey);
      if (!record) return false;
      // Check expiry
      if (record.expires_at && new Date(record.expires_at) < new Date()) return false;
      return true;
    },
    [records],
  );

  const getAccessRecord = useCallback(
    (moduleKey: string): ModuleAccessRecord | null => {
      const record = records.find((r) => r.module_key === moduleKey);
      if (!record) return null;
      if (record.expires_at && new Date(record.expires_at) < new Date()) return null;
      return record;
    },
    [records],
  );

  return (
    <ModuleAccessContext.Provider
      value={{ checkAccess, getAccessRecord, isLoading, refreshAccess }}
    >
      {children}
    </ModuleAccessContext.Provider>
  );
}

// ── Consumer hook ───────────────────────────────────────────────────────────

export function useModuleAccessContext() {
  const ctx = useContext(ModuleAccessContext);
  if (!ctx) {
    throw new Error('useModuleAccessContext must be used within a ModuleAccessProvider');
  }
  return ctx;
}
