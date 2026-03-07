import { useMemo } from 'react';
import { useModuleAccessContext } from '../context/ModuleAccessContext';

export interface ModuleAccessResult {
  /** Whether the current account has active access to this module */
  hasAccess: boolean;
  /** Whether the initial load is still in progress */
  isLoading: boolean;
  /** Access type: 'plan' | 'trial' | 'override' | 'free' | null */
  accessType: string | null;
  /** When access expires (null = never) */
  expiresAt: Date | null;
}

/**
 * Check if the current user's account has access to a specific module.
 * Reads from the cached ModuleAccessContext — does NOT re-fetch on every render.
 * Subscribes to Supabase realtime via the context provider for live updates.
 */
export function useModuleAccess(moduleKey: string): ModuleAccessResult {
  const { checkAccess, getAccessRecord, isLoading } = useModuleAccessContext();

  return useMemo(() => {
    const hasAccess = checkAccess(moduleKey);
    const record = getAccessRecord(moduleKey);

    return {
      hasAccess,
      isLoading,
      accessType: record?.access_type ?? null,
      expiresAt: record?.expires_at ? new Date(record.expires_at) : null,
    };
  }, [moduleKey, checkAccess, getAccessRecord, isLoading]);
}
