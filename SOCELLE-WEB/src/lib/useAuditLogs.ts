// ── useAuditLogs Hook — CTRL-WO-03 ──────────────────────────────────────────
// TanStack Query hook for fetching audit_logs with filters + pagination.
// Falls back to empty array on 42P01 (table does not exist).

import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  action?: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  return code === '42P01' || message.includes('does not exist');
}

async function fetchAuditLogs(
  filters: AuditLogFilters
): Promise<{ logs: AuditLogEntry[]; isLive: boolean; total: number }> {
  if (!isSupabaseConfigured) {
    return { logs: [], isLive: false, total: 0 };
  }

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }
  if (filters.resourceId) {
    query = query.eq('resource_id', filters.resourceId);
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.from) {
    query = query.gte('created_at', filters.from);
  }
  if (filters.to) {
    query = query.lte('created_at', filters.to);
  }

  const { data, error, count } = await query;

  if (error && isMissingTableError(error)) {
    return { logs: [], isLive: false, total: 0 };
  }
  if (error) {
    throw error;
  }

  return {
    logs: (data as AuditLogEntry[]) ?? [],
    isLive: true,
    total: count ?? 0,
  };
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30_000,
  });

  return {
    logs: data?.logs ?? [],
    isLive: data?.isLive ?? false,
    isLoading,
    error,
    total: data?.total ?? 0,
  };
}
